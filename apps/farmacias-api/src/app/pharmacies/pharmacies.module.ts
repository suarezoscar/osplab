import { Module } from '@nestjs/common';
import { DataAccessModule } from '@osplab/farmacias-data-access';
import { PharmaciesController } from './pharmacies.controller';
import { PharmaciesService } from './pharmacies.service';

@Module({
  imports: [DataAccessModule],
  controllers: [PharmaciesController],
  providers: [PharmaciesService],
})
export class PharmaciesModule {}
