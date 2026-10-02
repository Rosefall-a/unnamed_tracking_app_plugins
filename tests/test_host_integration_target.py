"""Execute the Linux workflow's actual selector with an offline Git transport."""
import os
from pathlib import Path
import subprocess

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.parametrize(
    "requested,branch,remote_branch,expected",
    [
        ("", "main", "main", "plugin-manager"),
        ("", "feature/example", "feature/example", "feature/example"),
        ("", "feature/example", "main", "plugin-manager"),
        ("pinned-host-sha", "main", "main", "pinned-host-sha"),
        ("main", "main", "main", "main"),
    ],
)
def test_workflow_selects_owned_host_target(tmp_path, requested, branch, remote_branch, expected):
    workflow = yaml.safe_load((ROOT / ".github/workflows/host-integration.yml").read_text())
    selector = next(step["run"] for step in workflow["jobs"]["lifecycle"]["steps"] if step.get("id") == "companion")
    git = tmp_path / "git"
    git.write_text('#!/bin/sh\nfor arg do last="$arg"; done\n[ "$last" = "refs/heads/$AVAILABLE_HOST_BRANCH" ]\n')
    git.chmod(0o755)
    output = tmp_path / "output"
    result = subprocess.run(
        ["bash", "-e", "-c", selector],
        env={**os.environ, "PATH": str(tmp_path) + os.pathsep + os.environ["PATH"],
             "REQUESTED_REF": requested, "COMPANION_BRANCH": branch,
             "AVAILABLE_HOST_BRANCH": remote_branch, "GITHUB_OUTPUT": str(output)},
        capture_output=True, text=True, check=True,
    )
    assert output.read_text().strip() == "ref=" + expected, result.stdout
