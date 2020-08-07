/* This file contains the v0.4.1 versions of the VehicleEvent type and all related
 * types. The main differences between v0.4.1 and v1.0.0 are:
 *    1. Originally, a VehicleEvent could have only one `event_type`. Now, providers are
 *  allowed to send multiple event_types in an array.
 *    2. The field `event_type_reason` is deprecated in v1.0.0.
 *    3. The number of valid event_types has been expanded, and many of them correspond to
 *  former `event_type_reasons`.
 */

import { UUID, Timestamp, Telemetry } from '../../index'

export const VEHICLE_REASONS_0_4_1 = [
  'battery_charged',
  'charge',
  'compliance',
  'decommissioned',
  'low_battery',
  'maintenance',
  'missing',
  'off_hours',
  'rebalance'
]
export type VEHICLE_REASON_0_4_1 = typeof VEHICLE_REASONS_0_4_1[number]

export const VEHICLE_EVENTS_0_4_1 = [
  'register',
  'service_start',
  'service_end',
  'provider_drop_off',
  'provider_pick_up',
  'agency_pick_up',
  'agency_drop_off',
  'reserve',
  'cancel_reservation',
  'trip_start',
  'trip_enter',
  'trip_leave',
  'trip_end',
  'deregister',
  'no_backconversion_available'
] as const

export type VEHICLE_EVENT_0_4_1 = typeof VEHICLE_EVENTS_0_4_1[number]

export interface VehicleEvent_v0_4_1 {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  timestamp_long?: string | null
  delta?: Timestamp | null
  event_type: VEHICLE_EVENT_0_4_1
  event_type_reason?: VEHICLE_REASON_0_4_1 | null
  telemetry_timestamp?: Timestamp | null
  telemetry?: Telemetry | null
  trip_id?: UUID | null
  service_area_id?: UUID | null
  recorded: Timestamp
}
