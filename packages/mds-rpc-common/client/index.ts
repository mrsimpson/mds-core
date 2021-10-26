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

import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport'
import { ClientRpcError } from '@lacuna-tech/rpc_ts/lib/client/errors'
import { ModuleRpcProtocolClient } from '@lacuna-tech/rpc_ts/lib/protocol/client'
import { ModuleRpcProtocolGrpcWebCommon } from '@lacuna-tech/rpc_ts/lib/protocol/grpc_web/common'
import { isServiceError, ServiceError, ServiceResponse } from '@mds-core/mds-service-helpers'
import { AnyFunction } from '@mds-core/mds-types'
import { seconds } from '@mds-core/mds-utils'
import { RpcServiceDefinition, RPC_HOST, RPC_PORT } from '../@types'
import { RpcCommonLogger } from '../logger'

export interface RpcClientOptions {
  host: string
  port: string | number
}

export const RpcClient = <S>(definition: RpcServiceDefinition<S>, options: Partial<RpcClientOptions> = {}) => {
  const host = options.host || process.env.RPC_HOST || RPC_HOST
  const port = Number(options.port || process.env.RPC_PORT || RPC_PORT)

  return ModuleRpcProtocolClient.getRpcClient(definition, {
    getGrpcWebTransport: NodeHttpTransport(),
    remoteAddress: `${host}:${port}`,
    codec: new ModuleRpcProtocolGrpcWebCommon.GrpcWebJsonWithGzipCodec()
  })
}

const RpcClientError = (error: {}) =>
  ServiceError(
    error instanceof ClientRpcError
      ? {
          type: error.errorType === 'unavailable' ? 'ServiceUnavailable' : 'ServiceException',
          message: error.msg ?? error.name,
          details: error.errorType
        }
      : {
          type: 'ServiceException',
          message: error instanceof Error ? error.message : error.toString()
        }
  ).error

// eslint-reason type inference requires any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcMethod<R = any> = AnyFunction<Promise<ServiceResponse<R>>>
type RpcRequestType<M extends RpcMethod> = Parameters<M>
type RpcResponseType<M extends RpcMethod> = ReturnType<M> extends Promise<ServiceResponse<infer R>> ? R : never

const RpcResponse = async <M extends RpcMethod>(
  request: M,
  ...args: RpcRequestType<M>
): Promise<ServiceResponse<RpcResponseType<M>>> => {
  try {
    const response = await request(...args)
    return response
  } catch (error) {
    throw RpcClientError(error)
  }
}

export type RpcRequestOptions = Partial<{
  retries: number | boolean
  backoff: number
}>

// By default, allow up to 5 retries with a 5s backoff.
const RpcRequestManager = async <M extends RpcMethod>(
  { retries = 5, backoff = seconds(5) }: RpcRequestOptions,
  request: M,
  ...args: RpcRequestType<M>
): Promise<ServiceResponse<RpcResponseType<M>>> => {
  try {
    const response = await RpcResponse(request, ...args)
    return response
  } catch (error) {
    if (isServiceError(error, 'ServiceUnavailable')) {
      if (typeof retries === 'number' ? retries > 0 : retries) {
        RpcCommonLogger.debug(
          `RPC Service is unavailable. Retrying in ${backoff}ms.${
            typeof retries === 'number' ? ` Retries remaining: ${retries}` : ''
          }`
        )
        await new Promise(resolve => setTimeout(resolve, backoff))
        return RpcRequestManager(
          { retries: typeof retries === 'number' ? --retries : retries, backoff },
          request,
          ...args
        )
      }
    }
    throw error
  }
}

// Make an RPC request using the specified options
export const RpcRequestWithOptions = async <M extends RpcMethod>(
  options: RpcRequestOptions,
  request: M,
  ...args: RpcRequestType<M>
): Promise<RpcResponseType<M>> => {
  const requestStartTime = Date.now()
  try {
    const response = await RpcRequestManager(options, request, ...args)
    if (response.error) {
      throw response.error
    }
    return response.result
  } finally {
    RpcCommonLogger.debug(`RPC request performance`, { duration: Date.now() - requestStartTime })
  }
}

// Make an RPC request using default options
export const RpcRequest = async <M extends RpcMethod>(
  request: M,
  ...args: RpcRequestType<M>
): Promise<RpcResponseType<M>> => RpcRequestWithOptions({}, request, ...args)
