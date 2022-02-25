/**
 * Copyright 2020 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  BigintTransformer,
  DesignType,
  EntityCreateModel,
  IdentityColumn,
  RecordedColumn
} from '@mds-core/mds-repository'
import { Nullable, Timestamp, UUID } from '@mds-core/mds-types'
import { Column, Entity, Index } from 'typeorm'
import { FEE_TYPE } from '../../@types'

@Entity('transactions')
export class TransactionEntity extends IdentityColumn(RecordedColumn(class {})) {
  @Column('uuid', { primary: true })
  transaction_id: UUID

  @Column('uuid')
  provider_id: UUID

  @Column('uuid', { nullable: true })
  device_id: Nullable<UUID>

  @Column('bigint', { transformer: BigintTransformer })
  @DesignType(Number)
  timestamp: Timestamp

  @Index()
  @Column('varchar', { length: 127 })
  fee_type: FEE_TYPE

  @Index()
  @Column('int')
  amount: number

  @Column('jsonb')
  receipt: object
}

export type TransactionEntityCreateModel = EntityCreateModel<TransactionEntity>
