import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDoctorAvailability1718169600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'doctor_availabilities',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'doctorId',
            type: 'varchar',
          },
          {
            name: 'dayOfWeek',
            type: 'varchar',
          },
          {
            name: 'startTime',
            type: 'time',
          },
          {
            name: 'endTime',
            type: 'time',
          },
          {
            name: 'slotDurationMinutes',
            type: 'int',
            default: 30,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('doctor_availabilities');
  }
}
