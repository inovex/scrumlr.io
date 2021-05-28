# Docker Image 
FROM node:lts-alpine as build-stage 

# Directory within the virtualizied Docker environment
WORKDIR /usr/src/app

# Copies package.json and yarn.lock to Docker environment
COPY package.json yarn.lock ./

#Install all node packages
RUN yarn install

# Copies everything over to the Docker environment
COPY . .

ENV REACT_APP_SERVER_API_URL=http://localhost:4000/api
ENV SKIP_PREFLIGHT_CHECK=true

RUN yarn build

FROM nginx:alpine

COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html