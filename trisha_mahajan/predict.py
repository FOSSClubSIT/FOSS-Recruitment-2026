import os
import sys
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATEGORY_MODEL_PATH = os.path.join(BASE_DIR, "models", "category_model.pkl")
LICENSE_MODEL_PATH = os.path.join(BASE_DIR, "models", "license_model.pkl")


def load_model(path, friendly_name):
    if not os.path.exists(path):
        print(f"Error: {friendly_name} model not found at '{path}'.")
        print("Run the matching train script first "
              "('python train.py' or 'python train_license.py')!")
        sys.exit(1)
    return joblib.load(path)


def predict(text):
    category_model = load_model(CATEGORY_MODEL_PATH, "category")
    license_model = load_model(LICENSE_MODEL_PATH, "license")

    category_pred = category_model.predict([text])[0]
    category_conf = max(category_model.predict_proba([text])[0]) * 100

    license_pred = license_model.predict([text])[0]
    license_conf = max(license_model.predict_proba([text])[0]) * 100

    print("\n" + "=" * 45)
    print(f' Input Snippet:  "{text}"')
    print(f" Predicted Category:  {category_pred}  ({category_conf:.2f}%)")
    print(f" Predicted License:   {license_pred}  ({license_conf:.2f}%)")
    print("=" * 45 + "\n")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
    else:
        user_input = input("Enter a project description to classify: ")

    if user_input.strip():
        predict(user_input)
    else:
        print("Input text cannot be empty.")