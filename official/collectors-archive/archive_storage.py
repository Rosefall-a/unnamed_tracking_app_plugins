"""User-owned archive records through public, atomic plugin storage operations."""

from __future__ import annotations

import json
import hashlib
import math
import time
from typing import Any, Callable
from uuid import UUID, uuid4

from sdk.plugin_protocol import request


class ArchiveError(ValueError):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


def identifier(value: Any) -> str:
    try:
        return str(UUID(str(value)))
    except (ValueError, TypeError, AttributeError):
        raise ArchiveError("Choose a valid archive record.") from None


def actor(values: dict) -> str:
    context = values.get("_plugin_context", {})
    if not isinstance(context, dict) or not context.get("user_id"):
        raise ArchiveError("Sign in to access your personal archive.", 401)
    return identifier(context["user_id"])


def prefix(user: str, kind: str) -> str:
    return "users/" + identifier(user) + "/" + kind + "/"


def raw(key: str) -> str | None:
    return request("storage.get", "plugin.storage", {"key": key}).get("value")


def decode(value: str | None, default=None):
    if value is None:
        return default
    try:
        result = json.loads(value)
        if isinstance(result, dict) and "$archive_blob" in result:
            chunks = [raw(key) for key in result["chunks"]]
            if any(chunk is None for chunk in chunks):
                raise ValueError("missing archive chunk")
            encoded = "".join(chunks)
            if hashlib.sha256(encoded.encode()).hexdigest() != result["$archive_blob"]:
                raise ValueError("damaged archive chunk")
            return json.loads(encoded)
        return result
    except (ValueError, TypeError):
        raise ArchiveError("Saved archive data is damaged. Restore its plugin storage backup.", 409) from None


def encode(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))


def swap(key: str, before: str | None, value: Any) -> bool:
    encoded = None if value is None else encode(value)
    if encoded is not None and len(encoded.encode()) > 32_000:
        # Immutable content chunks keep the CAS root small and readers consistent.
        # Artwork chunks are deduplicated across subsequent customization edits.
        user = key.split("/")[1]
        chunks = []
        for start in range(0, len(encoded), 8_000):
            chunk = encoded[start:start + 8_000]
            chunk_key = prefix(user, "blobs") + hashlib.sha256(chunk.encode()).hexdigest()
            request("storage.compare_and_swap", "plugin.storage", {
                "key": chunk_key, "expected": None, "value": chunk,
            })
            chunks.append(chunk_key)
        encoded = encode({"$archive_blob": hashlib.sha256(encoded.encode()).hexdigest(), "chunks": chunks})
    return request("storage.compare_and_swap", "plugin.storage", {
        "key": key, "expected": before, "value": encoded,
    })["swapped"]


def mutate(key: str, change: Callable[[Any], Any], *, default=None):
    for _ in range(40):
        before = raw(key)
        value = change(decode(before, default))
        if swap(key, before, value):
            return value
    raise ArchiveError("Another update is still in progress. Please retry.", 409)


def get(user: str, kind: str, value: Any) -> dict:
    saved = decode(raw(prefix(user, kind) + identifier(value)))
    if not isinstance(saved, dict) or saved.get("deleted"):
        raise ArchiveError("Archive record not found.", 404)
    return saved


def records(user: str, kind: str) -> list[dict]:
    selected = prefix(user, kind)
    keys = request("storage.keys", "plugin.storage", {"prefix": selected}).get("keys", [])
    result = []
    for key in keys:
        if not key.startswith(selected):
            raise ArchiveError("Storage returned an invalid archive namespace.", 409)
        value = decode(raw(key))
        if isinstance(value, dict) and not value.get("deleted"):
            result.append(value)
    return result


def create(user: str, kind: str, fields: dict, *, record_id: str | None = None) -> dict:
    record = {**fields, "id": record_id or str(uuid4()), "created_at": fields.get("created_at", int(time.time()))}
    key = prefix(user, kind) + identifier(record["id"])
    if not swap(key, None, record):
        raise ArchiveError("This archive record already exists.", 409)
    return record


def update(user: str, kind: str, value: Any, change: Callable[[dict], dict]) -> dict:
    key = prefix(user, kind) + identifier(value)
    def owned(saved):
        if not isinstance(saved, dict) or saved.get("deleted"):
            raise ArchiveError("Archive record not found.", 404)
        return change(saved)
    return mutate(key, owned)


def remove(user: str, kind: str, value: Any) -> None:
    update(user, kind, value, lambda saved: {**saved, "deleted": True})


def number(value: Any, field: str, *, minimum: float = 0) -> float:
    try:
        parsed = float(value)
    except (ValueError, TypeError):
        raise ArchiveError(f"{field} must be a number.") from None
    if not math.isfinite(parsed) or parsed < minimum:
        raise ArchiveError(f"{field} must be at least {minimum:g}.")
    return parsed


def title(value: Any, *, field: str = "Title", maximum: int = 512) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ArchiveError(f"{field} is required.")
    if len(value.strip()) > maximum:
        raise ArchiveError(f"{field} must be at most {maximum} characters.")
    return value.strip()


def choice(value: Any, allowed: tuple[str, ...], field: str) -> str:
    if value not in allowed:
        raise ArchiveError(f"Choose a valid {field}.")
    return value


def game(value: Any) -> tuple[dict, list[dict]]:
    game_id = identifier(value)
    achievements = []
    offset = 0
    while True:
        page = request("games.get", "games.read", {"game_id": game_id, "offset": offset, "limit": 200})
        achievements.extend(page["achievements"])
        if page["complete"]:
            return page["game"], achievements
        offset = page["next_offset"]


def games() -> list[dict]:
    result, offset = [], 0
    while True:
        page = request("games.details.list", "games.read", {"offset": offset, "limit": 50})
        result.extend(page["games"])
        if page["complete"]:
            return result
        offset = page["next_offset"]


def media(game_id: Any) -> list[dict]:
    result, offset = [], 0
    while True:
        page = request("games.media.list", "media.read", {"game_id": identifier(game_id), "offset": offset, "limit": 100})
        result.extend(page["media"])
        if page["complete"]:
            return result
        offset = page["next_offset"]
