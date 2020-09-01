import { InsertReturning, RepositoryError, ReadWriteRepository, UpdateReturning } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { Nullable } from '@mds-core/mds-types'
import { ComplianceResponseDomainModel } from '@mds-core/mds-compliance-service'
import { ComplianceResponseEntity } from './entities'
import * as migrations from './migrations'
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

  public createComplianceResponse = async (
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
        .values([ComplianceResponseDomainToEntityCreate.map(compliance_response)])
        .returning('*')
        .execute()
      return ComplianceResponseEntityToDomainModel.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }
}

export const ComplianceResponseRepository = new ComplianceResponseReadWriteRepository()
