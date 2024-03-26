# Build stage
FROM node:hydrogen-alpine as build-stage
WORKDIR /usr/src/app

# Copy package.json and yarn.lock separately for better caching
COPY package.json yarn.lock ./

# Install dependencies with caching
RUN yarn install --network-timeout 240000

# Copy the necessary files for building the frontend
COPY src/ src/
COPY public/ public/
COPY tsconfig.json .prettierrc .eslintignore .eslintrc.json .env ./

RUN yarn build

# Final stage
FROM nginxinc/nginx-unprivileged:1.21-alpine

# Toggle visibility of cookie policy, privacy policy, and terms & conditions
ENV SCRUMLR_SHOW_LEGAL_DOCUMENTS=''

# Override the server address for API calls
ENV SCRUMLR_SERVER_URL=''

# Override the websocket address for API calls
ENV SCRUMLR_WEBSOCKET_URL=''

# Server port
ENV SCRUMLR_LISTEN_PORT='8080'

# Analytics variables
ENV SCRUMLR_ANALYTICS_DATA_DOMAIN=''
ENV SCRUMLR_ANALYTICS_SRC=''

COPY ./nginx.conf /etc/nginx/templates/scrumlr.io.conf.template
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
