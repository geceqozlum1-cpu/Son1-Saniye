#!/usr/bin/env python3
"""VOL32 fail-closed Firestore rules release from Cloud Shell.
Prevents accidental overwriting of modified production rules and saves a backup.
Do not weaken existing arenaV30Rooms matching or player final receipts.
"""
import json,hashlib,pathlib,subprocess,sys,urllib.request,urllib.parse,datetime
root=pathlib.Path(__file__).resolve().parents[1]
project='son-1-saniye-78761'
candidate=(root/'firebase/firestore.rules').read_text(encoding='utf-8')
begin=candidate.index('   // VOL32 optional live telemetry:')
end=candidate.index('   match /games/{generation}/players/{uid} {',begin)
baseline=candidate[:begin]+candidate[end:]
assert 'match /games/{generation}/live/{uid}' in candidate
assert 'match /games/{generation}/live/{uid}' not in baseline
token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
def get(url):
 request=urllib.request.Request(url,headers={'Authorization':'Bearer '+token,'Accept':'application/json'})
 with urllib.request.urlopen(request,timeout=30) as r:return json.load(r)
base='https://firebaserules.googleapis.com/v1/'
release=get(base+'projects/'+project+'/releases/cloud.firestore')
name=release.get('rulesetName','')
if not name.startswith('projects/'+project+'/rulesets/'):
 sys.exit('STOP: Unexpected live Firestore rules release.')
remote=get(base+urllib.parse.quote(name,safe='/'))
files=remote.get('source',{}).get('files',[])
if len(files)!=1 or not isinstance(files[0].get('content'),str):
 sys.exit('STOP: Live rules have multiple or unexpected files.')
live=files[0]['content']
normalize=lambda t:t.replace('\r\n','\n').strip()
if normalize(live)!=normalize(baseline):
 sys.exit('STOP: Live Firestore rules do NOT match the known Vol31 snapshot. No deployment; ask for manual review.')
backup=pathlib.Path.home()/'SON1_FIRESTORE_BACKUP_VOL32'
backup.mkdir(parents=True,exist_ok=True)
when=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
path=backup/(when+'-before-vol32.rules')
path.write_text(live,encoding='utf-8')
print('Backed up LIVE rules:',path)
print('Verified V31 baseline SHA256:',hashlib.sha256(live.encode()).hexdigest())
print('VOL32 adds only /arenaV30Rooms/{id}/games/{generation}/live/{uid}')
print('Validation passed. Continue with Firebase CLI rules-only deploy.')
