FROM node:14.16.0-alpine as base

RUN apk --no-cache --virtual build-dependencies add bash



WORKDIR /project

# Install deps in its own step, making rebuilds faster
# when just the Polywrap schema & implementation files change
COPY package.json .
RUN yarn

# Copy all manifest files
COPY polywrap.yaml .
COPY .polywrap/wasm/build/image/polywrap.build.yaml .
COPY polywrap.deploy.yaml .

# Copy all source files
COPY ./package.json ./package.json
COPY src src

# Build the module at src
RUN ./node_modules/.bin/asc src/wrap/entry.ts \
    --path ./node_modules \
    --outFile ./build/module.wasm \
    --use abort=src/wrap/entry/wrapAbort \
    --optimize --importMemory \
    --runtime stub \
    --runPasses asyncify \
    --transform @serial-as/transform
