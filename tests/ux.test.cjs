const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'ui.js'),'utf8');
function app(t,stored){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost/',runScripts:'outside-only'});
 const w=dom.window,d=w.document;w.scrollTo=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 if(stored)w.localStorage.setItem('bamboo-org-ui-v1',JSON.stringify(stored));
 w.eval(fs.readFileSync(path.join(root,"location-settings.js"),"utf8"));w.eval(code);t.after(()=>w.close());
 const action=(a)=>{const e=d.querySelector(`[data-action="${a}"]`);assert.ok(e,`action exists: ${a}`);e.click();};
 const fill=(selector,value)=>{const e=d.querySelector(selector);assert.ok(e,selector);e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const submit=id=>d.getElementById(id).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const saved=()=>JSON.parse(w.localStorage.getItem('bamboo-org-ui-v1'));
 const text=()=>d.getElementById('main').textContent;
 const pay=()=>{action('donate');submit('donate-form');action('pay');};
 return {w,d,action,fill,submit,saved,text,pay};
}
test('all sidebar destinations render and the drawer closes on navigation',t=>{const a=app(t);for(const v of ['home','map','giving','inbox','saved','you','settings']){a.action('menu');assert.equal(a.d.getElementById('sidebar').open,true);assert.equal(a.d.getElementById('menu-trigger').getAttribute('aria-expanded'),'true');a.action(v);assert.equal(a.d.getElementById('sidebar').open,false);assert.equal(a.d.querySelector('#drawer-content [aria-current="page"]').dataset.action,v);assert.ok(a.text().length>20||a.d.querySelector("iframe"));}assert.equal(a.d.querySelectorAll('nav[aria-label="Main navigation"] button').length,8);});
test('like and unlike are reversible and persistent',t=>{const a=app(t);a.action('like:table-request');assert.deepEqual(a.saved().likes,['table-request']);a.action('like:table-request');assert.deepEqual(a.saved().likes,[]);});
test('feed repost replaces bookmark, keeps contact, persists and can be undone from profile',t=>{const a=app(t);assert.equal(a.d.querySelector('.post-actions [data-action^="save:"]'),null);assert.ok(a.d.querySelector('[data-action="reply:table"]'));a.action('repost:table-request');assert.deepEqual(a.saved().reposts,['table-request']);assert.equal(a.d.querySelector('[data-action="repost:table-request"]').getAttribute('aria-pressed'),'true');a.action('you');assert.match(a.text(),/Reposts/);assert.match(a.text(),/pantry stocked/);a.action('repost:table-request');assert.deepEqual(a.saved().reposts,[]);assert.doesNotMatch(a.text(),/pantry stocked/);});
test('map tab opens the community wallpaper',t=>{const a=app(t);a.action('map');assert.ok(a.d.querySelector('.community-wallpaper-frame'));assert.match(a.d.querySelector('#bottom-nav [aria-current]').textContent,/Community/);});
test('chat drafts survive navigation, send locally, and keep streak unchanged',t=>{const a=app(t);a.action('inbox');a.action('chat:donor-lee');a.fill('#message-form textarea','Hello Maria');a.action('inbox');a.action('chat:donor-lee');assert.equal(a.d.querySelector('textarea').value,'Hello Maria');a.submit('message-form');assert.equal(a.saved().messages[0].to,'donor-lee');assert.equal(a.saved().paid,false);assert.match(a.text(),/Local demo request/);});
test('profile edits and initial are updated; blank name rejected',t=>{const a=app(t);a.action('you');a.action('edit-profile');a.fill('#profile-form input','  ');a.submit('profile-form');assert.equal(a.d.getElementById('dialog').open,true);a.fill('#profile-form input','Keith');a.fill('#profile-form textarea','<b>Neighbor</b>');a.submit('profile-form');assert.match(a.text(),/Keith/);assert.match(a.text(),/<b>Neighbor/);assert.equal(a.d.querySelector('.avatar.mine').textContent,'K');});
test('three quiet themes save and persist after reload',t=>{const a=app(t);a.action('settings');for(const theme of ['stone','mist','clay']){a.action('theme:'+theme);assert.equal(a.d.body.dataset.theme,theme);}const b=app(t,a.saved());assert.equal(b.d.body.dataset.theme,'clay');});
test('wall opt-in requires consent, can be removed, and preserves streak',t=>{const a=app(t);a.w.localStorage.setItem('bamboo-org-giving-v1',JSON.stringify({streak:15}));a.action('settings');a.action('wall-consent');const box=a.d.querySelector('#wall-form input');assert.equal(box.checked,false);assert.equal(box.required,true);a.submit('wall-form');assert.equal(a.saved()?.wall??false,false);box.checked=true;a.submit('wall-form');assert.equal(a.saved().wall,true);a.action('settings');a.action('wall-off');assert.equal(a.saved().wall,false);assert.equal(a.w.localStorage.getItem('bamboo-org-giving-v1'),JSON.stringify({streak:15}));});
test('stay private button never submits wall form',t=>{const a=app(t);a.w.localStorage.setItem('bamboo-org-giving-v1',JSON.stringify({streak:15}));a.action('settings');a.action('wall-consent');a.action('close');assert.equal(a.saved()?.wall??false,false);assert.equal(a.d.getElementById('dialog').open,false);});
test('help access has no donor prerequisite',t=>{const a=app(t);a.action('you');a.action('help');assert.match(a.text(),/don’t need to donate/);a.action('chat:team');assert.match(a.text(),/private|request/);});
test('browser back restores a previous destination',async t=>{const a=app(t);a.action('map');a.action('inbox');const event=new Promise(resolve=>a.w.addEventListener('popstate',resolve,{once:true}));a.w.history.back();await event;assert.ok(a.d.querySelector('.community-wallpaper-frame'));assert.equal(a.d.querySelector('#bottom-nav [aria-current]').dataset.action,'map');});
test('referenced local assets exist',t=>{app(t);for(const name of ['quiet.css','ui.css','ui.js','assets/ui-font.woff2','assets/community-recipe.png','assets/days/day-14.png','assets/days/day-15.png','assets/bamboo-bank.png'])assert.ok(fs.existsSync(path.join(root,name)),name);});

test('organization profile has organization updates and no personal-content tabs',t=>{const a=app(t);a.action('profile:table');assert.match(a.text(),/Contact organization/);assert.match(a.text(),/pantry stocked/);assert.equal(a.d.querySelector('[data-action="profile-tab:recipe"]'),null);});

test('daily reflection is stable per San Diego day and changes at midnight',t=>{const a=app(t);a.w.eval(fs.readFileSync(path.join(root,'daily.js'),'utf8'));const at=iso=>a.w.BambooDaily.forDate(new Date(iso));assert.equal(at('2026-11-07T09:00:00Z').text,at('2026-11-08T07:59:59Z').text);assert.notEqual(at('2026-11-08T07:59:59Z').text,at('2026-11-08T08:00:00Z').text);assert.equal(at('2026-11-08T08:00:00Z').key,'2026-11-08');});
test('daily rotation has 30 distinct original reflections',t=>{const a=app(t);a.w.eval(fs.readFileSync(path.join(root,'daily.js'),'utf8'));const quotes=Array.from({length:30},(_,i)=>a.w.BambooDaily.forDate(new Date(Date.UTC(2026,10,7+i,20))));assert.equal(new Set(quotes.map(q=>q.text)).size,30);assert.equal(quotes.filter(q=>q.original).length,30);assert.ok(quotes.every(q=>q.source||q.author==='Bamboo'));a.w.BambooDaily.show();a.d.getElementById('daily-enter').click();assert.equal(a.d.getElementById('daily').open,false);assert.equal(a.saved(),null);});

function introApp(t,{reduced=false,home=false,view=null}={}){
 const a=app(t);let now=0,id=0;const raf=new Map(),timers=new Map();
 if(home||view)a.w.history.replaceState({},'', '?view='+(view||'home'));
 Object.defineProperty(a.w.performance,'now',{value:()=>now});
 a.w.matchMedia=()=>({matches:reduced,addEventListener:()=>{}});
 a.w.requestAnimationFrame=cb=>{raf.set(++id,cb);return id;};
 a.w.cancelAnimationFrame=key=>raf.delete(key);
 a.w.setTimeout=(cb,delay)=>{timers.set(++id,{cb,at:now+delay});return id;};
 a.w.clearTimeout=key=>timers.delete(key);
 for(const file of ['intro-frames.js','intro-motion.js','daily.js','intro.js'])a.w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const advance=ms=>{now=ms;const callbacks=[...raf.values()];raf.clear();for(const cb of callbacks)cb(now);for(const [key,timer] of [...timers])if(timer.at<=now){timers.delete(key);timer.cb();}};
 return {...a,advance,raf,timers};
}
test('intro morph finishes within two seconds and proceeds once to the daily reflection',t=>{
 const a=introApp(t),art=a.d.getElementById('launch-art');assert.equal(a.d.getElementById('launch').open,true);
 const first=art.innerHTML;a.advance(200);assert.notEqual(art.innerHTML,first);assert.ok(art.querySelector('clipPath'));
 a.advance(750);assert.equal(art.querySelector('#coin').parentElement.getAttribute('visibility'),'hidden');a.advance(1350);assert.ok(art.querySelectorAll('path').length>5);
 a.advance(1799);assert.equal(a.d.getElementById('launch').open,true);a.advance(1800);
 assert.equal(a.d.getElementById('launch').open,false);assert.equal(a.d.getElementById('daily').open,true);
 assert.equal(a.raf.size,0);assert.equal(a.timers.size,0);assert.equal(a.saved(),null);assert.match(a.d.getElementById('streak-trigger').textContent,/14/);
 a.d.getElementById('daily-enter').click();a.advance(2200);assert.equal(a.d.getElementById('daily').open,false);
});
test('skipping stops all pending intro work and does not reopen a dismissed quote',t=>{
 const a=introApp(t);a.advance(200);assert.equal(a.d.getElementById('launch-skip'),null);a.d.getElementById('launch').dispatchEvent(new a.w.Event('cancel',{cancelable:true}));assert.equal(a.d.getElementById('daily').open,true);
 a.d.getElementById('daily-enter').click();a.advance(2500);assert.equal(a.d.getElementById('daily').open,false);assert.equal(a.raf.size,0);assert.equal(a.timers.size,0);
});
test('Escape skips to the daily reflection rather than leaving an orphaned timer',t=>{
 const a=introApp(t);const event=new a.w.Event('cancel',{cancelable:true});a.d.getElementById('launch').dispatchEvent(event);
 assert.equal(event.defaultPrevented,true);assert.equal(a.d.getElementById('daily').open,true);assert.equal(a.timers.size,0);
});
test('reduced-motion preference bypasses animation and shows the daily reflection',t=>{
 const a=introApp(t,{reduced:true});assert.equal(a.d.getElementById('launch').open,false);assert.equal(a.d.getElementById('daily').open,true);assert.equal(a.raf.size,0);assert.equal(a.timers.size,0);
});
test('replay replaces an active animation without competing completion callbacks',t=>{
 const a=introApp(t);a.advance(600);a.w.BambooIntro.play();assert.equal(a.timers.size,1);assert.equal(a.raf.size,1);
 a.advance(1800);assert.equal(a.d.getElementById('launch').open,true);a.advance(2400);assert.equal(a.d.getElementById('daily').open,true);assert.equal(a.timers.size,0);
});
test('direct home link bypasses the opening and daily reflection',t=>{
 const a=introApp(t,{home:true});assert.equal(a.d.getElementById('launch').open,false);assert.equal(a.d.getElementById('daily').open,false);assert.equal(a.raf.size,0);
});
test('continuous morph keeps the same SVG nodes and valid geometry throughout playback',t=>{
 const a=introApp(t,{home:true}),motion=a.w.BambooMotion,svg=a.d.getElementById('launch-art'),renderer=motion.createRenderer(svg);
 const body=svg.querySelector('[data-part="body"]'),count=svg.querySelectorAll('*').length;
 assert.ok(motion.duration<=2000);
 for(let ms=0;ms<=1800;ms+=8){renderer.render(ms);assert.equal(svg.querySelector('[data-part="body"]'),body);assert.equal(svg.querySelectorAll('*').length,count);assert.doesNotMatch(svg.innerHTML,/NaN|undefined|Infinity|<image/);}
 assert.equal(body.getAttribute('d'),motion.sample(1800).d);
});
test('morph has no position or velocity discontinuity at the previous phase boundaries',t=>{
 const a=introApp(t,{home:true}),sample=a.w.BambooMotion.sample;
 for(const ms of [250,310,320,560,650,800,850,1000,1120,1160,1200,1420,1450,1620]){
  const left=sample(ms-.1).coordinates,mid=sample(ms).coordinates,right=sample(ms+.1).coordinates;
  for(let i=0;i<mid.length;i++){assert.ok(Math.abs(right[i]-left[i])<.1,'no positional jump at '+ms);assert.ok(Math.abs((right[i]-mid[i])-(mid[i]-left[i]))<.001,'no speed jump at '+ms);}
 }
});
test('the folding mouth remains clipped to the live body during its continuous morph',t=>{
 const a=introApp(t,{home:true}),svg=a.d.getElementById('launch-art'),renderer=a.w.BambooMotion.createRenderer(svg);
 for(const ms of [350,500,583,650]){
  renderer.render(ms);const rim=svg.querySelector('[data-part="rim"]'),clip=rim.closest('[clip-path]');assert.ok(clip);
  const id=clip.getAttribute('clip-path').slice(5,-1);const use=svg.querySelector('#'+id+' use');assert.equal(use.getAttribute('href'),'#'+svg.querySelector('[data-part="body"]').id);
  assert.equal(svg.querySelector('ellipse'),null);
 }
});
test('a single sentence and button animate, with cancellation on dismissal and replay',t=>{
 const a=app(t),effects=[];a.w.matchMedia=()=>({matches:false,addEventListener:()=>{}});
 a.w.Element.prototype.animate=function(frames,options){const effect={target:this,frames,options,cancelled:false,cancel(){this.cancelled=true;}};effects.push(effect);return effect;};
 a.w.eval(fs.readFileSync(path.join(root,'daily.js'),'utf8'));a.w.BambooDaily.show();
 assert.equal(effects.length,2);assert.equal(effects[0].target.id,'daily-words');assert.equal(effects[1].target.id,'daily-enter');assert.ok(effects[0].options.duration<=900);assert.equal(a.d.querySelector('.karma-card'),null);assert.equal(a.d.querySelector('.karma-leaf'),null);
 a.w.BambooDaily.show();assert.ok(effects.slice(0,2).every(effect=>effect.cancelled));assert.equal(effects.length,4);
 a.d.getElementById('daily-enter').click();assert.ok(effects.every(effect=>effect.cancelled));assert.equal(a.d.getElementById('daily').open,false);assert.equal(a.saved(),null);
});
test('karma entrance respects reduced motion',t=>{
 const a=app(t);a.w.matchMedia=()=>({matches:true,addEventListener:()=>{}});let calls=0;a.w.Element.prototype.animate=()=>{calls++;};
 a.w.eval(fs.readFileSync(path.join(root,'daily.js'),'utf8'));a.w.BambooDaily.show();assert.equal(calls,0);assert.equal(a.d.getElementById('daily').open,true);
});
test('direct karma link shows only a sentence and button and can continue to home',t=>{
 const a=introApp(t,{view:'karma'});assert.equal(a.d.getElementById('launch').open,false);assert.equal(a.d.getElementById('daily').open,true);
 a.d.getElementById('daily-enter').click();assert.equal(a.d.getElementById('daily').open,false);assert.match(a.text(),/pantry stocked/);assert.equal(a.raf.size,0);
});

test('bottom navigation switches all five tabs and widget is reachable',t=>{const a=app(t);for(const id of ['home','map','giving','inbox','you']){a.d.querySelector(`#bottom-nav [data-action="${id}"]`).click();assert.equal(a.d.querySelector('#bottom-nav [aria-current]').dataset.action,id);}a.action('widget');assert.equal(a.d.querySelector('.widget-frame').getAttribute('src'),'widget.html?live=1');assert.equal(a.d.querySelector('#bottom-nav [aria-current]').dataset.action,'you');});
test('widget reads giving streak and updates across tabs without changing donations',t=>{const html=fs.readFileSync(path.join(root,'widget.html'),'utf8');const dom=new JSDOM(html,{url:'http://localhost/widget.html?live=1',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window;w.localStorage.setItem('bamboo-org-giving-v1',JSON.stringify({streak:31,growthDays:365}));w.eval(fs.readFileSync(path.join(root,'widget-locale.js'),'utf8'));w.eval(fs.readFileSync(path.join(root,'giving/scene.js'),'utf8'));w.eval([...w.document.scripts].find(s=>!s.src).textContent);assert.equal(w.document.getElementById('count').textContent,'31');assert.equal(w.document.querySelector('.controls').hidden,true);w.localStorage.setItem('bamboo-org-giving-v1',JSON.stringify({streak:32,growthDays:366}));w.dispatchEvent(new w.StorageEvent('storage',{key:'bamboo-org-giving-v1'}));assert.equal(w.document.getElementById('count').textContent,'32');assert.equal(JSON.parse(w.localStorage.getItem('bamboo-org-giving-v1')).growthDays,366);});


test('launch boot gate hides the feed until the opening modal is ready',t=>{const a=app(t);a.w.eval(a.d.head.querySelector('script').textContent);assert.ok(a.d.documentElement.classList.contains('bamboo-boot'));a.w.matchMedia=()=>({matches:false,addEventListener(){}});a.w.requestAnimationFrame=()=>1;a.w.cancelAnimationFrame=()=>{};let opened=false;a.d.getElementById('launch').showModal=function(){assert.ok(a.d.documentElement.classList.contains('bamboo-boot'));this.open=true;opened=true;};for(const file of ['intro-frames.js','intro-motion.js','daily.js','intro.js'])a.w.eval(fs.readFileSync(path.join(root,file),'utf8'));assert.ok(opened);assert.equal(a.d.documentElement.classList.contains('bamboo-boot'),false);assert.equal(a.d.getElementById('launch').open,true);});
test('preloaded opening stays idle until the app icon starts it',t=>{const a=introApp(t,{view:'preload'});assert.equal(a.d.getElementById('launch').open,true);assert.equal(a.raf.size,0);assert.equal(a.timers.size,0);a.advance(5000);assert.equal(a.d.getElementById('daily').open,false);a.w.BambooIntro.play();a.advance(6800);assert.equal(a.d.getElementById('launch').open,false);assert.equal(a.d.getElementById('daily').open,true);});
