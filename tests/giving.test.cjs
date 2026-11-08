const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),scene=require('../giving/scene.js');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function dom(t,url='http://localhost/giving.html'){
 const d=new JSDOM(read('giving.html'),{url,runScripts:'outside-only',pretendToBeVisual:true}),w=d.window;t.after(()=>w.close());
 w.matchMedia=()=>({matches:true});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 return {w,d:w.document};
}
function local(t,{saved,settings,url}={}){const a=dom(t,url);if(saved)a.w.localStorage.setItem('bamboo-org-giving-v1',JSON.stringify(saved));if(settings)a.w.localStorage.setItem('bamboo-org-giving-settings-v1',JSON.stringify(settings));a.w.setTimeout=fn=>setTimeout(fn,0);a.w.eval(read('giving/adapter.js'));a.adapter=a.w.BambooGivingAdapter;return a;}
async function controller(t,{growthDays=15,donate}={}){
 const a=dom(t,"http://localhost/giving.html?recipient=table&name=Ignored");let saved={growthDays,streak:growthDays,amountCents:10,environment:'forest',panorama:false};let calls=0;
 a.w.BambooGivingAdapter={organizations:{table:'The Neighborhood Table'},load:async()=>({...saved}),savePreferences:async p=>Object.assign(saved,p),donate:async request=>{calls++;return donate?donate(request):Object.assign(saved,{growthDays:saved.growthDays+1,streak:saved.streak+1});}};
 a.w.eval(read('giving/scene.js'));await a.w.eval(read('giving/app.js'));return {...a,calls:()=>calls,click:id=>a.d.getElementById(id).click()};
}
test('fourteen segments make a bamboo, and only six bamboo can grow',()=>{
 assert.equal(scene.plantState(0,0).height,0);assert.equal(scene.plantState(1,0).segments,1);
 assert.equal(scene.plantState(14,0).complete,true);assert.equal(scene.plantState(14,0).segments,14);
 assert.equal(scene.layout(14,true,.47).length,1);assert.equal(scene.layout(28,true,.47).length,2);
 assert.equal(scene.plantState(15,1).age,1);assert.equal(scene.plantState(28,1).complete,true);
 assert.equal(scene.layout(84,true,.47).length,6);assert.equal(scene.layout(365,true,.47).length,6);
});
test('leaf growth follows six completed bamboo and cannot change their height',()=>{
 for(let i=0;i<6;i++)assert.equal(scene.plantState(84,i).leaves,0);
 assert.equal(scene.plantState(85,0).leaves,1);assert.equal(scene.plantState(85,1).leaves,0);
 for(let i=0;i<6;i++){assert.equal(scene.plantState(90,i).leaves,1);assert.equal(scene.plantState(365,i).height,scene.plantState(84,i).height);}
 assert.equal(scene.plantState(100,6).height,0);
});
test('environment and view changes preserve geometry progress and produce valid SVG',()=>{
 for(const environment of ['forest','coast','desert'])for(const days of [0,1,15,16,30,31,365]){
  const svg=scene.render({days,environment,panorama:true,aspect:.47});assert.doesNotMatch(svg,/NaN|undefined|Infinity/);
  const d=new JSDOM(svg,{contentType:'image/svg+xml'});assert.equal(d.window.document.querySelectorAll('[data-plant]').length,Math.min(6,Math.max(1,Math.ceil(days/14))));d.window.close();
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
test('two deliberate taps queue two separate gifts and reward each success',async t=>{
 const pending=[];const a=await controller(t,{donate:()=>new Promise(resolve=>pending.push(resolve))});
 let rewards=0;const rewardHost=a.d.getElementById('heart-rewards'),append=rewardHost.append.bind(rewardHost);rewardHost.append=(...nodes)=>{rewards+=nodes.length;append(...nodes);};
 assert.equal(a.d.querySelectorAll('.scene-controls button').length,3);a.click('give');a.click('give');await flush();assert.equal(a.calls(),1);assert.equal(a.d.getElementById('give').disabled,false);
 pending[0]({growthDays:16,streak:16});await flush();assert.equal(a.calls(),2);
 pending[1]({growthDays:17,streak:16});await flush();assert.equal(a.d.getElementById('streak-value').textContent,'16');assert.equal(rewards,2);assert.equal(a.d.getElementById('give').getAttribute('aria-busy'),'false');
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
 assert.equal(a.d.getElementById('view-trigger').getAttribute('aria-pressed'),'true');assert.equal(a.d.querySelectorAll('[data-plant]').length,3);assert.equal(a.d.getElementById('streak-value').textContent,'31');assert.match(a.d.getElementById('landscape').innerHTML,/#e6d9bc/);
});

test('repeat gifts on one date add receipts but only one growth and streak day',async t=>{
 const a=local(t,{saved:{growthDays:13,streak:13}});
 await a.adapter.donate({amountCents:10,idempotencyKey:'one'});
 const second=await a.adapter.donate({amountCents:20,idempotencyKey:'two'});
 assert.equal(second.growthDays,14);assert.equal(second.streak,14);assert.equal(second.receivedCents,30);
});
test('a new San Diego date adds one segment; a missed date resets streak, not earned growth',async t=>{
 const a=local(t,{saved:{growthDays:28,streak:28,lastGivingDate:'2026-11-05'}});
 const BaseDate=a.w.Date;a.w.Date=class extends BaseDate{constructor(...args){super(...(args.length?args:['2026-11-07T20:00:00Z']));}};
 const result=await a.adapter.donate({amountCents:10,idempotencyKey:'new-day'});
 assert.equal(result.growthDays,29);assert.equal(result.streak,1);assert.equal(result.lastGivingDate,'2026-11-07');
});

test('gift receipt retains the chosen recipient and retry cannot change its destination',async t=>{const a=local(t);const recipient={id:'table',name:'Ignored client name',storyId:'table-request'};const result=await a.adapter.donate({amountCents:10,idempotencyKey:'targeted',recipient});assert.equal(result.receipts.at(-1).recipient.id,'table');await assert.rejects(a.adapter.donate({amountCents:10,idempotencyKey:'targeted',recipient:{id:'roots'}}));});

test('grove heart submits a general gift and preserves current visual geometry',async t=>{const a=dom(t);let request;a.w.BambooGivingAdapter={load:async()=>({growthDays:28,streak:28,amountCents:10,environment:'forest'}),donate:async r=>{request=r;return {growthDays:29,streak:29}}};a.w.eval(read('giving/scene.js'));await a.w.eval(read('giving/app.js'));const before=a.d.getElementById('landscape').innerHTML;a.d.getElementById('give').click();await flush();assert.equal(request.recipient,null);assert.equal(a.d.getElementById('landscape').innerHTML,before);assert.equal(a.d.getElementById('give').hidden,false);assert.match(a.d.getElementById('give').getAttribute('aria-label'),/General donation/);});

test('growth animates only on the first grove visit of a San Diego day',async t=>{
 async function visit(marker){const a=dom(t);a.w.matchMedia=()=>({matches:false});let frames=0;a.w.requestAnimationFrame=()=>++frames;a.w.cancelAnimationFrame=()=>{};if(marker)a.w.localStorage.setItem('bamboo-grove-entrance-v1',marker);a.w.BambooGivingAdapter={organizations:{table:'The Neighborhood Table'},load:async()=>({growthDays:3,streak:3,amountCents:10,environment:'forest'})};a.w.eval(read('giving/scene.js'));await a.w.eval(read('giving/app.js'));return {...a,frames:()=>frames};}
 const first=await visit();assert.equal(first.frames(),1);const marker=first.w.localStorage.getItem('bamboo-grove-entrance-v1');assert.ok(marker);first.d.getElementById('give').click();assert.equal(first.frames(),1);
 const repeat=await visit(marker);assert.equal(repeat.frames(),0);repeat.d.getElementById('give').click();assert.equal(repeat.frames(),0);
 const next=await visit('2000-01-01');assert.equal(next.frames(),1);
});

test('widget illustration stays legible and bounded while streak color deepens',()=>{
 for(const day of [0,1,3,7,14,28,84,90,365]){const art=scene.widget(day);assert.doesNotMatch(art,/NaN|undefined|Infinity/);const doc=new JSDOM('<svg xmlns="http://www.w3.org/2000/svg">'+art+'</svg>',{contentType:'image/svg+xml'});assert.equal(doc.window.document.querySelectorAll('[data-plant]').length,Math.min(6,Math.max(1,Math.ceil(day/14))));doc.window.close();}
 const color=day=>scene.streakColor(day).match(/\d+/g).map(Number);
 for(let day=2;day<=90;day++)assert.ok(color(day).every((n,i)=>n<=color(day-1)[i]));
 assert.equal(scene.streakColor(30),scene.streakColor(90));
});
test('general gifts allocate every cent to demo-verified organizations and rotate small gifts',async t=>{const a=local(t),seen=[];for(let i=0;i<8;i++){const s=await a.adapter.donate({amountCents:1,idempotencyKey:'cent-'+i});const r=s.receipts.at(-1);assert.equal(r.recipient.type,'pool');assert.equal(r.allocations.reduce((sum,x)=>sum+x.amountCents,0),1);seen.push(r.allocations[0].id);}assert.equal(new Set(seen).size,8);assert.ok(!seen.includes('digital'));const result=await a.adapter.donate({amountCents:103,idempotencyKey:'split'});assert.equal(result.receipts.at(-1).allocations.reduce((sum,x)=>sum+x.amountCents,0),103);assert.equal(result.growthDays,15);const repeat=await a.adapter.donate({amountCents:103,idempotencyKey:'split'});assert.equal(repeat.receipts.length,9);});
