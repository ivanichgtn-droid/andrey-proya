"""Generate an actual torso-only crop of the first, monochrome family/guitar photo.
Leaves the original and all other photos unchanged.
"""
from pathlib import Path
from PIL import Image, ImageOps

source = Path("assets/photo-1.webp")
target = Path("assets/photo-1-torso.webp")
if not source.exists():
    raise SystemExit(f"Missing source photo: {source}")
with Image.open(source) as src:
    image = ImageOps.exif_transpose(src).convert("RGB")
    width, height = image.size
    if width < 400 or height < 400:
        raise ValueError(f"Source is too small: {image.size}")
    # Preserve heads, upper bodies and guitar while discarding thighs/feet.
    cut_height = round(height * 0.62)
    cropped = image.crop((0, 0, width, cut_height))
    cropped.save(target, format="WEBP", quality=92, method=6)
    print(f"Source: {width}x{height}; torso crop: {cropped.size}; output: {target}")
