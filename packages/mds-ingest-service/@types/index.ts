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

import type { RpcEmptyRequestContext, RpcServiceDefinition } from '@mds-core/mds-rpc-common'
import { RpcRoute } from '@mds-core/mds-rpc-common'
import type {
  Nullable,
  PROPULSION_TYPE,
  Timestamp,
  UUID,
  VEHICLE_EVENT,
  VEHICLE_STATE,
  VEHICLE_TYPE
} from '@mds-core/mds-types'
import type { Cursor } from 'typeorm-cursor-pagination'
import type { EventEntity } from '../repository/entities/event-entity'
import type {
  DeviceDomainModel,
  EventAnnotationDomainCreateModel,
  EventAnnotationDomainModel,
  EventDomainCreateModel,
  EventDomainModel,
  EventWithDeviceAndTelemetryInfoDomainModel,
  GpsData,
  GROUPING_TYPE,
  H3_RESOLUTIONS,
  PartialEventDomainModel,
  TelemetryAnnotationDomainCreateModel,
  TelemetryAnnotationDomainModel,
  TelemetryDomainModel
} from './models'

export type ResponseWithCursor<T extends {}> = T & {
  cursor: {
    prev: Nullable<string>
    next: Nullable<string>
  }
}

export interface GetDevicesOptions {
  limit?: number
  provider_id?: UUID
}

export interface GetDeviceOptions {
  provider_id?: UUID
  device_id: UUID
}

export type GetDevicesResponse = ResponseWithCursor<{
  devices: DeviceDomainModel[]
}>

export type TimeRange = {
  start: Timestamp
  end: Timestamp
}

export type WithCursorOptions<P extends object> = P & Cursor

export const GetVehicleEventsOrderColumn = <const>['timestamp', 'provider_id', 'vehicle_state']

export type GetVehicleEventsOrderColumn = typeof GetVehicleEventsOrderColumn[number]

export const GetVehicleEventsOrderDirection = <const>['ASC', 'DESC']

export type GetVehicleEventsOrderDirection = typeof GetVehicleEventsOrderDirection[number]

export type GetVehicleEventsOrderOption = {
  column: GetVehicleEventsOrderColumn
  direction?: GetVehicleEventsOrderDirection
}

export const EventColumns = <const>[
  'id',
  'device_id',
  'event_types',
  'provider_id',
  'timestamp',
  'recorded',
  'vehicle_state',
  'telemetry_timestamp',
  'trip_id',
  'trip_state'
]
export type EventColumn = keyof Pick<EventEntity, typeof EventColumns[number]>

export const TelemetryGpsColumns = <const>[
  'lat',
  'lng',
  'speed',
  'heading',
  'accuracy',
  'altitude',
  'hdop',
  'satellites'
]
export type TelemetryGpsColumn = keyof Pick<GpsData, typeof TelemetryGpsColumns[number]>

export const TelemetryBaseColumns = <const>['device_id', 'provider_id', 'timestamp', 'charge', 'recorded', 'stop_id']

export type TelemetryBaseColumn = keyof Pick<TelemetryDomainModel, typeof TelemetryBaseColumns[number]>

export const DeviceColumns = <const>[
  'device_id',
  'provider_id',
  'vehicle_id',
  'vehicle_type',
  'propulsion_types',
  'year',
  'mfgr',
  'model',
  'accessibility_options',
  'modality'
]
export type DeviceColumn = keyof Pick<DeviceDomainModel, typeof DeviceColumns[number]>

export const EventAnnotationColumns = <const>[
  'device_id',
  'timestamp',
  'recorded',
  'geography_ids',
  'geography_types',
  'vehicle_id',
  'vehicle_type',
  'latency_ms'
]
export type EventAnnotationColumn = keyof Pick<EventAnnotationDomainModel, typeof EventAnnotationColumns[number]>

export type GetVehicleEventQueryColumns = {
  event: EventColumn[]
  telemetry: {
    gps: TelemetryGpsColumn[]
    base?: TelemetryBaseColumn[]
  }
  annotation?: EventAnnotationColumn[]
  device?: DeviceColumn[]
}
export interface GetVehicleEventsFilterParams {
  vehicle_types?: VEHICLE_TYPE[]
  propulsion_types?: PROPULSION_TYPE[]
  provider_ids?: UUID[]
  vehicle_states?: VEHICLE_STATE[]
  time_range?: TimeRange
  grouping_type: GROUPING_TYPE
  vehicle_id?: string
  device_ids?: UUID[]
  event_types?: VEHICLE_EVENT[]
  geography_ids?: UUID[]
  limit?: number
  order?: GetVehicleEventsOrderOption
  events?: { device_id: UUID; timestamp: Timestamp }[]
  columns?: GetVehicleEventQueryColumns
}

export type NoColumns<T> = Omit<T, 'columns'>
export type WithColumns<T> = Omit<T, 'columns'> & {
  columns: GetVehicleEventQueryColumns
}

export type GetVehicleEventsResponse = ResponseWithCursor<{
  events: EventDomainModel[]
}>

export type GetPartialVehicleEventsResponse = ResponseWithCursor<{
  events: PartialEventDomainModel[]
}>

export interface ReadTripEventsQueryParams {
  skip?: UUID
  take?: number
  start_time?: number | string
  end_time?: number | string
  provider_id?: UUID
}

export interface ReadDeviceEventsQueryParams {
  skip?: UUID
  take?: number
  start_time?: number | string
  end_time?: number | string
  provider_id?: UUID
}
export type GetEventsWithDeviceAndTelemetryInfoOptions = Partial<{
  limit: number
  follow: boolean
  time_range: Partial<TimeRange>
  provider_ids: UUID[]
  device_ids: UUID[]
}>

export type GetEventsWithDeviceAndTelemetryInfoResponse = ResponseWithCursor<{
  events: EventWithDeviceAndTelemetryInfoDomainModel[]
}>

export type GetH3BinOptions = {
  k: number
  h3_resolution: H3_RESOLUTIONS
} & TimeRange

export interface H3Bin {
  count: number
  h3_identifier: string
  provider_id: UUID
}
export interface IngestService {
  getDevicesUsingOptions: (options: GetDevicesOptions) => GetDevicesResponse
  getDevice: (options: GetDeviceOptions) => DeviceDomainModel | undefined
  getDevicesUsingCursor: (cursor: string) => GetDevicesResponse
  getEventsUsingOptions: (params: NoColumns<GetVehicleEventsFilterParams>) => GetVehicleEventsResponse
  getEventsUsingCursor: (cursor: string) => GetVehicleEventsResponse
  getPartialEventsUsingOptions: (params: WithColumns<GetVehicleEventsFilterParams>) => GetPartialVehicleEventsResponse
  getPartialEventsUsingCursor: (cursor: string) => GetPartialVehicleEventsResponse
  getDevices: (device_ids: UUID[]) => DeviceDomainModel[]
  getLatestTelemetryForDevices: (device_ids: UUID[]) => TelemetryDomainModel[]
  writeEvents: (event: EventDomainCreateModel[]) => EventDomainModel[]
  writeEventAnnotations: (params: EventAnnotationDomainCreateModel[]) => EventAnnotationDomainModel[]
  writeTelemetryAnnotations: (
    telemetryAnnotations: TelemetryAnnotationDomainCreateModel[]
  ) => TelemetryAnnotationDomainModel[]
  getH3Bins: (params: GetH3BinOptions) => H3Bin[]
  /**
   * Gets all trip-related events grouped by trip_id, with an optional time_range.
   * When a time_range is supplied, all trip_ids within that time_range will be considered,
   * however some events for that trip_id may be outside of the time_range, and **will still be returned**.
   */
  getTripEvents: (params: ReadTripEventsQueryParams) => Record<UUID, EventDomainModel[]>
  getEventsWithDeviceAndTelemetryInfoUsingOptions: (
    options?: GetEventsWithDeviceAndTelemetryInfoOptions
  ) => GetEventsWithDeviceAndTelemetryInfoResponse
  getEventsWithDeviceAndTelemetryInfoUsingCursor: (cursor: string) => GetEventsWithDeviceAndTelemetryInfoResponse
  /**
   * Gets all events grouped by device_id, with an optional time_range.
   * When a time_range is supplied, only the events within that time range will be returned.
   */
  getDeviceEvents: (params: ReadDeviceEventsQueryParams) => Record<UUID, EventDomainModel[]>
}

export const IngestServiceDefinition: RpcServiceDefinition<IngestService> = {
  getDevices: RpcRoute<IngestService['getDevices']>(),
  getDevice: RpcRoute<IngestService['getDevice']>(),
  getDevicesUsingOptions: RpcRoute<IngestService['getDevicesUsingOptions']>(),
  getDevicesUsingCursor: RpcRoute<IngestService['getDevicesUsingCursor']>(),
  getEventsUsingOptions: RpcRoute<IngestService['getEventsUsingOptions']>(),
  getEventsUsingCursor: RpcRoute<IngestService['getEventsUsingCursor']>(),
  getPartialEventsUsingOptions: RpcRoute<IngestService['getPartialEventsUsingOptions']>(),
  getPartialEventsUsingCursor: RpcRoute<IngestService['getPartialEventsUsingCursor']>(),
  getLatestTelemetryForDevices: RpcRoute<IngestService['getLatestTelemetryForDevices']>(),
  writeEvents: RpcRoute<IngestService['writeEvents']>(),
  writeEventAnnotations: RpcRoute<IngestService['writeEventAnnotations']>(),
  writeTelemetryAnnotations: RpcRoute<IngestService['writeTelemetryAnnotations']>(),
  getH3Bins: RpcRoute<IngestService['getH3Bins']>(),
  getTripEvents: RpcRoute<IngestService['getTripEvents']>(),
  getEventsWithDeviceAndTelemetryInfoUsingOptions:
    RpcRoute<IngestService['getEventsWithDeviceAndTelemetryInfoUsingOptions']>(),
  getEventsWithDeviceAndTelemetryInfoUsingCursor:
    RpcRoute<IngestService['getEventsWithDeviceAndTelemetryInfoUsingCursor']>(),
  getDeviceEvents: RpcRoute<IngestService['getDeviceEvents']>()
}

export type IngestServiceRequestContext = RpcEmptyRequestContext
export * from './models'
