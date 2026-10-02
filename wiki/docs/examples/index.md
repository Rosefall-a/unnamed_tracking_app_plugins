# Working examples

All maintained plugins live in one `examples/` source tree. Every one has a
manifest, implementation, README, tests and support in the existing builder.
The catalogue is generated from their actual packages, not this table.

| Source | Scale / useful behavior | Tests |
| --- | --- | --- |
| [Help Button](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/help-button) | Showcase: contributions, dialogs, overlays and native cleanup | help, native frontend, canonical packages |
| [Jellyfin Media Sync](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/jellyfin-media-sync) | Integration: queued sync, token binding, progress, native settings | Jellyfin, native frontend, full host lifecycle/browser |
| [Scoped Document Viewer](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/scoped-document-viewer) | Feature demo: scoped sandboxed content reader | domain, document package, real browser, parity |
| [Session Manager](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/self-service-session-manager) | Privileged feature demo: own/admin session Settings/maps | session, routes, native UI, package |

Use the smallest example that teaches your requirement. Every real demo's README
describes configuration, grants and current host limitations. Screenshots for
document/native components are collected in [assets](../assets/screenshots/index.md);
browser-enabled host acceptance produces authenticated Plugin Manager evidence.

Old lifecycle/events/advanced source stubs are retired. Their original `.utp`
files and generated release histories remain immutable and downloadable. See
the [audit](../history/ecosystem-audit.md), not duplicate legacy source directories.
