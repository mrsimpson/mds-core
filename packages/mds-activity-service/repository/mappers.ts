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

import { ModelMapper } from '@mds-core/mds-repository'
import type { Timestamp } from '@mds-core/mds-types'
import type { ActivityDomainCreateModel, ActivityDomainModel } from '../@types'
import type { ActivityEntityCreateModel, ActivityEntityModel } from './entities/activity-entity'

type ActivityEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export const ActivityMapper = {
  DomainCreateModel: {
    to: {
      EntityCreateModel: ModelMapper<ActivityDomainCreateModel, ActivityEntityCreateModel, ActivityEntityCreateOptions>(
        ({ details = null, ...domain }, options) => {
          const { recorded } = options ?? {}
          return { ...domain, details, recorded }
        }
      )
    }
  },

  EntityModel: {
    to: {
      DomainModel: ModelMapper<ActivityEntityModel, ActivityDomainModel>((entity, options) => {
        const { id, recorded, ...domain } = entity
        return domain
      })
    }
  }
}
