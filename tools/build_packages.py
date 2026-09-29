from __future__ import annotations

import base64
import argparse
import json
import os
import zipfile
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

try:
    from .publisher_registry import PublisherRegistryError, release_signer
    from .package_format import canonical_payload_digest
except ImportError:  # Direct script execution keeps tools independently usable.
    from publisher_registry import PublisherRegistryError, release_signer
    from package_format import canonical_payload_digest

ROOT = Path(__file__).parents[1]
OUT = ROOT / "dist"
OUT.mkdir(exist_ok=True)

REFERENCE_PLUGINS = ("ui-api",)

DEMO_PLUGINS = (
    "playtime-report",
    "recently-played-notifier",
    "metadata-curator",
    "ui-playground",
)

SIGNING_KEY_B64 = os.environ.get("PLUGIN_SIGNING_KEY_B64", "").strip()
SIGNING_KEY_ID = os.environ.get("PLUGIN_SIGNING_KEY_ID", "").strip()
argument_parser = argparse.ArgumentParser(add_help=False)
argument_parser.add_argument("--require-signing", action="store_true")
REQUIRE_SIGNING = argument_parser.parse_known_args()[0].require_signing

if SIGNING_KEY_B64:
    try:
        signing_key = Ed25519PrivateKey.from_private_bytes(base64.b64decode(SIGNING_KEY_B64))
    except (ValueError, TypeError) as exc:
        raise SystemExit("PLUGIN_SIGNING_KEY_B64 is not a valid Ed25519 private key") from exc
    if not SIGNING_KEY_ID:
        raise SystemExit("PLUGIN_SIGNING_KEY_ID is required when PLUGIN_SIGNING_KEY_B64 is set")
else:
    signing_key = None

if REQUIRE_SIGNING and signing_key is None:
    raise SystemExit("a release build requires PLUGIN_SIGNING_KEY_B64 and PLUGIN_SIGNING_KEY_ID")

PLUGINS = REFERENCE_PLUGINS + DEMO_PLUGINS

if signing_key is not None:
    try:
        plugin_ids = tuple(
            json.loads((ROOT / "examples" / name / "manifest.json").read_text())["plugin_id"]
            for name in PLUGINS
        )
        release_signer(SIGNING_KEY_ID, plugin_ids, signing_key.public_key().public_bytes_raw())
    except PublisherRegistryError as exc:
        raise SystemExit(str(exc)) from exc

if signing_key is not None:
    for stale in OUT.glob("*.utp"):
        stale.unlink()
else:
    # Existing checked-in packages are already signed artifacts. Do not rebuild
    # them with a changed SDK and silently invalidate their signatures.
    PLUGINS = ()

for name in PLUGINS:
    src = ROOT / "examples" / name
    files = {
        "plugin.py": (src / "plugin.py").read_bytes(),
        "sdk/plugin_protocol.py": (ROOT / "sdk/plugin_protocol.py").read_bytes(),
    }
    if (src / "ui.json").is_file():
        files["ui.json"] = (src / "ui.json").read_bytes()
    frontend_root = src / "frontend"
    if frontend_root.is_dir():
        for frontend_file in sorted(p for p in frontend_root.rglob("*") if p.is_file()):
            files["frontend/" + frontend_file.relative_to(frontend_root).as_posix()] = frontend_file.read_bytes()

    manifest = json.loads((src / "manifest.json").read_text())
    payload_digest = canonical_payload_digest(files.items())
    manifest["integrity"]["sha256"] = payload_digest

    signature = manifest["integrity"].get("signature", "")
    if signing_key is not None:
        manifest["integrity"]["signature"] = base64.b64encode(
            signing_key.sign(b"plugin-package-v1:" + payload_digest.encode())
        ).decode()
        manifest["integrity"]["key_id"] = SIGNING_KEY_ID
    elif name in DEMO_PLUGINS:
        # Demo packages are deliberately unsigned for local testing. The host
        # accepts them as untrusted and clearly labels them; release builds
        # should supply a publisher signing key to produce trusted artifacts.
        manifest["integrity"]["signature"] = None
        manifest["integrity"]["key_id"] = None

    out = OUT / f'{manifest["plugin_id"]}-{manifest["version"]}.utp'
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, sort_keys=True, indent=2))
        for path, data in files.items():
            archive.writestr("payload/" + path, data)
    print(out)
