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
import type { TimePolicy, TimeRule } from '@mds-core/mds-policy-service'
import type { Telemetry, UUID, VehicleEvent } from '@mds-core/mds-types'
import { clone, now, pointInShape, RULE_UNIT_MAP } from '@mds-core/mds-utils'
import type { ComplianceEngineResult } from '../@types'
import { ComplianceEngineLogger as logger } from '../logger'
import { annotateVehicleMap, isInStatesOrEvents, isInVehicleTypes, isRuleActive } from './helpers'

export function isTimeRuleMatch(
  rule: TimeRule,
  geographies: GeographyDomainModel[],
  device: DeviceDomainModel,
  // We throw out events that have no telemetry.
  event: VehicleEvent & { telemetry: Telemetry }
) {
  if (isRuleActive(rule)) {
    for (const geography of rule.geographies) {
      if (
        isInStatesOrEvents(rule, device, event) &&
        isInVehicleTypes(rule, device) &&
        (!rule.maximum || (now() - event.timestamp) / RULE_UNIT_MAP[rule.rule_units] >= rule.maximum)
      ) {
        const poly = getPolygon(geographies, geography)
        if (poly && pointInShape(event.telemetry.gps, poly)) {
          return true
        }
      }
    }
  }
  return false
}

export function processTimePolicy(
  policy: TimePolicy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: GeographyDomainModel[],
  devices: { [d: string]: DeviceDomainModel }
): ComplianceEngineResult | undefined {
  const matchedVehicles: {
    [d: string]: { device: DeviceDomainModel; rule_applied: UUID; rules_matched: UUID[] }
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

        if (isTimeRuleMatch(rule as TimeRule, geographies, device, event)) {
          matchedVehicles[device.device_id] = {
            device,
            rule_applied: rule.rule_id,
            rules_matched: [rule.rule_id]
          }
          delete devicesToCheck[device.device_id]
        }
      }
    })
  })
  const matchedVehiclesArr = annotateVehicleMap(policy, events, geographies, matchedVehicles, isTimeRuleMatch)
  return {
    vehicles_found: matchedVehiclesArr,
    violating_vehicles: matchedVehiclesArr,
    excess_vehicles_count: 0,
    total_violations: matchedVehiclesArr.length
  }
}
