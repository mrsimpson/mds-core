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

import type { RpcRequestOptions } from '@mds-core/mds-rpc-common'
import { RpcClient, RpcRequest } from '@mds-core/mds-rpc-common'
import type { ServiceClient } from '@mds-core/mds-service-helpers'
import type { AuditService, AuditServiceRequestContext } from '../@types'
import { AuditServiceDefinition } from '../@types'

// What the API layer, and any other clients, will invoke.
export const AuditServiceClientFactory = (
  context: AuditServiceRequestContext,
  options: RpcRequestOptions = {}
): ServiceClient<AuditService> => {
  const AuditServiceRpcClient = RpcClient(AuditServiceDefinition, {
    context,
    host: process.env.AUDIT_SERVICE_RPC_HOST,
    port: process.env.AUDIT_SERVICE_RPC_PORT
  })
  return {
    name: (...args) => RpcRequest(options, AuditServiceRpcClient.name, args)
  }
}

export const AuditServiceClient = AuditServiceClientFactory({})
