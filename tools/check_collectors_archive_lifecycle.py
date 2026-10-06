"""Preserve a real legacy archive through installation and native plugin actions.

Run against a disposable migrated PostgreSQL database. The optional seed step
uses the pre-removal public HTTP APIs. No plugin or test accesses host models.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from uuid import uuid4

import httpx
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[1]
PLUGIN = "official.collectors-archive"
PASSWORD = "Disposable-Archive-Password1!"
TABLES = ("sets", "bounties", "cards", "bounty_objectives", "bounty_evidence", "bounty_journal_entries", "bounty_point_transactions")


def acceptance(args):
    sys.path.insert(0, str(args.host_root / "tools"))
    sys.path.insert(0, str(ROOT))
    from check_plugin_repository_lifecycle import available_port, wait_until
    from plugin_conformance import InstalledPluginConformance
    from tools.build_unsigned_previews import build
    from tools.build_packages import write_package
    from tools.distribution import canonical_json
    from tools.package_format import SIGNATURE_ENVELOPE, canonical_payload_digest, signature_envelope, signature_message

    work = args.work_root
    work.mkdir(parents=True, exist_ok=True)
    records = build(ROOT, work / "unsigned-dist")
    record = next(item for item in records if item["plugin_id"] == PLUGIN)
    unsigned = work / "unsigned-dist" / record["package"]
    # Only this disposable server trusts this ephemeral key. It is never published.
    with zipfile.ZipFile(unsigned) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        files = {name.removeprefix("payload/"): archive.read(name) for name in archive.namelist() if name.startswith("payload/")}
    metadata = json.loads(files["distribution.json"])
    metadata["publisher"] = "Disposable archive acceptance"
    files["distribution.json"] = canonical_json(metadata)
    key = Ed25519PrivateKey.generate()
    key_id = "disposable-archive-acceptance"
    files[SIGNATURE_ENVELOPE] = canonical_json(signature_envelope(manifest, key_id))
    digest = canonical_payload_digest(files.items())
    manifest["integrity"] = {"sha256": digest, "signature": "v2:" + base64.b64encode(key.sign(signature_message(digest))).decode(), "key_id": key_id}
    package = work / "disposable-archive.utp"
    write_package(package, manifest, files)
    public = key.public_key().public_bytes_raw()
    trust = json.loads((args.host_root / "src/backend/src/plugin_api/trusted_publishers.json").read_text())
    trust["publishers"].append({"key_id": key_id, "publisher": metadata["publisher"], "public_key_file": "disposable.public-key.b64", "public_key_b64": base64.b64encode(public).decode(), "public_key_sha256": hashlib.sha256(public).hexdigest(), "status": "active", "plugin_id_prefixes": [PLUGIN], "channel": "official"})
    (work / "trusted.json").write_text(json.dumps(trust))
    port, runtime_port = available_port(), available_port()
    username = args.username or "collector-test-" + uuid4().hex
    other = username + "-other"
    env = {**os.environ, "PRIMARY_USER_USERNAME": username, "PRIMARY_USER_EMAIL": username + "@example.invalid", "PRIMARY_USER_PASSWORD": PASSWORD,
        "PLUGIN_RUNTIME_URL": f"http://127.0.0.1:{runtime_port}", "PLUGIN_RUNTIME_TOKEN": uuid4().hex + uuid4().hex,
        "PLUGIN_GATEWAY_URL": f"http://127.0.0.1:{port}", "STARTUP_MODE": "testing", "DEBUG": "false", "NONBUBBLE_ENV": "true",
        "PLUGIN_MANAGER_STATE_PATH": str(work / "manager.json"), "PLUGIN_CATALOGUE_REGISTRY": str(work / "catalogues.json"),
        "PLUGIN_TRUSTED_PUBLISHER_REGISTRY": str(work / "trusted.json")}
    processes, logs = [], []
    data = work / "host-data"
    data.mkdir(exist_ok=True)
    def launch(mode, selected_port):
        command = [sys.executable, str(args.host_root / "tools/check_plugin_repository_lifecycle.py"), "--mode", mode, "--port", str(selected_port), "--work-root", str(work)]
        if mode == "host":
            command = ["bwrap", "--tmpfs", "/", "--ro-bind", "/usr", "/usr", "--ro-bind", "/etc", "/etc", "--ro-bind", "/lib", "/lib", "--ro-bind", "/lib64", "/lib64", "--ro-bind", "/bin", "/bin", "--ro-bind", "/sbin", "/sbin", "--proc", "/proc", "--dev", "/dev", "--bind", "/tmp", "/tmp", "--ro-bind", "/mnt", "/mnt", "--bind", str(data), "/data", "--", *command]
        log = (work / (mode + ".log")).open("w")
        logs.append(log)
        process = subprocess.Popen(command, env=env, cwd=args.host_root / "src/backend", stdout=log, stderr=log)
        processes.append(process)
        return process
    launch("runtime", runtime_port)
    launch("host", port)
    report = {"plugin_id": PLUGIN, "username": username, "source_commit": record["source_commit"], "passed": [], "status": "running"}
    def checkpoint(message):
        report["passed"].append(message)
        (work / "conformance.json").write_text(json.dumps(report, indent=2))
        print(message, flush=True)
    try:
        with httpx.Client(base_url=env["PLUGIN_GATEWAY_URL"], timeout=60) as client, httpx.Client(base_url=env["PLUGIN_GATEWAY_URL"], timeout=60) as second:
            wait_until(lambda: client.post("/api/auth/login", json={"username_or_email": username, "password": PASSWORD}).status_code == 200)
            def http(method, path, body=None, *, session=client, expected=200):
                response = session.request(method, path, json=body)
                assert response.status_code == expected, (path, response.status_code, response.text[:500])
                return response.json() if response.content else None
            if args.seed:
                http("POST", "/api/auth/users", {"username": other, "email": other + "@example.invalid", "password": PASSWORD}, expected=201)
            http("POST", "/api/auth/login", {"username_or_email": other, "password": PASSWORD}, session=second)
            if args.seed:
                seeds = []
                for session, label in ((client, "First"), (second, "Second")):
                    game = http("POST", "/api/game/create", {"title": label + " Archive Quest", "folder_location": label + uuid4().hex, "status": "MASTERED", "collections": ["Archive classics"]}, session=session, expected=201)
                    saved_set = http("POST", "/api/sets", {"name": label + " classics", "target_total": 1}, session=session, expected=201)
                    card = http("POST", "/api/cards", {"game_id": game["id"], "set_id": saved_set["id"], "rarity": "mythic", "card_customization": {"customArt": "data:image/svg+xml;base64," + base64.b64encode(('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#23473f"/><text x="40" y="240" fill="white" font-size="32">Archive Quest</text><!--' + "A" * 240_000 + '--></svg>').encode()).decode(), "frontTemplate": "minimal"}}, session=session, expected=201)
                    goal = http("POST", "/api/bounties", {"title": label + " preserved bounty", "points_reward": 75}, session=session)["bounty"]
                    objective = http("POST", "/api/bounties/" + goal["id"] + "/objectives", {"title": "Keep this objective", "kind": "checkbox"}, session=session)["objective"]
                    evidence = http("POST", "/api/bounties/" + goal["id"] + "/evidence", {"kind": "note", "text": "Kept evidence"}, session=session)["evidence"]
                    journal = http("POST", "/api/bounties/" + goal["id"] + "/journal", {"text": "Kept journal"}, session=session)["entry"]
                    http("POST", "/api/bounties/" + goal["id"] + "/complete", session=session)
                    seeds.append({"game_id": game["id"], "card": card, "set": saved_set, "bounty_id": goal["id"], "objective_id": objective["id"], "evidence_id": evidence["id"], "journal_id": journal["id"]})
                (work / "legacy-seed.json").write_text(json.dumps(seeds))
                checkpoint("two accounts seeded through real legacy HTTP APIs, including 240 KB card artwork")
            else:
                seeds = json.loads(args.seed_file.read_text())
            conformance = InstalledPluginConformance(client, PLUGIN)
            preview = conformance.request("POST", "/install/preview", files={"file": (unsigned.name, unsigned.read_bytes())})
            assert preview["trust_status"] == "unsigned"
            preview = conformance.request("POST", "/install/preview", files={"file": (package.name, package.read_bytes())})
            assert preview["trust_status"] == "trusted", preview["trust_status"]
            permissions = [item["key"] for item in preview["permissions"]]
            conformance.request("POST", "/install", 201, files={"file": (package.name, package.read_bytes())}, data={"admin_password": PASSWORD}, params={"confirm_dangerous": True, "approved_permissions": permissions})
            conformance.assert_ready()
            checkpoint("unsigned HEAD package preview and real ephemeral signature verification; installed worker healthy")
            def action_api(target, path, method="GET", body=None):
                result = target.action("api", {"path": path, "method": method, "body": body or {}})
                if result.get("transfer"):
                    transfer = result["transfer"]
                    encoded = "".join(target.action("transport-read", {"token": transfer["token"], "index": index})["content"] for index in range(transfer["count"]))
                    target.action("transport-drop", {"token": transfer["token"]})
                    result = json.loads(encoded)
                return result
            for session, seed in zip((client, second), seeds, strict=True):
                target = InstalledPluginConformance(session, PLUGIN)
                for table in TABLES:
                    values = {"table": table, "offset": 0}
                    while True:
                        imported = target.action("import-legacy", values)
                        if imported["complete"]:
                            break
                        values.update(offset=imported["next_offset"], chunk_offset=imported.get("next_chunk_offset", 0), sha256=imported.get("sha256"))
                assert target.action("migration-status")["imported"]
                card = action_api(target, "cards/" + seed["card"]["id"])["body"]
                assert card["card_customization"] == seed["card"]["card_customization"]
                assert card["archive_number"] == seed["card"]["archive_number"]
                assert card["set_id"] == seed["set"]["id"]
                goal = action_api(target, "bounties/" + seed["bounty_id"])["body"]["bounty"]
                assert goal["objectives"][0]["id"] == seed["objective_id"]
                assert goal["evidence"][0]["id"] == seed["evidence_id"]
                assert goal["journal"][0]["id"] == seed["journal_id"]
                assert action_api(target, "bounties/points/total")["body"]["total"] == 75
            assert action_api(InstalledPluginConformance(second, PLUGIN), "cards/" + seeds[0]["card"]["id"])["status_code"] == 404
            checkpoint("all seven PostgreSQL legacy groups imported losslessly; scoped accounts cannot read each other's records")
            fresh = action_api(conformance, "cards", "POST", {"game_id": seeds[0]["game_id"]})["body"]
            assert fresh["archive_number"] > seeds[0]["card"]["archive_number"]
            goal = action_api(conformance, "bounties", "POST", {"title": "Runtime completion", "points_reward": 5})["body"]["bounty"]
            for _ in range(2):
                assert action_api(conformance, "bounties/" + goal["id"] + "/complete", "POST")["status_code"] == 200
            assert action_api(conformance, "bounties/points/total")["body"]["total"] == 80
            def probe():
                return action_api(conformance, "cards/" + seeds[0]["card"]["id"])["body"], action_api(conformance, "bounties/points/total")["body"]
            conformance.preserving_lifecycle(probe, reinstall_review={"admin_password": PASSWORD, "confirm_dangerous": True, "approved_permissions": []})
            checkpoint("new archive number, repeat completion and stop/start, disable/enable, preserving reinstall passed")
            if args.browser:
                with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as stream:
                    json.dump([{"name": cookie.name, "value": cookie.value} for cookie in client.cookies.jar], stream)
                    cookie_file = Path(stream.name)
                try:
                    subprocess.run(["node", str(ROOT / "tools/capture_collectors_archive.mjs"), str(args.host_root), str(ROOT), str(work), env["PLUGIN_GATEWAY_URL"], str(cookie_file), str(work / "legacy-seed.json" if args.seed else args.seed_file)], check=True)
                finally:
                    cookie_file.unlink(missing_ok=True)
                checkpoint("six real installed native pages in light/dark on desktop and phone")
            report["status"] = "passed"
            (work / "conformance.json").write_text(json.dumps(report, indent=2))
    finally:
        for process in reversed(processes):
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=10)
        for log in logs:
            log.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host-root", type=Path, required=True)
    parser.add_argument("--work-root", type=Path, required=True)
    parser.add_argument("--seed", action="store_true")
    parser.add_argument("--browser", action="store_true")
    parser.add_argument("--seed-file", type=Path)
    parser.add_argument("--username")
    args = parser.parse_args()
    args.host_root = args.host_root.resolve()
    args.work_root = args.work_root.resolve()
    if not args.seed and not (args.seed_file and args.username):
        parser.error("reuse requires --seed-file and --username")
    acceptance(args)


if __name__ == "__main__":
    main()
