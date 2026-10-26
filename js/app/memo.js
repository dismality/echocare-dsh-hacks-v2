/* ================= doctor memo: the technical record for the next visit ================= */
const mrow=(k,v)=>`<div class="mrow"><dt>${k}</dt><dd>${v}</dd></div>`;
function memoChain(c,i){
  const src=RULE_SRC[c.rule.id],f=fdaSignal(c.a,c.rule.sym);
  const ev=c.ev.map(e=>String(e.t).replace(/\.$/,'')).concat(f?[`openFDA: ${nf(f.n)} reports of ${f.term} in people over 65 taking ${cap(f.drug)}`]:[]);
  return `<div class="memo-chain"><h3>${i}. ${esc(chainTitle(c))}<span class="mtag">${c.strength}${c.rule.expected?', often intended':''} \u00b7 ${esc(src?src[1]:'Known side effect')}</span></h3>
   <p>${esc(c.a.name)} ${esc(c.a.strength)} (started ${fmt(c.a.start)}${c.a.source!=='Prescribed'?', '+esc(String(c.a.source).toLowerCase()):''}) can cause ${esc(c.rule.effect)}. ${c.b?`${esc(c.b.name)} ${esc(c.b.strength)} was started ${fmt(c.b.start)}${c.b.reason?' for '+esc(c.b.reason.toLowerCase()):''}.`:esc(cap(ghostLabel(c)))+'.'}</p>
   <p class="small"><b>Evidence:</b> ${esc(ev.join('; '))}.</p>
   ${c.note?`<p class="small"><b>Doctor's answer:</b> ${esc(c.note)}</p>`:''}
   <div class="mctl noprint"><select id="cs_${c.id}" data-chain="${c.id}" class="chainStatus" aria-label="Status">${['New','Ask doctor','Discussed with doctor','Dismissed'].map(o=>`<option ${c.status===o?'selected':''}>${o}</option>`).join('')}</select><input type="text" id="cn_${c.id}" value="${esc(c.note)}" placeholder="Doctor's answer, e.g. switched to paracetamol" aria-label="Doctor's answer"><button class="btn sm" data-act="chain-note" data-id="${c.id}">Save</button></div></div>`;
}
/* Doctor memo, doses: one line per medicine, listing only what was missed; one line per when-needed medicine */
function missedText(m,days){
  const out=[];let run=null;
  days.forEach(d=>{if(m.start>d)return;const log=state.doses[d]||{},due=(d<T?m.slots:[]),miss=due.filter(sl=>log[m.id+':'+sl]!=='taken');
    if(miss.length&&miss.length===due.length){if(run&&diff(run.end,d)===1)run.end=d;else{run={start:d,end:d,full:true};out.push(run)}}
    else{run=null;if(miss.length)out.push({start:d,slots:miss})}});
  return out.map(r=>r.full?(r.start===r.end?fmt(r.start):fmt(r.start)+' to '+fmt(r.end))+(m.slots.length>1?' (all doses)':''):fmt(r.start)+' ('+r.slots.map(x=>SLOTL[x].toLowerCase()).join(', ')+')').join('; ');
}
function doseList(days){
  const schedRows=scheduled().map(m=>{let due=0,tk=0;days.forEach(d=>{if(m.start>d)return;const log=state.doses[d]||{};(d<T?m.slots:[]).forEach(sl=>{due++;if(log[m.id+':'+sl]==='taken')tk++})});
    const miss=missedText(m,days);if(!miss)return '';return `<tr><td><b>${esc(m.name)} ${esc(m.strength)}</b></td><td>${esc(schedText(m))}, ${esc(unitWord(m,m.dosePerTake||1))}</td><td><b>${tk} of ${due}</b> (${due?Math.round(tk/due*100):100}%)</td><td>${miss?`<span class="flagtxt">Missed ${esc(miss)}</span>`:'\u2014'}</td></tr>`});const sched=schedRows.join(''),nOk=schedRows.filter(r=>!r).length;
  const prn=active().filter(m=>m.prn).map(m=>{const uses=[];days.forEach(d=>Object.entries(state.doses[d]||{}).forEach(([k,v])=>{if(v!=='taken'||!k.startsWith(m.id+':prn:'))return;const n=((state.prnQty||{})[d]||{})[k]||m.dosePerTake||1,mg=((state.prnMg||{})[d]||{})[k]||m.strength;uses.push({d,t:k.split(':prn:')[1].slice(0,5),n,mg})}));
    const tabs=uses.reduce((x,u)=>x+u.n,0),mgTot=uses.reduce((x,u)=>{const q=String(u.mg).match(/([\d.]+)\s*(mg|mcg|g|ml)/i);return q?x+(+q[1])*u.n:x},0),unit=(String(m.strength).match(/(mg|mcg|g|ml)/i)||['','mg'])[1];
    return `<tr><td><b>${esc(m.name)}</b>${m.reason?`<br><span class="small">for ${esc(m.reason.toLowerCase())}</span>`:''}</td><td><b>${uses.length}</b> time${uses.length===1?'':'s'}</td><td>${uses.length?esc(unitWord(m,tabs))+(mgTot?' ('+nf(mgTot)+' '+unit+')':''):'\u2014'}</td><td>${uses.length?uses.map(u=>`${fmt(u.d)}, ${clock(u.t)}: ${esc(unitWord(m,u.n))} of ${esc(u.mg)}`).join('<br>'):'Not used'}</td></tr>`}).join('');
  return `${sched?`<div class="tbl"><table class="t dosetbl"><thead><tr><th>Scheduled medicine</th><th>How taken</th><th>Taken</th><th>Missed</th></tr></thead><tbody>${sched}</tbody></table></div>${nOk?`<p class="small" style="margin:6px 0 0">All other scheduled medicines (${nOk}): every dose taken.</p>`:''}`:`<p style="margin:0">${schedRows.length?'Every scheduled dose was taken.':'No scheduled medicines.'}</p>`}
   ${prn?`<div class="tbl" style="margin-top:14px"><table class="t dosetbl prntbl"><thead><tr><th>When-needed medicine</th><th>Used</th><th>Total</th><th>Note</th></tr></thead><tbody>${prn}</tbody></table></div>`:''}`;
}
/* Doctor memo, routine: plain sentences on which doses were late and when, with a small chart underneath */
function memoRoutine(){
  const days=[];for(let i=-7;i<=0;i++)days.push(addDays(i));const late=[];
  days.forEach(d=>Object.entries(state.doseTimes[d]||{}).forEach(([k,t])=>{const [id,sl]=k.split(':');if(!SLOTL[sl])return;const m=state.meds.find(x=>x.id===id);if(m)late.push({d,sl,m,t,mins:minsOf(t)-minsOf(slotT(sl))})}));
  const dayAvg=days.map(d=>{const x=late.filter(l=>l.d===d).map(l=>Math.max(0,l.mins));return x.length?avg(x):null});
  const early=avg(dayAvg.slice(0,4).filter(x=>x!==null)),recent=avg(dayAvg.slice(4).filter(x=>x!==null));
  if(early==null&&recent==null)return '';
  const worst=late.filter(l=>l.mins>=30).sort((a,b)=>b.mins-a.mins)[0];
  const lead=early!=null&&recent!=null&&recent-early>=10?`Routine slipping: doses taken on average ${dur(Math.round(recent))} after the reminder in the last 4 days, up from ${dur(Math.round(early))}.`:`Routine steady: doses usually taken within ${dur(Math.round(avg([early,recent].filter(x=>x!=null))))} of the reminder.`;
  return `<p style="margin:0 0 10px"><b>Routine.</b> ${lead}${worst?` Latest dose: ${esc(SLOTL[worst.sl].toLowerCase())} ${esc(worst.m.name)} on ${fmtW(worst.d)}, ${dur(worst.mins)} late.`:''}</p>`;
}
const ARTIFACT_URL='https://claude.ai/artifact/HetAvtkABAhgHGxS1CwZeu';
function memoSummaryText(){const ap=nextAppt(),ch=openChains(),a=adherence(14);
  return `EchoCare medication memo for ${state.patient.name}, ${state.patient.age}${ap?' (appointment '+fmtW(ap.date)+')':''}. ${ch.length?ch.length+' possible medicine side-effect pattern'+(ch.length>1?'s':'')+': '+ch.map(chainTitle).join('; ')+'.':'No side-effect patterns found.'} Doses taken: ${a.pct}% over 14 days. Full memo: ${ARTIFACT_URL}#memo`}
/* Doctor memo as a printable PDF: real text (not a picture), built from the memo on screen, A4, page numbers.
   jsPDF and its table plugin load from cdnjs only when the button is pressed. */
let pdfLib=null,pdfBusy=false;
function loadScript(src){return new Promise((ok,fail)=>{const t=document.createElement('script');t.src=src;t.onload=ok;t.onerror=fail;document.head.appendChild(t)})}
async function getPdfLib(){if(pdfLib)return pdfLib;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  pdfLib=window.jspdf;return pdfLib}
const pdfTxt=t=>String(t||'').replace(/\s+/g,' ').replace(/[\u2192]/g,'->').replace(/[\u2190]/g,'<-').replace(/[\u2713]/g,'').trim();
async function memoPdf(){
  if(pdfBusy)return;const src=$('sheetDoc');if(!src)return;pdfBusy=true;toast('Making the PDF\u2026');
  try{
    const {jsPDF}=await getPdfLib();const doc=new jsPDF({unit:'pt',format:'a4'});
    const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=48,TEAL=[11,122,110];let y=M;
    const room=h=>{if(y+h>H-M){doc.addPage();y=M}};
    const text=(t,o)=>{o=o||{};t=pdfTxt(t);if(!t)return;doc.setFont('helvetica',o.bold?'bold':'normal');doc.setFontSize(o.size||10);doc.setTextColor.apply(doc,o.color||[20,26,23]);
      doc.splitTextToSize(t,W-2*M-(o.indent||0)).forEach(line=>{room((o.size||10)*1.35);doc.text(line,M+(o.indent||0),y+(o.size||10));y+=(o.size||10)*1.35});y+=o.after==null?4:o.after};
    const sheet=src.cloneNode(true);sheet.querySelectorAll('.noprint,.mctl,button,select,input').forEach(e=>e.remove());sheet.querySelectorAll('.mtag').forEach(t=>{t.textContent=' ('+t.textContent+')'});
    const walk=el=>{[...el.children].forEach(c=>{const tag=c.tagName;
      if(c.classList.contains('eyebrow')){text(c.textContent.toUpperCase(),{size:8.5,bold:true,color:TEAL,after:2})}else if(tag==='H1'){text(c.textContent,{size:18,bold:true,after:6})}
      else if(tag==='H2'){y+=8;text(c.textContent,{size:11,bold:true,color:TEAL,after:4})}
      else if(tag==='H3'){y+=4;text(c.textContent,{size:10.5,bold:true,after:2})}
      else if(tag==='P'){text(c.textContent,{size:c.classList.contains('small')||c.classList.contains('foot')?9:10,color:c.classList.contains('foot')?[85,99,94]:null})}
      else if(tag==='TABLE'){room(40);doc.autoTable({html:c,startY:y,margin:{left:M,right:M},theme:'grid',styles:{fontSize:8.5,cellPadding:4,textColor:[20,26,23],lineColor:[220,227,224]},headStyles:{fillColor:TEAL,textColor:255,fontStyle:'bold'},
        didParseCell:d=>{d.cell.text=d.cell.text.map(pdfTxt);if(d.section==='body'&&d.cell.raw&&d.cell.raw.querySelector&&d.cell.raw.querySelector('.flagtxt'))d.cell.styles.textColor=[190,51,41]}});y=doc.lastAutoTable.finalY+8}
      else if(tag==='DL'){[...c.querySelectorAll('.mrow')].forEach(r=>{const k=r.querySelector('dt'),v=r.querySelector('dd');text((k?k.textContent+': ':'')+(v?v.textContent:''),{size:10,after:1})});y+=4}
      else if(tag==='UL'||tag==='OL'){[...c.children].forEach(li=>text('\u2022 '+li.textContent,{size:9.5,indent:8,after:2}));y+=2}
      else if(tag==='DIV'&&c.classList.contains('fdasig')){text(c.textContent,{size:9,color:[85,99,94]})}
      else walk(c)})};
    walk(sheet);
    const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(120,130,126);
      doc.text('EchoCare medication memo \u00b7 '+pdfTxt(state.patient.name)+' \u00b7 '+fmtY(T),M,H-24);doc.text('Page '+i+' of '+n,W-M,H-24,{align:'right'})}
    const blob=doc.output('blob'),name='Doctor memo '+state.patient.short+' '+T+'.pdf';
    if(downloads){try{await downloads.save({filename:name,data:blob});toast('PDF saved. Open it and print.')}catch(e){toast(e&&e.code==='declined'?'Not saved':'Could not save the PDF here.')}}
    else{const u=URL.createObjectURL(blob),w=window.open(u,'_blank');if(!w){doc.save(name)}toast('PDF ready. Print it from the PDF viewer.')}
  }catch(e){toast('Could not make the PDF. Check your connection, or use Copy as text.')}
  pdfBusy=false;
}
function vMemo(){
  const all=chains().filter(c=>!c.rule.expected),inter=interactions().filter(x=>!(x.title==='Painkiller weakening blood-pressure treatment'&&all.some(c=>c.rule.id==='nsaid-bp'))),ap=nextAppt(),a=adherence(14),p=state.patient;
  const days=[];for(let i=-14;i<=0;i++)days.push(addDays(i));
  const ML=['','Very low','Low','OK','Good','Great'],ci=state.checkins.slice().sort((x,y)=>y.date.localeCompare(x.date)).slice(0,7);
  const guardian=(state.family.contacts.find(x=>!/GP|Pharmacist/.test(x.relation))||{name:'her family'}).name;
  const flag=t=>t?`<span class="flagtxt">${t}</span>`:'\u2014';
  const symNote=x=>{const L=all.filter(c=>c.rule.sym.includes(x.key)).map(c=>c.a.name);const n=(x.mentions||[]).length||1;return [L.length?'May be linked to '+esc(L.join(', ')):'',x.trend==='Worse'||x.trend==='New'?esc(x.trend):'',n>1?'reported '+n+' times':''].filter(Boolean).join(' \u00b7 ')};
  const medNote=m=>{const d=daysLeft(m);return [m.source!=='Prescribed'?esc(m.source):'',d!==null&&d<=7?'runs out in '+d+' day'+(d===1?'':'s'):'',m.unconfirmed?'details not confirmed':''].filter(Boolean).join(' \u00b7 ')};
  const ciNote=h=>{const sup=((state.supervision||{})[h.date]||{by:[]}).by;return [h.mood&&h.mood<=2?'low mood':'',!sup.length?'no one supervising':'',h.note?esc(h.note):''].filter(Boolean).join(' \u00b7 ')};
  const ciFlag=ci.filter(h=>ciNote(h)),av=k=>{const x=ci.map(h=>h[k]).filter(v=>v!=null&&v!=='').map(Number);return x.length?Math.round(avg(x)*10)/10:null};
  const lowD=ci.filter(h=>h.mood&&h.mood<=2).length,unsup=ci.filter(h=>!((state.supervision||{})[h.date]||{by:[]}).by.length).length;
  const ciSum=ci.length?[`Mood low on ${lowD} of ${ci.length} days`,av('sleep')!=null?`sleep about ${av('sleep')} hours`:'',av('pain')!=null?`pain about ${av('pain')} out of 10`:'',unsup?`nobody supervising on ${unsup} day${unsup>1?'s':''}`:'supervised every day'].filter(Boolean).join(' \u00b7 ')+'.':'No check-ins recorded.';
  return head('Doctor memo','The key facts for the next appointment.',`<div class="actions"><button class="btn primary" data-act="memo-pdf">Print memo (PDF)</button><button class="btn" data-act="copy-sheet">Copy as text</button><button class="btn" data-act="memo-link">Copy link for the doctor</button>${downloads?'<button class="btn" data-act="sheet-file">Save as file</button>':''}</div>`)+
  `<article class="sheet" id="sheetDoc"><div class="memohead"><div class="eyebrow">Medication review memo</div><h1>${esc(p.name)}, ${p.age}</h1>
   <dl class="mgrid memoto">${mrow('To',ap?esc(ap.with):'Her doctor')}${mrow('Appointment',ap?fmtW(ap.date)+', '+clock(ap.time||'09:00'):'Not booked')}${mrow('From','EchoCare, for '+esc(guardian))}${mrow('Date',fmtY(T))}${mrow('Conditions',esc(p.conditions||'Not recorded'))}${mrow('Allergies',esc(p.allergies||'None recorded'))}${mrow('Living',p.livesAlone?'Lives alone':'Lives with others')}</dl></div>
   <section><h2>1. Wellbeing and supervision, last 7 days</h2><p style="margin:0 0 8px">${ciSum}</p>${ciFlag.length?`<p class="small" style="margin:0 0 6px"><b>Days to note</b></p><div class="tbl"><table class="t"><thead><tr><th>Day</th><th>Mood</th><th>Sleep</th><th>Pain</th><th>Supervised by</th><th>Note</th></tr></thead><tbody>${ciFlag.map(h=>`<tr><td>${fmtW(h.date)}</td><td>${h.mood?ML[h.mood]:'\u2014'}</td><td>${h.sleep??'\u2014'}</td><td>${h.pain??'\u2014'}</td><td>${esc(((state.supervision||{})[h.date]||{by:[]}).by.join(', '))||'\u2014'}</td><td>${flag(ciNote(h))}</td></tr>`).join('')}</tbody></table></div>`:''}</section>
   <section><h2>2. Symptoms</h2><div class="tbl"><table class="t"><thead><tr><th>Symptom</th><th>Since</th><th>Severity</th><th>Note</th></tr></thead><tbody>${state.symptoms.filter(x=>!x.resolved).map(x=>`<tr><td>${esc(x.label)}</td><td>${fmt(x.start)}</td><td>${x.severity}/10</td><td>${flag(symNote(x))}</td></tr>`).join('')||'<tr><td colspan="4">None</td></tr>'}</tbody></table></div></section>
   <section><h2>3. Current medicines</h2><div class="tbl"><table class="t"><thead><tr><th>Medicine</th><th>How taken</th><th>Started</th><th>For</th><th>Note</th></tr></thead><tbody>${active().slice().sort((x,y)=>y.start.localeCompare(x.start)).map(m=>`<tr><td><b>${esc(m.name)}</b> ${esc(m.strength)}</td><td>${esc(schedText(m))}${m.prn?'':', '+esc(unitWord(m,m.dosePerTake||1))}</td><td>${fmt(m.start)}</td><td>${esc(m.reason)}</td><td>${flag(medNote(m))}</td></tr>`).join('')}</tbody></table></div></section>
   <section><h2>4. Doses, last 14 days</h2><p style="margin:0 0 6px">${a.taken} of ${a.due} scheduled doses taken (${a.pct}%), up to yesterday.</p>${memoRoutine()}${doseList(days)}</section>
   <section><h2>5. Possible prescribing cascades</h2><p class="small" style="margin:0">A side effect of one medicine treated with another. Rules from ThinkCascades, Rochon et al. (The BMJ 2026) and the AGS Beers Criteria; prompts for review, not proof.</p>${all.map((c,i)=>memoChain(c,i+1)).join('')||'<p>None found.</p>'}
    ${inter.length?`<div class="memo-chain"><h3>Interactions and duplicates</h3><ul class="evid">${inter.map(x=>`<li><b>${esc(x.title)}.</b> ${esc(x.text)}</li>`).join('')}</ul></div>`:''}</section>
   <p class="foot">From the patient's own conversations, check-ins and family reports. Findings are prompts for clinical review, not diagnoses. No medicine should be stopped or changed without the prescriber.</p></article>`;
}
Object.assign(RULE_SRC,{'antichol-retention':['info','Published cascade studies'],'levodopa-nausea':['info','Classic published cascade'],'ccb-const':['plain','Known side effect'],'antichol-const':['plain','Known side effect'],'gaba-dizzy':['plain','Known side effect'],'chei-insom':['plain','Known side effect'],'nsaid-gi':['plain','Known side effect'],'steroid-gi':['plain','Known side effect']});
Object.assign(TO_LABEL,{alphablocker:'a prostate medicine',antiemetic:'an anti-sickness medicine'});
function vTrust(){return vTrustBody()+'<div style="height:16px"></div>'+engineCard()}
/* Pharmacist view: patients sorted by medication risk. Only Mdm Tan is real data; the rest are marked examples. */
const PHARM_EXAMPLES=[{name:'Mr Lim Boon Huat',age:81,meds:9,top:'Water pill followed by a bladder medicine',score:7,last:-120},{name:'Mdm Siti Aminah',age:74,meds:6,top:'Two NSAID painkillers at once',score:6,last:-200},{name:'Mdm Wong Mei Ling',age:86,meds:11,top:'Sleeping pill with new confusion',score:4,last:-90},{name:'Mr Raj Kumar',age:69,meds:4,top:'No findings',score:0,last:-30}];
function riskOf(score){return score>=5?['crit','High']:score>=2?['warn','Medium']:['ok','Low']}
/* The same risk score for any record: runs the real engine on that record, then puts this one back */
function riskSummary(st){
  const real=state;try{if(st)state=normalize(clone(st));const ch=openChains(),inter=interactions();
    return {name:state.patient.name,age:state.patient.age,meds:active().length,top:ch[0]?chainTitle(ch[0]):inter[0]?inter[0].title:'No findings',
      score:ch.reduce((n,c)=>n+(c.sev==='crit'?3:1),0)+inter.filter(x=>x.sev==='crit').length*2+(active().length>=5?1:0),last:state.pharmReviewed||null}}
  finally{state=real}}
/* Patients a pharmacist added by care-circle code, read fresh each time the view opens */
let pharmRows=[],pharmBusy=false;
async function loadPharm(){
  const codes=(meData.pharm||[]).filter(c=>c!==circleId);if(!db||!codes.length){pharmRows=[];if(section==='pharm')render();return}
  pharmBusy=true;if(section==='pharm')render();
  const out=await Promise.all(codes.map(c=>db.doc('circles/'+c).get().then(s=>{const v=s.exists?s.data():null;return v&&v.state&&v.state.v===2?Object.assign({code:c,real:true},riskSummary(v.state)):{code:c,real:true,missing:true,name:'Code '+c,age:'',meds:'\u2014',top:'Not found or no access',score:-1}},()=>null)));
  pharmRows=out.filter(Boolean);pharmBusy=false;if(section==='pharm')render();
}
function vPharm(){
  const mine=Object.assign({real:true,current:true,code:circleId},riskSummary(null));
  const real=[mine].concat(pharmRows),ex=real.length<3?PHARM_EXAMPLES.map(x=>Object.assign({real:false},x,{last:addDays(x.last)})):[];
  const rows=real.concat(ex).sort((a,b)=>b.score-a.score);
  return head('Pharmacist view','Patients sorted by medication risk, so reviews reach the people who need them first.',`<button class="btn" data-go="overview">Back to guardian view</button>`)+
  `<div class="card"><div class="tbl"><table class="t pharmtbl"><thead><tr><th>Patient</th><th>Medicines</th><th>Top finding</th><th>Risk</th><th>Last review</th><th></th></tr></thead><tbody>${rows.map(r=>{const k=r.missing?['plain','\u2014']:riskOf(r.score);return `<tr><td><b>${esc(r.name)}</b>${r.age?', '+r.age:''}${r.real?(r.current?' <span class="chip info">Open now</span>':''):' <span class="chip plain">Example</span>'}</td><td>${r.meds}</td><td>${esc(r.top)}</td><td><span class="chip ${k[0]}">${k[1]}</span></td><td>${r.last?fmt(r.last):'Never'}</td><td>${r.current?`<span class="actions"><button class="btn sm primary" data-go="memo">Open memo</button><button class="btn sm" data-act="pharm-reviewed">Mark reviewed</button></span>`:r.real?`<span class="actions">${r.missing?'':`<button class="btn sm primary" data-act="pharm-open" data-code="${esc(r.code)}">Open record</button>`}<button class="btn sm ghost" data-act="pharm-remove" data-code="${esc(r.code)}">Remove</button></span>`:'<span class="small muted">Example only</span>'}</td></tr>`}).join('')}</tbody></table></div>
   ${pharmBusy?'<p class="small muted" style="margin:10px 0 0">Loading patients\u2026</p>':''}
   <form class="inrow" id="pharmAdd" style="margin-top:14px;max-width:460px"><input type="text" id="pharmCode" placeholder="Add a patient by care-circle code" aria-label="Care-circle code" autocomplete="off" style="text-transform:uppercase"><button class="btn">Add patient</button></form>
   <p class="small muted" style="margin:10px 0 0">Risk counts likely side-effect chains, serious interactions and having five or more medicines, using the same engine as each patient's own record. Families share their care-circle code with the pharmacy to appear here.${ex.length?' Rows marked Example are made-up patients that show how a pharmacy would see many people at once; they disappear once three real patients are added.':''}</p></div>`;
}
function vConnect(){
  const card=(logo,name,what,status,body)=>`<div class="rec"><div class="hd"><span class="logo2">${logo}</span><div><b>${name}</b><span class="small muted">${what}</span></div></div><div><span class="chip ${status[0]}">${status[1]}</span></div><span class="small">${body}</span></div>`;
  return head('Connected apps','Services EchoCare uses and what each one adds.')+
  `<div class="integ">
   ${card('FDA','openFDA','US Food and Drug Administration',['ok','In use'],`Adverse-event reports from people over 65 for each medicine, shown on medicine cards and side-effect chains. The ibuprofen boxed warning comes from the FDA drug label. <button class="btn sm ghost" data-go="memo" style="padding:0">See it in the doctor memo</button>`)}
   ${card('CC','Care circle','Her phone and the family\'s, one record',[circleId?'ok':'plain',circleId?'Shared live':'Not started'],'Doses ticked on her phone, and urgent alerts reach every family member with EchoCare open within seconds. A pharmacy can add her by code. <button class="btn sm ghost" data-go="guardian" style="padding:0">Set up</button>')}
   ${card('AI','Claude','Anthropic',[sample?'ok':'plain',sample?'In use':'Asks permission first'],'Reads the companion chat into records, identifies medicines from a photo, writes plain-language explanations and runs the second-opinion medication review.')}
   ${card('31','Google Calendar and Outlook','Calendar',['ok','In use'],'Appointments and daily dose times open as ready-made calendar events, so reminders reach any phone. <button class="btn sm ghost" data-go="appts" style="padding:0">Appointments</button>')}
   ${card('Rx','Pharmacy refills','Your usual pharmacy',['ok','Message'],'When a medicine is 10 days from running out, EchoCare drafts the refill request with the name, strength and quantity. <button class="btn sm ghost" data-go="meds" style="padding:0">Medicines</button>')}
   ${card('HH','HealthHub and NEHR','Singapore health records',['plain','Link'],'NEHR, the national health record, is not open to patients or apps directly. Patients see their NEHR medication list in HealthHub, and can give carers access with Caregiver Access. Use it to compare her official list with this one. <a class="btn sm ghost" style="padding:0" target="_blank" rel="noopener" href="https://www.healthhub.sg/">Open HealthHub</a>')}
   ${card('\u2665','Apple Health and Health Connect','Phone health data',['plain','Phone app'],'Steps, sleep and heart rate from the phone, so a drop in activity after a new medicine shows up as evidence. Needs the installed phone app.')}
   ${card('Rx','RxNorm (US National Library of Medicine)','Medicine names',['plain','Phone app'],'Matches misspelled or brand names to the right ingredient so every medicine is checked. Needs a live connection, which this page cannot make.')}
  </div>
  <div class="card" style="margin-top:16px"><h2>What stays private</h2><p class="small muted" style="margin:0">Calendar links open in a new tab and add nothing until you press save there. Calendar events name only the time of day. FDA data is built into the page, so no medicine names leave it for those lookups. ${esc(state.patient.short)}'s sharing choices on the Family page decide what the digest contains.</p></div>`;
}
function refillOverlay(m){
  const days=daysLeft(m);const txt=`Hello, I'd like to request a refill for ${state.patient.name}:\n${m.name} ${m.strength}, ${m.form.toLowerCase()}, ${schedText(m).toLowerCase()} (${perDay(m)} a day).\nAbout ${days} days left. Prescribed by ${m.prescriber||'her doctor'}.\nPlease let me know when it is ready to collect. Thank you.`;
  window.__refillTxt=txt;
  showOverlay(`<div class="remind" role="dialog" aria-modal="true" aria-labelledby="rfT"><div class="bell">${IC.pill}</div><h2 id="rfT">Request a refill</h2><p class="small muted" style="margin:0">Review the message, then send it to the pharmacy your usual way.</p><textarea id="rfTxt" aria-label="Refill message">${esc(txt)}</textarea>
<div class="rowbtns"><button class="btn big primary" data-act="refill-copy" style="font-size:16px">Copy message</button><button class="btn big" data-rm="close" style="font-size:16px">Close</button></div></div>`);
}
