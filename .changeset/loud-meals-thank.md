---
"@mds-core/mds-policy-service": patch
---

Updating .isPolicyPublished and .readPolicies to take an optional connection parameter and using it in the .publishPolicy code path to avoid a race condition where the DB reader has not received all policies yet, thus causing the publish function to believe the policy that needs publishing does not exist yet'
