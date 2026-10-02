# Troubleshooting

Start with the exact error, the package version and host build. Use a preview
directory and a disposable host; do not mutate an old signed archive to repair it.

| Symptom | Check and recovery |
| --- | --- |
| Package rejected | Run verifier and full validator. Check duplicate/unsafe paths, missing payload, corrupt ZIP or mismatched hashes. Rebuild a new version from source. |
| Manifest rejected | Validate against exported v1 schema; compare capability/permission versions, UI IDs, handler names and supported range syntax. Distribution tags/risk fields do not belong in the manifest. |
| Signature failure | Check actual payload digest, base64 signature, key ID, raw public-byte hash, registry scope/status and private/public match. Unknown publisher requires separate reviewed host trust configuration; never strip verification. |
| Permission denied / contribution missing | Inspect effective grants and lifecycle state. Request the matching frontend/domain grant; never fall back to broader APIs. Newly requested update scopes need explicit approval. |
| Runtime starts then fails | Check stderr/host diagnostics, import path and entrypoint. `main()` reports ready and remains alive. Keep stdout reserved for protocol. Verify runtime isolation/egress policy rather than altering it silently. |
| UI blank or action missing | Check declared bundle entry, packaged assets, matching IDs/handlers, native grant and sandbox bridge. Document Viewer requires the coordinated authenticated inline-asset host contract. Test timeout/stale/denied states. |
| Update not offered | Check numeric version, configured catalogue URL, immutable package availability, compatibility/dependencies, signer and that release's update policy. A major/manual-only release may require review. |
| Update fails activation | Inspect health/startup errors. The host restores its retained known-good package; verify preserved data is backward compatible. Do not claim external effects/data were undone. |
| Build says source is dirty | Commit source/tooling/publisher changes before signed publication. Local previews can be built without publishing. Do not bypass provenance checks. |
| Catalogue differs from package | Regenerate using the builder/distribution tools and verify exact archive/hash/manifest/README/policy. Never hand-patch `list.json`. |

The host owns authentication, permission risk and installation transactions. If
your feature requires a missing API, report the capability requirement rather
than importing host internals. Include a minimal reproduction, supported host
revision and sanitized diagnostics; never include keys, tokens or user data.
