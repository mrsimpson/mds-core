import { now } from '@mds-core/mds-utils'
import type { BaseRule, MicroMobilityStatesToEvents, PolicyDomainModel } from '../models'

export type IntentRuleDefaults = Omit<
  BaseRule<PartialMicroMobilityStatesMap>,
  'rule_id' | 'modality' | 'geographies'
> & {
  modality: 'micromobility'
}
export type PartialMicroMobilityStatesMap = Partial<MicroMobilityStatesToEvents>

export const INTENT_TYPES = <const>[
  'no_parking',
  'permitted_vehicle_count',
  'parking_time_limit',
  'permitted_parking',
  'provider_rebalancing_zone'
]
export type INTENT_TYPE = typeof INTENT_TYPES[number]

export const BASE_POLICY_DEFAULTS: Pick<
  PolicyDomainModel,
  'provider_ids' | 'start_date' | 'end_date' | 'prev_policies' | 'rules' | 'currency' | 'published_date'
> = {
  provider_ids: [],
  start_date: now(),
  end_date: null,
  prev_policies: [],
  rules: [],
  currency: null,
  published_date: null
}

export type BaseIntentPolicyUserFields = Pick<
  PolicyDomainModel,
  'name' | 'description' | 'provider_ids' | 'start_date' | 'end_date'
>

export const COMMON_INTENT_RULE_DEFAULTS: Omit<
  BaseRule<PartialMicroMobilityStatesMap>,
  'rule_id' | 'maximum' | 'minimum' | 'name' | 'states' | 'geographies'
> = {
  days: [],
  start_time: null,
  end_time: null,
  accessibility_options: null,
  modality: 'micromobility',
  rate_amount: null,
  rate_recurrence: null,
  rule_type: 'count',
  rule_units: 'devices',
  value_url: null,
  vehicle_types: [],
  propulsion_types: [],
  transaction_types: null,
  service_types: null
}
