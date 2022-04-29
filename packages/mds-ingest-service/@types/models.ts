import type { DomainModelCreate, IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import type {
  ACCESSIBILITY_OPTION,
  DeepPartial,
  MODALITY,
  Nullable,
  PROPULSION_TYPE,
  TelemetryData,
  Timestamp,
  TRIP_STATE,
  UUID,
  VEHICLE_EVENT,
  VEHICLE_STATE,
  VEHICLE_TYPE
} from '@mds-core/mds-types'
import type { EventEntityModel } from '../repository/entities/event-entity'
export interface DeviceDomainModel extends RecordedColumn {
  device_id: UUID
  provider_id: UUID
  vehicle_id: string
  vehicle_type: VEHICLE_TYPE
  propulsion_types: PROPULSION_TYPE[]

  year: Nullable<number>
  mfgr: Nullable<string>
  model: Nullable<string>
  accessibility_options: Nullable<ACCESSIBILITY_OPTION[]>
  modality: MODALITY
}

export type DeviceDomainCreateModel = DomainModelCreate<Omit<DeviceDomainModel, keyof RecordedColumn>>

export type GpsData = Omit<TelemetryData, 'charge'>

export interface EventDomainModel extends RecordedColumn {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  event_types: VEHICLE_EVENT[]
  vehicle_state: VEHICLE_STATE
  trip_state: Nullable<TRIP_STATE>

  telemetry_timestamp: Timestamp
  telemetry: TelemetryDomainModel
  annotation: Nullable<EventAnnotationDomainModel>
  trip_id: Nullable<UUID>
}

export type PartialEventDomainModel = Omit<DeepPartial<EventDomainModel>, 'telemetry'> & {
  telemetry: DeepPartial<TelemetryDomainModel>
  device?: Partial<DeviceDomainModel>
}

export type PartialEventEntityModel = Omit<DeepPartial<EventEntityModel>, 'telemetry'> & {
  telemetry: DeepPartial<TelemetryDomainModel>
}

export type EventDomainCreateModel = DomainModelCreate<
  Omit<EventDomainModel, keyof RecordedColumn | 'telemetry' | 'telemetry_timestamp'>
> & {
  telemetry: TelemetryDomainCreateModel
}

export type MigratedEventDomainModel = Omit<EventDomainModel & IdentityColumn, 'telemetry' | 'annotation'>

export interface TelemetryDomainModel extends RecordedColumn {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  gps: GpsData
  charge: Nullable<number>
  stop_id: Nullable<UUID>
}

export type TelemetryDomainCreateModel = DomainModelCreate<Omit<TelemetryDomainModel, keyof RecordedColumn | 'gps'>> & {
  gps: DomainModelCreate<GpsData>
}

export const GROUPING_TYPES = ['latest_per_vehicle', 'latest_per_trip', 'all_events'] as const
export type GROUPING_TYPE = typeof GROUPING_TYPES[number]

export interface TelemetryAnnotationDomainModel {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  h3_08: string
  h3_09: string
  h3_10: string
  h3_11: string
  h3_12: string
  h3_13: string
  telemetry_row_id: number
  geography_ids: UUID[]
}

export const H3_RESOLUTIONS = <const>['h3_08', 'h3_09', 'h3_10', 'h3_11', 'h3_12', 'h3_13']
export type H3_RESOLUTIONS = typeof H3_RESOLUTIONS[number]

export const K_HOURLY = 2
export const K_DAILY = 2
export const K_MONTHLY = 1

export type TelemetryAnnotationDomainCreateModel = TelemetryAnnotationDomainModel
/**
 * Labels which can be used to annotate events.
 */
export interface DeviceLabel {
  vehicle_id: string
  vehicle_type: VEHICLE_TYPE
  propulsion_types: PROPULSION_TYPE[]
}

export interface GeographyLabel {
  geography_type: Nullable<string>
  geography_id: UUID
}

export interface GeographiesLabel {
  geographies: Array<GeographyLabel>
}

interface FlatGeographiesLabel {
  geography_ids: UUID[]
  geography_types: (string | null)[]
}

export interface LatencyLabel {
  latency_ms: Timestamp
}

export interface TelemetryLabel {
  telemetry_timestamp: Timestamp
  telemetry_gps_lat: number
  telemetry_gps_lng: number
  telemetry_gps_altitude: Nullable<number>
  telemetry_gps_heading: Nullable<number>
  telemetry_gps_speed: Nullable<number>
  telemetry_gps_accuracy: Nullable<number>
  telemetry_charge: Nullable<number>
}

/**
 * An object to persist the above (non-telemetry) event labels,
 * joinable to EventDomainModels by device_id + timestamp. Can
 * also join by events_row_id.
 */
export interface EventAnnotationDomainModel extends DeviceLabel, FlatGeographiesLabel, LatencyLabel, RecordedColumn {
  device_id: UUID
  timestamp: Timestamp
}

export type EventAnnotationDomainCreateModel = DomainModelCreate<
  Omit<EventAnnotationDomainModel, keyof RecordedColumn>
> & { events_row_id: number }

export type EventWithDeviceAndTelemetryInfoDomainModel = Omit<EventDomainModel, 'annotation'> & {
  device: DeviceDomainModel
  telemetry: TelemetryDomainModel
}
