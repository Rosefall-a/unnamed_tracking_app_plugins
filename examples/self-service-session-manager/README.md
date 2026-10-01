# Self-Service Session Manager

This reference plugin contributes an Account sessions sidebar page. It uses only opaque IDs and the minimized `created_at`, `expires_at`, and `active` fields returned by Plugin API v1.

Permissions requested:

- `sessions.read`: list the signed-in user's minimized session records.
- `sessions.revoke`: revoke only a selected session owned by that same user.
- `sessions.admin.read`: list cross-user session metadata only for a host-authenticated administrator.
- `sessions.admin.revoke`: revoke cross-user sessions only for a host-authenticated administrator.
- `backend.routes.plugin`: expose these operations under `/api/plugins/example.self-service-session-manager/`; administrator route declarations additionally require the host's `admin` authorization policy.

The host performs authentication and capability enforcement before dispatch, applies the current route caller's user scope again at the gateway, and protects administrator handlers before plugin execution. The plugin never receives cookies, tokens, hashes, API keys, or host database objects. Self-service revocation remains ownership-filtered at the backend domain boundary; knowing another session ID is insufficient.

Build all packages with `python tools/build_packages.py`. Local builds are intentionally unsigned and require the host's untrusted-package confirmation; release CI supplies the reviewed signing identity. Requires the host Plugin API v1 domain capabilities and mediated action support introduced by the Phase 2 plugin-manager work.
