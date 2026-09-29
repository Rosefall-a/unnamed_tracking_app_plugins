from __future__ import annotations

from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from publisher_registry import PublisherRegistryError, load_registry, release_signer
from verify_packages import verify_package


def test_registry_matches_reviewed_public_key_files() -> None:
    registry = load_registry()
    assert set(registry) == {"official-example-2026", "official-example-2026-additional"}
    assert all(record.allows_plugin("example.lifecycle") for record in registry.values())


def test_release_signer_requires_an_active_scoped_registered_key() -> None:
    record = load_registry()["official-example-2026"]
    assert release_signer(record.key_id, ("example.lifecycle",), record.public_key) == record
    with pytest.raises(PublisherRegistryError, match="scope"):
        release_signer(record.key_id, ("untrusted.plugin",), record.public_key)


def test_checked_in_packages_verify_with_the_publisher_registry() -> None:
    for package in (ROOT / "dist").glob("*.utp"):
        verify_package(package)
