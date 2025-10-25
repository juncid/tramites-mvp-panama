.PHONY: help seed seed-tramites seed-workflow seed-all seed-down seed-clean

# ===========================================================================
# Makefile para Datos de Prueba (Seed)
# Sistema de Trámites Migratorios de Panamá
# ===========================================================================

# Variables
COMPOSE_FILE := docker-compose.yml
SEED_PROFILE := seed

# Colors
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
help:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                                                                   ║$(NC)"
	@echo "$(CYAN)║       🌱 SISTEMA DE CARGA DE DATOS DE PRUEBA                     ║$(NC)"
	@echo "$(CYAN)║       Sistema de Trámites Migratorios de Panamá                  ║$(NC)"
	@echo "$(CYAN)║                                                                   ║$(NC)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Comandos disponibles:$(NC)"
	@echo ""
	@echo "  $(CYAN)make seed-all$(NC)          - Cargar TODOS los datos de prueba"
	@echo "  $(CYAN)make seed-tramites$(NC)     - Cargar solo datos de Trámites Base"
	@echo "  $(CYAN)make seed-workflow$(NC)     - Cargar solo datos de Workflow"
	@echo "  $(CYAN)make seed-clean$(NC)        - Limpiar contenedores de seed"
	@echo ""
	@echo "$(YELLOW)Prerequisitos:$(NC)"
	@echo "  - Base de datos en ejecución (make up)"
	@echo "  - Migraciones aplicadas (automático al hacer 'make up')"
	@echo ""
	@echo "$(YELLOW)Ejemplos de uso:$(NC)"
	@echo "  make up                    # Primero levantar servicios"
	@echo "  make seed-all              # Luego cargar datos de prueba"
	@echo "  make seed-tramites         # O solo trámites base"
	@echo ""

# ===========================================================================
# Main Seed Commands
# ===========================================================================

seed: seed-all

seed-all:
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN)🌱 Cargando TODOS los datos de prueba$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)⏳ Iniciando carga completa...$(NC)"
	@echo ""
	@docker-compose --profile $(SEED_PROFILE) up db-seed --abort-on-container-exit && \
		echo "" && \
		echo "$(GREEN)✅ Datos de prueba cargados exitosamente$(NC)" && \
		echo "" && \
		echo "$(CYAN)📋 Próximos pasos:$(NC)" && \
		echo "   1. Abrir Postman" && \
		echo "   2. Importar colecciones desde: backend/postman/" && \
		echo "   3. Ejecutar las colecciones para probar los datos" && \
		echo "" && \
		echo "$(YELLOW)💡 Consulte: backend/sql/README_TEST_DATA.md$(NC)" || \
		(echo "" && echo "$(RED)❌ Error cargando datos$(NC)" && exit 1)
	@$(MAKE) seed-clean

seed-tramites:
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN)🏛️  Cargando datos de Trámites Base$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@docker-compose run --rm \
		-e DATABASE_HOST=sqlserver \
		-e DATABASE_PORT=1433 \
		-e DATABASE_NAME=SIM_PANAMA \
		-e DATABASE_USER=sa \
		-e DATABASE_PASSWORD=YourStrong@Passw0rd \
		--name tramites-seed-temp \
		backend \
		python /app/scripts/seed_test_data.py --tramites && \
		echo "" && \
		echo "$(GREEN)✅ Datos de Trámites Base cargados$(NC)" || \
		(echo "" && echo "$(RED)❌ Error cargando datos$(NC)" && exit 1)

seed-workflow:
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN)🔄 Cargando datos de Workflow$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@docker-compose run --rm \
		-e DATABASE_HOST=sqlserver \
		-e DATABASE_PORT=1433 \
		-e DATABASE_NAME=SIM_PANAMA \
		-e DATABASE_USER=sa \
		-e DATABASE_PASSWORD=YourStrong@Passw0rd \
		--name tramites-seed-temp \
		backend \
		python /app/scripts/seed_test_data.py --workflow && \
		echo "" && \
		echo "$(GREEN)✅ Datos de Workflow cargados$(NC)" || \
		(echo "" && echo "$(RED)❌ Error cargando datos$(NC)" && exit 1)

seed-clean:
	@echo "$(YELLOW)🗑️  Limpiando contenedor de seed...$(NC)"
	@docker rm tramites-db-seed 2>/dev/null || true
	@docker rm tramites-seed-temp 2>/dev/null || true
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# ===========================================================================
# Development Commands
# ===========================================================================

up:
	@echo "$(CYAN)🚀 Levantando servicios...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Servicios en ejecución$(NC)"
	@echo ""
	@echo "$(YELLOW)💡 Servicios disponibles:$(NC)"
	@echo "   - API Backend: http://localhost:8000"
	@echo "   - Frontend: http://localhost:3000"
	@echo "   - Logs Viewer: http://localhost:8080"
	@echo ""
	@echo "$(YELLOW)💡 Usa 'make seed-all' para cargar datos de prueba$(NC)"

down:
	@echo "$(YELLOW)⏬ Deteniendo servicios...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Servicios detenidos$(NC)"

logs:
	@echo "$(CYAN)📋 Mostrando logs (Ctrl+C para salir)...$(NC)"
	@docker-compose logs -f

logs-backend:
	@echo "$(CYAN)📋 Mostrando logs del backend...$(NC)"
	@docker-compose logs -f backend

logs-db:
	@echo "$(CYAN)📋 Mostrando logs de la base de datos...$(NC)"
	@docker-compose logs -f sqlserver

restart:
	@echo "$(YELLOW)🔄 Reiniciando servicios...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Servicios reiniciados$(NC)"

ps:
	@echo "$(CYAN)📊 Estado de los contenedores:$(NC)"
	@docker-compose ps

# ===========================================================================
# Database Commands
# ===========================================================================

db-shell:
	@echo "$(CYAN)💾 Conectando a SQL Server...$(NC)"
	@docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C

db-migrations:
	@echo "$(CYAN)🔄 Aplicando migraciones...$(NC)"
	@docker-compose up db-migrations --abort-on-container-exit

# ===========================================================================
# Cleanup Commands
# ===========================================================================

clean: down
	@echo "$(YELLOW)🗑️  Limpiando contenedores y volúmenes...$(NC)"
	@docker-compose down -v
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

clean-all: clean
	@echo "$(YELLOW)🗑️  Limpiando imágenes...$(NC)"
	@docker-compose down -v --rmi all
	@echo "$(GREEN)✅ Limpieza completa$(NC)"

# ===========================================================================
# Testing Commands
# ===========================================================================

test-api:
	@echo "$(CYAN)🧪 Ejecutando tests de API...$(NC)"
	@make -f Makefile.api-tests test-api

# ===========================================================================
# Quick Status
# ===========================================================================

status:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║         ESTADO DEL SISTEMA DE TRÁMITES MVP PANAMÁ                ║$(NC)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📊 Contenedores:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(GREEN)🌐 Servicios disponibles:$(NC)"
	@echo "   - API Backend:    http://localhost:8000"
	@echo "   - API Docs:       http://localhost:8000/docs"
	@echo "   - Frontend:       http://localhost:3000"
	@echo "   - Logs Viewer:    http://localhost:8080"
	@echo ""
	@echo "$(YELLOW)💡 Comandos útiles:$(NC)"
	@echo "   make seed-all     - Cargar datos de prueba"
	@echo "   make logs         - Ver logs en tiempo real"
	@echo "   make test-api     - Ejecutar tests automatizados"
	@echo ""
