/* eslint-disable */



 import { FULL_STATE_MAPPING_v0_4_1_to_v1_0_0 } from './packages/mds-types/transformers/0_4_1_to_1_0_0'
import { VEHICLE_EVENT_v0_4_1 } from './packages/mds-types/transformers/@types'
import {MICRO_MOBILITY_VEHICLE_STATES_v1_1_0 } from './packages/mds-types'
type INGESTABLE_VEHICLE_EVENT = Exclude<VEHICLE_EVENT_v0_4_1, 'register'>
import { VehicleEvent_v1_0_0, VEHICLE_EVENT_v1_0_0, VEHICLE_STATE_v1_0_0 } from './packages/mds-types/transformers/@types/1_0_0'
import { uuid, now } from './packages/mds-utils'

// const active_policies = policies.filter(p => ids.includes(p.policy_id))


export const STATES_MAPPING: { [key:string]: string } = {
    available: 'available',
    elsewhere: 'elsewhere',
    reserved: 'reserved',
    removed: 'removed',
    trip: 'on_trip',
    inactive: 'unknown',
    unavailable: 'non_operational',

}

interface Rule {
    statuses: { [key: string]: INGESTABLE_VEHICLE_EVENT[] }
    [key: string]: any
}

 function transform_rule_statuses(rule: Rule) {
    const translated_states: { [key: string]: any } = {}
    const states: { [key: string]: string[] } = {}
    const event_types: string[] = []
    Object.keys(rule.statuses).forEach(status => {
            let candidate_state = 'unknown'
            const new_event_types: VEHICLE_EVENT_v1_0_0[] = (rule.statuses[status]).map((event_type) => {
                candidate_state = FULL_STATE_MAPPING_v0_4_1_to_v1_0_0[event_type]['no_event_type_reason'].vehicle_state
                const new_event_type = FULL_STATE_MAPPING_v0_4_1_to_v1_0_0[event_type]['no_event_type_reason'].event_type
                if (new_event_type === 'maintenance') {
                    return 'off_hours'
                }
                return new_event_type
                    })
            event_types.push(...new_event_types)
            if (!!STATES_MAPPING[status] && STATES_MAPPING[status] !== 'unknown') {
                const state = STATES_MAPPING[status]
                translated_states[state] = new_event_types
                } else {

                    translated_states[candidate_state] = new_event_types
                }
            })
    if (event_types.length > 0) {
      MICRO_MOBILITY_VEHICLE_STATES_v1_1_0.forEach(state => {
        states[state] = event_types
      })
      return states
    }
    return translated_states
 }

 function getSupersededPolicies(policies: any[]) {
   const supersededIDs: any[] = []
   policies.forEach((policy: any) => {
    if (policy.prev_policies) {
      supersededIDs.push(policy.prev_policies)
    }
   })
   return supersededIDs.flat()
 }

const isPolicyActive = (supersededIDs: string[])  =>
    (policy: any) => {
      const { policy_id } = policy
   // superseded
   if (supersededIDs.includes(policy.policy_id)) {
     console.log(`superseded ${policy.policy_id} found`)
     return false
   }
   // unpublished
   /*
   if (!policy.publish_date) {
     console.log(`unpublished ${policy_id}`)
     return false
   }
   */
   // expired
   if (policy.end_date && policy.end_date < now()) {
     console.log(`expired ${policy_id}`)
     return false
   }

   if (policy.name.match(/Deactivate/)) {
     return false
   }
   console.log(`active policy: ${policy_id}`)
   return true
 }

 function transform(policy: any) {
     policy.rules.forEach((rule: any) => {

      // new uuids for everything!
        const states = transform_rule_statuses(rule)
        delete rule.statuses
        rule.states = states
        rule.rule_id = uuid()
        rule.modality = 'micromobility'
             })
    const old_uuid = policy.policy_id
    policy.policy_id = uuid()
    policy.description = `${policy.description} - Migrated from 0.4 ${old_uuid}`
    policy.prev_policies = null
    policy.publish_date = undefined
    policy.start_date = Date.now() + (1000 * 60 * 60 * 12)
    console.log(policy.prev_policies)
    return policy
 }

function mapTransform(policies: any) {
  return policies.map((p: any) => {
    //    console.dir(p, { depth:  null })
        const policy = transform(p)
//        console.dir(policy, { depth: null })
//        console.log([p, policy])
        return policy
            })
}


const new_dev_policies = [
  {
    "policy_id": "5bcd3e11-c4f1-4d4a-a0dd-490ad4ae47ea",
    "provider_ids": [],
    "name": "For Dev - Equity Zone Minimum scooter deployment",
    "description": "Minimum 115 scooters for every provider operating in Seattle from 9am - 7pm",
    "start_date": 1633935600000,
    "end_date": null,
    "prev_policies": null,
    "rules": [
      {
        "rule_id": "83b2d908-8834-494c-a194-4ece340b0956",
        "name": "Minimum 115 scooters or bikes in Equity Zones during the day",
        "rule_type": "count",
        "geographies": [
          "51987827-ed21-48bc-850f-2405897401b5"
        ],
        "vehicle_types": [
          "scooter",
          "bicycle"
        ],
        "statuses": {},
        "minimum": 115,
        "start_time": "09:00:00",
        "end_time": "19:00:00"
      }
    ]
  },
  {
    "policy_id": "8a7b9554-18e8-4955-8e29-d2ce121f245c",
    "provider_ids": [],
    "name": "For Dev - Farmers' market every Saturday",
    "description": "No scooters allowed in the farmers' market",
    "start_date": 1633849200000,
    "end_date": null,
    "prev_policies": null,
    "rules": [
      {
        "rule_id": "d1a05c2e-49dc-4918-9d21-18d72fd85983",
        "name": "No vehicles allowed",
        "rule_type": "count",
        "geographies": [
          "4ab51ad2-b1e0-43fe-a7f1-4dbf6e8801de"
        ],
        "vehicle_types": [],
        "statuses": {},
        "maximum": 0,
        "days": [
          "sun"
        ],
        "start_time": "09:30:00",
        "end_time": "02:00:00"
      }
    ]
  },
  {
    "policy_id": "c9f55f2e-7fcf-4dd2-8eca-690a930c3c59",
    "provider_ids": [],
    "name": "For Dev - Provider drop zones for downtown",
    "description": "Providers can drop a maximum of 30 vehicles in the 5 new dropoff zones",
    "start_date": 1633244400000,
    "end_date": null,
    "prev_policies": null,
    "rules": [
      {
        "rule_id": "44158d43-3edb-421e-94a3-4768a64487d2",
        "name": "Maximum 35 vehicles deployed to downtown parking zones in the morning",
        "rule_type": "count",
        "geographies": [
          "285a69fc-237d-4820-9c89-d9fdcd14d44f"
        ],
        "vehicle_types": [],
        "statuses": {
          "available": [
            "provider_drop_off"
          ]
        },
        "maximum": 35,
        "start_time": "05:00:00",
        "end_time": "11:00:00"
      },
      {
        "rule_id": "4c36c728-f524-484f-9cd2-13d81b2af521",
        "name": "No Provider dropoffs allowed here in the morning",
        "rule_type": "count",
        "geographies": [
          "74b95e5a-e089-4246-a4e7-67c16026927c"
        ],
        "vehicle_types": [],
        "statuses": {
          "available": [
            "provider_drop_off"
          ]
        },
        "maximum": 0,
        "start_time": "05:00:00",
        "end_time": "10:00:00"
      }
    ]
  }
  ,{
    "policy_id": "a29b4cc9-f0f5-4613-b629-347f3e780fb8",
    "provider_ids": [],
    "name": "For Dev - Slow Zone in dangerous traffic cooridor",
    "description": "Throttle down to 8 mph for scooters and bikes in this area with higher density of traffic incidences",
    "start_date": 1633071600000,
    "end_date": null,
    "prev_policies": null,
    "rules": [
      {
        "rule_id": "d6e63037-eb3f-49e7-8629-cdb20294ba1d",
        "name": "8 MPH maximum for bikes and scooters",
        "rule_type": "speed",
        "rule_units": "mph",
        "geographies": [
          "7d6d2c28-1292-41ab-ac00-60eabcd7392d"
        ],
        "vehicle_types": [
          "bicycle",
          "scooter"
        ],
        "statuses": {},
        "minimum": 0,
        "maximum": 8
      }
    ]
  }
  ,
  {
    "policy_id": "34e3980c-c84e-4b39-9e40-639892ff4d7b",
    "provider_ids": [],
    "name": "For dev - 5 MPH speed limit around the Space Needle",
    "description": "Limit speed to 5mph around the Space Needle",
    "start_date": 1633244400000,
    "end_date": null,
    "prev_policies": null,
    "rules": [
      {
        "rule_id": "26aad212-6862-4808-9bec-b386da7cdc84",
        "name": "5MPH limit around the Space Needle",
        "rule_type": "speed",
        "rule_units": "mph",
        "geographies": [
          "b5ea8bcf-f458-46f7-bb0c-8e4acdd88954"
        ],
        "vehicle_types": [],
        "statuses": {},
        "maximum": 5
      }
    ]
  }
]

///*
const fs = require('fs')
console.log('logging')
function processPolicies(policies: any[], outputFile: string) {
  console.log('total number of policies: ', policies.length)
  const superseded = getSupersededPolicies(policies)
  console.log('superseded', superseded.length)
  const activePolicies = policies.filter(isPolicyActive(superseded))
  console.log('activePolicies', activePolicies.length)
//  /*
  fs.writeFileSync(`/Users/jane/work/mds-core/${outputFile}`,
    JSON.stringify(mapTransform(activePolicies)), (err: any) => {
    console.log(err)
  })
//  */
}

processPolicies(new_dev_policies, 'new-seattle-dev-policies')
//*/
