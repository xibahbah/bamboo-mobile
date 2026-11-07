from pathlib import Path
from PIL import Image
import math, json
A=Path(__file__).resolve().parents[1]/'assets'
(A/'bank-frames').mkdir(exist_ok=True)
src=Image.open(A/'bamboo-bank-source.png').convert('RGBA')
src.thumbnail((320,320),Image.Resampling.LANCZOS)
bank=Image.new('RGBA',(320,320));bank.alpha_composite(src,((320-src.width)//2,(320-src.height)//2))
bank.save(A/'bamboo-bank.png')
frames=[]
for i in range(36):
    t=i/35
    pulse=math.sin(math.pi*t)**2
    w,h=round(320*(1-.025*pulse)),round(320*(1+.025*pulse))
    art=bank.resize((w,h),Image.Resampling.LANCZOS)
    frame=Image.new('RGBA',(360,360));frame.alpha_composite(art,((360-w)//2,round(20-6*pulse)))
    frame.save(A/'bank-frames'/f'frame-{i:03}.png')
    bg=Image.new('RGBA',frame.size,'#F8F5EB');bg.alpha_composite(frame);frames.append(bg.convert('RGB'))
frames[0].save(A/'bamboo-bank-thanks.gif',save_all=True,append_images=frames[1:],duration=[40]*35+[1200],loop=0,disposal=2)
grove=Image.open(A/'days/day-30.png').convert('RGBA')
for n in (2,3):
    out=Image.new('RGBA',(320,320))
    placements=[(0,100,190),(130,100,190)] if n==2 else [(0,120,160),(80,105,160),(160,120,160)]
    for x,y,s in placements:
        out.alpha_composite(grove.resize((s,s),Image.Resampling.LANCZOS),(x,y))
    out.save(A/f'groves-{n}.png')
m=json.loads((A/'manifest.json').read_text());m['bank']={'image':'bamboo-bank.png','gif':'bamboo-bank-thanks.gif','frameCount':36};m['extraGroves']=['groves-2.png','groves-3.png'];(A/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
print('Bank PNG + 36 frames + GIF; two/three-grove milestone illustrations created.')
