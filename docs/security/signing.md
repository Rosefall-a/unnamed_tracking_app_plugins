# Package signing and publisher identity

The existing v1 package signature is Ed25519 over ASCII
`plugin-package-v1:<canonical-payload-sha256>`. The sorted path/NUL/bytes/NUL
payload hash excludes the manifest; the complete package hash separately binds
the final archive, including its manifest. Do not conflate these digests.

`publishers/registry.json` records reviewed public keys, key IDs, public-key hashes,
publisher labels, status and allowed plugin-ID prefixes. New publication requires
an **active** matching signer covering the source set. Retiring keys can verify
historical packages; revoked keys cannot produce or establish trusted releases.
Private seeds never belong in Git, documentation or package payloads.

The repository's signing registry and the host's trusted publisher registry are
separate. Review and register a publisher's key independently in the deployment.
An unknown signature is not trusted just because a catalogue advertises it.
Unsigned development packages remain explicitly untrusted and use the host's
consent path.

For rotation, review/publish the successor public key before switching signing,
keep the approved predecessor overlap, then revoke according to policy. Publish
a new version; never alter a historical archive to simulate rotation. Existing
test-key policy differences with the host are recorded in the dated API audit;
this cleanup does not change identities or claim production trust for test keys.

Follow the [independent catalogue tutorial](../publishing/community-catalogue.md)
to register your own identity and build a signed package using the same tools.
