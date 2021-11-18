import axios from 'axios'
import { now, uuid } from '../packages/mds-utils/index'

const cmm_url = 'https://city.develop.api.lacuna-tech.io/policy-author/policies'
const headers: any = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik9USTRRMFUyT1RnNVFrRXpNREUzTWtZNE9UWTNPRVEzUWpBNU1EWkRRMEl6UWpaRVFqa3dSUSJ9.eyJodHRwczovL2xhY3VuYS5haS9wcm92aWRlcl9pZCI6IjVmNzExNGQxLTQwOTEtNDZlZS1iNDkyLWU1NTg3NWY3ZGUwMCIsImh0dHBzOi8vbGFkb3QuaW8vcHJvdmlkZXJfaWQiOiI1ZjcxMTRkMS00MDkxLTQ2ZWUtYjQ5Mi1lNTU4NzVmN2RlMDAiLCJpc3MiOiJodHRwczovL2xhY3VuYXRlY2guYXV0aDAuY29tLyIsInN1YiI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2NpdHkuZGV2ZWxvcC5hcGkubGFjdW5hLXRlY2guaW8vIiwiaWF0IjoxNjM3MTg3Nzg2LCJleHAiOjE2MzcyNzQxODYsImF6cCI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzIiwic2NvcGUiOiJhZG1pbjphbGwgYXVkaXRzOmRlbGV0ZSBhdWRpdHM6cmVhZCBhdWRpdHM6dmVoaWNsZXM6cmVhZCBhdWRpdHM6d3JpdGUgY29tcGxpYW5jZTpyZWFkIGV2ZW50czpyZWFkIHBvbGljaWVzOmRlbGV0ZSBwb2xpY2llczpwdWJsaXNoIHBvbGljaWVzOnJlYWQgcG9saWNpZXM6d3JpdGUgcHJvdmlkZXJzOnJlYWQgc2VydmljZV9hcmVhczpyZWFkIHN0YXR1c19jaGFuZ2VzOnJlYWQgdHJpcHM6cmVhZCB2ZWhpY2xlczpyZWFkIGF1dGhvcml6ZWQtY2xpZW50czpyZWFkIHJlcG9ydHM6ZW1haWw6d3JpdGUgbWV0cmljczpyZWFkIHBvbGljaWVzOnJlYWQ6cHVibGlzaGVkIHBvbGljaWVzOnJlYWQ6dW5wdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDpwdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDp1bnB1Ymxpc2hlZCBnZW9ncmFwaGllczpwdWJsaXNoIGp1cmlzZGljdGlvbnM6d3JpdGUganVyaXNkaWN0aW9uczpyZWFkIGp1cmlzZGljdGlvbnM6cmVhZDpjbGFpbSBnZW9ncmFwaGllczp3cml0ZSBpbnZvaWNlczpyZWFkIGludm9pY2VzOndyaXRlIHN0b3BzOnJlYWQgc3RvcHM6d3JpdGUgcmVzZXJ2YXRpb25zOnJlYWQgcmVzZXJ2YXRpb25zOndyaXRlIGF1ZGl0b3JzOnJlYWQgYXVkaXRvcnM6d3JpdGUgdmlvbGF0aW9uczpyZWFkIHZpb2xhdGlvbnM6d3JpdGUgdHJhbnNhY3Rpb25zOnJlYWQgdHJhbnNhY3Rpb25zOndyaXRlIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.P_RpzdiQ38-CFTULD_HB-o19eo7HgyMsPIADMJMAsgJ6FMTKRC229bF6rJIrc7H2pM_VZsiaLBmABgV2Ri82fWHxmJ_TCnWuFxr8_URxTxgp5ny6Zchdf1K33Ey5sA0SPcZQ1D2PpegpJ_zJMbp65iUf3JGyL51GiQp6LlNW6-wn4fwj1f1RQ4T2xHVGBxoyPXuexTtZTkFCdUkPEUcePZJm9PAwHdcHZrG_Jr2k55XWfZGnz6Zubcwx79hYY8YSY5it3u72QfGLUR0G7p6HBulr-da8lkdvsjasb_TCaVGCyK_Ag-88e-f_eQZ6J-w9zzbGBXGgXp2lt_Nv8vbmSw'
}

const policy_ids: string[] = [
  '8a2cc228-ec05-404a-8ae6-61bfac9b57eb',
  '4d97c64e-4095-4a18-b3ca-4997e8e341ae',
  'e82125cc-23b7-4cb7-b23e-d61f9d18b71e',
  'e8b78d7c-fec5-428d-bdfe-e148445fc31d',
  'a17f5bdb-5236-4c67-8fa2-1a1b268a87ea',
  '72bf31ad-580c-4bf6-8249-ac057897538b',
  'fb846290-df20-4852-8c95-2a9931d88fc3',
  'd3701d63-d4b6-4b92-a02e-a26f949d3a38',
  '36cb9854-8494-4101-a913-3ef6aa361266',
  '4d795557-889c-401c-a376-f67be36c9f2f',
  '60943e1a-2c6e-40d9-a2e5-c7b6b644d5e7',
  'bfdfc9fa-9381-4056-bcf9-c53155313958'
]

const deactivating_policy_ids: string[] = [
  'da6bf105-6850-4d73-b386-392c6f96f2b9',
  '6aac9fbb-ea04-4caf-ac94-8e048d3c80b1',
  'fb62a27c-c5be-4e56-99fd-b1286f597dd5',
  'd97bbbe1-4242-4395-b2e2-da3a33d540c5',
  '339208b0-3949-4df8-ba21-fe490186a867',
  '8b80e307-f8fd-479f-adbe-d107eff13897',
  '1a8ed31b-3ebe-41b4-9e82-7cba971d7e24',
  '8302fdb2-1a9c-43c7-b255-f449c0eefe73',
  '61c93183-76a1-4d0f-8b5b-5d2160eef3d8',
  '5170758f-8e09-4a65-a339-c470e6c40484',
  '210b7b9c-4785-4cb6-85fb-ec29e9165c8a',
  'baafe74e-6799-447c-935a-fd70b131fca0'
]

function generateSupersedingPolicy(policy_id: string) {
  const p = {
    name: `Deactivate ${policy_id}`,
    description: `Deactivate ${policy_id}`,
    policy_id: uuid(),
    start_date: now() + 1000 * 60 * 3,
    end_date: now() + 1000 * 60 * 8,
    prev_policies: [policy_id],
    currency: null,
    provider_ids: [],
    rules: []
  }
  console.log('new policy_id: ', p.policy_id)
  //  console.log('new policy_id: ', p.policy_id)
  return p
}

const supersedingPolicies = deactivating_policy_ids.map(policy_id => {
  return generateSupersedingPolicy(policy_id)
})

/*
Promise.all(supersedingPolicies.map(policy => axios.post(`${cmm_url}`, policy, { headers })))
  .then(res => console.log(res))
  .catch(err => console.log(err))
//  */

///*
Promise.all(
  [
    '831f2cab-939e-4f58-9b17-a966e21a7a70',
    '51dc8e3b-612e-4f88-8aae-d5ddf098713b',
    '73f38e1e-de37-49d5-8e04-60fd07b0501b',
    '868a7523-8492-4f66-b402-d6496f615d8f',
    'ed35eeb2-a4a2-483e-9efb-e956f34b9293',
    'cebdb2ed-375c-4333-9144-38ebdfa4f9e6',
    '4716e1d0-024a-4b64-b7b4-eaea42c39267',
    '4485f6fb-202a-448b-a64b-a98e129f43a1',
    'ce954cf6-e474-41b6-8856-238d9e18bf82',
    '6c6989d2-894a-40a9-a49b-99f0788dda8b',
    '6bef6891-4baf-43b2-8e69-4b910aa91094',
    'b78a54c5-b048-4216-a258-f7118b1d0795'
  ].map(id => axios.post(`${cmm_url}/${id}/publish`, {}, { headers }))
)
  .then(res => console.log(res))
  .catch(err => console.log(err))

//  */
