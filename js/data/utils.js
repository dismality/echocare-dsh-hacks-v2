/* ================= utilities ================= */
const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const W=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const NOW=new Date(); const T=iso(NOW);
const addDays=n=>{const d=new Date(NOW);d.setDate(d.getDate()+n);return iso(d)};
const P=s=>new Date(s+'T12:00:00');
const diff=(a,b)=>Math.round((P(b)-P(a))/864e5);
const fmt=s=>{if(!s)return '\u2014';const d=P(s);return d.getDate()+' '+M[d.getMonth()]};
const fmtY=s=>{if(!s)return '\u2014';const d=P(s);return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear()};
const fmtW=s=>{const d=P(s);return W[d.getDay()]+' '+d.getDate()+' '+M[d.getMonth()]};
const ago=s=>{const n=diff(s,T);return n===0?'today':n===1?'yesterday':n<60?n+' days ago':n<730?Math.round(n/30)+' months ago':Math.round(n/365)+' years ago'};
const hm=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const $=id=>document.getElementById(id);
/* On claude.ai the page can ask Claude; on the public website it runs as the demo version on the built-in rules */
const ONLINE_AI=!!(window.claude&&window.claude.use);
const NOAI='This uses Claude, which runs in the full EchoCare on claude.ai. This website is the demo version.';
