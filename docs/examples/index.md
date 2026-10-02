# Working examples

All maintained plugins live in one `examples/` source tree. Every one has a
manifest, implementation, README, tests and support in the existing builder.
The catalogue is generated from their actual packages, not this table.

| Source | Scale / useful behavior | Tests |
| --- | --- | --- |
| [UI/API](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/ui-api) | Small reference: declarative page, setting, library action | examples, smoke, packaged worker, reference lifecycle |
| [Playtime Report](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/playtime-report) | Small demo: calculate/store user report | real plugins, smoke, package, reference lifecycle |
| [Recently Played Notifier](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/recently-played-notifier) | Small demo: library + notification | real plugins, smoke, reference lifecycle |
| [Metadata Curator](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/metadata-curator) | Small demo: setting + search + normalized state | real plugins, smoke, reference lifecycle |
| [Discord Delivery Provider](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/discord-delivery-provider) | Reference: core-coordinated delivery + write-only secret | domain plugins, smoke, package |
| [UI Playground](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/ui-playground) | Demo: iframe Vue pages/bridge; pinned CDN teaching limitation | examples, smoke, no secret echo |
| [Help Button](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/help-button) | Showcase: contributions, dialogs, overlays and native cleanup | help, native frontend, canonical packages |
| [Jellyfin Media Sync](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/jellyfin-media-sync) | Master server, approved user mapping, native episode completion and Watch Now | Jellyfin, native frontend, full host lifecycle/browser |
| [Scoped Document Viewer](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/scoped-document-viewer) | Feature demo: scoped sandboxed content reader | domain, document package, real browser, parity |
| [Session Manager](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/tree/main/examples/self-service-session-manager) | Privileged feature demo: own/admin session Settings/maps | session, routes, native UI, package |

Use the smallest example that teaches your requirement. Every real demo's README
describes configuration, grants and current host limitations. Screenshots for
document/native components are collected in [assets](../assets/screenshots/index.md);
browser-enabled host acceptance produces authenticated Plugin Manager evidence.

Old lifecycle/events/advanced source stubs are retired. Their original `.utp`
files and generated release histories remain immutable and downloadable. See
the [audit](../history/ecosystem-audit.md), not duplicate legacy source directories.
