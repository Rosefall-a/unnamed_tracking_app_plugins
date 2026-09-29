# Unnamed Tracking official plugins

This repository contains official, signed plugins and reference implementations for the Unnamed Tracking App Plugin API v1.

## For users: getting and installing a plugin

1. **Browse the examples below** and choose a plugin that provides the capability you want.
2. **Download the `.utp` package** from the plugin repository's Releases page. Do not download a source `.py` file and rename it.
3. In Unnamed Tracking, open **Settings → Plugins → Install plugin**.
4. Select the downloaded `.utp` file.
5. Review the plugin name, version, requested permissions, dependencies, and publisher before confirming installation.
6. Enable the plugin. The host verifies package integrity and the publisher signature before it can run.
7. If a plugin fails repeatedly, the host can quarantine it. Review its health/error information before recovering or enabling it again.

For development/testing, clone this repository and run `python tools/build_packages.py`. Generated packages are written to `dist/`.

**Security:** only install packages signed by a publisher you trust. Never grant a plugin more access than its documented capabilities require.

## Official examples

| Plugin | What it demonstrates |
| --- | --- |
| `example.lifecycle` | Startup/readiness, settings, and namespaced persistent storage |
| `example.events` | User-scoped event subscriptions and delivery limits |
| `example.ui-api` | Declarative native UI and gateway API requests |
| `example.advanced` | Optional dependencies, scoped identity, and storage |
| `example.notifications` | Capability-scoped notification delivery |
| `example.metadata` | Normalized game-metadata search |
| `example.events-filter` | Explicit event-type/user filtering with a conservative rate limit |

Each example contains its manifest, source, and a short explanation. The plugin source is intentionally independent of the main application's Python modules.

## For developers

A plugin declares its identity, compatibility range, capabilities, permissions, dependencies, UI contributions, storage quota, and package integrity in `manifest.json`. Runtime access goes through the v1 gateway rather than direct database access, host filesystem access, or application internals.

Use the examples as progressively more capable templates:

- Start with **lifecycle** for the minimum plugin shape.
- Use **events-filter** when you need narrowly scoped event delivery.
- Use **notifications** or **metadata** when implementing a provider/integration.
- Use **ui-api** when contributing native UI.
- Use **advanced** when you need dependencies and scoped client identity.

Before publishing, run `pytest` and `python tools/build_packages.py`. CI also verifies package digests and Ed25519 signatures against the repository's trusted example publisher keys.

## Repository layout

- `examples/` — official reference plugins
- `sdk/` — tiny protocol helper used by the examples
- `publishers/` — public keys used to verify signed examples
- `tools/build_packages.py` — reproducible package builder
- `tests/` — manifest/source validation
- `dist/` — generated installable packages (created by the build)
