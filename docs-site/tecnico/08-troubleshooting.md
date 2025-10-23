# 8. Troubleshooting

Guía completa para diagnóstico y resolución de problemas comunes en el sistema.

---

## 8.1 Problemas de Deployment

### Container no Inicia

**Síntoma**: Container se detiene inmediatamente después de iniciarse

**Causas Comunes**:

1. **Puerto ya en uso**
```bash
# Verificar puertos
netstat -tulpn | grep :8000

# Solución: Cambiar puerto en docker-compose.yml o matar proceso
kill -9 $(lsof -t -i:8000)
```

2. **Variables de entorno faltantes**
```bash
# Ver logs del container
docker logs backend

# Error típico: KeyError: 'DATABASE_URL'
# Solución: Verificar .env
cat .env | grep DATABASE_URL

# Agregar si falta
echo "DATABASE_URL=mssql+pyodbc://..." >> .env
```

3. **Permisos incorrectos**
```bash
# Ver error de permisos
docker logs backend 2>&1 | grep "Permission denied"

# Solución: Ajustar permisos
chmod -R 755 ./uploads
chown -R 1000:1000 ./uploads
```

---

### Database Connection Failed

**Síntoma**: `sqlalchemy.exc.OperationalError: (pyodbc.OperationalError)`

**Diagnóstico**:

```bash
# 1. Verificar que SQL Server está listo
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $SA_PASSWORD \
    -Q "SELECT @@VERSION"

# 2. Verificar conectividad desde backend
docker exec backend ping sqlserver -c 3

# 3. Verificar credenciales
docker exec backend python -c "
from app.database import engine
try:
    engine.connect()
    print('✅ Conexión exitosa')
except Exception as e:
    print(f'❌ Error: {e}')
"
```

**Soluciones**:

```bash
# SQL Server no está listo (necesita ~30s)
# Agregar wait-for-it.sh o depends_on con healthcheck
services:
  backend:
    depends_on:
      sqlserver:
        condition: service_healthy

# Credenciales incorrectas
# Verificar en .env
DATABASE_URL=mssql+pyodbc://sa:YourPassword@sqlserver:1433/TramitesDB?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes

# TrustServerCertificate faltante
# Agregar al connection string
&TrustServerCertificate=yes
```

---

### Redis Connection Refused

**Síntoma**: `redis.exceptions.ConnectionError: Error connecting to Redis`

**Diagnóstico**:

```bash
# Verificar que Redis está corriendo
docker ps | grep redis

# Probar conexión
docker exec backend python -c "
import redis
r = redis.Redis(host='redis', port=6379, db=0)
print(r.ping())  # Debe retornar True
"

# Ver logs de Redis
docker logs redis
```

**Soluciones**:

```bash
# Redis no está en la misma red
# Verificar networks en docker-compose.yml
services:
  backend:
    networks: [app-network]
  redis:
    networks: [app-network]

# URL incorrecta
# En .env debe ser:
REDIS_URL=redis://redis:6379/0
# NO usar localhost
```

---

## 8.2 Problemas de Performance

### API Lenta

**Síntoma**: Endpoints tardan >2 segundos en responder

**Diagnóstico**:

```python
# 1. Instalar profiler
pip install pyinstrument

# 2. Agregar middleware de profiling
from pyinstrument import Profiler

@app.middleware("http")
async def profile_request(request: Request, call_next):
    if request.query_params.get("profile"):
        profiler = Profiler()
        profiler.start()
        
        response = await call_next(request)
        
        profiler.stop()
        return HTMLResponse(profiler.output_html())
    
    return await call_next(request)

# 3. Hacer request con ?profile=1
curl http://localhost:8000/api/tramites?profile=1
```

**Problemas Comunes**:

1. **N+1 Query Problem**
```python
# ❌ MALO: N+1 queries
tramites = db.query(Tramite).all()  # 1 query
for t in tramites:
    print(t.tipo_tramite.nombre)  # N queries adicionales

# ✅ BUENO: Eager loading
from sqlalchemy.orm import joinedload

tramites = db.query(Tramite)\
    .options(joinedload(Tramite.tipo_tramite))\
    .all()  # 1 query con JOIN
```

2. **Falta de Índices**
```sql
-- Ver queries lentas
SELECT TOP 10
    SUBSTRING(qt.TEXT, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.TEXT)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text,
    qs.execution_count,
    qs.total_elapsed_time / 1000000.0 AS total_elapsed_time_sec,
    qs.total_worker_time / 1000000.0 AS total_cpu_time_sec
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY qs.total_elapsed_time DESC;

-- Agregar índices recomendados
CREATE INDEX IX_Tramites_FechaCreacion 
ON Tramites(FechaCreacion DESC);
```

3. **Sin Caché**
```python
# Implementar Redis cache
from functools import wraps
import redis
import json

redis_client = redis.Redis(host='redis', port=6379, db=0)

def cache(ttl=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Buscar en cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Ejecutar función
            result = await func(*args, **kwargs)
            
            # Guardar en cache
            redis_client.setex(
                cache_key,
                ttl,
                json.dumps(result)
            )
            
            return result
        return wrapper
    return decorator

@app.get("/tipos-tramite")
@cache(ttl=600)  # Cache por 10 minutos
async def get_tipos_tramite(db: Session = Depends(get_db)):
    return db.query(TipoTramite).all()
```

4. **Paginación faltante**
```python
# ✅ Agregar paginación a listas grandes
@app.get("/tramites")
async def list_tramites(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    total = db.query(Tramite).count()
    tramites = db.query(Tramite)\
        .offset(skip)\
        .limit(min(limit, 100))\
        .all()
    
    return {
        "total": total,
        "items": tramites,
        "skip": skip,
        "limit": limit
    }
```

---

### Base de Datos Lenta

**Diagnóstico SQL Server**:

```sql
-- 1. Ver wait stats
SELECT TOP 10
    wait_type,
    wait_time_ms / 1000.0 AS wait_time_sec,
    waiting_tasks_count,
    signal_wait_time_ms / 1000.0 AS signal_wait_time_sec
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE',
    'SLEEP_TASK', 'SLEEP_SYSTEMTASK', 'SQLTRACE_BUFFER_FLUSH',
    'WAITFOR', 'LOGMGR_QUEUE', 'CHECKPOINT_QUEUE'
)
ORDER BY wait_time_ms DESC;

-- 2. Ver bloqueos actuales
SELECT
    blocking_session_id,
    session_id,
    wait_type,
    wait_time,
    wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id != 0;

-- 3. Ver fragmentación de índices
SELECT
    OBJECT_NAME(ps.OBJECT_ID) AS TableName,
    i.name AS IndexName,
    ps.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON ps.OBJECT_ID = i.OBJECT_ID 
    AND ps.index_id = i.index_id
WHERE ps.avg_fragmentation_in_percent > 30
ORDER BY ps.avg_fragmentation_in_percent DESC;
```

**Soluciones**:

```sql
-- 1. Reorganizar índices fragmentados
ALTER INDEX ALL ON Tramites REORGANIZE;

-- 2. Reconstruir índices muy fragmentados (>30%)
ALTER INDEX ALL ON Tramites REBUILD WITH (ONLINE = OFF);

-- 3. Actualizar estadísticas
UPDATE STATISTICS Tramites WITH FULLSCAN;

-- 4. Matar sesión bloqueante (cuidado!)
KILL 52;  -- ID de la sesión bloqueante

-- 5. Aumentar recursos
-- En docker-compose.yml:
services:
  sqlserver:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
```

---

## 8.3 Problemas de Datos

### Constraint Violation

**Error**: `The INSERT statement conflicted with the FOREIGN KEY constraint`

**Solución**:

```python
# Validar FK antes de insertar
def create_tramite(tramite: TramiteCreate, db: Session):
    # Verificar que tipo_tramite existe
    tipo = db.query(TipoTramite).filter(
        TipoTramite.id == tramite.tipo_tramite_id
    ).first()
    
    if not tipo:
        raise HTTPException(
            status_code=400,
            detail=f"TipoTramite {tramite.tipo_tramite_id} no existe"
        )
    
    # Ahora sí insertar
    nuevo = Tramite(**tramite.dict())
    db.add(nuevo)
    db.commit()
```

**Usar Cascadas**:

```sql
-- Agregar CASCADE a FK
ALTER TABLE Tramites
DROP CONSTRAINT FK_Tramites_TipoTramite;

ALTER TABLE Tramites
ADD CONSTRAINT FK_Tramites_TipoTramite
FOREIGN KEY (TipoTramiteId)
REFERENCES TiposTramite(Id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

---

### Duplicate Key Error

**Error**: `Cannot insert duplicate key`

**Solución**:

```python
# Verificar existencia antes de insertar
def create_tipo_tramite(tipo: TipoTramiteCreate, db: Session):
    # Buscar duplicado
    existe = db.query(TipoTramite).filter(
        TipoTramite.nombre == tipo.nombre
    ).first()
    
    if existe:
        raise HTTPException(
            status_code=409,
            detail="Tipo de trámite ya existe"
        )
    
    nuevo = TipoTramite(**tipo.dict())
    db.add(nuevo)
    db.commit()
    return nuevo

# O usar UPSERT (INSERT o UPDATE)
from sqlalchemy.dialects.mssql import insert

stmt = insert(TipoTramite).values(**tipo.dict())
stmt = stmt.on_conflict_do_update(
    index_elements=['nombre'],
    set_={'descripcion': tipo.descripcion}
)
db.execute(stmt)
db.commit()

# En SQL Server usar MERGE
MERGE TiposTramite AS target
USING (SELECT @nombre, @descripcion) AS source (Nombre, Descripcion)
ON target.Nombre = source.Nombre
WHEN MATCHED THEN
    UPDATE SET Descripcion = source.Descripcion
WHEN NOT MATCHED THEN
    INSERT (Nombre, Descripcion) VALUES (source.Nombre, source.Descripcion);
```

---

## 8.4 Problemas de Docker

### No Space Left on Device

**Diagnóstico**:

```bash
# Ver uso de disco
docker system df

# Output ejemplo:
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          15        5         5.5GB     3.2GB (58%)
# Containers      10        3         1.2GB     800MB (66%)
# Local Volumes   8         3         2.1GB     1.5GB (71%)
# Build Cache     20        0         3.8GB     3.8GB (100%)
```

**Solución**:

```bash
# Limpiar todo lo no usado
docker system prune -a --volumes -f

# O paso a paso:
docker container prune -f  # Containers detenidos
docker image prune -a -f   # Imágenes sin usar
docker volume prune -f     # Volumes sin usar
docker builder prune -f    # Build cache

# Automático con cron (diario 2 AM)
echo "0 2 * * * docker system prune -f" | crontab -
```

---

### Container Exits Immediately

**Diagnóstico**:

```bash
# Ver logs completos
docker logs --tail 100 backend

# Ver comando que se ejecutó
docker inspect backend | grep -A 5 "Cmd"

# Ver exit code
docker inspect backend | grep "ExitCode"
```

**Causas Comunes**:

1. **CMD incorrecto en Dockerfile**
```dockerfile
# ❌ MALO: Se sale inmediatamente
CMD ["echo", "Starting app"]

# ✅ BUENO: Proceso de larga duración
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Dependencias faltantes**
```bash
# Ver error de import
docker logs backend 2>&1 | grep "ModuleNotFoundError"

# Reinstalar dependencias
docker exec backend pip install -r requirements.txt
```

---

## 8.5 Problemas de Red

### Cannot Connect to Backend from Frontend

**Diagnóstico**:

```bash
# Verificar que ambos están en la misma red
docker network inspect tramites-network

# Verificar desde frontend
docker exec frontend curl http://backend:8000/health
```

**Solución**:

```javascript
// ❌ MALO: Usar localhost
const API_URL = 'http://localhost:8000';

// ✅ BUENO: Usar nombre del servicio (desde container)
const API_URL = 'http://backend:8000';

// ✅ BUENO: Usar variable de entorno (producción)
const API_URL = process.env.REACT_APP_API_URL || 'http://backend:8000';
```

---

## 8.6 Comandos Útiles de Debugging

### Docker

```bash
# Ver todos los containers (incluso detenidos)
docker ps -a

# Ver logs en tiempo real
docker logs -f backend

# Ver últimas 100 líneas
docker logs --tail 100 backend

# Ejecutar comando dentro del container
docker exec -it backend bash

# Ver recursos usados por containers
docker stats

# Reiniciar container
docker restart backend

# Ver configuración completa del container
docker inspect backend

# Ver redes
docker network ls
docker network inspect tramites-network
```

### Database

```bash
# Conectar a SQL Server
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P YourPassword

# Backup manual
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P YourPassword \
    -Q "BACKUP DATABASE TramitesDB TO DISK = '/var/opt/mssql/backup/tramites.bak'"

# Restore
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P YourPassword \
    -Q "RESTORE DATABASE TramitesDB FROM DISK = '/var/opt/mssql/backup/tramites.bak' WITH REPLACE"

# Ver conexiones activas
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P YourPassword \
    -Q "SELECT session_id, login_name, host_name, program_name, status FROM sys.dm_exec_sessions WHERE is_user_process = 1"
```

### Redis

```bash
# Conectar a Redis CLI
docker exec -it redis redis-cli

# Ver todas las keys
KEYS *

# Ver valor de una key
GET tramite:123

# Ver info del servidor
INFO

# Ver memoria usada
INFO memory

# Limpiar toda la DB (cuidado!)
FLUSHALL

# Ver hits/misses del cache
INFO stats | grep hits
```

### Python/FastAPI

```bash
# Ejecutar tests
docker exec backend pytest

# Ver coverage
docker exec backend pytest --cov=app --cov-report=html

# Ejecutar script Python
docker exec backend python scripts/check_database.py

# Instalar paquete nuevo
docker exec backend pip install package-name

# Ver paquetes instalados
docker exec backend pip list

# Ver variables de entorno
docker exec backend env | grep DATABASE
```

### Logs

```bash
# Buscar errores en logs
docker logs backend 2>&1 | grep -i error

# Buscar por request_id
docker logs backend 2>&1 | grep "abc-123-def"

# Ver solo errores de hoy
docker logs --since 2024-01-20 backend 2>&1 | grep ERROR

# Guardar logs a archivo
docker logs backend > backend_logs.txt 2>&1
```

---

## 8.7 Checklist de Diagnóstico

Cuando algo no funciona, seguir este proceso sistemático:

### 1. Verificar Estado General
```bash
☐ docker ps -a  # ¿Todos los containers están UP?
☐ docker logs backend --tail 50  # ¿Hay errores obvios?
☐ curl http://localhost:8000/health  # ¿API responde?
```

### 2. Verificar Conectividad
```bash
☐ docker network inspect tramites-network  # ¿Todos en misma red?
☐ docker exec backend ping sqlserver  # ¿Backend alcanza DB?
☐ docker exec backend ping redis  # ¿Backend alcanza Redis?
```

### 3. Verificar Servicios
```bash
☐ docker exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "SELECT 1"
☐ docker exec redis redis-cli PING
☐ curl http://localhost:8000/docs  # Swagger UI
```

### 4. Verificar Configuración
```bash
☐ cat .env | grep DATABASE_URL  # ¿Variables correctas?
☐ docker exec backend env | grep DATABASE  # ¿Variables cargadas?
☐ docker inspect backend | grep -A 10 Env  # ¿Env en container?
```

### 5. Verificar Datos
```bash
☐ docker exec sqlserver sqlcmd -Q "SELECT name FROM sys.databases"
☐ docker exec sqlserver sqlcmd -Q "SELECT COUNT(*) FROM TramitesDB.dbo.Tramites"
☐ docker exec redis redis-cli DBSIZE
```

### 6. Verificar Recursos
```bash
☐ docker stats --no-stream  # ¿CPU/RAM altos?
☐ df -h  # ¿Espacio en disco?
☐ free -h  # ¿Memoria disponible?
```

### 7. Verificar Logs Detallados
```bash
☐ docker logs backend 2>&1 | grep -i "error\|exception\|failed"
☐ docker logs sqlserver 2>&1 | tail -50
☐ docker logs nginx 2>&1 | grep " 5"  # Errores 500
```

### 8. Verificar Código
```bash
☐ docker exec backend python -m pytest tests/  # ¿Tests pasan?
☐ docker exec backend python -c "from app.database import engine; engine.connect()"
☐ docker exec backend python -c "import redis; redis.Redis(host='redis').ping()"
```

### 9. Reiniciar Servicios
```bash
☐ docker restart backend
☐ docker-compose restart
☐ docker-compose down && docker-compose up -d
```

### 10. Último Recurso
```bash
☐ docker-compose down -v  # Eliminar volumes (¡cuidado con datos!)
☐ docker system prune -a  # Limpiar todo
☐ docker-compose up --build  # Reconstruir desde cero
```

---

## Navegación

[← Monitoreo](07-monitoreo.md) | [Manual Técnico](index.md) | [Mantenimiento →](09-mantenimiento.md)
