# Build application
FROM golang:1.17 as build
WORKDIR /go/src/github.com/inovex/scrumlr.io/
COPY ./ .
RUN GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -a -o main

# Remote Delve Debugging
FROM build as debug
RUN go get github.com/go-delve/delve/cmd/dlv

# Start application
FROM alpine:3.15 as prod

RUN mkdir /app
WORKDIR /app
COPY --from=0 /go/src/github.com/inovex/scrumlr.io/main ./
EXPOSE 8080

CMD ["./main"]
