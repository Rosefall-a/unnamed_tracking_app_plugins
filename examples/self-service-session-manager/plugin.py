from __future__ import annotations

import time
from typing import Any

from sdk.plugin_protocol import request, route_query_value, route_response


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
    return request(
        "sessions.admin.list", "sessions.admin.read", {"limit": max(1, min(limit, 200))}
    )


def revoke_admin_session(values: dict[str, Any]) -> dict[str, Any]:
    session_id = values.get("session_id")
    if not isinstance(session_id, str) or not session_id:
        raise ValueError("session_id is required")
    return request(
        "sessions.admin.revoke", "sessions.admin.revoke", {"session_id": session_id}
    )


def revoke_all_admin_sessions(values: dict[str, Any]) -> dict[str, Any]:
    del values
    return request("sessions.admin.revoke_all", "sessions.admin.revoke", {})


def _route_limit(route_request: dict[str, Any]) -> int | None:
    raw_limit = route_query_value(route_request, "limit")
    if raw_limit is None:
        return 200
    try:
        return int(raw_limit)
    except ValueError:
        return None


def list_sessions_route(route_request: dict[str, Any]) -> dict[str, Any]:
    limit = _route_limit(route_request)
    if limit is None:
        return route_response({"error": "limit must be an integer"}, 422)
    return route_response(list_sessions({"limit": limit}))


def revoke_session_route(route_request: dict[str, Any]) -> dict[str, Any]:
    parameters = route_request.get("path_parameters")
    session_id = parameters.get("session_id") if isinstance(parameters, dict) else None
    if not isinstance(session_id, str) or not session_id:
        return route_response({"error": "session_id is required"}, 422)
    return route_response(revoke_session({"session_id": session_id}))


def list_admin_sessions_route(route_request: dict[str, Any]) -> dict[str, Any]:
    limit = _route_limit(route_request)
    if limit is None:
        return route_response({"error": "limit must be an integer"}, 422)
    return route_response(list_admin_sessions({"limit": limit}))


def revoke_admin_session_route(route_request: dict[str, Any]) -> dict[str, Any]:
    parameters = route_request.get("path_parameters")
    session_id = parameters.get("session_id") if isinstance(parameters, dict) else None
    if not isinstance(session_id, str) or not session_id:
        return route_response({"error": "session_id is required"}, 422)
    return route_response(revoke_admin_session({"session_id": session_id}))


def revoke_all_admin_sessions_route(route_request: dict[str, Any]) -> dict[str, Any]:
    del route_request
    return route_response(revoke_all_admin_sessions({}))


def main() -> None:
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
