from __future__ import annotations
import time
from typing import Any
from sdk.plugin_protocol import request

def list_sessions(values: dict[str, Any]) -> dict[str, Any]:
    limit = values.get("limit", 200)
    if not isinstance(limit, int) or isinstance(limit, bool):
        limit = 200
    return request("sessions.list", "sessions.read", {"limit": max(1, min(limit, 200))})

def revoke_session(values: dict[str, Any]) -> dict[str, Any]:
    session_id = values.get("session_id")
    if not isinstance(session_id, str) or not session_id:
        raise ValueError("session_id is required")
    return request("sessions.revoke", "sessions.revoke", {"session_id": session_id})

def list_admin_sessions(values: dict[str, Any]) -> dict[str, Any]:
    limit = values.get("limit", 200)
    if not isinstance(limit, int) or isinstance(limit, bool):
        limit = 200
    return request("sessions.admin.list", "sessions.admin.read", {"limit": max(1, min(limit, 200))})

def revoke_admin_session(values: dict[str, Any]) -> dict[str, Any]:
    session_id = values.get("session_id")
    if not isinstance(session_id, str) or not session_id:
        raise ValueError("session_id is required")
    return request("sessions.admin.revoke", "sessions.admin.revoke", {"session_id": session_id})

def revoke_all_admin_sessions(values: dict[str, Any]) -> dict[str, Any]:
    del values
    return request("sessions.admin.revoke_all", "sessions.admin.revoke", {})

def main() -> None:
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
