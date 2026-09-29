from __future__ import annotations
import hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).parents[1]; OUT=ROOT/"dist"; OUT.mkdir(exist_ok=True)
for name in ("lifecycle","events","ui-api","advanced","notifications","metadata","events-filter"):
    src=ROOT/"examples"/name; files={"plugin.py":(src/"plugin.py").read_bytes(),"sdk/plugin_protocol.py":(ROOT/"sdk/plugin_protocol.py").read_bytes()}
    d=hashlib.sha256()
    for path,data in sorted(files.items()): d.update(path.encode()); d.update(b"\0"); d.update(data); d.update(b"\0")
    manifest=json.loads((src/"manifest.json").read_text()); manifest["integrity"]["sha256"]=d.hexdigest()
    out=OUT/(manifest["plugin_id"]+"-"+manifest["version"]+".utp")
    with zipfile.ZipFile(out,"w",compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("manifest.json",json.dumps(manifest,sort_keys=True,indent=2))
        for path,data in files.items(): z.writestr("payload/"+path,data)
    print(out)
