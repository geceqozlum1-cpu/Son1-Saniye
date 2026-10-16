/* Bounded Spark matchmaking. Bots never impersonate network players. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./arena-core.js'));else root.Son1Arena=factory(root.Son1ArenaCore);})(typeof globalThis==='object'?globalThis:this,function(core){
'use strict';
const COUNT=8,WAIT_MS=25000,START_MS=5000,TTL_MS=120000;
function create(db,uid,f){
 let offset=0,active=null,stopped=false;const room=id=>f.doc(db,'arenaSlots',String(id)),player=(id,gen,u=uid)=>f.doc(db,'arenaSlots',String(id),'games',gen,'players',u);
 const now=()=>Date.now()+offset;
 async function search(alias,mode='fall',targetUid='',courseSeed=0){
  if(!core.MODES[mode])throw Error('Mod geçersiz.');
  if(stopped)throw Error('Rakip arama kapatıldı.');
  alias=String(alias||'OYUNCU').trim().slice(0,18);const snap=await f.getDocs(f.query(f.collection(db,'arenaSlots'),f.where('mode','==',mode),f.limit(COUNT)));const docs=new Map(snap.docs.map(d=>[d.id,d.data()]));
  const mine=[...docs].filter(([,d])=>d.host===uid&&d.status==='waiting'&&now()-d.createdAt.toMillis()<WAIT_MS),candidates=[];
  for(const [id,d] of docs)if(d.host!==uid&&d.status==='waiting'&&(!d.targetUid||d.targetUid===uid)&&(!targetUid||d.host===targetUid)&&now()-d.createdAt.toMillis()<WAIT_MS)candidates.push([id,d]);
  candidates.push(...mine);
  const free=Array.from({length:COUNT},(_,i)=>mode+'-'+i).sort(()=>Math.random()-.5).filter(id=>!docs.has(id)||docs.get(id).status==='cancelled'||now()-docs.get(id).createdAt.toMillis()>TTL_MS);for(const id of free)candidates.push([id,null]);
  for(const [id] of candidates){const begin=Date.now();try{
   const out=await f.runTransaction(db,async tx=>{if(stopped)throw Error('Rakip arama kapatıldı.');const s=await tx.get(room(id)),d=s.exists()?s.data():null;
    const old=active&&active.id!==id?await tx.get(room(active.id)):null;
    if(old?.exists()&&old.data().generation===active.generation&&old.data().status==='matched')return {id:active.id,reused:true};
    if(d&&d.host===uid&&d.status==='waiting'&&now()-d.createdAt.toMillis()<WAIT_MS)return {id,reused:true};
    if(d&&d.host!==uid&&(!d.targetUid||d.targetUid===uid)&&(!targetUid||d.host===targetUid)&&d.status==='waiting'&&(!d.targetUid||d.targetUid===uid)&&(!targetUid||d.host===targetUid)&&now()-d.createdAt.toMillis()<WAIT_MS){if(old?.exists()&&old.data().generation===active.generation&&old.data().host===uid&&old.data().status==='waiting')tx.update(room(active.id),{status:'cancelled'});tx.update(room(id),{guest:uid,guestAlias:alias,status:'matched',joinedAt:f.serverTimestamp()});return {id,claimed:true};}
    if(d&&d.status!=='cancelled'&&now()-d.createdAt.toMillis()<=TTL_MS)throw Error('slot-busy');
    const seed=mode==='daily'?1:mode==='course'&&Number.isInteger(courseSeed)&&courseSeed>=1&&courseSeed<=1000000?courseSeed:1+crypto.getRandomValues(new Uint32Array(1))[0]%1000000;tx.set(room(id),{mode,targetUid,host:uid,hostAlias:alias,guest:'',guestAlias:'',status:'waiting',generation:crypto.randomUUID(),seed,scoreSeed:core.seedFor(seed,mode),dayKey:Math.floor(now()/86400000),createdAt:f.serverTimestamp(),joinedAt:null});return {id,created:true};});
   const fresh=await f.getDocFromServer(room(out.id));const end=Date.now(),d=fresh.data();if(out.created||out.claimed)offset=(out.claimed?d.joinedAt:d.createdAt).toMillis()-(begin+end)/2;
   active={id:out.id,generation:d.generation};return {id:out.id,data:d};
  }catch(e){if(e.message==='slot-busy'||e.code==='permission-denied'||e.code==='aborted')continue;throw e;}}
  throw Error('Düello odaları dolu. Biraz sonra yeniden dene.');
 }
 async function cancel(id,gen){stopped=true;return f.runTransaction(db,async tx=>{const s=await tx.get(room(id));if(s.exists()&&s.data().generation===gen&&s.data().host===uid&&s.data().status==='waiting'){tx.update(room(id),{status:'cancelled'});return true;}return false;});}
 async function publish(id,d,events,round,left=false){
  const pr=player(id,d.generation),r=core.score(d.seed,d.dayKey,d.mode,events,round);return f.runTransaction(db,async tx=>{const s=await tx.get(pr);if(s.exists()&&(s.data().status!=='playing'||s.data().round>=round&&!left))return;
   const status=left?'left':round===12?'saved':'playing';
   tx.set(pr,{uid,generation:d.generation,round,score:r.score,good:r.good,dead:r.dead,status,updatedAt:f.serverTimestamp()});
   if(round===12)for(let n=0;n<9;n++){const p=r.p.slice(n*4,n*4+4);tx.set(f.doc(db,'arenaSlots',String(id),'games',d.generation,'players',uid,'parts',String(n)),{matchId:d.generation,t:r.t.slice(n*8,n*8+8),p,sum:p.reduce((a,b)=>a+b,0),good:p.filter(x=>x>0).length,dead:p.includes(-1),updatedAt:f.serverTimestamp()});}
  });
 }
 return {search,cancel,publish,now,leave:async(id,gen)=>f.runTransaction(db,async tx=>{const s=await tx.get(room(id));if(s.exists()&&s.data().generation===gen&&s.data().status==='matched'&&!s.data().leftUid)tx.update(room(id),{leftUid:uid,leftAt:f.serverTimestamp()});}),watch:(id,fn,err)=>f.onSnapshot(room(id),{includeMetadataChanges:true},s=>{if(s.exists())fn(s.data(),s.metadata);},err),watchPlayers:(id,d,fn,err)=>f.onSnapshot(f.query(f.collection(db,'arenaSlots',String(id),'games',d.generation,'players'),f.limit(2)),s=>fn(s.docs.map(x=>x.data()),s.metadata),err)};
}
return {create,COUNT,WAIT_MS,START_MS,TTL_MS};
});
