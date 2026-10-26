/* ================= analysis engine ================= */
const active=()=>state.meds.filter(m=>!m.stopped);
const byCls=c=>active().filter(m=>m.cls.includes(c));
const hasAny=arr=>active().filter(m=>m.cls.some(c=>arr.includes(c)));
const scheduled=()=>active().filter(m=>!m.prn&&m.slots.length&&!m.unconfirmed);
/* Every name a medicine may be called by: "Paracetamol (Panadol)" answers to paracetamol, panadol, tylenol */
const medBase=m=>m.name.replace(/\s*\(.*?\)/g,'').trim().toLowerCase();
function medAliases(m){const a=[medBase(m)];(m.name.match(/\(([^)]+)\)/g)||[]).forEach(x=>a.push(x.slice(1,-1).trim().toLowerCase()));(m.ing||[]).forEach(i=>a.push(String(i).toLowerCase()));
  Object.entries(BRANDS).forEach(([b,g])=>{if((m.ing||[]).includes(g))a.push(b)});return [...new Set(a.filter(Boolean))]}
/* The one medicine a name refers to: full name, then any alias, then shared ingredient. Ambiguous ("Vitamin" with Vitamin D and Vitamin B12) gives null. */
function findMed(name){const raw=String(name||'').trim().toLowerCase(),q=raw.replace(/\s*\(.*?\)/g,'').trim();if(!q)return null;const list=active();
  const one=arr=>arr.length===1?arr[0]:null;
  return one(list.filter(m=>m.name.toLowerCase()===raw||medBase(m)===q))||one(list.filter(m=>medAliases(m).includes(q)))||
    (()=>{const ing=classify(q).ing;return ing.length?one(list.filter(m=>(m.ing||[]).some(i=>ing.includes(i)))):null})()}
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const medMentioned=(text,m)=>medAliases(m).some(a=>new RegExp('\\b'+reEsc(a)+'\\b','i').test(text));
/* Pronouns: written as she/her throughout; swapped at display time for he/him, or for the person's name */
const OBJ_NEXT=new Set('to a an the now straight today up by in on at and or when if that with for from again know feel so any out off down yet tomorrow before after as than is was once too some about'.split(' '));
function pronText(s){const p=(state&&state.patient&&state.patient.pronoun)||'she';if(p==='she'||s==null)return s;const nm=state.patient.short||'them',he=p==='he';
  return String(s).replace(/\b(she|her|hers|herself)\b(\s*)([A-Za-z']*)/gi,(all,w,sp,next)=>{const lw=w.toLowerCase();let r;
    if(lw==='she')r=he?'he':nm;else if(lw==='hers')r=he?'his':nm+"'s";else if(lw==='herself')r=he?'himself':nm;
    else{const obj=next?OBJ_NEXT.has(next.toLowerCase()):!sp;r=obj?(he?'him':nm):(he?'his':nm+"'s")}
    if(he&&w[0]!==w[0].toLowerCase())r=r[0].toUpperCase()+r.slice(1);return r+sp+next})}
function pronDom(root){if(!root||((state.patient||{}).pronoun||'she')==='she')return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('script,style,textarea,.msg,.e-you,[data-nopron]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  let n;while((n=w.nextNode()))if(/\b(she|her|hers|herself)\b/i.test(n.nodeValue))n.nodeValue=pronText(n.nodeValue);
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>['placeholder','aria-label','title'].forEach(a=>{const v=el.getAttribute(a);if(v&&/\b(she|her|hers)\b/i.test(v))el.setAttribute(a,pronText(v))}))}
function schedText(m){return m.prn?'When needed':m.slots.map(s=>SLOTL[s]).join(', ')||'No times set'}
function perDay(m){return m.prn?0:(m.dosePerTake||1)*m.slots.length}
function daysLeft(m){const p=perDay(m);return p?Math.floor((m.qty||0)/p):null}
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:null}

function chains(){
  const out={};
  const add=(rule,a,ev,b)=>{const id=rule.id+':'+a.id;if(!out[id])out[id]={id,rule,a,b:null,ev:[]};if(b&&!out[id].b)out[id].b=b;out[id].ev.push(ev)};
  RULES.forEach(r=>{
    const froms=hasAny(r.from);
    froms.forEach(a=>{
      // sequence: a follow-on medicine started after A
      if(r.to.length)hasAny(r.to).forEach(b=>{if(b.id===a.id)return;const g=diff(a.start,b.start);if(g>0&&g<=180)add(r,a,{k:'sequence',t:`${b.name} was started ${g} days after ${a.name}${b.reason?' (for '+b.reason.toLowerCase()+')':''}.`},b)});
      // symptoms
      state.symptoms.filter(s=>!s.resolved&&r.sym.includes(s.key)).forEach(s=>{const g=diff(a.start,s.start);if(g>=-3)add(r,a,{k:'symptom',t:`${s.label} began ${g<=0?'around when':g+' days after'} ${a.name} was started${s.mentions&&s.mentions.length>1?', mentioned '+s.mentions.length+' times':''}.`})});
      // reports
      state.reports.filter(x=>x.medId===a.id&&r.sym.includes(x.key)).forEach(x=>add(r,a,{k:'report',t:`Family reported a suspected side effect on ${fmt(x.date)}: ${x.note||x.label}.`}));
    });
  });
  byCls('sulfonylurea').concat(byCls('insulin')).forEach(a=>{state.vitals.filter(v=>v.type==='glucose'&&v.value<4&&v.date>=a.start).forEach(v=>add(RULES.find(r=>r.id==='su-hypo'),a,{k:'vital',t:`Low blood sugar of ${v.value} mmol/L on ${fmt(v.date)}.`}))});
  return Object.values(out).map(c=>{const kinds=new Set(c.ev.map(e=>e.k));c.strength=kinds.size>=2&&!c.rule.expected?'Likely':'Possible';c.sev=!c.rule.expected&&(kinds.has('sequence')||kinds.size>=2)?'crit':'warn';c.status=(state.chains[c.id]||{}).status||'New';c.note=(state.chains[c.id]||{}).note||'';return c})
   .sort((x,y)=>(y.sev==='crit')-(x.sev==='crit')||y.ev.length-x.ev.length);
}
function openChains(){return chains().filter(c=>c.status!=='Dismissed'&&c.status!=='Discussed with doctor')}
function interactions(){
  const out=[],n=c=>byCls(c).length,names=c=>byCls(c).map(m=>m.name).join(' and ');
  if(n('nsaid')&&n('anticoagulant'))out.push({sev:'crit',title:'Bleeding risk',text:`${names('nsaid')} with ${names('anticoagulant')} raises the risk of serious bleeding.`});
  if(n('nsaid')&&(n('ace')||n('arb'))&&n('diuretic'))out.push({sev:'crit',title:'Kidney strain ("triple whammy")',text:'An NSAID with an ACE inhibitor or ARB and a water pill together can damage the kidneys.'});
  if(n('nsaid')>1)out.push({sev:'crit',title:'Two NSAID painkillers',text:`${names('nsaid')} are both NSAIDs. Taking two raises stomach-bleeding and kidney risk.`});
  if(n('nsaid')&&n('antihypertensive'))out.push({sev:'warn',title:'Painkiller weakening blood-pressure treatment',text:`${names('nsaid')} can raise blood pressure and reduce the effect of ${names('antihypertensive')}.`});
  if(n('nsaid')&&n('antiplatelet'))out.push({sev:'warn',title:'Stomach bleeding risk',text:`${names('nsaid')} with ${names('antiplatelet')} raises stomach-bleeding risk.`});
  if((n('sedative')||n('sedatingantihistamine'))&&n('opioid'))out.push({sev:'crit',title:'Too much sedation',text:'A sedative with an opioid painkiller can slow breathing and cause falls.'});
  if(n('cholinesterase')&&n('anticholinergic'))out.push({sev:'warn',title:'Medicines working against each other',text:`${names('anticholinergic')} blocks the same body signal that ${names('cholinesterase')} boosts, and can worsen memory.`});
  if(n('decongestant')&&n('antihypertensive'))out.push({sev:'warn',title:'Decongestant with high blood pressure',text:`${names('decongestant')} can raise blood pressure.`});
  if(n('ssri')&&(n('nsaid')||n('anticoagulant')))out.push({sev:'warn',title:'Bleeding risk with antidepressant',text:'SSRI antidepressants with NSAIDs or blood thinners raise bleeding risk.'});
  if(state.patient.age>=65)['sedative','sedatingantihistamine','anticholinergic'].forEach(c=>{if(n(c))out.push({sev:'warn',title:'Use with caution in older adults',text:`${names(c)} is on the Beers Criteria list of medicines that are often risky for people over 65.`})});
  const ing={};active().forEach(m=>m.ing.forEach(i=>{(ing[i]=ing[i]||[]).push(m.name)}));
  Object.entries(ing).forEach(([i,l])=>{if(l.length>1)out.push({sev:'crit',title:`Same ingredient twice: ${i}`,text:`${l.join(' and ')} both contain ${i}. Together they can go over the safe daily limit.`})});
  return out;
}
function vitalFlag(v){
  if(v.type==='bp'){if(v.sys>=180||v.dia>=110)return['crit','Very high'];if(v.sys>=140||v.dia>=90)return['warn','High'];if(v.sys<100)return['warn','Low'];return['ok','In range']}
  if(v.type==='glucose'){if(v.value<4)return['crit','Low'];if(v.value>15)return['crit','Very high'];if(v.value>10)return['warn','High'];return['ok','In range']}
  if(v.type==='temp'){if(v.value>=38)return['warn','Fever'];if(v.value<35.5)return['warn','Low'];return['ok','Normal']}
  if(v.type==='pulse'){if(v.value>110||v.value<50)return['warn','Check'];return['ok','Normal']}
  return['ok','Recorded'];
}
function latest(type){return state.vitals.filter(v=>v.type===type).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))[0]}
function todayDoses(){
  const out=[];const day=state.doses[T]||{};
  scheduled().forEach(m=>m.slots.forEach(s=>out.push({m,slot:s,key:m.id+':'+s,status:day[m.id+':'+s]||'due'})));
  return out;
}
function adherence(days){
  let due=0,taken=0;for(let i=-days;i<0;i++){const d=addDays(i),log=state.doses[d]||{};scheduled().forEach(m=>{if(m.start>d)return;m.slots.forEach(s=>{due++;if(log[m.id+':'+s]==='taken')taken++})})}
  return {due,taken,pct:due?Math.round(taken/due*100):100};
}
function alerts(){
  const out=[];
  state.events.slice(-6).reverse().forEach(e=>out.push(Object.assign({go:'companion'},e)));
  openChains().forEach(c=>out.push({sev:c.sev,title:chainTitle(c),text:c.rule.why,go:'watch'}));
  interactions().forEach(x=>out.push({sev:x.sev,title:x.title,text:x.text,go:'watch'}));
  active().forEach(m=>{const d=daysLeft(m);if(d!==null&&d<=7)out.push({sev:d<=3?'crit':'warn',title:`${m.name} runs out in ${d} day${d===1?'':'s'}`,text:`${m.qty} left. Arrange a refill.`,go:'meds'});if(m.unconfirmed)out.push({sev:'info',title:`Confirm new medicine: ${m.name}`,text:'Mentioned in conversation. Check the details before it is used in safety checks.',go:'meds'})});
  ['bp','glucose','temp'].forEach(t=>{const v=latest(t);if(v){const f=vitalFlag(v);if(f[0]!=='ok'&&!(t==='bp'&&out.some(a=>a.title===`Very high blood pressure: ${v.sys}/${v.dia}`)))out.push({sev:f[0],title:`${f[1]} ${t==='bp'?'blood pressure':t==='glucose'?'blood sugar':'temperature'}: ${t==='bp'?v.sys+'/'+v.dia:v.value}`,text:`Recorded ${fmt(v.date)} at ${v.time}.`,go:'vitals'})}});
  const y=addDays(-1),log=state.doses[y]||{};const missed=Object.entries(log).filter(([k,v])=>v==='skipped');
  if(missed.length)out.push({sev:'warn',title:`${missed.length} dose${missed.length>1?'s':''} missed yesterday`,text:missed.map(([k])=>{const m=state.meds.find(x=>x.id===k.split(':')[0]);return (m?m.name:'Medicine')+' ('+SLOTL[k.split(':')[1]]+')'}).join(', '),go:'doses'});
  const rank={crit:0,warn:1,info:2};return out.sort((a,b)=>rank[a.sev]-rank[b.sev]);
}
function chainTitle(c){return c.b?`${c.a.name} may have led to ${c.b.name}`:`${cap(c.rule.effect)} may be a side effect of ${c.a.name}`}
function nextAppt(){return state.appts.filter(a=>a.date>=T).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0]}
