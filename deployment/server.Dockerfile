FROM node:lts-alpine

COPY . .
RUN yarn install

ENTRYPOINT yarn start