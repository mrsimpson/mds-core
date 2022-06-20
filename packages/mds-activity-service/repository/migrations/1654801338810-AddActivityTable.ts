import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddActivityTable1654801338810 implements MigrationInterface {
  name = 'AddActivityTable1654801338810'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity" (
        "recorded" bigint NOT NULL DEFAULT mds_epoch_ms(),
        "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
        "category" character varying(127) NOT NULL,
        "type" character varying(127) NOT NULL,
        "description" character varying(255) NOT NULL,
        "details" jsonb, CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
      )`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_activity" ON "activity" ("recorded") `)
    await queryRunner.query(`CREATE INDEX "idx_category_activity" ON "activity" ("category") `)
    await queryRunner.query(`CREATE INDEX "idx_type_activity" ON "activity" ("type") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_type_activity"`)
    await queryRunner.query(`DROP INDEX "public"."idx_category_activity"`)
    await queryRunner.query(`DROP INDEX "public"."idx_recorded_activity"`)
    await queryRunner.query(`DROP TABLE "activity"`)
  }
}
