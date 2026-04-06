#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# seed-supabase.sh — Ejecuta todos los seeds contra Supabase (remoto)
#
# Uso:
#   ./scripts/seed-supabase.sh
#
# Lee la contraseña de Supabase de forma segura (sin mostrarla en pantalla).
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

SUPABASE_HOST="aws-1-eu-north-1.pooler.supabase.com"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres.vrqaamkqoiuppqtrzpbu"
SUPABASE_DB="postgres"

# ── Pedir contraseña de forma segura ────────────────────────────────
echo ""
echo "🔑 Introduce la contraseña de Supabase (no se mostrará en pantalla):"
read -rs SUPABASE_PASSWORD

if [ -z "$SUPABASE_PASSWORD" ]; then
  echo "❌ No se proporcionó contraseña. Abortando."
  exit 1
fi

export DATABASE_URL="postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}"

echo ""
echo "🔗 Conectando a: ${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}"
echo ""

# ── Ejecutar seeds uno a uno ────────────────────────────────────────
SEEDS=(
  "seed-cofourense.ts"
  "seed-cofpontevedra.ts"
  "seed-coflugo.ts"
  "seed-cofc.ts"
)

for seed in "${SEEDS[@]}"; do
  echo "🌱 Ejecutando ${seed}..."
  jiti "scripts/${seed}"
  echo ""
done

echo "✅ Todos los seeds completados contra Supabase."
echo ""
echo "   Verifica en https://supabase.com → Table Editor"

