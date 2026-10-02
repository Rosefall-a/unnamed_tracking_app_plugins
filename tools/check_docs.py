"""Check wiki navigation, local Markdown/HTML links and executable source paths.

MkDocs validates rendered wiki links. This complements it with repository links
(including README) and file paths inside shell commands, without network access.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

import markdown
import yaml

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets: list[str] = []

    def handle_starttag(self, tag, attributes):
        for name, value in attributes:
            if value and ((tag == "a" and name == "href") or (tag in {"img", "source"} and name == "src")):
                self.targets.append(value)


def navigation_paths(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from navigation_paths(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from navigation_paths(item)


def check(root: Path = ROOT) -> None:
    root = root.resolve()
    config = yaml.safe_load((root / "mkdocs.yml").read_text(encoding="utf-8"))
    docs = root / config.get("docs_dir", "docs")
    errors = []
    for target in navigation_paths(config["nav"]):
        if not (docs / target).is_file():
            errors.append(f"mkdocs.yml: missing navigation page {target}")
    pages = [root / "README.md", *sorted(docs.rglob("*.md"))]
    for page in pages:
        source = page.read_text(encoding="utf-8")
        links = Links()
        links.feed(markdown.markdown(source, extensions=["fenced_code", "tables"]))
        for target in links.targets:
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            path = (root if parsed.path.startswith("/") else page.parent) / unquote(parsed.path).lstrip("/")
            if not path.resolve().is_relative_to(root) or not path.exists():
                errors.append(f"{page.relative_to(root)}: missing local link {target}")
        # Validate commands, including fenced blocks, rather than illustrative
        # author-created paths such as examples/library-summary/manifest.json.
        for target in re.findall(r"\b(?:python(?:3)?|node(?:\s+--[\w-]+)*)\s+((?:tools|tests|sdk)/[\w./-]+\.(?:py|mjs|cjs|js))\b", source):
            if not (root / target).is_file():
                errors.append(f"{page.relative_to(root)}: missing command source {target}")
        for command in re.findall(r"\b(?:python(?:3)?\s+-m\s+pytest|pytest)\s+([^\n]+)", source):
            # A variable-qualified host path is external, not a repository path.
            for target in re.findall(r"(?<![/\w])(tests/[\w./-]+\.py)\b", command):
                if not (root / target).is_file():
                    errors.append(f"{page.relative_to(root)}: missing test command source {target}")
    provenance = docs / "assets/screenshots/host-components.json"
    if provenance.exists():
        for capture in json.loads(provenance.read_bytes())["captures"]:
            asset = provenance.parent / capture["filename"]
            if (not asset.resolve().is_relative_to(provenance.parent.resolve())
                    or not asset.is_file()
                    or hashlib.sha256(asset.read_bytes()).hexdigest() != capture["sha256"]):
                errors.append(f"{provenance.relative_to(root)}: missing or changed screenshot {capture['filename']}")
    if errors:
        raise ValueError("\n".join(errors))
    print(f"Validated navigation, links and command paths in {len(pages)} documentation pages")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    check(parser.parse_args().root)
