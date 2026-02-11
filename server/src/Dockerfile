# Build application
FROM golang:1.25-alpine AS build

ARG TARGETARCH
ARG TARGETOS

WORKDIR /go/src/github.com/inovex/scrumlr.io/
COPY ./ .
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go build -a -o main \
    && GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go build -a -o healthcheck ./cmd/healthcheck

# Start application
FROM gcr.io/distroless/static:nonroot

WORKDIR /

COPY --from=build /go/src/github.com/inovex/scrumlr.io/main /
COPY --from=build /go/src/github.com/inovex/scrumlr.io/healthcheck /

EXPOSE 8080

ENTRYPOINT ["/main"]
