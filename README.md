# Mobility Data Specification

The Mobility Data Specification (**MDS**), a project of the [Open Mobility Foundation](http://www.openmobilityfoundation.org) (OMF), is a set of Application Programming Interfaces (APIs) focused on dockless e-scooters, bicycles, mopeds and carshare. Inspired by projects like [GTFS](https://developers.google.com/transit/gtfs/reference/) and [GBFS](https://github.com/NABSA/gbfs), the goals of MDS are to provide a standardized way for municipalities or other regulatory agencies to ingest, compare and analyze data from mobility service providers, and to give municipalities the ability to express regulation in machine-readable formats.

[Read more about the Mobility Data Specification](https://github.com/openmobilityfoundation/mds-core/blob/master/README.md)

# mds-core Project Overview

mds-core: An open source reference implementation of the Mobility Data Specification released by the OMF.

- Agency service to ingest data from providers
- Policy service to express vehicle rules and geofences
- Audit service to support field verification of data (\*)
- Compliance service to measure adherence to policies (\*)
- Daily report generator
- Shared libraries used by multiple services
- Deployment scripts for Kubernetes and Istio

# mds-core is…

- a reference MDS implementation usable by cities
- on-ramp for developers joining MDS ecosystem
- a tool for validating software implementations and data

# mds-core is not…

- the only implementation of MDS
- where the specification is officially defined (that’s [here](https://github.com/openmobilityfoundation/mobility-data-specification))
- a place to define local policies or performance metrics
- a service that will be operated by the OMF

# Learn More / Get Involved / Contributing

To stay up to date on MDS releases, meetings, and events, please **subscribe to the [mds-announce](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-announce) mailing list.**

mds-core is an open source project with all development taking place on GitHub. Comments and ideas can be shared by [creating an issue](https://github.com/openmobilityfoundation/mds-core/issues), and specific changes can be suggested by [opening a pull request](https://github.com/openmobilityfoundation/mds-core/pulls). Before contributing, please review our [CONTRIBUTING page](CONTRIBUTING.md), [Release Guidelines page](ReleaseGuidelines.md), and [CODE OF CONDUCT page](CODE_OF_CONDUCT.md) to understand guidelines and policies for participation.

You can also get involved in development by joining an OMF working group. The working groups maintain the OMF GitHub repositories and work through issues and pull requests. Each working group has its own mailing list for non-technical discussion and planning:

| Working Group | Mailing List | Description
| ------------- | ------------ | --------
| City Services | [mds-city-services](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-city-services) | Manages the [`mds-core`](https://github.com/openmobilityfoundation/mds-core) reference implementation, as well as the [`agency`][agency] and [`policy`][policy] APIs within MDS.
| Provider Services | [mds-provider-services](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-provider-services) | Manages the [`provider`][provider] API within MDS.

You can view info about past releases and planning calls in the [wiki](https://github.com/openmobilityfoundation/mobility-data-specification/wiki).

For questions about MDS please contact [info@openmobilityfoundation.org](mailto:info@openmobilityfoundation.org). Media inquiries to [media@openmobilityfoundation.org](mailto:media@openmobilityfoundation.org)

[agency]: https://github.com/openmobilityfoundation/mobility-data-specification/tree/master/agency/README.md
[provider]: https://github.com/openmobilityfoundation/mobility-data-specification/tree/master/provider/README.md
[policy]: https://github.com/openmobilityfoundation/mobility-data-specification/tree/master/policy/README.md


TODO where should this go?  Seems out of place in this trimmed-down doc.  @seanr

### Experimental Content
#### APIs
1. MDS-Agency `/stops` [PR](https://github.com/openmobilityfoundation/mobility-data-specification/pull/430)
2. MDS-Audit [PR](https://github.com/openmobilityfoundation/mobility-data-specification/pull/326)
3. MDS-Compliance [PR](https://github.com/openmobilityfoundation/mobility-data-specification/pull/333)
4. MDS-Config
5. MDS-Daily
6. MDS-Metrics-Sheet
7. MDS-Policy-Author
8. MDS-Web-Sockets
