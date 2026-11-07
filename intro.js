/* Review mode: first/last stills. The full morph is intentionally not implemented. */
(()=>{
 const launch=document.getElementById('launch');
 const art=document.getElementById('launch-art');
 const switchFrame=frame=>{
   art.innerHTML=window.BambooFrames[frame];
   art.setAttribute('aria-label',frame==='first'?'First frame: a bamboo coin bank':'Last frame: a minimal bamboo grove');
   launch.querySelectorAll('[data-frame]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.frame===frame)));
 };
 const play=()=>{switchFrame('first');if(!launch.open)launch.showModal();};
 launch.querySelectorAll('[data-frame]').forEach(button=>button.addEventListener('click',()=>switchFrame(button.dataset.frame)));
 document.getElementById('launch-skip').addEventListener('click',()=>{launch.close();window.BambooDaily.show();});
 window.BambooIntro={play};
 if(new URLSearchParams(location.search).get('view')!=='home')play();
})();
