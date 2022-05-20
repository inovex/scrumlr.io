FROM node:16-alpine as build-stage

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY src/ src/
COPY public/ public/
COPY tsconfig.json .
COPY .prettierrc .
COPY .eslintignore .
COPY .eslintrc.json .
COPY .env .

RUN yarn build

FROM nginxinc/nginx-unprivileged:1.21-alpine

COPY ./nginx.conf /etc/nginx/conf.d/scrumlr.io.conf
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
