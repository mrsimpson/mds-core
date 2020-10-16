import {
  Policy,
  Geography,
  UUID,
  Device,
  VehicleEvent,
  Rule,
  DAY_OF_WEEK,
  TIME_FORMAT,
  DAYS_OF_WEEK,
  Optional
} from '@mds-core/mds-types'
import cache from '@mds-core/mds-agency-cache'
import db from '@mds-core/mds-db'
import { now, RuntimeError } from '@mds-core/mds-utils'
import moment from 'moment-timezone'
import { AllowedProviderIDs } from './constants'
import { MatchedVehicleInformation, VehicleEventWithTelemetry } from '../@types'

const { env } = process

const TWO_DAYS_IN_MS = 172800000

export function isPolicyUniversal(policy: Policy) {
  return !policy.provider_ids || policy.provider_ids.length === 0
}

export function clientCanViewPolicyCompliance(
  provider_id: string,
  queried_provider_id: string | undefined,
  policy: Policy
): boolean {
  return (
    policy &&
    // True if the client is looking at a policy that applies to them
    ((policy.provider_ids && policy.provider_ids.includes(provider_id)) ||
      // True if a policy has no provider_ids, meaning it applies to every provider
      isPolicyUniversal(policy) ||
      /* True if the client is one of the allowed providers, and either the policy applies to the
       * provider that was queried for, or the policy applies to every provider
       */
      (AllowedProviderIDs.includes(provider_id) &&
        ((policy.provider_ids &&
          policy.provider_ids.length !== 0 &&
          queried_provider_id &&
          policy.provider_ids.includes(queried_provider_id)) ||
          isPolicyUniversal(policy))))
  )
}

export async function getComplianceInputs(provider_id: string | undefined) {
  const [geographies, deviceRecords] = await Promise.all([
    db.readGeographies() as Promise<Geography[]>,
    db.readDeviceIds(provider_id)
  ])
  const deviceIdSubset = deviceRecords.map((record: { device_id: UUID; provider_id: UUID }) => record.device_id)
  const devices = await cache.readDevices(deviceIdSubset)
  // Get last event for each of these devices.
  const events = await cache.readEvents(deviceIdSubset)

  const deviceMap = devices.reduce((map: { [d: string]: Device }, device) => {
    return device ? Object.assign(map, { [device.device_id]: device }) : map
  }, {})

  /* We do not evaluate violations for vehicles that have not sent events within the last 48 hours.
     So we throw old events out and do not consider them.
  */
  const filteredEvents = getRecentEvents(events)
  return { filteredEvents, geographies, deviceMap }
}

export function isPolicyActive(policy: Policy, end_time: number = now()): boolean {
  if (policy.end_date === null) {
    return end_time >= policy.start_date
  }
  return end_time >= policy.start_date && end_time <= policy.end_date
}

export function isRuleActive(rule: Rule): boolean {
  if (!env.TIMEZONE) {
    throw new RuntimeError('TIMEZONE environment variable must be declared!')
  }

  if (!moment.tz.names().includes(env.TIMEZONE)) {
    throw new RuntimeError(`TIMEZONE environment variable ${env.TIMEZONE} is not a valid timezone!`)
  }

  const local_time = moment().tz(env.TIMEZONE)

  if (!rule.days || rule.days.includes(Object.values(DAYS_OF_WEEK)[local_time.day()] as DAY_OF_WEEK)) {
    if (!rule.start_time || local_time.isAfter(moment(rule.start_time, TIME_FORMAT))) {
      if (!rule.end_time || local_time.isBefore(moment(rule.end_time, TIME_FORMAT))) {
        return true
      }
    }
  }
  return false
}

export function isInVehicleTypes(rule: Rule, device: Device): boolean {
  return !rule.vehicle_types || (rule.vehicle_types && rule.vehicle_types.includes(device.vehicle_type))
}

// Take a list of policies, and eliminate all those that have been superseded. Returns
// policies that have not been superseded.
export function getSupersedingPolicies(policies: Policy[]): Policy[] {
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

export function getRecentEvents(events: VehicleEvent[], end_time = now()): VehicleEvent[] {
  return events.filter((event: VehicleEvent) => {
    /* Keep events that are less than two days old.
     * This is a somewhat arbitrary window of time.
     */
    return event.timestamp > end_time - TWO_DAYS_IN_MS && event.telemetry
  })
}

export function createMatchedVehicleInformation(
  device: Device,
  event: VehicleEventWithTelemetry,
  rule_applied_id?: UUID | null
): MatchedVehicleInformation {
  return {
    device_id: device.device_id,
    state: event.vehicle_state,
    event_types: event.event_types,
    timestamp: event.timestamp,
    rules_matched: !!rule_applied_id ? [rule_applied_id] : [],
    rule_applied: rule_applied_id, // a device can only ever match at most one rule for the purpose of computing compliance
    speed: event.telemetry.gps.speed,
    gps: {
      lat: event.telemetry.gps.lat,
      lng: event.telemetry.gps.lng
    }
  }
}
