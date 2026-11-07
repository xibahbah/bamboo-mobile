/* Fixed-view SVG illustration. Growth days are an input, never inferred from donations. */
(function(root){
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const themes={forest:{sky:'#eef1e6',haze:'#e1e9d9',far:'#c6d5be',hill:'#afc4a4',ground:'#b7c9a7',front:'#a6bd94',line:'#859e79'},coast:{sky:'#f5efe3',haze:'#e6eade',far:'#bed3ce',hill:'#9fbbb6',ground:'#e6d9bc',front:'#d9cba9',line:'#b9aa88'},desert:{sky:'#f4ebdb',haze:'#eddfc8',far:'#e2cdaa',hill:'#d0b691',ground:'#d4bc96',front:'#c6ab83',line:'#b0936c'}};
 const matureHeight=i=>350+Math.sin(i*2.39+.7)*35+Math.cos(i*1.17)*18;
 function plantState(days,index){const age=clamp(days-index*30,0,30);return {age,height:matureHeight(index)*clamp(age/15),leaves:clamp(age-15,0,15),complete:age===30};}
 function layout(days,panorama,aspect){
  const count=Math.ceil(Math.max(0,days)/30),active=Math.max(0,count-1),width=Math.max(100,Math.min(800,1000*aspect-140));
  if(!panorama)return Array.from({length:Math.min(3,count)},(_,n)=>{const i=active-n;return {index:i,x:500+(n===0?0:n===1?-125:135),y:663+(n?12:0),scale:n?.78:1,opacity:n?.45:1};}).reverse();
  const columns=Math.min(12,Math.max(1,count)),rows=Math.ceil(count/columns),spread=Math.min(width,Math.max(0,(columns-1)*82)),scale=Math.min(1,Math.max(.24,width/(columns*46)))/Math.max(1,Math.sqrt(rows)*.62);
  return Array.from({length:count},(_,i)=>{const row=Math.floor(i/columns),col=i%columns,rowCount=Math.min(columns,count-row*columns);return {index:i,x:rowCount===1?500:500-spread*.46+col/(rowCount-1)*spread*.92,y:625+row/Math.max(1,rows-1)*55+(col%3)*7,scale:scale*(.9+.1*(row+1)/Math.max(1,rows)),opacity:.72+.28*(row+1)/Math.max(1,rows)};});
 }
 function plant(days,item){
  const {age,height,leaves}=plantState(days,item.index);if(age<=0)return '';
  const lean=Math.sin(item.index*1.8+.4)*7,width=7.4,top=-height,tip=lean;
  let art=`<ellipse cx="0" cy="2" rx="18" ry="3" fill="#496443" opacity=".09"/><path d="M${-width/2} 0 Q${-width/2-1} ${top*.45} ${tip-2.7} ${top+3} Q${tip} ${top-3} ${tip+2.7} ${top+3} Q${width/2+1} ${top*.45} ${width/2} 0Z" fill="#365c42"/><path d="M1 -1 Q3 ${top*.45} ${tip+1} ${top+6}" fill="none" stroke="#6b8960" stroke-width="1.3" opacity=".8"/>`;
  for(let y=38;y<height-13;y+=38){const x=lean*(y/height)**2;art+=`<path d="M${x-4} ${-y}q4 1.7 8 0" fill="none" stroke="#c1d0a9" stroke-width="1.7"/><path d="M${x-4.5} ${-y+2}h9" stroke="#294b37" stroke-width=".6"/>`;}
  for(let j=0;j<15;j++){
   const u=clamp(leaves-j);if(!u)continue;
   const side=j%2?-1:1,y=-height*(.30+.57*(j/14)),x=lean*(-y/height)**2,length=46+Math.sin(j*2.13+item.index)*14,dx=side*length,dy=-17-Math.cos(j*1.4)*13;
   art+=`<g transform="translate(${x} ${y}) scale(${u})"><path d="M0 0Q${dx*.38} ${dy*.5-8} ${dx} ${dy}" fill="none" stroke="#486c47" stroke-width="1.1"/><path d="M${dx*.18} ${dy*.34}Q${dx*.42} ${dy-15} ${dx} ${dy}Q${dx*.65} ${dy+12} ${dx*.18} ${dy*.34}Z" fill="${j%3?'#53774f':'#73905d'}"/>${j%3===0?`<path d="M${dx*.34} ${dy*.52}Q${dx*.20} ${dy-26} ${dx*.48} ${dy-37}Q${dx*.65} ${dy-18} ${dx*.34} ${dy*.52}Z" fill="#638456"/>`:''}</g>`;
  }
  return `<g data-plant="${item.index}" transform="translate(${item.x} ${item.y}) scale(${item.scale})" opacity="${item.opacity}">${art}</g>`;
 }
 function render({days=0,environment='forest',panorama=false,aspect=.47}={}){
  days=Math.max(0,Number(days)||0);const t=themes[environment]||themes.forest;
  const distant=environment==='forest'?Array.from({length:15},(_,i)=>{const x=i*81-48,h=115+Math.sin(i*2.3)*38;return `<path d="M${x-25} 545Q${x+15} ${545-h} ${x+36} ${465-h}Q${x+80} ${490-h} ${x+94} 548Z" fill="${t.far}" opacity=".30"/>`;}).join(''):'';
  const coast=environment==='coast'?`<path d="M0 506Q420 491 1000 510V660H0Z" fill="${t.hill}" opacity=".5"/><path d="M0 560Q300 548 610 560T1000 557M0 579Q350 565 700 580T1000 573" fill="none" stroke="#eff3e8" stroke-width="2" opacity=".6"/>`:'';
  const plants=layout(days,panorama,aspect);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${1000*aspect} 1000"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${t.sky}"/><stop offset="1" stop-color="${t.haze}"/></linearGradient><linearGradient id="ground" x2=".2" y2="1"><stop stop-color="${t.ground}"/><stop offset="1" stop-color="${t.front}"/></linearGradient><radialGradient id="light"><stop stop-color="#ffffef" stop-opacity=".6"/><stop offset="1" stop-color="#ffffef" stop-opacity="0"/></radialGradient></defs><g transform="scale(${aspect} 1)"><path fill="url(#sky)" d="M0 0H1000V1000H0Z"/><ellipse cx="630" cy="275" rx="310" ry="280" fill="url(#light)"/><ellipse cx="660" cy="260" rx="${36/aspect}" ry="36" fill="#fffcef" opacity=".38"/>${distant}<path d="M0 535Q155 443 325 506T670 496T1000 520V1000H0Z" fill="${t.far}" opacity=".5"/><path d="M0 583Q240 485 463 570T1000 532V1000H0Z" fill="${t.hill}" opacity=".36"/>${coast}<path d="M0 659Q230 599 510 630T1000 604V1000H0Z" fill="url(#ground)"/><path d="M0 790Q270 692 559 743T1000 687M0 855Q320 771 625 827T1000 760" fill="none" stroke="${t.line}" stroke-width="1.1" opacity=".12"/><ellipse cx="500" cy="665" rx="${panorama?Math.min(300,1000*aspect*.38):55}" ry="7" fill="${t.line}" opacity=".09"/></g><g transform="translate(${500*aspect-500} 0)">${plants.map(p=>plant(days,p)).join('')}<path d="M443 666q11-5 20-2m74 5q8-4 14-2" fill="none" stroke="${t.line}" stroke-width="1" opacity=".35"/></g></svg>`;
 }
 root.BambooGivingScene={render,plantState,layout,themes};
 if(typeof module!=='undefined')module.exports=root.BambooGivingScene;
})(typeof window!=='undefined'?window:globalThis);
