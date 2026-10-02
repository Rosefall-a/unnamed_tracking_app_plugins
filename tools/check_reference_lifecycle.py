"""Exercise real reference packages using the host's actual runtime registry.

This complements (and never replaces) PostgreSQL/HTTP permission acceptance in
the host's check_plugin_repository_lifecycle.py. Run on Linux; the real runtime
uses POSIX process groups/resource limits. No host/runtime implementation lives
here and no grants, gateway or supervisor are mocked.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from uuid import uuid4

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[1]
NAMES = ("ui-api", "playtime-report", "recently-played-notifier", "metadata-curator")


def commit(root: Path, message: str) -> None:
    subprocess.run(["git", "-C", str(root), "add", "."], check=True, capture_output=True)
    subprocess.run(["git", "-C", str(root), "commit", "-m", message], check=True, capture_output=True)


def releases(root: Path, env: dict) -> dict[str, Path]:
    subprocess.run([sys.executable, str(root / "tools/build_packages.py"), "--publish"],
                   env=env, check=True)
    data = json.loads((root / "list.json").read_text(encoding="utf-8"))
    commit(root, "chore: publish disposable acceptance packages")
    return {e["plugin_id"]: root / "dist" / e["package"]["filename"] for e in data["plugins"]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host-root", type=Path, required=True)
    parser.add_argument("--temporary-root", type=Path)
    args = parser.parse_args()
    if os.name != "posix":
        parser.error("real worker acceptance requires Linux; run the required host-integration CI job")
    sys.path.insert(0, str(args.host_root.resolve() / "src/plugin-runtime"))
    sys.path.insert(0, str(args.host_root.resolve() / "src/backend"))
    from runtime import PluginRegistry, PluginSupervisor, RuntimePolicyError
    from src.plugin_api.updates import PluginPackageVerifier, TrustedPublisher

    with tempfile.TemporaryDirectory(dir=args.temporary_root) as temporary:
        work = Path(temporary)
        source = work / "source"
        for directory in ("tools", "sdk", "publishers"):
            shutil.copytree(ROOT / directory, source / directory,
                            ignore=shutil.ignore_patterns("__pycache__"))
        for name in NAMES:
            shutil.copytree(ROOT / "examples" / name, source / "examples" / name)
        shutil.copyfile(ROOT / ".gitignore", source / ".gitignore")
        key = Ed25519PrivateKey.generate()
        public = key.public_key().public_bytes_raw()
        encoded = base64.b64encode(public).decode()
        (source / "publishers/disposable.public-key.b64").write_text(encoded, encoding="utf-8")
        record = {"key_id": "disposable", "publisher": "Unnamed Tracking Official",
                  "public_key_file": "disposable.public-key.b64", "public_key_b64": encoded,
                  "public_key_sha256": hashlib.sha256(public).hexdigest(), "status": "active",
                  "plugin_id_prefixes": ["example."]}
        (source / "publishers/registry.json").write_text(
            json.dumps({"schema_version": 1, "publishers": [record]}), encoding="utf-8")
        subprocess.run(["git", "init", str(source)], check=True, capture_output=True)
        for name, value in (("user.name", "Acceptance"), ("user.email", "acceptance@example.invalid")):
            subprocess.run(["git", "-C", str(source), "config", name, value], check=True)
        commit(source, "feat: initialize real reference acceptance")
        env = {**os.environ, "PLUGIN_SIGNING_KEY_ID": "disposable",
               "PLUGIN_SIGNING_KEY_B64": base64.b64encode(key.private_bytes_raw()).decode()}
        first = releases(source, env)
        # A real source input changes, so the existing version policy builds a patch.
        for name in NAMES:
            path = source / "examples" / name / "README.md"
            with path.open("a", encoding="utf-8") as stream:
                stream.write("\nDisposable lifecycle acceptance patch.\n")
        commit(source, "fix: document acceptance transition")
        second = releases(source, env)
        # Package-side permission delta; the HTTP acceptance independently tests
        # actual grants and rejection/staging while the old package stays active.
        for name in NAMES:
            path = source / "examples" / name / "manifest.json"
            manifest = json.loads(path.read_text(encoding="utf-8"))
            ref = {"name": "media.read", "version": 1}
            manifest["capabilities"].append(ref)
            manifest["permissions"].append({"capability": ref, "rationale": "Disposable permission delta"})
            path.write_text(json.dumps(manifest), encoding="utf-8")
        commit(source, "feat: exercise permission transition")
        third = releases(source, env)
        verifier = PluginPackageVerifier({"disposable": TrustedPublisher(
            key_id="disposable", public_key=public, publisher=record["publisher"],
            status="active", plugin_id_prefixes=("example.",))})
        supervisor = PluginSupervisor(work / "workers", work / "runtime/.storage")
        supervisor.probe_isolation()
        registry = PluginRegistry(work / "runtime", supervisor)
        try:
            for plugin_id, package in first.items():
                identity = str(uuid4())

                def active():
                    return next(p for p in registry.list() if p["plugin_id"] == plugin_id)

                def install(path, replace=False):
                    verifier.inspect(path)
                    operation = str(uuid4())
                    registry.install_package(path.read_bytes(), path.name,
                        installation_id=identity, replace=replace, operation_id=operation,
                        expected_version=active()["version"] if replace else None)
                    try:
                        registry.start(plugin_id)
                    except RuntimePolicyError as exc:
                        assert "permission commit" in str(exc)
                    else:
                        raise AssertionError("uncommitted package started")
                    registry.finish_installation(plugin_id, operation, commit=True)
                    registry.start(plugin_id, user_id="acceptance-user")
                    assert registry.health(plugin_id), registry.diagnostics(plugin_id)
                    registry.finish_activation(plugin_id, operation, commit=True)

                install(package)
                settings = {"display_mode": "compact", "query": "Acceptance"}
                registry.settings(plugin_id, settings)
                registry.storage_put(plugin_id, "users/acceptance-user/sentinel", "persisted")
                storage = work / "runtime/.storage" / plugin_id
                configuration = work / "runtime/.configuration" / f"{plugin_id}.json"
                baseline = {p.relative_to(storage): p.read_bytes() for p in storage.rglob("*") if p.is_file()}
                assert baseline

                def preserved():
                    assert active()["installation_id"] == identity
                    assert json.loads(configuration.read_text(encoding="utf-8")) == settings
                    assert all((storage / p).read_bytes() == data for p, data in baseline.items())
                    assert registry.health(plugin_id)

                supervisor.stop_all()
                supervisor = PluginSupervisor(work / "workers", work / "runtime/.storage")
                supervisor.probe_isolation()
                registry = PluginRegistry(work / "runtime", supervisor)
                registry.restore_enabled()
                preserved()
                registry.stop(plugin_id)
                assert active()["enabled"] is False
                registry.start(plugin_id)
                preserved()
                install(second[plugin_id], replace=True)
                preserved()
                with zipfile.ZipFile(package) as archive:
                    assert active()["version"] != json.loads(archive.read("manifest.json"))["version"]
                # Runtime rollback installs its own retained package, never a fake host.
                history = active()["history"][0]
                rollback = work / "rollback.utp"
                rollback.write_bytes(base64.b64decode(registry.package_archive(plugin_id, history["id"])["package"]))
                install(rollback, replace=True)
                assert active()["version"] == history["version"]
                preserved()
                install(third[plugin_id], replace=True)
                assert any(p["capability"]["name"] == "media.read" for p in registry.package(plugin_id)[1]["permissions"])
                preserved()
                reinstall = work / "reinstall.utp"
                reinstall.write_bytes(base64.b64decode(registry.package_archive(plugin_id)["package"]))
                install(reinstall, replace=True)
                preserved()
                registry.stop(plugin_id)
                registry.purge_data(plugin_id)
                assert not configuration.exists() and not storage.exists()
                registry.start(plugin_id)
                assert registry.health(plugin_id)
                registry.delete(plugin_id)
                assert not storage.exists()
                assert all(p["plugin_id"] != plugin_id for p in registry.list())
                print(f"{plugin_id}: real install/configure/start/restart/disable/update/permission transaction/rollback/reinstall/purge/uninstall passed")
        finally:
            supervisor.stop_all()


if __name__ == "__main__":
    main()
