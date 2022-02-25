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

import { EntityCreateModel, IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { Column, Entity } from 'typeorm'
import { AuditAttachmentDomainModel } from '../../@types'

export interface AuditAttachmentEntityModel extends IdentityColumn, RecordedColumn {
  audit_trip_id: AuditAttachmentDomainModel['audit_trip_id']
  attachment_id: AuditAttachmentDomainModel['attachment_id']
}

@Entity('audit_attachments')
export class AuditAttachmentEntity
  extends IdentityColumn(RecordedColumn(class {}))
  implements AuditAttachmentEntityModel
{
  @Column('uuid', { primary: true })
  audit_trip_id: AuditAttachmentEntityModel['audit_trip_id']

  @Column('uuid', { primary: true })
  attachment_id: AuditAttachmentEntityModel['attachment_id']
}

export type AuditAttachmentEntityCreateModel = EntityCreateModel<AuditAttachmentEntityModel>
