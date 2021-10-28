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

import { ServiceClient, ServiceError, ServiceResult } from '@mds-core/mds-service-helpers'
import test from 'unit.js'
import { RpcServiceDefinition } from '../@types'
import { RpcClient, RpcRequest, RpcRequestOptions } from '../client'
import { RpcRoute } from '../index'
import { RpcServer } from '../server'

const TEST_WORD = 'mds-rpc-common'

interface TestService {
  length: (word?: string) => number
}

export const TestServiceRpcDefinition: RpcServiceDefinition<TestService> = {
  length: RpcRoute<TestService['length']>()
}

const TestServer = RpcServer(
  TestServiceRpcDefinition,
  {
    onStart: async () => undefined,
    onStop: async () => undefined
  },
  {
    length: async ([word]) =>
      word && word.length > 0 ? ServiceResult(word.length) : ServiceError({ type: 'NotFoundError', message: 'No Word' })
  },
  { repl: { context: {} } }
).controller()

const TestClient = (options: RpcRequestOptions = {}): ServiceClient<TestService> => ({
  length: word => RpcRequest(options, RpcClient(TestServiceRpcDefinition).length, [word])
})

describe('Test RPC Client', () => {
  describe('Test Service Unavailable', () => {
    it('No Retries', async () => {
      await expect(TestClient({ retries: false }).length(TEST_WORD)).rejects.toMatchObject({
        isServiceError: true,
        type: 'ServiceUnavailable'
      })
    })

    it('With Retries', async () => {
      await expect(TestClient({ retries: 5, backoff: 10 }).length(TEST_WORD)).rejects.toMatchObject({
        isServiceError: true,
        type: 'ServiceUnavailable'
      })
    })
  })

  describe('Test Service Available', () => {
    beforeAll(async () => {
      await TestServer.start()
    })

    it('Test Service Result', async () => {
      test.value(await TestClient().length(TEST_WORD)).is(TEST_WORD.length)
    })

    it('Test Service Error', async () => {
      await expect(TestClient().length()).rejects.toMatchObject({
        isServiceError: true,
        type: 'NotFoundError'
      })
    })

    afterAll(async () => {
      await TestServer.stop()
    })
  })
})
