# Ejemplos de Uso: Sistema de Verificación de Base de Datos

## 🚀 Escenarios Comunes

### 1. Inicio Normal (Sin Problemas)

```bash
docker-compose up -d
```

**Salida esperada en logs de db-migrations:**
```
🏥 Verificando salud de la base de datos...
======================================================================
🏥 VERIFICACIÓN DE SALUD DE BASE DE DATOS
======================================================================
🔍 Verificando disponibilidad de la base de datos SIM_PANAMA...
   Host: sqlserver:1433
   Intento 1/30... ⚠️  No se puede conectar al servidor
   Intento 2/30... ⚠️  No se puede conectar al servidor
   Intento 3/30... ⚠️  Base de datos aún no existe
   Intento 4/30... ⚠️  Base de datos existe pero sin tablas (db-init aún no completa)
   Intento 5/30... ✅ Base de datos lista (15 tablas encontradas)
✅ Base de datos SIM_PANAMA está completamente operativa

🔍 Verificando tablas base del sistema...
   ✅ SEG_TB_USUARIOS
   ✅ SIM_GE_PAIS
   ✅ SIM_GE_AGENCIA
   ✅ SIM_GE_TRAMITE
   ✅ SIM_GE_ESTADO
✅ Todas las tablas base verificadas correctamente

======================================================================
✅ VERIFICACIÓN COMPLETADA: Base de datos lista para migraciones
======================================================================
✅ Base de datos confirmada como operativa

📦 Instalando Alembic...
🔍 Verificando estado de migraciones...
📌 Marcando migración inicial como aplicada (stamp)...
✅ Base de datos sincronizada con Alembic
🔄 Aplicando migraciones pendientes...
✅ Migraciones aplicadas exitosamente
📥 Cargando datos iniciales de catálogos PPSH...
✅ 10 causas humanitarias cargadas
✅ 12 tipos de documentos cargados
✅ 16 estados de proceso cargados
🎉 Sistema de migraciones completado
```

**Tiempo típico:** 15-30 segundos

---

### 2. Base de Datos Lenta (Servidor con Pocos Recursos)

```bash
docker-compose up -d
```

**Salida esperada:**
```
🏥 Verificando salud de la base de datos...
🔍 Verificando disponibilidad de la base de datos SIM_PANAMA...
   Host: sqlserver:1433
   Intento 1/30... ⚠️  No se puede conectar al servidor
   Intento 2/30... ⚠️  No se puede conectar al servidor
   ...
   Intento 15/30... ⚠️  Base de datos aún no existe
   Intento 16/30... ⚠️  Base de datos existe pero sin tablas
   Intento 17/30... ⚠️  Base de datos existe pero sin tablas
   Intento 18/30... ✅ Base de datos lista (15 tablas encontradas)
✅ Base de datos SIM_PANAMA está completamente operativa
...
🎉 Sistema de migraciones completado
```

**Tiempo:** 54 segundos (18 × 3s)  
**Ventaja:** Se adapta automáticamente, no necesitas cambiar configuración

---

### 3. Máquina Muy Lenta - Configurar Más Tiempo

Si ves este error:
```
❌ No se pudo verificar la base de datos después de 30 intentos
❌ FALLO: La base de datos no está disponible
```

**Solución:** Editar `backend/wait_for_db.py`:

```python
# Línea ~117 (al final del archivo)
if __name__ == "__main__":
    print("=" * 70)
    print("🏥 VERIFICACIÓN DE SALUD DE BASE DE DATOS")
    print("=" * 70)
    
    # CAMBIAR AQUÍ: aumentar max_attempts o delay
    if not wait_for_database(max_attempts=60, delay=5):  # 5 minutos
        print("\n❌ FALLO: La base de datos no está disponible")
        sys.exit(1)
```

Reiniciar:
```bash
docker-compose down
docker-compose up -d
```

---

### 4. Verificar Estado Manualmente

Si quieres ejecutar la verificación manualmente:

```bash
# Con contenedores corriendo
docker exec tramites-backend python /app/wait_for_db.py

# O sin contenedores, desde local
cd backend
python wait_for_db.py
```

---

### 5. Debugging - Ver Logs en Tiempo Real

```bash
# Ver logs de migraciones
docker-compose logs -f db-migrations

# Ver logs de inicialización
docker-compose logs -f db-init

# Ver logs de SQL Server
docker-compose logs -f sqlserver
```

---

### 6. Reinicio Completo (Borrar Todo y Empezar Desde Cero)

```bash
# Detener y borrar todo (incluyendo volúmenes)
docker-compose down -v

# Verificar que todo se borró
docker-compose ps
docker volume ls | findstr tramites

# Iniciar desde cero
docker-compose up -d

# Monitorear progreso
docker-compose logs -f db-migrations
```

---

## 🔧 Casos de Troubleshooting

### Caso 1: "Login failed for user 'sa'"

**Causa:** Contraseña incorrecta o SQL Server aún no acepta conexiones

**Solución:**
```bash
# Verificar contraseña en docker-compose.yml
findstr "SA_PASSWORD" docker-compose.yml

# Ver logs de SQL Server
docker-compose logs sqlserver | Select-String -Pattern "password"
```

---

### Caso 2: "Cannot open database 'SIM_PANAMA'"

**Causa:** db-init no se ejecutó correctamente

**Solución:**
```bash
# Ver logs de db-init
docker-compose logs db-init

# Verificar si el servicio completó
docker-compose ps db-init

# Recrear desde cero
docker-compose down -v
docker-compose up -d
```

---

### Caso 3: "Tabla X no encontrada"

**Causa:** El script de inicialización no creó esa tabla

**Verificar manualmente:**
```bash
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" -C \
  -Q "USE SIM_PANAMA; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
```

**Solución:**
1. Verificar que la tabla esté en `backend/bbdd/init_database.sql`
2. Recrear: `docker-compose down -v && docker-compose up -d`

---

### Caso 4: Timeout pero SQL Server está corriendo

**Diagnóstico:**
```bash
# Verificar conectividad directa
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" -C \
  -Q "SELECT @@VERSION"

# Si funciona, el problema es en wait_for_db.py
# Verificar variables de entorno
docker exec tramites-db-migrations env | findstr DATABASE
```

**Posibles causas:**
- Variables de entorno incorrectas
- Firewall bloqueando puerto 1433
- Red Docker mal configurada

**Solución:**
```bash
# Recrear red
docker network rm tramites-network
docker-compose up -d
```

---

## 📊 Monitoreo de Performance

### Ver cuánto tiempo tarda cada paso

```bash
# PowerShell
$start = Get-Date
docker-compose up -d
$end = Get-Date
$duration = $end - $start
Write-Host "Tiempo total de inicio: $($duration.TotalSeconds) segundos"
```

### Ver estadísticas de contenedores

```bash
docker stats tramites-sqlserver tramites-db-init tramites-db-migrations
```

---

## 🎯 Optimizaciones

### Para Desarrollo Local (Máquina Rápida)

**Reducir tiempo de verificación:**
```python
# En wait_for_db.py, línea ~117
if not wait_for_database(max_attempts=20, delay=2):  # 40 segundos máx
```

### Para Producción (Servidor Potente pero con Carga)

**Aumentar tiempo pero verificar más frecuentemente:**
```python
# En wait_for_db.py, línea ~117
if not wait_for_database(max_attempts=60, delay=2):  # 120 segundos máx
```

### Para CI/CD (Ambientes Efímeros)

**Balance entre velocidad y confiabilidad:**
```python
# En wait_for_db.py, línea ~117
if not wait_for_database(max_attempts=40, delay=3):  # 120 segundos máx
```

---

## 📝 Checklist de Inicio

Antes de ejecutar `docker-compose up -d`:

- [ ] Verificar que Docker Desktop esté corriendo
- [ ] Verificar que puerto 1433 esté libre: `netstat -an | findstr 1433`
- [ ] Verificar que puerto 8000 esté libre: `netstat -an | findstr 8000`
- [ ] Verificar espacio en disco: `docker system df`
- [ ] Si es primera vez, ejecutar: `docker-compose build`

Después de ejecutar `docker-compose up -d`:

- [ ] Ver logs: `docker-compose logs -f db-migrations`
- [ ] Esperar mensaje: "🎉 Sistema de migraciones completado"
- [ ] Verificar backend: http://localhost:8000/docs
- [ ] Verificar health check PPSH: http://localhost:8000/api/v1/ppsh/health

---

## 🎓 Comandos Útiles

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f <servicio>

# Reiniciar un servicio específico
docker-compose restart <servicio>

# Detener todos los servicios
docker-compose down

# Detener y borrar volúmenes (CUIDADO: borra la BD)
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Ver recursos usados
docker stats

# Limpiar sistema Docker
docker system prune -a
```

---

**Última actualización:** 2025-10-13  
**Mantenedor:** Sistema de Migraciones Trámites MVP Panamá
