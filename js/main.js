/* ================= events ================= */
document.addEventListener('click',e=>{
  const dm=e.target.closest('[data-demo]');if(dm){demoCmd(dm.dataset.demo);return}
  if(e.target.closest('[data-act="demo-start"]')){demoStart();return}
  const sh=e.target.closest('[data-sheet]');if(sh){openSheet(sh.dataset.sheet,{vt:sh.dataset.vt});return}
  if(e.target.id==='overlay'&&window.__sheet){closeOverlay();render();return}
  const pk=e.target.closest('[data-pin]');if(pk){const k=pk.dataset.pin;if(k==='\u232b')window.__pin=window.__pin.slice(0,-1);else if(window.__pin.length<4)window.__pin+=k;
    if(window.__pin.length===4){if(window.__pin===state.prefs.elder.pin){closeOverlay();setApp('family');return}window.__pin='';toast('That PIN is not right. Try again.')}
    $('overlay').innerHTML=window.__pinDraw();return}
  const eb=e.target.closest('[data-e]');if(eb){const a=eb.dataset.e;
    if(a==='talk')eStart();else if(a==='home'){ev='home';talk.recording=false;talk.typing=false;talk.typingFor=null;talk.listening=false;try{if(rec)rec.abort()}catch(x){}}else if(a==='meds')ev='meds';
    else if(a==='taken'){if(!isDueNow(eb.dataset.slot)){toast('Not time yet. Take it at '+clock(slotT(eb.dataset.slot))+'.');return}slotTaken(eb.dataset.slot);save();if(state.prefs.sound)speak('Well done, '+state.patient.short+'. I have ticked that off.',true);toast('Well done!')}
    else if(a==='call'){callOverlay();return}else if(a==='help'){helpOverlay();return}
    else if(a==='play'){speak(eb.dataset.t,true);return}else if(a==='repeat'){speak(talk.say,true);return}
    else if(a==='stopmic'){try{if(rec)rec.stop();else talk.listening=false}catch(x){talk.listening=false}if(talk.listening)return}else if(a==='untype'){talk.typing=false;talk.typingFor=null}else if(a==='unrec'){talk.recording=false}else if(a==='family'){openFamily();return}
    else if(a==='ans'){eAnswer(eb.dataset.k,eb.dataset.l);return}
    renderElder();window.scrollTo({top:0});return}
  const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}
  const md=e.target.closest('[data-mode]');if(md){state.prefs.mode=md.dataset.mode;section=md.dataset.mode==='simple'?'simple':'overview';commit(md.dataset.mode==='simple'?'Simple view: large buttons for '+state.patient.short:'Family view');return}
  const sz=e.target.closest('[data-size]');if(sz){state.prefs.scale=Math.round(Math.min(1.4,Math.max(.9,(state.prefs.scale||1)+(+sz.dataset.size)*.1))*10)/10;commit('Text size '+Math.round(state.prefs.scale*100)+'%');return}
  const rmb=e.target.closest('[data-rm]');if(rmb){const sl=rmb.dataset.slot,rm=state.remind[T]=state.remind[T]||{};const a=rmb.dataset.rm;
    if(a==='taken'){if(!isDueNow(sl)){closeOverlay();toast('This is a preview. The dose is not due until '+clock(slotT(sl))+'.');return}slotTaken(sl);closeOverlay();commit('Doses recorded. Well done!')}
    else if(a==='snooze'){rm[sl]=Object.assign({},rm[sl],{snoozeUntil:nowMins()+state.prefs.snooze});closeOverlay();commit('I\'ll remind you again in '+state.prefs.snooze+' minutes')}
    else if(a==='skip'){todayDoses().filter(d=>d.slot===sl&&d.status==='due').forEach(d=>{state.doses[T][d.key]='skipped'});rm[sl]=Object.assign({},rm[sl],{dismissed:true});closeOverlay();commit('Marked as skipped')}
    else if(a==='help-yes'){const fam=famContact();state.events.push({sev:'crit',title:'Help requested',text:`${state.patient.short} pressed "I need help" at ${hm()}.`,ts:T+' '+hm()});state.family.feed.push({from:'EchoCare',text:`URGENT: ${state.patient.short} pressed "I need help". Please call her now.`,ts:T+' '+hm()});save();
      showOverlay(`<div class="remind" role="alertdialog" aria-modal="true"><h2>${esc(fam?fam.name.split(' ')[0]:'Your family')} has been told</h2><p style="font-size:19px;margin:0">If you feel you might pass out, or you can't manage, call <b>995</b>.</p>${fam?`<p style="font-size:17px;margin:0">${esc(fam.name)}: <span class="mono" style="font-size:22px;user-select:all">${esc(fam.phone)}</span></p>`:''}
       ${fam&&fam.phone?`<a class="btn big dangerfill" href="${esc(telHref(fam.phone))}">Ring ${esc(fam.name.split(' ')[0])} now</a>`:''}
       <p class="small muted" style="margin:0">${circleId?'Family with EchoCare open get an alarm right now.':'Family sees this the next time they open EchoCare.'}</p><button class="btn primary big" data-rm="close">OK</button></div>`);speak('Your family has been told. If you feel you might pass out, or you can not manage, call 9 9 5.',true);renderNav()}
    else if(a==='close'){closeOverlay();render()}
    return}
  const s=e.target.closest('[data-say]');if(s){sendChat(s.dataset.say);return}
  const b=e.target.closest('[data-act]');if(!b)return;const act=b.dataset.act,id=b.dataset.id;
  const twoStep=(fn)=>{if(window.__del===id){window.__del=null;fn()}else{window.__del=id;render()}};
  switch(act){
    case 'dose':{if(b.dataset.s!=='undo'&&!b.dataset.early&&!isDueNow(b.dataset.k.split(':')[1])){toast('Not time yet. This dose can be ticked from '+clock(slotT(b.dataset.k.split(':')[1]))+'.');break}state.doses[T]=state.doses[T]||{};const k=b.dataset.k,m=state.meds.find(x=>x.id===k.split(':')[0]);const was=state.doses[T][k];
      if(b.dataset.s==='undo'){if(was==='taken'&&m)m.qty+=m.dosePerTake||1;delete state.doses[T][k];if(state.doseTimes[T])delete state.doseTimes[T][k];const rm=(state.remind[T]||{})[k.split(':')[1]];if(rm){rm.dismissed=false;rm.shown=null;rm.snoozeUntil=null}}else if(b.dataset.s==='taken')markTaken(m,k);else state.doses[T][k]='skipped';
      commit(b.dataset.s==='taken'?'Dose recorded':b.dataset.s==='skipped'?'Marked as skipped':'Undone');break}
    case 'prn':prnPrompt(state.meds.find(x=>x.id===id));break;
    case 'prn-old':{const m=state.meds.find(x=>x.id===id);state.doses[T]=state.doses[T]||{};state.doses[T][m.id+':prn:'+hm()]='taken';m.qty=Math.max(0,m.qty-(m.dosePerTake||1));commit(m.name+' dose logged');break}
    case 'to-elder':setApp('elder');break;
    case 'slot-taken':if(!isDueNow(b.dataset.slot)){toast('Not time yet.');break}slotTaken(b.dataset.slot);commit('Doses recorded. Well done!');break;
    case 'test-remind':showReminder(b.dataset.slot,true);break;
    case 'help':showOverlay(`<div class="remind" role="alertdialog" aria-modal="true" aria-labelledby="hT"><div class="bell" style="background:var(--crit-soft);color:var(--crit)">${IC.help}</div><h2 id="hT">Do you need help?</h2><p style="font-size:18px;margin:0">This will send an urgent message to your family.</p><button class="btn big" data-rm="help-yes" style="background:var(--crit);border-color:var(--crit);color:#fff">Yes, tell my family</button><button class="btn big" data-rm="close">No, go back</button></div>`);break;
    case 'call-fam':{const f=famContact();showOverlay(`<div class="remind" role="dialog" aria-modal="true"><div class="bell">${IC.phone}</div><h2>Call ${esc(f?f.name:'family')}</h2><p class="mono" style="font-size:30px;margin:0;user-select:all">${esc(f?f.phone:'No number saved')}</p><p class="small muted" style="margin:0">On the phone app this button rings ${esc(f?f.name.split(' ')[0]:'them')} straight away.</p><button class="btn primary big" data-rm="close">Close</button></div>`);break}
    case 'read-msg':speak(b.dataset.t,true);break;
    case 'refill':{const m=state.meds.find(x=>x.id===id);m.qty+=30;commit('Quantity updated');break}
    case 'med-edit':window.__editMed=id;photoResult=null;openSheet('med');break;
    case 'cancel-edit':case 'sheet-close':closeOverlay();render();break;
    case 'add-menu':openAddMenu();break;
    case 'med-stop':{const m=state.meds.find(x=>x.id===id);if(m.stopped){m.stopped=false;commit(m.name+' restarted');break}confirmBox('Mark '+m.name+' as stopped?','It stays in her record for the doctor, but leaves her schedule and reminders.','med-stop-yes',id,'Yes, mark stopped');break}
    case 'med-del':{const m=state.meds.find(x=>x.id===id);confirmBox('Remove '+m.name+' completely?','This deletes the medicine and its history and cannot be undone. If she has just stopped taking it, use Mark stopped instead.','med-del-yes',id,'Yes, remove',true);break}
    case 'med-stop-yes':{const m=state.meds.find(x=>x.id===id);m.stopped=true;closeOverlay();commit(m.name+' marked as stopped');break}
    case 'med-del-yes':{const m=state.meds.find(x=>x.id===id);state.meds=state.meds.filter(x=>x.id!==id);closeOverlay();commit((m?m.name:'Medicine')+' removed');break}
    case 'jump-doses':{const el=$('todayDoses');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});break}
    case 'prn-log':{const m=state.meds.find(x=>x.id===id),n=+(($('prnN')||{}).value||1),mg=(($('prnMg')||{}).value||m.strength),t=($('prnTime')&&$('prnTime').value)||hm();state.doses[T]=state.doses[T]||{};let k=m.id+':prn:'+t;while(state.doses[T][k])k+='x';state.doses[T][k]='taken';state.prnQty=state.prnQty||{};(state.prnQty[T]=state.prnQty[T]||{})[k]=n;state.prnMg=state.prnMg||{};(state.prnMg[T]=state.prnMg[T]||{})[k]=mg;m.qty=Math.max(0,(m.qty||0)-n);closeOverlay();commit('Logged '+unitWord(m,n)+' of '+m.name+' '+mg+' at '+clock(t));break}
    case 'prn-undo':{const k=b.dataset.k,m=state.meds.find(x=>x.id===k.split(':')[0]),n=((state.prnQty||{})[T]||{})[k]||(m&&m.dosePerTake)||1;delete state.doses[T][k];if(state.prnQty&&state.prnQty[T])delete state.prnQty[T][k];if(state.prnMg&&state.prnMg[T])delete state.prnMg[T][k];if(m)m.qty+=n;commit('Undone');break}
    case 'path-ask':{(cascadePaths()[+b.dataset.i]||[]).forEach(c=>{state.chains[c.id]=Object.assign({},state.chains[c.id],{status:'Ask doctor'})});commit('Added to the doctor memo');break}
    case 'path-dismiss':{const p=cascadePaths()[+b.dataset.i]||[];if(!p.length)break;state.hiddenNotes=state.hiddenNotes||[];
      state.hiddenNotes.push({id:uid(),title:cap(p[0].a.name)+' and '+p[p.length-1].rule.effect,ids:p.map(c=>c.id),prev:p.map(c=>(state.chains[c.id]||{}).status||'New'),ts:T+' '+hm()});
      p.forEach(c=>{state.chains[c.id]=Object.assign({},state.chains[c.id],{status:'Dismissed'})});commit('Note hidden. Undo it under Hidden, at the bottom of Notes.');break}
    case 'note-undo':{const h=(state.hiddenNotes||[]).find(x=>x.id===id);if(!h)break;h.ids.forEach((cid,i)=>{state.chains[cid]=Object.assign({},state.chains[cid],{status:h.prev[i]||'New'})});state.hiddenNotes=state.hiddenNotes.filter(x=>x.id!==id);commit('Note is back');break}
    case 'ai-sum':aiSummary();break;
    case 'pharm-reviewed':state.pharmReviewed=T;commit('Marked as reviewed today');break;
    case 'circle-new':{b.disabled=true;openCircle(newCode(),true).then(ok=>{if(ok)toast('Care circle started. Send the invite link to the family and to '+state.patient.short+'\'s phone.')});break}
    case 'circle-copy':copyText(joinLink(circleId),'Invite link copied');break;
    case 'circle-leave':twoStep(()=>{leaveCircle()});break;
    case 'join-elder':case 'join-family':{const c=window.__joinCode;closeOverlay();openCircle(c,false).then(ok=>{try{history.replaceState(null,'','#'+(act==='join-elder'?'elder':'family'))}catch(e){}if(ok){setApp(act==='join-elder'?'elder':'family');toast('Joined. This device now shares the live record.')}});break}
    case 'urgent-ack':{clearInterval(window.__urgRep);document.title='EchoCare Companion';closeOverlay();go('overview');break}
    case 'pharm-open':{const c=b.dataset.code;if(circleId)meData.pharm=[...new Set([...(meData.pharm||[]),circleId])];openCircle(c,false).then(ok=>{if(ok){go('memo');toast('Now viewing '+state.patient.short+'\'s record')}});break}
    case 'pharm-remove':{meData.pharm=(meData.pharm||[]).filter(x=>x!==b.dataset.code);saveMe({});pharmRows=pharmRows.filter(r=>r.code!==b.dataset.code);render();break}
    case 'memo-link':copyText(ARTIFACT_URL+'#memo','Link copied. The doctor also needs access: use the Share menu on this page.');break;
    case 'ai-clear':state.aiReview=null;commit('AI suggestions removed');break;
    case 'ci-edit':{const c=state.checkins.find(x=>x.date===T);if(c)c.done=false;render();break}
    case 'ci-undo':{const c=state.checkins.find(x=>x.date===T);if(!c)break;
      (c.symLog||[]).forEach(x=>{const r=state.symptoms.find(y=>y.id===x.id);if(!r)return;if(x.created)state.symptoms=state.symptoms.filter(y=>y.id!==x.id);else{const i=(r.mentions||[]).lastIndexOf(T);if(i>=0)r.mentions.splice(i,1)}});
      state.checkins=state.checkins.filter(x=>x.date!==T);if(state.supervision)delete state.supervision[T];commit("Today's check-in removed");break}
    case 'identify':identifyPhoto();break;
    case 'sym-again':{const s=state.symptoms.find(x=>x.id===id);s.mentions=s.mentions||[];if(s.mentions[s.mentions.length-1]!==T)s.mentions.push(T);commit('Noted for today');break}
    case 'sym-sev':{const s=state.symptoms.find(x=>x.id===id);const d=+b.dataset.d;s.severity=Math.min(10,Math.max(1,s.severity+d));s.trend=d>0?'Worse':'Better';commit();break}
    case 'sym-res':{const s=state.symptoms.find(x=>x.id===id);s.resolved=!s.resolved;commit(s.resolved?'Marked resolved':'Reopened');break}
    case 'sym-del':twoStep(()=>{state.symptoms=state.symptoms.filter(x=>x.id!==id);commit('Symptom removed')});break;
    case 'chain-note':{const v=$('cn_'+id).value.trim();state.chains[id]=Object.assign({},state.chains[id],{note:v});commit('Note saved');break}
    case 'ai-review':aiReview();break;
    case 'share':{const m=state.chat[+b.dataset.i];state.family.feed.push({from:state.patient.short+' (via EchoCare)',text:m.share,ts:T+' '+hm()});m.share=null;state.chat.push({who:'bot',text:`Shared with ${famName()}. They will be so happy to hear it!`,ts:hm()});commit('Shared with family');break}
    case 'con-del':twoStep(()=>{state.family.contacts=state.family.contacts.filter(x=>x.id!==id);commit('Contact removed')});break;
    case 'ap-del':twoStep(()=>{state.appts=state.appts.filter(x=>x.id!==id);commit('Appointment removed')});break;
    case 'memo-pdf':memoPdf();break;
    case 'copy-sheet':{const sd=$('sheetDoc');sd.classList.add('copying');const txt=sd.innerText;sd.classList.remove('copying');const sel=()=>{const r=document.createRange();r.selectNodeContents($('sheetDoc'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Selected. Press Ctrl+C or Cmd+C to copy.')};try{navigator.clipboard.writeText(txt).then(()=>toast('Copied'),sel)}catch(err){sel()}break}
    case 'photo-del':{const m=state.meds.find(x=>x.id===id);delete m.photo;commit('Back to the drawn pill');break}
    case 'chain-ask':state.chains[id]=Object.assign({},state.chains[id],{status:'Ask doctor'});commit('Added to the doctor\'s questions');break;
    case 'explain':explainMed(id);break;
    case 'explain-say':speak(explained[id]||'',true);break;
    case 'explain-send':{const m=state.meds.find(x=>x.id===id);state.family.feed.push({from:'EchoCare \u00b7 about '+m.name,text:explained[id],ts:T+' '+hm()});commit('Sent. It shows on '+state.patient.short+'\'s home screen with a Listen button');break}
    case 'refill-req':refillOverlay(state.meds.find(x=>x.id===id));break;
    case 'refill-copy':copyText($('rfTxt')?$('rfTxt').value:window.__refillTxt,'Message copied');break;
    case 'copy-digest':copyText(digest(),'Digest copied');break;
    case 'sheet-file':{const html='<!doctype html><meta charset="utf-8"><title>Doctor sheet</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 16px;color:#111}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ccc;padding:6px;text-align:left}.flagtxt{color:#b00;font-weight:700}.muted,.small{color:#555}</style>'+(()=>{const c=$('sheetDoc').cloneNode(true);c.querySelectorAll('.noprint').forEach(e=>e.remove());return c.outerHTML})();saveFile('Doctor sheet '+state.patient.short+' '+T+'.html',html);break}
    case 'reset-demo':state=seed();window.__editMed=null;photoResult=null;commit('Example patient restored');break;
    case 'start-empty':if(!window.__confirmEmpty){window.__confirmEmpty=true;render();break}window.__confirmEmpty=false;{const s=seed();state=Object.assign(s,{demo:false,doseTimes:{},remind:{},meds:[],symptoms:[],vitals:[],doses:{},checkins:[],speech:[],chains:{},reports:[],aiReview:null,events:[],appts:[],patient:{name:'My relative',short:'Mum',age:75,livesAlone:true,allergies:'',conditions:'Not recorded'},family:{contacts:[],share:s.family.share,feed:[]},chat:[{who:'bot',text:'Hello! I\'m EchoCare. How are you feeling today?',ts:hm()}]})}commit('Blank profile started');break;
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='ttsT'){window.__tts=t.checked;return}
  if(t.id==='eVoice'&&t.files&&t.files[0]){const key=uid();window.__audio=window.__audio||{};window.__audio[key]=URL.createObjectURL(t.files[0]);const n=state.patient.short;
    state.family.feed.push({from:n+' (voice message)',text:'Voice message from '+n,audio:key,ts:T+' '+hm()});state.chat.push({who:'me',text:'(voice message)',ts:hm()});
    talk.recording=false;talk.you='Voice message sent';eSay(`I've sent your voice message to ${famName()}. Is there anything else?`,'more');save();renderElder();return}
  if(t.id==='m_photo'&&t.files&&t.files[0]){photoFile=t.files[0];photoResult=null;const r=new FileReader();r.onload=()=>{window.__thumb=r.result;photoThumb(photoFile).then(u=>{window.__medThumb=u;render()},()=>render())};r.readAsDataURL(photoFile);return}
  if(t.dataset&&t.dataset.medphoto&&t.files&&t.files[0]){const m=state.meds.find(x=>x.id===t.dataset.medphoto);photoThumb(t.files[0]).then(u=>{m.photo=u;commit('Photo saved. '+state.patient.short+' now sees her real tablet')},()=>toast('That photo could not be read. Try a JPEG or PNG.'));return}
  if(t.id==='s_key'){$('s_otherWrap').hidden=t.value!=='other';if(t.value==='other')setTimeout(()=>$('s_other')&&$('s_other').focus(),30);const a=SYMK[t.value]&&SYMK[t.value].area;if(a)$('s_area').value=a;if(SYMK[t.value]&&SYMK[t.value].emer)toast(t.value==='faint'?'If the faint feeling does not pass, call 995.':'This can be an emergency. Call 995 now.');return}
  if(t.id==='v_type'){document.querySelectorAll('[data-vt]').forEach(el=>el.hidden=!el.dataset.vt.split(',').includes(t.value));$('v_valueL').textContent={glucose:'Blood sugar (mmol/L)',weight:'Weight (kg)',temp:'Temperature (\u00b0C)',pulse:'Pulse (beats per minute)'}[t.value]||'Value';return}
  if(t.classList.contains('chainStatus')){state.chains[t.dataset.chain]=Object.assign({},state.chains[t.dataset.chain],{status:t.value});commit('Status updated');return}
  if(t.classList.contains('shareT')){state.family.share[t.dataset.k]=t.checked;commit();return}
});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='c_cc')phoneHint();if(t.name==='ci_sym'&&t.checked&&$('ci_symnone'))$('ci_symnone').checked=false;if(t.id==='ci_symnone'&&t.checked)document.querySelectorAll('input[name=ci_sym]').forEach(x=>x.checked=false);if(t.closest&&t.closest('#checkForm'))ciValidate()});
document.addEventListener('input',e=>{if(e.target.id==='c_phone')phoneHint();if(e.target.closest&&e.target.closest('#checkForm'))ciValidate()});
document.addEventListener('change',e=>{if(e.target.id==='prnN'||e.target.id==='prnMg'){const t=$('prnTotal');if(t)t.textContent=prnTotalText()}});
document.addEventListener('input',e=>{if(e.target.id==='s_sev')$('s_sevOut').textContent=e.target.value+' / 10'});
document.addEventListener('submit',e=>{
  e.preventDefault();const f=e.target.id;
  if(f==='eType'){const v=$('eIn').value.trim();if(talk.typingFor==='family'){if(!v)return;talk.typingFor=null;talk.you=v;state.chat.push({who:'me',text:v,ts:hm()});state.family.feed.push({from:state.patient.short+' (in her own words)',text:v,ts:T+' '+hm()});eSay(`Sent to ${famName()}: "${v}". Is there anything else?`,'more');save();renderElder();return}eFree(v);return}
  if(f==='eaForm'){const E=state.prefs.elder;const nm=$('ea_name').value.trim();if(nm)state.patient.short=nm;E.lang=$('ea_lang').value;E.escale=+$('ea_size').value;E.rate=+$('ea_rate').value;state.prefs.sound=$('ea_sound').checked;
    ['showNames','showAppt','showTalk','showCall','showHelp','showMessages','showAllMeds','lock'].forEach(k=>{E[k]=$('ea_'+k).checked});E.callId=$('ea_call').value||null;
    const pin=$('ea_pin').value.trim();if(/^\d{4}$/.test(pin))E.pin=pin;else{toast('The PIN must be 4 digits.');return}
    commit('Saved. Her app is updated');return}
  if(f==='circleJoin'){const c=cleanCode($('circleCode').value);openCircle(c,false).then(ok=>{if(ok)toast('Joined the care circle')});return}
  if(f==='pharmAdd'){const c=cleanCode($('pharmCode').value);if(c.length<6){toast('Enter the 8-character care-circle code.');return}if(!db){toast('Sign in to Claude to add patients.');return}
    db.doc('circles/'+c).get().then(s=>{if(!s.exists){toast('No care circle with that code.');return}meData.pharm=[...new Set([...(meData.pharm||[]),c])];saveMe({});loadPharm();toast('Patient added')},()=>toast('Could not reach that care circle.'));return}
  if(f==='chatForm'){const v=$('chatIn').value;$('chatIn').value='';sendChat(v);return}
  if(f==='medForm'){
    const name=$('m_name').value.trim();if(!name)return;const slots=[...document.querySelectorAll('input[name=m_slot]:checked')].map(x=>x.value);const prn=$('m_prn').checked||!slots.length;
    const c=classify(name,window.__photoIng);
    const o={name:cap(name),strength:$('m_strength').value.trim(),form:$('m_form').value,qty:+$('m_qty').value||0,dosePerTake:+$('m_dose').value||1,slots:prn&&!slots.length?[]:slots,prn:prn&&!slots.length,withFood:$('m_food').value,color:$('m_color').value,shape:$('m_shape').value,start:$('m_start').value||T,source:$('m_source').value,reason:$('m_reason').value.trim(),prescriber:$('m_pres').value.trim(),notes:$('m_notes').value.trim(),cls:c.cls,ing:c.ing};
    if(window.__medThumb&&$('m_usephoto')&&$('m_usephoto').checked)o.photo=window.__medThumb;
    if(!window.__editMed&&window.__preOK!==o.name.toLowerCase()){const w=preCheck(o);if(w.length){window.__preOK=o.name.toLowerCase();const box=$('preWarn');if(box){box.innerHTML=`<b>Before she takes ${esc(o.name)}</b><ul>${w.map(x=>`<li>${x}</li>`).join('')}</ul><span>Check with her pharmacist or doctor before starting. You can still add it.</span>`;box.hidden=false;box.scrollIntoView({block:'nearest'})}const sb=$('medForm').querySelector('.formfoot .btn.primary');if(sb)sb.textContent='Add anyway';return}}
    window.__preOK=null;
    let msg;if(window.__editMed){const m=state.meds.find(x=>x.id===window.__editMed);Object.assign(m,o,{unconfirmed:false});msg='Medicine updated'}
    else{state.meds.push(Object.assign({id:uid(),via:photoResult&&photoResult.identified?'Photo (AI)':'Typed',unconfirmed:false,stopped:false},o));msg='Medicine added'}
    window.__editMed=null;photoFile=null;photoResult=null;window.__thumb=null;window.__photoIng=null;window.__medThumb=null;
    const warn=interactions().filter(i=>i.text.includes(o.name)).length+chains().filter(x=>x.a.name===o.name||(x.b&&x.b.name===o.name)).length;
    commit(warn?msg+'. '+warn+' safety finding'+(warn>1?'s':'')+' to review':msg);return}
  if(f==='symForm'){
    const key=$('s_key').value;if(key==='other'&&!$('s_other').value.trim()){toast('Type the symptom first.');$('s_other').focus();return}const label=key==='other'?cap($('s_other').value.trim()):SYMK[key].label;
    state.symptoms.push({id:uid(),key,label,area:$('s_area').value,severity:+$('s_sev').value,start:$('s_start').value||T,freq:$('s_freq').value,time:$('s_time').value,trend:$('s_trend').value,notes:$('s_notes').value.trim(),source:$('s_by').value===state.patient.short?'Typed':$('s_by').value,resolved:false,mentions:[$('s_start').value||T]});
    const after=$('s_after').value;if(after)state.reports.push({id:uid(),medId:after,key,label,date:$('s_start').value||T,note:'Logged with symptom'});
    if(SYMK[key]&&SYMK[key].emer)state.events.push({sev:'crit',title:'Emergency symptom logged',text:label+(key==='faint'?'. If it does not pass, call 995.':'. Call 995.'),ts:T+' '+hm()});
    const n=chains().filter(c=>c.rule.sym.includes(key)).length;commit(n?'Saved. Possible medicine link found':'Symptom saved');return}
  if(f==='repForm'){const m=$('r_med').value,k=$('r_key').value;state.reports.push({id:uid(),medId:m,key:k,label:SYMK[k].label,date:$('r_date').value||T,note:($('r_note').value.trim()||SYMK[k].label)+' (by '+$('r_by').value.toLowerCase()+')'});
    const has=chains().some(c=>c.a.id===m&&c.rule.sym.includes(k));commit(has?'Report added to a side-effect chain':'Report saved. No known pattern for this pair yet');return}
  if(f==='ciForm'){const mood=document.querySelector('input[name=ci_mood]:checked');const talk=document.querySelector('input[name=ci_talk]:checked');
    let c=state.checkins.find(x=>x.date===T);if(!c){c={date:T};state.checkins.push(c)}
    Object.assign(c,{mood:mood?+mood.value:c.mood||null,sleep:$('ci_sleep').value===''?null:+$('ci_sleep').value,pain:$('ci_pain').value===''?null:+$('ci_pain').value,appetite:$('ci_app').value,talked:talk?talk.value==='yes':!!c.talked,note:$('ci_note').value.trim()});
    if(c.talked===false&&c.mood&&c.mood<=2)state.family.feed.push({from:'EchoCare',text:state.patient.short+' is feeling low and has not talked with anyone today. A call would help.',ts:T+' '+hm()});
    commit('Check-in saved');return}
  if(f==='remForm'){const pf=state.prefs,rm=state.remind[T]=state.remind[T]||{};SLOTS.forEach(s=>{const v=$('rt_'+s.k).value;if(v&&v!==pf.slotTimes[s.k]){pf.slotTimes[s.k]=v;rm[s.k]={}}});pf.snooze=+$('rt_snooze').value;pf.reminders=$('rt_on').checked;pf.sound=$('rt_sound').checked;pf.wake=!!($('rt_wake')&&$('rt_wake').checked);commit('Reminder times saved');return}
  if(f==='checkForm'){const miss=ciMissing();if(miss.length){ciValidate();toast('Please answer '+miss.join(', ')+'.');return}const mood=document.querySelector('input[name=ci_mood]:checked');
    let c=state.checkins.find(x=>x.date===T);if(!c){c={date:T};state.checkins.push(c)}
    const by=[...document.querySelectorAll('input[name=ci_sup]:checked')].map(x=>x.value);const o=$('ci_supOther').value.trim();if(o)by.push(o);
    Object.assign(c,{mood:mood?+mood.value:c.mood||null,sleep:$('ci_sleep').value===''?null:+$('ci_sleep').value,pain:$('ci_pain').value===''?null:+$('ci_pain').value,appetite:$('ci_app').value,note:$('ci_note').value.trim(),talked:by.length?true:!!c.talked});
    state.supervision=state.supervision||{};if(by.length)state.supervision[T]={by,at:hm()};else delete state.supervision[T];
    const syms=[...document.querySelectorAll('input[name=ci_sym]:checked')].map(x=>x.value);c.symLog=(c.symLog||[]).concat(syms.map(k=>logSymptom(k,'Check-in')).filter(x=>x.added));c.done=true;c.at=hm();
    commit('Check-in saved'+(syms.length?'. '+syms.length+' symptom'+(syms.length>1?'s':'')+' added':''));return}
  if(f==='profForm'){const p=state.patient,nm=$('p_name').value.trim();if(!nm){toast('Enter her name.');return}p.name=nm;p.short=$('p_short').value.trim()||nm.split(' ')[0];p.age=+$('p_age').value||p.age;p.livesAlone=$('p_alone').checked;p.pronoun=$('p_pron').value;p.phone=$('p_phone').value.trim();p.conditions=$('p_cond').value.trim();p.allergies=$('p_all').value.trim();commit('Profile saved');return}
  if(f==='conForm'){const n=$('c_name').value.trim();if(!n){toast('Enter their name.');return}const ph=phoneCheck($('c_cc').value,$('c_phone').value);if(!ph.ok){phoneHint();toast(ph.msg);$('c_phone').focus();return}state.family.contacts.push({id:uid(),name:n,relation:$('c_rel').value,phone:ph.full,notify:$('c_notify').value});commit(n+' added');return}
  if(f==='apForm'){state.appts.push({id:uid(),date:$('a_date').value,time:$('a_time').value,with:$('a_with').value.trim(),place:$('a_place').value.trim(),purpose:$('a_purpose').value.trim()});commit('Appointment added');return}
});

function setApp(a){APP=a;try{history.replaceState(null,'','#'+a)}catch(e){}closeOverlay();if(a==='elder')ev='home';else section='overview';render();window.scrollTo({top:0})}
window.addEventListener('hashchange',()=>{if(location.hash==='#demo'){demoStart();return}{const j=location.hash.match(/^#join-([A-Za-z0-9]{6,12})$/);if(j){askJoin(j[1]);return}}if(location.hash==='#memo'){APP='family';section='memo';render();return}const want=location.hash==='#family'?'family':'elder';if(want!==APP){APP=want;closeOverlay();if(APP==='elder')ev='home';else section='overview';render();window.scrollTo({top:0})}});
render();initCloud();initAI();
if(location.hash==='#demo')demoStart();
if(location.hash==='#memo'){section='memo';render()}
setTimeout(tick,3500);setInterval(tick,20000);
