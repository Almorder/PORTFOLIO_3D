# Texture « soie chaude » de la DA : champ lisse rouge profond → vermillon → orange, généré en haute définition.
# Le grain n'est pas cuit dans l'image : il est posé par-dessus en CSS (tuile nette, jamais étirée).
import numpy as np, sys
from PIL import Image
def field(w,h,seed):
    rng=np.random.default_rng(seed)
    y,x=np.mgrid[0:h,0:w].astype(np.float32); x/=w; y/=h; a=w/h
    X=x*a; Y=y
    # déformation douce du domaine (plis de tissu)
    for k in range(3):
        f=rng.uniform(.9,2.2); p=rng.uniform(0,6.28,2); amp=.16/(k+1)
        X,Y=X+amp*np.sin(Y*f*3.1+p[0]+X*1.3),Y+amp*np.cos(X*f*2.7+p[1]-Y*1.1)
    v=np.zeros_like(X)
    for k in range(5):
        ang=rng.uniform(0,3.14); f=rng.uniform(1.1,2.6); ph=rng.uniform(0,6.28)
        v+=np.sin((X*np.cos(ang)+Y*np.sin(ang))*f*3.14+ph)/(1+.35*k)
    v=(v-v.min())/(v.max()-v.min())
    return v
def ramp(v):
    stops=[(0,(58,8,6)),(.28,(122,16,10)),(.52,(176,34,14)),(.72,(222,84,20)),(.88,(244,128,28)),(1,(250,160,58))]
    out=np.zeros(v.shape+(3,),np.float32)
    for (a,ca),(b,cb) in zip(stops,stops[1:]):
        m=(v>=a)&(v<=b); t=((v-a)/(b-a))[m]; t=t*t*(3-2*t)
        for c in range(3): out[...,c][m]=ca[c]+(cb[c]-ca[c])*t
    return out
def make(w,h,seed,path):
    v=field(w,h,seed)**1.25
    img=ramp(v)+np.random.default_rng(seed).uniform(-.6,.6,v.shape+(1,))  # tramage anti-bandes
    Image.fromarray(np.clip(img,0,255).astype(np.uint8)).save(path,'WEBP',quality=82,method=6); print(path,w,h)
out=sys.argv[1]
make(2560,1440,7,out+'/texture-wide.webp')
make(1400,1750,11,out+'/texture.webp')
make(1400,1750,23,out+'/texture-b.webp')
make(1400,1750,42,out+'/texture-c.webp')
# grain : tuile 220 px, bruit monochrome doux
rng=np.random.default_rng(3); n=rng.normal(0,1,(220,220)); a=np.clip(np.abs(n)*46,0,150).astype(np.uint8)
g=np.where(n>0,255,0).astype(np.uint8)
Image.merge('LA',(Image.fromarray(g),Image.fromarray(a))).save(out+'/grain.png',optimize=True); print('grain')
