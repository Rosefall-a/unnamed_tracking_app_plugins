# Plugin-owned storage

Use `plugin.storage` and the public `storage.get` / `storage.put` gateway methods
for persistent application state. The manifest quota describes capacity; it
does not grant arbitrary host filesystem access.

## Save a user-scoped result

Playtime Report demonstrates the complete read → calculate → persist workflow:

```python
import json

user = (values.get("_plugin_context") or {}).get("user_id")
if not user:
    raise ValueError("An authenticated action context is required.")
request("storage.put", "plugin.storage", {
    "key": f"users/{user}/latest-report",
    "value": json.dumps({"schema_version": 1, "game_count": 3}),
})
```

The key namespace uses the host-injected identity, not a browser field. Storage
is installation-owned; a global key is not automatically user-private. Use
`storage.get` with the same key, decode its `value`, and handle a missing value
or an unsupported schema explicitly.

Packages contain code/defaults, never live installation data. Restart,
disable/enable, update, rollback and retaining-data reinstall preserve storage.
Confirmed purge and uninstall remove it. [Migration considerations](../lifecycle/updates.md)
explain why rolling code back does not roll saved data back.

Test two user namespaces, malformed JSON, quota errors, old-schema reads and
idempotent migration. The real host acceptance additionally verifies stored
bytes across lifecycle transitions.
