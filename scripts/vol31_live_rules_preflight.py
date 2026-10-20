#!/usr/bin/env python3
"""Fail-closed safety gate for production Firestore rules activation.
Authenticated Google Workload Identity is REQUIRED; never creates credentials.
Reads and archives live rules; deploy proceeds only if the live release matches
the known VOL28 baseline exactly, preventing unrelated live changes from loss.
"""
import json
import pathlib
import subprocess
import urllib.request
import urllib.parse
import sys
import hashlib
root=pathlib.Path(__file__).resolve().parents[1]
project="son-1-saniye-78761"
baseline=(root/"firebase/firestore.vol28-baseline.rules").read_text(encoding="utf-8")
proposed=(root/"firebase/firestore.rules").read_text(encoding="utf-8")
if "arenaV30Rooms" not in proposed or "arenaV30Rooms" in baseline:
    sys.exit("Deployment blocked: baseline or new rule invariants failed.")
token=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
def get(url):
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+token,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=20) as res:
        return json.load(res)
base="https://firebaserules.googleapis.com/v1/"
release=get(base+"projects/"+project+"/releases/cloud.firestore")
name=release.get("rulesetName")
if not name or not name.startswith("projects/"+project+"/rulesets/"):
    sys.exit("Deployment blocked: unexpected live ruleset pointer.")
remote=get(base+urllib.parse.quote(name,safe="/"))
files=remote.get("source",{}).get("files",[])
if len(files)!=1 or not isinstance(files[0].get("content"),str):
    sys.exit("Deployment blocked: live release has a nonstandard file layout.")
live=files[0]["content"]
out=root/"dist"
out.mkdir(exist_ok=True)
(out/"firebase-live-rules-before-vol31.rules").write_text(live,encoding="utf-8")
(out/"firebase-live-rules-release.json").write_text(json.dumps({"release":release,"rulesetName":name},indent=2),encoding="utf-8")
print("Remote baseline sha256:",hashlib.sha256(live.encode()).hexdigest())
print("Git VOL28 baseline sha256:",hashlib.sha256(baseline.encode()).hexdigest())
if live.replace("\r\n","\n").strip()!=baseline.replace("\r\n","\n").strip():
    sys.exit("DEPLOYMENT BLOCKED: LIVE RULES DIFFER FROM EXPECTED BASELINE. Backup saved. Manual review required.")
print("Baseline identical: safe to deploy additive arenaV30Rooms rules (after emulator tests).")
