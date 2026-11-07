/* Continuous, fixed-topology vector morph. Coordinates are evaluated at display time.
   The six paired quadratic edges describe the SAME sides of the bank and culm;
   no unrelated contour vertices, per-frame DOM replacement, or frame quantization. */
(()=>{
 const duration=1800;
 const bank=[87,211,85.5,168.5,84,126,102,118.5,120,118.5,138,118.5,156,126,154.5,168.5,153,211,136.5,219,120,219,103.5,219,87,211];
 const culm=[118,224,118,166,120,57,121,54,122,54,123,54,124,57,124,166,124,224,122.5,224,121,224,119.5,224,118,224];
 const owners=[2,2,2,2,3,3,3,1,1,1,0,0,4,4];
 const centers=[73,95,121,146,169];
 const delays=[850,660,0,720,920];
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const phase=(ms,a,b)=>smooth((ms-a)/(b-a));
 const mix=(a,b,u)=>a+(b-a)*u;
 const bezier=(a,b,c,d,u)=>a*(1-u)**3+3*b*(1-u)**2*u+3*c*(1-u)*u*u+d*u**3;
 const num=x=>Number(x.toFixed(4));
 const point=(a,i)=>`${num(a[i])} ${num(a[i+1])}`;
 function path(a){let d=`M${point(a,0)}`;for(let i=2;i<a.length;i+=4)d+=`Q${point(a,i)} ${point(a,i+2)}`;return d+'Z';}
 function sample(ms){
  ms=Math.max(0,Math.min(duration,ms));
  const u=phase(ms,250,1450);
  // One continuous height curve shrinks then grows, with no hold at a phase boundary.
  const height=bezier(100.5,6,170,170,u);
  const width=mix(72,6,phase(ms,230,1120));
  const bottom=mix(219,224,phase(ms,280,1000));
  const cx=mix(120,121,phase(ms,320,1200));
  const shape=phase(ms,320,1160);
  const coordinates=bank.map((v,i)=>i%2===0
   ?cx+mix((v-120)/72,(culm[i]-121)/6,shape)*width
   :bottom-mix((219-v)/100.5,(224-culm[i])/170,shape)*height);
  return {ms,height,width,bottom,cx,coordinates,d:path(coordinates)};
 }
 let instance=0;
 function createRenderer(svg){
  const ns='http://www.w3.org/2000/svg';
  const node=(tag,attrs={},parent=svg)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));parent.append(el);return el;};
  const set=(el,key,value)=>el.setAttribute(key,String(value));
  const group=(parent=svg,attrs={})=>node('g',attrs,parent);
  const source=document.createElementNS(ns,'svg');source.innerHTML=window.BambooFrames.last;
  const stalks=[],nodes=[],leaves=[];let current=-1;
  for(const el of source.children){
   if(el.hasAttribute('fill')&&stalks.length<5){stalks.push(el);nodes.push([]);current++;}
   else if(!el.hasAttribute('fill'))nodes[current].push(el);
   else leaves.push(el);
  }
  svg.replaceChildren();
  const id=`bamboo-core-${++instance}`,clipId=id+'-clip',coinClipId=id+'-coin';
  const defs=node('defs');
  const coreClip=node('clipPath',{id:clipId},defs);node('use',{href:'#'+id},coreClip);
  const coinClip=node('clipPath',{id:coinClipId},defs);const coinRect=node('rect',{x:0,y:0,width:240,height:127},coinClip);
  const sides=[];
  for(const i of [0,1,3,4]){
   const g=group();g.append(stalks[i].cloneNode(true),...nodes[i].map(el=>el.cloneNode(true)));
   const leafGroups=[];
   leaves.forEach((leaf,j)=>{if(owners[j]!==i)return;const point=leaf.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).slice(0,2).map(Number);const lg=group(g);lg.append(leaf.cloneNode(true));leafGroups.push({el:lg,x:point[0],y:point[1]});});
   sides.push({i,el:g,leafGroups});
  }
  const core=node('path',{id,fill:'#40634f','data-part':'body'});
  const cut=group(svg,{'clip-path':`url(#${clipId})`});
  const rim=node('path',{fill:'#849b76','data-part':'rim'},cut);
  const slot=node('path',{fill:'none',stroke:'#294b39','stroke-linecap':'round'},cut);
  const rings=[node('path',{fill:'none',stroke:'#b5c4a6'},cut),node('path',{fill:'none',stroke:'#b5c4a6'},cut)];
  const coreNodes=group(cut);coreNodes.append(...nodes[2].map(el=>el.cloneNode(true)));
  const coreLeaves=[];
  leaves.forEach((leaf,j)=>{if(owners[j]!==2)return;const p=leaf.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).slice(0,2).map(Number);const lg=group();lg.append(leaf.cloneNode(true));coreLeaves.push({el:lg,x:p[0],y:p[1]});});
  const coinLayer=group(svg,{'clip-path':`url(#${coinClipId})`});
  const coin=group(coinLayer,{id:'coin'});
  node('circle',{cx:120,cy:88,r:13,fill:'#bbad70'},coin);
  node('circle',{cx:120,cy:88,r:9,fill:'none',stroke:'#f5f7f2','stroke-width':1.2},coin);
  node('path',{d:'M120 83v10',fill:'none',stroke:'#f5f7f2','stroke-width':1.5,'stroke-linecap':'round'},coin);
  function render(ms){
   const p=sample(ms),a=p.coordinates;ms=p.ms;
   set(core,'d',p.d);
   // The inset mouth shares the upper contour, then folds into that exact tip.
   const fold=1-phase(ms,310,800),tipX=a[8],tipY=a[9];
   const foldPoint=i=>[mix(tipX,a[i],fold),mix(tipY,a[i+1],fold)].map(num).join(' ');
   const lower=num(mix(tipY,(a[5]+a[13])/2+11*p.height/100.5,fold));
   set(rim,'d',`M${foldPoint(4)}Q${foldPoint(6)} ${foldPoint(8)}Q${foldPoint(10)} ${foldPoint(12)}Q${num(p.cx)} ${lower} ${foldPoint(4)}Z`);
   const slit=14*p.width/72*(1-phase(ms,310,660));
   const slotY=mix(tipY,(a[5]+a[13])/2,1-phase(ms,310,660));
   set(slot,'d',`M${num(p.cx-slit)} ${num(slotY)}H${num(p.cx+slit)}`);
   set(slot,'stroke-width',num(4*(1-phase(ms,400,660))));
   const sx=p.width/72,sy=p.height/100.5;
   const bankTransform=`matrix(${num(sx)} 0 0 ${num(sy)} ${num(p.cx-120*sx)} ${num(p.bottom-219*sy)})`;
   rings.forEach((el,i)=>{set(el,'d',i===0?'M86 171Q120 184 154 171':'M87 208Q120 220 153 208');set(el,'transform',bankTransform);set(el,'stroke-width',num(2.3*(1-phase(ms,650,1120))));});
   const nx=p.width/6,ny=p.height/170;
   set(coreNodes,'transform',`matrix(${num(nx)} 0 0 ${num(ny)} ${num(p.cx-121*nx)} ${num(p.bottom-224*ny)})`);
   set(coreNodes,'opacity',num(phase(ms,950,1430)));
   coreLeaves.forEach(({el,x,y})=>{
    const u=phase(ms,930+(224-y)*.5,1460+(224-y)*.4);
    const rootX=p.cx+(x-121)*nx,rootY=p.bottom-(224-y)*ny;
    set(el,'transform',`translate(${num(rootX)} ${num(rootY)}) scale(${num(u)}) translate(${-x} ${-y})`);
   });
   sides.forEach(({i,el,leafGroups})=>{
    const g=phase(ms,delays[i],1500+(i%2)*60),sx=.35+.65*g;
    set(el,'transform',`matrix(${num(sx)} 0 0 ${num(g)} ${num(centers[i]*(1-sx))} ${num(224*(1-g))})`);
    const leaf=phase(ms,delays[i]+180,1600);
    leafGroups.forEach(({el,x,y})=>set(el,'transform',`translate(${x} ${y}) scale(${num(leaf)}) translate(${-x} ${-y})`));
   });
   set(coinRect,'height',num(slotY+1));
   set(coin,'transform',`translate(0 ${num(54*phase(ms,40,300))})`);
   set(coinLayer,'visibility',ms>=310?'hidden':'visible');
  }
  render(0);
  return {render};
 }
 window.BambooMotion={duration,createRenderer,sample};
})();
