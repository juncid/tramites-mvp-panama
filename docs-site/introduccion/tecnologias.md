# 💻 Stack Tecnológico

Descripción detallada de todas las tecnologías utilizadas en el Sistema de Trámites Migratorios de Panamá.

---

## 🎨 Frontend

### React 18

<div class="tech-card">
**Versión**: 18.x  
**Propósito**: Librería UI principal  
**Sitio oficial**: [reactjs.org](https://reactjs.org)
</div>

**¿Por qué React?**

- ✅ Componentes reutilizables
- ✅ Virtual DOM para rendimiento
- ✅ Gran ecosistema y comunidad
- ✅ React Hooks para gestión de estado
- ✅ Excelente documentación

**Características usadas**:
```javascript
// Hooks utilizados
import { useState, useEffect, useContext, useMemo } from 'react';

// Componente funcional típico
function TramitesList() {
  const [tramites, setTramites] = useState([]);
  
  useEffect(() => {
    fetchTramites();
  }, []);
  
  return <div>{/* UI */}</div>;
}
```

---

### TypeScript 5.0

<div class="tech-card">
**Versión**: 5.x  
**Propósito**: Superset de JavaScript con tipos estáticos  
**Sitio oficial**: [typescriptlang.org](https://www.typescriptlang.org)
</div>

**Beneficios**:

- ✅ Type safety en tiempo de compilación
- ✅ Mejor IntelliSense y autocompletado
- ✅ Refactoring más seguro
- ✅ Documentación implícita con tipos
- ✅ Detección temprana de errores

**Ejemplo de uso**:
```typescript
// Definición de tipos
interface Tramite {
  id: number;
  titulo: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fecha_creacion: Date;
}

// Función tipada
async function fetchTramites(): Promise<Tramite[]> {
  const response = await api.get<Tramite[]>('/tramites');
  return response.data;
}
```

---

### Vite

<div class="tech-card">
**Versión**: 4.x  
**Propósito**: Build tool y dev server  
**Sitio oficial**: [vitejs.dev](https://vitejs.dev)
</div>

**Ventajas sobre Webpack**:

- ⚡ **Súper rápido**: HMR instantáneo
- 📦 **ESM nativo**: No bundling en desarrollo
- 🔧 **Configuración simple**: Casi zero-config
- 🎯 **Optimizado**: Build de producción optimizado
- 🔌 **Plugins**: Rico ecosistema de plugins

**Configuración básica**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});
```

---

### React Router 6

<div class="tech-card">
**Versión**: 6.x  
**Propósito**: Navegación y routing  
**Sitio oficial**: [reactrouter.com](https://reactrouter.com)
</div>

**Rutas principales**:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tramites" element={<TramitesList />} />
        <Route path="/tramites/:id" element={<TramiteDetail />} />
        <Route path="/ppsh" element={<PPSH />} />
        <Route path="/workflows" element={<Workflows />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔧 Backend

### Python 3.11

<div class="tech-card">
**Versión**: 3.11.x  
**Propósito**: Lenguaje de programación principal  
**Sitio oficial**: [python.org](https://www.python.org)
</div>

**¿Por qué Python 3.11?**

- 🚀 **25% más rápido** que Python 3.10
- 📝 **Sintaxis clara**: Código legible y mantenible
- 📚 **Rico ecosistema**: Miles de librerías
- 🔬 **Type hints**: Tipado opcional con mypy
- 🐍 **Maduro y estable**: Usado en producción mundialmente

---

### FastAPI

<div class="tech-card">
**Versión**: 0.104.x  
**Propósito**: Framework web moderno y rápido  
**Sitio oficial**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
</div>

**Ventajas clave**:

- ⚡ **Muy rápido**: Rendimiento comparable a Node.js y Go
- 📚 **Documentación automática**: OpenAPI/Swagger integrado
- ✅ **Validación automática**: Con Pydantic
- 🔒 **Type hints**: Type safety en Python
- 🎯 **Async nativo**: Soporte completo para async/await

**Ejemplo de endpoint**:
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class TramiteCreate(BaseModel):
    titulo: str
    descripcion: str
    tipo: str

@app.post("/tramites", status_code=201)
async def create_tramite(tramite: TramiteCreate):
    # Validación automática con Pydantic
    # Documentación automática en /docs
    return {"id": 123, **tramite.dict()}
```

---

### SQLAlchemy 2.0

<div class="tech-card">
**Versión**: 2.0.x  
**Propósito**: ORM (Object-Relational Mapping)  
**Sitio oficial**: [sqlalchemy.org](https://www.sqlalchemy.org)
</div>

**Características**:

- 🗄️ **ORM completo**: Mapeo objeto-relacional
- 🔍 **Query builder**: Construcción de queries tipadas
- 🔄 **Migraciones**: Con Alembic
- 💪 **Relaciones**: Lazy/eager loading
- 🎯 **Múltiples DBs**: Soporte para varios motores

**Modelo de ejemplo**:
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Tramite(Base):
    __tablename__ = 'tramites'
    
    id = Column(Integer, primary_key=True)
    titulo = Column(String(200), nullable=False)
    estado = Column(String(50), nullable=False, default='PENDIENTE')
    fecha_creacion = Column(DateTime, server_default=func.now())
    
    # Relaciones
    documentos = relationship('Documento', back_populates='tramite')
```

---

### Pydantic 2.0

<div class="tech-card">
**Versión**: 2.0.x  
**Propósito**: Validación de datos y schemas  
**Sitio oficial**: [pydantic.dev](https://pydantic.dev)
</div>

**Usos**:

- ✅ Validación de request/response
- 📝 Schemas para documentación
- 🔒 Type safety en runtime
- 🔄 Conversión automática de tipos
- ⚡ Muy rápido (escrito en Rust)

**Schema de ejemplo**:
```python
from pydantic import BaseModel, Field, validator
from datetime import datetime

class TramiteSchema(BaseModel):
    id: int
    titulo: str = Field(..., min_length=5, max_length=200)
    estado: Literal['PENDIENTE', 'APROBADO', 'RECHAZADO']
    fecha_creacion: datetime
    
    @validator('titulo')
    def validate_titulo(cls, v):
        if not v.strip():
            raise ValueError('El título no puede estar vacío')
        return v.strip()
    
    class Config:
        orm_mode = True  # Permite conversión desde modelos SQLAlchemy
```

---

### Alembic

<div class="tech-card">
**Versión**: Latest  
**Propósito**: Migraciones de base de datos  
**Sitio oficial**: [alembic.sqlalchemy.org](https://alembic.sqlalchemy.org)
</div>

**Workflow**:
```bash
# Crear migración
alembic revision --autogenerate -m "Add PPSH tables"

# Aplicar migraciones
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🗄️ Base de Datos

### SQL Server 2019

<div class="tech-card">
**Versión**: 2019  
**Propósito**: Sistema de gestión de base de datos relacional  
**Sitio oficial**: [microsoft.com/sql-server](https://www.microsoft.com/sql-server)
</div>

**¿Por qué SQL Server?**

- 💪 **Robusto**: Probado en producción
- 🔒 **Seguro**: Encriptación nativa
- 📊 **Análisis**: Integración con BI tools
- 🔄 **Alta disponibilidad**: Always On Availability Groups
- 🎯 **Performance**: Excelente optimizador de queries

**Características usadas**:

- Índices clustered y non-clustered (87+)
- Foreign Keys para integridad referencial
- Stored procedures (futuro)
- Full-text search (preparado)
- Auditoría con SQL Server Audit

---

### Redis 7

<div class="tech-card">
**Versión**: 7.x  
**Propósito**: Caché en memoria y almacenamiento de sesiones  
**Sitio oficial**: [redis.io](https://redis.io)
</div>

**Usos en el proyecto**:

```python
import redis

# Cliente Redis
client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Cache de queries
def get_tramites_cached():
    key = 'tramites:list'
    cached = client.get(key)
    
    if cached:
        return json.loads(cached)
    
    # Fetch from DB
    tramites = db.query(Tramite).all()
    
    # Store in cache (TTL 5 min)
    client.setex(key, 300, json.dumps(tramites))
    
    return tramites
```

**Características**:
- ⚡ **Súper rápido**: Datos en memoria
- 🔄 **Persistencia**: RDB + AOF
- 📊 **Estructuras**: Strings, Hashes, Lists, Sets, Sorted Sets
- 🔒 **Atomic operations**: Thread-safe
- 📈 **Escalable**: Redis Cluster

---

## 🚀 Infraestructura

### Docker

<div class="tech-card">
**Versión**: 24.x  
**Propósito**: Contenedorización de aplicaciones  
**Sitio oficial**: [docker.com](https://www.docker.com)
</div>

**Ventajas**:

- 📦 **Portabilidad**: Mismo entorno en dev/prod
- 🔄 **Reproducibilidad**: Builds consistentes
- 🚀 **Deploy rápido**: Segundos vs minutos
- 📊 **Aislamiento**: Cada servicio en su contenedor
- 💰 **Eficiencia**: Menos recursos que VMs

**Dockerfile del backend**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código de la aplicación
COPY . .

# Puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Docker Compose

<div class="tech-card">
**Versión**: 2.x  
**Propósito**: Orquestación multi-contenedor  
**Sitio oficial**: [docs.docker.com/compose](https://docs.docker.com/compose)
</div>

**Servicios definidos**:
- Frontend (React)
- Backend (FastAPI)
- Base de datos (SQL Server)
- Cache (Redis)
- Reverse proxy (Nginx)

---

### Nginx

<div class="tech-card">
**Versión**: 1.25.x  
**Propósito**: Servidor web y reverse proxy  
**Sitio oficial**: [nginx.org](https://nginx.org)
</div>

**Roles**:

1. **Reverse Proxy**: Enruta requests al backend
2. **Static Files**: Sirve el frontend React
3. **Load Balancing**: Distribuye carga (preparado)
4. **SSL Termination**: Maneja HTTPS
5. **Compression**: GZIP/Brotli
6. **Caching**: Cache de contenido estático

**Configuración básica**:
```nginx
server {
    listen 80;
    server_name tramites.migracion.gob.pa;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

## 📚 Librerías Adicionales

### Backend

| Librería | Versión | Propósito |
|----------|---------|-----------|
| **uvicorn** | 0.24+ | Servidor ASGI |
| **python-dotenv** | 1.0+ | Variables de entorno |
| **python-multipart** | 0.0.6+ | Manejo de archivos |
| **python-jose** | 3.3+ | JWT tokens |
| **passlib** | 1.7+ | Hashing de passwords |
| **pyodbc** | 4.0+ | Driver SQL Server |
| **pytest** | 7.4+ | Testing |
| **pytest-cov** | 4.1+ | Cobertura de tests |

### Frontend

| Librería | Versión | Propósito |
|----------|---------|-----------|
| **axios** | 1.6+ | HTTP client |
| **react-query** | 4.x | Data fetching |
| **react-hook-form** | 7.x | Gestión de formularios |
| **zod** | 3.x | Validación de schemas |
| **date-fns** | 2.x | Manipulación de fechas |
| **recharts** | 2.x | Gráficos |

---

## 🔐 Seguridad

### Librerías de Seguridad

| Herramienta | Propósito |
|-------------|-----------|
| **python-jose** | JWT authentication |
| **passlib + bcrypt** | Password hashing |
| **cryptography** | Encriptación |
| **python-multipart** | Validación de uploads |
| **sqlalchemy** | Prevención de SQL injection |

### Headers de Seguridad (Nginx)

```nginx
# Headers de seguridad
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

---

## 📊 Monitoreo y Observabilidad

### Stack de Monitoreo (Preparado)

| Herramienta | Propósito |
|-------------|-----------|
| **Prometheus** | Recolección de métricas |
| **Grafana** | Visualización de métricas |
| **Elasticsearch** | Almacenamiento de logs |
| **Logstash** | Procesamiento de logs |
| **Kibana** | Visualización de logs |
| **AlertManager** | Gestión de alertas |

---

## 🧪 Testing

### Herramientas de Testing

| Herramienta | Tipo | Framework |
|-------------|------|-----------|
| **pytest** | Backend | Unit tests |
| **pytest-cov** | Backend | Cobertura |
| **httpx** | Backend | API testing |
| **Jest** | Frontend | Unit tests |
| **React Testing Library** | Frontend | Component tests |
| **Playwright** | E2E | End-to-end |

---

## 📝 Documentación

### Herramientas de Documentación

| Herramienta | Propósito |
|-------------|-----------|
| **MkDocs** | Generación de sitio |
| **Material for MkDocs** | Tema profesional |
| **Mermaid** | Diagramas |
| **Swagger UI** | Documentación de API |
| **ReDoc** | Alternativa a Swagger |

---

## 🎯 Comparación con Alternativas

### ¿Por qué estas tecnologías?

#### FastAPI vs Flask vs Django

| Característica | FastAPI | Flask | Django |
|----------------|---------|-------|--------|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Async support** | ✅ Nativo | ⚠️ Limitado | ⚠️ Limitado |
| **Docs automáticas** | ✅ | ❌ | ❌ |
| **Type hints** | ✅ | ❌ | ❌ |
| **Learning curve** | Media | Baja | Alta |
| **API-first** | ✅ | ⚠️ | ❌ |

**Decisión**: FastAPI por rendimiento, async nativo y docs automáticas.

#### React vs Vue vs Angular

| Característica | React | Vue | Angular |
|----------------|-------|-----|---------|
| **Popularidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning curve** | Media | Baja | Alta |
| **TypeScript** | ✅ | ✅ | ✅ Nativo |
| **Ecosistema** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flexibilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Decisión**: React por ecosistema, flexibilidad y experiencia del equipo.

---

## 🔗 Recursos Adicionales

### Documentación Oficial

- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **React**: [react.dev](https://react.dev)
- **SQLAlchemy**: [docs.sqlalchemy.org](https://docs.sqlalchemy.org)
- **Docker**: [docs.docker.com](https://docs.docker.com)
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)

### Tutoriales Recomendados

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [React Official Tutorial](https://react.dev/learn)
- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/20/orm/tutorial.html)
- [Docker Get Started](https://docs.docker.com/get-started/)

---

## 🚀 Próximos Pasos

- **[Guía de Inicio Rápido](inicio-rapido.md)**: Configura tu entorno de desarrollo
- **[Manual Técnico](../tecnico/index.md)**: Documentación técnica detallada
- **[Arquitectura](arquitectura.md)**: Vista general del sistema

---

**Última actualización**: 22 de Octubre, 2025  
**Versión**: 1.0
