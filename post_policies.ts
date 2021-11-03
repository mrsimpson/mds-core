import axios from 'axios'

const policies = [
  {
    policy_id: '4d795557-889c-401c-a376-f67be36c9f2f',
    provider_ids: [],
    name: 'For Dev - Equity Zone Minimum scooter deployment',
    description:
      'Minimum 115 scooters for every provider operating in Seattle from 9am - 7pm - Migrated from 0.4 5bcd3e11-c4f1-4d4a-a0dd-490ad4ae47ea',
    start_date: 1635944629112,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '8e7a6e10-6253-4dcb-a911-ac385869a0a0',
        name: 'Minimum 115 scooters or bikes in Equity Zones during the day',
        rule_type: 'count',
        geographies: ['51987827-ed21-48bc-850f-2405897401b5'],
        vehicle_types: ['scooter', 'bicycle'],
        minimum: 115,
        start_time: '09:00:00',
        end_time: '19:00:00',
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: 'a17f5bdb-5236-4c67-8fa2-1a1b268a87ea',
    provider_ids: [],
    name: "For Dev - Farmers' market every Saturday",
    description: "No scooters allowed in the farmers' market - Migrated from 0.4 8a7b9554-18e8-4955-8e29-d2ce121f245c",
    start_date: 1635944629112,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '6a6e5a1f-ecc7-4919-be00-c55cf6bb3127',
        name: 'No vehicles allowed',
        rule_type: 'count',
        geographies: ['4ab51ad2-b1e0-43fe-a7f1-4dbf6e8801de'],
        vehicle_types: [],
        maximum: 0,
        days: ['sun'],
        start_time: '09:30:00',
        end_time: '02:00:00',
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: 'e8b78d7c-fec5-428d-bdfe-e148445fc31d',
    provider_ids: [],
    name: 'For Dev - Provider drop zones for downtown',
    description:
      'Providers can drop a maximum of 30 vehicles in the 5 new dropoff zones - Migrated from 0.4 c9f55f2e-7fcf-4dd2-8eca-690a930c3c59',
    start_date: 1635944629112,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'b63a6c4e-ca80-4058-8d33-57398db797c9',
        name: 'Maximum 35 vehicles deployed to downtown parking zones in the morning',
        rule_type: 'count',
        geographies: ['285a69fc-237d-4820-9c89-d9fdcd14d44f'],
        vehicle_types: [],
        maximum: 35,
        start_time: '05:00:00',
        end_time: '11:00:00',
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      },
      {
        rule_id: 'e7ab4025-3445-48d1-9920-5eaa27b5400e',
        name: 'No Provider dropoffs allowed here in the morning',
        rule_type: 'count',
        geographies: ['74b95e5a-e089-4246-a4e7-67c16026927c'],
        vehicle_types: [],
        maximum: 0,
        start_time: '05:00:00',
        end_time: '10:00:00',
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: 'e82125cc-23b7-4cb7-b23e-d61f9d18b71e',
    provider_ids: [],
    name: 'For Dev - Slow Zone in dangerous traffic cooridor',
    description:
      'Throttle down to 8 mph for scooters and bikes in this area with higher density of traffic incidences - Migrated from 0.4 a29b4cc9-f0f5-4613-b629-347f3e780fb8',
    start_date: 1635944629113,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'daaa4274-fdd7-465f-863a-c082ab32591c',
        name: '8 MPH maximum for bikes and scooters',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['7d6d2c28-1292-41ab-ac00-60eabcd7392d'],
        vehicle_types: ['bicycle', 'scooter'],
        minimum: 0,
        maximum: 8,
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '4d97c64e-4095-4a18-b3ca-4997e8e341ae',
    provider_ids: [],
    name: 'For dev - 5 MPH speed limit around the Space Needle',
    description: 'Limit speed to 5mph around the Space Needle - Migrated from 0.4 34e3980c-c84e-4b39-9e40-639892ff4d7b',
    start_date: 1635944629113,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'a9efcc11-2b37-4baf-ba7f-85ab22ce371f',
        name: '5MPH limit around the Space Needle',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['b5ea8bcf-f458-46f7-bb0c-8e4acdd88954'],
        vehicle_types: [],
        maximum: 5,
        states: {},
        modality: 'micromobility'
      }
    ]
  }
]
///*
const headers: any = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik9USTRRMFUyT1RnNVFrRXpNREUzTWtZNE9UWTNPRVEzUWpBNU1EWkRRMEl6UWpaRVFqa3dSUSJ9.eyJodHRwczovL2xhY3VuYS5haS9wcm92aWRlcl9pZCI6IjVmNzExNGQxLTQwOTEtNDZlZS1iNDkyLWU1NTg3NWY3ZGUwMCIsImh0dHBzOi8vbGFkb3QuaW8vcHJvdmlkZXJfaWQiOiI1ZjcxMTRkMS00MDkxLTQ2ZWUtYjQ5Mi1lNTU4NzVmN2RlMDAiLCJpc3MiOiJodHRwczovL2xhY3VuYXRlY2guYXV0aDAuY29tLyIsInN1YiI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2NpdHkuZGV2ZWxvcC5hcGkubGFjdW5hLXRlY2guaW8vIiwiaWF0IjoxNjM1ODkwMDA3LCJleHAiOjE2MzU5NzY0MDcsImF6cCI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzIiwic2NvcGUiOiJhZG1pbjphbGwgYXVkaXRzOmRlbGV0ZSBhdWRpdHM6cmVhZCBhdWRpdHM6dmVoaWNsZXM6cmVhZCBhdWRpdHM6d3JpdGUgY29tcGxpYW5jZTpyZWFkIGV2ZW50czpyZWFkIHBvbGljaWVzOmRlbGV0ZSBwb2xpY2llczpwdWJsaXNoIHBvbGljaWVzOnJlYWQgcG9saWNpZXM6d3JpdGUgcHJvdmlkZXJzOnJlYWQgc2VydmljZV9hcmVhczpyZWFkIHN0YXR1c19jaGFuZ2VzOnJlYWQgdHJpcHM6cmVhZCB2ZWhpY2xlczpyZWFkIGF1dGhvcml6ZWQtY2xpZW50czpyZWFkIHJlcG9ydHM6ZW1haWw6d3JpdGUgbWV0cmljczpyZWFkIHBvbGljaWVzOnJlYWQ6cHVibGlzaGVkIHBvbGljaWVzOnJlYWQ6dW5wdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDpwdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDp1bnB1Ymxpc2hlZCBnZW9ncmFwaGllczpwdWJsaXNoIGp1cmlzZGljdGlvbnM6d3JpdGUganVyaXNkaWN0aW9uczpyZWFkIGp1cmlzZGljdGlvbnM6cmVhZDpjbGFpbSBnZW9ncmFwaGllczp3cml0ZSBpbnZvaWNlczpyZWFkIGludm9pY2VzOndyaXRlIHN0b3BzOnJlYWQgc3RvcHM6d3JpdGUgcmVzZXJ2YXRpb25zOnJlYWQgcmVzZXJ2YXRpb25zOndyaXRlIGF1ZGl0b3JzOnJlYWQgYXVkaXRvcnM6d3JpdGUgdmlvbGF0aW9uczpyZWFkIHZpb2xhdGlvbnM6d3JpdGUgdHJhbnNhY3Rpb25zOnJlYWQgdHJhbnNhY3Rpb25zOndyaXRlIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.q4Ha2YymfpO-glkXXwdI4fbRdDzSV0M7stQUeXeiUc2XZFCRwdfSAeNmTNAcZfJ2LCiZle0EIXxmEGVMI6VqXDmZVmbVXGR4zCJ2E-D11oZ70QBnmLuu_jHPyAmR6pAScZf8WTUIic8gdhUkrQ1hvKE9QatLyj8WgHe_zs7aFMl6o0Xfwq-RLU6G3G3hcCq4DFKwMXJdHnlKcKDj7-jpLttWbjo1xT2i3S656SKB1kOTY1kFsndscozjEhMmQuv6oVq_SGEKCs88sMkxoBa-rI_AfA1zlSiEL9yI38Yy3P2KDHLw4OKFwvMKBFmyIZ11WnT0KzwOkIB-P1sz4b_0RQ'
}
//*/

/*
Promise.all(policies.map(policy => {
  policy.start_date = 1633742323229
  axios.put(`https://api.ladot.io/v1/policy-author/policies/${policy.policy_id}`, policy, { headers })
})).then(res => {
//  console.log(res)
}).catch(err => console.log(err.response))
//*/

const new_policies = [
  {
    policy_id: '4d795557-889c-401c-a376-f67be36c9f2f',
    provider_ids: [],
    name: 'For Dev - Equity Zone Minimum scooter deployment',
    description:
      'Minimum 115 scooters for every provider operating in Seattle from 9am - 7pm - Migrated from 0.4 5bcd3e11-c4f1-4d4a-a0dd-490ad4ae47ea',
    start_date: 1635944629112,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '8e7a6e10-6253-4dcb-a911-ac385869a0a0',
        name: 'Minimum 115 scooters or bikes in Equity Zones during the day',
        rule_type: 'count',
        geographies: ['51987827-ed21-48bc-850f-2405897401b5'],
        vehicle_types: ['scooter', 'bicycle'],
        minimum: 115,
        start_time: '09:00:00',
        end_time: '19:00:00',
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: 'a17f5bdb-5236-4c67-8fa2-1a1b268a87ea',
    provider_ids: [],
    name: "For Dev - Farmers' market every Saturday",
    description: "No scooters allowed in the farmers' market - Migrated from 0.4 8a7b9554-18e8-4955-8e29-d2ce121f245c",
    start_date: 1635944629112,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: '6a6e5a1f-ecc7-4919-be00-c55cf6bb3127',
        name: 'No vehicles allowed',
        rule_type: 'count',
        geographies: ['4ab51ad2-b1e0-43fe-a7f1-4dbf6e8801de'],
        vehicle_types: [],
        maximum: 0,
        days: ['sun'],
        start_time: '09:30:00',
        end_time: '02:00:00',
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: 'e8b78d7c-fec5-428d-bdfe-e148445fc31d',
    provider_ids: [],
    name: 'For Dev - Provider drop zones for downtown',
    description:
      'Providers can drop a maximum of 30 vehicles in the 5 new dropoff zones - Migrated from 0.4 c9f55f2e-7fcf-4dd2-8eca-690a930c3c59',
    start_date: 1635944629112,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'b63a6c4e-ca80-4058-8d33-57398db797c9',
        name: 'Maximum 35 vehicles deployed to downtown parking zones in the morning',
        rule_type: 'count',
        geographies: ['285a69fc-237d-4820-9c89-d9fdcd14d44f'],
        vehicle_types: [],
        maximum: 35,
        start_time: '05:00:00',
        end_time: '11:00:00',
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      },
      {
        rule_id: 'e7ab4025-3445-48d1-9920-5eaa27b5400e',
        name: 'No Provider dropoffs allowed here in the morning',
        rule_type: 'count',
        geographies: ['74b95e5a-e089-4246-a4e7-67c16026927c'],
        vehicle_types: [],
        maximum: 0,
        start_time: '05:00:00',
        end_time: '10:00:00',
        states: {
          available: ['provider_drop_off'],
          elsewhere: ['provider_drop_off'],
          non_operational: ['provider_drop_off'],
          on_trip: ['provider_drop_off'],
          removed: ['provider_drop_off'],
          reserved: ['provider_drop_off'],
          unknown: ['provider_drop_off']
        },
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: 'e82125cc-23b7-4cb7-b23e-d61f9d18b71e',
    provider_ids: [],
    name: 'For Dev - Slow Zone in dangerous traffic cooridor',
    description:
      'Throttle down to 8 mph for scooters and bikes in this area with higher density of traffic incidences - Migrated from 0.4 a29b4cc9-f0f5-4613-b629-347f3e780fb8',
    start_date: 1635944629113,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'daaa4274-fdd7-465f-863a-c082ab32591c',
        name: '8 MPH maximum for bikes and scooters',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['7d6d2c28-1292-41ab-ac00-60eabcd7392d'],
        vehicle_types: ['bicycle', 'scooter'],
        minimum: 0,
        maximum: 8,
        states: {},
        modality: 'micromobility'
      }
    ]
  },
  {
    policy_id: '4d97c64e-4095-4a18-b3ca-4997e8e341ae',
    provider_ids: [],
    name: 'For dev - 5 MPH speed limit around the Space Needle',
    description: 'Limit speed to 5mph around the Space Needle - Migrated from 0.4 34e3980c-c84e-4b39-9e40-639892ff4d7b',
    start_date: 1635944629113,
    end_date: null,
    prev_policies: null,
    rules: [
      {
        rule_id: 'a9efcc11-2b37-4baf-ba7f-85ab22ce371f',
        name: '5MPH limit around the Space Needle',
        rule_type: 'speed',
        rule_units: 'mph',
        geographies: ['b5ea8bcf-f458-46f7-bb0c-8e4acdd88954'],
        vehicle_types: [],
        maximum: 5,
        states: {},
        modality: 'micromobility'
      }
    ]
  }
]

const policy_ids: string[] = [
  '5bcd3e11-c4f1-4d4a-a0dd-490ad4ae47ea',
  '8a7b9554-18e8-4955-8e29-d2ce121f245c',
  'c9f55f2e-7fcf-4dd2-8eca-690a930c3c59',
  'a29b4cc9-f0f5-4613-b629-347f3e780fb8',
  '34e3980c-c84e-4b39-9e40-639892ff4d7b'
]

///*
Promise.all(
  new_policies.map(policy => {
    return axios.post(
      `https://city.develop.api.lacuna-tech.io/policy-author/policies/${policy.policy_id}/publish`,
      {},
      { headers }
    )
  })
)
  .then(res => {
    console.log(res)
  })
  .catch(err => console.log(err.response))
//*/
