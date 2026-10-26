/* ================= rendering ================= */
const IC={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 talk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 pill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.2 7.9l5.6 8.2"/></svg>',
 health:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>',
 care:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 6 5.5"/></svg>',
 help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.5"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
 bell:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>'
};
IC.shield='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>';
/* Five places: what is happening today, what may be unsafe, what she takes, what she reports, who cares for her */
IC.doc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/></svg>';
IC.gear='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
const CAMERA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
/* Five places: today, plain-language care, what she reports, the technical memo for the doctor, and settings */
const GROUPS={home:{l:'Today',ic:'home',items:[['overview','Today'],['checkin','Check-in'],['symptoms','Symptoms'],['companion','Conversation']]},
  care:{l:'Her care',ic:'shield',items:[['appts','Appointments'],['meds','Medicines']]},
  log:{l:'Health log',ic:'health',items:[['notes','Notes']]},
  memo:{l:'Doctor memo',ic:'doc',items:[['memo','Doctor memo']]},
  settings:{l:'Settings',ic:'gear',items:[['guardian','Guardian'],['profile','Her profile'],['elderapp','Her app'],['connect','Connected apps'],['trust','Trust and limits']]}};
const ALIAS={watch:'notes',vitals:'checkin',sheet:'memo',doses:'meds',family:'guardian',simple:'overview',simplemeds:'overview'};
const groupOf=s=>Object.keys(GROUPS).find(g=>GROUPS[g].items.some(i=>i[0]===s));
function navCount(k){
  if(k==='meds'){const n=active().filter(m=>{const d=daysLeft(m);return m.unconfirmed||(d!==null&&d<=7)}).length;return n?[n,'warn']:[active().length,'']}
  if(k==='notes'){const c=openChains().length+interactions().filter(i=>i.sev==='crit').length;return c?[c,'crit']:[0,'']}
  if(k==='symptoms')return [state.symptoms.filter(s=>!s.resolved).length,''];
  if(k==='checkin'){const c=state.checkins.find(x=>x.date===T);return c&&c.mood?[0,'']:[1,'warn']}
  if(k==='watch'){const c=openChains().length+interactions().filter(i=>i.sev==='crit').length;return c?[c,'crit']:[0,'']}
  if(k==='doses'){const d=todayDoses().filter(x=>x.status==='due').length;return d?[d,'warn']:[0,'']}
  if(k==='vitals'){const f=['bp','glucose'].map(latest).filter(Boolean).filter(v=>vitalFlag(v)[0]!=='ok').length;return f?[f,'warn']:[0,'']}
  if(k==='overview'){const a=alerts().filter(x=>x.sev==='crit').length;return a?[a,'crit']:[0,'']}
  return [0,''];
}
function renderNav(){
  const nav=$('bottomNav'),cur=groupOf(section);
  nav.innerHTML=`<div class="in" style="--n:5">${Object.entries(GROUPS).map(([g,o])=>{let n=0,c='';o.items.forEach(([k])=>{const [x,cc]=navCount(k);if(cc&&x){n+=x;if(cc==='crit'||!c)c=cc}});if(g==='home')n=0;return `<button data-go="${o.items[0][0]}" ${cur===g?'aria-current="page"':''}>${IC[o.ic]}<span>${o.l}</span>${n?`<span class="cnt ${c}">${n}</span>`:''}</button>`}).join('')}</div>`;
  $('pName').textContent=state.patient.name+' \u00b7 '+state.patient.age;
  $('pInit').textContent=state.patient.name.replace(/^(Mdm|Mr|Mrs|Ms|Dr)\.? /,'').split(' ').map(w=>w[0]).slice(0,2).join('');
}
function head(title,desc,extra){return `<div class="sechead"><div><h1>${title}</h1><p>${desc}</p></div>${extra||''}</div>`}
function demoBanner(){return state.demo?`<div class="banner"><span><b>Example patient.</b> Mdm Tan is a made-up profile so you can try every feature. Your changes ${circleId?'save to the shared care circle':docRef?'save to your account':'are kept only on this page'}.${ONLINE_AI?'':' This website is the demo version: Claude features run in the full version on claude.ai.'}</span><span class="actions"><button class="btn sm" data-act="reset-demo">Reset example</button><button class="btn sm" data-act="start-empty">${window.__confirmEmpty?'Tap again to clear everything':'Start with a blank profile'}</button></span></div>`:''}
/* When an alert happened, shown on the right: "8:16 pm", "Yesterday, 8:16 pm" or "21 Oct, 8:16 pm" */
function whenText(ts){const m=String(ts||'').match(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d)/);if(!m)return '';const d=diff(m[1],T);return (d===0?'':d===1?'Yesterday, ':fmt(m[1])+', ')+clock(m[2])}
function alertRow(a){const w=whenText(a.ts),ph=state.patient.phone,call=a.sev==='crit'&&a.ts&&ph?`<div class="actions" style="margin-top:6px"><a class="btn sm dangerfill" href="${esc(telHref(ph))}">Call ${esc(state.patient.short)}</a></div>`:'';
  return `<div class="alert ${a.sev}"><span class="bar"></span><div><b>${esc(a.title)}</b><p>${esc(w?String(a.text).replace(/ at \d\d:\d\d/,''):a.text)}</p>${call}</div>${w?`<time class="atime">${esc(w)}</time>`:''}</div>`}

/* Three daily rings: doses taken, wellbeing check-in, human contact */
/* Three separate circles: doses, check-in, who supervised her. Each shows a tick when complete. */
function supToday(){return (state.supervision||{})[T]||null}
function todayRings(){
  const td=todayDoses(),taken=td.filter(d=>d.status==='taken').length;
  const ci=state.checkins.find(c=>c.date===T)||{};const parts=[ci.mood,ci.sleep,ci.pain].filter(v=>v!=null&&v!=='').length;
  const sup=supToday(),by=sup&&sup.by&&sup.by.length?sup.by:null;
  return [
    {k:'Doses',p:td.length?taken/td.length:1,done:td.length>0&&taken===td.length,c:'var(--ring-dose)',v:td.length?`${taken} of ${td.length} taken`:'None today',act:'jump-doses'},
    {k:'Check-in',p:ci.done?1:parts/3,done:parts===3||!!ci.done,c:'var(--ring-check)',v:parts===3||ci.done?'Done today':parts?`${parts} of 3 answered`:'Not done yet',go:'checkin'},
    {k:'Supervised',p:by?1:0,done:!!by,c:'var(--ring-social)',v:by?'By '+by.join(', '):'Not recorded yet',go:'checkin'}];
}
function circlesCard(){return `<div class="card circlescard"><div class="circles">${todayRings().map(r=>`<button class="circ${r.done?' done':''}" ${r.act?`data-act="${r.act}"`:`data-go="${r.go}"`} aria-label="${r.k}: ${esc(r.v)}">${circleSVG(r.p,r.done,r.c)}<b>${r.k}</b><span>${esc(r.v)}</span></button>`).join('')}</div></div>`}
function circleSVG(p,done,color){const r=30,c=2*Math.PI*r;return `<svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--ring-track)" stroke-width="8"/><circle cx="38" cy="38" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(c*Math.max(p,.001)).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 38 38)"/>${done?`<path d="M26 39l8 8 16-17" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`:`<text x="38" y="44" text-anchor="middle" class="ctxt">${Math.round(p*100)}%</text>`}</svg>`}
function prnLogs(){const day=state.doses[T]||{},q=(state.prnQty||{})[T]||{};return Object.keys(day).filter(k=>k.includes(':prn:')&&day[k]==='taken').map(k=>{const m=state.meds.find(x=>x.id===k.split(':')[0]);return m?{k,m,t:k.split(':prn:')[1].slice(0,5),n:q[k]||m.dosePerTake||1,mg:((state.prnMg||{})[T]||{})[k]||m.strength}:null}).filter(Boolean)}
const unitWord=(m,n)=>{const f=String(m.form||'Tablet').toLowerCase();const w=f==='liquid'?'spoonful':f==='inhaler'?'puff':f==='cream'?'application':f==='drops'?'drop':f;return n+' '+w+(n>1&&!/s$/.test(w)?'s':'')};
const totalStrength=(m,n)=>{const x=String(m.strength||'').match(/([\d.]+)\s*(mg|mcg|g|ml)/i);return x?(+x[1]*n)+' '+x[2]+' in total':''};
function timeline(){
  const td=todayDoses(),prn=prnLogs();if(!td.length&&!prn.length)return '<div class="empty">No medicines scheduled for today.</div>';
  const rows=SLOTS.filter(s=>td.some(d=>d.slot===s.k)).map(s=>({t:slotT(s.k),lbl:s.l,items:td.filter(d=>d.slot===s.k)})).concat(prn.map(p=>({t:p.t,lbl:'When needed',prn:p})));
  rows.sort((a,b)=>minsOf(a.t)-minsOf(b.t));
  const name=(m,n)=>`<b>${esc(m.name)} ${esc(m.strength)} \u00b7 ${esc(unitWord(m,n))}</b>`;
  return `<div class="tl">${rows.map(r=>{const [h,mi]=r.t.split(':').map(Number);let st,body;
    if(r.prn){st='taken';body=`<div class="tl-med taken"><span class="pic">${pillSVG(r.prn.m,26)}</span><span class="nm"><b>${esc(r.prn.m.name)} ${esc(r.prn.mg)} \u00b7 ${esc(unitWord(r.prn.m,r.prn.n))}</b><small>Taken when needed${r.prn.m.reason?' \u00b7 for '+esc(r.prn.m.reason.toLowerCase()):''}</small></span><span class="chip ok">Taken ${clock(r.t)}</span><button class="btn sm ghost" data-act="prn-undo" data-k="${r.prn.k}">Undo</button></div>`}
    else{const it=r.items;st=it.every(d=>d.status==='taken')?'taken':it.some(d=>d.status==='skipped')&&it.every(d=>d.status!=='due')?'skipped':minsOf(r.t)<nowMins()-30?'late':'due';
      body=it.map(d=>`<div class="tl-med ${d.status}"><span class="pic">${pillSVG(d.m,26)}</span><span class="nm">${name(d.m,d.m.dosePerTake||1)}<small>${esc(d.m.withFood)}${d.m.reason?' \u00b7 for '+esc(d.m.reason.toLowerCase()):''}</small></span>${d.status==='due'?`${cdSpan(d.slot,d.status)}${isDueNow(d.slot)?`<span class="actions"><button class="btn sm primary" data-act="dose" data-k="${d.key}" data-s="taken">Taken</button><button class="btn sm" data-act="dose" data-k="${d.key}" data-s="skipped">Skipped</button></span>`:`<label class="earlytick" data-unlock="${slotT(d.slot)}"><input type="checkbox" data-act="dose" data-k="${d.key}" data-s="taken" data-early="1"> Taken early</label>`}`:`<span class="chip ${d.status==='taken'?'ok':'crit'}">${d.status==='taken'?'Taken'+((state.doseTimes[T]||{})[d.key]?' '+clock(state.doseTimes[T][d.key]):''):'Skipped'}</span><button class="btn sm ghost" data-act="dose" data-k="${d.key}" data-s="undo">Undo</button>`}</div>`).join('')}
    return `<div class="tl-row"><div class="tl-time"><b>${(h%12||12)}:${pad(mi)}</b><span>${h<12?'am':'pm'} \u00b7 ${r.lbl}</span></div><div class="tl-rail"><span class="tl-dot ${st}"></span></div><div class="tl-body">${body}</div></div>`}).join('')}</div>`;
}
/* The single most important safety finding, drawn as its chain, at the top of Today */
/* What a chain points to when no follow-on medicine exists yet: the medicine it works against, or the one usually added next */
function ghostLabel(c){const has=hasAny(c.rule.to).find(m=>m.id!==c.a.id);if(has)return 'works against '+has.name;const toLbl=c.rule.to.map(t=>TO_LABEL[t]).filter(Boolean)[0];return toLbl?'risk: '+toLbl+' added next':'watch closely'}
function chainNodes(c){
  return `<div class="chain"><span class="node">${esc(c.a.name)}</span><span class="arr">\u2192</span><span class="eff">${esc(c.rule.effect)}</span><span class="arr">\u2192</span>${c.b?`<span class="node">${esc(c.b.name)}</span>`:`<span class="node ghost">${esc(ghostLabel(c))}</span>`}</div>`}
/* Link chains end to end (A causes X, treated with B; B causes Y...) so each lane is one whole cascade */
function cascadePaths(){
  const ch=chains().filter(c=>c.status!=='Dismissed'),used=new Set(),paths=[];
  const next=c=>c.b?ch.find(x=>x.a.id===c.b.id&&!used.has(x.id)):null;
  const starts=ch.filter(c=>!ch.some(x=>x.b&&x.b.id===c.a.id));
  [...starts,...ch].forEach(c=>{if(used.has(c.id))return;const p=[];let cur=c;while(cur&&!used.has(cur.id)){used.add(cur.id);p.push(cur);cur=next(cur)}paths.push(p)});
  // Unprescribed medicines first (no doctor knows about them), then the strongest evidence
  const score=p=>(p.some(c=>c.a.source!=='Prescribed')?100:0)+p.filter(c=>c.sev==='crit').length*10+p.reduce((n,c)=>n+c.ev.length,0);
  return paths.sort((x,y)=>score(y)-score(x));
}
function cascadeMap(){
  const paths=cascadePaths();if(!paths.length)return '';
  const tw=(t,px)=>Math.round(String(t).length*px);
  const LH=112,PAD=18,NH=42;let maxW=0;
  const lanes=paths.map((p,li)=>{
    const y0=PAD+li*LH,cy=y0+44;let x=PAD,g='';
    const node=(label,sub,ghost)=>{const w=Math.max(96,tw(label,8.6)+34);
      g+=`<rect x="${x}" y="${cy-NH/2}" width="${w}" height="${NH}" rx="21" class="${ghost?'m-ghost':'m-node'}"/><text x="${x+w/2}" y="${cy+5}" text-anchor="middle" class="${ghost?'m-gtxt':'m-ntxt'}">${esc(label)}</text>`;
      if(sub)g+=`<text x="${x+w/2}" y="${cy+NH/2+16}" text-anchor="middle" class="m-sub">${esc(sub)}</text>`;x+=w};
    const edge=(c)=>{const w=Math.max(150,tw(c.rule.effect,7.2)+44),cls=c.strength==='Likely'?'m-crit':'m-warn';
      g+=`<line x1="${x+4}" y1="${cy}" x2="${x+w-10}" y2="${cy}" class="m-edge ${cls}"/><path d="M${x+w-12},${cy-6} L${x+w-2},${cy} L${x+w-12},${cy+6}z" class="m-head ${cls}"/><text x="${x+w/2}" y="${cy-10}" text-anchor="middle" class="m-eff ${cls}">${esc(c.rule.effect)}</text>`;x+=w};
    const sub=m=>m.source!=='Prescribed'?m.source.toLowerCase():'started '+ago(m.start);
    node(p[0].a.name,sub(p[0].a));
    p.forEach(c=>{edge(c);if(c.b)node(c.b.name,sub(c.b));else node(ghostLabel(c),'what usually follows',true)});
    const n=p.length;g=`<text x="${PAD}" y="${y0+6}" class="m-lane">Cascade ${li+1} \u00b7 ${n} step${n>1?'s':''} \u00b7 ${p.some(c=>c.strength==='Likely')?'likely':'possible'}</text>`+g;
    maxW=Math.max(maxW,x+PAD);return g});
  const H=PAD+paths.length*LH;
  return `<div class="card" id="cascadeMap"><h2>Cascade map <span class="chip ${paths.length?'crit':'plain'}">${paths.length} cascade${paths.length===1?'':'s'}</span></h2>
   <div class="chartbox mapbox"><svg viewBox="0 0 ${maxW} ${H}" style="min-width:${Math.min(maxW,720)}px" role="img" aria-label="${esc(paths.map(p=>p.map(c=>c.a.name+' causes '+c.rule.effect).join(', then ')).join('. '))}">${lanes.join('')}</svg></div>
   <div class="legend"><span><i style="background:var(--crit)"></i>Likely link</span><span><i style="background:var(--warn)"></i>Possible link</span><span><i style="border:1.5px dashed var(--muted);height:10px;width:16px;background:none"></i>What usually happens next</span></div></div>`;
}
function fdaLine(c){const f=fdaSignal(c.a,c.rule.sym);return f?`<div class="fdasig"><span class="tag">openFDA \u00b7 context</span><span>${nf(f.n)} voluntary reports of ${esc(f.term)} in people over 65 taking ${esc(cap(f.drug))}. Shows the pattern is known, not how often it happens or that it happened to ${esc(state.patient.short)}.</span></div>`:''}
