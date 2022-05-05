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

import type { UUID } from '@mds-core/mds-types'
import { uuid } from '@mds-core/mds-utils'
import AwaitLock from 'await-lock'
import { bool, cleanEnv, num, str } from 'envalid'
import { types as PostgresTypes } from 'pg'
import type { DataSourceOptions } from 'typeorm'
import { DataSource } from 'typeorm'
import { RepositoryError } from './exceptions'
import { RepositoryLogger } from './logger'
import { MdsNamingStrategy } from './naming-strategies'

const ConnectionModes = <const>['ro', 'rw']
export type ConnectionMode = typeof ConnectionModes[number]
const connectionMode = (mode: ConnectionMode) => (mode === 'ro' ? 'R/O' : 'R/W')

// Use parseInt for bigint columns so the values get returned as numbers instead of strings
PostgresTypes.setTypeParser(20, Number)

export class ConnectionManager {
  private readonly connections: Map<ConnectionMode, DataSource>
  private readonly lock = new AwaitLock()

  private readonly instance: UUID = uuid()

  private connection = (mode: ConnectionMode): DataSource => {
    const connection = this.connections.get(mode)
    if (!connection) {
      throw RepositoryError(Error(`${connectionMode(mode)} connection not found`))
    }
    return connection
  }

  public ormconfig = (mode: ConnectionMode): DataSourceOptions => this.connection(mode).options

  public connect = async (mode: ConnectionMode) => {
    const connection = this.connection(mode)
    await this.lock.acquireAsync()
    try {
      if (!connection.isInitialized) {
        try {
          RepositoryLogger.info(`Initializing ${connectionMode(mode)} connection`)
          await connection.initialize()
        } catch (error) /* istanbul ignore next */ {
          throw RepositoryError(error)
        }
      }
    } finally {
      this.lock.release()
    }
    return connection
  }

  public disconnect = async (mode: ConnectionMode) => {
    const connection = this.connection(mode)
    await this.lock.acquireAsync()
    try {
      if (connection.isInitialized) {
        try {
          RepositoryLogger.info(`Terminating ${connectionMode(mode)} connection`)
          await connection.destroy()
        } catch (error) /* istanbul ignore next */ {
          throw RepositoryError(error)
        }
      }
    } finally {
      this.lock.release()
    }
  }

  constructor(private prefix: string, private options: Partial<DataSourceOptions> = {}) {
    const { PG_DEBUG, PG_HOST, PG_HOST_READER, PG_NAME, PG_PASS, PG_PASS_READER, PG_PORT, PG_USER, PG_USER_READER } =
      cleanEnv(process.env, {
        PG_DEBUG: bool({ default: false }),
        PG_HOST: str({ default: 'localhost' }),
        PG_HOST_READER: str({ default: undefined }),
        PG_NAME: str({ default: undefined }),
        PG_PASS: str({ default: undefined }),
        PG_PASS_READER: str({ default: undefined }),
        PG_PORT: num({ default: 5432 }),
        PG_USER: str({ default: undefined }),
        PG_USER_READER: str({ default: undefined })
      })

    this.connections = new Map(
      ConnectionModes.map(mode => [
        mode,
        new DataSource({
          ...options,
          name: `${prefix}-${mode}`,
          type: 'postgres',
          host: mode === 'rw' ? PG_HOST : PG_HOST_READER || PG_HOST,
          port: PG_PORT,
          username: mode === 'rw' ? PG_USER : PG_USER_READER || PG_USER,
          password: mode === 'rw' ? PG_PASS : PG_PASS_READER || PG_PASS,
          database: PG_NAME,
          logging: PG_DEBUG,
          maxQueryExecutionTime: 3000,
          logger: 'simple-console',
          synchronize: false,
          migrationsRun: false,
          namingStrategy: new MdsNamingStrategy(),
          replication: undefined
        })
      ])
    )
  }
}
