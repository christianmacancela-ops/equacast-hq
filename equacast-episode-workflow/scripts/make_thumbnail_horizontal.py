from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageChops
import numpy as np
W,H=1280,720
# background radial glow
yy,xx=np.mgrid[0:H,0:W]
d=np.sqrt(((xx-W*0.5)/W)**2+((yy-H*0.25)/H)**2)
t=np.clip(1-d*1.6,0,1)**1.5
base=np.array([10,6,4]);glow=np.array([78,36,14])
bg=(base[None,None,:]+(glow-base)[None,None,:]*t[...,None]).astype('uint8')
img=Image.fromarray(bg).convert("RGBA")

def text_layer(txt,font,fill_grad=None,fill=None,stroke=0,stroke_fill=(255,255,255),shadow=(0,0,0),so=(10,10),angle=0):
    tmp=Image.new("RGBA",(W*2,H*2),(0,0,0,0));dr=ImageDraw.Draw(tmp)
    bbox=dr.textbbox((0,0),txt,font=font,stroke_width=stroke)
    w,h=bbox[2]-bbox[0],bbox[3]-bbox[1]
    pad=40;L=Image.new("RGBA",(w+pad*2+abs(so[0]),h+pad*2+abs(so[1])),(0,0,0,0))
    ox,oy=pad-bbox[0],pad-bbox[1]
    sd=ImageDraw.Draw(L)
    sd.text((ox+so[0],oy+so[1]),txt,font=font,fill=shadow+(255,),stroke_width=stroke,stroke_fill=shadow+(255,))
    main=Image.new("RGBA",L.size,(0,0,0,0));md=ImageDraw.Draw(main)
    md.text((ox,oy),txt,font=font,fill=(255,255,255,255),stroke_width=stroke,stroke_fill=stroke_fill+(255,))
    if fill_grad:
        fm=Image.new("L",L.size,0);ImageDraw.Draw(fm).text((ox,oy),txt,font=font,fill=255)
        g=Image.new("RGBA",L.size);gp=g.load()
        top,bot=fill_grad
        for y in range(L.size[1]):
            k=min(max((y-pad)/max(h,1),0),1)
            c=tuple(int(top[i]+(bot[i]-top[i])*k) for i in range(3))+(255,)
            for x in range(L.size[0]):gp[x,y]=c
        main.paste(g,(0,0),fm)
    elif fill:
        fm=Image.new("L",L.size,0);ImageDraw.Draw(fm).text((ox,oy),txt,font=font,fill=255)
        main.paste(Image.new("RGBA",L.size,fill+(255,)),(0,0),fm)
    L=Image.alpha_composite(L,main)
    if angle:L=L.rotate(angle,expand=True,resample=Image.BICUBIC)
    return L

anton=lambda s:ImageFont.truetype("Anton.ttf",s)

# title
title=text_layer("EQUACAST",anton(300),fill_grad=((247,160,75),(200,75,20)),stroke=10,so=(12,14))
# fit width
tw=840;r=tw/title.width;title=title.resize((tw,int(title.height*r)),Image.LANCZOS)
img.alpha_composite(title,((W-title.width)//2,14))

def sticker(cut,height,pos,bright=1.0,contrast=1.0,outline=9,gamma=1.0):
    c=cut.copy()
    bb=c.getbbox();c=c.crop(bb)
    r=height/c.height;c=c.resize((int(c.width*r),height),Image.LANCZOS)
    rgb=c.convert("RGB");rgb=ImageEnhance.Brightness(rgb).enhance(bright);rgb=ImageEnhance.Contrast(rgb).enhance(contrast)
    import numpy as np
    arr=np.array(rgb).astype(float)/255
    arr=arr**gamma
    arr=arr*np.array([1.06,1.0,0.90])
    arr=np.clip((arr-0.5)*contrast+0.5,0,1)
    rgb=Image.fromarray((arr*255).astype("uint8"))
    rgb=rgb.filter(ImageFilter.UnsharpMask(2,110,3))
    a=c.split()[3]
    a=a.point(lambda v:0 if v<90 else 255).filter(ImageFilter.GaussianBlur(1.2))
    # white outline
    pad=90
    A=Image.new("L",(c.width+pad*2,c.height+pad*2),0);A.paste(a,(pad,pad))
    dil=A.filter(ImageFilter.MaxFilter(outline*2+1)).filter(ImageFilter.GaussianBlur(1.5))
    out=Image.new("RGBA",A.size,(0,0,0,0))
    rim=dil.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(22)).point(lambda v:int(v*0.85))
    out.paste(Image.new("RGBA",A.size,(255,120,30,255)),(0,0),rim)
    sh=Image.new("RGBA",A.size,(0,0,0,170));shm=dil.filter(ImageFilter.GaussianBlur(10))
    out.paste(sh,(10,10),shm)
    out.paste(Image.new("RGBA",A.size,(255,255,255,255)),(0,0),dil)
    person=rgb.convert("RGBA");person.putalpha(a)
    out.alpha_composite(person,(pad,pad))
    x,y=pos
    img.alpha_composite(out,(x-pad,y-pad)) if x-pad>=0 and y-pad>=0 else img.alpha_composite(out.crop((max(0,pad-x),max(0,pad-y),out.width,out.height)),(max(0,x-pad),max(0,y-pad)))

c2=Image.open("cut_left.png")
c3=Image.open("cut_right.png"); c3=c3.crop((0,0,c3.width-45,445))
import numpy as np
g=Image.open("../images/6.jpg").convert("L")
arr=np.array(g).astype(float)
alpha=np.clip((200-arr)/140,0,1)
fo=np.zeros((g.height,g.width,4),dtype="uint8");fo[...,0]=255;fo[...,1]=214;fo[...,2]=0;fo[...,3]=(alpha*255).astype("uint8")
fomo=Image.fromarray(fo,"RGBA").resize((330,330),Image.LANCZOS)
a8=fomo.split()[3].point(lambda v:255 if v>110 else 0)
blk=Image.new("RGBA",fomo.size,(0,0,0,0));blk.paste((0,0,0,255),(0,0),a8.filter(ImageFilter.MaxFilter(5)))
pad=30
fl=Image.new("RGBA",(fomo.width+pad*2,fomo.height+pad*2),(0,0,0,0))
glow=Image.new("RGBA",fl.size,(0,0,0,0));glow.paste((255,170,0,255),(pad,pad),a8.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(14)).point(lambda v:int(v*0.6)))
fl.alpha_composite(blk,(pad+7,pad+7));fl.alpha_composite(fomo,(pad,pad))
fl=fl.rotate(-4,expand=True,resample=Image.BICUBIC)

sticker(c2,480,(-40,240),bright=1.0,contrast=1.08,gamma=0.78)
sticker(c3,500,(740,220),bright=1.0,contrast=1.06,gamma=0.92)

img.alpha_composite(fl,(640-fl.width//2,250))
# vignette
vy=np.sqrt(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2)
v=np.clip((vy-0.85)*0.6,0,0.55)
arrI=np.array(img.convert("RGB")).astype(float)*(1-v[...,None])
img=Image.fromarray(arrI.astype("uint8")).convert("RGBA")
c1=text_layer("DRAKE'S",anton(56),fill=(255,255,255),stroke=7,stroke_fill=(0,0,0),so=(5,5))
c2t=text_layer("2026?",anton(78),fill=(255,214,0),stroke=8,stroke_fill=(0,0,0),so=(5,5))
c1=c1.crop(c1.getbbox());c2t=c2t.crop(c2t.getbbox())
cw=max(c1.width,c2t.width);ch=c1.height+c2t.height-4
cl=Image.new("RGBA",(cw,ch),(0,0,0,0))
cl.alpha_composite(c1,((cw-c1.width)//2,0));cl.alpha_composite(c2t,((cw-c2t.width)//2,c1.height-4))
cl=cl.rotate(6,expand=True,resample=Image.BICUBIC)
img.alpha_composite(cl,(W-cl.width-14,62))
d=ImageDraw.Draw(img)
d.rectangle((34,34,132,82),fill=(214,88,30),outline=(255,255,255),width=3)
d.text((83,58),"EP. 02",font=anton(30),fill=(255,255,255),anchor="mm")
img.convert("RGB").save("thumbnail.png")
