import { VEHICLE_EVENTS_0_4_1, VEHICLE_REASON_0_4_1, VehicleEvent_v0_4_1, VEHICLE_EVENT_0_4_1 } from '../@types'
import { VEHICLE_EVENT, VehicleEvent, VEHICLE_STATE } from '../../index'

type EVENT_TYPE_REASONS = VEHICLE_REASON_0_4_1 | 'no_event_type_reason'

export const FULL_STATE_MAPPING: {
  [P in VEHICLE_EVENT_0_4_1]: {
    [Q in EVENT_TYPE_REASONS]: {
      event_type: VEHICLE_EVENT
      vehicle_state: VEHICLE_STATE
    }
  }
} = {
  /* `agency_drop_off` included for the sake of completeness. No provider will ever submit such
   * an event type through the agency API.
   */
  agency_drop_off: { no_event_type_reason: { event_type: 'agency_drop_off', vehicle_state: 'available' } },
  agency_pick_up: { no_event_type_reason: { event_type: 'agency_pick_up', vehicle_state: 'removed' } },
  cancel_reservation: { no_event_type_reason: { event_type: 'reservation_cancel', vehicle_state: 'available' } },
  deregister: {
    decommissioned: { event_type: 'decommissioned', vehicle_state: 'removed' },
    missing: { event_type: 'missing', vehicle_state: 'removed' },
    no_event_type_reason: { event_type: 'unspecified', vehicle_state: 'unknown' }
  },
  provider_pick_up: {
    rebalance: { event_type: 'rebalance_pick_up', vehicle_state: 'removed' },
    maintenance: { event_type: 'maintenance_pick_up', vehicle_state: 'removed' },
    charge: { event_type: 'maintenance_pick_up', vehicle_state: 'removed' },
    compliance: { event_type: 'compliance_pick_up', vehicle_state: 'removed' },
    no_event_type_reason: { event_type: 'unspecified', vehicle_state: 'unknown' }
  },
  provider_drop_off: {
    no_event_type_reason: { event_type: 'provider_drop_off', vehicle_state: 'available' }
  },
  reserve: {
    no_event_type_reason: { event_type: 'reservation_start', vehicle_state: 'reserved' }
  },
  service_start: {
    no_event_type_reason: { event_type: 'on_hours', vehicle_state: 'available' }
  },
  service_end: {
    low_battery: { event_type: 'battery_low', vehicle_state: 'non_operational' },
    maintenance: { event_type: 'maintenance', vehicle_state: 'non_operational' },
    compliance: { event_type: 'compliance_pick_up', vehicle_state: 'non_operational' },
    off_hours: { event_type: 'off_hours', vehicle_state: 'non_operational' },
    no_event_type_reason: { event_type: 'unspecified', vehicle_state: 'non_operational' }
  },
  trip_end: {
    no_event_type_reason: { event_type: 'trip_end', vehicle_state: 'available' }
  },
  trip_enter: {
    no_event_type_reason: { event_type: 'trip_enter_jurisdiction', vehicle_state: 'on_trip' }
  },
  trip_leave: {
    no_event_type_reason: { event_type: 'trip_leave_jurisdiction', vehicle_state: 'elsewhere' }
  },
  trip_start: {
    no_event_type_reason: { event_type: 'trip_start', vehicle_state: 'on_trip' }
  },
  no_backconversion_available: {
    no_event_type_reason: { event_type: 'unspecified', vehicle_state: 'unknown' }
  }
}

function assign_1_0_0_fields(event_type: VEHICLE_EVENT, vehicle_state: VEHICLE_STATE) {
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
      return assign_1_0_0_fields('agency_drop_off', 'available')
    }
    case 'agency_pick_up': {
      return assign_1_0_0_fields('agency_pick_up', 'removed')
    }
    case 'cancel_reservation': {
      return assign_1_0_0_fields('reservation_cancel', 'available')
    }
    case 'deregister': {
      switch (event_type_reason) {
        case 'decommissioned': {
          return assign_1_0_0_fields('decommissioned', 'removed')
        }
        case 'missing': {
          return assign_1_0_0_fields('missing', 'removed')
        }
        default: {
          return assign_1_0_0_fields('unspecified', 'unknown')
        }
      }
    }
    case 'provider_drop_off': {
      return assign_1_0_0_fields('provider_drop_off', 'available')
    }
    case 'provider_pick_up': {
      switch (event_type_reason) {
        case 'rebalance': {
          return assign_1_0_0_fields('rebalance_pick_up', 'removed')
        }
        case 'maintenance': {
          return assign_1_0_0_fields('maintenance_pick_up', 'removed')
        }
        case 'charge': {
          return assign_1_0_0_fields('maintenance_pick_up', 'removed')
        }
        case 'compliance': {
          return assign_1_0_0_fields('compliance_pick_up', 'removed')
        }
        default: {
          return assign_1_0_0_fields('unspecified', 'unknown')
        }
      }
    }
    case 'reserve': {
      return assign_1_0_0_fields('reservation_start', 'reserved')
    }
    case 'service_start': {
      return assign_1_0_0_fields('on_hours', 'available')
    }
    case 'service_end': {
      switch (event_type_reason) {
        case 'low_battery': {
          return assign_1_0_0_fields('battery_low', 'non_operational')
        }
        case 'maintenance': {
          return assign_1_0_0_fields('maintenance', 'non_operational')
        }
        case 'compliance': {
          return assign_1_0_0_fields('compliance_pick_up', 'non_operational')
        }
        case 'off_hours': {
          return assign_1_0_0_fields('off_hours', 'non_operational')
        }
        default: {
          return assign_1_0_0_fields('unspecified', 'non_operational')
        }
      }
    }
    case 'trip_end': {
      return assign_1_0_0_fields('trip_end', 'available')
    }
    case 'trip_enter': {
      return assign_1_0_0_fields('trip_enter_jurisdiction', 'on_trip')
    }
    case 'trip_leave': {
      return assign_1_0_0_fields('trip_leave_jurisdiction', 'elsewhere')
    }
    case 'trip_start': {
      return assign_1_0_0_fields('trip_start', 'on_trip')
    }
    default: {
      return assign_1_0_0_fields('unspecified', 'unknown')
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
