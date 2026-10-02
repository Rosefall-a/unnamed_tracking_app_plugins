"""Reject broken documentation references before publishing the wiki."""
import hashlib
import json
from pathlib import Path

import pytest

from tools.check_docs import check


def documentation(root: Path, body: str):
    (root / "docs").mkdir()
    (root / "mkdocs.yml").write_text(
        "site_name: Documentation fixture\ndocs_dir: docs\nnav:\n  - Home: index.md\n",
        encoding="utf-8",
    )
    (root / "README.md").write_text("[Wiki](docs/index.md)", encoding="utf-8")
    (root / "docs/index.md").write_text(body, encoding="utf-8")


def test_current_documentation_references_exist():
    check()


def test_relocated_wiki_config_resolves_from_its_directory(tmp_path):
    documentation(tmp_path, "# Home")
    wiki = tmp_path / "wiki"
    wiki.mkdir()
    (tmp_path / "docs").rename(wiki / "docs")
    (tmp_path / "mkdocs.yml").rename(wiki / "mkdocs.yml")
    (tmp_path / "mkdocs.yml").write_text(
        "INHERIT: wiki/mkdocs.yml\ndocs_dir: wiki/docs\n", encoding="utf-8"
    )
    (tmp_path / "README.md").write_text("[Wiki](wiki/docs/index.md)", encoding="utf-8")
    check(tmp_path)
    (wiki / "docs/index.md").write_text("[Missing](missing.md)", encoding="utf-8")
    with pytest.raises(ValueError, match="missing"):
        check(tmp_path)


@pytest.mark.parametrize("body", [
    "[Missing](missing.md)", "![Missing image](missing.png)",
    '<img src="missing.png">', '[Reference][target]\n\n[target]: missing.md',
    "```sh\npython tools/missing.py\n```", "```sh\nnode --test tests/missing.test.mjs\n```",
    "```sh\npython -m pytest tests/test_missing.py\n```",
    "[Outside](../../outside.md)",
])
def test_missing_references_fail(tmp_path, body):
    documentation(tmp_path, body)
    with pytest.raises(ValueError, match="missing"):
        check(tmp_path)


def test_missing_navigation_fails(tmp_path):
    documentation(tmp_path, "# Home")
    (tmp_path / "docs/index.md").unlink()
    with pytest.raises(ValueError, match="navigation"):
        check(tmp_path)


def test_examples_remote_links_and_escaped_paths_are_handled(tmp_path):
    documentation(tmp_path, "[Asset](my%20asset.png)\n[Remote](https://example.org/manual)\n"
                  "`examples/my-new-plugin/plugin.py`\n```text\n[not a link](missing)\n```\n"
                  '```sh\npython -m pytest "$HOST_BACKEND/tests/test_host.py"\n```')
    (tmp_path / "docs/my asset.png").write_bytes(b"fixture")
    check(tmp_path)


@pytest.mark.parametrize("manifest", ["host-components.json", "workflow-captures.json"])
def test_screenshot_provenance_detects_changed_bytes(tmp_path, manifest):
    documentation(tmp_path, "# Home")
    assets = tmp_path / "docs/assets/screenshots"
    assets.mkdir(parents=True)
    (assets / "capture.png").write_bytes(b"original")
    (assets / manifest).write_text(json.dumps({"captures": [{
        "filename": "capture.png", "sha256": hashlib.sha256(b"original").hexdigest(),
    }]}), encoding="utf-8")
    check(tmp_path)
    (assets / "capture.png").write_bytes(b"changed")
    with pytest.raises(ValueError, match="changed screenshot"):
        check(tmp_path)
