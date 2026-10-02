# Ecosystem cleanup validation

Validated on 2 October 2026 (Australia/Perth), from plugin main baseline
`42667ee43aca9dbe5132cc456fd41d18601d458b`, against actual host `plugin-manager`
revision `5af8f17dcdda41b8242953f46ef87d46febb1f03`.

| Check | Local result |
| --- | --- |
| Complete Python suite | 133 passed; includes exact tutorial execution, independent signed community catalogue and release selection regressions |
| Actual browser/native suites | 43 passed; all existing sanitizer/PDF/Office/bridge/controller checks retained |
| Static source layout/contracts | All ten complete maintained sources passed |
| MkDocs strict build | Passed, including all navigation, links and screenshot assets |
| Real host contract/package inspection | All ten preview packages passed real host models/verifier/disabled registry installation |
| Reference lifecycle on Ubuntu 24.04 | All four actual plugins passed real registry/supervisor transactions and worker execution |
| Existing package/history immutability | All 34 original archives and 13 release history files remain byte-identical to baseline |
| Preview distribution | Existing builder verifies current source, package hashes, signatures and release metadata; isolated from published artifacts |
| Historical screenshots | Original PNG bytes retained; relocated assets and package README links updated |
| New workflow screenshots | Successful authenticated host CI captures imported unchanged with artifact SHA-256/run/revision provenance |
| Repository attributes | Existing LF normalization and `.utp`/PNG binary rules retained; no new format needs a rule |

## What the lifecycle checks establish

`tools/check_reference_lifecycle.py` builds three real signed release sequences
using a disposable publisher and the existing builder. It runs UI/API, Playtime
Report, Recently Played Notifier and Metadata Curator through the actual host
registry/supervisor on Ubuntu. It verifies pending installation transactions
cannot start, real worker health, persisted configuration/storage/identity after
restart and disable/enable, ordinary update, changed-permission package transaction,
retained-package rollback, preserving reinstall, purge and uninstall. Nothing in
the host runtime or its grant implementation is copied or mocked.

The standalone reference check is a runtime/package contract test. Authenticated
HTTP consent, effective grants and new-scope staging remain the responsibility
of the existing required PostgreSQL/browser `Plugin Manager integration` job.
That job still runs the host's full Jellyfin lifecycle acceptance before the new
reference check, including opt-out/opt-in policy, secrets, failed startup and
rollback. Local reference execution explicitly uses the same existing process
mode as that acceptance; it does not claim Bubblewrap namespace isolation.

## Reproduction and publication boundaries

Use [testing instructions](../testing/index.md) for all commands. Windows tests
use an explicit workspace temporary directory and UTF-8 where appropriate;
Linux real workers use a disposable `/tmp` project/state. No production signing
seed or installation data was accessed. Private test keys exist only in disposable
test environments.

Two source READMEs now link to the clean screenshot asset location. Their new
preview packages are generated/validated using the existing fingerprint/version
policy. Their previously published archives and exact release records remain
immutable. The existing main publication workflow will sign and append changed
releases after review/merge; a development branch cannot legitimately replace
those official artifacts without the configured signing identity.

The strict documentation build is required in both development and publication
CI. Existing package/signature/history/browser/host checks remain required. CI
must pass on the final PR head, and implementation review is required before merge.
