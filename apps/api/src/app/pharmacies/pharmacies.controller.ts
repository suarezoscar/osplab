import { Controller, Get, Query } from '@nestjs/common';
import { PharmacyDto } from '@farmacias-guardia/shared-interfaces';
import { PharmaciesService } from './pharmacies.service';
import { NearbyPharmaciesQueryDto } from './dto/nearby-pharmacies-query.dto';

@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Get('nearest')
  findNearest(@Query() query: NearbyPharmaciesQueryDto): Promise<PharmacyDto[]> {
    return this.pharmaciesService.findNearest(query);
  }
}
