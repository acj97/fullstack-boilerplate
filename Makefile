.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  make be     - Start backend (Go, port 8080)"
	@echo "  make fe     - Install frontend deps and start dev server (port 5173)"
	@echo "  make dev    - Start backend and frontend concurrently"

be:
	$(MAKE) -C backend run

fe:
	cd frontend && npm install && npm run dev

dev:
	$(MAKE) be & $(MAKE) fe
