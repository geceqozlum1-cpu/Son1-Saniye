const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const f=require('firebase/firestore');
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-son1-free',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firebase/firestore.rules','utf8')}});await env.clearFirestore();});
after(async()=>env?.cleanup());
const db=(uid)=>uid?env.authenticatedContext(uid).firestore():env.unauthenticatedContext().firestore();
const room=uid=>f.doc(db(uid),'arenaV30Rooms','classic-0');
const gen='00000000-0000-4000-8000-000000000000';
const data=()=>({mode:'classic',targetUid:'',host:'alice',hostAlias:'Alice',guest:'',guestAlias:'',status:'waiting',generation:gen,seed:12345,dayKey:Math.floor(Date.now()/86400000),courseOptions:{rounds:5,level:2,black:false},createdAt:f.serverTimestamp(),joinedAt:null});
const live=(actor,owner)=>f.doc(db(actor),'arenaV30Rooms','classic-0','games',gen,'live',owner);
const preview=(uid,seq=1,score=1250,stage=1)=>({uid,generation:gen,seq,score,stage,updatedAt:f.serverTimestamp()});
test('two authenticated players match normally then share realtime scores',async()=>{
 await assertSucceeds(f.setDoc(room('alice'),data()));
 await assertSucceeds(f.updateDoc(room('bob'),{guest:'bob',guestAlias:'Bob',status:'matched',joinedAt:f.serverTimestamp()}));
 await assertSucceeds(f.setDoc(live('alice','alice'),preview('alice')));
 await assertSucceeds(f.setDoc(live('bob','bob'),preview('bob',1,995)));
 const snaps=await assertSucceeds(f.getDocs(f.query(f.collection(db('alice'),'arenaV30Rooms','classic-0','games',gen,'live'),f.limit(2))));
 assert.equal(snaps.size,2);
 await assertFails(f.setDoc(live('eve','eve'),preview('eve')));
 await assertFails(f.setDoc(live('bob','alice'),preview('alice',2,99999,1)));
 await assertFails(f.deleteDoc(live('alice','alice')));
});
test('malformed progress and unauthorized enumeration are denied',async()=>{
 await assertFails(f.getDocs(f.query(f.collection(db('eve'),'arenaV30Rooms','classic-0','games',gen,'live'),f.limit(2))));
 await assertFails(f.getDocs(f.query(f.collection(db('alice'),'arenaV30Rooms','classic-0','games',gen,'live'),f.limit(3))));
 await assertFails(f.getDoc(live(null,'alice')));
 await assertFails(f.setDoc(live('alice','alice'),{...preview('alice',2),ownerAdmin:true}));
});
test('player updates their own live score but cannot roll sequence backward',async()=>{
 await new Promise(ok=>setTimeout(ok,650));
 await assertSucceeds(f.setDoc(live('alice','alice'),preview('alice',2,2250,2),{merge:true}));
 await assertFails(f.setDoc(live('alice','alice'),preview('alice',1,0,0),{merge:true}));
 const got=await assertSucceeds(f.getDoc(live('bob','alice')));
 assert.equal(got.data().score,2250);
});
