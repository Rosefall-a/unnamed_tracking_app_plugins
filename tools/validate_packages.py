"""Validate package-level invariants that the host relies on before installation."""

from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path

ROUTE_ID = re.compile(r"^[a-z0-9][a-z0-9._-]{0,127}$")
ROUTE_HANDLER = re.compile(r"^[A-Za-z_][A-Za-z0-9_.-]*(?::[A-Za-z_][A-Za-z0-9_]*)?$")
ROUTE_SEGMENT = re.compile(r"^(?:[a-z0-9][a-z0-9._-]*|\{[a-z_][a-z0-9_]*\})$")
ROUTE_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}
RESERVED_PLUGIN_ROUTE_ROOTS = {
    "actions",
    "changelog",
    "capabilities",
    "disable",
    "enable",
    "frontend",
    "logs",
    "native-frontend",
    "permissions",
    "retry",
    "secrets",
    "settings",
    "ui",
    "update",
}


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

    route_ids: set[str] = set()
    route_owners: list[tuple[str, str, str]] = []
    for route in manifest.get("backend_routes", []):
        if not isinstance(route, dict):
            raise ValueError(f"{path.name}: backend route must be an object")
        route_id = route.get("id")
        scope = route.get("scope", "plugin")
        route_path = route.get("path")
        methods = route.get("methods", ["GET"])
        handler = route.get("handler")
        if not isinstance(route_id, str) or not ROUTE_ID.fullmatch(route_id):
            raise ValueError(f"{path.name}: backend route id is invalid")
        if route_id in route_ids:
            raise ValueError(f"{path.name}: backend route ids must be unique")
        route_ids.add(route_id)
        if scope not in {"plugin", "host"} or not isinstance(route_path, str):
            raise ValueError(f"{path.name}: backend route scope or path is invalid")
        if scope == "plugin" and route_path.startswith("/"):
            raise ValueError(f"{path.name}: plugin backend route path must be relative")
        if (
            scope == "plugin"
            and route_path.split("/", 1)[0] in RESERVED_PLUGIN_ROUTE_ROOTS
        ):
            raise ValueError(
                f"{path.name}: backend route conflicts with plugin management"
            )
        if scope == "host" and not route_path.startswith("/api/"):
            raise ValueError(
                f"{path.name}: host backend route path must start with /api/"
            )
        if scope == "host" and route_path.startswith("/api/plugins/"):
            raise ValueError(f"{path.name}: host route cannot claim plugin management")
        route_parts = route_path.removeprefix("/api/").split("/")
        if not route_parts or any(
            not ROUTE_SEGMENT.fullmatch(part) for part in route_parts
        ):
            raise ValueError(f"{path.name}: backend route path is invalid")
        parameters = [part for part in route_parts if part.startswith("{")]
        if len(parameters) != len(set(parameters)):
            raise ValueError(f"{path.name}: backend route repeats a path parameter")
        if (
            not isinstance(methods, list)
            or not methods
            or len(methods) != len(set(methods))
            or any(method not in ROUTE_METHODS for method in methods)
        ):
            raise ValueError(f"{path.name}: backend route methods are invalid")
        if not isinstance(handler, str) or not ROUTE_HANDLER.fullmatch(handler):
            raise ValueError(f"{path.name}: backend route handler is invalid")
        required = (
            "backend.routes.plugin" if scope == "plugin" else "backend.routes.host"
        )
        capability_names = {name for name, version in capabilities if version == 1}
        if not {required, "backend.routes", "api.full"}.intersection(capability_names):
            raise ValueError(f"{path.name}: backend route requires {required}")
        for method in methods:
            for owner_scope, owner_path, owner_method in route_owners:
                owner_parts = owner_path.removeprefix("/api/").split("/")
                overlaps = len(route_parts) == len(owner_parts) and all(
                    left == right or left.startswith("{") or right.startswith("{")
                    for left, right in zip(route_parts, owner_parts, strict=True)
                )
                if scope == owner_scope and method == owner_method and overlaps:
                    raise ValueError(f"{path.name}: backend routes conflict")
            route_owners.append((scope, route_path, method))

    native = manifest.get("native_frontend")
    if native is not None:
        if not isinstance(native, dict) or ("frontend.native", 1) not in capabilities:
            raise ValueError(f"{path.name}: native frontend requires frontend.native")
        entry = native.get("entry")
        styles = native.get("styles", [])
        if not isinstance(entry, str) or not isinstance(styles, list):
            raise ValueError(f"{path.name}: invalid native frontend declaration")
        for asset in [entry, *styles]:
            if (
                not isinstance(asset, str)
                or not asset.startswith("native/")
                or "\\" in asset
                or any(part in {"", ".", ".."} for part in asset.split("/"))
                or asset not in payload_names
            ):
                raise ValueError(f"{path.name}: native asset is unsafe or missing")

    frontend = manifest.get("frontend")
    if frontend is None:
        return
    entry = frontend.get("entry") if isinstance(frontend, dict) else None
    if isinstance(frontend, dict) and type(frontend.get("inline_assets", False)) is not bool:
        raise ValueError(f"{path.name}: frontend.inline_assets must be a boolean")
    if not isinstance(entry, str) or not entry:
        raise ValueError(f"{path.name}: frontend.entry must be a non-empty string")
    if entry not in payload_names:
        raise ValueError(
            f"{path.name}: frontend.entry {entry!r} is not present in the package payload"
        )


def main() -> None:
    paths = [Path(value) for value in sys.argv[1:]]
    if not paths:
        raise SystemExit("at least one package path is required")
    for package in paths:
        validate_package(package)


if __name__ == "__main__":
    main()
