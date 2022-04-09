/**
 * Copyright 2019 City of Los Angeles
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

import type { MountedConfigFileReader } from '@mds-core/mds-config-files'
import { ConfigFileReader } from '@mds-core/mds-config-files'
import { pluralize, tail, testEnvSafeguard } from '@mds-core/mds-utils'
import { bool, cleanEnv } from 'envalid'
import { DataSource } from 'typeorm'
import type { ConnectionMode } from './connection'
import { ConnectionManager } from './connection'
import { RepositoryLogger as logger } from './logger'
import type { ModelMapper } from './mapper'
import { MapModels } from './mapper'
import { RepositoryMigrations } from './migrations'
export type { DataSource } from 'typeorm'

type Entity = Function
type Migration = Function

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface EntitySeeder<From = any, To = any> {
  entity: Entity
  mapper: ModelMapper<From, To>
  reader?: MountedConfigFileReader
}

export type ReadOnlyRepositoryOptions = { entities: Array<Entity> }
export type ReadWriteRepositoryOptions = ReadOnlyRepositoryOptions & { migrations: Array<Migration> } & {
  seeders?: Array<EntitySeeder>
}

const runAllMigrationsUsingConnection = async (connection: DataSource): Promise<void> => {
  const {
    options: { migrationsTableName }
  } = connection
  if (migrationsTableName) {
    if (connection.migrations.length > 0) {
      const migrations = await connection.runMigrations({ transaction: 'all' })
      logger.info(
        `Ran ${migrations.length || 'no'} ${pluralize(
          migrations.length,
          'migration',
          'migrations'
        )} (${migrationsTableName})${
          migrations.length ? `: ${migrations.map(migration => migration.name).join(', ')}` : ''
        }`
      )
      logger.info(`Schema version (${migrationsTableName}): ${tail(connection.migrations).name}`)
    } else {
      logger.info(`No migrations defined (${migrationsTableName})`)
    }
  }
}

const revertAllMigrationsUsingConnection = async (connection: DataSource): Promise<void> => {
  const {
    options: { migrationsTableName }
  } = connection
  if (migrationsTableName) {
    const { migrations } = connection
    await migrations.reduce(p => p.then(() => connection.undoLastMigration()), Promise.resolve())
    logger.info(
      `Reverted ${migrations.length || 'no'} ${pluralize(
        migrations.length,
        'migration',
        'migrations'
      )} (${migrationsTableName})${
        migrations.length ? `: ${migrations.map(migration => migration.name).join(', ')}` : ''
      }`
    )
  }
}

const truncateAllTablesUsingConnection = async (
  connection: DataSource,
  entities: ReadWriteRepositoryOptions['entities']
): Promise<void> => {
  // Get the table names of every @Entity
  const tableNames = entities
    .map(entity => connection.getMetadata(entity))
    .filter(metadata => !metadata.expression) // An expression indicates an @Entity is a @ViewEntity which cannot be truncated
    .map(metadata => metadata.tableName)

  // Truncate all tables (including tables that have foreign-key references to any of the named tables) and restart the IDENTITY sequence
  await connection.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`)
}

const DataSeeder = (connection: DataSource, path?: string) => {
  try {
    const mount = ConfigFileReader.mount(path)
    logger.info(`R/W repository using data files mounted at ${mount.path}`)

    return {
      using: async <From, To>({ entity, mapper, reader = mount }: EntitySeeder<From, To>): Promise<void> => {
        const repository = connection.getRepository(entity)

        const {
          metadata: { tableName: table }
        } = repository

        // Additional log if entity not using default data file mount
        if (reader !== mount) {
          logger.info(`R/W repository using data file mounted at ${reader.path} for "${table}"`)
        }

        // Make sure the source data file exists
        if (!reader.configFileExists(table)) {
          return logger.info(`No data file found for "${table} at ${reader.path}`)
        }
        logger.info(`Found data file for "${table}"`)

        // Make sure the target table is empty
        const count = await repository.createQueryBuilder().getCount()
        if (count > 0) {
          return logger.info(
            `Seeding will be skipped ("${table}" table contains ${count} ${pluralize(count, 'row', 'rows')})`
          )
        }
        logger.info(`Seeding will be attempted ("${table}" table is empty)`)

        try {
          const data = await reader.readConfigFile<Array<From>>(table)
          if (data.length === 0) {
            return logger.info(`Data file was empty or not an array`)
          }

          const {
            identifiers: { length: inserted }
          } = await repository.createQueryBuilder().insert().values(MapModels(data).using(mapper)).execute()

          logger.info(`Inserted ${inserted} ${pluralize(inserted, 'row', 'rows')} into "${table}"`)
        } catch (error) {
          logger.error(`Seeding failed for "${table}}`, { error })
        }
      }
    }
  } catch {
    logger.info(`R/W repository data files not mounted`)
  }
}

const asChunksForInsert = <TEntity>(entities: TEntity[], size = 4_000) => {
  const chunks =
    entities.length > size
      ? entities.reduce<Array<Array<TEntity>>>((reduced, t, index) => {
          const chunk = Math.floor(index / size)
          if (!reduced[chunk]) {
            reduced.push([])
          }
          ;(reduced[chunk] as Array<TEntity>).push(t) // this cast is safe because we initialize the index if it doesn't exist yet
          return reduced
        }, [])
      : [entities]

  if (chunks.length > 1) {
    logger.info(`Splitting ${entities.length} records into ${chunks.length} chunks for insert`)
  }
  return chunks
}

export interface RepositoryPublicMethods {
  initialize: () => Promise<void>
  shutdown: () => Promise<void>
}

type RepositoryConnectionMethods<TConnectionMode extends ConnectionMode> = {
  connect: (mode: TConnectionMode) => Promise<DataSource>
  disconnect: (mode: TConnectionMode) => Promise<void>
}

export type ReadOnlyRepositoryProtectedMethods = RepositoryConnectionMethods<'ro'>

export type ReadOnlyRepositoryPublicMethods<T> = T & RepositoryPublicMethods

export const ReadOnlyRepository = {
  Create: <T extends {}>(
    name: string,
    { entities }: ReadOnlyRepositoryOptions,
    methods: (repository: ReadOnlyRepositoryProtectedMethods) => T
  ): ReadOnlyRepositoryPublicMethods<T> => {
    const manager = new ConnectionManager(name, { entities })

    const connect = (mode: 'ro') => manager.connect(mode)

    const disconnect = (mode: 'ro') => manager.disconnect(mode)

    const initialize = async () => {
      logger.info(`Initializing R/O repository: ${name}`)
      await connect('ro')
    }

    const shutdown = async () => {
      logger.info(`Terminating R/O repository: ${name}`)
      await disconnect('ro')
    }

    return { connect, disconnect, initialize, shutdown, ...methods({ connect, disconnect }) }
  }
}

export type ReadWriteRepositoryProtectedMethods = RepositoryConnectionMethods<ConnectionMode> & {
  asChunksForInsert: <TEntity>(entities: TEntity[], size?: number) => Array<TEntity[]>
}

export type ReadWriteRepositoryPublicMethods<T extends {}> = T &
  RepositoryPublicMethods & {
    cli: () => DataSource
    runAllMigrations: () => Promise<void>
    revertAllMigrations: () => Promise<void>
    truncateAllTables: (options?: Partial<{ unsafe: true }>) => Promise<void>
  }

export const ReadWriteRepository = {
  Create: <T extends {}>(
    name: string,
    { entities, migrations, seeders = [] }: ReadWriteRepositoryOptions,
    methods: (repository: ReadWriteRepositoryProtectedMethods) => T
  ): ReadWriteRepositoryPublicMethods<T> => {
    const migrationsTableName = `${name}-migrations`
    const metadataTableName = `${name}-migration-metadata`

    const { connect, disconnect, ormconfig } = new ConnectionManager(name, {
      migrationsTableName,
      metadataTableName,
      entities,
      migrations: migrations.length === 0 ? [] : RepositoryMigrations(migrationsTableName).concat(migrations)
    })

    const runAllMigrations = async (): Promise<void> => runAllMigrationsUsingConnection(await connect('rw'))

    const revertAllMigrations = async (): Promise<void> => revertAllMigrationsUsingConnection(await connect('rw'))

    const truncateAllTables = async (options: Partial<{ unsafe: true }> = {}): Promise<void> => {
      if (!options.unsafe) {
        testEnvSafeguard()
      }
      return truncateAllTablesUsingConnection(await connect('rw'), entities)
    }

    const initialize = async () => {
      logger.info(`Initializing R/W repository: ${name}`)
      const [connection] = await Promise.all([connect('rw'), connect('ro')])

      // Enable migrations by default
      const { PG_MIGRATIONS } = cleanEnv(process.env, { PG_MIGRATIONS: bool({ default: migrations.length > 0 }) })

      if (PG_MIGRATIONS) {
        await runAllMigrations()
      }

      // Enabled seeding by default
      const { PG_SEED } = cleanEnv(process.env, { PG_SEED: bool({ default: seeders.length > 0 }) })

      if (PG_SEED) {
        const seed = DataSeeder(connection)
        if (seed) {
          for (const seeder of seeders) {
            await seed.using(seeder)
          }
        }
      }
    }

    const shutdown = async () => {
      logger.info(`Terminating R/W repository: ${name}`)
      await Promise.all([disconnect('ro'), disconnect('rw')])
    }

    return {
      initialize,
      shutdown,
      cli: () => new DataSource(ormconfig('rw')),
      runAllMigrations,
      revertAllMigrations,
      truncateAllTables,
      ...methods({ connect, disconnect, asChunksForInsert })
    }
  }
}
