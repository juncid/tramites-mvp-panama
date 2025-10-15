# 📊 Sistema de Observabilidad

## Índice

1. [Introducción](#introducción)
2. [Componentes](#componentes)
3. [Dozzle - Visualización de Logs](#dozzle---visualización-de-logs)
4. [Sistema de Métricas](#sistema-de-métricas)
5. [Monitor de Logs y Alertas](#monitor-de-logs-y-alertas)
6. [Uso y Ejemplos](#uso-y-ejemplos)
7. [Troubleshooting](#troubleshooting)

---

## Introducción

El sistema de observabilidad implementado en **Fase 1** es una solución **ligera y eficiente** que resuelve las limitaciones típicas de herramientas básicas sin requerir infraestructura pesada como Grafana Stack completo.

### ¿Qué resuelve?

✅ **Visualización de logs en tiempo real** (Dozzle)  
✅ **Persistencia histórica** (Rotación de logs con retention)  
✅ **Métricas de aplicación** (Redis-based metrics)  
✅ **Alertas automáticas** (Monitor de errores)  
✅ **Análisis de performance** (Timing de requests)

### Recursos utilizados

- **Dozzle**: ~50MB RAM
- **Redis**: ~10MB RAM (ya existente)
- **Monitor de logs**: ~30MB RAM (solo si se activa)
- **Total adicional**: ~80MB RAM

---

## Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                  SISTEMA DE OBSERVABILIDAD                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   DOZZLE    │    │   MÉTRICAS   │    │   MONITOR    │  │
│  │  (Logs UI)  │    │    (Redis)   │    │  (Alertas)   │  │
│  └──────┬──────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                  │                   │           │
│         │                  │                   │           │
│  ┌──────┴──────────────────┴───────────────────┴───────┐  │
│  │                Docker Container Logs                 │  │
│  │  (Backend, Frontend, DB, Redis, db-migrations)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Dozzle - Visualización de Logs

### Descripción

**Dozzle** es un visor de logs de Docker en tiempo real con interfaz web moderna.

### Características

- ✅ Interfaz web responsive
- ✅ Múltiples contenedores simultáneos
- ✅ Búsqueda en logs
- ✅ Filtrado por contenedor
- ✅ Streaming en tiempo real
- ✅ Exportar logs
- ✅ Soporte para colores ANSI

### Acceso

```
URL: http://localhost:8080
```

### Uso

1. **Ver logs de un contenedor:**
   - Abrir http://localhost:8080
   - Seleccionar contenedor del menú lateral
   - Los logs se actualizan en tiempo real

2. **Buscar en logs:**
   - Usar la barra de búsqueda superior
   - Soporta búsqueda de texto simple

3. **Ver múltiples contenedores:**
   - Hacer clic en "Split View"
   - Seleccionar hasta 4 contenedores simultáneamente

4. **Exportar logs:**
   - Click en "Download" (icono de descarga)
   - Se descarga archivo `.log`

### Configuración

En `docker-compose.yml`:

```yaml
dozzle:
  image: amir20/dozzle:latest
  container_name: tramites-dozzle
  ports:
    - "8080:8080"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  environment:
    - DOZZLE_LEVEL=info
    - DOZZLE_TAILSIZE=300        # Líneas a mostrar inicialmente
    - DOZZLE_FILTER=name=tramites-*  # Solo contenedores tramites-*
    - DOZZLE_NO_ANALYTICS=true   # Deshabilitar analytics
```

---

## Sistema de Métricas

### Descripción

Sistema de métricas ligero basado en **Redis** que recolecta:
- **Contadores**: Total de requests, errores, etc.
- **Gauges**: Valores instantáneos (users activos, etc.)
- **Timings**: Duración de operaciones

### Endpoints

#### 1. Ver todas las métricas

```bash
GET http://localhost:8000/metrics
```

**Respuesta:**
```json
{
  "timestamp": "2025-10-13T10:30:00",
  "service": "tramites-api",
  "version": "1.0.0",
  "metrics": {
    "counters": {
      "http_requests_total{method=GET,endpoint=/api/v1/tramites,status=200}": 150,
      "http_requests_total{method=POST,endpoint=/api/v1/ppsh/solicitudes,status=201}": 45,
      "http_errors_total{method=GET,status=404}": 3
    },
    "gauges": {
      "active_users": {
        "value": 12,
        "timestamp": "2025-10-13T10:29:55"
      }
    }
  }
}
```

#### 2. Ver métrica específica

```bash
GET http://localhost:8000/metrics/http_requests_total
```

**Respuesta:**
```json
{
  "metric": "http_requests_total",
  "type": "counter",
  "value": 195,
  "timestamp": "2025-10-13T10:30:00"
}
```

#### 3. Ver estadísticas de timing

```bash
GET http://localhost:8000/metrics/http_request_duration_ms
```

**Respuesta:**
```json
{
  "metric": "http_request_duration_ms",
  "type": "timing",
  "stats": {
    "count": 195,
    "min": 5.2,
    "max": 450.8,
    "avg": 85.3,
    "sum": 16633.5,
    "last_value": 92.1,
    "last_update": "2025-10-13T10:29:59"
  }
}
```

### Uso en Código

El middleware `LoggerMiddleware` ya recolecta métricas automáticamente:

```python
# Métricas recolectadas automáticamente:
# - http_requests_total (por método, endpoint, status)
# - http_request_duration_ms (por método, endpoint)
# - http_errors_total (por método, status)
# - http_exceptions_total (por método, endpoint, exception)
```

#### Agregar métricas custom

```python
from app.metrics import get_metrics

# En cualquier función
def mi_funcion():
    metrics = get_metrics()
    
    if metrics:
        # Incrementar contador
        metrics.increment("mi_operacion_total", tags={"tipo": "procesamiento"})
        
        # Establecer gauge
        metrics.gauge("usuarios_activos", 15)
        
        # Registrar timing
        metrics.timing("db_query_duration_ms", 45.2, tags={"tabla": "usuarios"})
```

#### Decorador de timing

```python
from app.metrics import timer

@timer("db_query", tags={"table": "tramites"})
async def get_tramites():
    # La duración se mide automáticamente
    return await db.query(Tramite).all()
```

---

## Monitor de Logs y Alertas

### Descripción

Script Python que monitorea archivos de log y detecta errores automáticamente.

### Características

- ✅ Escaneo periódico de logs
- ✅ Detección de patrones de error
- ✅ Tracking en Redis
- ✅ Alertas por umbrales
- ✅ Estadísticas acumuladas

### Ejecución

#### Modo continuo (recomendado)

```bash
docker exec tramites-backend python /app/monitor_logs.py
```

#### Ejecución única (para cron)

```bash
docker exec tramites-backend python /app/monitor_logs.py once
```

#### Ver estadísticas

```bash
docker exec tramites-backend python /app/monitor_logs.py stats
```

### Configuración

Variables de entorno en `docker-compose.yml`:

```yaml
backend:
  environment:
    - LOG_DIR=/app/logs
    - MONITOR_INTERVAL=300       # 5 minutos
    - MONITOR_THRESHOLD=10       # Alertar si > 10 errores
```

### Patrones detectados

El monitor busca automáticamente:

| Patrón | Tipo | Descripción |
|--------|------|-------------|
| `ERROR` | error | Errores generales |
| `CRITICAL` | critical | Errores críticos |
| `Exception` | exception | Excepciones Python |
| `Traceback` | traceback | Stack traces |
| `Failed to connect` | connection_error | Errores de conexión |
| `500 Internal Server Error` | http_500 | Errores HTTP 500 |
| `Database connection failed` | db_error | Errores de BD |
| `Redis connection failed` | redis_error | Errores de Redis |

### Alertas

Cuando se supera el umbral:

```
════════════════════════════════════════════════════════════
🚨 ALERTAS DETECTADAS
════════════════════════════════════════════════════════════
⚠️  ALERTA: 15 errores detectados en los últimos 300s (umbral: 10)
🚨 CRÍTICO: 3 errores de tipo 'db_error'

Detalles de errores:

DB_ERROR (3):
  - [app.log] 2025-10-13 10:25:30 - ERROR - Connection timeout to database
  - [app.log] 2025-10-13 10:26:15 - ERROR - Database query failed: timeout
  - [app.log] 2025-10-13 10:27:45 - CRITICAL - Cannot connect to database

════════════════════════════════════════════════════════════
```

### Datos en Redis

El monitor guarda en Redis:

```
Keys:
  monitor:errors:<tipo>              # Lista de últimos 100 errores por tipo
  monitor:error_counts               # Hash con contadores acumulados
  monitor:errors:timeseries:<tipo>   # Serie temporal para gráficos
  monitor:alerts                     # Lista de últimas 100 alertas
  monitor:last_check                 # Timestamp de última verificación
```

---

## Uso y Ejemplos

### Flujo típico de debugging

**1. Ver logs en tiempo real (Dozzle)**

```
1. Abrir http://localhost:8080
2. Seleccionar contenedor "tramites-backend"
3. Ver logs en tiempo real
4. Buscar "ERROR" o "Exception"
```

**2. Revisar métricas**

```bash
# Ver todas las métricas
curl http://localhost:8000/metrics

# Ver requests HTTP
curl http://localhost:8000/metrics/http_requests_total

# Ver timing promedio
curl http://localhost:8000/metrics/http_request_duration_ms
```

**3. Ejecutar monitor de logs (si sospechas errores)**

```bash
# Escaneo único
docker exec tramites-backend python /app/monitor_logs.py once

# Ver estadísticas acumuladas
docker exec tramites-backend python /app/monitor_logs.py stats
```

**4. Analizar resultados**

```bash
# Conectar a Redis
docker exec -it tramites-redis redis-cli

# Ver contadores de error
> HGETALL monitor:error_counts

# Ver últimos errores críticos
> LRANGE monitor:errors:critical 0 9

# Ver últimas alertas
> LRANGE monitor:alerts 0 4
```

### Monitoreo de performance

```bash
# 1. Hacer requests a tu API
curl http://localhost:8000/api/v1/tramites

# 2. Ver métricas de timing
curl http://localhost:8000/metrics/http_request_duration_ms

# 3. Analizar en logs
# Buscar "Tiempo:" en Dozzle para ver requests lentos
```

### Rotación de logs

Los logs se rotan automáticamente:

```yaml
# Configuración por servicio
logging:
  driver: "json-file"
  options:
    max-size: "10m"    # Tamaño máximo por archivo
    max-file: "5"      # Número de archivos a mantener
    # Total: 50MB de logs históricos
```

**Ver logs rotados:**

```bash
# Ver ubicación de logs
docker inspect tramites-backend | grep LogPath

# Ver tamaño de logs
docker ps -a --format "table {{.Names}}\t{{.Size}}"
```

---

## Troubleshooting

### Problema: Dozzle no muestra logs

**Síntomas:**
- Dozzle carga pero no aparecen contenedores
- Página en blanco

**Solución:**

```bash
# 1. Verificar que Dozzle esté corriendo
docker ps | grep dozzle

# 2. Ver logs de Dozzle
docker logs tramites-dozzle

# 3. Verificar permisos de Docker socket
# En Linux/WSL:
ls -la /var/run/docker.sock

# 4. Reiniciar Dozzle
docker restart tramites-dozzle
```

---

### Problema: Métricas no se recolectan

**Síntomas:**
- `/metrics` retorna datos vacíos
- No aparecen contadores

**Solución:**

```bash
# 1. Verificar que Redis esté corriendo
docker ps | grep redis

# 2. Verificar inicialización de métricas en logs
docker logs tramites-backend | grep "métricas"

# 3. Verificar manualmente en Redis
docker exec -it tramites-redis redis-cli
> KEYS metrics:*
> HGETALL metrics:counters

# 4. Hacer requests de prueba
curl http://localhost:8000/health

# 5. Verificar métricas nuevamente
curl http://localhost:8000/metrics
```

---

### Problema: Monitor de logs no encuentra errores

**Síntomas:**
- Monitor dice "No se detectaron errores" pero existen
- Archivos de log vacíos

**Solución:**

```bash
# 1. Verificar que logs se estén escribiendo
docker exec tramites-backend ls -la /app/logs/

# 2. Ver contenido de logs
docker exec tramites-backend cat /app/logs/app.log

# 3. Ejecutar monitor en modo debug
docker exec tramites-backend python -c "
from monitor_logs import LogMonitor
monitor = LogMonitor(log_dir='/app/logs')
errors = monitor.scan_logs()
print(f'Errores encontrados: {len(errors)}')
for error_type, error_list in errors.items():
    print(f'{error_type}: {len(error_list)}')
"
```

---

### Problema: Logs ocupan mucho espacio

**Síntomas:**
- Disco lleno
- Logs de varios GB

**Solución:**

```bash
# 1. Ver tamaño de logs por contenedor
docker ps -a --format "table {{.Names}}\t{{.Size}}"

# 2. Limpiar logs de un contenedor específico
echo "" > $(docker inspect --format='{{.LogPath}}' tramites-backend)

# 3. Limpiar logs de todos los contenedores
docker-compose down
docker system prune -a --volumes

# 4. Reducir retention en docker-compose.yml
# Cambiar max-file de 5 a 3
# Cambiar max-size de 10m a 5m

# 5. Reiniciar servicios
docker-compose up -d
```

---

## Próximos Pasos (Fase 2)

Cuando el proyecto crezca, considerar:

### Fase 2: Stack Intermedio

1. **Prometheus + cAdvisor**
   - Métricas de sistema (CPU, RAM, disco)
   - Métricas de contenedores
   - Integración con Grafana

2. **Alertmanager**
   - Alertas por email/Slack
   - Reglas de alertas configurables
   - Deduplicación de alertas

3. **Grafana**
   - Dashboards visuales
   - Gráficos históricos
   - Correlación de métricas

### Fase 3: Producción

1. **Loki + Promtail**
   - Logs centralizados con persistencia
   - Búsqueda avanzada (LogQL)
   - Retención configurable

2. **Backup automático**
   - Logs a S3/Azure Blob
   - Retención de 30-90 días
   - Compresión automática

3. **Distributed tracing**
   - Jaeger o Zipkin
   - Trace de requests entre servicios
   - Análisis de latencia

---

## Referencias

- **Dozzle**: https://dozzle.dev/
- **Redis Metrics**: Documentación interna en `backend/app/metrics.py`
- **Monitor de Logs**: Documentación en `backend/monitor_logs.py`
- **Docker Logging**: https://docs.docker.com/config/containers/logging/

---

## Soporte

Para problemas o preguntas:

1. Revisar logs en Dozzle: http://localhost:8080
2. Ver métricas: http://localhost:8000/metrics
3. Ejecutar health check: http://localhost:8000/health
4. Consultar esta documentación

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0 (Fase 1)
