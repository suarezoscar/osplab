/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// Carga .env en desarrollo local (Node.js 22 nativo, sin @nestjs/config)
// En producción las vars de entorno ya están inyectadas por Docker/CI.
try {
  console.log('[DEBUG] CWD:', process.cwd());
  console.log('[DEBUG] .env exists:', require('fs').existsSync('.env'));
  console.log('[DEBUG] ADMIN_API_KEY before:', process.env['ADMIN_API_KEY']);
  process.loadEnvFile('.env');
  console.log('[DEBUG] ADMIN_API_KEY after:', process.env['ADMIN_API_KEY']);
} catch (e) {
  console.log('[DEBUG] loadEnvFile FAILED:', e);
  // .env no existe → entorno de producción o CI, se ignora
}

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // ── Seguridad HTTP ────────────────────────────────────────────────────────
  // Añade cabeceras de seguridad estándar (X-Frame-Options, HSTS, CSP, etc.)
  app.use(helmet());

  // CORS: solo permite el origen configurado; en desarrollo acepta localhost
  const allowedOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:4200';
  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-Admin-Key'],
  });

  // ── Validación global ─────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
