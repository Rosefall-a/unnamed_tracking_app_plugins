"""Vendor pinned renderer libraries as classic scripts for the opaque-origin sandbox.

Verify npm's SHA-512 integrity before extracting. No CDN or runtime fetch is used.
The PDF display/worker modules are wrapped unchanged except their module exports
and import.meta.url; both run in the iframe through PDF.js's built-in fake worker.
"""

import base64
import hashlib
import io
import json
import re
import tarfile
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "examples/scoped-document-viewer/frontend/vendor"
LOCK = ROOT / "examples/scoped-document-viewer/vendor-lock.json"
VERSIONS = {"dompurify": "3.4.14", "pdfjs-dist": "5.6.205", "js-sha256": "0.11.1", "fflate": "0.8.3"}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    previous = json.loads(LOCK.read_text()) if LOCK.exists() else {}
    records = {}
    for name, version in VERSIONS.items():
        with urlopen(
            f"https://registry.npmjs.org/{name}/{version}", timeout=30
        ) as response:
            metadata = json.load(response)
        integrity = metadata["dist"]["integrity"]
        if name in previous and previous[name]["integrity"] != integrity:
            raise ValueError("Pinned library integrity changed")
        with urlopen(metadata["dist"]["tarball"], timeout=30) as response:
            data = response.read()
        actual = "sha512-" + base64.b64encode(hashlib.sha512(data).digest()).decode()
        if actual != integrity:
            raise ValueError("Library archive integrity mismatch")
        records[name] = {"version": version, "integrity": integrity, "files": {}}
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            if name == "dompurify":
                sources = {
                    "dist/purify.min.js": "purify.min.js",
                    "LICENSE": "dompurify.LICENSE",
                }
            elif name == "js-sha256":
                sources = {
                    "build/sha256.min.js": "sha256.min.js",
                    "LICENSE.txt": "sha256.LICENSE",
                }
            elif name == "fflate":
                sources = {"umd/index.js": "fflate.min.js", "LICENSE": "fflate.LICENSE"}
            else:
                sources = {
                    "build/pdf.mjs": "pdf.js",
                    "build/pdf.worker.mjs": "pdf.worker.js",
                    "LICENSE": "pdfjs.LICENSE",
                }
            for source, target in sources.items():
                content = archive.extractfile("package/" + source).read()
                if target in {"pdf.js", "pdf.worker.js"}:
                    text = content.decode()
                    text, count = re.subn(
                        r"^export \{[^}]+\};", "", text, flags=re.MULTILINE
                    )
                    if count != 1:
                        raise ValueError("Unexpected PDF.js module exports")
                    text = text.replace("import.meta.url", "__pdfScriptUrl")
                    text = re.sub(
                        r"^//# sourceMappingURL=.*$", "", text, flags=re.MULTILINE
                    )
                    content = (
                        "(() => { const __pdfScriptUrl = document.currentScript.src;\n"
                        + text
                        + "\n})();\n"
                    ).encode()
                (OUT / target).write_bytes(content)
                records[name]["files"][target] = hashlib.sha256(content).hexdigest()
    LOCK.write_text(json.dumps(records, indent=2) + "\n")


if __name__ == "__main__":
    main()
