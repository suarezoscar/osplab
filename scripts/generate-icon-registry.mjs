#!/usr/bin/env node
/**
 * Generates a TypeScript icon registry from @phosphor-icons/core SVG files.
 * Only includes the icons we actually use to keep the bundle small.
 *
 * Usage: node scripts/generate-icon-registry.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CORE = resolve(ROOT, 'node_modules/@phosphor-icons/core/assets');
const OUT = resolve(ROOT, 'libs/shared/ui/src/lib/icon/icon-registry.ts');

// Icons used in the project — add new ones here
const ICONS = [
  'map-pin',
  'calendar',
  'calendar-plus',
  'clock',
  'crosshair',
  'magnifying-glass',
  'link',
  'link-simple',
  'lock',
  'lock-open',
  'pencil-simple',
  'note-pencil',
  'trash',
  'map-trifold',
  'warning-circle',
  'check-circle',
  'x-circle',
  'info',
  'plus',
  'shield-check',
  'arrow-right',
  'user',
  'copy',
  'x',
  'warning',
  'whatsapp-logo',
];

const WEIGHTS = ['regular'];

function extractPaths(svgContent) {
  // Extract everything between <svg ...> and </svg>
  const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return match ? match[1].trim() : '';
}

const entries = [];

for (const icon of ICONS) {
  const paths = {};
  for (const weight of WEIGHTS) {
    const file = resolve(CORE, weight, `${icon}.svg`);
    try {
      const svg = readFileSync(file, 'utf8');
      paths[weight] = extractPaths(svg);
    } catch {
      console.warn(`⚠ Missing: ${weight}/${icon}.svg`);
    }
  }
  if (Object.keys(paths).length > 0) {
    entries.push({ name: icon, paths });
  }
}

const ts = `// ═══════════════════════════════════════════════════════════════════
// AUTO-GENERATED — do not edit manually.
// Run:  node scripts/generate-icon-registry.mjs
// Source: @phosphor-icons/core ${WEIGHTS.join(', ')}
// ═══════════════════════════════════════════════════════════════════

/** SVG inner content (paths) keyed by icon name, then weight. */
export const PHOSPHOR_ICONS: Record<string, Record<string, string>> = {
${entries
  .map((e) => {
    const w = Object.entries(e.paths)
      .map(([weight, paths]) => `    ${weight}: '${paths.replace(/'/g, "\\'")}'`)
      .join(',\n');
    return `  '${e.name}': {\n${w}\n  }`;
  })
  .join(',\n')},
};
`;

writeFileSync(OUT, ts, 'utf8');
console.log(`✅ Generated ${entries.length} icons → ${OUT}`);
