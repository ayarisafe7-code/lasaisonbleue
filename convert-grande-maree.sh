#!/usr/bin/env bash
set -euo pipefail

# Script to convert the source JPEG into WebP (large + small) and optional WebM loop.
# Usage: ./scripts/convert-grande-maree.sh [--webm]
# Run from project root where the source JPEG is located.

SRC="AdobeStock_549180191_Editorial_Use_Only.jpeg"
OUT_WEBP_LARGE="AdobeStock_549180191_Editorial_Use_Only.webp"
OUT_WEBP_SMALL="AdobeStock_549180191_Editorial_Use_Only-800.webp"
OUT_WEBM="AdobeStock_549180191_Editorial_Use_Only.webm"

MAKE_WEBM=false
if [[ ${1:-} == "--webm" ]]; then
  MAKE_WEBM=true
fi

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: source file '$SRC' not found in $(pwd)"
  exit 2
fi

if command -v cwebp >/dev/null 2>&1; then
  echo "Using cwebp to generate WebP images..."
  cwebp -q 80 "$SRC" -o "$OUT_WEBP_LARGE"
  cwebp -q 80 -resize 800 0 "$SRC" -o "$OUT_WEBP_SMALL"
  echo "Generated: $OUT_WEBP_LARGE, $OUT_WEBP_SMALL"

elif command -v ffmpeg >/dev/null 2>&1; then
  echo "Using ffmpeg to generate WebP images..."
  ffmpeg -y -i "$SRC" -vf "scale=1920:-2" -q:v 75 "$OUT_WEBP_LARGE"
  ffmpeg -y -i "$SRC" -vf "scale=800:-2" -q:v 75 "$OUT_WEBP_SMALL"
  echo "Generated: $OUT_WEBP_LARGE, $OUT_WEBP_SMALL"

elif command -v magick >/dev/null 2>&1; then
  echo "Using ImageMagick (magick) to generate WebP images..."
  magick "$SRC" -resize 1920x "$OUT_WEBP_LARGE"
  magick "$SRC" -resize 800x "$OUT_WEBP_SMALL"
  echo "Generated: $OUT_WEBP_LARGE, $OUT_WEBP_SMALL"

else
  echo "No image conversion tool found (cwebp, ffmpeg, or magick). Install one and re-run."
  exit 3
fi

if [[ "$MAKE_WEBM" == true ]]; then
  if command -v ffmpeg >/dev/null 2>&1; then
    echo "Generating a short looping WebM (2s, VP9)."
    ffmpeg -y -loop 1 -i "$SRC" -c:v libvpx-vp9 -t 2 -vf "scale=1280:-2,format=yuv420p" -an "$OUT_WEBM"
    echo "Generated: $OUT_WEBM"
  else
    echo "ffmpeg is required to create WebM; skipping webm generation."
  fi
fi

echo "Done. Place the generated files at the project root so CSS/HTML can reference them."
