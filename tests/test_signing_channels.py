"""The actual builder selects distinct folder signers and fails atomically."""
import base64
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from tools.distribution import ROOT
from tools.validate_packages import validate_package


def build(root, env, *flags):
    return subprocess.run([sys.executable, str(root / "tools/build_packages.py"), *flags],
                          env=env, capture_output=True, text=True)


@pytest.fixture
def scoped_checkout(tmp_path):
    for name in ("tools", "sdk"):
        shutil.copytree(ROOT / name, tmp_path / name, ignore=shutil.ignore_patterns("__pycache__"))
    shutil.copytree(ROOT / "official/pwa", tmp_path / "official/pwa")
    for folder, identity in (("examples", "example.signing"), ("plugins", "community.signing")):
        source = tmp_path / folder / "signing"
        shutil.copytree(ROOT / "official/pwa", source)
        manifest = json.loads((source / "manifest.json").read_text())
        manifest.update(plugin_id=identity, capabilities=[], permissions=[], pwa=None)
        (source / "manifest.json").write_text(json.dumps(manifest))
        document = json.loads((source / "ui.json").read_text())
        document["plugin_id"] = identity
        (source / "ui.json").write_text(json.dumps(document))
    records = []
    env = {k: v for k, v in os.environ.items() if not k.startswith("PLUGIN_" )}
    for channel, prefix, scope in (("official", "PLUGIN_OFFICIAL_SIGNING", "official."),
                                   ("demo", "PLUGIN_EXAMPLES_SIGNING", "example."),
                                   ("community", "PLUGIN_SIGNING", "community.")):
        key = Ed25519PrivateKey.generate()
        public = key.public_key().public_bytes_raw()
        encoded = base64.b64encode(public).decode()
        path = tmp_path / "publishers" / f"{channel}.public-key.b64"
        path.parent.mkdir(exist_ok=True)
        path.write_text(encoded)
        records.append({"key_id": channel, "publisher": "Unnamed Tracking Official", "channel": channel,
                        "public_key_file": path.name, "public_key_b64": encoded,
                        "public_key_sha256": hashlib.sha256(public).hexdigest(),
                        "status": "active", "plugin_id_prefixes": [scope]})
        env[prefix + "_KEY_ID"] = channel
        env[prefix + "_KEY_B64"] = base64.b64encode(key.private_bytes_raw()).decode()
    (tmp_path / "publishers/registry.json").write_text(json.dumps({"schema_version": 1, "publishers": records}))
    (tmp_path / ".gitignore").write_text(".validation/\n__pycache__/\n")
    subprocess.run(["git", "init", str(tmp_path)], check=True, capture_output=True)
    subprocess.run(["git", "-C", str(tmp_path), "config", "user.name", "Test"], check=True)
    subprocess.run(["git", "-C", str(tmp_path), "config", "user.email", "test@example.invalid"], check=True)
    subprocess.run(["git", "-C", str(tmp_path), "add", "."], check=True)
    subprocess.run(["git", "-C", str(tmp_path), "commit", "-m", "feat: prepare scoped signers"], check=True, capture_output=True)
    return tmp_path, env


def test_real_publish_uses_three_independent_keys(scoped_checkout):
    root, env = scoped_checkout
    result = build(root, env, "--publish")
    assert result.returncode == 0, result.stderr
    seen = {}
    for package in (root / "dist").glob("*.utp"):
        with zipfile.ZipFile(package) as archive:
            manifest = json.loads(archive.read("manifest.json"))
            assert manifest["integrity"]["signature"].startswith("v2:")
            seen[manifest["plugin_id"]] = manifest["integrity"]["key_id"]
        result = subprocess.run([sys.executable, str(root / "tools/verify_packages.py"), str(package)], capture_output=True, text=True)
        assert result.returncode == 0, result.stderr
    assert seen == {"official.pwa": "official", "example.signing": "demo", "community.signing": "community"}


@pytest.mark.parametrize("defect", ["missing", "partial", "malformed", "demo", "unknown"])
def test_official_signing_failure_never_publishes_or_downgrades(scoped_checkout, defect):
    root, env = scoped_checkout
    if defect == "missing":
        env.pop("PLUGIN_OFFICIAL_SIGNING_KEY_ID")
        env.pop("PLUGIN_OFFICIAL_SIGNING_KEY_B64")
        env["PLUGIN_SIGNING_FALLBACK"] = "unsigned"
    elif defect == "partial":
        env.pop("PLUGIN_OFFICIAL_SIGNING_KEY_ID")
    elif defect == "malformed":
        env["PLUGIN_OFFICIAL_SIGNING_KEY_B64"] = "not base64"
    elif defect == "demo":
        for suffix in ("_KEY_ID", "_KEY_B64"):
            env["PLUGIN_OFFICIAL_SIGNING" + suffix] = env["PLUGIN_EXAMPLES_SIGNING" + suffix]
    else:
        env["PLUGIN_OFFICIAL_SIGNING_KEY_ID"] = "unknown"
    result = build(root, env, "--publish")
    assert result.returncode != 0
    assert not (root / "list.json").exists()
    assert not (root / "dist").exists()


def test_unsigned_preview_is_explicit_and_keeps_zero_zero_version(scoped_checkout):
    root, env = scoped_checkout
    env = {k: v for k, v in env.items() if "SIGNING_KEY" not in k}
    env["PLUGIN_SIGNING_FALLBACK"] = "unsigned"
    result = build(root, env)
    assert result.returncode == 0, result.stderr
    with zipfile.ZipFile(root / ".validation/dist/official.pwa-0.0.1.utp") as archive:
        manifest = json.loads(archive.read("manifest.json"))
        assert manifest["version"] == "0.0.1"
        assert manifest["integrity"]["signature"] is None
        assert manifest["integrity"]["key_id"] is None
    assert not (root / "list.json").exists()


def test_changed_pwa_needs_explicit_patch_even_after_breaking_commit(scoped_checkout):
    root, env = scoped_checkout
    result = build(root, env, "--publish")
    assert result.returncode == 0, result.stderr
    subprocess.run(["git", "-C", str(root), "add", "."], check=True)
    subprocess.run(["git", "-C", str(root), "commit", "-m", "chore: retain signed releases"], check=True, capture_output=True)
    readme = root / "official/pwa/README.md"
    readme.write_text(readme.read_text() + "\nChanged behavior.\n")
    subprocess.run(["git", "-C", str(root), "add", "."], check=True)
    subprocess.run(["git", "-C", str(root), "commit", "-m", "feat!: change PWA behavior"], check=True, capture_output=True)
    result = build(root, env, "--publish")
    assert result.returncode != 0
    assert "explicit new 0.0.x patch" in result.stderr
    assert {p.name for p in (root / "dist").glob("official.pwa-*.utp")} == {"official.pwa-0.0.1.utp"}


@pytest.mark.parametrize("version", ["0.1.0", "1.0.0"])
def test_pwa_stable_promotion_is_rejected(scoped_checkout, version):
    root, env = scoped_checkout
    path = root / "official/pwa/manifest.json"
    manifest = json.loads(path.read_text())
    manifest["version"] = version
    path.write_text(json.dumps(manifest))
    result = build(root, env)
    assert result.returncode != 0
    assert "must remain 0.0.x" in result.stderr
    assert not (root / ".validation/list.json").exists()


def test_packaged_pwa_rejects_source_provenance_drift(scoped_checkout):
    root, env = scoped_checkout
    result = build(root, env)
    assert result.returncode == 0, result.stderr
    source = root / ".validation/dist/official.pwa-0.0.1.utp"
    changed = root / "changed.utp"
    with zipfile.ZipFile(source) as original, zipfile.ZipFile(changed, "w") as archive:
        for name in original.namelist():
            data = original.read(name)
            if name == "payload/pwa/offline.html":
                data += b"<!-- changed -->"
            archive.writestr(name, data)
    with pytest.raises(ValueError, match="provenance hash differs"):
        validate_package(changed, full=True)
