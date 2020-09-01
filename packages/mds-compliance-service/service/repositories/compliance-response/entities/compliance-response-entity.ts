import { Entity, Column } from 'typeorm'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { BigintTransformer, IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceResponseDomainModel, ComplianceResponse } from '../../../../@types'

export type ComplianceResponseEntityModel = ComplianceResponseDomainModel

@Entity('compliance_response')
export class ComplianceResponseEntity extends IdentityColumn(RecordedColumn(class {}))
  implements ComplianceResponseEntityModel {
  @Column('uuid')
  compliance_id: UUID

  @Column('uuid')
  provider_id: UUID

  @Column('bigint', { transformer: BigintTransformer })
  timestamp: Timestamp

  // TODO write transformer or find it
  @Column('jsonb', { transformer: BigintTransformer })
  compliance_json: ComplianceResponse

  @Column('int')
  total_violations: number
}
