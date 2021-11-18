import axios from 'axios'
import { policies } from './new-sandbox-policies'
const start_date = Date.now() + 1000 * 60 * 60
///*
const cmm_url = 'https://city.develop.api.lacuna-tech.io/policy-author/policies'
const headers: any = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik9USTRRMFUyT1RnNVFrRXpNREUzTWtZNE9UWTNPRVEzUWpBNU1EWkRRMEl6UWpaRVFqa3dSUSJ9.eyJodHRwczovL2xhY3VuYS5haS9wcm92aWRlcl9pZCI6IjVmNzExNGQxLTQwOTEtNDZlZS1iNDkyLWU1NTg3NWY3ZGUwMCIsImh0dHBzOi8vbGFkb3QuaW8vcHJvdmlkZXJfaWQiOiI1ZjcxMTRkMS00MDkxLTQ2ZWUtYjQ5Mi1lNTU4NzVmN2RlMDAiLCJpc3MiOiJodHRwczovL2xhY3VuYXRlY2guYXV0aDAuY29tLyIsInN1YiI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2NpdHkuZGV2ZWxvcC5hcGkubGFjdW5hLXRlY2guaW8vIiwiaWF0IjoxNjM3MDg0MTUxLCJleHAiOjE2MzcxNzA1NTEsImF6cCI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzIiwic2NvcGUiOiJhZG1pbjphbGwgYXVkaXRzOmRlbGV0ZSBhdWRpdHM6cmVhZCBhdWRpdHM6dmVoaWNsZXM6cmVhZCBhdWRpdHM6d3JpdGUgY29tcGxpYW5jZTpyZWFkIGV2ZW50czpyZWFkIHBvbGljaWVzOmRlbGV0ZSBwb2xpY2llczpwdWJsaXNoIHBvbGljaWVzOnJlYWQgcG9saWNpZXM6d3JpdGUgcHJvdmlkZXJzOnJlYWQgc2VydmljZV9hcmVhczpyZWFkIHN0YXR1c19jaGFuZ2VzOnJlYWQgdHJpcHM6cmVhZCB2ZWhpY2xlczpyZWFkIGF1dGhvcml6ZWQtY2xpZW50czpyZWFkIHJlcG9ydHM6ZW1haWw6d3JpdGUgbWV0cmljczpyZWFkIHBvbGljaWVzOnJlYWQ6cHVibGlzaGVkIHBvbGljaWVzOnJlYWQ6dW5wdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDpwdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDp1bnB1Ymxpc2hlZCBnZW9ncmFwaGllczpwdWJsaXNoIGp1cmlzZGljdGlvbnM6d3JpdGUganVyaXNkaWN0aW9uczpyZWFkIGp1cmlzZGljdGlvbnM6cmVhZDpjbGFpbSBnZW9ncmFwaGllczp3cml0ZSBpbnZvaWNlczpyZWFkIGludm9pY2VzOndyaXRlIHN0b3BzOnJlYWQgc3RvcHM6d3JpdGUgcmVzZXJ2YXRpb25zOnJlYWQgcmVzZXJ2YXRpb25zOndyaXRlIGF1ZGl0b3JzOnJlYWQgYXVkaXRvcnM6d3JpdGUgdmlvbGF0aW9uczpyZWFkIHZpb2xhdGlvbnM6d3JpdGUgdHJhbnNhY3Rpb25zOnJlYWQgdHJhbnNhY3Rpb25zOndyaXRlIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.oxP0mJpFlIVHuDTGx26Sk7s04Re2zmQQT17k3wAuOBzYHphy5aOSl9Yw1lQwiGmB4jp4-yKG9rboSW1dXl3bCVZVYP4rgXX4yJy-9DHIBj9JqlCB_xa7Orb2XESkb43JuOHI59bDjONnwltdBUewaFxpuSOh68z65-DwlLMEloNwueBA3mLYOm99bT9QdBVdfo7YSvl9eN7ZqwA8yj68V_ldIW7qNTCH7jFm5A71uQGN7fcM1s2y1qKhzmJAXsaQ-jT3w1Sd327O-xUD2YCdRLkRvHgHYWA-z-rF3R2igxUlkfETRJKbmMvNFjVG63iFj8oknKleoQk62Q-5rSe9qw'
}
//*/

/*
Promise.all(
  policies.map(policy => {
    policy.start_date = start_date
    return axios.post(`${cmm_url}`, policy, { headers })
  })
)
  .then(res => {
    console.log(res)
    return
  })
  .catch(err => console.log(err.response))
//*/

///*
Promise.all(
  policies.map(policy => {
    return axios.post(
      `https://city.develop.api.lacuna-tech.io/policy-author/policies/${policy.policy_id}/publish`,
      {},
      {
        headers
      }
    )
  })
)
  .then(res => {
    console.log(res)
    return
  })
  .catch(err => console.log(err.response))
//*/
