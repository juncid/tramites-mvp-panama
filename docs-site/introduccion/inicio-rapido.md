# 🚀 Guía de Inicio Rápido

Configura tu entorno de desarrollo en 15 minutos y empieza a trabajar con el Sistema de Trámites Migratorios.

---

## ✅ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

| Software | Versión Mínima | Descarga |
|----------|----------------|----------|
| **Docker** | 24.0+ | [docker.com](https://www.docker.com/get-started) |
| **Docker Compose** | 2.0+ | Incluido con Docker Desktop |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com/downloads) |
| **Node.js** (opcional) | 18.0+ | [nodejs.org](https://nodejs.org) |
| **Python** (opcional) | 3.11+ | [python.org](https://www.python.org/downloads) |

!!! tip "Docker Desktop"
    La forma más fácil es instalar **Docker Desktop**, que incluye Docker, Docker Compose y una interfaz gráfica.

### Verificar Instalación

Abre una terminal y verifica las versiones:

```bash
# Docker
docker --version
# Salida esperada: Docker version 24.x.x

# Docker Compose
docker compose version
# Salida esperada: Docker Compose version 2.x.x

# Git
git --version
# Salida esperada: git version 2.x.x
```

---

## 📦 Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/juncid/tramites-mvp-panama.git

# Entrar al directorio
cd tramites-mvp-panama
```

### Estructura del Proyecto

```
tramites-mvp-panama/
├── backend/           # Backend FastAPI
├── frontend/          # Frontend React
├── nginx/             # Configuración Nginx
├── database/          # Scripts SQL
├── docs/              # Documentación original
├── docs-site/         # Documentación MkDocs (esta web)
├── docker-compose.yml # Orquestación Docker
└── README.md
```

---

## ⚙️ Paso 2: Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Backend
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tu configuración:

```bash
# Base de Datos
DB_SERVER=db
DB_PORT=1433
DB_NAME=tramites_db
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd

# Aplicación
API_V1_STR=/api/v1
PROJECT_NAME=Sistema de Trámites Migratorios
SECRET_KEY=your-secret-key-here-change-in-production

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# CORS (Frontend URL)
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost"]
```

!!! warning "Seguridad"
    Cambia `DB_PASSWORD` y `SECRET_KEY` en producción. Nunca commitees el archivo `.env` al repositorio.

---

## 🐳 Paso 3: Levantar los Servicios con Docker

### Opción A: Todos los Servicios (Recomendado)

```bash
# Levantar todos los servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f
```

Esto iniciará:
- ✅ SQL Server (puerto 1433)
- ✅ Redis (puerto 6379)
- ✅ Backend FastAPI (puerto 8000)
- ✅ Frontend React (puerto 3000)
- ✅ Nginx (puerto 80)

### Opción B: Solo Backend y Base de Datos

```bash
# Solo backend
docker compose up -d db redis backend
```

---

## 🔄 Paso 4: Inicializar la Base de Datos

### Crear las Tablas

```bash
# Ejecutar script de inicialización
docker compose exec backend python scripts/init_database.py
```

### Aplicar Migraciones (Alembic)

```bash
# Generar migración inicial
docker compose exec backend alembic revision --autogenerate -m "Initial migration"

# Aplicar migraciones
docker compose exec backend alembic upgrade head
```

### Cargar Datos de Prueba (Opcional)

```bash
# Cargar datos de ejemplo
docker compose exec backend python scripts/load_initial_data.py

# Verificar datos cargados
docker compose exec backend python scripts/verify_test_data.py
```

---

## ✅ Paso 5: Verificar que Todo Funciona

### 1. Backend API

Abre tu navegador en:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

Deberías ver la documentación interactiva de la API.

![Swagger UI](https://fastapi.tiangolo.com/img/index/index-03-swagger-02.png)

### 2. Frontend

Abre tu navegador en:

- **Aplicación**: [http://localhost:3000](http://localhost:3000)
- **Nginx**: [http://localhost](http://localhost)

### 3. Base de Datos

Conecta con tu cliente SQL favorito:

```
Servidor: localhost,1433
Usuario: sa
Contraseña: YourStrong@Passw0rd
Base de datos: tramites_db
```

### 4. Redis

```bash
# Conectar a Redis
docker compose exec redis redis-cli

# En Redis CLI
127.0.0.1:6379> PING
# Salida: PONG

127.0.0.1:6379> exit
```

---

## 🧪 Paso 6: Ejecutar Tests

### Backend Tests

```bash
# Todos los tests
docker compose exec backend pytest

# Con cobertura
docker compose exec backend pytest --cov=app --cov-report=html

# Ver reporte de cobertura
open htmlcov/index.html
```

### Frontend Tests (si frontend está corriendo localmente)

```bash
cd frontend
npm test
```

---

## 🛠️ Desarrollo Local (Sin Docker)

Si prefieres desarrollar sin Docker:

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate
# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

!!! info "Nota"
    Necesitarás SQL Server y Redis ejecutándose localmente o ajustar las variables de entorno para apuntar a servicios Docker.

---

## 📝 Comandos Útiles

### Docker Compose

```bash
# Ver servicios corriendo
docker compose ps

# Ver logs de un servicio específico
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v

# Rebuild y reiniciar
docker compose up -d --build
```

### Backend (dentro del contenedor)

```bash
# Shell interactivo
docker compose exec backend bash

# Python REPL
docker compose exec backend python

# Ver modelos SQLAlchemy
docker compose exec backend python -c "from app import models; print(dir(models))"

# Crear migración
docker compose exec backend alembic revision -m "descripcion"

# Ver historial de migraciones
docker compose exec backend alembic history
```

### Base de Datos

```bash
# Backup de la base de datos
docker compose exec db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' \
  -Q "BACKUP DATABASE tramites_db TO DISK='/tmp/backup.bak'"

# Copiar backup al host
docker compose cp db:/tmp/backup.bak ./backup.bak

# Ejecutar query SQL
docker compose exec db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' \
  -d tramites_db \
  -Q "SELECT COUNT(*) FROM tramites"
```

---

## 🐛 Solución de Problemas

### El contenedor de SQL Server no inicia

**Problema**: SQL Server requiere al menos 2GB de RAM.

**Solución**:
```bash
# En Docker Desktop, aumenta la memoria asignada a Docker
# Settings > Resources > Memory > 4GB o más
```

### Puerto ya en uso

**Problema**: `Error: bind: address already in use`

**Solución**:
```bash
# Ver qué proceso está usando el puerto 8000
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000

# Cambiar puerto en docker-compose.yml o detener el proceso
```

### Base de datos no se inicializa

**Problema**: Tablas no creadas

**Solución**:
```bash
# Ver logs de SQL Server
docker compose logs db

# Esperar a que SQL Server esté listo (puede tomar 30-60 segundos)
docker compose exec db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' \
  -Q "SELECT @@VERSION"

# Reintentar inicialización
docker compose exec backend python scripts/init_database.py
```

### Frontend no puede conectar con Backend

**Problema**: CORS error o Network error

**Solución**:
1. Verifica que `BACKEND_CORS_ORIGINS` en `.env` incluya `http://localhost:3000`
2. Reinicia el backend: `docker compose restart backend`
3. Verifica que el backend esté corriendo: `curl http://localhost:8000/docs`

### Permisos de archivo (Linux/Mac)

**Problema**: Permission denied

**Solución**:
```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Cambiar ownership de archivos generados por Docker
sudo chown -R $USER:$USER .
```

---

## 🎯 Próximos Pasos

Ahora que tienes el entorno configurado:

### Para Desarrolladores Backend

1. Lee el [Manual Técnico - Backend](../tecnico/03-backend.md)
2. Explora los [Endpoints REST](../tecnico/03-backend.md#endpoints-principales)
3. Revisa el [Diccionario de Datos](../database/index.md)

### Para Desarrolladores Frontend

1. Lee el [Manual Técnico - Frontend](../tecnico/04-frontend.md)
2. Revisa la estructura de componentes
3. Estudia los schemas de API

### Para Administradores de Sistemas

1. Lee la guía de [Infraestructura](../tecnico/05-infraestructura.md)
2. Configura [Monitoreo](../tecnico/07-monitoreo.md)
3. Revisa procedimientos de [Mantenimiento](../tecnico/09-mantenimiento.md)

---

## 📚 Recursos Adicionales

### Documentación

- [Arquitectura del Sistema](arquitectura.md)
- [Stack Tecnológico](tecnologias.md)
- [Manual Técnico Completo](../tecnico/index.md)

### APIs

- **Swagger UI Local**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Local**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Herramientas Recomendadas

| Herramienta | Propósito |
|-------------|-----------|
| **Postman** | Testing de APIs |
| **Azure Data Studio** | Cliente SQL Server |
| **VS Code** | Editor de código |
| **Docker Desktop** | Gestión de contenedores |
| **Redis Insight** | Cliente Redis visual |

---

## 🤝 Contribuir

¿Quieres contribuir al proyecto?

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Haz commit: `git commit -am 'Agrega nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

Ver [Guía de Contribución](../recursos/contribuir.md) para más detalles.

---

## 💬 Soporte

¿Problemas? ¿Preguntas?

- **GitHub Issues**: [github.com/juncid/tramites-mvp-panama/issues](https://github.com/juncid/tramites-mvp-panama/issues)
- **Email**: soporte@migracion.gob.pa
- **FAQs**: [Preguntas Frecuentes](../usuario/06-faqs.md)

---

**Última actualización**: 22 de Octubre, 2025  
**Versión**: 1.0

!!! success "¡Todo listo!"
    Tu entorno de desarrollo está configurado y listo para usar. ¡Feliz coding! 🎉
