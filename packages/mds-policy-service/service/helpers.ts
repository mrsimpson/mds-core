import { uuid } from '@mds-core/mds-utils'
import type { PolicyDomainModel } from '../@types'
import type {
  BaseIntentPolicyUserFields,
  BaseIntentRuleUserFields,
  IntentDraft,
  INTENT_TYPE,
  NoParkingIntentPolicyUserFields,
  NoParkingIntentRuleUserFields
} from '../@types/intents'
import { BASE_POLICY_DEFAULTS, INTENT_RULE_CONSTANTS } from '../@types/intents'

export function translateIntentToPolicy<
  I extends INTENT_TYPE = 'no_parking',
  INTENT_POLICY_FIELDS extends BaseIntentPolicyUserFields = NoParkingIntentPolicyUserFields,
  INTENT_RULE_TYPE extends BaseIntentRuleUserFields = NoParkingIntentRuleUserFields
>(draft: IntentDraft<I, INTENT_POLICY_FIELDS, INTENT_RULE_TYPE>): PolicyDomainModel {
  return {
    policy_id: uuid(),
    ...BASE_POLICY_DEFAULTS,
    ...draft.policy_fields,
    rules: [
      {
        rule_id: uuid(),
        ...INTENT_RULE_CONSTANTS[draft.intent_type],
        ...draft.rule_fields
      }
    ]
  }
}
