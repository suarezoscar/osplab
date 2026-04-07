# Contexto para el Agente de IA — OSPLab

## Visión del Proyecto

**OSPLab** es un monorepo Nx que alberga una suite de herramientas open source para la ciudadanía.
Cada herramienta vive bajo un subdominio de `osplab.dev`.

| Proyecto             | Dominio                | Apps Nx                           |
| -------------------- | ---------------------- | --------------------------------- |
| Portal principal     | `osplab.dev`           | `landing`                         |
| Farmacias de Guardia | `farmacias.osplab.dev` | `farmacias-web` + `farmacias-api` |

## Reglas de Codificación

- **General:** Usa siempre TypeScript estricto. Prefiere composición sobre herencia.
- **Angular:** - Usa **Standalone Components**.
  - Usa **Signals** para la gestión de estado local y reactividad.
  - Estilo: Tailwind CSS (clases utilitarias, evita archivos .scss grandes).
  - Control Flow: Usa la nueva sintaxis `@if`, `@for`.
- **NestJS:**
  - Sigue el patrón modular.
  - Usa DTOs validados con `class-validator`.
  - Inyección de dependencias estricta.
- **Nx:**
  - No permitas importaciones cruzadas prohibidas. Respeta los `tags` de las librerías.
  - `scope:farmacias` no puede importar `scope:osplab` y viceversa. Solo pueden compartir `scope:shared`.

## Convención de Path Aliases

```
@osplab/farmacias-data-access  → libs/farmacias/data-access
@osplab/farmacias-scraper      → libs/farmacias/scraper
@osplab/farmacias-web-ui       → libs/farmacias/web/ui
@osplab/shared-interfaces      → libs/shared/interfaces
@osplab/shared-ui              → libs/shared/ui
```

## Lógica de Negocio Crítica

1. **Geolocalización:** El cálculo de "cercanía" debe ocurrir en la base de datos (PostgreSQL), no en el cliente.
2. **Scraping:** Las funciones de scraping deben ser resilientes. Si el HTML cambia, el scraper debe fallar silenciosamente y notificar, sin corromper los datos existentes.
3. **Privacidad:** No guardes geolocalización de usuarios. Solo úsala para la consulta en tiempo real.

## Tareas Pendientes Inmediatas

- Configurar el esquema de Prisma con soporte para tipos `Geography`.
- Implementar el primer scraper para el SERGAS (Galicia).
- Crear el componente de mapa en Angular usando `@angular/google-maps` o Leaflet.
- Añadir más proyectos al portal `osplab.dev` a medida que se desarrollen.

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
