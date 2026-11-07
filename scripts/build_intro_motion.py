"""Bake a 1.8s vector morph: coin -> bamboo bank -> shoot -> grove.
Uses signed-distance boundaries, as in the earlier intro study. No pixel crossfades,
vertex pairing, rotation of the whole shape, or runtime geometry dependencies.
Requires numpy, scipy, Pillow and contourpy for authoring only.
"""
from pathlib import Path
import json, re, xml.etree.ElementTree as ET
import numpy as np
from scipy.ndimage import distance_transform_edt, gaussian_filter
from PIL import Image, ImageDraw
import contourpy

ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'intro-frames.js').read_text().split('window.BambooFrames=',1)[1].strip().rstrip(';')
art=json.loads(source)
start=ET.fromstring('<svg>'+art['first']+'</svg>')
end=ET.fromstring('<svg>'+art['last']+'</svg>')
bank=start.find(".//*[@id='bamboo-bank']")
coin=ET.tostring(start.find(".//*[@id='coin']"),encoding='unicode')
body=bank.find('path').get('d')
stem_paths=[p for p in end.findall('path') if p.get('fill')]
central=next(p.get('d') for p in stem_paths if p.get('fill')=='#40634f')
shoot='M110 224Q109 202 120 184Q131 202 130 224Z'
STEP=.5;W=481;H=521
X=np.arange(W)*STEP;Y=np.arange(H)*STEP

def ease(t):
 t=max(0.,min(1.,t));return t*t*(3-2*t)
def phase(ms,a,b):return ease((ms-a)/(b-a))
def flatten(d):
 tokens=re.findall(r'[MLCQZ]|-?\d+(?:\.\d+)?',d)
 points=[];i=0;current=np.zeros(2)
 while i<len(tokens):
  command=tokens[i];i+=1
  if command=='Z':break
  count={'M':2,'L':2,'C':6,'Q':4}[command]
  coordinates=np.array([float(v) for v in tokens[i:i+count]]).reshape(-1,2);i+=count
  if command in ['M','L']:current=coordinates[0];points.append(current.copy());continue
  begin=current.copy()
  length=sum(np.linalg.norm(b-a) for a,b in zip(np.vstack([begin,coordinates])[:-1],coordinates))
  for t in np.linspace(0,1,max(12,int(length/STEP)))[1:]:
   if command=='Q':point=(1-t)**2*begin+2*(1-t)*t*coordinates[0]+t*t*coordinates[1]
   else:point=(1-t)**3*begin+3*(1-t)**2*t*coordinates[0]+3*(1-t)*t*t*coordinates[1]+t**3*coordinates[2]
   points.append(point)
  current=coordinates[-1]
 return np.array(points)

def field(points):
 image=Image.new('L',(W*2,H*2));draw=ImageDraw.Draw(image)
 draw.polygon([tuple(v*2/STEP) for v in points],fill=255)
 mask=np.asarray(image.resize((W,H),Image.Resampling.LANCZOS))>127
 return (distance_transform_edt(mask)-distance_transform_edt(~mask))*STEP

def simplify(points,tolerance=.28):
 if len(points)<3:return points
 keep=np.zeros(len(points),bool);keep[0]=keep[-1]=True;stack=[(0,len(points)-1)]
 while stack:
  a,b=stack.pop()
  if b-a<2:continue
  vector=points[b]-points[a];den=np.dot(vector,vector);delta=points[a+1:b]-points[a]
  if den:
   frac=np.clip(delta@vector/den,0,1);dist=np.linalg.norm(delta-frac[:,None]*vector,axis=1)
  else:dist=np.linalg.norm(delta,axis=1)
  at=int(np.argmax(dist))
  if dist[at]>tolerance:
   k=a+1+at;keep[k]=True;stack.extend([(a,k),(k,b)])
 return points[keep]

def outline(f):
 # Extract a single filled surface. The boundary moves; opacity stays one.
 lines=contourpy.contour_generator(x=X,y=Y,z=gaussian_filter(f,.55),line_type='Separate').lines(0)
 paths=[]
 for pts in lines:
  if len(pts)<4:continue
  middle=len(pts)//2;pts=np.vstack([simplify(pts[:middle+1]),simplify(pts[middle:])[1:]])
  if np.linalg.norm(pts[0]-pts[-1])<.01:pts=pts[:-1]
  if len(pts)<3:continue
  first=(pts[-1]+pts[0])/2;d=f'M{first[0]:.2f},{first[1]:.2f}'
  for i,pt in enumerate(pts):
   nxt=(pt+pts[(i+1)%len(pts)])/2
   d+=f'Q{pt[0]:.2f},{pt[1]:.2f},{nxt[0]:.2f},{nxt[1]:.2f}'
  paths.append(d+'Z')
 return ''.join(paths)

anchor=np.array([120,224]);small=(flatten(body)-anchor)*.58+anchor
bank_field=field(small);shoot_field=field(flatten(shoot));stem_field=field((flatten(central)-anchor)*np.array([1,40/170])+anchor)
colors=['#8ca17e','#6d8860','#40634f','#5b7851','#8ca17e']
# Original art: five culms with their node strokes, then fourteen leaves.
culms=[];nodes=[];leaves=[];current=-1
for p in end.findall('path'):
 d=p.get('d')
 if p.get('fill') and len(culms)<5:
  culms.append(p);nodes.append([]);current+=1
 elif not p.get('fill'):nodes[current].append(p)
 else:leaves.append(p)
leaf_owners=[2,2,2,2,3,3,3,1,1,1,0,0,4,4]
centers=[73,95,121,146,169]

def group_transform(x,sx,sy):return f'matrix({sx:.4f} 0 0 {sy:.4f} {x*(1-sx):.3f} {224*(1-sy):.3f})'
def xml(element):return ET.tostring(element,encoding='unicode')
def pose(ms):
 if ms>=1620:return art['last']
 pieces=[]
 # Left/right culms grow from a fixed floor, overlapping the central morph.
 for i in [0,1,3,4]:
  delay={1:820,3:880,0:1000,4:1060}[i];growth=phase(ms,delay,1530+(i%2)*60)
  if growth<=0:continue
  parts=[xml(culms[i]),*(xml(p) for p in nodes[i])]
  for leaf,owner in zip(leaves,leaf_owners):
   if owner!=i:continue
   x,y=map(float,re.findall(r'-?\d+(?:\.\d+)?',leaf.get('d'))[:2])
   unfurl=phase(ms,delay+190,1600)
   parts.append(f'<g transform="translate({x} {y}) scale({unfurl:.4f}) translate({-x} {-y})">{xml(leaf)}</g>')
  pieces.append(f'<g transform="{group_transform(centers[i],.4+.6*growth,growth)}">'+''.join(parts)+'</g>')
 if ms<=560:
  scale=1-.42*phase(ms,310,560)
  pieces.append(f'<g transform="{group_transform(120,scale,scale)}">{xml(bank)}</g>')
 else:
  if ms<850:d=outline(bank_field*(1-phase(ms,560,850))+shoot_field*phase(ms,560,850))
  elif ms<1420:d=outline(shoot_field*(1-phase(ms,850,1420))+stem_field*phase(ms,850,1420))
  else:d=central
  # Normalize height before interpolating distances: a thin tall target must not
  # remain hidden until the last instant. Grow the boundary from its fixed root.
  grow=1+3.25*phase(ms,850,1420) if ms<1420 else 1
  transform=group_transform(120,1,grow)
  pieces.append(f'<path d="{d}" transform="{transform}" fill="#40634f"/>')
  pieces.append(f'<defs><clipPath id="intro-core"><path d="{d}" transform="{transform}"/></clipPath></defs>')
  height_ratio=(40+130*phase(ms,850,1420))/170
  attachment=group_transform(121,1,height_ratio)
  # Fine cut surfaces vanish while the solid bank boundary stays fully opaque.
  detail=1-phase(ms,560,690)
  if detail>0:
   pieces.append(f'<g opacity="{detail:.3f}" transform="{group_transform(120,.58,.58)}">'+''.join(xml(p) for p in list(bank)[1:])+'</g>')
  for node in nodes[2]:
   d=node.get('d');y=float(re.findall(r'-?\d+(?:\.\d+)?',d)[1]);u=phase(ms,1190+(224-y)*.4,1490+(224-y)*.4)
   if u>0:pieces.append(f'<g clip-path="url(#intro-core)"><g opacity="{u:.3f}" transform="{attachment}">{xml(node)}</g></g>')
  for leaf,owner in zip(leaves,leaf_owners):
   if owner!=2:continue
   x,y=map(float,re.findall(r'-?\d+(?:\.\d+)?',leaf.get('d'))[:2]);u=phase(ms,1110+(224-y)*.5,1530+(224-y)*.3)
   if u>0:pieces.append(f'<g transform="{attachment}"><g transform="translate({x} {y}) scale({u:.4f}) translate({-x} {-y})">{xml(leaf)}</g></g>')
 if ms<310:
  # Coin is clipped behind the front lip; it is never alpha-faded away.
  drop=54*phase(ms,40,300)
  pieces.append('<defs><clipPath id="intro-coin-slot"><rect x="0" y="0" width="240" height="127"/></clipPath></defs>')
  pieces.append(f'<g clip-path="url(#intro-coin-slot)"><g transform="translate(0 {drop:.3f})">{coin}</g></g>')
 return ''.join(pieces)

frames=[pose(ms) for ms in np.linspace(0,1800,109)]
payload={'duration':1800,'frames':frames}
(ROOT/'intro-motion.js').write_text('// Generated by scripts/build_intro_motion.py. Signed-distance vector morph.\nwindow.BambooMotion='+json.dumps(payload,separators=(',',':'))+';\n')
# Static samples for a scrubber, design review and reproducibility.
OUT=ROOT/'assets'/'intro';OUT.mkdir(exist_ok=True)
for ms in [0,200,500,750,1050,1350,1650,1800]:
 (OUT/f'motion-{ms:04}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260">'+pose(ms)+'</svg>')
print(f'Wrote {len(frames)} SVG frames, {(ROOT/"intro-motion.js").stat().st_size:,} bytes; 1800ms total.')
