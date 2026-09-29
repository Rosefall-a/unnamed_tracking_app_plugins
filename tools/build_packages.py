from __future__ import annotations

import base64
import hashlib
import json
import os
import zipfile
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).parents[1]
OUT = ROOT / "dist"
OUT.mkdir(exist_ok=True)

REFERENCE_PLUGINS = (
    "lifecycle",
    "events",
    "ui-api",
    "advanced",
    "notifications",
    "metadata",
    "events-filter",
)

DEMO_PLUGINS = (
    "playtime-report",
    "recently-played-notifier",
    "metadata-curator",
)

SIGNING_KEY_B64 = os.environ.get("PLUGIN_SIGNING_KEY_B64", "").strip()
SIGNING_KEY_ID = os.environ.get("PLUGIN_SIGNING_KEY_ID", "").strip()

if SIGNING_KEY_B64:
    try:
        signing_key = Ed25519PrivateKey.from_private_bytes(base64.b64decode(SIGNING_KEY_B64))
    except (ValueError, TypeError) as exc:
        raise SystemExit("PLUGIN_SIGNING_KEY_B64 is not a valid Ed25519 private key") from exc
    if not SIGNING_KEY_ID:
        raise SystemExit("PLUGIN_SIGNING_KEY_ID is required when PLUGIN_SIGNING_KEY_B64 is set")
else:
    signing_key = None

PLUGINS = REFERENCE_PLUGINS + DEMO_PLUGINS

for name in PLUGINS:
    src = ROOT / "examples" / name
    files = {
        "plugin.py": (src / "plugin.py").read_bytes(),
        "sdk/plugin_protocol.py": (ROOT / "sdk/plugin_protocol.py").read_bytes(),
    }
    if (src / "ui.json").is_file():
        files["ui.json"] = (src / "ui.json").read_bytes()

    digest = hashlib.sha256()
    for path, data in sorted(files.items()):
        digest.update(path.encode())
        digest.update(b"\\0")
        digest.update(data)
        digest.update(b"\\0")

    manifest = json.loads((src / "manifest.json").read_text())
    manifest["integrity"]["sha256"] = digest.hexdigest()

    signature = manifest["integrity"].get("signature", "")
    if signing_key is not None:
        manifest["integrity"]["signature"] = base64.b64encode(
            signing_key.sign(b"plugin-package-v1:" + digest.hexdigest().encode())
        ).decode()
        manifest["integrity"]["key_id"] = SIGNING_KEY_ID
    elif signature in {"", "demo-signature"}:
        # Demo plugins are real source implementations but cannot be distributed
        # as trusted installables until a publisher signing key is supplied.
        print(f"Skipping unsigned demo package: {name}")
        continue

    out = OUT / f'{manifest["plugin_id"]}-{manifest["version"]}.utp'
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, sort_keys=True, indent=2))
        for path, data in files.items():
            archive.writestr("payload/" + path, data)
    print(out)
