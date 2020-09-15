import { Optional } from '@mds-core/mds-types'
import { RecordedColumn, IdentityColumn, ModelMapper } from '@mds-core/mds-repository'
import { ComplianceResponsePersistenceModel } from './entities/compliance-response-entity'
import { ComplianceResponseDomainModel, ComplianceResponseDomainCreateModel } from '../../../@types'

export const ComplianceResponsePersistenceToDomain = ModelMapper<
  ComplianceResponsePersistenceModel,
  ComplianceResponseDomainModel
>((entity, options) => {
  const { id, recorded, ...domain } = entity
  return domain
})

type ComplianceResponsePersistenceCreateModel = Omit<
  Optional<ComplianceResponsePersistenceModel, keyof RecordedColumn>,
  keyof IdentityColumn
>

export const ComplianceResponseDomainToEntityCreate = ModelMapper<
  ComplianceResponseDomainCreateModel,
  ComplianceResponsePersistenceCreateModel
>((domain, options) => {
  return domain
})
