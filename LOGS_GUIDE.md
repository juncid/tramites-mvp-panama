# 📊 Guía de Monitoreo de Logs - Sistema PPSH
**Sistema de Trámites Migratorios de Panamá**

---

## 🎯 Ubicaciones de Logs

### 1. **Logs en Consola Docker** (Recomendado)
Los logs se escriben a STDOUT/STDERR y Docker los captura automáticamente.

### 2. **Archivo de Logs Interno**
Ubicación: `/app/logs/app.log` (dentro del contenedor)

---

## 🔴 Comandos para Ver Logs en Tiempo Real

### Ver logs del backend siguiendo en tiempo real
```powershell
docker-compose logs -f backend
```

### Ver logs de todos los servicios
```powershell
docker-compose logs -f
```

### Ver logs con timestamp
```powershell
docker-compose logs -f -t backend
```

### Ver logs de SQL Server
```powershell
docker-compose logs -f sqlserver
```

---

## 📋 Ver Historial de Logs

### Últimas N líneas
```powershell
# Últimas 50 líneas
docker-compose logs backend --tail=50

# Últimas 100 líneas
docker-compose logs backend --tail=100

# Últimas 200 líneas con timestamp
docker-compose logs backend --tail=200 -t
```

### Desde una fecha específica
```powershell
# Logs desde hace 1 hora
docker-compose logs backend --since 1h

# Logs desde hace 30 minutos
docker-compose logs backend --since 30m

# Logs de las últimas 24 horas
docker-compose logs backend --since 24h
```

---

## 🔍 Filtrar Logs por Contenido

### Buscar palabras específicas
```powershell
# Buscar logs relacionados con PPSH
docker-compose logs backend | Select-String "ppsh"
docker-compose logs backend | Select-String "PPSH"

# Buscar errores
docker-compose logs backend | Select-String "ERROR"

# Buscar warnings
docker-compose logs backend | Select-String "WARNING"

# Buscar logs de INFO
docker-compose logs backend | Select-String "INFO"
```

### Buscar operaciones específicas
```powershell
# Solicitudes creadas
docker-compose logs backend | Select-String "Creando solicitud"
docker-compose logs backend | Select-String "creada exitosamente"

# Cambios de estado
docker-compose logs backend | Select-String "Cambiando estado"
docker-compose logs backend | Select-String "Estado actualizado"

# Asignaciones
docker-compose logs backend | Select-String "Asignando solicitud"

# Documentos
docker-compose logs backend | Select-String "Registrando documento"
docker-compose logs backend | Select-String "Verificando documento"

# Entrevistas
docker-compose logs backend | Select-String "Programando entrevista"
docker-compose logs backend | Select-String "resultado de entrevista"
```

### Buscar por código de estado HTTP
```powershell
# Errores 404
docker-compose logs backend | Select-String "Status: 404"

# Errores 500
docker-compose logs backend | Select-String "Status: 500"

# Errores 400
docker-compose logs backend | Select-String "Status: 400"

# Éxitos 200
docker-compose logs backend | Select-String "Status: 200"

# Creaciones 201
docker-compose logs backend | Select-String "Status: 201"
```

---

## 📁 Acceder al Archivo de Logs Interno

### Ver el archivo completo
```powershell
docker exec tramites-backend cat /app/logs/app.log
```

### Ver últimas líneas (como tail)
```powershell
# Últimas 50 líneas
docker exec tramites-backend tail -n 50 /app/logs/app.log

# Últimas 100 líneas
docker exec tramites-backend tail -n 100 /app/logs/app.log

# Seguir en tiempo real (como tail -f)
docker exec tramites-backend tail -f /app/logs/app.log
```

### Buscar en el archivo
```powershell
# Buscar "error" en el archivo
docker exec tramites-backend grep -i "error" /app/logs/app.log

# Buscar solicitudes
docker exec tramites-backend grep "solicitud" /app/logs/app.log

# Contar líneas de error
docker exec tramites-backend grep -c "ERROR" /app/logs/app.log
```

### Copiar archivo de logs a tu máquina
```powershell
docker cp tramites-backend:/app/logs/app.log ./backend/logs/app.log
```

---

## 📊 Tipos de Logs que Verás

### 1. Logs del Middleware HTTP
```
➡️  [1760367762.8928742] GET /api/v1/ppsh/solicitudes - Cliente: 172.20.0.1
✅ [1760367762.8928742] GET /api/v1/ppsh/solicitudes - Status: 200 - Tiempo: 0.125s - Cliente: 172.20.0.1
⚠️  [1760367762.8928742] GET /api/v1/ppsh/solicitudes/999 - Status: 404 - Tiempo: 0.050s - Cliente: 172.20.0.1
❌ [1760367762.8928742] POST /api/v1/ppsh/solicitudes - Status: 500 - Tiempo: 0.200s - Cliente: 172.20.0.1
```

**Significado:**
- `➡️` = Petición entrante
- `✅` = Respuesta exitosa (2xx)
- `⚠️` = Respuesta con warning (4xx)
- `❌` = Error del servidor (5xx)

### 2. Logs de Servicios PPSH
```
INFO - Creando solicitud PPSH por usuario USR001
INFO - Solicitud PPSH-2024-000015 creada exitosamente
INFO - Asignando solicitud PPSH-2024-000015 a USR002
INFO - Cambiando estado de solicitud PPSH-2024-000015 de RECEPCION a ANALISIS_TECNICO
INFO - Estado actualizado exitosamente
INFO - Programando entrevista para solicitud PPSH-2024-000015
ERROR - Error creando solicitud: Causa humanitaria 999 no existe o está inactiva
```

### 3. Logs de SQLAlchemy (Base de Datos)
```
INFO - BEGIN (implicit)
INFO - SELECT COUNT(*) FROM PPSH_SOLICITUDES WHERE ACTIVO = 1
INFO - [generated in 0.00123s] ()
INFO - COMMIT
INFO - ROLLBACK
```

### 4. Logs de Startup/Shutdown
```
INFO - ============================================================
INFO -   🚀 INICIANDO APLICACIÓN
INFO - ============================================================
INFO -   Ambiente: development
INFO -   Base de datos: SIM_PANAMA
INFO -   Host BD: sqlserver:1433
INFO - ✅ Módulo PPSH registrado en /api/v1/ppsh
INFO - 🚀 Aplicación FastAPI inicializada
```

---

## 🎨 Niveles de Log

### DEBUG
Información muy detallada, útil para desarrollo.
```powershell
# No está habilitado por defecto
# Para habilitar, cambiar LOG_LEVEL=DEBUG en docker-compose.yml
```

### INFO
Información general de operaciones.
```
INFO - Solicitud PPSH-2024-000015 creada exitosamente
INFO - ✅ [request_id] GET /endpoint - Status: 200
```

### WARNING
Advertencias que no detienen la ejecución.
```
WARNING - ⚠️  [request_id] GET /endpoint - Status: 404
WARNING - Módulo PPSH no disponible
```

### ERROR
Errores que impiden completar una operación.
```
ERROR - ❌ Error creando solicitud: <detalle>
ERROR - ❌ Error conectando a BD en health check
```

### CRITICAL
Errores graves que pueden detener la aplicación.
```
CRITICAL - Base de datos no disponible
```

---

## 🔧 Comandos Útiles de Monitoreo

### Ver logs en vivo con filtro de nivel
```powershell
# Solo errores
docker-compose logs -f backend | Select-String "ERROR"

# Errores y warnings
docker-compose logs -f backend | Select-String "ERROR|WARNING"

# Solo INFO
docker-compose logs -f backend | Select-String "INFO" | Select-String -NotMatch "sqlalchemy"
```

### Ver estadísticas de logs
```powershell
# Contar total de líneas
docker-compose logs backend | Measure-Object -Line

# Contar errores
docker-compose logs backend | Select-String "ERROR" | Measure-Object -Line

# Contar warnings
docker-compose logs backend | Select-String "WARNING" | Measure-Object -Line

# Contar solicitudes creadas
docker-compose logs backend | Select-String "creada exitosamente" | Measure-Object -Line
```

### Exportar logs a archivo
```powershell
# Exportar todos los logs
docker-compose logs backend > logs_backend.txt

# Exportar solo errores
docker-compose logs backend | Select-String "ERROR" > logs_errores.txt

# Exportar con fecha en el nombre
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
docker-compose logs backend > "logs_backend_$fecha.txt"
```

---

## 📈 Monitoreo de Operaciones PPSH

### Seguimiento de una solicitud específica
```powershell
# Reemplazar NUM_EXPEDIENTE con el número real
docker-compose logs backend | Select-String "PPSH-2024-000015"
```

### Ver todas las operaciones de un usuario
```powershell
docker-compose logs backend | Select-String "usuario USR001"
```

### Ver actividad reciente
```powershell
# Últimos 20 requests HTTP
docker-compose logs backend --tail=100 | Select-String "➡️"

# Últimas 20 operaciones completadas
docker-compose logs backend --tail=100 | Select-String "✅"
```

### Monitor de performance
```powershell
# Ver tiempos de respuesta mayores a 1 segundo
docker-compose logs backend | Select-String "Tiempo: [1-9]\." | Select-String "✅"
```

---

## 🔥 Debugging en Tiempo Real

### Panel de monitoreo en consola
```powershell
# Ejecutar en una ventana separada
docker-compose logs -f backend | Select-String "ppsh|PPSH|ERROR|WARNING"
```

### Ver solo peticiones HTTP
```powershell
docker-compose logs -f backend | Select-String "➡️|✅|⚠️|❌"
```

### Ver solo operaciones de negocio
```powershell
docker-compose logs -f backend | Select-String "Creando|Asignando|Cambiando|Programando|Registrando"
```

---

## 🎯 Troubleshooting con Logs

### 1. Solicitud no se crea
```powershell
# Ver errores de validación
docker-compose logs backend --tail=50 | Select-String "Error creando solicitud"

# Ver errores de base de datos
docker-compose logs backend --tail=50 | Select-String "sqlalchemy.*ERROR"
```

### 2. Endpoint retorna 404
```powershell
# Ver si el módulo está registrado
docker-compose logs backend | Select-String "Módulo PPSH"

# Ver endpoints disponibles
docker-compose logs backend | Select-String "GET /api/v1/ppsh"
```

### 3. Error de conexión a base de datos
```powershell
# Ver logs de conexión
docker-compose logs backend | Select-String "database|Database|DATABASE"

# Ver health check
docker-compose logs backend | Select-String "Health check"
```

### 4. Performance lento
```powershell
# Ver tiempos de respuesta
docker-compose logs backend | Select-String "Tiempo:" | Select-String -Pattern "\d+\.\d+s"

# Ver queries lentas de SQL
docker-compose logs backend | Select-String "sqlalchemy" | Select-String "generated in"
```

---

## 📱 Herramientas Alternativas

### 1. Portainer (GUI para Docker)
```powershell
# Instalar Portainer
docker run -d -p 9000:9000 --name portainer `
  -v /var/run/docker.sock:/var/run/docker.sock `
  portainer/portainer-ce

# Acceder en: http://localhost:9000
```

### 2. Dozzle (Visor de logs en tiempo real)
```powershell
# Instalar Dozzle
docker run -d -p 8888:8080 --name dozzle `
  -v /var/run/docker.sock:/var/run/docker.sock `
  amir20/dozzle

# Acceder en: http://localhost:8888
```

### 3. Logs en VSCode
- Instalar extensión: **Docker** by Microsoft
- Clic derecho en contenedor → **View Logs**

---

## 🔐 Configuración de Nivel de Log

### Cambiar nivel en docker-compose.yml
```yaml
services:
  backend:
    environment:
      - LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

### Aplicar cambios
```powershell
docker-compose down
docker-compose up -d
```

---

## 📦 Rotación de Logs

### Limpiar logs antiguos
```powershell
# Limpiar logs de Docker (CUIDADO: borra TODOS los logs)
docker system prune -a --volumes

# Solo limpiar logs de un contenedor
docker-compose rm -f backend
docker-compose up -d backend
```

### Limitar tamaño de logs en docker-compose.yml
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🎓 Mejores Prácticas

### ✅ DO
- Usar `docker-compose logs -f` para debugging en desarrollo
- Filtrar logs con `Select-String` para encontrar información específica
- Exportar logs cuando reportes un bug
- Monitorear logs en tiempo real al hacer cambios

### ❌ DON'T
- No ejecutar `docker system prune` en producción sin backup
- No compartir logs con información sensible (contraseñas, tokens)
- No ignorar logs de WARNING (pueden indicar problemas futuros)

---

## 📞 Comandos Rápidos de Referencia

```powershell
# Ver logs en tiempo real
docker-compose logs -f backend

# Últimas 50 líneas
docker-compose logs backend --tail=50

# Buscar errores
docker-compose logs backend | Select-String "ERROR"

# Ver archivo interno
docker exec tramites-backend tail -f /app/logs/app.log

# Copiar logs a tu PC
docker cp tramites-backend:/app/logs/app.log ./logs_backup.txt

# Ver solo PPSH
docker-compose logs -f backend | Select-String "ppsh|PPSH"

# Exportar todo
docker-compose logs backend > logs_completos.txt
```

---

**💡 Tip:** Mantén una terminal con `docker-compose logs -f backend` abierta mientras desarrollas para ver errores en tiempo real.
