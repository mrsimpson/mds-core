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
import { TransactionService, TransactionServiceDefinition } from '../@types'

const TransactionServiceRpcClient = RpcClient(TransactionServiceDefinition, {
  host: process.env.TRANSACTION_SERVICE_RPC_HOST,
  port: process.env.TRANSACTION_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const TransactionServiceClientFactory = (
  options: RpcRequestOptions = {}
): ServiceClient<TransactionService> => ({
  createTransaction: (...args) => RpcRequestWithOptions(options, TransactionServiceRpcClient.createTransaction, args),
  createTransactions: (...args) => RpcRequestWithOptions(options, TransactionServiceRpcClient.createTransactions, args),
  getTransaction: (...args) => RpcRequestWithOptions(options, TransactionServiceRpcClient.getTransaction, args),
  getTransactions: (...args) => RpcRequestWithOptions(options, TransactionServiceRpcClient.getTransactions, args),
  addTransactionOperation: (...args) =>
    RpcRequestWithOptions(options, TransactionServiceRpcClient.addTransactionOperation, args),
  getTransactionOperations: (...args) =>
    RpcRequestWithOptions(options, TransactionServiceRpcClient.getTransactionOperations, args),
  setTransactionStatus: (...args) =>
    RpcRequestWithOptions(options, TransactionServiceRpcClient.setTransactionStatus, args),
  getTransactionsStatuses: (...args) =>
    RpcRequestWithOptions(options, TransactionServiceRpcClient.getTransactionsStatuses, args),
  getTransactionStatuses: (...args) =>
    RpcRequestWithOptions(options, TransactionServiceRpcClient.getTransactionStatuses, args)
})

export const TransactionServiceClient = TransactionServiceClientFactory()
