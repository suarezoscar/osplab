import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

/**
 * Self-ping cada 14 minutos para evitar que Render (free tier)
 * ponga la instancia a dormir por inactividad (límite: 15 min).
 *
 * Solo se activa si RENDER_EXTERNAL_URL está definido (= estamos en Render).
 */
@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);
  private readonly selfUrl = process.env['RENDER_EXTERNAL_URL'];

  /** Cada 14 minutos */
  @Cron('*/14 * * * *')
  async ping(): Promise<void> {
    if (!this.selfUrl) return; // No hacer nada en local / otro hosting

    try {
      const res = await fetch(`${this.selfUrl}/api/health`);
      this.logger.debug(`Keep-alive ping → ${res.status}`);
    } catch (err) {
      this.logger.warn(`Keep-alive ping falló: ${(err as Error).message}`);
    }
  }
}
