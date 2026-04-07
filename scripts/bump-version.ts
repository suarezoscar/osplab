/**
 * bump-version.ts — Incrementa la versión de una o varias apps.
 *
 * Uso:
 *   pnpm jiti scripts/bump-version.ts --project=farmacias-web --bump=patch
 *   pnpm jiti scripts/bump-version.ts --project=landing --bump=minor
 *   pnpm jiti scripts/bump-version.ts --project=all --bump=patch
 *
 * El script:
 *   1. Lee la versión actual del `version.ts` de cada app.
 *   2. Aplica el bump (patch / minor / major).
 *   3. Escribe el nuevo `version.ts`.
 *   4. Si se bumpeó farmacias-web, actualiza también la versión en el array
 *      de proyectos de la landing (home.component.ts).
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ── Configuración de apps ────────────────────────────────────────────────────
interface AppConfig {
  versionFile: string;
  comment: string;
}

const APPS: Record<string, AppConfig> = {
  landing: {
    versionFile: 'apps/landing/src/version.ts',
    comment: 'Versión de la landing (osplab.dev). Bump manualmente o con script de release.',
  },
  'farmacias-web': {
    versionFile: 'apps/farmacias-web/src/version.ts',
    comment:
      'Versión de Farmacias de Guardia (farmacias.osplab.dev). Bump manualmente o con script de release.',
  },
};

/** Ruta al componente de la landing donde están hardcodeadas las versiones de proyectos. */
const LANDING_PROJECTS_FILE = 'apps/landing/src/app/pages/home/home.component.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────
type BumpType = 'patch' | 'minor' | 'major';

function parseVersion(semver: string): [number, number, number] {
  const parts = semver.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Versión inválida: "${semver}"`);
  }
  return parts as [number, number, number];
}

function bumpVersion(current: string, type: BumpType): string {
  const [major, minor, patch] = parseVersion(current);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

function readCurrentVersion(filePath: string): string {
  const abs = resolve(filePath);
  const content = readFileSync(abs, 'utf-8');
  const match = content.match(/APP_VERSION\s*=\s*'([^']+)'/);
  if (!match) {
    throw new Error(`No se pudo leer APP_VERSION en ${filePath}`);
  }
  return match[1];
}

function writeVersionFile(filePath: string, version: string, comment: string): void {
  const abs = resolve(filePath);
  const content = `/** ${comment} */\nexport const APP_VERSION = '${version}' as const;\n`;
  writeFileSync(abs, content, 'utf-8');
}

/**
 * Actualiza la versión de farmacias-web en el array `projects` del componente
 * home de la landing (donde se muestra la card del proyecto).
 */
function syncLandingProjectVersion(version: string): void {
  const abs = resolve(LANDING_PROJECTS_FILE);
  let content = readFileSync(abs, 'utf-8');

  // Busca el bloque del proyecto farmacias y actualiza su `version: 'x.y.z'`
  const updated = content.replace(
    /(id:\s*'farmacias'[\s\S]*?version:\s*')([^']+)(')/,
    `$1${version}$3`,
  );

  if (updated === content) {
    console.warn(
      '⚠️  No se encontró version de farmacias en la landing. ¿Cambió la estructura del componente?',
    );
    return;
  }

  writeFileSync(abs, updated, 'utf-8');
  console.log(`   ↳ Sincronizado en landing projects → v${version}`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function main(): void {
  const args = process.argv.slice(2);
  const projectArg = args.find((a) => a.startsWith('--project='))?.split('=')[1];
  const bumpArg = args.find((a) => a.startsWith('--bump='))?.split('=')[1] as BumpType | undefined;

  if (!projectArg || !bumpArg) {
    console.error(
      'Uso: pnpm jiti scripts/bump-version.ts --project=<landing|farmacias-web|all> --bump=<patch|minor|major>',
    );
    process.exit(1);
  }

  if (!['patch', 'minor', 'major'].includes(bumpArg)) {
    console.error(`Tipo de bump inválido: "${bumpArg}". Usa patch, minor o major.`);
    process.exit(1);
  }

  const targets = projectArg === 'all' ? Object.keys(APPS) : [projectArg];

  for (const name of targets) {
    const app = APPS[name];
    if (!app) {
      console.error(
        `Proyecto desconocido: "${name}". Disponibles: ${Object.keys(APPS).join(', ')}, all`,
      );
      process.exit(1);
    }

    const current = readCurrentVersion(app.versionFile);
    const next = bumpVersion(current, bumpArg);

    writeVersionFile(app.versionFile, next, app.comment);
    console.log(`✅ ${name}: ${current} → ${next}`);

    // Si se bumpeó farmacias-web, sincronizar la versión en la landing
    if (name === 'farmacias-web') {
      syncLandingProjectVersion(next);
    }
  }

  // Escribir la nueva versión en GITHUB_OUTPUT si estamos en CI
  if (process.env['GITHUB_OUTPUT']) {
    const lastTarget = targets[targets.length - 1];
    const lastApp = APPS[lastTarget];
    const finalVersion = readCurrentVersion(lastApp.versionFile);

    const fs = require('fs');
    fs.appendFileSync(process.env['GITHUB_OUTPUT'], `version=${finalVersion}\n`);
  }
}

main();
