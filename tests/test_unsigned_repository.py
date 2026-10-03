"""Unsigned independent previews must not require publisher identities."""
import json
import os
import shutil
import subprocess
import sys

from tools.distribution import ROOT


def test_unsigned_repository_needs_no_publisher_registry(tmp_path):
    for name in ("tools", "sdk"):
        shutil.copytree(ROOT / name, tmp_path / name, ignore=shutil.ignore_patterns("__pycache__"))
    shutil.copytree(ROOT / "examples/ui-api", tmp_path / "plugins/my-plugin")
    (tmp_path / "publishers").mkdir()
    (tmp_path / "publishers/registry.json").write_text(json.dumps({"schema_version": 1, "publishers": []}))
    env = {key: value for key, value in os.environ.items() if not key.startswith("PLUGIN_SIGNING")}
    subprocess.run([sys.executable, str(tmp_path / "tools/build_packages.py")], env=env, check=True)
    data = json.loads((tmp_path / ".validation/list.json").read_text())
    assert data["plugins"][0]["signing"]["signature"] is None
