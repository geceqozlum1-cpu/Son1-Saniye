/* Spark-only league operations; no Cloud Functions, paid API or service account. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./free-core.js'));else root.Son1FreeClient=factory(root.Son1FreeCore);})(typeof globalThis==='object'?globalThis:this,function(core){
'use strict';
function create(db,uid,f){
 const league=c=>f.doc(db,'freeLeagues',c),member=c=>f.doc(db,'freeLeagues',c,'members',uid),ticket=c=>f.doc(db,'freeLeagues',c,'tickets',uid),profile=f.doc(db,'freeProfiles',uid),link=c=>f.doc(db,'profiles',uid,'freeLeagues',c);
 const codeOf=c=>{c=String(c||'').trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{7}$/.test(c))throw Error('Davet kodu 7 harften/rakamdan oluşmalı.');return c;};
 const randomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(7)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
 const uuid=()=>crypto.randomUUID();
 let pendingCreate=null;
 async function enroll(code,name,alias,creating){
  code=codeOf(code);alias=core.safeName(alias);const lr=league(code),mr=member(code),pr=link(code),ts=f.serverTimestamp;
  return f.runTransaction(db,async tx=>{
   const [l,m,p]=await Promise.all([tx.get(lr),tx.get(mr),tx.get(profile)]);
   if(creating&&l.exists()&&l.data().ownerUid!==uid){const e=Error('Davet kodu çakıştı. Tekrar dene.');e.code='code-collision';throw e;}
   if(!creating&&!l.exists())throw Error('Bu davet koduyla bir lig bulunamadı.');
   if(m.exists())return {leagueId:code,code,name:l.data().name};
   const count=p.exists()?p.data().count:0;if(count>=5)throw Error('En fazla 5 lige katılabilirsin.');
   if(l.exists()&&l.data().memberCount>=100)throw Error('Lig dolu; en fazla 100 oyuncu katılabilir.');
   const title=l.exists()?l.data().name:core.safeName(name,30);
   if(creating&&title.length<3)throw Error('Lig adı en az 3 karakter olmalı.');
   if(!l.exists())tx.set(lr,{name:title,code,ownerUid:uid,memberCount:1,seed:1+crypto.getRandomValues(new Uint32Array(1))[0]%1000000,createdAt:ts()});
   else tx.update(lr,{memberCount:l.data().memberCount+1});
   tx.set(mr,{uid,alias,best:0,total:0,played:0,dayKey:-1,lastMatch:'',joinedAt:ts(),updatedAt:ts()});
   tx.set(pr,{leagueId:code,code,name:title,joinedAt:ts()});
   tx.set(profile,{count:count+1,lastLeague:code,updatedAt:ts()});
   return {leagueId:code,code,name:title};
  });
 }
 async function createLeague(data){
  const name=String(data.leagueName||'').replace(/[^\p{L}\p{N}_ .-]/gu,'').trim().slice(0,30),alias=core.safeName(data.alias);if(name.length<3)throw Error('Lig adı en az 3 karakter olmalı.');
  if(!pendingCreate||pendingCreate.name!==name||pendingCreate.alias!==alias)pendingCreate={name,alias,code:randomCode()};
  try{const r=await enroll(pendingCreate.code,name,alias,true);pendingCreate=null;return r;}catch(e){if(e.code==='code-collision')pendingCreate=null;throw e;}
 }
 async function listMyLeagues(){
  const links=await f.getDocs(f.query(f.collection(db,'profiles',uid,'freeLeagues'),f.limit(5)));
  const leagues=await Promise.all(links.docs.map(async d=>{const s=await f.getDoc(league(d.id));return s.exists()?{leagueId:d.id,code:d.id,name:s.data().name,members:s.data().memberCount}:null;}));return {leagues:leagues.filter(Boolean)};
 }
 async function startLeagueMatch(data){
  const code=codeOf(data.leagueId),tr=ticket(code),mr=member(code),lr=league(code);let result;
  await f.runTransaction(db,async tx=>{
   const [l,m,t]=await Promise.all([tx.get(lr),tx.get(mr),tx.get(tr)]);if(!l.exists()||!m.exists())throw Error('Bu lige üye değilsin.');
   const now=Date.now(),dayKey=Math.floor(now/core.DAY_MS),v=m.data(),played=v.dayKey===dayKey?v.played:0;
   if(played>=20)throw Error('Bu ligde günlük 20 maç hakkını kullandın. Yeni gün yeniden oynayabilirsin.');
   if(t.exists()&&t.data().status==='playing'&&t.data().dayKey===dayKey&&now-t.data().startedAt.toMillis()<240000){const e=Error('Devam eden maçın var. Önce açık maçı kapat.');e.code='active-match';e.matchId=t.data().matchId;throw e;}
   const matchId=uuid();tx.set(tr,{uid,matchId,status:'playing',startedAt:f.serverTimestamp(),dayKey});
   tx.update(mr,{dayKey,played:played+1,best:v.dayKey===dayKey?v.best:0,total:v.dayKey===dayKey?v.total:0,lastMatch:matchId,updatedAt:f.serverTimestamp()});
   result={matchId,dayKey,seed:l.data().seed,rounds:core.rounds(l.data().seed,dayKey),slotMs:core.SLOT_MS,activeMs:core.ACTIVE_MS};
  });return result;
 }
 async function submitLeagueMatch(data){
  const code=codeOf(data.leagueId),tr=ticket(code),mr=member(code);let result;
  await f.runTransaction(db,async tx=>{
   const [l,m,t]=await Promise.all([tx.get(league(code)),tx.get(mr),tx.get(tr)]);
   if(!l.exists()||!m.exists()||!t.exists()||t.data().matchId!==data.matchId)throw Error('Maç kaydı bulunamadı. Yeni maç başlat.');
   const v=t.data();if(v.status==='saved'){result={score:v.score,good:v.good,dead:v.dead,missed:12-v.good};return;}
   if(v.status!=='playing')throw Error('Bu maç kapatılmış. Yeni maç başlat.');
   result=core.score(l.data().seed,v.dayKey,data.events);
   if(Date.now()-v.startedAt.toMillis()>240000)throw Error('Sonuç gönderme süresi doldu. Yeni maç başlat.');
   const minimum=result.dead?0:core.MAX_ROUNDS*core.SLOT_MS;
   if(Date.now()-v.startedAt.toMillis()<minimum)throw Error('Maç henüz tamamlanmadı. Biraz sonra yeniden gönder.');
   for(let n=0;n<3;n++){const p=result.p.slice(n*4,n*4+4);tx.set(f.doc(db,'freeLeagues',code,'tickets',uid,'parts',String(n)),{matchId:v.matchId,t:result.t.slice(n*8,n*8+8),p,sum:p.reduce((a,b)=>a+b,0),good:p.filter(x=>x>0).length,dead:p.includes(-1),updatedAt:f.serverTimestamp()});}
   tx.update(tr,{status:'saved',completedAt:f.serverTimestamp(),score:result.score,good:result.good,dead:result.dead});
   tx.update(mr,{best:Math.max(m.data().best,result.score),total:m.data().total+result.score,updatedAt:f.serverTimestamp()});
  });return result;
 }
 async function abortLeagueMatch(data){
  const code=codeOf(data.leagueId);await f.runTransaction(db,async tx=>{const s=await tx.get(ticket(code));if(s.exists()&&s.data().matchId===data.matchId&&s.data().status==='playing')tx.update(ticket(code),{status:'aborted',completedAt:f.serverTimestamp()});});return {};
 }
 const methods={createLeague,joinLeague:d=>enroll(d.code,null,d.alias,false),listMyLeagues,startLeagueMatch,submitLeagueMatch,abortLeagueMatch};
 return {call:(name,data={})=>{if(!methods[name])throw Error('İşlem desteklenmiyor.');return methods[name](data);}};
}
return {create};
});
