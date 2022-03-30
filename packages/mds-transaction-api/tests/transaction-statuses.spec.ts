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

import { ApiServer } from '@mds-core/mds-api-server'
import type { TransactionStatusDomainModel } from '@mds-core/mds-transaction-service'
import { TransactionServiceClient, transactionStatusesGenerator } from '@mds-core/mds-transaction-service'
import type { UUID } from '@mds-core/mds-types'
import { hasAtLeastOneEntry, pathPrefix, uuid } from '@mds-core/mds-utils'
import supertest from 'supertest'
import { api } from '../api'

const request = supertest(ApiServer(api))

// FIXME: Should be importing from @mds-core/mds-test-data, but that's resulting an OOM crash...
const SCOPED_AUTH = (scopes: string[], principalId = '5f7114d1-4091-46ee-b492-e55875f7de00') =>
  `basic ${Buffer.from(`${principalId}|${scopes.join(' ')}`).toString('base64')}`

describe('Test Transactions API: Transactions', () => {
  beforeAll(async () => {
    jest.clearAllMocks()
  })

  describe('Success', () => {
    it('Can POST a transaction status', async () => {
      const [status] = transactionStatusesGenerator()
      if (!status) {
        throw new Error('No status to test')
      }
      const { transaction_id } = status

      jest.spyOn(TransactionServiceClient, 'setTransactionStatus').mockImplementationOnce(async t => t)

      const result = await request
        .post(pathPrefix(`/transaction/${transaction_id}/statuses`))
        .set('Authorization', SCOPED_AUTH(['transactions:write']))
        .send(status)

      expect(result.status).toStrictEqual(201)
    })

    it('Can GET transaction statuses', async () => {
      const mockStatuses = [...transactionStatusesGenerator(5)]
      if (!hasAtLeastOneEntry(mockStatuses)) {
        throw new Error('No statuses to test')
      }
      const [{ transaction_id }] = mockStatuses

      jest.spyOn(TransactionServiceClient, 'getTransactionStatuses').mockImplementationOnce(async _ => mockStatuses)

      const result = await request
        .get(pathPrefix(`/transactions/${transaction_id}/statuses`))
        .set('Authorization', SCOPED_AUTH(['transactions:read']))

      expect(result.status).toStrictEqual(200)
      expect(result.body.statuses).toStrictEqual(mockStatuses)
    })

    it('Can GET transactions statuses', async () => {
      const transaction_ids = Array.from({ length: 10 }, uuid)

      const mockStatuses = transaction_ids.reduce<Record<UUID, TransactionStatusDomainModel[]>>(
        (acc, transaction_id) => ({ ...acc, [transaction_id]: [...transactionStatusesGenerator(3, transaction_id)] }),
        {}
      )

      jest.spyOn(TransactionServiceClient, 'getTransactionsStatuses').mockImplementationOnce(async _ => mockStatuses)

      const result = await request
        .get(
          pathPrefix(
            `/transactions/statuses?transaction_id=${transaction_ids
              .reduce((acc, transaction_id) => acc.concat(`transaction_id=${transaction_id}&`), '')
              .slice(0, -1)}`
          )
        )
        .set('Authorization', SCOPED_AUTH(['transactions:read']))

      expect(result.status).toStrictEqual(200)
      expect(result.body.statuses).toStrictEqual(mockStatuses)
    })
  })

  describe('Failure', () => {
    it('Cannot GET transactions statuses without valid transaction_ids', async () => {
      const result = await request
        .get(pathPrefix(`/transactions/statuses?transaction_id=potato&transaction_id=coolerPotato`))
        .set('Authorization', SCOPED_AUTH(['transactions:read']))

      expect(result.status).toStrictEqual(400)
    })
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })
})
