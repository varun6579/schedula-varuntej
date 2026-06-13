import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  doctorId: string;

  @Column('datetime')
  startTime: Date; // Slot start time

  @Column('datetime')
  endTime: Date; // Slot end time

  @Column('varchar', { default: 'AVAILABLE' })
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED'; // Slot status

  @Column('uuid', { nullable: true })
  patientId: string | null; // Patient ID if booked

  @Column('text', { nullable: true })
  notes: string | null; // Additional notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
