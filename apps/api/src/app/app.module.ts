import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScraperModule } from '@farmacias-guardia/api-scraper';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Rate limiting global: max 60 req / minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PharmaciesModule,
    ScraperModule,
  ],
  controllers: [AppController, AdminController],
  providers: [
    AppService,
    // Aplica ThrottlerGuard a todos los endpoints
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
