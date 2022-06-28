---
"@mds-core/mds-compliance-service": patch
---

Fix bug when fetching compliance snapshots by time interval where an invalid SQL statement could be created with `IN ()` when provider_ids or policy_ids was a defined, but empty list.
