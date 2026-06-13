import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSlot1718169800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'slots',
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
            name: 'startTime',
            type: 'datetime',
          },
          {
            name: 'endTime',
            type: 'datetime',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'AVAILABLE'",
          },
          {
            name: 'patientId',
            type: 'varchar',
            isNullable: true,
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
    await queryRunner.dropTable('slots');
  }
}
