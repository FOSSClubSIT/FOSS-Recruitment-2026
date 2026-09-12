#!/usr/bin/env bash
# Environment check: OS, Python, GPU stack (ROCm or CUDA), Ollama, model availability.
set -u

MODEL="${1:-llama3.1:8b}"

echo "=== incident-copilot environment check ==="
echo "OS:        $(uname -srmo 2>/dev/null || uname -a)"
echo "Python:    $(python --version 2>&1)"

echo
echo "--- GPU stack ---"
if command -v rocminfo >/dev/null 2>&1; then
  echo "ROCm:      detected"
  rocminfo 2>/dev/null | grep -m2 "Marketing Name" | sed 's/^/           /'
  command -v rocm-smi >/dev/null 2>&1 && rocm-smi --showproductname 2>/dev/null | sed 's/^/           /'
elif command -v nvidia-smi >/dev/null 2>&1; then
  echo "ROCm:      NOT found"
  echo "CUDA GPU:  $(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null)"
else
  echo "ROCm:      NOT found; nvidia-smi: NOT found"
  if command -v powershell >/dev/null 2>&1; then
    powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | ForEach-Object { 'GPU (WMI): ' + \$_.Name }"
  fi
fi

echo
echo "--- Ollama ---"
if command -v ollama >/dev/null 2>&1; then
  echo "Ollama:    $(ollama --version 2>&1 | head -1)"
  if curl -s --max-time 3 "${OLLAMA_HOST:-http://localhost:11434}/api/tags" >/dev/null 2>&1; then
    echo "Server:    running at ${OLLAMA_HOST:-http://localhost:11434}"
    if ollama list 2>/dev/null | grep -q "${MODEL%%:*}"; then
      echo "Model:     $MODEL pulled"
    else
      echo "Model:     $MODEL NOT pulled (run scripts/start_model.sh $MODEL)"
    fi
  else
    echo "Server:    NOT running (run scripts/start_model.sh $MODEL)"
  fi
else
  echo "Ollama:    NOT installed"
fi
