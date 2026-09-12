"""
AI SRE System - Mock Infrastructure Action Execution Engine
Executes automated remediation actions (restarts, rollbacks, scalings, notifications) 
and logs all actions to an immutable audit trail (`tools/audit.log`).

Public Interface:
    def execute_action(action_type: str, params: dict) -> dict

Example Usage:
    from tools.actions import execute_action

    result = execute_action("restart_service", {"service": "payment-api"})
    print(result["status"], result["message"])
"""

import os
import sys
import json
import uuid
import random
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple

# Reconfigure stdout for UTF-8 compatibility on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("tools.actions")

# Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
AUDIT_LOG_PATH = PROJECT_ROOT / "tools" / "audit.log"

# List of supported actions
SUPPORTED_ACTIONS = {
    "restart_service",
    "rollback_deployment",
    "restart_pod",
    "restart_database",
    "scale_deployment",
    "create_ticket",
    "notify_team",
    "generate_postmortem",
}


def _write_audit_log(entry: Dict[str, Any]) -> None:
    """
    Appends an executed action entry to the audit log in JSON Lines (.jsonl) format.
    
    Args:
        entry: Dictionary representing the executed action payload.
    """
    try:
        AUDIT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(AUDIT_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to write entry to audit log at '{AUDIT_LOG_PATH}': {e}")


def _validate_params(action_type: str, params: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates parameter completeness for a given action type.
    
    Args:
        action_type: Name of the action type.
        params: Dictionary of input parameters.

    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    if not isinstance(params, dict):
        return False, "Parameters must be provided as a dictionary."

    if action_type == "restart_service":
        if "service" not in params and "service_name" not in params:
            return False, "Missing required parameter 'service' for restart_service."

    elif action_type == "rollback_deployment":
        if "deployment" not in params and "service" not in params:
            return False, "Missing required parameter 'deployment' or 'service' for rollback_deployment."

    elif action_type == "restart_pod":
        if "pod_name" not in params and "pod" not in params and "service" not in params:
            return False, "Missing required parameter 'pod_name' or 'service' for restart_pod."

    elif action_type == "restart_database":
        if "database" not in params and "cluster" not in params and "service" not in params:
            return False, "Missing required parameter 'database' or 'service' for restart_database."

    elif action_type == "scale_deployment":
        if "deployment" not in params and "service" not in params:
            return False, "Missing required parameter 'deployment' or 'service' for scale_deployment."
        if "replicas" not in params:
            return False, "Missing required parameter 'replicas' for scale_deployment."

    elif action_type == "create_ticket":
        if "title" not in params and "summary" not in params:
            return False, "Missing required parameter 'title' for create_ticket."

    elif action_type == "notify_team":
        if "channel" not in params and "recipient" not in params and "target" not in params:
            return False, "Missing required parameter 'channel' for notify_team."

    elif action_type == "generate_postmortem":
        if "incident_id" not in params and "title" not in params:
            return False, "Missing required parameter 'incident_id' or 'title' for generate_postmortem."

    return True, ""


def execute_action(action_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes a mock infrastructure remediation action, records the output in the audit log,
    and returns a structured execution payload.

    Args:
        action_type: Name of the action to execute (e.g. 'restart_service', 'rollback_deployment').
        params: Key-value parameters passed to the action handler.

    Returns:
        Dictionary containing:
            - action_id (str): Unique UUID v4 for the execution
            - action (str): The requested action type
            - status (str): 'success' or 'failed'
            - message (str): Human-readable status response
            - timestamp (str): ISO-8601 UTC timestamp
            - execution_time_ms (int): Simulated execution duration in milliseconds
            - params (dict): Input parameters passed to the action
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    action_id = str(uuid.uuid4())

    # 1. Check Unsupported Action
    if not isinstance(action_type, str) or action_type not in SUPPORTED_ACTIONS:
        logger.warning(f"Attempted execution of unsupported action: '{action_type}'")
        failure_response = {
            "action_id": action_id,
            "action": str(action_type),
            "status": "failed",
            "message": f"Unsupported action: '{action_type}'",
            "timestamp": timestamp,
            "execution_time_ms": 0,
            "params": params if isinstance(params, dict) else {}
        }
        _write_audit_log(failure_response)
        return failure_response

    # 2. Validate Parameters
    is_valid, validation_msg = _validate_params(action_type, params)
    if not is_valid:
        logger.warning(f"Validation failed for action '{action_type}': {validation_msg}")
        failure_response = {
            "action_id": action_id,
            "action": action_type,
            "status": "failed",
            "message": f"Invalid parameters: {validation_msg}",
            "timestamp": timestamp,
            "execution_time_ms": random.randint(10, 50),
            "params": params
        }
        _write_audit_log(failure_response)
        return failure_response

    # 3. Simulate Execution Latency & Action Response Message
    simulated_time_ms = random.randint(80, 450)
    message = ""

    if action_type == "restart_service":
        target = params.get("service") or params.get("service_name")
        message = f"Service '{target}' restarted successfully across all active worker instances."

    elif action_type == "rollback_deployment":
        target = params.get("deployment") or params.get("service")
        revision = params.get("revision", "previous stable version")
        message = f"Deployment '{target}' successfully rolled back to revision ({revision})."

    elif action_type == "restart_pod":
        pod = params.get("pod_name") or params.get("pod") or params.get("service")
        namespace = params.get("namespace", "production")
        message = f"Pod '{pod}' in namespace '{namespace}' successfully terminated and recreated."

    elif action_type == "restart_database":
        db = params.get("database") or params.get("cluster") or params.get("service")
        message = f"Database cluster '{db}' connection handles reset and proxy pool restarted."

    elif action_type == "scale_deployment":
        target = params.get("deployment") or params.get("service")
        replicas = params.get("replicas")
        message = f"Deployment '{target}' scaled successfully to {replicas} replicas."

    elif action_type == "create_ticket":
        title = params.get("title") or params.get("summary")
        ticket_key = f"SRE-{random.randint(1000, 9999)}"
        message = f"Incident ticket {ticket_key} ('{title}') created in Jira/ServiceNow."

    elif action_type == "notify_team":
        channel = params.get("channel") or params.get("target") or params.get("recipient")
        message = f"Alert notification dispatched successfully to team channel '{channel}'."

    elif action_type == "generate_postmortem":
        inc_id = params.get("incident_id") or params.get("title")
        message = f"Draft post-incident review (PIR) generated for incident {inc_id}."

    # 4. Construct Success Response
    success_response = {
        "action_id": action_id,
        "action": action_type,
        "status": "success",
        "message": message,
        "timestamp": timestamp,
        "execution_time_ms": simulated_time_ms,
        "params": params
    }

    # 5. Write to Audit Trail Log (.jsonl)
    _write_audit_log(success_response)
    logger.info(f"Executed action '{action_type}' [{action_id[:8]}]: {message}")

    return success_response


def run_cli_demo() -> None:
    """
    CLI demonstration of executing each supported mock action.
    """
    print("\n" + "=" * 65)
    print("      AI SRE System - Mock Action Execution Engine CLI Demo")
    print("=" * 65)

    sample_actions = [
        ("restart_service", {"service": "payment-api"}),
        ("rollback_deployment", {"deployment": "auth-service", "revision": "v2.3.9"}),
        ("restart_pod", {"pod_name": "search-indexer-7d8b4c-x92zk", "namespace": "production"}),
        ("restart_database", {"database": "user-profile-pg-cluster"}),
        ("scale_deployment", {"deployment": "checkout-gateway", "replicas": 8}),
        ("create_ticket", {"title": "PostgreSQL Connection Pool Saturation", "severity": "P1"}),
        ("notify_team", {"channel": "#sre-alerts", "message": "P1 incident resolved by automated agent."}),
        ("generate_postmortem", {"incident_id": "INC-2026-003", "title": "DB Pool Exhaustion"}),
        ("unsupported_action_example", {"param": "test"})
    ]

    print(f"\nExecuting {len(sample_actions)} demo actions...\n")

    for idx, (action_type, params) in enumerate(sample_actions, 1):
        res = execute_action(action_type, params)
        status_tag = "[SUCCESS]" if res["status"] == "success" else "[FAILED]"
        print(f"[{idx}] {status_tag} Action: '{res['action']}'")
        print(f"    Status:      {res['status'].upper()}")
        print(f"    Message:     {res['message']}")
        print(f"    Latency:     {res['execution_time_ms']} ms")
        print(f"    Action ID:   {res['action_id']}")
        print(f"    Params:      {res['params']}")
        print("-" * 65)

    print(f"\nAudit trail written to: '{AUDIT_LOG_PATH}'")
    if AUDIT_LOG_PATH.exists():
        with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
            print(f"Total entries in audit.log: {len(lines)}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_cli_demo()
