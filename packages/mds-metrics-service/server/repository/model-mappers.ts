/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { Timestamp } from '@mds-core/mds-types'
import { ModelMapper, CreateIdentityEntityModel } from 'packages/mds-repository'
import { MetricEntityModel } from './entities/metric-entity'
import { MetricDomainModel } from '../../@types'

type MetricEntityModelMapper<ToModel> = ModelMapper<MetricEntityModel, ToModel>

type MetricDomainModelMapper<ToModel> = ModelMapper<MetricDomainModel, ToModel>

interface MetricDomainToEntityModelMapperOptions {
  recorded: Timestamp
}

export const MetricMappers = {
  EntityModel: {
    to: {
      DomainModel: (): MetricEntityModelMapper<MetricDomainModel> => {
        return {
          map: models =>
            models.map(model => {
              const { id, recorded, ...domain } = model
              return domain
            })
        }
      }
    }
  },
  DomainModel: {
    to: {
      EntityModel: (
        options: MetricDomainToEntityModelMapperOptions
      ): MetricDomainModelMapper<CreateIdentityEntityModel<MetricEntityModel>> => {
        const { recorded } = options
        return {
          map: models =>
            models.map(model => {
              const entity = { ...model, recorded }
              return entity
            })
        }
      }
    }
  }
}
