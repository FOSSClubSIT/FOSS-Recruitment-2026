"""
Bhaav — Flask backend
============================================================
Serves the frontend (templates/index.html) and a small JSON
API that the frontend's JavaScript calls to get prices.

Run locally:
    pip install -r requirements.txt
    python3 app.py
Then open http://127.0.0.1:5000 in your browser.
============================================================
"""

from flask import Flask, render_template, jsonify, request
import data

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/meta")
def api_meta():
    """Crops and districts available, so the frontend can build its dropdowns."""
    return jsonify({
        "crops": data.CROPS,
        "districts": list(dict.fromkeys(m["district"] for m in data.MARKETS)),
    })


@app.route("/api/board")
def api_board():
    """
    Main endpoint. Query params:
      crop     - e.g. "Onion" (required)
      district - e.g. "Nashik", or "ALL" (optional, default ALL)

    Returns the sorted market list, the best market, and a nudge.
    """
    crop = request.args.get("crop", data.CROPS[0])
    district = request.args.get("district", "ALL")

    if crop not in data.CROPS:
        return jsonify({"error": f"Unknown crop '{crop}'"}), 400

    records = data.load_records(crop)
    if district != "ALL":
        records = [r for r in records if r["district"] == district]

    if not records:
        return jsonify({"error": "No markets match that filter"}), 404

    records.sort(key=lambda r: r["modal_price"], reverse=True)
    best = records[0]
    nudge = data.compute_nudge(best)

    return jsonify({
        "crop": crop,
        "district": district,
        "records": records,
        "best_market": best["market"],
        "nudge": nudge,
    })


@app.route("/api/forecast")
def api_forecast():
    """6-month price forecast for a crop, using trend + seasonality."""
    crop = request.args.get("crop", data.CROPS[0])
    if crop not in data.CROPS:
        return jsonify({"error": f"Unknown crop '{crop}'"}), 400

    result = data.forecast_price(crop, months=6)
    return jsonify({
        "crop": crop,
        "history": result["history"],
        "forecast": result["forecast"],
        "trend_per_month": result["trend_per_month"],
    })


if __name__ == "__main__":
    app.run(debug=True, port=5050)
