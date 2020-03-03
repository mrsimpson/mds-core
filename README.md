# Mobility Data Specification
The Mobility Data Specification (**MDS**), a project of the [Open Mobility Foundation](http://www.openmobilityfoundation.org) (OMF), is a set of Application Programming Interfaces (APIs) focused on dockless e-scooters, bicycles, mopeds and carshare. Inspired by projects like [GTFS](https://developers.google.com/transit/gtfs/reference/) and [GBFS](https://github.com/NABSA/gbfs), the goals of MDS are to provide a standardized way for municipalities or other regulatory agencies to ingest, compare and analyze data from mobility service providers, and to give municipalities the ability to express regulation in machine-readable formats.

**MDS** helps cities interact with companies who operate dockless scooters, bicycles, mopeds and carshare in the public right-of-way. MDS is a key piece of digital infrastructure that supports the effective implementation of mobility policies in cities around the world.

**MDS** is an open-source project. It was originally created by the [Los Angeles Department of Transportation](http://ladot.io) (LADOT). In November 2019, stewardship of MDS and the ownership of this repository was transferred to the Open Mobility Foundation. GitHub automatically redirects any links to this repository in the `CityOfLosAngeles` organization to the `openmobilityfoundation` instead. MDS continues to be used by LADOT and many other municipalities.

# mds-core Project Overview
mds-core: An open source reference implementation of the Mobility Data Specification released by the OMF.
* Agency service to ingest data from providers
* Policy service to express vehicle rules and geofences
* Audit service to support field verification of data (*)
* Compliance service to measure adherence to policies (*)
* Daily report generator
* Shared libraries used by multiple services
* Deployment scripts for Kubernetes and Istio
(*) - BASED ON A CANDIDATE API SPEC THAT IS NOT YET AN APPROVED PART OF MDS

# mds-core is…
* a reference MDS implementation usable by cities
* on-ramp for developers joining MDS ecosystem
* a tool for validating software implementations and data

# mds-core is not…
* the only implementation of MDS
* where the specification is officially defined (that’s here)
* a place to define local policies or performance metrics
* a service that will be operated by the OMF

# MDS-core development guidelines
All stakeholders have equal input in WG / WGSC
Decisions made by consensus (except in rare cases where not achievable)
Code changes are proposed and discussed in granular fashion - avoid bulk PRs (exception for new module development)
New modules / major functionality from a single contributor should be discussed and approved by WG / WGSC well in advance
OK for mds-core to slightly lag release of new versions of API specifications
API specifications are the “source of truth” for API definitions, not the mds-core implementation 
Any mds-core functionality built against unreleased/draft API specifications will be clearly tagged as “EXPERIMENTAL” or “CANDIDATE”

# Learn More / Get Involved / Contributing
To stay up to date on MDS releases, meetings, and events, please **subscribe to the [mds-announce](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-announce) mailing list.**

MDS-core is an open source project with all development taking place on GitHub. Comments and ideas can be shared by [creating an issue](https://github.com/openmobilityfoundation/mds-core/issues), and specific changes can be suggested by [opening a pull request](https://github.com/openmobilityfoundation/mds-core/pulls). Before contributing, please review our [CONTRIBUTING page](CONTRIBUTING.md) to understand guidelines and policies for participation and our [CODE OF CONDUCT page](CODE_OF_CONDUCT.md).

You can also get involved in development by joining an OMF working group. The working groups maintain the OMF GitHub repositories and work through issues and pull requests. Each working group has its own mailing list for non-technical discussion and planning:

Working Group | Mailing List | Description
--- | --- | ---
Provider Services | [mds-provider-services](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-provider-services) | Manages the [`provider`][provider] API within MDS.
City Services | [mds-city-services](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-city-services) | Manages the [`agency`][agency] and [`policy`][policy] APIs within MDS, as well as the [`mds-core`](https://github.com/openmobilityfoundation/mds-core) reference implementation.

You can view info about past releases and planning calls in the [wiki](https://github.com/openmobilityfoundation/mobility-data-specification/wiki).

For questions about MDS please contact [info@openmobilityfoundation.org](mailto:info@openmobilityfoundation.org). Media inquiries to [media@openmobilityfoundation.org](mailto:media@openmobilityfoundation.org)
