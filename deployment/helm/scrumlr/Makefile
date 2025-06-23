.PHONY: render
render: ## Render the helm template in the .render folder
	@helm template scrumlr . --output-dir=.render

.PHONY: debug
debug: ## Render the helm template in the .render folder in debug mode
	@helm template scrumlr . --output-dir=.render --debug

.PHONY: lint
lint: ## Linting the helm template
	@helm lint .

.PHONY: package
package: ## Package the helm template
	@helm package scrumlr

.PHONY: clean
clean: ## Remove the .render folder
	@rm -r .render/

.PHONY: readme
readme: ## Generate the readme with the values file
	@readme-generator --values values.yaml --readme README.md

.PHONY: tilt-up
tilt-up: ## Start tilt with the helm chart
	@tilt up --file ./tilt/Tiltfile

.PHONY: tilt-down
tilt-down: ## Stop tilt
	@tilt down --file ./tilt/Tiltfile

.PHONY: test
test: ## Test the helm chart
	@helm unittest --file 'tests/**/*.yaml' ../scrumlr

.PHONY: help
help: ## Prints this help message
	@echo "List of available tasks:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
