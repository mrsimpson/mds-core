import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { UUID } from '@mds-core/mds-types'
import { ComplianceResponseDomainModel } from '../@types'
import { ComplianceResponsePersistenceEntity } from './entities'
import { ComplianceResponsePersistenceModelToDomainModel } from './mappers'
import * as migrations from './migrations'
/*
import { EventDomainModel, GetEventQuery, DeviceSessions } from '../../../@types'
import { EventEntityToDomainModel, EventDomainToEntityCreate } from './mappers'
import { buildDeviceSessionsFromCache, getStoppedDeviceSessions } from '../../cache/helpers'
*/

export interface GetComplianceResponseOptions {
  compliance_response_id: UUID
}

class ComplianceResponseReadWriteRepository extends ReadWriteRepository {
  constructor() {
    super('compliance_response', {
      entities: [ComplianceResponsePersistenceEntity],
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
      }: InsertReturning<ComplianceResponsePersistenceEntity> = await connection
        .getRepository(ComplianceResponsePersistenceEntity)
        .createQueryBuilder()
        .insert()
        .values([compliance_response])
        .returning('*')
        .execute()
      return ComplianceResponsePersistenceModelToDomainModel.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public getComplianceResponse = async ({
    compliance_response_id
  }: GetComplianceResponseOptions): Promise<ComplianceResponseDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const query = connection.createQueryBuilder(ComplianceResponsePersistenceEntity, 'compliance_response')
      const result = await query
        .select('*')
        .where('compliance_response_id = :compliance_response_id', { compliance_response_id })
        .getRawOne()
      return result
    } catch (error) {
      throw RepositoryError(error)
    }
  }
}

export const ComplianceResponseRepository = new ComplianceResponseReadWriteRepository()
