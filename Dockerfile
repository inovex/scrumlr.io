# Docker Image 
FROM node:14-alpine as build-stage 

# Directory within the virtualizied Docker environment
WORKDIR /usr/src/app

# Copies package.json and yarn.lock to Docker environment
COPY package.json yarn.lock ./

#Install all node packages
RUN yarn install

# Copies everything over to the Docker environment
COPY . .

ENV REACT_APP_SERVER_API_URL=http://scrumlr.local/api
ENV REACT_APP_LIVEQUERY_URL=ws://scrumlr.local/ws
ENV SKIP_PREFLIGHT_CHECK=true

RUN yarn build

FROM nginx:alpine

COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html