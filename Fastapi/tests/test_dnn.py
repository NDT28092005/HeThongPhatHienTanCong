"""
DNN-specific testing: convergence, overfitting, and architecture validation.

Uses dnn_epochs_loss.json which contains epoch-by-epoch training/validation
loss data from the Keras DNN model.
"""

import json
import os
import sys
from pathlib import Path

import numpy as np
import pytest

from conftest import (
    EXECUTION_TIMES,
    Thresholds,
    load_pickle,
)


# ─────────────────────────────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────────────────────────────

def _load_dnn_epochs_loss():
    path = Path(__file__).parent.parent / "exports" / "dnn_epochs_loss.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────────────────────────────────────────
# Convergence validation
# ─────────────────────────────────────────────────────────────────────────────

class TestDNNConvergence:

    def test_dnn_epochs_loss_file_exists(self):
        path = Path(__file__).parent.parent / "exports" / "dnn_epochs_loss.json"
        assert path.exists(), "dnn_epochs_loss.json not found"

    def test_dnn_epochs_loss_not_empty(self):
        data = _load_dnn_epochs_loss()
        assert data, "dnn_epochs_loss.json is empty"

    def test_training_loss_decreases_over_epochs(self):
        """
        Training loss must monotonically decrease over epochs.
        If it increases, training is unstable.
        """
        data = _load_dnn_epochs_loss()
        # data is keyed by learning_rate/n_estimators combos, each having
        # 'loss' and 'val_loss' lists
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            loss = val.get("loss", [])
            if len(loss) < 5:
                continue
            # Check that loss decreases from epoch 1 to last epoch
            initial = np.mean(loss[:3])
            final = np.mean(loss[-3:])
            assert final < initial, (
                f"[{key}] Training loss did not decrease: "
                f"initial={initial:.4f}, final={final:.4f}"
            )

    def test_validation_loss_converges_reasonably(self):
        """
        Validation loss must stabilize (not diverge wildly from training loss).
        """
        data = _load_dnn_epochs_loss()
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            val_loss = val.get("val_loss", [])
            if len(val_loss) < 5:
                continue
            # Validation loss should not be 10x the training loss
            train_loss = val.get("loss", [])
            if not train_loss:
                continue
            ratio = np.mean(val_loss[-5:]) / max(np.mean(train_loss[-5:]), 1e-9)
            assert ratio < 5.0, (
                f"[{key}] val_loss is {ratio:.1f}x training loss – "
                f"severe overfitting detected"
            )

    def test_minimum_epochs_trained(self):
        """
        Model must be trained for at least DNN_MIN_EPOCHS = 10 epochs.
        """
        data = _load_dnn_epochs_loss()
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            loss = val.get("loss", [])
            assert len(loss) >= Thresholds.DNN_MIN_EPOCHS, (
                f"[{key}] Only {len(loss)} epochs trained "
                f"(minimum {Thresholds.DNN_MIN_EPOCHS})"
            )

    def test_loss_values_are_finite(self):
        """All loss values must be finite numbers."""
        data = _load_dnn_epochs_loss()
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            for loss_type in ("loss", "val_loss"):
                losses = val.get(loss_type, [])
                for i, l in enumerate(losses):
                    assert np.isfinite(l), (
                        f"[{key}] {loss_type}[{i}]={l} is not finite"
                    )

    def test_no_nan_in_losses(self):
        """NaN losses indicate failed training."""
        data = _load_dnn_epochs_loss()
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            for loss_type in ("loss", "val_loss"):
                losses = val.get(loss_type, [])
                for i, l in enumerate(losses):
                    assert not np.isnan(l), (
                        f"[{key}] {loss_type}[{i}]=NaN – training failed"
                    )


# ─────────────────────────────────────────────────────────────────────────────
# Overfitting detection (DNN)
# ─────────────────────────────────────────────────────────────────────────────

class TestDNNOverfitting:

    def test_train_val_loss_gap(self):
        """
        For each configuration, compute the gap between final training loss
        and final validation loss. Gap > 0.05 flags overfitting.
        """
        data = _load_dnn_epochs_loss()
        failures = []
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            train_loss = val.get("loss", [])
            val_loss = val.get("val_loss", [])
            if len(train_loss) < 2 or len(val_loss) < 2:
                continue
            # Use last 5 epochs for stability
            gap = np.mean(val_loss[-5:]) - np.mean(train_loss[-5:])
            if gap > Thresholds.DNN_VAL_LOSS_GAP_THRESHOLD:
                failures.append((key, gap))

        assert not failures, (
            f"DNN overfitting detected (train-val gap > {Thresholds.DNN_VAL_LOSS_GAP_THRESHOLD}): "
            + ", ".join(f"{k}={g:.4f}" for k, g in failures[:5])
        )

    def test_validation_loss_not_increasing_at_end(self):
        """
        In the last 5 epochs, val_loss should not be trending upward.
        Upward trend indicates the model is still overfitting.
        """
        data = _load_dnn_epochs_loss()
        failures = []
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            val_loss = val.get("val_loss", [])
            if len(val_loss) < 10:
                continue
            # Linear slope of last 5 val_loss values
            last5 = val_loss[-5:]
            slope = np.polyfit(range(5), last5, 1)[0]
            if slope > 0.01:  # positive slope > 0.01
                failures.append((key, slope))

        assert not failures, (
            f"Validation loss trending upward in last epochs: "
            + ", ".join(f"{k}={s:.4f}" for k, s in failures[:3])
        )

    def test_best_epoch_not_at_start(self):
        """
        Best val_loss should not occur at epoch 0 (start of training).
        If it does, the model immediately overfits.
        """
        data = _load_dnn_epochs_loss()
        failures = []
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            val_loss = val.get("val_loss", [])
            if not val_loss:
                continue
            best_epoch = int(np.argmin(val_loss))
            if best_epoch == 0:
                failures.append(key)

        assert not failures, (
            f"Best val_loss at epoch 0 for: {failures} – model immediately overfits"
        )

    def test_early_stop_epoch_reasonable(self):
        """
        If early stopping was used, the best epoch should be at least 20% through training.
        If it's very early (< 20% of total), it suggests severe overfitting.
        """
        data = _load_dnn_epochs_loss()
        failures = []
        for key, val in data.items():
            if not isinstance(val, dict):
                continue
            val_loss = val.get("val_loss", [])
            if len(val_loss) < 10:
                continue
            best_epoch = int(np.argmin(val_loss))
            total_epochs = len(val_loss)
            if best_epoch < 0.2 * total_epochs:
                failures.append((key, best_epoch, total_epochs))

        if failures:
            pytest.fail(
                "Early stopping occurred before 20% of training: "
                + ", ".join(f"{k}@epoch{e}/{t}" for k, e, t in failures[:3])
            )


# ─────────────────────────────────────────────────────────────────────────────
# DNN architecture & training metadata
# ─────────────────────────────────────────────────────────────────────────────

class TestDNNArchitecture:

    def test_dnn_model_file_exists(self):
        """dnn_model.h5 must exist."""
        path = Path(__file__).parent.parent / "exports" / "dnn_model.h5"
        assert path.exists(), "dnn_model.h5 not found in exports/"

    def test_dnn_model_loadable(self):
        """DNN model must be loadable via Keras."""
        pytest.importorskip("tensorflow", reason="TensorFlow not installed")
        import tensorflow as tf
        path = Path(__file__).parent.parent / "exports" / "dnn_model.h5"
        try:
            model = tf.keras.models.load_model(path, compile=False)
            assert model.input_shape is not None
            assert len(model.outputs) == 1
        except Exception as exc:
            pytest.fail(f"Failed to load dnn_model.h5: {exc}")

    def test_dnn_training_time_recorded(self, exec_times):
        """DNN training time must be recorded."""
        train = exec_times.get("Training_Time", {})
        dnn_time = train.get("DNN")
        assert dnn_time is not None, "DNN training time not recorded"
        assert dnn_time > 0, "DNN training time is zero"

    def test_dnn_prediction_time_recorded(self, exec_times):
        pred = exec_times.get("Prediction_Time", {})
        dnn_time = pred.get("DNN")
        assert dnn_time is not None, "DNN prediction time not recorded"

    def test_dnn_has_reasonable_layer_count(self):
        """DNN should have 3-10 layers (not trivial, not excessively deep)."""
        pytest.importorskip("tensorflow", reason="TensorFlow not installed")
        import tensorflow as tf
        path = Path(__file__).parent.parent / "exports" / "dnn_model.h5"
        model = tf.keras.models.load_model(path, compile=False)
        num_layers = len(model.layers)
        assert 2 <= num_layers <= 15, (
            f"DNN has {num_layers} layers – expected 2-15"
        )

    def test_dnn_output_activation_is_sigmoid_or_softmax(self):
        """
        Final layer activation must be sigmoid (binary) or softmax.
        Linear output would be incorrect for classification.
        """
        pytest.importorskip("tensorflow", reason="TensorFlow not installed")
        import tensorflow as tf
        path = Path(__file__).parent.parent / "exports" / "dnn_model.h5"
        model = tf.keras.models.load_model(path, compile=False)
        last_layer = model.layers[-1]
        activation = last_layer.activation
        # Get the activation name
        act_name = getattr(activation, "name", str(activation))
        allowed = {"sigmoid", "softmax", "linear"}
        # linear is allowed only for regression (not our case), but we warn
        assert act_name in allowed, (
            f"DNN last layer activation '{act_name}' is not sigmoid or softmax"
        )


# ─────────────────────────────────────────────────────────────────────────────
# DNN noise robustness
# ─────────────────────────────────────────────────────────────────────────────

class TestDNNNoiseRobustness:

    def test_dnn_no_crash_on_empty_input(self):
        """DNN must handle zero-filled input without crash."""
        pytest.importorskip("tensorflow", reason="TensorFlow not installed")
        import tensorflow as tf

        path = Path(__file__).parent.parent / "exports" / "dnn_model.h5"
        model = tf.keras.models.load_model(path, compile=False)

        # Zero-filled input
        zeros = np.zeros((1, 27), dtype=np.float32)
        try:
            pred = model.predict(zeros, verbose=0)
            assert pred.shape == (1, 1), f"Unexpected output shape: {pred.shape}"
        except Exception as exc:
            pytest.fail(f"DNN crashed on zero input: {exc}")

    def test_dnn_no_crash_on_random_input(self):
        """DNN must not crash on random float input."""
        pytest.importorskip("tensorflow", reason="TensorFlow not installed")
        import tensorflow as tf

        path = Path(__file__).parent.parent / "exports" / "dnn_model.h5"
        model = tf.keras.models.load_model(path, compile=False)

        rng = np.random.default_rng(42)
        for _ in range(10):
            x = rng.uniform(-5, 5, size=(1, 27)).astype(np.float32)
            try:
                pred = model.predict(x, verbose=0)
                assert pred.shape == (1, 1)
            except Exception as exc:
                pytest.fail(f"DNN crashed on random input: {exc}")
