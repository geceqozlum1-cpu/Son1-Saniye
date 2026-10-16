/* Shared deterministic parkur and scoring. Firestore rules independently check each round. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Son1FreeCore=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const SLOT_MS=1350,ACTIVE_MS=950,MAX_ROUNDS=12,DAY_MS=86400000;
const colorIndex=(seed,day,i)=>i===0?0:((seed*17+day*31+i*43+i*i*7)%101<45?0:(seed*17+day*31+i*43+i*i*7)%101<70?1:(seed*17+day*31+i*43+i*i*7)%101<89?2:3);
function rounds(seed,day){return Array.from({length:12},(_,i)=>({i,color:['green','blue','red','black'][colorIndex(seed,day,i)],x:22+(seed+day+i*29)%57,duration:ACTIVE_MS}));}
function score(seed,day,events){
 if(!Array.isArray(events)||events.length>24)throw Error('Hamle kaydı geçersiz.');
 const t=Array(24).fill(-1);let previous=-1;
 for(const e of events){if(!e||!Number.isInteger(e.i)||e.i<0||e.i>=12||!Number.isInteger(e.t)||e.t<previous)throw Error('Hamle sırası geçersiz.');previous=e.t;const relative=e.t-e.i*SLOT_MS;if(relative<0||relative>ACTIVE_MS)throw Error('Hamle zamanı geçersiz.');const j=e.i*2;if(t[j]<0)t[j]=relative;else if(t[j+1]<0)t[j+1]=relative;else throw Error('Fazla dokunuş.');}
 const p=Array.from({length:12},(_,i)=>{const a=t[2*i],b=t[2*i+1],c=colorIndex(seed,day,i);return c===0?(a>=0&&b===-1?500:0):c===1?(a>=0&&b-a>=75&&b-a<=480?700:0):c===2?(a===-1?250:0):(a===-1?400:-1);});
 const dead=p.includes(-1),points=dead?0:p.reduce((a,b)=>a+b,0),good=dead?0:p.filter(x=>x>0).length;
 return {t,p,score:points,good,missed:12-good,dead};
}
function safeName(v,max=18){return String(v||'OYUNCU').replace(/[^\p{L}\p{N}_ .-]/gu,'').trim().slice(0,max)||'OYUNCU';}
return {SLOT_MS,ACTIVE_MS,MAX_ROUNDS,DAY_MS,colorIndex,rounds,score,safeName};
});
