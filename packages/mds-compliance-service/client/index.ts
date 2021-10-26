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
import { ComplianceService, ComplianceServiceDefinition } from '../@types'

const ComplianceServiceRpcClient = RpcClient(ComplianceServiceDefinition, {
  host: process.env.COMPLIANCE_SERVICE_RPC_HOST,
  port: process.env.COMPLIANCE_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const ComplianceServiceClientFactory = (options: RpcRequestOptions = {}): ServiceClient<ComplianceService> => ({
  getComplianceSnapshot: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.getComplianceSnapshot, args),
  getComplianceSnapshotsByTimeInterval: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.getComplianceSnapshotsByTimeInterval, args),
  getComplianceSnapshotsByIDs: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.getComplianceSnapshotsByIDs, args),
  createComplianceSnapshot: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.createComplianceSnapshot, args),
  createComplianceSnapshots: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.createComplianceSnapshots, args),
  getComplianceViolationPeriods: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.getComplianceViolationPeriods, args),
  getComplianceViolation: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.getComplianceViolation, args),
  getComplianceViolationsByTimeInterval: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.getComplianceViolationsByTimeInterval, args),
  createComplianceViolation: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.createComplianceViolation, args),
  createComplianceViolations: (...args) =>
    RpcRequestWithOptions(options, ComplianceServiceRpcClient.createComplianceViolations, args)
})

export const ComplianceServiceClient = ComplianceServiceClientFactory()
