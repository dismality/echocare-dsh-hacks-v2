/* ================= integrations (links and files the viewer opens themselves) ================= */
const gstamp=(d,t)=>d.replace(/-/g,'')+'T'+String(t||'09:00').replace(':','')+'00';
function addMins(d,t,mins){const x=new Date(d+'T'+(t||'09:00')+':00');x.setMinutes(x.getMinutes()+mins);return {d:iso(x),t:pad(x.getHours())+':'+pad(x.getMinutes())}}
function gcalLink(o){const e=addMins(o.date,o.time,o.mins||60);const p=new URLSearchParams({action:'TEMPLATE',text:o.title,dates:gstamp(o.date,o.time)+'/'+gstamp(e.d,e.t),details:o.details||'',location:o.place||''});if(o.recur)p.set('recur','RRULE:'+o.recur);return 'https://calendar.google.com/calendar/render?'+p.toString()}
function outlookLink(o){const e=addMins(o.date,o.time,o.mins||60);const p=new URLSearchParams({path:'/calendar/action/compose',rru:'addevent',subject:o.title,startdt:o.date+'T'+o.time+':00',enddt:e.d+'T'+e.t+':00',body:o.details||'',location:o.place||''});return 'https://outlook.live.com/calendar/0/deeplink/compose?'+p.toString()}
/* Straight to one person by phone. Opened by the viewer, so nothing happens until they press call. */
const phoneDigits=p=>String(p||'').replace(/[^\d+]/g,'');
const telHref=p=>'tel:'+phoneDigits(p);
function copyText(t,okMsg){try{navigator.clipboard.writeText(t).then(()=>toast(okMsg||'Copied'),()=>toast('Copy was blocked. Select the text and press Ctrl+C.'))}catch(e){toast('Copy was blocked. Select the text and press Ctrl+C.')}}
let downloads=null;
async function saveFile(filename,data){if(!downloads){toast('Saving files is not available in this view.');return}try{await downloads.save({filename,data});toast('Saved '+filename)}catch(e){toast(e&&e.code==='declined'?'Not saved':'Could not save the file here.')}}
