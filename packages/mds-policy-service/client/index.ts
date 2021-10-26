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

import { RpcClient, RpcRequestOptions, RpcRequestWithOptions } from '@mds-core/mds-rpc-common'
import { ServiceClient } from '@mds-core/mds-service-helpers'
import { PolicyService, PolicyServiceDefinition } from '../@types'

const PolicyServiceRpcClient = RpcClient(PolicyServiceDefinition, {
  host: process.env.POLICY_SERVICE_RPC_HOST,
  port: process.env.POLICY_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const PolicyServiceClientFactory = (options: RpcRequestOptions = {}): ServiceClient<PolicyService> => ({
  name: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.name, args),
  writePolicy: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.writePolicy, args),
  readPolicies: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.readPolicies, args),
  readActivePolicies: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.readActivePolicies, args),
  deletePolicy: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.deletePolicy, args),
  editPolicy: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.editPolicy, args),
  publishPolicy: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.publishPolicy, args),
  readBulkPolicyMetadata: (...args) =>
    RpcRequestWithOptions(options, PolicyServiceRpcClient.readBulkPolicyMetadata, args),
  readPolicy: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.readPolicy, args),
  readSinglePolicyMetadata: (...args) =>
    RpcRequestWithOptions(options, PolicyServiceRpcClient.readSinglePolicyMetadata, args),
  updatePolicyMetadata: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.updatePolicyMetadata, args),
  writePolicyMetadata: (...args) => RpcRequestWithOptions(options, PolicyServiceRpcClient.writePolicyMetadata, args)
})

export const PolicyServiceClient = PolicyServiceClientFactory()
