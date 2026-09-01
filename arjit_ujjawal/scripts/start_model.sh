#!/usr/bin/env bash
# Start Ollama (if not running), pull the model (if missing), and warm it.
# Usage: scripts/start_model.sh [model-tag]   (default: llama3.1:8b)
# Identical behavior on CUDA and ROCm hosts — Ollama picks the backend itself.
set -eu

MODEL="${1:-llama3.1:8b}"
HOST="${OLLAMA_HOST:-http://localhost:11434}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama not installed. Install from https://ollama.com/download" >&2
  exit 1
fi

if ! curl -s --max-time 3 "$HOST/api/tags" >/dev/null 2>&1; then
  echo "[start_model] starting ollama serve in background..."
  nohup ollama serve >/tmp/ollama_serve.log 2>&1 &
  for _ in $(seq 1 30); do
    sleep 1
    curl -s --max-time 2 "$HOST/api/tags" >/dev/null 2>&1 && break
  done
  curl -s --max-time 2 "$HOST/api/tags" >/dev/null 2>&1 || {
    echo "ERROR: ollama server did not come up; see /tmp/ollama_serve.log" >&2
    exit 1
  }
fi
echo "[start_model] server up at $HOST"

if ! ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$MODEL"; then
  echo "[start_model] pulling $MODEL (several GB, one-time)..."
  ollama pull "$MODEL"
fi

echo "[start_model] warming $MODEL (loads weights into GPU memory)..."
curl -s "$HOST/api/generate" \
  -d "{\"model\":\"$MODEL\",\"prompt\":\"ok\",\"stream\":false,\"options\":{\"num_predict\":1}}" \
  >/dev/null
echo "[start_model] $MODEL ready."
