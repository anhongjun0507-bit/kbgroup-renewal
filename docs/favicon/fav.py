"""Favicon 시안 A/B 생성 + 16/32 렌더 비교 시트."""
import sys
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size


def white_to_alpha(img):
    """테두리와 이어진 흰 배경만 투명으로(flood fill). 문자 K·B 안쪽 흰색은 유지."""
    from PIL import ImageFilter
    near = img.convert("L").point(lambda v: 255 if v > 235 else 0)
    mask = Image.new("L", (img.width + 2, img.height + 2), 255)
    mask.paste(near, (1, 1))
    ImageDraw.floodfill(mask, (0, 0), 128)
    bg = mask.crop((1, 1, img.width + 1, img.height + 1)).point(lambda v: 255 if v == 128 else 0)
    bg = bg.filter(ImageFilter.MaxFilter(3))  # 안티앨리어싱 흰 테두리 1px 제거
    rgba = img.convert("RGBA")
    rgba.putalpha(bg.point(lambda v: 0 if v else 255))
    return rgba


def bbox(img):
    return img.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()


def square(img, pad_ratio):
    l, t, r, b = bbox(img)
    img = img.crop((l, t, r, b))
    side = round(max(img.size) * (1 + 2 * pad_ratio))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    return canvas


full = white_to_alpha(im)
# B안: KB 문자 블록(y≈605~) 위까지만 — 산형 3개
top = full.crop((0, 0, W, 590))

variants = {"A": square(full, 0.04), "B": square(top, 0.04)}
for k, v in variants.items():
    v.save(f"{out}/master-{k}.png")


def on_bg(icon, bg):
    base = Image.new("RGBA", icon.size, bg)
    base.alpha_composite(icon)
    return base


def white_plate(icon):
    return on_bg(icon, (255, 255, 255, 255))


BGS = [("light tab", (241, 243, 244, 255)), ("dark tab", (53, 54, 58, 255))]
SIZES = [16, 32]
ZOOM = 8
rows = []
for k, master in variants.items():
    for plate in ("transparent", "white"):
        row = []
        for size in SIZES:
            ic = master.resize((size, size), Image.LANCZOS)
            if plate == "white":
                ic = white_plate(ic)
            ic.save(f"{out}/{k}-{plate}-{size}.png")
            for _, bg in BGS:
                cell = on_bg(ic, bg).resize((size * ZOOM, size * ZOOM), Image.NEAREST)
                row.append(cell)
        rows.append((f"{k} / {plate}", row))

cw = 32 * ZOOM
sheet = Image.new("RGB", (180 + 4 * (cw + 16), len(rows) * (cw + 16) + 30), "white")
d = ImageDraw.Draw(sheet)
for i, h in enumerate(["16 light", "16 dark", "32 light", "32 dark"]):
    d.text((180 + i * (cw + 16), 8), h, fill="black")
for r, (label, cells) in enumerate(rows):
    y = 30 + r * (cw + 16)
    d.text((8, y + cw // 2), label, fill="black")
    for i, c in enumerate(cells):
        sheet.paste(c, (180 + i * (cw + 16), y))
sheet.save(f"{out}/compare.png")
print("ok", {k: v.size for k, v in variants.items()})
