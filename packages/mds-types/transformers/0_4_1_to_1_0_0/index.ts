import { VEHICLE_REASON_0_4_1, VehicleEvent_v0_4_1, VEHICLE_EVENT_0_4_1 } from '../@types'
import { VEHICLE_EVENT, VehicleEvent, VEHICLE_STATE } from '../../index'

function map_helper(event_type: VEHICLE_EVENT, vehicle_state: VEHICLE_STATE) {
  return { event_type, vehicle_state }
}

function map_v_0_4_1_fields_to_v_1_0_0_fields(
  event_type: VEHICLE_EVENT_0_4_1,
  event_type_reason: VEHICLE_REASON_0_4_1 | null | undefined
): { event_type: VEHICLE_EVENT; vehicle_state: VEHICLE_STATE } {
  switch (event_type) {
    /* `agency_drop_off` included for the sake of completeness. No provider will ever submit such
     * an event type through the agency API.
     */
    case 'agency_drop_off': {
      return map_helper('agency_drop_off', 'available')
    }
    case 'agency_pick_up': {
      return map_helper('agency_pick_up', 'removed')
    }
    case 'cancel_reservation': {
      return map_helper('reservation_cancel', 'available')
    }
    case 'deregister': {
      switch (event_type_reason) {
        case 'decommissioned': {
          return map_helper('decommissioned', 'removed')
        }
        case 'missing': {
          return map_helper('missing', 'removed')
        }
        default: {
          return map_helper('unspecified', 'unknown')
        }
      }
    }
    case 'provider_drop_off': {
      return map_helper('provider_drop_off', 'available')
    }
    case 'provider_pick_up': {
      switch (event_type_reason) {
        case 'rebalance': {
          return map_helper('rebalance_pick_up', 'removed')
        }
        case 'maintenance': {
          return map_helper('maintenance_pick_up', 'removed')
        }
        case 'charge': {
          return map_helper('maintenance_pick_up', 'removed')
        }
        case 'compliance': {
          return map_helper('compliance_pick_up', 'removed')
        }
        default: {
          return map_helper('unspecified', 'unknown')
        }
      }
    }
    case 'reserve': {
      return map_helper('reservation_start', 'reserved')
    }
    case 'service_start': {
      return map_helper('on_hours', 'available')
    }
    case 'service_end': {
      switch (event_type_reason) {
        case 'low_battery': {
          return map_helper('battery_low', 'non_operational')
        }
        case 'maintenance': {
          return map_helper('maintenance', 'non_operational')
        }
        case 'compliance': {
          return map_helper('compliance_pick_up', 'non_operational')
        }
        case 'off_hours': {
          return map_helper('off_hours', 'non_operational')
        }
        default: {
          return map_helper('unspecified', 'non_operational')
        }
      }
    }
    case 'trip_end': {
      return map_helper('trip_end', 'available')
    }
    case 'trip_enter': {
      return map_helper('trip_enter_jurisdiction', 'on_trip')
    }
    case 'trip_leave': {
      return map_helper('trip_leave_jurisdiction', 'elsewhere')
    }
    case 'trip_start': {
      return map_helper('trip_start', 'on_trip')
    }
    default: {
      return map_helper('unspecified', 'unknown')
    }
  }
}

export function convert_v0_4_1_to_v1_0_0(event: VehicleEvent_v0_4_1): VehicleEvent {
  const {
    device_id,
    provider_id,
    timestamp,
    timestamp_long = null,
    delta = null,
    event_type,
    event_type_reason = null,
    telemetry_timestamp = null,
    telemetry = null,
    trip_id = null,
    recorded
  } = event
  const { event_type: new_event_type, vehicle_state } = map_v_0_4_1_fields_to_v_1_0_0_fields(
    event_type,
    event_type_reason
  )
  return {
    device_id,
    provider_id,
    timestamp,
    timestamp_long,
    delta,
    vehicle_state,
    event_types: [new_event_type],
    telemetry_timestamp,
    telemetry,
    trip_id,
    recorded
  }
}
