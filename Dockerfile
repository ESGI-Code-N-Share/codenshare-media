FROM node:20.12.2-alpine3.18 as base

COPY . .
RUN npm i
ENTRYPOINT ["node", "server.js"]