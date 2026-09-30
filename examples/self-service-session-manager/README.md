# Self-Service Session Manager

This reference plugin contributes an Account sessions sidebar page. It uses only opaque IDs and the minimized `created_at`, `expires_at`, and `active` fields returned by Plugin API v1.

Permissions requested:

- `sessions.read`: list the signed-in user's minimized session records.
- `sessions.revoke`: revoke only a selected session owned by that same user.

The host performs the destructive confirmation before dispatching `revoke-session`, applies the authenticated user scope again at the gateway, and returns an audit request ID. The plugin never receives cookies, tokens, hashes, API keys, IP addresses, user agents, or another user's records.

Build all packages with `python tools/build_packages.py`. Local builds are intentionally unsigned and require the host's untrusted-package confirmation; release CI supplies the reviewed signing identity. Requires the host Plugin API v1 domain capabilities and mediated action support introduced by the Phase 2 plugin-manager work.
