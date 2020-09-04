import { ComplianceResponse } from '../@types'

export const COMPLIANCE_RESPONSE_ID = 'dceece80-c05a-430f-be7d-e95c954f0d34'

export const COMPLIANCE_RESPONSE_1: ComplianceResponse = {
  policy: {
    name: 'LADOT Mobility Caps',
    description: 'Mobility caps as described in the One-Year Permit',
    policy_id: '72971a3d-876c-41ea-8e48-c9bb965bbbcc',
    start_date: 1558389669540,
    publish_date: 1558389669540,
    end_date: null,
    prev_policies: null,
    provider_ids: [],
    rules: [
      {
        name: 'Greater LA',
        rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
        rule_type: 'count',
        geographies: ['8917cf2d-a963-4ea2-a98b-7725050b3ec5'],
        statuses: { available: [], unavailable: [], reserved: [], trip: [] },
        vehicle_types: ['bicycle', 'scooter'],
        maximum: 10,
        minimum: 5
      }
    ]
  },
  rule_compliances: [
    {
      rule: {
        name: 'Greater LA',
        rule_id: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
        rule_type: 'count',
        geographies: ['8917cf2d-a963-4ea2-a98b-7725050b3ec5'],
        statuses: { available: [], unavailable: [], reserved: [], trip: [] },
        vehicle_types: ['bicycle', 'scooter'],
        maximum: 10,
        minimum: 5
      },
      matches: [
        {
          measured: 7,
          geography_id: '8917cf2d-a963-4ea2-a98b-7725050b3ec5'
        }
      ]
    }
  ],
  total_violations: 0,
  vehicles_in_violation: []
}
