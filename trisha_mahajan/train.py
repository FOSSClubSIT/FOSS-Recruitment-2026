import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from train_license import to_license_family

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "license_model.pkl")


def train():
    if not os.path.exists(DATA_PATH):
        print(f"Error: dataset not found at '{DATA_PATH}'.")
        print("Run 'python fetch-data.py' first to generate it.")
        return

    df = pd.read_csv(DATA_PATH)
    if df.empty:
        print("Error: dataset is empty, nothing to train on.")
        return

    # Derive the family label at train time; the raw SPDX id stays in
    # dataset.csv so you're not throwing away information on disk.
    df["license_family"] = df["license"].apply(to_license_family)

    print("License family distribution:")
    print(df["license_family"].value_counts(), "\n")

    X = df["text"]
    y = df["license_family"]

    class_counts = y.value_counts()
    if (class_counts < 2).any():
        print("Warning: some license families have fewer than 2 samples; "
              "disabling stratified split for this run.")
        stratify_arg = None
    else:
        stratify_arg = y

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify_arg
    )

    # class_weight="balanced" matters more here than for category: license
    # families skew heavily toward Permissive/Unknown on GitHub, so without
    # this the model can score "well" by just always predicting the
    # majority class and never learning Copyleft at all.
    model = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=2)),
        ("clf", LogisticRegression(C=1.0, max_iter=1000, class_weight="balanced")),
    ])

    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print("--- License Model Evaluation ---")
    print(classification_report(y_test, preds, zero_division=0))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"License model saved to {MODEL_PATH}!")


if __name__ == "__main__":
    train()