/* eslint-disable */
import { FULL_STATE_MAPPING_v0_4_1_to_v1_0_0 } from '../packages/mds-types/transformers/0_4_1_to_1_0_0'
import { VEHICLE_EVENT_v0_4_1 } from '../packages/mds-types/transformers/@types'
import {MICRO_MOBILITY_VEHICLE_STATES_v1_1_0 } from '../packages/mds-types'
type INGESTABLE_VEHICLE_EVENT = Exclude<VEHICLE_EVENT_v0_4_1, 'register'>
import { VehicleEvent_v1_0_0, VEHICLE_EVENT_v1_0_0, VEHICLE_STATE_v1_0_0 } from '../packages/mds-types/transformers/@types/1_0_0'
import { uuid, now } from '../packages/mds-utils'

import { policies } from './sandbox-to-migrate'


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
  fs.writeFileSync(`/Users/jane/work/mds-core/process-policies/${outputFile}`,
    JSON.stringify(mapTransform(activePolicies)), (err: any) => {
    console.log(err)
  })
//  */
}

processPolicies(policies, 'new-sandbox-policies')
//*/
