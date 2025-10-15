# Guía de Desarrollo Local

## Configuración para Desarrollo Frontend Local

Esta configuración permite ejecutar el frontend de React localmente mientras los servicios backend (base de datos, API, cache) ejecutan en contenedores Docker.

### 🎯 Ventajas

- **Hot reload** instantáneo del frontend
- **Debug** completo en el navegador 
- **Desarrollo rápido** sin rebuilds de contenedores
- **Aislamiento** de servicios backend

### 📋 Puertos Configurados

| Servicio | Puerto Local | Puerto Interno | URL |
|----------|--------------|----------------|-----|
| Frontend (local) | 3000 | - | http://localhost:3000 |
| Backend API | 8001 | 8000 | http://localhost:8001 |
| Base de datos | 1434 | 1433 | localhost:1434 |
| Redis | 6380 | 6379 | localhost:6380 |
| Dozzle (logs) | 8081 | 8080 | http://localhost:8081 |

### 🚀 Inicio Rápido

#### Opción 1: Script automático
```bash
# Ejecutar el script que configura todo
./start-dev.sh
```

#### Opción 2: Manual

1. **Iniciar servicios backend:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Verificar que los servicios estén listos:**
```bash
# Verificar backend
curl http://localhost:8001/health

# Ver logs de servicios
docker-compose -f docker-compose.dev.yml logs -f
```

3. **Iniciar frontend localmente:**
```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

### 🔧 Variables de Entorno

El frontend local usa las variables definidas en `.env.development`:

```env
VITE_API_URL=http://localhost:8001/api/v1
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
VITE_BASE_URL=http://localhost:3000
```

### 🌐 Configuración CORS

El backend está configurado para aceptar requests desde:
- `http://localhost:3000` (frontend principal)
- `http://127.0.0.1:3000` (alternativo)
- `http://localhost:3001` (en caso de conflicto de puertos)

### 📊 Monitoreo

- **API Documentation:** http://localhost:8001/api/docs
- **Logs en tiempo real:** http://localhost:8081
- **Health Check:** http://localhost:8001/health

### 🛑 Detener Servicios

```bash
# Detener solo los contenedores
docker-compose -f docker-compose.dev.yml down

# Detener y limpiar volúmenes
docker-compose -f docker-compose.dev.yml down -v
```

### 🔍 Troubleshooting

#### Frontend no conecta con el backend:
- Verificar que el backend esté en http://localhost:8001
- Revisar variables de entorno en `.env.development`
- Comprobar logs de CORS en el backend

#### Conflictos de puertos:
- Verificar que los puertos 8001, 1434, 6380, 8081 estén libres
- Modificar puertos en `docker-compose.dev.yml` si es necesario

#### Problemas con la base de datos:
- Verificar logs: `docker-compose -f docker-compose.dev.yml logs sqlserver`
- Reiniciar servicios: `docker-compose -f docker-compose.dev.yml restart`

### 📝 Comandos Útiles

```bash
# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs backend

# Ejecutar comando en contenedor backend
docker-compose -f docker-compose.dev.yml exec backend bash

# Reiniciar solo el backend
docker-compose -f docker-compose.dev.yml restart backend

# Ver estado de servicios
docker-compose -f docker-compose.dev.yml ps

# Limpiar completamente
docker-compose -f docker-compose.dev.yml down -v --rmi local
```

### 🏗️ Arquitectura de Desarrollo

```
┌─────────────────┐    HTTP/3000     ┌─────────────────┐
│   Frontend      │ ────────────────▶│   Navegador     │
│   (npm run dev) │                  │   localhost:3000│
└─────────────────┘                  └─────────────────┘
         │
         │ API calls
         ▼
┌─────────────────┐    Docker Network ┌──────────────┐
│   Backend API   │◀─────────────────▶│   Redis      │
│   localhost:8001│                   │   :6380      │
└─────────────────┘                   └──────────────┘
         │
         ▼
┌─────────────────┐
│   SQL Server    │
│   localhost:1434│
└─────────────────┘
```