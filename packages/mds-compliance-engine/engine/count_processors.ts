/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import type { GeographyDomainModel } from '@mds-core/mds-geography-service'
import { getPolygon } from '@mds-core/mds-geography-service'
import type { DeviceDomainModel } from '@mds-core/mds-ingest-service'
import type { CountPolicy, CountRule } from '@mds-core/mds-policy-service'
import type { Telemetry, UUID, VehicleEvent } from '@mds-core/mds-types'
import { clone, isDefined, pointInShape } from '@mds-core/mds-utils'
import type { ComplianceEngineResult, VehicleEventWithTelemetry } from '../@types'
import { ComplianceEngineLogger as logger } from '../logger'
import { annotateVehicleMap, isInStatesOrEvents, isInVehicleTypes, isRuleActive } from './helpers'
/**
 * @param event  We throw out events that have no telemetry, so events are guaranteed
 * to have telemetry.
 */
export function isCountRuleMatch(
  rule: CountRule,
  geographies: GeographyDomainModel[],
  device: DeviceDomainModel,
  event: VehicleEventWithTelemetry
) {
  if (isRuleActive(rule)) {
    for (const geography of rule.geographies) {
      if (isInStatesOrEvents(rule, device, event) && isInVehicleTypes(rule, device)) {
        const poly = getPolygon(geographies, geography)
        if (poly && pointInShape(event.telemetry.gps, poly)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * This one has the trickiest logic to understand. Basically, if a vehicle matches a rule, it is not
 * necessarily in violation of it. This is confusing because when a vehicle matches a speed rule or a
 * time rule, it's in violation of those rules. It's better to think of the vehicle as being captured
 * by a count rule.
 * Anyway, say a vehicle is captured by a count rule with a maximum of 5, and this is vehicle number
 * six. It overflows into evaluation for the next rule. If the vehicle is a match for the next rule,
 * and under that rule's maximum, it wouldn't count as violating anything. If a vehicle overflows, and
 * never matches for a subsequent rule, then it is considered in violation of the policy.
 */
export function processCountPolicy(
  policy: CountPolicy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: GeographyDomainModel[],
  devices: { [d: string]: DeviceDomainModel }
): ComplianceEngineResult | undefined {
  // Necessary because we destructively modify the devices list to keep track of which devices we've seen.
  const devicesToCheck = clone(devices)
  const matchedVehicles: { [d: string]: { device: DeviceDomainModel; rule_applied: UUID; rules_matched?: UUID[] } } = {}
  const overflowedVehicles: { [d: string]: { device: DeviceDomainModel; rules_matched: UUID[] } } = {}
  let countMinimumViolations = 0
  policy.rules.forEach(rule => {
    const maximum = isDefined(rule.maximum) ? rule.maximum : Number.POSITIVE_INFINITY
    const { rule_id } = rule
    let num_matches = 0
    events.forEach(event => {
      if (devicesToCheck[event.device_id]) {
        const device = devicesToCheck[event.device_id]
        if (!device) {
          logger.warn(`Device ${event.device_id} not found in devices list.`)
          return
        }
        if (isCountRuleMatch(rule as CountRule, geographies, device, event)) {
          if (num_matches < maximum) {
            matchedVehicles[device.device_id] = { device, rule_applied: rule_id, rules_matched: [rule_id] }
            delete devicesToCheck[device.device_id]
            delete overflowedVehicles[device.device_id]
          } else if (overflowedVehicles[device.device_id]) {
            // eslint-reason We literally check in the line above that this device entry exists in the overflowedVehicles map
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            overflowedVehicles[device.device_id]!.rules_matched.push(rule_id)
          } else {
            overflowedVehicles[device.device_id] = {
              device,
              rules_matched: [rule.rule_id]
            }
          }
          // Increment whenever there's a match.
          num_matches += 1
        }
      }
    })
    const rule_minimum = rule.minimum ?? Number.NEGATIVE_INFINITY
    if (num_matches < rule_minimum) {
      countMinimumViolations += rule_minimum - num_matches
    }
  })

  const excess_vehicles_count = Object.keys(overflowedVehicles).length
  const matchedVehiclesArr = annotateVehicleMap(policy, events, geographies, matchedVehicles, isCountRuleMatch)
  const overflowedVehiclesArr = annotateVehicleMap(policy, events, geographies, overflowedVehicles, isCountRuleMatch)

  return {
    vehicles_found: [...matchedVehiclesArr, ...overflowedVehiclesArr],
    violating_vehicles: overflowedVehiclesArr,
    excess_vehicles_count,
    total_violations: countMinimumViolations + excess_vehicles_count
  }
}
