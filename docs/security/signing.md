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

## Generate an independent key in your secure signing environment

Use an access-controlled directory outside your source checkout. For an
independent publisher, set `PLUGIN_KEY_DIRECTORY` to that directory and run:

```python
import base64
import hashlib
import os
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

directory = Path(os.environ["PLUGIN_KEY_DIRECTORY"])
key = Ed25519PrivateKey.generate()
private = directory / "publisher.private-seed.b64"
descriptor = os.open(private, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(descriptor, "w", encoding="ascii") as stream:
    stream.write(base64.b64encode(key.private_bytes_raw()).decode("ascii"))
public = key.public_key().public_bytes_raw()
with (directory / "publisher.public-key.b64").open("x", encoding="ascii") as stream:
    stream.write(base64.b64encode(public).decode("ascii"))
print("Public key SHA-256:", hashlib.sha256(public).hexdigest())
```

The script refuses to overwrite a private seed and prints only a public hash.
Restrict the directory's Windows ACLs or POSIX permissions before running it.
Import the private file into the secure CI secret `PLUGIN_SIGNING_KEY_B64` and
set `PLUGIN_SIGNING_KEY_ID` to your reviewed registry ID. Only the public file
and public registry record belong in Git. Never run this to replace the official
repository's signing identity.

With your public registry configured, use the existing signed builder and verify:

```sh
python tools/build_packages.py --require-signing
python tools/distribution.py --check-source
```

Expected result: a verified signature under your active scoped identity and exact
archive/payload hashes. A missing key, mismatched publisher label or out-of-scope
plugin ID must fail. [Community publication](../publishing/community-catalogue.md)
explains registration and HTTPS hosting; signing never bypasses host consent.
