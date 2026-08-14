from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path
import random, math

ROOT=Path(__file__).resolve().parents[1]
MEDIA=ROOT/'public/assets/media'; DIMS=ROOT/'public/assets/dimensions'; LOGOS=ROOT/'public/assets/logos'
for d in (MEDIA,DIMS,LOGOS): d.mkdir(parents=True,exist_ok=True)
INK=(8,7,6); PAPER=(240,235,226); EMBER=(204,70,12); EMBER2=(233,119,54)

def noise_overlay(im, strength=18, seed=1):
    random.seed(seed)
    n=Image.new('L', im.size)
    px=n.load()
    for y in range(im.height):
        for x in range(im.width): px[x,y]=max(0,min(255,128+random.randint(-strength,strength)))
    n=n.filter(ImageFilter.GaussianBlur(.25))
    grain=Image.new('RGB',im.size,(128,128,128)); grain.putalpha(n)
    return Image.blend(im, grain.convert('RGB'), .06)

def radial(size, centers):
    w,h=size; im=Image.new('RGB',size,INK); p=im.load()
    for y in range(h):
      for x in range(w):
        r,g,b=INK
        for cx,cy,col,rad,alpha in centers:
          d=((x-cx)**2+(y-cy)**2)**0.5/rad
          f=max(0,1-d)**2*alpha
          r=int(r+(col[0]-r)*f); g=int(g+(col[1]-g)*f); b=int(b+(col[2]-b)*f)
        p[x,y]=(r,g,b)
    return im

def save(im,path,q=76):
    im=im.convert('RGB')
    im.save(path,'WEBP',quality=q,method=6)

def lens_scene(path, seed=1, warm=True, size=(1600,1100)):
    w,h=size
    im=radial(size,[(w*.72,h*.35,EMBER2,w*.42,.65),(w*.18,h*.72,(20,48,60),w*.48,.38)])
    d=ImageDraw.Draw(im,'RGBA')
    # cinematic practicals / slats
    for i in range(7):
      y=int(h*(.08+i*.11)); d.rounded_rectangle((w*.05,y,w*.48,y+18),9,fill=(244,193,145,24+i*3))
    # camera body silhouette
    bx,by=w*.43,h*.38
    d.rounded_rectangle((bx,by,bx+w*.34,by+h*.27),28,fill=(2,2,3,235),outline=(255,255,255,22),width=3)
    d.ellipse((bx-w*.16,by+h*.02,bx+w*.06,by+h*.24),fill=(3,3,4,255),outline=(233,119,54,95),width=6)
    d.ellipse((bx-w*.11,by+h*.06,bx+.01*w,by+h*.20),fill=(7,12,15,255),outline=(66,143,177,80),width=4)
    d.line((bx+w*.18,by,bx+w*.25,by-h*.09),fill=(240,235,226,55),width=8)
    d.rounded_rectangle((bx+w*.11,by-h*.08,bx+w*.29,by+h*.01),12,fill=(12,12,13,245),outline=(255,255,255,18),width=2)
    # bokeh
    random.seed(seed)
    for _ in range(18):
      x=random.randint(0,w); y=random.randint(0,h); r=random.randint(10,45); col=EMBER2 if warm else (90,145,190)
      d.ellipse((x-r,y-r,x+r,y+r),fill=(*col,random.randint(8,25)))
    im=im.filter(ImageFilter.GaussianBlur(.2)); im=noise_overlay(im,10,seed)
    save(im,path,78)

def moodboard(path, seed=2, size=(1500,1050)):
    w,h=size; im=Image.new('RGB',size,(219,208,194)); d=ImageDraw.Draw(im,'RGBA')
    # desk / shadow
    d.rectangle((0,0,w,h),fill=(222,211,197,255)); d.polygon([(0,h*.72),(w,h*.56),(w,h),(0,h)],fill=(50,37,29,38))
    random.seed(seed)
    papers=[(w*.08,h*.1,w*.48,h*.52,-5),(w*.42,h*.08,w*.86,h*.44,6),(w*.18,h*.5,w*.62,h*.9,3),(w*.65,h*.48,w*.92,h*.88,-4)]
    layer=Image.new('RGBA',size,(0,0,0,0))
    for i,(x1,y1,x2,y2,ang) in enumerate(papers):
      pw,ph=int(x2-x1),int(y2-y1); card=Image.new('RGBA',(pw,ph),(244,240,232,255)); cd=ImageDraw.Draw(card,'RGBA')
      cd.rectangle((0,0,pw,ph),outline=(20,18,16,18),width=2)
      for j in range(4):
        yy=int(ph*(.16+j*.14)); cd.rounded_rectangle((pw*.10,yy,pw*(.64+random.random()*.2),yy+max(4,int(ph*.014))),3,fill=(20,18,16,70))
      if i==1:
        cols=[EMBER,(238,165,112),(43,37,34),(178,164,145),(236,228,216)]
        for j,c in enumerate(cols): cd.rectangle((pw*.1+j*pw*.16,ph*.68,pw*.22+j*pw*.16,ph*.86),fill=(*c,255))
      card=card.rotate(ang,resample=Image.Resampling.BICUBIC,expand=True)
      layer.alpha_composite(card,(int(x1),int(y1)))
    im=Image.alpha_composite(im.convert('RGBA'),layer)
    # warm lamp glow
    glow=Image.new('RGBA',size,(0,0,0,0)); gd=ImageDraw.Draw(glow,'RGBA'); gd.ellipse((w*.5,-h*.25,w*1.05,h*.5),fill=(*EMBER2,75)); glow=glow.filter(ImageFilter.GaussianBlur(120)); im=Image.alpha_composite(im,glow)
    save(noise_overlay(im.convert('RGB'),7,seed),path,77)

def strategy(path, seed=3, size=(1500,1050)):
    w,h=size; im=radial(size,[(w*.74,h*.22,EMBER,w*.55,.40),(w*.18,h*.78,(29,48,56),w*.52,.26)])
    d=ImageDraw.Draw(im,'RGBA'); random.seed(seed)
    # dashboard cards
    for r in range(3):
      for c in range(3):
        x=w*(.08+c*.3); y=h*(.12+r*.26); ww=w*.23; hh=h*.18
        d.rounded_rectangle((x,y,x+ww,y+hh),24,fill=(240,235,226,18),outline=(240,235,226,28),width=2)
        d.rounded_rectangle((x+22,y+22,x+ww*.55,y+29),4,fill=(240,235,226,70))
        if (r+c)%2==0:
          pts=[]
          for i in range(6): pts.append((x+24+i*(ww-48)/5,y+hh*.72-random.randint(0,int(hh*.32))))
          d.line(pts,fill=(*EMBER2,185),width=5)
        else:
          for i in range(4):
            bh=random.randint(int(hh*.2),int(hh*.5)); d.rounded_rectangle((x+24+i*34,y+hh-22-bh,x+43+i*34,y+hh-22),4,fill=(240,235,226,45+i*18))
    save(noise_overlay(im,9,seed),path,77)

def moment_scene(path, seed=4, size=(1600,1100)):
    w,h=size; im=radial(size,[(w*.5,h*.2,EMBER2,w*.5,.55),(w*.14,h*.7,(61,35,48),w*.48,.30)])
    d=ImageDraw.Draw(im,'RGBA');
    # vague human silhouettes under warm lights
    d.ellipse((w*.40,h*.35,w*.48,h*.47),fill=(5,5,6,245)); d.rounded_rectangle((w*.39,h*.44,w*.49,h*.85),35,fill=(5,5,6,245))
    d.ellipse((w*.50,h*.34,w*.58,h*.46),fill=(7,6,7,240)); d.rounded_rectangle((w*.49,h*.43,w*.60,h*.85),35,fill=(7,6,7,240))
    random.seed(seed)
    for _ in range(28):
      x=random.randint(0,w); y=random.randint(20,int(h*.55)); r=random.randint(9,30)
      d.ellipse((x-r,y-r,x+r,y+r),fill=(255,194,136,random.randint(18,55)))
    im=im.filter(ImageFilter.GaussianBlur(1.2)); save(noise_overlay(im,8,seed),path,76)

def edit_scene(path, seed=5, size=(1500,1050)):
    w,h=size; im=radial(size,[(w*.70,h*.24,(39,73,92),w*.55,.48),(w*.15,h*.78,EMBER,w*.45,.22)]); d=ImageDraw.Draw(im,'RGBA')
    # monitors
    for x,y,ww,hh in [(w*.08,h*.18,w*.38,h*.37),(w*.51,h*.12,w*.38,h*.42)]:
      d.rounded_rectangle((x,y,x+ww,y+hh),18,fill=(2,3,4,245),outline=(240,235,226,28),width=3)
      d.rounded_rectangle((x+18,y+20,x+ww-18,y+hh-18),12,fill=(20,28,33,255))
      # timeline and scopes
      for i in range(9):
        xx=x+26+i*(ww-60)/9; col=EMBER2 if i%3==0 else (80,118,132)
        d.rectangle((xx,y+hh*.65,xx+(ww-60)/12,y+hh*.78+((i%2)*20)),fill=(*col,120))
      d.line((x+28,y+hh*.42,x+ww*.42,y+hh*.28,x+ww*.68,y+hh*.52,x+ww-28,y+hh*.22),fill=(*EMBER2,150),width=4)
    d.rectangle((0,h*.78,w,h),fill=(5,5,6,220)); save(noise_overlay(im,8,seed),path,77)

def studio_scene(path, seed=6, size=(1500,1050)):
    w,h=size; im=radial(size,[(w*.58,h*.35,EMBER2,w*.55,.55),(w*.08,h*.12,(36,66,78),w*.42,.28)]); d=ImageDraw.Draw(im,'RGBA')
    # light stand and softbox
    d.line((w*.25,h*.18,w*.25,h*.86),fill=(20,20,20,245),width=10); d.line((w*.15,h*.86,w*.25,h*.68,w*.35,h*.86),fill=(20,20,20,245),width=7)
    d.polygon([(w*.12,h*.12),(w*.36,h*.14),(w*.32,h*.42),(w*.16,h*.40)],fill=(235,225,207,72),outline=(240,235,226,50))
    d.rounded_rectangle((w*.55,h*.42,w*.83,h*.65),28,fill=(4,4,5,235),outline=(233,119,54,55),width=4)
    d.ellipse((w*.45,h*.45,w*.62,h*.65),fill=(3,3,4,250),outline=(240,235,226,25),width=4)
    save(noise_overlay(im,8,seed),path,77)

def bowl_poster(path,size=(1600,900)):
    w,h=size; im=Image.new('RGB',size,(18,13,10)); d=ImageDraw.Draw(im,'RGBA')
    # table plane and warm overhead light
    d.polygon([(0,h*.46),(w,h*.36),(w,h),(0,h)],fill=(69,42,28,255))
    glow=Image.new('RGBA',size,(0,0,0,0)); gd=ImageDraw.Draw(glow,'RGBA'); gd.ellipse((w*.25,-h*.45,w*.95,h*.52),fill=(*EMBER2,115)); glow=glow.filter(ImageFilter.GaussianBlur(110)); im=Image.alpha_composite(im.convert('RGBA'),glow); d=ImageDraw.Draw(im,'RGBA')
    # bowls and one empty place
    for x,y,s,a in [(w*.28,h*.58,150,230),(w*.58,h*.54,170,235),(w*.77,h*.68,120,170)]:
      d.ellipse((x-s,y-s*.35,x+s,y+s*.35),fill=(225,214,196,a),outline=(255,255,255,45),width=4)
      d.ellipse((x-s*.72,y-s*.25,x+s*.72,y+s*.22),fill=(69,42,28,230))
    # empty bowl as focal white ring
    x,y,s=w*.44,h*.73,130; d.ellipse((x-s,y-s*.34,x+s,y+s*.34),outline=(245,237,220,220),width=9)
    save(noise_overlay(im.convert('RGB'),8,12),path,80)

# Core local visuals
lens_scene(MEDIA/'hero-cinematic.webp',1)
moodboard(MEDIA/'brand-direction.webp',2)
lens_scene(MEDIA/'story-camera.webp',3,False)
moment_scene(MEDIA/'moment-event.webp',4)
studio_scene(MEDIA/'mood-plateau.webp',5)
lens_scene(MEDIA/'mood-rig.webp',6)
studio_scene(MEDIA/'mood-tournage.webp',7)
edit_scene(MEDIA/'mood-post.webp',8)
moment_scene(MEDIA/'mood-moment.webp',9)
bowl_poster(MEDIA/'le-bol-den-face.webp')

# Three dimensions: deliberately distinct, never reused elsewhere
lens_scene(DIMS/'realisation.webp',21,size=(900,600))
moodboard(DIMS/'direction-artistique.webp',22,size=(900,600))
strategy(DIMS/'strategie.webp',23,size=(900,600))

# Simple local wordmark SVG fallbacks. Keep them monochrome so existing card filters stay coherent.
logos={
'sony.svg':'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><rect width="420" height="120" fill="none"/><text x="210" y="82" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-size="78" font-weight="700" letter-spacing="-4" fill="#111">SONY</text></svg>''',
'sigma.svg':'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><rect width="420" height="120" fill="none"/><text x="210" y="79" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="72" font-weight="800" letter-spacing="5" fill="#111">SIGMA</text></svg>''',
'adobe.svg':'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><rect width="420" height="120" fill="none"/><path d="M62 94 105 24h40l-43 70H62Zm104 0-43-70h42l43 70h-42Zm-50-22h38l13 22h-64l13-22Z" fill="#111"/><text x="238" y="78" font-family="Arial,Helvetica,sans-serif" font-size="54" font-weight="700" fill="#111">Adobe</text></svg>''',
'nisi.svg':'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><rect width="420" height="120" fill="none"/><text x="210" y="80" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="76" font-weight="800" font-style="italic" letter-spacing="-3" fill="#111">NiSi</text></svg>''',
'smallrig.svg':'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120"><rect width="500" height="120" fill="none"/><text x="250" y="80" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="68" font-weight="800" letter-spacing="-2" fill="#111">SmallRig</text></svg>'''
}
for name,svg in logos.items(): (LOGOS/name).write_text(svg)
print('Local assets generated in',ROOT/'public/assets')
