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

 for(const p of [a,b]){await p.locator('#v9OnlineClose').click();await p.locator('#duelOpen').click();}
 await a.locator('#duelAlias').fill('Mobil Rakip');await b.locator('#duelAlias').fill('Masaüstü Rakip');
 await a.locator('#duelSearch').click();await a.waitForFunction(()=>window.SON1_DUEL_TEST.state?.id);
 await b.locator('#duelSearch').click();
 await Promise.all([a.waitForFunction(()=>window.SON1_DUEL_TEST.state?.startAt,{},{timeout:30000}),b.waitForFunction(()=>window.SON1_DUEL_TEST.state?.startAt,{},{timeout:30000})]);
 assert.equal(await a.evaluate(()=>window.SON1_DUEL_TEST.state.id),await b.evaluate(()=>window.SON1_DUEL_TEST.state.id));
 assert.equal(await a.evaluate(()=>window.SON1_DUEL_TEST.state.startAt),await b.evaluate(()=>window.SON1_DUEL_TEST.state.startAt));
 await a.evaluate(()=>{const s=window.SON1_DUEL_TEST.state;for(const r of s.rounds){if(r.color==='green'||r.color==='blue'){const send=()=>document.querySelector('#duelOrb').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));setTimeout(send,Math.max(0,s.startAt+r.i*1350+260-s.api.now()));if(r.color==='blue')setTimeout(send,Math.max(0,s.startAt+r.i*1350+420-s.api.now()));}}});
 await Promise.all([a.waitForFunction(()=>window.SON1_DUEL_TEST.state?.done,{},{timeout:45000}),b.waitForFunction(()=>window.SON1_DUEL_TEST.state?.done,{},{timeout:45000})]);
 console.log('Duel statuses',await a.locator('#duelStatus').innerText(),await b.locator('#duelStatus').innerText());
 assert.match(await a.locator('#duelStatus').innerText(),/KAZANDIN.*sunucuda doğrulandı/);
 assert.match(await b.locator('#duelStatus').innerText(),/Rakibin kazandı.*sunucuda doğrulandı/);
 await a.screenshot({path:'/tmp/son1-duel-mobile.png'});
 await a.locator('#duelAgain').click();await a.locator('#duelBot').click();await a.waitForFunction(()=>window.SON1_DUEL_TEST.state?.done,{},{timeout:30000});assert.match(await a.locator('#duelStatus').innerText(),/Bot maçı/);
 await a.locator('#duelAgain').click();await a.locator('#duelSearch').click();await a.waitForFunction(()=>window.SON1_DUEL_TEST.state?.bot,{},{timeout:30000});assert.match(await a.locator('#duelStatus').innerText(),/BOT/);
 await a.locator('#duelClose').click();
 console.log('Browser DUEL PASS: two independent users, shared server start, live scores, server-validated winner, explicit bot, automatic bot fallback.');
 assert.deepEqual(errors,[]);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
