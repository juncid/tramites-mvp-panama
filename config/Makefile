.PHONY: help start stop restart build clean logs test backend-test frontend-install db-backup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start: ## Start all services in development mode
	@echo "Starting services..."
	docker compose up -d
	@echo "Services started. Access:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

stop: ## Stop all services
	@echo "Stopping services..."
	docker compose down

restart: ## Restart all services
	@echo "Restarting services..."
	docker compose restart

build: ## Rebuild all services
	@echo "Rebuilding services..."
	docker compose up --build -d

clean: ## Stop services and remove volumes
	@echo "Cleaning up..."
	docker compose down -v
	@echo "Cleanup complete"

logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

logs-db: ## Show database logs
	docker compose logs -f sqlserver

test: backend-test ## Run all tests

backend-test: ## Run backend tests
	@echo "Running backend tests..."
	docker compose exec backend pytest -v

backend-test-cov: ## Run backend tests with coverage
	@echo "Running backend tests with coverage..."
	docker compose exec backend pytest --cov=app --cov-report=html

frontend-install: ## Install frontend dependencies
	docker compose exec frontend npm install

db-backup: ## Create database backup
	@echo "Creating database backup..."
	docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "BACKUP DATABASE tramites_db TO DISK = N'/var/opt/mssql/backup/tramites_backup.bak'"
	@echo "Backup created"

db-shell: ## Open SQL Server shell
	docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd'

redis-cli: ## Open Redis CLI
	docker compose exec redis redis-cli

backend-shell: ## Open backend shell
	docker compose exec backend bash

frontend-shell: ## Open frontend shell
	docker compose exec frontend sh

ps: ## Show running containers
	docker compose ps

# Production targets
start-prod: ## Start services in production mode
	@echo "Starting production services..."
	docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

stop-prod: ## Stop production services
	docker compose -f docker-compose.prod.yml down

logs-prod: ## Show production logs
	docker compose -f docker-compose.prod.yml logs -f
