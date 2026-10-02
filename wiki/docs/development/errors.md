# Error handling and compatibility tests

Gateway closure, denial, timeouts and invalid replies are expected failure modes.
Keep user errors actionable, bounded and free of secrets or raw upstream bodies.

## Bound an action

Validate input before gateway calls. Catch only errors you can explain or recover
from; do not convert every failure to an empty success result. A safe result can
use your action's documented `{ok: false, error: ...}` shape. JSON routes use the
SDK response envelope and appropriate status codes. These are plugin-level
results, not a new gateway protocol.

Jellyfin's `SyncError` strips tokens, server bodies and redirects from errors;
Document Viewer retains distinct missing/unsupported/oversized/changed states;
Session Manager validates identifiers and strict destructive confirmation.
Frontend handlers show loading, empty, denied, timeout and retry states and reject
stale results after navigation.

Test malformed input, denied permissions, partial gateway data, output limits,
restart and rollback compatibility. Document supported host builds and capability
requirements rather than treating all v1 hosts as equivalent. Write migrations
that old code can still read, or explicitly prevent unsafe rollback and explain
recovery; see [updates](../lifecycle/updates.md).
