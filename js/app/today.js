/* ---------- plain-language findings ---------- */
function plainPath(p){
  const n=state.patient.short,s=[],a=p[0].a;
  const src=a.source==='Given by someone'?' (given to her by someone else)':a.source==='Bought myself'?' (bought without a prescription)':'';
  s.push(`${esc(n)} takes <b>${esc(a.name)}</b>${src}${a.reason?' for '+esc(a.reason.toLowerCase()):''}.`);
  p.forEach(c=>{
    s.push(`<b>${esc(c.a.name)}</b> can cause <u>${esc(c.rule.effect)}</u>.`);
    const sy=state.symptoms.find(x=>!x.resolved&&c.rule.sym.includes(x.key));
    if(sy){const k=(sy.mentions||[]).length;s.push(`She has reported ${esc(sy.label.toLowerCase())}${k>1?' '+k+' times':''}.`)}
    if(c.b){const g=diff(c.a.start,c.b.start);s.push(`${g>0?g+' days later':'Later'} she was started on <b>${esc(c.b.name)}</b>${c.b.reason?' for '+esc(c.b.reason.toLowerCase()):''}, which may be treating that side effect instead of its cause.`)}
    else{const has=hasAny(c.rule.to).find(m=>m.id!==c.a.id),to=c.rule.to.map(t=>TO_LABEL[t]).filter(Boolean)[0];
      if(has)s.push(`It can also <u>work against ${esc(has.name)}</u>, another of her medicines.`);
      else if(to&&!c.rule.expected)s.push(`This is sometimes treated with <u>${esc(to)}</u>, which would add yet another medicine.`)}
  });
  return {text:s.join(' '),q:`Could <b>${esc(a.name)}</b> be behind the ${esc(p[p.length-1].rule.effect)}${p.length>1?' and the medicine added since':''}?`};
}
function pathCard(p,i,hero){
  const t=plainPath(p),asked=p.every(c=>c.status==='Ask doctor'||c.status==='Discussed with doctor');
  return `<section class="card plaincard${hero?' herochain':''}" ${!hero&&i===0?'id="cascadeMap"':''}>${hero?'<span class="eyebrow">Worth asking the doctor about</span>':''}
   <p class="plain">${t.text}</p><p class="plainq"><b>Worth asking:</b> ${t.q}</p>
   <div class="actions">${asked?'<span class="chip ok">\u2713 On the doctor memo</span>':`<button class="btn primary" data-act="path-ask" data-i="${i}">Add to doctor memo</button>`}<button class="btn" data-act="path-dismiss" data-i="${i}">Not relevant</button>${hero?'<button class="btn ghost" data-go="watch">See all</button>':''}</div></section>`;
}
function prnRow(){const prn=active().filter(m=>m.prn&&!m.unconfirmed);if(!prn.length)return '';
  return `<div class="prnrow"><span class="eyebrow">Took a when-needed medicine? Tap it</span><div class="prnicons">${prn.map(m=>`<button class="prnicon" data-act="prn" data-id="${m.id}">${pillSVG(m,26)}<b>${esc(m.name.replace(/\s*\(.*\)/,''))}</b><small>${esc(m.strength)}</small></button>`).join('')}</div></div>`}
/* Strengths a when-needed medicine commonly comes in, so the family can pick the one in the box */
const PRN_STRENGTHS={ibuprofen:['200 mg','400 mg','600 mg'],acetaminophen:['500 mg','650 mg','1000 mg']};
const PRN_COUNTS=[0.5,1,1.5,2,2.5,3,4,5,6];
function prnTotalText(){const n=+(($('prnN')||{}).value||1),mg=(($('prnMg')||{}).value||'');const x=mg.match(/([\d.]+)\s*(mg|mcg|g|ml)/i);return x?`${+(+x[1]*n).toFixed(1)} ${x[2]} in total`:''}
function prnPrompt(m){if(!m)return;
  const strengths=[...new Set([m.strength].concat(PRN_STRENGTHS[fdaKey(m)]||[]).filter(Boolean))];
  const def=m.dosePerTake||1,unit=unitWord(m,2).replace(/^\d+ /,'');
  showOverlay(`<div class="remind prnsheet" role="dialog" aria-modal="true" aria-labelledby="pnT">
   <div class="prnhead"><span class="prnpic">${pillSVG(m,30)}</span><div><h2 id="pnT">How much ${esc(m.name)} did she take?</h2><p class="small muted" style="margin:2px 0 0">${m.reason?'Usually for '+esc(m.reason.toLowerCase())+' \u00b7 ':''}${m.qty} left</p></div></div>
   <div class="prnform">
    <label for="prnN">Number of ${esc(unit)}<select id="prnN">${PRN_COUNTS.map(n=>`<option value="${n}" ${n===def?'selected':''}>${n===0.5?'Half':n===1.5?'1 and a half':n===2.5?'2 and a half':n}</option>`).join('')}</select></label>
    <label for="prnMg">Strength of each<select id="prnMg">${strengths.map(x=>`<option ${x===m.strength?'selected':''}>${esc(x)}</option>`).join('')}</select></label>
    <label for="prnTime">Taken at<input type="time" id="prnTime" value="${hm()}"></label>
   </div>
   <p class="prntotal" id="prnTotal" aria-live="polite">${esc(prnTotalText()||'')}</p>
   <div class="rowbtns"><button class="btn big" data-rm="close" style="font-size:16px">Cancel</button><button class="btn big primary" data-act="prn-log" data-id="${m.id}" style="font-size:16px">Log it</button></div></div>`);
  const t=$('prnTotal');if(t)t.textContent=prnTotalText();
}
function visitBar(){const ap=nextAppt();
  if(!ap)return `<div class="card visitbar"><div class="vb-when"><span class="eyebrow">Next appointment</span><b>None booked</b></div><div class="actions"><button class="btn sm" data-go="appts">Appointments</button></div></div>`;
  const d=P(ap.date),n=diff(T,ap.date),when=n===0?'Today':n===1?'Tomorrow':'In '+n+' days';
  return `<div class="card visitbar"><div class="vb-when"><span class="eyebrow">Next appointment</span><b>${WFULL[d.getDay()]} ${d.getDate()} ${MFULL[d.getMonth()]}, ${clock(ap.time||'09:00')}</b><span class="chip ${n<=1?'crit':'info'}">${when}</span></div><div class="vb-who"><b>${esc(ap.with)}</b><span class="muted">${esc(ap.place||'')}</span></div><div class="actions"><button class="btn sm" data-go="memo">Doctor memo</button><a class="btn sm" target="_blank" rel="noopener" href="${esc(gcalLink(apptCal(ap)))}">Add to calendar</a></div></div>`}
function vOverview(){
  const paths=cascadePaths(),seen=new Set();
  const al=alerts().filter(a=>a.go!=='watch'&&!(/blood pressure/i.test(a.title)&&a.sev!=='crit')).filter(a=>{const k=a.title+'|'+String(a.text).replace(/\d\d:\d\d/g,'');if(seen.has(k))return false;seen.add(k);return true});
  return demoBanner()+head(`Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}`,fmtW(T))+visitBar()+circlesCard()+
  `<div class="cols wide"><div class="card" id="todayDoses"><h2>Today's doses</h2>${timeline()}${prnRow()}</div>
   <div class="stack">${paths.length?pathCard(paths[0],0,true):''}
    <div class="card"><h2>Also needs attention ${al.length?`<span class="chip ${al.some(a=>a.sev==='crit')?'crit':'plain'}">${al.length}</span>`:''}</h2>${al.length?al.slice(0,6).map(alertRow).join(''):'<div class="empty">Nothing else right now.</div>'}</div></div></div>`;
}
const apptCal=a=>({title:'Doctor visit: '+a.with,date:a.date,time:a.time||'09:00',place:a.place,details:(a.purpose?a.purpose+'. ':'')+'Bring the EchoCare doctor sheet and all medicine boxes.'});

const DEMO_LINES=["Morning! I slept okay, but my ankles are swollen again.","I took my morning pills already.","My knee was very painful so I took the ibuprofen my neighbour gave me.","Feeling a bit dizzy when I stand up from the sofa.","I forgot my evening medicine yesterday.","I bought some flu tablets from the pharmacy for my cold.","My chest feels very tight and painful."];
function chatBubbles(){return state.chat.map((m,i)=>{
    const cls=m.who==='me'?'me':m.who==='fam'?'fam':'bot';
    const tags=m.tags&&m.tags.length?`<div class="tags">${m.tags.map(t=>`<span class="chip ${t[0]}">${esc(t[1])}</span>`).join('')}</div>`:'';
    const share='';
    const body=m.pending?'<span class="typing" aria-label="EchoCare is thinking"><i></i><i></i><i></i></span>':esc(m.text);
    return `<div class="msg ${cls}${m.urgent?' urgent':''}">${m.who==='fam'?'<b>'+esc(m.from)+':</b> ':''}${body}<span class="by">${m.who==='me'?esc(state.patient.short):m.who==='fam'?'Family message':'EchoCare'+(m.ai===false?' \u00b7 offline rules':'')} \u00b7 ${esc(m.ts)}</span>${tags}${share}</div>`;
  }).join('')}
/* The things worth a carer's attention from her conversation, grouped instead of listed one by one */
function convoSummary(){
  const sym={},dose=[],read=[],newm=[],urgent=[];
  state.chat.forEach(m=>(m.tags||[]).forEach(([k,t])=>{if(t.startsWith('Symptom: ')){const x=t.slice(9);sym[x]=(sym[x]||0)+1}
    else if(/dose logged|: taken|: missed/.test(t))dose.push(t);else if(/^(Blood pressure|Blood sugar|Weight|Temp|Pulse)/.test(t))read.push(t);
    else if(t.startsWith('New medicine to confirm'))newm.push(t.replace('New medicine to confirm: ',''));else if(/Family alerted/.test(t))urgent.push(m.ts)}));
  const li=[];
  if(urgent.length)li.push(`<li class="crit"><b>Emergency words used</b> at ${esc(urgent.join(', '))}. Family was alerted.</li>`);
  const ss=Object.entries(sym);if(ss.length)li.push(`<li><b>Symptoms she described:</b> ${ss.map(([x,n])=>esc(x.toLowerCase())+(n>1?' ('+n+' times)':'')).join(', ')}.</li>`);
  const missed=dose.filter(d=>/missed/.test(d));if(missed.length)li.push(`<li><b>Missed doses she mentioned:</b> ${esc(missed.map(d=>d.replace(/: missed/,'')).join(', '))}.</li>`);
  if(newm.length)li.push(`<li><b>New medicines to check:</b> ${esc([...new Set(newm)].join(', '))}. Confirm them under Medicines.</li>`);
  if(read.length)li.push(`<li><b>Readings she gave:</b> ${esc(read.join(', '))}.</li>`);
  const took=dose.filter(d=>!/missed/.test(d));if(took.length)li.push(`<li>${took.length} dose${took.length>1?'s':''} confirmed by her in conversation.</li>`);
  return li.length?`<ul class="summary">${li.join('')}</ul>`:'<div class="empty">Nothing to note yet.</div>';
}
let aiSum=null,aiSumBusy=false;
async function aiSummary(){
  if(aiSumBusy)return;if(!sample){toast(ONLINE_AI?'AI summaries need permission to use Claude.':NOAI);return}
  aiSumBusy=true;render();
  try{const lines=state.chat.filter(c=>!c.pending).slice(-30).map(c=>(c.who==='me'?state.patient.short:c.who==='fam'?'Family':'EchoCare')+': '+c.text).join('\n');
    const r=await sample(`Summarise this conversation between an older adult and their medication companion for their family carer. Give at most 4 short bullet points, most important first: new or worsening symptoms, missed or extra doses, new medicines, and anything unusual. Ignore small talk. Plain words, no diagnosis, no advice to change medicines. Start each bullet with "- ".\n\n${lines}`,{modelTier:'quick'});
    aiSum=String(r&&r.text||'').split('\n').map(x=>x.replace(/^\s*[-*]\s*/,'').trim()).filter(Boolean).slice(0,4)}
  catch(e){toast('Could not summarise right now.');if(e&&e.code==='not_granted')sample=null}
  aiSumBusy=false;render();
}
function vCompanion(){
  return head('Conversation',`${esc(state.patient.short)}'s own words about how she feels and her medicines. EchoCare keeps the conversation on her health.`,`<label class="toggle"><input type="checkbox" id="ttsT" ${window.__tts?'checked':''}> Read replies aloud</label>`)+
  `<div class="cols wide"><div class="card chatwrap">
    <div class="chat" id="chat" aria-live="polite">${chatBubbles()}</div>
    <div><div class="eyebrow" style="margin-bottom:6px">Things she might say</div><div class="says">${DEMO_LINES.map(x=>`<button type="button" data-say="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
    <form class="composer" id="chatForm"><input id="chatIn" placeholder="How she feels, a symptom, or a medicine she took" aria-label="Message" autocomplete="off"><button class="send" aria-label="Send" ${chatBusy?'disabled':''}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2-7-8-1z"/></svg></button></form>
    <p class="small muted" style="margin:0">${sample?'Replies are written by Claude.':(ONLINE_AI?'Running on built-in rules. Allow Claude when asked for natural replies.':'Demo version: running on the built-in rules. The full version replies using Claude.')} In her app, ${esc(state.patient.short)} can tap Speak to EchoCare and just talk.</p>
  </div>
  <div class="card"><h2>Things to note <button class="btn sm" data-act="ai-sum" ${aiSumBusy?'disabled':''}>${aiSumBusy?'Summarising\u2026':'Summarise with AI'}</button></h2>
    ${aiSum&&aiSum.length?`<div class="aibox" style="margin:0 0 12px"><b>AI summary</b><ul class="summary" style="margin-top:6px">${aiSum.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}${convoSummary()}</div></div>`;
}

function remCard(){
  const nx=nextDue(),pf=state.prefs;
  return `<div class="card"><h2>Reminder times <span class="chip ${pf.reminders?'ok':'plain'}">${pf.reminders?'On':'Off'}</span></h2><form class="form" id="remForm">
    ${SLOTS.map(x=>`<div class="f s3"><label for="rt_${x.k}">${x.l}</label><input type="time" id="rt_${x.k}" value="${slotT(x.k)}"><span class="hint">${scheduled().filter(m=>m.slots.includes(x.k)).map(m=>m.name).join(', ')||'No medicines at this time'}</span></div>`).join('')}
    <div class="f s3"><label for="rt_snooze">Snooze for</label><select id="rt_snooze">${[5,10,15,30].map(n=>`<option value="${n}" ${pf.snooze===n?'selected':''}>${n} minutes</option>`).join('')}</select></div>
    <div class="f s3"><span class="lbl">Alerts</span><div class="checks"><label><input type="checkbox" id="rt_on" ${pf.reminders?'checked':''}> Reminders on</label><label><input type="checkbox" id="rt_sound" ${pf.sound?'checked':''}> Chime and read aloud</label><label><input type="checkbox" id="rt_wake" ${pf.wake?'checked':''}> Keep her screen on</label></div></div>
    <div class="formfoot"><button class="btn primary">Save reminder times</button>${nx?`<button type="button" class="btn" data-act="test-remind" data-slot="${nx.slot}">Preview the reminder</button>`:''}</div></form>
    <p class="small muted" style="margin:10px 0 0">The chime repeats every 30 seconds until she answers, and the tab title flashes. Family is told if a dose is still missed 2 hours later. To reach any phone, add each time to a calendar:</p>
    <div class="actions" style="margin-top:8px">${SLOTS.filter(x=>scheduled().some(m=>m.slots.includes(x.k))).map(x=>`<a class="btn sm" target="_blank" rel="noopener" href="${esc(gcalLink({title:x.l+' medicines',date:T,time:slotT(x.k),mins:10,recur:'FREQ=DAILY',details:'Open EchoCare to see which medicines to take and tick them off.'}))}">${x.l} in Google Calendar</a>`).join('')}</div></div>`;
}

function medForm(){
  const e=window.__editMed?state.meds.find(m=>m.id===window.__editMed):null;const v=(k,d)=>e?esc(e[k]):d;
  const pr=photoResult;
  const pbox=photoBusy?'<div class="aibox">Looking at the photo\u2026</div>':pr?(pr.err?`<div class="aibox err">${esc(pr.err)}</div>`:pr.identified?`<div class="aibox ${pr.confidence==='low'?'low':''}"><b>${esc(pr.name)} ${esc(pr.strength||'')}</b> \u00b7 ${esc(pr.confidence)} confidence<br><span class="small">${esc(pr.evidence||'')}</span>${pr.warning?`<br><span class="small"><b>Note:</b> ${esc(pr.warning)}</span>`:''}<br><span class="small">The form below has been filled in. Check every field against the label before saving.</span></div>`:`<div class="aibox low">Could not identify this medicine. ${esc(pr.evidence||'')} Try a photo of the box or label, or type the name.</div>`):'';
  return `<form class="form" id="medForm">
    <div class="photo"><div class="thumb" id="thumb">${window.__thumb?`<img src="${window.__thumb}" alt="Medicine photo">`:'No photo'}</div>
      <div><div class="lbl" style="font-weight:700;font-size:13px">Start with a photo (optional)</div><p class="small muted" style="margin:2px 0 8px">The box or label fills in the form. A photo of the tablet itself is shown in ${esc(state.patient.short)}'s app.</p>
      <div class="actions"><label class="btn sm filebtn">Snap or choose photo<input type="file" id="m_photo" accept="image/*" capture="environment"></label><button type="button" class="btn sm primary" data-act="identify" ${photoFile&&!photoBusy?'':'disabled'}>Identify with AI</button></div>${pbox}
      <div class="checks" style="margin-top:8px"><label><input type="checkbox" id="m_usephoto" ${window.__medThumb?'checked':''} ${window.__medThumb?'':'disabled'}> Show this photo as the tablet in ${esc(state.patient.short)}'s app</label></div></div></div>
    <div class="f s4"><label for="m_name">Medicine name</label><input type="text" id="m_name" list="druglist" required value="${v('name','')}" placeholder="e.g. Amlodipine"></div>
    <div class="f s2"><label for="m_strength">Strength</label><input type="text" id="m_strength" value="${v('strength','')}" placeholder="e.g. 10 mg"></div>
    <div class="f s6"><span class="lbl">When it is taken</span><div class="checks">${SLOTS.map(s=>`<label><input type="checkbox" name="m_slot" value="${s.k}" ${e&&e.slots.includes(s.k)?'checked':''}> ${s.l} <span class="small muted">${clock(slotT(s.k))}</span></label>`).join('')}<label><input type="checkbox" id="m_prn" ${e&&e.prn?'checked':''}> Only when needed</label></div></div>
    <div class="f s2"><label for="m_dose">Amount each time</label><input type="number" id="m_dose" min="0.5" step="0.5" value="${v('dosePerTake','1')}"></div>
    <div class="f s2"><label for="m_qty">Pills left</label><input type="number" id="m_qty" min="0" step="1" value="${v('qty','30')}"></div>
    <div class="f s2"><label for="m_start">Started on</label><input type="date" id="m_start" value="${e?e.start:T}" max="${T}"><span class="hint">Needed for safety checks</span></div>
    <div class="f s3"><label for="m_reason">What it is for</label><input type="text" id="m_reason" value="${v('reason','')}" placeholder="e.g. High blood pressure"></div>
    <div class="f s3"><label for="m_source">Where it came from</label><select id="m_source">${['Prescribed','Bought myself','Given by someone'].map(o=>`<option ${e&&e.source===o?'selected':''}>${o}</option>`).join('')}</select></div>
    <details class="more f s6"><summary>More details: form, pill look, food, prescriber, notes</summary><div class="form">
    <div class="f s2"><label for="m_form">Form</label><select id="m_form">${['Tablet','Capsule','Liquid','Inhaler','Injection','Patch','Cream','Drops'].map(o=>`<option ${e&&e.form===o?'selected':''}>${o}</option>`).join('')}</select></div>
    <div class="f s2"><label for="m_color">Pill colour</label><select id="m_color">${Object.keys(PILLC).map(c=>`<option value="${c}" ${(e?e.color:'white')===c?'selected':''}>${cap(c)}</option>`).join('')}</select></div>
    <div class="f s2"><label for="m_shape">Pill shape</label><select id="m_shape">${['round','oval','capsule'].map(c=>`<option value="${c}" ${(e?e.shape:'round')===c?'selected':''}>${cap(c)}</option>`).join('')}</select></div>
    <div class="f s3"><label for="m_food">Food</label><select id="m_food">${['Any time','With food','Before food','After food'].map(o=>`<option ${e&&e.withFood===o?'selected':''}>${o}</option>`).join('')}</select></div>
    <div class="f s3"><label for="m_pres">Prescribed by</label><input type="text" id="m_pres" value="${v('prescriber','')}" placeholder="Doctor or clinic"></div>
    <div class="f s6"><label for="m_notes">Notes</label><input type="text" id="m_notes" value="${v('notes','')}" placeholder="Label directions, side effects noticed, pharmacy"></div>
    </div></details>
    <div class="prewarn f s6" id="preWarn" hidden role="alert"></div>
    <div class="formfoot"><button class="btn primary">${e?'Save changes':'Add medicine'}</button><button type="button" class="btn" data-act="cancel-edit">Cancel</button><span class="small muted" id="medCheck"></span></div>
    <datalist id="druglist">${Object.keys(DRUGS).map(d=>`<option value="${cap(d)}">`).join('')}</datalist>
  </form>`;
}
function fdaPanel(m){
  const k=fdaKey(m);if(!k||m.stopped)return '';const d=FDA[k];const mine=new Set(state.symptoms.filter(s=>!s.resolved).map(s=>s.key));
  const max=d.top[0][1];const hits=Object.entries(d.sig).filter(([s])=>mine.has(s));
  return `<details class="fda"><summary>FDA reports from people over 65${hits.length?` <span class="chip crit">${hits.length} match her symptoms</span>`:''}</summary>
   <div class="bars">${d.top.map(([t,n])=>`<div><span>${esc(t)}</span><span class="b" style="width:${(n/max*100).toFixed(0)}%"></span><span class="mono">${nf(n)}</span></div>`).join('')}
   ${hits.map(([s,n])=>`<div class="hit"><span>${esc(cap(SIGTERM[s]))}</span><span class="b" style="width:${Math.max(4,n/max*100).toFixed(0)}%"></span><span class="mono">${nf(n)}</span></div>`).join('')}</div>
   ${d.boxed?`<div class="boxed"><b>FDA boxed warning.</b> ${esc(d.boxed)}</div>`:''}
   <p class="small muted" style="margin:8px 0 0">${nf(d.total)} reports in total. Red rows match symptoms ${esc(state.patient.short)} has mentioned. Reports show what people noticed, not how often it happens. Source: ${FDA_SRC}.</p></details>`;
}
let explainBusy=null;const explained={};
function explainBox(m){const x=explained[m.id];if(!x)return '';return `<div class="aibox"><b>What it is</b><br>${esc(x)}<div class="actions" style="margin-top:8px"><button class="btn sm" data-act="explain-say" data-id="${m.id}">Read aloud</button><button class="btn sm" data-act="explain-send" data-id="${m.id}">Send to ${esc(state.patient.short)}'s app</button></div></div>`}
async function explainMed(id){
  const m=state.meds.find(x=>x.id===id);if(!m||explainBusy)return;
  if(!sample){toast(ONLINE_AI?'Plain-language explanations need permission to use Claude.':NOAI);return}
  explainBusy=id;render();
  const k=fdaKey(m);const ctx={medicine:m.name,strength:m.strength,when:schedText(m),food:m.withFood,reason:m.reason,ageOfPerson:state.patient.age,fdaCommonReportsOver65:k?FDA[k].top.map(t=>t[0]):[],fdaBoxedWarning:k?FDA[k].boxed||null:null};
  try{const r=await sample(`Explain this medicine to a ${state.patient.age}-year-old in ${(state.prefs.elder||{}).lang||'English'}, speaking to them directly as "${state.patient.short}". Use 3 short sentences in everyday words: what it is for, how and when to take it, and the one thing to tell the family or doctor about if it happens. Do not give dosing changes or tell them to stop it. Plain text only.\nData: ${JSON.stringify(ctx)}`,{modelTier:'quick'});
    explained[id]=(r&&r.text||'').trim()||'No explanation came back. Try again.';}
  catch(e){toast(e&&e.code==='not_granted'?'Permission to use Claude was declined.':'Could not write an explanation right now.');if(e&&e.code==='not_granted')sample=null}
  explainBusy=null;render();
}
function symForm(){
  return `<form class="form" id="symForm">
    <div class="f s6"><label for="s_key">What is happening?</label><select id="s_key">${SYM.map(s=>`<option value="${s.key}">${esc(s.label)}${s.emer?' (emergency)':''}</option>`).join('')}</select></div>
    <div class="f s6" id="s_otherWrap" hidden><label for="s_other">Type the symptom</label><input type="text" id="s_other" placeholder="e.g. Sore throat"><span class="hint">Saved in these words and added to the doctor memo.</span></div>
    <div class="f s6"><label for="s_sev">How bad, 1 to 10</label><div class="sev"><input type="range" id="s_sev" min="1" max="10" value="4"><output id="s_sevOut">4 / 10</output></div><span class="hint">1 = barely noticeable, 10 = worst imaginable</span></div>
    <div class="f s3"><label for="s_start">When it started</label><input type="date" id="s_start" value="${T}" max="${T}"></div>
    <div class="f s3"><label for="s_after">After a new medicine?</label><select id="s_after"><option value="">Not sure</option>${active().map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select><span class="hint">Links it as a suspected side effect</span></div>
    <details class="more f s6"><summary>More details: where, how often, trend, notes</summary><div class="form">
    <div class="f s3"><label for="s_area">Where in the body</label><select id="s_area"><option value="">Not specific</option>${AREAS.map(a=>`<option>${a}</option>`).join('')}</select></div>
    <div class="f s3"><label for="s_by">Reported by</label><select id="s_by"><option>${esc(state.patient.short)}</option><option>Family</option><option>Carer</option><option>Doctor</option></select></div>
    <div class="f s2"><label for="s_freq">How often</label><select id="s_freq">${['Once','Comes and goes','Every day','All the time'].map(o=>`<option>${o}</option>`).join('')}</select></div>
    <div class="f s2"><label for="s_time">Time of day</label><select id="s_time">${['Any time','Morning','Afternoon','Evening','Night','After meals','On standing up'].map(o=>`<option>${o}</option>`).join('')}</select></div>
    <div class="f s2"><label for="s_trend">Compared with before</label><select id="s_trend">${['New','Worse','Same','Better'].map(o=>`<option>${o}</option>`).join('')}</select></div>
    <div class="f s6"><label for="s_notes">Notes</label><textarea id="s_notes" placeholder="What makes it better or worse, anything else noticed"></textarea></div>
    </div></details>
    <div class="formfoot"><button class="btn primary">Save symptom</button><span class="small muted">Chest pain, stroke signs or severe breathlessness: call 995 now. Feeling faint that does not pass: call 995.</span></div></form>`;
}
function ciForm(){
  const c=state.checkins.find(x=>x.date===T)||{};const ML=['','Very low','Low','OK','Good','Great'];
  return `<form class="form" id="ciForm">
    <div class="f s6"><span class="lbl">How are you feeling?</span><div class="moods">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="ci_mood" value="${n}" ${c.mood===n?'checked':''}><span>${n}<br>${ML[n]}</span></label>`).join('')}</div></div>
    <div class="f s2"><label for="ci_sleep">Hours slept</label><input type="number" id="ci_sleep" min="0" max="16" step="0.5" value="${c.sleep??''}"></div>
    <div class="f s2"><label for="ci_pain">Pain, 0 to 10</label><input type="number" id="ci_pain" min="0" max="10" value="${c.pain??''}"></div>
    <div class="f s2"><label for="ci_app">Appetite</label><select id="ci_app">${['Good','OK','Poor'].map(o=>`<option ${c.appetite===o?'selected':''}>${o}</option>`).join('')}</select></div>
    <div class="f s6"><span class="lbl">Talked with someone today?</span><div class="checks"><label><input type="radio" name="ci_talk" value="yes" ${c.talked?'checked':''}> Yes</label><label><input type="radio" name="ci_talk" value="no" ${c.talked===false?'checked':''}> Not yet</label></div></div>
    <div class="f s6"><label for="ci_note">Anything else?</label><input type="text" id="ci_note" value="${esc(c.note||'')}"></div>
    <div class="formfoot"><button class="btn primary">Save check-in</button></div></form>`;
}
function apForm(){
  return `<form class="form" id="apForm">
    <div class="f s3"><label for="a_date">Date</label><input type="date" id="a_date" required min="${T}"></div><div class="f s3"><label for="a_time">Time</label><input type="time" id="a_time" value="10:00"></div>
    <div class="f s3"><label for="a_with">With</label><input type="text" id="a_with" placeholder="Doctor, clinic or service" required></div><div class="f s3"><label for="a_place">Where</label><input type="text" id="a_place"></div>
    <div class="f s6"><label for="a_purpose">Purpose</label><input type="text" id="a_purpose" placeholder="e.g. Blood pressure review"></div>
    <div class="formfoot"><button class="btn primary">Add appointment</button></div></form>`;
}
/* Country codes and the number of digits each country uses (without the leading 0) */
const CCODES=[['+65','Singapore',d=>/^[3689]\d{7}$/.test(d),'8 digits, starting with 3, 6, 8 or 9'],['+60','Malaysia',d=>/^\d{8,10}$/.test(d),'8 to 10 digits'],['+62','Indonesia',d=>/^\d{9,12}$/.test(d),'9 to 12 digits'],['+63','Philippines',d=>/^\d{10}$/.test(d),'10 digits'],['+66','Thailand',d=>/^\d{8,9}$/.test(d),'8 or 9 digits'],['+84','Vietnam',d=>/^\d{9,10}$/.test(d),'9 or 10 digits'],['+91','India',d=>/^[6-9]\d{9}$/.test(d),'10 digits, starting with 6 to 9'],['+86','China',d=>/^\d{10,11}$/.test(d),'10 or 11 digits'],['+852','Hong Kong',d=>/^\d{8}$/.test(d),'8 digits'],['+61','Australia',d=>/^\d{9}$/.test(d),'9 digits'],['+44','United Kingdom',d=>/^\d{10}$/.test(d),'10 digits'],['+1','US or Canada',d=>/^\d{10}$/.test(d),'10 digits']];
function phoneCheck(cc,raw){
  const c=CCODES.find(x=>x[0]===cc)||CCODES[0];let d=String(raw||'').replace(/[\s\-().]/g,'');
  if(d.startsWith(c[0]))d=d.slice(c[0].length);
  if(d.startsWith('+'))return {ok:false,msg:'Choose the country code from the list, then type the rest of the number.'};
  if(/\D/.test(d))return {ok:false,msg:'Use numbers only.'};
  if(c[0]!=='+65'&&d.startsWith('0'))d=d.slice(1);
  const ok=c[2](d),g=d.length===8?[4,4]:d.length===9?[3,3,3]:d.length===10?[3,3,4]:d.length===11?[3,4,4]:[d.length];let i=0;
  const full=c[0]+' '+g.map(n=>{const p=d.slice(i,i+n);i+=n;return p}).filter(Boolean).join(' ');
  return {ok,full,msg:ok?'Looks right: '+full:c[1]+' numbers have '+c[3]+'.'};
}
function phoneHint(){const h=$('c_phint');if(!h||!$('c_cc'))return;const v=$('c_phone').value.trim(),c=CCODES.find(x=>x[0]===$('c_cc').value)||CCODES[0];if(!v){h.textContent=c[1]+' numbers have '+c[3]+'.';h.className='hint';return}const r=phoneCheck(c[0],v);h.textContent=r.msg;h.className='hint '+(r.ok?'okhint':'errhint')}
function conForm(){
  return `<form class="form" id="conForm"><div class="f s3"><label for="c_name">Name</label><input type="text" id="c_name" required></div><div class="f s3"><label for="c_rel">Relationship</label><select id="c_rel">${['Daughter','Son','Spouse','Relative','Neighbour','Carer','GP','Pharmacist'].map(o=>`<option>${o}</option>`).join('')}</select></div>
     <div class="f s6"><label for="c_phone">Phone</label><div class="inrow"><select id="c_cc" aria-label="Country code" style="flex:0 0 auto;width:auto">${CCODES.map(c=>`<option value="${c[0]}">${c[0]} ${c[1]}</option>`).join('')}</select><input type="tel" id="c_phone" inputmode="tel" autocomplete="tel-national" placeholder="9123 4567" required></div><span class="hint" id="c_phint">${CCODES[0][1]} numbers have ${CCODES[0][3]}.</span></div><div class="f s3"><label for="c_notify">Receives</label><select id="c_notify"><option>Urgent alerts and weekly digest</option><option>Urgent alerts only</option><option>Weekly digest only</option><option>Doctor sheet before visits</option></select></div>
     <div class="formfoot"><button class="btn primary">Add contact</button></div></form>`;
}
