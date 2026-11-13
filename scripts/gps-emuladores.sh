#!/usr/bin/env bash
#
# Simula el GPS de dos emuladores en ubicaciones distintas, para probar FindMyFamily con
# dos "teléfonos" a la vez.
#
# Por qué hace falta: el GPS del emulador solo entrega una posición si en ese momento alguna
# app la está pidiendo. Una posición fijada a mano en ⋯ → Location se pierde si nadie escucha,
# y el teléfono que responde a una petición solo escucha unos segundos. Enviando la posición
# cada 2 s, siempre hay una disponible, igual que en un teléfono real.
#
# Uso:
#   ./scripts/gps-emuladores.sh                 # posiciones por defecto
#   EMU1_POS="-99.1677 19.4270" EMU2_POS="-99.1332 19.4326" ./scripts/gps-emuladores.sh
#
# Formato de las posiciones: "LONGITUD LATITUD" (primero la longitud, como pide el emulador).
# Para pararlo: Ctrl+C.

set -u

EMU1="${EMU1:-emulator-5554}"
EMU2="${EMU2:-emulator-5556}"
EMU1_POS="${EMU1_POS:--99.1677 19.4270}"   # Ángel de la Independencia, CDMX
EMU2_POS="${EMU2_POS:--99.1332 19.4326}"   # Zócalo, CDMX
INTERVAL="${INTERVAL:-2}"

for dev in "$EMU1" "$EMU2"; do
  if ! adb -s "$dev" get-state >/dev/null 2>&1; then
    echo "⚠️  $dev no está conectado. Emuladores disponibles:" >&2
    adb devices >&2
    exit 1
  fi
done

echo "GPS simulado cada ${INTERVAL}s (Ctrl+C para parar):"
echo "  $EMU1 → $EMU1_POS"
echo "  $EMU2 → $EMU2_POS"

while true; do
  # shellcheck disable=SC2086  # la posición son dos argumentos a propósito
  adb -s "$EMU1" emu geo fix $EMU1_POS >/dev/null 2>&1 || echo "$(date +%T) ⚠️  $EMU1 no responde"
  # shellcheck disable=SC2086
  adb -s "$EMU2" emu geo fix $EMU2_POS >/dev/null 2>&1 || echo "$(date +%T) ⚠️  $EMU2 no responde"
  sleep "$INTERVAL"
done
