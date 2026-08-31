import os
import streamlit as st
import requests

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")

st.set_page_config(
    page_title="House Price Prediction", page_icon="🏠", layout="centered"
)

st.title("🏠 House Price Prediction")
st.markdown("Enter the house details below to get an estimated price.")

col1, col2 = st.columns(2)

with col1:
    area = st.number_input("Area (sq ft)", min_value=1, value=2000, step=10)
    bedrooms = st.number_input("Bedrooms", min_value=0, value=3, step=1)
    bathrooms = st.number_input("Bathrooms", min_value=0, value=2, step=1)
    stories = st.number_input("Stories", min_value=0, value=2, step=1)
    mainroad = st.selectbox("Main Road Access", options=["no", "yes"], index=0)
    guestroom = st.selectbox("Guest Room", options=["no", "yes"], index=0)
    basement = st.selectbox("Basement", options=["no", "yes"], index=0)

with col2:
    hotwaterheating = st.selectbox("Hot Water Heating", options=["no", "yes"], index=0)
    airconditioning = st.selectbox("Air Conditioning", options=["no", "yes"], index=0)
    parking = st.number_input("Parking Spaces", min_value=0, value=2, step=1)
    prefarea = st.selectbox("Preferred Area", options=["no", "yes"], index=0)
    furnishingstatus = st.selectbox(
        "Furnishing Status",
        options=["unfurnished", "semi-furnished", "furnished"],
        index=0,
    )

payload = {
    "area": area,
    "bedrooms": bedrooms,
    "bathrooms": bathrooms,
    "stories": stories,
    "mainroad": mainroad,
    "guestroom": guestroom,
    "basement": basement,
    "hotwaterheating": hotwaterheating,
    "airconditioning": airconditioning,
    "parking": parking,
    "prefarea": prefarea,
    "furnishingstatus": furnishingstatus,
}

if st.button("Predict Price"):
    try:
        response = requests.post(f"{API_URL}/predict", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            predicted_price = result.get("predicted_price")
            conf_lower = result.get("confidence_lower")
            conf_upper = result.get("confidence_upper")
            conf_score = result.get("confidence_score")

            st.success(f"Estimated House Price: **${predicted_price:,.2f}**")
            st.markdown(
                f"**95% Confidence Interval:** ${conf_lower:,.2f} – ${conf_upper:,.2f}"
            )
            st.markdown(f"**Confidence Score:** {conf_score}%")
        else:
            st.error(f"API returned error {response.status_code}: {response.text}")
    except requests.exceptions.ConnectionError:
        st.error(
            f"Could not connect to the API at {API_URL}. Make sure the FastAPI server is running."
        )
    except Exception as e:
        st.error(f"An unexpected error occurred: {e}")

with st.expander("Show request payload"):
    st.json(payload)

st.markdown("---")
st.caption(f"FastAPI backend should be running at {API_URL}")
