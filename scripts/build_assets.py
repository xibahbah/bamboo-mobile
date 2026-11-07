"""Package the generated atlas into day states, transition frames and GIF previews.
Run from any directory: python3 bamboo/scripts/build_assets.py
Requires Pillow. This does not call an image-generation API.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json, math

ROOT = Path(__file__).resolve().parents[1]
A = ROOT / 'assets'
for folder in ('days', 'growth-frames', 'idle-frames', 'widget'):
    (A / folder).mkdir(parents=True, exist_ok=True)
atlas = Image.open(A / 'bamboo-growth-atlas.png').convert('RGBA')
cream = '#F8F5EB'
size = 320
states = []
for i in range(30):
    col, row = i % 6, i // 6
    cell = atlas.crop((round(col*atlas.width/6), round(row*atlas.height/5),
                       round((col+1)*atlas.width/6), round((row+1)*atlas.height/5)))
    # Same scale for every day. Align only the ground baseline, not plant height.
    alpha = cell.getchannel('A')
    bounds = alpha.point(lambda p: 255 if p > 90 else 0).getbbox()
    scale = 1.18
    cell = cell.resize((round(cell.width*scale), round(cell.height*scale)), Image.Resampling.LANCZOS)
    baseline = round((bounds[3] if bounds else 200)*scale)
    out = Image.new('RGBA', (size,size))
    out.alpha_composite(cell, ((size-cell.width)//2, 284-baseline))
    out.save(A / 'days' / f'day-{i+1:02}.png')
    states.append(out)

def matte(im):
    bg=Image.new('RGBA',im.size,cream)
    bg.alpha_composite(im)
    return bg.convert('RGB')

frames=[]
durations=[]
for i in range(29):
    for step in range(6):
        t=step/6
        t=t*t*(3-2*t)
        # A dissolve deliberately preserves artwork rather than pretending to be a rigged morph.
        im=Image.blend(states[i],states[i+1],t)
        im.save(A/'growth-frames'/f'frame-{len(frames):03}.png')
        frames.append(matte(im));durations.append(70)
states[-1].save(A/'growth-frames'/f'frame-{len(frames):03}.png')
frames.append(matte(states[-1]));durations.append(1600)
durations[0]=700
frames[0].save(A/'bamboo-growth.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,disposal=2)

idle=[]
for f in range(36):
    angle=1.3*math.sin(2*math.pi*f/36)
    im=states[-1].rotate(angle,Image.Resampling.BICUBIC,center=(160,284))
    im.save(A/'idle-frames'/f'frame-{f:03}.png')
    idle.append(matte(im))
idle[0].save(A/'bamboo-grove-idle.gif',save_all=True,append_images=idle[1:],duration=80,loop=0,disposal=2)

sheet=Image.new('RGB',(6*200,5*220),cream)
draw=ImageDraw.Draw(sheet)
for i,im in enumerate(states):
    x,y=(i%6)*200,(i//6)*220
    sheet.paste(matte(im).resize((200,200),Image.Resampling.LANCZOS),(x,y))
    draw.text((x+72,y+201),f'DAY {i+1:02}',fill='#214E3B')
sheet.save(A/'growth-contact-sheet.jpg',quality=94)
for day in (1,7,15,30):
    states[day-1].save(A/'widget'/f'bamboo-day-{day:02}.png')
manifest={'version':1,'canvas':{'width':320,'height':320,'baselineY':284},
          'source':'built-in imagegen atlas; normalized crops',
          'days':[{'day':i+1,'src':f'days/day-{i+1:02}.png'} for i in range(30)],
          'growth':{'frameCount':len(frames),'frames':'growth-frames/frame-NNN.png','gif':'bamboo-growth.gif','transition':'crossfade'},
          'idle':{'frameCount':36,'durationMs':2880,'gif':'bamboo-grove-idle.gif'},
          'widget':'static artwork only; no native WidgetKit integration'}
(A/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Created 30 day states, {len(frames)} growth frames, 36 idle frames, 2 GIFs, contact sheet and manifest.')
