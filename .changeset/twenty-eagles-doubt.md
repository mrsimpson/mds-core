---
"@mds-core/mds-compliance-service": patch
---

Refactor ComplianceSnapshotEntityModel and ComplianceViolationEntityModel to directly define types instead of referencing their respective Domain Models to avoid some potentially undesirable TypeORM behavior
