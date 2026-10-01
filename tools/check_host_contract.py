"""Explicit cross-repository conformance check; never imported by plugin payloads.

Run with --host-root /path/to/unnamed_tracking_app on plugin-manager. Normal
plugin tests remain independent of host source. This tool calls real validators
and the installation registry, not host test fixtures. It does not enable code.
"""

from __future__ import annotations

import argparse
import sys
import tempfile
from pathlib import Path
from uuid import uuid4


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host-root", required=True, type=Path)
    parser.add_argument("--temporary-root", type=Path)
    args = parser.parse_args()
    sys.path.insert(0, str(args.host_root / "src/backend"))
    sys.path.insert(0, str(args.host_root / "src/plugin-runtime"))
    from runtime import PluginRegistry, PluginSupervisor, RuntimePolicyError
    from src.plugin_api.capabilities import capability_definition
    from src.plugin_api.contracts import Capability, PluginManifest, PluginUiDocument
    from src.plugin_api.updates import PackageVerificationError, PluginPackageVerifier

    root = Path(__file__).parents[1]
    with tempfile.TemporaryDirectory(dir=args.temporary_root) as temporary:
        work = Path(temporary)
        supervisor = PluginSupervisor(
            root=work / "workers", storage_root=work / "storage"
        )
        registry = PluginRegistry(work / "installed", supervisor)
        for name in ("help-button", "jellyfin-media-sync"):
            source = root / "examples" / name
            manifest = PluginManifest.model_validate_json(
                (source / "manifest.json").read_bytes()
            )
            document = PluginUiDocument.model_validate_json(
                (source / "ui.json").read_bytes()
            )
            assert manifest.plugin_id == document.plugin_id
            assert manifest.native_frontend is not None
            assert all(capability_definition(ref.name) for ref in manifest.capabilities)
            assert capability_definition(Capability.FRONTEND_NATIVE).highly_privileged
            for key in ("settings", "actions", "pages", "menus"):
                assert set(getattr(manifest.ui, key)) == {
                    x.id for x in getattr(document, key)
                }
            path = root / "dist" / f"{manifest.plugin_id}-{manifest.version}.utp"
            PluginPackageVerifier(require_signature=False).inspect(path)
            try:
                PluginPackageVerifier().inspect(path)
            except PackageVerificationError:
                pass
            else:
                raise AssertionError(
                    "Strict verifier accepted an unsigned development package"
                )
            installed = registry.install_package(
                path.read_bytes(), path.name, installation_id=str(uuid4())
            )
            assert installed["plugin_id"] == manifest.plugin_id
            assert installed["version"] == manifest.version
            item = next(
                item
                for item in registry.list()
                if item["plugin_id"] == manifest.plugin_id
            )
            assert item["enabled"] is False
            runtime_document = registry.ui(manifest.plugin_id)
            PluginUiDocument.model_validate(runtime_document)
            assert (
                runtime_document["native_frontend"]["entry"]
                == manifest.native_frontend.entry
            )
            try:
                registry.frontend(
                    manifest.plugin_id, manifest.native_frontend.entry, native=True
                )
            except RuntimePolicyError:
                pass
            else:
                raise AssertionError("Disabled native assets were served")
            print(
                f"{manifest.plugin_id}: strict manifest/UI, permissions, digest, real installation and disabled lifecycle passed"
            )


if __name__ == "__main__":
    main()
