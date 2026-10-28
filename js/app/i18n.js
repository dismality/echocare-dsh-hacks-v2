/* ================= whole-app language =================
   One setting (Settings > Guardian) switches every screen to English, Mandarin, Malay or Tamil. The screens are still
   written in English: after each render, text and labels that match a phrase in UIS (js/data/ui-strings.js) are swapped
   for the chosen language, and switched back for English. Names and numbers are placeholders, so one phrase covers any
   patient and any count. Anything typed in, and phrases with no translation yet, stay as they are.
   The choice is kept on this device, so it survives a refresh even on the demo website. */
const UI_LANG_KEY='echocare.uiLang';
const UI_COL={English:0,Mandarin:1,Malay:2,Tamil:3};
const UI_NAMES={English:'English',Mandarin:'\u4e2d\u6587 (Mandarin)',Malay:'Bahasa Melayu (Malay)',Tamil:'\u0ba4\u0bae\u0bbf\u0bb4\u0bcd (Tamil)'};
const UI_HTMLLANG={English:'en',Mandarin:'zh-Hans',Malay:'ms',Tamil:'ta'};
let uiLang=(()=>{try{const l=localStorage.getItem(UI_LANG_KEY);return UI_COL[l]!==undefined?l:'English'}catch(e){return 'English'}})();
const UIMAP=new Map(UIS.map(r=>[r[0],r]));
const UIX=UIS.filter(r=>r[0].includes('{x}')).map(r=>[new RegExp('^'+r[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace('\\{x\\}','([^.]+?)')+'$'),r]);

/* the patient's and main family contact's names become {full} {n} {fam} {f} while looking a phrase up */
function uiTokens(){const p=state.patient||{},fam=(state.family&&state.family.contacts||[]).find(c=>!/GP|Pharmacist/.test(c.relation))||{};
  return [['{full}',p.name],['{n}',p.short],['{fam}',fam.name],['{f}',(fam.name||'').split(' ')[0]]].filter(([,v])=>v&&v.length>1)}
/* dates and times, e.g. "Today, Wed 28 Oct", "Since 3 Oct 2026 (25 days ago)", "Tue 3 Nov, 10:30 am" */
const UI_WD={Mon:['\u5468\u4e00','Isnin','\u0ba4\u0bbf\u0b99\u0bcd\u0b95\u0bb3\u0bcd'],Tue:['\u5468\u4e8c','Selasa','\u0b9a\u0bc6\u0bb5\u0bcd\u0bb5\u0bbe\u0baf\u0bcd'],Wed:['\u5468\u4e09','Rabu','\u0baa\u0bc1\u0ba4\u0ba9\u0bcd'],Thu:['\u5468\u56db','Khamis','\u0bb5\u0bbf\u0baf\u0bbe\u0bb4\u0ba9\u0bcd'],Fri:['\u5468\u4e94','Jumaat','\u0bb5\u0bc6\u0bb3\u0bcd\u0bb3\u0bbf'],Sat:['\u5468\u516d','Sabtu','\u0b9a\u0ba9\u0bbf'],Sun:['\u5468\u65e5','Ahad','\u0b9e\u0bbe\u0baf\u0bbf\u0bb1\u0bc1']};
const UI_MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const UI_MO_MS=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const UI_MO_TA=['\u0b9c\u0ba9\u0bb5\u0bb0\u0bbf','\u0baa\u0bbf\u0baa\u0bcd\u0bb0\u0bb5\u0bb0\u0bbf','\u0bae\u0bbe\u0bb0\u0bcd\u0b9a\u0bcd','\u0b8f\u0baa\u0bcd\u0bb0\u0bb2\u0bcd','\u0bae\u0bc7','\u0b9c\u0bc2\u0ba9\u0bcd','\u0b9c\u0bc2\u0bb2\u0bc8','\u0b86\u0b95\u0bb8\u0bcd\u0b9f\u0bcd','\u0b9a\u0bc6\u0baa\u0bcd\u0b9f\u0bae\u0bcd\u0baa\u0bb0\u0bcd','\u0b85\u0b95\u0bcd\u0b9f\u0bcb\u0baa\u0bb0\u0bcd','\u0ba8\u0bb5\u0bae\u0bcd\u0baa\u0bb0\u0bcd','\u0b9f\u0bbf\u0b9a\u0bae\u0bcd\u0baa\u0bb0\u0bcd'];
const UI_DATE=/^(?:(Today), )?(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,? )?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?: (\d{4}))?(?:,? (\d{1,2}(?::\d{2})?)(?: ?(am|pm))?)?$/;
function uiTime(t,ap,col){if(!ap)return t;return col===1?(ap==='am'?'\u4e0a\u5348':'\u4e0b\u5348')+t:col===2?t+(ap==='am'?' pagi':' ptg'):(ap==='am'?'\u0b95\u0bbe\u0bb2\u0bc8 ':'\u0bae\u0bbe\u0bb2\u0bc8 ')+t}
function uiDate(k,col,toks){
  const since=k.match(/^Since (.+?)(?: \((.+)\))?$/);if(since){const d=uiDate(since[1],col,toks);if(!d)return null;
    const tail=since[2]?(col===1?'\uff08':' (')+uiTr(since[2],toks)+(col===1?'\uff09':')'):'';return (col===1?'\u81ea'+d+'\u8d77':col===2?'Sejak '+d:d+' \u0bae\u0bc1\u0ba4\u0bb2\u0bcd')+tail}
  const m=k.match(UI_DATE);if(!m)return null;const [,today,wd,d,mo,y,t,ap]=m,mi=UI_MO.indexOf(mo),w=wd&&UI_WD[wd][col-1],tm=t&&uiTime(t,ap,col);
  if(col===1)return (today?'\u4eca\u5929\uff0c':'')+(y?y+'\u5e74':'')+(mi+1)+'\u6708'+d+'\u65e5'+(w?' '+w:'')+(tm?' '+tm:'');
  const mon=(col===2?UI_MO_MS:UI_MO_TA)[mi];
  return (today?(col===2?'Hari ini, ':'\u0b87\u0ba9\u0bcd\u0bb1\u0bc1, '):'')+(w?w+', ':'')+d+' '+mon+(y?' '+y:'')+(tm?', '+tm:'');
}
/* medicine names stay as they are, so phrases about them use {m} */
let uiMedRe=null,uiMedKey='';
function uiMeds(){const names=(state.meds||[]).map(m=>m.name).filter(Boolean),key=names.join('|');
  if(key!==uiMedKey){uiMedKey=key;uiMedRe=names.length?new RegExp('\\b('+names.sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','g'):null}return uiMedRe}
const UI_DATE_IN=/(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?: \d{4})?(?:, \d{1,2}:\d{2}(?: ?[ap]m)?)?/g;
function uiFill(s,nums,meds,dates,toks){let i=0,j=0,d=0;s=s.replace(/\{#\}/g,()=>nums[i++]??'').replace(/\{m\}/g,()=>meds[j++]??'').replace(/\{d\}/g,()=>dates[d++]??'');toks.forEach(([t,v])=>{s=s.split(t).join(v)});return s}
/* a phrase in the middle of a sentence: also accepts the capitalised entry, and keeps the lower case */
function uiPhrase(p,col){const r=UIMAP.get(p);if(r&&r[col])return r[col];const c=UIMAP.get(p[0].toUpperCase()+p.slice(1));
  if(!c||!c[col])return p;return /^[a-z]/.test(p)?c[col][0].toLowerCase()+c[col].slice(1):c[col]}
function uiTr(en,toks){
  const col=UI_COL[uiLang];if(!col||!en)return en;
  let k=en.replace(/\s+/g,' ').trim();if(!k||!/[A-Za-z]/.test(k))return en;
  const wrap=s=>en.match(/^\s*/)[0]+s+en.match(/\s*$/)[0];
  const dt=uiDate(k,col,toks);if(dt)return wrap(dt);
  const nums=[],dates=[];toks.forEach(([t,v])=>{k=k.split(v).join(t)});
  k=k.replace(UI_DATE_IN,m=>{dates.push(uiDate(m,col,toks)||m);return '{d}'}).replace(/\d+(?:[.,:]\d+)*/g,m=>{nums.push(m);return '{#}'});
  let r=UIMAP.get(k),meds=[],km=k;
  if(!r&&/^[a-z]/.test(k)&&!/\{/.test(k)){const p=uiPhrase(k,col);if(p!==k)return wrap(p)}
  if(!r||!r[col]){const re=uiMeds();if(re){km=k.replace(re,m=>{meds.push(m);return '{m}'});if(meds.length)r=UIMAP.get(km)}}
  if(r&&r[col])return wrap(uiFill(r[col],nums,meds,dates,toks));
  /* phrases with a changing part {x}, e.g. "{m} {#} mg (started {d}) can cause {x}." */
  for(const [re,row] of UIX){const m=re.exec(km);if(m&&row[col]){let xt=uiPhrase(m[1],col);
    return wrap(uiFill(row[col].replace('{x}',xt),nums,meds,dates,toks))}}
  /* labels joined with " \u00b7 ", and runs of sentences, are translated part by part */
  const raw=en.replace(/\s+/g,' ').trim();
  for(const [split,join] of [[' \u00b7 ',' \u00b7 '],[/(?<=\.) (?=[A-Z])/,col===1?'':' ']]){const parts=raw.split(split);
    if(parts.length>1){const tr=parts.map(p=>uiTr(p,toks));if(tr.some((t,i)=>t!==parts[i]))return wrap(tr.join(join))}}
  return en;
}
/* each node remembers its English (__en) and what it was last set to (__tr); fresh text from a re-render counts as new English */
function uiApply(root){
  if(!root||typeof UIS==='undefined')return;const toks=uiTokens();
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){const p=n.parentElement;if(!p||p.closest('script,style,textarea,[data-noi18n]'))continue;
    if(n.__tr===undefined||n.nodeValue!==n.__tr)n.__en=n.nodeValue;
    const t=uiTr(n.__en,toks);n.__tr=t;if(n.nodeValue!==t)n.nodeValue=t}
  root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(e=>{if(e.closest('[data-noi18n]'))return;e.__i18n=e.__i18n||{};
    ['placeholder','title','aria-label'].forEach(a=>{const v=e.getAttribute(a);if(v==null)return;const s=e.__i18n[a];
      if(!s||v!==s.tr)e.__i18n[a]={en:v};const t=uiTr(e.__i18n[a].en,toks);e.__i18n[a].tr=t;if(v!==t)e.setAttribute(a,t)})});
}
let uiQueued=false;
/* runs right after each change, before the screen paints, so English never flashes (and it still runs in background tabs) */
function uiSoon(){if(uiQueued)return;uiQueued=true;queueMicrotask(()=>{uiQueued=false;uiApply(document.body)})}

function uiLangCard(){
  return `<section class="card" style="margin-bottom:16px" data-noi18n><h3 style="margin:0 0 6px">Language \u00b7 \u8bed\u8a00 \u00b7 Bahasa \u00b7 \u0bae\u0bca\u0bb4\u0bbf</h3>
   <div class="f"><label for="ui_lang">App language</label><select id="ui_lang">${Object.keys(UI_COL).map(l=>`<option value="${l}" ${l===uiLang?'selected':''}>${UI_NAMES[l]}</option>`).join('')}</select>
   <span class="hint">Changes every screen on this device straight away, and ${esc(state.patient.short)}'s replies and voice. Translations still need a native-speaker check.</span></div></section>`;
}
function setUiLang(l){
  if(UI_COL[l]===undefined)return;uiLang=l;try{localStorage.setItem(UI_LANG_KEY,l)}catch(e){}
  document.documentElement.lang=UI_HTMLLANG[l];
  state.prefs.elder=Object.assign(ELDER_DEFAULTS(),state.prefs.elder||{},{lang:l});save();
  if(APP==='elder')renderElder();else render();uiApply(document.body);
}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ui_lang')setUiLang(e.target.value)});
document.documentElement.lang=UI_HTMLLANG[uiLang];
new MutationObserver(uiSoon).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
uiApply(document.body);
