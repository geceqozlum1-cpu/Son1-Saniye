#!/usr/bin/env python3
import json,os,pathlib,re,sys
source=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'app/src/main/assets/index.html')
dest=pathlib.Path(sys.argv[2] if len(sys.argv)>2 else str(source))
data=os.getenv('FIREBASE_WEB_CONFIG_JSON','').strip()
if not data:
 config_file=pathlib.Path(__file__).resolve().parent.parent/'firebase/web-config.json'
 if config_file.exists():data=config_file.read_text('utf-8')
if not data:
 if source!=dest:
  dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_bytes(source.read_bytes())
 print('Firebase web config not set; offline game unchanged')
 sys.exit(0)
try:c=json.loads(data)
except ValueError as e:sys.exit('Bad FIREBASE_WEB_CONFIG_JSON: '+str(e))
required=('apiKey','authDomain','projectId','appId')
if not isinstance(c,dict) or any(not isinstance(c.get(k),str) or not c[k].strip() for k in required):
 sys.exit('Firebase web config requires apiKey, authDomain, projectId, appId')
if any(k in c for k in ('private_key','private_key_id','client_email')):
 sys.exit('DO NOT put service-account secrets in web config')
pid=os.getenv('FIREBASE_PROJECT_ID','').strip()
if pid and pid!=c['projectId']:sys.exit('Project ID mismatch')
encoded=json.dumps(c,separators=(',',':'),ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
html=source.read_text('utf-8')
pattern=r'window\.SON1_FIREBASE_CONFIG\s*=\s*(?:null|\{[^\n;]*\});'
matches=list(re.finditer(pattern,html))
if len(matches)>1:sys.exit('Duplicate Firebase config assignments')
if len(matches)==1:
 m=matches[0]
 html=html[:m.start()]+'window.SON1_FIREBASE_CONFIG='+encoded+';'+html[m.end():]
elif '</head>' in html:
 html=html.replace('</head>','<script>window.SON1_FIREBASE_CONFIG='+encoded+';</script>\n</head>',1)
else:sys.exit('No head in HTML')
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(html,'utf-8')
print('Firebase web config embedded for',c['projectId'])
