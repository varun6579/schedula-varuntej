import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAppointment1718169900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
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
            name: 'patientId',
            type: 'varchar',
          },
          {
            name: 'slotId',
            type: 'varchar',
          },
          {
            name: 'appointmentTime',
            type: 'datetime',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'SCHEDULED'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
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
    await queryRunner.dropTable('appointments');
  }
}
