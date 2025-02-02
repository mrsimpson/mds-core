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

import type { JurisdictionDomainModel } from '@mds-core/mds-jurisdiction-service'
import type { JurisdictionApiResponse } from '../@types'

export const HasJurisdictionClaim =
  <TBody extends {}>(res: JurisdictionApiResponse<TBody>) =>
  (jurisdiction: JurisdictionDomainModel): boolean =>
    res.locals.scopes.includes('jurisdictions:read') ||
    (res.locals.claims?.jurisdictions?.split(' ') ?? []).includes(jurisdiction.agency_key)
