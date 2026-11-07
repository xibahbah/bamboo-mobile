/* 1.8s opening. SVG boundaries are baked offline; playback never changes money or growth. */
(()=>{
 const launch=document.getElementById('launch');
 const art=document.getElementById('launch-art');
 const frames=window.BambooMotion?.frames||[window.BambooFrames.last];
 const duration=window.BambooMotion?.duration||0;
 const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let frameRequest=0,deadline=0,started=0,running=false,lastFrame=-1;
 function draw(elapsed){
  const index=duration?Math.min(frames.length-1,Math.round(Math.max(0,elapsed)/duration*(frames.length-1))):0;
  if(index!==lastFrame){art.innerHTML=frames[index];lastFrame=index;}
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
  stop();lastFrame=-1;
  const daily=document.getElementById('daily');if(daily.open)daily.close();
  art.setAttribute('aria-label','A coin enters a bamboo bank, which becomes a growing grove');
  draw(0);if(!launch.open)launch.showModal();running=true;
  if(reducedMotion?.matches||frames.length<2){finish();return;}
  started=performance.now();
  deadline=setTimeout(finish,duration);
  frameRequest=requestAnimationFrame(tick);
 }
 document.getElementById('launch-skip').addEventListener('click',finish);
 launch.addEventListener('cancel',event=>{event.preventDefault();finish();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 reducedMotion?.addEventListener?.('change',event=>{if(event.matches)finish();});
 window.BambooIntro={play,duration};
 if(new URLSearchParams(location.search).get('view')!=='home')play();
})();
