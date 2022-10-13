FROM node:14.5.0-alpine

RUN apk add git
WORKDIR /app

ENV NODE_ENV mainnet

RUN mkdir -p /root/.aws /app/keys /app/encrypted

COPY . /app/
RUN npm i && npm run build

CMD node ./dist/server.js
