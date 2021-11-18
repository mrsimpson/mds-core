import axios from 'axios'
///*
const city_dev_headers: any = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik9USTRRMFUyT1RnNVFrRXpNREUzTWtZNE9UWTNPRVEzUWpBNU1EWkRRMEl6UWpaRVFqa3dSUSJ9.eyJodHRwczovL2xhY3VuYS5haS9wcm92aWRlcl9pZCI6IjVmNzExNGQxLTQwOTEtNDZlZS1iNDkyLWU1NTg3NWY3ZGUwMCIsImh0dHBzOi8vbGFkb3QuaW8vcHJvdmlkZXJfaWQiOiI1ZjcxMTRkMS00MDkxLTQ2ZWUtYjQ5Mi1lNTU4NzVmN2RlMDAiLCJpc3MiOiJodHRwczovL2xhY3VuYXRlY2guYXV0aDAuY29tLyIsInN1YiI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2NpdHkuZGV2ZWxvcC5hcGkubGFjdW5hLXRlY2guaW8vIiwiaWF0IjoxNjM1ODkwMDA3LCJleHAiOjE2MzU5NzY0MDcsImF6cCI6Im5DanRzdlA1VUJTWUdrQ1dhQTZycnA3WjIzcmlwaEpzIiwic2NvcGUiOiJhZG1pbjphbGwgYXVkaXRzOmRlbGV0ZSBhdWRpdHM6cmVhZCBhdWRpdHM6dmVoaWNsZXM6cmVhZCBhdWRpdHM6d3JpdGUgY29tcGxpYW5jZTpyZWFkIGV2ZW50czpyZWFkIHBvbGljaWVzOmRlbGV0ZSBwb2xpY2llczpwdWJsaXNoIHBvbGljaWVzOnJlYWQgcG9saWNpZXM6d3JpdGUgcHJvdmlkZXJzOnJlYWQgc2VydmljZV9hcmVhczpyZWFkIHN0YXR1c19jaGFuZ2VzOnJlYWQgdHJpcHM6cmVhZCB2ZWhpY2xlczpyZWFkIGF1dGhvcml6ZWQtY2xpZW50czpyZWFkIHJlcG9ydHM6ZW1haWw6d3JpdGUgbWV0cmljczpyZWFkIHBvbGljaWVzOnJlYWQ6cHVibGlzaGVkIHBvbGljaWVzOnJlYWQ6dW5wdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDpwdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cmVhZDp1bnB1Ymxpc2hlZCBnZW9ncmFwaGllczpwdWJsaXNoIGp1cmlzZGljdGlvbnM6d3JpdGUganVyaXNkaWN0aW9uczpyZWFkIGp1cmlzZGljdGlvbnM6cmVhZDpjbGFpbSBnZW9ncmFwaGllczp3cml0ZSBpbnZvaWNlczpyZWFkIGludm9pY2VzOndyaXRlIHN0b3BzOnJlYWQgc3RvcHM6d3JpdGUgcmVzZXJ2YXRpb25zOnJlYWQgcmVzZXJ2YXRpb25zOndyaXRlIGF1ZGl0b3JzOnJlYWQgYXVkaXRvcnM6d3JpdGUgdmlvbGF0aW9uczpyZWFkIHZpb2xhdGlvbnM6d3JpdGUgdHJhbnNhY3Rpb25zOnJlYWQgdHJhbnNhY3Rpb25zOndyaXRlIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.q4Ha2YymfpO-glkXXwdI4fbRdDzSV0M7stQUeXeiUc2XZFCRwdfSAeNmTNAcZfJ2LCiZle0EIXxmEGVMI6VqXDmZVmbVXGR4zCJ2E-D11oZ70QBnmLuu_jHPyAmR6pAScZf8WTUIic8gdhUkrQ1hvKE9QatLyj8WgHe_zs7aFMl6o0Xfwq-RLU6G3G3hcCq4DFKwMXJdHnlKcKDj7-jpLttWbjo1xT2i3S656SKB1kOTY1kFsndscozjEhMmQuv6oVq_SGEKCs88sMkxoBa-rI_AfA1zlSiEL9yI38Yy3P2KDHLw4OKFwvMKBFmyIZ11WnT0KzwOkIB-P1sz4b_0RQ'
}

const sandbox_headers: any = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFVWkJRVFUwT0RJNE9EbERRakl3TWpJeE0wVkZNamhHTmtaRFFUa3lSRGRGTmtSRFF6RkZOUSJ9.eyJodHRwczovL2xhZG90LmlvL3Byb3ZpZGVyX2lkIjoiNWY3MTE0ZDEtNDA5MS00NmVlLWI0OTItZTU1ODc1ZjdkZTAwIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmxhZG90LmlvLyIsInN1YiI6IjE4UmN1QVJLQzVSUHQ5ZmFON0VRNXdjRTVvUmNlbzB0QGNsaWVudHMiLCJhdWQiOiJodHRwczovL3NhbmRib3gubGFkb3QuaW8vIiwiaWF0IjoxNjM1ODM0Mzc3LCJleHAiOjE2MzU5MjA3NzcsImF6cCI6IjE4UmN1QVJLQzVSUHQ5ZmFON0VRNXdjRTVvUmNlbzB0Iiwic2NvcGUiOiJhZG1pbjphbGwgYXVkaXRzOmRlbGV0ZSBhdWRpdHM6cmVhZCBhdWRpdHM6dmVoaWNsZXM6cmVhZCBhdWRpdHM6d3JpdGUgY29tcGxpYW5jZTpyZWFkIGNvbXBsaWFuY2U6cmVhZDpwcm92aWRlciBldmVudHM6cmVhZCBldmVudHM6d3JpdGU6cHJvdmlkZXIgcG9saWNpZXM6ZGVsZXRlIHBvbGljaWVzOnB1Ymxpc2ggcG9saWNpZXM6cmVhZCBwb2xpY2llczp3cml0ZSBwcm92aWRlcnM6cmVhZCBzZXJ2aWNlX2FyZWFzOnJlYWQgc3RhdHVzX2NoYW5nZXM6cmVhZCB0ZWxlbWV0cnk6d3JpdGU6cHJvdmlkZXIgdHJpcHM6cmVhZCB2ZWhpY2xlczpyZWFkIHZlaGljbGVzOnJlYWQ6cHJvdmlkZXIgdmVoaWNsZXM6d3JpdGU6cHJvdmlkZXIgZXZlbnRzOnJlYWQ6cHJvdmlkZXIgbWV0cmljczpyZWFkIG1ldHJpY3M6cmVhZDpwcm92aWRlciBwb2xpY2llczpyZWFkOnB1Ymxpc2hlZCBwb2xpY2llczpyZWFkOnVucHVibGlzaGVkIGdlb2dyYXBoaWVzOnJlYWQ6cHVibGlzaGVkIGdlb2dyYXBoaWVzOnJlYWQ6dW5wdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cHVibGlzaCBqdXJpc2RpY3Rpb25zOndyaXRlIGp1cmlzZGljdGlvbnM6cmVhZCBqdXJpc2RpY3Rpb25zOnJlYWQ6Y2xhaW0gZ2VvZ3JhcGhpZXM6d3JpdGUiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.nYCq0PKobYhsZnTbmmi3lSfJwXlDyPzHdE0I_oe9qNhgfDfyofntK9nrhefTDQQQGx4rIxNN8a_z9XQ-8FFblkgCvm9gpz7q9wTZpsvemkfHOFd3-kD9aTdP6e06YU4vA39U5WlOc61mgo_edGXbJofUc_0WOeBMzNqcgJyeSm3GQ_gss3p4KCbowcMVuVr8HUT6C-AGbbLKpF9reG4wb2Ur0UCYldfIb9TMYJBq8VMmfX7aJcdjMdGK1ZPQ1ag27HY2W75jRtWEsi47NxwvzLRylsdsbNvxMhiW6FcNKxU4SWwAMlwFNbFFFBrD-dZXK1BB5PToHuUo7J5qdS3YQw'
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

const geography_ids: string[] = [
  '51987827-ed21-48bc-850f-2405897401b5',
  '4ab51ad2-b1e0-43fe-a7f1-4dbf6e8801de',
  '285a69fc-237d-4820-9c89-d9fdcd14d44f',
  '74b95e5a-e089-4246-a4e7-67c16026927c',
  '7d6d2c28-1292-41ab-ac00-60eabcd7392d',
  'b5ea8bcf-f458-46f7-bb0c-8e4acdd88954'
]

/*
const promises = geography_ids.map(id =>
  axios.get(`https://sandbox.ladot.io/geography/geographies/${id}`, { headers: sandbox_headers })
)
Promise.all(promises)
  .then(results => {
    //    results.map(r => console.log(r.data.data.geography))
    //    /*
    return Promise.all(
      results.map(result => {
        const geography = result.data.data.geography
        geography.prev_geographies = []
        geography.publish_date = undefined
        geography.effective_date = Date.now() + 1000 * 3600 * 24
        return axios.post(
          `https://city.develop.api.lacuna-tech.io/geography-author/geographies`,
          result.data.data.geography,
          {
            headers: city_dev_headers
          }
        )
      })
    )
  })
  .catch(err => console.log(err.response))
//*/

///*
const promises = geography_ids.map(id =>
  axios.put(
    `https://city.develop.api.lacuna-tech.io/geography-author/geographies/${id}/publish`,
    {},
    { headers: city_dev_headers }
  )
)

Promise.all(promises)
  .then(res => console.log(res))
  .catch(err => console.log(err))

//  */
