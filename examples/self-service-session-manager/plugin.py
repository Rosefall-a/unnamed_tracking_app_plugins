from __future__ import annotations

import time
from typing import Any

from sdk.plugin_protocol import request


def list_sessions(values: dict[str, Any]) -> dict[str, Any]:
    """Return only the host's minimized session representation."""
    limit = values.get("limit", 100)
    if not isinstance(limit, int) or isinstance(limit, bool):
        limit = 100
    return request("sessions.list", "sessions.read", {"limit": max(1, min(limit, 200))})


def revoke_session(values: dict[str, Any]) -> dict[str, Any]:
    """Revoke one opaque session ID after the host confirms the action."""
    session_id = values.get("session_id")
    if not isinstance(session_id, str) or not session_id:
        raise ValueError("session_id is required")
    return request(
        "sessions.revoke",
        "sessions.revoke",
        {"session_id": session_id},
    )


def main() -> None:
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
