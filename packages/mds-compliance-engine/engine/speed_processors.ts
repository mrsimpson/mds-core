import type { GeographyDomainModel } from '@mds-core/mds-geography-service'
import { getPolygon } from '@mds-core/mds-geography-service'
import type { DeviceDomainModel } from '@mds-core/mds-ingest-service'
import type { SpeedPolicy, SpeedRule } from '@mds-core/mds-policy-service'
import type { Telemetry, UUID, VehicleEvent } from '@mds-core/mds-types'
import { clone, pointInShape } from '@mds-core/mds-utils'
import type { ComplianceEngineResult, VehicleEventWithTelemetry } from '../@types'
import { ComplianceEngineLogger as logger } from '../logger'
import { annotateVehicleMap, isInStatesOrEvents, isInVehicleTypes, isRuleActive } from './helpers'

export function isSpeedRuleMatch(
  rule: SpeedRule,
  geographies: GeographyDomainModel[],
  device: DeviceDomainModel,
  event: VehicleEventWithTelemetry
) {
  if (isRuleActive(rule)) {
    for (const geography of rule.geographies) {
      if (
        isInStatesOrEvents(rule, device, event) &&
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
  policy: SpeedPolicy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: GeographyDomainModel[],
  devices: { [d: string]: DeviceDomainModel }
): ComplianceEngineResult | undefined {
  const matchedVehicles: {
    [d: string]: { device: DeviceDomainModel; speed?: number; rule_applied: UUID; rules_matched: UUID[] }
  } = {}
  // Necessary because we destructively modify the devices list to keep track of which devices we've seen.
  const devicesToCheck = clone(devices)
  policy.rules.forEach(rule => {
    events.forEach(event => {
      if (devicesToCheck[event.device_id]) {
        const device = devicesToCheck[event.device_id]
        if (!device) {
          logger.warn(`Device ${event.device_id} not found in devices list.`)
          return
        }
        if (isSpeedRuleMatch(rule as SpeedRule, geographies, device, event)) {
          matchedVehicles[device.device_id] = {
            device,
            rule_applied: rule.rule_id,
            rules_matched: [rule.rule_id],
            speed: event.telemetry.gps.speed as number
          }
          delete devicesToCheck[device.device_id]
        }
      }
    })
  })
  const matchedVehiclesArr = annotateVehicleMap(policy, events, geographies, matchedVehicles, isSpeedRuleMatch)
  return {
    vehicles_found: matchedVehiclesArr,
    violating_vehicles: matchedVehiclesArr,
    excess_vehicles_count: 0,
    total_violations: matchedVehiclesArr.length
  }
}
