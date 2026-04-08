#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# seed-supabase.sh — Ejecuta seeds contra Supabase (remoto)
#
# Uso:
#   ./scripts/seed-supabase.sh              # Ejecuta TODOS los seeds
#   ./scripts/seed-supabase.sh ourense      # Solo Ourense
#   ./scripts/seed-supabase.sh pontevedra   # Solo Pontevedra
#   ./scripts/seed-supabase.sh lugo         # Solo Lugo
#   ./scripts/seed-supabase.sh coruña       # Solo A Coruña
#
# En CI, se puede pasar DATABASE_URL como variable de entorno.
# En local, pide la contraseña de forma interactiva.
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

SUPABASE_HOST="aws-1-eu-north-1.pooler.supabase.com"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres.vrqaamkqoiuppqtrzpbu"
SUPABASE_DB="postgres"

# ── Mapa de provincias → scripts ─────────────────────────────────────
declare -A PROVINCE_SEEDS=(
  [ourense]="seed-cofourense.ts"
  [pontevedra]="seed-cofpontevedra.ts"
  [lugo]="seed-coflugo.ts"
  [coruña]="seed-cofc.ts"
  [coruna]="seed-cofc.ts"
  [madrid]="seed-cofm.ts"
  [barcelona]="seed-farmaguia.ts"
)

ALL_SEEDS=(
  "seed-cofourense.ts"
  "seed-cofpontevedra.ts"
  "seed-coflugo.ts"
  "seed-cofc.ts"
  "seed-cofm.ts"
  "seed-farmaguia.ts"
)

# ── Determinar qué seeds ejecutar ───────────────────────────────────
PROVINCE="${1:-all}"
PROVINCE_LOWER="$(echo "$PROVINCE" | tr '[:upper:]' '[:lower:]')"

if [ "$PROVINCE_LOWER" = "all" ]; then
  SEEDS=("${ALL_SEEDS[@]}")
  LABEL="todas las provincias"
elif [ -n "${PROVINCE_SEEDS[$PROVINCE_LOWER]+x}" ]; then
  SEEDS=("${PROVINCE_SEEDS[$PROVINCE_LOWER]}")
  LABEL="provincia: ${PROVINCE}"
else
  echo "❌ Provincia desconocida: '${PROVINCE}'"
  echo ""
  echo "   Provincias válidas: ourense, pontevedra, lugo, coruña, madrid, barcelona (o 'all')"
  exit 1
fi

# ── Configurar DATABASE_URL ──────────────────────────────────────────
if [ -z "${DATABASE_URL:-}" ]; then
  # Modo interactivo (local)
  echo ""
  echo "🔑 Introduce la contraseña de Supabase (no se mostrará en pantalla):"
  read -rs SUPABASE_PASSWORD

  if [ -z "$SUPABASE_PASSWORD" ]; then
    echo "❌ No se proporcionó contraseña. Abortando."
    exit 1
  fi

  export DATABASE_URL="postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}"
fi

echo ""
echo "🔗 Conectando a: ${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}"
echo "📋 Seeds a ejecutar: ${LABEL} (${#SEEDS[@]} script(s))"
echo ""

# ── Ejecutar seeds ───────────────────────────────────────────────────
# Usamos "pnpm jiti" para resolver el binario local (node_modules/.bin/jiti).
# En CI, jiti no está en el PATH global.
for seed in "${SEEDS[@]}"; do
  echo "🌱 Ejecutando ${seed}..."
  pnpm jiti "scripts/${seed}"
  echo ""
done

echo "✅ Seeds completados (${LABEL})."
echo ""
echo "   Verifica en https://supabase.com → Table Editor"
