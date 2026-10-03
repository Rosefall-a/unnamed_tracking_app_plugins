# Separate publisher identities and signing configuration

Official is a reviewed publisher channel, not a synonym for a valid signature.
The host shows Official only after verification of a v2 package using a registered
`channel: official` key scoped to its plugin ID. Existing example signing keys
are `channel: demo`, including keys whose historical publisher text says Official.
Unknown keys, invalid signatures and unsigned packages never receive that badge.
Invalid signatures are blocked; unsigned/unknown keys require explicit consent.
Official status does not bypass permissions.

Set these GitHub Actions secrets (or builder environment variables):

| Key | Purpose |
| --- | --- |
| `PLUGIN_EXAMPLES_SIGNING_KEY_ID` | Registered demo key for `examples/` |
| `PLUGIN_EXAMPLES_SIGNING_KEY_B64` | Base64 raw 32-byte Ed25519 private seed for that key |
| `PLUGIN_OFFICIAL_SIGNING_KEY_ID` | New reviewed official key for `official/` |
| `PLUGIN_OFFICIAL_SIGNING_KEY_B64` | Protected private seed for the official key |
| `PLUGIN_SIGNING_KEY_ID` | Optional generic/legacy fallback identity |
| `PLUGIN_SIGNING_KEY_B64` | Private seed for the generic identity |

Set repository variable `PLUGIN_SIGNING_FALLBACK` to `generic`, `unsigned` or
`error` (default `generic`). Folder pairs take precedence. A partial/malformed,
unregistered, revoked or incorrectly scoped configured key fails without falling
back. `unsigned` permits missing keys only for preview builds. Signed publication
always requires a valid key for every new package. A generic demo key cannot sign
an official source, and an official key cannot sign examples. Generic sources
may live in `plugins/`. Existing published packages can be reused without access
to their retired private keys.

Register **only public material** in `publishers/registry.json` and its companion
`.public-key.b64`. Independently review/deploy the same official key, channel,
scope and SHA-256 in the host's `trusted_publishers.json`, or a reviewed registry
selected with host environment `PLUGIN_TRUSTED_PUBLISHER_REGISTRY`. The host
does not need private signing environment variables. Never commit a private key,
including a supposedly temporary expiring key. A disclosed seed permits
impersonation until every verifier has revoked it.

No production official identity is invented by development. Until its public key
is reviewed and private secret provisioned, `python tools/build_packages.py`
produces an unsigned development PWA in `.validation/`; it is not published as
an official signed release. `--publish` fails atomically when official signing is
missing. This prevents a demo key or unsigned package silently replacing an
official release.

New signatures use `v2:` followed by Ed25519 signature base64. The signature
covers `plugin-package-v2:<payload-sha256>`. The payload includes
`package-signature-v2.json` containing the complete manifest without integrity
and the signer key ID. Verifiers compare this signed manifest with the outer
manifest, preventing changes to permissions, ID, version or PWA declarations.
Historical v1 packages remain readable without rewriting immutable archives.
Their exact manifest hashes are pinned against payload hashes in both reviewed
registries (`legacy_manifest_hashes`); changing permissions, identity or version
invalidates the review. Newly signed packages require v2. A deployed registry
rejects an unpinned v1 package, and v1 signatures cannot establish official status
or publish a PWA contribution.
