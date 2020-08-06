import {
  UUID,
  Timestamp,
  VEHICLE_EVENT,
  Telemetry,
  VehicleEvent_v0_4_1,
  VEHICLE_REASON_0_4_1,
  VEHICLE_EVENT_0_4_1,
  VehicleEvent,
  VEHICLE_STATE
} from '../index'

function convert_event_type_and_event_type_reason_to_event_type(
  event_type: VEHICLE_EVENT_0_4_1,
  event_type_reason: VEHICLE_REASON_0_4_1 | null | undefined
): VEHICLE_EVENT {
  switch (event_type) {
    case 'service_start': {
      return 'on_hours'
    }
    case 'service_end': {
      switch (event_type_reason) {
        case 'low_battery': {
          return 'battery_low'
        }
        case 'maintenance': {
          return 'maintenance'
        }
        case 'compliance': {
          return 'compliance_pick_up'
        }
        case 'off_hours': {
          return 'off_hours'
        }
        default: {
          return 'unspecified'
        }
      }
    }
    case 'provider_pick_up': {
      switch (event_type_reason) {
        case 'rebalance': {
          return 'rebalance_pick_up'
        }
        case 'maintenance': {
          return 'maintenance_pick_up'
        }
        case 'charge': {
          return 'maintenance_pick_up'
        }
        case 'compliance': {
          return 'compliance_pick_up'
        }
        default: {
          return 'unspecified'
        }
      }
    }
    case 'deregister': {
      switch (event_type_reason) {
        case 'decommissioned': {
          return 'decommissioned'
        }
        case 'missing': {
          return 'missing'
        }
        default: {
          return 'unspecified'
        }
      }
    }
    case 'agency_pick_up': {
      return 'agency_pick_up'
    }
    case 'reserve': {
      return 'reservation_start'
    }
    case 'cancel_reservation': {
      return 'reservation_cancel'
    }
    case 'trip_start': {
      return 'trip_start'
    }
    case 'trip_enter': {
      return 'trip_enter_jurisdiction'
    }
    case 'trip_leave': {
      return 'trip_leave_jurisdiction'
    }
    case 'trip_end': {
      return 'trip_end'
    }
    default: {
      return 'unspecified'
    }
  }
}
/*
  "agency_drop_off",
 "agency_pick_up",
 "cancel_reservation",
 "deregister",
 "provider_drop_off",
 "provider_pick_up",
 "register",
 "reserve",
 "service_end",
 "service_start",
 "trip_end",
 "trip_enter",
 "trip_leave",
 "trip_start"
*/
export function convert_event_type_to_vehicle_state(event_type: VEHICLE_EVENT_0_4_1): VEHICLE_STATE {
  switch (event_type) {
    case 'agency_drop_off': {
      return 'available'
    }
    case 'agency_pick_up': {
      return 'removed'
    }
    case 'cancel_reservation': {
      return 'available'
    }
    case 'deregister': {
      return 'removed'
    }
    case 'provider_drop_off': {
      return 'available'
    }
    case 'provider_pick_up': {
      return 'removed'
    }
    case 'register': {
      return 'removed'
    }
    case 'reserve': {
      return 'reserved'
    }
    case 'service_end': {
      return 'non_operational'
    }
    case 'service_start': {
      return 'available'
    }
    case 'trip_end': {
      return 'available'
    }
    case 'trip_leave': {
      return 'elsewhere'
    }
    case 'trip_start': {
      return 'on_trip'
    }
    default: {
      return 'unknown'
    }
  }
}

export function v0_4_1_to_v1_0_0(event: VehicleEvent_v0_4_1): VehicleEvent {
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

  return {
    device_id,
    provider_id,
    timestamp,
    timestamp_long,
    delta,
    vehicle_state: convert_event_type_to_vehicle_state(event_type),
    event_types: [convert_event_type_and_event_type_reason_to_event_type(event_type, event_type_reason)],
    telemetry_timestamp,
    telemetry,
    trip_id,
    recorded
  }
}
/*

function v1_0_0_to_v0_4_0_helper(event: VehicleEvent_v1_0_0, event_type: VEHICLE_REASON | null): VehicleEvent_v0_4_1 {
  return {
    device_id: event.device_id,
    provider_id: event.provider_id,
    timestamp: event.timestamp,
    timestamp_long: event.timestamp_long,
    delta: event.delta,
    event_type: event.vehicle_state,
    event_type_reason: event_type,
    telemetry_timestamp: event.telemetry_timestamp,
    trip_id: event.trip_id,
    service_area_id: event.service_area_id,
    recorded: event.recorded
  }
}

export function v1_0_0_to_v0_4_0(event: VehicleEvent_v1_0_0): VehicleEvent_v0_4_1[] {
  if (event.event_types.length > 0) {
    return event.event_types.map(event_type => {
      return v1_0_0_to_v0_4_0_helper(event, event_type)
    })
  }
  return [v1_0_0_to_v0_4_0_helper(event, null)]
}
*/
