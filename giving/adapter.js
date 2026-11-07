/* Demo adapter only. Production replaces window.BambooGivingAdapter before app.js. */
(function(){
 const key='bamboo-giving-v1',settingsKey='bamboo-giving-settings-v1';
 const read=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(name))||fallback;}catch{return fallback;}};
 const valid=n=>Number.isInteger(n)&&n>=1&&n<=1000000;
 function settings(){const s=read(settingsKey,{}),app=read('bamboo-ui-v1',{});const amount=s.amountCents??app.donationAmountCents??10;return {amountCents:valid(amount)?amount:null};}
 function load(){const app=read('bamboo-ui-v1',{}),saved=read(key,{});return {mode:'demo',growthDays:Number.isInteger(saved.growthDays)&&saved.growthDays>=0?saved.growthDays:(app.paid?15:14),streak:Number.isInteger(saved.streak)&&saved.streak>=0?saved.streak:(app.paid?15:14),environment:['forest','coast','desert'].includes(saved.environment)?saved.environment:'forest',panorama:!!saved.panorama,receivedCents:saved.receivedCents||0,receipts:saved.receipts||[],...settings()};}
 const jobs=new Map();
 const adapter={load:async()=>load(),savePreferences:async preference=>{const old=load();localStorage.setItem(key,JSON.stringify({...old,...preference}));return load();},donate:({amountCents,idempotencyKey})=>{
  if(jobs.has(idempotencyKey)){const existing=jobs.get(idempotencyKey);return existing.amount===amountCents?existing.promise:Promise.reject(new Error('This request already used a different amount.'));}
  const job=new Promise((resolve,reject)=>setTimeout(()=>{try{
   if(!valid(amountCents))throw new Error('Set a valid donation amount in settings first.');
   if(new URLSearchParams(location.search).get('simulate')==='failure')throw new Error('This preview couldn’t complete. Try again.');
   const old=load(),receipt=old.receipts.find(r=>r.id===idempotencyKey);
   if(receipt){if(receipt.amountCents!==amountCents)throw new Error('This request already used a different amount.');resolve({...old,amountCents});return;}
   const next={...old,growthDays:old.growthDays+1,streak:old.streak+1,receivedCents:old.receivedCents+amountCents,receipts:[...old.receipts,{id:idempotencyKey,amountCents}].slice(-100)};
   localStorage.setItem(key,JSON.stringify(next));resolve(next);
  }catch(error){reject(error);}},420));jobs.set(idempotencyKey,{amount:amountCents,promise:job});return job;
 }};
 window.BambooGivingAdapter=window.BambooGivingAdapter||adapter;
})();
