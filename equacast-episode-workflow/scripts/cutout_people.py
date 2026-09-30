from rembg import remove, new_session
from PIL import Image
s = new_session("u2net_human_seg")
a = Image.open("../images/4.webp").convert("RGB"); print(a.size)
r = a.crop((800,80,a.width,a.height)); r.save("crop_right.png")
remove(r, session=s).save("cut_right.png")
l = Image.open("../images/5.png").convert("RGB"); print(l.size)
remove(l, session=s).save("cut_left.png")
g = Image.open("../images/6.jpg"); print(g.size)
