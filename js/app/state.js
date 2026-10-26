/* ================= state & persistence ================= */
let state=seed();
let section='overview';
let db=null,docRef=null,writing=false,pendingWrite=false,saveTimer=null;
let sample=null,sampleImages=false;
function normalize(s){s.prnMg=s.prnMg||{};s.patient=s.patient||{};s.patient.pronoun=s.patient.pronoun||'she';const d=seed();s.prefs=Object.assign({},d.prefs,s.prefs||{});s.prefs.elder=Object.assign(ELDER_DEFAULTS(),(s.prefs&&s.prefs.elder)||{});s.prefs.slotTimes=Object.assign({},d.prefs.slotTimes,(s.prefs&&s.prefs.slotTimes)||{});s.remind=s.remind||{};s.doseTimes=s.doseTimes||{};(s.meds||[]).forEach(m=>{const l={Amlodipine:['white','round'],Metformin:['white','oval'],Atorvastatin:['pink','oval'],Donepezil:['yellow','round'],Oxybutynin:['blue','round'],Ibuprofen:['orange','oval']}[m.name]||['white','round'];m.color=m.color||l[0];m.shape=m.shape||l[1]});s.events=s.events||[];s.supervision=s.supervision||{};((s.family||{}).contacts||[]).forEach(c=>{if(c.phone&&!/^\+/.test(c.phone))c.phone='+65 '+c.phone});s.prnQty=s.prnQty||{};s.hiddenNotes=s.hiddenNotes||[];s.reports=s.reports||[];s.chains=s.chains||{};return s}
function markTaken(m,k){state.doses[T]=state.doses[T]||{};const was=state.doses[T][k];state.doses[T][k]='taken';(state.doseTimes[T]=state.doseTimes[T]||{})[k]=hm();if(was!=='taken'&&m)m.qty=Math.max(0,(m.qty||0)-(m.dosePerTake||1))}
function setSave(kind,text){const el=$('saveState');el.className='savestate '+(kind||'');el.querySelector('span').textContent=text}
function save(){
  if(DEMO.on)return;
  if(state.chat.length>80)state.chat=state.chat.slice(-80);
  if(!docRef)return;
  setSave('busy','Saving\u2026');clearTimeout(saveTimer);saveTimer=setTimeout(flush,700);
}
const clone=o=>JSON.parse(JSON.stringify(o));
const savedLabel=()=>circleId?'Saved \u00b7 shared live':'Saved';
async function flush(){
  if(writing){pendingWrite=true;return}
  writing=true;
  try{const body={state:clone(state),updated:Date.now(),by:WRITER};
    if(docRef===meRef)await meWrite(()=>meRef.set(Object.assign({},meData,body)));else{lastApplied=body.updated;await docRef.set(body)}
    setSave('ok',savedLabel())}
  catch(e){setSave('err',e&&e.code==='quota_exceeded'?'Storage full':e&&e.code==='invalid_argument'&&circleId?'Not saved. Ask the owner for Contributor access':'Not saved. Check your connection')}
  writing=false;if(pendingWrite){pendingWrite=false;flush()}
}
