import os
import time
import pickle
import sys

import pandas as pd
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "exports"))
from feature_extractor import extract_features

EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "exports")

LABEL_MAP = {
    # Note: label_encoder.classes_ is [0.0, 1.0] (numpy floats), not strings.
    # Class 0 → Normal (benign), Class 1 → Anomalous (attack).
    0.0: "normal",
    1.0: "attack",
    # String keys retained for safety in case inverse_transform returns strings
    # in some versions / loading paths.
    "Normal":    "normal",
    "Anomalous": "attack",
    0:   "normal",
    1:   "attack",
}

MODEL_ALIASES = {
    "rf": "random_forest",
    "random_forest": "random_forest",
    "knn": "knn",
    "decision_tree": "decision_tree",
    "dt": "decision_tree",
    "gradient_boosting": "gradient_boosting",
    "gb": "gradient_boosting",
    "mlp": "mlp",
    "svc": "svc",
    "svm": "svc",
    "dnn": "dnn",
}

AVAILABLE_MODELS = [
    "random_forest",
    "knn",
    "decision_tree",
    "gradient_boosting",
    "mlp",
    "svc",
    "dnn",
]

DEFAULT_MODEL = "random_forest"


class ModelLoader:
    _instance = None
    _models = {}
    _label_encoder = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load_all(self):
        label_encoder_path = os.path.join(EXPORTS_DIR, "label_encoder.pkl")
        if not os.path.exists(label_encoder_path):
            raise FileNotFoundError(f"label_encoder.pkl not found at {label_encoder_path}")

        with open(label_encoder_path, "rb") as f:
            self._label_encoder = pickle.load(f)

        for model_name in AVAILABLE_MODELS:
            model_path = os.path.join(EXPORTS_DIR, f"{model_name}.pkl")
            if not os.path.exists(model_path):
                print(f"[WARN] Model file not found: {model_path}")
                continue
            try:
                with open(model_path, "rb") as f:
                    self._models[model_name] = pickle.load(f)
                print(f"[INFO] Loaded model: {model_name}")
            except Exception as e:
                print(f"[WARN] Failed to load model {model_name}: {e}")

        print(f"[INFO] Successfully loaded {len(self._models)}/{len(AVAILABLE_MODELS)} models: {list(self._models.keys())}")

    @property
    def models(self) -> dict:
        return self._models

    @property
    def le(self):
        return self._label_encoder

    @property
    def loaded_model_names(self) -> list[str]:
        return list(self._models.keys())


_loader = ModelLoader()


def load_models():
    _loader.load_all()


def _resolve_model(model_key: str) -> str:
    key = model_key.lower().strip()
    return MODEL_ALIASES.get(key, DEFAULT_MODEL)


# Model expects these 28 features in this exact order
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


def _extract_features_from_url(url: str, content: str | None) -> pd.DataFrame:
    """
    Extract features and align to exactly what the models expect.
    Model expects 28 features in MODEL_FEATURE_ORDER.
    """
    # Get features from the extractor
    df_in = pd.DataFrame([{"URL": url, "content": content}])
    df_fe = extract_features(df_in)

    # Build a complete feature vector with ALL model-expected features
    result = {}
    for feat in MODEL_FEATURE_ORDER:
        if feat == "Method_enc":
            # HTTP method encoding - we don't have this from the extractor
            # so we hardcode it as 0 (GET/POST encoded separately in production)
            result[feat] = 0
        elif feat in df_fe.columns:
            result[feat] = df_fe[feat].iloc[0]
        else:
            result[feat] = 0

    # Return DataFrame with columns in exact MODEL_FEATURE_ORDER
    return pd.DataFrame([result])[MODEL_FEATURE_ORDER]


def predict(url: str, content: str | None, model_preference: str = DEFAULT_MODEL) -> dict:
    model_key = _resolve_model(model_preference)

    if model_key not in _loader.models:
        if not _loader.models:
            raise RuntimeError("No models loaded. Check server logs for errors.")
        model_key = DEFAULT_MODEL

    model = _loader.models[model_key]

    features = _extract_features_from_url(url, content)

    prediction_num = model.predict(features)[0]

    try:
        proba = model.predict_proba(features)[0]
        confidence = float(max(proba))
    except (AttributeError, TypeError):
        confidence = 1.0

    label_str = _loader.le.inverse_transform([int(prediction_num)])[0]

    status = LABEL_MAP.get(float(label_str), LABEL_MAP.get(label_str, "normal"))

    return {
        "status": status,
        "confidence": round(confidence, 4),
        "model_used": model_key,
        "processing_time_ms": 0.0,
        "request_id": None,
    }


def predict_with_timing(url: str, content: str | None, model_preference: str = DEFAULT_MODEL) -> dict:
    start = time.perf_counter()

    result = predict(url, content, model_preference)

    elapsed_ms = (time.perf_counter() - start) * 1000
    result["processing_time_ms"] = round(elapsed_ms, 2)

    return result
