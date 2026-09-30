from __future__ import annotations

import argparse
import base64
import json
import os
import zipfile
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

try:
    from .package_format import canonical_payload_digest
    from .publisher_registry import PublisherRegistryError, release_signer
except ImportError:  # Direct script execution keeps tools independently usable.
    from package_format import canonical_payload_digest
    from publisher_registry import PublisherRegistryError, release_signer

ROOT = Path(__file__).parents[1]
EXAMPLES = ROOT / "examples"
OUT = ROOT / "dist"

SIGNING_KEY_B64 = os.environ.get("PLUGIN_SIGNING_KEY_B64", "").strip()
SIGNING_KEY_ID = os.environ.get("PLUGIN_SIGNING_KEY_ID", "").strip()

argument_parser = argparse.ArgumentParser()
argument_parser.add_argument("--require-signing", action="store_true")
REQUIRE_SIGNING = argument_parser.parse_args().require_signing

if SIGNING_KEY_B64:
    try:
        signing_key = Ed25519PrivateKey.from_private_bytes(
            base64.b64decode(SIGNING_KEY_B64)
        )
    except (ValueError, TypeError) as exc:
        raise SystemExit(
            "PLUGIN_SIGNING_KEY_B64 is not a valid Ed25519 private key"
        ) from exc
    if not SIGNING_KEY_ID:
        raise SystemExit(
            "PLUGIN_SIGNING_KEY_ID is required when PLUGIN_SIGNING_KEY_B64 is set"
        )
else:
    signing_key = None

if REQUIRE_SIGNING and signing_key is None:
    raise SystemExit(
        "a release build requires PLUGIN_SIGNING_KEY_B64 and PLUGIN_SIGNING_KEY_ID"
    )


def discover_plugins() -> list[tuple[Path, dict]]:
    plugins = []
    for manifest_path in sorted(EXAMPLES.glob("*/manifest.json")):
        source = manifest_path.parent
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if not (source / "plugin.py").is_file():
            raise SystemExit(f"{source.name}: manifest.json exists but plugin.py is missing")
        plugins.append((source, manifest))

    if not plugins:
        raise SystemExit("no plugin manifests found under examples/")

    plugin_ids = [manifest["plugin_id"] for _, manifest in plugins]
    if len(plugin_ids) != len(set(plugin_ids)):
        raise SystemExit("duplicate plugin_id found in example manifests")

    return plugins


def update_catalogue(plugins: list[tuple[Path, dict]]) -> None:
    entries = []
    for _, manifest in sorted(plugins, key=lambda item: item[1]["plugin_id"]):
        package_name = f"{manifest['plugin_id']}-{manifest['version']}.utp"
        entries.append(
            {
                "plugin_id": manifest["plugin_id"],
                "name": manifest["name"],
                "description": manifest["description"],
                "version": manifest["version"],
                "url": (
                    "https://raw.githubusercontent.com/"
                    "Rosefall-a/unnamed_tracking_app_plugins/main/dist/"
                    + package_name
                ),
            }
        )

    (ROOT / "list.json").write_text(
        json.dumps({"version": 1, "plugins": entries}, indent=2) + "\n",
        encoding="utf-8",
    )


def write_package(path: Path, manifest: dict, files: dict[str, bytes]) -> None:
    # Fixed ZIP metadata makes repeated builds byte-for-byte reproducible. This
    # is important because the main-branch publish workflow commits dist back
    # to the repository and must not trigger itself forever.
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        manifest_info = zipfile.ZipInfo("manifest.json", date_time=(1980, 1, 1, 0, 0, 0))
        manifest_info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(
            manifest_info,
            json.dumps(manifest, sort_keys=True, indent=2).encode("utf-8"),
        )
        for package_path, data in sorted(files.items()):
            info = zipfile.ZipInfo(
                "payload/" + package_path, date_time=(1980, 1, 1, 0, 0, 0)
            )
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data)


plugins = discover_plugins()
OUT.mkdir(exist_ok=True)

# dist is the canonical checked-in catalogue of packages. Rebuild it from the
# complete set of manifests so removed/renamed examples cannot leave stale
# packages behind.
for stale in OUT.glob("*.utp"):
    stale.unlink()

if signing_key is not None:
    try:
        release_signer(
            SIGNING_KEY_ID,
            tuple(manifest["plugin_id"] for _, manifest in plugins),
            signing_key.public_key().public_bytes_raw(),
        )
    except PublisherRegistryError as exc:
        raise SystemExit(str(exc)) from exc

for source, source_manifest in plugins:
    files = {
        "plugin.py": (source / "plugin.py").read_bytes(),
        "sdk/plugin_protocol.py": (ROOT / "sdk/plugin_protocol.py").read_bytes(),
    }
    if (source / "ui.json").is_file():
        files["ui.json"] = (source / "ui.json").read_bytes()

    frontend_root = source / "frontend"
    if frontend_root.is_dir():
        for frontend_file in sorted(p for p in frontend_root.rglob("*") if p.is_file()):
            files["frontend/" + frontend_file.relative_to(frontend_root).as_posix()] = (
                frontend_file.read_bytes()
            )

    manifest = json.loads(json.dumps(source_manifest))
    manifest.setdefault("integrity", {})
    payload_digest = canonical_payload_digest(files.items())
    manifest["integrity"]["sha256"] = payload_digest

    if signing_key is not None:
        manifest["integrity"]["signature"] = base64.b64encode(
            signing_key.sign(b"plugin-package-v1:" + payload_digest.encode())
        ).decode()
        manifest["integrity"]["key_id"] = SIGNING_KEY_ID
    else:
        manifest["integrity"]["signature"] = None
        manifest["integrity"]["key_id"] = None

    out = OUT / f"{manifest['plugin_id']}-{manifest['version']}.utp"
    write_package(out, manifest, files)
    print(out)

update_catalogue(plugins)
