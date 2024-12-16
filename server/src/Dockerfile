# Build application
FROM golang:1.23

ARG TARGETARCH
ARG TARGETOS

WORKDIR /go/src/github.com/inovex/scrumlr.io/
COPY ./ .
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go build -a -o main

# Start application
FROM alpine:3.20

RUN mkdir /app
WORKDIR /app
COPY --from=0 /go/src/github.com/inovex/scrumlr.io/main ./
EXPOSE 8080

CMD ["./main"]
