import { Optional } from '@mds-core/mds-types'
import { RecordedColumn, IdentityColumn, ModelMapper } from '@mds-core/mds-repository'
import { ComplianceResponseEntityModel } from './entities/compliance-response-entity'
import { ComplianceResponseDomainModel, ComplianceResponseDomainCreateModel } from '../../../@types'

export const ComplianceResponseEntityToDomain = ModelMapper<
  ComplianceResponseEntityModel,
  ComplianceResponseDomainModel
>((entity, options) => {
  const { id, recorded, ...domain } = entity
  return domain
})

type ComplianceResponseEntityCreateModel = Omit<
  Optional<ComplianceResponseEntityModel, keyof RecordedColumn>,
  keyof IdentityColumn
>

export const ComplianceResponseDomainToEntityCreate = ModelMapper<
  ComplianceResponseDomainCreateModel,
  ComplianceResponseEntityCreateModel
>((domain, options) => {
  return domain
})
