FROM node:15.11.0-alpine

ARG environment

RUN mkdir /mds

COPY dist/* /mds/

WORKDIR /mds

#Compile Vips and Sharp
RUN npm install sharp

RUN apk update && apk add --no-cache tini
RUN if [[ "$environment" == "prod" ]]; then apk del alpine-baselayout busybox; fi

ENTRYPOINT ["/sbin/tini", "node", "--no-deprecation", "--experimental-repl-await", "server.js"]
