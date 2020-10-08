import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateInitialTablesEvents1598487193 implements MigrationInterface {
  name = 'CreateInitialTablesEvents1588703306206'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "compliance_response"
        ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
        "id" bigint GENERATED ALWAYS AS IDENTITY,
        "compliance_response_id" uuid NOT NULL,
        "provider_id" uuid NOT NULL,
        "excess_vehicles_count" int NOT NULL,
        "total_violations" int NOT NULL,
        "compliance_as_of" bigint NOT NULL,
        "policy" jsonb NOT NULL,
        "vehicles_found" jsonb NOT NULL,
        CONSTRAINT "compliance_pkey" PRIMARY KEY ("compliance_response_id"))`,
      undefined
    )
    await queryRunner.query(
      `CREATE INDEX "idx_compliance_as_of_compliance_response" ON "compliance_response" ("compliance_as_of") `,
      undefined
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_compliance_as_of_compliance_response"`, undefined)
    await queryRunner.query(`DROP TABLE "compliance_response"`, undefined)
  }
}
