"""Derive web-sized renditions from the approved Gemini masters.

The masters are frozen: this script only reads them. Every output goes to
`public/assets/gemini/web/`, so the approved PNGs stay byte-identical on
disk and the runtime can be pointed back at them by editing one constant
in `src/data/landingAssets.ts`.

Nothing here changes framing, crop, colour or content — only pixel
dimensions and the delivery container, which is what makes an 85 MB
landing page into a ~2 MB one.

Run: python scripts/build-web-assets.py
"""

import os
from PIL import Image

SRC = 'public/assets/gemini'
OUT = os.path.join(SRC, 'web')

# Widest box each rendition has to fill, doubled for high-DPI screens.
HERO_WIDE = 1920   # full-bleed landing + final-CTA backdrops (1480 CSS px)
HERO_CARD = 800    # category card art (335 CSS px)
PORTRAIT = 800     # character portrait frames (281 CSS px)

QUALITY = 82


def emit(src_path: str, out_path: str, width: int) -> int:
    with Image.open(src_path) as im:
        im = im.convert('RGB')
        height = round(im.height * width / im.width)
        im = im.resize((width, height), Image.LANCZOS)
        im.save(out_path, 'WEBP', quality=QUALITY, method=6)
    return os.path.getsize(out_path)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    total_src = 0
    total_out = 0

    for name in sorted(os.listdir(SRC)):
        if not name.endswith('.png'):
            continue
        src = os.path.join(SRC, name)
        stem = name[:-4]
        total_src += os.path.getsize(src)

        if stem.startswith('hero-'):
            jobs = [(f'{stem}-wide.webp', HERO_WIDE), (f'{stem}-card.webp', HERO_CARD)]
        else:
            jobs = [(f'{stem}.webp', PORTRAIT)]

        for out_name, width in jobs:
            size = emit(src, os.path.join(OUT, out_name), width)
            total_out += size
            print(f'{out_name:46s} {width:>5}px {size // 1024:>5}KB')

    print(f'\nmasters {total_src // 1048576}MB -> renditions {total_out // 1024}KB')


if __name__ == '__main__':
    main()
