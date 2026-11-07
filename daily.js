/* A date-stable, local daily reflection. Quoted lines retain their source. */
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
 quotes.splice(4,0,{text:'No mud, no lotus.',author:'Thich Nhat Hanh',source:'https://plumvillage.org/books/no-mud-no-lotus'});
 quotes.splice(11,0,{text:'Be kind whenever possible; it’s always possible.',author:'The Dalai Lama',source:'https://www.dalailama.com/news/2014/his-holiness-the-dalai-lama-spends-the-day-on-capitol-hill'});
 quotes.splice(19,0,{text:'Because you are alive, everything is possible.',author:'Thich Nhat Hanh',source:'https://plumvillage.org/event/retreat/weekend-autumn-retreat-3-hamlets'});
 quotes.splice(27,0,{text:'Love and compassion are necessities, not luxuries.',author:'The Dalai Lama',source:'https://www.dalailama.com/news/2018/mind-life-conference-reimagining-human-flourishing-fourth-day'});
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
  const card=document.getElementById('karma-card');
  if(typeof card.animate!=='function')return;
  entranceAnimations.push(card.animate([
   {opacity:0,transform:'translateY(22px) scale(.96)'},
   {opacity:1,transform:'translateY(-2px) scale(1.006)',offset:.75},
   {opacity:1,transform:'translateY(0) scale(1)'}
  ],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'}));
  entranceAnimations.push(card.querySelector('.karma-leaf').animate([
   {opacity:0,transform:'rotate(-12deg) scale(.78)'},
   {opacity:1,transform:'rotate(0) scale(1)'}
  ],{duration:480,delay:60,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
  entranceAnimations.push(document.getElementById('daily-words').animate([
   {opacity:0,transform:'translateY(7px)'},
   {opacity:1,transform:'translateY(0)'}
  ],{duration:360,delay:130,easing:'ease-out',fill:'backwards'}));
 }
 dialog.addEventListener('close',()=>{if(!dialog.open)stopEntrance();});
 dialog.addEventListener('cancel',stopEntrance);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEntrance();});
 motionPreference?.addEventListener?.('change',event=>{if(event.matches)stopEntrance();});
 function show(){
  const quote=forDate();
  document.getElementById('daily-words').textContent=quote.text;
  const date=document.getElementById('daily-date');date.textContent=quote.dateLabel;date.dateTime=quote.key;
  const credit=document.getElementById('daily-credit');credit.replaceChildren();
  if(quote.source){const link=document.createElement('a');link.textContent=quote.author;link.href=quote.source;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`Read the source for this ${quote.author} quote`);credit.append(link);}else{credit.textContent='Bamboo · Daily reflection';}
  if(!dialog.open)dialog.showModal();
  animateEntrance();
 }
 const close=()=>{stopEntrance();dialog.close();document.getElementById('main').focus({preventScroll:true});};
 document.getElementById('daily-enter').addEventListener('click',close);
 document.getElementById('daily-close').addEventListener('click',close);
 window.BambooDaily={show,forDate};
})();
