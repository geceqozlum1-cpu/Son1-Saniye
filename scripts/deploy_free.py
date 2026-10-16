#!/usr/bin/env python3
"""Deploy only Spark-compatible services, after proving billing is disabled.
Never links billing, upgrades a plan, deploys Functions or creates a second database.
An authenticated Google/Firebase session or GitHub WIF is required.
"""
import json,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
project=json.loads((root/'firebase/web-config.json').read_text())['projectId']
cli=['npx','-y','firebase-tools@latest']
def run(args):
 p=subprocess.run(args,cwd=root,text=True,capture_output=True)
 if p.returncode:raise SystemExit(p.stderr or p.stdout or 'Command failed')
 try:return json.loads(p.stdout)
 except ValueError:raise SystemExit('Expected JSON; refusing to mutate the project.')
# Read-only preflight. Fail closed if billing status cannot be established.
billing=run(['gcloud','billing','projects','describe',project,'--format=json'])
if billing.get('billingEnabled') is not False or billing.get('billingAccountName'):
 raise SystemExit('FREE-ONLY GUARD: billing is enabled or unknown. No changes were made.')
listed=run(cli+['firestore:databases:list','--project',project,'--json'])
r=listed.get('result',[]);dbs=r if isinstance(r,list) else r.get('databases',[])
default=[d for d in dbs if d.get('name','').endswith('/(default)')]
if not default:
 if dbs:raise SystemExit('FREE-ONLY GUARD: another database exists; refusing to create a second database.')
 run(cli+['firestore:databases:create','(default)','--edition','standard','--location','europe-west1','--delete-protection','ENABLED','--point-in-time-recovery','DISABLED','--project',project,'--json'])
else:
 details=run(cli+['firestore:databases:get','(default)','--project',project,'--json']).get('result',{})
 if details.get('databaseEdition','STANDARD')!='STANDARD':raise SystemExit('FREE-ONLY GUARD: Standard edition required.')
subprocess.run([sys.executable,'scripts/build_online.py'],cwd=root,check=True)
subprocess.run(cli+['deploy','--config','firebase/firebase.json','--project',project,'--only','auth,firestore:rules,hosting','--non-interactive'],cwd=root,check=True)
print('Free-only deployment completed. No Functions, billing linkage or plan upgrade was requested.')
