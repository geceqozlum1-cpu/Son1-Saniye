const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing');
const f=require('firebase/firestore');
const core=require('../online/free-core.js');
const client=require('../online/free-client.js');
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-son1-free',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firebase/firestore.rules','utf8')}});await env.clearFirestore();});
after(async()=>{await env?.cleanup();});
const user=id=>{const db=env.authenticatedContext(id).firestore();return {db,api:client.create(db,id,f)};};
function perfect(rounds){const events=[];for(const r of rounds){if(r.color==='green'||r.color==='blue')events.push({i:r.i,t:r.i*1350+150});if(r.color==='blue')events.push({i:r.i,t:r.i*1350+300});}return events;}
let league,a,b,outsider,matchA,matchB;
test('two independent authenticated players create/join and receive identical daily parkur',async()=>{
 a=user('alice');b=user('bob');outsider=user('eve');
 league=await a.api.call('createLeague',{leagueName:'Gerçek Test Ligi',alias:'ALİCE'});
 assert.match(league.code,/^[A-HJ-NP-Z2-9]{7}$/);
 const joined=await b.api.call('joinLeague',{code:league.code.toLowerCase(),alias:'BOB'});assert.equal(joined.leagueId,league.leagueId);
 await b.api.call('joinLeague',{code:league.code,alias:'BOB'});
 const l=await f.getDoc(f.doc(a.db,'freeLeagues',league.code));assert.equal(l.data().memberCount,2);
 assert.equal((await a.api.call('listMyLeagues')).leagues.length,1);
 const members=await f.getDocs(f.query(f.collection(a.db,'freeLeagues',league.code,'members'),f.limit(100)));assert.equal(members.size,2);
 matchA=await a.api.call('startLeagueMatch',{leagueId:league.code});matchB=await b.api.call('startLeagueMatch',{leagueId:league.code});assert.deepEqual(matchA.rounds,matchB.rounds);
});
test('nonmembers, anonymous lists, foreign profiles and ownership hijacks are denied',async()=>{
 const unauth=env.unauthenticatedContext().firestore();
 await assertFails(f.getDoc(f.doc(unauth,'freeLeagues',league.code)));
 await assertFails(f.getDocs(f.collection(a.db,'freeLeagues')));
 await assertFails(f.getDocs(f.query(f.collection(outsider.db,'freeLeagues',league.code,'members'),f.limit(100))));
 await assertFails(f.getDoc(f.doc(b.db,'freeProfiles','alice')));
 await assertFails(f.getDoc(f.doc(b.db,'freeLeagues',league.code,'tickets','alice')));
 await assertFails(f.updateDoc(f.doc(a.db,'freeLeagues',league.code),{ownerUid:'bob'}));
 await assertFails(f.updateDoc(f.doc(a.db,'freeLeagues',league.code),{memberCount:10}));
 await assertFails(f.deleteDoc(f.doc(a.db,'freeLeagues',league.code)));
});
test('invalid types, extra fields, oversized names and forged score updates are denied',async()=>{
 const m=f.doc(a.db,'freeLeagues',league.code,'members','alice');
 for(const patch of [{best:999999999},{best:-1},{best:'500'},{alias:'x'.repeat(2000)},{uid:'bob'},{isAdmin:true},{joinedAt:f.serverTimestamp()},{total:500},{played:0}])await assertFails(f.updateDoc(m,patch));
 await assertFails(f.setDoc(f.doc(a.db,'freeLeagues',league.code,'members','forged'),{uid:'alice',alias:'Hacker'}));
 await assertFails(f.deleteDoc(f.doc(a.db,'freeLeagues',league.code,'tickets','alice')));
});
test('unfinished matches cannot submit or start again',async()=>{
 await assert.rejects(a.api.call('startLeagueMatch',{leagueId:league.code}),/Devam eden/);
 await assert.rejects(a.api.call('submitLeagueMatch',{leagueId:league.code,matchId:matchA.matchId,events:perfect(matchA.rounds)}),/henüz/);
});
test('two users submit a completed match and see each other in live ranking; retries are idempotent',async()=>{
 await new Promise(r=>setTimeout(r,16500));
 const scoreA=await a.api.call('submitLeagueMatch',{leagueId:league.code,matchId:matchA.matchId,events:perfect(matchA.rounds)});
 assert.ok(scoreA.score>0);assert.equal(scoreA.good,12);
 const empty=await b.api.call('submitLeagueMatch',{leagueId:league.code,matchId:matchB.matchId,events:[]});assert.ok(empty.score<scoreA.score);
 const retry=await a.api.call('submitLeagueMatch',{leagueId:league.code,matchId:matchA.matchId,events:[]});assert.equal(retry.score,scoreA.score);
 const snap=await f.getDocs(f.query(f.collection(b.db,'freeLeagues',league.code,'members'),f.limit(100)));const rows=snap.docs.map(x=>x.data());assert.equal(rows.find(x=>x.uid==='alice').played,1);assert.equal(rows.find(x=>x.uid==='alice').best,scoreA.score);
 await assertFails(f.updateDoc(f.doc(a.db,'freeLeagues',league.code,'tickets','alice'),{score:scoreA.score+500}));
 await assertFails(f.updateDoc(f.doc(b.db,'freeLeagues',league.code,'members','alice'),{best:8400}));
});
test('tampered score, transcript length, timing, and replay cannot bypass rules',async()=>{
 const m=await a.api.call('startLeagueMatch',{leagueId:league.code});
 const r=core.score(m.seed,m.dayKey,perfect(m.rounds));
 async function forged(patch){const batch=f.writeBatch(a.db);batch.update(f.doc(a.db,'freeLeagues',league.code,'tickets','alice'),{status:'saved',completedAt:f.serverTimestamp(),t:r.t,p:r.p,score:r.score,good:r.good,dead:r.dead,...patch});batch.update(f.doc(a.db,'freeLeagues',league.code,'members','alice'),{best:8400,total:8400,updatedAt:f.serverTimestamp()});return assertFails(batch.commit());}
 await forged({score:999999});await forged({t:Array(24).fill(999999)});await forged({p:[1]});await forged({dayKey:0});
 await a.api.call('abortLeagueMatch',{leagueId:league.code,matchId:m.matchId});
 await assert.rejects(a.api.call('submitLeagueMatch',{leagueId:league.code,matchId:m.matchId,events:[]}),/kapatılmış/);
 const again=await a.api.call('startLeagueMatch',{leagueId:league.code});assert.notEqual(again.matchId,m.matchId);
 await a.api.call('abortLeagueMatch',{leagueId:league.code,matchId:again.matchId});
});
test('server rejects altered round points even when ticket, parts and member are all written together',async()=>{
 const match=await a.api.call('startLeagueMatch',{leagueId:league.code});
 await env.withSecurityRulesDisabled(async ctx=>{await f.updateDoc(f.doc(ctx.firestore(),'freeLeagues',league.code,'tickets','alice'),{startedAt:f.Timestamp.fromMillis(Date.now()-20000)});});
 const result=core.score(match.seed,match.dayKey,perfect(match.rounds));
 const old=(await f.getDoc(f.doc(a.db,'freeLeagues',league.code,'members','alice'))).data();
 async function attack(mutate){
  const parts=Array.from({length:3},(_,n)=>{const p=result.p.slice(n*4,n*4+4);return {matchId:match.matchId,t:result.t.slice(n*8,n*8+8),p,sum:p.reduce((a,b)=>a+b,0),good:p.filter(x=>x>0).length,dead:p.includes(-1),updatedAt:f.serverTimestamp()};});
  mutate(parts);const dead=parts.some(p=>p.dead),score=dead?0:parts.reduce((n,p)=>n+p.sum,0),good=dead?0:parts.reduce((n,p)=>n+p.good,0),batch=f.writeBatch(a.db);
  parts.forEach((part,n)=>batch.set(f.doc(a.db,'freeLeagues',league.code,'tickets','alice','parts',String(n)),part));
  batch.update(f.doc(a.db,'freeLeagues',league.code,'tickets','alice'),{status:'saved',completedAt:f.serverTimestamp(),score,good,dead});
  batch.update(f.doc(a.db,'freeLeagues',league.code,'members','alice'),{best:Math.max(old.best,score),total:old.total+score,updatedAt:f.serverTimestamp()});
  await assertFails(batch.commit());
 }
 await attack(p=>{p[0].p[0]+=1;p[0].sum+=1;});
 await attack(p=>{p[0].t[0]=9999;});
 await attack(p=>{p[1].t=[-1];});
 await attack(p=>{p[2].matchId='x'.repeat(5000);});
 await attack(p=>{p[0].extraRole='admin';});
 // A valid score after the failed attacks proves they did not mutate the active ticket.
 const saved=await a.api.call('submitLeagueMatch',{leagueId:league.code,matchId:match.matchId,events:perfect(match.rounds)});assert.equal(saved.score,result.score);
});
test('five-league cap, daily 20-attempt cap and 100-member cap are enforced',async()=>{
 const capped=user('capped');for(let i=0;i<5;i++)await capped.api.call('createLeague',{leagueName:'Limit Test '+i,alias:'Limit'});
 await assert.rejects(capped.api.call('createLeague',{leagueName:'Sixth League',alias:'Limit'}),/5 lige/);
 await env.withSecurityRulesDisabled(async ctx=>{await f.updateDoc(f.doc(ctx.firestore(),'freeLeagues',league.code,'members','alice'),{played:20});await f.updateDoc(f.doc(ctx.firestore(),'freeLeagues',league.code),{memberCount:100});});
 await assert.rejects(a.api.call('startLeagueMatch',{leagueId:league.code}),/20 maç/);
 await assert.rejects(outsider.api.call('joinLeague',{code:league.code,alias:'Eve'}),/Lig dolu/);
});
test('unknown invite, invalid event order and malformed inputs fail clearly',async()=>{
 await assert.rejects(b.api.call('joinLeague',{code:'ZZZZ999',alias:'Bob'}),/bulunamadı/);
 await assert.rejects(b.api.call('joinLeague',{code:'bad',alias:'Bob'}),/7 harf/);
 assert.throws(()=>core.score(1,1,[{i:0,t:951}]),/geçersiz/);
 assert.throws(()=>core.score(1,1,[{i:0,t:300},{i:0,t:100}]),/geçersiz/);
});
