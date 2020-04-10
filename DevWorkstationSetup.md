# Making Your First mds-core Contribution

This document will guide you through making your first mds-core contribution. Before you follow these steps, make sure you understand the mobility data specification core and community supporting it.
- [What is mds-core](README.md#mds-core-project-overview)
- [Learn More / Get Involved / Contributing](README.md#learn-more--get-involved--contributing)
- [Technical Details](README/md#technical-details)

# Using natively installed development tools for macOS, Linux
- [Assumptions](#assumptions)
- [Homebrew (macOS)](#homebrew-(macos))
- [Pre-commit](#pre-commit)
- [PostgreSQL and Redis](#PostgreSQL-and-Redis)
- [Yarn](#Yarn)
- [NVM](#NVM)
- [Lerna](#Lerna)
- [Docker](#Docker)
- [mds-core codebase](#mds-core-codebase)
- [Kubernetes](#Kubernetes)

# Using Container based Development tools

- coming soon, currently under development

# Operations to support development

- [Bootstrap Operational Dependancies](#bootstrap-operational-dependencies)
- [Build mds-core](#build-mds-core)
- [Run mds-core](#run-mds-core)
- [Okteto](#Okteto)
- [mds-core Operations (under development)](#mds-core-operations)
- [Launching a local server for a package](#launching-a-local-server-for-a-package)
- [Package Management with Lerna](#package-management-with-lerna)
- [Debugging with Visual Studio Code](#debugging-with-visual-studio-code)
- [Additional Considerations](#additional-considerations)

<!--reminder to add (or pointer to service docs) verification and (removal/ reinstallation if services are running to each section-->

# Contents

## Assumptions

All operations assume you are running the commands in a shell or console and you have:

- Linux (Red Hat or Debian based) OR macOS
- [git](https://git-scm.com/downloads) revision control is generally part of any standard install
- yum or apt-get (Linux) package management is generally part of any standard install
- All commands by default are executed through a terminal shell in your $HOME directory. Find by `echo $HOME`.
- Determine where you want your git repositories to be. A common location is your user or $HOME directory.

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Homebrew (macOS)

Homebrew simplifies installing complex packages on macOS.

new install
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```
 OR verify existing install is up-to-date
 ```sh
 brew upgrade
 ``` 

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Pre-commit 

To perform checks of your code before committing to github, you will need the pre-commit tool. 
```sh
brew install pre-commit

brew upgrade
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## PostgreSQL and Redis

You will need a database and in-memory data store. Install PostegreSQL and Redis with homebrew on macOS
```sh
brew install postgresql

brew install redis
```

Always run the services
```sh
brew services start postgresql

brew services start redis
```
OR run start manually each time
```sh
pg_ctl -D /usr/local/var/postgres start

redis-server /usr/local/etc/redis.conf
```

If you encounter the following error:
`FATAL: database “<user>” does not exist`

- The following command should fix your issue
```sh
createdb -h localhost
```

To run tests, you will need this:
```sh
createdb -h localhost mdstest
```

- Then add `export PG_NAME=mdstest` to your shell's environment file.  

```sh
echo "export PG_NAME=mdstest" >> ~/.bash_profile
```
 
[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Yarn

Yarn is used for package management. For macOS install by

```sh
brew install yarn
```

Otherwise [follow the platform specific installation instructions](https://yarnpkg.com/en/docs/install#mac-stable)

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## NVM

nvm is a version manager for node.js. [Install NVM through a series of commands.](https://github.com/nvm-sh/nvm#installation-and-update)

<!---The top level directory of the project should have a `.nvmrc` file. --->

To verify the installation was successful, run
```sh
. ~/.bash_profile

nvm --version
``` 
to reload the bash profile and return the version of Node installed. 

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Lerna

Lerna optimizes workflow for multi-package repositories for git and npm.
```sh
npm install --global lerna

git init lerna-repo && cd lerna-repo

lerna init
```

Configure yarn to use lerna
```sh
yarn global add lerna
```

Install all packages.  Uses Yarn workspaces.

```sh
yarn install
```

If you have any problems or want to learn more, review your options at the [Lerna website](https://lerna.js.org/).

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## mds-core codebase

Obtain a local working copy of mds-core:

```sh
git clone https://github.com/lacuna-tech/mds-core

cd mds-core
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Docker

Install Docker Desktop for macOS

```sh
open https://download.docker.com/mac/stable/Docker.dmg
```

Start Docker-Desktop
- Through the Finder execute /Downloads/Docker.dmg
- Drag and drop Docker.app to Applications in the popup panel 
- Accept the notice `Docker.app is an app downloaded from the internet` 
- You can ignore the Docker Hub logon request

If you have problems or are running a different OS, [review the Docker installation documentation](https://docs.docker.com/get-docker/).

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Kubernetes

<!--reminder to add or point to k8 native install?, remote-->

mds-core can readily be provisioned to a [Kubernetes](https://kubernetes.io) capable cluster, be it a local or remote. The following steps describe how to build, deploy and operate against a local MDS cluster.

### Kubernetes through Docker:

In Docker
- select the 'Preferences' option
- select the 'Resources' option
  - apply the following minimal resource changes:
    - CPUs: 6
    - Memory: 8G
    - Swap: 1G
- select the 'Kubernetes' option
  - select 'Enable Kubernetes' option
- select 'Apply & Restart'

Verify Kebernetes is working properly

```sh
which kubectl

kubectl config set-context docker-desktop

kubectl cluster-info
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Bootstrap Operational Dependencies

In order to build and operate mds-core, a number of suporting technologies are leveraged. They are installed and made operational via a one-time `bootstap` process.

While in the mds-core repository
```sh
./bin/mdsctl bootstrap
```
- Accept Helm accepting incoming network connection notice.

The principle tools are: [homebrew](https://brew.sh), [bash-4.x+](https://www.gnu.org/software/bash/), [oq](https://github.com/Blacksmoke16/oq), [jq](https://stedolan.github.io/jq/), [yarn](https://yarnpkg.com/), [nvm](https://github.com/nvm-sh/nvm), [helm-2.14.1](https://helm.sh), [k9s](https://github.com/derailed/k9s), [kubectx](https://github.com/ahmetb/kubectx), [git](https://git-scm.com/), [gcloud](https://cloud.google.com/sdk/) and [awscli](https://aws.amazon.com/cli/). Additionally the [istio](https://istio.io) and [nats](https://nats.io) services are provisioned.

Verify the installation was successful

```sh
kubectl -n istio-system get pods
```
You should get 
```sh
NAME                                      READY   STATUS      RESTARTS   AGE
istio-citadel-74f7d4957f-fltpn            1/1     Running     0          3m41s
istio-galley-678f65b8d9-kbtsd             1/1     Running     0          3m41s
istio-ingressgateway-745c9b488d-ckjpt     1/1     Running     0          3m41s
istio-init-crd-10-1.3.6-cj5js             0/1     Completed   0          3m59s
istio-init-crd-11-1.3.6-xnnwj             0/1     Completed   0          3m59s
istio-init-crd-12-1.3.6-stssx             0/1     Completed   0          3m59s
istio-pilot-d6dc8547b-prh8b               2/2     Running     0          3m41s
istio-policy-7b5cccd8cd-9r995             2/2     Running     3          3m41s
istio-sidecar-injector-69579b5cc4-n75dt   1/1     Running     0          3m41s
istio-telemetry-8686476f99-zljtd          2/2     Running     3          3m41s
prometheus-7d7b9f7844-lhhjk               1/1     Running     0          3m41s
```
And 
```sh
kubectl -n nats get pods
```
You should get 
```sh
NAME                            READY   STATUS             RESTARTS   AGE
nats-operator-b8f4977fc-ng87n   1/1     Running            0          4m53s
nats-streaming-stateful-0       0/1     CrashLoopBackOff   5          4m49s
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Build mds-core

Compiling and packaging mds-core into a deployable images

```sh
./bin/mdsctl build
```

Verify it worked

```sh
docker images | grep mds*
```
You should get
```sh
mds-jurisdiction                     0.0.1-docs-omf-release-0-1-9c71905f    c8b1e2eb34ec        7 minutes ago       89.6MB
mds-metrics-sheet                    0.1.27-docs-omf-release-0-1-9c71905f   19370c31dd6f        7 minutes ago       88.3MB
mds-web-sockets                      0.0.1-docs-omf-release-0-1-9c71905f    6bb46a44abf3        7 minutes ago       88.3MB
mds-policy-author                    0.1.26-docs-omf-release-0-1-9c71905f   cfebe57d6cb6        8 minutes ago       87.5MB
mds-native                           0.0.24-docs-omf-release-0-1-9c71905f   a920a1019959        8 minutes ago       87.5MB
mds-policy                           0.1.26-docs-omf-release-0-1-9c71905f   06e9e3a6abc3        8 minutes ago       87.5MB
mds-audit                            0.1.27-docs-omf-release-0-1-9c71905f   66403a69b00b        9 minutes ago       143MB
mds-agency                           0.1.26-docs-omf-release-0-1-9c71905f   669ad291a73c        10 minutes ago      89MB
mds-compliance                       0.1.26-docs-omf-release-0-1-9c71905f   6d7ac8153b83        11 minutes ago      87.6MB
mds-daily                            0.1.26-docs-omf-release-0-1-9c71905f   818df45273da        11 minutes ago      87.6MB
mds-event-processor                  0.0.1-docs-omf-release-0-1-9c71905f    9eacd480471f        11 minutes ago      87.8MB
mds-geography                        0.0.1-docs-omf-release-0-1-9c71905f    d3520918208e        11 minutes ago      87.3MB
mds-geography-author                 0.0.1-docs-omf-release-0-1-9c71905f    7859d3d522e9        11 minutes ago      87.5MB
mds-config                           0.0.2-docs-omf-release-0-1-9c71905f    aa2a1a99ecde        11 minutes ago      87.2MB
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Run mds-core

<!---tbd: ?best profile?)--->

```sh
./bin/mdsctl -p minimal install:mds
```

Verify:

```sh
curl localhost/agency
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Okteto

Due to the nature of mds-core being a highly portable Typescript project that compiles down into minified javascript for its images, rapidly development in-cluster can be quite challenging. mds-core utilizes [Okteto](https://okteto.com) to enable developers to actively develop their code in-cluster.

After following the above steps to set up a local MDS cluster, you can override an existing service's deployment with these steps.
1. Update `mds-core/okteto.yml`'s `name` field to be set to the service you wish to replace (e.g. `mds-agency`)
2.
```sh
curl https://get.okteto.com -sSfL | sh
```
3. Install the `Remote - Kubernetes` VSCode extension.
4. Run `> Okteto Up` from the VSCode command palette.
* After the remote session opens, execute this in the new shell window:
```sh
yarn

cd packages/${SERVICE_NAME}

yarn start
```
5. This session is now safe to close, and you can reattach with the `okteto.${SERVICE_NAME}` ssh profile automatically added for you using the VSCode `Remote - SSH` package.
6. When you're completely done with your session, run `> Okteto Down` from the VSCode command palette, or `okteto down` from terminal to revert the changes made by Okteto, and return your service to its previous deployment.

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## mds-core Operations

MDS operates atop the following services: [Kubernetes](https://kubernetes.io), [Istio](https://istio.io), [NATS](https://nats.io), [PostgreSQL](https://www.postgresql.org) and [Redis](https://redis.io).

More details to follow

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Launching a local server for a package
Now you can work with each package

```sh
cd packages/mds-audit

yarn test

yarn start
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Running the tests
You can also run all tests from the project root with
```sh
yarn test
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Package Management with Lerna

This repository is a monorepo and uses Lerna for working with its packages.

### Example commands

Run all test suites at once

```sh
lerna run test
```

Run all tests suites sequentially

```sh
lerna run test --concurrency 1
```

Run tests for a particular package

```sh
lerna run test --scope mds-audit
```

Clean all dependencies

```sh
lerna run clean
```

Format all files

```sh
lerna run prettier
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Debugging with Visual Studio Code

### Node.js: Express Server

* Select the `Node.js Express Server` debug configuration
* Select the file that implements the Node/Express server for a package (typically `server.ts`) in the Explorer panel
* Press `F5`

### Mocha Tests

* Select the `Node.js: Mocha Tests` debug configuration
* Select any one of the files in a package's test folder
* Press `F5`

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)

## Additional Considerations

Access the database:

```sh
./bin/mdsctl cli:postgresql
```

Access the cache:

```sh
./bin/mdsctl cli:redis
```

(tbd) Access the event stream:

```sh
./bin/mdsctl install:natsbox
```

Access the MDS cluster:

```sh
k9s
```

Display the complete set of operations:

```sh
./bin/mdsctl
```

### Cleanup

```sh
./bin/mdsctl uninstall:mds uninstall
```

[Back to top](#using-natively-installed-development-tools-for-macOS-linux)
