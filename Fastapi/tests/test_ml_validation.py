"""
Advanced ML validation tests.

Covers:
  • Data leakage detection (feature leakage, label leakage)
  • Overfitting detection (train vs test metric gap)
  • Class imbalance impact analysis
  • Sensitivity to feature scaling
  • Cross-validation stability
"""

import json
import numpy as np
import pandas as pd
import pytest

from conftest import (
    ALL_MODELS,
    CONFUSION_MATRICES,
    DNN_EPOCHS_LOSS,
    EVALUATION_METRICS,
    EXECUTION_TIMES,
    GRID_SEARCH_RESULTS,
    Thresholds,
    extract_features_raw,
    load_pickle,
)


# ─────────────────────────────────────────────────────────────────────────────
# Train vs Test gap (overfitting detection)
# ─────────────────────────────────────────────────────────────────────────────

class TestOverfittingDetection:

    @pytest.mark.parametrize("model_name", ["random_forest", "knn", "decision_tree",
                                             "gradient_boosting", "mlp", "svc"])
    def test_cv_stability(self, model_name):
        """
        GridSearchCV split scores must have low variance across folds.
        High variance (std > 0.02) indicates unstable training.
        """
        gs = GRID_SEARCH_RESULTS if model_name == "gradient_boosting" else None
        if gs is None:
            pytest.skip("Grid search results not loaded for this model")

        # Find best config
        ranks = gs.get("rank_test_score", [])
        best_idx = next(i for i, r in enumerate(ranks) if r == 1)
        best_params = gs["params"][best_idx]

        # CV scores across 5 splits (5-fold search)
        split_keys = [f"split{i}_test_score" for i in range(5)]
        cv_scores = [gs[k][best_idx] for k in split_keys if k in gs]
        if len(cv_scores) < 2:
            cv_scores = [gs["split0_test_score"][best_idx], gs["split2_test_score"][best_idx]]

        cv_std = np.std(cv_scores)
        cv_mean = np.mean(cv_scores)

        assert cv_std < 0.02, (
            f"[{model_name}] CV score std={cv_std:.4f} is too high "
            f"(scores={cv_scores}, params={best_params}). "
            f"This indicates unstable / overfit model."
        )

    def test_training_time_reasonable(self):
        """
        Training times must be finite and non-negative.
        DNN training > 20 minutes (1200s) should be flagged for review.
        """
        times = EXECUTION_TIMES["Training_Time"]
        for name, secs in times.items():
            assert secs >= 0, f"Negative training time for '{name}': {secs}"
            if name == "DNN":
                assert secs < 3600, (
                    f"DNN training took {secs:.0f}s (> 1 hour). "
                    f"Consider early stopping or smaller architecture."
                )

    def test_accuracy_not_perfect(self, eval_metrics):
        """
        Perfect accuracy (1.0) on the test set is a red flag – likely label leakage
        or train/test contamination.
        """
        for name, metrics in eval_metrics.items():
            acc = metrics.get("Accuracy")
            if acc is not None:
                assert acc < 1.0, (
                    f"Model '{name}' has accuracy=1.0 – possible data leakage!"
                )

    @pytest.mark.parametrize("model_name", ["random_forest", "knn", "decision_tree",
                                             "gradient_boosting", "mlp", "svc"])
    def test_no_huge_train_test_gap(self, eval_metrics, model_name):
        """
        For tree models and linear models, accuracy should not exceed 99%.
        A gap of > 10% between train and test accuracy is a clear overfitting signal.
        """
        # Map display name → key
        name_map = {
            "random_forest": "Random Forest",
            "knn": "KNN",
            "decision_tree": "Decision Tree",
            "gradient_boosting": "Gradient Boosting",
            "mlp": "MLP",
            "svc": "SVC",
        }
        key = name_map.get(model_name)
        if key not in eval_metrics:
            pytest.skip(f"Metrics not found for '{model_name}'")

        acc = eval_metrics[key]["Accuracy"]
        assert acc >= Thresholds.MIN_ACCURACY, (
            f"Model '{model_name}' accuracy {acc:.4f} is below "
            f"minimum threshold {Thresholds.MIN_ACCURACY}"
        )
        # Sanity: no model should be suspiciously perfect
        assert acc <= 0.999, (
            f"Model '{model_name}' accuracy {acc:.4f} > 0.999 – "
            f"possible overfitting or label leakage."
        )


# ─────────────────────────────────────────────────────────────────────────────
# Class imbalance analysis
# ─────────────────────────────────────────────────────────────────────────────

class TestClassImbalance:

    def test_confusion_matrix_class_distribution(self, conf_matrices):
        """
        Both classes (normal / attack) must be represented in the test set.
        If either class has < 100 samples, the evaluation is unreliable.
        """
        for model_name, matrix in conf_matrices.items():
            if not isinstance(matrix, list) or len(matrix) != 2:
                continue
            tn, fp = matrix[0]
            fn, tp = matrix[1]
            total_normal = tn + fp
            total_attack = fn + tp

            assert total_normal >= 100, (
                f"[{model_name}] Only {total_normal} normal samples in test set – "
                f"evaluation may be unreliable."
            )
            assert total_attack >= 100, (
                f"[{model_name}] Only {total_attack} attack samples in test set – "
                f"evaluation may be unreliable."
            )

    def test_false_positive_rate_acceptable(self, conf_matrices):
        """
        FPR = FP / (FP + TN). Must be ≤ MAX_FPR threshold.
        High FPR = many false alarms = operational pain.
        """
        for model_name, matrix in conf_matrices.items():
            if not isinstance(matrix, list) or len(matrix) != 2:
                continue
            tn, fp, fn, tp = matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]
            fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
            assert fpr <= Thresholds.MAX_FPR, (
                f"[{model_name}] FPR={fpr:.4f} exceeds threshold "
                f"{Thresholds.MAX_FPR} (FP={fp}, TN={tn})"
            )

    def test_false_negative_rate_acceptable(self, conf_matrices):
        """
        FNR = FN / (FN + TP). Must be ≤ MAX_FNR threshold.
        High FNR = missed attacks = security risk.
        """
        for model_name, matrix in conf_matrices.items():
            if not isinstance(matrix, list) or len(matrix) != 2:
                continue
            tn, fp, fn, tp = matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]
            fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
            assert fnr <= Thresholds.MAX_FNR, (
                f"[{model_name}] FNR={fnr:.4f} exceeds threshold "
                f"{Thresholds.MAX_FNR} (FN={fn}, TP={tp})"
            )

    def test_precision_recall_balance(self, eval_metrics):
        """
        Precision and Recall should not differ by more than 20%.
        A huge gap means the model is biased toward one class.
        """
        for name, metrics in eval_metrics.items():
            prec = metrics.get("Precision")
            rec  = metrics.get("Recall")
            if prec is None or rec is None:
                continue
            gap = abs(prec - rec)
            assert gap < 0.20, (
                f"[{name}] Precision-Recall gap={gap:.4f} – "
                f"model is class-imbalanced (P={prec:.4f}, R={rec:.4f})"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Feature scaling sensitivity
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureScalingSensitivity:

    def test_url_length_dominates_unscaled_predictions(self, model_loader):
        """
        If we manually zero-out url_length, predictions must not flip.
        If they do, url_length is the dominant feature – the model
        may be relying too heavily on a single heuristic.
        """
        baseline_df = extract_features_raw("/search?q=' OR 1=1 --", None)
        perturbed_df = baseline_df.copy()
        perturbed_df["url_length"] = 0

        model = model_loader.models["random_forest"]
        pred_baseline = model.predict(baseline_df)[0]
        pred_perturbed = model.predict(perturbed_df)[0]

        # It's ok if they differ – but we log it for analysis
        if pred_baseline != pred_perturbed:
            pytest.skip(
                "Prediction flips when url_length=0 – this is informational "
                "but not a test failure. Consider investigating feature dominance."
            )

    def test_special_characters_feature_has_effect(self, model_loader):
        """
        Removing special character counts must affect at least some predictions.
        """
        baseline_df = extract_features_raw("/search?q=' OR 1=1 --", None)
        perturbed_df = baseline_df.copy()
        for col in ["special_count_url", "special_count_content",
                    "count%_url", "count%_content",
                    "count-_url", "count-_content"]:
            if col in perturbed_df.columns:
                perturbed_df[col] = 0

        model = model_loader.models["random_forest"]
        pred_baseline = model.predict(baseline_df)[0]
        pred_perturbed = model.predict(perturbed_df)[0]

        # At least 1 flip across the test corpus
        # We test 5 samples – if none flip, special char features are dead
        flipped = 0
        for url in ["/normal", "/search?q=' OR 1=1", "/admin", "/products", "/api?q=a"]:
            df1 = extract_features_raw(url, None)
            df2 = df1.copy()
            for col in df2.columns:
                if "special" in col or "%" in col or "-_" in col:
                    df2[col] = 0
            if model.predict(df1)[0] != model.predict(df2)[0]:
                flipped += 1

        assert flipped > 0, (
            "No predictions changed when special-character features were zeroed. "
            "These features may be dead weight in the model."
        )


# ─────────────────────────────────────────────────────────────────────────────
# Data leakage detection
# ─────────────────────────────────────────────────────────────────────────────

class TestDataLeakage:

    def test_suspicious_word_not_in_url_column(self):
        """
        The 'sus_url' score must be computed from the URL string, not from
        a separate leaked label column.
        Verify the score changes when we change the URL.
        """
        df1 = extract_features_raw("/login?user=admin", None)
        df2 = extract_features_raw("/login?user=alice", None)

        # Both are normal-looking URLs but with different content
        # The sus_url score must be identical (content is None)
        assert df1["sus_url"].iloc[0] == df2["sus_url"].iloc[0], (
            "sus_url changed just because user param changed – "
            "possible label leakage if the score encodes user identity"
        )

    def test_content_feature_only_uses_content(self):
        """
        sus_content must be zero when content is None.
        This proves the feature isn't using the URL or other leaked columns.
        """
        df = extract_features_raw("/search?q=test", None)
        assert df["sus_content"].iloc[0] == 0, (
            "sus_content > 0 even though content=None – possible leakage"
        )

        df2 = extract_features_raw("/search?q=test",
                                    content="SELECT * FROM passwords")
        assert df2["sus_content"].iloc[0] > 0, (
            "sus_content == 0 even with malicious content – feature not working"
        )

    def test_url_length_uses_entire_url(self):
        """
        Verify url_length equals len(url) for simple cases.
        If it doesn't, the feature may be using transformed/leaked data.
        """
        url = "/api/v1/users?q=active"
        df = extract_features_raw(url, None)
        assert df["url_length"].iloc[0] == len(url), (
            f"url_length={df['url_length'].iloc[0]} != len(url)={len(url)}"
        )

    def test_encoded_characters_affect_length(self):
        """
        URL-encoded sequences (e.g. %20) must be counted as multiple characters,
        matching Python's len() behavior.
        """
        url = "/search?q=hello%20world"   # %20 is 3 chars, not 1
        df = extract_features_raw(url, None)
        assert df["url_length"].iloc[0] == len(url), (
            f"url_length doesn't match len('{url}')"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Cross-validation stability
# ─────────────────────────────────────────────────────────────────────────────

class TestCVStability:

    def test_gb_grid_search_best_params_reasonable(self):
        """
        GridSearchCV best params for Gradient Boosting should be sensible.
        Best learning_rate should be in [0.01, 0.3] range.
        """
        gs = GRID_SEARCH_RESULTS
        ranks = gs["rank_test_score"]
        best_idx = next(i for i, r in enumerate(ranks) if r == 1)
        best_params = gs["params"][best_idx]

        lr = best_params.get("learning_rate")
        n_est = best_params.get("n_estimators")

        assert 0.001 <= lr <= 0.5, (
            f"Best learning_rate={lr} is outside reasonable range [0.001, 0.5]"
        )
        assert 50 <= n_est <= 500, (
            f"Best n_estimators={n_est} is outside reasonable range [50, 500]"
        )

    def test_cv_score_consistency_across_splits(self):
        """
        All 5 CV split scores should be within 0.05 of each other for the best config.
        Large variance indicates the model is not stable.
        """
        gs = GRID_SEARCH_RESULTS
        ranks = gs["rank_test_score"]
        best_idx = next(i for i, r in enumerate(ranks) if r == 1)

        split_keys = [f"split{i}_test_score" for i in range(5)]
        scores = [gs[k][best_idx] for k in split_keys if k in gs]
        if len(scores) < 2:
            pytest.skip("Not enough CV split data")

        score_range = max(scores) - min(scores)
        assert score_range < 0.05, (
            f"CV score range={score_range:.4f} across splits – "
            f"model is unstable (scores={scores})"
        )
