---
"@mds-core/mds-service-helpers": patch
---

Add logic to abort from a retry loop if the process has been stopped externally. Useful if there's a long-running async task at init time that experiences an error.
