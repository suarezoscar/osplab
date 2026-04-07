import { waitForPortOpen } from '@nx/node/utils';

// Carga las variables de .env para que los tests conozcan ADMIN_API_KEY, etc.
try {
  process.loadEnvFile('.env');
} catch {
  // .env no existe → CI/producción, las vars ya están inyectadas
}

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;

export async function setup() {
  console.log('\n🚀 E2E setup — waiting for API…');
  await waitForPortOpen(port, { host });
  console.log('✅ API ready\n');
}

export async function teardown() {
  console.log('\n🧹 E2E teardown complete\n');
}
