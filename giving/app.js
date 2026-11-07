(async function(){
 const $=id=>document.getElementById(id),adapter=window.BambooGivingAdapter,scene=window.BambooGivingScene;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let state,visualDays=0,busy=false,animation=0;
 const fail=message=>{$('failure').textContent=message;$('failure').hidden=false;};
 function render(){if(!state)return;$('landscape').innerHTML=scene.render({days:visualDays,environment:state.environment,panorama:state.panorama,aspect:innerWidth/innerHeight});$('streak-value').textContent=state.streak;$('streak-value').parentElement.setAttribute('aria-label',`${state.streak} day giving streak`);$('view-trigger').setAttribute('aria-pressed',String(state.panorama));$('view-trigger').setAttribute('aria-label',state.panorama?'Show the current bamboo':'Show the whole grove');$('view-icon').setAttribute('d',state.panorama?'M4 9h5V4M20 9h-5V4M9 20v-5H4M15 20v-5h5':'M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5');}
 function grow(from,to){return new Promise(resolve=>{if(reduced.matches||from===to){visualDays=to;render();resolve();return;}const start=performance.now();function frame(now){const t=Math.min(1,(now-start)/1600),ease=t*t*(3-2*t);visualDays=from+(to-from)*ease;render();if(t<1)animation=requestAnimationFrame(frame);else{animation=0;resolve();}}animation=requestAnimationFrame(frame);});}
 $('give').addEventListener('click',async()=>{
  if(busy||!state)return;busy=true;$('give').disabled=true;$('give').setAttribute('aria-busy','true');$('failure').hidden=true;
  try{const current=await adapter.load();const result=await adapter.donate({amountCents:current.amountCents,idempotencyKey:crypto.randomUUID()});if(!Number.isInteger(result.growthDays)||result.growthDays<0||(!Number.isInteger(result.streak)||result.streak<0))throw new Error('Growth could not be confirmed. Please retry.');const before=visualDays;state={...state,...result,environment:state.environment,panorama:state.panorama};$('give').setAttribute('aria-busy','false');await grow(before,state.growthDays);$('announcement').textContent=`Preview complete. Growth day ${state.growthDays}. No real payment.`;
  }catch(error){fail(error.message||'Couldn’t complete this preview. Try again.');}finally{busy=false;$('give').disabled=false;$('give').setAttribute('aria-busy','false');}
 });
 $('view-trigger').addEventListener('click',async()=>{if(!state)return;const next=!state.panorama;try{await adapter.savePreferences({panorama:next});state.panorama=next;render();}catch{fail('Couldn’t save this view. Try again.');}});
 $('environment-trigger').addEventListener('click',()=>{if(!state)return;document.querySelectorAll('[data-environment]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.environment===state.environment)));$('environments').showModal();});
 $('environment-close').addEventListener('click',()=>$('environments').close());
 document.querySelectorAll('[data-environment]').forEach(button=>button.addEventListener('click',async()=>{try{await adapter.savePreferences({environment:button.dataset.environment});state.environment=button.dataset.environment;render();$('environments').close();}catch{fail('Couldn’t save this environment. Try again.');}}));
 $('environments').addEventListener('click',event=>{if(event.target===$('environments')){const rect=event.target.getBoundingClientRect();if(event.clientY<rect.top)$('environments').close();}});
 window.addEventListener('resize',render);
 if(parent!==window){$('navigation').hidden=true;$('navigation').setAttribute('aria-label','Back to Bamboo');$('navigation').innerHTML='<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h11"/></svg>';$('navigation').addEventListener('click',event=>{event.preventDefault();parent.postMessage({type:'bamboo:giving-navigation'},location.origin);});}
 try{state=await adapter.load();visualDays=state.growthDays;render();$('give').disabled=false;}catch{fail('Couldn’t load your bamboo. Please reload.');}
})();
