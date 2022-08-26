import type { MigrationInterface, QueryRunner } from 'typeorm'

export class DropTelemetryAnnotations1660590738992 implements MigrationInterface {
  name = 'DropTelemetryAnnotations1660590738992'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "telemetry_annotations"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /* cannot undo the table-drop via migration */
  }
}
