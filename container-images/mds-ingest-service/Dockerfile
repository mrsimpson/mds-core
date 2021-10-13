FROM node:16.11.1-alpine

RUN apk add --no-cache tini

RUN mkdir /mds

COPY dist/* /mds/

WORKDIR /mds

ENTRYPOINT ["/sbin/tini", "node", "--no-deprecation", "--experimental-repl-await", "server.js"]
