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

import type { DeleteReturning, InsertReturning } from '@mds-core/mds-repository'
import { ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import type { UUID } from '@mds-core/mds-types'
import { In } from 'typeorm'
import type { AttachmentDomainModel, ReadAttachmentsOptions } from '../@types'
import entities from './entities'
import { AttachmentEntity } from './entities/attachment-entity'
import { AttachmentDomainToEntityCreate, AttachmentEntityToDomain } from './mappers'
import migrations from './migrations'

export const AttachmentRepository = ReadWriteRepository.Create('attachments', { entities, migrations }, repository => {
  return {
    writeAttachment: async (attachment: AttachmentDomainModel): Promise<AttachmentDomainModel> => {
      try {
        const connection = await repository.connect('rw')

        const {
          raw: [entity]
        }: InsertReturning<AttachmentEntity> = await connection
          .getRepository(AttachmentEntity)
          .createQueryBuilder()
          .insert()
          .values([AttachmentDomainToEntityCreate.map(attachment)])
          .returning('*')
          .execute()

        if (!entity) {
          throw new Error('Failed to write attachment')
        }

        return AttachmentEntityToDomain.map(entity)
      } catch (error) {
        throw RepositoryError(error)
      }
    },

    deleteAttachment: async (attachment_id: string): Promise<AttachmentDomainModel> => {
      try {
        const connection = await repository.connect('rw')

        const {
          raw: [entity]
        }: DeleteReturning<AttachmentEntity> = await connection
          .getRepository(AttachmentEntity)
          .createQueryBuilder()
          .delete()
          .where('attachment_id = :attachment_id', { attachment_id })
          .returning('*')
          .execute()

        if (!entity) {
          throw new Error('Failed to delete attachment')
        }

        return AttachmentEntityToDomain.map(entity)
      } catch (error) {
        throw RepositoryError(error)
      }
    },

    readAttachment: async (attachment_id: string): Promise<AttachmentDomainModel | undefined> => {
      try {
        const connection = await repository.connect('rw')

        const entity = await connection.getRepository(AttachmentEntity).findOne({ where: { attachment_id } })

        return entity ? AttachmentEntityToDomain.map(entity) : undefined
      } catch (error) {
        throw RepositoryError(error)
      }
    },

    readAttachments: async (options: ReadAttachmentsOptions): Promise<AttachmentDomainModel[]> => {
      const isAttachmentListIdOption = (opts: ReadAttachmentsOptions): opts is { attachment_list_id: UUID } =>
        'attachment_list_id' in opts

      const isAttachmentIdsOption = (opts: ReadAttachmentsOptions): opts is { attachment_ids: UUID[] } =>
        'attachment_ids' in opts

      try {
        const connection = await repository.connect('rw')

        const attachments = await (async () => {
          if (isAttachmentIdsOption(options)) {
            const { attachment_ids } = options
            return connection.getRepository(AttachmentEntity).find({ where: { attachment_id: In(attachment_ids) } })
          }

          if (isAttachmentListIdOption(options)) {
            const { attachment_list_id } = options
            return connection.getRepository(AttachmentEntity).find({ where: { attachment_list_id } })
          }

          return []
        })()

        return attachments.map(AttachmentEntityToDomain.mapper())
      } catch (error) {
        throw RepositoryError(error)
      }
    }
  }
})
