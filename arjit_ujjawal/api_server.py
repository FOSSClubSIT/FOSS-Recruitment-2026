"""
AI SRE System - Python FastAPI Backend Server
Exposes live RAG search, action execution, event timeline, and pipeline orchestration
for the React/Vite SRE Console Frontend.

Launch Command:
    python api_server.py
"""

import sys
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import interfaces
from rag.retrieve import retrieve
from tools.actions import execute_action, AUDIT_LOG_PATH
from tools.event_bus import emit_event, get_events, clear_events, EVENTS_FILE_PATH

app = FastAPI(title="AI SRE Agentic Backend API", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Request Schemas
# -----------------------------------------------------------------------------
class RetrieveRequest(BaseModel):
    query: str
    k: Optional[int] = 5

class ActionRequest(BaseModel):
    action_type: str
    params: Dict[str, Any]

class EventRequest(BaseModel):
    type: str
    payload: Dict[str, Any]

class PipelineRequest(BaseModel):
    service: Optional[str] = "payment-api"
    severity: Optional[str] = "P1"
    symptom: Optional[str] = "HTTP 504 Gateway Timeout spike on /v1/checkout"


# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "system": "AI SRE Backend",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.post("/api/rag/retrieve")
def api_retrieve(req: RetrieveRequest):
    try:
        results = retrieve(req.query, k=req.k)
        return {"query": req.query, "count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/action")
def api_action(req: ActionRequest):
    try:
        result = execute_action(req.action_type, req.params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/events/emit")
def api_emit_event(req: EventRequest):
    try:
        emit_event({"type": req.type, "payload": req.payload})
        return {"status": "success", "message": "Event emitted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/events/list")
def api_list_events():
    return {"count": len(get_events()), "events": get_events()}

@app.post("/api/events/clear")
def api_clear_events():
    clear_events()
    return {"status": "success", "message": "Events timeline cleared"}

@app.get("/api/logs/audit")
def api_audit_logs():
    if not AUDIT_LOG_PATH.exists():
        return {"count": 0, "logs": []}
    with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
        logs = [json.loads(line) for line in f.readlines()]
    return {"count": len(logs), "logs": logs}

@app.post("/api/pipeline/run")
def api_run_pipeline(req: PipelineRequest):
    start_time = time.time()
    clear_events()

    # 1. Incident Detected
    emit_event({
        "type": "incident_detected",
        "payload": {
            "service": req.service,
            "severity": req.severity,
            "symptom": req.symptom
        }
    })

    # 2. Diagnosis & RAG Memory Query
    emit_event({"type": "diagnosis_started", "payload": {"service": req.service, "query": req.symptom}})
    
    t0 = time.time()
    docs = retrieve(req.symptom, k=3)
    retrieval_ms = round((time.time() - t0) * 1000, 2)

    top_id = docs[0]["id"] if docs else "N/A"
    top_title = docs[0]["title"] if docs else "N/A"

    emit_event({
        "type": "memory_retrieved",
        "payload": {
            "matched_id": top_id,
            "matched_title": top_title,
            "retrieval_latency_ms": retrieval_ms,
            "docs_count": len(docs)
        }
    })

    # 3. Action Execution
    action_type = "restart_service"
    if "database" in req.symptom.lower() or "postgres" in req.symptom.lower():
        action_type = "restart_database"
    elif "coredns" in req.symptom.lower() or "dns" in req.symptom.lower():
        action_type = "scale_deployment"

    act_res = execute_action(action_type, {"service": req.service, "replicas": 8 if action_type == "scale_deployment" else None})
    emit_event({"type": "action_executed", "payload": act_res})

    # 4. Resolve
    total_sec = round(time.time() - start_time, 3)
    emit_event({
        "type": "incident_resolved",
        "payload": {
            "service": req.service,
            "status": "Healthy (p99 latency target restored)",
            "total_duration_sec": total_sec
        }
    })

    return {
        "status": "success",
        "service": req.service,
        "total_duration_sec": total_sec,
        "retrieved_docs": docs,
        "action_result": act_res,
        "events": get_events()
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
