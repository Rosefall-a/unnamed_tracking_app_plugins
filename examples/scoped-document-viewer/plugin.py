from __future__ import annotations

import time
from typing import Any

from sdk.plugin_protocol import request, route_query_value, route_response


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


def list_documents_route(route_request: dict[str, Any]) -> dict[str, Any]:
    """Serve the authenticated user's documents through the plugin namespace."""

    raw_limit = route_query_value(route_request, "limit")
    try:
        limit = int(raw_limit) if raw_limit is not None else 100
    except ValueError:
        return route_response({"error": "limit must be an integer"}, 422)
    return route_response(list_documents({"limit": limit}))


def read_document_route(route_request: dict[str, Any]) -> dict[str, Any]:
    """Serve one host-authorized document representation by opaque ID."""

    parameters = route_request.get("path_parameters")
    document_id = (
        parameters.get("document_id") if isinstance(parameters, dict) else None
    )
    if not isinstance(document_id, str) or not document_id:
        return route_response({"error": "document_id is required"}, 422)
    try:
        return route_response(read_document({"document_id": document_id}))
    except ValueError as exc:
        return route_response({"error": str(exc)}, 422)


def main() -> None:
    """Remain available while the host owns all user-triggered actions."""
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
