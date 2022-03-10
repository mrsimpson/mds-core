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
import { SchemaValidator } from '@mds-core/mds-schema-validators'
import type { UUID, WithNonNullableKeys } from '@mds-core/mds-types'
import {
  ACCESSIBILITY_OPTIONS,
  MODALITIES,
  PROPULSION_TYPES,
  TRIP_STATES,
  VEHICLE_EVENTS,
  VEHICLE_STATES,
  VEHICLE_TYPES
} from '@mds-core/mds-types'
import type {
  DeviceDomainModel,
  EventAnnotationDomainCreateModel,
  EventAnnotationDomainModel,
  EventDomainCreateModel,
  EventDomainModel,
  GetDeviceOptions,
  GetDevicesOptions,
  GetEventsWithDeviceAndTelemetryInfoOptions,
  GetVehicleEventsFilterParams,
  TelemetryDomainCreateModel,
  TelemetryDomainModel
} from '../@types'
import { GetVehicleEventsOrderColumn, GetVehicleEventsOrderDirection, GROUPING_TYPES } from '../@types'

const uuidSchema = <const>{ type: 'string', format: 'uuid' }
const timestampSchema = <const>{
  type: 'integer',
  minimum: 100_000_000_000,
  maximum: 99_999_999_999_999
}

const nullableUUID = <const>{
  type: 'string',
  format: 'uuid',
  nullable: true,
  default: null
}

const nullableInteger = <const>{
  type: 'integer',
  nullable: true,
  default: null
}

const nullableFloat = <const>{
  type: 'number',
  format: 'float',
  nullable: true,
  default: null
}

const nullableString = <const>{ type: 'string', nullable: true, default: null }

export const { validate: validateGetDevicesOptions } = SchemaValidator<GetDevicesOptions>({
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true, default: null },
    provider_id: nullableUUID
  },
  additionalProperties: false,
  required: []
})

export const { validate: validateGetDeviceOptions } = SchemaValidator<GetDeviceOptions>({
  type: 'object',
  properties: {
    device_id: uuidSchema,
    provider_id: nullableUUID
  },
  additionalProperties: false,
  required: []
})

export const { validate: validateDeviceDomainModel, $schema: DeviceSchema } = SchemaValidator<DeviceDomainModel>(
  {
    $id: 'Device',
    type: 'object',
    properties: {
      device_id: uuidSchema,
      provider_id: uuidSchema,
      vehicle_id: {
        type: 'string'
      },
      vehicle_type: { type: 'string', enum: VEHICLE_TYPES },
      propulsion_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: PROPULSION_TYPES
        }
      },
      accessibility_options: {
        type: 'array',
        items: {
          type: 'string',
          enum: ACCESSIBILITY_OPTIONS
        },
        default: []
      },
      modality: { type: 'string', enum: MODALITIES, default: 'micromobility' },
      recorded: timestampSchema,
      // ⬇⬇⬇ NULLABLE/OPTIONAL PROPERTIES ⬇⬇⬇
      year: nullableInteger,
      mfgr: nullableString,
      model: nullableString
    },
    required: ['device_id', 'provider_id', 'vehicle_id', 'vehicle_type', 'propulsion_types', 'recorded']
  },
  { useDefaults: true }
)

const telemetryDomainCreateModelSchema: Schema<TelemetryDomainCreateModel> = <const>{
  $id: 'Telemetry',
  type: 'object',
  properties: {
    device_id: uuidSchema,
    provider_id: uuidSchema,
    timestamp: timestampSchema,
    gps: {
      type: 'object',
      properties: {
        lat: { type: 'number', format: 'float' },
        lng: { type: 'number', format: 'float' },
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

const telemetryDomainModelSchema = (): Schema<TelemetryDomainModel> => {
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

export const { $schema: eventAnnotationDomainSchema } = SchemaValidator<EventAnnotationDomainModel>({
  type: 'object',
  properties: {
    device_id: uuidSchema,
    timestamp: timestampSchema,
    vehicle_id: { type: 'string' },
    vehicle_type: { type: 'string', enum: VEHICLE_TYPES },
    propulsion_types: { type: 'array', items: { type: 'string', enum: PROPULSION_TYPES } },
    geography_ids: { type: 'array', items: uuidSchema },
    geography_types: { type: 'array', items: nullableString },
    latency_ms: { type: 'integer' },
    recorded: timestampSchema
  },
  required: [
    'device_id',
    'timestamp',
    'vehicle_id',
    'vehicle_type',
    'propulsion_types',
    'geography_ids',
    'geography_types',
    'latency_ms'
  ]
})

const eventCreateSchema: Schema<WithNonNullableKeys<EventDomainCreateModel, 'telemetry'>> = {
  $id: 'Event',
  type: 'object',
  properties: {
    device_id: uuidSchema,
    provider_id: uuidSchema,
    timestamp: timestampSchema,
    annotation: { ...eventAnnotationDomainSchema, nullable: true },
    event_types: {
      type: 'array',
      items: {
        type: 'string',
        enum: [...new Set(VEHICLE_EVENTS)]
      },
      minItems: 1
    },
    vehicle_state: {
      type: 'string',
      enum: [...new Set(VEHICLE_STATES)]
    },
    telemetry: TelemetryCreateSchema,
    // ⬇⬇⬇ NULLABLE/OPTIONAL PROPERTIES ⬇⬇⬇
    trip_state: {
      type: 'string',
      enum: [...new Set(TRIP_STATES), null],
      nullable: true,
      default: null
    },
    trip_id: { ...uuidSchema, nullable: true, default: null }
  },
  if: {
    properties: {
      event_types: {
        type: 'array',
        contains: {
          type: 'string',
          enum: ['trip_start', 'trip_end', 'trip_enter_jurisdiction', 'trip_leave_jurisdiction']
        }
      }
    }
  },
  then: { properties: { trip_id: uuidSchema }, required: ['trip_id'] },
  required: ['device_id', 'provider_id', 'timestamp', 'event_types', 'vehicle_state', 'telemetry']
}

export const { validate: validateEventDomainCreateModel, $schema: EventCreateSchema } = SchemaValidator<
  WithNonNullableKeys<EventDomainCreateModel, 'telemetry'>
>(eventCreateSchema, { useDefaults: true })

const eventDomainModelSchema = (): Schema<WithNonNullableKeys<EventDomainModel, 'telemetry'>> => {
  const { properties, required, ...rest } = eventCreateSchema
  const domainSchema = {
    ...rest,
    properties: { ...properties, recorded: timestampSchema, telemetry_timestamp: timestampSchema },
    required: [...required, 'recorded']
  }
  return domainSchema as Schema<WithNonNullableKeys<EventDomainModel, 'telemetry'>>
}

export const { validate: validateEventDomainModel, $schema: EventSchema } = SchemaValidator<
  WithNonNullableKeys<EventDomainModel, 'telemetry'>
>(eventDomainModelSchema(), { useDefaults: true })

const nullableArray = <T>(enums: T[]) => {
  return <const>{ type: 'array', items: { type: 'string', enum: enums }, nullable: true }
}

export const { validate: validateGetVehicleEventsFilterParams } = SchemaValidator<GetVehicleEventsFilterParams>({
  type: 'object',
  properties: {
    vehicle_types: nullableArray([...new Set(VEHICLE_TYPES)]),
    propulsion_types: nullableArray([...PROPULSION_TYPES]),
    provider_ids: { type: 'array', items: uuidSchema, nullable: true },
    vehicle_states: nullableArray([...new Set(VEHICLE_STATES)]),
    time_range: {
      type: 'object',
      properties: {
        start: { type: 'integer', nullable: false },
        end: { type: 'integer', nullable: false }
      },
      required: ['start', 'end'],
      nullable: true
    },
    grouping_type: { type: 'string', enum: [...GROUPING_TYPES] },
    vehicle_id: { type: 'string', nullable: true },
    device_ids: { type: 'array', items: uuidSchema, nullable: true },
    event_types: nullableArray([...new Set(VEHICLE_EVENTS)]),
    limit: { type: 'integer', nullable: true },
    order: {
      type: 'object',
      properties: {
        column: { type: 'string', enum: [...GetVehicleEventsOrderColumn] },
        direction: { type: 'string', enum: [...GetVehicleEventsOrderDirection], nullable: true }
      },
      required: ['column'],
      additionalProperties: false,
      nullable: true
    },
    geography_ids: { type: 'array', items: uuidSchema, nullable: true }
  },
  required: ['grouping_type']
})

export const { validate: validateUUIDs } = SchemaValidator<UUID[]>({
  type: 'array',
  items: uuidSchema
})

export const { validate: validateEventAnnotationDomainCreateModel } = SchemaValidator<EventAnnotationDomainCreateModel>(
  {
    type: 'object',
    properties: {
      device_id: uuidSchema,
      timestamp: timestampSchema,
      vehicle_id: { type: 'string' },
      vehicle_type: { type: 'string', enum: VEHICLE_TYPES },
      propulsion_types: { type: 'array', items: { type: 'string', enum: PROPULSION_TYPES } },
      geography_ids: { type: 'array', items: uuidSchema },
      geography_types: { type: 'array', items: nullableString },
      latency_ms: { type: 'integer' },
      events_row_id: { type: 'number' }
    },
    required: [
      'device_id',
      'timestamp',
      'vehicle_id',
      'vehicle_type',
      'propulsion_types',
      'geography_ids',
      'geography_types',
      'latency_ms',
      'events_row_id'
    ]
  }
)

export const { validate: validateGetEventsWithDeviceAndTelemetryInfoOptions } =
  SchemaValidator<GetEventsWithDeviceAndTelemetryInfoOptions>({
    type: 'object',
    properties: {
      provider_ids: { type: 'array', items: uuidSchema, minItems: 1, nullable: true },
      device_ids: { type: 'array', items: uuidSchema, minItems: 1, nullable: true },
      time_range: {
        type: 'object',
        properties: {
          start: { ...timestampSchema, nullable: true },
          end: { ...timestampSchema, nullable: true }
        },
        additionalProperties: false,
        nullable: true
      },
      limit: { type: 'integer', minimum: 1, nullable: true },
      follow: { type: 'boolean', nullable: true }
    },
    additionalProperties: false
  })
