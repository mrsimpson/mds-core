import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RenamePublishDateToPublishedDate1648742662434 implements MigrationInterface {
  name = 'RenamePublishDateToPublishedDate1648742662434'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_publish_date_policies"`)
    await queryRunner.query(`ALTER TABLE "policies" RENAME COLUMN "publish_date" TO "published_date"`)
    await queryRunner.query(`CREATE INDEX "idx_published_date_policies" ON "policies" ("published_date") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_published_date_policies"`)
    await queryRunner.query(`ALTER TABLE "policies" RENAME COLUMN "published_date" TO "publish_date"`)
    await queryRunner.query(`CREATE INDEX "idx_publish_date_policies" ON "policies" ("publish_date") `)
  }
}
