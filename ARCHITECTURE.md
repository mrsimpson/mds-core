# OMF mds-core Architecture

## Draft
# Background
The mds-core repo represents an implementation of the MDS Agency and Policy APIs, as well as some not-yet-ratified API implementations (Compliance, Audit, Geography, Jurisdictions), plus shared libraries, containerization, authentication, etc.  

The goal of this document is to give an overview of the technology choices, design, and implementation of these services.   The mds-core repo will be a reference system that can be used as a basis for building and testing additional services, as well as a reasonable facsimile of what is running for the first city to deploy these services (Los Angeles).
# Languages
This implementation is built in [TypeScript](https://www.typescriptlang.org) v3.8.  The first draft of the Agency service was built in vanilla EMCAScript 6, and types were added as the system grew.

TypeScript has a large developer community, a comprehensive set of toolchains, wide support in cloud providers, and is reasonably performant.  JavaScript is the [most popular](https://octoverse.github.com/) language inside GitHub, with TypeScript 7th.

The mds-core endpoints are implemented using the popular framework [express.js](https://expressjs.com/).

# Authentication & Identity
We authenticate and authorize access to APIs and public-facing websites using JSON Web Tokens (JWT). JWTs are issued by Auth0 using the OAuth 2.0 protocol. 
## Auth0
We use Auth0 for our Identity Provider (IdP). Our users, applications, and permissions are configured in Auth0. Our Frontend applications forward users to Auth0 for login. Upon returning from login, included token information is exchanged for an access token (JWT) and stored in the browser’s local storage. This access token is sent along with every API request. Our APIs validate the signature of access tokens cryptographically with keys provided by Auth0.
## The 2 façades of authentication
There are two use cases for requesting and using access tokens when interacting with our system. From our API’s perspective there isn’t much difference. However there are 2 types of clients for our API, and they authenticate differently. 

### SPA - Front-end applications, web, and mobile


Our front-end applications authenticate users by forwarding them to Auth0’s login page when token information is not found or is expired. Users login either by username/password credentials or using social connections. We use the authorization_code grant type which involves receiving a “code” query string parameter upon successful login. This code is then exchanged for an access token using Auth0’s API and the resulting access token gets stored in local storage and included as an “Authorization” header bearer token to every API request thereafter. We are using a PKCE compliant login flow, which let’s us avoid specifying the private key during this exchange which makes it a safe process for native mobile as well.  


### M2M - Providers accessing APIs


The vehicle providers pushing data to the Agency API are similarly required to provide authorization headers with their requests. To obtain access tokens, providers issue a token request to Auth0’s API using the client_credentials grant type. This type of authentication requires a secret key, so all of the providers are partitioned by application which means each provider has their own unique Client Id and Secret. There are also additional claims in the access token that help identify providers by id.
## Istio Gateway
Token validation, signature, and expiration occur in the Istio Gateway. This becomes particularly useful for local development, as issuing requests to locally running APIs, in docker or otherwise, do still require access tokens for authorization, but they can be entirely fabricated.
## Identity
Everything to this point has indicated direct interaction between clients and Auth0, when in fact there is actually an IDP proxy in place between clients and Auth0 we are calling Lacuna-Identity or Identity Service. Lacuna-Identity is a very simple API shim that does a few things. It acts as the middleware for login/logout ingress/egress between front-end applications and Auth0. It also proxies the token exchange request. Currently it is only minimally involved, enough that if we were to decide to switch IDPs, our client applications would likely be unaffected. Since we have access points at both the token generation and validation, there is a high degree of potential to eventually switch from returning and validating Auth0 access tokens to our own signed access tokens. 
## Role based access control (RBAC)
We restrict access and alter behavior in both front and back-end applications by the presence or absence of scopes in the access token. API endpoints are configured to block requests via middleware if indicated scopes are not present. Likewise, front-end applications will show or hide certain pages or functionality with the presence of indicated scopes. For example, you are required to have the “policies:read” scope to see and use Policy Manager. 

There are a couple different ways scopes are included in access tokens, and they differ between the SPA and M2M authentication scenarios. Both cases involve configuration with Auth0’s RBAC. Scopes are represented in Auth0 as permissions 1:1, and the scopes included in the access token are the intersection between assigned permissions and requested scopes.

### SPA

Since this authentication involves users, the permissions in consideration are the permissions directly assigned to the user or the permissions in any assigned roles.

### M2M

Since this authentication involves applications, the permissions in consideration are the permissions directly assigned to the application.
# Containerization
The mds-core services are packaged as Docker container images, utilizing [webpack](https://webpack.js.org/) for minification.  The current base image is [node:12.14.1-alpine](https://github.com/mhart/alpine-node).
# Orchestration
[Kubernetes](https://kubernetes.io/) provides a declarative, cloud-neutral framework for specifying the infrastructure in which an application (or set of applications) runs.  The extensible API allows platform-as-a-service (Paas) components such as NATS, Prometheus, and the core kubernetes operators to be included as a managed set of configuration files.  

Kubernetes is a datacenter-scale operating system.  The configuration files for kubernetes allow for source-controlled management of datacenter-level functionality.  This includes path-based routing of http requests to the various back-end applications; authentication of the same requests to a 3rd-party identity management service; monitoring of performance and health metrics, alerting on failure conditions; and demand-based scaling of compute resources.
# Deployment
We chose [kubernetes](https://kubernetes.io/) as a widely-supported, vendor-agnostic method of deploying containers into a cloud. A custom tool, mdsctl, provides a wrapper around [kubectl](https://github.com/kubernetes/kubectl) and (helm)[https://helm.sh/] enabling portable build, deployment, development and verification operations.
# Database & ORM
Persistent storage is contained in Postgres. The current interface for each service is performed via a hand-made ORM in the mds-db library, but we are in the process of replacing it with a more robust and FOSS library, TypeORM. See the documentation in the mds-db package for more details, although this will be phased out in the next release.

DB credentials are injected to services via environment variables during the deployment cycle.
# Cache
For frequently-accessed data, such as the current state of all active vehicles in the system, the mds-cache library uses Redis under the hood.  

The interface to the cache is described in the package mds-cache.  
# Messaging
Although the current services in MDS-core do not communicate with each other, LADOT is using some data-consumers that process Agency-ingested events and telemetry via a publish-and-subscribe message bus.

Services in a service-oriented-architecture can communicate with each other via the same types of interfaces used by the outside clients (e.g. REST or SOAP), or they can use an internal message bus. We chose the latter for perceived wins in speed and efficiency. After considering knative eventing and kafka, we settled on [NATS](https://nats.io) as a more stable and low-operational-overhead solution. We have attempted to abstract away the message interface, however, such that we could later decide to plug in a different message bus.

NATS is recognized as an incubating [CNCF](https://www.cncf.io) [open source project](https://github.com/nats-io) made available under the [Apache License](https://www.apache.org/licenses/LICENSE-2.0.html) and supporting a number of contemporary software languages.
# Testing & Validation
The repo currently has integration tests with code-coverage minimums on a per-project basis.  [TODO add more]
# Versioning
The services in mds-core will follow the MDS spec’s requirements for [API versioning](https://github.com/openmobilityfoundation/mobility-data-specification/blob/dev/general-information.md).
# Shared Libraries
The mds-core repo contains a number of libraries, including the previously mentioned mds-db (postgres wrapper) and mds-cache (redis wrapper).
## mds-api-authorizer
Code to extract standard and custom claims from Basic or Bearer Authorization headers 
## mds-api-helpers
Simple utilities for construction APIs. For example, processing paging parameters or formating JSON API links
## mds-api-server
Standard API server which implements middleware and endpoints that are common to all MDS APIs.
## mds-logger
Basic logging wrapper that includes integration with Slack and Pushover as well as standard console-output.

## mds-orm
Code for managing connections to Postgres and schema migrations.
## mds-providers
Collection of information about supported micro-mobility providers.
## mds-stream
Collection of methods to send messages to NATS-Streaming. Currently supports sending vehicle events and telemetry.
## mds-types
Collection of TypeScript descriptions of types that are shared among components, including Agency’s notion of Device and VehicleEvent, event type enums for Provider and Agency, etc.
## mds-utils
Grab-bag of shared utility methods. Including, but not limited to: Programmatic representation of the MDS-Agency State Machine, date-time converters, and geospatial analysis methods.
## mds-web-sockets
Implementation of a basic websocket model for MDS. Enables real-time external consumption of data through a pub/sub model. See package documentation for specific examples. 

