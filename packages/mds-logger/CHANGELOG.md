# @mds-core/mds-logger

## 0.4.3

### Patch Changes

- 70586f15: Meaningless bump to ensure artifacts are built properly

## 0.4.2

### Patch Changes

- a1061650: Add namespaced logger, clean up excess logger messages

## 0.4.1

### Patch Changes

- f501924c: Bump everything due to previous bad release

## 0.4.0

### Minor Changes

- 71a9d1de: Add new createLogger method, enabling namespaced loggers for packages. This will be refactored in the future to be a little more breaking, most likely.

## 0.3.0

### Minor Changes

- f5403ec3: Add enhanced logging using the debug module. See README for new invocation examples.
  Refactored mds-logger under-the-hood substantially to lean more on native pino functionality.
- a0a29a98: Use pino instead of console for logging

### Patch Changes

- 15b9d729: Resolve pino-pretty webpack error
- 15b9d729: Upgrade dependencies

## 0.2.4

### Patch Changes

- 9af14cbb: Fix unit tests for mds-logger to work properly with QUIET=true

## 0.2.3

### Patch Changes

- 8ab4569d: Minor patch change for every package to get versioning aligned with changeset workflows
