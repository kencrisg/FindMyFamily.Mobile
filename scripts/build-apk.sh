#!/usr/bin/env bash
#
# Compila un APK de release instalable, sin Metro y sin Expo Go.
#
# Uso:
#   ./scripts/build-apk.sh
#   EXPO_PUBLIC_API_URL=https://otra-url ./scripts/build-apk.sh
#
# La URL de la API se "hornea" dentro del APK en tiempo de compilación: si cambias de
# backend, hay que volver a compilar. Por defecto toma EXPO_PUBLIC_API_URL del entorno
# o del archivo .env.
#
# Resultado: android/app/build/outputs/apk/release/app-release.apk

set -euo pipefail

cd "$(dirname "$0")/.."

API_URL="${EXPO_PUBLIC_API_URL:-}"

if [ -z "$API_URL" ] && [ -f .env ]; then
  API_URL="$(grep -E '^EXPO_PUBLIC_API_URL=' .env | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
fi

if [ -z "$API_URL" ]; then
  echo "❌ Falta EXPO_PUBLIC_API_URL. Defínela en el entorno o en .env." >&2
  exit 1
fi

case "$API_URL" in
  https://*) ;;
  *) echo "⚠️  EXPO_PUBLIC_API_URL no empieza por https:// ($API_URL)." >&2
     echo "    Un build de producción la rechaza; usa la URL HTTPS de Render." >&2 ;;
esac

# Gradle necesita saber dónde está el SDK. El archivo está en .gitignore, así que se
# recrea solo cuando falta.
if [ ! -f android/local.properties ]; then
  printf 'sdk.dir=%s\n' "${ANDROID_HOME:-$HOME/Library/Android/sdk}" > android/local.properties
fi

export EXPO_PUBLIC_API_URL="$API_URL"
export NODE_ENV=production

echo "🔨 Compilando APK contra: $API_URL"
echo "   (el primer build tarda varios minutos)"

cd android
./gradlew assembleRelease --console=plain
cd ..

APK="android/app/build/outputs/apk/release/app-release.apk"

if [ ! -f "$APK" ]; then
  echo "❌ No se generó el APK esperado en $APK" >&2
  exit 1
fi

echo
echo "✅ APK listo: $APK"
ls -lh "$APK"
