---
"@mds-core/mds-compliance-batch-processor": patch
"@mds-core/mds-compliance-engine": patch
---

Remove dependency on mds-cache, and use mds-ingest-service's getEventsUsingOptions query instead for fetching provider inputs.
