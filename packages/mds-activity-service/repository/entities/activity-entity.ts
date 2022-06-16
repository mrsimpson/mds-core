/**
 * Copyright 2022 City of Los Angeles
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

import type { EntityCreateModel } from '@mds-core/mds-repository'
import { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { Nullable } from '@mds-core/mds-types'
import { Column, Entity, Index } from 'typeorm'

@Entity('activity')
export class ActivityEntity extends IdentityColumn(RecordedColumn(class {}), { primary: true }) {
  @Column('varchar', { length: 127 })
  @Index()
  category: string

  @Column('varchar', { length: 127 })
  @Index()
  type: string

  @Column('varchar', { length: 255 })
  description: string

  @Column('jsonb', { nullable: true })
  details: Nullable<{}>
}

export type ActivityEntityModel = ActivityEntity

export type ActivityEntityCreateModel = EntityCreateModel<ActivityEntityModel>
