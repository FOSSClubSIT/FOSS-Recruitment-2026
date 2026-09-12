#!/bin/sh

uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
streamlit run frontend/app_fixed.py \
    --server.address 0.0.0.0 \
    --server.port 8501

wait