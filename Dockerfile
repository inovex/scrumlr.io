FROM node:13.2-alpine as builder

# Stage 1 - the build process
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.lock", "./"]
RUN npm install
COPY . ./
RUN npm run build

# Stage 2 - the production environment
FROM nginx:1.17-alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
