/* Fixed-view SVG illustration. Growth days are an input, never inferred from donations. */
(function(root){
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const themes={forest:{sky:'#eef1e6',haze:'#e1e9d9',far:'#c6d5be',hill:'#afc4a4',ground:'#b7c9a7',front:'#a6bd94',line:'#859e79'},coast:{sky:'#f5efe3',haze:'#e6eade',far:'#bed3ce',hill:'#9fbbb6',ground:'#e6d9bc',front:'#d9cba9',line:'#b9aa88'},desert:{sky:'#f4ebdb',haze:'#eddfc8',far:'#e2cdaa',hill:'#d0b691',ground:'#d4bc96',front:'#c6ab83',line:'#b0936c'}};
 const matureHeight=i=>350+Math.sin(i*2.39+.7)*35+Math.cos(i*1.17)*18;
 function plantState(days,index){
  const age=index<6?clamp(days-index*14,0,14):0,extra=Math.max(0,days-84);
  const leaves=index<6?Math.min(18,Math.floor(extra/6)+clamp(extra%6-index)):0;
  return {age,height:matureHeight(index)*age/14,segments:Math.floor(age),leaves,complete:age===14};
 }
 function layout(days,panorama,aspect){
  const count=Math.min(6,Math.max(1,Math.ceil(Math.max(0,days)/14)));
  const available=Math.min(700,Math.max(160,1000*aspect-64));
  const gap=Math.min(panorama?105:76,available/(count+.5));
  return Array.from({length:count},(_,i)=>({index:i,x:500+(i-(count-1)/2)*gap,y:663+(i%2)*6,scale:Math.min(1,available/(count*58))*(i%2?.95:1),opacity:1}));
 }
 function plant(days,item){
  const {age,height,leaves}=plantState(days,item.index);if(age<=1){const u=item.index===0?.42+.58*clamp(age):clamp(age);return `<g data-plant="${item.index}" transform="translate(${item.x} ${item.y}) scale(${item.scale*u})"><ellipse cy="2" rx="14" ry="3" fill="#496443" opacity=".08"/><path d="M-7 0Q-11-12 0-28Q11-12 7 0Z" fill="#365c42"/><path d="M0-22V0M-6-9 0-5 6-9" fill="none" stroke="#adc296" stroke-width="1"/></g>`;}
  const lean=Math.sin(item.index*1.8+.4)*7,width=7.4+6.6*clamp(2-age),top=-height,tip=lean;
  let art=`<ellipse cx="0" cy="2" rx="18" ry="3" fill="#496443" opacity=".09"/><path d="M${-width/2} 0 Q${-width/2-1} ${top*.45} ${tip-2.7} ${top+3} Q${tip} ${top-3} ${tip+2.7} ${top+3} Q${width/2+1} ${top*.45} ${width/2} 0Z" fill="#365c42"/><path d="M1 -1 Q3 ${top*.45} ${tip+1} ${top+6}" fill="none" stroke="#6b8960" stroke-width="1.3" opacity=".8"/>`;
  for(let y=matureHeight(item.index)/14;y<height-1;y+=matureHeight(item.index)/14){const x=lean*(y/height)**2;art+=`<path d="M${x-4} ${-y}q4 1.7 8 0" fill="none" stroke="#c1d0a9" stroke-width="1.7"/><path d="M${x-4.5} ${-y+2}h9" stroke="#294b37" stroke-width=".6"/>`;}
  for(let j=0;j<18;j++){
   const u=clamp(leaves-j);if(!u)continue;
   const side=j%2?-1:1,y=-height*(.30+.57*(j/17)),x=lean*(-y/height)**2,length=46+Math.sin(j*2.13+item.index)*14,dx=side*length,dy=-17-Math.cos(j*1.4)*13;
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

 // Small-screen illustration: deliberately broader than the full landscape stems.
 function streakColor(day){const t=Math.min(1,Math.max(0,(day-1)/29));const a=[153,170,143],b=[43,79,52];return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;}
 function widget(days){
  const progress=Math.min(1,Math.max(0,days)/90),top=72-progress*12,bottom=174;
  const color=streakColor(days);
  return `<ellipse cx="80" cy="181" rx="39" ry="5" fill="#e4e9dc"/>
   <g data-plant="0" data-art="bamboo-bank">
    <path d="M47 ${top}H113V${bottom}C113 ${bottom+12} 47 ${bottom+12} 47 ${bottom}Z" fill="${color}"/>
    <path d="M47 ${top}Q54 ${top+6} 60 ${top+7}V${bottom+5}Q49 ${bottom+3} 47 ${bottom}Z" fill="#ffffff" opacity=".09"/>
    <path d="M47 ${bottom-23}Q80 ${bottom-15} 113 ${bottom-23}" fill="none" stroke="#d1ddbd" stroke-width="2" opacity=".65"/>
    <ellipse cx="80" cy="${top}" rx="33" ry="10" fill="#b5c5a0"/>
    <path d="M66 ${top}h28" stroke="#3b5239" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="80" cy="${top-25}" rx="10" ry="13" fill="#c2ccac"/>
    <path d="M80 ${top-31}v12" stroke="#f4f5e9" stroke-width="2" stroke-linecap="round"/>
   </g>`;
 }
 root.BambooGivingScene={render,plantState,layout,themes,plant,widget,streakColor};
 if(typeof module!=='undefined')module.exports=root.BambooGivingScene;
})(typeof window!=='undefined'?window:globalThis);
