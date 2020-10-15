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
import { pointInShape, getPolygon, isInStatesOrEvents, now, isDefined, RULE_UNIT_MAP } from '@mds-core/mds-utils'
import moment from 'moment-timezone'
import { isInVehicleTypes, isPolicyActive, isRuleActive } from './helpers'

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

function getViolationsArray(map: { [key: string]: MatchedVehiclePlusRule }) {
  return Object.values(map)
}

function processCountRule(
  rule: CountRule,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device }
): Compliance & { matches: CountMatch[] | null } {
  const maximum = isDefined(rule.maximum) ? rule.maximum : Number.POSITIVE_INFINITY
  if (isRuleActive(rule)) {
    const matches: CountMatch[] = rule.geographies.reduce(
      (matches_acc: CountMatch[], geography: string): CountMatch[] => {
        const matched_vehicles: MatchedVehicle[] = events.reduce(
          (matched_vehicles_acc: MatchedVehicle[], event: VehicleEvent): MatchedVehicle[] => {
            const device: Device | undefined = devices[event.device_id]
            if (event.telemetry && device) {
              if (isInStatesOrEvents(rule, event) && isInVehicleTypes(rule, device)) {
                const poly = getPolygon(geographies, geography)
                if (poly && pointInShape(event.telemetry.gps, poly)) {
                  // push devices that are in violation
                  matched_vehicles_acc.push({ device, event })
                }
              }
            }
            return matched_vehicles_acc
          },
          []
        )
        matches_acc.push({
          geography_id: geography,
          // We cap the # of measured vehicles at the maximum, because vehicles that are over
          // the maximum will overflow into the next rule, for which they might be normal matches.
          measured: maximum && matched_vehicles.length > maximum ? maximum : matched_vehicles.length,
          matched_vehicles
        })
        return matches_acc
      },
      []
    )
    return { rule, matches }
  }
  return { rule, matches: [] }
}

function processTimeRule(
  rule: TimeRule,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device }
): Compliance & { matches: TimeMatch[] | null } {
  if (isRuleActive(rule)) {
    const matches: TimeMatch[] = rule.geographies.reduce((matches_acc: TimeMatch[], geography: string): TimeMatch[] => {
      events.forEach((event: VehicleEvent) => {
        const device: Device | undefined = devices[event.device_id]
        if (event.telemetry && device) {
          if (
            isInStatesOrEvents(rule, event) &&
            isInVehicleTypes(rule, device) &&
            (!rule.maximum || (now() - event.timestamp) / RULE_UNIT_MAP[rule.rule_units] >= rule.maximum)
          ) {
            const poly = getPolygon(geographies, geography)
            if (poly && pointInShape(event.telemetry.gps, poly)) {
              matches_acc.push({
                measured: now() - event.timestamp,
                geography_id: geography,
                matched_vehicle: { device, event }
              })
            }
          }
        }
      })
      return matches_acc
    }, [])
    return { rule, matches }
  }
  return { rule, matches: [] }
}

// TODO Add types for speed policies
/* eslint-disable @typescript-eslint/no-explicit-any */
function processSpeedRule(
  rule: SpeedRule,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device }
): Compliance & { matches: SpeedMatch[] | null } {
  if (isRuleActive(rule)) {
    const matches_result: SpeedMatch[] = rule.geographies.reduce((matches: any[], geography: string) => {
      events.forEach((event: VehicleEvent) => {
        const device: Device | undefined = devices[event.device_id]
        if (event.telemetry && device) {
          if (
            isInStatesOrEvents(rule, event) &&
            isInVehicleTypes(rule, device) &&
            event.telemetry.gps.speed &&
            pointInShape(event.telemetry.gps, getPolygon(geographies, geography)) &&
            (!rule.maximum || event.telemetry.gps.speed >= rule.maximum)
          ) {
            matches.push({
              measured: event.telemetry.gps.speed,
              geography_id: geography,
              matched_vehicle: { device, event }
            })
          }
        }
      })
      return matches
    }, [])
    return { rule, matches: matches_result }
  }
  return { rule, matches: [] }
}

export function processPolicyByProviderId(
  policy: Policy,
  provider_id: UUID,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device }
): ComplianceResponse | undefined {
  if (isPolicyActive(policy)) {
    const sortedEvents = events.sort((e_1, e_2) => {
      return e_1.timestamp - e_2.timestamp
    })
    const vehiclesToFilter: MatchedVehicle[] = []
    /*
     * For a count rule, the vehicles that exceed the maximum go into this
     * overflowVehiclesMap variable. E.g. if a count rule has a maximum of 10,
     * and 15 vehicles match, 10 vehicles go into vehiclesMatched, and 5 go into
     * overflowVehiclesMap.
     */

    let countVehiclesMap: { [d: string]: MatchedVehiclePlusRule } = {}
    let countMinimumViolations = 0
    const timeVehiclesMap: { [d: string]: MatchedVehiclePlusRule } = {}
    const speedingVehiclesMap: { [d: string]: MatchedVehiclePlusRule } = {}
    const compliance: Compliance[] = policy.rules.reduce((compliance_acc: Compliance[], rule: Rule): Compliance[] => {
      // Even if a vehicle breaks two rules, it will be counted in violation of only the first rule.
      // So we must filter it out so it's not included in the processing of any other policy rules.
      vehiclesToFilter.forEach((vehicle: MatchedVehicle) => {
        /* eslint-reason need to remove matched vehicles */
        /* eslint-disable-next-line no-param-reassign */
        delete devices[vehicle.device.device_id]
      })

      switch (rule.rule_type) {
        case 'count': {
          let overflowVehiclesMap: { [key: string]: MatchedVehiclePlusRule } = {}
          const comp: Compliance & { matches: CountMatch[] } = processCountRule(
            rule,
            sortedEvents,
            geographies,
            devices
          )

          // comp here looks like this:
          /*
            {
              rule: Rule
              matches:
                {
                  measured: number
                  geography_id: UUID
                  matched_vehicles: MatchedVehicle[]
                }[]

            }
          */

          // not sure what's going on but basically the `CountMatches` get turned into `ReducedMatches`
          const compressedComp = {
            rule,
            matches: comp.matches
              ? comp.matches.reduce((acc: { measured: number; geography_id: UUID }[], inst: CountMatch) => {
                  const { measured, geography_id } = inst
                  return [...acc, { measured, geography_id }]
                }, [])
              : []
          }

          // need a pair of nested reduces because processCountRule basically returns an array of arrays of
          // matched vehicles
          // vehicles that are over the count maximum go into the overflowVehiclesMap
          const bucketMap = comp.matches.reduce(
            (acc2: { matched: MatchedVehicle[]; overflowed: MatchedVehiclePlusRule[] }[], match) => {
              return [
                ...acc2,
                match.matched_vehicles.reduce(
                  (
                    acc: { matched: MatchedVehicle[]; overflowed: MatchedVehiclePlusRule[] },
                    match_instance: MatchedVehicle,
                    i: number
                  ) => {
                    // If the rule has a defined maximum, use it, even if 0
                    const maximum = rule.maximum == null ? Number.POSITIVE_INFINITY : rule.maximum
                    if (maximum && i < maximum) {
                      // A device could already be in overflowVehiclesMap if it was already overflowing
                      // from the previous rule. If the current device had overflowed the previous rule,
                      // but is under the count limit for the current rule, it is no longer overflowing.
                      // So it must be removed.
                      //                      if (overflowVehiclesMap[match_instance.device.device_id]) {
                      //                        delete overflowVehiclesMap[match_instance.device.device_id]
                      //                      }
                      if (countVehiclesMap[match_instance.device.device_id]) {
                        delete countVehiclesMap[match_instance.device.device_id]
                      }
                      acc.matched.push(match_instance)
                    } else {
                      acc.overflowed.push({ ...match_instance, rule_id: rule.rule_id })
                    }
                    return acc
                  },
                  { matched: [], overflowed: [] }
                )
              ]
            },
            []
          )

          const vehiclesMatched = bucketMap.reduce((acc: MatchedVehicle[], map) => {
            return [...acc, ...map.matched]
          }, [])
          vehiclesToFilter.push(...vehiclesMatched)

          const overflowVehicles = bucketMap.reduce((acc: MatchedVehiclePlusRule[], map) => {
            return [...acc, ...map.overflowed]
          }, [])

          // Add overflowed vehicles to the overall overflowVehiclesMap.
          overflowVehiclesMap = {
            ...overflowVehiclesMap,
            ...overflowVehicles.reduce(
              (acc: { [key: string]: MatchedVehiclePlusRule }, match: MatchedVehiclePlusRule) => {
                acc[match.device.device_id] = match
                return acc
              },
              {}
            )
          }

          // only vehicles in count maximum violation are in overflow
          // no vehicles are in violation if it's a mininimum violation,
          // but # of violations goes up
          const minimum = rule.minimum == null ? Number.NEGATIVE_INFINITY : rule.minimum

          if (overflowVehicles.length > 0) {
            countVehiclesMap = { ...countVehiclesMap, ...overflowVehiclesMap }
          } else if (vehiclesMatched.length < minimum) {
            countMinimumViolations += minimum - vehiclesMatched.length
          }

          compliance_acc.push(compressedComp)

          break
        }
        case 'time': {
          const comp: Compliance & { matches: TimeMatch[] | null } = processTimeRule(
            rule,
            sortedEvents,
            geographies,
            devices
          )
          compliance_acc.push(comp)

          const timeVehicles = comp.matches
            ? comp.matches.reduce((acc: MatchedVehicle[], match: TimeMatch) => {
                const { matched_vehicle } = match
                timeVehiclesMap[matched_vehicle.device.device_id] = { ...matched_vehicle, ...{ rule_id: rule.rule_id } }
                acc.push(matched_vehicle)
                return acc
              }, [])
            : []

          vehiclesToFilter.push(...timeVehicles)
          break
        }
        case 'speed':
          {
            const comp: Compliance & { matches: SpeedMatch[] | null } = processSpeedRule(
              rule,
              sortedEvents,
              geographies,
              devices
            )
            compliance_acc.push(comp)
            const speedingVehicles = comp.matches
              ? comp.matches.reduce((acc: MatchedVehicle[], match: SpeedMatch) => {
                  acc.push(match.matched_vehicle)
                  return acc
                }, [])
              : []
            vehiclesToFilter.push(...speedingVehicles)

            speedingVehicles.forEach(vehicle => {
              speedingVehiclesMap[vehicle.device.device_id] = { ...vehicle, ...{ rule_id: rule.rule_id } }
            })
          }
          break
        default:
          compliance_acc.push({ rule, matches: [] })
      }
      return compliance_acc
    }, [])

    const countVehicles = getViolationsArray(countVehiclesMap)
    const timeVehicles = getViolationsArray(timeVehiclesMap)
    const speedingVehicles = getViolationsArray(speedingVehiclesMap)

    return {
      policy,
      compliance,
      total_violations: countMinimumViolations + countVehicles.length + timeVehicles.length + speedingVehicles.length,
      vehicles_in_violation: [...countVehicles, ...timeVehicles, ...speedingVehicles]
    }
  }
}

function createMatchedVehicleInformation(
  device: Device,
  event: VehicleEvent & { telemetry: Telemetry }
): Partial<MatchedVehicleInformation> {
  return {
    device_id: device.device_id,
    state: event.vehicle_state,
    event_types: event.event_types,
    timestamp: event.timestamp,
    //      rules_matched: UUID[],
    //      rule_applied: UUID, // a device can only ever match one rule for the purpose of computing compliance, however
    speed: event.telemetry?.gps.speed,
    gps: {
      lat: event.telemetry?.gps?.lat,
      lng: event.telemetry?.gps?.lng
    }
  }
}

/*
function processCountRuleNewTypes(
  rule: CountRule,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device }
): MatchedVehicleInformation[] | null {
  const maximum = rule.maximum || Number.POSITIVE_INFINITY
  if (isRuleActive(rule)) {
    const matches: MatchedVehicleInformation[] = rule.geographies.reduce(
      (matches_acc: MatchedVehicleInformation[], geography: string): MatchedVehicleInformation[] => {
        const matched_vehicles: MatchedVehicleInformation[] = events.reduce(
          (matched_vehicles_acc: MatchedVehicleInformation[], event: VehicleEvent): MatchedVehicleInformation[] => {
            const device: Device | undefined = devices[event.device_id]
            if (event.telemetry && device) {
              if (isInStatesOrEvents(rule, event) && isInVehicleTypes(rule, device)) {
                const poly = getPolygon(geographies, geography)
                if (poly && pointInShape(event.telemetry.gps, poly)) {
                  // push devices that are in violation
                  matched_vehicles_acc.push(createMatchedVehicleInformation(device, event))
                }
              }
            }
            return matched_vehicles_acc
          },
          []
        )
        matches_acc.push({
          geography_id: geography,
          measured: maximum && matched_vehicles.length > maximum ? maximum : matched_vehicles.length,
          matched_vehicles
        })
        return matches_acc
      },
      []
    )
    return { rule, matches }
  }
  return { rule, matches: [] }
}

*/
// export { processPolicy, getSupersedingPolicies, getRecentEvents, processCountRuleNewTypes }
