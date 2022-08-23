/**
 * Copyright 2020 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { JSONSchemaType } from '@mds-core/mds-schema-validators'
import { SchemaValidator } from '@mds-core/mds-schema-validators'
import { DAYS_OF_WEEK, MICRO_MOBILITY_VEHICLE_STATES, PROPULSION_TYPES, VEHICLE_TYPES } from '@mds-core/mds-types'
import { isDefined } from '@mds-core/mds-utils'
import Ajv from 'ajv'
import type {
  BaseIntentPolicyUserFields,
  NoParkingIntentDraft,
  ParkingTimeLimitIntentDraft,
  PermittedParkingIntentDraft,
  PermittedParkingIntentRuleUserFields,
  PermittedVehicleCountIntentDraft,
  ProviderRebalancingZoneIntentDraft,
  ProviderRebalancingZoneIntentRuleUserFields
} from '../../@types'
import { enumSchema, timestampSchema, uuidSchema } from './policy'

const validatePermittedParkingAjv = new Ajv({ allErrors: true })

validatePermittedParkingAjv.addKeyword({
  keyword: 'validatePermittedParkingRules',
  type: 'object',
  schemaType: 'boolean',
  compile: () => data => {
    const { rule_fields } = data
    if (rule_fields.length < 2) return false
    if (rule_fields[rule_fields.length - 1].maximum !== 0) return false
    const firstNMinusOneRules = rule_fields.slice(0, -1)
    return firstNMinusOneRules.every((rule: PermittedParkingIntentRuleUserFields) => rule.geographies.length === 1)
  }
})

const checkFinalProviderRebalancingRuleAjv = new Ajv({ allErrors: true })
checkFinalProviderRebalancingRuleAjv.addKeyword({
  keyword: 'validateFinalProviderRebalancingRule',
  type: 'object',
  schemaType: 'boolean',
  compile: () => data => {
    const { rule_fields } = data
    if (rule_fields.length < 2) return false
    const firstNMinusOneRules = rule_fields.slice(0, -1)
    if (
      !firstNMinusOneRules.every(
        (rule: ProviderRebalancingZoneIntentRuleUserFields) =>
          rule.states === null || Object.keys(rule.states).length === 0
      )
    )
      return false

    if (!firstNMinusOneRules.every((rule: PermittedParkingIntentRuleUserFields) => rule.geographies.length === 1))
      return false

    const finalRule = rule_fields[rule_fields.length - 1]
    if (finalRule.maximum !== 0) return false

    return MICRO_MOBILITY_VEHICLE_STATES.every(
      state => JSON.stringify(finalRule.states[state]) === JSON.stringify(['provider_drop_off'])
    )
  }
})

const validatePermittedVehicleCountRulesAjv = new Ajv({ allErrors: true })
validatePermittedVehicleCountRulesAjv.addKeyword({
  keyword: 'validatePermittedVehicleCountRules',
  type: 'object',
  schemaType: 'boolean',
  compile: () => (data: { maximum: number | null; minimum: number | null }) => {
    const { maximum, minimum } = data
    if (!isDefined(minimum) && !isDefined(maximum)) return false
    if (isDefined(minimum) && minimum < 0) return false
    if (isDefined(maximum) && maximum < 0) return false
    if (isDefined(minimum) && isDefined(maximum) && minimum > maximum) return false
    return true
  }
})

const intentPolicyUserFields: JSONSchemaType<BaseIntentPolicyUserFields> = <const>{
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    provider_ids: { type: 'array', items: uuidSchema, nullable: true, default: null },
    start_date: timestampSchema,
    end_date: { ...timestampSchema, nullable: true, default: null }
  },
  required: ['name', 'description', 'start_date']
}

const intentRuleProperties = <const>{
  geographies: { type: 'array', items: uuidSchema, minItems: 1 },
  days: { type: 'array', items: { type: 'string', enum: Object.values(DAYS_OF_WEEK) }, nullable: true },
  start_time: { type: 'string', nullable: true, pattern: '^\\d{2}:\\d{2}:\\d{2}$' },
  end_time: { type: 'string', nullable: true, pattern: '^\\d{2}:\\d{2}:\\d{2}$' },
  vehicle_types: { type: 'array', items: enumSchema(VEHICLE_TYPES), nullable: true },
  propulsion_types: { type: 'array', items: enumSchema(PROPULSION_TYPES), nullable: true }
}

export const noParkingPolicyIntentSchema: JSONSchemaType<NoParkingIntentDraft> = <const>{
  $id: 'NoParkingPolicyIntent',
  type: 'object',
  properties: {
    intent_type: { type: 'string', const: 'no_parking' },
    policy_fields: intentPolicyUserFields,
    rule_fields: {
      type: 'object',
      properties: intentRuleProperties,
      required: ['geographies']
    }
  },
  required: ['intent_type', 'policy_fields', 'rule_fields']
}

export const {
  validate: validateNoParkingPolicyIntent,
  isValid: isValidNoParkingPolicyIntent,
  $schema: NoParkingPolicyIntentSchema
} = SchemaValidator<NoParkingIntentDraft>(noParkingPolicyIntentSchema, { allErrors: true, useDefaults: true })

export const permittedVehicleCountIntentSchema: JSONSchemaType<PermittedVehicleCountIntentDraft> = <const>{
  $id: 'PermittedVehicleCountPolicyIntent',
  type: 'object',
  properties: {
    intent_type: { type: 'string', const: 'permitted_vehicle_count' },
    policy_fields: intentPolicyUserFields,
    rule_fields: {
      type: 'object',
      properties: {
        ...intentRuleProperties,
        maximum: { type: 'number', nullable: true },
        minimum: { type: 'number', nullable: true }
      },
      required: ['geographies'],
      validatePermittedVehicleCountRules: true
    }
  },
  required: ['intent_type', 'policy_fields', 'rule_fields']
}

export const {
  validate: validatePermittedVehicleCountPolicyIntent,
  isValid: isValidPermittedVehicleCountPolicyIntent,
  $schema: PermittedVehicleCountPolicyIntentSchema
} = SchemaValidator<PermittedVehicleCountIntentDraft>(
  permittedVehicleCountIntentSchema,
  {
    allErrors: true,
    useDefaults: true
  },
  validatePermittedVehicleCountRulesAjv
)

export const parkingTimeLimitPolicyIntentSchema: JSONSchemaType<ParkingTimeLimitIntentDraft> = <const>{
  $id: 'ParkingTimeLimitPolicyIntentSchema',
  type: 'object',
  properties: {
    intent_type: { type: 'string', const: 'parking_time_limit' },
    policy_fields: intentPolicyUserFields,
    rule_fields: {
      type: 'object',
      properties: {
        ...intentRuleProperties,
        rule_units: { type: 'string', nullable: true, default: null },
        maximum: { type: 'number', nullable: true }
      },
      required: ['geographies']
    }
  },
  required: ['intent_type', 'policy_fields', 'rule_fields']
}

export const {
  validate: validateParkingTimeLimitPolicyIntent,
  isValid: isValidParkingTimeLimitPolicyIntent,
  $schema: ParkingTimeLimitPolicyIntentSchema
} = SchemaValidator<ParkingTimeLimitIntentDraft>(parkingTimeLimitPolicyIntentSchema, {
  allErrors: true,
  useDefaults: true
})

export const permittedParkingPolicyIntentSchema: JSONSchemaType<PermittedParkingIntentDraft> = <const>{
  $id: 'PermittedParkingPolicyIntentSchema',
  type: 'object',
  properties: {
    intent_type: { type: 'string', const: 'permitted_parking' },
    policy_fields: intentPolicyUserFields,
    rule_fields: {
      type: 'array',
      items: {
        $id: 'PermittedParkingRule',
        type: 'object',
        properties: {
          ...intentRuleProperties,
          maximum: { type: 'number', nullable: true },
          geographies: { type: 'array', items: uuidSchema, minItems: 1 }
        },
        required: ['geographies']
      }
    }
  },
  required: ['intent_type', 'policy_fields', 'rule_fields'],
  validatePermittedParkingRules: true
}

export const {
  validate: validatePermittedParkingPolicyIntent,
  isValid: isValidPermittedParkingPolicyIntent,
  $schema: PermittedParkingPolicyIntentSchema
} = SchemaValidator<PermittedParkingIntentDraft>(
  permittedParkingPolicyIntentSchema,
  {
    allErrors: true,
    useDefaults: true
  },
  validatePermittedParkingAjv
)

export const providerRebalancingZonePolicyIntentSchema: JSONSchemaType<ProviderRebalancingZoneIntentDraft> = <const>{
  $id: 'ProviderRebalancingZonePolicyIntentSchema',
  type: 'object',
  properties: {
    intent_type: { type: 'string', const: 'provider_rebalancing_zone' },
    policy_fields: intentPolicyUserFields,
    rule_fields: {
      type: 'array',
      items: {
        $id: 'ProviderRebalancingZoneRule',
        type: 'object',
        properties: {
          ...intentRuleProperties,
          maximum: { type: 'number', nullable: true },
          geographies: { type: 'array', items: uuidSchema, minItems: 1 },
          states: { type: 'object', nullable: true, default: null }
        },
        required: ['geographies']
      }
    }
  },
  required: ['intent_type', 'policy_fields', 'rule_fields'],
  validateFinalProviderRebalancingRule: true
}

export const {
  validate: validateProviderRebalancingZonePolicyIntent,
  isValid: isValidProviderRebalancingZonePolicyIntent,
  $schema: ProviderRebalancingZonePolicyIntentSchema
} = SchemaValidator<ProviderRebalancingZoneIntentDraft>(
  providerRebalancingZonePolicyIntentSchema,
  {
    allErrors: true,
    useDefaults: true
  },
  checkFinalProviderRebalancingRuleAjv
)
