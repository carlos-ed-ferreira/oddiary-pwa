SHELL := /bin/bash
.DEFAULT_GOAL := help
.NOTPARALLEL:
export HOST_UID ?= $(shell id -u)
export HOST_GID ?= $(shell id -g)
COMPOSE := docker compose
APP_UP := $(shell $(COMPOSE) ps --status running --quiet app 2>/dev/null)
RUN := $(COMPOSE) $(if $(APP_UP),exec,run --rm) -T app
ARGS ?=

.PHONY: help env install setup up down dev shell assets test test-backend test-frontend test-e2e lint format analyse check quality coverage security docker-check database-up publish
help: ## List commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
env: ## Create a local environment if absent
	@test -f .env || cp .env.example .env
install: ## Install exactly the dependency locks
	$(RUN) composer install --no-interaction --prefer-dist
	$(RUN) npm ci --no-audit --no-fund
setup: env ## Prepare a fresh clone without external services or migrations
	$(COMPOSE) build app
	$(MAKE) install
	@$(RUN) php scripts/ensure-key.php
	$(MAKE) assets
	$(MAKE) up
up: ## Start only the application and wait for health
	$(COMPOSE) up -d --wait app
down: ## Stop this project, preserving volumes
	$(COMPOSE) --profile database --profile e2e down
dev: up ## Start Vite HMR on localhost:5180
	$(COMPOSE) exec app npm run dev
shell: up ## Enter the runtime container
	$(COMPOSE) exec app bash
database-up: ## Start isolated optional local PostgreSQL, without migrations
	$(COMPOSE) --profile database up -d --wait postgres
assets: ## Build frontend assets
	$(RUN) npm run build
test-backend: ## Run Pest, narrow with ARGS=tests/Feature/BootstrapTest.php
	$(RUN) vendor/bin/pest $(ARGS)
test-frontend: ## Run Vitest, narrow with ARGS=tests/frontend/worker.test.ts
	$(RUN) npm test -- $(ARGS)
test: test-backend test-frontend ## Run backend and frontend suites
format: ## Apply PHP and text formatters
	$(RUN) vendor/bin/pint
	$(RUN) npm run format
lint: ## Verify formatting and ESLint
	$(RUN) vendor/bin/pint --test
	$(RUN) npm run format:check
	$(RUN) npm run lint
analyse: ## Check types, PHP complexity and architecture boundaries
	$(RUN) composer validate --strict
	$(RUN) vendor/bin/phpstan analyse --no-progress
	$(RUN) php -d error_reporting='E_ALL & ~E_DEPRECATED' vendor/bin/phpmd app text phpmd.xml
	$(RUN) vendor/bin/deptrac analyse --no-progress --fail-on-uncovered
	$(RUN) npm run types:check
check: lint analyse test ## Validate a change locally
coverage: ## Measure backend lines and frontend lines and branches
	$(COMPOSE) $(if $(APP_UP),exec,run --rm) -T -e PHP_INI_SCAN_DIR=:/var/www/html/docker/app/coverage app vendor/bin/pest --coverage --min=90
	$(RUN) npm run test:coverage
security: ## Audit locked dependencies online and scan local files
	$(RUN) composer audit --locked
	$(RUN) npm audit --audit-level=high
	$(COMPOSE) --profile security run --rm secrets
docker-check: ## Validate Compose, build checks and application readiness
	$(COMPOSE) config --quiet
	$(COMPOSE) build --check app
	$(MAKE) up
test-e2e: assets up ## Validate PWA in Chromium, narrow with ARGS
	$(COMPOSE) --profile e2e run --rm playwright $(ARGS)
quality: lint analyse coverage security docker-check test-e2e ## Run all quality gates
publish: ## Publish (requires PR workflow configuration)
	@echo 'Publish is not configured. See IMPLEMENTATION.md for prerequisites and PR workflow.' >&2
	@exit 2
