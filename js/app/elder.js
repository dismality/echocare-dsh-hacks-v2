/* ---------- shared helpers for the elder app ---------- */
function nextDue(){const due=todayDoses().filter(d=>d.status==='due');if(!due.length)return null;const slot=due.map(d=>d.slot).sort((a,b)=>minsOf(slotT(a))-minsOf(slotT(b)))[0];return {slot,items:due.filter(d=>d.slot===slot)}}
const clockNow=()=>{const d=new Date();return W[d.getDay()]+' '+d.getDate()+' '+M[d.getMonth()]+' \u00b7 '+clock(pad(d.getHours())+':'+pad(d.getMinutes()))};
const famContact=()=>{const E=state.prefs.elder||{};return state.family.contacts.find(c=>c.id===E.callId)||state.family.contacts.find(c=>!/GP|Pharmacist/.test(c.relation))};

/* ---------- reminders ---------- */
function showOverlay(html){$('overlay').innerHTML=html;pronDom($('overlay'));$('overlay').hidden=false;const f=$('overlay').querySelector('button');if(f)f.focus()}
function closeOverlay(){$('overlay').hidden=true;$('overlay').innerHTML='';if(window.__sheet==='med'){window.__preOK=null;window.__editMed=null;photoFile=null;photoResult=null;window.__thumb=null;window.__medThumb=null}window.__sheet=null;
  // a change from another device that arrived while a form was open: show it once the form is cancelled (a saved form wins)
  if(pendingRemote)setTimeout(()=>{if(pendingRemote&&$('overlay').hidden)applyRemote(pendingRemote)},0)}
function showReminder(slot,preview){
  const items=todayDoses().filter(d=>d.slot===slot&&(d.status==='due'||preview));if(!items.length){toast('Nothing due at that time.');return}
  if(!preview){const rm=state.remind[T]=state.remind[T]||{};rm[slot]=Object.assign({},rm[slot],{shown:hm()})}
  showOverlay(`<div class="remind" role="alertdialog" aria-modal="true" aria-labelledby="rmT"><div class="bell">${IC.bell}</div>
   <div><div class="eyebrow">${SLOTL[slot]} medicines \u00b7 ${clock(slotT(slot))}${preview?' \u00b7 preview':''}</div><h2 id="rmT">Time for your medicine, ${esc(state.patient.short)}</h2></div>
   <ul>${items.map(d=>`<li style="display:flex;gap:12px;align-items:center"><span style="flex:none">${pillSVG(d.m,38)}</span><span><b>${d.m.dosePerTake} ${esc(d.m.color||'')} ${pillWord(d.m)}${d.m.dosePerTake>1?'s':''}</b><small>${esc(d.m.name)} ${esc(d.m.strength)} \u00b7 ${esc(d.m.withFood.toLowerCase())}</small></span></li>`).join('')}</ul>
   <button class="btn primary big" data-rm="taken" data-slot="${slot}">I've taken ${items.length>1?'them':'it'}</button>
   <div class="rowbtns"><button class="btn big" data-rm="snooze" data-slot="${slot}" style="font-size:17px">Remind me in ${state.prefs.snooze} min</button><button class="btn big" data-rm="skip" data-slot="${slot}" style="font-size:17px">Skip this time</button></div>
   <p class="small muted" style="margin:0">If nothing is pressed for 2 hours, ${esc((famContact()||{name:'family'}).name.split(' ')[0])} gets a gentle message.</p></div>`);
  const rb=$('overlay').querySelector('.remind');if(rb)rb.classList.add('flash');try{navigator.vibrate&&navigator.vibrate([400,200,400,200,400])}catch(e){}
  clearInterval(window.__rmRep);let rmTick=0;window.__rmRep=setInterval(()=>{const open=!$('overlay').hidden&&$('overlay').querySelector('.remind.flash');if(!open||++rmTick>400){clearInterval(window.__rmRep);document.title='EchoCare Companion';return}document.title=rmTick%2?'Medicine time':'EchoCare Companion';if(rmTick%20===0)beep()},1500);
  beep();if(state.prefs.sound)speak(`${state.patient.short}, it's time for your ${SLOTL[slot].toLowerCase()} medicine: ${items.map(d=>d.m.name).join(', ')}.`,true);
}
function checkReminders(){
  if(DEMO.on||APP!=='elder'||!state.prefs.reminders||!$('overlay').hidden)return;
  const due=todayDoses().filter(d=>d.status==='due'&&minsOf(slotT(d.slot))<=nowMins());if(!due.length)return;
  const rm=state.remind[T]=state.remind[T]||{};
  // escalate doses still untaken 2 hours after their time
  [...new Set(due.map(d=>d.slot))].forEach(sl=>{if(nowMins()-minsOf(slotT(sl))>=120&&!(rm[sl]&&rm[sl].escalated)){rm[sl]=Object.assign({},rm[sl],{escalated:true});state.family.feed.push({from:'EchoCare',text:`${state.patient.short} has not confirmed her ${SLOTL[sl].toLowerCase()} medicines (due ${clock(slotT(sl))}). A quick call may help.`,ts:T+' '+hm()});state.events.push({sev:'warn',title:`${SLOTL[sl]} medicines not confirmed`,text:`Due at ${clock(slotT(sl))}. Family has been told.`,ts:T+' '+hm()});save()}});
  const slot=[...new Set(due.map(d=>d.slot))].sort((a,b)=>minsOf(slotT(a))-minsOf(slotT(b))).find(sl=>{const r=rm[sl]||{};return !r.dismissed&&!(r.snoozeUntil&&nowMins()<r.snoozeUntil)&&!(r.shown&&!r.snoozeUntil)});
  if(slot)showReminder(slot,false);
}
function tick(){
  if([...document.querySelectorAll('[data-unlock]')].some(el=>minsOf(el.dataset.unlock)<=nowMins())){if(APP==='elder')renderElder();else render()}
  document.querySelectorAll('[data-cd]').forEach(el=>{const c=cdInfo(el.dataset.cd,el.dataset.st);el.className=(el.dataset.big?'cdbig ':'cd ')+c.cls;el.textContent=c.txt});
  document.querySelectorAll('[data-ecd]').forEach(el=>{const w=eWhen(el.dataset.ecd,el.dataset.st);el.className='e-when '+w.c;el.textContent=w.t});
  if($('nowClock'))$('nowClock').textContent=clockNow();
  checkReminders();
}
function slotTaken(slot){todayDoses().filter(d=>d.slot===slot&&d.status==='due').forEach(d=>markTaken(d.m,d.key));const rm=state.remind[T]=state.remind[T]||{};rm[slot]=Object.assign({},rm[slot],{dismissed:true});state.events=state.events.filter(e=>e.title!==SLOTL[slot]+' medicines not confirmed')}

/* ================= ELDER APP ================= */
let APP=['#family','#demo','#memo'].includes(location.hash)?'family':'elder';
let ev='home';
let talk={node:'start',say:'',you:'',pend:null,busy:false,typing:false};
const PILLC={white:'#F7F7F4',yellow:'#F3D34A',pink:'#F4AFC6',blue:'#86B6E8',orange:'#F2A24B',red:'#D95550',green:'#86C995',brown:'#A97B54',purple:'#B097DB'};
const sv=(p,extra)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra||''}>${p}</svg>`;
const EI={
 smile:sv('<circle cx="12" cy="12" r="9"/><path d="M8 14.5c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2"/><path d="M9 9.5h.01M15 9.5h.01"/>'),
 sad:sv('<circle cx="12" cy="12" r="9"/><path d="M8 16.5c1-1.4 2.4-2 4-2s3 .6 4 2"/><path d="M9 9.5h.01M15 9.5h.01"/>'),
 check:sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
 pencil:sv('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
 done:sv('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
 tired:sv('<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M22 10.5v3"/><path d="M5.5 10.5v3"/>'),
 head:sv('<path d="M9 21v-3.5A7 7 0 1 1 18.5 13l1.5 3h-2v2a2 2 0 0 1-2 2h-1v1"/>'),
 chest:sv('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z"/>'),
 stomach:sv('<path d="M9 3v4a6 6 0 0 0-3 5.2V17a4 4 0 0 0 4 4h2a6 6 0 0 0 6-6v-1a4 4 0 0 0-4-4h-1V3"/>'),
 legs:sv('<path d="M9 3v8l-1.5 9H11l1-6 1 6h3.5L15 11V3"/>'),
 toilet:sv('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
 cloud:sv('<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>'),
 speaker:sv('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
 send:sv('<path d="M4 12l16-8-6 16-2-7-8-1z"/>','width="28" height="28"'),
 mic:sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
 family:IC.care,phone:IC.phone,alert:IC.help,pill:IC.pill,talk:IC.talk
};
const SUN='<svg class="e-sun" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="12" fill="#F2B53A"/><g stroke="#F2B53A" stroke-width="4" stroke-linecap="round"><path d="M30 6v7M30 47v7M6 30h7M47 30h7M13 13l5 5M42 42l5 5M13 47l5-5M42 18l5-5"/></g></svg>';
const MOON='<svg class="e-sun" viewBox="0 0 60 60" aria-hidden="true"><path d="M38 44A17 17 0 0 1 26 13a17 17 0 1 0 22 22 17 17 0 0 1-10 9z" fill="#6E86C7"/></svg>';
/* A real photo of her tablet, when the family has taken one, replaces the drawn pill everywhere it appears */
function pillSVG(m,h){h=h||42;if(m.photo){const z=Math.round(h*1.5);return `<img class="pillphoto" src="${m.photo}" width="${z}" height="${z}" alt="Photo of ${esc(m.name)}">`}
  const c=PILLC[m.color]||PILLC.white,s='#3A4A42';
  if(m.shape==='capsule')return `<svg width="${Math.round(h*1.7)}" height="${h}" viewBox="0 0 68 40" aria-hidden="true"><path d="M20 5h14v30H20a15 15 0 0 1 0-30z" fill="${c}" stroke="${s}" stroke-width="2"/><path d="M34 5h14a15 15 0 0 1 0 30H34z" fill="#FFFFFF" stroke="${s}" stroke-width="2"/></svg>`;
  if(m.shape==='oval')return `<svg width="${Math.round(h*1.6)}" height="${h}" viewBox="0 0 64 40" aria-hidden="true"><ellipse cx="32" cy="20" rx="29" ry="16" fill="${c}" stroke="${s}" stroke-width="2"/><path d="M14 20h36" stroke="${s}" stroke-width="1.5" opacity=".4"/></svg>`;
  return `<svg width="${h}" height="${h}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="${c}" stroke="${s}" stroke-width="2"/><path d="M8 20h24" stroke="${s}" stroke-width="1.5" opacity=".4"/></svg>`}
const pillWord=m=>m.shape==='capsule'?'capsule':m.form==='Liquid'?'spoonful':'pill';
function pillLine(m){const n=m.dosePerTake||1;const pics=m.photo?pillSVG(m,50)+(n>1?`<span class="pcount">&#215;${n}</span>`:''):Array.from({length:Math.min(3,Math.ceil(n))},()=>pillSVG(m,n>1?34:42)).join('');
  return `<div class="e-pill${m.photo?' hasphoto':''}"><span class="pic" style="display:flex;gap:4px;align-items:center">${pics}</span><div>${n} ${esc(m.color||'')} ${pillWord(m)}${n>1?'s':''}<small>${state.prefs.elder.showNames?esc(m.name)+' '+esc(m.strength)+' \u00b7 ':''}${esc(m.withFood.toLowerCase())}</small></div></div>`}
function et(k,en,v){const d=ETR[(state.prefs.elder||{}).lang];let t=d&&d[k]||en;Object.entries(v||{}).forEach(([a,b])=>{t=t.split('{'+a+'}').join(b)});return t}
const eSlot=k=>et('slot_'+k,SLOTL[k]);
function eWhen(slot,status){
  if(status==='taken')return {c:'done',t:et('done','Done')};if(status==='skipped')return {c:'late',t:'Skipped'};
  const d=minsOf(slotT(slot))-nowMins();
  if(d>60)return {c:'',t:et('inHours',`In about ${Math.round(d/60)} hour${Math.round(d/60)>1?'s':''}`,{n:Math.round(d/60)})};if(d>0)return {c:'',t:et('inMin',`In ${d} minutes`,{n:d})};
  if(d>-60)return {c:'late',t:et('now','Time to take it now')};return {c:'late',t:et('notYet','Not taken yet')};
}
const eWhenSpan=(slot,status)=>{const w=eWhen(slot,status);return `<span class="e-when ${w.c}" data-ecd="${slot}" data-st="${status}">${w.t}</span>`};
const famName=()=>((famContact()||{name:'your family'}).name).split(' ')[0];
/* The family member using the guardian view: the first care contact who is not a clinician */
const guardianName=()=>{const c=state.family.contacts.find(x=>!/GP|Pharmacist|Doctor/i.test(x.relation));return c?c.name.split(' ')[0]:'Family'};
/* Her next doctor visit in words she can read at a glance, with a countdown and a Listen button */
const WFULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],MFULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
function apptWords(a){const d=P(a.date),n=diff(T,a.date);return {day:WFULL[d.getDay()]+' '+d.getDate()+' '+MFULL[d.getMonth()],when:n===0?et('today','Today'):n===1?et('tomorrow','Tomorrow'):et('inDays','In '+n+' days',{n}),n,time:clock(a.time||'09:00')}}
function eAppt(){
  const a=nextAppt();if(!a)return '';const w=apptWords(a);
  const say=`Your next doctor visit is ${w.n===0?'today':w.n===1?'tomorrow':'on '+w.day}, at ${w.time}, with ${a.with}${a.place?', at '+a.place:''}.${w.n<=1?' '+famName()+' has the doctor sheet ready.':''}`;
  return `<section class="e-card e-appt${w.n<=1?' soon':''}" aria-label="Next doctor visit"><div class="e-row"><div class="e-label">${et('nextVisit','Next doctor visit')}</div><span class="e-when${w.n<=1?' late':''}">${w.when}</span></div>
   <div class="e-time" style="font-size:34px">${esc(w.day)}</div><div style="font-size:24px;font-weight:700">${esc(w.time)}</div>
   <div style="font-size:20px">${esc(a.with)}${a.place?`<small style="display:block;font-size:18px;color:var(--e-sub)">${esc(a.place)}</small>`:''}</div>
   <button class="e-play" data-e="play" data-t="${esc(say)}" style="justify-self:start">${EI.speaker} ${et('listen','Listen')}</button></section>`;
}
/* Last 7 days as dots: full = every dose ticked. Gentle encouragement, never a penalty. */
function eStreak(){
  const days=[];for(let i=-6;i<=-1;i++)days.push(addDays(i));
  const cells=days.map(d=>{const log=state.doses[d]||{};let due=0,tk=0;scheduled().forEach(m=>{if(m.start>d)return;m.slots.forEach(s=>{due++;if(log[m.id+':'+s]==='taken')tk++})});return {d,c:!due?'':tk===due?'full':tk?'part':''}});
  const full=cells.filter(c=>c.c==='full').length;
  return `<section class="e-card" aria-label="This week"><div class="e-row"><div class="e-label">${et('thisWeek','This week')}</div><div class="e-streak">${cells.map(c=>`<i class="${c.c}" title="${fmtW(c.d)}">${W[P(c.d).getDay()][0]}</i>`).join('')}</div></div><div style="font-size:20px">${full>=5?`All medicines taken on ${full} of the last 6 days. Wonderful!`:full?`All medicines taken on ${full} of the last 6 days.`:'Every tick counts. Let\'s do today together.'}</div></section>`;
}
function eHome(preview){
  const nx=nextDue(),h=new Date().getHours(),n=state.patient.short,E=state.prefs.elder;
  const msg=state.family.feed.filter(f=>/^EchoCare . about /.test(f.from)).slice(-1)[0];
  const first=SLOTS.find(s=>scheduled().some(m=>m.slots.includes(s.k)));
  return `<div class="e-top"><div><h1 class="e-hello">${h<12?et('morning','Good morning'):h<18?et('afternoon','Good afternoon'):et('evening','Good evening')},<br>${esc(n)}</h1><div class="e-date" ${preview?'':'id="nowClock"'}>${clockNow()}</div></div>${h>=6&&h<19?SUN:MOON}</div>
  ${nx?`<section class="e-card" aria-label="Next medicine"><div class="e-label">${et('medFor',SLOTL[nx.slot]+' medicine',{slot:eSlot(nx.slot)})}</div><div class="e-time">${clock(slotT(nx.slot))}</div>${eWhenSpan(nx.slot,'due')}<div class="e-pills">${nx.items.map(d=>pillLine(d.m)).join('')}</div>${isDueNow(nx.slot)?`<button class="e-btn e-green" data-e="taken" data-slot="${nx.slot}">${EI.check} ${et('taken',"I've taken "+(nx.items.length>1?'them':'it'))}</button>`:`<button class="e-btn e-white e-locked" disabled data-unlock="${slotT(nx.slot)}">${esc(et('readyAt','Take at {time}',{time:clock(slotT(nx.slot))}))}</button>`}</section>`
    :`<section class="e-card"><div class="e-time">${et('allDone','All done for today')}</div><div class="e-label" style="font-weight:400">Well done, ${esc(n)}. ${first?`Tomorrow's first medicine is at ${clock(slotT(first.k))}.`:''}</div></section>`}
  ${E.showAppt!==false?eAppt():''}
  ${eStreak()}
  ${E.showTalk?`<button class="e-btn e-blue" data-e="talk">${EI.talk} ${et('talk','Talk to EchoCare')}</button>`:''}
  ${E.showCall||E.showHelp?`<div class="e-grid" ${E.showCall&&E.showHelp?'':'style="grid-template-columns:1fr"'}>${E.showCall?`<button class="e-btn e-white" data-e="call">${EI.phone}${esc(et('call','Call '+famName(),{name:famName()}))}</button>`:''}${E.showHelp?`<button class="e-btn e-red" data-e="help">${EI.alert}${et('help','I need help')}</button>`:''}</div>`:''}
  ${E.showMessages&&msg?`<section class="e-card"><div class="e-msg"><div><div class="who">${esc(msg.from.replace(/^EchoCare . about /,'About '))}</div><p>${esc(msg.text)}</p></div></div><button class="e-play" data-e="play" data-t="${esc(msg.text)}" style="justify-self:start">${EI.speaker} ${et('listen','Listen')}</button></section>`:''}
  ${E.showAllMeds?`<button class="e-btn e-white" data-e="meds" style="min-height:66px;font-size:21px">${EI.pill} ${et('allMeds','All my medicines today')}</button>`:''}
  ${preview?'':`<div class="e-foot"><button data-e="family">Family settings</button></div>`}`;
}
function eMeds(){
  const td=todayDoses();
  const slots=SLOTS.map(s=>{const it=td.filter(d=>d.slot===s.k);if(!it.length)return '';const st=it.every(d=>d.status!=='due')?(it.every(d=>d.status==='taken')?'taken':'skipped'):'due';
    return `<div class="e-slot"><div class="e-row"><div><div class="e-label">${esc(eSlot(s.k))}</div><div class="e-time" style="font-size:30px">${clock(slotT(s.k))}</div></div>${eWhenSpan(s.k,st)}</div><div class="e-pills">${it.map(d=>pillLine(d.m)).join('')}</div>${st==='due'?(isDueNow(s.k)?`<button class="e-btn e-green" data-e="taken" data-slot="${s.k}" style="min-height:66px;font-size:21px">${EI.check} ${et('taken',"I've taken "+(it.length>1?'them':'it'))}</button>`:`<button class="e-btn e-white e-locked" disabled data-unlock="${slotT(s.k)}" style="min-height:66px;font-size:21px">${esc(et('readyAt','Take at {time}',{time:clock(slotT(s.k))}))}</button>`):''}</div>`}).join('');
  return `<button class="e-back" data-e="home">${EI.back} ${et('back','Back')}</button><h1 class="e-h">${et('myMeds','My medicines today')}</h1><section class="e-card">${slots||'<div class="e-label">No medicines today.</div>'}</section>
  <p style="margin:0;font-size:18px;color:var(--e-sub)">Pain tablets and other "when needed" medicines are not shown here. Ask ${esc(famName())} or your pharmacist if you are not sure.</p>`;
}
const ENODES={
 start:[['good','I feel good','smile'],['notgood','Not so good','sad'],['speak','Speak to EchoCare','mic','wide'],['type','Type something else','pencil','wide']],
 more:[['notgood','I feel unwell','sad'],['bye','That\'s all, thank you','done'],['speak','Speak to EchoCare','mic','wide'],['type','Type something else','pencil','wide']],
 sleep:[['slept_well','I slept well','smile'],['slept_bad','I slept badly','tired']],
 where:[['faint','I feel faint','alert','danger wide'],['b_head','My head','head'],['b_chest','My chest','chest'],['b_stomach','My stomach','stomach'],['b_legs','Legs or feet','legs'],['b_toilet','Toilet trouble','toilet'],['b_tired','Tired or weak','tired'],['b_low','Lonely or feeling low','cloud','wide']],
 b_head:[['s_dizzy','Dizzy','head'],['s_headache','Headache','head'],['s_confusion','Forgetful or muddled','cloud']],
 b_chest:[['emerg','Yes, pain or tightness','chest','danger'],['s_breathless','Hard to breathe','chest','danger'],['s_cough','No, just a cough','chest','wide']],
 b_stomach:[['s_gi','Upset or runny','stomach'],['s_constipation','Can\'t go','stomach'],['s_nausea','Feeling sick','stomach']],
 b_legs:[['s_edema','Swollen ankles','legs'],['s_muscle','Aching muscles','legs'],['s_jointpain','Knee or joint pain','legs']],
 b_toilet:[['s_incontinence','Leaking','toilet'],['s_urinefreq','Going very often','toilet']],
 sev:[['sev3','A little','smile'],['sev6','Quite bad','sad'],['sev9','Very bad','sad','danger wide']],
 low:[['callme','Yes, ask them to call','phone'],['notnow','Not now','done']],
 famsend:[['fm_ok','I\'m okay today','smile'],['fm_call','Please call me','phone'],['fm_thanks','Thank you for visiting','family'],['fm_food','I need groceries','family']],
 emerg:[['help','Call for help now','alert','danger wide'],['callfam','Ring my family','phone','wide'],['home','Back to home','back','wide']],
 bye:[['home','Back to home','back','wide']]
};
const BPROMPT={b_head:'What is happening in your head?',b_chest:'Do you have pain or tightness in your chest right now?',b_stomach:'What is your stomach like?',b_legs:'What is wrong with your legs or feet?',b_toilet:'What kind of toilet trouble?'};
function eTalk(){
  const list=ENODES[talk.node]||ENODES.more;
  if(talk.listening)return `<button class="e-back" data-e="home">${EI.back} Back</button><section class="e-card"><div class="e-say"><span class="face">${EI.mic.replace('<svg','<svg width="30" height="30"')}</span><p aria-live="polite">${esc(talk.say)}</p></div><div class="e-listen"><span class="e-mic" aria-hidden="true">${EI.mic}</span><p id="eHeard" class="e-heard" aria-live="polite">${esc(talk.heard||'')}</p></div></section><button class="e-btn e-green" data-e="stopmic">${EI.check||''} I've finished speaking</button><p style="margin:0;font-size:17px;color:var(--e-sub)">Speak in ${esc((state.prefs.elder||{}).lang||'English')}. EchoCare writes down what you say, then answers.</p>`;
  const opts=list.map(([k,l,ic,cls])=>`<button class="e-opt ${cls||''}" data-e="ans" data-k="${k}" data-l="${esc(l)}">${EI[ic]||''}<span>${esc(l)}</span></button>`).join('');
  return `<button class="e-back" data-e="home">${EI.back} Back</button>
  ${talk.you?`<div class="e-you">${esc(talk.you)}</div>`:''}
  <section class="e-card"><div class="e-say"><span class="face"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><g transform="rotate(-45 12 12)"><rect x="3.5" y="8.5" width="17" height="7" rx="3.5" stroke="currentColor" stroke-width="2"/><path d="M12 8.5h5a3.5 3.5 0 0 1 0 7h-5z" fill="currentColor"/></g><path d="M18.6 2.6a4.6 4.6 0 0 1 2.8 2.8M17.4 5.1a2 2 0 0 1 1.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><p aria-live="polite">${talk.busy?'<span class="e-thinking" aria-label="Thinking"><i></i><i></i><i></i></span>':esc(talk.say)}</p></div>
  ${talk.busy?'':`<button class="e-play" data-e="repeat" style="justify-self:start">${EI.speaker} Say it again</button>`}</section>
  ${talk.busy?'':talk.typing?`<form class="e-type" id="eType"><input id="eIn" placeholder="${talk.typingFor==='family'?'Your message to '+esc(famName()):'Type here'}" aria-label="Your message" autocomplete="off"><button aria-label="Send">${EI.send}</button></form><p class="e-dict">${EI.mic} To speak instead, tap the <b>microphone</b> on your keyboard, then press the arrow to send.</p><button class="e-back" data-e="untype">${EI.back} Choose an answer instead</button>`:`<div class="e-opts">${opts}</div>`}
  <p style="margin:0;font-size:17px;color:var(--e-sub)">Tap an answer, or tap Speak to EchoCare and just talk.</p>`;
}
/* Speaking to EchoCare: the browser's own speech recognition where it is allowed; otherwise the typing box, where the phone keyboard's microphone does the listening */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null;
function eDictate(msg){talk.listening=false;talk.heard='';talk.typing=true;talk.typingFor=null;talk.say=msg;if(state.prefs.sound)speak(msg,true);renderElder();setTimeout(()=>$('eIn')&&$('eIn').focus(),60)}
const DICTATE='Tap the microphone on your keyboard and tell me how you are feeling. Then press the arrow to send.';
function eListen(){
  if(!SR){eDictate(DICTATE);return}
  try{speechSynthesis.cancel()}catch(e){}
  try{if(rec)rec.abort()}catch(e){}
  const r=new SR();rec=r;r.lang=LANGS[(state.prefs.elder||{}).lang]||'en-GB';r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
  let final='',failed=false;
  talk.listening=true;talk.typing=false;talk.heard='';talk.say='I\'m listening. Tell me how you are feeling.';renderElder();
  r.onresult=e=>{let txt='';for(let i=0;i<e.results.length;i++)txt+=e.results[i][0].transcript;talk.heard=txt;if(e.results[e.results.length-1].isFinal)final=txt;const h=$('eHeard');if(h)h.textContent=txt};
  r.onerror=e=>{failed=true;if(rec===r)rec=null;if(e.error==='aborted')return;
    if(e.error==='no-speech'){talk.listening=false;eSay('I didn\'t hear anything. Tap Speak to EchoCare to try again, or choose an answer.','more');renderElder()}
    else eDictate(DICTATE)};
  r.onend=()=>{if(failed)return;if(rec===r)rec=null;const t=(final||talk.heard||'').trim();talk.listening=false;if(t)eFree(t);else{eSay('I didn\'t catch that. Tap Speak to EchoCare to try again, or choose an answer.','more');renderElder()}};
  try{r.start()}catch(e){failed=true;rec=null;eDictate(DICTATE)}
}
function eSay(text,node){talk.say=text;talk.node=node;talk.typing=false;talk.busy=false;state.chat.push({who:'bot',text,ts:hm()});if(state.prefs.sound)speak(text,true)}
function mkEx(k,sev){return {symptoms:[{key:k,label:SYMK[k].label,severity:sev,area:SYMK[k].area||null}],doses:[],vitals:[],newMedicines:[],mood:null,shareWithFamily:null,urgent:!!SYMK[k].emer}}
const isDueNow=slot=>minsOf(slotT(slot))<=nowMins();
function dueSlotNow(){const due=todayDoses().filter(d=>d.status==='due'&&minsOf(slotT(d.slot))<=nowMins());return due.length?due.map(d=>d.slot).sort((a,b)=>minsOf(slotT(a))-minsOf(slotT(b)))[0]:null}
function eStart(){ev='talk';talk={node:'start',say:'',you:'',pend:null,busy:false,typing:false};const h=new Date().getHours();eSay(`Good ${h<12?'morning':h<18?'afternoon':'evening'}, ${state.patient.short}! How are you feeling today?`,'start')}
function eAnswer(k,label){
  if(k==='home'){ev='home';renderElder();return}
  if(k==='help'){helpOverlay();return}
  if(k==='callfam'){callOverlay();return}
  if(k==='type'||k==='own_type'){talk.typing=true;talk.typingFor=k==='own_type'?'family':null;if(k==='own_type'){talk.say=`Type your message to ${famName()}. I'll send it exactly as you write it.`;if(state.prefs.sound)speak(talk.say,true)}renderElder();setTimeout(()=>$('eIn')&&$('eIn').focus(),60);return}
  if(k==='speak'){eListen();return}
  if(k==='own_voice'){talk.recording=true;if(state.prefs.sound)speak(`Tap the big button and speak your message to ${famName()}.`,true);renderElder();return}
  const n=state.patient.short,fam=famName();
  const nextLine=()=>{const nx=nextDue();return nx?`Your next medicine is at ${clock(slotT(nx.slot))}.`:'You have taken all your medicines for today.'};
  talk.you=label;state.chat.push({who:'me',text:label,ts:hm()});
  if(k==='good')eSay(`That's lovely to hear, ${n}! Did you sleep well last night?`,'sleep');
  else if(k==='notgood')eSay('I\'m sorry to hear that. Where do you feel unwell?','where');
  else if(k==='slept_well'){let c=state.checkins.find(x=>x.date===T);if(!c){c={date:T,appetite:'',note:''};state.checkins.push(c)}c.mood=c.mood||4;c.sleep=c.sleep??7;c.talked=true;eSay(`Wonderful. ${nextLine()} Is there anything else?`,'more')}
  else if(k==='slept_bad'){const ex=mkEx('insomnia',4);const tg=applyExtraction(ex,label);eSay(composeReply(ex,tg)+' Is there anything else?','more')}
  else if(k==='took'){const sl=dueSlotNow();if(sl){slotTaken(sl);eSay(`Well done! I've ticked off your ${SLOTL[sl].toLowerCase()} medicine. ${nextLine()}`,'more')}else eSay(`You're all up to date, ${n}. ${nextLine()}`,'more')}
  else if(k==='famsend')eSay(`What would you like me to tell ${fam}?`,'famsend');
  else if(k.startsWith('fm_')){state.family.feed.push({from:n+' (via EchoCare)',text:label,ts:T+' '+hm()});eSay(`Done. I've sent "${label}" to ${fam}. Is there anything else?`,'more')}
  else if(BPROMPT[k])eSay(BPROMPT[k],k);
  else if(k==='b_tired'){talk.pend='fatigue';eSay('How bad is it?','sev')}
  else if(k==='b_low'){const ex=mkEx('lowmood',5);ex.mood=2;applyExtraction(ex,label);eSay(`I'm here with you, ${n}. Would you like me to ask ${fam} to give you a call?`,'low')}
  else if(k==='callme'){state.family.feed.push({from:'EchoCare',text:`${n} is feeling low and would like a call.`,ts:T+' '+hm()});eSay(`I've asked ${fam} to call you. Shall we keep chatting while you wait?`,'more')}
  else if(k==='notnow')eSay('That\'s okay. I\'m here whenever you want to talk. Is there anything else?','more');
  else if(k==='emerg'||k==='s_breathless'||k==='faint'){const ex=mkEx(k==='emerg'?'chestpain':k==='faint'?'faint':'breathless',9);applyExtraction(ex,label);eSay(composeReply(ex,[]),'emerg')}
  else if(k.startsWith('s_')){talk.pend=k.slice(2);eSay('How bad is it?','sev')}
  else if(k.startsWith('sev')){const s=+k.slice(3),key=talk.pend||'other';const ex=mkEx(key,s);const tg=applyExtraction(ex,label+': '+SYMK[key].label);let r=composeReply(ex,tg);
    if(s>=9){state.family.feed.push({from:'EchoCare',text:`${n} says her ${SYMK[key].label.toLowerCase()} is very bad today. Please check on her.`,ts:T+' '+hm()});r+=` Because it is very bad, I've let ${fam} know. Please see a doctor today.${['falls','confusion'].includes(key)?'':' If it gets much worse, or you feel you might pass out, call 995.'}`}
    eSay(r+' Is there anything else?','more')}
  else if(k==='bye')eSay(`Thank you for chatting, ${n}. Take care. I'll remind you when your next medicine is due.`,'bye');
  save();renderElder();
}
async function eFree(text){text=text.trim();if(!text)return;talk.you=text;talk.busy=true;talk.typing=false;renderElder();await sendChat(text);const b=state.chat[state.chat.length-1];talk.busy=false;talk.say=b.text;talk.node=b.urgent?'emerg':'more';if(state.prefs.sound)speak(b.text,true);renderElder()}
function vElderApp(){
  const E=state.prefs.elder,ck=(k,l)=>`<label><input type="checkbox" id="ea_${k}" ${E[k]?'checked':''}> ${l}</label>`;
  return head(`${esc(state.patient.short)}'s app`,`What ${esc(state.patient.short)} sees and hears. Changes reach her phone straight away.`,`<button class="btn" data-act="to-elder">Open her app</button>`)+
  `<div class="cols wide"><div class="stack"><div class="card"><h2>Look and sound</h2><form class="form" id="eaForm">
    <div class="f s3"><label for="ea_name">What EchoCare calls her</label><input type="text" id="ea_name" value="${esc(state.patient.short)}"></div>
    <div class="f s3"><label for="ea_lang">Language for replies and voice</label><select id="ea_lang">${Object.keys(LANGS).map(l=>`<option ${E.lang===l?'selected':''}>${l}</option>`).join('')}</select><span class="hint">Her main buttons switch too. Have a native speaker check the wording.</span></div>
    <div class="f s3"><label for="ea_size">Text size</label><select id="ea_size">${[[1,'Large'],[1.15,'Larger'],[1.3,'Largest']].map(([v,l])=>`<option value="${v}" ${E.escale==v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="f s3"><label for="ea_rate">Speaking speed</label><select id="ea_rate">${[[.8,'Slow'],[.9,'Relaxed'],[1,'Normal']].map(([v,l])=>`<option value="${v}" ${E.rate==v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="f s6"><span class="lbl">Voice</span><div class="checks"><label><input type="checkbox" id="ea_sound" ${state.prefs.sound?'checked':''}> Read every message and reminder aloud</label>${ck('showNames','Show medicine names under the pill pictures')}</div></div>
    <div class="f s6"><span class="lbl">Buttons on her home screen</span><div class="checks">${ck('showAppt','Next doctor visit')}${ck('showTalk','Talk to EchoCare')}${ck('showCall','Call family')}${ck('showHelp','I need help')}${ck('showMessages','Medicine explanations')}${ck('showAllMeds','All my medicines today')}</div><span class="hint">The next-medicine card is always shown. Fewer buttons make the screen easier.</span></div>
    <div class="f s6"><label for="ea_call">The Call button rings</label><select id="ea_call">${state.family.contacts.map(c=>`<option value="${c.id}" ${famContact()&&famContact().id===c.id?'selected':''}>${esc(c.name)} (${esc(c.relation)}) \u00b7 ${esc(c.phone)}</option>`).join('')||'<option value="">Add a person under Settings, Guardian first</option>'}</select></div>
    <div class="f s3"><label for="ea_pin">Guardian PIN</label><input type="text" id="ea_pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" value="${esc(E.pin)}"><span class="hint">4 digits</span></div>
    <div class="f s3"><span class="lbl">Settings lock</span><div class="checks"><label><input type="checkbox" id="ea_lock" ${E.lock?'checked':''}> Ask for the PIN before family settings open</label></div></div>
    <div class="formfoot"><button class="btn primary">Save and update her app</button></div></form></div>
    ${remCard()}${circleCard()}</div>
   <div class="card"><h2>Preview of her screen</h2><div class="phoneframe"><div class="elderskin" inert>${eHome(true)}</div></div><p class="small muted" style="margin:10px 0 0">This is exactly what ${esc(state.patient.short)} sees right now.</p></div></div>`;
}
function pinOverlay(){window.__pin='';const draw=()=>`<div class="remind" role="dialog" aria-modal="true" aria-labelledby="pT"><h2 id="pT">Family settings</h2><p style="margin:0;font-size:17px">Enter the guardian PIN.</p><div class="pindots">${[0,1,2,3].map(i=>`<i class="${window.__pin.length>i?'on':''}"></i>`).join('')}</div><div class="keypad">${[1,2,3,4,5,6,7,8,9,'',0,'\u232b'].map(k=>k===''?'<span></span>':`<button data-pin="${k}">${k}</button>`).join('')}</div><p class="small muted" style="margin:0">Demo PIN: ${esc(state.prefs.elder.pin)}</p><button class="btn big" data-rm="close" style="font-size:17px">Cancel</button></div>`;showOverlay(draw());window.__pinDraw=draw}
function openFamily(){if(state.prefs.elder.lock)pinOverlay();else{setApp('family')}}
/* Keep her screen awake (where the browser allows) so reminders can show */
function keepAwake(){if(APP!=='elder'||!state.prefs.wake||window.__wl)return;try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(l=>{window.__wl=l;l.addEventListener('release',()=>{window.__wl=null})}).catch(()=>{})}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')keepAwake()});
function renderElder(){keepAwake();document.body.style.zoom=state.prefs.elder.escale||1;$('elder').innerHTML=ev==='talk'?eTalk():ev==='meds'?eMeds():eHome();pronDom($('elder'))}
function helpOverlay(){showOverlay(`<div class="remind" role="alertdialog" aria-modal="true" aria-labelledby="hT"><div class="bell" style="background:var(--crit-soft);color:var(--crit)">${IC.help}</div><h2 id="hT">Do you need help?</h2><p style="font-size:19px;margin:0">This sends an urgent message to ${esc(famName())}.</p><button class="btn big" data-rm="help-yes" style="background:#A3150D;border-color:#A3150D;color:#fff">Yes, tell ${esc(famName())}</button><button class="btn big" data-rm="close">No, go back</button></div>`);if(state.prefs.sound)speak('Do you need help? Press yes to tell your family.',true)}
function callOverlay(){const f=famContact();showOverlay(`<div class="remind" role="dialog" aria-modal="true"><div class="bell">${IC.phone}</div><h2>Call ${esc(f?f.name:'family')}</h2><p class="mono" style="font-size:32px;margin:0;user-select:all">${esc(f?f.phone:'No number saved')}</p>${f&&f.phone?`<a class="btn primary big" href="${esc(telHref(f.phone))}">Ring ${esc(f.name.split(' ')[0])} now</a>`:''}<button class="btn big" data-rm="close">Close</button></div>`)}
/* On a family device: something urgent just arrived from her phone. Rings until someone answers it. */
function urgentAlert(a){
  const p=state.patient;
  showOverlay(`<div class="remind flash" role="alertdialog" aria-modal="true" aria-labelledby="uT" style="border-color:var(--crit)"><div class="bell" style="background:var(--crit-soft);color:var(--crit)">${IC.help}</div><div><div class="eyebrow">Urgent \u00b7 from ${esc(p.short)}'s phone \u00b7 ${esc(whenText(a.ts)||clock(hm()))}</div><h2 id="uT">${esc(a.feed?'Urgent message':a.title)}</h2></div><p style="margin:0;font-size:17px">${esc(a.text)}</p>
   ${p.phone?`<a class="btn big dangerfill" href="${esc(telHref(p.phone))}">Call ${esc(p.short)} now</a>`:`<p class="small muted" style="margin:0">Add ${esc(p.short)}'s phone number under Her profile to call from here in one tap.</p>`}
   <button class="btn big primary" data-act="urgent-ack">I'm handling it</button></div>`);
  beep();try{navigator.vibrate&&navigator.vibrate([600,200,600,200,600])}catch(e){}
  clearInterval(window.__urgRep);let n=0;window.__urgRep=setInterval(()=>{if($('overlay').hidden||++n>120){clearInterval(window.__urgRep);document.title='EchoCare Companion';return}document.title=n%2?'URGENT: '+p.short:'EchoCare Companion';if(n%8===0)beep()},1500);
}

const VIEWS={elderapp:vElderApp,overview:vOverview,companion:vCompanion,checkin:vCheckin,meds:vMeds,symptoms:vSymptoms,watch:vWatch,notes:vNotes,appts:vAppts,memo:vMemo,guardian:vGuardian,profile:vProfile,connect:vConnect,trust:vTrust,pharm:vPharm};
function render(){
  document.body.dataset.app=APP;$('elder').hidden=APP!=='elder';$('familyApp').hidden=APP==='elder';$('bottomNav').hidden=APP==='elder';
  if(APP==='elder'){renderElder();return}
  section=ALIAS[section]||section;if(!VIEWS[section])section='overview';
  renderNav();document.body.style.zoom=1;{const vc=document.querySelector('.viewchip');if(vc)vc.textContent=section==='pharm'?'Pharmacist view':'Guardian view'}$('toElder').textContent='Open '+state.patient.short+'\'s app';
  const active=document.activeElement&&document.activeElement.id;const chatVal=$('chatIn')?$('chatIn').value:'';
  const g=groupOf(section);
  const sub=g&&GROUPS[g].items.length>1?`<div class="subtabs" role="tablist">${GROUPS[g].items.map(([k,l])=>{const [n,c]=navCount(k);return `<button data-go="${k}" ${section===k?'aria-current="page"':''}>${l}${n&&c?`<span class="cnt ${c}">${n}</span>`:''}</button>`}).join('')}</div>`:'';
  $('main').innerHTML=sub+VIEWS[section]();pronDom($('main'));pronDom($('bottomNav'));pronDom(document.querySelector('.topbar'));
  if($('chat')){$('chat').scrollTop=$('chat').scrollHeight;if(chatVal)$('chatIn').value=chatVal}
  if(active&&$(active)&&active==='chatIn')$(active).focus();
  if($('checkForm'))ciValidate();
  if(window.__sheet&&!$('overlay').hidden)refreshSheet();
}
function go(k){section=ALIAS[k]||k;window.__del=null;window.__confirmEmpty=false;render();window.scrollTo({top:0});if(section==='pharm')loadPharm()}
function toast(t){const el=$('toast');el.textContent=pronText(t);el.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>el.hidden=true,2600)}
function commit(msg){pendingRemote=null;if(window.__sheet)closeOverlay();save();render();if(msg)toast(msg)}
