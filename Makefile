.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  make be         - Start backend (Go, port 8080)"
	@echo "  make fe         - Install frontend deps and start dev server (port 5173)"
	@echo "  make dev        - Start backend and frontend concurrently"
	@echo "  make test       - Run backend and frontend tests"
	@echo "  make fmt        - Format backend (gofmt) and frontend (prettier)"
	@echo "  make lint       - Lint backend (golangci-lint) and frontend (eslint)"

be:
	$(MAKE) -C backend run

fe:
	cd frontend && npm install && npm run dev

dev:
	$(MAKE) be & $(MAKE) fe

test:
	CGO_ENABLED=1 $(MAKE) -C backend test
	cd frontend && npm test -- --passWithNoTests

fmt:
	$(MAKE) -C backend fmt
	cd frontend && npx prettier --write "src/**/*.{ts,tsx}"

lint:
	$(MAKE) -C backend lint
	cd frontend && npm run lint && npm run format:check
