# Scoped Document Viewer validation

Validated on Windows on 2026-10-01. The plugin source baseline was `2293839`; the host `plugin-manager` baseline was `daedc1d8125662065bf27d64ac6311380249a5e6`. The comparison uses the actual [PR #241](https://github.com/Rosefall-a/unnamed_tracking_app/pull/241) source at `a9b7d3102c1efec08a5bf11a919c6d2204376ebc`, including its tests. The completed stages 1–4 platform was inspected alongside the [existing API audit](plugin-api-v1-audit.md).

## Results

| Check | Result |
| --- | --- |
| Original PR backend document tests | 19 passed, 1 symlink test skipped |
| Original PR frontend document service tests | 13 passed |
| Direct source comparison | 28 document cases and 6 traversal cases passed |
| Plugin Python suite | 41 passed |
| Plugin real-browser sandbox suite | 21 passed |
| Relevant host backend suite | 188 passed, 1 symlink test skipped |
| Host frontend Vitest suite | 66 passed in 11 files |
| Host ESLint and Vue TypeScript checks | Passed |
| Host mypy | Passed across 187 source files |
| Host Pylint | 9.16, meets the unchanged CI threshold of 9.0; baseline 9.17 |
| Ruff on changed document contract/policy/gateway/tests and plugin Python | Passed |
| JavaScript syntax and changed frontend formatting | Passed |
| Package build, integrity verification and package validation | Passed for fresh builds and checked-in distribution packages |
| Actual host package/manifest/UI inspection | Passed; the new package is correctly classified as unsigned |

Default host Prettier is **not green**. On this Windows checkout it reports widespread line-ending differences. Read-only snapshots with normalized line endings isolate exactly 23 content-formatting failures, identical in the untouched baseline and updated tree. These are outside this change. The changed frontend files pass the configured formatter. Existing checks and thresholds were not weakened. The host routes module also retains its existing FastAPI `B008` default-dependency warnings; no new document-policy Ruff warnings were introduced.

Windows did not permit symlink creation, so those two symlink tests were skipped rather than removed. The tests retain their escaping-symlink assertions for environments permitting creation. No production Docker/PostgreSQL deployment or Linux runtime sandbox end-to-end run was performed. Host authorization tests use persisted SQLAlchemy rows with SQLite test storage and exercise actual ownership/grant queries and HTTP authorization. Browser tests load the actual plugin assets inside the host's opaque iframe sandbox and CSP. Package tests execute the public SDK from the actual `.utp` in a subprocess.

## Reproduction

In the plugin repository:

```sh
python -m pytest -q
npm ci
npx playwright install --with-deps chromium --only-shell
npm run check
npm test
python tools/build_packages.py
python tools/verify_packages.py dist/*.utp
python tools/validate_packages.py dist/*.utp
python tools/check_document_parity.py --reference /path/to/pr241-checkout --host /path/to/updated-host
```

The standard builder can regenerate unsigned examples. Run it in an isolated checkout when preserving existing signed release artifacts; do not overwrite a signed release with an unsigned rebuild. The new 1.4.0 package was built in isolation and verified against current source and pinned vendor hashes. Existing signed artifacts were preserved.

In the updated host's `src/backend`, with the normal test database/environment configuration:

```sh
python -m pytest -q tests/test_plugin_documents.py tests/test_plugin_domain_gateway.py tests/test_plugin_authorization_http.py tests/test_plugin_backend_routes.py tests/test_plugin_route_capabilities.py tests/test_plugin_ui_extensions.py tests/test_plugin_ui_contracts.py tests/test_plugin_api_contracts.py tests/test_plugin_manifest.py tests/test_plugin_lifecycle.py tests/test_plugin_contribution_lifecycle_e2e.py tests/test_plugin_repository_trust.py
python -m mypy src
python -m pylint src
python -m ruff check src/plugin_api/documents.py src/plugin_api/gateway.py src/plugin_api/contracts.py tests/test_plugin_documents.py
```

In the host's `src/frontend`:

```sh
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm run test -- --run
npm run format
```

The direct comparison loads the reference helper from the supplied PR checkout. It does not replace it with a mock or duplicate implementation. Ownership, fresh-grant revocation, unauthorized requests, opaque IDs, traversal, oversized inputs and bounded metadata transport are separately covered by host tests. Browser tests cover HTML attack payloads and absence of outbound requests, malformed PDFs, UTF-8 chunk boundaries, digest mismatches, unsupported MIME types, malformed bridge responses, stale responses, loading/empty states and HTTP deployments without secure-context Web Crypto APIs.

## Delivery restrictions

See the [feature comparison](scoped-document-viewer.md) and [plugin README](../examples/scoped-document-viewer/README.md) for the explicit PR behavior differences: the platform's 5 MiB PDF cap, sandbox PDF controls, disabled HTML navigation, indexed-document requirement, and unavailable read-only upload/rename operations. The host contract update must accompany the plugin.

The 1.4.0 artifact is an **unsigned local build**, not a trusted signed release. Trusted release signing requires the existing publisher workflow and its private credentials. No signatures or keys were fabricated. The independent plugin GitHub wiki was unavailable (`Repository not found`); a wiki-ready guide is committed in this repository instead.

Before pushing, both commits were rebased onto concurrent session-management updates (`6f58e609` in the host and `489fb2b` in the plugin repository). The combined code preserves host-owned action confirmation and the new session/GeoIP APIs. Integration checks passed: 208 relevant host backend tests (1 symlink skip), 67 host frontend tests, 60 plugin Python tests, 6 session-manager UI tests, Vue TypeScript, ESLint, and package integrity/validation. The document browser assets and package content remain unchanged from the 21-test sandbox run above.
