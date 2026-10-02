"""Verify the real document artifact and execute its packaged public SDK handlers."""

import hashlib
import json
import subprocess
import sys
import zipfile
from pathlib import Path

import pytest
from test_domain_plugins import load_plugin

from tools.validate_packages import validate_package

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "examples/scoped-document-viewer"


def test_document_package_contains_current_source_and_pinned_libraries(current_packages):
    package = current_packages["example.scoped-document-viewer"]
    lock = json.loads((SOURCE / "vendor-lock.json").read_text())
    with zipfile.ZipFile(package) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        assert package.name == f"{manifest['plugin_id']}-{manifest['version']}.utp"
        assert (
            manifest["integrity"]["signature"] is None
            or manifest["integrity"]["key_id"]
        )
        assert {item["name"] for item in manifest["capabilities"]} == {
            "documents.read",
            "backend.routes.plugin",
            "frontend.context.documents",
        }
        for path in (SOURCE / "frontend").rglob("*"):
            if path.is_file():
                assert (
                    archive.read("payload/" + path.relative_to(SOURCE).as_posix())
                    == path.read_bytes()
                )
        for name in ("plugin.py", "ui.json"):
            assert archive.read("payload/" + name) == (SOURCE / name).read_bytes()
        for record in lock.values():
            assert record["integrity"].startswith("sha512-")
            for name, expected_hash in record["files"].items():
                content = archive.read("payload/frontend/vendor/" + name)
                assert hashlib.sha256(content).hexdigest() == expected_hash


def test_actual_packaged_sdk_emits_bounded_scoped_document_request(tmp_path, current_packages):
    with zipfile.ZipFile(current_packages["example.scoped-document-viewer"]) as archive:
        for name in archive.namelist():
            if name.startswith("payload/") and not name.endswith("/"):
                path = tmp_path / name.removeprefix("payload/")
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(archive.read(name))
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            "import json, plugin; print(json.dumps(plugin.read_document_route({'path_parameters': {'document_id': 'opaque-id'}, 'query': {'offset': ['24576'], 'content_sha256': ['digest']}})))",
        ],
        cwd=tmp_path,
        input=json.dumps(
            {
                "payload": {
                    "error": {
                        "kind": "missing",
                        "message": "Document not found.",
                        "status_code": 404,
                    }
                }
            }
        )
        + "\n",
        text=True,
        capture_output=True,
        check=True,
    )
    wire, response = map(json.loads, result.stdout.splitlines())
    assert wire == {
        "api_version": "v1",
        "method": "documents.read",
        "capability": "documents.read",
        "payload": {
            "document_id": "opaque-id",
            "chunk_bytes": 24576,
            "offset": 24576,
            "content_sha256": "digest",
        },
    }
    assert response["status_code"] == 404
    assert response["body"]["error"]["kind"] == "missing"
    assert "user_id" not in wire["payload"]


def test_package_validator_rejects_a_non_boolean_inline_asset_flag(tmp_path, current_packages):
    destination = tmp_path / "invalid-inline.utp"
    with zipfile.ZipFile(current_packages["example.scoped-document-viewer"]) as source, zipfile.ZipFile(destination, "w") as output:
        for name in source.namelist():
            data = source.read(name)
            if name == "manifest.json":
                manifest = json.loads(data)
                manifest["frontend"]["inline_assets"] = "true"
                data = json.dumps(manifest).encode()
            output.writestr(name, data)
    with pytest.raises(ValueError, match="inline_assets must be a boolean"):
        validate_package(destination)


def test_document_routes_preserve_explicit_failures_and_pagination(monkeypatch):
    plugin = load_plugin("scoped-document-viewer")
    calls = []

    def request(method, capability, payload):
        calls.append((method, capability, payload))
        if method == "documents.list":
            return {"documents": [], "next_offset": None}
        return {
            "error": {"kind": "oversized", "message": "5 MiB limit", "status_code": 413}
        }

    monkeypatch.setattr(plugin, "request", request)
    result = plugin.list_documents_route(
        {"query": {"limit": ["200"], "offset": ["32"]}}
    )
    assert result["body"]["next_offset"] is None
    assert calls[-1][2] == {"limit": 32, "offset": 32}
    result = plugin.read_document_route(
        {"path_parameters": {"document_id": "opaque-id"}}
    )
    assert result["status_code"] == 413
    assert (
        plugin.list_documents_route({"query": {"offset": ["invalid"]}})["status_code"]
        == 422
    )
    assert (
        plugin.read_document_route(
            {
                "path_parameters": {"document_id": "opaque-id"},
                "query": {"offset": ["invalid"]},
            }
        )["status_code"]
        == 422
    )
