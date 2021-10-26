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

import { RpcClient, RpcRequestOptions, RpcRequestWithOptions } from '@mds-core/mds-rpc-common'
import { ServiceClient } from '@mds-core/mds-service-helpers'
import {
  CollectorMessageDomainModel,
  CollectorSchemaDomainModel,
  CollectorService,
  CollectorServiceRpcDefinition
} from '../@types'

const CollectorServiceRpcClient = RpcClient(CollectorServiceRpcDefinition, {
  host: process.env.COLLECTOR_BACKEND_RPC_HOST,
  port: process.env.COLLECTOR_BACKEND_RPC_PORT
})

export const CollectorServiceClientFactory = (options: RpcRequestOptions = {}): ServiceClient<CollectorService> => ({
  registerMessageSchema: (...args) =>
    RpcRequestWithOptions(options, CollectorServiceRpcClient.registerMessageSchema, args),
  getMessageSchema: (...args) => RpcRequestWithOptions(options, CollectorServiceRpcClient.getMessageSchema, args),
  writeSchemaMessages: (...args) => RpcRequestWithOptions(options, CollectorServiceRpcClient.writeSchemaMessages, args)
})

export const CollectorServiceClient = CollectorServiceClientFactory()

export const CollectorServiceSchemaClient = (
  schema_id: CollectorSchemaDomainModel['schema_id'],
  schema: CollectorSchemaDomainModel['schema'],
  options: RpcRequestOptions = {}
) => {
  return {
    registerMessageSchema: () =>
      RpcRequestWithOptions(options, CollectorServiceRpcClient.registerMessageSchema, [schema_id, schema]),
    getMessageSchema: () => RpcRequestWithOptions(options, CollectorServiceRpcClient.getMessageSchema, [schema_id]),
    writeSchemaMessages: (
      provider_id: CollectorMessageDomainModel['provider_id'],
      messages: Array<CollectorMessageDomainModel['message']>
    ) =>
      RpcRequestWithOptions(options, CollectorServiceRpcClient.writeSchemaMessages, [schema_id, provider_id, messages])
  }
}

export type CollectorServiceSchemaClient = ReturnType<typeof CollectorServiceSchemaClient>
