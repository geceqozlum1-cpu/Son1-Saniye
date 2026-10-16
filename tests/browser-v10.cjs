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

 for(const p of [a,b])await p.waitForFunction(()=>window.SON1_V10_TEST?.profile,{},{timeout:60000});
 assert.equal(await a.locator('#v10Modes button').count(),9);assert.match(await a.locator('#v10ModeTitle').innerText(),/KARANLIK/);assert.equal(await a.locator('#twoPlayers').isVisible(),false);
 for(const [p,name] of [[a,'Mobil Arda'],[b,'Masaüstü Elif']]){await p.locator('[data-v10-tab="profile"]').click();await p.locator('#v10Alias').fill(name);await p.locator('#v10ProfileForm button').filter({hasText:'PROFİLİ KAYDET'}).click();await p.waitForFunction(name=>window.SON1_V10_TEST.profile.alias===name,name);}
 const codeB=await b.evaluate(()=>window.SON1_V10_TEST.profile.code);
 await a.locator('[data-v10-tab="friends"]').click();await a.locator('#v10FriendCode').fill(codeB);await a.locator('#v10AddForm button').click();
 await b.locator('[data-v10-tab="friends"]').click();await b.locator('#v10Friends button').filter({hasText:'KABUL'}).click();await a.locator('#v10Friends button').filter({hasText:'DAVET ET'}).waitFor();
 await a.locator('#v10Friends button').filter({hasText:'DAVET ET'}).click();await b.locator('#v10Invites button').filter({hasText:'KATIL'}).click();
 async function winMatch(){await Promise.all([a.waitForFunction(()=>window.SON1_V10_TEST.match?.startAt,{},{timeout:30000}),b.waitForFunction(()=>window.SON1_V10_TEST.match?.startAt,{},{timeout:30000})]);assert.equal(await a.evaluate(()=>window.SON1_V10_TEST.match.id),await b.evaluate(()=>window.SON1_V10_TEST.match.id));assert.deepEqual(await a.evaluate(()=>window.SON1_V10_TEST.match.course),await b.evaluate(()=>window.SON1_V10_TEST.match.course));await a.evaluate(()=>{const s=window.SON1_V10_TEST.match;for(const r of s.course){if(['green','blue'].includes(r.color)){const send=()=>document.querySelector('[data-target="'+r.i+'"]')?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));setTimeout(send,Math.max(0,s.startAt+r.born+240-s.api.now()));if(r.color==='blue')setTimeout(send,Math.max(0,s.startAt+r.born+420-s.api.now()));}}});await Promise.all([a.waitForFunction(()=>window.SON1_V10_TEST.match?.done,{},{timeout:45000}),b.waitForFunction(()=>window.SON1_V10_TEST.match?.done,{},{timeout:45000})]);await a.waitForFunction(()=>document.querySelector('#v10MatchStatus').textContent.includes('XP'));assert.match(await a.locator('#v10MatchStatus').innerText(),/ZAFER SENİN/);assert.match(await b.locator('#v10MatchStatus').innerText(),/RAKİBİN KAZANDI/);}
 await winMatch();console.log('V10 browser: friend request/accept/invite and 36-target live fall win + XP passed');await a.screenshot({path:'/tmp/son1-v10-live-mobile.png'});
 for(const p of [a,b])await p.locator('#v10ResultHome').click();
 await a.locator('[data-v10-tab="leagues"]').click();await a.locator('#v10LeaguesPanel summary').click();await a.locator('#v10LeagueName').fill('V10 Mobil Ligi');await a.locator('#v10CreateForm button').click();await a.waitForFunction(()=>window.SON1_TEST.net.leagues.length===1);const league=await a.evaluate(()=>window.SON1_TEST.net.leagues[0]);
 await b.locator('[data-v10-tab="leagues"]').click();await b.locator('#v10Leagues .v10-row').filter({hasText:'V10 Mobil Ligi'}).getByRole('button',{name:'KATIL',exact:true}).click();await b.waitForFunction(()=>window.SON1_TEST.net.leagues.length===1);await b.waitForFunction(()=>document.querySelectorAll('#v10Roster .v10-row').length===2);assert.match(await b.locator('#v10Roster').innerText(),/Seviye/);
 for(const p of [a,b]){await p.locator('[data-v10-tab="play"]').click();await p.locator('[data-mode="rise"]').click();}
 await a.locator('#v10Play').click();await a.waitForFunction(()=>window.SON1_V10_TEST.match?.id);await b.locator('#v10Play').click();await winMatch();for(const p of [a,b])await p.locator('#v10ResultHome').click();
 await a.locator('[data-v10-tab="profile"]').click();await a.locator('input[name="skin"][value="ice"]').check();await a.locator('#v10ProfileForm button').filter({hasText:'PROFİLİ KAYDET'}).click();await a.waitForFunction(()=>document.body.dataset.v10Skin==='ice');await a.locator('[data-v10-tab="leagues"]').click();await a.locator('#v10RefreshBattle').click();await a.waitForFunction(()=>document.querySelector('#v10LeagueBattle').textContent.includes('V10 Mobil Ligi'));console.log('V10 browser: league discovery/join, member names/levels, rise live duel and cross-league points passed');
 await a.locator('[data-v10-tab="play"]').click();await a.screenshot({path:'/tmp/son1-v10-menu-mobile.png'});await b.locator('[data-v10-tab="play"]').click();await b.screenshot({path:'/tmp/son1-v10-menu-desktop.png'});
 await a.locator('#v10Practice').click();await a.waitForFunction(()=>window.SON1_V10_TEST.match?.done,{},{timeout:30000});assert.match(await a.locator('#v10RivalLabel').innerText(),/BOT/);await a.locator('#v10ResultHome').click();
 await a.locator('#v10Play').click();await a.waitForFunction(()=>window.SON1_V10_TEST.match?.bot,{},{timeout:30000});assert.match(await a.locator('#v10MatchKind').innerText(),/BOT/);await a.locator('#v10MatchClose').click();
 await contexts[0].setOffline(true);await a.locator('[data-mode="fall"]').click();await a.locator('#v10Practice').click();await a.waitForFunction(()=>window.SON1_V10_TEST.match?.startAt);assert.match(await a.locator('#v10RivalLabel').innerText(),/BOT/);await a.locator('#v10MatchClose').click();
 assert.deepEqual(errors,[]);console.log('Browser V10 PASS: visible nine modes, profiles, mutual friends, targeted invites, live fall/rise, XP, discoverable leagues, roster levels, cross-league points, explicit Turkish bots and offline practice.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
