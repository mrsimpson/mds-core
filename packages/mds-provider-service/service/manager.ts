import { RpcServer } from '@mds-core/mds-rpc-common'
import type { ProviderService, ProviderServiceRequestContext } from '../@types'
import { ProviderServiceDefinition } from '../@types'
import { ProviderServiceClient } from '../client'
import { ProviderServiceProvider } from './provider'

export const ProviderServiceManager = RpcServer<ProviderService, ProviderServiceRequestContext>(
  ProviderServiceDefinition,
  {
    onStart: ProviderServiceProvider.start,
    onStop: ProviderServiceProvider.stop
  },
  {
    createProvider: (args, context) => ProviderServiceProvider.createProvider(context, ...args),
    createProviders: (args, context) => ProviderServiceProvider.createProviders(context, ...args),
    getProvider: (args, context) => ProviderServiceProvider.getProvider(context, ...args),
    getProviders: (args, context) => ProviderServiceProvider.getProviders(context, ...args),
    updateProvider: (args, context) => ProviderServiceProvider.updateProvider(context, ...args),
    deleteProvider: (args, context) => ProviderServiceProvider.deleteProvider(context, ...args)
  },
  {
    port: process.env.MDS_PROVIDER_SERVICE_RPC_PORT,
    repl: {
      port: process.env.MDS_PROVIDER_SERVICE_REPL_PORT,
      context: { client: ProviderServiceClient }
    }
  }
)
