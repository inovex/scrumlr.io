LINKERFLAGS = -X main.Version=`git describe --tags --always --long --dirty` -X main.BuildTimestamp=`date -u '+%Y-%m-%d_%I:%M:%S_UTC'`

.ONESHELL:
build-alpine: ## Build the scrumlr backend
	cd src && GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -a -o main -ldflags "$(LINKERFLAGS)"

run-docker: ## Run the scrumlr backend in docker
	make build-alpine
	docker compose up --build scrumlr

.ONESHELL:
run-dev: ## Run the scrumlr backend. It starts the needed services in docker
	cd src && go run . -d postgresql://admin:supersecret@localhost:5432/scrumlr?sslmode=disable

run-docker-dev: ## Run all needed services for the backend in docker
	docker compose --profile dev up

.ONESHELL:
mockery: ## Create all mocks
	cd src && mockery

.ONESHELL:
test: ## Run the go tests
	cd src
	go test ./... -cover -coverprofile=coverage.txt

.ONESHELL:
coverage: ## Create a html coverage report
	make test
	cd src
	cat coverage.txt | grep -v "mock" > coverage.out
	go tool cover -html=coverage.out -o coverage.html
	rm coverage.out

postman: ## Run the postman tests
	newman run api.postman_collection.json --env-var "base_url=localhost:8080" --verbose

.ONESHELL:
format: ## Format all Go code
	cd src
	goimports -w .
	gofmt -w .

.ONESHELL:
format-check: ## Check if code is properly formatted
	cd src
	test -z "$$(goimports -l .)"

setup-hooks: ## Setup Git pre-commit hooks for automatic Go formatting
	./scripts/setup-git-hooks.sh

.ONESHELL:
go-lint: ## Run the go linter
	cd src
	golangci-lint run --verbose

all-tests: ## Run all tests. This include the go tests and the postman tests
	go-lint	test postman

.PHONY: help
help: ## Prints this help message
	@echo "List of available tasks:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
