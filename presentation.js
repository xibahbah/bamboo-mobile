/* Presentation controls drive the actual, isolated widget specimen. No saved-state writes. */
(()=>{
 const frame=document.getElementById('demo'),play=document.getElementById('play'),buttons=[...document.querySelectorAll('[data-day]')];
 const stages=[1,7,15,30],notes=['A small beginning. Every amount counts.','Seven days of showing up.','Small acts become a daily habit.','Thirty days of care, made visible.'];
 let timer=0,current=0,ready=false;
 function stop(){clearInterval(timer);timer=0;play.textContent='Play growth →';play.setAttribute('aria-pressed','false');}
 function select(day){if(!ready)return;const control=frame.contentDocument.querySelector(`[data-day="${day}"]`);if(!control)return;control.click();current=stages.indexOf(day);buttons.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.day)===day)));document.getElementById('stage-note').textContent=notes[current];}
 buttons.forEach(b=>b.addEventListener('click',()=>{stop();select(Number(b.dataset.day));}));
 play.addEventListener('click',()=>{if(timer){stop();return;}select(1);play.textContent='Pause growth';play.setAttribute('aria-pressed','true');timer=setInterval(()=>{select(stages[current+1]);if(current===stages.length-1)stop();},1800);});
 frame.addEventListener('load',()=>{
  stop();const d=frame.contentDocument;if(!d?.getElementById('widget')){ready=false;document.getElementById('stage-note').textContent='Open the interactive widget using the link below.';return;}
  const style=d.createElement('style');style.textContent='html,body{background:transparent!important}header,footer,.intro{display:none!important}.layout{display:block!important;margin:0!important;padding:0!important}.phone{min-height:680px!important;box-shadow:none!important}.layout>section{width:100%}';d.head.append(style);
  ready=true;buttons.forEach(b=>b.disabled=false);play.disabled=false;select(1);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
})();
