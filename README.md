# Trámites MVP Panamá - SNMP

Sistema de gestión de trámites desarrollado con FastAPI (Python) y React (TypeScript), utilizando MS SQL Server como base de datos principal y Redis para caché.

## 📋 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)
- Git

## 🏗️ Arquitectura del Proyecto

```
tramites-mvp-panama/
├── backend/                 # API FastAPI (Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Punto de entrada de la aplicación
│   │   ├── config.py       # Configuración
│   │   ├── database.py     # Conexión a MS SQL Server
│   │   ├── redis_client.py # Cliente Redis
│   │   ├── models.py       # Modelos SQLAlchemy
│   │   ├── schemas.py      # Esquemas Pydantic
│   │   └── routes.py       # Rutas de la API
│   ├── tests/              # Tests del backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # Aplicación React (TypeScript)
│   ├── src/
│   │   ├── api/           # Cliente API
│   │   ├── App.tsx        # Componente principal
│   │   ├── App.css        # Estilos
│   │   ├── main.tsx       # Punto de entrada
│   │   └── index.css      # Estilos globales
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml      # Orquestación de servicios
└── README.md              # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Script de Inicio Automático (Recomendado)

```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
./start.sh
```

### Opción 2: Usando Make (Recomendado para Desarrollo)

```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
make start
```

Ver todos los comandos disponibles:
```bash
make help
```

### Opción 3: Manual con Docker Compose

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
```

#### 2. Configurar Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**Nota:** Las contraseñas predeterminadas son para desarrollo local. En producción, usa contraseñas seguras.

#### 3. Levantar los Servicios

```bash
docker compose up --build -d
```

Este comando:
- Construye las imágenes Docker
- Inicia MS SQL Server en el puerto 1433
- Inicia Redis en el puerto 6379
- Inicia el backend FastAPI en el puerto 8000
- Inicia el frontend React en el puerto 3000

#### 4. Acceder a la Aplicación

Una vez que todos los servicios estén en ejecución:

- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API (Swagger):** http://localhost:8000/docs
- **Documentación API (ReDoc):** http://localhost:8000/redoc

## 🔧 Comandos Útiles

### Usando Make (Recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Iniciar servicios
make start

# Detener servicios
make stop

# Ver logs
make logs

# Ejecutar tests
make test

# Acceder a shells
make backend-shell
make frontend-shell
make db-shell
make redis-cli
```

### Usando Docker Compose Directamente

### Detener los Servicios

```bash
docker-compose down
```

### Detener y Eliminar Volúmenes (Limpia la Base de Datos)

```bash
docker-compose down -v
```

### Ver Logs de un Servicio Específico

```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# SQL Server
docker-compose logs -f sqlserver

# Redis
docker-compose logs -f redis
```

### Reconstruir un Servicio Específico

```bash
# Backend
docker-compose up --build backend

# Frontend
docker-compose up --build frontend
```

### Ejecutar Comandos en un Contenedor

```bash
# Acceder al contenedor del backend
docker-compose exec backend bash

# Acceder al contenedor de SQL Server
docker-compose exec sqlserver bash
```

## 📊 Base de Datos

### Conexión a MS SQL Server

Puedes conectarte a la base de datos usando cualquier cliente SQL:

- **Host:** localhost
- **Puerto:** 1433
- **Usuario:** sa
- **Contraseña:** YourStrong@Passw0rd
- **Base de datos:** tramites_db

### Crear Base de Datos Manualmente (Opcional)

La base de datos se crea automáticamente, pero si necesitas crearla manualmente:

```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "CREATE DATABASE tramites_db"
```

## 🔑 API Endpoints

### Endpoints Principales

#### Salud del Sistema
- `GET /` - Información general de la API
- `GET /health` - Estado de salud

#### Trámites
- `GET /api/v1/tramites` - Listar todos los trámites
- `GET /api/v1/tramites/{id}` - Obtener un trámite específico
- `POST /api/v1/tramites` - Crear un nuevo trámite
- `PUT /api/v1/tramites/{id}` - Actualizar un trámite
- `DELETE /api/v1/tramites/{id}` - Eliminar un trámite (soft delete)

### Ejemplo de Uso con cURL

```bash
# Crear un trámite
curl -X POST http://localhost:8000/api/v1/tramites \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Solicitud de Permiso",
    "descripcion": "Permiso para construcción",
    "estado": "pendiente"
  }'

# Listar trámites
curl http://localhost:8000/api/v1/tramites
```

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar tests del backend
docker-compose exec backend pytest

# Con cobertura
docker-compose exec backend pytest --cov=app
```

## 🛠️ Desarrollo

### Desarrollo Local sin Docker

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Hot Reload

Ambos servicios están configurados con hot reload:
- **Backend:** Uvicorn con `--reload`
- **Frontend:** Vite con hot module replacement

Los cambios en el código se reflejarán automáticamente.

## 📦 Tecnologías Utilizadas

### Backend
- **FastAPI:** Framework web moderno y rápido
- **SQLAlchemy:** ORM para SQL Server
- **Pydantic:** Validación de datos
- **PyODBC:** Driver ODBC para SQL Server
- **Redis:** Cliente de caché
- **Uvicorn:** Servidor ASGI

### Frontend
- **React 18:** Biblioteca de interfaz de usuario
- **TypeScript:** Superset tipado de JavaScript
- **Vite:** Build tool y dev server
- **Axios:** Cliente HTTP

### Infraestructura
- **MS SQL Server 2022:** Base de datos principal
- **Redis 7:** Sistema de caché en memoria
- **Docker & Docker Compose:** Contenerización y orquestación

## 🔒 Seguridad

Para un entorno de producción:

1. Cambia todas las contraseñas por defecto
2. Configura CORS apropiadamente en el backend
3. Usa variables de entorno seguras
4. Implementa HTTPS
5. Configura rate limiting
6. Implementa autenticación y autorización

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es para uso interno de SNMP.

## 📞 Soporte

Para preguntas o problemas, por favor crea un issue en el repositorio.

## 🎯 Roadmap

- [ ] Autenticación y autorización
- [ ] Notificaciones en tiempo real
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de datos
- [ ] Dashboard de estadísticas
- [ ] Tests automatizados completos
- [ ] CI/CD pipeline
- [ ] Documentación API extendida