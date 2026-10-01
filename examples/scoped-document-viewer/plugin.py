from __future__ import annotations

import time
from typing import Any

from sdk.plugin_protocol import request, route_query_value, route_response


def list_documents(values: dict[str, Any]) -> dict[str, Any]:
    """Return minimized document DTOs for the active user."""
    limit = values.get("limit", 32)
    if not isinstance(limit, int) or isinstance(limit, bool):
        limit = 32
    payload: dict[str, Any] = {"limit": max(1, min(limit, 32))}
    if "offset" in values:
        offset = values["offset"]
        if type(offset) is not int or offset < 0:
            return {
                "error": {
                    "kind": "invalid",
                    "message": "Invalid list offset.",
                    "status_code": 400,
                }
            }
        payload["offset"] = offset
    return request("documents.list", "documents.read", payload)


def read_document(values: dict[str, Any]) -> dict[str, Any]:
    """Ask the host for one already-authorized safe representation."""
    document_id = values.get("document_id")
    if not isinstance(document_id, str) or not document_id:
        raise ValueError("document_id is required")
    payload: dict[str, Any] = {"document_id": document_id, "chunk_bytes": 24 * 1024}
    if any(key in values for key in ("chunk_bytes", "offset", "content_sha256")):
        payload.update(
            {
                key: values[key]
                for key in ("chunk_bytes", "offset", "content_sha256")
                if key in values
            }
        )
    return request("documents.read", "documents.read", payload)


def list_documents_route(route_request: dict[str, Any]) -> dict[str, Any]:
    """Serve the authenticated user's documents through the plugin namespace."""

    raw_limit = route_query_value(route_request, "limit")
    try:
        limit = int(raw_limit) if raw_limit is not None else 32
        offset = int(route_query_value(route_request, "offset") or "0")
    except ValueError:
        return route_response({"error": "limit and offset must be integers"}, 422)
    result = list_documents({"limit": limit, "offset": offset})
    return route_response(result, result.get("error", {}).get("status_code", 200))


def read_document_route(route_request: dict[str, Any]) -> dict[str, Any]:
    """Serve one host-authorized document representation by opaque ID."""

    parameters = route_request.get("path_parameters")
    document_id = (
        parameters.get("document_id") if isinstance(parameters, dict) else None
    )
    if not isinstance(document_id, str) or not document_id:
        return route_response({"error": "document_id is required"}, 422)
    try:
        values = {"document_id": document_id, "chunk_bytes": 24 * 1024}
        raw_offset = route_query_value(route_request, "offset")
        if raw_offset is not None:
            values["offset"] = int(raw_offset)
        digest = route_query_value(route_request, "content_sha256")
        if digest is not None:
            values["content_sha256"] = digest
        result = read_document(values)
        return route_response(result, result.get("error", {}).get("status_code", 200))
    except ValueError as exc:
        return route_response({"error": str(exc)}, 422)


def main() -> None:
    """Remain available while the host owns all user-triggered actions."""
    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
