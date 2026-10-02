# Plugin-owned storage

## Goal and prerequisites

Read the last report for the authenticated caller. Use a complete action/page,
declare `plugin.storage` v1 and its permission, and choose a modest quota.

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

## Minimal read action

<!-- recipe: storage -->
```python
import json
from sdk.plugin_protocol import request

def run(values: dict) -> dict:
    user = (values.get("_plugin_context") or {}).get("user_id")
    if not user:
        raise ValueError("An authenticated action context is required.")
    raw = request("storage.get", "plugin.storage", {"key": f"users/{user}/latest-report"}).get("value")
    return {"report": json.loads(raw) if raw is not None else None}
```

Pair this with the write fragment above. Handle unsupported schema versions and
malformed JSON deliberately. Preserve readability by the predecessor for rollback.

## Test command

```sh
python -m pytest tests/test_feature_tutorials.py -k storage
python -m pytest tests/test_help_button.py -k state
```

## Expected result

A stored report is decoded under the host-injected user's key; absent data
returns null. Missing identity fails before requesting storage. Help Button tests
separate user keys; real persistence/deletion is checked by host conformance.

## Common mistakes

Trusting a form user ID; sharing a global key for private data; saving live data
in the package; treating rollback as a data restore; testing uninstall after the
store has already been purged without first saving fresh state.
