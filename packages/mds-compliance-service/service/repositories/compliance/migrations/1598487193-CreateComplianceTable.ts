import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateInitialTablesEvents1598487193 implements MigrationInterface {
  name = 'CreateInitialTablesEvents1588703306206'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "compliance"
        ("recorded" bigint NOT NULL,
        "id" bigint GENERATED ALWAYS AS IDENTITY,
        "compliance_id" uuid NOT NULL,
        "provider_id" uuid NOT NULL,
        "policy_id" uuid NOT NULL,
        "compliance_json" jsonb NOT NULL,
        "timestamp" bigint NOT NULL,
        "total_violations" int NOT NULL,
        CONSTRAINT "compliance_pkey" PRIMARY KEY ("compliance_id"))`,
      undefined
    )
    await queryRunner.query(`CREATE INDEX "idx_timestamp_compliance" ON "compliance" ("timestamp") `, undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_timestamp_compliance"`, undefined)
    await queryRunner.query(`DROP TABLE "compliance"`, undefined)
  }
}
