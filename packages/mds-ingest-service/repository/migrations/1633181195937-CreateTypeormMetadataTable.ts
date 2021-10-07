/**
 * Copyright 2021 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * This migration was created to workaround a TypeORM bug where the "typeorm_metadata" table is created by
 * the "typeorm migration:generate" command and not added to the migration. Without this, migrations that
 * create a Postgres VIEW only work on the machine that the migration was generated on. Ideally, TypeORM
 * would get the view definition using "pg_get_viewdef" or some other mechanism rather than relying on this
 * metadata table. This is a really bad design to require a shared table for tracking CREATE VIEW DDL statements.
 *
 * See: https://github.com/typeorm/typeorm/issues/4923
 */
export class CreateTypeormMetadataTable1633181195937 implements MigrationInterface {
  name = 'CreateTypeormMetadataTable1633181195937'

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Use "IF NOT EXISTS" so this will still run on the machine that generates the migration or if
     * the metadata table was previously created by a migration in another repository.
     */
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "typeorm_metadata" ("type" character varying NOT NULL, "database" character varying, "schema" character varying, "table" character varying, "name" character varying, "value" Text)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ count }]: [{ count: number }] = await queryRunner.query(`SELECT COUNT(*) FROM "typeorm_metadata"`)
    /**
     * Don't DROP the metadata table unless it's empty in case it's used by a migration in another repository.
     */
    if (count === 0) {
      await queryRunner.query(`DROP TABLE "typeorm_metadata"`)
    }
  }
}
