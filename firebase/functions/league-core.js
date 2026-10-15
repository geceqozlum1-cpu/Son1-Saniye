'use strict';
const crypto = require('node:crypto');
const COLORS=['green','blue','red','black'];
const MAX_ROUNDS=12, SLOT_MS=1350, ACTIVE_MS=950;
function dayUTC(d=new Date()){return d.toISOString().slice(0,10)}
function seeded(seed){let n=seed>>>0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
function newRounds(seed){const rng=seeded(seed);const result=[];for(let i=0;i<MAX_ROUNDS;i++){const roll=rng();const color=(i===0?'green':roll<.45?'green':roll<.70?'blue':roll<.89?'red':'black');result.push({i,color,x:22+Math.floor(rng()*57),duration:ACTIVE_MS})}return result}
function seedOf(leagueId,day){return crypto.createHash('sha256').update(`${leagueId}:${day}:s1-v9-1`).digest().readUInt32BE(0)}
function ensureEvents(events,rounds){if(!Array.isArray(events)||events.length>28)throw new Error('INVALID_EVENTS');let previous=-1;const map=rounds.map(()=>[]);for(const item of events){if(!item||!Number.isInteger(item.i)||item.i<0||item.i>=rounds.length||typeof item.t!=='number'||!Number.isFinite(item.t))throw new Error('INVALID_EVENTS');if(item.t<previous||item.t<0||item.t>MAX_ROUNDS*SLOT_MS+500)throw new Error('INVALID_TIMELINE');previous=item.t;const inside=item.t-item.i*SLOT_MS;if(inside<-60||inside>ACTIVE_MS+70)throw new Error('OUTSIDE_ACTIVE_WINDOW');if(map[item.i].length>=2)throw new Error('EXCESS_TAPS');map[item.i].push(Math.round(item.t))}return map}
function scoreEvents(rounds,events){const byRound=ensureEvents(events,rounds);let score=0, good=0,missed=0,dead=false;const results=[];for(let i=0;i<rounds.length;i++){const taps=byRound[i],color=rounds[i].color;const first=taps.length?taps[0]-i*SLOT_MS:null;let points=0,correct=false;if(color==='black'&&taps.length){dead=true;results.push({i,color,points:0,correct:false});break}if(color==='red'||color==='black'){correct=taps.length===0;points=correct?(color==='red'?410:550):0}
else if(color==='green'){correct=taps.length===1&&first>=-25&&first<=ACTIVE_MS;points=correct?Math.max(190,890-Math.floor(Math.max(0,first)*.53)):0}
else if(color==='blue'){const gap=taps.length===2?taps[1]-taps[0]:Infinity;correct=taps.length===2&&gap>=75&&gap<=480&&first>=-25&&first<=ACTIVE_MS;points=correct?Math.max(250,1140-Math.floor(Math.max(0,first)*.34)-Math.floor(gap*.57)):0}
if(correct)good++;else missed++;score+=points;results.push({i,color,points,correct})}
return {score:dead?0:score,good,missed,dead,rounds:results}}
function safeName(v){return String(v??'OYUNCU').replace(/[^\p{L}\p{N}_ .-]/gu,'').trim().slice(0,18)||'OYUNCU'}
module.exports={dayUTC,seedOf,newRounds,scoreEvents,ensureEvents,safeName,MAX_ROUNDS,SLOT_MS,ACTIVE_MS};
