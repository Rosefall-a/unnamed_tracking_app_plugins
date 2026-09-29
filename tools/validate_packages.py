"""Validate package-level invariants that the host relies on before installation."""

from __future__ import annotations

import json
from pathlib import Path
import sys
import zipfile


def validate_package(path: Path) -> None:
    with zipfile.ZipFile(path) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        payload_names = {
            name.removeprefix("payload/")
            for name in archive.namelist()
            if name.startswith("payload/") and not name.endswith("/")
        }

    capabilities = {
        (item.get("name"), item.get("version"))
        for item in manifest.get("capabilities", [])
        if isinstance(item, dict)
    }
    for permission in manifest.get("permissions", []):
        if not isinstance(permission, dict):
            raise ValueError(f"{path.name}: permission declaration must be an object")
        capability = permission.get("capability")
        if not isinstance(capability, dict):
            raise ValueError(f"{path.name}: permission capability must be an object")
        key = (capability.get("name"), capability.get("version"))
        if key not in capabilities:
            raise ValueError(
                f"{path.name}: permission {capability.get('name')!r} v{capability.get('version')!r} "
                "is not declared by capabilities"
            )

    frontend = manifest.get("frontend")
    if frontend is None:
        return
    entry = frontend.get("entry") if isinstance(frontend, dict) else None
    if not isinstance(entry, str) or not entry:
        raise ValueError(f"{path.name}: frontend.entry must be a non-empty string")
    if entry not in payload_names:
        raise ValueError(f"{path.name}: frontend.entry {entry!r} is not present in the package payload")


def main() -> None:
    paths = [Path(value) for value in sys.argv[1:]]
    if not paths:
        raise SystemExit("at least one package path is required")
    for package in paths:
        validate_package(package)


if __name__ == "__main__":
    main()
