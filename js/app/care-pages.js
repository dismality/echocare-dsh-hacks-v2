/* Notes: the plain-language findings, on their own page in the health log */
function notesBlock(){
  const paths=cascadePaths(),inter=interactions();
  const plainInter=x=>String(x.text).replace(' is on the Beers Criteria list of medicines that are often risky for people over 65.',' is often risky for people over 65.');
  return head('Notes',`Things worth asking ${esc(state.patient.short)}'s doctor about at the next appointment, in plain words. EchoCare never tells anyone to stop a medicine.`)+
   (paths.length?paths.map((p,i)=>pathCard(p,i,false)).join(''):'<div class="card"><div class="empty">Nothing to note right now.</div></div>')+
   `${inter.length?`<div class="card" style="margin-top:16px"><h2>Medicines that may not mix well</h2>${inter.map(x=>`<div class="alert ${x.sev}"><span class="bar"></span><div><b>${esc(x.title)}</b><p>${esc(plainInter(x))}</p></div></div>`).join('')}</div>`:''}
   ${hiddenCard()}
   <p class="small muted" style="margin:14px 0 0">The technical detail and evidence is in the <button class="btn sm ghost" data-go="memo" style="padding:0">Doctor memo</button>.</p>`;
}
/* Hidden notes: still dismissed, newest first. A note whose status was changed in the memo drops off this list by itself. */
function hiddenNotes(){return (state.hiddenNotes||[]).filter(h=>h.ids.every(id=>(state.chains[id]||{}).status==='Dismissed'))}
function hiddenCard(){const h=hiddenNotes().slice().reverse();if(!h.length)return '';
  return `<div class="card hiddencard" style="margin-top:16px"><h2>Hidden <span class="chip plain">${h.length}</span></h2>${h.map(x=>`<div class="hrow"><div><b>${esc(x.title)}</b><span class="small muted">Marked not relevant${whenText(x.ts)?' \u00b7 '+esc(whenText(x.ts)):''}</span></div><button class="btn sm" data-act="note-undo" data-id="${x.id}">Undo</button></div>`).join('')}</div>`}
function vAppts(){return vApptsBody()}
function vNotes(){return notesBlock()}
function vWatch(){return vNotes()}

function routineCard(){
  const days=[];for(let i=-7;i<=0;i++)days.push(addDays(i));
  const rows=days.map(d=>{const dt=state.doseTimes[d]||{},log=state.doses[d]||{};const lates=Object.entries(dt).map(([k,t])=>{const sl=k.split(':')[1];return SLOTL[sl]?Math.max(0,minsOf(t)-minsOf(slotT(sl))):null}).filter(x=>x!==null);
    const miss=Object.entries(log).filter(([k,v])=>v==='skipped').length;const ci=state.checkins.find(c=>c.date===d);const chatted=d===T?state.chat.some(c=>c.who==='me'):!!ci;
    return {d,late:lates.length?Math.round(avg(lates)):null,miss,chatted,talked:ci?ci.talked:null}});
  const early=avg(rows.slice(0,4).map(r=>r.late).filter(x=>x!==null)),recent=avg(rows.slice(4).map(r=>r.late).filter(x=>x!==null));
  const max=Math.max(30,...rows.map(r=>r.late||0));
  const Wd=560,H=150,L=34,B=28,Tp=10,bw=(Wd-L-10)/rows.length;const y=v=>Tp+(H-Tp-B)*(1-v/max);
  let s=`<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Average minutes late taking medicines each day">`;
  [0,Math.round(max/2),max].forEach(v=>{s+=`<line class="c-grid" x1="${L}" x2="${Wd-10}" y1="${y(v)}" y2="${y(v)}"/><text class="c-txt" x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  rows.forEach((r,i)=>{const x=L+i*bw+bw*.2,w=bw*.6;if(r.late!==null)s+=`<rect x="${x}" y="${y(r.late)}" width="${w}" height="${y(0)-y(r.late)}" rx="3" style="fill:${r.late>=30?'var(--warn)':'var(--accent)'}"/>`;s+=`<text class="c-txt" x="${x+w/2}" y="${H-8}" text-anchor="middle">${W[P(r.d).getDay()]}</text>`});
  s+='</svg>';
  const slipping=early!=null&&recent!=null&&recent-early>=10;
  return `<div class="card"><h2>Routine signals <span class="chip ${slipping?'warn':'ok'}">${slipping?'Routine slipping':'Steady'}</span></h2>
   <p class="small muted" style="margin:0 0 10px">Minutes between each reminder and the dose. A routine drifting later is an early sign she needs more support.</p>
   <div class="chartbox">${s}</div><div class="legend"><span>Minutes late, daily average</span><span>Earlier days: ${early!=null?Math.round(early)+' min':'\u2014'}</span><span>Last 4 days: ${recent!=null?Math.round(recent)+' min':'\u2014'}</span><span>Missed doses: ${rows.reduce((a,r)=>a+r.miss,0)}</span><span>Days chatted: ${rows.filter(r=>r.chatted).length} of 8</span></div>
   ${slipping?`<p class="small" style="margin:10px 0 0"><b>Suggestion:</b> doses are being taken about ${Math.round(recent-early)} minutes later than last week. A family call or a simpler schedule may help.</p>`:''}</div>`;
}
function chartSpeech(){
  const sp=state.speech;if(sp.length<2)return '';
  const Wd=640,H=150,L=34,R=12,Tp=10,B=26,lo=90,hi=130;const x=i=>L+(Wd-L-R)*i/(sp.length-1),y=v=>Tp+(H-Tp-B)*(1-(v-lo)/(hi-lo));
  const pts=sp.map((p,i)=>x(i).toFixed(1)+','+y(p.wpm).toFixed(1)).join(' ');const base=avg(sp.slice(0,14).map(p=>p.wpm));
  let s=`<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Speaking pace over 4 weeks"><rect class="c-band" x="${L}" y="${y(base+7)}" width="${Wd-L-R}" height="${y(base-7)-y(base+7)}"/>`;
  [100,110,120].forEach(v=>{s+=`<line class="c-grid" x1="${L}" x2="${Wd-R}" y1="${y(v)}" y2="${y(v)}"/><text class="c-txt" x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  s+=`<polygon class="c-area" points="${x(0)},${y(lo)} ${pts} ${x(sp.length-1)},${y(lo)}"/><polyline class="c-l1" points="${pts}"/><circle class="c-d1" r="5" cx="${x(sp.length-1)}" cy="${y(sp[sp.length-1].wpm)}"/>`;
  s+=`<text class="c-txt" x="${L}" y="${H-6}">${fmt(sp[0].date)}</text><text class="c-txt" x="${Wd-R}" y="${H-6}" text-anchor="end">Today \u00b7 ${sp[sp.length-1].wpm} words/min</text></svg>`;
  return `<div class="chartbox">${s}</div>`;
}
const CI_SYMS=['dizzy','edema','gi','nausea','confusion','falls','jointpain','headache','insomnia','bleeding'];
function logSymptom(key,source){const r=state.symptoms.find(x=>!x.resolved&&x.key===key);
  if(r){r.mentions=r.mentions||[];if(r.mentions[r.mentions.length-1]===T)return {id:r.id,created:false,added:false};r.mentions.push(T);return {id:r.id,created:false,added:true}}
  const id=uid();state.symptoms.push({id,key,label:SYMK[key].label,area:SYMK[key].area||'',severity:4,start:T,freq:'Comes and goes',time:'Any time',trend:'New',notes:'',source,resolved:false,mentions:[T]});return {id,created:true,added:true}}
/* Everything a check-in must answer before it can be saved */
function ciMissing(){const f=$('checkForm');if(!f)return [];const miss=[];
  if(!f.querySelector('input[name=ci_mood]:checked'))miss.push('how she is feeling');
  if($('ci_sleep').value==='')miss.push('hours slept');
  if($('ci_pain').value==='')miss.push('pain');
  if(!f.querySelector('input[name=ci_sym]:checked')&&!$('ci_symnone').checked)miss.push('symptoms (tick "None of these" if none)');
  if(!f.querySelector('input[name=ci_sup]:checked')&&!$('ci_supOther').value.trim())miss.push('who supervised her');
  return miss}
function ciValidate(){const m=ciMissing(),b=$('ciSave'),h=$('ciMissing');if(b)b.disabled=m.length>0;if(h)h.textContent=pronText(m.length?'Still to answer: '+m.join(', ')+'.':'All answered.')}
function ciDoneCard(c,sup){
  const ML=['','Very low','Low','OK','Good','Great'],syms=(c.symLog||[]).map(x=>(state.symptoms.find(y=>y.id===x.id)||{}).label).filter(Boolean);
  const item=(k,v,wide)=>`<div${wide?' class="wide"':''}><dt>${k}</dt><dd>${v}</dd></div>`;
  return `<div class="card cidone"><h2><span class="cidone-t"><span class="tick" aria-hidden="true">\u2713</span>Daily check-in \u00b7 Done</span><span class="actions"><button class="btn sm" data-act="ci-edit">Edit</button><button class="btn sm" data-act="ci-undo">Undo</button></span></h2>
   <dl class="cisum">${item('Feeling',c.mood?ML[c.mood]:'\u2014')}${item('Sleep',c.sleep!=null?c.sleep+' hours':'\u2014')}${item('Pain',c.pain!=null?c.pain+' out of 10':'\u2014')}${item('Appetite',esc(c.appetite||'\u2014'))}${item('Supervised by',esc((sup.by||[]).join(', '))||'\u2014')}${item('New symptoms',esc(syms.join(', '))||'None')}${c.note?item('Anything unusual',esc(c.note),true):''}</dl>
   ${c.at?`<p class="small muted" style="margin:10px 0 0">Saved at ${clock(c.at)}.</p>`:''}</div>`;
}
function vCheckin(){
  const c=state.checkins.find(x=>x.date===T)||{},sup=supToday()||{by:[]},ML=['','Very low','Low','OK','Good','Great'];
  const people=state.family.contacts.filter(p=>!/GP|Pharmacist/.test(p.relation)).map(p=>p.name);
  const hist=state.checkins.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  return head('Daily check-in',`How ${esc(state.patient.short)} is today, any new symptoms, and who looked after her.`)+
  `<div class="cols wide">${c.done?ciDoneCard(c,sup):`<div class="card"><h2>Today, ${fmtW(T)}</h2><form class="form" id="checkForm">
    <div class="f s6"><span class="lbl">How is she feeling?</span><div class="moods">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="ci_mood" value="${n}" ${c.mood===n?'checked':''}><span>${n}<br>${ML[n]}</span></label>`).join('')}</div></div>
    <div class="f s2"><label for="ci_sleep">Hours slept</label><input type="number" id="ci_sleep" min="0" max="16" step="0.5" value="${c.sleep??''}"></div>
    <div class="f s2"><label for="ci_pain">Pain, 0 to 10</label><input type="number" id="ci_pain" min="0" max="10" value="${c.pain??''}"></div>
    <div class="f s2"><label for="ci_app">Appetite</label><select id="ci_app">${['Good','OK','Poor'].map(o=>`<option ${c.appetite===o?'selected':''}>${o}</option>`).join('')}</select></div>
    <div class="f s6"><span class="lbl">Any of these today?</span><div class="checks">${CI_SYMS.map(k=>`<label><input type="checkbox" name="ci_sym" value="${k}" ${(c.symLog||[]).some(x=>(state.symptoms.find(y=>y.id===x.id)||{}).key===k)?'checked':''}> ${esc(SYMK[k].label)}</label>`).join('')}<label class="none"><input type="checkbox" id="ci_symnone" ${c.mood&&!(c.symLog||[]).length?'checked':''}> None of these</label></div><span class="hint">Each one is added to Symptoms and checked against her medicines. <button type="button" class="btn sm ghost" data-sheet="sym" style="padding:0;min-height:0">Describe something else</button></span></div>
    <div class="f s6"><span class="lbl">Who supervised her today?</span><div class="checks sup">${people.map(n=>`<label><input type="checkbox" name="ci_sup" value="${esc(n)}" ${sup.by.includes(n)?'checked':''}> ${esc(n)}</label>`).join('')}</div><input type="text" id="ci_supOther" placeholder="Someone else (their name)" style="margin-top:6px"></div>
    <div class="f s6"><label for="ci_note">Anything unusual?</label><input type="text" id="ci_note" value="${esc(c.note||'')}" placeholder="e.g. More confused than usual this afternoon"></div>
    <div class="formfoot"><button class="btn primary" id="ciSave" disabled>Save check-in</button><span class="small muted" id="ciMissing" aria-live="polite"></span></div></form></div>`}
   <div class="card"><h2>Last 7 days</h2><div class="tbl"><table class="t"><thead><tr><th>Day</th><th>Mood</th><th>Sleep</th><th>Pain</th><th>Supervised by</th></tr></thead><tbody>${hist.map(h=>`<tr><td>${fmtW(h.date)}</td><td>${h.mood?`<span class="chip ${h.mood<=2?'crit':h.mood===3?'plain':'ok'}">${ML[h.mood]}</span>`:'\u2014'}</td><td class="mono">${h.sleep??'\u2014'}</td><td class="mono">${h.pain??'\u2014'}</td><td>${esc(((state.supervision||{})[h.date]||{by:[]}).by.join(', '))||'<span class="muted">\u2014</span>'}</td></tr>`).join('')}</tbody></table></div></div></div>`;
}

function digest(){
  const a=adherence(7),sh=state.family.share,parts=[];
  parts.push(`${state.patient.short} chatted with EchoCare on ${new Set(state.checkins.slice(-7).map(c=>c.date)).size} of the last 7 days.`);
  if(sh.meds)parts.push(`She took ${a.taken} of ${a.due} scheduled doses (${a.pct}%).`);
  if(sh.symptoms){const s=state.symptoms.filter(x=>!x.resolved);if(s.length)parts.push(`Symptoms mentioned: ${s.map(x=>x.label.toLowerCase()).join(', ')}.`)}
  if(sh.vitals){const bp=latest('bp');if(bp)parts.push(`Latest blood pressure ${bp.sys}/${bp.dia} (${vitalFlag(bp)[1].toLowerCase()}).`)}
  if(sh.mood){const m=avg(state.checkins.slice(-7).filter(c=>c.mood).map(c=>c.mood));if(m)parts.push(`Average mood ${m.toFixed(1)} out of 5; she talked with someone on ${state.checkins.slice(-7).filter(c=>c.talked).length} days.`)}
  const oc=openChains().length;if(oc)parts.push(`${oc} possible side-effect chain${oc>1?'s are':' is'} ready to discuss with the doctor.`);
  return parts.join(' ');
}
function vGuardian(){
  const f=state.family;
  return head('Guardian',`The people who look after ${esc(state.patient.short)}. They get alerts and can be recorded as supervising her.`,`<button class="btn primary" data-sheet="contact">Add person</button>`)+
  `<div style="margin-bottom:16px">${circleCard()}</div>`+
  `<div class="list grid2">${f.contacts.map(c=>`<div class="rec"><div class="rec-top"><b>${esc(c.name)}</b><span class="chip plain">${esc(c.relation)}</span></div><div class="meta"><span class="mono" style="user-select:all">${esc(c.phone)}</span><span>${esc(c.notify)}</span></div><div class="actions">${c.phone?`<a class="btn sm" href="${esc(telHref(c.phone))}">Call</a>`:''}<button class="btn sm danger" data-act="con-del" data-id="${c.id}">${window.__del===c.id?'Tap again to remove':'Remove'}</button></div></div>`).join('')||'<div class="empty">No one added yet.</div>'}</div>`;
}
function vProfile(){
  const p=state.patient;
  return head('Her profile','Basic details used on the doctor memo and by the safety checks.')+
  `<div class="card" style="max-width:760px"><form class="form" id="profForm">
    <div class="f s4"><label for="p_name">Full name</label><input type="text" id="p_name" value="${esc(p.name)}" required></div>
    <div class="f s2"><label for="p_age">Age</label><input type="number" id="p_age" min="40" max="120" value="${esc(p.age)}"></div>
    <div class="f s3"><label for="p_short">What EchoCare calls her</label><input type="text" id="p_short" value="${esc(p.short)}"></div>
    <div class="f s3"><span class="lbl">Living situation</span><div class="checks"><label><input type="checkbox" id="p_alone" ${p.livesAlone?'checked':''}> Lives alone</label></div></div>
    <div class="f s3"><label for="p_pron">How EchoCare refers to her</label><select id="p_pron">${[['she','She / her'],['he','He / him'],['name','By name only']].map(([v,l])=>`<option value="${v}" ${(p.pronoun||'she')===v?'selected':''}>${l}</option>`).join('')}</select><span class="hint">Used everywhere in this app and the doctor memo</span></div>
    <div class="f s3"><label for="p_phone">Her phone (optional)</label><input type="tel" id="p_phone" value="${esc(p.phone||'')}" placeholder="+65 9123 4567"><span class="hint">Lets urgent alerts offer a one-tap call</span></div>
    <div class="f s6"><label for="p_cond">Health conditions</label><input type="text" id="p_cond" value="${esc(p.conditions||'')}" placeholder="e.g. High blood pressure, type 2 diabetes"></div>
    <div class="f s6"><label for="p_all">Allergies</label><input type="text" id="p_all" value="${esc(p.allergies||'')}" placeholder="e.g. Penicillin"></div>
    <div class="formfoot"><button class="btn primary">Save profile</button></div></form></div>`;
}

/* Visits: appointments and the doctor sheet for the next one, on one page */
function vApptsBody(){
  const up=state.appts.filter(a=>a.date>=T).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),past=state.appts.filter(a=>a.date<T).sort((a,b)=>b.date.localeCompare(a.date));
  const row=(a,i,isPast)=>`<div class="rec ${!isPast&&i===0?'flag':''}"><div class="rec-top"><b>${esc(a.with)}</b><span class="chip ${!isPast&&i===0?'info':'plain'}">${isPast?ago(a.date):diff(T,a.date)===0?'Today':'In '+diff(T,a.date)+' days'}</span></div><div class="meta"><span>${fmtW(a.date)}, ${esc(a.time)}</span>${a.place?`<span>${esc(a.place)}</span>`:''}</div>${a.purpose?`<span class="small">${esc(a.purpose)}</span>`:''}
    ${isPast?'':`<div class="actions"><a class="btn sm" target="_blank" rel="noopener" href="${esc(gcalLink(apptCal(a)))}">Google Calendar</a><a class="btn sm" target="_blank" rel="noopener" href="${esc(outlookLink(apptCal(a)))}">Outlook</a>${i===0?'<button class="btn sm" data-go="memo">Doctor memo</button>':''}<button class="btn sm danger" data-act="ap-del" data-id="${a.id}">${window.__del===a.id?'Tap again to remove':'Remove'}</button></div>`}</div>`;
  return head('Appointments','Upcoming and past doctor appointments.',`<button class="btn primary" data-sheet="appt">Add appointment</button>`)+
  `<div class="cols"><div class="card"><h2>Coming up</h2><div class="list">${up.map((a,i)=>row(a,i,false)).join('')||'<div class="empty">No appointments booked.</div>'}</div></div>
   <div class="card"><h2>Past appointments</h2><div class="list">${past.map((a,i)=>row(a,i,true)).join('')||'<div class="empty">No past appointments recorded.</div>'}</div></div></div>`;
}

/* Evidence level for each rule: on the ThinkCascades consensus list, a classic published cascade, or a known side effect only */
const RULE_SRC={'nsaid-bp':['ok','ThinkCascades'],'ccb-edema':['ok','ThinkCascades'],'diur-urine':['ok','ThinkCascades'],'ssri-insom':['ok','ThinkCascades'],'acb-conf':['ok','ThinkCascades (sleeping pill to dementia medicine)'],'benzo-antipsy':['ok','ThinkCascades'],'bp-dizzy':['ok','ThinkCascades (alpha blocker to dizziness medicine)'],
  'chei-incont':['info','Published cascade study'],'antipsy-tremor':['info','Classic published cascade'],'ace-cough':['info','Classic published cascade'],'thiazide-gout':['info','Published cascade studies'],
  'gaba-edema':['plain','Known side effect'],'statin-muscle':['plain','Known side effect'],'met-gi':['plain','Known side effect'],'opioid-const':['plain','Known side effect'],'steroid-glu':['plain','Known side effect'],'su-hypo':['info','AGS Beers Criteria']};
function vTrustBody(){
  const r=runEngineCheck(),pos=r.filter(x=>x.cs.want);
  const row=(a,b)=>`<tr><td><b>${a}</b></td><td>${b}</td></tr>`;
  return head('Trust and limits','What EchoCare is, what it is not, and how it handles accuracy, privacy and safety.')+
  `<div class="cols"><div class="stack">
   <div class="card"><h2>What it is, and is not</h2><p style="margin:0">EchoCare is <b>decision support for families and clinicians</b>. It notices patterns and turns them into questions for the doctor or pharmacist.</p>
    <ul class="evid" style="margin-top:10px"><li>It never diagnoses.</li><li>It never tells anyone to start, stop or change a medicine.</li><li>Medicine links come from fixed, published rules, not from AI.</li><li>It is never the only route to help: emergency words always alert family. EchoCare says call 995 straight away for chest pain, stroke signs or severe breathlessness, and for feeling faint only if it does not pass. It never suggests 995 for anything else.</li></ul></div>
   <div class="card"><h2>Accuracy</h2><p style="margin:0">The engine catches ${pos.filter(x=>x.pass).length} of ${pos.length} textbook cascades with no false alarms in its controls (see the engine check below). That shows the logic works; it does not yet show real-world accuracy.</p>
    <p class="small muted" style="margin:8px 0 0">Plan: a pharmacist reviews every rule, then a pilot measures how many flags a clinician agrees with.</p></div>
   <div class="card"><h2>False alarms</h2><ul class="evid"><li>One kind of evidence gives <b>Possible</b>; only two or more give <b>Likely</b>.</li><li>Every finding can be marked <b>Dismissed</b> or <b>Discussed with doctor</b>, and drops off the doctor sheet.</li><li>FDA counts are context only and never raise a rating.</li><li>The doctor sheet is one page, so it does not add to a clinician's workload.</li></ul></div>
   <div class="card"><h2>Regulation</h2><p style="margin:0">Software that informs clinical decisions can count as a medical device. In Singapore that is decided by the Health Sciences Authority (HSA). Before any real deployment we would ask HSA for a classification opinion and keep EchoCare positioned as review prompts, not treatment advice.</p></div>
  </div><div class="stack">
   <div class="card"><h2>Privacy and consent</h2><ul class="evid">
    <li><b>She decides what family sees</b> (Family page). Emergencies are the only exception.</li>
    <li>The AI receives her first name only: no full name, phone number or address.</li>
    <li>Calendar links add nothing until you press save there. Calendar entries show only the time of day.</li>
    <li>FDA data is built into the page, so no medicine names leave it for those lookups.</li>
    <li>Planned: compliance with Singapore's PDPA, encrypted storage, and a nominated decision-maker if her memory declines.</li></ul></div>
   <div class="card"><h2>Known gaps and next steps</h2><div class="tbl"><table class="t"><tbody>
    ${row('Real-world accuracy','Pharmacist-reviewed rules, then a pilot with a clinic or pharmacy')}
    ${row('Local drug safety data','Add HSA adverse-event data alongside openFDA')}
    ${row('Health records','NEHR is not open to apps. Today: compare with her HealthHub list. Next: an approved integration so her records arrive by themselves')}
    ${row('Alerts when EchoCare is closed','Family devices with EchoCare open get an alarm now, with a one-tap call button. Push notifications to a locked phone need the installed app')}
    ${row('Two people editing at once','The care circle keeps the most recent save. Simultaneous edits to the same record can overwrite each other')}
    ${row('No smartphone','Phone-call check-ins and smart speakers')}
    ${row('Proof she swallowed it','Smart pill box or photo confirmation')}
    ${row('Hearing loss','Reminders flash and vibrate as well as sound (done)')}
    ${row('Language','Main buttons, and chest-pain and breathlessness words, in Mandarin, Malay and Tamil (done; needs native-speaker review)')}
    ${row('Advanced dementia','A carer-led mode when self-reports become unreliable')}
   </tbody></table></div></div>
   <div class="card"><h2>Where each rule comes from</h2><div class="tbl"><table class="t"><thead><tr><th>Rule</th><th>Evidence</th></tr></thead><tbody>${RULES.map(r=>`<tr><td>${esc(CLS_LABEL[r.from[0]]||r.from[0])} \u2192 ${esc(r.effect)}${r.to.length?' \u2192 '+esc(TO_LABEL[r.to[0]]||CLS_LABEL[r.to[0]]||r.to[0]):''}</td><td><span class="chip ${RULE_SRC[r.id]?RULE_SRC[r.id][0]:'plain'}">${RULE_SRC[r.id]?RULE_SRC[r.id][1]:'Known side effect'}</span>${r.expected?' <span class="chip plain">Often intended</span>':''}</td></tr>`).join('')}</tbody></table></div>
    <p class="small muted" style="margin:8px 0 0">"ThinkCascades" means the pair is on that consensus list as named in published summaries. Every rule still needs review by a pharmacist before real use.</p></div>
   <div class="card"><h2>Sources</h2><ul class="evid">
    <li>McCarthy LM et al. ThinkCascades. <i>Drugs &amp; Aging</i> 2022;39:829\u2013840.</li>
    <li>Rochon PA et al. Prescribing cascades in 2.3 million older adults in Ontario. <i>The BMJ</i>, September 2026.</li>
    <li>American Geriatrics Society Beers Criteria for potentially inappropriate medication use in older adults.</li>
    <li>US FDA Adverse Event Reporting System via openFDA (api.fda.gov), retrieved 23 October 2026.</li></ul></div>
  </div></div>`;
}
