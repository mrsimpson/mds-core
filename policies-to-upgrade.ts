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

const old_dropoff_policy = [
   {
        "name": "Venice Special Operations Zone: Morning Deployment Policy (Revised November 2021)",
        "rules": [
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "cc14bd58-298c-4d4b-bcb1-1f519c053e0e",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "6dc968c7-19f4-421c-b9d1-683dd3cdb632"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "8c286765-0c70-428c-b7d3-e9b5a465b37d",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "aa4dc424-09e4-48f3-8471-df5186927016"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "1f0f14c8-9a85-45ad-9bfd-97ba86010505",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "f5f4a15d-447f-4969-aedb-a0e94ae5b183"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "872cf3b3-2c52-4bdb-a8ef-6e211517a1bc",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "fb411640-0220-43f4-bfc7-6f01350dadfe"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "786edbda-f2d5-421c-bc44-70002442552b",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "456c25f0-a9ce-4ff3-8610-3cee919a3539"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "7351fae3-72e2-4426-baac-3875afae9343",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "0a484e09-7a95-4e7d-86c7-a10a58268ee2"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "8ec76b17-7341-4f82-ab88-5117af1a79ee",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "06b4e69e-da53-4340-8354-5a2262034657"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "5eb9ebef-3b16-44e9-ae6b-136f4c9012e4",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "b1fdf441-ce46-4f22-bb70-dd2e99df1001"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "37c4b9b4-5353-4be9-bf74-893f8904d025",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "2166b7dd-10ab-4219-9921-0d8c0f082308"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "1fd3e28c-176f-4c39-82d5-42639832c232",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "86f9a2bd-48c8-4447-b6eb-60916da16aa1"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "cf4b6b83-a3f2-4380-8b58-4d83fc5a5128",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "d5d889c5-b6b9-4b83-bbcb-f5209d8dbcc3"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "c9e39df0-775d-4b54-9d04-a9fe52cc69e4",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "5a5b5ffa-5f9f-4db8-ba09-72c5deaac41a"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "8d00bc3e-818a-414e-b582-71b94cdb8573",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "2a4fbdb9-ff76-4060-aa92-1d37e26732e8"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "f9f007f3-aeb8-46dd-8990-0bfa6fc126ce",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "8ce201f3-34d7-46a2-aed3-282fcb6938ac"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "6d4c07ef-cefa-4933-b711-1c9087e9d367",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "2d7f76f0-f45e-4563-8be1-280f77b1181a"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "37ed5c7e-99d3-4244-8e49-026e03bc7a5a",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "45e85d25-a1bd-4972-9871-d7762e1ffe8f"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "b272b97d-e7e0-4924-840d-0b9d3f88b97d",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "9912fa40-b594-492f-91d0-113a7568bb2b"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "a7128d98-2556-4a1e-bb1b-7aba519900a0",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "e1d54dc4-9466-4d7b-bcf2-e873716d0a7b"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "46bdc43f-0671-4b86-9a72-6ca3300fedac",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "9bb19cd1-2530-4f7f-8de0-80e7326a3e32"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "d3d613ed-b485-408a-bacc-e4a7e519687c",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "2aa25299-514e-4b3f-9828-533649ceff2e"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "705b2817-743b-43a2-81e9-95926c0a2568",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "fe9c910a-7aca-4a42-9d63-e014b3c243d7"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "eed2e1fa-cfcb-456e-93aa-064b43f934a5",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "7beb1d83-66e7-4654-8c6b-6710fa26d1bd"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "b2c1cc8d-2e6c-4205-90e3-b3bf580ec186",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "c7553640-730f-4ae1-a422-68bac4b849cc"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "1e9ca2c8-ac65-424a-a1b7-34b6586f0c38",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "e42f7e97-b5e6-4ebe-8ddc-05fc806ce54e"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "7f72525a-48ef-41f6-8d05-721edd5a04e7",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "b539054b-541a-43b3-a182-58a0bd0958fd"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "1b554bd7-7e1a-43a1-8199-a6b1202ab728",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "73779ce8-e0fb-48c0-96ba-a1e7f7738279"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "970f8deb-e132-42ad-b469-f6f7b7d00774",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "050a198c-5d63-4ce4-893e-733f458b88d1"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "17fd751b-3a90-4a18-a3dc-600d68ab9bf5",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "8b318b49-664b-4efb-a54f-5eb7d8e18112"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "ee4d7905-1e72-41c1-a0e2-3259b1f0e477",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "782832e5-3784-465d-a88b-8a30756a9a3b"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "4b76f4f2-dff7-4e35-9790-62280406af03",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "f625d1a8-a9d5-49c2-aa2c-d3b8f6f5e931"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "5482e5bf-27ed-4279-b853-1e9f1f86a1b2",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "59b061bf-5eba-44de-8359-8325933e6daf"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "c15f7074-00e6-41be-a117-329df57967d2",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "41653233-80a2-47b6-9b35-4f2d78edf6d5"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "07a90b7a-5bf0-4be6-b991-aee7a2a030a7",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "b9cf1e52-7475-4fa9-bc48-5f882b58dfbb"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "06f9b6b4-84e2-4cb1-a5f6-58482a5810a8",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "a5ae0a20-e236-41cc-b820-f944f16dc332"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "78573fbd-5e85-418f-af7f-33f81f669e2e",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "15d9ce9e-ed47-43ae-929a-5066145b9ddf"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "5e6c5148-7772-4832-aef4-376b77725a57",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "5bb510c1-5641-4377-acfb-86954d979047"
            ],
            "vehicle_types": []
          },
          {
            "name": "Morning deployment drop off caps",
            "maximum": 5,
            "rule_id": "0ab934b4-30b9-448c-9cae-ec10aa45eaf8",
            "end_time": "10:00:00",
            "statuses": {
              "reserved": [],
              "available": []
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "a4b11ed5-3709-4b55-9114-df857a2c6bde"
            ],
            "vehicle_types": []
          },
          {
            "name": "No provider deployments or rebalancing outside of parking zones",
            "maximum": 0,
            "rule_id": "d7e7e77a-8965-4928-bedb-0cef03f9364a",
            "end_time": "10:00:00",
            "statuses": {
              "available": [
                "service_start",
                "provider_drop_off"
              ]
            },
            "rule_type": "count",
            "start_time": "05:00:00",
            "geographies": [
              "d556c031-7b75-4ac0-b9d9-186ea2723884"
            ],
            "vehicle_types": []
          }
        ],
        "end_date": null,
        "policy_id": "1d2d1182-e248-4b9e-a1f8-25cb29c10e14",
        "start_date": 1636531200000,
        "description": "Operators are authorized to begin daily deployment only between the hours of 5:00 a.m. to 10:00 a.m., daily, AND are authorized to deploy up to a maximum of 5 vehicles per parking zone.  Updated in Nov to add the 5am - 10am time to the last rule.",
        "provider_ids": [],
        "publish_date": 1636504824214,
        "prev_policies": [
          "79775810-2c29-45d6-8512-6772bdc1357f"
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

processPolicies(old_dropoff_policy, 'new-dropoff-policy')
//*/
