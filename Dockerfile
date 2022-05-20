# Docker Image
FROM node:16-alpine as build-stage

# Directory within the virtualizied Docker environment
WORKDIR /usr/src/app

# Copies package.json and yarn.lock to Docker environment
COPY package.json yarn.lock ./

# Install all node packages
RUN yarn install

# Copies everything over to the Docker environment
COPY src/ src/
COPY public/ public/
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintignore .
COPY .eslintrc.json .
COPY .env .

RUN yarn build

FROM nginxinc/nginx-unprivileged:1.21-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
