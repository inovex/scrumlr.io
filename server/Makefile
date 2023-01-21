LINKERFLAGS = -X main.Version=`git describe --tags --always --long --dirty` -X main.BuildTimestamp=`date -u '+%Y-%m-%d_%I:%M:%S_UTC'`

.ONESHELL:
build-alpine:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -a -o main -ldflags "$(LINKERFLAGS)" ./cmd/scrumlr

run-docker:
	make build-alpine
	docker-compose up --build

.ONESHELL:
run-dev:
	cd src
	docker-compose --profile dev up

run-docker-dev:
	make run-dev
	go run . -d postgresql://admin:supersecret@localhost:5432/scrumlr?sslmode=disable

.ONESHELL:
test:
	go test ./... -cover -coverprofile "coverage.txt"

.ONESHELL:
coverage:
	go tool cover -html "coverage.txt"
