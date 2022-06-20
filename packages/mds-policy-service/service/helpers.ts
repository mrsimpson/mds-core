import { isDefined, minutes, now, uuid } from '@mds-core/mds-utils'
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

export const TWENTY_MINUTES = minutes(20)
const POLICY_START_DATE_FUDGE_FACTOR = 1000

export function translateIntentToPolicy<
  I extends INTENT_TYPE = 'no_parking',
  INTENT_POLICY_FIELDS extends BaseIntentPolicyUserFields = NoParkingIntentPolicyUserFields,
  INTENT_RULE_TYPE extends BaseIntentRuleUserFields = NoParkingIntentRuleUserFields
>(draft: IntentDraft<I, INTENT_POLICY_FIELDS, INTENT_RULE_TYPE>): PolicyDomainModel {
  /* The spec says that the start_date must exceed the published_date by 20 minutes.
   * Putting this logic here for now because the only logical place among the service endpoints
   * to put it would be the publishing endpoint, and it feels a bit weird for the publishing endpoint
   * to alter the start_date.
   *
   * I'd like to wait to get a clearer sense of how the front-end flows for policy creation
   * will develop.
   */
  const { start_date } = draft.policy_fields
  if (!isDefined(start_date) || start_date - now() < TWENTY_MINUTES) {
    // Adding 1000 as a fudge factor to ensure that the start_date is
    // at least 20 minutes in the future.
    draft.policy_fields.start_date = now() + TWENTY_MINUTES + POLICY_START_DATE_FUDGE_FACTOR
  }
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
