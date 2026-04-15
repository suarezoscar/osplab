# Contexto para el Agente de IA — OSPLab

## Visión del Proyecto

**OSPLab** es un monorepo Nx que alberga una suite de herramientas open source.
Cada herramienta vive bajo un subdominio de `osplab.dev`.

| Proyecto             | Dominio                | Apps Nx                           |
| -------------------- | ---------------------- | --------------------------------- |
| Portal principal     | `osplab.dev`           | `landing`                         |
| Farmacias de Guardia | `farmacias.osplab.dev` | `farmacias-web` + `farmacias-api` |
| Eventos              | `events.osplab.dev`    | `events`                          |

## Principios de Codificación

- **KISS** (Keep It Simple, Stupid): La solución más simple que funcione es la correcta. Si puedes resolver algo con 10 líneas, no escribas 50.
- **YAGNI** (You Aren't Gonna Need It): No implementes funcionalidad "por si acaso". Añádela cuando la necesites de verdad.
- **DRY** (Don't Repeat Yourself): Extrae lógica duplicada a funciones, servicios o librerías compartidas. Pero no sobreabstraigas — duplicar es mejor que una abstracción incorrecta.
- **No Overengineering**: Evita capas de abstracción innecesarias, patrones de diseño forzados y arquitecturas anticipadas. Código simple > código "elegante" que nadie entiende. Si un servicio de Angular puede resolver el problema, no crees una store, un facade y un adapter.

## Reglas de Codificación

- **General:** Usa siempre TypeScript estricto. Prefiere composición sobre herencia.
- **Angular:**
  - Usa **Standalone Components**.
  - Usa **Signals** para la gestión de estado local y reactividad.
  - Estilo: Tailwind CSS (clases utilitarias, evita archivos .scss grandes).
  - Control Flow: Usa la nueva sintaxis `@if`, `@for`.
- **NestJS:**
  - Sigue el patrón modular.
  - Usa DTOs validados con `class-validator`.
  - Inyección de dependencias estricta.
- **Supabase (Events):**
  - Acceso directo desde Angular con `@supabase/supabase-js` (sin backend intermedio).
  - Seguridad via Row Level Security (RLS) y funciones RPC `SECURITY DEFINER`.
- **Nx:**
  - No permitas importaciones cruzadas prohibidas. Respeta los `tags` de las librerías.
  - `scope:farmacias` no puede importar `scope:events` y viceversa. Solo pueden compartir `scope:shared`.

## Convención de Path Aliases

```
@osplab/farmacias-data-access  → libs/farmacias/data-access
@osplab/farmacias-scraper      → libs/farmacias/scraper
@osplab/farmacias-web-ui       → libs/farmacias/web/ui
@osplab/events                 → libs/events/feature        (feature: rutas + páginas)
@osplab/events-data-access     → libs/events/data-access  (servicios + modelos + config Supabase)
@osplab/shared-interfaces      → libs/shared/interfaces
@osplab/shared-ui              → libs/shared/ui
```

## Estructura del Monorepo

```
apps/
  landing/              → SPA Angular (osplab.dev)
  events/               → SPA Angular (events.osplab.dev)
    functions/           → Cloudflare Function (OG tags dinámicos para WhatsApp)
  farmacias-api/        → API REST NestJS (farmacias.osplab.dev/api)
    e2e/                → Tests end-to-end del API (Vitest)
  farmacias-web/        → SPA Angular (farmacias.osplab.dev)
libs/
  events/
    data-access/        → Cliente Supabase, EventsService, modelos, config
    feature/            → Feature lib: rutas, páginas (create/view), SeoService
  farmacias/
    data-access/        → PrismaService + migraciones (PostgreSQL + PostGIS)
    scraper/            → Scrapers + parsers por COF
    web/ui/             → Componentes UI reutilizables del proyecto farmacias
  shared/
    interfaces/         → DTOs e interfaces compartidas (Nest ↔ Angular)
    ui/                 → Componentes UI compartidos entre proyectos
```

### Estructura de Events (libs)

```
libs/events/
  data-access/src/lib/
    config/supabase.config.ts    → URL + anon key de Supabase
    models/event.model.ts        → Interfaces EventRow, AttendeeRow, CreateEventPayload
    services/
      supabase.service.ts        → Cliente Supabase singleton
      events.service.ts          → CRUD eventos + slug generator + password hashing
  feature/src/lib/
    services/seo.service.ts      → Meta tags dinámicos (OG, Twitter)
    events/
      create/                    → Formulario de creación de evento
      view/                      → Vista del evento + apuntarse + editar + compartir
    lib.routes.ts                → Rutas lazy-loaded exportadas como eventsRoutes
```

## Testing

- **Framework:** Vitest 4 para todo (unitarios, integración y e2e). No se usa Jest.
- **Tests unitarios:** dentro de cada app/lib junto al código (`*.spec.ts`).
- **Tests e2e:** colocados dentro del proyecto que testean (`apps/farmacias-api/e2e/`), no como proyecto Nx separado.
- **Ejecución:**
  - `pnpm nx test <proyecto>` → tests unitarios
  - `pnpm nx e2e farmacias-api` → tests e2e del API

## Lógica de Negocio Crítica

### Farmacias

1. **Geolocalización:** El cálculo de "cercanía" debe ocurrir en la base de datos (PostgreSQL), no en el cliente.
2. **Scraping:** Las funciones de scraping deben ser resilientes. Si el HTML cambia, el scraper debe fallar silenciosamente y notificar, sin corromper los datos existentes.
3. **Privacidad:** No guardes geolocalización de usuarios. Solo úsala para la consulta en tiempo real.

### Eventos

1. **Datos efímeros:** Los eventos se borran automáticamente 24h después de `event_date` (pg_cron en Supabase).
2. **Contraseña de edición:** Hash SHA-256 client-side, verificada en Supabase via funciones RPC (`SECURITY DEFINER`). Nunca se devuelve `password_hash` al cliente.
3. **URLs humanas:** Formato `slug-dd-mm-yyyy-token` (token de 6 chars alfanuméricos para evitar acceso por fuerza bruta).
4. **Un solo campo de fecha:** Cada evento tiene una única `event_date` (sin start/end). Simplifica el formulario y la lógica.
5. **OG tags para WhatsApp:** Cloudflare Function detecta bots y devuelve HTML con meta tags dinámicos del evento.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
