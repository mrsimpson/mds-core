import { Entity, Column } from 'typeorm'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { BigintTransformer } from '@mds-core/mds-repository'
import { Compliance } from 'packages/mds-compliance/types'
import { ComplianceDomainModel } from '../../../@types'

export type ComplianceEntityModel = ComplianceDomainModel
/*

        ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
        "id" bigint GENERATED ALWAYS AS IDENTITY,
        "compliance_id" uuid NOT NULL,
        "provider_id" uuid NOT NULL,
        "policy_id" uuid NOT NULL,
        "compliance_json" jsonb NOT NULL,
        "timestamp" bigint NOT NULL,
        "total_violations" int NOT NULL,
        */

@Entity('compliance')
export class ComplianceEntity implements ComplianceEntityModel {
  @Column('bigint', { primary: true, generated: 'increment', transformer: BigintTransformer })
  id: number

  @Column('uuid')
  compliance_id: UUID

  @Column('uuid')
  provider_id: UUID

  @Column('uuid')
  policy_id: UUID

  @Column('bigint', {
    transformer: BigintTransformer,
    default: () => '(extract(epoch from now()) * 1000)::bigint'
  })
  recorded: Timestamp

  @Column('bigint', { transformer: BigintTransformer })
  timestamp: Timestamp

  // TODO write transformer or find it
  @Column('jsonb', { transformer: BigintTransformer })
  compliance_json: Compliance

  @Column('int')
  total_violations: number
}
