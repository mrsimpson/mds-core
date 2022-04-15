import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProvidersTable1590524762011 implements MigrationInterface {
  name = 'CreateProvidersTable1590524762011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "providers"
        ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
        "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
        "provider_id" uuid NOT NULL,
        "provider_name" character varying(255) NOT NULL,
        "url" character varying(255),
        "mds_api_url" character varying(255),
        "gbfs_api_url" character varying(255),
        "color_code_hex" character varying(7),
        "provider_types" character varying(32) array NOT NULL,
        CONSTRAINT "providers_pkey" PRIMARY KEY ("provider_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "providers"`)
  }
}
