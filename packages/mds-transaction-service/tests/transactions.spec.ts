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

import stream from '@mds-core/mds-stream'
import { uuid } from '@mds-core/mds-utils'
import type { ComplianceViolationDetailsDomainModel, TransactionDomainModel } from '../@types'
import { TransactionServiceClient } from '../client'
import { TransactionRepository } from '../repository'
import { TransactionServiceManager } from '../service/manager'
import { TransactionStreamKafka } from '../service/stream'
import { transactionsGenerator } from '../test-fixtures'

describe('Transaction Repository Tests', () => {
  beforeAll(TransactionRepository.initialize)
  it('Run Migrations', TransactionRepository.runAllMigrations)
  it('Revert Migrations', TransactionRepository.revertAllMigrations)
  afterAll(TransactionRepository.shutdown)
})

const TransactionServer = TransactionServiceManager.controller()

const mockStream = stream.mockStream(TransactionStreamKafka)

describe('Transaction Service Tests', () => {
  beforeAll(async () => {
    await TransactionServer.start()
  })

  /**
   * Clear DB after each test runs, and after the file is finished. No side-effects for you.
   */
  beforeEach(async () => {
    await Promise.all([
      TransactionRepository.deleteAllTransactions(),
      TransactionRepository.deleteAllTransactionOperations(),
      TransactionRepository.deleteAllTransactionStatuses()
    ])
  })

  afterEach(async () => {
    mockStream.write.mockReset()
  })

  describe('Transaction Tests', () => {
    describe('Transaction Creation Tests', () => {
      describe('Success Tests', () => {
        it('Create one good transaction succeeds', async () => {
          const [transactionToPersist] = transactionsGenerator()

          if (!transactionToPersist) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }

          const recordedTransaction = await TransactionServiceClient.createTransaction(transactionToPersist)
          expect(recordedTransaction.device_id).toEqual(transactionToPersist.device_id)
          expect(recordedTransaction.transaction_id).toEqual(transactionToPersist.transaction_id)
          expect(mockStream.write).toHaveBeenCalledTimes(1)
          expect(mockStream.write).toHaveBeenCalledWith(recordedTransaction)
        })

        it('Create one good Compliance Violation transaction', async () => {
          const [transactionToPersist] = transactionsGenerator(1, {
            receipt_details: { violation_id: uuid(), trip_id: null, policy_id: uuid() }
          })

          if (!transactionToPersist) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }

          const recordedTransaction = await TransactionServiceClient.createTransaction(transactionToPersist)
          expect(recordedTransaction.device_id).toEqual(transactionToPersist.device_id)
          expect(recordedTransaction.transaction_id).toEqual(transactionToPersist.transaction_id)
          expect(
            (recordedTransaction.receipt.receipt_details as ComplianceViolationDetailsDomainModel).violation_id
          ).toEqual(
            (transactionToPersist.receipt.receipt_details as ComplianceViolationDetailsDomainModel).violation_id
          )
          expect(mockStream.write).toHaveBeenCalledTimes(1)
          expect(mockStream.write).toHaveBeenCalledWith(recordedTransaction)
        })

        it('Verifies good bulk-transaction creation', async () => {
          const transactionsToPersist = [...transactionsGenerator(20)]
          const recordedTransactions = await TransactionServiceClient.createTransactions(transactionsToPersist)

          recordedTransactions.forEach((transaction, i) => {
            expect(transaction.device_id).toEqual(transactionsToPersist[i]?.device_id)
          })

          expect(recordedTransactions.length).toStrictEqual(transactionsToPersist.length)

          expect(mockStream.write).toHaveBeenCalledTimes(1)
          expect(mockStream.write).toHaveBeenCalledWith(recordedTransactions)
        })
      })

      describe('Failure Tests', () => {
        it('Create one transaction with malformed transaction_id rejects', async () => {
          const [transaction] = transactionsGenerator(1)
          if (!transaction) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          const malformedTransaction = { ...transaction, transaction_id: 'definitely-not-a-uuid' }

          await expect(TransactionServiceClient.createTransaction(malformedTransaction)).rejects.toMatchObject({
            type: 'ValidationError'
          })
          expect(mockStream.write).not.toHaveBeenCalled()
        })

        it('Create one transaction with missing fee_type rejects', async () => {
          const [transaction] = transactionsGenerator(1)
          if (!transaction) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          const { fee_type, ...malformedTransaction } = transaction

          await expect(
            TransactionServiceClient.createTransaction(malformedTransaction as TransactionDomainModel)
          ).rejects.toMatchObject({
            type: 'ValidationError'
          })
          expect(mockStream.write).not.toHaveBeenCalled()
        })

        it('Post Transaction duplicate transaction_id', async () => {
          const [transaction] = transactionsGenerator(1)
          if (!transaction) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          await TransactionServiceClient.createTransaction(transaction)

          await expect(TransactionServiceClient.createTransaction(transaction)).rejects.toMatchObject({
            type: 'ConflictError'
          })
          expect(mockStream.write).toHaveBeenCalledTimes(1) // 1 - setup; 2 - re-insert; expect 1 not 2
        })

        it('Kafka failure reverts postgres create', async () => {
          const [transaction] = transactionsGenerator(1)
          if (!transaction) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          mockStream.write.mockImplementationOnce(async () => {
            throw new Error('Test failure')
          })
          await expect(TransactionServiceClient.createTransaction(transaction)).rejects.toMatchObject({
            type: 'ServiceException'
          })
          await expect(TransactionServiceClient.getTransaction(transaction.transaction_id)).rejects.toMatchObject({
            type: 'NotFoundError'
          })
        })
        it('Kafka failure reverts bulk postgres create', async () => {
          const transactions = [...transactionsGenerator(10)]

          mockStream.write.mockImplementationOnce(async () => {
            throw new Error('Test failure')
          })
          await expect(TransactionServiceClient.createTransactions(transactions)).rejects.toMatchObject({
            type: 'ServiceException'
          })
          const [transaction] = transactions
          if (!transaction) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          await expect(
            TransactionServiceClient.getTransaction(transaction.transaction_id as string)
          ).rejects.toMatchObject({
            type: 'NotFoundError'
          })
        })
      })
    })

    describe('Transaction Read Tests', () => {
      describe('Success', () => {
        it('Get One Transaction', async () => {
          const [transactionToPersist] = transactionsGenerator(1)
          if (!transactionToPersist) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          const recordedTransaction = await TransactionServiceClient.createTransaction(transactionToPersist)

          const fetchedTransaction = await TransactionServiceClient.getTransaction(recordedTransaction.transaction_id)
          expect(fetchedTransaction).toStrictEqual(recordedTransaction)
        })

        it('Verifies that get all transactions with no options uses the default limit', async () => {
          // We'll just generate a bunch of transactions here to test
          const transactionsToPersist = [...transactionsGenerator(100)]
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions } = await TransactionServiceClient.getTransactions({})
          expect(transactions.length).toEqual(10)
        })

        it('Get Bulk Transactions with provider search and default paging', async () => {
          const provider_id = uuid()
          const transactionsToPersist = [...transactionsGenerator(21, { provider_id })] // Arbitrarily generate 21 events, just so we can verify paging works w/ default page size on a handful of pages.
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions: firstPage, cursor: firstCursor } = await TransactionServiceClient.getTransactions({
            provider_id
          })
          expect(firstPage.length).toEqual(10) // default page size

          const { transactions: secondPage, cursor: secondCursor } = await TransactionServiceClient.getTransactions({
            provider_id,
            after: firstCursor.afterCursor ?? undefined
          })
          expect(secondPage.length).toEqual(10) // default page size

          const { transactions: lastPage } = await TransactionServiceClient.getTransactions({
            provider_id,
            after: secondCursor.afterCursor ?? undefined
          })
          expect(lastPage.length).toEqual(1) // default page size
        })

        it('Get Bulk Transactions with custom limit paging', async () => {
          const limit = 100

          const transactionsToPersist = [...transactionsGenerator(201)] // Arbitrarily generate 201 events
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions: firstPage, cursor: firstCursor } = await TransactionServiceClient.getTransactions({
            limit
          })
          expect(firstPage.length).toEqual(100) // custom page size

          const { transactions: secondPage, cursor: secondCursor } = await TransactionServiceClient.getTransactions({
            limit,
            after: firstCursor.afterCursor ?? undefined
          })
          expect(secondPage.length).toEqual(100) // custom page size

          const { transactions: lastPage } = await TransactionServiceClient.getTransactions({
            limit,
            after: secondCursor.afterCursor ?? undefined
          })
          expect(lastPage.length).toEqual(1) // last page, so lower than custom page size
        })

        it('Get Bulk Transactions within a time range, with default paging', async () => {
          const [start_timestamp, end_timestamp] = [1620100000000, 1620100000300] // Garbage arbitrary timestamps

          /**
           * Will generate transactions with differing timestamps **WITHIN** our time bounds, like 100_000, 100_001, 100_002, ..., 100_014
           */
          const inBoundsTransactions = [...transactionsGenerator(15)].map((transaction, i) => ({
            ...transaction,
            timestamp: start_timestamp + i
          }))
          /**
           * Will Generate transactions **OUTSIDE** of our time bounds, like 200_001, 200_001, ..., 200_0014
           */
          const outOfBoundsTransactions = [...transactionsGenerator(15)].map((transaction, i) => ({
            ...transaction,
            timestamp: end_timestamp + 1 + i
          }))
          const transactionsToPersist = [...inBoundsTransactions, ...outOfBoundsTransactions]
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions: firstPage, cursor: firstCursor } = await TransactionServiceClient.getTransactions({
            start_timestamp,
            end_timestamp
          })
          expect(firstPage.length).toEqual(10) // default page size
          firstPage.forEach(({ timestamp }) => {
            expect(timestamp).toBeGreaterThanOrEqual(start_timestamp)
            expect(timestamp).toBeLessThanOrEqual(end_timestamp)
          })

          const { transactions: secondPage } = await TransactionServiceClient.getTransactions({
            start_timestamp,
            end_timestamp,
            after: firstCursor.afterCursor ?? undefined
          })
          expect(secondPage.length).toEqual(5)
          secondPage.forEach(({ timestamp }) => {
            expect(timestamp).toBeGreaterThanOrEqual(start_timestamp)
            expect(timestamp).toBeLessThanOrEqual(end_timestamp)
          })
        })

        it('Get Bulk Transactions with sort options, with default paging', async () => {
          const transactionsToPersist = [...transactionsGenerator(20)]
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions: firstPage, cursor: firstCursor } = await TransactionServiceClient.getTransactions({
            order: {
              column: 'timestamp',
              direction: 'DESC'
            }
          })

          firstPage.reduce<TransactionDomainModel | undefined>((prevTransaction, currTransaction) => {
            if (prevTransaction) {
              const { timestamp: prevTimestamp } = prevTransaction
              const { timestamp: currTimestamp } = currTransaction
              expect(currTimestamp).toBeLessThanOrEqual(prevTimestamp)
            }

            return currTransaction
          }, undefined)

          const { transactions: secondPage } = await TransactionServiceClient.getTransactions({
            after: firstCursor.afterCursor ?? undefined,
            order: {
              column: 'timestamp',
              direction: 'DESC'
            }
          })

          secondPage.reduce<TransactionDomainModel | undefined>((prevTransaction, currTransaction) => {
            if (prevTransaction) {
              const { timestamp: prevTimestamp } = prevTransaction
              const { timestamp: currTimestamp } = currTransaction
              expect(currTimestamp).toBeLessThanOrEqual(prevTimestamp)
            }

            return currTransaction
          }, undefined)
        })

        it('Get Bulk Transactions with search string on receipt json', async () => {
          const limit = 5
          const provider_id = uuid()
          const violation_id = uuid()

          const transactionsToPersist = [
            ...transactionsGenerator(5, {
              provider_id,
              receipt_details: { violation_id, trip_id: null, policy_id: uuid() }
            })
          ] // Arbitrarily generate 5 events
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          // Partial matching on violation id
          const { transactions: matchingPages } = await TransactionServiceClient.getTransactions({
            limit,
            search_text: violation_id
          })
          expect(matchingPages.length).toEqual(limit) // all results match

          // Search for a non-existent value
          const { transactions: redPages } = await TransactionServiceClient.getTransactions({
            limit,
            search_text: 'red'
          })
          expect(redPages.length).toEqual(0) // no results are color:red
        })

        it('Get Bulk Transactions with search on fee_type, amount', async () => {
          const limit = 5
          const provider_id = uuid()

          // Arbitrarily generate 5 events
          await TransactionServiceClient.createTransactions([
            ...transactionsGenerator(5, {
              provider_id,
              receipt_details: { custom_description: `color: 'Red'` },
              amount: 125
            })
          ])

          // Partial matching on string-value 'color', amount > 100 and amount < 200
          const { transactions: cheapRedPages } = await TransactionServiceClient.getTransactions({
            limit,
            search_text: 'color',
            start_amount: 100,
            end_amount: 200
          })
          expect(cheapRedPages.length).toEqual(limit) // all results have 'color' in them

          // Partial matching on string-value 'red', amount > 200 and amount < 300
          const { transactions: expensiveRedPages } = await TransactionServiceClient.getTransactions({
            limit,
            search_text: 'color',
            start_amount: 200,
            end_amount: 300
          })
          expect(expensiveRedPages.length).toEqual(0) // no results between 200 and 300
        })
      })

      describe('Failure', () => {
        it('Verify that asking for too many items will fail (i.e. is AJV doing its job)', async () => {
          await expect(TransactionServiceClient.getTransactions({ limit: 10000 })).rejects.toMatchObject({
            type: 'ValidationError'
          })
        })

        it('Verify that asking for missing transaction will fail', async () => {
          const [transaction] = transactionsGenerator(1)
          if (!transaction) {
            throw new Error('No sample transaction found') // unexpected to ever happen
          }
          await expect(TransactionServiceClient.getTransaction(transaction.transaction_id)).rejects.toMatchObject({
            type: 'NotFoundError'
          })
        })
        it('Get All Transactions with bogus provider search', async () => {
          const { transactions } = await TransactionServiceClient.getTransactions({
            provider_id: uuid()
          })
          expect(transactions.length).toEqual(0)
        })
      })
    })
  })

  afterAll(async () => {
    await Promise.all([
      TransactionRepository.deleteAllTransactions(),
      TransactionRepository.deleteAllTransactionOperations(),
      TransactionRepository.deleteAllTransactionStatuses()
    ])
    await TransactionServer.stop()
  })
})
