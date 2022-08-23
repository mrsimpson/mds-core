import { ValidationError } from '@mds-core/mds-schema-validators'
import { MICRO_MOBILITY_VEHICLE_EVENTS, TAXI_VEHICLE_EVENTS, TNC_VEHICLE_EVENT } from '@mds-core/mds-types'
import { now, uuid } from '@mds-core/mds-utils'
import type { PolicyDomainCreateModel } from '../@types'
import {
  validateNoParkingPolicyIntent,
  validateParkingTimeLimitPolicyIntent,
  validatePermittedParkingPolicyIntent,
  validatePermittedVehicleCountPolicyIntent,
  validateProviderRebalancingZonePolicyIntent
} from '../service/validators'
import { isValidPolicyDomainModel, validatePolicyDomainModel, validateRuleSchema } from '../service/validators/policy'
import { PolicyFactory, RulesFactory } from './helpers'

describe('Tests Policy Validator', () => {
  describe('Rule Modality-State tests', () => {
    it('Tests Rules Schema validations', () => {
      const [rule] = RulesFactory({
        modality: 'micromobility',
        states: { available: MICRO_MOBILITY_VEHICLE_EVENTS }
      })

      expect(validateRuleSchema(rule)).not.toBeFalsy()
    })

    it('Tests Rules Schema validations - modality defaults to "micromobility"', () => {
      const [rule] = RulesFactory({
        states: { available: MICRO_MOBILITY_VEHICLE_EVENTS }
      })

      expect(validateRuleSchema(rule)).not.toBeFalsy()
    })

    it('Tests Micromobility State validation', () => {
      const policy2 = PolicyFactory({
        rules: RulesFactory({
          modality: 'micromobility',
          states: { available: MICRO_MOBILITY_VEHICLE_EVENTS }
        })
      })

      expect(() => validatePolicyDomainModel(policy2)).not.toThrowError(ValidationError)

      const policy = PolicyFactory({
        rules: RulesFactory({
          modality: 'micromobility',
          states: { available: ['NOT AN EVENT'] }
        })
      })

      expect(isValidPolicyDomainModel(policy)).toBeFalsy()

      expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)
    })

    it('Tests TNC State validation', () => {
      const policy = PolicyFactory({
        rules: RulesFactory({
          modality: 'tnc',
          states: { available: ['reservation_start', 'NOT A EVENT'] }
        })
      })

      expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)

      const policy2 = PolicyFactory({
        rules: RulesFactory({
          modality: 'tnc',
          states: { available: TNC_VEHICLE_EVENT.slice(0, 3) }
        })
      })

      expect(() => validatePolicyDomainModel(policy2)).not.toThrowError(ValidationError)
    })

    it('Tests Taxi State validation', () => {
      const policy = PolicyFactory({
        rules: RulesFactory({
          modality: 'taxi',
          states: { available: ['reservation_start', 'NOT A EVENT'] }
        })
      })

      expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)

      const policy2 = PolicyFactory({
        rules: RulesFactory({
          modality: 'taxi',
          states: { available: TAXI_VEHICLE_EVENTS.slice(0, 3) }
        })
      })

      expect(() => validatePolicyDomainModel(policy2)).not.toThrowError(ValidationError)
    })
  })

  it('Tests that rate policies require a currency', () => {
    const policy = PolicyFactory({
      rules: RulesFactory({
        modality: 'micromobility',
        rule_type: 'rate',
        states: { available: ['reservation_start'] }
      })
    })

    expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)

    const policyGood = PolicyFactory({
      rules: RulesFactory({
        modality: 'micromobility',
        rule_type: 'rate',
        states: { available: ['reservation_start'] }
      }),
      currency: 'USD'
    })

    expect(() => validatePolicyDomainModel(policyGood)).not.toThrowError(ValidationError)
  })

  it('Tests that policy without modality defined defaults to micrombility', () => {
    const policyShell = PolicyFactory()

    const { rules } = policyShell
    const policy = {
      ...policyShell,
      rules: rules.map(({ modality, ...r }) => ({
        ...r,
        states: { reserved: ['on_hours', 'provider_drop_off'] }
      }))
    }

    const result: PolicyDomainCreateModel = validatePolicyDomainModel(policy)
    expect(result.rules[0]?.modality).toStrictEqual('micromobility')
    expect(result).toMatchObject(policy)
  })

  it('Tests that policy with a rule having an invalid start_time rejects', () => {
    const policyShell = PolicyFactory()

    const { rules } = policyShell
    const policy = {
      ...policyShell,
      rules: rules.map(r => ({
        ...r,
        start_time: '10:00' // this is invalid because it's missing seconds
      }))
    }

    expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)
  })

  it('Tests that policy with a rule having an invalid end_time rejects', () => {
    const policyShell = PolicyFactory()

    const { rules } = policyShell
    const policy = {
      ...policyShell,
      rules: rules.map(r => ({
        ...r,
        end_time: '10:00' // this is invalid because it's missing seconds
      }))
    }

    expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)
  })

  it('Tests that policy with invalid propulsion types rejects', () => {
    const policyShell = PolicyFactory()

    const { rules } = policyShell
    const policy = {
      ...policyShell,
      rules: rules.map(r => ({
        ...r,
        propulsion_types: ['centipede'] // this is invalid because it's not a valid propulsion type
      }))
    }

    expect(() => validatePolicyDomainModel(policy)).toThrowError(ValidationError)
  })
})

describe('Tests Policy Intents', () => {
  const DEFAULT_POLICY_USER_FIELDS = {
    name: 'littlebunny',
    description: 'foofoo',
    provider_ids: [uuid()],
    start_date: now(),
    end_date: null
  }

  const DEFAULT_RULE_FIELDS = {
    geographies: [uuid()],
    days: ['mon'],
    start_time: '10:00:00',
    end_time: '11:00:00',
    vehicle_types: ['scooter'],
    propulsion_types: ['combustion']
  }

  describe('Tests NoParking intents', () => {
    it('passes a valid no parking intent', () => {
      const validIntent = {
        intent_type: 'no_parking',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: DEFAULT_RULE_FIELDS
      }

      expect(validateNoParkingPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('passes a valid no parking intent that has null fields', () => {
      const validIntent = {
        intent_type: 'no_parking',
        policy_fields: {
          ...DEFAULT_POLICY_USER_FIELDS,
          provider_ids: null,
          end_date: null
        },
        rule_fields: {
          geographies: [uuid()],
          days: null,
          start_time: null,
          end_time: null,
          vehicle_types: null,
          propulsion_types: null
        }
      }

      expect(validateNoParkingPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('throws with an invalid no parking intent that has no name', () => {
      const invalidIntent = {
        intent_type: 'no_parking',
        policy_fields: {
          name: null,
          description: 'foofoo',
          provider_ids: null,
          start_date: now(),
          end_date: null
        },
        rule_fields: DEFAULT_RULE_FIELDS
      }

      expect(() => validateNoParkingPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws with an invalid no parking intent that has no geographies', () => {
      const invalidIntent = {
        intent_type: 'no_parking',
        policy_fields: {
          name: null,
          description: 'foofoo',
          provider_ids: null,
          start_date: now(),
          end_date: null
        },
        rule_fields: { ...DEFAULT_RULE_FIELDS, geographies: [] }
      }

      expect(() => validateNoParkingPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })
  })

  describe('Tests PermittedVehicleCount policy intents', () => {
    it('passes a valid permitted vehicle count intent', () => {
      const validIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: 100, minimum: 0 }
      }

      expect(validatePermittedVehicleCountPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('throws with null maximum and minimum', () => {
      const validIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: null, minimum: null }
      }

      expect(() => validatePermittedVehicleCountPolicyIntent(validIntent)).toThrow(ValidationError)
    })

    it('validates maximum > minimum', () => {
      const validIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: 10, minimum: 2 }
      }
      expect(validatePermittedVehicleCountPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('validates maximum is there and minimum is null', () => {
      const validIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: 10, minimum: null }
      }
      expect(validatePermittedVehicleCountPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('validates minimum is there and maximum is null', () => {
      const validIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: null, minimum: 10 }
      }
      expect(validatePermittedVehicleCountPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('throws if minimum < 0', () => {
      const invalidIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: null, minimum: -1 }
      }

      expect(() => validatePermittedVehicleCountPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if maximum < 0', () => {
      const invalidIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: -1, minimum: 0 }
      }

      expect(() => validatePermittedVehicleCountPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if maximum < minimum', () => {
      const invalidIntent = {
        intent_type: 'permitted_vehicle_count',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: 10, minimum: 100 }
      }

      expect(() => validatePermittedVehicleCountPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })
  })

  describe('Tests ParkingTimeLimit policy intents', () => {
    it('passes a valid ParkingTimeLimit intent', () => {
      const validIntent = {
        intent_type: 'parking_time_limit',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: 100, rule_units: 'minutes' }
      }

      expect(validateParkingTimeLimitPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('passes a null maximum', () => {
      const validIntent = {
        intent_type: 'parking_time_limit',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: null, rule_units: 'minutes' }
      }
      expect(validateParkingTimeLimitPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('throws with an invalid parking time limit intent', () => {
      const invalidIntent = {
        intent_type: 'parking_time_limit',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: { ...DEFAULT_RULE_FIELDS, maximum: null, rule_units: 'aeons' }
      }

      expect(() => validatePermittedVehicleCountPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })
  })

  describe('Tests PermittedParking policy intent', () => {
    it('passes a valid PermittedParking policy intent', () => {
      const validIntent = {
        intent_type: 'permitted_parking',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, maximum: 100 },
          { ...DEFAULT_RULE_FIELDS, maximum: 50 },
          { ...DEFAULT_RULE_FIELDS, maximum: 0 }
        ]
      }

      expect(validatePermittedParkingPolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('throws if there are fewer than 2 rules', () => {
      const invalidIntent = {
        intent_type: 'permitted_parking',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [{ ...DEFAULT_RULE_FIELDS, maximum: 100 }]
      }
      expect(() => validatePermittedParkingPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if the last rule.maximum !== 0', () => {
      const invalidIntent = {
        intent_type: 'permitted_parking',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, maximum: 10 },
          { ...DEFAULT_RULE_FIELDS, maximum: 100 }
        ]
      }
      expect(() => validatePermittedParkingPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if there are too many geographies in any of the permitted parking rules', () => {
      const invalidIntent = {
        intent_type: 'permitted_parking',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, geographies: [uuid(), uuid()], maximum: 100 },
          { ...DEFAULT_RULE_FIELDS, maximum: 50 },
          { ...DEFAULT_RULE_FIELDS, maximum: 0 }
        ]
      }

      expect(() => validatePermittedParkingPolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('permits multiple geographies in the final rule', () => {
      const validIntent = {
        intent_type: 'permitted_parking',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, maximum: 100 },
          { ...DEFAULT_RULE_FIELDS, maximum: 50 },
          { ...DEFAULT_RULE_FIELDS, geographies: [uuid(), uuid()], maximum: 0 }
        ]
      }

      expect(validatePermittedParkingPolicyIntent(validIntent)).not.toBeFalsy()
    })
  })

  describe('Test ProviderRebalancingZone intent', () => {
    it('passes a valid intent', () => {
      const validIntent = {
        intent_type: 'provider_rebalancing_zone',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, maximum: 100, states: {} },
          { ...DEFAULT_RULE_FIELDS, maximum: 50, states: {} },
          {
            ...DEFAULT_RULE_FIELDS,
            geographies: [uuid(), uuid()],
            maximum: 0,
            states: {
              available: ['provider_drop_off'],
              elsewhere: ['provider_drop_off'],
              non_operational: ['provider_drop_off'],
              on_trip: ['provider_drop_off'],
              removed: ['provider_drop_off'],
              reserved: ['provider_drop_off'],
              unknown: ['provider_drop_off']
            }
          }
        ]
      }

      expect(validateProviderRebalancingZonePolicyIntent(validIntent)).not.toBeFalsy()
    })

    it('throws if the maximum for the last rule is wrong', () => {
      const invalidIntent = {
        intent_type: 'provider_rebalancing_zone',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, maximum: 100, states: {} },
          { ...DEFAULT_RULE_FIELDS, maximum: 50, states: {} },
          {
            ...DEFAULT_RULE_FIELDS,
            maximum: 100,
            states: {
              available: ['provider_drop_off'],
              elsewhere: ['provider_drop_off'],
              non_operational: ['provider_drop_off'],
              on_trip: ['provider_drop_off'],
              removed: ['provider_drop_off'],
              reserved: ['provider_drop_off'],
              unknown: ['provider_drop_off']
            }
          }
        ]
      }

      expect(() => validateProviderRebalancingZonePolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if the states are wrong', () => {
      const invalidIntent = {
        intent_type: 'provider_rebalancing_zone',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          { ...DEFAULT_RULE_FIELDS, maximum: 100, states: {} },
          { ...DEFAULT_RULE_FIELDS, maximum: 50, states: {} },
          {
            ...DEFAULT_RULE_FIELDS,
            maximum: 0,
            states: {
              available: [],
              elsewhere: ['provider_drop_off']
            }
          }
        ]
      }

      expect(() => validateProviderRebalancingZonePolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if the first rules do not have the right state', () => {
      const invalidIntent = {
        intent_type: 'provider_rebalancing_zone',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          {
            ...DEFAULT_RULE_FIELDS,
            maximum: 100,
            states: {
              elsewhere: ['provider_drop_off']
            }
          },
          { ...DEFAULT_RULE_FIELDS, maximum: 50, states: {} },
          {
            ...DEFAULT_RULE_FIELDS,
            maximum: 0,
            states: {
              available: ['provider_drop_off'],
              elsewhere: ['provider_drop_off'],
              non_operational: ['provider_drop_off'],
              on_trip: ['provider_drop_off'],
              removed: ['provider_drop_off'],
              reserved: ['provider_drop_off'],
              unknown: ['provider_drop_off']
            }
          }
        ]
      }

      expect(() => validateProviderRebalancingZonePolicyIntent(invalidIntent)).toThrow(ValidationError)
    })

    it('throws if the first rules have too many geographies', () => {
      const invalidIntent = {
        intent_type: 'provider_rebalancing_zone',
        policy_fields: DEFAULT_POLICY_USER_FIELDS,
        rule_fields: [
          {
            ...DEFAULT_RULE_FIELDS,
            maximum: 100,
            geographies: [uuid(), uuid()],
            states: {
              elsewhere: ['provider_drop_off']
            }
          },
          { ...DEFAULT_RULE_FIELDS, maximum: 50, states: {} },
          {
            ...DEFAULT_RULE_FIELDS,
            maximum: 0,
            states: {
              available: ['provider_drop_off'],
              elsewhere: ['provider_drop_off'],
              non_operational: ['provider_drop_off'],
              on_trip: ['provider_drop_off'],
              removed: ['provider_drop_off'],
              reserved: ['provider_drop_off'],
              unknown: ['provider_drop_off']
            }
          }
        ]
      }

      expect(() => validateProviderRebalancingZonePolicyIntent(invalidIntent)).toThrow(ValidationError)
    })
  })
})
