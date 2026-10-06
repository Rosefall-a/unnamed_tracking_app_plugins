"""Bounded, personal action transfers for full-size card artwork."""

import json
import time
from uuid import uuid4

import archive_storage as store

CHUNK_CHARACTERS = 8_000
MAX_CHUNKS = 8_192


def key(user, token, suffix):
    return store.prefix(user, "transfers") + store.identifier(token) + "/" + suffix


def write(values):
    user = store.actor(values)
    token, index, count = store.identifier(values.get("token")), int(values.get("index", -1)), int(values.get("count", 0))
    content = values.get("content")
    if not 0 <= index < count <= MAX_CHUNKS or not isinstance(content, str) or len(content) > CHUNK_CHARACTERS:
        raise store.ArchiveError("Invalid archive transfer chunk.")
    metadata = {"count": count, "created_at": int(time.time()), "direction": "in"}
    saved_key = key(user, token, "metadata")
    store.swap(saved_key, None, metadata)
    saved = store.decode(store.raw(saved_key))
    if saved["count"] != count or saved["direction"] != "in" or time.time() - saved["created_at"] > 300:
        raise store.ArchiveError("Archive transfer expired. Retry saving.", 409)
    chunk_key = key(user, token, str(index))
    before = store.raw(chunk_key)
    if before not in (None, content):
        raise store.ArchiveError("Archive transfer chunk changed. Retry saving.", 409)
    store.request("storage.compare_and_swap", "plugin.storage", {"key": chunk_key, "expected": None, "value": content})
    return {"ok": True}


def incoming(values):
    if not values.get("request_id"):
        return values
    user, token = store.actor(values), store.identifier(values["request_id"])
    metadata = store.decode(store.raw(key(user, token, "metadata")))
    if not metadata or metadata["direction"] != "in" or time.time() - metadata["created_at"] > 300:
        raise store.ArchiveError("Archive transfer expired. Retry saving.", 409)
    chunks = [store.raw(key(user, token, str(index))) for index in range(metadata["count"])]
    if any(chunk is None for chunk in chunks):
        raise store.ArchiveError("Archive transfer incomplete. Retry saving.", 409)
    result = json.loads("".join(chunks))
    if not isinstance(result, dict):
        raise store.ArchiveError("Invalid archive operation.")
    # Request bodies cannot replace the host's authenticated action context.
    result["_plugin_context"] = values["_plugin_context"]
    return result


def outgoing(values, result):
    # ASCII JSON bounds every chunk even when the runtime escapes Unicode.
    encoded = json.dumps(result, ensure_ascii=True, allow_nan=False, separators=(",", ":"))
    if len(encoded.encode()) <= 32_000:
        return result
    user, token = store.actor(values), str(uuid4())
    chunks = [encoded[index:index + CHUNK_CHARACTERS] for index in range(0, len(encoded), CHUNK_CHARACTERS)]
    store.swap(key(user, token, "metadata"), None, {"count": len(chunks), "created_at": int(time.time()), "direction": "out"})
    for index, chunk in enumerate(chunks):
        store.request("storage.compare_and_swap", "plugin.storage", {"key": key(user, token, str(index)), "expected": None, "value": chunk})
    return {"transfer": {"token": token, "count": len(chunks)}}


def read(values):
    user, token = store.actor(values), store.identifier(values.get("token"))
    metadata = store.decode(store.raw(key(user, token, "metadata")))
    index = int(values.get("index", -1))
    if not metadata or metadata["direction"] != "out" or not 0 <= index < metadata["count"] or time.time() - metadata["created_at"] > 300:
        raise store.ArchiveError("Archive transfer expired. Reload this page.", 404)
    content = store.raw(key(user, token, str(index)))
    if content is None:
        raise store.ArchiveError("Archive transfer incomplete. Reload this page.", 409)
    return {"content": content}


def drop(values):
    user, token = store.actor(values), store.identifier(values.get("token"))
    selected = key(user, token, "")
    for saved_key in store.request("storage.keys", "plugin.storage", {"prefix": selected}).get("keys", []):
        store.request("storage.delete", "plugin.storage", {"key": saved_key})
    return {"ok": True}
