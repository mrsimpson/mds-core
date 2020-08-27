import { InsertReturning, RepositoryError, ReadWriteRepository, UpdateReturning } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { Nullable } from '@mds-core/mds-types'
// import { EventEntity } from './entities'
import * as migrations from '../migrations'
/*
import { EventDomainModel, GetEventQuery, DeviceSessions } from '../../../@types'
import { EventEntityToDomainModel, EventDomainToEntityCreate } from './mappers'
import { buildDeviceSessionsFromCache, getStoppedDeviceSessions } from '../../cache/helpers'
*/

class ComplianceReadWriteRepository extends ReadWriteRepository {
  constructor() {
    super('compliance', {
      //      entities: [EventEntity],
      migrations: Object.values(migrations)
    })
  }
}

export const ComplianceRepository = new ComplianceReadWriteRepository()
