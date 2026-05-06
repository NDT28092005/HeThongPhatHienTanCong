"""
Performance testing: latency, throughput, FPR/NFR validation, and regression.

Uses pre-recorded JSON artifacts (evaluation_metrics.json, confusion_matrices.json,
execution_times.json) to validate performance characteristics against defined
thresholds.
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from statistics import mean

import numpy as np
import pytest

from conftest import (
    ALL_MODELS,
    CONFUSION_MATRICES,
    EVALUATION_METRICS,
    EVAL_METRICS_KEYS,
    EXECUTION_TIMES,
    EXECUTION_TIMES_KEYS,
    Thresholds,
)


# ─────────────────────────────────────────────────────────────────────────────
# Latency benchmarks via API
# ─────────────────────────────────────────────────────────────────────────────

class TestLatency:

    def test_mean_latency_under_threshold(self, client):
        """Mean API latency must be under MEAN_LATENCY_MS over a 30-request batch."""
        latencies = []
        urls = ["/home", "/products", "/about", "/api/users", "/search?q=test"]
        for i in range(30):
            url = urls[i % len(urls)]
            start = time.perf_counter()
            resp = client.post("/api/v1/security/predict", json={"url": url})
            latencies.append((time.perf_counter() - start) * 1000)
            assert resp.status_code == 200

        mean_lat = mean(latencies)
        assert mean_lat < Thresholds.MEAN_LATENCY_MS, (
            f"Mean latency {mean_lat:.1f}ms exceeds threshold "
            f"{Thresholds.MEAN_LATENCY_MS}ms"
        )

    def test_p95_latency_under_threshold(self, client):
        """95th-percentile latency must be under P95_LATENCY_MS."""
        latencies = []
        for i in range(100):
            url = f"/test-{i % 20}"
            start = time.perf_counter()
            resp = client.post("/api/v1/security/predict", json={"url": url})
            latencies.append((time.perf_counter() - start) * 1000)
            assert resp.status_code == 200

        p95 = np.percentile(latencies, 95)
        assert p95 < Thresholds.P95_LATENCY_MS, (
            f"p95 latency {p95:.1f}ms exceeds threshold "
            f"{Thresholds.P95_LATENCY_MS}ms"
        )

    def test_no_request_takes_longer_than_2_seconds(self, client):
        """No single request should exceed 2 seconds (hard limit)."""
        for i in range(50):
            start = time.perf_counter()
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": f"/perf-test-{i}"})
            elapsed_ms = (time.perf_counter() - start) * 1000
            assert elapsed_ms < 2000, (
                f"Request {i} took {elapsed_ms:.0f}ms (> 2000ms hard limit)"
            )

    @pytest.mark.parametrize("model_name", ALL_MODELS)
    def test_model_latency_via_api(self, client, model_name):
        """Each model must respond within 1 second via API."""
        times = []
        for i in range(20):
            start = time.perf_counter()
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": f"/latency-test-{i}", "model_preference": model_name},
            )
            times.append((time.perf_counter() - start) * 1000)
            assert resp.status_code == 200

        mean_t = mean(times)
        p99 = np.percentile(sorted(times), 99)
        assert p99 < 1000, (
            f"[{model_name}] p99 latency {p99:.0f}ms exceeds 1000ms"
        )
        assert mean_t < 500, (
            f"[{model_name}] mean latency {mean_t:.0f}ms exceeds 500ms"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Pre-recorded execution time validation
# ─────────────────────────────────────────────────────────────────────────────

class TestRecordedExecutionTimes:

    def test_prediction_time_recorded_for_all_models(self, exec_times):
        """All models must have recorded prediction times."""
        pred_times = exec_times.get("Prediction_Time", {})
        for model in ALL_MODELS:
            key = EXECUTION_TIMES_KEYS.get(model, model)
            assert key in pred_times, (
                f"Prediction time not recorded for '{model}' (key='{key}'). "
                f"Available: {list(pred_times.keys())}"
            )

    def test_prediction_time_reasonable(self, exec_times):
        """
        Per-sample prediction time must be < 100ms for all models.
        (Recorded times are for the full test set; per-sample = total / ~18k samples)
        """
        pred_times = exec_times["Prediction_Time"]
        for model_key in pred_times:
            total_secs = pred_times[model_key]
            per_sample_ms = (total_secs / 18_320) * 1000
            assert per_sample_ms < 100, (
                f"[{model_key}] Per-sample prediction time {per_sample_ms:.2f}ms > 100ms"
            )

    def test_dnn_prediction_time_not_terribly_slow(self, exec_times):
        """DNN prediction should not be > 500x slower than the fastest model (SVC)."""
        pred = exec_times["Prediction_Time"]
        svc_time = pred.get("SVC", 0)
        dnn_time = pred.get("DNN", 0)
        if svc_time > 0:
            ratio = dnn_time / svc_time
            assert ratio < 500, (
                f"DNN prediction is {ratio:.0f}x slower than SVC. "
                f"DNN={dnn_time:.3f}s, SVC={svc_time:.3f}s"
            )

    def test_training_time_recorded(self, exec_times):
        """Training times must all be finite and positive."""
        train = exec_times["Training_Time"]
        for model, secs in train.items():
            assert secs >= 0, f"Negative training time for {model}: {secs}"


# ─────────────────────────────────────────────────────────────────────────────
# FPR / FNR validation against confusion matrices
# ─────────────────────────────────────────────────────────────────────────────

class TestFalsePositiveRate:

    def test_fpr_below_max_threshold(self, conf_matrices):
        """
        FPR = FP / (FP + TN). Must be ≤ MAX_FPR = 0.10.
        """
        failures = []
        for model_name, matrix in conf_matrices.items():
            if not isinstance(matrix, list) or len(matrix) != 2:
                continue
            tn, fp = matrix[0][0], matrix[0][1]
            fn, tp = matrix[1][0], matrix[1][1]
            fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
            if fpr > Thresholds.MAX_FPR:
                failures.append((model_name, fpr))

        assert not failures, (
            f"FPR exceeds {Thresholds.MAX_FPR} threshold: "
            + ", ".join(f"{m}={r:.4f}" for m, r in failures)
        )

    def test_critical_fpr_below_strict_threshold(self, conf_matrices):
        """For high-stakes deployments, FPR must be ≤ 5%."""
        failures = []
        for model_name, matrix in conf_matrices.items():
            if not isinstance(matrix, list) or len(matrix) != 2:
                continue
            tn, fp = matrix[0][0], matrix[0][1]
            fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
            if fpr > Thresholds.MAX_FPR_CRITICAL:
                failures.append((model_name, fpr))

        if failures:
            pytest.fail(
                f"FPR exceeds CRITICAL threshold {Thresholds.MAX_FPR_CRITICAL}: "
                + ", ".join(f"{m}={r:.4f}" for m, r in failures)
            )

    def test_fnr_below_threshold(self, conf_matrices):
        """
        FNR = FN / (FN + TP). Must be ≤ MAX_FNR = 0.15.
        """
        failures = []
        for model_name, matrix in conf_matrices.items():
            if not isinstance(matrix, list) or len(matrix) != 2:
                continue
            tn, fp = matrix[0][0], matrix[0][1]
            fn, tp = matrix[1][0], matrix[1][1]
            fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
            if fnr > Thresholds.MAX_FNR:
                failures.append((model_name, fnr))

        assert not failures, (
            f"FNR exceeds {Thresholds.MAX_FNR} threshold: "
            + ", ".join(f"{m}={r:.4f}" for m, r in failures)
        )

    def test_f1_score_above_minimum(self, eval_metrics):
        """Every model must have F1-score ≥ 0.70."""
        failures = []
        for model in ALL_MODELS:
            key = EVAL_METRICS_KEYS.get(model)
            if key is None or key not in eval_metrics:
                continue
            f1 = eval_metrics[key].get("F1-score")
            if f1 is not None and f1 < 0.70:
                failures.append((key, f1))
        assert not failures, (
            "F1-score below 0.70: "
            + ", ".join(f"{m}={f:.4f}" for m, f in failures)
        )


# ─────────────────────────────────────────────────────────────────────────────
# Throughput testing
# ─────────────────────────────────────────────────────────────────────────────

class TestThroughput:

    def test_sustained_throughput(self, client):
        """Server must handle at least MIN_REQUESTS_PER_SECOND sustained throughput."""
        N = 100
        start = time.perf_counter()
        for i in range(N):
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": f"/throughput-{i}"})
            assert resp.status_code == 200
        elapsed = time.perf_counter() - start
        rps = N / elapsed
        assert rps >= Thresholds.MIN_REQUESTS_PER_SECOND, (
            f"Throughput {rps:.1f} req/s is below "
            f"minimum {Thresholds.MIN_REQUESTS_PER_SECOND} req/s"
        )

    def test_concurrent_throughput(self, client):
        """50 concurrent requests must all complete within 5 seconds."""
        def make_request(i):
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": f"/concurrent-{i}"},
            )
            return resp.status_code

        start = time.perf_counter()
        with ThreadPoolExecutor(max_workers=25) as executor:
            futures = [executor.submit(make_request, i) for i in range(50)]
            results = [f.result() for f in as_completed(futures)]
        elapsed = time.perf_counter() - start

        assert all(s == 200 for s in results), "Some concurrent requests failed"
        assert elapsed < 5.0, (
            f"50 concurrent requests took {elapsed:.1f}s (> 5s threshold)"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Accuracy regression
# ─────────────────────────────────────────────────────────────────────────────

class TestAccuracyRegression:

    def test_accuracy_not_degraded(self, eval_metrics):
        """Each model must meet minimum accuracy threshold."""
        failures = []
        for model in ALL_MODELS:
            key = EVAL_METRICS_KEYS.get(model)
            if key is None or key not in eval_metrics:
                continue
            acc = eval_metrics[key].get("Accuracy")
            if acc is None:
                continue
            if acc < Thresholds.MIN_ACCURACY:
                failures.append((key, acc))
            if acc > 0.99:
                pytest.fail(
                    f"[{key}] accuracy {acc:.4f} suspiciously high (> 0.99) – "
                    f"possible data leakage"
                )

        assert not failures, (
            "Accuracy below minimum: "
            + ", ".join(f"{m}={a:.4f}" for m, a in failures)
        )

    @pytest.mark.parametrize("model_name", ["random_forest", "knn", "decision_tree",
                                             "gradient_boosting", "mlp", "svc"])
    def test_accuracy_above_baseline(self, eval_metrics, model_name):
        """Each model must outperform a naive 50% baseline."""
        key = EVAL_METRICS_KEYS.get(model_name)
        if key not in eval_metrics:
            pytest.skip(f"Metrics not found for '{model_name}'")
        acc = eval_metrics[key]["Accuracy"]
        assert acc > 0.50, (
            f"[{model_name}] accuracy {acc:.4f} is worse than random baseline (0.50)"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Confidence calibration
# ─────────────────────────────────────────────────────────────────────────────

class TestConfidenceCalibration:

    def test_attack_predictions_have_confidence(self, client):
        """Attack predictions must have confidence ≥ 0.60 (model must be confident)."""
        low_conf = []
        for url in [
            "/search?q=' OR 1=1 --",
            "/admin?user=admin'--",
            "/api?id=1 UNION SELECT password FROM users--",
            "/comment?text=<script>alert(1)</script>",
            "/download?file=../../etc/passwd",
        ]:
            resp = client.post("/api/v1/security/predict", json={"url": url})
            conf = resp.json()["confidence"]
            if conf < 0.60:
                low_conf.append((url, conf))

        # Model classifies everything as attack, so we check confidence is reasonable
        assert not low_conf, (
            f"Attack predictions with low confidence: {low_conf}"
        )

    def test_confidence_never_exactly_0(self, client):
        """Confidence must never be exactly 0.0."""
        for i in range(30):
            resp = client.post(
                "/api/v1/security/predict",
                json={"url": f"/conf-test-{i}"},
            )
            conf = resp.json()["confidence"]
            assert conf > 0.0, f"Confidence is exactly 0 for request {i}"
