import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { IncomingMessage } from 'node:http';

/**
 * Guard que protege los endpoints de administración mediante una API key.
 *
 * Uso: configurar la variable de entorno ADMIN_API_KEY con un valor aleatorio
 * seguro (mínimo 32 caracteres). Las peticiones deben incluir la cabecera:
 *   X-Admin-Key: <valor>
 *
 * Si ADMIN_API_KEY no está configurada, el servidor arranca pero bloquea
 * todas las peticiones con una advertencia en los logs.
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const expectedKey = process.env['ADMIN_API_KEY'];

    if (!expectedKey) {
      this.logger.warn(
        'ADMIN_API_KEY no configurada — endpoints de admin desactivados por seguridad',
      );
      throw new UnauthorizedException('Endpoints de administración no disponibles');
    }

    const request = context.switchToHttp().getRequest<IncomingMessage>();
    const providedKey = request.headers['x-admin-key'];

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('API key inválida o ausente');
    }

    return true;
  }
}
