# Build application
FROM golang:1.25

ARG TARGETARCH
ARG TARGETOS

WORKDIR /go/src/github.com/inovex/scrumlr.io/
COPY ./ .
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go build -a -o main \
    && CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -a -o healthcheck ./cmd/healthcheck

# Start application
FROM alpine:3.23

RUN mkdir /app
WORKDIR /app
COPY --from=0 /go/src/github.com/inovex/scrumlr.io/main ./
COPY --from=0 /go/src/github.com/inovex/scrumlr.io/healthcheck ./
EXPOSE 8080

CMD ["./main"]
