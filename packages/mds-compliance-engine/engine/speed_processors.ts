import {
  Device,
  Geography,
  Policy,
  VehicleEvent,
  UUID,
  SpeedRule,
  Telemetry,
  CoreDevice,
  CoreEvent,
  BaseRule
} from '@mds-core/mds-types'

import { pointInShape, getPolygon, isInStatesOrEvents } from '@mds-core/mds-utils'
import { ComplianceEngineResult, VehicleEventWithTelemetry } from '../@types'
import { annotateVehicleMap, isInVehicleTypes, isRuleActive } from './helpers'

export interface MatcherFunction<R extends BaseRule, D extends CoreDevice, E extends CoreEvent> {
  (rule: R, device: D, event: E): boolean
}

export function checkMatchers<R extends BaseRule, D extends CoreDevice, E extends CoreEvent>(
  rule: R,
  device: D,
  event: E,
  ...matchers: MatcherFunction<R, D, E>[]
) {
  matchers.forEach(matcher => {
    if (!matcher(rule, device, event)) return false
  })
  return true
}

export function isGenericSpeedRuleMatch<D extends CoreDevice, E extends CoreEvent>(
  rule: SpeedRule,
  geographies: Geography[],
  device: D,
  event: E,
  matchers: MatcherFunction<SpeedRule, D, E>[]
) {
  if (isRuleActive(rule)) {
    for (const geography of rule.geographies) {
      if (
        checkMatchers(rule, device, event, ...matchers) &&
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

export function isSpeedRuleMatch(
  rule: SpeedRule,
  geographies: Geography[],
  device: Device,
  event: VehicleEventWithTelemetry
) {
  return isGenericSpeedRuleMatch(rule, geographies, device, event, [isInStatesOrEvents, isInVehicleTypes])
}

export function processSpeedPolicy(
  policy: Policy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: Geography[],
  devicesToCheck: { [d: string]: Device }
): ComplianceEngineResult | undefined {
  const matchedVehicles: {
    [d: string]: { device: Device; speed?: number; rule_applied: UUID; rules_matched: UUID[] }
  } = {}
  policy.rules.forEach(rule => {
    events.forEach(event => {
      if (devicesToCheck[event.device_id]) {
        const device = devicesToCheck[event.device_id]
        if (isSpeedRuleMatch(rule as SpeedRule, geographies, device, event)) {
          matchedVehicles[device.device_id] = {
            device,
            rule_applied: rule.rule_id,
            rules_matched: [rule.rule_id],
            speed: event.telemetry.gps.speed as number
          }
          /* eslint-reason need to remove matched vehicles */
          /* eslint-disable-next-line no-param-reassign */
          delete devicesToCheck[device.device_id]
        }
      }
    })
  })
  const matchedVehiclesArr = annotateVehicleMap(policy, events, geographies, matchedVehicles, isSpeedRuleMatch)
  return {
    vehicles_found: matchedVehiclesArr,
    excess_vehicles_count: 0,
    total_violations: matchedVehiclesArr.length
  }
}
