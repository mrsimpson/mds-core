import type { BaseRule } from '../models'
import type {
  BaseIntentPolicyUserFields,
  IntentRuleDefaults,
  INTENT_TYPE,
  PartialMicroMobilityStatesMap
} from './common'
import { COMMON_INTENT_RULE_DEFAULTS } from './common'

export const NO_PARKING_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  ...COMMON_INTENT_RULE_DEFAULTS,
  modality: 'micromobility',
  name: 'No Parking Zone',
  maximum: 0,
  states: { available: [], non_operational: [], reserved: [], unknown: [] }
}

export const PERMITTED_VEHICLE_COUNT_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  ...COMMON_INTENT_RULE_DEFAULTS,
  modality: 'micromobility',
  minimum: 0,
  name: 'Permitted Vehicle Count',
  states: {}
}

export const PARKING_TIME_LIMIT_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  ...COMMON_INTENT_RULE_DEFAULTS,
  modality: 'micromobility',
  rule_units: 'minutes',
  rule_type: 'time',
  minimum: 0,
  name: 'Parking Time Limit',
  states: { available: [], non_operational: [], reserved: [] }
}

export const PERMITTED_PARKING_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  ...COMMON_INTENT_RULE_DEFAULTS,
  modality: 'micromobility',
  minimum: 0,
  name: 'Permitted Parking',
  rule_units: 'minutes',
  states: { available: [], non_operational: [], reserved: [] }
}

export const PROVIDER_REBALANCING_ZONE_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  ...COMMON_INTENT_RULE_DEFAULTS,
  modality: 'micromobility',
  minimum: 0,
  name: 'Provider Rebalancing Zone',
  states: {}
}

export const INTENT_RULE_CONSTANTS: { [K in INTENT_TYPE]: IntentRuleDefaults } = {
  no_parking: NO_PARKING_INTENT_RULE_CONSTANTS,
  permitted_vehicle_count: PERMITTED_VEHICLE_COUNT_INTENT_RULE_CONSTANTS,
  parking_time_limit: PARKING_TIME_LIMIT_INTENT_RULE_CONSTANTS,
  permitted_parking: PERMITTED_PARKING_INTENT_RULE_CONSTANTS,
  provider_rebalancing_zone: PROVIDER_REBALANCING_ZONE_INTENT_RULE_CONSTANTS
}

export type IntentDraft<I extends INTENT_TYPE> = {
  intent_type: I
  policy_fields: BaseIntentPolicyUserFields
  rule_fields: I extends 'no_parking'
    ? NoParkingIntentRuleUserFields
    : I extends 'permitted_vehicle_count'
    ? PermittedVehicleCountIntentRuleUserFields
    : I extends 'parking_time_limit'
    ? ParkingTimeLimitIntentRuleUserFields
    : I extends 'permitted_parking'
    ? PermittedParkingIntentRuleUserFieldsArray
    : I extends 'provider_rebalancing_zone'
    ? ProviderRebalancingZoneIntentRuleUserFieldsArray
    : never
}

export type IntentRuleUserFields =
  | NoParkingIntentRuleUserFields
  | PermittedVehicleCountIntentRuleUserFields
  | ParkingTimeLimitIntentRuleUserFields
  | PermittedParkingIntentRuleUserFields
  | ProviderRebalancingZoneIntentRuleUserFields

export type NoParkingIntentPolicyUserFields = BaseIntentPolicyUserFields

export type NoParkingIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'geographies' | 'days' | 'start_time' | 'end_time' | 'vehicle_types' | 'propulsion_types'
>

export type NoParkingIntentDraft = IntentDraft<'no_parking'>

export type PermittedVehicleCountIntentPolicyUserFields = BaseIntentPolicyUserFields

export type PermittedVehicleCountIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'minimum' | 'maximum' | 'geographies' | 'days' | 'start_time' | 'end_time' | 'vehicle_types' | 'propulsion_types'
>

export type PermittedVehicleCountIntentDraft = IntentDraft<'permitted_vehicle_count'>

export type ParkingTimeLimitIntentPolicyUserFields = BaseIntentPolicyUserFields

export type ParkingTimeLimitIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'rule_units' | 'maximum' | 'geographies' | 'days' | 'start_time' | 'end_time' | 'vehicle_types' | 'propulsion_types'
>

export type ParkingTimeLimitIntentDraft = IntentDraft<'parking_time_limit'>

export type PermittedParkingIntentPolicyUserFields = BaseIntentPolicyUserFields

export type PermittedParkingIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'maximum' | 'geographies' | 'days' | 'start_time' | 'end_time' | 'vehicle_types' | 'propulsion_types'
>

export type PermittedParkingIntentRuleUserFieldsArray = Array<PermittedParkingIntentRuleUserFields>
export type PermittedParkingIntentDraft = IntentDraft<'permitted_parking'>

export type ProviderRebalancingZoneIntentPolicyUserFields = BaseIntentPolicyUserFields

export type ProviderRebalancingZoneIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'states' | 'maximum' | 'geographies' | 'days' | 'start_time' | 'end_time' | 'vehicle_types' | 'propulsion_types'
>

export type ProviderRebalancingZoneIntentRuleUserFieldsArray = Array<ProviderRebalancingZoneIntentRuleUserFields>
export type ProviderRebalancingZoneIntentDraft = IntentDraft<'provider_rebalancing_zone'>

export * from './common'
