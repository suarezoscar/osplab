import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ScheduleWriterService } from './schedule-writer.service';

@Module({
  providers: [PrismaService, ScheduleWriterService],
  exports: [PrismaService, ScheduleWriterService],
})
export class DataAccessModule {}
