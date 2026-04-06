# 🚀 Plan de Despliegue — OSPLab (Costo $0)

## Resumen de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE (DNS + CDN)                       │
│                                                                     │
│   osplab.dev ──────────► Cloudflare Pages (landing)                 │
│                                                                     │
│   farmacias.osplab.dev ─► Cloudflare Pages (farmacias-web)         │
│          │                       │                                  │
│          │  /api/* ──────────────┘  Proxy Rule → Koyeb              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     KOYEB (Eco Free Tier)                           │
│                                                                     │
│   farmacias-api  (NestJS)                                           │
│   ├── REST API:   /api/pharmacies/nearest                           │
│   ├── Admin:      /api/admin/scrape/*                               │
│   └── Cron:       @nestjs/schedule (00:05 diario)                   │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Free Tier)                              │
│                                                                     │
│   PostgreSQL 15 + PostGIS                                           │
│   └── Tablas: Province, City, Pharmacy, DutySchedule                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist de Pasos

| #   | Paso                                             | Proveedor      | Estado |
| --- | ------------------------------------------------ | -------------- | ------ |
| 1   | Crear proyecto Supabase + habilitar PostGIS      | Supabase       | ✅     |
| 2   | Aplicar migraciones Prisma en Supabase           | Local (CLI)    | ✅     |
| 3   | Cargar seeds iniciales                           | Local (CLI)    | ✅     |
| 4   | Crear Dockerfile para `farmacias-api`            | Repo           | ✅     |
| 5   | Desplegar `farmacias-api` en Render              | Render         | 🔜     |
| 6   | Crear proyecto Cloudflare Pages: `landing`       | Cloudflare     | ⬜     |
| 7   | Crear proyecto Cloudflare Pages: `farmacias-web` | Cloudflare     | ⬜     |
| 8   | Configurar proxy `/api/*` en Cloudflare          | Repo + CF      | ✅     |
| 9   | Configurar dominios personalizados               | Cloudflare DNS | ⬜     |
| 10  | Crear workflow de CI/CD (GitHub Actions)         | Repo           | ✅     |
| 11  | Configurar secrets en GitHub                     | GitHub         | ⬜     |
| 12  | Validar despliegue end-to-end                    | Manual         | ⬜     |

---

## Paso 1 · Supabase — Base de Datos

### 1.1 Crear el proyecto

1. Ir a [supabase.com](https://supabase.com) → **New Project**
2. Nombre: `osplab-farmacias`
3. Región: **West EU (Ireland)** (o la más cercana a Galicia)
4. Contraseña de la DB: generar una segura y guardarla
5. Plan: **Free**

### 1.2 Habilitar PostGIS

En el **SQL Editor** de Supabase ejecutar:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

> Supabase ya tiene PostGIS disponible, solo hay que activarlo.

### 1.3 Obtener la connection string

En **Settings → Database → Connection string → URI**, copiar el string:

```
postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

> ⚠️ Usa el **Session mode (port 5432)** para las migraciones de Prisma.
> Para la app en producción puedes usar **Transaction mode (port 6543)** si lo prefieres.

### 1.4 Aplicar migraciones desde local

```sh
# Exportar la DATABASE_URL de Supabase (session mode, port 5432)
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Aplicar migraciones
pnpm prisma:migrate:deploy

# Verificar con Prisma Studio
pnpm prisma:studio
```

### 1.5 Cargar datos iniciales (seeds)

```sh
# Con DATABASE_URL apuntando a Supabase
pnpm seed:all
```

---

## Paso 2 · Koyeb — Backend API

### 2.1 ¿Por qué un Dockerfile?

El proyecto ya tiene targets `prune-lockfile` y `copy-workspace-modules` en `farmacias-api/project.json`, lo cual sugiere que está preparado para builds de producción aislados. Necesitamos un Dockerfile multi-stage:

### 2.2 Crear el Dockerfile

📄 **Archivo a crear:** `apps/farmacias-api/Dockerfile`

```dockerfile
# ──────────────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────────────
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /workspace

# 1. Copiar solo los ficheros de dependencias para cache de Docker
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Instalar TODAS las dependencias (incluidas devDependencies para el build)
RUN pnpm install --frozen-lockfile

# 3. Copiar el resto del código fuente
COPY . .

# 4. Generar el cliente Prisma
RUN pnpm prisma:generate

# 5. Build de la API con Nx
RUN pnpm nx build farmacias-api

# 6. Generar lockfile podado y copiar workspace modules
RUN pnpm nx run farmacias-api:prune

# ──────────────────────────────────────────────────────
# Stage 2: Production
# ──────────────────────────────────────────────────────
FROM node:22-slim AS production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# OpenSSL necesario para Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar artefactos del build
COPY --from=builder /workspace/dist/apps/farmacias-api/ ./

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Copiar el cliente Prisma generado (necesario en runtime)
COPY --from=builder /workspace/libs/farmacias/data-access/src/generated/ ./generated/

# Puerto por defecto de NestJS
ENV PORT=8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8000/api/pharmacies/nearest?lat=0&lng=0').then(r => process.exit(r.ok || r.status === 400 ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "main.js"]
```

> **Nota:** El Prisma client generado está en `libs/farmacias/data-access/src/generated/prisma/`.
> El webpack config ya externaliza `@prisma/*`, así que el client debe estar disponible en runtime.

### 2.3 Crear servicio en Koyeb

1. Ir a [koyeb.com](https://koyeb.com) → **Create Service**
2. Source: **GitHub** (conectar el repo)
3. Builder: **Dockerfile**
4. Dockerfile path: `apps/farmacias-api/Dockerfile`
5. Region: **Frankfurt** (más cercano a Galicia)
6. Instance: **Eco (Free)**
7. Puerto expuesto: **8000**

### 2.4 Variables de entorno en Koyeb

| Variable        | Valor                                                   | Tipo   |
| --------------- | ------------------------------------------------------- | ------ |
| `DATABASE_URL`  | `postgresql://postgres.[ref]:...@supabase.com:6543/...` | Secret |
| `ADMIN_API_KEY` | (generado con `openssl rand -hex 32`)                   | Secret |
| `CORS_ORIGIN`   | `https://farmacias.osplab.dev`                          | Plain  |
| `PORT`          | `8000`                                                  | Plain  |
| `NODE_ENV`      | `production`                                            | Plain  |

### 2.5 Health check en Koyeb

- **Path:** `/api/pharmacies/nearest?lat=0&lng=0`
- **Port:** `8000`
- **Protocol:** HTTP
- **Respuesta esperada:** `400` (Bad Request por coords inválidas) — confirma que la app está viva.

> Alternativamente, puedes crear un endpoint `/api/health` que retorne `200 OK`.

---

## Paso 3 · Cloudflare Pages — Frontends

### 3.1 Proyecto: `landing` → osplab.dev

1. **Cloudflare Dashboard** → Pages → **Create a project** → Connect GitHub repo
2. Configuración:
   - **Project name:** `osplab-landing`
   - **Build command:** `pnpm nx build landing`
   - **Build output directory:** `dist/apps/landing/browser`
   - **Root directory:** `/` (raíz del monorepo)
   - **Node.js version:** `22` (en Environment Variables: `NODE_VERSION=22`)
3. **Custom domain:** `osplab.dev`

### 3.2 Proyecto: `farmacias-web` → farmacias.osplab.dev

1. **Cloudflare Dashboard** → Pages → **Create a project** → Connect GitHub repo
2. Configuración:
   - **Project name:** `osplab-farmacias`
   - **Build command:** `pnpm nx build farmacias-web`
   - **Build output directory:** `dist/apps/farmacias-web/browser`
   - **Root directory:** `/` (raíz del monorepo)
   - **Node.js version:** `22` (en Environment Variables: `NODE_VERSION=22`)
3. **Custom domain:** `farmacias.osplab.dev`

### 3.3 Problema: El frontend usa URLs relativas `/api/*`

El servicio `PharmaciesApiService` hace peticiones a `/api/pharmacies/nearest` (URL relativa).
En producción, el frontend está en Cloudflare Pages y el API en Koyeb. **Hay dos soluciones:**

#### Opción A: Proxy con Cloudflare Workers (Recomendada ✅)

Crear un fichero `apps/farmacias-web/public/_routes.json` para que Cloudflare Pages haga proxy de `/api/*` hacia Koyeb. **Pero Cloudflare Pages no soporta proxy nativo a backends externos.**

La solución real es un **Cloudflare Worker** asociado al Pages project:

📄 **Archivo a crear:** `apps/farmacias-web/functions/api/[[path]].ts`

```typescript
// Cloudflare Pages Function — proxy /api/* → Koyeb backend
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const backendUrl = `https://<tu-app>.koyeb.app${url.pathname}${url.search}`;

  const response = await fetch(backendUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method !== 'GET' ? context.request.body : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
};
```

> **Pros:** El frontend sigue usando `/api/*` sin cambios. Sin CORS issues.
> **Contras:** Añade un hop extra. Consume requests del free tier de Workers (100k/día — más que suficiente).

#### Opción B: URL absoluta en el servicio Angular

Modificar `PharmaciesApiService` para usar una URL configurable:

```typescript
// environment.ts
export const environment = {
  apiUrl: 'https://<tu-app>.koyeb.app',
};

// En el service:
return this.http.get<PharmacyDto[]>(`${environment.apiUrl}/api/pharmacies/nearest`, { params });
```

> **Pros:** Sin proxy intermedio.
> **Contras:** Requiere CORS correctamente configurado. El `CORS_ORIGIN` en Koyeb debe ser `https://farmacias.osplab.dev`.

**Recomendación:** Opción A (proxy) para mantener el frontend limpio y evitar problemas de CORS.

---

## Paso 4 · DNS — Cloudflare

### 4.1 Registrar dominio `osplab.dev`

Si aún no tienes el dominio, registrarlo en Cloudflare Registrar o cualquier registrar y apuntar los nameservers a Cloudflare.

### 4.2 Registros DNS

| Tipo    | Nombre      | Destino                      | Proxy |
| ------- | ----------- | ---------------------------- | ----- |
| `CNAME` | `@`         | `osplab-landing.pages.dev`   | ✅ On |
| `CNAME` | `farmacias` | `osplab-farmacias.pages.dev` | ✅ On |

> Cloudflare Pages asigna automáticamente los registros al configurar Custom Domains.

---

## Paso 5 · CI/CD — GitHub Actions

### 5.1 Secrets necesarios en GitHub

Ir a **Repo → Settings → Secrets and variables → Actions** y crear:

| Secret                  | Descripción                                  |
| ----------------------- | -------------------------------------------- |
| `DATABASE_URL`          | Connection string de Supabase (session mode) |
| `CLOUDFLARE_API_TOKEN`  | Token con permisos de Cloudflare Pages       |
| `CLOUDFLARE_ACCOUNT_ID` | ID de cuenta de Cloudflare                   |
| `KOYEB_API_TOKEN`       | Token de API de Koyeb (para redeploy)        |

### 5.2 Workflow: CI (ya existe parcialmente)

📄 **Archivo a crear:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '10.33.0'
  NX_BASE: ${{ github.event_name == 'pull_request' && github.event.pull_request.base.sha || github.event.before }}
  NX_HEAD: ${{ github.sha }}

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma:generate
      - run: pnpm nx affected -t test --base=$NX_BASE --head=$NX_HEAD

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --prod --audit-level=high
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5.3 Workflow: Deploy (solo en push a main)

📄 **Archivo a crear:** `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy
  cancel-in-progress: false # No cancelar despliegues en curso

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '10.33.0'

jobs:
  # ── Detectar qué proyectos cambiaron ──────────────────────────────
  changes:
    runs-on: ubuntu-latest
    outputs:
      landing: ${{ steps.filter.outputs.landing }}
      farmacias-web: ${{ steps.filter.outputs.farmacias-web }}
      farmacias-api: ${{ steps.filter.outputs.farmacias-api }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - id: filter
        run: |
          BASE=${{ github.event.before }}
          HEAD=${{ github.sha }}

          # Comprobar si cada proyecto está afectado
          if pnpm nx show projects --affected --base=$BASE --head=$HEAD | grep -q "^landing$"; then
            echo "landing=true" >> $GITHUB_OUTPUT
          else
            echo "landing=false" >> $GITHUB_OUTPUT
          fi

          if pnpm nx show projects --affected --base=$BASE --head=$HEAD | grep -q "^farmacias-web$"; then
            echo "farmacias-web=true" >> $GITHUB_OUTPUT
          else
            echo "farmacias-web=false" >> $GITHUB_OUTPUT
          fi

          if pnpm nx show projects --affected --base=$BASE --head=$HEAD | grep -q "^farmacias-api$"; then
            echo "farmacias-api=true" >> $GITHUB_OUTPUT
          else
            echo "farmacias-api=false" >> $GITHUB_OUTPUT
          fi

  # ── Deploy Landing → Cloudflare Pages ─────────────────────────────
  deploy-landing:
    needs: changes
    if: needs.changes.outputs.landing == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx build landing
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/apps/landing/browser --project-name=osplab-landing

  # ── Deploy Farmacias Web → Cloudflare Pages ───────────────────────
  deploy-farmacias-web:
    needs: changes
    if: needs.changes.outputs.farmacias-web == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx build farmacias-web
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/apps/farmacias-web/browser --project-name=osplab-farmacias

  # ── Deploy Farmacias API → Koyeb ──────────────────────────────────
  deploy-farmacias-api:
    needs: changes
    if: needs.changes.outputs.farmacias-api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Koyeb redeploy automático si el repo está conectado.
      # Alternativa: usar Koyeb CLI para forzar redeploy.
      - name: Trigger Koyeb redeploy
        run: |
          curl -X POST "https://app.koyeb.com/v1/services/${{ secrets.KOYEB_SERVICE_ID }}/redeploy" \
            -H "Authorization: Bearer ${{ secrets.KOYEB_API_TOKEN }}" \
            -H "Content-Type: application/json"

  # ── Migraciones (solo si cambia el schema Prisma) ──────────────────
  migrate:
    needs: changes
    if: needs.changes.outputs.farmacias-api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma:migrate:deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Paso 6 · SPA Routing en Cloudflare Pages

Las apps Angular son SPAs — necesitan que todas las rutas devuelvan `index.html`.

📄 **Archivo a crear:** `apps/farmacias-web/public/_redirects`

```
/api/*  /api/:splat  200
/*      /index.html  200
```

📄 **Archivo a crear:** `apps/landing/public/_redirects`

```
/*  /index.html  200
```

> Cloudflare Pages respeta el fichero `_redirects` en la raíz del output directory.

---

## Paso 7 · Variables de Entorno — Resumen Global

### Supabase (no se configura, solo se consulta)

- Connection string → se usa en Koyeb y en CI

### Koyeb (`farmacias-api`)

| Variable        | Valor                                    |
| --------------- | ---------------------------------------- |
| `DATABASE_URL`  | `postgresql://...@supabase.com:6543/...` |
| `ADMIN_API_KEY` | `<openssl rand -hex 32>`                 |
| `CORS_ORIGIN`   | `https://farmacias.osplab.dev`           |
| `PORT`          | `8000`                                   |
| `NODE_ENV`      | `production`                             |

### Cloudflare Pages (`farmacias-web`)

| Variable       | Valor |
| -------------- | ----- |
| `NODE_VERSION` | `22`  |

### Cloudflare Pages (`landing`)

| Variable       | Valor |
| -------------- | ----- |
| `NODE_VERSION` | `22`  |

### GitHub Actions Secrets

| Secret                   | Dónde se usa                        |
| ------------------------ | ----------------------------------- |
| `DATABASE_URL`           | Job `migrate`                       |
| `CLOUDFLARE_API_TOKEN`   | Jobs `deploy-landing`, `deploy-web` |
| `CLOUDFLARE_ACCOUNT_ID`  | Jobs `deploy-landing`, `deploy-web` |
| `RENDER_DEPLOY_HOOK_URL` | Job `deploy-farmacias-api`          |

---

## Paso 8 · Endpoint de Health Check (Recomendado)

Añadir un endpoint `/api/health` al API para que Koyeb pueda verificar que la app está viva sin depender de la BD.

```typescript
// apps/farmacias-api/src/app/app.controller.ts
@Get('/health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

---

## 🧪 Validación Post-Despliegue

Una vez completados todos los pasos:

```sh
# 1. Landing
curl -I https://osplab.dev
# Esperado: 200 OK

# 2. Farmacias Web
curl -I https://farmacias.osplab.dev
# Esperado: 200 OK

# 3. API directa (Koyeb)
curl "https://<tu-app>.koyeb.app/api/pharmacies/nearest?lat=42.34&lng=-7.86"
# Esperado: JSON con farmacias

# 4. API via proxy (Cloudflare)
curl "https://farmacias.osplab.dev/api/pharmacies/nearest?lat=42.34&lng=-7.86"
# Esperado: mismo JSON

# 5. Health check
curl "https://<tu-app>.koyeb.app/api/health"
# Esperado: { "status": "ok", ... }
```

---

## ⏱️ Orden de Ejecución Recomendado

```
Semana 1 — Infraestructura
├── Día 1: Paso 1 (Supabase) + Paso 2 (migraciones + seeds)
├── Día 2: Paso 4 (Dockerfile) + Paso 5 (Koyeb)
└── Día 3: Paso 3 (Cloudflare Pages × 2) + Paso 6 (DNS)

Semana 2 — CI/CD y Validación
├── Día 4: Paso 8 (Health check endpoint)
├── Día 5: Paso 9–10 (GitHub Actions workflows)
└── Día 6: Paso 12 (Validación E2E) + ajustes
```

---

## 💰 Costes Mensuales

| Servicio          | Recurso             | Coste    |
| ----------------- | ------------------- | -------- |
| Supabase          | Free tier (500MB)   | **$0**   |
| Koyeb             | Eco instance (1)    | **$0**   |
| Cloudflare Pages  | Free (500 builds)   | **$0**   |
| Cloudflare DNS    | Incluido            | **$0**   |
| GitHub Actions    | Free (2000 min/mes) | **$0**   |
| **Dominio**       | `.dev` (anual)      | ~$12/año |
| **Total mensual** |                     | **$0**   |

---

## ⚠️ Limitaciones del Free Tier

| Servicio   | Límite clave                          | Riesgo                           |
| ---------- | ------------------------------------- | -------------------------------- |
| Supabase   | 500 MB storage, pausa tras 1 sem idle | BD se pausa si no hay tráfico    |
| Koyeb Eco  | Sleep tras 5 min inactivo, cold start | Primer request tarda ~5-10s      |
| CF Pages   | 500 builds/mes                        | Suficiente si usas `nx affected` |
| CF Workers | 100k requests/día                     | Más que suficiente               |

### Mitigaciones

- **Supabase pause:** El cron de NestJS (`@nestjs/schedule`) a las 00:05 mantiene la BD activa. Alternativamente, configurar un ping externo (UptimeRobot, free) cada 6 días.
- **Koyeb cold start:** Aceptable para una herramienta ciudadana. Se puede mitigar con un health check ping cada 4 min (UptimeRobot free).
- **CF builds:** `nx affected` asegura que solo se rebuilden proyectos con cambios.
