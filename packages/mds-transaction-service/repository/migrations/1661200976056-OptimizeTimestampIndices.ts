import type { MigrationInterface, QueryRunner } from 'typeorm'

export class OptimizeTimestampIndices1661200976056 implements MigrationInterface {
  name = 'OptimizeTimestampIndices1661200976056'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_provider_id_timestamp_transactions"`)

    // We expect the length of the response to be non-zero if the receipt_timestamp column exists, or zero if it doesn't exist.
    const res = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'receipt_timestamp'`
    )

    // If the receipt_timestamp column doesn't exist, create it
    if (res.length === 0) {
      await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "receipt_timestamp" bigint`)
      await queryRunner.query(`UPDATE "transactions" SET "receipt_timestamp" = ("receipt"->>'timestamp')::bigint`)
      await queryRunner.query('ALTER TABLE "transactions" ALTER COLUMN "receipt_timestamp" SET NOT NULL')
    }

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_provider_id_timestamp_fee_type_transactions" ON "transactions" ("provider_id", "timestamp", "fee_type") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_provider_id_receipt_timestamp_fee_type_transactions" ON "transactions" ("provider_id", "receipt_timestamp", "fee_type") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_receipt_timestamp_fee_type_transactions"`)
    await queryRunner.query(`DROP INDEX "public"."idx_provider_id_timestamp_fee_type_transactions"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "receipt_timestamp"`)
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_timestamp_transactions" ON "transactions" ("provider_id", "timestamp") `
    )
  }
}
