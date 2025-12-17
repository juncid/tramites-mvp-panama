# 🖥️ MANUAL DE DESARROLLO LOCAL
## Sistema de Gestión de Trámites Migratorios - SNM Panamá

**Versión**: 1.0  
**Fecha**: 16 de Diciembre de 2025  
**Autor**: Equipo de Desarrollo  
**Clasificación**: Uso Interno - Equipo de Desarrollo

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Instalación del Entorno](#2-instalación-del-entorno)
3. [Configuración del Proyecto](#3-configuración-del-proyecto)
4. [Ejecución con Docker Compose](#4-ejecución-con-docker-compose)
5. [Desarrollo Backend (FastAPI)](#5-desarrollo-backend-fastapi)
6. [Desarrollo Frontend (React)](#6-desarrollo-frontend-react)
7. [Base de Datos](#7-base-de-datos)
8. [Testing](#8-testing)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Requisitos Previos

### 1.1 Hardware Recomendado

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 8 GB | 16 GB |
| CPU | 4 cores | 8 cores |
| Disco | 20 GB libres | 50 GB libres |
| SO | Windows 10/11, macOS, Ubuntu 20.04+ | Ubuntu 22.04 / macOS |

### 1.2 Software Requerido

| Software | Versión | Instalación |
|----------|---------|-------------|
| **Docker Desktop** | 24.0+ | [docker.com/desktop](https://docker.com/desktop) |
| **Docker Compose** | 2.20+ | Incluido en Docker Desktop |
| **Git** | 2.40+ | `sudo apt install git` / [git-scm.com](https://git-scm.com) |
| **Node.js** | 18+ (LTS) | [nodejs.org](https://nodejs.org) |
| **Python** | 3.11+ | [python.org](https://python.org) |
| **VS Code** | Última | [code.visualstudio.com](https://code.visualstudio.com) |

### 1.3 Extensiones VS Code Recomendadas

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

## 2. Instalación del Entorno

### 2.1 Clonar el Repositorio

```bash
# Clonar
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama

# Verificar estructura
ls -la
# backend/  frontend/  docker-compose.yml  ...
```

### 2.2 Instalar Docker (Linux)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### 2.3 Instalar Docker (Windows/macOS)

1. Descargar [Docker Desktop](https://docker.com/desktop)
2. Instalar y reiniciar el sistema
3. Abrir Docker Desktop y aceptar términos
4. Verificar en terminal: `docker --version`

---

## 3. Configuración del Proyecto

### 3.1 Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables (opcional para desarrollo)
nano .env
```

**Variables principales (.env):**

```bash
# Base de datos
DATABASE_URL=mssql+pyodbc://sa:YourStrong!Passw0rd@sqlserver:1433/SIM_PANAMA?driver=ODBC+Driver+17+for+SQL+Server
SA_PASSWORD=YourStrong!Passw0rd

# Redis
REDIS_URL=redis://redis:6379/0

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# Frontend
VITE_API_URL=http://localhost:8000
```

### 3.2 Estructura del Proyecto

```
tramites-mvp-panama/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── routers/         # Endpoints API
│   │   ├── services/        # Lógica de negocio
│   │   ├── tasks/           # Tareas Celery (OCR)
│   │   └── main.py          # Aplicación FastAPI
│   ├── tests/               # Tests pytest
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── services/        # Llamadas API
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Desarrollo
├── docker-compose.prod.yml  # Producción
└── docs/                    # Documentación
```

---

## 4. Ejecución con Docker Compose

### 4.1 Iniciar Todos los Servicios

```bash
# Construir e iniciar
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f

# Verificar estado
docker compose ps
```

### 4.2 Servicios Disponibles

| Servicio | Puerto Local | URL |
|----------|--------------|-----|
| **Frontend** | 5173 | http://localhost:5173 |
| **Backend API** | 8000 | http://localhost:8000 |
| **API Docs (Swagger)** | 8000 | http://localhost:8000/docs |
| **API Docs (ReDoc)** | 8000 | http://localhost:8000/redoc |
| **SQL Server** | 1433 | localhost:1433 |
| **Redis** | 6379 | localhost:6379 |

### 4.3 Comandos Útiles

```bash
# Detener servicios
docker compose down

# Detener y eliminar volúmenes (reset BD)
docker compose down -v

# Reiniciar un servicio específico
docker compose restart backend

# Ver logs de un servicio
docker compose logs -f backend

# Ejecutar comando en contenedor
docker compose exec backend bash
```

---

## 5. Desarrollo Backend (FastAPI)

### 5.1 Desarrollo con Hot Reload

El backend está configurado con hot reload automático. Al modificar archivos en `backend/app/`, los cambios se reflejan inmediatamente.

```bash
# Ver logs del backend
docker compose logs -f backend
```

### 5.2 Desarrollo Local (sin Docker)

```bash
# Crear entorno virtual
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# o: venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno
export DATABASE_URL="mssql+pyodbc://sa:YourStrong!Passw0rd@localhost:1433/SIM_PANAMA?driver=ODBC+Driver+17+for+SQL+Server"
export REDIS_URL="redis://localhost:6379/0"

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

### 5.3 Migraciones de Base de Datos

```bash
# Crear nueva migración
cd backend
docker compose exec backend alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
docker compose exec backend alembic upgrade head

# Revertir última migración
docker compose exec backend alembic downgrade -1
```

### 5.4 Estructura de Endpoints

```
/api/v1/
├── /ppsh/                    # Módulo PPSH
│   ├── GET  /solicitudes
│   ├── POST /solicitudes
│   ├── GET  /solicitudes/{id}
│   └── ...
├── /workflows/               # Gestión de workflows
├── /tramites/                # Trámites generales
├── /ocr/                     # Procesamiento OCR
└── /health                   # Health check
```

---

## 6. Desarrollo Frontend (React)

### 6.1 Desarrollo con Docker

El frontend tiene hot reload configurado. Los cambios en `frontend/src/` se reflejan automáticamente.

```bash
# Ver logs del frontend
docker compose logs -f frontend
```

### 6.2 Desarrollo Local (sin Docker)

```bash
# Instalar dependencias
cd frontend
npm install

# Configurar API
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

### 6.3 Comandos de Desarrollo

```bash
# Ejecutar tests
npm run test

# Ejecutar tests con cobertura
npm run test:coverage

# Linting
npm run lint

# Build de producción
npm run build
```

---

## 7. Base de Datos

### 7.1 Conexión desde Cliente SQL

| Parámetro | Valor |
|-----------|-------|
| **Server** | localhost,1433 |
| **User** | sa |
| **Password** | YourStrong!Passw0rd |
| **Database** | SIM_PANAMA |

### 7.2 Clientes Recomendados

- **Azure Data Studio** (gratuito, multiplataforma)
- **DBeaver** (gratuito, multiplataforma)
- **SQL Server Management Studio** (Windows)

### 7.3 Comandos SQL Útiles

```bash
# Acceder al contenedor SQL Server
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd" -d SIM_PANAMA -C

# Backup de base de datos
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd" -C \
  -Q "BACKUP DATABASE SIM_PANAMA TO DISK='/var/opt/mssql/backup/dev_backup.bak'"
```

### 7.4 Tablas Principales

| Módulo | Tablas |
|--------|--------|
| **PPSH** | PPSH_SOLICITUD, PPSH_DOCUMENTO, PPSH_ENTREVISTA, ... |
| **Workflows** | SIM_TR_WORKFLOW, SIM_TR_ETAPA, SIM_TR_PREGUNTA, ... |
| **Catálogos** | SIM_GE_PAIS, SIM_GE_TIPO_DOCUMENTO, ... |
| **Seguridad** | SEG_TB_USUARIOS, SEG_TB_ROLES, ... |

---

## 8. Testing

### 8.1 Tests Backend

```bash
# Ejecutar todos los tests
docker compose -f backend/docker-compose.test.yml run --rm test-coverage

# Tests específicos
docker compose exec backend pytest tests/test_routers_ppsh.py -v

# Con cobertura
docker compose exec backend pytest --cov=app --cov-report=html
```

### 8.2 Tests Frontend

```bash
# Desde el contenedor
docker compose exec frontend npm run test

# Local
cd frontend
npm run test
npm run test:coverage
```

### 8.3 Métricas Actuales

| Componente | Tests | Cobertura |
|------------|-------|-----------|
| Backend | 704 | 85% |
| Frontend | 191 | 89% |

---

## 9. Troubleshooting

### 9.1 Docker no inicia

```bash
# Verificar Docker daemon
sudo systemctl status docker

# Reiniciar Docker
sudo systemctl restart docker

# Limpiar recursos
docker system prune -a
```

### 9.2 Puerto ocupado

```bash
# Ver qué usa el puerto
sudo lsof -i :8000

# Matar proceso
sudo kill -9 <PID>
```

### 9.3 SQL Server no inicia

```bash
# Ver logs
docker compose logs sqlserver

# Verificar memoria (necesita 2GB mínimo)
free -h

# Reiniciar servicio
docker compose restart sqlserver
```

### 9.4 Problemas de permisos

```bash
# Agregar usuario a grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 9.5 Reset completo del entorno

```bash
# Detener todo y eliminar volúmenes
docker compose down -v

# Eliminar imágenes del proyecto
docker rmi $(docker images | grep tramites | awk '{print $3}')

# Reconstruir desde cero
docker compose up -d --build
```

---

## 📌 Checklist de Desarrollo

- [ ] Docker Desktop instalado y funcionando
- [ ] Repositorio clonado
- [ ] Archivo `.env` configurado
- [ ] `docker compose up -d` ejecutado
- [ ] Frontend accesible en http://localhost:5173
- [ ] API accesible en http://localhost:8000/docs
- [ ] Base de datos conectada
- [ ] Tests ejecutándose correctamente

---

## 🔗 Referencias

- **Repositorio**: https://github.com/juncid/tramites-mvp-panama
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Docker Docs**: https://docs.docker.com

---

*Documento generado: 16 de Diciembre de 2025*  
*© 2025 Clio Consulting - Todos los derechos reservados*
