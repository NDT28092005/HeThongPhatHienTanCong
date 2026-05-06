"""
Edge case testing: null inputs, boundary values, malformed data, and
completely unseen patterns.

These tests ensure the system degrades gracefully rather than crashing
or producing silently wrong results.
"""

import gc
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from conftest import (
    Thresholds,
    extract_features_raw,
    load_pickle,
)


# ─────────────────────────────────────────────────────────────────────────────
# Empty & null inputs
# ─────────────────────────────────────────────────────────────────────────────

class TestEmptyAndNullInputs:

    def test_empty_string_url(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": ""})
        # Must not return 500; 200 or 422 both acceptable
        assert resp.status_code in (200, 422)

    def test_none_url(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": None})
        assert resp.status_code == 422

    def test_whitespace_only_url(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "   \t\n  "})
        assert resp.status_code in (200, 422)

    def test_none_content(self, client):
        """content=None must be handled gracefully."""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/test", "content": None},
        )
        assert resp.status_code == 200

    def test_empty_content(self, client):
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/test", "content": ""},
        )
        assert resp.status_code == 200

    def test_whitespace_only_content(self, client):
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/test", "content": "   \n\t  "},
        )
        assert resp.status_code == 200

    def test_missing_url_key(self, client):
        """Missing 'url' key entirely must return 422."""
        resp = client.post("/api/v1/security/predict", json={})
        assert resp.status_code == 422

    def test_unknown_fields_ignored(self, client):
        """Extra unknown fields must be silently ignored (not 500)."""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "unknown_field": "value"},
        )
        assert resp.status_code == 200


# ─────────────────────────────────────────────────────────────────────────────
# Malformed / boundary data
# ─────────────────────────────────────────────────────────────────────────────

class TestMalformedInputs:

    def test_url_type_integer(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": 12345})
        assert resp.status_code == 422

    def test_url_type_list(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": ["/test"]})
        assert resp.status_code == 422

    def test_url_type_dict(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": {"path": "/test"}})
        assert resp.status_code == 422

    def test_url_type_float(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": 1.234})
        assert resp.status_code == 422

    def test_content_type_integer(self, client):
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "content": 999},
        )
        assert resp.status_code == 422

    def test_content_type_list(self, client):
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "content": ["a", "b"]},
        )
        assert resp.status_code == 422

    def test_model_preference_type_integer(self, client):
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "model_preference": 42},
        )
        assert resp.status_code == 422

    def test_only_slash_url(self, client):
        """Single '/' URL must not crash."""
        resp = client.post("/api/v1/security/predict", json={"url": "/"})
        assert resp.status_code in (200, 422)

    def test_multiple_question_marks(self, client):
        """Multiple '?' in URL."""
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/search?q=a?q=b?q=c"})
        assert resp.status_code in (200, 422)

    def test_hash_in_query_string(self, client):
        """'#' in query string (should be fragment, not query)."""
        resp = client.post("/api/v1/security/predict",
                           json={"url": "/search?q=test#anchor"})
        assert resp.status_code == 200

    def test_double_schema_prefix(self, client):
        """URLs starting with 'http://http://'."""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "http://http://example.com"},
        )
        assert resp.status_code in (200, 422)


# ─────────────────────────────────────────────────────────────────────────────
# Feature extractor boundary cases
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureExtractorBoundaries:

    def test_single_char_url(self):
        """Single character URL."""
        df = extract_features_raw("/", None)
        assert df.shape == (1, 28)
        assert not df.isna().any().any()

    def test_url_with_only_special_chars(self):
        df = extract_features_raw("///...???===", None)
        assert df.shape == (1, 28)
        assert (df >= 0).all().all()  # all features must be non-negative

    def test_url_with_only_digits(self):
        df = extract_features_raw("/123456789", None)
        assert df["count-digits_url"].iloc[0] == 9

    def test_url_with_only_letters(self):
        df = extract_features_raw("/abcdefghij", None)
        assert df["count-letters_url"].iloc[0] == 10

    def test_very_short_url_length_zero(self):
        """URL = '' has length 0."""
        df = extract_features_raw("", None)
        assert df["url_length"].iloc[0] == 0

    def test_suspicious_score_zero_for_clean_url(self):
        df = extract_features_raw("/normal/clean/path", None)
        assert df["sus_url"].iloc[0] == 0

    def test_unusual_character_ratio_handles_empty(self):
        df = extract_features_raw("", None)
        ratio = df["unusual_character_ratio_url"].iloc[0]
        assert 0.0 <= ratio <= 1.0

    def test_hostname_length_of_empty_hostname(self):
        """URL with no hostname part."""
        df = extract_features_raw("/path", None)
        assert df["hostname_length_url"].iloc[0] == 0

    def test_content_features_zero_when_no_content(self):
        """Content features must be 0 when content is None."""
        df = extract_features_raw("/test", None)
        content_cols = [
            "count_dot_content", "count%_content", "count-_content",
            "count=_content", "sus_content", "count_digits_content",
            "count_letters_content", "content_length", "is_encoded_content",
            "special_count_content",
        ]
        for col in content_cols:
            assert col in df.columns, f"Missing content column: {col}"
            assert df[col].iloc[0] == 0, (
                f"Content column '{col}' != 0 when content=None: "
                f"{df[col].iloc[0]}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Completely unseen patterns
# ─────────────────────────────────────────────────────────────────────────────

class TestUnseenPatterns:

    def test_filepath_as_url(self, client):
        """Unix filepath treated as URL."""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/usr/local/bin/python"},
        )
        assert resp.status_code in (200, 422)

    def test_windows_path(self, client):
        """Windows-style path as URL."""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "C:\\Windows\\System32\\config"},
        )
        assert resp.status_code in (200, 422)

    def test_base64_in_url(self, client):
        """Base64-encoded strings in URL."""
        import base64
        encoded = base64.b64encode(b"SELECT * FROM users").decode()
        url = f"/api?data={encoded}"
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code == 200

    def test_json_in_url(self, client):
        """JSON structure in URL parameter."""
        url = '/api?payload={"user":"admin","pass":"secret"}'
        resp = client.post("/api/v1/security/predict", json={"url": url})
        assert resp.status_code == 200

    def test_xml_in_content(self, client):
        """XML in content field."""
        xml = """<?xml version="1.0"?>
        <!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]>
        <foo>&xxe;</foo>"""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/xml", "content": xml},
        )
        assert resp.json()["status"] == "attack"

    def test_yaml_in_content(self, client):
        """YAML in content field."""
        yaml = "---\nscript: |\n  cat /etc/passwd\n..."
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/yaml", "content": yaml},
        )
        assert resp.json()["status"] == "attack"

    def test_markdown_in_content(self, client):
        """Markdown content (benign)."""
        md = "# Hello World\n\nThis is a **test**."
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/md", "content": md},
        )
        assert resp.json()["status"] == "normal"

    def test_binary_in_content(self, client):
        """Binary content (non-decodable) in content field."""
        binary = bytes(range(256))
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/api/binary", "content": binary.decode("latin-1")},
        )
        assert resp.status_code in (200, 422)


# ─────────────────────────────────────────────────────────────────────────────
# Label encoder edge cases
# ─────────────────────────────────────────────────────────────────────────────

class TestLabelEncoderEdgeCases:

    def test_label_encoder_transform_unknown_label(self):
        le = load_pickle("label_encoder.pkl")
        with pytest.raises(ValueError):
            le.transform(["UNKNOWN"])

    def test_label_encoder_inverse_transform_unknown_code(self):
        le = load_pickle("label_encoder.pkl")
        with pytest.raises(ValueError):
            le.inverse_transform([99])  # out-of-range class index

    def test_label_encoder_roundtrip_all_classes(self):
        le = load_pickle("label_encoder.pkl")
        for cls in le.classes_:
            encoded = le.transform([cls])[0]
            decoded = le.inverse_transform([encoded])[0]
            assert decoded == cls


# ─────────────────────────────────────────────────────────────────────────────
# API response schema validation
# ─────────────────────────────────────────────────────────────────────────────

class TestAPISchema:

    def test_response_has_all_fields(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/test"})
        assert resp.status_code == 200
        data = resp.json()
        required = {"status", "confidence", "model_used",
                    "processing_time_ms", "request_id"}
        assert required.issubset(data.keys()), (
            f"Missing fields: {required - set(data.keys())}"
        )

    def test_response_status_is_string(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/test"})
        assert isinstance(resp.json()["status"], str)

    def test_response_confidence_is_float(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/test"})
        assert isinstance(resp.json()["confidence"], (int, float))

    def test_response_model_used_is_string(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/test"})
        assert isinstance(resp.json()["model_used"], str)

    def test_response_processing_time_is_float(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/test"})
        assert isinstance(resp.json()["processing_time_ms"], (int, float))
        assert resp.json()["processing_time_ms"] >= 0

    def test_error_returns_json_detail(self, client):
        """When the server returns 500, it should be a clean JSON error."""
        resp = client.post("/api/v1/security/predict", json={"url": None})
        # None URL → 422, not 500. Good.
        assert resp.status_code == 422
        assert "detail" in resp.json()

    def test_health_endpoint_schema(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert isinstance(data["models_loaded"], list)
        assert len(data["models_loaded"]) > 0


# ─────────────────────────────────────────────────────────────────────────────
# Model loading edge cases
# ─────────────────────────────────────────────────────────────────────────────

class TestModelLoadingEdgeCases:

    def test_dnn_model_uses_keras_predict_not_sklearn(self):
        """
        When model_preference='dnn', the service must load the .h5 file
        (Keras) not attempt to pickle-load it.
        """
        # The API should return 'dnn' as model_used without raising
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "model_preference": "dnn"},
        )
        assert resp.status_code == 200
        assert resp.json()["model_used"] == "dnn"

    def test_model_aliases_work(self, client):
        """Short aliases (rf, dt, gb) must resolve correctly."""
        aliases = [("rf", "random_forest"), ("dt", "decision_tree"),
                   ("gb", "gradient_boosting")]
        for alias, expected in aliases:
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": "/test", "model_preference": alias},
            )
            assert resp.status_code == 200
            assert resp.json()["model_used"] == expected, (
                f"Alias '{alias}' resolved to '{resp.json()['model_used']}' "
                f"instead of '{expected}'"
            )
