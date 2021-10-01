# MDS Logger

Logging interface to be used for all MDS packages. Provides structured JSON logging so that logs can be parsed and indexed by an external log aggregator, and redacts sensitive information (e.g. lat/lng) from logs.

## Debug Logging

### Writing Debug Logs

The mds-logger debug method behaves quite similarly to the [debug](https://www.npmjs.com/package/debug) module, with the only difference being the default namespace of `mds`, and prefixing of any custom namespaces with `mds:${custom_namespace}`.

Examples:

```typescript
import logger from "@mds-core/mds-logger";

// writing with the default namespace
logger.debug()("Some super debug message");

// writing with a custom namespace
logger.debug("agency")("Some super duper debug message from agency!");

// writing out with log data
logger.debug("agency")("some log message with data", { foo: "bar" });
```

### Viewing Debug Logs

To enable debug logging, ensure that the node process is run with the env var `DEBUG='mds'`. If you wish to narrow down the debug logs to a particular mds package, you can set `DEBUG='mds:some_package_name'` to narrow the namespace, but note, not all packages will supply a namespace value.
