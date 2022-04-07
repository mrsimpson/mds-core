import type { RpcRequestOptions } from '@mds-core/mds-rpc-common'
import { RpcClient, RpcRequest } from '@mds-core/mds-rpc-common'
import type { ServiceClient } from '@mds-core/mds-service-helpers'
import type { ProviderService, ProviderServiceRequestContext } from '../@types'
import { ProviderServiceDefinition } from '../@types'

// What the API layer, and any other clients, will invoke.
export const ProviderServiceClientFactory = (
  context: ProviderServiceRequestContext,
  options: RpcRequestOptions = {}
): ServiceClient<ProviderService> => {
  const ProviderServiceRpcClient = RpcClient(ProviderServiceDefinition, {
    context,
    host: process.env.MDS_PROVIDER_SERVICE_RPC_HOST,
    port: process.env.MDS_PROVIDER_SERVICE_RPC_PORT
  })

  return {
    getProvider: (...args) => RpcRequest(options, ProviderServiceRpcClient.getProvider, args),
    getProviders: (...args) => RpcRequest(options, ProviderServiceRpcClient.getProviders, args),
    createProvider: (...args) => RpcRequest(options, ProviderServiceRpcClient.createProvider, args),
    createProviders: (...args) => RpcRequest(options, ProviderServiceRpcClient.createProviders, args),
    deleteProvider: (...args) => RpcRequest(options, ProviderServiceRpcClient.deleteProvider, args),
    updateProvider: (...args) => RpcRequest(options, ProviderServiceRpcClient.updateProvider, args)
  }
}

export const ProviderServiceClient = ProviderServiceClientFactory({})
