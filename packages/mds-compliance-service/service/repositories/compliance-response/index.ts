import { InsertReturning, RepositoryError, ReadWriteRepository, UpdateReturning } from '@mds-core/mds-repository'
import { ComplianceResponseDomainModel } from '../../../@types'
import { ComplianceResponseEntity } from './entities'
import * as migrations from './migrations'
import { ComplianceResponseEntityToDomain } from './mappers'
/*
import { EventDomainModel, GetEventQuery, DeviceSessions } from '../../../@types'
import { EventEntityToDomainModel, EventDomainToEntityCreate } from './mappers'
import { buildDeviceSessionsFromCache, getStoppedDeviceSessions } from '../../cache/helpers'
*/

class ComplianceResponseReadWriteRepository extends ReadWriteRepository {
  constructor() {
    super('compliance_response', {
      entities: [ComplianceResponseEntity],
      migrations: Object.values(migrations)
    })
  }

  public writeComplianceResponse = async (
    compliance_response: ComplianceResponseDomainModel
  ): Promise<ComplianceResponseDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const {
        raw: [entity]
      }: InsertReturning<ComplianceResponseEntity> = await connection
        .getRepository(ComplianceResponseEntity)
        .createQueryBuilder()
        .insert()
        .values([compliance_response])
        .returning('*')
        .execute()
      return ComplianceResponseEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }
}

export const ComplianceResponseRepository = new ComplianceResponseReadWriteRepository()
