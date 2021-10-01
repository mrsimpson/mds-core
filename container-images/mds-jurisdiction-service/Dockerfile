FROM node:15.11.0-alpine

ARG environment

RUN mkdir /mds

COPY dist/* /mds/

RUN apk update && apk add --no-cache tini
RUN if [[ "$environment" == "prod" ]]; then apk del alpine-baselayout busybox; fi

WORKDIR /mds

ENTRYPOINT ["/sbin/tini", "node", "--no-deprecation", "--experimental-repl-await", "server.js"]
