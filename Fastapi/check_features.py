import os
import sys
import pickle

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "exports"))
from feature_extractor import extract_features
import pandas as pd
import numpy as np

EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "exports")

# Load model and label encoder
with open(os.path.join(EXPORTS_DIR, "random_forest.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(EXPORTS_DIR, "label_encoder.pkl"), "rb") as f:
    le = pickle.load(f)

# Model expected features
model_features = list(model.feature_names_in_)

print("=== Checking Label Encoder ===")
print(f"Classes: {le.classes_}")
print(f"Classes type: {type(le.classes_[0])}")

print("\n=== Testing Various URLs ===")
test_urls = [
    "/search?q=' OR 1=1 --",  # SQL injection
    "/admin?q=' OR 1=1 --",    # SQL injection
    "/comment?text=<script>alert('xss')</script>",  # XSS
    "/download?file=../../etc/passwd",  # Path traversal
    "/ping?host=127.0.0.1; cat /etc/passwd",  # Command injection
    "/home",  # Normal
    "/products",  # Normal
    "/products?category=tea",  # Normal
]

for url in test_urls:
    df = pd.DataFrame([{"URL": url, "content": None}])
    features = extract_features(df)
    features = features[model_features]

    pred = model.predict(features)[0]
    proba = model.predict_proba(features)[0]

    # Decode the label
    try:
        decoded = le.inverse_transform([int(pred)])[0]
    except:
        decoded = pred

    print(f"\nURL: {url}")
    print(f"  Prediction (numeric): {pred}")
    print(f"  Prediction (decoded): {decoded}")
    print(f"  Probabilities: class_0={proba[0]:.4f}, class_1={proba[1]:.4f}")

print("\n=== Checking Label Mapping ===")
print("If class_0 is 'Normal' and class_1 is 'Anomalous' (attack)")
print("Then the model is predicting class_0 (Normal) for SQL injection - THIS IS THE BUG")

# Check what labels the encoder was trained with
print("\n=== Label Encoder Details ===")
print(f"Encoder: {le}")
