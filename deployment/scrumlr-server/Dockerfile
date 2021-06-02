FROM node:lts-alpine

COPY . .
RUN yarn install

# Run Node.js as non-root
USER node

ENTRYPOINT yarn start