.PHONY: help setup start stop restart logs status clean

# Default target
help:
	@echo "Available commands:"
	@echo "  setup    - Initial setup (create network, directories)"
	@echo "  start    - Start all services"
	@echo "  stop     - Stop all services"
	@echo "  restart  - Restart all services"
	@echo "  logs     - Show logs (specify SERVICE=name)"
	@echo "  status   - Show services status"
	@echo "  clean    - Clean up containers and networks"

setup:
	@echo "Setting up Traefik Multi-Project environment..."
	./setup.sh

start:
	@echo "Starting all services..."
	./manage.sh start

stop:
	@echo "Stopping all services..."
	./manage.sh stop

restart:
	@echo "Restarting all services..."
	./manage.sh restart

logs:
ifdef SERVICE
	docker logs -f $(SERVICE)
else
	@echo "Please specify SERVICE name: make logs SERVICE=traefik"
	@echo "Available services: traefik, jenkins, project1-app, project2-app, default-app"
endif

status:
	@echo "Services status:"
	./manage.sh status

clean:
	@echo "Cleaning up..."
	docker-compose -f projects-docker-compose.yml down -v
	docker-compose -f traefik-docker-compose.yml down -v
	docker system prune -f
	@echo "Cleanup completed!"

# Development targets
dev-setup: setup
	@echo "Setting up development environment..."
	mkdir -p project1 project2
	echo "console.log('Project 1 running on port 3000');" > project1/app.js
	echo "print('Project 2 running on port 8000')" > project2/app.py

backup:
	@echo "Creating backup..."
	tar -czf backup-$(shell date +%Y%m%d-%H%M%S).tar.gz \
		--exclude=node_modules \
		--exclude=__pycache__ \
		--exclude=logs \
		--exclude=certs \
		.
	@echo "Backup created!"