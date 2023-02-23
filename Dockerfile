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

# Toggle visibility of cookie policy, privacy policy, and terms & conditions
ENV SCRUMLR_SHOW_LEGAL_DOCUMENTS=''

# Override the server address for API calls
ENV SCRUMLR_SERVER_URL=''

# Override the websocket address for API calls
ENV SCRUMLR_WEBSOCKET_URL=''

# Server port
ENV SCRUMLR_LISTEN_PORT='8080'

COPY ./nginx.conf /etc/nginx/templates/scrumlr.io.conf.template
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
