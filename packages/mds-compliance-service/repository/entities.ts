import { Column, Entity } from 'typeorm'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { BigintTransformer, IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceResponseDomainModel } from '../@types'

export interface ComplianceResponsePersistenceModel extends IdentityColumn, RecordedColumn {
  compliance_response_id: ComplianceResponseDomainModel['compliance_response_id']
  compliance_as_of: ComplianceResponseDomainModel['compliance_as_of']
  provider_id: ComplianceResponseDomainModel['provider_id']
  excess_vehicles_count: ComplianceResponseDomainModel['excess_vehicles_count']
  policy: ComplianceResponseDomainModel['policy']
  total_violations: ComplianceResponseDomainModel['total_violations']
  vehicles_found: ComplianceResponseDomainModel['vehicles_found']
}

@Entity('compliance_response')
export class ComplianceResponsePersistenceEntity
  extends IdentityColumn(RecordedColumn(class {}))
  implements ComplianceResponsePersistenceModel {
  @Column('uuid', { primary: true })
  compliance_response_id: UUID

  @Column('bigint', { transformer: BigintTransformer })
  compliance_as_of: Timestamp

  @Column('provider_id')
  provider_id: UUID

  @Column('int')
  excess_vehicles_count: number

  @Column('jsonb')
  policy: ComplianceResponsePersistenceModel['policy']

  @Column('int')
  total_violations: number

  @Column('jsonb')
  vehicles_found: ComplianceResponsePersistenceModel['vehicles_found']
}
