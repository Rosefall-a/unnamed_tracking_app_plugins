# SDK and gateway calls

The bundled `sdk.plugin_protocol.request` helper writes newline-delimited JSON
to stdout and reads one response from stdin. Each request has `api_version: v1`,
`method`, `capability` and object `payload`. Errors raise `GatewayRequestError`,
a `RuntimeError` subclass that retains the existing message and exposes the
optional public `code` from `error_detail`. Older string-only responses have
`code=None`; existing `except RuntimeError` callers continue to work.

Retry `unavailable` only when the operation is safe to repeat. For example, the
Discord provider's idempotent startup registration waits for the app callback
with bounded backoff. It does not retry `forbidden`, invalid requests or other
permanent errors, and the wait never delivers a notification. Do not blindly
retry library edits, revocations or other actions with side effects.

```python
from sdk.plugin_protocol import request

def refresh(values: dict) -> dict:
    del values
    result = request("games.list", "games.read", {"limit": 50})
    return {"games": result.get("games", result.get("items", []))}
```

## Add a gateway operation

1. Start with a documented operation demonstrated by an existing plugin.
2. Declare its capability and permission at the exact supported version.
3. Validate caller input before requesting work; set bounded limits.
4. Normalize only the fields your logic needs. Keep host data DTOs separate from
   your stored format.
5. Test a successful reply, missing/invalid fields, gateway closure and denial.

The host injects `_plugin_context` into actions; never accept browser-supplied user
or installation identity as authority. SDK requests do not bypass live grants.
`lifecycle.ready` is runtime-local and is not a manifest capability to invent.
The entrypoint stays alive; user-triggered behavior belongs in handlers.

`route_response` and `route_query_value` support the existing JSON route envelope;
see [routes](routes.md). Plugins import the SDK and standard library, never
`src.database`, `src.features` or host test fixtures. A missing public operation
must be solved at the host API boundary, not by copying its implementation here.
