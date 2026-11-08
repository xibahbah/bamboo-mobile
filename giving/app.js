(async function(){
 const $=id=>document.getElementById(id),adapter=window.BambooGivingAdapter,scene=window.BambooGivingScene;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const params=new URLSearchParams(location.search);
 const recipient=params.get('recipient')?{id:params.get('recipient').slice(0,80),name:(params.get('name')||'This community member').slice(0,100),storyId:(params.get('story')||'').slice(0,100)}:null;
 let state,visualDays=0,busy=false,animation=0,queue=[];
 const fail=message=>{$('failure').textContent=message;$('failure').hidden=false;};
 function render(){
  if(!state)return;
  $('landscape').innerHTML=scene.render({days:visualDays,environment:state.environment,panorama:state.panorama,aspect:innerWidth/innerHeight});
  $('streak-value').textContent=state.streak;$('streak-value').parentElement.setAttribute('aria-label',`${state.streak} day giving streak`);
  const units=Math.floor(visualDays),amount=((state.amountCents||0)/100).toFixed(2);
  $('growth-title').textContent=units===0?'A little beginning':units>=84?'Your grove is growing leaves':`${Math.min(6,Math.floor(units/14))} bamboo · ${units%14} / 14 segments`;
  $('growth-detail').textContent='One giving day. One new segment.';
  $('recipient-label').textContent=recipient?`For ${recipient.name}`:'For the San Diego community';
  $('tap-amount').textContent=`$${amount} / tap`;$('give').setAttribute('aria-label',`Give $${amount} · demo, no real charge`);
  $('give').hidden=!recipient;$('find-support').hidden=!!recipient;
  $('giving-note').textContent=!recipient?'Find a person to support. Your gifts belong on their profile.':queue.length?`${queue.length} taps waiting · Demo, no real charge`:'Each tap gives once · Demo, no real charge';
  $('view-trigger').setAttribute('aria-pressed',String(state.panorama));$('view-trigger').setAttribute('aria-label',state.panorama?'Show the current bamboo':'Show the whole grove');
 }
 function grow(to){
  cancelAnimationFrame(animation);const from=visualDays;
  if(reduced.matches||from===to){visualDays=to;render();return;}
  const start=performance.now();
  function frame(now){const t=Math.min(1,(now-start)/480);visualDays=from+(to-from)*t*t*(3-2*t);render();if(t<1)animation=requestAnimationFrame(frame);else animation=0;}
  animation=requestAnimationFrame(frame);
 }
 function reward(){
  const heart=document.createElement('span');heart.className='floating-heart';heart.textContent='♥';$('heart-rewards').append(heart);
  if(reduced.matches||!heart.animate){setTimeout(()=>heart.remove(),180);return;}
  const drift=(Math.random()-.5)*20;const rise=Math.max(105,innerHeight*.3);
  const effect=heart.animate([{transform:'translate(-50%, 0) scale(.65)',opacity:0},{transform:'translate(-50%, -20px) scale(1.1)',opacity:1,offset:.18},{transform:`translate(calc(-50% + ${drift}px), -${rise}px) scale(.35)`,opacity:0}],{duration:650,easing:'ease-out'});
  effect.onfinish=()=>heart.remove();effect.oncancel=()=>heart.remove();
 }
 async function drain(){
  if(busy)return;busy=true;
  while(queue.length){
   const request=queue.shift();$('give').setAttribute('aria-busy','true');
   try{
    const result=await adapter.donate(request);
    if(!Number.isInteger(result.growthDays)||result.growthDays<0||!Number.isInteger(result.streak)||result.streak<0)throw new Error('Growth could not be confirmed.');
    state={...state,...result,environment:state.environment,panorama:state.panorama};reward();
    $('announcement').textContent=`$${(request.amountCents/100).toFixed(2)} demo gift completed${recipient?' for '+recipient.name:''}. ${state.growthDays} growth steps.`;
   }catch(error){const cancelled=queue.length;queue=[];fail((error.message||'This gift did not complete.')+(cancelled?` ${cancelled} waiting taps were cancelled.`:''));}
  }
  busy=false;$('give').setAttribute('aria-busy','false');render();
 }
 $('find-support').addEventListener('click',()=>{if(parent!==window)parent.postMessage({type:'bamboo:giving-navigation',discover:true},location.origin);else location.href='index.html?view=home#organizations';});
 $('give').addEventListener('click',()=>{
  if(!state)return;$('failure').hidden=true;
  if(!recipient)return;
  queue.push({amountCents:state.amountCents,idempotencyKey:crypto.randomUUID(),recipient});
  if(!reduced.matches&&$('give').animate)$('give').animate([{transform:'scale(1)'},{transform:'scale(.87)',offset:.3},{transform:'scale(1)'}],{duration:180});
  render();drain();
 });
 $('view-trigger').addEventListener('click',async()=>{if(!state)return;const next=!state.panorama;try{await adapter.savePreferences({panorama:next});state.panorama=next;render();}catch{fail('Couldn’t save this view. Try again.');}});
 $('environment-trigger').addEventListener('click',()=>{if(!state)return;document.querySelectorAll('[data-environment]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.environment===state.environment)));$('environments').showModal();});
 $('environment-close').addEventListener('click',()=>$('environments').close());
 document.querySelectorAll('[data-environment]').forEach(button=>button.addEventListener('click',async()=>{try{await adapter.savePreferences({environment:button.dataset.environment});state.environment=button.dataset.environment;render();$('environments').close();}catch{fail('Couldn’t save this environment. Try again.');}}));
 $('environments').addEventListener('click',event=>{if(event.target===$('environments')){const rect=event.target.getBoundingClientRect();if(event.clientY<rect.top)$('environments').close();}});
 window.addEventListener('resize',render);
 if(parent!==window){$('navigation').hidden=true;$('navigation').setAttribute('aria-label','Back to Bamboo');$('navigation').innerHTML='<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h11"/></svg>';$('navigation').addEventListener('click',event=>{event.preventDefault();parent.postMessage({type:'bamboo:giving-navigation'},location.origin);});}
 try{state=await adapter.load();visualDays=state.growthDays;
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 let firstVisit=false;try{const key='bamboo-grove-entrance-v1';firstVisit=localStorage.getItem(key)!==date;localStorage.setItem(key,date);}catch{}
 if(firstVisit&&!reduced.matches&&state.growthDays>0){visualDays=Math.max(0,state.growthDays-1);render();grow(state.growthDays);}else render();
 $('give').disabled=false;}catch{fail('Couldn’t load your bamboo. Please reload.');}
})();
