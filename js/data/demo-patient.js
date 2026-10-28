/* ================= demo patient ================= */
const ELDER_DEFAULTS=()=>({lang:'English',escale:1.15,rate:.9,showAppt:true,showTalk:true,showCall:true,showHelp:true,showMessages:true,showAllMeds:true,showNames:true,callId:null,quick:['I\'m okay today','Please call me','Thank you for visiting','I need groceries'],pin:'1234',lock:true});
const LANGS={English:'en-GB',Mandarin:'zh-CN',Malay:'ms-MY',Tamil:'ta-IN'};
function seed(){
  const med=(o)=>{const c=classify(o.name);return Object.assign({id:uid(),form:'Tablet',dosePerTake:1,slots:[],prn:false,withFood:'Any time',qty:30,source:'Prescribed',prescriber:'',reason:'',notes:'',via:'Typed',unconfirmed:false,stopped:false},o,{cls:c.cls,ing:c.ing})};
  const meds=[
    med({name:'Amlodipine',strength:'10 mg',slots:['morning'],qty:24,start:addDays(-25),reason:'High blood pressure',prescriber:'Dr Lim (GP)'}),
    med({name:'Metformin',strength:'500 mg',slots:['morning','evening'],withFood:'With food',qty:40,start:'2021-03-15',reason:'Type 2 diabetes',prescriber:'Dr Lim (GP)'}),
    med({name:'Atorvastatin',strength:'20 mg',slots:['bedtime'],qty:5,start:'2022-06-02',reason:'High cholesterol',prescriber:'Dr Lim (GP)'}),
    med({name:'Donepezil',strength:'5 mg',slots:['bedtime'],qty:21,start:addDays(-100),reason:'Memory problems',prescriber:'Memory clinic'}),
    med({name:'Oxybutynin',strength:'5 mg',slots:['morning'],qty:18,start:addDays(-64),reason:'Bladder leakage',prescriber:'Dr Lim (GP)'}),
    med({name:'Ibuprofen',strength:'400 mg',prn:true,qty:12,start:addDays(-45),reason:'Knee pain',source:'Given by someone',notes:'Given by a neighbour',via:'Chat'}),
    med({name:'Paracetamol (Panadol)',strength:'500 mg',dosePerTake:2,prn:true,qty:30,start:'2024-01-10',reason:'Pain or fever',source:'Bought myself'}),
  ];
  const look={Amlodipine:['white','round'],Metformin:['white','oval'],Atorvastatin:['pink','oval'],Donepezil:['yellow','round'],Oxybutynin:['blue','round'],Ibuprofen:['orange','oval'],'Paracetamol (Panadol)':['white','capsule']};
  meds.forEach(m=>{const l=look[m.name]||['white','round'];m.color=l[0];m.shape=l[1]});
  const id=n=>meds.find(m=>m.name.startsWith(n)).id;
  const doses={};
  for(let i=-14;i<=-1;i++){const d=addDays(i);doses[d]={};
    meds.filter(m=>!m.prn&&m.start<=d).forEach(m=>m.slots.forEach(s=>{doses[d][m.id+':'+s]='taken'}));}
  doses[addDays(-3)][id('Metformin')+':evening']='skipped';
  doses[addDays(-5)][id('Atorvastatin')+':bedtime']='skipped';
  doses[addDays(-2)][id('Ibuprofen')+':prn:'+'14:10']='taken';
  doses[addDays(-6)][id('Ibuprofen')+':prn:'+'09:30']='taken';
  const sym=(o)=>Object.assign({id:uid(),area:'',severity:4,freq:'Comes and goes',time:'Any time',trend:'Same',notes:'',source:'Chat',resolved:false},o);
  const symptoms=[
    sym({key:'edema',label:SYMK.edema.label,area:'Legs and feet',severity:4,start:addDays(-12),trend:'Worse',freq:'Every day',time:'Evening',mentions:[addDays(-12),addDays(-5)],notes:'Shoes feel tight by evening'}),
    sym({key:'jointpain',label:'Knee pain',area:'Joints',severity:6,start:addDays(-50),mentions:[addDays(-50),addDays(-30),addDays(-9)],notes:'Right knee, worse on stairs'}),
    sym({key:'incontinence',label:SYMK.incontinence.label,area:'Bladder and bowel',severity:3,start:addDays(-80),trend:'Better',mentions:[addDays(-80),addDays(-70)]}),
    sym({key:'confusion',label:'Forgetfulness',area:'Head',severity:3,start:addDays(-20),trend:'Worse',mentions:[addDays(-20),addDays(-6)],source:'Family',notes:'Rachel noticed missed phone calls and repeated questions'}),
  ];
  const v=(o)=>Object.assign({id:uid(),time:'08:15',source:'Typed'},o);
  const vitals=[
    v({type:'bp',sys:128,dia:78,pulse:72,date:addDays(-80)}),v({type:'bp',sys:131,dia:80,pulse:74,date:addDays(-66)}),v({type:'bp',sys:129,dia:79,pulse:71,date:addDays(-52)}),
    v({type:'bp',sys:144,dia:86,pulse:76,date:addDays(-40)}),v({type:'bp',sys:151,dia:90,pulse:78,date:addDays(-33)}),v({type:'bp',sys:148,dia:88,pulse:77,date:addDays(-28)}),
    v({type:'bp',sys:138,dia:84,pulse:70,date:addDays(-18)}),v({type:'bp',sys:135,dia:82,pulse:69,date:addDays(-10)}),v({type:'bp',sys:133,dia:81,pulse:70,date:addDays(-3)}),
    v({type:'glucose',value:7.2,context:'Fasting',date:addDays(-14)}),v({type:'glucose',value:6.8,context:'Fasting',date:addDays(-7)}),v({type:'glucose',value:8.9,context:'After meal',date:addDays(-2),time:'13:40'}),
    v({type:'weight',value:54.2,date:addDays(-30)}),v({type:'weight',value:53.8,date:addDays(-2)}),
  ];
  const checkins=[];
  [[-6,4,7,5,true,'Good'],[-5,3,6,6,false,'OK'],[-4,4,7,5,true,'Good'],[-3,3,5,6,false,'Poor'],[-2,4,7,4,true,'Good'],[-1,3,6,5,false,'OK']].forEach(r=>checkins.push({date:addDays(r[0]),mood:r[1],sleep:r[2],pain:r[3],talked:r[4],appetite:r[5],note:''}));
  const slotTimes={morning:'08:00',noon:'13:00',evening:'18:00',bedtime:'22:00'};
  const doseTimes={};let r=7;
  Object.entries(doses).forEach(([d,log])=>{doseTimes[d]={};Object.entries(log).forEach(([k,v])=>{if(v!=='taken'||k.includes(':prn:'))return;r=(r*9301+49297)%233280;const late=Math.round(r/233280*(d>=addDays(-3)?45:20));const [h,mi]=slotTimes[k.split(':')[1]].split(':').map(Number);const t=h*60+mi+late;doseTimes[d][k]=pad(Math.floor(t/60))+':'+pad(t%60)})});
  return {v:2,demo:true,
    prefs:{mode:'family',slotTimes,reminders:true,sound:true,snooze:10,scale:1,elder:ELDER_DEFAULTS()},remind:{},doseTimes,
    patient:{name:'Mdm Tan Siew Lan',short:'Mdm Tan',age:78,pronoun:'she',phone:'',livesAlone:true,allergies:'Penicillin',conditions:'High blood pressure, type 2 diabetes, early memory problems'},
    meds,symptoms,vitals,doses,checkins,chains:{},reports:[],aiReview:null,
    family:{contacts:[{id:uid(),name:'Rachel Tan',relation:'Daughter',phone:'+65 9123 4567',notify:'Urgent alerts and weekly digest'},{id:uid(),name:'Dr Lim',relation:'GP',phone:'+65 6345 0000',notify:'Doctor sheet before visits'}],
      share:{meds:true,symptoms:true,vitals:true,mood:true,chat:false},
      feed:[]},
    appts:[{id:uid(),date:addDays(-26),time:'09:30',with:'Dr Lim (GP)',place:'Clinic, Room 12',purpose:'Blood pressure was high. Amlodipine started.'},{id:uid(),date:addDays(6),time:'10:30',with:'Dr Lim (GP)',place:'Clinic, Room 12',purpose:'3-month review: blood pressure and diabetes'},{id:uid(),date:addDays(34),time:'14:00',with:'Memory clinic',place:'General Hospital, Clinic B',purpose:'Memory follow-up'}],
    chat:[{who:'bot',text:'Good morning, Mdm Tan! How did you sleep, and how are you feeling today?',ts:'08:00'}],
    events:[],supervision:{[addDays(-1)]:{by:['Rachel Tan'],at:'19:00'},[addDays(-3)]:{by:['Rachel Tan'],at:'18:30'}},prnQty:{}
  };
}
