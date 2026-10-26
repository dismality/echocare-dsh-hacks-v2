/* ================= AI: photo + review ================= */
let photoFile=null,photoResult=null,photoBusy=false;
async function identifyPhoto(){
  if(!photoFile||photoBusy)return;
  if(!sample||!sampleImages){photoResult={err:ONLINE_AI?'AI photo detection needs permission to use Claude. Allow it when asked, or enter the details by hand.':NOAI+' Enter the details by hand.'};render();return}
  photoBusy=true;photoResult=null;render();
  try{
    const r=await sample.json(`You help a family caregiver record an older adult's medicines. The photo shows a medicine: loose pills, a blister strip, a box, a bottle or a pharmacy label.
Identify it if you reasonably can, using printed text first, then imprint codes, shape and colour. Loose pills with no readable text or imprint usually cannot be identified: say so with low confidence rather than guessing.
Reply with ONLY JSON: {"identified":boolean,"name":string|null,"strength":string|null,"form":"Tablet"|"Capsule"|"Liquid"|"Inhaler"|"Injection"|"Patch"|"Cream"|"Drops"|null,"ingredients":[string],"quantityVisible":number|null,"directions":string|null,"confidence":"high"|"medium"|"low","evidence":"what in the photo you used, one sentence","warning":string|null}`,
      {images:[photoFile],modelTier:'default'});
    photoResult=r||{err:'No result.'};
    if(r&&r.identified){const f=id=>$(id);if(r.name)f('m_name').value=r.name;if(r.strength)f('m_strength').value=r.strength;if(r.form)f('m_form').value=r.form;if(r.quantityVisible)f('m_qty').value=r.quantityVisible;if(r.directions)f('m_notes').value='Label: '+r.directions;window.__photoIng=r.ingredients||[]}
  }catch(e){photoResult={err:e&&e.code==='not_granted'?'Permission to use Claude was declined. Enter the details by hand.':e&&e.code==='image_rejected'?'That image could not be read. Try a clearer JPEG or PNG photo.':'Could not identify right now. Try again or enter the details by hand.'};if(e&&e.code==='not_granted')sample=null}
  photoBusy=false;render();
}
let reviewBusy=false;
async function aiReview(){
  if(reviewBusy)return;if(!sample){toast(ONLINE_AI?'AI suggestions need permission to use Claude. Allow it when asked.':NOAI);return}
  reviewBusy=true;render();
  try{
    const data={age:state.patient.age,conditions:state.patient.conditions,allergies:state.patient.allergies,
      medicines:active().map(m=>({name:m.name,strength:m.strength,when:schedText(m),reason:m.reason,started:m.start,source:m.source})),
      symptoms:state.symptoms.filter(x=>!x.resolved).map(x=>({label:x.label,started:x.start,severity:x.severity,trend:x.trend,timesReported:(x.mentions||[]).length||1})),
      ruleFindings:chains().map(chainTitle),interactionsAlreadyFound:interactions().map(x=>x.title)};
    const r=await sample.json(`You are helping a doctor review an older adult's medicines. A rule engine has already found the links listed in ruleFindings and interactionsAlreadyFound. Suggest up to 4 OTHER possible links it may have missed: a symptom that could be a side effect of one of their medicines, a medicine that may have been started to treat another medicine's side effect, or a combination that may not mix well. Use only the medicines and symptoms in the data, and do not repeat the rule findings. Do not diagnose, and never suggest stopping, starting or changing a medicine.
Patient data: ${JSON.stringify(data)}
Reply with ONLY JSON: {"items":[{"title":"short name for the link, e.g. Atorvastatin and tiredness","medicines":[string],"symptom":string or null,"why":"one or two plain sentences on why they could be linked","confidence":"low"|"medium"|"high"}]}. Return an empty list if nothing credible stands out.`,{modelTier:'default',cache:false});
    const items=(Array.isArray(r&&r.items)?r.items:[]).slice(0,4).map(i=>({title:String(i.title||'Possible link'),medicines:Array.isArray(i.medicines)?i.medicines.map(String):[],symptom:i.symptom?String(i.symptom):'',why:String(i.why||''),confidence:['low','medium','high'].includes(i.confidence)?i.confidence:'low'})).filter(i=>i.why&&i.medicines.length);
    state.aiReview={ts:T+' '+hm(),items};save();
  }catch(e){toast(e&&e.code==='not_granted'?'Permission to use Claude was declined.':'The AI check could not run right now. Try again later.');if(e&&e.code==='not_granted')sample=null}
  reviewBusy=false;render();
}
/* Doctor memo: optional AI ideas, kept visibly separate from the rule-based findings */
function aiSection(){
  const r=state.aiReview;
  const list=r&&r.items.length?`<div class="list" style="margin-top:12px">${r.items.map(i=>`<div class="rec aisug"><div class="rec-top"><b>${esc(i.title)}</b><span class="actions"><span class="chip info">AI suggestion</span><span class="chip plain">${esc(i.confidence||i.severity||'low')} confidence</span></span></div>${i.why||i.explanation?`<span class="small">${esc(i.why||i.explanation)}</span>`:''}${(i.medicines&&i.medicines.length)||i.symptom?`<span class="small muted">${i.medicines&&i.medicines.length?'Medicines: '+esc(i.medicines.join(', ')):''}${i.symptom?(i.medicines&&i.medicines.length?' \u00b7 ':'')+'Symptom: '+esc(i.symptom):''}</span>`:''}</div>`).join('')}</div>`:r?'<p class="muted" style="margin:10px 0 0">The AI found no other credible links.</p>':'';
  return `<section class="aisect"><h2>6. AI suggestions for the doctor (optional)</h2>
   <p class="small" style="margin:0">Possible links the rules above may have missed, suggested by AI (Claude) from these records. <b>Not checked by EchoCare's rules or by a pharmacist.</b> Ideas to consider, not findings.</p>
   <div class="noprint actions" style="margin-top:10px"><button class="btn" data-act="ai-review" ${reviewBusy?'disabled':''}>${reviewBusy?'Checking\u2026':r?'Check again':'Ask AI for possible missed links'}</button>${r?'<button class="btn ghost" data-act="ai-clear">Remove AI suggestions</button>':''}</div>
   ${list}${r?`<p class="small muted" style="margin:8px 0 0">Suggested ${esc(whenText(r.ts)||r.ts)}.</p>`:''}</section>`;
}
