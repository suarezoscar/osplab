# Arquitectura del Sistema: OSPLab

## Visión General

OSPLab es un monorepo Nx que alberga una suite de herramientas open source.
Cada herramienta vive en su propio subdominio bajo `osplab.dev`.

| Proyecto             | Dominio                | Apps Nx                           |
| -------------------- | ---------------------- | --------------------------------- |
| Portal principal     | `osplab.dev`           | `landing`                         |
| Farmacias de Guardia | `farmacias.osplab.dev` | `farmacias-web` + `farmacias-api` |
| Eventos              | `osplab.dev/events/*`  | `landing` (feature interna)       |

---

## Principios de Codificación

| Principio              | Regla práctica                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **KISS**               | La solución más simple que funcione es la correcta. Si puedes resolver algo con 10 líneas, no escribas 50.                                    |
| **YAGNI**              | No implementes funcionalidad "por si acaso". Añádela cuando la necesites de verdad.                                                           |
| **DRY**                | Extrae lógica duplicada, pero no sobreabstraigas — duplicar es mejor que una abstracción incorrecta.                                          |
| **No Overengineering** | Evita capas de abstracción innecesarias y patrones forzados. Si un servicio resuelve el problema, no crees una store, un facade y un adapter. |

---

## Stack Tecnológico

| Capa                   | Tecnología                                                            |
| ---------------------- | --------------------------------------------------------------------- |
| **Monorepo**           | [Nx](https://nx.dev) 22                                               |
| **Frontend**           | Angular 21 · Tailwind CSS 4 · Angular Signals · Standalone Components |
| **Backend**            | NestJS 11 · Prisma 7 (adapter pg)                                     |
| **Base de datos**      | PostgreSQL 16 + PostGIS 3.4 (Supabase)                                |
| **BaaS (Eventos)**     | Supabase (`@supabase/supabase-js`) — acceso directo desde Angular     |
| **Geocodificación**    | Nominatim / OpenStreetMap (sin API key)                               |
| **Gestor de paquetes** | pnpm 10                                                               |
| **Testing**            | Vitest 4 + Supertest                                                  |
| **Hosting**            | Cloudflare Pages (frontends) · Render (API)                           |
| **CI/CD**              | GitHub Actions                                                        |
| **Seguridad**          | Helmet · @nestjs/throttler · AdminApiKeyGuard · Supabase RLS          |

---

## Estructura del Monorepo (Nx)

```
apps/
  landing/              → SPA Angular (osplab.dev, puerto 4200)
    functions/events/   → Cloudflare Function (OG tags dinámicos para WhatsApp)
  farmacias-api/        → API REST NestJS (farmacias.osplab.dev, puerto 3000)
    e2e/                → Tests end-to-end del API (Vitest)
  farmacias-web/        → SPA Angular (farmacias.osplab.dev, puerto 4300)

libs/
  farmacias/
    data-access/ → PrismaService + cliente generado + migraciones
    scraper/     → Scrapers (COFOurense, COFPontevedra, COFLugo, COFC) + parsers
    web/
      ui/        → Componentes presentacionales de farmacias (Tailwind)
  shared/
    interfaces/  → DTOs e interfaces TypeScript compartidas (Nest ↔ Angular)
    ui/          → Componentes UI compartidos entre proyectos
```

### Convención de Tags Nx

| Tag                | Significado                             |
| ------------------ | --------------------------------------- |
| `scope:farmacias`  | Código exclusivo del proyecto Farmacias |
| `scope:osplab`     | Código del portal/landing principal     |
| `scope:shared`     | Código compartible entre proyectos      |
| `type:app`         | Aplicación desplegable                  |
| `type:data-access` | Acceso a base de datos                  |
| `type:feature`     | Lógica de negocio (scrapers, etc.)      |
| `type:ui`          | Componentes de interfaz                 |
| `type:util`        | Utilidades y tipos                      |

---

## Modelo de Datos — Farmacias (Prisma / PostGIS)

```
Province ──< City ──< Pharmacy ──< DutySchedule
```

- **Province**: código y nombre (ej. `OR`, `Ourense`).
- **City**: municipio dentro de la provincia.
- **Pharmacy**: nombre, dirección, teléfono, coordenadas (`Geography` PostGIS).
- **DutySchedule**: turno de guardia — `pharmacyId`, `date`, `startTime`, `endTime`, `source`.

La columna `location` es de tipo `Geography(Point, 4326)` para poder usar
`ST_Distance` en la consulta de farmacias cercanas, garantizando que el cálculo
ocurre **en la base de datos**, no en el cliente.

---

## Modelo de Datos — Eventos (Supabase directo)

```
events ──< event_attendees
```

- **events**: `slug` (URL humana + token), `title`, `location_name`, `lat/lng`, `start_date`, `end_date`, `password_hash`.
- **event_attendees**: `event_id`, `name`, `joined_at`.

Seguridad:

- **RLS**: SELECT e INSERT públicos. No se permite UPDATE/DELETE directo.
- **RPC functions** (`SECURITY DEFINER`): `update_event_with_password`, `verify_event_password`, `remove_attendee_with_password`.
- **pg_cron**: borra eventos 24h después de `end_date`.
- **`password_hash`** nunca se devuelve al cliente (SELECT explícito sin esa columna).

---

## Flujo de Datos — Farmacias

```
Fuentes oficiales (COF*)
        │
        ▼
[Scraper — NestJS Cron]     ← POST /api/admin/scrape/:cof  (X-Admin-Key)
        │  upsert
        ▼
[PostgreSQL + PostGIS]
        │  ST_Distance query
        ▼
[GET /api/pharmacies/nearest?lat=X&lng=Y]
        │
        ▼
[Angular SPA — farmacias.osplab.dev]  ←  Geolocalización / Nominatim geocoding
```

1. **Scrapers**: cada COF tiene su servicio con parsers independientes y testados unitariamente. Fallan silenciosamente para no corromper datos existentes.
2. **API**: endpoint único `GET /api/pharmacies/nearest` con validación estricta de coordenadas (`class-validator`).
3. **Frontend**: Angular Signals para reactividad; la geolocalización del usuario **nunca se persiste**.

---

## Flujo de Datos — Eventos

```
[Angular SPA — osplab.dev/events/create]
        │  @supabase/supabase-js
        ▼
[Supabase PostgreSQL]  ←  RLS + RPC functions
        │
        ▼
[osplab.dev/events/:slug]  →  Compartir en WhatsApp
        │
        ▼
[Cloudflare Function]  →  Detecta bots → OG tags dinámicos
```

1. **Sin backend intermedio**: el cliente Angular habla directamente con Supabase.
2. **Slug humano**: `titulo-dd-mm-yyyy-token6chars` — legible + seguro.
3. **Contraseña de edición**: hash SHA-256 client-side, verificada via RPC.
4. **Auto-borrado**: pg_cron elimina eventos expirados cada hora.

---

## Seguridad

| Mecanismo                          | Proyecto  | Descripción                                               |
| ---------------------------------- | --------- | --------------------------------------------------------- |
| **Helmet**                         | Farmacias | Cabeceras HTTP de seguridad (HSTS, X-Frame-Options, CSP…) |
| **CORS restringido**               | Farmacias | Solo permite el origen definido en `CORS_ORIGIN`          |
| **Rate limiting**                  | Farmacias | 60 req / minuto por IP via `@nestjs/throttler`            |
| **AdminApiKeyGuard**               | Farmacias | Endpoints `/admin/*` requieren cabecera `X-Admin-Key`     |
| **ValidationPipe**                 | Farmacias | `whitelist + forbidNonWhitelisted` en todos los endpoints |
| **Supabase RLS**                   | Eventos   | SELECT/INSERT públicos, UPDATE/DELETE solo via RPC        |
| **RPC SECURITY DEFINER**           | Eventos   | Verificación de contraseña server-side                    |
| **Token en URL**                   | Eventos   | 6 chars alfanuméricos (2.17B combinaciones)               |
| **Sin geolocalización persistida** | Ambos     | Las coordenadas del usuario solo se usan en la query      |
| **`.env` excluido del repo**       | Ambos     | Credenciales nunca se suben a git                         |

---

## CI/CD (GitHub Actions)

El pipeline se ejecuta en **push y PR a `main`** con tres jobs paralelos:

| Job        | Comando                                           | Falla si…                                                      |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------- |
| `format`   | `pnpm format:check`                               | Hay código sin formatear (Prettier)                            |
| `test`     | `pnpm nx run-many -t test`                        | Algún test falla                                               |
| `security` | `pnpm audit --prod --audit-level=high` + Gitleaks | CVE HIGH/CRITICAL en deps de producción o secreto en el código |

---

## Variables de Entorno

Ver `.env.example` para la lista completa. Las esenciales:

| Variable            | Proyecto  | Obligatoria | Descripción                                                          |
| ------------------- | --------- | ----------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | Farmacias | ✅          | Connection string PostgreSQL                                         |
| `POSTGRES_PASSWORD` | Farmacias | ✅          | Contraseña de Docker Compose                                         |
| `ADMIN_API_KEY`     | Farmacias | ✅          | Clave para los endpoints de admin (`openssl rand -hex 32`)           |
| `CORS_ORIGIN`       | Farmacias | ❌          | Origin del frontend en producción (default: `http://localhost:4200`) |
| `PORT`              | Farmacias | ❌          | Puerto del API (default: `3000`)                                     |
| `SUPABASE_URL`      | Eventos   | ✅          | URL del proyecto Supabase (también en Cloudflare Pages env vars)     |
| `SUPABASE_ANON_KEY` | Eventos   | ✅          | Anon key pública de Supabase (también en Cloudflare Pages env vars)  |
