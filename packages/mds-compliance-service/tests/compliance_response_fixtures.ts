import { uuid, yesterday } from '@mds-core/mds-utils'
import { ComplianceResponseDomainModel } from '../@types'

export const COMPLIANCE_RESPONSE_ID = 'dceece80-c05a-430f-be7d-e95c954f0d34'
/*
export interface MatchedVehicleInformation {
  device_id: UUID
  state: VEHICLE_STATUS
  event_types: VEHICLE_EVENT[]
  timestamp: Timestamp
 rules_matched: UUID[]
 rule_applied: UUID // a device can only ever match one rule for the purpose of computing compliance, however
 speed?: number | null
 speed_unit?: number | null
 speed_measurement?: number | null
 gps: {
   lat: number
   lng: number
 }
}
*/

const DEVICE_ID_1 = uuid()

const RULE_ID_1 = uuid()

// TODO
// use some test policy and test data to generate some ComplianceResponse objects
// that are valid results of the compliance engine

export const COMPLIANCE_RESPONSE_1: any = {
  compliance_response_id: COMPLIANCE_RESPONSE_ID,
  compliance_as_of: yesterday(),
  policy: {
    policy_name: 'LADOT Mobility Caps',
    policy_id: '72971a3d-876c-41ea-8e48-c9bb965bbbcc'
  },
  excess_vehicles_count: 1,
  total_violations: 1,
  vehicles_found: [
    {
      device_id: DEVICE_ID_1,
      state: 'available',
      event_types: ['trip_end'],
      timestamp: yesterday(),
      rules_matched: [RULE_ID_1],
      rule_applied: RULE_ID_1, // a device can only ever match one rule for the purpose of computing compliance, however
      speed: null,
      speed_unit: null,
      speed_measurement: null,
      gps: {
        lat: 1,
        lng: 1
      }
    }
  ]
}
