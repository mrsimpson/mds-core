# MDS Logger

Logging interface to be used for all MDS packages. Provides structured JSON logging so that logs can be parsed and indexed by an external log aggregator, and redacts sensitive information (e.g. lat/lng) from logs.

## What logging level should I use?

Here's a short list of log levels, and times you may want to use them.

- Info
  - Server/process start up information (connections, host port, etc...)
  - Information about the running process periodically (how many messages have been processed, etc...)
- Warn
  - Something that is generally unexpected, but not a server error (e.g. non-critical backend connection not initializing due to missing env vars, db method that should almost always return something returning nothing, etc...)
- Error
  - Critical startup failures
  - Persistent backend connection failures (e.g. redis/postgres/kafka going down)
  - Message processing failures
  - HTTP request failures that will result in a 5xx class error being sent to the client
- Debug
  - Timing logs (e.g. how long did this function take to execute?)
  - Anything not covered by the above (in most cases)

Logging not only costs money, but it also costs performance; debug logs can always be enabled, so as a rule of thumb, they should be your first point of logging in most circumstances! See the Debug Logging section below for more details on how debug logging works.

## Debug Logging

### Writing Debug Logs

The mds-logger debug method behaves quite similarly to the [debug](https://www.npmjs.com/package/debug) module, with the only difference being the default namespace of `mds`, and prefixing of any custom namespaces with `mds:${custom_namespace}`.

Example usage:

```typescript
import logger from "@mds-core/mds-logger";

// writing with the default namespace
logger.debug()("Some super debug message");

// writing with a custom namespace
logger.debug("agency")("Some super duper debug message from agency!");

// writing out with log data
logger.debug("agency")("some log message with data", { foo: "bar" });
```

In reality, your usage will probably look more like this:

```typescript
// mds-some-package/logger.ts
import { createLogger } from "@mds-core/mds-logger";

export const SomePackageLogger = createLogger("mds-some-package");
```

```typescript
// mds-some-package/index.ts
import { SomePackageLogger } from "./logger";

export const someFunction = () => {
  // do some stuff
  SomePackageLogger.debug("I did some stuff!"); // outputs a debug log namespaced with mds:mds-some-package
};
```

### Viewing Debug Logs

To enable debug logging, ensure that the node process is run with the env var `DEBUG='mds'`. If you wish to narrow down the debug logs to a particular mds package, you can set `DEBUG='mds:some_package_name'` to narrow the namespace, but note, not all packages will supply a namespace value.
