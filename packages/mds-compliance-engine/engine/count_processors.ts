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

import {
  pointInShape,
  getPolygon,
  isInStatesOrEvents,
  now,
  RuntimeError,
  RULE_UNIT_MAP,
  isDefined
} from '@mds-core/mds-utils'
import moment from 'moment-timezone'
import { MatchedVehicleInformation } from '../@types'
import { createMatchedVehicleInformation, isInVehicleTypes, isPolicyActive, isRuleActive } from './helpers'

export function isCountRuleMatch(
  rule: CountRule,
  geographies: Geography[],
  device: Device,
  // We throw out events that have no telemetry, so events are guaranteed
  // to have telemetry.
  event: VehicleEvent & { telemetry: Telemetry }
) {
  if (isRuleActive(rule)) {
    for (const geography of rule.geographies) {
      if (isInStatesOrEvents(rule, event) && isInVehicleTypes(rule, device)) {
        const poly = getPolygon(geographies, geography)
        if (poly && pointInShape(event.telemetry.gps, poly)) {
          return true
        }
      }
    }
  }
  return false
}

export function processCountPolicy(
  policy: Policy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: Geography[],
  devicesToCheck: { [d: string]: Device }
): any {
  const matchedVehicles: {
    [d: string]: MatchedVehicleInformation
  } = {}
  const overflowedVehicles: {
    [d: string]: boolean
  } = {}
  let countMinimumViolations = 0
  if (isPolicyActive(policy)) {
    const sortedEvents = events.sort((e_1, e_2) => {
      return e_1.timestamp - e_2.timestamp
    })
    policy.rules.forEach(rule => {
      const maximum = isDefined(rule.maximum) ? rule.maximum : Number.POSITIVE_INFINITY
      let i = 0
      sortedEvents.forEach(event => {
        if (devicesToCheck[event.device_id]) {
          const device = devicesToCheck[event.device_id]
          if (isCountRuleMatch(rule as CountRule, geographies, device, event)) {
            if (i < maximum) {
              matchedVehicles[device.device_id] = createMatchedVehicleInformation(device, event, rule)
              /* eslint-reason need to remove matched vehicles */
              /* eslint-disable-next-line no-param-reassign */
              delete devicesToCheck[device.device_id]
              delete overflowedVehicles[device.device_id]
            } else {
              overflowedVehicles[device.device_id] = true
            }
          }
          /* If there's a match, increase i.
           */
          i += 1
        }
      })
      const minimum = rule.minimum == null ? Number.NEGATIVE_INFINITY : rule.minimum
      if (i < minimum) {
        countMinimumViolations += minimum - i
      }
    })
  }
  return {
    matchedVehicles,
    measured: Object.keys(matchedVehicles).length,
    overflowedVehicles,
    total_violations: countMinimumViolations + Object.keys(overflowedVehicles).length
  }
}
