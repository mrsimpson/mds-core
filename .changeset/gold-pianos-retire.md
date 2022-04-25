---
"@mds-core/mds-api-server": patch
---

Take a new `healthStatus` option in the ApiServer which determines the response of the health endpoint. If `healthStatus.healthy` is set to `true`, `/health` will response with a `200`; whereas if it's set to `false`, it will respone with a `500` and the error message. This allows the process which invokes the ApiServer to provide a mutable status which can be updated based on things like business logic KPIs which should trigger a restart, etc...
