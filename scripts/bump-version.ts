/**
 * bump-version.ts — Incrementa la versión de una o varias apps.
 *
 * Uso:
 *   pnpm jiti scripts/bump-version.ts --project=farmacias-web --bump=patch
 *   pnpm jiti scripts/bump-version.ts --project=landing --bump=minor
 *   pnpm jiti scripts/bump-version.ts --project=all --bump=patch
 *
 * Fuente única de verdad: libs/shared/interfaces/src/lib/project-versions.ts
 * Cada app re-exporta su versión desde ahí.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ── Configuración ────────────────────────────────────────────────────────────
const VERSIONS_FILE = 'libs/shared/interfaces/src/lib/project-versions.ts';
const VALID_PROJECTS = ['landing', 'farmacias-web', 'events'] as const;
type ProjectName = (typeof VALID_PROJECTS)[number];

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

function readVersions(): Record<ProjectName, string> {
  const abs = resolve(VERSIONS_FILE);
  const content = readFileSync(abs, 'utf-8');
  const versions: Record<string, string> = {};

  for (const name of VALID_PROJECTS) {
    const regex = new RegExp(`(?:'${name}'|${name}):\\s*'([^']+)'`);
    const match = content.match(regex);
    if (!match) throw new Error(`No se encontró versión de "${name}" en ${VERSIONS_FILE}`);
    versions[name] = match[1];
  }

  return versions as Record<ProjectName, string>;
}

function writeVersions(versions: Record<ProjectName, string>): void {
  const abs = resolve(VERSIONS_FILE);
  const content = `/**
 * Versiones centralizadas de todos los proyectos de OSPLab.
 *
 * Fuente única de verdad — el script bump-version.ts actualiza solo este archivo.
 * Cada app re-exporta su versión desde aquí.
 */
export const PROJECT_VERSIONS = {
  landing: '${versions['landing']}',
  'farmacias-web': '${versions['farmacias-web']}',
  events: '${versions['events']}',
} as const;
`;
  writeFileSync(abs, content, 'utf-8');
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function main(): void {
  const args = process.argv.slice(2);
  const projectArg = args.find((a) => a.startsWith('--project='))?.split('=')[1];
  const bumpArg = args.find((a) => a.startsWith('--bump='))?.split('=')[1] as BumpType | undefined;

  if (!projectArg || !bumpArg) {
    console.error(
      'Uso: pnpm jiti scripts/bump-version.ts --project=<landing|farmacias-web|events|all> --bump=<patch|minor|major>',
    );
    process.exit(1);
  }

  if (!['patch', 'minor', 'major'].includes(bumpArg)) {
    console.error(`Tipo de bump inválido: "${bumpArg}". Usa patch, minor o major.`);
    process.exit(1);
  }

  const targets: ProjectName[] =
    projectArg === 'all' ? [...VALID_PROJECTS] : [projectArg as ProjectName];

  for (const name of targets) {
    if (!VALID_PROJECTS.includes(name)) {
      console.error(
        `Proyecto desconocido: "${name}". Disponibles: ${VALID_PROJECTS.join(', ')}, all`,
      );
      process.exit(1);
    }
  }

  const versions = readVersions();

  for (const name of targets) {
    const current = versions[name];
    const next = bumpVersion(current, bumpArg);
    versions[name] = next;
    console.log(`✅ ${name}: ${current} → ${next}`);
  }

  writeVersions(versions);

  // Escribir la nueva versión en GITHUB_OUTPUT si estamos en CI
  if (process.env['GITHUB_OUTPUT']) {
    const lastTarget = targets[targets.length - 1];
    const fs = require('fs');
    fs.appendFileSync(process.env['GITHUB_OUTPUT'], `version=${versions[lastTarget]}\n`);
  }
}

main();
