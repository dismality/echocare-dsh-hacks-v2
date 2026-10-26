/* ================= engine check =================
   Textbook cascades from the published lists, plus controls that must NOT be flagged.
   Each case runs through the same chains() code as the real record, on a throwaway copy. */
const VCASES=[
 {t:'Amlodipine, then furosemide for ankle swelling',meds:[['Amlodipine',-60],['Furosemide',-20,'Ankle swelling']],want:'ccb-edema'},
 {t:'Naproxen, then lisinopril for raised blood pressure',meds:[['Naproxen',-90],['Lisinopril',-40,'High blood pressure']],want:'nsaid-bp'},
 {t:'Lisinopril, then a cough medicine',meds:[['Lisinopril',-60],['Dextromethorphan',-10,'Cough']],want:'ace-cough'},
 {t:'Donepezil, then tolterodine for bladder leakage',meds:[['Donepezil',-120],['Tolterodine',-30,'Bladder leakage']],want:'chei-incont'},
 {t:'Metoclopramide, then levodopa for tremor',meds:[['Metoclopramide',-60],['Levodopa',-15,'Tremor']],want:'antipsy-tremor'},
 {t:'Hydrochlorothiazide, then allopurinol for gout',meds:[['Hydrochlorothiazide',-100],['Allopurinol',-20,'Gout']],want:'thiazide-gout'},
 {t:'Lorazepam, then quetiapine for agitation',meds:[['Lorazepam',-80],['Quetiapine',-20,'Agitation']],want:'benzo-antipsy'},
 {t:'Chlorphenamine, then tamsulosin for difficulty passing urine',meds:[['Chlorphenamine',-60],['Tamsulosin',-15,'Difficulty passing urine']],want:'antichol-retention'},
 {t:'Levodopa, then metoclopramide for nausea',meds:[['Levodopa',-90],['Metoclopramide',-20,'Nausea']],want:'levodopa-nausea'},
 {t:'Gabapentin, then ankle swelling reported',meds:[['Gabapentin',-50]],say:'My ankles have been swollen this week',want:'gaba-edema'},
 {t:'Control: furosemide started before amlodipine',meds:[['Furosemide',-90],['Amlodipine',-20]],want:null},
 {t:'Control: second medicine 14 months later',meds:[['Amlodipine',-500],['Furosemide',-70]],want:null},
 {t:'Control: metformin and atorvastatin, no symptoms',meds:[['Metformin',-200],['Atorvastatin',-150]],want:null},
 {t:'Control: "my ankles are not swollen"',meds:[['Amlodipine',-30]],say:'My ankles are not swollen today, thank you',want:null},
 {t:'Brand names: Norvasc, then Lasix for ankle swelling',meds:[['Norvasc',-60],['Lasix',-20,'Ankle swelling']],want:'ccb-edema'},
 {t:'Brand name: Nurofen, then losartan for raised blood pressure',meds:[['Nurofen',-70],['Losartan',-25,'High blood pressure']],want:'nsaid-bp'},
 {t:'Pregabalin, then dizziness reported',meds:[['Pregabalin',-40]],say:'I feel giddy when I get up',want:'gaba-dizzy'},
 {t:'Control: "I don\'t have any dizziness"',meds:[['Amlodipine',-30]],say:"I don't have any dizziness today",want:null},
 {t:'Control: "no swelling in my ankles"',meds:[['Amlodipine',-30]],say:'There is no swelling in my ankles now',want:null}
];
/* What she says, read by the offline rules (the same code that runs when Claude is unavailable) */
const VTEXT=[
 {t:'Emergency: "my chest feels very tight"',say:'My chest feels very tight',urgent:true},
 {t:'Emergency in Mandarin: \u6211\u80f8\u53e3\u5f88\u75db (my chest hurts)',say:'\u6211\u80f8\u53e3\u5f88\u75db',urgent:true},
 {t:'Emergency in Malay: "dada saya sakit" (my chest hurts)',say:'Dada saya sakit sangat',urgent:true},
 {t:'Emergency in Tamil: \u0ba8\u0bc6\u0b9e\u0bcd\u0b9a\u0bc1 \u0bb5\u0bb2\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1 (chest pain)',say:'\u0b8e\u0ba9\u0b95\u0bcd\u0b95\u0bc1 \u0ba8\u0bc6\u0b9e\u0bcd\u0b9a\u0bc1 \u0bb5\u0bb2\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1',urgent:true},
 {t:'Emergency in Malay: "sesak nafas" (breathless)',say:'Saya sesak nafas',urgent:true},
 {t:'Control: "I have no chest pain today"',say:'I have no chest pain today',urgent:false},
 {t:'Blood pressure "165 over 98" is saved',say:'My blood pressure was 165 over 98 this morning',bp:'165/98'},
 {t:'Brand name: "two Panadol" logs paracetamol',say:'I took two Panadol for my headache',dose:'Paracetamol (Panadol)'},
 {t:'Named dose: "I took my amlodipine"',say:'I took my amlodipine',dose:'Amlodipine'},
 {t:'"Vitamin B12" is not mistaken for Vitamin D',find:'Vitamin B12',want:'Vitamin B12'},
 {t:'Control: plain "Vitamin" matches no medicine',find:'Vitamin',want:null}
];
function runTextCheck(){
  const real=state;
  try{state=seed();['Vitamin D','Vitamin B12'].forEach(n=>state.meds.push({id:uid(),name:n,strength:'',slots:['morning'],prn:false,qty:30,dosePerTake:1,form:'Tablet',withFood:'Any time',start:addDays(-30),source:'Bought myself',reason:'',stopped:false,unconfirmed:false,cls:[],ing:[]}));
    return VTEXT.map(cs=>{let pass;
      if(cs.find!==undefined){const m=findMed(cs.find);pass=cs.want?!!m&&m.name===cs.want:!m}
      else{const ex=rulesExtract(cs.say);
        if(cs.urgent!==undefined)pass=!!ex.urgent===cs.urgent;
        else if(cs.bp)pass=ex.vitals.some(v=>v.type==='bp'&&v.sys+'/'+v.dia===cs.bp);
        else if(cs.dose)pass=ex.doses.some(d=>d.medicine===cs.dose);}
      return {cs,pass}})}
  finally{state=real}}
let VRESULT=null;
function runEngineCheck(){
  if(VRESULT)return VRESULT;const real=state;
  VRESULT=VCASES.map(cs=>{
    state=Object.assign({},real,{meds:cs.meds.map(([n,d,why])=>{const c=classify(n);return {id:uid(),name:n,strength:'',slots:['morning'],prn:false,qty:30,dosePerTake:1,form:'Tablet',withFood:'Any time',start:addDays(d),source:'Prescribed',reason:why||'',stopped:false,unconfirmed:false,cls:c.cls,ing:c.ing}}),
      symptoms:[],vitals:[],reports:[],chains:{},doses:{},events:[],chat:[]});
    if(cs.say){const ex=rulesExtract(cs.say);(ex.symptoms||[]).forEach(x=>state.symptoms.push({id:uid(),key:x.key,label:x.label,severity:4,start:addDays(-3),resolved:false,mentions:[addDays(-3)],trend:'New'}))}
    const got=chains().map(c=>c.rule.id);
    const pass=cs.want?got.includes(cs.want):got.length===0;
    return {cs,got,pass}});
  state=real;return VRESULT;
}
function engineCard(){
  const r=runEngineCheck(),pos=r.filter(x=>x.cs.want),neg=r.filter(x=>!x.cs.want);
  return `<div class="card" id="engineCheck"><h2>Engine check <span class="chip ${r.every(x=>x.pass)?'ok':'warn'}">${pos.filter(x=>x.pass).length} of ${pos.length} cascades caught \u00b7 ${neg.filter(x=>!x.pass).length} false alarms in ${neg.length} controls</span></h2>
   <div class="tbl"><table class="t"><thead><tr><th>Case</th><th>Expected</th><th>Result</th></tr></thead><tbody>${r.map(x=>`<tr><td>${esc(x.cs.t)}</td><td>${x.cs.want?'Flag':'No flag'}</td><td><span class="chip ${x.pass?'ok':'crit'}">${x.pass?'\u2713 Correct':'\u2717 Wrong'}</span></td></tr>`).join('')}</tbody></table></div>
   <p class="small muted" style="margin:10px 0 0">These are textbook scenarios written from the published lists. They prove the logic works as designed, not real-world accuracy. Next step: a pharmacist-reviewed set of real anonymised cases.</p></div>`+textCard();
}
function textCard(){
  const r=runTextCheck(),ok=r.filter(x=>x.pass).length;
  return `<div class="card" id="textCheck"><h2>Language check <span class="chip ${ok===r.length?'ok':'warn'}">${ok} of ${r.length} correct</span></h2>
   <div class="tbl"><table class="t"><thead><tr><th>What she says</th><th>Result</th></tr></thead><tbody>${r.map(x=>`<tr><td>${esc(x.cs.t)}</td><td><span class="chip ${x.pass?'ok':'crit'}">${x.pass?'\u2713 Correct':'\u2717 Wrong'}</span></td></tr>`).join('')}</tbody></table></div>
   <p class="small muted" style="margin:10px 0 0">Run on the offline rules, which take over whenever Claude is unavailable. The Mandarin, Malay and Tamil phrases need a native-speaker review before real use.</p></div>`;
}
