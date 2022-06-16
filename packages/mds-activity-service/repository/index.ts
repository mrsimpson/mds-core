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

import type { InsertReturning } from '@mds-core/mds-repository'
import { MapModels, ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import type { ActivityDomainCreateModel, ActivityDomainModel, GetActivityOptions, GetActivityResults } from '../@types'
import { ActivityEntity } from './entities/activity-entity'
import { ActivityMapper } from './mappers'
import migrations from './migrations'

export const ActivityRepository = ReadWriteRepository.Create(
  'activity',
  { entities: [ActivityEntity], migrations },
  repository => {
    const recordActivity = async (activity: ActivityDomainCreateModel): Promise<ActivityDomainModel> => {
      try {
        const connection = await repository.connect('rw')
        const {
          raw: [entity]
        }: InsertReturning<ActivityEntity> = await connection
          .getRepository(ActivityEntity)
          .createQueryBuilder()
          .insert()
          .values([ActivityMapper.DomainCreateModel.to.EntityCreateModel.map(activity)])
          .returning('*')
          .execute()

        if (!entity) {
          throw new Error('Failed to create activity')
        }

        return ActivityMapper.EntityModel.to.DomainModel.map(entity)
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    const getActivityUsingOptions = async ({ limit = 500 }: GetActivityOptions = {}): Promise<GetActivityResults> => {
      try {
        const connection = await repository.connect('ro')
        const entities = await connection
          .getRepository(ActivityEntity)
          .createQueryBuilder()
          .orderBy({ recorded: 'DESC', id: 'DESC' })
          .limit(limit)
          .getMany()

        return {
          activity: MapModels(entities).using(ActivityMapper.EntityModel.to.DomainModel),
          cursor: { next: null, prev: null }
        }
      } catch (error) {
        throw RepositoryError(error)
      }
    }

    return {
      recordActivity,
      getActivityUsingOptions
    }
  }
)
