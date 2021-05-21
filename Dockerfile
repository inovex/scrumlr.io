# Docker Image 
FROM node:lts-alpine

# Directory within the virtualizied Docker environment
WORKDIR /usr/src/app

# Copies package.json and yarn.lock to Docker environment
COPY package.json yarn.lock ./

#Install all node packages
RUN yarn install

# Copies everything over to the Docker environment
COPY . .

ENV REACT_APP_SERVER_API_URL=http://scrumlr-server:4000/api

ENTRYPOINT [ "yarn", "start" ]


# yarn build

# FROM nginx:alpine

# COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html