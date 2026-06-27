from pathlib import Path
import math
import struct
import zlib

ROOT = Path(__file__).parent
MEDIA = ROOT / "media"
MEDIA.mkdir(exist_ok=True)


def write_png(path, width, height, pixel_fn):
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            row.extend(pixel_fn(x, y))
        rows.append(bytes(row))

    raw = b"".join(rows)

    def chunk(kind, data):
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 5))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def mix(a, b, t):
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def soft_photo(path, width, height, palette, seed=0, sun=None):
    c1, c2, c3, accent = palette

    def px(x, y):
        nx = x / max(width - 1, 1)
        ny = y / max(height - 1, 1)
        base = mix(c1, c2, min(1, ny * 0.85 + nx * 0.16))
        haze = 0.08 * math.sin((x + seed * 37) * 0.025) + 0.06 * math.cos((y + seed * 19) * 0.018)
        if sun:
            sx, sy, strength = sun
            d = math.hypot(nx - sx, ny - sy)
            glow = max(0, 1 - d * 2.7) * strength
            base = mix(base, c3, glow)
        aisle = max(0, 1 - abs(nx - 0.5) * 3.2) * max(0, ny - 0.35)
        base = mix(base, accent, aisle * 0.36)
        vignette = min(0.36, math.hypot(nx - 0.5, ny - 0.48) * 0.42)
        r, g, b = mix(base, (28, 24, 21), vignette)
        r = max(0, min(255, int(r + haze * 255)))
        g = max(0, min(255, int(g + haze * 180)))
        b = max(0, min(255, int(b + haze * 140)))
        return (r, g, b)

    write_png(path, width, height, px)


palettes = [
    ((249, 219, 190), (148, 91, 96), (255, 242, 218), (232, 186, 126)),
    ((232, 238, 220), (91, 111, 87), (255, 236, 198), (208, 155, 97)),
    ((245, 227, 213), (111, 78, 80), (255, 248, 233), (192, 132, 93)),
    ((232, 218, 202), (64, 76, 68), (248, 220, 177), (171, 120, 67)),
    ((246, 235, 222), (127, 81, 71), (255, 238, 201), (189, 141, 83)),
    ((223, 232, 231), (79, 92, 105), (250, 231, 201), (194, 151, 92)),
    ((252, 229, 205), (154, 77, 84), (255, 245, 210), (232, 175, 93)),
    ((229, 226, 216), (55, 66, 61), (255, 224, 177), (174, 113, 67)),
]

soft_photo(MEDIA / "hero-wedding.png", 1200, 800, palettes[0], seed=21, sun=(0.28, 0.26, 0.8))

for index, palette in enumerate(palettes, start=1):
    soft_photo(
        MEDIA / f"photo-{index:02}.png",
        720 if index == 1 else 620,
        820,
        palette,
        seed=index * 13,
        sun=(0.2 + (index % 3) * 0.18, 0.22, 0.58),
    )

for index, palette in enumerate(palettes[:3], start=1):
    soft_photo(
        MEDIA / f"video-poster-{index:02}.png",
        900,
        560,
        palette,
        seed=index * 29,
        sun=(0.7, 0.22 + index * 0.08, 0.7),
    )

print(f"Generated media in {MEDIA}")
