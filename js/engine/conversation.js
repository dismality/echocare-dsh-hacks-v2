/* ================= conversation ================= */
function contextForAI(){
  const td=todayDoses();
  return JSON.stringify({
    patient:{callThem:state.patient.short,age:state.patient.age,livesAlone:state.patient.livesAlone,conditions:state.patient.conditions},
    medicines:active().map(m=>({name:m.name,strength:m.strength,when:schedText(m),reason:m.reason,startedDaysAgo:diff(m.start,T)})),
    dosesToday:td.map(d=>({medicine:d.m.name,slot:d.slot,status:d.status})),
    activeSymptoms:state.symptoms.filter(s=>!s.resolved).map(s=>({label:s.label,severity:s.severity,trend:s.trend})),
    possibleSideEffectLinks:openChains().map(chainTitle),
    nextAppointment:nextAppt()?{date:fmtW(nextAppt().date),with:nextAppt().with}:null,
    timeNow:hm()
  });
}
const AI_RULES=()=>`You are EchoCare, a warm, patient voice companion for an older adult. You chat daily and quietly help keep their medicines safe.
Style: 1 to 3 short sentences, plain everyday words, kind and unhurried. Keep the conversation on her health: how she feels, symptoms, sleep, pain, medicines and doses. If she talks about something else, reply kindly in one short sentence, then gently ask how she is feeling or about her medicines. Write the "reply" in ${(state.prefs.elder||{}).lang||'English'}. Address them as "${state.patient.short}". Ask at most one gentle follow-up question.
Safety: never diagnose. Never tell them to stop, start, change or double a medicine; say you will add it to the questions for their doctor or pharmacist. Emergencies: if they describe chest pain or tightness, stroke signs (face drooping, slurred speech, weakness on one side) or severe breathlessness, set urgent true, calmly tell them to call 995 now, and say you are letting their family know. If they say they feel faint, like they might pass out, or that they cannot manage, set urgent true, tell them to sit or lie down somewhere safe, say you are letting their family know, and say that if the feeling does not pass, or they feel they cannot manage, they should call 995. For anything else, such as a fall without injury or new confusion, never mention 995: say you are letting their family know and suggest seeing a doctor today.
If a symptom matches one of the possible side-effect links in the context, mention gently that you have added it as a question for the doctor.
Context (current records): ${contextForAI()}
For EVERY message reply with ONLY a JSON object:
{"reply":string,
 "symptoms":[{"key":one of ${JSON.stringify(SYM.map(s=>s.key))},"label":short plain label,"severity":1-10 or null,"area":one of ${JSON.stringify(AREAS)} or null}],
 "doses":[{"medicine":name from the medicines list,"slot":"morning"|"noon"|"evening"|"bedtime"|"asneeded","status":"taken"|"skipped"}],
 "vitals":[{"type":"bp"|"glucose"|"weight"|"temp"|"pulse","sys":number|null,"dia":number|null,"value":number|null}],
 "newMedicines":[{"name":string,"strength":string|null,"reason":string|null}],
 "mood":1-5 or null,
 "shareWithFamily":short text worth sharing with family (good news) or null,
 "urgent":boolean}
Only include items the person actually said in their latest message. "I took my morning pills" means every morning medicine was taken. Use empty arrays when nothing applies.`;

function rulesExtract(text){
  const ex={symptoms:[],doses:[],vitals:[],newMedicines:[],mood:null,shareWithFamily:null,urgent:false};
  SYM.forEach(s=>{const mm=s.re&&s.re.exec(text);if(!mm||negated(text,mm.index,mm[0]))return;if(s.emer)ex.urgent=true;ex.symptoms.push({key:s.key,label:s.label,severity:null,area:s.area||null})});
  const slotWord=/morning/i.test(text)?'morning':/(lunch|midday|noon|afternoon)/i.test(text)?'noon':/(evening|dinner)/i.test(text)?'evening':/(bed|night)/i.test(text)?'bedtime':null;
  const named=scheduled().filter(m=>medMentioned(text,m)),missWords=/\b(forgot|missed|didn'?t take|skipped)\b/i.test(text);
  if(named.length&&/\b(took|taken|have taken|had|swallowed)\b/i.test(text)&&!missWords){named.forEach(m=>{const day=state.doses[T]||{};const sl=slotWord&&m.slots.includes(slotWord)?slotWord:(m.slots.find(s=>isDueNow(s)&&day[m.id+':'+s]!=='taken')||m.slots[0]);ex.doses.push({medicine:m.name,slot:sl,status:'taken'})})}
  else if(/\b(took|taken|have taken|had|ate|swallowed)\b.{0,25}\b(pills?|medicines?|meds|tablets?)/i.test(text)){const sl=slotWord||currentSlot();scheduled().filter(m=>m.slots.includes(sl)).forEach(m=>ex.doses.push({medicine:m.name,slot:sl,status:'taken'}))}
  if(missWords&&(named.length||/pill|medicine|meds|tablet|dose/i.test(text))){const sl=slotWord||prevSlot();(named.length?named:scheduled()).filter(m=>m.slots.includes(sl)).forEach(m=>ex.doses.push({medicine:m.name,slot:sl,status:'skipped'}))}
  active().filter(m=>m.prn).forEach(m=>{if(medMentioned(text,m)&&/took|take|taken|had/i.test(text))ex.doses.push({medicine:m.name,slot:'asneeded',status:'taken'})});
  const g=text.match(/sugar.{0,20}?(\d{1,2}(?:\.\d)?)/i);if(g)ex.vitals.push({type:'glucose',value:+g[1]});
  const bp=text.match(/(?:blood pressure|\bbp\b|pressure)\D{0,25}?(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})/i);if(bp)ex.vitals.push({type:'bp',sys:+bp[1],dia:+bp[2],value:null});
  const known=active().map(m=>m.name.toLowerCase());
  Object.keys(DRUGS).concat(Object.keys(BRANDS)).forEach(d=>{if(new RegExp('\\b'+d+'\\b','i').test(text)&&!known.some(k=>k.includes(BRANDS[d]||d)))ex.newMedicines.push({name:cap(d),strength:null,reason:null})});
  const bought=text.match(/(?:bought|got|started taking|taking)\s+(?:some\s+|a\s+)?([a-z][a-z \-]{2,28}?)\s+(tablets?|pills?|medicine|syrup|capsules?|cream|drops)\b/i);
  if(bought&&!ex.newMedicines.length){const nm=cap(bought[1].replace(/^(new|more|the|my)\s+/i,'').trim()+' '+bought[2].toLowerCase());if(!known.some(k=>k.includes(bought[1].toLowerCase())))ex.newMedicines.push({name:nm,strength:null,reason:null})}
  if(/grand|daughter|son\b|chloe|won|first place|birthday|visited/i.test(text)&&!ex.symptoms.length)ex.shareWithFamily=text;
  if(/happy|great|wonderful|good day/i.test(text))ex.mood=4;if(/lonely|sad|down|low/i.test(text))ex.mood=2;
  return ex;
}
/* True when the words just before a symptom deny it: "not", "no", "never", "without", "don't have", "no longer" */
function negated(text,at,hit){return /\b(no|not|never|without|don'?t have|do not have|don'?t feel|do not feel|not feeling|haven'?t (had|got)|isn'?t|aren'?t|wasn'?t|no longer|nothing like)\b[^.,;!?]{0,22}$/i.test(text.slice(0,at))||/\b(not|no longer|never|isn'?t|aren'?t|wasn'?t)\b/i.test(hit||'')}
function currentSlot(){const h=new Date().getHours();return h<11?'morning':h<16?'noon':h<20?'evening':'bedtime'}
function prevSlot(){const h=new Date().getHours();return h<11?'bedtime':h<16?'morning':h<20?'noon':'evening'}

function applyExtraction(ex,text){
  const tags=[];const before=new Set(chains().map(c=>c.id+':'+c.ev.length));
  (ex.symptoms||[]).forEach(s=>{
    const key=SYMK[s.key]?s.key:'other';if(SYMK[key]&&SYMK[key].emer)ex.urgent=true;
    let rec=state.symptoms.find(x=>!x.resolved&&x.key===key&&(key!=='other'||x.label===s.label));
    if(rec){rec.mentions=rec.mentions||[];if(rec.mentions[rec.mentions.length-1]!==T)rec.mentions.push(T);if(s.severity)rec.severity=+s.severity}
    else{rec={id:uid(),key,label:s.label||SYMK[key].label,area:s.area||SYMK[key].area||'',severity:+s.severity||4,start:T,freq:'Comes and goes',time:'Any time',trend:'New',notes:'From conversation: "'+text.slice(0,120)+'"',source:'Chat',resolved:false,mentions:[T]};state.symptoms.push(rec)}
    tags.push(['warn','Symptom: '+rec.label]);
  });
  (ex.doses||[]).forEach(d=>{
    const m=findMed(d.medicine);if(!m){if(d.medicine)tags.push(['plain','Not sure which medicine: '+d.medicine]);return}
    state.doses[T]=state.doses[T]||{};
    if(d.slot==='asneeded'||m.prn){state.doses[T][m.id+':prn:'+hm()]='taken';m.qty=Math.max(0,(m.qty||0)-(m.dosePerTake||1));tags.push(['info',m.name+' dose logged'])}
    else if(m.slots.includes(d.slot)&&d.status!=='skipped'&&!isDueNow(d.slot)){tags.push(['plain',m.name+' '+SLOTL[d.slot].toLowerCase()+': not due yet'])}
    else if(m.slots.includes(d.slot)){const k=m.id+':'+d.slot;if(d.status==='skipped')state.doses[T][k]='skipped';else markTaken(m,k);tags.push([d.status==='skipped'?'crit':'ok',m.name+' '+SLOTL[d.slot].toLowerCase()+': '+(d.status==='skipped'?'missed':'taken')])}
  });
  (ex.vitals||[]).forEach(v=>{if(v.type==='bp'){const s=+v.sys,d=+v.dia;if(!(s>=60&&s<=260&&d>=30&&d<=160))return;
      const rec={id:uid(),type:'bp',sys:s,dia:d,pulse:v.pulse?+v.pulse:null,date:T,time:hm(),source:'Chat'};state.vitals.push(rec);const f=vitalFlag(rec);
      tags.push([f[0]==='ok'?'info':f[0],'Blood pressure '+s+'/'+d]);if(s>=140||d>=90)logSymptom('highbp','Chat');
      if(f[0]==='crit'){state.events.push({sev:'crit',title:`Very high blood pressure: ${s}/${d}`,text:`${state.patient.short} gave this reading in conversation. Family has been told.`,ts:T+' '+hm()});state.family.feed.push({from:'EchoCare',text:`${state.patient.short}'s blood pressure reading was ${s}/${d}, which is very high. Please check on her today.`,ts:T+' '+hm()})}
      return}
    else if(v.value&&['glucose','weight','temp','pulse'].includes(v.type)){state.vitals.push({id:uid(),type:v.type,value:+v.value,context:'',date:T,time:hm(),source:'Chat'});tags.push(['info',cap(v.type==='glucose'?'blood sugar':v.type)+' '+v.value])}});
  (ex.newMedicines||[]).forEach(n=>{if(!n||!n.name)return;if(active().some(m=>m.name.toLowerCase().includes(n.name.toLowerCase())))return;const c=classify(n.name);
    state.meds.push({id:uid(),name:cap(n.name),strength:n.strength||'',form:'Tablet',dosePerTake:1,slots:[],prn:true,withFood:'Any time',qty:0,start:T,reason:n.reason||'',source:'Bought myself',prescriber:'',notes:'Mentioned in conversation',via:'Chat',unconfirmed:true,stopped:false,cls:c.cls,ing:c.ing});tags.push(['info','New medicine to confirm: '+cap(n.name)])});
  if(ex.mood){let c=state.checkins.find(x=>x.date===T);if(!c){c={date:T,mood:null,sleep:null,pain:null,talked:true,appetite:'',note:''};state.checkins.push(c)}c.mood=+ex.mood;c.talked=true}
  chains().forEach(c=>{if(!before.has(c.id+':'+c.ev.length))tags.push(['crit','Possible link: '+(c.b?c.a.name+' \u2192 '+c.b.name:c.rule.effect+' \u2190 '+c.a.name)])});
  if(ex.urgent){state.events.push({sev:'crit',title:'Urgent: possible emergency reported',text:`${state.patient.short} said: "${text.slice(0,140)}". EchoCare gave her 995 advice and alerted family.`,ts:T+' '+hm()});state.family.feed.push({from:'EchoCare',text:'URGENT: '+state.patient.short+' reported possible emergency symptoms. Please call her now.',ts:T+' '+hm()});tags.unshift(['crit','Family alerted'])}
  return tags;
}
function composeReply(ex,tags){
  const n=state.patient.short;
  if(ex.urgent){const keys=(ex.symptoms||[]).map(x=>x.key),fam=famName();
    if(keys.some(k=>['chestpain','stroke','breathless'].includes(k)))return `${n}, I'm worried about this and I don't want you to wait. Please call 995 now, and sit down while you wait. I'm letting ${fam} know as well.`;
    return `${n}, please sit or lie down somewhere safe right now. I'm letting ${fam} know. If the faint feeling doesn't pass in a minute or two, or you feel you can't manage, call 995.`}
  const parts=[];
  const link=tags.find(t=>t[1].startsWith('Possible link'));
  if(ex.symptoms.length){const s=ex.symptoms[0];parts.push(`I'm sorry to hear about the ${s.label.toLowerCase()}. I've noted it.`);if(link||openChains().some(c=>c.rule.sym.includes(s.key)))parts.push('It may be connected to one of your medicines, so I have added a question for your doctor. Please don\'t stop any medicine on your own.')}
  const took=ex.doses.filter(d=>d.status==='taken'),miss=ex.doses.filter(d=>d.status==='skipped');
  if(took.length){const nx=todayDoses().find(d=>d.status==='due');parts.push(`Well done, I've ticked that off.${nx?' Next is '+nx.m.name+' at '+SLOTL[nx.slot].toLowerCase()+'.':''}`)}
  if(miss.length)parts.push('Thank you for telling me. Please don\'t take two doses to make up. Take the next one at the usual time.');
  if(ex.vitals.length){const bp=ex.vitals.find(v=>v.type==='bp'&&v.sys&&v.dia),f=bp?vitalFlag({type:'bp',sys:+bp.sys,dia:+bp.dia}):null;
    parts.push(f&&f[0]==='crit'?`I have saved that reading. It is very high, so I've let ${famName()} know. Please rest, and see a doctor today.`:f&&f[1]==='High'?'I have saved that reading. It is a little high, so I have noted it for your doctor.':'I have saved that reading.')}
  if(ex.newMedicines.length)parts.push(`I've noted ${ex.newMedicines.map(m=>m.name).join(', ')}. I'll ask ${famName()} to confirm the details, and the pharmacist can check it is safe with your other medicines.`);
  if(!parts.length){if(ex.shareWithFamily)parts.push('That is lovely news! You must be so proud.');else if(ex.mood===2)parts.push(`I'm here with you, ${n}. Would you like me to ask ${famName()} to give you a call today?`);else parts.push('Thank you for telling me. How are you feeling in yourself today? Any dizziness, pain or swelling?')}
  return parts.join(' ');
}
let chatBusy=false,chatCtl=null;
async function sendChat(text){
  text=text.trim();if(!text||chatBusy)return;
  state.chat.push({who:'me',text,ts:hm()});
  const bot={who:'bot',text:'',ts:hm(),tags:[],pending:true};state.chat.push(bot);chatBusy=true;render();
  let ex=null,reply=null,usedAI=false;
  if(sample){
    try{
      const turns=[{role:'user',content:pronText(AI_RULES())}];
      state.chat.filter(c=>!c.pending&&(c.who==='me'||c.who==='bot')).slice(-12).forEach(c=>turns.push({role:c.who==='me'?'user':'assistant',content:c.text}));
      chatCtl=new AbortController();
      const r=await sample.json(turns,{modelTier:'quick',cache:false,signal:chatCtl.signal});
      if(r&&typeof r.reply==='string'){ex=Object.assign({symptoms:[],doses:[],vitals:[],newMedicines:[],mood:null,shareWithFamily:null,urgent:false},r);reply=r.reply;usedAI=true}
    }catch(e){if(e&&['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'].includes(e.code))sample=null}
  }
  if(!ex)ex=rulesExtract(text);
  ['symptoms','doses','vitals','newMedicines'].forEach(k=>{if(!Array.isArray(ex[k]))ex[k]=[]});
  const tags=applyExtraction(ex,text);
  if(!reply||ex.urgent&&!/995/.test(reply))reply=composeReply(ex,tags);
  bot.text=reply;bot.tags=tags;bot.pending=false;bot.urgent=!!ex.urgent;bot.share=ex.shareWithFamily||null;bot.ai=usedAI;
  chatBusy=false;speak(reply);save();render();
}
function beep(){if(!state.prefs.sound)return;try{const A=window.__ac||(window.__ac=new (window.AudioContext||window.webkitAudioContext)());if(A.state==='suspended')A.resume();[0,.38,.76].forEach(t=>{const o=A.createOscillator(),g=A.createGain();o.frequency.value=t===.76?1046:880;o.connect(g);g.connect(A.destination);const s=A.currentTime+t;g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(.22,s+.02);g.gain.exponentialRampToValueAtTime(.0001,s+.3);o.start(s);o.stop(s+.32)})}catch(e){}}
// Spoken form of on-screen text: abbreviations a voice would otherwise spell out letter by letter
function speakable(t){return String(t).replace(/\bMdm\.?(?=\s)/g,'Madam').replace(/\bMrs\.?(?=\s)/g,'Missus').replace(/\bMr\.?(?=\s)/g,'Mister').replace(/\bMs\.?(?=\s)/g,'Miss').replace(/\bDr\.?(?=\s)/g,'Doctor').replace(/(\d)\s?mg\b/gi,'$1 milligrams').replace(/(\d)\s?ml\b/gi,'$1 millilitres').replace(/\b995\b/g,'9 9 5').replace(/\bGP\b/g,'family doctor').replace(/\bBP\b/g,'blood pressure')}
// Single swap point for a different voice (e.g. ElevenLabs through your own server): set window.ECHO_TTS = async (text, lang) => {...}
function speak(t,force){t=speakable(pronText(t));if((window.__tts||force)&&typeof window.ECHO_TTS==='function'){try{window.ECHO_TTS(t,(state.prefs.elder||{}).lang)}catch(e){}return}try{if((window.__tts||force)&&'speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);const ep=state.prefs.elder||{};u.rate=ep.rate||.92;u.lang=LANGS[ep.lang]||'en-GB';speechSynthesis.speak(u)}}catch(e){}}
