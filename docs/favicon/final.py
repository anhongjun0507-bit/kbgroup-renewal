"""B안 최종 자산: 흰 둥근 타일(favicon·icon), 흰 정사각(apple-icon)."""
import sys
from PIL import Image, ImageDraw
master, app = Image.open(sys.argv[1]).convert("RGBA"), sys.argv[2]
l, t, r, b = master.getchannel("A").getbbox()
mark = master.crop((l, t, r, b))

def tile(size, pad, radius):
    S = size * 4  # 4배로 그린 뒤 축소(가장자리 매끈)
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(canvas).rounded_rectangle((0, 0, S - 1, S - 1), radius=round(S * radius), fill=(255, 255, 255, 255))
    inner = round(S * (1 - 2 * pad))
    m = mark.resize((inner, round(inner * mark.height / mark.width)), Image.LANCZOS)
    canvas.alpha_composite(m, ((S - m.width) // 2, (S - m.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)

icos = [tile(s, 0.06, 0.18) for s in (16, 32, 48)]
icos[2].save(f"{app}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icos[:2])
tile(512, 0.08, 0.18).save(f"{app}/icon.png", optimize=True)
tile(180, 0.12, 0).convert("RGB").save(f"{app}/apple-icon.png", optimize=True)
for s in (16, 32):
    tile(s, 0.06, 0.18).save(f"fav/final-{s}.png")
