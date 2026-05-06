import os
import sys
import pickle

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "exports"))
from feature_extractor import extract_features
import pandas as pd

EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "exports")

print("=== Checking Label Encoder ===")
with open(os.path.join(EXPORTS_DIR, "label_encoder.pkl"), "rb") as f:
    le = pickle.load(f)
print(f"Label encoder classes: {le.classes_}")
print(f"Label encoder type: {type(le.classes_[0])}")

print("\n=== Checking Models ===")
models_to_check = ["random_forest", "decision_tree", "gradient_boosting", "knn", "svc"]
for model_name in models_to_check:
    model_path = os.path.join(EXPORTS_DIR, f"{model_name}.pkl")
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)

        # Test with SQL injection URL
        df = pd.DataFrame([{"URL": "/search?q=' OR 1=1 --", "content": None}])
        features = extract_features(df)
        pred = model.predict(features)[0]
        print(f"\n{model_name}:")
        print(f"  Prediction for SQLi: {pred} (type: {type(pred)})")

        # Check proba
        try:
            proba = model.predict_proba(features)[0]
            print(f"  Probabilities: {proba}")
            print(f"  Predicted class: {pred} -> {le.inverse_transform([int(pred)])}")
        except Exception as e:
            print(f"  Error getting proba: {e}")

print("\n=== Testing benign URL ===")
df = pd.DataFrame([{"URL": "/products?category=tea", "content": None}])
features = extract_features(df)
for model_name in ["random_forest"]:
    with open(os.path.join(EXPORTS_DIR, f"{model_name}.pkl"), "rb") as f:
        model = pickle.load(f)
    pred = model.predict(features)[0]
    proba = model.predict_proba(features)[0]
    print(f"\n{model_name}:")
    print(f"  Prediction for benign URL: {pred}")
    print(f"  Probabilities: {proba}")
    print(f"  Predicted class: {pred} -> {le.inverse_transform([int(pred)])}")
