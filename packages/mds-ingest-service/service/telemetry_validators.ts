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

import type { Schema } from '@mds-core/mds-schema-validators'
import {
  nullableFloat,
  nullableInteger,
  SchemaValidator,
  timestampSchema,
  uuidSchema
} from '@mds-core/mds-schema-validators'
import type { TelemetryDomainCreateModel, TelemetryDomainModel } from '../@types'

export const telemetryDomainCreateModelSchema: Schema<TelemetryDomainCreateModel> = <const>{
  $id: 'Telemetry',
  type: 'object',
  properties: {
    device_id: uuidSchema,
    provider_id: uuidSchema,
    timestamp: timestampSchema,
    gps: {
      type: 'object',
      properties: {
        lat: { type: 'number', format: 'float', minimum: -90, maximum: 90 },
        lng: { type: 'number', format: 'float', minimum: -180, maximum: 180 },
        // ⬇⬇⬇ NULLABLE/OPTIONAL PROPERTIES ⬇⬇⬇
        altitude: nullableFloat,
        heading: { ...nullableFloat, minimum: 0, exclusiveMaximum: 360 },
        speed: nullableFloat,
        accuracy: nullableFloat,
        hdop: nullableFloat,
        satellites: nullableInteger
      },
      required: ['lat', 'lng']
    },
    // ⬇⬇⬇ NULLABLE/OPTIONAL PROPERTIES ⬇⬇⬇
    charge: { ...nullableFloat, minimum: 0, maximum: 1.0 },
    stop_id: { ...uuidSchema, nullable: true, default: null }
  },
  required: ['device_id', 'provider_id', 'timestamp', 'gps']
}

export const telemetryDomainModelSchema = (): Schema<TelemetryDomainModel> => {
  const { required, $id, type, properties } = telemetryDomainCreateModelSchema
  const domainSchema = {
    $id,
    type,
    properties: { ...properties, recorded: timestampSchema },
    required: [...required, 'recorded']
  }
  return domainSchema as Schema<TelemetryDomainModel>
}

export const { validate: validateTelemetryDomainModel, $schema: TelemetrySchema } =
  SchemaValidator<TelemetryDomainModel>(telemetryDomainModelSchema(), { useDefaults: true })

export const { validate: validateTelemetryDomainCreateModel, $schema: TelemetryCreateSchema } =
  SchemaValidator<TelemetryDomainCreateModel>(telemetryDomainCreateModelSchema, { useDefaults: true })
