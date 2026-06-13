import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailability, CustomAvailability, Slot, Appointment } from '../entities';
import { AvailabilityService, SlotGenerationService } from '../services';
import { DoctorController } from './doctor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorAvailability, CustomAvailability, Slot, Appointment])],
  providers: [AvailabilityService, SlotGenerationService],
  controllers: [DoctorController],
  exports: [AvailabilityService, SlotGenerationService],
})
export class DoctorModule {}
