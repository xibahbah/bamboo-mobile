const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),scene=require('../giving/scene.js');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function dom(t,url='http://localhost/giving.html'){
 const d=new JSDOM(read('giving.html'),{url,runScripts:'outside-only'}),w=d.window;t.after(()=>w.close());
 w.matchMedia=()=>({matches:true});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 return {w,d:w.document};
}
function local(t,{saved,settings,url}={}){const a=dom(t,url);if(saved)a.w.localStorage.setItem('bamboo-giving-v1',JSON.stringify(saved));if(settings)a.w.localStorage.setItem('bamboo-giving-settings-v1',JSON.stringify(settings));a.w.setTimeout=fn=>setTimeout(fn,0);a.w.eval(read('giving/adapter.js'));a.adapter=a.w.BambooGivingAdapter;return a;}
async function controller(t,{growthDays=15,donate}={}){
 const a=dom(t);let saved={growthDays,streak:growthDays,amountCents:10,environment:'forest',panorama:false};let calls=0;
 a.w.BambooGivingAdapter={load:async()=>({...saved}),savePreferences:async p=>Object.assign(saved,p),donate:async request=>{calls++;return donate?donate(request):Object.assign(saved,{growthDays:saved.growthDays+1,streak:saved.streak+1});}};
 a.w.eval(read('giving/scene.js'));await a.w.eval(read('giving/app.js'));return {...a,calls:()=>calls,click:id=>a.d.getElementById(id).click()};
}
test('growth milestones keep 15 leafless, add leaves after 15, and retain mature plants at 31',()=>{
 assert.equal(scene.layout(0,false,.5).length,0);assert.equal(scene.plantState(0,0).height,0);
 assert.ok(scene.plantState(1,0).height<scene.plantState(15,0).height/10);assert.equal(scene.plantState(15,0).leaves,0);
 assert.equal(scene.plantState(16,0).height,scene.plantState(15,0).height);assert.equal(scene.plantState(16,0).leaves,1);
 assert.equal(scene.plantState(30,0).leaves,15);assert.equal(scene.plantState(30,0).complete,true);
 assert.equal(scene.plantState(31,0).complete,true);assert.equal(scene.plantState(31,1).age,1);assert.equal(scene.layout(31,true,.5).length,2);
});
test('365 days means twelve completed plants and a five-day thirteenth',()=>{
 const grove=scene.layout(365,true,.47);assert.equal(grove.length,13);
 for(let i=0;i<12;i++)assert.equal(scene.plantState(365,i).complete,true);
 assert.equal(scene.plantState(365,12).age,5);assert.equal(scene.plantState(365,12).leaves,0);
 assert.equal(scene.layout(360,true,.47).length,12);assert.equal(scene.layout(365,false,.47).at(-1).index,12);
 assert.notEqual(scene.plantState(30,0).height,scene.plantState(60,1).height);
});
test('environment and view changes preserve geometry progress and produce valid SVG',()=>{
 for(const environment of ['forest','coast','desert'])for(const days of [0,1,15,16,30,31,365]){
  const svg=scene.render({days,environment,panorama:true,aspect:.47});assert.doesNotMatch(svg,/NaN|undefined|Infinity/);
  const d=new JSDOM(svg,{contentType:'image/svg+xml'});assert.equal(d.window.document.querySelectorAll('[data-plant]').length,Math.ceil(days/30));d.window.close();
 }
});
test('demo reads saved settings and idempotent donation advances exactly once',async t=>{
 const a=local(t,{saved:{growthDays:14,streak:14},settings:{amountCents:50}});assert.equal((await a.adapter.load()).amountCents,50);
 const [one,two]=await Promise.all([a.adapter.donate({amountCents:50,idempotencyKey:'same'}),a.adapter.donate({amountCents:50,idempotencyKey:'same'})]);
 assert.equal(one.growthDays,15);assert.equal(two.growthDays,15);assert.equal((await a.adapter.load()).receivedCents,50);
 await assert.rejects(a.adapter.donate({amountCents:100,idempotencyKey:'same'}),/different amount/);
});
test('amount does not speed up growth; preferences preserve earned plants',async t=>{
 for(const amount of [1,10000]){const a=local(t,{saved:{growthDays:30,streak:2}});const paid=await a.adapter.donate({amountCents:amount,idempotencyKey:'new'});assert.equal(paid.growthDays,31);assert.equal(paid.streak,3);await a.adapter.savePreferences({environment:'coast',panorama:true});const state=await a.adapter.load();assert.equal(state.growthDays,31);assert.equal(state.receivedCents,amount);assert.equal(state.environment,'coast');}
});
test('failed preview leaves progress and money untouched',async t=>{
 const a=local(t,{url:'http://localhost/giving.html?simulate=failure',saved:{growthDays:30,streak:15,receivedCents:100}});
 await assert.rejects(a.adapter.donate({amountCents:10,idempotencyKey:'fail'}));const state=await a.adapter.load();assert.equal(state.growthDays,30);assert.equal(state.receivedCents,100);
});
test('only three scene actions and a request lock prevent duplicate taps',async t=>{
 let resolve;const a=await controller(t,{donate:()=>new Promise(r=>resolve=r)});assert.equal(a.d.querySelectorAll('.scene-controls button').length,3);
 a.click('give');a.click('give');await flush();assert.equal(a.calls(),1);assert.equal(a.d.getElementById('give').disabled,true);assert.equal(a.d.getElementById('streak-value').textContent,'15');
 resolve({growthDays:16,streak:16});await flush();assert.equal(a.d.getElementById('streak-value').textContent,'16');assert.equal(a.d.getElementById('give').disabled,false);assert.equal(a.d.querySelector('dialog[open]'),null);
});
test('failed response does not grow bamboo and allows retry',async t=>{
 const a=await controller(t,{donate:()=>Promise.reject(new Error('Couldn’t complete this preview.'))});const before=a.d.getElementById('landscape').innerHTML;
 a.click('give');await flush();assert.equal(a.d.getElementById('landscape').innerHTML,before);assert.equal(a.d.getElementById('failure').hidden,false);assert.equal(a.d.getElementById('give').disabled,false);
});
test('server can confirm a payment without adding a growth day',async t=>{
 const a=await controller(t,{donate:()=>({growthDays:15,streak:15})});a.click('give');await flush();assert.equal(a.d.getElementById('streak-value').textContent,'15');assert.equal(a.d.getElementById('give').disabled,false);
});
test('donating in panorama preserves the selected view and environment',async t=>{
 const a=await controller(t,{growthDays:30});a.click('view-trigger');await flush();a.click('environment-trigger');a.d.querySelector('[data-environment="coast"]').click();await flush();a.click('give');await flush();
 assert.equal(a.d.getElementById('view-trigger').getAttribute('aria-pressed'),'true');assert.equal(a.d.querySelectorAll('[data-plant]').length,2);assert.equal(a.d.getElementById('streak-value').textContent,'31');assert.match(a.d.getElementById('landscape').innerHTML,/#e6d9bc/);
});
