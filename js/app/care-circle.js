/* ---------- care circle: one shared record for her phone and every family member's phone ----------
   Each viewer's private doc (data/users/<id>/echocare) keeps their own copy plus which circle they are in.
   The circle itself is circles/<code>: every device in it reads and writes that doc and hears changes live. */
const WRITER=uid()+uid();
let meRef=null,meData={},meQ=Promise.resolve(),circleId=null,circleUnsub=null,lastApplied=0,pendingRemote=null,dbState='connecting';
const meWrite=fn=>(meQ=meQ.then(fn,fn));
async function saveMe(patch){Object.assign(meData,patch);if(!meRef)return;try{await meWrite(()=>meRef.set(clone(meData)))}catch(e){toast('Could not save that setting.')}}
const CODE_CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from({length:8},()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join('');
const cleanCode=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const joinLink=c=>ARTIFACT_URL+'#join-'+c;
const eventKeys=st=>new Set([...((st&&st.events)||[]).map(e=>'e|'+e.ts+'|'+e.title),...((st&&st.family&&st.family.feed)||[]).map(f=>'f|'+f.ts+'|'+f.text)]);
async function openCircle(code,create){
  if(!db){toast('Sharing needs you to be signed in to Claude.');return false}
  code=cleanCode(code);if(code.length<6){toast('Enter the 8-character code.');return false}
  const ref=db.doc('circles/'+code);
  try{
    if(create){const body={state:clone(state),updated:Date.now(),by:WRITER,created:T};await ref.set(body);lastApplied=body.updated}
    else{const s=await ref.get();const v=s.exists?s.data():null;if(!v||!v.state||v.state.v!==2){toast('No care circle with that code. Check it and try again.');return false}
      const next=normalize(clone(v.state));lastApplied=v.updated||0;if(DEMO.on)DEMO.saved=JSON.stringify(next);else state=next}
  }catch(e){toast(e&&e.code==='invalid_argument'?'You need Contributor access to this page to join. Ask the person who shared it.':'Could not reach the care circle. Try again.');return false}
  if(circleUnsub)circleUnsub();
  circleId=code;docRef=ref;
  circleUnsub=ref.onSnapshot(onCircle,()=>setSave('err','Live sharing stopped. Reload the page'));
  await saveMe({circle:code});
  setSave('ok',savedLabel());render();return true;
}
function onCircle(snap){
  if(!snap.exists||snap.metadata.hasPendingWrites)return;const v=snap.data();
  if(!v||!v.state||v.state.v!==2||v.by===WRITER||(v.updated||0)<=lastApplied)return;
  lastApplied=v.updated;const next=normalize(clone(v.state));
  if(DEMO.on){DEMO.saved=JSON.stringify(next);return}
  if(window.__sheet&&!$('overlay').hidden){pendingRemote=next;return}
  applyRemote(next);
}
/* Another device changed the record: show it here, and raise anything new and urgent */
function applyRemote(next){
  const before=eventKeys(state);state=next;pendingRemote=null;
  const fresh=[...(state.events||[]).filter(e=>!before.has('e|'+e.ts+'|'+e.title)),...(state.family.feed||[]).filter(f=>!before.has('f|'+f.ts+'|'+f.text)).map(f=>({sev:/^URGENT/.test(f.text)?'crit':'info',title:f.from,text:f.text,ts:f.ts,feed:true}))];
  if(APP==='elder'){renderElder();const msg=fresh.find(f=>f.feed&&/^EchoCare . about /.test(f.title));if(msg){toast(msg.title.replace(/^EchoCare . about /,'About '));if(state.prefs.sound)speak(msg.text,true)}return}
  render();const urgent=fresh.find(f=>f.sev==='crit');
  if(urgent&&$('overlay').hidden)urgentAlert(urgent);else if(fresh.length)toast(fresh[fresh.length-1].feed?fresh[fresh.length-1].text:fresh[fresh.length-1].title);
}
async function leaveCircle(){
  if(circleUnsub)circleUnsub();circleUnsub=null;circleId=null;docRef=meRef;
  await saveMe({circle:null});save();render();toast('You have left the care circle. This device now keeps its own copy.');
}
function circleCard(){
  if(!db)return `<div class="card"><h2>Care circle <span class="chip plain">${dbState==='connecting'?'Connecting\u2026':'Not available'}</span></h2><p class="small muted" style="margin:0">${dbState==='connecting'?'Checking your account\u2026':'Sharing one live record between phones needs you to open this page on claude.ai while signed in.'}</p></div>`;
  if(!circleId)return `<div class="card"><h2>Care circle <span class="chip plain">Only on this device</span></h2>
    <p style="margin:0 0 12px">Right now this record lives only in your account. Start a care circle so ${esc(state.patient.short)}'s phone and every family member see and update the same record, live.</p>
    <div class="actions"><button class="btn primary" data-act="circle-new">Start a care circle</button></div>
    <form class="inrow" id="circleJoin" style="margin-top:14px;max-width:420px"><input type="text" id="circleCode" placeholder="Have a code? e.g. K7Q2M9XD" aria-label="Care circle code" autocomplete="off" style="text-transform:uppercase"><button class="btn">Join</button></form></div>`;
  const inv=`You're invited to ${state.patient.short}'s EchoCare care circle. Open this link and choose "I'm family" or "This is ${state.patient.short}'s phone": ${joinLink(circleId)}`;
  return `<div class="card"><h2>Care circle <span class="chip ok">Shared live</span></h2>
    <p style="margin:0 0 10px">Everyone with this code sees the same record. Doses ticked on ${esc(state.patient.short)}'s phone, and urgent alerts appear here within seconds.</p>
    <div class="mono" style="font-size:26px;letter-spacing:.12em;user-select:all;margin-bottom:10px" data-nopron>${esc(circleId)}</div>
    <div class="actions"><button class="btn primary" data-act="circle-copy">Copy invite link</button><button class="btn danger" data-act="circle-leave" data-id="circle">${window.__del==='circle'?'Tap again to leave':'Leave circle'}</button></div>
    <p class="small muted" style="margin:10px 0 0">Each person needs Contributor access to this page (Share menu) to save changes. Anyone with the code can open the record, so share it only with the care team.</p></div>`;
}
/* Opening an invite link (#join-CODE): fetch the circle, then ask whose device this is */
async function askJoin(code){
  code=cleanCode(code);if(!db){toast('Sign in to Claude to join a care circle.');return}
  let v=null;try{const s=await db.doc('circles/'+code).get();v=s.exists?s.data():null}catch(e){}
  if(!v||!v.state){toast('That invite link is not valid any more.');return}
  const who=(v.state.patient||{}).short||'your relative';window.__joinCode=code;
  showOverlay(`<div class="remind" role="dialog" aria-modal="true" aria-labelledby="jT"><div class="bell">${IC.care}</div><h2 id="jT">Join ${esc(who)}'s care circle?</h2><p style="margin:0">This device will share one live record with everyone in the circle.</p>
   <button class="btn primary big" data-act="join-elder">This is ${esc(who)}'s phone</button><button class="btn big" data-act="join-family">I'm family or a carer</button><button class="btn big ghost" data-rm="close">Not now</button></div>`);
}
async function initCloud(){
  if(!window.claude||!window.claude.use){dbState='none';setSave('','Demo mode. Changes are not saved');render();return}
  try{
    const [user,d]=await Promise.all([claude.use('user'),claude.use('db')]);
    const id=user?await user.id():null;
    if(!d||!id){dbState='none';setSave('','Demo mode. Changes are not saved');render();return}
    db=d;dbState='ok';meRef=db.doc('data/users/'+id+'/echocare');docRef=meRef;
    const snap=await meRef.get();const v=snap.exists?snap.data():null;meData=v?clone(v):{};
    const join=(location.hash.match(/^#join-([A-Za-z0-9]{6,12})$/)||[])[1];
    if(meData.circle&&cleanCode(meData.circle)!==cleanCode(join||'')){if(await openCircle(meData.circle,false)){if(join)askJoin(join);return}docRef=meRef}
    if(v&&v.state&&v.state.v===2){const loaded=normalize(clone(v.state));if(DEMO.on)DEMO.saved=JSON.stringify(loaded);else state=loaded}
    setSave('ok','Saved');render();
    if(join)askJoin(join);
  }catch(e){dbState='none';setSave('','Demo mode. Changes are not saved')}
}
async function initAI(){
  if(!window.claude||!window.claude.use)return;
  claude.use('downloads').then(d=>{downloads=d;if(section==='sheet'||section==='vitals')render()}).catch(()=>{});
  try{sample=await claude.use('sample');if(sample){const l=await sample.limits().catch(()=>null);sampleImages=!!(l&&l.images)}}catch(e){sample=null}
  if(section==='meds'||section==='companion')render();
}
