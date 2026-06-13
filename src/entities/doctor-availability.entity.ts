import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('doctor_availabilities')
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  doctorId: string;

  @Column('varchar')
  dayOfWeek: string; // 'MONDAY', 'TUESDAY', ... 'SUNDAY'

  @Column('time')
  startTime: string; // Format: HH:mm:ss (e.g., "10:00:00")

  @Column('time')
  endTime: string; // Format: HH:mm:ss (e.g., "11:00:00")

  @Column('int', { default: 30 })
  slotDurationMinutes: number; // Duration of each slot in minutes

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
