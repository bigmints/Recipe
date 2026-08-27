#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRAMES="$ROOT/.demo-frames"
HTML="file://$ROOT/docs/pantry-demo.html"

rm -rf "$FRAMES"
mkdir -p "$FRAMES" "$ROOT/assets"

frame=1
for scene in 0 1 2 3; do
  chromium \
    --headless \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --window-size=960,540 \
    --screenshot="$FRAMES/scene-${scene}.png" \
    "$HTML?scene=$scene" >/dev/null 2>&1
  for _ in $(seq 1 15); do
    printf -v target '%s/frame-%03d.png' "$FRAMES" "$frame"
    cp "$FRAMES/scene-${scene}.png" "$target"
    frame=$((frame + 1))
  done
done

ffmpeg -y -loglevel error \
  -framerate 15 \
  -i "$FRAMES/frame-%03d.png" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  "$ROOT/assets/pantry-demo.mp4"

cp "$FRAMES/frame-001.png" "$ROOT/assets/pantry-demo-poster.png"
rm -rf "$FRAMES"
printf 'Generated assets/pantry-demo.mp4 and assets/pantry-demo-poster.png\n'
