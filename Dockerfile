# ──────────────────────────────────────────────────────
# OSPLab — farmacias-api · Multi-stage Dockerfile
# ──────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /workspace

# 1. Copiar solo ficheros de dependencias → mejor cache de capas Docker
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Instalar TODAS las dependencias (dev incluidas, necesarias para build)
RUN pnpm install --frozen-lockfile

# 3. Copiar el código fuente completo
COPY . .

# 4. Generar el cliente Prisma (URL dummy — solo genera código, no conecta a BD)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma:generate

# 5. Build de la API con Nx (webpack → dist/apps/farmacias-api/)
#    generatePackageJson: true en webpack.config.js genera package.json en dist
RUN pnpm nx build farmacias-api

# ── Stage 2: Production ──────────────────────────────
FROM node:22-slim AS production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# OpenSSL requerido por Prisma en runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar artefactos del build (incluye package.json generado por webpack)
COPY --from=builder /workspace/dist/apps/farmacias-api/ ./

# Instalar dependencias desde el package.json generado por webpack
# + tslib (importHelpers de TypeScript, no incluido por webpack)
# + pg (driver PostgreSQL, requerido por @prisma/adapter-pg)
RUN pnpm install --no-frozen-lockfile && pnpm add tslib pg

# Copiar el cliente Prisma generado (externalizado por webpack, necesario en runtime)
COPY --from=builder /workspace/libs/farmacias/data-access/src/generated/ ./generated/


ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:8000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "main.js"]

