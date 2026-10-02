# Ecosystem audit and implementation plan

Audited on 2 October 2026 (Australia/Perth), starting from plugin `main`
`42667ee43aca9dbe5132cc456fd41d18601d458b`. The host's actual `plugin-manager`
branch and main application's Material/MkDocs configuration are the references.

## Findings from the tree

| Area | Existing implementation / action |
| --- | --- |
| API / SDK | `sdk/plugin_protocol.py` emits v1 newline-delimited JSON and route responses. Preserve it unchanged. |
| Packages | `tools/package_format.py` defines sorted path/NUL/bytes/NUL payload hashes; `build_packages.py` writes deterministic ZIP `.utp` v1. Preserve both contracts. |
| Signing | Ed25519 over `plugin-package-v1:<payload digest>`, scoped publisher registry, active/retiring/revoked statuses. Keep existing public keys and verification. |
| Release automation | Fingerprints include manifest, source, SDK, README and release inputs; Conventional Commits derive SemVer; explicit higher source versions win. Test rename history and overrides. |
| Distribution | 34 immutable packages and 13 append-only plugin histories, ten current catalogue entries. Preserve package bytes and records; distinguish retired distributions from current sources. |
| Source defect | `42667ee` moved six maintained sources into `examples.old`, deleted implementation/UI/README/frontend of two of them, but left discovery, tests, catalogue and CI expecting ten in `examples`. |
| Active small references | UI/API and Discord provider have current releases, manifest/SDK/package tests, and demonstrated host contracts. Recover missing provider files from `0175c36`, not from a new implementation. |
| Active demos | Playtime Report, Recently Played Notifier, Metadata Curator and UI Playground remain covered by source/action/package tests and current releases. Recover missing Playground files from `0175c36`. |
| Core feature demos | Help Button, Jellyfin, Scoped Document Viewer and Session Manager already have complete sources, extensive tests and host acceptance. Keep them intact. |
| Obsolete sources | `advanced`, `events`, `events-filter`, `lifecycle`, `metadata`, `notifications` have only READMEs, no executable source or manifests. Remove these misleading stubs. Historic `advanced`, `events`, `lifecycle` distributions stay available. |
| Docs | Author guide and catalogue specification already accurately define v1; parity/audit reports are dated evidence. Extend into a navigable tutorial wiki without rewriting that specification. |
| CI | Package, signing, full current contract, immutable baseline, browser and real-host lifecycle checks already exist. Preserve them and add layout and strict docs checks. |
| Host boundary | Existing host acceptance exercises actual PostgreSQL, HTTP, workers, updates, rollback, consent, secrets, data retention, purge and uninstall. Add plugin-side acceptance for real smaller demos, never a substitute host. |
| Assets | Existing real document and native component captures exist; move documentation assets together and record provenance. Capture the built wiki and real browser workflow where available. |
| Attributes | LF normalization, SDK/document source LF, `.utp`/PNG binary rules are useful. Preserve them; no new binary formats require rules. |

## Coherent implementation sequence

1. Consolidate maintained source under `examples/`, remove proven stubs, relocate
   design history under `docs/history/`, and add fail-fast discovery/layout checks.
   Keep historical embedded source paths intact. Catalogue paths still use the
   existing `examples/<name>` locations, so unchanged packages can be reused.
2. Strengthen real release tests (explicit overrides, per-plugin change detection,
   SDK changes, immutable output and third-party identities/catalogues). Extend
   the actual host acceptance tooling to exercise representative small demo
   packages in addition to the existing full Jellyfin update/rollback sequence.
3. Add a Material/MkDocs manual with executable first-plugin tutorial, capability
   recipes, lifecycle/migrations, security, independent publishing/catalogue
   tutorial, troubleshooting and truthful screenshot provenance. Preserve dated
   audit reports as historical evidence, separate from current instructions.
4. Rewrite README/agent layout guidance, enforce strict documentation in CI and
   publication, run every existing local check and the actual host conformance
   check, commit coherent changes, push without force, and open a Draft PR to main.

## Review gates

No changes to API v1, SDK wire behavior, `.utp`, signing message, catalogue schema,
publisher identities or historical releases. Generated catalogue/history must
continue to match actual package bytes. New unsigned builds stay in `.validation`;
main's existing publication workflow is the only official signing/release path.
Linux/PostgreSQL/browser acceptance remains a required CI gate when the local
Windows environment cannot run it. Do not merge before green CI and review.
