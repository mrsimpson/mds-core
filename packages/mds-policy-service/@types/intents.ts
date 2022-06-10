import { now } from '@mds-core/mds-utils'
import type { BaseRule, MicroMobilityStatesToEvents, PolicyDomainModel } from './models'

export const INTENT_TYPES = <const>['no_parking']
export type INTENT_TYPE = typeof INTENT_TYPES[number]

export const BASE_POLICY_DEFAULTS: Pick<
  PolicyDomainModel,
  | 'name'
  | 'description'
  | 'provider_ids'
  | 'start_date'
  | 'end_date'
  | 'prev_policies'
  | 'rules'
  | 'currency'
  | 'published_date'
> = {
  name: '',
  description: '',
  provider_ids: [],
  start_date: now(),
  end_date: null,
  prev_policies: [],
  rules: [],
  currency: null,
  published_date: null
}

export const NO_PARKING_INTENT_RULE_FIXED_VALUES: IntentRuleDefaults = {
  geographies: [],
  days: [],
  start_time: null,
  end_time: null,
  accessibility_options: null,
  maximum: 0,
  modality: 'micromobility',
  rate_amount: null,
  rate_recurrence: null,
  name: 'No Parking Zones',
  rule_type: 'count',
  rule_units: 'devices',
  states: { available: [], non_operational: [], reserved: [], unknown: [] },
  value_url: null,
  vehicle_types: ['scooter', 'moped'],
  propulsion_types: [],
  transaction_types: null,
  service_types: null
}

export type IntentRuleDefaults = Omit<BaseRule<PartialMicroMobilityStatesMap>, 'rule_id'>

export const INTENT_RULE_CONSTANTS: { [K in INTENT_TYPE]: IntentRuleDefaults } = {
  no_parking: NO_PARKING_INTENT_RULE_FIXED_VALUES
}

export type BaseIntentPolicyUserFields = Pick<
  PolicyDomainModel,
  'name' | 'description' | 'provider_ids' | 'start_date' | 'end_date'
>

export type PartialMicroMobilityStatesMap = Partial<MicroMobilityStatesToEvents>

export type IntentDraft<
  I extends INTENT_TYPE = 'no_parking',
  INTENT_POLICY_FIELDS extends BaseIntentPolicyUserFields = NoParkingIntentPolicyUserFields,
  INTENT_RULE_FIELDS extends BaseIntentRuleUserFields = NoParkingIntentRuleUserFields
> = {
  intent_type: I
  policy_fields: INTENT_POLICY_FIELDS
  rule_fields: INTENT_RULE_FIELDS
}

export type BaseIntentRuleUserFields = Pick<
  BaseRule<PartialMicroMobilityStatesMap>,
  'geographies' | 'days' | 'start_time' | 'end_time'
>
export type NoParkingIntentRuleUserFields = BaseIntentRuleUserFields
export type NoParkingIntentPolicyUserFields = BaseIntentPolicyUserFields

export type NoParkingIntentDraft = IntentDraft<
  'no_parking',
  NoParkingIntentPolicyUserFields,
  NoParkingIntentRuleUserFields
>
