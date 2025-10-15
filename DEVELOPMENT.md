# Guía de Desarrollo - Trámites MVP Panamá

## Inicio Rápido para Desarrolladores

### Prerrequisitos
- Docker y Docker Compose instalados
- Git
- Editor de código (VS Code recomendado)

### Primera Ejecución

1. **Clonar el repositorio**
```bash
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama
```

2. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Levantar servicios**
```bash
docker compose up --build
```

Esto iniciará:
- SQL Server en puerto 1433
- Redis en puerto 6379
- Backend FastAPI en puerto 8000
- Frontend React en puerto 3000

### Estructura del Proyecto

#### Backend (FastAPI)
```
backend/
├── app/
│   ├── __init__.py          # Inicialización del paquete
│   ├── main.py              # Aplicación FastAPI principal
│   ├── config.py            # Configuración y variables de entorno
│   ├── database.py          # Conexión a SQL Server con SQLAlchemy
│   ├── redis_client.py      # Cliente Redis para caché
│   ├── models.py            # Modelos de base de datos (ORM)
│   ├── schemas.py           # Esquemas Pydantic (validación)
│   └── routes.py            # Endpoints de la API
├── tests/                   # Tests unitarios y de integración
├── Dockerfile              # Imagen Docker del backend
└── requirements.txt        # Dependencias Python
```

#### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── api/
│   │   └── tramites.ts     # Cliente API para comunicación con backend
│   ├── App.tsx             # Componente principal de la aplicación
│   ├── App.css             # Estilos de la aplicación
│   ├── main.tsx            # Punto de entrada de React
│   ├── index.css           # Estilos globales
│   └── vite-env.d.ts       # Definiciones TypeScript para Vite
├── public/                 # Archivos estáticos
├── index.html              # HTML principal
├── package.json            # Dependencias Node.js
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
└── Dockerfile             # Imagen Docker del frontend
```

## Desarrollo Local

### Hot Reload
Ambos servicios soportan hot reload:
- **Backend**: Los cambios en archivos Python se recargan automáticamente (uvicorn --reload)
- **Frontend**: Vite HMR recarga componentes sin perder estado

### Agregar Nuevas Funcionalidades

#### 1. Agregar un Nuevo Endpoint en el Backend

**Paso 1:** Definir el modelo en `models.py`
```python
class NuevoModelo(Base):
    __tablename__ = "tabla_nueva"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(255))
```

**Paso 2:** Crear schemas en `schemas.py`
```python
class NuevoModeloBase(BaseModel):
    nombre: str

class NuevoModeloResponse(NuevoModeloBase):
    id: int
    class Config:
        from_attributes = True
```

**Paso 3:** Agregar rutas en `routes.py`
```python
@router.get("/nuevo-modelo", response_model=List[schemas.NuevoModeloResponse])
async def get_nuevo_modelo(db: Session = Depends(get_db)):
    return db.query(models.NuevoModelo).all()
```

#### 2. Agregar un Nuevo Componente en el Frontend

**Paso 1:** Crear el componente
```typescript
// src/components/NuevoComponente.tsx
import React from 'react'

interface Props {
  data: string
}

export const NuevoComponente: React.FC<Props> = ({ data }) => {
  return <div>{data}</div>
}
```

**Paso 2:** Agregar funciones API en `api/tramites.ts`
```typescript
export const getNuevoModelo = async (): Promise<NuevoModelo[]> => {
  const response = await api.get('/nuevo-modelo')
  return response.data
}
```

**Paso 3:** Usar en App.tsx
```typescript
import { NuevoComponente } from './components/NuevoComponente'

// En tu componente
<NuevoComponente data={data} />
```

## Comandos Útiles

### Docker

```bash
# Ver logs de un servicio
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f sqlserver
docker compose logs -f redis

# Reiniciar un servicio
docker compose restart backend

# Reconstruir un servicio
docker compose up --build backend

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (resetear DB)
docker compose down -v

# Ver estado de contenedores
docker compose ps
```

### Backend

```bash
# Ejecutar comando en el contenedor backend
docker compose exec backend bash

# Instalar nueva dependencia
docker compose exec backend pip install nuevo-paquete
# No olvidar agregar a requirements.txt

# Ejecutar tests
docker compose exec backend pytest

# Abrir shell de Python
docker compose exec backend python
```

### Frontend

```bash
# Ejecutar comando en el contenedor frontend
docker compose exec frontend sh

# Instalar nueva dependencia
docker compose exec frontend npm install nuevo-paquete

# Ver información de paquetes
docker compose exec frontend npm list
```

### Base de Datos

```bash
# Conectar a SQL Server
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd'

# Crear backup de la base de datos
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "BACKUP DATABASE tramites_db TO DISK = '/var/opt/mssql/backup/tramites_db.bak'"

# Ver bases de datos
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "SELECT name FROM sys.databases"
```

### Redis

```bash
# Conectar a Redis CLI
docker compose exec redis redis-cli

# Ver todas las keys
docker compose exec redis redis-cli KEYS '*'

# Limpiar caché
docker compose exec redis redis-cli FLUSHALL
```

## Testing

### Backend Tests

```bash
# Ejecutar todos los tests
docker compose exec backend pytest

# Ejecutar tests con cobertura
docker compose exec backend pytest --cov=app --cov-report=html

# Ejecutar tests específicos
docker compose exec backend pytest tests/test_routes.py

# Ejecutar con verbose
docker compose exec backend pytest -v
```

### Frontend Tests (cuando se agreguen)

```bash
# Ejecutar tests
docker compose exec frontend npm test

# Ejecutar tests en modo watch
docker compose exec frontend npm test -- --watch
```

## Debugging

### Backend

1. Agregar breakpoints con `import pdb; pdb.set_trace()`
2. Ver logs: `docker compose logs -f backend`
3. Revisar variables de entorno: `docker compose exec backend env`

### Frontend

1. Usar React Developer Tools en el navegador
2. Console.log para debugging
3. Ver logs: `docker compose logs -f frontend`

### Base de Datos

1. Usar Azure Data Studio o SQL Server Management Studio
2. Conectar a `localhost:1433` con usuario `sa`
3. Ver logs de SQL Server: `docker compose logs -f sqlserver`

## Solución de Problemas Comunes

### Puerto ya en uso

```bash
# Verificar qué está usando el puerto
sudo lsof -i :8000  # o el puerto que necesites
sudo lsof -i :3000
sudo lsof -i :1433

# Matar el proceso
sudo kill -9 <PID>
```

### Contenedores no inician

```bash
# Limpiar todo y empezar de cero
docker compose down -v
docker system prune -a
docker compose up --build
```

### SQL Server no conecta

```bash
# Verificar que el contenedor esté corriendo
docker compose ps

# Ver logs de SQL Server
docker compose logs sqlserver

# Esperar a que SQL Server esté listo (puede tomar 1-2 minutos)
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "SELECT 1"
```

### Cambios en el código no se reflejan

1. **Backend**: Verificar que uvicorn esté en modo reload
2. **Frontend**: Refrescar el navegador (Ctrl+F5)
3. Si persiste: `docker compose restart backend` o `docker compose restart frontend`

### Errores de permisos

```bash
# Linux/Mac: Dar permisos a directorios
sudo chown -R $USER:$USER .
chmod -R 755 .
```

## Variables de Entorno

### Backend (.env)
```env
APP_NAME="Trámites MVP Panamá"
DEBUG=true
DATABASE_HOST=sqlserver
DATABASE_PORT=1433
DATABASE_NAME=tramites_db
DATABASE_USER=sa
DATABASE_PASSWORD=YourStrong@Passw0rd
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Best Practices

### Backend
- Usar type hints en Python
- Documentar funciones con docstrings
- Validar datos con Pydantic
- Manejar errores apropiadamente
- Usar transacciones de base de datos
- Implementar paginación en queries grandes

### Frontend
- Usar TypeScript para type safety
- Componentizar código reutilizable
- Manejar estados de loading y error
- Implementar error boundaries
- Optimizar renders con React.memo cuando sea necesario

### General
- Hacer commits pequeños y frecuentes
- Escribir mensajes de commit descriptivos
- Documentar cambios importantes
- Revisar código antes de commit
- Mantener .env.example actualizado

## Recursos Útiles

- [FastAPI Documentación](https://fastapi.tiangolo.com/)
- [React Documentación](https://react.dev/)
- [TypeScript Documentación](https://www.typescriptlang.org/docs/)
- [Docker Compose Documentación](https://docs.docker.com/compose/)
- [SQL Server Documentación](https://docs.microsoft.com/en-us/sql/sql-server/)
- [Redis Documentación](https://redis.io/docs/)

## Contacto y Soporte

Para preguntas o problemas, crear un issue en el repositorio de GitHub.
