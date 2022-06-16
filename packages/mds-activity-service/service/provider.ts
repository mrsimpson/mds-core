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

import type { ProcessController, ServiceProvider } from '@mds-core/mds-service-helpers'
import { ServiceException, ServiceResult } from '@mds-core/mds-service-helpers'
import type { ActivityService, ActivityServiceRequestContext } from '../@types'
import { ActivityServiceLogger as logger } from '../logger'
import { ActivityRepository } from '../repository'
import { validateActivityDomainCreateModel, validateGetActivityOptions } from './validators'

export const ActivityServiceProvider: ServiceProvider<ActivityService, ActivityServiceRequestContext> &
  ProcessController = {
  start: ActivityRepository.initialize,
  stop: ActivityRepository.shutdown,

  recordActivity: async (context, category, type, description, details) => {
    try {
      // Log all activity to the standard output
      logger.info(description, { category, type })
      return ServiceResult(
        // Fire and Forget
        void ActivityRepository.recordActivity(
          validateActivityDomainCreateModel({ category, type, description, details })
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Recording Activity', error)
      logger.error('mds-activity-service::recordActivity exception', { exception, error })
      // Don't generate errors as a result of failing to record activity
      return ServiceResult(void 0)
    }
  },

  getActivity: async (context, options) => {
    try {
      return ServiceResult(await ActivityRepository.getActivityUsingOptions(validateGetActivityOptions(options ?? {})))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting Activity`, error)
      logger.error('mds-activity-service::getActivity exception', { exception, error })
      return exception
    }
  }
}
