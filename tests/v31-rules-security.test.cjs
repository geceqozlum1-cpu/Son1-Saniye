const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const f=require('firebase/firestore');
let env;
before(async()=>{
  env=await initializeTestEnvironment({projectId:'demo-son1-free',firestore:{
    host:'127.0.0.1',port:8080,rules:fs.readFileSync('firebase/firestore.rules','utf8')
  }});
  await env.clearFirestore();
});
after(async()=>{await env?.cleanup()});
const db=u=>u?env.authenticatedContext(u).firestore():env.unauthenticatedContext().firestore();
const room=(db,id='classic-0')=>f.doc(db,'arenaV30Rooms',id);
const payload=()=>({mode:'classic',targetUid:'',host:'alice',hostAlias:'Alice',guest:'',
  guestAlias:'',status:'waiting',generation:'00000000-0000-4000-8000-000000000000',
  seed:12345,dayKey:Math.floor(Date.now()/86400000),
  courseOptions:{rounds:5,level:2,black:false},createdAt:f.serverTimestamp(),joinedAt:null});
test('Anonymous unauthenticated reads and writes are forbidden',async()=>{
  await assertFails(f.getDoc(room(db())));
  await assertFails(f.getDocs(f.query(f.collection(db(),'arenaV30Rooms'),f.limit(64))));
  await assertFails(f.setDoc(room(db()),payload()));
});
test('Signed-in player creates a bounded classic room and others can discover it',async()=>{
  await assertSucceeds(f.setDoc(room(db('alice')),payload()));
  await assertSucceeds(f.getDoc(room(db('bob'))));
  const matches=await assertSucceeds(f.getDocs(f.query(f.collection(db('bob'),'arenaV30Rooms'),
    f.where('mode','==','classic'),f.limit(64))));
  assert.equal(matches.size,1);
});
test('Malicious fields, mode spoofing, impersonation and oversized queries fail',async()=>{
  await assertFails(f.setDoc(room(db('bob'),'rise-3'),{...payload(),mode:'rise',host:'alice'}));
  await assertFails(f.setDoc(room(db('bob'),'classic-5'),{...payload(),mode:'classic',host:'bob',role:'admin'}));
  await assertFails(f.setDoc(room(db('bob'),'classic-6'),{...payload(),mode:'rise',host:'bob'}));
  await assertFails(f.getDocs(f.query(f.collection(db('bob'),'arenaV30Rooms'),f.limit(65))));
});
test('Second signed-in user joins while unrelated account cannot hijack room',async()=>{
  await assertSucceeds(f.updateDoc(room(db('bob')),{guest:'bob',guestAlias:'Bob',
    status:'matched',joinedAt:f.serverTimestamp()}));
  await assertFails(f.updateDoc(room(db('eve')),{guest:'eve'}));
  await assertFails(f.updateDoc(room(db('eve')),{leftUid:'eve',leftAt:f.serverTimestamp()}));
});
test('Participants can leave; strangers and opponents cannot forge results',async()=>{
  await assertSucceeds(f.updateDoc(room(db('alice')),{leftUid:'alice',leftAt:f.serverTimestamp()}));
  const part=(user,uid)=>f.doc(db(user),'arenaV30Rooms','classic-0','games',
    '00000000-0000-4000-8000-000000000000','players',uid);
  const data={uid:'alice',generation:'00000000-0000-4000-8000-000000000000',
    events:[],score:0,good:0,dead:false,status:'saved',finishedAt:f.serverTimestamp()};
  await assertFails(f.setDoc(part('eve','eve'),{...data,uid:'eve'}));
  await assertFails(f.setDoc(part('bob','alice'),data));
  await assertFails(f.deleteDoc(room(db('alice'))));
});
