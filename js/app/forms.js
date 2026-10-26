/* ================= adding things =================
   Every input lives in one slide-up sheet, reached from the + button on any screen or an Add button on its page. */
const SHEETS={
  med:{t:()=>window.__editMed?'Edit medicine':'Add a medicine',f:()=>medForm()},
  sym:{t:()=>'Log a symptom',f:()=>symForm()},
  ci:{t:()=>'Today\'s check-in',f:()=>ciForm()},
  appt:{t:()=>'Add an appointment',f:()=>apForm()},
  contact:{t:()=>'Add a care contact',f:()=>conForm()}
};
const ADD_MENU=[['med','Medicine','pill','New prescription, or one she bought'],['sym','Symptom','health','Something she has noticed'],['ci','Check-in','smile','Mood, sleep, pain today'],['appt','Appointment','cal','Doctor or clinic visit']];
const ADD_IC={bp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z"/><path d="M7 12h3l1.5-2.5 2 5 1.5-2.5h2"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  smile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14.5c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01"/></svg>'};
function sheetShell(kind){const S=SHEETS[kind];return `<div class="remind formsheet" role="dialog" aria-modal="true" aria-labelledby="shT"><div class="sh-head"><h2 id="shT">${esc(S.t())}</h2><button type="button" class="btn sm ghost" data-act="sheet-close">Close</button></div>${S.f()}</div>`}
function openSheet(kind,opt){
  if(!SHEETS[kind])return;window.__sheet=kind;showOverlay(sheetShell(kind));
  opt=opt||{};if(kind==='vit'&&opt.vt&&$('v_type')){$('v_type').value=opt.vt;$('v_type').dispatchEvent(new Event('change',{bubbles:true}))}
  const first=$('overlay').querySelector('input:not([type=file]):not([type=checkbox]):not([type=radio]),select,textarea');if(first&&kind!=='ci')first.focus();
}
function openAddMenu(){window.__sheet=null;showOverlay(`<div class="remind formsheet" role="dialog" aria-modal="true" aria-labelledby="amT"><div class="sh-head"><h2 id="amT">Add for ${esc(state.patient.short)}</h2><button type="button" class="btn sm ghost" data-rm="close">Close</button></div>
  <div class="chooser">${ADD_MENU.map(([k,l,ic,d])=>`<button type="button" data-sheet="${k}"><span class="ci">${ADD_IC[ic]||IC[ic]}</span><b>${l}</b><small>${d}</small></button>`).join('')}</div></div>`)}
/* Keep what was typed when the sheet redraws (for example after a photo is identified) */
function refreshSheet(){
  const ov=$('overlay'),snap={},open=[...ov.querySelectorAll('details')].map(d=>d.open);
  const key=el=>el.id||(el.name+':'+el.value);
  ov.querySelectorAll('input,select,textarea').forEach(el=>{if(el.type==='file'||el.disabled)return;snap[key(el)]={v:el.value,c:el.checked}});
  ov.innerHTML=sheetShell(window.__sheet);pronDom(ov);
  ov.querySelectorAll('input,select,textarea').forEach(el=>{const x=snap[key(el)];if(!x||el.type==='file')return;if(el.type==='checkbox'||el.type==='radio')el.checked=x.c;else el.value=x.v});
  ov.querySelectorAll('details').forEach((d,i)=>{if(open[i])d.open=true});
}
function medCard(m){
  const d=daysLeft(m),low=d!==null&&d<=10;
  const tile=`<label class="phototile${m.photo?' has':''}" title="${m.photo?'Retake':'Add'} tablet photo">${m.photo?`<img src="${m.photo}" alt="Photo of ${esc(m.name)}">`:`${CAMERA}<span>Tablet photo</span>`}<input type="file" accept="image/*" capture="environment" data-medphoto="${m.id}" aria-label="Tablet photo for ${esc(m.name)}"></label>`;
  return `<div class="rec medcard ${m.unconfirmed?'flag':''}" ${m.stopped?'style="opacity:.6"':''}><div class="medtop">${tile}<div class="medinfo"><div class="rec-top"><b>${esc(m.name)} ${esc(m.strength)}</b><div class="actions">${m.unconfirmed?'<span class="chip info">Please confirm</span>':''}${m.stopped?'<span class="chip plain">Stopped</span>':''}${m.source!=='Prescribed'?`<span class="chip warn">${esc(m.source)}</span>`:''}</div></div>
     <div class="meta"><span>${esc(m.prn?'When needed':schedText(m)+' \u00b7 '+unitWord(m,m.dosePerTake||1)+' each time')}</span><span>${esc(m.reason||'Reason not recorded')}</span><span>Since ${fmtY(m.start)}</span></div></div></div>
   ${!m.prn&&!m.stopped?`<div><div class="meter ${d<=3?'crit':low?'warn':''}"><span style="width:${Math.min(100,(d||0)/30*100)}%"></span></div><span class="small ${low?'':'muted'}">${m.qty} left \u00b7 about ${d} days</span></div>`:`<span class="small muted">${m.qty} left</span>`}
   ${explainBox(m)}
   <div class="actions">${!m.stopped&&!m.unconfirmed?`<button class="btn sm" data-act="explain" data-id="${m.id}" ${explainBusy===m.id?'disabled':''}>${explainBusy===m.id?'Writing\u2026':'What is it?'}</button>`:''}${m.unconfirmed?`<button class="btn sm primary" data-act="med-edit" data-id="${m.id}">Confirm details</button>`:`<button class="btn sm" data-act="med-edit" data-id="${m.id}">Edit</button>`}${!m.prn&&!m.stopped&&low?`<button class="btn sm" data-act="refill-req" data-id="${m.id}">Request refill</button>`:''}${!m.prn&&!m.stopped?`<button class="btn sm" data-act="refill" data-id="${m.id}">Refilled +30</button>`:''}${m.photo?`<button class="btn sm ghost" data-act="photo-del" data-id="${m.id}">Remove photo</button>`:''}<button class="btn sm" data-act="med-stop" data-id="${m.id}">${m.stopped?'Restart':'Mark stopped'}</button><button class="btn sm danger" data-act="med-del" data-id="${m.id}">Remove</button></div></div>`;
}
/* Before a new medicine is added: what it could clash with, or what side effect it might be treating */
function preCheck(o){
  const tmp=Object.assign({id:'__new',start:T,stopped:false,unconfirmed:false,slots:[],prn:false},o);state.meds.push(tmp);
  let inter=[],ch=[];try{inter=interactions().filter(x=>x.text.includes(o.name)||x.title.includes(o.name));ch=chains().filter(c=>c.a.id==='__new'||(c.b&&c.b.id==='__new'))}finally{state.meds=state.meds.filter(m=>m.id!=='__new')}
  const out=ch.map(c=>c.b&&c.b.id==='__new'?`<b>${esc(o.name)}</b> is often used for <u>${esc(c.rule.effect)}</u>, which <b>${esc(c.a.name)}</b> can cause. Ask whether ${esc(c.a.name)} is the real cause before adding another medicine.`:`<b>${esc(o.name)}</b> can cause <u>${esc(c.rule.effect)}</u>.`);
  inter.forEach(x=>out.push(`<b>${esc(x.title)}.</b> ${esc(String(x.text).replace(' is on the Beers Criteria list of medicines that are often risky for people over 65.',' is often risky for people over 65.'))}`));
  return out;
}
function confirmBox(title,text,yesAct,id,yesLabel,danger){showOverlay(`<div class="remind" role="alertdialog" aria-modal="true" aria-labelledby="cfT"><h2 id="cfT">${esc(title)}</h2><p style="margin:0">${esc(text)}</p><div class="rowbtns"><button class="btn big" data-rm="close" style="font-size:16px">Cancel</button><button class="btn big ${danger?'dangerfill':'primary'}" data-act="${yesAct}" data-id="${id}" style="font-size:16px">${esc(yesLabel)}</button></div></div>`)}
function vMeds(){
  const list=state.meds.slice().sort((a,b)=>(a.stopped-b.stopped)||(b.unconfirmed-a.unconfirmed)||b.start.localeCompare(a.start));
  return head('Medicines',`Everything ${esc(state.patient.short)} takes, including medicines she bought or was given.`,`<div class="actions"><a class="btn" target="_blank" rel="noopener" href="https://www.healthhub.sg/" title="Her official medication list from NEHR is in HealthHub">Compare with HealthHub</a><button class="btn primary" data-sheet="med">Add medicine</button></div>`)+
  `<div class="list grid2">${list.map(medCard).join('')||'<div class="empty">No medicines yet.</div>'}</div>`;
}

function vSymptoms(){
  const ch=chains();const linkFor=s=>ch.filter(c=>c.rule.sym.includes(s.key)&&c.ev.some(e=>e.k==='symptom'));
  const list=state.symptoms.slice().sort((a,b)=>(a.resolved-b.resolved)||b.start.localeCompare(a.start));
  return head('Symptoms',`Each one is checked against when her medicines started.`,`<button class="btn primary" data-sheet="sym">Add symptom</button>`)+
  `<div class="card"><h2>Symptom log <span class="chip plain">${state.symptoms.filter(s=>!s.resolved).length} active</span></h2><div class="list">${list.map(s=>{const L=linkFor(s);const sc=s.severity>=7?'crit':s.severity>=4?'warn':'';
     return `<div class="rec ${L.length&&!s.resolved?'flag':''}" ${s.resolved?'style="opacity:.6"':''}><div class="rec-top"><b>${esc(s.label)}</b><div class="actions">${s.resolved?'<span class="chip plain">Resolved</span>':`<span class="chip ${s.trend==='Worse'?'crit':s.trend==='Better'?'ok':'plain'}">${esc(s.trend)}</span>`}<span class="chip plain">${esc(s.source)}</span></div></div>
     <div class="meta"><span>Since ${fmtY(s.start)} (${ago(s.start)})</span>${s.area?`<span>${esc(s.area)}</span>`:''}<span>${esc(s.freq)}</span>${s.time&&s.time!=='Any time'?`<span>${esc(s.time)}</span>`:''}<span>Mentioned ${(s.mentions||[]).length||1}\u00d7</span></div>
     <div style="display:flex;align-items:center;gap:10px"><div class="meter ${sc}" style="flex:1"><span style="width:${s.severity*10}%"></span></div><span class="mono">${s.severity}/10</span></div>
     ${L.length?`<span class="small"><span class="flagtxt">May be linked to ${L.map(c=>esc(c.a.name)).join(', ')}</span> \u00b7 <button class="btn sm ghost" data-go="watch" style="padding:0">Notes</button></span>`:''}
     ${s.notes?`<span class="small muted">${esc(s.notes)}</span>`:''}
     <div class="actions">${s.resolved?'':`<button class="btn sm" data-act="sym-again" data-id="${s.id}">Happened again today</button><button class="btn sm" data-act="sym-sev" data-id="${s.id}" data-d="1">Worse</button><button class="btn sm" data-act="sym-sev" data-id="${s.id}" data-d="-1">Better</button>`}<button class="btn sm" data-act="sym-res" data-id="${s.id}">${s.resolved?'Reopen':'Resolved'}</button><button class="btn sm danger" data-act="sym-del" data-id="${s.id}">${window.__del===s.id?'Tap again to remove':'Remove'}</button></div></div>`}).join('')||'<div class="empty">No symptoms logged.</div>'}</div></div>`;
}
