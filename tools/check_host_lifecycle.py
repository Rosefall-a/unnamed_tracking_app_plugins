"""Run unchanged host acceptance plus explicit staged-permission HTTP denial.

All requests reach the actual authenticated host. No response, gateway, registry
or worker is mocked; the host owns deployment and disposable package generation.
"""
from __future__ import annotations

import argparse
import runpy
import sys
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host-root", type=Path, required=True)
    args, host_arguments = parser.parse_known_args()
    script = args.host_root.resolve() / "tools/check_plugin_repository_lifecycle.py"
    if not script.is_file():
        parser.error("host acceptance script is missing")
    import httpx  # Only needed for host acceptance, not normal plugin tests.

    original = httpx.Client.request
    denials = []

    def request(client, method, url, **kwargs):
        response = original(client, method, url, **kwargs)
        path = str(url)
        if method.upper() != "POST" or not path.endswith("/update/staged/preview") or response.status_code != 200:
            return response
        preview = response.json()
        plugin_id = preview["plugin_id"]

        def active():
            listing = original(client, "GET", "/api/plugins")
            assert listing.status_code == 200, listing.text
            return next(item for item in listing.json() if item["plugin_id"] == plugin_id)

        before = active()
        assert before["staged_update"]["status"] == "awaiting_permissions"
        assert before["status"] == "running" and before["enabled"] is True
        denied = original(client, "POST", path.removesuffix("/preview"), json={
            "confirmed": True, "approved_permissions": [], "expected_digest": preview["digest"],
        })
        assert denied.status_code == 200, denied.text
        assert denied.json()["status"] == "denied"
        after = active()
        for field in ("version", "digest", "enabled", "status", "health", "granted_capabilities", "effective_capabilities", "history"):
            assert after.get(field) == before.get(field), f"denial changed active {field}"
        assert after["staged_update"]["status"] == "denied"
        assert "games.read" not in after["effective_capabilities"]
        denials.append(plugin_id)
        print(f"{plugin_id}: authenticated permission denial retained the healthy predecessor and its grants/history", flush=True)
        return response

    previous_arguments = sys.argv
    httpx.Client.request = request
    sys.argv = [str(script), *host_arguments]
    try:
        runpy.run_path(str(script), run_name="__main__")
        assert len(denials) == 1, "host suite did not exercise exactly one staged permission denial"
    finally:
        httpx.Client.request = original
        sys.argv = previous_arguments


if __name__ == "__main__":
    main()
