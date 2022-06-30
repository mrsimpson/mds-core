import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProviderIdTimestampIndex1656441290628 implements MigrationInterface {
  name = 'AddProviderIdTimestampIndex1656441290628'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_provider_id_timestamp_transactions" ON "transactions" ("provider_id", "timestamp")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_timestamp_transactions"`)
  }
}
