# Unnamed Tracking plugins

Official reference plugins, useful demos and developer tooling for **Plugin API v1**.
Build and publish independently using the same SDK, `.utp` format, signing model
and catalogue specification as the official repository.

**The host owns runtime, lifecycle, gateway and permissions; plugins provide
application behavior.** Plugin code uses the public gateway, never application
database models or private host modules.

## Install a plugin

Download the versioned `.utp` linked by [the generated catalogue](list.json) or
[GitHub Releases](https://github.com/Rosefall-a/unnamed_tracking_app_plugins/releases).
A `.utp` is a validated ZIP containing a manifest and payload, not a renamed Python file.
In Unnamed Tracking open **Settings → Plugins → Install plugin**, select the
package/source, review identity, publisher/signature, compatibility and permissions,
then complete approval/configuration and enable it as required by the host flow.

Maintained user-facing functionality lives in [official/](official/README.md).
The [PWA](official/pwa/README.md) remains 0.0.1 during integration; its production
release waits for a separate protected official signing identity. Examples remain
demonstrations, even when their historical publisher text contains Official.
See [folder-specific signing and environment keys](docs/official-signing.md).

Catalogue membership does not establish trust. Publisher signing and host
permission approval are separate. Unsigned preview packages remain untrusted.
Full API/native frontend authority needs particular review; request narrow scopes.

## Create your first plugin

Start with the executable [first-plugin tutorial](wiki/docs/getting-started/first-plugin.md),
then use the [developer manual](wiki/docs/index.md) and [complete API reference](wiki/docs/plugin-author-guide.md).
The tutorial creates a minimal manifest, Python entrypoint/action and page,
builds a real `.utp`, validates it and explains install/consent.

```sh
python -m venv .venv
# Activate .venv for your shell, then:
python -m pip install -r requirements-dev.txt
python tools/check_source_layout.py
python tools/check_docs.py
python -m pytest
python tools/build_packages.py
python tools/distribution.py --root .validation --check-source
python -m mkdocs build --strict
python -m mkdocs serve
```

The Material/MkDocs wiki uses the same light/dark organization as the main app's
wiki. Its sources live under `wiki/docs/`; `mkdocs serve` opens the local developer wiki
at `http://127.0.0.1:8000`. [Testing](wiki/docs/testing/index.md) includes package,
browser and actual host conformance/lifecycle commands and PowerShell instructions.

Use the [tutorial map](wiki/docs/development/index.md) for one-feature exercises,
[architecture](wiki/docs/architecture/index.md) for the public boundary,
[lifecycle matrix](wiki/docs/testing/lifecycle.md) for updates/recovery, and
[release audit](wiki/docs/publishing/release-history.md) before publication.

## Find a working example

| Source | Purpose |
| --- | --- |
| [UI/API](examples/ui-api/README.md) | Small reference: declarative page, setting and library action |
| [Playtime Report](examples/playtime-report/README.md) | Read → calculate → persist a user-scoped report |
| [Recently Played Notifier](examples/recently-played-notifier/README.md) | Library data and host notifications |
| [Metadata Curator](examples/metadata-curator/README.md) | Settings, metadata search and normalized state |
| [Discord Delivery Provider](examples/discord-delivery-provider/README.md) | Core-coordinated external delivery and write-only secrets |
| [UI Playground](examples/ui-playground/README.md) | Sandboxed Vue pages and bridge; CDN teaching limitation |
| [Help Button](examples/help-button/README.md) | Native contributions, dialogs, overlays, navigation and cleanup |
| [Jellyfin Media Sync](examples/jellyfin-media-sync/README.md) | Master server, approved user identities, library mapping, episode completion and Watch Now |
| [Scoped Document Viewer](examples/scoped-document-viewer/README.md) | Scoped document APIs and sandbox PDF/text/Office reader |
| [Self-Service Session Manager](examples/self-service-session-manager/README.md) | Scoped own/admin sessions and privileged native Settings/maps |

The [example map](wiki/docs/examples/index.md) identifies tests and relevant captures.
Small references stay small; real demos document supported behavior and host limitations.

## Understand the repository

| Path | Role |
| --- | --- |
| `examples/` | Complete maintained plugin source; one intentional source tree |
| `sdk/` | Public v1 protocol helper bundled with packages |
| `tools/`, `tests/` | Existing build/validation tools and conformance tests |
| `wiki/docs/`, `mkdocs.yml` | Developer wiki, real assets and dated evidence |
| `publishers/` | Reviewed public keys/registry; never private signing keys |
| `dist/` | Generated immutable installable `.utp` versions |
| `releases/` | Append-only generated release metadata/history, including retired plugins |
| `catalogue.json` | Authored display name and HTTPS hosting base URL |
| `list.json` | Generated current catalogue with complete per-plugin histories |

Development builds write isolated `.validation/` previews. Published packages
and historical records remain unchanged. Do not manually edit generated lists,
re-sign old ZIPs, or remove historical packages to tidy the repository. GitHub
Releases distributes/presents these same outputs; repository history is retained.

## Sign and publish independently

Author `release.json` for publisher/tags/icon/notes/update policy. The existing
builder creates canonical payload and final archive hashes, signs Ed25519 over
`plugin-package-v2:<payload hash>` (with a signed manifest envelope in the payload), verifies the result, and derives all release
and catalogue metadata from the package. Conventional Commits select SemVer;
explicit higher source versions remain supported. Update policy belongs to each release.

Official main publication uses `python tools/build_packages.py --require-signing`
with separate folder-specific protected keys and the active scoped publisher registry. It preserves
all historical packages and commits packages/history/catalogue/resolved versions
together. Tag only an already-published snapshot. Never commit a private key.

Follow [package publishing](wiki/docs/publishing/packages.md),
[versioning](wiki/docs/publishing/versioning.md), and the complete
[third-party catalogue tutorial](wiki/docs/publishing/community-catalogue.md).
The [catalogue v1 specification](wiki/docs/catalogue-specification.md) is unchanged:
HTTPS immutable package URLs, exact hashes/manifests/signatures and retained
history. Register catalogue endpoints and reviewed publisher keys separately
in Plugin Manager; permissions always remain host-controlled.
