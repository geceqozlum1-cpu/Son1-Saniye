#!/usr/bin/env python3
"""Bundle shared online modules into the one-file Android/Hosting game."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
html=root/'app/src/main/assets/index.html'
s=html.read_text('utf-8')
bundle='<!-- SON1_FREE_ONLINE_START -->\n<script>'+ '\n'.join((root/'online'/p).read_text('utf-8') for p in ['free-core.js','free-client.js','duel-client.js','duel-ui.js'])+'</script>\n<!-- SON1_FREE_ONLINE_END -->'
s,n=re.subn(r'<!-- SON1_FREE_ONLINE_START -->.*?<!-- SON1_FREE_ONLINE_END -->',lambda _:bundle,s,flags=re.S)
if n!=1:raise SystemExit('Expected exactly one online bundle marker')
html.write_text(s,'utf-8')
public=root/'firebase/public/index.html';public.parent.mkdir(parents=True,exist_ok=True);public.write_text(s,'utf-8')
print('Bundled Spark-only league client for Android and Hosting')
