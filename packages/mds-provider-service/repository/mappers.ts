import type { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { ModelMapper } from '@mds-core/mds-repository'
import type { Optional, Timestamp } from '@mds-core/mds-types'
import type { ProviderDomainCreateModel, ProviderDomainModel } from '../@types'
import type { ProviderEntityModel } from './entities/provider-entity'

type ProviderEntityToDomainOptions = Partial<{}>

export const ProviderEntityToDomain = ModelMapper<
  ProviderEntityModel,
  ProviderDomainModel,
  ProviderEntityToDomainOptions
>((entity, options) => {
  const { id, recorded, ...domain } = entity
  return domain
})

type ProviderEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type ProviderEntityCreateModel = Omit<Optional<ProviderEntityModel, keyof RecordedColumn>, keyof IdentityColumn>

export const ProviderDomainToEntityCreate = ModelMapper<
  ProviderDomainCreateModel,
  ProviderEntityCreateModel,
  ProviderEntityCreateOptions
>((domain, options) => {
  const { recorded } = options ?? {}
  return { ...{ url: null, mds_api_url: null, gbfs_api_url: null, color_code_hex: null }, recorded, ...domain }
})
