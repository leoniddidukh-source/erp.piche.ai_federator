FROM node:20.5.1-alpine

ARG BUILD_VERSION
ARG NPM_USER
ARG NPM_PWD
ARG NPM_REGISTRY
ARG NPM_EMAIL

RUN mkdir app
WORKDIR /app
COPY . .

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh - && \
    source /root/.shrc && \
    pnpm i -g npm-cli-login && \
    npm-cli-login -u ${NPM_USER} -p ${NPM_PWD} -r ${NPM_REGISTRY} -e ${NPM_EMAIL} && \
    pnpm version ${BUILD_VERSION} && \
    pnpm i && \
    pnpm run build && \
    pnpm publish
