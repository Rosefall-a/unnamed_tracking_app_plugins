from __future__ import annotations

import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parents[1]
OUT = ROOT / "dist"
OUT.mkdir(exist_ok=True)

PLUGINS = (
    "lifecycle",
    "events",
    "ui-api",
    "advanced",
    "notifications",
    "metadata",
    "events-filter",
    "playtime-report",
    "recently-played-notifier",
    "metadata-curator",
)

for name in PLUGINS:
    src = ROOT / "examples" / name
    files = {
        "plugin.py": (src / "plugin.py").read_bytes(),
        "sdk/plugin_protocol.py": (ROOT / "sdk/plugin_protocol.py").read_bytes(),
    }
    if (src / "ui.json").is_file():
        files["ui.json"] = (src / "ui.json").read_bytes()

    digest = hashlib.sha256()
    for path, data in sorted(files.items()):
        digest.update(path.encode())
        digest.update(b"\0")
        digest.update(data)
        digest.update(b"\0")

    manifest = json.loads((src / "manifest.json").read_text())
    manifest["integrity"]["sha256"] = digest.hexdigest()

    out = OUT / f'{manifest["plugin_id"]}-{manifest["version"]}.utp'
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, sort_keys=True, indent=2))
        for path, data in files.items():
            archive.writestr("payload/" + path, data)
    print(out)
