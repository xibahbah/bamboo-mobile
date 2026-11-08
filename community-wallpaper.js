/* A fixed 2D close-packed portrait wallpaper. Light changes; positions never animate. */
(()=>{
 const names=['Alex','Marisol','Lin','Samira','Daniel','Minh','Sofia','Jamal','Hana','Mateo','Priya','Noah','Amina','Luis','Grace','Amir','Camila','Jun','Isabel','Theo','Linh','Rosa','Sana','Ben','Mei','Gabriel','Fatima','Leo','Maya','David','Nina','Omar','Elena','Kai','Sara','Diego'];
 const areas=['north-park','city-heights','chula-vista','la-jolla','oceanside'];
 const members=Array.from({length:180},(_,id)=>({id,name:names[id%36],portrait:id%36,location:areas[id%5],county:'san-diego-county',streak:15+(id*7)%46,optedIn:true}));
 const cityMembers=['los-angeles','san-francisco'].flatMap((location,city)=>Array.from({length:36},(_,i)=>({id:1000+city*36+i,name:names[i],portrait:i,location,county:location,streak:15+i,optedIn:true,newPortrait:true})));
 const candidates=[...members,...cityMembers,{id:900,county:'san-diego-county',location:'north-park',streak:14,optedIn:true},{id:901,county:'san-diego-county',location:'north-park',streak:30,optedIn:false}];
 const picker=document.getElementById('wall-community'),sheet=document.getElementById('city-picker'),options=document.getElementById('city-options');
 function cityOptions(){options.replaceChildren();for(const [id,name] of window.BambooLocation.areas){const button=document.createElement('button');button.type='button';button.className='city-option';button.setAttribute('aria-pressed',String(id===window.BambooLocation.current));const label=document.createElement('span');label.textContent=name;const check=document.createElement('span');check.className='city-check';check.textContent=id===window.BambooLocation.current?'✓':' ';check.setAttribute('aria-hidden','true');button.append(label,check);button.addEventListener('click',()=>{window.BambooLocation.set(id);sheet.close();picker.focus();});options.append(button);}}
 picker.addEventListener('click',()=>{cityOptions();sheet.showModal();});
 document.getElementById('city-close').addEventListener('click',()=>sheet.close());
 sheet.addEventListener('click',event=>{if(event.target!==sheet)return;const r=sheet.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)sheet.close();});
 sheet.addEventListener('close',()=>picker.focus());
 const field=document.getElementById('portrait-field');let sizeCache='';
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function localMember(){try{const app=JSON.parse(localStorage.getItem('bamboo-ui-v1'))||{},giving=JSON.parse(localStorage.getItem('bamboo-giving-v1'))||{};return {id:'self',name:app.name||'You',initial:(app.name||'You').slice(0,1),location:window.BambooLocation.current,county:'san-diego-county',streak:Number.isInteger(giving.streak)?giving.streak:app.paid?15:14,optedIn:app.wall===true};}catch{return null;}}

 function draw(){
  const area=window.BambooLocation.current,people=[...candidates,localMember()].filter(Boolean).filter(p=>p.optedIn&&p.streak>=15&&(area==='san-diego-county'?p.county===area:p.location===area));
  const rect=field.getBoundingClientRect(),key=[area,rect.width,rect.height,JSON.stringify(people)].join(':');if(key===sizeCache)return;sizeCache=key;
  picker.setAttribute('aria-label','Change community: '+window.BambooLocation.name());document.getElementById('location-name').textContent=window.BambooLocation.name();document.getElementById('member-count').textContent=people.length+' demo members';document.getElementById('empty').hidden=people.length!==0;
  if(!people.length){field.innerHTML='';return;}
  // Fixed equal circles touch tangentially in a hexagonal lattice. Center-first slots
  // make a compact cloud, without reordering on touches, timers, or focus.
  const diameter=rect.width<600?58:72,cols=Math.max(Math.ceil(Math.sqrt(people.length)),Math.ceil(rect.width/diameter)+2),rows=Math.max(Math.ceil(Math.sqrt(people.length)),Math.ceil(rect.height/(diameter*Math.sqrt(3)/2))+2),slots=[];
  for(let row=-rows;row<=rows;row++)for(let col=-cols;col<=cols;col++){const x=col*diameter+(Math.abs(row)%2)*diameter/2,y=row*diameter*Math.sqrt(3)/2;slots.push({x,y,distance:x*x+y*y,row,col});}
  slots.sort((a,b)=>a.distance-b.distance||a.row-b.row||a.col-b.col);
  const positions=slots.slice(0,people.length);
  field.innerHTML=people.map((p,i)=>{const slot=positions[i];return `<div class="bubble" tabindex="0" role="img" aria-label="${escape(p.name)}, ${p.streak}-day kindness streak, ${window.BambooLocation.name(p.location)}" style="left:calc(50% + ${slot.x-diameter/2}px);top:calc(50% + ${slot.y-diameter/2}px);--diameter:${diameter}px;--photo-x:${(p.portrait||0)%6*20}%;--photo-y:${Math.floor((p.portrait||0)/6)*20}%;--light-duration:${9+(Number(p.id)||0)%6}s;--light-delay:-${(Number(p.id)||0)%10}s"><span class="face ${p.id==='self'?'self-face':p.newPortrait||Number(p.id)%2===0?'new-portrait':''}" aria-hidden="true">${p.id==='self'?escape(p.initial):''}</span></div>`;}).join('');
 }
 function highlight(target){const bubble=target.closest('.bubble');if(!bubble)return;bubble.classList.remove('touched');requestAnimationFrame(()=>bubble.classList.add('touched'));}
 field.addEventListener('pointerdown',e=>highlight(e.target));field.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();highlight(e.target);}});field.addEventListener('animationend',e=>{if(e.animationName==='touch-light')e.target.classList.remove('touched');});
 window.addEventListener('storage',event=>{if(['bamboo-ui-v1','bamboo-giving-v1',null].includes(event.key)){sizeCache='';draw();}});
 new ResizeObserver(draw).observe(field);window.addEventListener('bamboo-location-change',()=>{sizeCache='';draw();});draw();
})();
