import shutil
import subprocess
from pathlib import Path


def test_native_frontend_behavior():
    node = shutil.which("node")
    assert node, "Node 22+ is required to test native plugin frontend behavior"
    result = subprocess.run(
        [node, "--test", str(Path(__file__).with_name("native_frontends.test.mjs"))],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
