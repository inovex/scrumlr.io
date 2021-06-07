FROM node:16.3-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

# Run Node.js as non-root
USER node

ENTRYPOINT yarn start