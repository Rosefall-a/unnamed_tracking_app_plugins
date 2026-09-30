from __future__ import annotations

import time
from typing import Any

from sdk.plugin_protocol import request


def list_documents(values: dict[str, Any]) -> dict[str, Any]:
    """Return minimized document DTOs for the active user."""
    limit = values.get("limit", 100)
    if not isinstance(limit, int) or isinstance(limit, bool):
        limit = 100
    return request(
        "documents.list", "documents.read", {"limit": max(1, min(limit, 200))}
    )


def read_document(values: dict[str, Any]) -> dict[str, Any]:
    """Ask the host for one already-authorized safe representation."""
    document_id = values.get("document_id")
    if not isinstance(document_id, str) or not document_id:
        raise ValueError("document_id is required")
    return request(
        "documents.read",
        "documents.read",
        {"document_id": document_id},
    )


def main() -> None:
    """Remain available while the host owns all user-triggered actions."""
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
