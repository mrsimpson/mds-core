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

import { MatchedVehicleInformation, ComplianceResponseDomainModel } from '@mds-core/mds-compliance-service'
import { pointInShape, getPolygon, isInStatesOrEvents, now, RuntimeError, RULE_UNIT_MAP } from '@mds-core/mds-utils'
import moment from 'moment-timezone'
import { annotateVehicleMap, isInVehicleTypes, isPolicyActive, isRuleActive } from './helpers'
import { ComplianceResult } from '../@types'

interface MatchedVehicle {
  device: Device
  event: VehicleEvent
}

interface CountMatch {
  measured: number
  geography_id: UUID
  matched_vehicles: MatchedVehicle[]
}

interface TimeMatch {
  measured: number
  geography_id: UUID
  matched_vehicle: MatchedVehicle
}

interface SpeedMatch {
  measured: number
  geography_id: UUID
  matched_vehicle: MatchedVehicle
}

interface ReducedMatch {
  measured: number
  geography_id: UUID
}

type MatchedVehiclePlusRule = MatchedVehicle & { rule_id: UUID }

export interface Compliance {
  rule: Rule
  matches: ReducedMatch[] | CountMatch[] | TimeMatch[] | SpeedMatch[]
}
export interface ComplianceResponse {
  policy: Policy
  compliance: Compliance[]
  total_violations: number
  vehicles_in_violation: MatchedVehiclePlusRule[]
}

export function isTimeRuleMatch(
  rule: TimeRule,
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
  policy: Policy,
  events: (VehicleEvent & { telemetry: Telemetry })[],
  geographies: Geography[],
  devicesToCheck: { [d: string]: Device }
): ComplianceResult | undefined {
  const matchedVehicles: {
    [d: string]: { device: Device; rule_applied: UUID }
  } = {}
  if (isPolicyActive(policy)) {
    const sortedEvents = events.sort((e_1, e_2) => {
      return e_1.timestamp - e_2.timestamp
    })
    policy.rules.forEach(rule => {
      sortedEvents.forEach(event => {
        if (devicesToCheck[event.device_id]) {
          const device = devicesToCheck[event.device_id]
          if (isTimeRuleMatch(rule as TimeRule, geographies, device, event)) {
            matchedVehicles[device.device_id] = {
              device,
              rule_applied: rule.rule_id
            }
            /* eslint-reason need to remove matched vehicles */
            /* eslint-disable-next-line no-param-reassign */
            delete devicesToCheck[device.device_id]
          }
        }
      })
    })
    const matchedVehiclesArr = annotateVehicleMap(policy, sortedEvents, geographies, matchedVehicles, isTimeRuleMatch)
    return {
      vehicles_found: matchedVehiclesArr,
      excess_vehicles_count: 0,
      total_violations: matchedVehiclesArr.length
    }
  }
}
