.PHONY: render
render: 
	@helm template scrumlr . --output-dir=.render

.PHONY: debug
debug: 
	@helm template scrumlr . --output-dir=.render --debug

.PHONY: lint
lint: 
	@helm lint .

.PHONY: package
package: 
	@helm package scrumlr

.PHONY: clean
clean: 
	@rm -r .render/

.PHONY: readme
readme:
	@readme-generator --values values.yaml --readme README.md

.PHONY: tilt-up
tilt-up:
	@tilt up --file ./tilt/Tiltfile

.PHONY: tilt-down
tilt-down:
	@tilt down --file ./tilt/Tiltfile
.PHONY: help
help:
	@echo "List of available tasks:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
