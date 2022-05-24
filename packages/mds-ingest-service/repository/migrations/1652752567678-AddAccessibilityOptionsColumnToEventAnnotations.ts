import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAccessibilityOptionsColumnToEventAnnotations1652752567678 implements MigrationInterface {
  name = 'AddAccessibilityOptionsColumnToEventAnnotations1652752567678'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_annotations" ADD "accessibility_options" character varying(255) array NOT NULL DEFAULT '{}'`
    )
    await queryRunner.query(`ALTER TABLE "event_annotations" ALTER COLUMN "accessibility_options" DROP DEFAULT`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_annotations" DROP COLUMN "accessibility_options"`)
  }
}
