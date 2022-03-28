// Copyright 2021 City of Los Angeles
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { TestSchema } from '@mds-core/mds-schema-validators'
import { uuid } from '@mds-core/mds-utils'
import { CollectorServiceClient } from '../client'
import { CollectorRepository } from '../repository'
import { CollectorServiceManager } from '../service/manager'

const CollectorService = CollectorServiceManager.controller()
const TEST_SCHEMA_ID = 'test'
const TEST_COLLECTOR_MESSAGES: Array<TestSchema> = [
  { id: uuid(), name: 'President', country: 'US', zip: '37188' },
  { id: uuid(), name: 'Prime Minister', country: 'CA', zip: 'K1M 1M4' }
]

describe('Collector Repository Tests', () => {
  beforeAll(CollectorRepository.initialize)
  it('Run Migrations', CollectorRepository.runAllMigrations)
  it('Revert Migrations', CollectorRepository.revertAllMigrations)
  afterAll(CollectorRepository.shutdown)
})

describe('Collector Service', () => {
  it('Service Unavailable', async () => {
    await expect(CollectorServiceClient.getMessageSchema(TEST_SCHEMA_ID)).rejects.toMatchObject({
      isServiceError: true,
      type: 'ServiceUnavailable'
    })
  })

  describe('Service Methods', () => {
    beforeAll(async () => {
      await CollectorService.start()
    })

    it('Register Schema (OK)', async () => {
      await expect(CollectorServiceClient.registerMessageSchema(TEST_SCHEMA_ID, TestSchema)).resolves.toEqual(true)
    })

    it('Register Schema (Error)', async () => {
      await expect(
        CollectorServiceClient.registerMessageSchema(TEST_SCHEMA_ID, { type: 'invalid' })
      ).rejects.toMatchObject({ isServiceError: true, type: 'ServiceException' })
    })

    it('Get Schema (OK)', async () => {
      const schema = await CollectorServiceClient.getMessageSchema(TEST_SCHEMA_ID)
      expect(schema).toMatchObject({ $schema: 'http://json-schema.org/draft-07/schema#', ...TestSchema })
    })

    it('Get Schema (Invalid schema_id)', async () => {
      await expect(CollectorServiceClient.getMessageSchema('invalid')).rejects.toMatchObject({
        isServiceError: true,
        type: 'NotFoundError'
      })
    })

    it('Write Schema Messages (OK)', async () => {
      const provider_id = uuid()
      const written = await CollectorServiceClient.writeSchemaMessages(
        TEST_SCHEMA_ID,
        provider_id,
        TEST_COLLECTOR_MESSAGES
      )
      expect(written).toMatchObject(
        TEST_COLLECTOR_MESSAGES.map(message => ({ schema_id: TEST_SCHEMA_ID, provider_id, message }))
      )
    })

    it('Write Schema Messages (Invalid schema_id)', async () => {
      await expect(
        CollectorServiceClient.writeSchemaMessages('invalid', uuid(), TEST_COLLECTOR_MESSAGES)
      ).rejects.toMatchObject({
        isServiceError: true,
        type: 'NotFoundError'
      })
    })

    it('Write Schema Messages (Invalid provider_id)', async () => {
      await expect(
        CollectorServiceClient.writeSchemaMessages(TEST_SCHEMA_ID, 'invalid', TEST_COLLECTOR_MESSAGES)
      ).rejects.toMatchObject({
        isServiceError: true,
        type: 'ValidationError'
      })
    })

    it('Write Schema Messages (Invalid message)', async () => {
      const [message] = TEST_COLLECTOR_MESSAGES
      await expect(
        CollectorServiceClient.writeSchemaMessages(TEST_SCHEMA_ID, uuid(), [{ ...message, email: 'invalid' }])
      ).rejects.toMatchObject({
        isServiceError: true,
        type: 'ValidationError'
      })
    })

    afterAll(async () => {
      await CollectorService.stop()
    })
  })
})
