---
"@mds-core/mds-logger": patch
---

Pino-based logger was not printing out all error messages when running test suites because the suite would finish before the asynchronous logging did.
