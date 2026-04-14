#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# setup-events.sh — Crea las tablas de Events en Supabase
#
# Uso:
#   ./scripts/setup-events.sh
#
# En CI, se puede pasar DATABASE_URL como variable de entorno.
# En local, pide la contraseña de forma interactiva.
#
# Requisito: psql (cliente PostgreSQL) instalado.
#   brew install libpq   (macOS)
#   sudo apt install postgresql-client   (Linux)
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

SUPABASE_HOST="aws-1-eu-north-1.pooler.supabase.com"
SUPABASE_PORT="5432"
SUPABASE_USER="postgres.vrqaamkqoiuppqtrzpbu"
SUPABASE_DB="postgres"

SQL_FILE="scripts/supabase-events-schema.sql"

# ── Verificar que psql existe ─────────────────────────────────────────
if ! command -v psql &> /dev/null; then
  echo "❌ psql no encontrado."
  echo "   Instálalo con: sudo apt install postgresql-client (Linux)"
  echo "                   brew install libpq (macOS)"
  exit 1
fi

# ── Verificar que el archivo SQL existe ───────────────────────────────
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ No se encontró $SQL_FILE"
  exit 1
fi

# ── Configurar DATABASE_URL ──────────────────────────────────────────
if [ -z "${DATABASE_URL:-}" ]; then
  echo ""
  echo "🔑 Introduce la contraseña de Supabase (no se mostrará en pantalla):"
  read -rs SUPABASE_PASSWORD

  if [ -z "$SUPABASE_PASSWORD" ]; then
    echo "❌ No se proporcionó contraseña. Abortando."
    exit 1
  fi

  DATABASE_URL="postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}"
fi

echo ""
echo "🔗 Conectando a: ${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}"
echo "📋 Ejecutando: ${SQL_FILE}"
echo ""

# ── Ejecutar SQL ─────────────────────────────────────────────────────
psql "$DATABASE_URL" -f "$SQL_FILE"

echo ""
echo "✅ Schema de Events creado correctamente."
echo ""
echo "   ⚠️  Recuerda activar pg_cron para el borrado automático:"
echo "   1. Supabase Dashboard → Database → Extensions → pg_cron"
echo "   2. Ejecuta en SQL Editor:"
echo "      SELECT cron.schedule('cleanup-expired-events', '0 * * * *',"
echo "        \$\$DELETE FROM events WHERE end_date + INTERVAL '24 hours' < now()\$\$);"

