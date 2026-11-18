#!/usr/bin/env python3
"""
把原始表情包素材（大 PNG / GIF）压成插件内置的 WebP 资源。

用法：
    python scripts/build-assets.py "D:\\baidu_download\\阿哈全部表情包\\阿哈全部表情包"

源目录约定（与本项目作者的素材一致，也可自行改造）：
    1、已抠图/PV里面的/*.png     → assets/pv/
    1、已抠图/游戏里面的/*.png    → assets/game/
    GIF动图/*.gif                → assets/gif/

产物：
    assets/<set>/<原名>.webp     长边 ≤ MAX_SIDE，静态图带 alpha
    assets/catalog.json          清单：[{file, mood, set}]，mood 取自「编号-情绪词」
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageSequence

MAX_SIDE = 256
QUALITY = 82
GIF_QUALITY = 75
SETS = {
    "pv": ("1、已抠图/PV里面的", "png"),
    "game": ("1、已抠图/游戏里面的", "png"),
    "gif": ("GIF动图", "gif"),
}


def fit(size: tuple[int, int]) -> tuple[int, int]:
    w, h = size
    long_side = max(w, h)
    if long_side <= MAX_SIDE:
        return w, h
    k = MAX_SIDE / long_side
    return max(1, round(w * k)), max(1, round(h * k))


def mood_of(name: str) -> str:
    """`408-痛快.png` → `痛快`；`wink-1.gif` → `wink-1`。"""
    stem = Path(name).stem
    return stem.split("-", 1)[1] if "-" in stem else stem


def convert_static(src: Path, dst: Path) -> tuple[int, int]:
    img = Image.open(src)
    img = img.convert("RGBA") if img.mode in ("RGBA", "LA", "P") else img.convert("RGB")
    img = img.resize(fit(img.size), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "WEBP", quality=QUALITY, method=6, exact=True)
    return src.stat().st_size, dst.stat().st_size


def convert_gif(src: Path, dst: Path) -> tuple[int, int]:
    frames: list[Image.Image] = []
    durations: list[int] = []
    with Image.open(src) as im:
        for frame in ImageSequence.Iterator(im):
            rgba = frame.convert("RGBA")
            frames.append(rgba.resize(fit(rgba.size), Image.LANCZOS))
            durations.append(frame.info.get("duration", 100) or 100)
    dst.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        dst,
        "WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        quality=GIF_QUALITY,
        method=6,
    )
    return src.stat().st_size, dst.stat().st_size


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: build-assets.py <source-dir>", file=sys.stderr)
        return 2
    root = Path(sys.argv[1])
    if not root.is_dir():
        print(f"source dir not found: {root}", file=sys.stderr)
        return 1
    repo = Path(__file__).resolve().parent.parent
    assets = repo / "assets"
    for stale in assets.rglob("*.webp"):
        stale.unlink()

    catalog: list[dict[str, str]] = []
    total_in = total_out = 0
    for set_name, (rel_dir, ext) in SETS.items():
        src_dir = root / rel_dir
        files = sorted(p for p in src_dir.rglob(f"*.{ext}") if p.is_file())
        if not files:
            print(f"!! {set_name}: no *.{ext} under {src_dir}")
            continue
        size_in = size_out = 0
        for i, src in enumerate(files, 1):
            dst = assets / set_name / (src.stem + ".webp")
            convert = convert_gif if ext == "gif" else convert_static
            a, b = convert(src, dst)
            size_in += a
            size_out += b
            catalog.append(
                {
                    "file": f"{set_name}/{src.stem}.webp",
                    "mood": mood_of(src.name),
                    "set": set_name,
                }
            )
            if i % 50 == 0:
                print(f"  {set_name}: {i}/{len(files)}", flush=True)
        total_in += size_in
        total_out += size_out
        print(
            f"{set_name:5} {len(files):4} files  "
            f"{size_in / 1e6:8.1f} MB -> {size_out / 1e6:6.2f} MB",
            flush=True,
        )

    (assets / "catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=0), encoding="utf-8"
    )
    print(
        f"TOTAL {len(catalog)} files  {total_in / 1e6:.1f} MB -> {total_out / 1e6:.2f} MB"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
