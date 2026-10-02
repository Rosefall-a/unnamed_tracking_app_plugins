"""Independent publishers use the same builder/signing/catalogue v1 contract."""
import base64
import hashlib
import json
import os
import subprocess
import sys
import zipfile

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from test_author_tutorial import tutorial_project
from test_release_lifecycle import commit, run_build


def test_independent_catalogue_has_real_hashes_signatures_and_history(tmp_path):
    source = tutorial_project(tmp_path)
    plugin_id = "org.community.library-summary"
    for name in ("manifest.json", "ui.json"):
        path = source / name
        path.write_text(path.read_text(encoding="utf-8").replace("org.example.library-summary", plugin_id), encoding="utf-8")
    metadata = {"schema_version": 1, "publisher": "Community Test Publisher", "tags": ["games"],
                "icon": None, "automatic_update": False, "release_notes": "Initial community release"}
    (source / "release.json").write_text(json.dumps(metadata), encoding="utf-8")
    (tmp_path / "catalogue.json").write_text(json.dumps({"name": "Community Test Catalogue", "base_url": "https://community.example.org/plugins"}), encoding="utf-8")
    key = Ed25519PrivateKey.generate()
    public = key.public_key().public_bytes_raw()
    encoded = base64.b64encode(public).decode()
    (tmp_path / "publishers/community.public-key.b64").write_text(encoded, encoding="utf-8")
    record = {"key_id": "community", "publisher": metadata["publisher"], "status": "active",
              "public_key_file": "community.public-key.b64", "public_key_b64": encoded,
              "public_key_sha256": hashlib.sha256(public).hexdigest(), "plugin_id_prefixes": ["org.community."]}
    (tmp_path / "publishers/registry.json").write_text(json.dumps({"schema_version": 1, "publishers": [record]}), encoding="utf-8")
    env = {**os.environ, "PLUGIN_SIGNING_KEY_ID": "community", "PLUGIN_SIGNING_KEY_B64": base64.b64encode(key.private_bytes_raw()).decode()}
    subprocess.run(["git", "init", str(tmp_path)], check=True, capture_output=True)
    for name, value in (("user.name", "Test"), ("user.email", "community@example.invalid")):
        subprocess.run(["git", "-C", str(tmp_path), "config", name, value], check=True)
    commit(tmp_path, "feat: add independent community plugin")
    run_build(tmp_path, env, "--publish")
    first_list = json.loads((tmp_path / "list.json").read_text(encoding="utf-8"))
    first = first_list["plugins"][0]
    package = tmp_path / "dist" / first["package"]["filename"]
    original = package.read_bytes()
    assert first_list["version"] == 1 and first_list["name"] == "Community Test Catalogue"
    assert first["plugin_id"] == plugin_id and first["publisher"] == record["publisher"]
    assert first["url"] == "https://community.example.org/plugins/dist/" + package.name
    assert first["package_sha256"] == hashlib.sha256(original).hexdigest()
    with zipfile.ZipFile(package) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        assert first["manifest"] == manifest
        assert first["sha256"] == manifest["integrity"]["sha256"]
        key.public_key().verify(base64.b64decode(first["signing"]["signature"]),
                                b"plugin-package-v1:" + first["sha256"].encode())
    assert first["automatic_update"] is False
    commit(tmp_path, "chore: publish community release")
    metadata["automatic_update"] = True
    metadata["release_notes"] = "Permit automatic updates for this patch"
    (source / "release.json").write_text(json.dumps(metadata), encoding="utf-8")
    commit(tmp_path, "fix: update release policy")
    run_build(tmp_path, env, "--publish")
    latest = json.loads((tmp_path / "list.json").read_text(encoding="utf-8"))["plugins"][0]
    assert latest["version"] == "1.0.1" and latest["automatic_update"] is True
    assert latest["releases"][0] == first["releases"][0]
    assert package.read_bytes() == original
    subprocess.run([sys.executable, str(tmp_path / "tools/distribution.py"), "--check-source"], check=True)


@pytest.mark.parametrize("base", ["http://community.example.org", "https://u:p@community.example.org", "https://community.example.org?token=bad", "https://community.example.org/#fragment"])
def test_catalogue_requires_safe_https_base(base):
    from tools.distribution import validate_url
    with pytest.raises(ValueError):
        validate_url(base)
