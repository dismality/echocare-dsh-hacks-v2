/* ================= clinical dictionaries ================= */
const DRUGS={
 amlodipine:['ccb','antihypertensive'],nifedipine:['ccb','antihypertensive'],felodipine:['ccb','antihypertensive'],
 lisinopril:['ace','antihypertensive'],enalapril:['ace','antihypertensive'],perindopril:['ace','antihypertensive'],ramipril:['ace','antihypertensive'],captopril:['ace','antihypertensive'],
 losartan:['arb','antihypertensive'],valsartan:['arb','antihypertensive'],telmisartan:['arb','antihypertensive'],
 atenolol:['betablocker','antihypertensive'],metoprolol:['betablocker','antihypertensive'],bisoprolol:['betablocker','antihypertensive'],propranolol:['betablocker','antihypertensive'],
 furosemide:['diuretic','antihypertensive'],hydrochlorothiazide:['thiazide','diuretic','antihypertensive'],indapamide:['thiazide','diuretic','antihypertensive'],spironolactone:['diuretic','antihypertensive'],
 tamsulosin:['alphablocker'],doxazosin:['alphablocker','antihypertensive'],
 atorvastatin:['statin'],simvastatin:['statin'],rosuvastatin:['statin'],pravastatin:['statin'],
 metformin:['metformin','diabetes'],gliclazide:['sulfonylurea','diabetes'],glipizide:['sulfonylurea','diabetes'],glibenclamide:['sulfonylurea','diabetes'],insulin:['insulin','diabetes'],sitagliptin:['diabetes'],empagliflozin:['diabetes'],
 ibuprofen:['nsaid'],naproxen:['nsaid'],diclofenac:['nsaid'],celecoxib:['nsaid'],etoricoxib:['nsaid'],'mefenamic acid':['nsaid'],
 aspirin:['antiplatelet'],clopidogrel:['antiplatelet'],warfarin:['anticoagulant'],apixaban:['anticoagulant'],rivaroxaban:['anticoagulant'],dabigatran:['anticoagulant'],
 paracetamol:['analgesic'],acetaminophen:['analgesic'],tramadol:['opioid'],codeine:['opioid'],morphine:['opioid'],oxycodone:['opioid'],
 lactulose:['laxative'],senna:['laxative'],bisacodyl:['laxative'],loperamide:['antidiarrhoeal'],
 omeprazole:['ppi'],esomeprazole:['ppi'],pantoprazole:['ppi'],
 donepezil:['cholinesterase'],rivastigmine:['cholinesterase'],galantamine:['cholinesterase'],
 oxybutynin:['anticholinergic'],tolterodine:['anticholinergic'],solifenacin:['anticholinergic'],
 haloperidol:['antipsychotic'],risperidone:['antipsychotic'],quetiapine:['antipsychotic'],olanzapine:['antipsychotic'],metoclopramide:['antiemetic'],
 levodopa:['antiparkinson'],
 diazepam:['sedative'],lorazepam:['sedative'],alprazolam:['sedative'],clonazepam:['sedative'],zolpidem:['sedative'],
 chlorphenamine:['sedatingantihistamine'],diphenhydramine:['sedatingantihistamine'],promethazine:['sedatingantihistamine'],
 gabapentin:['gabapentinoid'],pregabalin:['gabapentinoid'],
 sertraline:['ssri'],fluoxetine:['ssri'],escitalopram:['ssri'],citalopram:['ssri'],
 allopurinol:['gout'],colchicine:['gout'],prednisolone:['steroid'],prednisone:['steroid'],dexamethasone:['steroid'],
 levothyroxine:['thyroid'],phenylephrine:['decongestant'],pseudoephedrine:['decongestant'],dextromethorphan:['antitussive'],
 betahistine:['antivertigo'],cinnarizine:['antivertigo','sedatingantihistamine']
};
const BRANDS={panadol:'paracetamol',tylenol:'paracetamol',nurofen:'ibuprofen',advil:'ibuprofen',norvasc:'amlodipine',lipitor:'atorvastatin',glucophage:'metformin',aricept:'donepezil',zocor:'simvastatin',crestor:'rosuvastatin',voltaren:'diclofenac',ponstan:'mefenamic acid',lasix:'furosemide',plavix:'clopidogrel',xarelto:'rivaroxaban',eliquis:'apixaban',ditropan:'oxybutynin'};
const CLS_LABEL={ccb:'Blood pressure (calcium-channel blocker)',ace:'Blood pressure (ACE inhibitor)',arb:'Blood pressure (ARB)',betablocker:'Beta blocker',diuretic:'Water pill (diuretic)',thiazide:'Water pill (thiazide)',alphablocker:'Alpha blocker',statin:'Cholesterol (statin)',metformin:'Diabetes (metformin)',sulfonylurea:'Diabetes (sulfonylurea)',insulin:'Insulin',diabetes:'Diabetes',nsaid:'Anti-inflammatory painkiller (NSAID)',antiplatelet:'Antiplatelet',anticoagulant:'Blood thinner',analgesic:'Painkiller',opioid:'Opioid painkiller',laxative:'Laxative',antidiarrhoeal:'Anti-diarrhoea',ppi:'Stomach acid (PPI)',cholinesterase:'Dementia (cholinesterase inhibitor)',anticholinergic:'Bladder (anticholinergic)',antipsychotic:'Antipsychotic',antiemetic:'Anti-sickness',antiparkinson:'Parkinson\'s',sedative:'Sedative / sleeping pill',sedatingantihistamine:'Sedating antihistamine',gabapentinoid:'Nerve pain',ssri:'Antidepressant (SSRI)',gout:'Gout',steroid:'Steroid',thyroid:'Thyroid',decongestant:'Decongestant',antitussive:'Cough medicine',antivertigo:'Dizziness medicine',antihypertensive:'Blood pressure'};
const TO_LABEL={diuretic:'a water pill',antihypertensive:'a blood-pressure medicine',anticholinergic:'a bladder medicine',laxative:'a laxative',antiparkinson:'a Parkinson\'s medicine',antitussive:'a cough medicine',antivertigo:'a dizziness medicine',sedative:'a sleeping pill',diabetes:'a diabetes medicine',gout:'a gout medicine',cholinesterase:'a dementia medicine',nsaid:'a painkiller',analgesic:'a painkiller',opioid:'a stronger painkiller',antidiarrhoeal:'an anti-diarrhoea medicine',ppi:'a stomach medicine'};
function classify(name,extraIng){
  const n=(name||'').toLowerCase(); const ing=new Set((extraIng||[]).map(x=>String(x).toLowerCase())); const cls=new Set();
  Object.keys(BRANDS).forEach(b=>{if(n.includes(b))ing.add(BRANDS[b])});
  Object.keys(DRUGS).forEach(d=>{if(n.includes(d))ing.add(d)});
  ing.forEach(i=>{Object.keys(DRUGS).forEach(d=>{if(i.includes(d))DRUGS[d].forEach(c=>cls.add(c))})});
  return {ing:[...ing],cls:[...cls]};
}
const SYM=[
 {key:'chestpain',label:'Chest pain or tightness',emer:true,re:/chest.{0,15}(pain|tight|hurt|pressure)|tight.{0,10}chest|\u80f8\u53e3?.{0,3}(\u75db|\u75bc|\u95f7)|sakit dada|dada (saya )?(sakit|sesak|ketat)|\u0ba8\u0bc6\u0b9e\u0bcd\u0b9a\u0bc1.{0,6}(\u0bb5\u0bb2\u0bbf|\u0b87\u0bb1\u0bc1\u0b95\u0bcd\u0b95)/i},
 {key:'stroke',label:'Face drooping, slurred speech or one-sided weakness',emer:true,re:/face.{0,10}droop|slurred|one side.{0,12}(weak|numb)|can'?t (lift|move) my (arm|leg)/i},
 {key:'breathless',label:'Severe breathlessness',emer:true,re:/can'?t breathe|hard to breathe|gasping|short of breath|\u547c\u5438\u56f0\u96be|\u5598\u4e0d\u8fc7\u6c14|sesak nafas|susah (nak )?bernafas|\u0bae\u0bc2\u0b9a\u0bcd\u0b9a\u0bc1.{0,12}(\u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8|\u0ba4\u0bbf\u0ba3\u0bb1\u0bb2\u0bcd)/i},
 {key:'edema',label:'Swollen ankles or feet',area:'Legs and feet',re:/(swell|swollen|puffy).{0,25}(ankle|feet|foot|leg)|(ankle|feet|foot|leg)s?.{0,25}(swell|swollen|puffy)/i},
 {key:'faint',label:'Feeling faint or about to pass out',emer:true,re:/pass(ing)? out|\bfaint|black(ing)? out|(about|going) to collapse|can'?t make it|cannot make it|can'?t manage|cannot manage|(don'?t|do not) think i can (make it|manage|cope)/i},
 {key:'dizzy',label:'Dizziness or light-headedness',area:'Head',re:/dizz|light.?headed|giddy|spinning/i},
 {key:'falls',label:'Fall or near-fall',re:/\bfell\b|\bfall(en)?\b|tripped|slipped/i},
 {key:'cough',label:'Dry cough',area:'Chest',re:/cough/i},
 {key:'muscle',label:'Muscle aches or weakness',area:'Whole body',re:/muscle|legs? (ache|aching|sore|weak)|aching (legs|arms|body)/i},
 {key:'gi',label:'Diarrhoea or stomach upset',area:'Stomach',re:/diarrh|stomach (upset|ache|pain)|loose stool|runny tummy/i},
 {key:'constipation',label:'Constipation',area:'Stomach',re:/constipat|can'?t (go|poo)|no bowel/i},
 {key:'nausea',label:'Nausea or vomiting',area:'Stomach',re:/nause|vomit|throw(ing)? up|want to vomit/i},
 {key:'urinefreq',label:'Passing urine often',re:/(pee|toilet|urinat|wee).{0,25}(lot|often|many times|night)/i},
 {key:'retention',label:'Difficulty passing urine',area:'Bladder and bowel',re:/can'?t (pass urine|pee|wee)|difficult(y)? (passing urine|peeing)|weak (stream|flow)|trouble (peeing|passing urine)|hard to (pee|pass urine)/i},
 {key:'incontinence',label:'Bladder leakage',re:/leak|wet (myself|the bed)|can'?t hold/i},
 {key:'tremor',label:'Shaky hands or stiffness',re:/shak(y|ing) hands?|tremor|hands? (shake|shaking)|stiff/i},
 {key:'confusion',label:'Confusion or forgetfulness',area:'Head',re:/confus|forget|forgot (where|what|the way)|memory|muddled/i},
 {key:'insomnia',label:'Trouble sleeping',re:/(can'?t|couldn'?t|cannot|didn'?t) sleep|slept (badly|poorly)|awake (all|most of) (the )?night|insomnia/i},
 {key:'fatigue',label:'Tiredness or low energy',re:/tired|exhausted|no energy|weak and/i},
 {key:'headache',label:'Headache',area:'Head',re:/headache|head (pain|hurts|ache)/i},
 {key:'gout',label:'Painful swollen joint',re:/gout|big toe/i},
 {key:'lowsugar',label:'Sweaty, shaky or very hungry',re:/sweaty|cold sweat|shaky and hungry|very hungry/i},
 {key:'highsugar',label:'Very thirsty, passing urine a lot',re:/very thirsty|always thirsty/i},
 {key:'bleeding',label:'Unusual bruising or bleeding',re:/bruis|bleed|blood in|black stool/i},
 {key:'rash',label:'Rash or itching',area:'Skin',re:/rash|itch/i},
 {key:'highbp',label:'High blood pressure reading',re:/(blood pressure|bp).{0,25}(high|up|raised)/i},
 {key:'jointpain',label:'Joint pain (knee, hip or back)',area:'Joints',re:/knee|hip pain|back (pain|ache)|joint pain/i},
 {key:'appetite',label:'Poor appetite',re:/no appetite|not hungry|don'?t feel like eating|poor appetite/i},
 {key:'lowmood',label:'Feeling low or lonely',re:/lonely|alone all day|sad|feeling low|depress/i},
 {key:'other',label:'Other (type your own)'}
];
const SYMK=Object.fromEntries(SYM.map(s=>[s.key,s]));
const AREAS=['Head','Chest','Stomach','Legs and feet','Arms and hands','Joints','Skin','Bladder and bowel','Whole body','Other'];
const RULES=[
 {id:'nsaid-bp',from:['nsaid'],effect:'raised blood pressure',sym:['highbp'],to:['antihypertensive'],why:'NSAID painkillers such as ibuprofen can raise blood pressure. A blood-pressure medicine started soon after may be treating a side effect.'},
 {id:'ccb-edema',from:['ccb'],effect:'ankle swelling',sym:['edema'],to:['diuretic'],why:'Amlodipine-type blood-pressure medicines commonly cause ankle swelling. It is sometimes treated with a water pill instead of reviewing the first medicine.'},
 {id:'gaba-edema',from:['gabapentinoid'],effect:'ankle swelling',sym:['edema'],to:['diuretic'],why:'Gabapentin and pregabalin can cause leg swelling.'},
 {id:'ace-cough',from:['ace'],effect:'dry cough',sym:['cough'],to:['antitussive'],why:'ACE-inhibitor blood-pressure medicines cause a dry cough in a noticeable share of people.'},
 {id:'statin-muscle',from:['statin'],effect:'muscle aches',sym:['muscle'],to:['nsaid','opioid'],why:'Statins can cause muscle aches, which may lead to extra painkillers being taken.'},
 {id:'met-gi',from:['metformin'],effect:'stomach upset',sym:['gi','nausea'],to:['antidiarrhoeal','ppi'],why:'Metformin commonly causes stomach upset or diarrhoea, especially after a dose change.'},
 {id:'chei-incont',from:['cholinesterase'],effect:'bladder leakage',sym:['incontinence','urinefreq'],to:['anticholinergic'],why:'Dementia medicines like donepezil can cause bladder leakage. A bladder medicine added afterwards can also work against the dementia medicine.'},
 {id:'antipsy-tremor',from:['antipsychotic','antiemetic'],effect:'tremor or stiffness',sym:['tremor'],to:['antiparkinson'],why:'Some antipsychotic and anti-sickness medicines cause Parkinson-like tremor.'},
 {id:'opioid-const',expected:true,from:['opioid'],effect:'constipation',sym:['constipation'],to:['laxative'],why:'Opioid painkillers commonly cause constipation. A laxative alongside an opioid is usually recommended, so this is shown for awareness only.'},
 {id:'benzo-antipsy',from:['sedative'],effect:'agitation or confusion',sym:['confusion'],to:['antipsychotic'],why:'Sleeping pills such as benzodiazepines can cause confusion or agitation in older adults, which may then be treated with an antipsychotic. This pair is on the ThinkCascades list.'},
 {id:'thiazide-gout',from:['thiazide'],effect:'gout',sym:['gout'],to:['gout'],why:'Thiazide water pills raise uric acid and can trigger gout.'},
 {id:'diur-urine',from:['diuretic'],effect:'frequent urination',sym:['urinefreq','incontinence'],to:['anticholinergic'],why:'Water pills increase urination, which is sometimes treated with a bladder medicine.'},
 {id:'bp-dizzy',from:['antihypertensive','alphablocker'],effect:'dizziness',sym:['dizzy','falls'],to:['antivertigo'],why:'Blood-pressure medicines can cause dizziness on standing, which raises fall risk in older adults.'},
 {id:'ssri-insom',from:['ssri'],effect:'trouble sleeping',sym:['insomnia'],to:['sedative'],why:'Some antidepressants disturb sleep, which can lead to a sleeping pill being added.'},
 {id:'steroid-glu',expected:true,from:['steroid'],effect:'high blood sugar',sym:['highsugar'],to:['diabetes'],why:'Steroids raise blood sugar.'},
 {id:'acb-conf',from:['anticholinergic','sedatingantihistamine','sedative'],effect:'confusion or memory problems',sym:['confusion','falls'],to:['cholinesterase'],why:'Anticholinergic and sedating medicines can worsen memory and confusion in older adults (Beers Criteria).'},
 {id:'antichol-retention',from:['anticholinergic','sedatingantihistamine'],effect:'difficulty passing urine',sym:['retention'],to:['alphablocker'],why:'Anticholinergic medicines and sedating antihistamines can make it hard to pass urine, which may then be treated with a prostate medicine such as tamsulosin.'},
 {id:'levodopa-nausea',from:['antiparkinson'],effect:'nausea',sym:['nausea'],to:['antiemetic'],why:'Levodopa often causes nausea. Treating it with metoclopramide can block levodopa and worsen Parkinson symptoms.'},
 {id:'ccb-const',from:['ccb'],effect:'constipation',sym:['constipation'],to:['laxative'],why:'Calcium-channel blockers, especially verapamil, can cause constipation.'},
 {id:'antichol-const',from:['anticholinergic'],effect:'constipation',sym:['constipation'],to:['laxative'],why:'Anticholinergic medicines slow the bowel and commonly cause constipation in older adults.'},
 {id:'gaba-dizzy',from:['gabapentinoid'],effect:'dizziness',sym:['dizzy','falls'],to:['antivertigo'],why:'Gabapentin and pregabalin commonly cause dizziness and unsteadiness, raising the risk of falls.'},
 {id:'chei-insom',from:['cholinesterase'],effect:'trouble sleeping or vivid dreams',sym:['insomnia'],to:['sedative'],why:'Dementia medicines such as donepezil can disturb sleep, especially when taken at night, which may lead to a sleeping pill being added.'},
 {id:'nsaid-gi',expected:true,from:['nsaid'],effect:'stomach upset',sym:['gi','nausea'],to:['ppi'],why:'NSAID painkillers irritate the stomach. A stomach-protecting medicine alongside one is often recommended, so this is shown for awareness.'},
 {id:'steroid-gi',expected:true,from:['steroid'],effect:'stomach upset',sym:['gi','nausea'],to:['ppi'],why:'Steroids can irritate the stomach. A stomach-protecting medicine is often given on purpose.'},
 {id:'su-hypo',from:['sulfonylurea','insulin'],effect:'low blood sugar',sym:['lowsugar'],to:[],why:'Sulfonylureas and insulin can cause low blood sugar, which is risky for older adults.'},
];
const SLOTS=[{k:'morning',l:'Morning',t:'8:00 am'},{k:'noon',l:'Midday',t:'1:00 pm'},{k:'evening',l:'Evening',t:'6:00 pm'},{k:'bedtime',l:'Bedtime',t:'10:00 pm'}];
const SLOTL=Object.fromEntries(SLOTS.map(s=>[s.k,s.l]));
const slotT=k=>(state&&state.prefs&&state.prefs.slotTimes[k])||'08:00';
const minsOf=t=>{const [h,m]=String(t).split(':').map(Number);return h*60+(m||0)};
const clock=t=>{const [h,m]=String(t).split(':').map(Number);return (h%12||12)+':'+pad(m||0)+(h<12?' am':' pm')};
const nowMins=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const dur=m=>m>=60?Math.floor(m/60)+' h'+(m%60?' '+(m%60)+' min':''):m+' min';
function cdInfo(slot,status){
  if(status==='taken')return {cls:'done',txt:'Taken'};
  if(status==='skipped')return {cls:'late',txt:'Skipped'};
  const d=minsOf(slotT(slot))-nowMins();
  if(d>60)return {cls:'',txt:'in '+dur(d)};
  if(d>0)return {cls:'soon',txt:'in '+dur(d)};
  if(d>-30)return {cls:'late',txt:'Due now'};
  return {cls:'late',txt:'Overdue by '+dur(-d)};
}
const cdSpan=(slot,status,big)=>{const c=cdInfo(slot,status);return `<span class="${big?'cdbig':'cd'} ${c.cls}" data-cd="${slot}" data-st="${status}"${big?' data-big="1"':''}>${c.txt}</span>`};
