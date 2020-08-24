/* import { Entity, Column } from 'typeorm'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { BigintTransformer } from '@mds-core/mds-repository'
*/
import { ComplianceDomainModel } from '../../../@types'

export type ComplianceEntityModel = ComplianceDomainModel

/*
@Entity('invoices')
export class InvoiceEntity implements InvoiceEntityModel {
  @Column('bigint', { primary: true, generated: 'increment', transformer: BigintTransformer })
  invoice_id: number

  @Column('uuid')
  provider_id: UUID

  @Column('bigint', {
    transformer: BigintTransformer,
    default: () => '(extract(epoch from now()) * 1000)::bigint'
  })
  invoice_date: Timestamp

  @Column('bigint', { transformer: BigintTransformer })
  start_date: Timestamp

  @Column('bigint', { transformer: BigintTransformer })
  end_date: Timestamp

  @Column('smallint')
  days_due: number

  @Column('bigint', { transformer: BigintTransformer })
  total_trips: number

  @Column('float')
  total_fees: number
}

*/
