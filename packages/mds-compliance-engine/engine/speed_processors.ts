import {
  Device,
  Geography,
  Policy,
  VehicleEvent,
  DAY_OF_WEEK,
  TIME_FORMAT,
  DAYS_OF_WEEK,
  UUID,
  CountRule,
  Rule,
  SpeedRule,
  TimeRule,
  Telemetry
} from '@mds-core/mds-types'

import { MatchedVehicleInformation, ComplianceResponseDomainModel } from '@mds-core/mds-compliance-service'
import { pointInShape, getPolygon, isInStatesOrEvents, now, RuntimeError, RULE_UNIT_MAP } from '@mds-core/mds-utils'
import moment from 'moment-timezone'
import { isInVehicleTypes, isPolicyActive, isRuleActive } from './helpers'

interface MatchedVehicle {
  device: Device
  event: VehicleEvent
}

type MatchedVehiclePlusRule = MatchedVehicle & { rule_id: UUID }

export function isSpeedRuleMatch(
  rule: SpeedRule,
  geographies: Geography[],
  device: Device,
  // We throw out events that have no telemetry.
  event: VehicleEvent & { telemetry: Telemetry }
) {
  if (isRuleActive(rule)) {
    for (const geography of rule.geographies) {
      if (
        isInStatesOrEvents(rule, event) &&
        isInVehicleTypes(rule, device) &&
        event.telemetry.gps.speed &&
        pointInShape(event.telemetry.gps, getPolygon(geographies, geography)) &&
        (!rule.maximum || event.telemetry.gps.speed >= rule.maximum)
      ) {
        return true
      }
    }
  }
  return false
}

export function processSpeedPolicy(
  policy: Policy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: Geography[],
  devicesToCheck: { [d: string]: Device }
) {
  const matchedVehicles: {
    [d: string]: { device: Device; event: VehicleEvent; rule_applied: UUID; rules_matched: UUID[] }
  } = {}
  if (isPolicyActive(policy)) {
    const sortedEvents = events.sort((e_1, e_2) => {
      return e_1.timestamp - e_2.timestamp
    })
    policy.rules.forEach(rule => {
      sortedEvents.forEach(event => {
        if (devicesToCheck[event.device_id]) {
          const device = devicesToCheck[event.device_id]
          if (isSpeedRuleMatch(rule as SpeedRule, geographies, device, event)) {
            matchedVehicles[device.device_id] = {
              device,
              event,
              rule_applied: rule.rule_id,
              rules_matched: [rule.rule_id]
            }
            /* eslint-reason need to remove matched vehicles */
            /* eslint-disable-next-line no-param-reassign */
            delete devicesToCheck[device.device_id]
          }
        }
      })
    })
  }
  return matchedVehicles
}
