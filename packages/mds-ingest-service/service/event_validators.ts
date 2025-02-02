import type { Schema } from '@mds-core/mds-schema-validators'
import {
  nullableArray,
  nullableString,
  SchemaValidator,
  timestampSchema,
  uuidSchema
} from '@mds-core/mds-schema-validators'
import type { WithNonNullableKeys } from '@mds-core/mds-types'
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
  EventAnnotationDomainCreateModel,
  EventAnnotationDomainModel,
  EventDomainCreateModel,
  EventDomainModel,
  GetEventsWithDeviceAndTelemetryInfoOptions,
  GetVehicleEventsFilterParams,
  NoColumns,
  WithColumns
} from '../@types'
import {
  DeviceColumns,
  EventAnnotationColumns,
  EventColumns,
  GetVehicleEventsOrderColumn,
  GetVehicleEventsOrderDirection,
  GROUPING_TYPES,
  TelemetryBaseColumns,
  TelemetryGpsColumns
} from '../@types'
import { TelemetryCreateSchema } from './telemetry_validators'

export const { $schema: eventAnnotationDomainSchema } = SchemaValidator<EventAnnotationDomainModel>({
  type: 'object',
  properties: {
    device_id: uuidSchema,
    timestamp: timestampSchema,
    vehicle_id: { type: 'string' },
    vehicle_type: { type: 'string', enum: VEHICLE_TYPES },
    propulsion_types: { type: 'array', items: { type: 'string', enum: PROPULSION_TYPES } },
    accessibility_options: { type: 'array', items: { type: 'string', enum: ACCESSIBILITY_OPTIONS } },
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
    'accessibility_options',
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

const noColumnsGetVehicleEventsFilterParamsSchema = <const>{
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
    modalities: nullableArray([...new Set(MODALITIES)]),
    accessibility_options: nullableArray([...new Set(ACCESSIBILITY_OPTIONS)]),
    event_types: nullableArray([...new Set(VEHICLE_EVENTS)]),
    events: {
      type: 'array',
      nullable: true,
      items: {
        type: 'object',
        properties: { timestamp: timestampSchema, device_id: uuidSchema },
        required: ['timestamp', 'device_id']
      }
    },
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
}

const filterColumns = <const>{
  type: 'object',
  nullable: true,
  properties: {
    event: nullableArray([...new Set(EventColumns)]),
    telemetry: {
      type: 'object',
      properties: {
        base: nullableArray([...new Set(TelemetryBaseColumns)]),
        gps: nullableArray([...new Set(TelemetryGpsColumns)])
      },
      required: ['gps']
    },
    annotation: nullableArray([...new Set(EventAnnotationColumns)]),
    device: nullableArray([...new Set(DeviceColumns)])
  },
  required: ['event', 'telemetry']
}

const withColumnsGetVehicleEventsFilterParamsSchema = () => {
  const { properties, required, ...rest } = noColumnsGetVehicleEventsFilterParamsSchema
  return <const>{
    ...rest,
    properties: { ...properties, columns: filterColumns },
    required: [...required, 'columns']
  }
}

export const { validate: validateGetVehicleEventsFilterParams } = SchemaValidator<
  WithColumns<GetVehicleEventsFilterParams>
>(withColumnsGetVehicleEventsFilterParamsSchema())

export const { validate: validateNoColumnsGetVehicleEventsFilterParams } = SchemaValidator<
  NoColumns<GetVehicleEventsFilterParams>
>(noColumnsGetVehicleEventsFilterParamsSchema)

export const { validate: validateEventAnnotationDomainCreateModel } = SchemaValidator<EventAnnotationDomainCreateModel>(
  {
    type: 'object',
    properties: {
      device_id: uuidSchema,
      timestamp: timestampSchema,
      vehicle_id: { type: 'string' },
      vehicle_type: { type: 'string', enum: VEHICLE_TYPES },
      propulsion_types: { type: 'array', items: { type: 'string', enum: PROPULSION_TYPES } },
      accessibility_options: { type: 'array', items: { type: 'string', enum: ACCESSIBILITY_OPTIONS } },
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
      'accessibility_options',
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
