const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync('app/src/main/assets/index.html'));});
 await new Promise(r=>server.listen(8765,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
 const contexts=await Promise.all([browser.newContext({ignoreHTTPSErrors:true,viewport:{width:412,height:915}}),browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1280,height:900}})]);
 if(process.env.HTTPS_PROXY){const {execFileSync}=require('node:child_process');const sdkCache=new Map();for(const c of contexts)await c.route('https://www.gstatic.com/firebasejs/12.19.0/**',async route=>{const url=route.request().url();if(!sdkCache.has(url))sdkCache.set(url,execFileSync('python3',['-c','import urllib.request,sys;sys.stdout.buffer.write(urllib.request.urlopen(sys.argv[1],timeout=30).read())',url],{maxBuffer:10000000}));await route.fulfill({status:200,contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:sdkCache.get(url)});});}
 for(const c of contexts)await c.addInitScript(()=>{window.SON1_FIREBASE_EMULATOR={projectId:'demo-son1-free'};});
 const [a,b]=await Promise.all(contexts.map(c=>c.newPage()));
 const errors=[];for(const p of [a,b])p.on('pageerror',e=>errors.push(e.message));
 await Promise.all([a.goto('http://127.0.0.1:8765'),b.goto('http://127.0.0.1:8765')]);
 console.log('Initial page:',await a.title(),(await a.locator('body').innerText()).slice(0,200),'errors',errors);
 for(const p of [a,b]){await p.locator('#v9OnlineOpen').click();try{await p.waitForFunction(()=>window.SON1_TEST.net.ready,{},{timeout:45000});console.log('Browser connected');}catch(e){console.log('Connection status:',await p.locator('#v9NetStatus').innerText());throw e;}}
 await a.locator('#v9PlayerName').fill('Mobil Oyuncu');await a.locator('#v9LeagueName').fill('İki Oyuncu UI Testi');await a.locator('#v9CreateLeague').click();await a.waitForFunction(()=>window.SON1_TEST.net.selected&&!window.SON1_TEST.net.busy);
 console.log('Browser created league');const code=await a.evaluate(()=>window.SON1_TEST.net.selected.code);
 await b.locator('#v9PlayerName').fill('Masaüstü Oyuncu');await b.locator('#v9JoinCode').fill(code);await b.locator('#v9JoinLeague').click();await b.waitForFunction(()=>window.SON1_TEST.net.selected&&!window.SON1_TEST.net.busy);await a.waitForFunction(()=>document.querySelectorAll('#v9Leaderboard .v9-leader').length===2);
 console.log('Browser joined league');await Promise.all([a.locator('#v9LeagueStart').click(),b.locator('#v9LeagueStart').click()]);
 await Promise.all([a.waitForFunction(()=>window.SON1_TEST.net.match?.status==='playing'),b.waitForFunction(()=>window.SON1_TEST.net.match?.status==='playing')]);
 assert.deepEqual(await a.evaluate(()=>window.SON1_TEST.net.match.rounds),await b.evaluate(()=>window.SON1_TEST.net.match.rounds));
 await a.evaluate(()=>{const m=window.SON1_TEST.net.match;for(const r of m.rounds){if(r.color==='green'||r.color==='blue'){const send=()=>document.querySelector('#v9LeagueOrb').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));setTimeout(send,Math.max(0,r.i*m.slotMs+220-(performance.now()-m.startAt)));if(r.color==='blue')setTimeout(send,Math.max(0,r.i*m.slotMs+380-(performance.now()-m.startAt)));}}});
 await Promise.all([a.waitForFunction(()=>window.SON1_TEST.net.match?.status==='saved',{},{timeout:30000}),b.waitForFunction(()=>window.SON1_TEST.net.match?.status==='saved',{},{timeout:30000})]);
 console.log('Browser saved matches');const saved=await a.locator('#v9MatchResult').innerText();assert.match(saved,/KAYDEDİLEN/);
 await a.locator('#v9MatchQuit').click();await b.locator('#v9MatchQuit').click();await b.waitForFunction(()=>document.querySelector('#v9Leaderboard').textContent.includes('Mobil Oyuncu'));
 await a.locator('#v9OnlineClose').click();await a.locator('#v9OnlineOpen').click();await a.waitForFunction(()=>document.querySelectorAll('#v9Leaderboard .v9-leader').length===2);
 await a.screenshot({path:'/tmp/son1-mobile-online.png'});await b.screenshot({path:'/tmp/son1-desktop-online.png'});
 await a.reload();await a.locator('#v9OnlineOpen').click();await a.waitForFunction(()=>window.SON1_TEST.net.ready&&window.SON1_TEST.net.leagues.length===1,{},{timeout:30000});
 await a.locator('#v9JoinCode').fill('ZZZZ999');await a.locator('#v9JoinLeague').click();await a.waitForFunction(()=>document.querySelector('#v9NetStatus').textContent.includes('bulunamadı'));
 await contexts[0].setOffline(true);await a.waitForFunction(()=>document.querySelector('#v9NetStatus').textContent.includes('İnternet kesildi'));assert.equal(await a.locator('#v9CreateLeague').isDisabled(),true);
 assert.deepEqual(errors,[]);console.log('Browser PASS: mobile + desktop, independent anonymous accounts, create/join, shared parkur, completed matches, cross-user live ranking, reopen, reload, missing invite and offline handling.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
