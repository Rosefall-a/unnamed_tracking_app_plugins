"""Verify distributable packages against the reviewed publisher registry."""

from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
import sys
import zipfile

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

try:
    from .publisher_registry import PublisherRegistryError, load_registry
except ImportError:  # Direct script execution keeps tools independently usable.
    from publisher_registry import PublisherRegistryError, load_registry


def verify_package(path: Path) -> None:
    with zipfile.ZipFile(path) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        files = {
            name.removeprefix("payload/"): archive.read(name)
            for name in archive.namelist()
            if name.startswith("payload/") and not name.endswith("/")
        }
    digest = hashlib.sha256()
    for name, content in sorted(files.items()):
        digest.update(name.encode("utf-8"))
        digest.update(b"\0")
        digest.update(content)
        digest.update(b"\0")
    payload_digest = digest.hexdigest()
    integrity = manifest["integrity"]
    if integrity.get("sha256") != payload_digest:
        raise PublisherRegistryError("package payload digest does not match its manifest")
    record = load_registry().get(integrity.get("key_id"))
    if record is None or not record.allows_plugin(manifest["plugin_id"]):
        raise PublisherRegistryError("package publisher is not trusted for this plugin")
    Ed25519PublicKey.from_public_bytes(record.public_key).verify(
        base64.b64decode(integrity["signature"], validate=True),
        b"plugin-package-v1:" + payload_digest.encode("ascii"),
    )


def main() -> None:
    paths = [Path(value) for value in sys.argv[1:]]
    if not paths:
        raise SystemExit("at least one package path is required")
    for package in paths:
        verify_package(package)


if __name__ == "__main__":
    main()
