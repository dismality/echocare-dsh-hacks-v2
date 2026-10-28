/* ================= guided demo =================
   A scripted 3-minute story on a fresh copy of the example patient. It never calls the AI (so it cannot stall on stage),
   never saves, and puts the viewer's own data back on exit. Arrow keys and presentation clickers move between steps. */
const DEMO={on:false,i:0,saved:null,auto:null,voice:true};
/* Narration uses the browser voice. To play recorded narration instead, list audio files per step here,
   e.g. i=>['audio/demo-'+(i+1)+'.mp3']; the browser voice still takes over if a file will not play. */
const DEMO_AUDIO=i=>[];
let demoAudio=null,demoQueueId=0;
function demoVoiceStop(){demoQueueId++;if(demoAudio){demoAudio.onended=demoAudio.onerror=null;demoAudio.pause();demoAudio=null}try{speechSynthesis.cancel()}catch(e){}}
function demoVoice(i,done){
  demoVoiceStop();const id=demoQueueId,files=DEMO_AUDIO(i),s=DEMO_STEPS[i];
  const fallback=()=>{if(id!==demoQueueId)return;speak(s.t+'. '+stepText(s),true);done&&setTimeout(()=>id===demoQueueId&&done(),Math.max(6000,stepText(s).length*65))};
  const playAt=k=>{if(id!==demoQueueId)return;if(k>=files.length){done&&setTimeout(()=>id===demoQueueId&&done(),1500);return}
    const a=new Audio(files[k]);demoAudio=a;a.onended=()=>playAt(k+1);a.onerror=()=>{k===0?fallback():playAt(k+1)};a.play().catch(()=>{if(k===0)fallback()})};
  if(files.length)playAt(0);else fallback();
}
const DEMO_LINE='My ankles are swollen again, my shoes feel tight.';
const focusEl=sel=>()=>typeof sel==='function'?sel():document.querySelector(sel);
const DEMO_STEPS=[
 {t:'Meet Mdm Tan',p:'78, lives alone, takes 7 medicines from 3 sources: her GP, the memory clinic, and a neighbour. Her daughter Rachel looks out for her from across town.',
  run:()=>{setApp('family');go('meds')},focus:focusEl('.list')},
 {t:'Her phone: one thing at a time',p:'Mdm Tan\'s app shows only her next medicine, with pictures of the actual pills, and three big buttons. No menus, no settings.',
  run:()=>{setApp('elder')},focus:focusEl('#elder .e-card')},
 {t:'She just talks',p:'She says how she feels in her own words. EchoCare files it as a symptom and checks it against when each medicine started. No forms.',
  run:()=>{setApp('elder');demoSay()},focus:focusEl('#elder .e-card')},
 {t:'Rachel sees what matters first',p:'On Rachel\'s Today screen the top safety finding comes before anything else: ibuprofen from the neighbour likely raised her blood pressure, and that led to a new blood-pressure pill.',
  run:()=>{setApp('family');go('overview')},focus:focusEl('.herochain')},
 {t:'The cascade map',p:'Each new medicine was prescribed to treat a side effect of the one before. The amlodipine is now swelling her ankles, and the usual next step is a water pill: a third medicine treating the first two.',
  run:()=>{setApp('family');go('watch')},focus:focusEl('#cascadeMap')},
 {t:'Backed by real-world evidence',p:'The FDA has 3,753 reports of ankle swelling in people over 65 taking amlodipine. EchoCare shows it as context for the doctor, never as a diagnosis.',
  run:()=>{setApp('family');go('memo')},focus:()=>[...document.querySelectorAll('.memo-chain')].find(e=>/oedema/.test(e.textContent))},
 {t:'A question, not an instruction',p:()=>{const a=nextAppt();return 'EchoCare never tells anyone to stop a medicine. Every finding becomes a clear question on a one-page sheet for her GP visit'+(a?' on '+fmtW(a.date):'')+'.'},
  run:()=>{openChains().forEach(c=>{state.chains[c.id]=Object.assign({},state.chains[c.id],{status:'Ask doctor'})});setApp('family');go('memo')},focus:focusEl('#sheetDoc')},
 {t:'Stop the third prescription',p:'EchoCare turns a lonely elder\'s everyday words into the evidence a doctor needs to stop a prescribing cascade before the next pill is added.',
  run:()=>{setApp('family');go('overview')},focus:focusEl('.circlescard')}
];
const stepText=s=>typeof s.p==='function'?s.p():s.p;
function demoSay(){
  ev='talk';const ex=rulesExtract(DEMO_LINE);['symptoms','doses','vitals','newMedicines'].forEach(k=>{if(!Array.isArray(ex[k]))ex[k]=[]});
  state.chat.push({who:'me',text:DEMO_LINE,ts:hm()});const tags=applyExtraction(ex,DEMO_LINE);const reply=composeReply(ex,tags);
  state.chat.push({who:'bot',text:reply,ts:hm(),tags});talk={node:'more',say:reply,you:DEMO_LINE,busy:false,typing:false};renderElder();
}
function demoBar(){
  let el=$('demoBar');if(!el){el=document.createElement('div');el.id='demoBar';el.className='demobar';el.setAttribute('role','region');el.setAttribute('aria-label','Guided demo');document.body.appendChild(el)}
  const s=DEMO_STEPS[DEMO.i],last=DEMO.i===DEMO_STEPS.length-1,sp=stepText(s);
  el.innerHTML=`<div class="dh"><span>Guided demo &#183; ${DEMO.i+1} of ${DEMO_STEPS.length}</span><div class="dots">${DEMO_STEPS.map((x,i)=>`<i class="${i<=DEMO.i?'on':''}"></i>`).join('')}</div></div>
   <h3>${esc(s.t)}</h3><p aria-live="polite">${esc(sp)}</p>
   <div class="ctl"><button data-demo="back" ${DEMO.i?'':'disabled'}>Back</button>${last?'<button class="go" data-demo="live">Try it live</button><button data-demo="restart">Play again</button>':'<button class="go" data-demo="next">Next</button>'}
   <button data-demo="auto" aria-pressed="${!!DEMO.auto}">${DEMO.auto?'Pause':'Autoplay'}</button><button data-demo="voice" aria-pressed="${DEMO.voice}">Voice ${DEMO.voice?'on':'off'}</button><span class="sp"></span><button data-demo="exit">Exit demo</button></div>`;
}
function demoShow(i){
  DEMO.i=Math.max(0,Math.min(DEMO_STEPS.length-1,i));
  document.querySelectorAll('.demo-focus').forEach(e=>e.classList.remove('demo-focus'));closeOverlay();
  const s=DEMO_STEPS[DEMO.i];s.run();demoBar();
  clearTimeout(DEMO.autoT);
  const advance=()=>{if(!DEMO.auto||!DEMO.on)return;if(DEMO.i>=DEMO_STEPS.length-1){DEMO.auto=null;demoBar();return}demoShow(DEMO.i+1)};
  if(DEMO.voice)demoVoice(DEMO.i,advance);else{demoVoiceStop();if(DEMO.auto)DEMO.autoT=setTimeout(advance,9000)}
  requestAnimationFrame(()=>{const el=s.focus&&s.focus();if(el){el.classList.add('demo-focus');el.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}});
}
function demoStart(){
  if(DEMO.on){demoShow(0);return}
  DEMO.saved=JSON.stringify(state);state=seed();DEMO.on=true;document.body.classList.add('demo-on');explained&&Object.keys(explained).forEach(k=>delete explained[k]);demoShow(0);
}
function demoStop(){
  clearTimeout(DEMO.autoT);DEMO.auto=null;DEMO.on=false;demoVoiceStop();
  document.querySelectorAll('.demo-focus').forEach(e=>e.classList.remove('demo-focus'));const b=$('demoBar');if(b)b.remove();document.body.classList.remove('demo-on');
  if(DEMO.saved){state=normalize(JSON.parse(DEMO.saved));DEMO.saved=null}setApp('family');go('overview');toast('Demo finished. Your own data is back.');
}
function demoCmd(a){
  if(a==='next')demoShow(DEMO.i+1);else if(a==='back')demoShow(DEMO.i-1);else if(a==='restart'){state=seed();demoShow(0)}else if(a==='exit')demoStop();
  else if(a==='live'){demoStop();go('companion');toast('Live mode: type anything Mdm Tan might say. This uses the real engine.')}
  else if(a==='voice'){DEMO.voice=!DEMO.voice;if(DEMO.voice)demoVoice(DEMO.i);else demoVoiceStop();demoBar()}
  else if(a==='auto'){if(DEMO.auto){DEMO.auto=null;clearTimeout(DEMO.autoT);demoBar()}else{DEMO.auto=true;demoShow(DEMO.i)}}
}
document.addEventListener('keydown',e=>{if(!DEMO.on||(e.target.closest&&e.target.closest('input,textarea,select')))return;
  if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();demoCmd(DEMO.i>=DEMO_STEPS.length-1?'restart':'next')}
  else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();demoCmd('back')}else if(e.key==='Escape')demoCmd('exit')});
