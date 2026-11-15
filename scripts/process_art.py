"""Turns design/source-art originals into app-ready assets under assets/ (cut-outs as WebP, backgrounds as JPG)."""
import sys, os, json, numpy as np
from PIL import Image
from rembg import remove, new_session
from scipy import ndimage
ROOT=sys.argv[1]; SRC=f"{ROOT}/design/source-art"; OUT=f"{ROOT}/assets"
sess=new_session("isnet-general-use")

def cutout(im, key=False):
    rgb=im.convert("RGB"); src=np.array(rgb)
    a=np.array(remove(rgb, session=sess))
    alpha=a[:,:,3].astype(np.float32)
    if key:
        # Flat sheet background: recover body parts the model thinned out, near the character only.
        border=np.concatenate([src[:8].reshape(-1,3),src[-8:].reshape(-1,3),src[:,:8].reshape(-1,3),src[:,-8:].reshape(-1,3)])
        bg=np.median(border,axis=0)
        dist=np.sqrt(((src.astype(np.float32)-bg)**2).sum(axis=2))
        f=src.astype(np.float32)/255; mx=f.max(axis=2); mn=f.min(axis=2)
        sat=(mx-mn)/np.maximum(mx,1e-3)
        coloured=(sat>0.2)|(mx<0.45)                      # body parts are saturated or dark; floor shadows are pale and grey
        keyed=np.clip((dist-16)/20,0,1)*255*coloured
        near=ndimage.binary_dilation(alpha>128, iterations=40)
        alpha=np.where(near, np.maximum(alpha,keyed), alpha)
    mask=alpha>128
    filled=ndimage.binary_fill_holes(mask)
    interior=ndimage.binary_erosion(filled, iterations=4)
    alpha=np.where(interior,255,np.maximum(alpha,(filled&~mask)*255))
    out=np.dstack([src, alpha.astype(np.uint8)])          # always keep original colours
    return Image.fromarray(out)

def largest_component(img):
    a=np.array(img); lab,n=ndimage.label(a[:,:,3]>40)
    if n<=1: return img
    sizes=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); keep=1+int(np.argmax(sizes))
    big=ndimage.binary_dilation(lab==keep, iterations=3)
    a[:,:,3]=np.where(big, a[:,:,3], 0); return Image.fromarray(a)

def trim(img, pad=6):
    a=np.array(img)[:,:,3]; ys,xs=np.where(a>8)
    if len(xs)==0: return img
    return img.crop((max(xs.min()-pad,0),max(ys.min()-pad,0),min(xs.max()+pad,img.width),min(ys.max()+pad,img.height)))

def save(img, path, maxdim):
    img=trim(img); s=min(1, maxdim/max(img.size))
    if s<1: img=img.resize((round(img.width*s),round(img.height*s)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path),exist_ok=True); img.save(path,"WEBP",quality=86,method=6)
    return img.size

def components(rgba, min_area):
    a=np.array(rgba)[:,:,3]; lab,n=ndimage.label(a>40); boxes=[]
    for i,sl in enumerate(ndimage.find_objects(lab)):
        if (lab[sl]==i+1).sum()>min_area: boxes.append((sl[1].start,sl[0].start,sl[1].stop,sl[0].stop))
    H=rgba.height
    top=sorted([b for b in boxes if (b[1]+b[3])/2 < H*0.55], key=lambda b:b[0])
    bot=sorted([b for b in boxes if (b[1]+b[3])/2 >= H*0.55], key=lambda b:b[0])
    return top, bot

manifest={}
def sheet(src, top_names, bot_names, prefix, maxdim=640, min_area=15000, key=False):
    im=Image.open(src); rgba=cutout(im, key=key)
    top,bot=components(rgba, min_area)
    assert len(top)==len(top_names) and len(bot)==len(bot_names), (src, len(top), len(bot))
    for names,boxes in ((top_names,top),(bot_names,bot)):
        for n,b in zip(names,boxes):
            crop=rgba.crop((max(b[0]-4,0),max(b[1]-4,0),b[2]+4,b[3]+4))
            p=f"{OUT}/characters/{prefix}_{n}.webp"; manifest[p]=save(largest_component(crop),p,maxdim)

PARTS=os.environ.get("PARTS","all")
if PARTS in ("all","kip"): sheet(f"{SRC}/characters/kip/kip_sheet.jpg",["front","three_quarter","side","back"],["happy","talk","think","worry","cheer","sleepy"],"kip",key=True)
if PARTS=="all": sheet(f"{SRC}/characters/dash/dash_sheet.jpg",["front","three_quarter","side","back"],["excited","smug","shocked","sheepish","panicked","thoughtful"],"dash")
if PARTS=="all": sheet(f"{SRC}/characters/the-melt/melt_sheet.jpg",["drifting","reaching","laughing"],[],"melt",min_area=30000)
if PARTS=="all":
    p=f"{OUT}/characters/kip_full.webp"; manifest[p]=save(cutout(Image.open(f"{SRC}/characters/kip/kip_full.jpg")),p,900)

for f in (sorted(os.listdir(f"{SRC}/props")) if PARTS=="all" else []):
    if f.endswith(".jpg"):
        p=f"{OUT}/props/{f[:-4]}.webp"; manifest[p]=save(cutout(Image.open(f"{SRC}/props/{f}")),p,512)
for f in (sorted(os.listdir(f"{SRC}/mentors")) if PARTS=="all" else []):
    if f.endswith(".jpg"):
        p=f"{OUT}/mentors/{f[:-4]}.webp"; manifest[p]=save(cutout(Image.open(f"{SRC}/mentors/{f}")),p,640)

os.makedirs(f"{OUT}/backgrounds",exist_ok=True)
for f in (sorted(os.listdir(f"{SRC}/backgrounds")) if PARTS=="all" else []):
    if f.endswith(".jpg"):
        im=Image.open(f"{SRC}/backgrounds/{f}").convert("RGB"); p=f"{OUT}/backgrounds/{f}"
        im.save(p,"JPEG",quality=80,optimize=True,progressive=True); manifest[p]=im.size
if PARTS=="all": json.dump({k.replace(OUT+'/',''):v for k,v in manifest.items()}, open(f"{ROOT}/design/source-art/processed-manifest.json","w"), indent=1)
print(len(manifest),"assets written")

# --- Kip wave animation (sprite frames) ---
import glob
if os.environ.get("WAVE_DIR"):
    frames=[largest_component(cutout(Image.open(f), key=True)) for f in sorted(glob.glob(os.environ["WAVE_DIR"]+"/f_*.png"))]
    pts=[np.argwhere(np.array(f)[:,:,3]>8) for f in frames]
    y0=min(p[:,0].min() for p in pts); y1=max(p[:,0].max() for p in pts)
    x0=min(p[:,1].min() for p in pts); x1=max(p[:,1].max() for p in pts)
    os.makedirs(f"{OUT}/characters/kip_wave",exist_ok=True)
    for i,f in enumerate(frames):
        c=f.crop((max(x0-6,0),max(y0-6,0),x1+6,y1+6)); s=480/c.height
        c.resize((round(c.width*s),480),Image.LANCZOS).save(f"{OUT}/characters/kip_wave/{i:02d}.webp","WEBP",quality=82,method=6)
    print("wave frames:",len(frames))
