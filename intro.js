/* 1.8s opening. SVG boundaries are baked offline; playback never changes money or growth. */
(()=>{
 const launch=document.getElementById('launch');
 const art=document.getElementById('launch-art');
 const renderer=window.BambooMotion?.createRenderer(art);
 const duration=window.BambooMotion?.duration||0;
 const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let frameRequest=0,deadline=0,started=0,running=false;
 function draw(elapsed){
  if(renderer)renderer.render(elapsed);
  else art.innerHTML=window.BambooFrames.last;
 }
 function stop(){cancelAnimationFrame(frameRequest);clearTimeout(deadline);frameRequest=0;deadline=0;running=false;}
 function finish(){
  if(!running)return;
  stop();draw(duration);launch.close();window.BambooDaily.show();
 }
 function tick(now){
  if(!running)return;
  const elapsed=now-started;
  draw(elapsed);
  if(elapsed>=duration){finish();return;}
  frameRequest=requestAnimationFrame(tick);
 }
 function play(){
  stop();
  const daily=document.getElementById('daily');if(daily.open)daily.close();
  art.setAttribute('aria-label','A coin enters a bamboo bank, which becomes a growing grove');
  draw(0);if(!launch.open)launch.showModal();document.documentElement.classList.remove('bamboo-boot');running=true;
  if(reducedMotion?.matches||!renderer){finish();return;}
  started=performance.now();
  deadline=setTimeout(finish,duration);
  frameRequest=requestAnimationFrame(tick);
 }
 document.getElementById('launch-skip').addEventListener('click',finish);
 launch.addEventListener('cancel',event=>{event.preventDefault();finish();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 reducedMotion?.addEventListener?.('change',event=>{if(event.matches)finish();});
 window.BambooIntro={play,duration};
 const initialView=new URLSearchParams(location.search).get('view');
 if(initialView==='karma'){window.BambooDaily.show();document.documentElement.classList.remove('bamboo-boot');}
 else if(initialView!=='home')play();
})();
