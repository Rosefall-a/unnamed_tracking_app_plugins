"""Build Plugin Package v1 and its catalogue from one validated release snapshot."""
from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import tempfile
import zipfile
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

try:
    from .distribution import ROOT, canonical_json, collect_payload, discover_plugins, generate_catalogue, git, import_history, load_histories, next_release, release_record, source_digest, validate_distribution, write_json
    from .package_format import canonical_payload_digest
    from .publisher_registry import release_signer
    from .validate_packages import validate_package
    from .verify_packages import verify_package
except ImportError:
    from distribution import ROOT, canonical_json, collect_payload, discover_plugins, generate_catalogue, git, import_history, load_histories, next_release, release_record, source_digest, validate_distribution, write_json
    from package_format import canonical_payload_digest
    from publisher_registry import release_signer
    from validate_packages import validate_package
    from verify_packages import verify_package


def write_package(path: Path, manifest: dict, files: dict[str, bytes]) -> None:
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        entries = [("manifest.json", canonical_json(manifest))]
        entries.extend(("payload/" + name, data) for name, data in sorted(files.items()))
        for name, data in entries:
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)


def build(root: Path, output: Path, *, publish: bool = False, catalogue_only: bool = False, reuse_published: bool = False) -> None:
    plugins = discover_plugins(root)
    key = None
    key_id = os.environ.get("PLUGIN_SIGNING_KEY_ID", "").strip()
    encoded = os.environ.get("PLUGIN_SIGNING_KEY_B64", "").strip()
    if encoded:
        key = Ed25519PrivateKey.from_private_bytes(base64.b64decode(encoded, validate=True))
        release_signer(key_id, tuple(m["plugin_id"] for _, m in plugins), key.public_key().public_bytes_raw())
    if publish and key is None and not catalogue_only:
        raise ValueError("a release build requires PLUGIN_SIGNING_KEY_B64 and PLUGIN_SIGNING_KEY_ID")
    if output == root and not (publish or catalogue_only):
        raise ValueError("use --publish for signed distribution; development builds must use a separate output root")
    if publish and git(root, "status", "--porcelain", "--", "examples", "sdk", "tools", "publishers", "catalogue.json"):
        raise ValueError("commit source, tooling and publisher changes before publishing a release")

    histories = load_histories(root)
    import_history(root, histories)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Failed signing/validation leaves historical packages and metadata intact.
    with tempfile.TemporaryDirectory(prefix="plugin-build-", dir=output.parent) as temporary:
        stage = Path(temporary)
        (stage / "dist").mkdir()
        for path in (root / "dist").glob("*.utp"):
            shutil.copyfile(path, stage / "dist" / path.name)
        resolved = []
        if not catalogue_only:
            for source, original in plugins:
                manifest = json.loads(json.dumps(original))
                files, metadata = collect_payload(root, source, manifest)
                fingerprint = source_digest(manifest, files)
                history = histories.setdefault(manifest["plugin_id"], [])
                version, reuse, bump = next_release(root, source, manifest, history, fingerprint)
                if reuse_published and (not reuse or history[-1]["lifecycle"] != "published"):
                    raise ValueError("release tags must reference a source snapshot already published on main")
                manifest["version"] = version
                if not reuse:
                    commit = git(root, "rev-parse", "HEAD")
                    metadata = {**metadata, "version": version, "automatic_update": (
                        metadata["automatic_update"] if metadata["automatic_update"] is not None else bump != "major"
                    ), "build": {"source_digest": fingerprint, "source_commit": commit,
                        "source_committed_at": git(root, "show", "-s", "--format=%cI", commit) if commit else None,
                        "source_path": source.relative_to(root).as_posix(), "builder": "tools/build_packages.py",
                        "contract_revision": "f1165fcc805e57ee428e7bc42fa6b83f4a6caf25", "version_bump": bump}}
                    files["distribution.json"] = canonical_json(metadata)
                    digest = canonical_payload_digest(files.items())
                    manifest["integrity"] = {
                        "sha256": digest,
                        "signature": base64.b64encode(key.sign(b"plugin-package-v1:" + digest.encode())).decode() if key else None,
                        "key_id": key_id if key else None,
                    }
                    package = stage / "dist" / f"{manifest['plugin_id']}-{version}.utp"
                    if package.exists():
                        raise ValueError(f"refusing to overwrite immutable package {package.name}")
                    write_package(package, manifest, files)
                    validate_package(package, full=True)
                    verify_package(package, require_signature=publish)
                    history.append(release_record(package, root=root, source=source, fingerprint=fingerprint, published=publish))
                elif publish:
                    verify_package(stage / "dist" / history[-1]["package"]["filename"], require_signature=True)
                resolved.append((source / "manifest.json", manifest))
        for plugin_id, history in histories.items():
            write_json(stage / "releases" / f"{plugin_id}.json", {"version": 1, "plugin_id": plugin_id, "releases": history})
        generate_catalogue(root, stage, plugins, histories)
        validate_distribution(stage, source_root=root, check_source=not catalogue_only)
        output.mkdir(parents=True, exist_ok=True)
        for directory in ("dist", "releases"):
            (output / directory).mkdir(exist_ok=True)
            if output != root:
                candidates = {p.name for p in (stage / directory).iterdir()}
                for old in (output / directory).glob("*.utp" if directory == "dist" else "*.json"):
                    if old.name not in candidates:
                        old.unlink()
            for path in (stage / directory).iterdir():
                target = output / directory / path.name
                if directory == "dist" and target.exists() and output == root:
                    if target.read_bytes() != path.read_bytes():
                        raise ValueError(f"immutable artifact changed: {path.name}")
                    continue
                os.replace(path, target)
        os.replace(stage / "list.json", output / "list.json")
        if publish:
            for path, manifest in resolved:
                # Only generated package manifests carry the final integrity.
                manifest["integrity"] = {"sha256": "0" * 64, "signature": None, "key_id": None}
                write_json(path, manifest)
    print(f"Validated distribution: {output}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", type=Path, default=ROOT / ".validation")
    parser.add_argument("--publish", action="store_true", help="append signed releases and advance source manifest versions")
    parser.add_argument("--require-signing", action="store_true", help="compatibility alias for --publish")
    parser.add_argument("--catalogue-only", action="store_true", help="index existing immutable packages without rebuilding")
    parser.add_argument("--reuse-published", action="store_true", help="release assets must already be published from this source snapshot")
    args = parser.parse_args()
    publish = args.publish or args.require_signing
    output = ROOT if publish or args.catalogue_only else args.output_root.resolve()
    build(ROOT, output, publish=publish, catalogue_only=args.catalogue_only, reuse_published=args.reuse_published)


if __name__ == "__main__":
    main()
