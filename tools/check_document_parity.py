"""Cross-repository verification against actual PR #241 source (test tooling only)."""

import argparse
import importlib.util
import mimetypes
import sys
import tempfile
from pathlib import Path


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reference", type=Path, required=True, help="PR #241 repository checkout"
    )
    parser.add_argument(
        "--host", type=Path, required=True, help="Updated plugin-manager checkout"
    )
    args = parser.parse_args()
    # Verification tooling only: the host policy now reuses its ownership query.
    # Packaged plugin source never imports host modules.
    sys.path.insert(0, str(args.host / "src/backend"))
    reference = load(
        "pr241_documents", args.reference / "src/backend/src/helpers/document_viewer.py"
    )
    host = load(
        "plugin_documents", args.host / "src/backend/src/plugin_api/documents.py"
    )
    mimetypes.add_type("application/ld+json", ".jsonld")
    cases = [
        (f"notes.{ext}", "café <script>literal</script>".encode())
        for ext in (
            "cfg",
            "conf",
            "csv",
            "ini",
            "json",
            "log",
            "md",
            "nfo",
            "properties",
            "toml",
            "txt",
            "xml",
            "yaml",
            "yml",
            "jsonld",
        )
    ]
    cases += [(f"manual.{ext}", b"%PDF-1.7\n% fixture") for ext in ("pdf", "bin")]
    cases += [
        (f"page.{ext}", b"<h1>Hello</h1><script>evil()</script>")
        for ext in ("html", "htm", "xhtml")
    ]
    cases += [
        ("empty.txt", b""),
        ("exact.txt", b"x" * host.MAX_DOCUMENT_BYTES),
        ("large.txt", b"x" * (host.MAX_DOCUMENT_BYTES + 1)),
        ("image.svg", b"<svg onload='evil()'/>"),
        ("broken.pdf", b"broken"),
        ("binary.txt", b"hello\x00world"),
        ("latin.txt", b"caf\xe9"),
        ("file.docx", b"PK zip"),
    ]
    # Confinement and authorization are separately exercised by real host SQL/HTTP tests.
    with tempfile.TemporaryDirectory(prefix="document-parity-") as directory:
        root = Path(directory)
        for name, content in cases:
            path = root / name
            path.write_bytes(content)
            try:
                response = reference.document_view_response(
                    path, name, allowed_root=root
                )
                expected = (
                    200,
                    response.media_type,
                    response.headers.get("x-document-format", "pdf"),
                )
            except reference.HTTPException as error:
                expected = (error.status_code, None, None)
            try:
                data, media_type, document_format, _digest = host.read_representation(
                    path
                )
                actual = (200, media_type, document_format)
                assert data == content
            except host.DocumentAccessError as error:
                actual = (error.status_code, None, None)
            assert actual == expected, (
                f"{name}: plugin {actual} differs from PR #241 {expected}"
            )
        for name in (
            "../secret.txt",
            r"..\secret.txt",
            "/tmp/secret.txt",
            r"C:\secret.txt",
            "a/b.txt",
            "..%2fsecret.txt",
        ):
            try:
                reference.safe_document_filename(name)
            except reference.HTTPException as error:
                assert error.status_code == 400
            else:
                raise AssertionError("PR unexpectedly accepts traversal")
            try:
                host.document_path(root, "owner", "Library", name)
            except host.DocumentAccessError as error:
                assert error.status_code == 400
            else:
                raise AssertionError("Plugin accepts traversal")
    print(
        f"PASS: {len(cases)} document cases and 6 traversal cases match actual PR #241 source."
    )
    print(
        "Intentional restrictions: PDF also has the platform's 5 MiB cap; native PDF controls, editing and upload/rename are not plugin APIs."
    )


if __name__ == "__main__":
    main()
