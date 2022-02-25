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

import { Nullable } from '@mds-core/mds-types'
import { OneWayTransformer, ValueTransformer } from './types'

const toNumber: ValueTransformer<Nullable<string>, Nullable<number>> = value => {
  const transform = (item: Nullable<string>) => (item === null ? item : Number(item))
  return Array.isArray(value) ? value.map(transform) : transform(value)
}

// Use Number for bigint columns so the values get transformed from strings to
// numbers when read from the database
export const BigintTransformer = { ...OneWayTransformer, from: toNumber }
