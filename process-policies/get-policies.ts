import axios from 'axios'
import fs from 'fs'

const sandbox_headers: any = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFVWkJRVFUwT0RJNE9EbERRakl3TWpJeE0wVkZNamhHTmtaRFFUa3lSRGRGTmtSRFF6RkZOUSJ9.eyJodHRwczovL2xhZG90LmlvL3Byb3ZpZGVyX2lkIjoiNWY3MTE0ZDEtNDA5MS00NmVlLWI0OTItZTU1ODc1ZjdkZTAwIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmxhZG90LmlvLyIsInN1YiI6IjE4UmN1QVJLQzVSUHQ5ZmFON0VRNXdjRTVvUmNlbzB0QGNsaWVudHMiLCJhdWQiOiJodHRwczovL3NhbmRib3gubGFkb3QuaW8vIiwiaWF0IjoxNjM3MDk4NDc3LCJleHAiOjE2MzcxODQ4NzcsImF6cCI6IjE4UmN1QVJLQzVSUHQ5ZmFON0VRNXdjRTVvUmNlbzB0Iiwic2NvcGUiOiJhZG1pbjphbGwgYXVkaXRzOmRlbGV0ZSBhdWRpdHM6cmVhZCBhdWRpdHM6dmVoaWNsZXM6cmVhZCBhdWRpdHM6d3JpdGUgY29tcGxpYW5jZTpyZWFkIGNvbXBsaWFuY2U6cmVhZDpwcm92aWRlciBldmVudHM6cmVhZCBldmVudHM6d3JpdGU6cHJvdmlkZXIgcG9saWNpZXM6ZGVsZXRlIHBvbGljaWVzOnB1Ymxpc2ggcG9saWNpZXM6cmVhZCBwb2xpY2llczp3cml0ZSBwcm92aWRlcnM6cmVhZCBzZXJ2aWNlX2FyZWFzOnJlYWQgc3RhdHVzX2NoYW5nZXM6cmVhZCB0ZWxlbWV0cnk6d3JpdGU6cHJvdmlkZXIgdHJpcHM6cmVhZCB2ZWhpY2xlczpyZWFkIHZlaGljbGVzOnJlYWQ6cHJvdmlkZXIgdmVoaWNsZXM6d3JpdGU6cHJvdmlkZXIgZXZlbnRzOnJlYWQ6cHJvdmlkZXIgbWV0cmljczpyZWFkIG1ldHJpY3M6cmVhZDpwcm92aWRlciBwb2xpY2llczpyZWFkOnB1Ymxpc2hlZCBwb2xpY2llczpyZWFkOnVucHVibGlzaGVkIGdlb2dyYXBoaWVzOnJlYWQ6cHVibGlzaGVkIGdlb2dyYXBoaWVzOnJlYWQ6dW5wdWJsaXNoZWQgZ2VvZ3JhcGhpZXM6cHVibGlzaCBqdXJpc2RpY3Rpb25zOndyaXRlIGp1cmlzZGljdGlvbnM6cmVhZCBqdXJpc2RpY3Rpb25zOnJlYWQ6Y2xhaW0gZ2VvZ3JhcGhpZXM6d3JpdGUiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.Gug8aEbNWrPIl7QCmdnG3UbdGdsyKN9kE96WRqMC1sFIdhyQdHyowJRbpMZHqD7CmyvKZxuVVaihBT17e4Ffk3pYcmmgIGmZVsPrYMy6CBGgrS3tgtUrOXUMklJAeMZt5LDW5SuSBQuG2ACl97mfxzxNQb30yzGJwBpfZ-1kTU6RnWKX7qoKejmA7nS5ue4ucdVRu7AqnzkNWGSxOk8PWrBtrWk9BmZlO950CyWe9_8kiLxItv_NiOyfVAc5ggFksxEKYKzCzkTC17VGF11RVigVYZ1_-cqaTkvc8NKjS0VF2Z0zLyDFJxvP80oVLyHKRwoAeTR1VwUzts1SgI3ZWw'
}

const url = 'https://sandbox.ladot.io/policy/policies/'
const policy_ids = [
  'c9f55f2e-7fcf-4dd2-8eca-690a930c3c59',
  '86b05561-7b06-48dc-8481-7861d36d0137',
  '842b1a07-0a1a-4ea7-8264-05f01fde09a8',
  '5cb27d3c-d55f-4eca-8212-367507a3c63c',
  '5a4c1033-73f8-449c-9d91-741e3af81554',
  '34e3980c-c84e-4b39-9e40-639892ff4d7b',
  '5bcd3e11-c4f1-4d4a-a0dd-490ad4ae47ea',
  '8a7b9554-18e8-4955-8e29-d2ce121f245c'
]

let policies: any
Promise.all(policy_ids.map(id => axios.get(`${url}${id}`, { headers: sandbox_headers })))
  .then(res => {
    policies = res.map(r => r.data.data.policy)
    console.dir(policies, { depth: null })
    fs.writeFile('sandbox-to-migrate.ts', `export const policies = ${JSON.stringify(policies)}`, function (err: any) {
      if (err) {
        console.error(err)
      }
    })
    return
  })
  .catch(err => console.log(err))
