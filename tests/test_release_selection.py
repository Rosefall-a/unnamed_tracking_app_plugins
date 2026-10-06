"""Release changes use the existing version policy, including layout changes."""
import json
import shutil

from test_release_lifecycle import checkout, commit, records, run_build
from tools.distribution import ROOT


def test_explicit_version_override_survives_automatic_selection(checkout):
    root, env = checkout
    run_build(root, env, "--publish")
    commit(root, "chore: publish initial package")
    path = root / "examples/help-button/manifest.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    manifest["version"] = "4.3.2"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    commit(root, "fix: explicitly release a compatibility version")
    run_build(root, env, "--publish")
    assert records(root)[-1]["version"] == "4.3.2"
    assert records(root)[-1]["automatic_update"] is False


def test_moves_preserve_old_commit_version_intent(checkout):
    root, env = checkout
    run_build(root, env, "--publish")
    commit(root, "chore: publish initial package")
    path = root / "examples/help-button/plugin.py"
    path.write_text(path.read_text(encoding="utf-8") + "\n# added feature\n", encoding="utf-8")
    commit(root, "feat: extend the existing plugin")
    (root / "examples/help-button").rename(root / "examples/capability-showcase")
    commit(root, "chore: clarify the source directory name")
    run_build(root, env, "--publish")
    assert records(root)[-1]["version"] == "2.1.0"
    assert records(root)[0]["build"]["source_path"] == "examples/help-button"
    assert records(root)[-1]["build"]["source_path"] == "examples/capability-showcase"


def test_only_changed_plugin_releases_but_shared_sdk_releases_every_consumer(checkout):
    root, env = checkout
    shutil.copytree(ROOT / "examples/ui-api", root / "examples/ui-api")
    commit(root, "feat: add a second real source")
    run_build(root, env, "--publish")
    commit(root, "chore: publish both packages")
    other = root / "releases/example.ui-api.json"
    original = other.read_bytes()
    path = root / "examples/help-button/README.md"
    path.write_text(path.read_text(encoding="utf-8") + "\nDocumentation correction.\n", encoding="utf-8")
    commit(root, "fix: correct one plugin's documentation")
    run_build(root, env, "--publish")
    assert other.read_bytes() == original
    assert records(root)[-1]["version"] == "2.0.1"
    commit(root, "chore: publish documentation correction")
    path = root / "sdk/plugin_protocol.py"
    path.write_text(path.read_text(encoding="utf-8") + "\n# shared compatibility change\n", encoding="utf-8")
    commit(root, "feat: extend shared protocol documentation")
    run_build(root, env, "--publish")
    assert records(root)[-1]["version"] == "2.1.0"
    assert len(json.loads(other.read_text(encoding="utf-8"))["releases"]) == 2
