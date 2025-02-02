/**
 * Copyright 2021 City of Los Angeles
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

import { BigintTransformer, IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { Timestamp, UUID } from '@mds-core/mds-types'
import { Column, Entity } from 'typeorm'
import type { ComplianceSnapshotKafkaFailureDomainModel as ComplianceSnapshotFailureDomainModel } from '../../@types'

export interface ComplianceSnapshotFailureEntityModel extends IdentityColumn, RecordedColumn {
  compliance_snapshot_id: ComplianceSnapshotFailureDomainModel['compliance_snapshot_id']
  timestamp: ComplianceSnapshotFailureDomainModel['timestamp']
}

@Entity('compliance_snapshot_failures')
export class ComplianceSnapshotFailureEntity
  extends IdentityColumn(RecordedColumn(class {}))
  implements ComplianceSnapshotFailureEntityModel
{
  @Column('uuid', { primary: true })
  compliance_snapshot_id: UUID

  @Column('bigint', { transformer: BigintTransformer })
  timestamp: Timestamp
}
