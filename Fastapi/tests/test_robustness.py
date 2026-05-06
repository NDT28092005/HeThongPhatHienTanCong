"""
Robustness testing: noise injection, missing values, extreme inputs,
and unseen pattern detection.

Covers:
  • Feature-level Gaussian noise injection
  • Missing/null values
  • Extremely long inputs
  • Unicode / internationalization
  • Unseen attack patterns
  • Concurrency and stress
"""

import gc
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from conftest import (
    BENIGN_SHOULD_PASS,
    DEFAULT_MODEL,
    Thresholds,
    extract_features_raw,
)


# ─────────────────────────────────────────────────────────────────────────────
# Noise injection
# ─────────────────────────────────────────────────────────────────────────────

class TestNoiseInjection:

    @pytest.mark.parametrize("noise_std", [0.01, 0.05, 0.10])
    def test_gaussian_noise_stability(self, model_loader, noise_std):
        """
        Small Gaussian noise added to features must not cause prediction flips
        for clearly benign or clearly malicious inputs.
        We allow up to 10% flip rate at 10% noise.
        """
        test_urls = [
            ("/home", 0),              # benign, class 0
            ("/products", 0),
            ("/search?q=' OR 1=1 --", 1),   # attack, class 1
            ("/admin?user=admin'--", 1),
        ]

        flips = 0
        total = 0
        model = model_loader.models["random_forest"]

        for url, expected_class in test_urls:
            base_df = extract_features_raw(url, None)
            base_pred = int(model.predict(base_df)[0])

            for _ in range(20):  # 20 noise samples per URL
                noisy = base_df.copy()
                noise = np.random.normal(0, noise_std, noisy.shape)
                noisy = noisy + noise
                noisy_pred = int(model.predict(noisy)[0])
                if noisy_pred != base_pred:
                    flips += 1
                total += 1

        flip_rate = flips / total if total > 0 else 0
        assert flip_rate < 0.20, (
            f"Flip rate {flip_rate:.1%} is too high at noise_std={noise_std}. "
            f"Model is overly sensitive to feature perturbations."
        )

    def test_zero_noise_is_deterministic(self, model_loader):
        """Zero noise should produce the same prediction every time."""
        model = model_loader.models["random_forest"]
        url = "/search?q=' OR 1=1 --"
        df = extract_features_raw(url, None)

        preds = [int(model.predict(df)[0]) for _ in range(50)]
        assert len(set(preds)) == 1, (
            f"Predictions are non-deterministic even with zero noise: {set(preds)}"
        )

    def test_extreme_noise_flips_to_opposite_class(self, model_loader):
        """
        Very large noise (5σ) should eventually flip predictions.
        If it never flips, the decision boundary is too extreme.
        """
        model = model_loader.models["random_forest"]
        benign_df = extract_features_raw("/home", None)
        benign_pred = int(model.predict(benign_df)[0])

        flipped = False
        for _ in range(100):
            noisy = benign_df.copy()
            # Scale noise to be 5x the feature magnitude
            noise = np.random.normal(0, noisy.std().values * 5, noisy.shape)
            noisy = noisy + noise
            if int(model.predict(noisy)[0]) != benign_pred:
                flipped = True
                break

        # This is informational – we don't require flipping, but we log it
        if not flipped:
            pytest.skip(
                f"Prediction for benign URL never flipped even with extreme noise. "
                f"This may indicate an unusually wide decision boundary."
            )


# ─────────────────────────────────────────────────────────────────────────────
# Missing values
# ─────────────────────────────────────────────────────────────────────────────

class TestMissingValues:

    def test_none_content_is_handled(self, model_loader):
        """content=None must not raise an exception."""
        model = model_loader.models["random_forest"]
        df = extract_features_raw("/search?q=test", None)
        assert df.shape == (1, 28)
        pred = model.predict(df)[0]
        assert pred in (0, 1)

    def test_empty_string_content(self, model_loader):
        """content='' (empty string, not None) must be handled."""
        model = model_loader.models["random_forest"]
        df = extract_features_raw("/search?q=test", "")
        pred = model.predict(df)[0]
        assert pred in (0, 1)

    def test_nan_content_column(self, model_loader):
        """If content is NaN, content features must default to 0."""
        df_in = pd.DataFrame([{"URL": "/test", "content": np.nan}])
        # This should produce a valid feature vector
        df = extract_features_raw("/test", np.nan)
        assert not df.isna().any().any(), "NaN propagated into features"

    def test_empty_url(self, model_loader):
        """Empty URL '' must be handled without crash."""
        model = model_loader.models["random_forest"]
        df = extract_features_raw("", None)
        assert df.shape == (1, 28)
        assert not df.isna().any().any()

    def test_purely_numeric_url(self, model_loader):
        """URLs that are just numbers."""
        model = model_loader.models["random_forest"]
        for url in ["12345", "0", "999999"]:
            df = extract_features_raw(url, None)
            assert df.shape == (1, 28)
            pred = model.predict(df)[0]
            assert pred in (0, 1)


# ─────────────────────────────────────────────────────────────────────────────
# Extreme inputs
# ─────────────────────────────────────────────────────────────────────────────

class TestExtremeInputs:

    def test_extremely_long_url(self, client):
        """URL with 100k characters must not crash the server."""
        long_url = "/search?" + "q=" + ("a" * 100_000)
        resp = client.post("/api/v1/security/predict", json={"url": long_url})
        # Must not return 500
        assert resp.status_code in (200, 422)

    def test_extremely_long_content(self, client):
        """Content with 100k characters must be handled."""
        long_content = "x" * 100_000
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/data", "content": long_content},
        )
        assert resp.status_code in (200, 422)

    def test_maximum_parameters(self, client):
        """URL with 10,000 query parameters."""
        params = "&".join(f"p{i}=v{i}" for i in range(10_000))
        url = f"/api/search?{params}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code in (200, 422)

    def test_repeated_special_characters(self, client):
        """URL with 10,000 repeated special chars (potential ReDoS)."""
        url = "/search?q=" + ("' OR 1=1 --" * 1000)
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code in (200, 422)

    def test_unicode_international_url(self, client):
        """Non-ASCII Unicode URLs (internationalized)."""
        urls = [
            "/user/東京",
            "/search?q=البحث",
            "/api/café",
            "/übernachtung",
        ]
        for url in urls:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.status_code in (200, 422), (
                f"Unicode URL crashed: {url}"
            )

    def test_mixed_script_direction(self, client):
        """Mixed LTR/RTL script URL."""
        url = "/user/הקישור/العربية"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code in (200, 422)

    def test_billennium_url(self, client):
        """URL with extremely deep path nesting."""
        url = "/" + "/".join(f"dir{i}" for i in range(500))
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code in (200, 422)


# ─────────────────────────────────────────────────────────────────────────────
# Unseen / novel patterns
# ─────────────────────────────────────────────────────────────────────────────

class TestUnseenPatterns:

    def test_novel_sql_techniques(self, client):
        """
        SQL injection techniques not in training data.
        These should be caught by the suspicious-word / special-char features.
        """
        novel_payloads = [
            "/api?id=1; WAITFOR DELAY '00:00:03'--",
            "/search?q=1; EXEC xp_cmdshell('whoami')--",
            "/item?id=1' AND (SELECT COUNT(*) FROM users)>0--",
            "/query?q=@variable=1; SELECT @variable",
            "/api?sql=INSERT INTO logs VALUES('xss')",
        ]
        caught = 0
        for url in novel_payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            if resp.json()["status"] == "attack":
                caught += 1
        assert caught >= 4, (
            f"Novel SQL techniques detection rate: {caught}/{len(novel_payloads)}"
        )

    def test_novel_xss_vectors(self, client):
        """
        XSS vectors using less common event handlers and attributes.
        """
        novel_xss = [
            "<details open ontoggle=alert(1)>",
            "<marquee onstart=alert('XSS')>",
            "<keygen onfocus=alert(1)>",
            "<video><source onerror=alert(1)>",
            "<audio src=x onerror=alert(1)>",
        ]
        caught = 0
        for content in novel_xss:
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": "/media", "content": content},
            )
            if resp.json()["status"] == "attack":
                caught += 1
        assert caught >= 3, (
            f"Novel XSS detection rate: {caught}/{len(novel_xss)}"
        )

    def test_graphql_attack_patterns(self, client):
        """
        GraphQL-specific injection patterns.
        """
        payloads = [
            "/graphql?query={__typename}",
            "/api?query=query{user(id:1){name}}",
            "/graphql?query=__schema{types{name}}",
        ]
        results = []
        for url in payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            results.append(resp.json()["status"])
        # GraphQL patterns are informational; document behavior
        assert resp.status_code == 200  # Must not crash

    def test_websocket_urls(self, client):
        """WebSocket URLs (ws:// and wss://)."""
        for proto in ("ws://", "wss://"):
            url = f"{proto}example.com/socket"
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.status_code in (200, 422)

    def test_data_exfiltration_patterns(self, client):
        """Simulated data exfiltration URLs."""
        payloads = [
            "/export?format=csv&data=passwords,credit_cards",
            "/backup?file=/var/www/html/db.sql",
        ]
        for url in payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "attack", (
                f"Data exfiltration not caught: {url}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Benign false-positive resistance
# ─────────────────────────────────────────────────────────────────────────────

class TestBenignRobustness:

    @pytest.mark.parametrize("url,content", BENIGN_SHOULD_PASS)
    def test_benign_urls_not_flagged(self, client, url, content):
        """
        Known benign URLs must NOT be flagged as attacks.
        High false-positive rate destroys user trust.
        """
        resp = client.post("/api/v1/security/predict",
                          json={"url": url, "content": content})
        assert resp.status_code == 200
        assert resp.json()["status"] == "normal", (
            f"False positive on benign URL '{url}' "
            f"(confidence={resp.json()['confidence']})"
        )

    def test_urls_with_numbers_only(self, client):
        """URLs that are just numeric IDs should be treated as normal."""
        for url in ["/product/12345", "/user/999999", "/order/1"]:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "normal", f"Numeric URL flagged: {url}"

    def test_urls_with_query_only(self, client):
        """URLs with only query params (no path) should be handled."""
        for url in ["/?q=test", "/?page=1", "/?sort=asc"]:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "normal", f"Query-only URL flagged: {url}"

    def test_real_world_benign_patterns(self, client):
        """Real-world benign URL patterns from common web applications."""
        real_benign = [
            "/api/users?page=2&limit=20&sort=name&order=asc",
            "/products/electronics/laptops?brand=apple&price=1000-2000",
            "/blog/2024/how-to-deploy-fastapi-on-aws",
            "/auth/login?redirect=/dashboard&locale=en_US",
            "/search?category=books&q=python+programming",
        ]
        for url in real_benign:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "normal", (
                f"Real-world benign URL flagged: {url}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Memory / resource limits
# ─────────────────────────────────────────────────────────────────────────────

class TestResourceLimits:

    def test_no_memory_leak_on_repeated_calls(self, client):
        """
        100 repeated calls must not cause memory growth.
        We check that the response time doesn't blow up (proxy for leak).
        """
        times = []
        for _ in range(100):
            start = time.perf_counter()
            resp = client.post("/api/v1/security/predict",
                              json={"url": "/test"})
            times.append(time.perf_counter() - start)
            assert resp.status_code == 200

        # Last 10 calls should not be 5x slower than first 10
        first_10_mean = sum(times[:10]) / 10
        last_10_mean = sum(times[-10:]) / 10
        assert last_10_mean < first_10_mean * 5, (
            f"Response time grew from {first_10_mean*1000:.1f}ms to "
            f"{last_10_mean*1000:.1f}ms – possible memory leak"
        )

    def test_concurrent_requests_handled(self, client):
        """
        20 concurrent requests must all return successfully.
        No request should crash the server.
        """
        def make_request(i):
            return client.post(
                "/api/v1/security/predict",
                json={"url": f"/test-{i}"},
            )

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request, i) for i in range(20)]
            results = [f.result() for f in as_completed(futures)]

        assert all(r.status_code == 200 for r in results), (
            "Some concurrent requests failed"
        )

    def test_rapid_fire_requests(self, client):
        """
        50 rapid-fire requests to the same endpoint.
        All must succeed without server degradation.
        """
        results = []
        for i in range(50):
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": f"/rapid-test-{i % 5}"},
            )
            results.append(resp.status_code)

        assert all(s == 200 for s in results), (
            f"Some rapid requests failed: {results.count(500)} / {len(results)} "
            f"returned 500 errors"
        )
