# API specification

The MDS geography API provides an OMF compliant implementation of [`/geographies` in version 1.0](https://github.com/openmobilityfoundation/mobility-data-specification/tree/release-1.0.0/policy#geographies)

_Remark: After 1.0, `/geographies` has been moved to an own specification with a slightly different format. This is not supported by the current implementation_

## Mocking

This package features [Primsm](https://github.com/stoplightio/prism) to provide a mocking server based on the examples included in the specification.
Run it with `pnpm mock`

Plase see the [mocking documentation](https://github.com/stoplightio/prism/blob/master/docs/guides/01-mocking.md#response-generation) for instructions how to retrieve a dedicated example, e. g.

```bash
curl http://localhost:7011/geographies/10000000-0000-0000-0000-000000000001 \
-H "Prefer: example=HistoricRome"
```