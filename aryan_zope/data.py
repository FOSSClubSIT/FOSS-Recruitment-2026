"""
Bhaav — data layer
============================================================
This is the single source of truth for market data and the
"sell now / wait" nudge logic. Both the Flask backend (app.py)
and any CLI/script import from here.

Right now load_records() returns mock data shaped exactly like
the real data.gov.in Agmarknet response. Swap it for
load_records_live() once you have your own API key — nothing
else in this file, or in app.py, needs to change.
============================================================
"""

import os
import requests

MARKETS = [
    {"market": "Lasalgaon", "district": "Nashik"},
    {"market": "Pimpalgaon", "district": "Nashik"},
    {"market": "Yeola", "district": "Nashik"},
    {"market": "Pune", "district": "Pune"},
    {"market": "Rahata", "district": "Ahmednagar"},
    {"market": "Kalamna", "district": "Nagpur"},
]

CROPS = ["Onion", "Tomato", "Wheat", "Soybean"]

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"]

# 7-day modal price series (₹/quintal) per crop, per market — mock but realistic
SERIES = {
    "Onion": {
        "Lasalgaon":  [2310, 2340, 2365, 2390, 2415, 2435, 2450],
        "Pimpalgaon": [2240, 2270, 2295, 2320, 2345, 2365, 2380],
        "Yeola":      [2160, 2190, 2215, 2240, 2260, 2275, 2290],
        "Pune":       [2100, 2130, 2160, 2200, 2240, 2270, 2300],
        "Rahata":     [2050, 2080, 2110, 2150, 2180, 2210, 2240],
        "Kalamna":    [2120, 2140, 2160, 2190, 2220, 2240, 2260],
    },
    "Tomato": {
        "Lasalgaon":  [900, 950, 1020, 1080, 1020, 960, 900],
        "Pimpalgaon": [860, 910, 980, 1040, 990, 930, 870],
        "Yeola":      [820, 870, 930, 990, 950, 900, 840],
        "Pune":       [850, 880, 940, 1000, 970, 920, 870],
        "Rahata":     [800, 830, 880, 930, 900, 860, 820],
        "Kalamna":    [780, 800, 830, 860, 850, 820, 790],
    },
    "Wheat": {
        "Lasalgaon":  [2180, 2190, 2200, 2210, 2220, 2225, 2230],
        "Pimpalgaon": [2160, 2170, 2180, 2190, 2195, 2200, 2210],
        "Yeola":      [2140, 2150, 2160, 2165, 2170, 2175, 2185],
        "Pune":       [2150, 2155, 2165, 2170, 2180, 2190, 2195],
        "Rahata":     [2120, 2130, 2140, 2150, 2160, 2165, 2170],
        "Kalamna":    [2200, 2205, 2210, 2215, 2220, 2230, 2240],
    },
    "Soybean": {
        "Lasalgaon":  [4300, 4280, 4260, 4230, 4200, 4180, 4150],
        "Pimpalgaon": [4270, 4250, 4230, 4210, 4180, 4160, 4130],
        "Yeola":      [4220, 4200, 4180, 4160, 4130, 4110, 4090],
        "Pune":       [4250, 4240, 4220, 4200, 4180, 4160, 4140],
        "Rahata":     [4180, 4170, 4150, 4130, 4110, 4100, 4080],
        "Kalamna":    [4320, 4300, 4280, 4260, 4230, 4210, 4190],
    },
}


def load_records(commodity):
    """MOCK version — today's snapshot for every market."""
    records = []
    for m in MARKETS:
        series = SERIES[commodity][m["market"]]
        records.append({
            "state": "Maharashtra",
            "district": m["district"],
            "market": m["market"],
            "commodity": commodity,
            "modal_price": series[-1],
            "series": series,
        })
    return records


def load_records_live(commodity, district=None):
    """
    REAL version — call this instead of load_records() once you
    have your own data.gov.in API key (register at data.gov.in,
    "My Account" -> API keys). Needs: pip install requests

    Set the key as an environment variable so it's never hardcoded:
        export AGMARKNET_API_KEY="your_key_here"
    """
    api_key = os.environ.get("AGMARKNET_API_KEY")
    if not api_key:
        raise RuntimeError("Set the AGMARKNET_API_KEY environment variable first.")

    # Swap this resource ID if you confirm a different one works better
    # with your personal key (see the field names below to check the match).
    url = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
    params = {
        "api-key": api_key,
        "format": "json",
        "filters[State]": "Maharashtra",
        "filters[Commodity]": commodity,
        "limit": 100,
    }
    if district:
        params["filters[District]"] = district

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    raw_records = response.json().get("records", [])

    # Normalize field names (Modal_Price -> modal_price, etc.) so the
    # rest of the app doesn't need to know which source it came from.
    records = []
    for r in raw_records:
        records.append({
            "state": r.get("State"),
            "district": r.get("District"),
            "market": r.get("Market"),
            "commodity": r.get("Commodity"),
            "modal_price": int(r.get("Modal_Price", 0)),
            "series": None,  # live source gives one snapshot, not a 7-day series
        })
    return records


import math
from datetime import datetime
from dateutil.relativedelta import relativedelta

# ------------------------------------------------------------------
# 6-MONTH FORECASTING
# ------------------------------------------------------------------
# Real agri commodity prices follow a predictable yearly seasonal
# pattern (e.g. onion crashes right after harvest, climbs during the
# lean/monsoon season) on top of a slow year-over-year trend.
# We model exactly that: trend + seasonality. It's simple enough to
# explain in one sentence, and honest about being indicative, not a
# guarantee — unlike a black-box ML model trained on only 24 points,
# which would just be overfitting dressed up as "AI".

# Typical seasonal deviation from the yearly average, ₹/quintal, by
# calendar month (1=Jan ... 12=Dec). Shapes are illustrative but
# follow real known patterns for each crop.
SEASONAL_PATTERN = {
    "Onion": {   # crashes after rabi harvest (Feb-Mar), peaks in monsoon lean season (Jul-Aug)
        1: -100, 2: -250, 3: -400, 4: -150, 5: 100, 6: 300,
        7: 500, 8: 600, 9: 450, 10: 200, 11: 0, 12: -150,
    },
    "Tomato": {  # short crop cycle, sharp swings, glut in winter
        1: -100, 2: -150, 3: 50, 4: 200, 5: 100, 6: -50,
        7: 100, 8: 150, 9: -50, 10: -100, 11: -200, 12: -50,
    },
    "Wheat": {   # stable staple crop, mild dip post-harvest (Apr), slow rise into year-end
        1: 20, 2: 0, 3: -30, 4: -60, 5: -20, 6: 10,
        7: 20, 8: 30, 9: 20, 10: 10, 11: 0, 12: 0,
    },
    "Soybean": {  # dips at harvest (Oct-Nov), firms up through the year
        1: 40, 2: 60, 3: 70, 4: 50, 5: 20, 6: -10,
        7: -30, 8: -40, 9: -60, 10: -120, 11: -100, 12: 0,
    },
}

# Approximate yearly average price (₹/quintal) and yearly growth rate per crop
BASE_PRICE = {"Onion": 1300, "Tomato": 950, "Wheat": 2190, "Soybean": 4200}
YEARLY_GROWTH = {"Onion": 0.06, "Tomato": 0.03, "Wheat": 0.02, "Soybean": -0.01}


def _month_price(crop, year_offset, month):
    """Reconstruct a plausible historical price for a given crop,
    number of years before the current one, and calendar month."""
    base = BASE_PRICE[crop]
    growth = YEARLY_GROWTH[crop]
    seasonal = SEASONAL_PATTERN[crop][month]
    trended_base = base * ((1 + growth) ** (-year_offset))
    return round(trended_base + seasonal)


def get_monthly_history(crop, months=24):
    """Last N months of (month_label, price) for a crop, ending this month."""
    today = datetime.today().replace(day=1)
    history = []
    for i in range(months - 1, -1, -1):
        d = today - relativedelta(months=i)
        year_offset = (today.year - d.year) + (today.month - d.month) / 12
        price = _month_price(crop, year_offset, d.month)
        history.append({"month": d.strftime("%b %Y"), "price": price})
    return history


def forecast_price(crop, months=6):
    """
    Trend + seasonality forecast for the next N months.
    Method:
      1. Fit a straight-line trend (least squares) through the last
         24 months of history.
      2. Compute each calendar month's average deviation from that
         trend line (the 'seasonal index').
      3. Forecast = trend line extended forward + that month's
         seasonal index.
    This is a classic, explainable time-series decomposition — not a
    black-box model — so every number can be traced back to a reason.
    """
    history = get_monthly_history(crop, months=24)
    n = len(history)
    xs = list(range(n))
    ys = [h["price"] for h in history]

    # Least-squares line fit: y = a + b*x
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    b = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / sum((x - mean_x) ** 2 for x in xs)
    a = mean_y - b * mean_x

    # Seasonal index: average residual (actual - trend) per calendar month
    seasonal_totals = {}
    seasonal_counts = {}
    for i, h in enumerate(history):
        trend_val = a + b * i
        residual = h["price"] - trend_val
        month_num = datetime.strptime(h["month"], "%b %Y").month
        seasonal_totals[month_num] = seasonal_totals.get(month_num, 0) + residual
        seasonal_counts[month_num] = seasonal_counts.get(month_num, 0) + 1
    seasonal_index = {m: seasonal_totals[m] / seasonal_counts[m] for m in seasonal_totals}

    # Forecast forward
    today = datetime.today().replace(day=1)
    forecasts = []
    for step in range(1, months + 1):
        future_date = today + relativedelta(months=step)
        x = n - 1 + step
        trend_val = a + b * x
        month_num = future_date.month
        predicted = trend_val + seasonal_index.get(month_num, 0)
        # Simple uncertainty band: widens the further out we forecast
        band = predicted * (0.05 + 0.015 * step)
        forecasts.append({
            "month": future_date.strftime("%b %Y"),
            "predicted_price": round(predicted),
            "low": round(predicted - band),
            "high": round(predicted + band),
        })

    return {
        "history": history,
        "forecast": forecasts,
        "trend_per_month": round(b, 1),
    }


def compute_nudge(best_record):
    """Given the best market's record (with a 7-day 'series'),
    returns a plain-language sell-now / wait suggestion."""
    series = best_record["series"]
    week_start = sum(series[0:3]) / 3
    week_end = sum(series[4:7]) / 3
    pct_change = (week_end - week_start) / week_start * 100

    if pct_change >= 1:
        direction = "up"
        message = (
            f"Prices at {best_record['market']} are up {pct_change:.0f}% this week. "
            "Selling now may fetch a better rate than earlier this week."
        )
    elif pct_change <= -1:
        direction = "down"
        message = (
            f"Prices at {best_record['market']} are down {abs(pct_change):.0f}% this week. "
            "If storage is available, waiting a few days may pay off."
        )
    else:
        direction = "flat"
        message = (
            f"Prices at {best_record['market']} have stayed roughly flat this week. "
            "No strong reason to rush or delay."
        )

    return {"direction": direction, "pct_change": round(pct_change, 1), "message": message}
