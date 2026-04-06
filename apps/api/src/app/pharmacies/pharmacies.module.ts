import { Module } from '@nestjs/common';
import { DataAccessModule } from '@farmacias-guardia/api-data-access';
import { PharmaciesController } from './pharmacies.controller';
import { PharmaciesService } from './pharmacies.service';

@Module({
  imports: [DataAccessModule],
  controllers: [PharmaciesController],
  providers: [PharmaciesService],
})
export class PharmaciesModule {}
