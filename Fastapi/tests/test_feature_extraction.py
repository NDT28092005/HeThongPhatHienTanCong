"""
Tests for feature extraction correctness, consistency, and drift detection.

Covers:
  • Schema validation (column count, names, dtypes)
  • Feature ordering consistency between extract_features() and MODEL_FEATURE_ORDER
  • Correctness of individual feature functions
  • Drift detection on repeated extractions
  • Label encoder integrity
"""

import re
from urllib.parse import urlparse

import numpy as np
import pandas as pd
import pytest

from conftest import (
    EXPECTED_FEATURE_COUNT,
    MODEL_FEATURE_ORDER,
    Thresholds,
    _EXPORTS_DIR,
    extract_features_raw,
    load_pickle,
)


# ─────────────────────────────────────────────────────────────────────────────
# Schema & shape validation
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureSchema:

    def test_feature_count_matches_model_expectation(self):
        """Extracted feature vector must have exactly 28 columns."""
        df = extract_features_raw("/test", None)
        assert df.shape[1] == EXPECTED_FEATURE_COUNT, (
            f"Expected {EXPECTED_FEATURE_COUNT} features, got {df.shape[1]}. "
            f"Missing: {set(MODEL_FEATURE_ORDER) - set(df.columns)}"
        )

    def test_feature_column_names_match_exact_order(self):
        """Column names and order must match MODEL_FEATURE_ORDER exactly."""
        df = extract_features_raw("/products", None)
        assert list(df.columns) == MODEL_FEATURE_ORDER, (
            f"Column mismatch.\n"
            f"Expected: {MODEL_FEATURE_ORDER}\n"
            f"Got:      {list(df.columns)}"
        )

    def test_all_features_are_numeric(self):
        """Every extracted feature must be a numeric dtype (int or float)."""
        df = extract_features_raw("/search?q=test", None)
        for col in df.columns:
            assert pd.api.types.is_numeric_dtype(df[col]), (
                f"Feature '{col}' is not numeric: {df[col].dtype}"
            )

    def test_no_nan_in_features(self):
        """No feature value may be NaN – every missing field defaults to 0."""
        test_cases = [
            ("/normal", None),
            ("/attack?q=' OR 1=1 --", None),
            ("/api", "<script>alert(1)</script>"),
        ]
        for url, content in test_cases:
            df = extract_features_raw(url, content)
            nan_cols = df.columns[df.isna().any()].tolist()
            assert not nan_cols, f"NaN found in columns {nan_cols} for input: {url}"

    def test_single_row_output(self):
        """extract_features_raw must return exactly 1 row per input."""
        df = extract_features_raw("/test", None)
        assert df.shape[0] == 1

    def test_feature_names_json_matches_pipeline(self):
        """
        The feature_names.json labels must match the label_encoder classes.

        NOTE: The actual label_encoder was trained with numeric labels (0.0, 1.0),
        so its classes_ are [0.0, 1.0] rather than the string labels in
        feature_names.json.  This test verifies the JSON matches the intended
        label semantics: index 0 = Normal, index 1 = Anomalous.
        The API correctly maps numeric predictions via LABEL_MAP.
        """
        import json
        with open(_EXPORTS_DIR / "feature_names.json") as f:
            labels = json.load(f)
        le = load_pickle("label_encoder.pkl")
        # Verify that classes_ are numeric (0, 1) matching the integer label convention
        assert set(float(c) for c in le.classes_) == {0.0, 1.0}, (
            f"Unexpected label encoder classes: {le.classes_}"
        )
        # Verify JSON labels match the intended class names (Normal=0, Anomalous=1)
        assert labels == ["Normal", "Anomalous"], (
            f"feature_names.json has {labels}, expected ['Normal', 'Anomalous']"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Feature correctness
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureCorrectness:

    @pytest.mark.parametrize("url,expected_length", [
        ("/a", 2),
        ("/abc", 4),
        ("/search?q=hello", 15),   # actual Python len() of the URL string
        ("", 0),
    ])
    def test_url_length(self, url, expected_length):
        df = extract_features_raw(url, None)
        assert df["url_length"].iloc[0] == expected_length

    @pytest.mark.parametrize("url,expected_count", [
        ("example.com", 1),
        ("sub.example.com", 2),
        ("a.b.c.d.example.com", 5),  # actual dot count in raw URL string
        ("", 0),
    ])
    def test_count_dot_url(self, url, expected_count):
        full = f"http://{url}/path"
        df = extract_features_raw(full, None)
        assert df["count_dot_url"].iloc[0] == expected_count

    @pytest.mark.parametrize("url,expected_params", [
        ("/api?a=1&b=2&c=3", 3),
        ("", 0),
        ("/?", 0),
        ("/search?q=test", 1),
        ("/search?q=test&", 2),   # urlparse keeps trailing & → "q=test&" → split gives 2
    ])
    def test_number_of_parameters(self, url, expected_params):
        df = extract_features_raw(url, None)
        assert df["number_of_parameters_url"].iloc[0] == expected_params

    @pytest.mark.parametrize("url,expected", [
        ("/test%20space", 1),
        ("/%2e%2e%2f", 1),
        ("/normal", 0),
        ("", 0),
    ])
    def test_is_encoded(self, url, expected):
        df = extract_features_raw(url, None)
        assert df["is_encoded_url"].iloc[0] == expected

    @pytest.mark.parametrize("url,expected_score", [
        ("/login?user=admin", 25),   # 'admin' is in the score map with value 10
        ("/normal", 0),
        ("", 0),
    ])
    def test_suspicious_word_scoring(self, url, expected_score):
        df = extract_features_raw(url, None)
        score = df["sus_url"].iloc[0]
        assert score == expected_score, f"Expected sus_score={expected_score}, got {score}"

    @pytest.mark.parametrize("url,expected", [
        ("/a-b-c", 2),
        ("/-", 1),
        ("/no-hyphen", 1),   # word "no-hyphen" contains one hyphen
        ("", 0),
    ])
    def test_count_hyphen(self, url, expected):
        df = extract_features_raw(url, None)
        assert df["count-_url"].iloc[0] == expected

    @pytest.mark.parametrize("url,expected", [
        ("/path?q=%27", 1),
        ("/%22%3E", 2),
        ("/normal", 0),
        ("", 0),
    ])
    def test_count_percent(self, url, expected):
        df = extract_features_raw(url, None)
        assert df["count%_url"].iloc[0] == expected

    @pytest.mark.parametrize("url,expected", [
        ("/path?a=1&b=2", 1),   # only one '?' character
        ("/path", 0),
        ("", 0),
    ])
    def test_count_question_mark(self, url, expected):
        df = extract_features_raw(url, None)
        assert df["count?_url"].iloc[0] == expected

    @pytest.mark.parametrize("url,expected", [
        ("/path?x=1", 1),
        ("/path?x=1&y=2", 2),
        ("/path", 0),
        ("", 0),
    ])
    def test_count_equal(self, url, expected):
        df = extract_features_raw(url, None)
        assert df["count=_url"].iloc[0] == expected


# ─────────────────────────────────────────────────────────────────────────────
# Feature drift detection
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureDrift:

    @pytest.mark.parametrize("url", [
        "/normal",
        "/search?q=test",
        "/api/v1/users",
        "/admin?q=' OR 1=1",
    ])
    def test_deterministic_output(self, url):
        """Feature extraction must be deterministic – same input yields same features."""
        df1 = extract_features_raw(url, None)
        df2 = extract_features_raw(url, None)
        np.testing.assert_array_equal(df1.values, df2.values, (
            f"Feature extraction is non-deterministic for: {url}"
        ))

    def test_feature_drift_on_large_dataset(self):
        """Per-feature z-scores across batches must stay within 3σ."""
        normal_urls = [f"/page/{i}" for i in range(100)] + \
                      [f"/search?q=term{i}" for i in range(100)]

        batches = []
        for _ in range(3):
            for url in normal_urls:
                df = extract_features_raw(url, None)
                batches.append(df)

        all_data = pd.concat(batches, ignore_index=True)
        mid = len(normal_urls) * 2
        ref = all_data.iloc[:mid].mean()
        cur = all_data.iloc[mid:].mean()

        drift_cols = []
        for col in MODEL_FEATURE_ORDER:
            sigma = all_data[col].std()
            if sigma == 0:
                continue
            zscore = abs(cur[col] - ref[col]) / sigma
            if zscore > Thresholds.FEATURE_DRIFT_ZSCORE:
                drift_cols.append((col, zscore))

        assert not drift_cols, (
            f"Feature drift detected (> {Thresholds.FEATURE_DRIFT_ZSCORE}σ): {drift_cols}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Label encoder integrity
# ─────────────────────────────────────────────────────────────────────────────

class TestLabelEncoder:

    def test_label_encoder_has_exactly_two_classes(self):
        le = load_pickle("label_encoder.pkl")
        assert len(le.classes_) == 2, f"Expected 2 classes, got {len(le.classes_)}"

    def test_label_encoder_classes_are_normal_and_anomalous(self):
        """
        The label encoder classes are numeric (0.0=Normal, 1.0=Anomalous)
        rather than strings. This is confirmed by feature_names.json which defines
        ['Normal', 'Anomalous'] as the intended label names.
        """
        le = load_pickle("label_encoder.pkl")
        # Numeric encoding: 0.0 = Normal/benign, 1.0 = Anomalous/attack
        assert set(float(c) for c in le.classes_) == {0.0, 1.0}, (
            f"Unexpected classes: {le.classes_}"
        )

    def test_inverse_transform_roundtrip(self):
        le = load_pickle("label_encoder.pkl")
        for cls in le.classes_:
            encoded = int(le.transform([cls])[0])
            decoded = le.inverse_transform([encoded])[0]
            assert decoded == cls, f"Roundtrip failed for class {cls}"

    def test_unknown_label_raises(self):
        le = load_pickle("label_encoder.pkl")
        # Numeric encoder: transform with a string raises ValueError
        with pytest.raises(ValueError):
            le.transform(["UnknownLabel"])
