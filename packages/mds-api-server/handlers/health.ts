/**
 * Copyright 2019 City of Los Angeles
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

import type { ApiRequest, ApiResponse, HealthStatus } from '../@types'
import { healthInfo } from '../utils'

/**
 *
 * @param healthStatus Health Status object defined by the parent process and _passed through_ to the caller (e.g. ApiServer or RPC Server)
 * @param baseHealthStatus _Base_ health status object defined _by_ the caller (e.g. ApiServer or RPCServer).
 * @returns
 */
export const HealthRequestHandler =
  (healthStatus?: HealthStatus, baseHealthStatus?: HealthStatus) => async (req: ApiRequest, res: ApiResponse) => {
    const compositeHealthStatus = {
      components: { ...healthStatus?.components, ...baseHealthStatus?.components }
    }

    return res
      .status(Object.values(compositeHealthStatus.components).every(({ healthy }) => healthy) ? 200 : 503)
      .send(healthInfo(compositeHealthStatus))
  }
