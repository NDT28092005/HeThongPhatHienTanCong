import os
import sys
import pickle

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "exports"))
from feature_extractor import extract_features
import pandas as pd

EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "exports")

# Load model
with open(os.path.join(EXPORTS_DIR, "random_forest.pkl"), "rb") as f:
    model = pickle.load(f)

# Load label encoder
with open(os.path.join(EXPORTS_DIR, "label_encoder.pkl"), "rb") as f:
    le = pickle.load(f)

# Expected features from model
model_features = list(model.feature_names_in_)
print(f"Model expects {len(model_features)} features")
print(f"Features: {model_features}")

# What extract_features produces
df_in = pd.DataFrame([{"URL": "/search?q=' OR 1=1 --", "content": None}])
df_out = extract_features(df_in)

print(f"\nFeature extractor output columns ({len(df_out.columns)}):")
print(df_out.columns.tolist())

print(f"\nFirst row:")
print(df_out.iloc[0])

# Check for extra columns
extra_cols = set(df_out.columns) - set(model_features) - {"URL", "content"}
missing_cols = set(model_features) - set(df_out.columns)
print(f"\nExtra columns (not in model): {extra_cols}")
print(f"Missing columns (in model): {missing_cols}")

# What happens if we remove URL/content?
clean_df = df_out.drop(columns=["URL", "content"], errors="ignore")
print(f"\nAfter removing URL/content: {len(clean_df.columns)} columns")
print(f"Columns: {clean_df.columns.tolist()}")

# Check if this matches model features
if list(clean_df.columns) == model_features:
    print("\nSUCCESS: Feature columns match!")
else:
    print(f"\nMISMATCH!")
    print(f"Expected: {model_features}")
    print(f"Got:      {clean_df.columns.tolist()}")

# Try prediction with correct features
clean_df = clean_df[model_features]
pred = model.predict(clean_df)
proba = model.predict_proba(clean_df)
print(f"\nPrediction: {pred[0]}")
print(f"Probabilities: {proba[0]}")
print(f"Decoded: {le.inverse_transform([pred[0]])}")
