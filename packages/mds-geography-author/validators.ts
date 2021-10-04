/**
 * Copyright 2021 City of Los Angeles
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

import { SchemaValidator } from '@mds-core/mds-schema-validators'
import { Geography } from '@mds-core/mds-types'

const uuidSchema = { type: 'string', format: 'uuid' }
const timestampSchema = { type: 'integer', minimum: 100_000_000_000, maximum: 99_999_999_999_999 }
const stringSchema = { type: 'string', transform: ['trim'], minLength: 1 }

export const { validate: validateGeographyDetails } = SchemaValidator<Geography>({
  $id: 'Geography',
  type: 'object',
  properties: {
    geography_id: uuidSchema,
    name: stringSchema,
    geography_json: {
      $id: 'FeatureCollection',
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['FeatureCollection'] },
        features: {
          type: 'array',
          minItems: 1,
          items: {
            $id: 'Feature',
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['Feature'] },
              properties: { type: 'object' },
              geometry: { type: 'object' }
            },
            required: ['type', 'properties', 'geometry']
          }
        }
      },
      required: ['type', 'features']
    },
    prev_geographies: { type: 'array', items: uuidSchema },
    effective_date: timestampSchema,
    description: stringSchema
  },
  additionalProperties: false,
  required: ['geography_id', 'geography_json']
})
