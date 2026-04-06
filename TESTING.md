# Estrategia de Testing � Farmacias de Guardia

## Principios Generales

- **Cobertura m�nima:** 80% en librer�as de l�gica de negocio (`api-data-access`, `api-scraper`).
- **Pir�mide de testing:** M�s tests unitarios, menos de integraci�n, m�nimos E2E.
- **Aislamiento:** Nunca se conecta a la base de datos real en tests unitarios (usar mocks de Prisma).
- **Nx cache:** Todos los targets `test` est�n cacheados � solo se re-ejecutan si hay cambios.

---

## Por Proyecto

### `libs/shared/interfaces` � Interfaces TypeScript

- **No requiere tests.** Son tipos/interfaces puras sin l�gica ejecutable.

---

### `libs/api/data-access` � Prisma + PrismaService

**Framework:** Jest + `jest-mock-extended`
**Qu� testear:**

- `PrismaService`: verificar que `onModuleInit` llama a `$connect` y `onModuleDestroy` a `$disconnect`.
  **C�mo mockear Prisma:**

```typescript
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '../src/generated/prisma';
export type MockPrismaService = DeepMockProxy<PrismaClient>;
export const mockPrismaService = mockDeep<PrismaClient>();
```

---

### `libs/api/scraper` � Scraping / Cron Jobs

**Framework:** Jest
**Qu� testear:**

- Funciones de parseo de HTML (con fixtures de HTML real de SERGAS).
- Comportamiento ante HTML malformado: debe retornar `null` silenciosamente, nunca lanzar.
- Normalizaci�n de horarios y fechas.
  **Ejemplo de test de resiliencia:**

```typescript
it('should return null when HTML structure changes', () => {
  const brokenHtml = '<html><body>Pagina en mantenimiento</body></html>';
  const result = parseSergas(brokenHtml);
  expect(result).toBeNull();
});
```

---

### `apps/api` � NestJS REST API

**Framework:** Jest + Supertest
**Qu� testear:**

- **Unitarios:** Services (mockeando `PrismaService`).
- **Integraci�n:** Controladores con `@nestjs/testing` `TestingModule`.
  **Ejemplo de test de controlador:**

```typescript
it('GET /pharmacies/nearby � returns 400 if lat/lng missing', () => {
  return request(app.getHttpServer()).get('/pharmacies/nearby').expect(400);
});
```

---

### `apps/web` � Angular PWA

**Framework:** Jest + Angular Testing Library (`@testing-library/angular`)
**Qu� testear:**

- **Componentes:** Renderizado con inputs/outputs, interacciones.
- **Servicios:** L�gica de transformaci�n de datos (HTTP mockeado con `HttpClientTestingModule`).
- **Se�ales:** Verificar que signals reaccionan correctamente a cambios de estado.

---

### `libs/web/ui` � Componentes UI (Tailwind)

**Framework:** Jest + Angular Testing Library
**Qu� testear:**

- Renderizado correcto de props.
- Clases de Tailwind aplicadas condicionalmente.
- Eventos emitidos (outputs de Angular).

---

## E2E (Futuro)

- **Herramienta:** Playwright.
- **Scope:** Flujo principal � usuario concede geolocalizaci�n ? ve farmacias de guardia hoy.
- **Generar:** `pnpm exec nx g @nx/playwright:configuration --project=web`

---

## Comandos

```bash
# Todos los tests
pnpm exec nx run-many --target=test --all
# Solo tests afectados
pnpm exec nx affected --target=test
# Test de un proyecto con cobertura
pnpm exec nx test api --coverage
# Watch mode
pnpm exec nx test api --watch
```
