import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTelemetryAnnotationIndicies1649954300329 implements MigrationInterface {
  name = 'AddTelemetryAnnotationIndicies1649954300329'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_h3_13_timestamp_telemetry_annotations" ON "telemetry_annotations" ("provider_id", "h3_13", "timestamp") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_h3_12_timestamp_telemetry_annotations" ON "telemetry_annotations" ("provider_id", "h3_12", "timestamp") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_h3_11_timestamp_telemetry_annotations" ON "telemetry_annotations" ("provider_id", "h3_11", "timestamp") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_h3_10_timestamp_telemetry_annotations" ON "telemetry_annotations" ("provider_id", "h3_10", "timestamp") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_h3_09_timestamp_telemetry_annotations" ON "telemetry_annotations" ("provider_id", "h3_09", "timestamp") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_h3_08_timestamp_telemetry_annotations" ON "telemetry_annotations" ("provider_id", "h3_08", "timestamp") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_h3_08_timestamp_telemetry_annotations"`)
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_h3_09_timestamp_telemetry_annotations"`)
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_h3_10_timestamp_telemetry_annotations"`)
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_h3_11_timestamp_telemetry_annotations"`)
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_h3_12_timestamp_telemetry_annotations"`)
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_h3_13_timestamp_telemetry_annotations"`)
  }
}
