# OSPLab 🧪

**Suite de herramientas open source orientadas al ciudadano.**

| Proyecto             | Dominio                                              | Estado    |
| -------------------- | ---------------------------------------------------- | --------- |
| Farmacias de Guardia | [farmacias.osplab.dev](https://farmacias.osplab.dev) | ✅ Activo |
| Landing / Portal     | [osplab.dev](https://osplab.dev)                     | ✅ Activo |

---

## Requisitos previos

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io) 10+
- [Docker](https://www.docker.com) (para la base de datos local)

---

## Puesta en marcha (desarrollo)

### 1. Clonar y configurar el entorno

```sh
git clone <repo-url>
cd farmacia-guardia
cp .env.example .env
```

Edita `.env` y rellena al menos:

- `DATABASE_URL` — connection string de PostgreSQL
- `POSTGRES_PASSWORD` — contraseña de la BD (usada también por Docker Compose)
- `ADMIN_API_KEY` — clave para los endpoints de administración (`openssl rand -hex 32`)

### 2. Instalar dependencias

```sh
pnpm install
```

### 3. Arrancar todo (BD + API + Web farmacias)

```sh
pnpm dev
```

Este comando:

1. Levanta PostgreSQL + PostGIS con Docker Compose
2. Espera a que la BD esté lista
3. Genera el cliente Prisma
4. Aplica las migraciones
5. Arranca API (`localhost:3000`) y Web de farmacias (`localhost:4200`) en paralelo

Para la landing page:

```sh
pnpm nx serve landing
```

Para parar la base de datos:

```sh
pnpm dev:stop
```

---

## Comandos útiles

### Testing

```sh
# Todos los tests
pnpm nx run-many -t test

# Solo el API de farmacias
pnpm nx test farmacias-api

# Solo el scraper
pnpm nx test farmacias-scraper
```

### Formato (Prettier)

```sh
pnpm format          # formatea todo el proyecto
pnpm format:check    # solo comprueba (usado en CI)
```

### Prisma

```sh
pnpm prisma:generate        # regenerar el cliente Prisma
pnpm prisma:migrate:dev     # crear una nueva migración
pnpm prisma:migrate:deploy  # aplicar migraciones en producción
pnpm prisma:studio          # abrir Prisma Studio
```

### Seeds (carga manual de datos — proyecto farmacias)

```sh
pnpm seed:all           # todos los COFs
pnpm seed:cofourense    # solo Ourense
pnpm seed:cofpontevedra # solo Pontevedra
pnpm seed:coflugo       # solo Lugo
```

### Scraping manual via API

Los endpoints de admin requieren la cabecera `X-Admin-Key` con el valor de `ADMIN_API_KEY`:

```sh
curl -X POST http://localhost:3000/api/admin/scrape/cofourense \
     -H "X-Admin-Key: <tu-clave>"
```

---

## Endpoints del API (Farmacias)

| Método | Ruta                              | Descripción                         |
| ------ | --------------------------------- | ----------------------------------- |
| `GET`  | `/api/pharmacies/nearest`         | Farmacias de guardia más cercanas   |
| `POST` | `/api/admin/scrape/cofourense`    | Lanza scraping de COF Ourense 🔒    |
| `POST` | `/api/admin/scrape/cofpontevedra` | Lanza scraping de COF Pontevedra 🔒 |

**Parámetros de `/api/pharmacies/nearest`:**

| Parámetro | Tipo   | Obligatorio | Descripción                           |
| --------- | ------ | ----------- | ------------------------------------- |
| `lat`     | number | ✅          | Latitud (-90 a 90)                    |
| `lng`     | number | ✅          | Longitud (-180 a 180)                 |
| `date`    | string | ❌          | Fecha ISO `YYYY-MM-DD` (default: hoy) |

> 🔒 Requiere cabecera `X-Admin-Key: <ADMIN_API_KEY>`

---

## Seguridad

- **Helmet** — cabeceras HTTP de seguridad en todas las respuestas
- **Rate limiting** — máximo 60 peticiones/minuto por IP
- **CORS** — restringido al origen configurado en `CORS_ORIGIN`
- **Endpoints admin protegidos** — requieren `X-Admin-Key`
- **Credenciales nunca en el repo** — `.env` está en `.gitignore`

---

## CI/CD

El pipeline de GitHub Actions se ejecuta en cada push/PR a `main`:

| Job           | Qué comprueba                                                               |
| ------------- | --------------------------------------------------------------------------- |
| ✅ `format`   | Código formateado con Prettier                                              |
| ✅ `test`     | Tests unitarios pasan                                                       |
| ✅ `security` | Sin CVEs HIGH/CRITICAL en producción · Sin secretos en el código (Gitleaks) |

---

## Estructura del monorepo

```
apps/
  landing/           → Angular SPA · osplab.dev (portal principal)
  farmacias-api/     → NestJS API   · farmacias.osplab.dev/api
  farmacias-api-e2e/ → Tests e2e del API de farmacias
  farmacias-web/     → Angular SPA  · farmacias.osplab.dev
libs/
  farmacias/
    data-access/  → Prisma + migraciones (PostgreSQL + PostGIS)
    scraper/      → Scrapers + parsers (COFOurense, COFPontevedra, COFLugo, COFC)
    web/
      ui/         → Componentes UI reutilizables del proyecto farmacias
  shared/
    interfaces/   → Tipos compartidos (Nest ↔ Angular)
```

Para más detalles sobre la arquitectura, ver [ARCHITECT.md](./ARCHITECT.md).
