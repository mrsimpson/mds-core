import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateInitialTablesEvents1598487193 implements MigrationInterface {
  name = 'CreateInitialTablesEvents1588703306206'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "compliance_response"
        ("recorded" bigint NOT NULL,
        "id" bigint GENERATED ALWAYS AS IDENTITY,
        "compliance_response_id" uuid NOT NULL,
        "provider_id" uuid NOT NULL,
        "compliance_json" jsonb NOT NULL,
        CONSTRAINT "compliance_pkey" PRIMARY KEY ("compliance_response_id"))`,
      undefined
    )
    await queryRunner.query(
      `CREATE INDEX "idx_timestamp_compliance_response" ON "compliance_response" ("timestamp") `,
      undefined
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_timestamp_compliance_response"`, undefined)
    await queryRunner.query(`DROP TABLE "compliance_response"`, undefined)
  }
}
