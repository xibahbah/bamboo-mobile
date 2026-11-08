/* Demo adapter only. Production replaces window.BambooGivingAdapter before app.js. */
(function(){
 const key='bamboo-giving-v1',settingsKey='bamboo-giving-settings-v1';
 const read=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(name))||fallback;}catch{return fallback;}};
 const valid=n=>Number.isInteger(n)&&n>=1&&n<=1000000;
 function settings(){const s=read(settingsKey,{}),app=read('bamboo-ui-v1',{});const amount=s.amountCents??app.donationAmountCents??10;return {amountCents:valid(amount)?amount:null};}
 function load(){const app=read('bamboo-ui-v1',{}),saved=read(key,{});return {mode:'demo',growthDays:Number.isInteger(saved.growthDays)&&saved.growthDays>=0?saved.growthDays:(app.paid?15:14),streak:Number.isInteger(saved.streak)&&saved.streak>=0?saved.streak:(app.paid?15:14),environment:['forest','coast','desert'].includes(saved.environment)?saved.environment:'forest',panorama:!!saved.panorama,lastGivingDate:saved.lastGivingDate||null,receivedCents:saved.receivedCents||0,receipts:saved.receipts||[],...settings()};}
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const jobs=new Map();
 const adapter={load:async()=>load(),savePreferences:async preference=>{const old=load();localStorage.setItem(key,JSON.stringify({...old,...preference}));return load();},donate:({amountCents,idempotencyKey,recipient=null})=>{
  if(jobs.has(idempotencyKey)){const existing=jobs.get(idempotencyKey);return existing.amount===amountCents&&existing.target===JSON.stringify(recipient)?existing.promise:Promise.reject(new Error('This request already used a different amount.'));}
  const job=new Promise((resolve,reject)=>setTimeout(()=>{try{
   if(!valid(amountCents))throw new Error('Set a valid donation amount in settings first.');
   if(new URLSearchParams(location.search).get('simulate')==='failure')throw new Error('This preview couldn’t complete. Try again.');
   const old=load(),receipt=old.receipts.find(r=>r.id===idempotencyKey);
   if(receipt){if(receipt.amountCents!==amountCents||JSON.stringify(receipt.recipient||null)!==JSON.stringify(recipient))throw new Error('This request already used a different amount.');resolve({...old,amountCents});return;}
   const date=today(),newDay=old.lastGivingDate!==date;
   const gap=old.lastGivingDate?(Date.parse(date)-Date.parse(old.lastGivingDate))/86400000:1;
   const next={...old,lastGivingDate:date,growthDays:old.growthDays+(newDay?1:0),streak:newDay?(gap===1?old.streak+1:1):old.streak,receivedCents:old.receivedCents+amountCents,receipts:[...old.receipts,{id:idempotencyKey,amountCents,recipient,createdAt:new Date().toISOString(),status:'completed'}]};
   localStorage.setItem(key,JSON.stringify(next));resolve(next);
  }catch(error){reject(error);}},180));jobs.set(idempotencyKey,{amount:amountCents,target:JSON.stringify(recipient),promise:job});return job;
 }};
 window.BambooGivingAdapter=window.BambooGivingAdapter||adapter;
})();
