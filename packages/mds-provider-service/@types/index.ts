import type { DomainModelCreate } from '@mds-core/mds-repository'
import type { RpcEmptyRequestContext, RpcServiceDefinition } from '@mds-core/mds-rpc-common'
import { RpcRoute } from '@mds-core/mds-rpc-common'
import type { Nullable, UUID } from '@mds-core/mds-types'

export const PROVIDER_TYPES = ['mds_micromobility', 'gbfs_micromobility'] as const
export type PROVIDER_TYPE = typeof PROVIDER_TYPES[number]
export interface ProviderDomainModel {
  provider_id: UUID
  provider_name: string
  url: Nullable<string>
  mds_api_url: Nullable<string>
  gbfs_api_url: Nullable<string>
  color_code_hex: Nullable<string>
  provider_types: PROVIDER_TYPE[]
}

export type ProviderDomainCreateModel = DomainModelCreate<ProviderDomainModel>
export type GetProvidersOptions = Partial<{ provider_types: PROVIDER_TYPE[] }>

export interface ProviderService {
  createProviders: (mdsProviders: ProviderDomainCreateModel[]) => ProviderDomainModel[]
  createProvider: (mdsProvider: ProviderDomainCreateModel) => ProviderDomainModel
  getProviders: (options?: GetProvidersOptions) => ProviderDomainModel[]
  getProvider: (provider_id: UUID) => ProviderDomainModel
  updateProvider: (mdsProvider: ProviderDomainModel) => ProviderDomainModel
  deleteProvider: (provider_id: UUID) => ProviderDomainModel['provider_id']
}

export const ProviderServiceDefinition: RpcServiceDefinition<ProviderService> = {
  createProviders: RpcRoute<ProviderService['createProviders']>(),
  createProvider: RpcRoute<ProviderService['createProvider']>(),
  getProviders: RpcRoute<ProviderService['getProviders']>(),
  getProvider: RpcRoute<ProviderService['getProvider']>(),
  updateProvider: RpcRoute<ProviderService['updateProvider']>(),
  deleteProvider: RpcRoute<ProviderService['deleteProvider']>()
}

export type ProviderServiceRequestContext = RpcEmptyRequestContext
