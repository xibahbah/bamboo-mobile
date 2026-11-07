/* Original daily reflections, stable for each San Diego calendar day. */
(()=>{
 const originals=[
  'Small kindnesses have a way of finding each other.',
  'Somewhere, a small kindness is still unfolding.',
  'A little room at the table can become a little more room in the world.',
  'You may never see every place your care reaches.',
  'A quiet gesture can stay with someone all day.',
  'There is room to begin gently.',
  'Even a small light changes the room.',
  'What you tend to, grows.',
  'Let today leave something softer behind.',
  'Sometimes, belonging begins with an empty chair pulled closer.',
  'A familiar voice can make a new place feel like home.',
  'Care can be as simple as noticing.',
  'Some roots grow quietly, out of sight.',
  'There is more than one way to make someone feel welcome.',
  'One small gesture can give a difficult day a softer edge.',
  'You do not have to be extraordinary to be a good neighbor.',
  'Leave a little space for someone else’s story.',
  'A shared meal can carry more than food.',
  'A city becomes familiar one kind face at a time.',
  'Some of the things that matter most happen quietly.',
  'Let a small kindness be enough for this moment.',
  'The care you offer can begin close to home.',
  'A little patience is a place for someone to rest.',
  'We grow around one another, like a grove.',
  'Today has room for an unexpected kindness.',
  'There is something generous about simply being here.'
 ];
 const quotes=originals.map(text=>({text,author:'Bamboo',source:null,original:true}));
 // Original short reflections keep the screen to one sentence and one button.
 for(const text of [
  'Let a little care take root today.',
  'A gentle gesture can travel further than you see.',
  'There is a whole world inside the person beside you.',
  'The good we share becomes part of the place we call home.'
 ])quotes.push({text,author:'Bamboo',source:null,original:true});
 const zone='America/Los_Angeles';
 function forDate(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date);
  const value=type=>Number(parts.find(p=>p.type===type).value);
  const day=Math.floor(Date.UTC(value('year'),value('month')-1,value('day'))/86400000);
  const start=Math.floor(Date.UTC(2026,10,7)/86400000);
  const index=((day-start)%quotes.length+quotes.length)%quotes.length;
  return {...quotes[index],key:`${value('year')}-${String(value('month')).padStart(2,'0')}-${String(value('day')).padStart(2,'0')}`,dateLabel:new Intl.DateTimeFormat('en-US',{timeZone:zone,month:'long',day:'numeric'}).format(date)};
 }
 const dialog=document.getElementById('daily');
 let entranceAnimations=[];
 const motionPreference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const stopEntrance=()=>{entranceAnimations.forEach(animation=>animation.cancel());entranceAnimations=[];};
 function animateEntrance(){
  stopEntrance();
  if(motionPreference?.matches)return;
  const words=document.getElementById('daily-words');
  if(typeof words.animate!=='function')return;
  entranceAnimations.push(words.animate([
   {opacity:0,transform:'translateY(14px)',filter:'blur(3px)'},
   {opacity:1,transform:'translateY(0)',filter:'blur(0px)'}
  ],{duration:720,easing:'cubic-bezier(.16,1,.3,1)'}));
  entranceAnimations.push(document.getElementById('daily-enter').animate([
   {opacity:0,transform:'translateY(8px)'},
   {opacity:1,transform:'translateY(0)'}
  ],{duration:460,delay:180,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
 }
 dialog.addEventListener('close',()=>{if(!dialog.open)stopEntrance();});
 dialog.addEventListener('cancel',stopEntrance);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEntrance();});
 motionPreference?.addEventListener?.('change',event=>{if(event.matches)stopEntrance();});
 function show(){
  const quote=forDate();
  document.getElementById('daily-words').textContent=quote.text;
  dialog.dataset.date=quote.key;
  if(!dialog.open)dialog.showModal();
  animateEntrance();
 }
 const close=()=>{stopEntrance();dialog.close();document.getElementById('main').focus({preventScroll:true});};
 document.getElementById('daily-enter').addEventListener('click',close);
 window.BambooDaily={show,forDate};
})();
