import { VEHICLE_REASON_0_4_1, VehicleEvent_v0_4_1, VEHICLE_EVENT_0_4_1 } from '../@types'
import { VEHICLE_EVENT, VehicleEvent } from '../../index'

function convert_to_0_4_1_helper(event_type: VEHICLE_EVENT_0_4_1, event_type_reason?: VEHICLE_REASON_0_4_1) {
  return { event_type, event_type_reason }
}

function convert_event_type_to_event_type_and_reason(
  event_type: VEHICLE_EVENT
): { event_type: VEHICLE_EVENT_0_4_1; event_type_reason?: VEHICLE_REASON_0_4_1 } {
  switch (event_type) {
    case 'agency_drop_off': {
      return convert_to_0_4_1_helper('agency_drop_off')
    }
    case 'agency_pick_up': {
      return convert_to_0_4_1_helper('agency_pick_up')
    }
    case 'battery_low': {
      return convert_to_0_4_1_helper('service_end', 'low_battery')
    }
    case 'reservation_cancel': {
      return convert_to_0_4_1_helper('cancel_reservation')
    }
    case 'decommissioned': {
      return convert_to_0_4_1_helper('deregister', 'decommissioned')
    }
    case 'missing': {
      return convert_to_0_4_1_helper('deregister', 'missing')
    }
    case 'provider_drop_off': {
      return convert_to_0_4_1_helper('provider_drop_off')
    }
    case 'rebalance_pick_up': {
      return convert_to_0_4_1_helper('provider_pick_up', 'rebalance')
    }
    case 'maintenance_pick_up': {
      return convert_to_0_4_1_helper('provider_pick_up', 'maintenance')
    }
    case 'compliance_pick_up': {
      return convert_to_0_4_1_helper('provider_pick_up', 'compliance')
    }
    case 'reservation_start': {
      return convert_to_0_4_1_helper('reserve')
    }
    case 'on_hours': {
      return convert_to_0_4_1_helper('service_start')
    }
    case 'maintenance': {
      return convert_to_0_4_1_helper('service_end', 'maintenance')
    }
    case 'off_hours': {
      return convert_to_0_4_1_helper('service_end', 'off_hours')
    }
    case 'trip_end': {
      return convert_to_0_4_1_helper('trip_end')
    }
    case 'trip_enter_jurisdiction': {
      return convert_to_0_4_1_helper('trip_enter')
    }
    case 'trip_leave_jurisdiction': {
      return convert_to_0_4_1_helper('trip_leave')
    }
    case 'trip_start': {
      return convert_to_0_4_1_helper('trip_start')
    }
    default: {
      return { event_type: 'no_backconversion_available' }
    }
  }
}

function convert_v1_0_0_to_v0_4_1_helper(event: VehicleEvent, current_event_type: VEHICLE_EVENT): VehicleEvent_v0_4_1 {
  const { event_type, event_type_reason } = convert_event_type_to_event_type_and_reason(current_event_type)
  return {
    device_id: event.device_id,
    provider_id: event.provider_id,
    timestamp: event.timestamp,
    timestamp_long: event.timestamp_long,
    delta: event.delta,
    event_type,
    event_type_reason,
    telemetry_timestamp: event.telemetry_timestamp,
    trip_id: event.trip_id,
    service_area_id: null,
    recorded: event.recorded
  }
}

export function convert_v1_0_0_to_v0_4_1(event: VehicleEvent): VehicleEvent_v0_4_1[] {
  return event.event_types.map(event_type => {
    return convert_v1_0_0_to_v0_4_1_helper(event, event_type)
  })
}
