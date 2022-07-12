import type { BaseRule } from '../models'
import type { BaseIntentPolicyUserFields, INTENT_TYPE, PartialMicroMobilityStatesMap } from './common'
import { COMMON_INTENT_RULE_DEFAULTS } from './common'

export type IntentRuleDefaults = Omit<BaseRule<PartialMicroMobilityStatesMap>, 'rule_id'>

export const NO_PARKING_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  name: 'No Parking Zone',
  maximum: 0,
  states: { available: [], non_operational: [], reserved: [], unknown: [] },
  ...COMMON_INTENT_RULE_DEFAULTS
}
export const PERMITTED_VEHICLE_COUNT_INTENT_RULE_CONSTANTS: IntentRuleDefaults = {
  maximum: 0,
  minimum: 0,
  name: 'Permitted Vehicle Count',
  states: {},
  ...COMMON_INTENT_RULE_DEFAULTS
}

export const INTENT_RULE_CONSTANTS: { [K in INTENT_TYPE]: IntentRuleDefaults } = {
  no_parking: NO_PARKING_INTENT_RULE_CONSTANTS,
  permitted_vehicle_count: PERMITTED_VEHICLE_COUNT_INTENT_RULE_CONSTANTS
}

export type IntentDraft<
  I extends INTENT_TYPE,
  INTENT_POLICY_FIELDS extends BaseIntentPolicyUserFields = NoParkingIntentPolicyUserFields,
  INTENT_RULE_FIELDS extends BaseIntentRuleUserFields = NoParkingIntentRuleUserFields
> = {
  intent_type: I
  policy_fields: INTENT_POLICY_FIELDS
  rule_fields: INTENT_RULE_FIELDS
}

export type BaseIntentRuleUserFields = NoParkingIntentRuleUserFields | PermittedVehicleCountIntentRuleUserFields

export type NoParkingIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'geographies' | 'days' | 'start_time' | 'end_time'
>
export type NoParkingIntentPolicyUserFields = BaseIntentPolicyUserFields
export type PermittedVehicleCountIntentPolicyUserFields = BaseIntentPolicyUserFields

export type NoParkingIntentDraft = IntentDraft<
  'no_parking',
  NoParkingIntentPolicyUserFields,
  NoParkingIntentRuleUserFields
>

export type PermittedVehicleCountIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'minimum' | 'maximum' | 'geographies' | 'days' | 'start_time' | 'end_time'
>

export type PermittedVehicleCountIntentDraft = IntentDraft<
  'permitted_vehicle_count',
  PermittedVehicleCountIntentPolicyUserFields,
  PermittedVehicleCountIntentRuleUserFields
>

export * from './common'
