#!/usr/bin/env bash
# Prépare le fond vidéo de l'accueil à partir d'un fichier source (MP4/MOV) :
#   tools/video/hero.sh chemin/vers/source.mp4 [début en secondes] [durée en secondes]
# Produit public/assets/video/hero.{mp4,webm,jpg} : muet, 1920 px, boucle courte, poids maîtrisé.
# Puis, dans templates/pages.mjs, renseigner homeHeroVideo.file = '/assets/video/hero'.
set -euo pipefail
src="$1"; start="${2:-0}"; dur="${3:-14}"
out="$(cd "$(dirname "$0")/../.." && pwd)/public/assets/video"; mkdir -p "$out"
vf="scale=1920:-2:flags=lanczos,fps=25,format=yuv420p"
ffmpeg -v error -y -ss "$start" -t "$dur" -i "$src" -an -vf "$vf" -c:v libx264 -profile:v high -preset slow -crf 26 -movflags +faststart "$out/hero.mp4"
ffmpeg -v error -y -ss "$start" -t "$dur" -i "$src" -an -vf "$vf" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good "$out/hero.webm"
ffmpeg -v error -y -ss "$start" -i "$src" -frames:v 1 -vf "scale=1920:-2" -q:v 3 "$out/hero.jpg"
ls -lh "$out"
