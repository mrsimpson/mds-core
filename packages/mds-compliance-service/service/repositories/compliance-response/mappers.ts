import { Optional } from '@mds-core/mds-types'
import { RecordedColumn, IdentityColumn, ModelMapper } from '@mds-core/mds-repository'
import { ComplianceResponseEntityModel } from './entities/compliance-response-entity'
import { ComplianceResponseDomainModel } from '../../../@types'

type MapComplianceResponseEntityToDomainModelOptions = Partial<{}>

const ComplianceResponseEntityToDomain = ModelMapper<ComplianceResponseEntityModel, ComplianceResponseDomainModel>(
  (entity, options) => {
    const { id, recorded, ...domain } = entity
    return domain
  }
)

/*
export const ComplianceResponseEntityToDomainModel = {
  map: ComplianceResponseEntityToDomain,
  mapper: (options: MapComplianceResponseEntityToDomainModelOptions = {}) => (model: ComplianceResponseEntityModel) =>
    MapComplianceResponseEntityToDomainModel(model)
}

type ComplianceResponseDomainToEntityCreateModel = Omit<
  Optional<ComplianceResponseEntityModel, keyof RecordedColumn>,
  keyof IdentityColumn
>

export const ComplianceResponseDomainToEntityCreate = ModelMapper<
  ComplianceResponseDomainModel,
  ComplianceResponseDomainToEntityCreateModel
>(domain => {
  // Re-inflate (nest) GPS field
  const { telemetry, ...rest } = domain
  const gps = telemetry
    ? telemetry.gps
    : {
        lat: null,
        lng: null,
        speed: null,
        heading: null,
        hdop: null,
        altitude: null,
        satellites: null
      }
  const entity = {
    ...rest,
    ...gps
  }
  return entity
})
*/
