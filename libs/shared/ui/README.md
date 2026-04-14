# @osplab/shared-ui — Design System

Sistema de diseño reutilizable para todos los proyectos de OSPLab.

## Setup

### 1. Importar los design tokens en tu `styles.css`

```css
@import 'tailwindcss';
@import '../../../libs/shared/ui/src/lib/styles/osp-theme.css';
```

### 2. Importar componentes

```typescript
import {
  OspButtonComponent,
  OspInputComponent,
  OspCardComponent,
  OspThemeToggleComponent,
  // ...
} from '@osplab/shared-ui';
```

---

## Temas: Dark / Light

El sistema usa **dark por defecto**. El tema se gestiona con `OspThemeService`:

```typescript
import { OspThemeService } from '@osplab/shared-ui';

// En cualquier componente
themeService = inject(OspThemeService);

// Leer tema actual
themeService.theme(); // 'dark' | 'light'
themeService.isDark(); // boolean

// Cambiar tema
themeService.toggle();
themeService.set('light');
```

O simplemente añade `<osp-theme-toggle />` en tu header.

---

## Componentes

### `<osp-button>`

```html
<osp-button>Crear evento</osp-button>
<osp-button variant="secondary">Cancelar</osp-button>
<osp-button variant="danger" [loading]="deleting()">Eliminando…</osp-button>
<osp-button variant="ghost" size="sm">Editar</osp-button>
<osp-button size="lg" type="submit" [disabled]="!form.valid">Enviar</osp-button>
```

| Input      | Tipo                                              | Default     |
| ---------- | ------------------------------------------------- | ----------- |
| `variant`  | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` |
| `size`     | `'sm' \| 'md' \| 'lg'`                            | `'md'`      |
| `type`     | `'button' \| 'submit' \| 'reset'`                 | `'button'`  |
| `loading`  | `boolean`                                         | `false`     |
| `disabled` | `boolean`                                         | `false`     |

### `<osp-input>`

Implementa `ControlValueAccessor` — se puede usar con `[(ngModel)]` o Reactive Forms.

```html
<osp-input label="Email" placeholder="tu@email.com" />
<osp-input label="Nombre" [error]="nameError()" icon="👤" />
<osp-input type="password" label="Contraseña" hint="Mínimo 6 caracteres" />
```

| Input          | Tipo             | Default  |
| -------------- | ---------------- | -------- |
| `label`        | `string`         | `''`     |
| `placeholder`  | `string`         | `''`     |
| `type`         | `string`         | `'text'` |
| `error`        | `string \| null` | `null`   |
| `hint`         | `string`         | `''`     |
| `icon`         | `string`         | `''`     |
| `maxlength`    | `number \| null` | `null`   |
| `autocomplete` | `string`         | `'off'`  |

### `<osp-textarea>`

Misma API que `<osp-input>`, más `rows` y `resizable`.

```html
<osp-textarea label="Descripción" placeholder="Detalles…" [rows]="4" />
```

### `<osp-select>`

```html
<osp-select
  label="Tipo de evento"
  placeholder="Selecciona…"
  [options]="[{value: 'social', label: 'Social'}, {value: 'deporte', label: 'Deporte'}]"
/>
```

### `<osp-card>`

```html
<osp-card>Contenido normal</osp-card>
<osp-card [shine]="true" accent="amber">Evento destacado</osp-card>
```

| Input    | Tipo                   | Default     |
| -------- | ---------------------- | ----------- |
| `shine`  | `boolean`              | `false`     |
| `accent` | `'default' \| 'amber'` | `'default'` |

### `<osp-alert>`

```html
<osp-alert type="error">Algo salió mal.</osp-alert>
<osp-alert type="success">¡Evento creado!</osp-alert>
<osp-alert type="warning">Cuidado con esto.</osp-alert>
<osp-alert type="info">Información útil.</osp-alert>
```

### `<osp-spinner>`

```html
<osp-spinner /> <osp-spinner size="lg" />
```

### `<osp-dialog>`

```html
<osp-dialog [(open)]="showConfirm">
  <h2>¿Eliminar evento?</h2>
  <p>Esta acción no se puede deshacer.</p>
  <osp-button variant="danger" (click)="onDelete()">Eliminar</osp-button>
</osp-dialog>
```

### `<osp-theme-toggle />`

Toggle sol/luna con animación. Solo ponerlo en el header.

### `<osplab-badge />`

Badge con logo de OSPLab para footers. Se adapta al tema automáticamente.

---

## Design Tokens (CSS Variables)

Todos los tokens están bajo `--osp-*`. Algunos ejemplos:

### Tokens globales

| Token                | Dark      | Light     |
| -------------------- | --------- | --------- |
| `--osp-bg`           | `#040d18` | `#f8fafc` |
| `--osp-bg-surface`   | `#0a1929` | `#ffffff` |
| `--osp-text`         | `#dce6ef` | `#334155` |
| `--osp-text-heading` | `#ffffff` | `#0f172a` |
| `--osp-accent`       | `#f59e0b` | `#f59e0b` |
| `--osp-border`       | `#1a3050` | `#e2e8f0` |
| `--osp-error`        | `#ef4444` | `#dc2626` |
| `--osp-success`      | `#22c55e` | `#16a34a` |

### Paleta Farmacias (green)

Cada token sigue el patrón `--osp-green-*`:

| Token                     | Dark                  | Light                |
| ------------------------- | --------------------- | -------------------- |
| `--osp-green`             | `#4ade80`             | `#16a34a`            |
| `--osp-green-card-bg`     | `#060f09`             | `#f0fdf4`            |
| `--osp-green-card-border` | `#0e3020`             | `#bbf7d0`            |
| `--osp-green-icon-bg`     | `#0b2416`             | `#dcfce7`            |
| `--osp-green-icon`        | `#4ade80`             | `#16a34a`            |
| `--osp-green-status-text` | `#6ee7b7`             | `#15803d`            |
| `--osp-green-shadow`      | `rgba(22,163,74,.15)` | `rgba(22,163,74,.1)` |

### Paleta Eventos (amber)

Cada token sigue el patrón `--osp-amber-*`:

| Token                     | Dark                   | Light                  |
| ------------------------- | ---------------------- | ---------------------- |
| `--osp-amber`             | `#f59e0b`              | `#d97706`              |
| `--osp-amber-card-bg`     | `#100c04`              | `#fffbeb`              |
| `--osp-amber-card-border` | `#2a1f0a`              | `#fde68a`              |
| `--osp-amber-icon-bg`     | `#1c1505`              | `#fef3c7`              |
| `--osp-amber-icon`        | `#f59e0b`              | `#d97706`              |
| `--osp-amber-status-text` | `#fcd34d`              | `#92400e`              |
| `--osp-amber-shadow`      | `rgba(245,158,11,.12)` | `rgba(245,158,11,.08)` |

### Uso dinámico en templates

Las cards de cada proyecto usan la paleta dinámicamente:

```html
<div
  [style]="{
  'background': 'var(--osp-' + project.theme + '-card-bg)',
  'border-color': 'var(--osp-' + project.theme + '-card-border)',
  'box-shadow': '0 4px 20px var(--osp-' + project.theme + '-shadow)'
}"
></div>
```

Ver todos en `libs/shared/ui/src/lib/styles/osp-theme.css`.

---

## Animaciones

Clases utilitarias disponibles:

- `.osp-animate-in` — fade-in + translateY
- `.osp-animate-scale-in` — scale-in con opacity
- `.osp-animate-slide-up` — slide-up con stagger (usar `animation-delay`)
- `.osp-focus-ring` — focus ring accesible
