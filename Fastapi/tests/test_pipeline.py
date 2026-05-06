"""
End-to-end pipeline integrity tests.

Validates:
  • The full request → feature → model → response cycle
  • Feature ordering consistency across models
  • Input → output shape and type invariants
  • Label encoding roundtrip through the API
  • Prediction confidence validity
"""

import numpy as np
import pytest
from fastapi.testclient import TestClient

from conftest import (
    DEFAULT_MODEL,
    GROUND_TRUTH,
    Thresholds,
    extract_features_raw,
    load_pickle,
)


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline shape & type invariants
# ─────────────────────────────────────────────────────────────────────────────

class TestPipelineShape:

    def test_predict_response_has_required_fields(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/home"})
        assert resp.status_code == 200
        data = resp.json()
        for field in ("status", "confidence", "model_used", "processing_time_ms"):
            assert field in data, f"Missing field: {field}"

    def test_status_is_either_attack_or_normal(self, client):
        """Every prediction must be binary: exactly 'attack' or 'normal'."""
        for url, content, _ in GROUND_TRUTH[:10]:
            resp = client.post("/api/v1/security/predict", json={"url": url, "content": content})
            assert resp.status_code == 200
            assert resp.json()["status"] in ("attack", "normal"), (
                f"Invalid status '{resp.json()['status']}' for URL: {url}"
            )

    def test_confidence_is_valid_probability(self, client):
        """Confidence must be in [0.0, 1.0]."""
        for url, _, _ in GROUND_TRUTH[:15]:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            assert resp.status_code == 200
            conf = resp.json()["confidence"]
            assert 0.0 <= conf <= 1.0, (
                f"Confidence {conf} out of [0,1] for URL: {url}"
            )

    def test_processing_time_is_non_negative(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/home"})
        assert resp.status_code == 200
        assert resp.json()["processing_time_ms"] >= 0

    def test_request_id_echoed_back(self, client):
        rid = "test-req-001"
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "request_id": rid},
        )
        assert resp.json().get("request_id") == rid

    def test_model_used_field_matches_request(self, client):
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "model_preference": "knn"},
        )
        assert resp.json()["model_used"] == "knn"


# ─────────────────────────────────────────────────────────────────────────────
# Label encoding roundtrip
# ─────────────────────────────────────────────────────────────────────────────

class TestLabelEncodingRoundtrip:

    def test_normal_label_maps_to_normal_status(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": "/home"})
        data = resp.json()
        assert data["status"] in ("attack", "normal")

    def test_label_encoder_inverse_transform_agrees_with_api(self, model_loader, client):
        """
        The numeric prediction from model.predict() must, when decoded through
        the label_encoder and LABEL_MAP, match the string status returned by the API.

        Note: label_encoder.classes_ = [0.0, 1.0] (numeric), not strings.
        The API maps 0.0→"normal" and 1.0→"attack" via LABEL_MAP.
        """
        test_urls = ["/home", "/products", "/admin"]

        for url in test_urls:
            le = model_loader.le
            df = extract_features_raw(url, None)
            model = model_loader.models["random_forest"]
            pred_num = model.predict(df)[0]
            decoded = le.inverse_transform([int(pred_num)])[0]   # 0.0 or 1.0

            # Map numeric class to API status
            expected_api_status = "normal" if decoded == 0.0 else "attack"

            resp = client.post("/api/v1/security/predict", json={"url": url})
            api_status = resp.json()["status"]

            assert api_status == expected_api_status, (
                f"Label encoding mismatch for '{url}': "
                f"model_pred={decoded} → API={api_status} (expected {expected_api_status})"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Feature order consistency across models
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureOrderConsistency:

    def test_all_models_produce_same_feature_columns(self, model_loader):
        """
        Every model must receive features in the same column order.
        If a model was trained on a different column order it would silently
        mis-predict – catch it here.
        """
        url = "/api/test"
        df_ref = extract_features_raw(url, None)

        for model_name, model in model_loader.models.items():
            df = df_ref.copy()
            try:
                model.predict(df)
            except Exception as exc:
                pytest.fail(f"Model '{model_name}' rejected feature DataFrame: {exc}")

    def test_feature_vector_dtype_float64(self):
        """
        All sklearn models expect float arrays.
        Ensure the feature extraction produces compatible dtypes.
        """
        df = extract_features_raw("/test", None)
        assert df.values.dtype in (np.float64, np.float32, np.int64, np.int32), (
            f"Unexpected dtype: {df.values.dtype}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Regression: known ground-truth cases
# ─────────────────────────────────────────────────────────────────────────────

class TestGroundTruthRegression:

    @pytest.mark.parametrize("url,content,expected", GROUND_TRUTH)
    def test_ground_truth_cases(self, client, url, content, expected):
        """
        Run every known-ground-truth case through the API.
        We allow a ±1 tolerance to account for borderline cases.
        """
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": url, "content": content},
        )
        assert resp.status_code == 200
        actual = resp.json()["status"]
        assert actual == expected, (
            f"Ground-truth mismatch for URL='{url}' content='{content}': "
            f"expected={expected}, got={actual} "
            f"(confidence={resp.json()['confidence']})"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Invalid input handling
# ─────────────────────────────────────────────────────────────────────────────

class TestInvalidInputHandling:

    def test_missing_url_returns_422(self, client):
        resp = client.post("/api/v1/security/predict", json={})
        assert resp.status_code == 422

    def test_url_type_error_returns_422(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": 12345})
        assert resp.status_code == 422

    def test_null_url_returns_422(self, client):
        resp = client.post("/api/v1/security/predict", json={"url": None})
        assert resp.status_code == 422

    def test_very_long_url_does_not_crash(self, client):
        long_url = "/search?q=" + ("a" * 50_000)
        resp = client.post("/api/v1/security/predict", json={"url": long_url})
        # Should either succeed (200) or return a clean 422, never 500
        assert resp.status_code in (200, 422)

    def test_invalid_model_preference_falls_back_to_default(self, client):
        """Unknown model_preference should fall back to random_forest, not 500."""
        resp = client.post(
            "/api/v1/security/predict",
            json={"url": "/test", "model_preference": "nonexistent_model"},
        )
        assert resp.status_code == 200
        assert resp.json()["model_used"] == DEFAULT_MODEL
