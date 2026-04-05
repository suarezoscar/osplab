# Arquitectura del Sistema: Farmacias de Guardia (Spain)

## Stack Tecnológico
- **Monorepo:** [Nx](https://nx.dev)
- **Frontend:** Angular (Latest) + Tailwind CSS + Angular Signals
- **Backend:** NestJS + Prisma ORM
- **Database:** PostgreSQL + PostGIS (para consultas geoespaciales)
- **Gestor de Paquetes:** pnpm
- **Infraestructura Sugerida:** Docker (para DB local), GitHub Actions (CI/CD)

## Estructura del Monorepo (Nx)
- `apps/web`: Aplicación Angular (PWA enfocada a móvil).
- `apps/api`: API REST en NestJS.
- `libs/api/data-access`: Servicios de Prisma y conexión a base de datos.
- `libs/api/scraper`: Lógica de extracción de datos (Cron Jobs).
- `libs/shared/interfaces`: DTOs e interfaces TypeScript compartidas entre Nest y Angular.
- `libs/web/ui`: Componentes de UI puramente presentacionales (Tailwind).

## Modelo de Datos (Prisma)
- **Pharmacy**: Información estática (nombre, dirección, coordenadas, teléfono).
- **DutySchedule**: Tabla pivot (pharmacy_id, date, start_time, end_time, type).
- **Province/City**: Para segmentar las búsquedas y optimizar el scraping.

## Flujo de Datos
1. **Scraper (NestJS Task):** Se ejecuta periódicamente para leer fuentes oficiales (SERGAS, etc.).
2. **Geocoding:** Las direcciones nuevas se convierten en coordenadas una sola vez.
3. **API (NestJS):** Expone un endpoint `GET /pharmacies/nearby?lat=X&lng=Y`.
4. **PostGIS Query:** `SELECT * FROM pharmacies ORDER BY location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.
5. **Frontend (Angular):** Consume la API y muestra los resultados mediante Signals para una reactividad eficiente.
