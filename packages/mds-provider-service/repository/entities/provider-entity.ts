import { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { Nullable } from '@mds-core/mds-types'
import { Column, Entity } from 'typeorm'
import type { PROVIDER_TYPE } from '../../@types'

@Entity('providers')
export class ProviderEntity extends IdentityColumn(RecordedColumn(class {})) {
  @Column('uuid', { primary: true })
  provider_id: string

  @Column('varchar', { length: 255 })
  provider_name: string

  @Column('varchar', { length: 255, nullable: true })
  url: Nullable<string>

  @Column('varchar', { length: 255, nullable: true })
  mds_api_url: Nullable<string>

  @Column('varchar', { length: 255, nullable: true })
  gbfs_api_url: Nullable<string>

  @Column('varchar', { length: 7, nullable: true })
  color_code_hex: Nullable<string>

  @Column('varchar', { array: true, length: 32 })
  provider_types: PROVIDER_TYPE[]
}

export type ProviderEntityModel = ProviderEntity
