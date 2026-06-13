import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('custom_availabilities')
export class CustomAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  doctorId: string;

  @Column('date')
  date: Date; // Specific date for custom availability

  @Column('time', { nullable: true })
  startTime: string | null; // If null, means doctor is unavailable on this date

  @Column('time', { nullable: true })
  endTime: string | null; // If null, means doctor is unavailable on this date

  @Column('int', { nullable: true })
  slotDurationMinutes: number | null; // Override slot duration for this date

  @Column('text', { nullable: true })
  reason: string; // Reason for unavailability or special availability

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
