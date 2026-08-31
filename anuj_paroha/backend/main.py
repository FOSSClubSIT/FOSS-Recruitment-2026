import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pickle
from fastapi import FastAPI, HTTPException

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from schema.user_input import DATA

PATH_DB = ROOT / "Housing.csv"
MODEL_PATH = ROOT / "model" / "house_price_model.pkl"
COLUMNS_PATH = ROOT / "model" / "feature_columns.pkl"

with open(MODEL_PATH, "rb") as model_file:
    model = pickle.load(model_file)

with open(COLUMNS_PATH, "rb") as columns_file:
    feature_columns = pickle.load(columns_file)


def compute_avg_price_per_sqft():
    df = pd.read_csv(PATH_DB)
    return (df["price"] / df["area"]).mean()


AVG_PRICE_PER_SQFT = compute_avg_price_per_sqft()

app = FastAPI()


def load_data():
    try:
        data = pd.read_csv(PATH_DB)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Housing.csv file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def save(data):
    try:
        data.to_csv(PATH_DB, index=False)
    except Exception:
        raise HTTPException(status_code=500, detail="Try again")


@app.get("/")
def about():
    return {"message": "House Price Prediction API is running"}


@app.get("/data")
def data():
    return load_data().to_dict(orient="records")


@app.post("/predict")
def predict(House: DATA):
    binary_map = {"yes": 1, "no": 0}
    input_data = {
        "area": House.area,
        "bedrooms": House.bedrooms,
        "bathrooms": House.bathrooms,
        "stories": House.stories,
        "mainroad": binary_map[House.mainroad],
        "guestroom": binary_map[House.guestroom],
        "basement": binary_map[House.basement],
        "airconditioning": binary_map[House.airconditioning],
        "parking": House.parking,
        "prefarea": binary_map[House.prefarea],
        "hotwaterheating": House.hotwaterheating,
        "furnishingstatus": House.furnishingstatus,
        "price_per_sqft": AVG_PRICE_PER_SQFT,
    }

    input_df = pd.DataFrame([input_data])
    input_df = pd.get_dummies(input_df, columns=["furnishingstatus"], drop_first=True)
    input_df = pd.get_dummies(input_df, columns=["hotwaterheating"], drop_first=True)

    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0

    input_df = input_df[feature_columns]
    prediction = model.predict(input_df)[0]

    tree_preds = np.array(
        [tree.predict(input_df.values)[0] for tree in model.estimators_]
    )
    std = tree_preds.std()
    z = 1.96
    margin = z * std

    return {
        "predicted_price": round(float(prediction), 2),
        "confidence_lower": round(float(prediction - margin), 2),
        "confidence_upper": round(float(prediction + margin), 2),
        "confidence_score": round(max(0, min(100, (1 - std / prediction) * 100)), 2),
    }
