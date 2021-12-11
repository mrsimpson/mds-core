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

import { RpcClient, RpcRequest, RpcRequestOptions } from '@mds-core/mds-rpc-common'
import { ServiceClient } from '@mds-core/mds-service-helpers'
import { GeographyService, GeographyServiceDefinition } from '../@types'

const GeographyServiceRpcClient = RpcClient(GeographyServiceDefinition, {
  host: process.env.GEOGRAPHY_SERVICE_RPC_HOST,
  port: process.env.GEOGRAPHY_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const GeographyServiceClientFactory = (options: RpcRequestOptions = {}): ServiceClient<GeographyService> => ({
  getGeography: (...args) => RpcRequest(options, GeographyServiceRpcClient.getGeography, args),
  getGeographies: (...args) => RpcRequest(options, GeographyServiceRpcClient.getGeographies, args),
  getUnpublishedGeographies: (...args) =>
    RpcRequest(options, GeographyServiceRpcClient.getUnpublishedGeographies, args),
  getPublishedGeographies: (...args) => RpcRequest(options, GeographyServiceRpcClient.getPublishedGeographies, args),
  writeGeographies: (...args) => RpcRequest(options, GeographyServiceRpcClient.writeGeographies, args),
  writeGeographiesMetadata: (...args) => RpcRequest(options, GeographyServiceRpcClient.writeGeographiesMetadata, args),
  editGeography: (...args) => RpcRequest(options, GeographyServiceRpcClient.editGeography, args),
  publishGeography: (...args) => RpcRequest(options, GeographyServiceRpcClient.publishGeography, args),
  getGeographiesByIds: (...args) => RpcRequest(options, GeographyServiceRpcClient.getGeographiesByIds, args)
})

export const GeographyServiceClient = GeographyServiceClientFactory()
