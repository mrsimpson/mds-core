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
  CountRule,
  Device,
  Geography,
  Policy,
  Rule,
  SpeedRule,
  TimeRule,
  VehicleEvent,
  TIME_FORMAT,
  UUID
} from '@mds-core/mds-types'
import { pointInShape, getPolygon, isInStatesOrEvents, now, RuntimeError, RULE_UNIT_MAP } from '@mds-core/mds-utils'
import { DateTime } from 'luxon'
import moment from 'moment-timezone'
import {
  MatchedVehiclePlusRule,
  CountMatch,
  Compliance,
  MatchedVehicle,
  SpeedMatch,
  TimeMatch,
  ComplianceResponse
} from './types'

const { env } = process

const TWO_DAYS_IN_MS = 172800000

function isPolicyActive(policy: Policy, end_time: number = now()): boolean {
  if (policy.end_date === null) {
    return end_time >= policy.start_date
  }
  return end_time >= policy.start_date && end_time <= policy.end_date
}

const isOfTimeFormat = (timeString: string): timeString is any => /^\d{2}:\d{2}:\d{2}$/.test(timeString)

/**
 * Luxon has a helper method for this `weekdayShort`, but it doesn't typecheck :^)
 */
const numericalWeekdayToLocale = (weekdayNum: number) => {
  if (weekdayNum < 1 || weekdayNum > 7) {
    throw new Error(`Invalid weekday number: ${weekdayNum}`)
  }

  const weekdayList = <const>['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

  return weekdayList[weekdayNum - 1] // subtract 1 cause arrays are 0 indexed, but luxon provides weekdays in 1 | 2 | 3 | 4 | 5 | 6 | 7 form. (1 = monday) (7 = sunday)
}

/**
 *
 * @param param0 Object which contains a list of days
 * @returns If the current day is in the list of valid days
 */
const isCurrentDayInDays = ({ days }: Pick<Rule, 'days'>, current_time?: number) => {
  const { TIMEZONE } = env

  if (!days || days.length === 0) return true

  const currentTime = (current_time ? DateTime.fromMillis(current_time) : DateTime.now()).setZone(TIMEZONE)

  return days.includes(numericalWeekdayToLocale(currentTime.weekday))
}

/**
 *
 * @param start_time Time in HH:mm:ss format
 * @param end_time Time in HH:mm:ss format
 * @returns If the current local time is within the specified time range.
 *
 * Note: We can just do string comparison here for times, because the format should consistently be HH:mm:ss for all strings.
 */
const isCurrentTimeInInterval = (
  { start_time, end_time }: Pick<Rule, 'start_time' | 'end_time'>,
  current_time?: number
) => {
  const { TIMEZONE } = env

  const currentTime = (current_time ? DateTime.fromMillis(current_time) : DateTime.now()).setZone(TIMEZONE)
  const formattedCurrentTime = currentTime.toFormat(TIME_FORMAT)
  if (!isOfTimeFormat(formattedCurrentTime))
    throw new Error(`Current time is in invalid time format: ${formattedCurrentTime}`)

  if (start_time && end_time) {
    // The overnight use-case, e.g. if a rule starts at 7pm and ends at 5am.
    if (start_time >= end_time) return formattedCurrentTime >= start_time || formattedCurrentTime <= end_time

    // Daytime use-case, e.g. if a rule starts at 8am and ends at 5pm.
    return formattedCurrentTime >= start_time && formattedCurrentTime <= end_time
  }

  if (start_time) return formattedCurrentTime >= start_time // we'll assume that if there's no end time, the rule is active from the start_time until the end of the day

  if (end_time) return formattedCurrentTime <= end_time // we'll assume that if there's no start time, the rule is active from the beginning of the day until the end time

  return true
}

export function isRuleActive(
  { start_time, end_time, days }: Pick<Rule, 'start_time' | 'end_time' | 'days'>,
  current_time?: number
): boolean {
  if (!env.TIMEZONE) {
    throw new RuntimeError('TIMEZONE environment variable must be declared!')
  }

  if (!moment.tz.names().includes(env.TIMEZONE)) {
    throw new RuntimeError(`TIMEZONE environment variable ${env.TIMEZONE} is not a valid timezone!`)
  }

  return isCurrentDayInDays({ days }, current_time) && isCurrentTimeInInterval({ start_time, end_time }, current_time)
}

export function isInVehicleTypes(rule: Rule, device: Device): boolean {
  return (
    !rule.vehicle_types ||
    rule.vehicle_types.length === 0 ||
    (rule.vehicle_types && rule.vehicle_types.includes(device.type))
  )
}

function getViolationsArray(map: { [key: string]: MatchedVehiclePlusRule }) {
  return Object.values(map)
}

function processCountRule(
  rule: CountRule,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device },
  end_time?: number
): Compliance & { matches: CountMatch[] | null } {
  const maximum = rule.maximum || Number.POSITIVE_INFINITY
  if (isRuleActive(rule, end_time)) {
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
  devices: { [d: string]: Device },
  end_time?: number
): Compliance & { matches: TimeMatch[] | null } {
  if (isRuleActive(rule, end_time)) {
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
  devices: { [d: string]: Device },
  end_time?: number
): Compliance & { matches: SpeedMatch[] | null } {
  if (isRuleActive(rule, end_time)) {
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

function processPolicy(
  policy: Policy,
  events: VehicleEvent[],
  geographies: Geography[],
  devices: { [d: string]: Device },
  end_time: number = now()
): ComplianceResponse | undefined {
  if (isPolicyActive(policy, end_time)) {
    const sortedEvents = events.sort((e_1, e_2) => {
      return e_1.timestamp - e_2.timestamp
    })
    const vehiclesToFilter: MatchedVehicle[] = []
    const overflowVehiclesMap: { [key: string]: MatchedVehiclePlusRule } = {}
    let countVehiclesMap: { [d: string]: MatchedVehiclePlusRule } = {}
    let countViolations = 0
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
          const comp: Compliance & { matches: CountMatch[] } = processCountRule(
            rule,
            sortedEvents,
            geographies,
            devices,
            end_time
          )

          const compressedComp = {
            rule,
            matches: comp.matches
              ? comp.matches.reduce((acc: { measured: number; geography_id: UUID }[], inst: CountMatch) => {
                  const { measured, geography_id } = inst
                  return [...acc, { measured, geography_id }]
                }, [])
              : []
          }

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
                      if (overflowVehiclesMap[match_instance.device.device_id]) {
                        delete overflowVehiclesMap[match_instance.device.device_id]
                      }
                      if (countVehiclesMap[match_instance.device.device_id]) {
                        delete countVehiclesMap[match_instance.device.device_id]
                      }
                      acc.matched.push(match_instance)
                    } else {
                      acc.overflowed.push({ ...match_instance, rule_id: rule.rule_id })
                      overflowVehiclesMap[match_instance.device.device_id] = {
                        ...match_instance,
                        rule_id: rule.rule_id
                      }
                    }
                    return acc
                  },
                  { matched: [], overflowed: [] }
                )
              ]
            },
            [{ matched: [], overflowed: [] }]
          )

          const vehiclesMatched = bucketMap.reduce((acc: MatchedVehicle[], map) => {
            return [...acc, ...map.matched]
          }, [])
          vehiclesToFilter.push(...vehiclesMatched)

          const overflowVehicles = Object.values(overflowVehiclesMap)

          // only vehicles in count maximum violation are in overflow
          // no vehicles are in violation if it's a mininimum violation,
          // but # of violations goes up
          const minimum = rule.minimum == null ? Number.NEGATIVE_INFINITY : rule.minimum

          if (overflowVehicles.length > 0) {
            countVehiclesMap = { ...countVehiclesMap, ...overflowVehiclesMap }
          } else if (vehiclesMatched.length < minimum) {
            countViolations += minimum - vehiclesMatched.length
          }

          compliance_acc.push(compressedComp)

          break
        }
        case 'time': {
          const comp: Compliance & { matches: TimeMatch[] | null } = processTimeRule(
            rule,
            sortedEvents,
            geographies,
            devices,
            end_time
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
              devices,
              end_time
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

    const overflowVehicles = Object.values(overflowVehiclesMap)
    countViolations += overflowVehicles.length

    return {
      policy,
      compliance,
      total_violations: countViolations + timeVehicles.length + speedingVehicles.length,
      vehicles_in_violation: [...countVehicles, ...timeVehicles, ...speedingVehicles]
    }
  }
}

// Take a list of policies, and eliminate all those that have been superseded. Returns
// policies that have not been superseded.
function getSupersedingPolicies(policies: Policy[]): Policy[] {
  const prev_policies: string[] = policies.reduce((prev_policies_acc: string[], policy: Policy) => {
    if (policy.prev_policies) {
      prev_policies_acc.push(...policy.prev_policies)
    }
    return prev_policies_acc
  }, [])
  return policies.filter((policy: Policy) => {
    return !prev_policies.includes(policy.policy_id)
  })
}

function getRecentEvents(events: VehicleEvent[], end_time = now()): VehicleEvent[] {
  return events.filter((event: VehicleEvent) => {
    /* Keep events that are less than two days old */
    return event.timestamp > end_time - TWO_DAYS_IN_MS
  })
}

export { processPolicy, getSupersedingPolicies, getRecentEvents }
