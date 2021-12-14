---
"@mds-core/mds-compliance-batch-processor": patch
---

Fix compliance_as_of to be consistent around a single batch-process invocation, and based upon when the *data* is fetched, as opposed to based upon once the *computation* has computed.
