import os
import pickle

EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "exports")

print("=== Checking Random Forest Model ===")
with open(os.path.join(EXPORTS_DIR, "random_forest.pkl"), "rb") as f:
    model = pickle.load(f)

print(f"Model type: {type(model)}")

# Check if it's a Pipeline
if hasattr(model, 'steps'):
    print("\nThis is a Pipeline with steps:")
    for name, step in model.steps:
        print(f"  {name}: {type(step)}")
        if hasattr(step, 'feature_names_in_'):
            print(f"    Feature names: {step.feature_names_in_}")
        if hasattr(step, 'n_features_in_'):
            print(f"    n_features_in: {step.n_features_in_}")
elif hasattr(model, 'feature_names_in_'):
    print(f"\nModel feature names: {model.feature_names_in_}")
    print(f"n_features_in: {model.n_features_in_}")
elif hasattr(model, 'n_features_in_'):
    print(f"\nn_features_in: {model.n_features_in_}")

print("\n=== Checking all model files ===")
for f in os.listdir(EXPORTS_DIR):
    if f.endswith('.pkl'):
        path = os.path.join(EXPORTS_DIR, f)
        with open(path, "rb") as pf:
            try:
                m = pickle.load(pf)
                print(f"\n{f}:")
                print(f"  Type: {type(m)}")
                if hasattr(m, 'steps'):
                    print(f"  Pipeline steps: {[s[0] for s in m.steps]}")
                    # Check first step
                    first_step = m.steps[0][1]
                    if hasattr(first_step, 'feature_names_in_'):
                        print(f"  First step feature names: {list(first_step.feature_names_in_)[:10]}...")
                    if hasattr(first_step, 'n_features_in_'):
                        print(f"  n_features_in: {first_step.n_features_in_}")
                elif hasattr(m, 'feature_names_in_'):
                    print(f"  Feature names: {list(m.feature_names_in_)[:10]}...")
                    print(f"  n_features_in: {m.n_features_in_}")
                elif hasattr(m, 'n_features_in_'):
                    print(f"  n_features_in: {m.n_features_in_}")
            except Exception as e:
                print(f"\n{f}: ERROR - {e}")
