/**
 * Copyright 2020 City of Los Angeles
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
import type { InsertReturning } from '@mds-core/mds-repository'
import { ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import type { UUID } from '@mds-core/mds-types'
import { NotFoundError, now } from '@mds-core/mds-utils'
import { cleanEnv, num } from 'envalid'
import { In } from 'typeorm'
import type { Cursor } from 'typeorm-cursor-pagination'
import { buildPaginator } from 'typeorm-cursor-pagination'
import type {
  TransactionDomainModel,
  TransactionOperationDomainModel,
  TransactionSearchParams,
  TransactionStatusDomainModel,
  TransactionSummary
} from '../@types'
import { validateTransactionSearchParams } from '../service/validators'
import { TransactionOperationEntity } from './entities/operation-entity'
import { TransactionStatusEntity } from './entities/status-entity'
import { TransactionEntity } from './entities/transaction-entity'
import {
  TransactionDomainToEntityCreate,
  TransactionEntityToDomain,
  TransactionOperationDomainToEntityCreate,
  TransactionOperationEntityToDomain,
  TransactionStatusDomainToEntityCreate,
  TransactionStatusEntityToDomain
} from './mappers'
import migrations from './migrations'
import { resolveConditions, resolveTimeBounds } from './query-helpers'

const env = cleanEnv(process.env, {
  TRANSACTION_BULK_DB_WRITE_CHUNK_SIZE: num({ default: 5000 })
})
interface InsertTransactionOptions {
  beforeCommit: (pendingTransaction: TransactionDomainModel) => Promise<void>
}

interface InsertTransactionsOptions {
  beforeCommit: (pendingTransactions: TransactionDomainModel[]) => Promise<void>
}

export const TransactionRepository = ReadWriteRepository.Create(
  'transactions',
  {
    entities: [TransactionEntity, TransactionOperationEntity, TransactionStatusEntity],
    migrations
  },
  repository => {
    return {
      getTransaction: async (transaction_id: UUID): Promise<TransactionDomainModel> => {
        try {
          const connection = await repository.connect('ro')
          const entity = await connection.getRepository(TransactionEntity).findOne({
            where: {
              transaction_id
            }
          })
          if (!entity) {
            throw new NotFoundError(`Transaction ${transaction_id} not found`)
          }
          return TransactionEntityToDomain.map(entity)
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getTransactions: async (
        search: TransactionSearchParams
      ): Promise<{ transactions: TransactionDomainModel[]; cursor: Cursor }> => {
        const {
          provider_ids,
          start_receipt_timestamp,
          end_receipt_timestamp,
          start_timestamp,
          end_timestamp,
          search_text,
          start_amount,
          end_amount,
          fee_type,
          before,
          after,
          limit,
          order
        } = validateTransactionSearchParams(search)

        try {
          const connection = await repository.connect('ro')

          /**
           * Need to generate a shared alias due to the different aliasing methods in TypeORM & TypeORM Cursor Paginator
           * depending on debug vs production environments.
           */
          const alias = 'transactionentity'

          const queryBuilder = connection
            .getRepository(TransactionEntity)
            .createQueryBuilder(alias)
            .where({
              ...resolveTimeBounds({ key: 'timestamp', start_timestamp, end_timestamp }),
              ...resolveTimeBounds({
                key: 'receipt_timestamp',
                start_timestamp: start_receipt_timestamp,
                end_timestamp: end_receipt_timestamp
              })
            })
            .andWhere(resolveConditions(alias, { start_amount, end_amount, fee_type, search_text }))

          if (provider_ids && provider_ids.length > 0) {
            queryBuilder.andWhere(`${alias}.provider_id = ANY(:provider_ids)`, { provider_ids })
          }

          const { data, cursor } = await buildPaginator({
            alias,
            entity: TransactionEntity,
            query: {
              limit,
              order: order?.direction ?? 'ASC',
              afterCursor: after,
              beforeCursor: after ? undefined : before
            },
            paginationKeys: [order?.column ?? 'id']
          }).paginate(queryBuilder)
          return { transactions: data.map(TransactionEntityToDomain.mapper()), cursor }
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getTransactionSummary: async (search: TransactionSearchParams): Promise<TransactionSummary> => {
        const {
          provider_ids,
          start_receipt_timestamp,
          end_receipt_timestamp,
          start_timestamp,
          end_timestamp,
          search_text,
          start_amount,
          end_amount,
          fee_type
        } = validateTransactionSearchParams(search)

        try {
          const connection = await repository.connect('ro')

          /**
           * Need to generate a shared alias due to the different aliasing methods in TypeORM & TypeORM Cursor Paginator
           * depending on debug vs production environments.
           */
          const alias = 'transactionentity'

          const queryBuilder = connection
            .getRepository(TransactionEntity)
            .createQueryBuilder(alias)
            .select(
              'provider_id, SUM(amount) as amount, SUM(CASE WHEN amount != 0 THEN 1 ELSE 0 END) AS non_zero_amount_count, SUM(CASE WHEN amount = 0 THEN 1 ELSE 0 END) as zero_amount_count'
            )
            .where({
              ...resolveTimeBounds({ key: 'timestamp', start_timestamp, end_timestamp }),
              ...resolveTimeBounds({
                key: 'receipt_timestamp',
                start_timestamp: start_receipt_timestamp,
                end_timestamp: end_receipt_timestamp
              })
            })
            .andWhere(resolveConditions(alias, { start_amount, end_amount, fee_type, search_text }))

          if (provider_ids && provider_ids.length > 0) {
            queryBuilder.andWhere(`${alias}.provider_id = ANY(:provider_ids)`, { provider_ids })
          }

          queryBuilder.groupBy('provider_id')

          const queryResult: {
            provider_id: UUID
            amount: number
            non_zero_amount_count: number
            zero_amount_count: number
          }[] = await queryBuilder.getRawMany()

          // Turn list into a dictionary for lookup
          const queryMap = Object.fromEntries(queryResult.map(({ provider_id, ...rest }) => [provider_id, rest]))

          // Set any providers that didn't come back in the DB query to 0/0
          const result = Object.fromEntries<TransactionSummary['provider_id']>(
            provider_ids?.map(provider_id => [
              provider_id,
              queryMap[provider_id] ?? { amount: 0, non_zero_amount_count: 0, zero_amount_count: 0 }
            ]) ?? []
          )

          return result
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      createTransaction: async (
        transaction: TransactionDomainModel,
        options: Partial<InsertTransactionOptions>
      ): Promise<TransactionDomainModel> => {
        const { beforeCommit = async () => undefined } = options
        try {
          const connection = await repository.connect('rw')
          const result = await connection.transaction(async manager => {
            const {
              raw: [entity]
            }: InsertReturning<TransactionEntity> = await manager
              .getRepository(TransactionEntity)
              .createQueryBuilder()
              .insert()
              .values([TransactionDomainToEntityCreate.map(transaction)])
              .returning('*')
              .execute()

            if (!entity) {
              throw new Error('Failed to create transaction')
            }

            const pendingTransaction = TransactionEntityToDomain.map(entity)
            await beforeCommit(pendingTransaction)
            return pendingTransaction
          })
          return result
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      createTransactions: async (
        transactions: TransactionDomainModel[],
        options: Partial<InsertTransactionsOptions>
      ): Promise<TransactionDomainModel[]> => {
        const { beforeCommit = async () => undefined } = options
        try {
          const connection = await repository.connect('rw')
          const chunks = repository.asChunksForInsert(
            transactions.map(TransactionDomainToEntityCreate.mapper({ recorded: now() })),
            env.TRANSACTION_BULK_DB_WRITE_CHUNK_SIZE
          )

          const results: TransactionDomainModel[] = await connection.transaction(async manager => {
            const insertResults = await Promise.all(
              chunks.map(chunk => {
                return manager
                  .getRepository(TransactionEntity)
                  .createQueryBuilder()
                  .insert()
                  .values(chunk)
                  .returning('*')
                  .execute()
              })
            )
            const pendingTransactions = insertResults
              .reduce<Array<TransactionEntity>>((entities, { raw: chunk = [] }) => entities.concat(chunk), [])
              .map(TransactionEntityToDomain.mapper())
            await beforeCommit(pendingTransactions)
            return pendingTransactions
          })

          return results
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      addTransactionOperation: async (
        transactionOperation: TransactionOperationDomainModel
      ): Promise<TransactionOperationDomainModel> => {
        try {
          const connection = await repository.connect('rw')
          const {
            raw: [entity]
          }: InsertReturning<TransactionOperationEntity> = await connection
            .getRepository(TransactionOperationEntity)
            .createQueryBuilder()
            .insert()
            .values([TransactionOperationDomainToEntityCreate.map(transactionOperation)])
            .returning('*')
            .execute()

          if (!entity) {
            throw new Error('Failed to create transaction operation')
          }
          return TransactionOperationEntityToDomain.map(entity)
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      // TODO search criteria, paging
      getTransactionOperations: async (transaction_id: UUID): Promise<TransactionOperationDomainModel[]> => {
        try {
          const connection = await repository.connect('ro')
          const entities = await connection
            .getRepository(TransactionOperationEntity)
            .find({ where: { transaction_id } })
          return entities.map(TransactionOperationEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      setTransactionStatus: async (
        transactionStatus: TransactionStatusDomainModel
      ): Promise<TransactionStatusDomainModel> => {
        try {
          const connection = await repository.connect('rw')
          const {
            raw: [entity]
          }: InsertReturning<TransactionStatusEntity> = await connection
            .getRepository(TransactionStatusEntity)
            .createQueryBuilder()
            .insert()
            .values([TransactionStatusDomainToEntityCreate.map(transactionStatus)])
            .returning('*')
            .execute()

          if (!entity) {
            throw new Error('Failed to create transaction status')
          }

          return TransactionStatusEntityToDomain.map(entity)
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      // TODO search criteria, paging
      getTransactionStatuses: async (transaction_id: UUID): Promise<TransactionStatusDomainModel[]> => {
        try {
          const connection = await repository.connect('ro')
          const entities = await connection.getRepository(TransactionStatusEntity).find({ where: { transaction_id } })
          return entities.map(TransactionStatusEntityToDomain.mapper())
        } catch (error) {
          throw RepositoryError(error)
        }
      },

      getTransactionsStatuses: async (
        transaction_ids: UUID[]
      ): Promise<Record<UUID, TransactionStatusDomainModel[]>> => {
        try {
          const connection = await repository.connect('ro')
          const entities: { transaction_id: UUID; statuses: TransactionStatusEntity[] }[] = await connection
            .getRepository(TransactionStatusEntity)
            .createQueryBuilder()
            .select('transaction_id, ARRAY_AGG(row_to_json("TransactionStatusEntity".*)) as statuses')
            .where({ transaction_id: In(transaction_ids) })
            .groupBy(`transaction_id`)
            .execute()

          // Map the statuses within the object to their domain models
          return entities.reduce<Record<UUID, TransactionStatusDomainModel[]>>((acc, { transaction_id, statuses }) => {
            const mappedStatuses = statuses.map(TransactionStatusEntityToDomain.mapper())
            return { ...acc, [transaction_id]: mappedStatuses }
          }, {})
        } catch (error) {
          throw RepositoryError(error)
        }
      }
    }
  }
)
