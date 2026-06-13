import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailability, CustomAvailability, Slot, Appointment } from '../entities';
import { SlotGenerationService } from '../services';
import { PatientController } from './patient.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorAvailability, CustomAvailability, Slot, Appointment])],
  providers: [SlotGenerationService],
  controllers: [PatientController],
})
export class PatientModule {}
