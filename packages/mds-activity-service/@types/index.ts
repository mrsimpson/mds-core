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

import type { DomainModelCreate } from '@mds-core/mds-repository'
import type { RpcAuthorizedRequestContext, RpcServiceDefinition } from '@mds-core/mds-rpc-common'
import { RpcRoute } from '@mds-core/mds-rpc-common'
import type { Nullable } from '@mds-core/mds-types'

export interface ActivityDomainModel {
  category: string
  type: string
  description: string
  details: Nullable<{}>
}

export type ActivityDomainCreateModel = DomainModelCreate<ActivityDomainModel>

export type GetActivityOptions = Partial<{
  limit: number
}>

export type GetActivityResults = {
  activity: Array<ActivityDomainModel>
  cursor: { next: Nullable<string>; prev: Nullable<string> }
}

export interface ActivityService {
  recordActivity: (
    category: ActivityDomainCreateModel['category'],
    type: ActivityDomainCreateModel['type'],
    description: ActivityDomainCreateModel['description'],
    details?: ActivityDomainCreateModel['details']
  ) => void
  getActivity: (options?: GetActivityOptions) => GetActivityResults
}

export const ActivityServiceDefinition: RpcServiceDefinition<ActivityService> = {
  recordActivity: RpcRoute<ActivityService['recordActivity']>(),
  getActivity: RpcRoute<ActivityService['getActivity']>()
}

export type ActivityServiceRequestContext = RpcAuthorizedRequestContext
