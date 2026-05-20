.PHONY: help \
        install build clean \
        lint lint-fix format format-check typecheck \
        test test-unit test-integration test-isolation test-cov \
        check check-file-sizes check-imports check-shared-state check-tool-naming \
        audit license-check \
        gen-api-types \
        install-hooks \
        mcpb \
        docker-build docker-shell

# ──────────────────────────────────────────────────────────────────────
# All commands run inside a pinned node:22-alpine container so the
# host Node version doesn't matter. The `mcp-dev` service in
# docker-compose.yml mounts the repo and a named node_modules volume.
# ──────────────────────────────────────────────────────────────────────

DC          = docker compose -f docker-compose.dev.yml
RUN         = $(DC) run --rm --no-deps mcp-dev
RUN_TTY     = $(DC) run --rm --no-deps -it mcp-dev

help:
	@echo "make <target>"
	@echo ""
	@echo "  Setup"
	@echo "    install          npm install (rebuilds Docker image when deps change)"
	@echo "    build            tsup production build (dist/)"
	@echo "    docker-build     docker build of the runtime image"
	@echo ""
	@echo "  Quality"
	@echo "    lint             eslint --max-warnings 0"
	@echo "    lint-fix         eslint --fix"
	@echo "    format           prettier --write"
	@echo "    format-check     prettier --check"
	@echo "    typecheck        tsc --noEmit"
	@echo ""
	@echo "  Tests"
	@echo "    test             full vitest suite"
	@echo "    test-unit        unit tests only"
	@echo "    test-integration integration tests"
	@echo "    test-isolation   tenant-isolation regression suite (CI merge gate)"
	@echo "    test-cov         vitest --coverage"
	@echo ""
	@echo "  Arch gates"
	@echo "    check-file-sizes   200-LOC max"
	@echo "    check-imports      dependency-cruiser layering rules"
	@echo "    check-shared-state no module-level mutable state (tenant isolation)"
	@echo "    check-tool-naming  1 file = 1 tool, names match"
	@echo ""
	@echo "  Security"
	@echo "    audit            npm audit --audit-level=moderate"
	@echo "    license-check    MIT/Apache/BSD/ISC whitelist"
	@echo ""
	@echo "  Composite"
	@echo "    check            lint + format-check + typecheck + all gates + test-cov"
	@echo ""
	@echo "  Hooks"
	@echo "    install-hooks    install lefthook pre-commit hooks"

# ── Setup ─────────────────────────────────────────────────────────────

install:
	$(RUN) npm ci || $(RUN) npm install

build:
	$(RUN) npm run build

mcpb:
	$(RUN) npm run build:mcpb-bundle
	@echo ""
	@echo "Single-file bundle: dist-mcpb/index.js"
	@echo "To pack a .mcpb file locally:"
	@echo "  mkdir -p mcpb-bundle/server"
	@echo "  cp dist-mcpb/index.js mcpb-bundle/server/index.js"
	@echo "  # create mcpb-bundle/manifest.json (see release.yml for the spec)"
	@echo "  cd mcpb-bundle && npx -y @anthropic-ai/mcpb@2.1.2 pack ."
	@echo ""
	@echo "Full .mcpb is built in CI on tag release — see .github/workflows/release.yml"

clean:
	$(RUN) rm -rf dist dist-mcpb mcpb-bundle coverage .tsbuildinfo *.mcpb

# ── Quality ───────────────────────────────────────────────────────────

lint:
	$(RUN) npm run lint

lint-fix:
	$(RUN) npm run lint:fix

format:
	$(RUN) npm run format

format-check:
	$(RUN) npm run format:check

typecheck:
	$(RUN) npm run typecheck

# ── Tests ─────────────────────────────────────────────────────────────

test:
	$(RUN) npm run test

test-unit:
	$(RUN) npm run test:unit

test-integration:
	$(RUN) npm run test:integration

test-isolation:
	$(RUN) npm run test:isolation

test-cov:
	$(RUN) npm run test:cov

# ── Architectural gates ───────────────────────────────────────────────

check-file-sizes:
	$(RUN) npm run check:file-sizes

check-imports:
	$(RUN) npm run check:imports

check-shared-state:
	$(RUN) npm run check:shared-state

check-tool-naming:
	$(RUN) npm run check:tool-naming

# ── Security ──────────────────────────────────────────────────────────

audit:
	$(RUN) npm run audit:deps

license-check:
	$(RUN) npm run audit:licenses

# ── Codegen ───────────────────────────────────────────────────────────

gen-api-types:
	$(RUN) npm run gen:api-types

# ── Composite ─────────────────────────────────────────────────────────

check: lint format-check typecheck check-imports check-file-sizes check-shared-state check-tool-naming audit license-check test-cov

# ── Hooks ─────────────────────────────────────────────────────────────

install-hooks:
	$(RUN) npx lefthook install

# ── Docker ────────────────────────────────────────────────────────────

docker-build:
	docker build -t kaminari-ad-mcp:dev .

docker-shell:
	$(RUN_TTY) sh
