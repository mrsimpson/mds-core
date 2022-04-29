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
import { TransactionRepository } from '../repository'
import { TransactionServiceManager } from '../service/manager'
import { TransactionStreamKafka } from '../service/stream'
import { transactionsGenerator } from '../test-fixtures'

describe('Transaction Repository Migration Tests', () => {
  beforeAll(TransactionRepository.initialize)
  it('Run Migrations', TransactionRepository.runAllMigrations)
  it('Revert Migrations', TransactionRepository.revertAllMigrations)
  afterAll(TransactionRepository.shutdown)
})

const TransactionServer = TransactionServiceManager.controller()

const mockStream = stream.mockStream(TransactionStreamKafka)

describe('Transaction Repository Tests', () => {
  beforeAll(async () => {
    await TransactionServer.start()
  })

  /**
   * Clear DB after each test runs, and after the file is finished. No side-effects for you.
   */
  beforeEach(async () => {
    await TransactionRepository.truncateAllTables()
  })

  afterEach(async () => {
    mockStream.write.mockReset()
  })

  describe('Transaction Tests', () => {
    describe('Transaction Creation Tests', () => {
      it('Successfully writes huge bulk transactions with a good chunk size', async () => {
        const bulkyNum = 10000
        jest.resetModules()
        process.env.TRANSACTION_BULK_DB_WRITE_CHUNK_SIZE = '400'
        const { TransactionRepository: repository } = await import('../repository')
        await expect(
          repository.createTransactions([...transactionsGenerator(bulkyNum)], {})
        ).resolves.not.toThrowError()
      })

      it('Fails to write huge bulk transactions with a bad chunk size', async () => {
        jest.resetModules()
        process.env.TRANSACTION_BULK_DB_WRITE_CHUNK_SIZE = '1000000000'
        const { TransactionRepository: repository } = await import('../repository')
        await expect(repository.createTransactions([...transactionsGenerator(10000)], {})).rejects.toThrowError()
      })
    })
  })

  afterAll(async () => {
    await TransactionRepository.truncateAllTables()
    await TransactionServer.stop()
  })
})
