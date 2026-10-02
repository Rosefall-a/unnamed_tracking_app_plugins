"""The documented first plugin is the fixture: no hidden replacement example."""
import json
import re
import shutil
import subprocess
import sys
import zipfile

from tools.distribution import ROOT
from tools.validate_packages import validate_package
from tools.verify_packages import verify_package


def tutorial_project(root):
    shutil.copyfile(ROOT / ".gitignore", root / ".gitignore")
    for directory in ("tools", "sdk", "publishers"):
        shutil.copytree(ROOT / directory, root / directory,
                        ignore=shutil.ignore_patterns("__pycache__"))
    page = (ROOT / "wiki/docs/getting-started/first-plugin.md").read_text(encoding="utf-8")
    blocks = re.findall(r"<!-- tutorial: ([\w.]+) -->\n```\w+\n(.*?)\n```", page, re.S)
    assert {name for name, _ in blocks} == {"manifest.json", "plugin.py", "ui.json", "README.md"}
    source = root / "examples/library-summary"
    source.mkdir(parents=True)
    for name, content in blocks:
        (source / name).write_text(content + "\n", encoding="utf-8")
    return source


def test_exact_tutorial_builds_and_runs_packaged_action(tmp_path):
    tutorial_project(tmp_path)
    output = tmp_path / "preview"
    subprocess.run([sys.executable, str(tmp_path / "tools/build_packages.py"),
                    "--output-root", str(output)], check=True)
    package = output / "dist/org.example.library-summary-1.0.0.utp"
    validate_package(package, full=True)
    verify_package(package)
    unpacked = tmp_path / "unpacked"
    with zipfile.ZipFile(package) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        assert manifest["integrity"]["signature"] is None
        for name in archive.namelist():
            if name.startswith("payload/"):
                path = unpacked / name.removeprefix("payload/")
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(archive.read(name))
    # Only protocol input is a fixture: the exact packaged action + SDK execute.
    result = subprocess.run([sys.executable, "-c", "import json,plugin; print(json.dumps(plugin.summarize({})))"],
        cwd=unpacked, input=json.dumps({"payload": {"games": [{"id": str(i)} for i in range(3)]}}) + "\n",
        text=True, capture_output=True, check=True)
    request, result = map(json.loads, result.stdout.splitlines())
    assert request == {"api_version": "v1", "method": "games.list", "capability": "games.read", "payload": {"limit": 50}}
    assert result == {"game_count": 3}
