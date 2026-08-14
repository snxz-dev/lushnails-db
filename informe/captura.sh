#!/usr/bin/env bash
# captura.sh — toma una captura de región y la guarda en capturas/<nombre>.png
#
# Uso:
#   ./captura.sh 01_instalacion
#   ./captura.sh 02_nuevo_proyecto
#   ... (nombres de CAPTURAS en generar_informe.py)
#
# Después de lanzarlo, arrastra el ratón sobre la ventana de ProjectLibre.
# Requiere grim + slurp (ya instalados; es el mismo mecanismo que Mod+Shift+A).
set -e

DIR="$(dirname "$(realpath "$0")")"
mkdir -p "$DIR/capturas"

NOMBRE="${1:?Uso: ./captura.sh 01_instalacion}"
DEST="$DIR/capturas/${NOMBRE}.png"

GEOM=$(slurp)
[ -n "$GEOM" ] || exit 1

grim -g "$GEOM" "$DEST"
notify-send "Captura" "Guardada en capturas/${NOMBRE}.png"
echo "OK: $DEST"
