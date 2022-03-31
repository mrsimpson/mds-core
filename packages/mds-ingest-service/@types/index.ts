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
import type {
  DeviceDomainModel,
  EventAnnotationDomainCreateModel,
  EventAnnotationDomainModel,
  EventDomainCreateModel,
  EventDomainModel,
  EventWithDeviceAndTelemetryInfoDomainModel,
  GROUPING_TYPE,
  H3_RESOLUTIONS,
  TelemetryAnnotationDomainCreateModel,
  TelemetryAnnotationDomainModel,
  TelemetryDomainModel
} from './models'

type ResponseWithCursor<T extends {}> = T & {
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

export const GetVehicleEventsOrderColumn = <const>['timestamp', 'provider_id', 'vehicle_state']

export type GetVehicleEventsOrderColumn = typeof GetVehicleEventsOrderColumn[number]

export const GetVehicleEventsOrderDirection = <const>['ASC', 'DESC']

export type GetVehicleEventsOrderDirection = typeof GetVehicleEventsOrderDirection[number]

export type GetVehicleEventsOrderOption = {
  column: GetVehicleEventsOrderColumn
  direction?: GetVehicleEventsOrderDirection
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
}

export type GetVehicleEventsResponse = ResponseWithCursor<{
  events: EventDomainModel[]
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
  getEventsUsingOptions: (params: GetVehicleEventsFilterParams) => GetVehicleEventsResponse
  getEventsUsingCursor: (cursor: string) => GetVehicleEventsResponse
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
