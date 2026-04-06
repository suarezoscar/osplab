# Arquitectura del Sistema: Farmacias de Guardia

## Stack Tecnológico

| Capa                   | Tecnología                                                            |
| ---------------------- | --------------------------------------------------------------------- |
| **Monorepo**           | [Nx](https://nx.dev) 22                                               |
| **Frontend**           | Angular 21 · Tailwind CSS 4 · Angular Signals · Standalone Components |
| **Backend**            | NestJS 11 · Prisma 7 (adapter pg)                                     |
| **Base de datos**      | PostgreSQL 16 + PostGIS 3.4                                           |
| **Geocodificación**    | Nominatim / OpenStreetMap (sin API key)                               |
| **Gestor de paquetes** | pnpm 10                                                               |
| **Testing**            | Vitest 4 + Supertest                                                  |
| **CI/CD**              | GitHub Actions                                                        |
| **Seguridad**          | Helmet · @nestjs/throttler · AdminApiKeyGuard                         |

---

## Estructura del Monorepo (Nx)

```
apps/
  api/          → API REST NestJS (puerto 3000)
  api-e2e/      → Tests end-to-end del API (Jest)
  web/          → SPA Angular (puerto 4200)

libs/
  api/
    data-access/ → PrismaService + cliente generado + migraciones
    scraper/     → Scrapers (COFOurense, COFPontevedra, COFLugo) + parsers
  shared/
    interfaces/  → DTOs e interfaces TypeScript compartidas (Nest ↔ Angular)
  web/
    ui/          → Componentes presentacionales reutilizables (Tailwind)
```

---

## Modelo de Datos (Prisma / PostGIS)

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

## Flujo de Datos

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
[Angular SPA]  ←  Geolocalización / Nominatim geocoding
```

1. **Scrapers**: cada COF tiene su servicio (`CofourenseScraperService`, etc.) con
   parsers independientes y testados unitariamente. Fallan silenciosamente para
   no corromper datos existentes.
2. **API**: endpoint único `GET /api/pharmacies/nearest` con validación estricta
   de coordenadas (`class-validator`) y formato de fecha (`YYYY-MM-DD`).
3. **Frontend**: usa Angular Signals para reactividad; la geolocalización del
   usuario **nunca se persiste**.

---

## Seguridad

| Mecanismo                          | Descripción                                               |
| ---------------------------------- | --------------------------------------------------------- |
| **Helmet**                         | Cabeceras HTTP de seguridad (HSTS, X-Frame-Options, CSP…) |
| **CORS restringido**               | Solo permite el origen definido en `CORS_ORIGIN`          |
| **Rate limiting**                  | 60 req / minuto por IP via `@nestjs/throttler`            |
| **AdminApiKeyGuard**               | Endpoints `/admin/*` requieren cabecera `X-Admin-Key`     |
| **ValidationPipe**                 | `whitelist + forbidNonWhitelisted` en todos los endpoints |
| **Sin geolocalización persistida** | Las coordenadas del usuario solo se usan en la query      |
| **`.env` excluido del repo**       | Credenciales nunca se suben a git                         |

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

| Variable            | Obligatoria | Descripción                                                          |
| ------------------- | ----------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | ✅          | Connection string PostgreSQL                                         |
| `POSTGRES_PASSWORD` | ✅          | Contraseña de Docker Compose                                         |
| `ADMIN_API_KEY`     | ✅          | Clave para los endpoints de admin (`openssl rand -hex 32`)           |
| `CORS_ORIGIN`       | ❌          | Origin del frontend en producción (default: `http://localhost:4200`) |
| `PORT`              | ❌          | Puerto del API (default: `3000`)                                     |
