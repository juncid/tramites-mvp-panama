# Guía Rápida: Carga de Datos de Prueba

Esta guía explica cómo cargar datos de prueba en el sistema para validar las APIs con Postman.

## 🎯 ¿Qué hace esto?

Los scripts de seed cargan datos de ejemplo en la base de datos para que puedas:
- ✅ Probar las APIs inmediatamente sin crear datos manualmente
- ✅ Validar las colecciones de Postman
- ✅ Realizar pruebas de integración
- ✅ Demos y capacitaciones

## 📦 Datos que se cargan

### Trámites Base (40+ registros)
- Visas (turista, negocios, estudiante, etc.)
- Residencias (temporal, permanente)
- Permisos de trabajo
- Trámites especiales (PPSH, naturalización, refugio)
- Certificaciones administrativas

### Workflow API (Datos completos)
- 4 Workflows configurados
- 12+ Etapas con formularios
- 30+ Preguntas de diferentes tipos
- 3 Instancias en diferentes estados
- Comentarios e historial

## 🚀 Inicio Rápido

### Windows (PowerShell)

```powershell
# 1. Levantar servicios (si no están corriendo)
docker-compose up -d

# 2. Esperar ~30 segundos a que las migraciones terminen

# 3. Cargar TODOS los datos
.\seed-data.ps1 -All

# O cargar selectivamente
.\seed-data.ps1 -Tramites   # Solo trámites
.\seed-data.ps1 -Workflow   # Solo workflow
```

### Linux/Mac (Make)

```bash
# 1. Levantar servicios
make up

# 2. Cargar TODOS los datos
make seed-all

# O cargar selectivamente
make seed-tramites   # Solo trámites
make seed-workflow   # Solo workflow
```

### Método Manual (Docker Compose)

```bash
# Cargar todos los datos
docker-compose --profile seed up db-seed

# O ejecutar el script directamente
docker-compose run --rm backend python /app/scripts/seed_test_data.py --all
```

## 📋 Después de Cargar los Datos

### 1. Importar Colecciones en Postman

Importa las colecciones desde la carpeta `backend/postman/`:
- `Tramites_Base_API.postman_collection.json`
- `Workflow_API_Tests.postman_collection.json`

### 2. Configurar Environment en Postman

Crea un nuevo environment con estas variables:

```
base_url = http://localhost:8000
api_prefix = /api/v1
```

### 3. Ejecutar las Colecciones

Ejecuta los requests uno por uno o toda la colección:
- Los IDs se guardan automáticamente en variables
- Los tests validan las respuestas
- Verás resultados en tiempo real

## 🔍 Verificar que los Datos se Cargaron

### Opción 1: API Directa

```bash
# Listar trámites
curl http://localhost:8000/api/v1/tramites

# Listar workflows
curl http://localhost:8000/api/v1/workflow/workflows
```

### Opción 2: Navegador

- Trámites: http://localhost:8000/api/v1/tramites
- Workflows: http://localhost:8000/api/v1/workflow/workflows
- API Docs: http://localhost:8000/docs

### Opción 3: Base de Datos

```bash
# Conectarse a SQL Server
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C

# Consultar
SELECT COUNT(*) FROM tramites;
SELECT COUNT(*) FROM WORKFLOW;
```

## ⚠️ Solución de Problemas

### Error: "Cannot connect to database"

**Causa:** La base de datos no está lista  
**Solución:** Espera 30-60 segundos después de `docker-compose up -d`

```bash
# Verificar que SQL Server esté healthy
docker-compose ps
```

### Error: "Invalid object name 'WORKFLOW'"

**Causa:** Las migraciones no se aplicaron  
**Solución:** Ejecutar migraciones manualmente

```bash
docker-compose up db-migrations --abort-on-container-exit
```

### Error: "Duplicate key"

**Causa:** Los datos ya existen  
**Solución:** Limpiar y volver a cargar

```bash
# Ver sección "Limpiar Datos"
```

### Los servicios no están corriendo

```bash
# Verificar estado
docker-compose ps

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🗑️ Limpiar Datos de Prueba

Si necesitas limpiar los datos y empezar de cero:

### Opción 1: Desde SQL

```sql
-- Conectarse a la base de datos
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C

-- Limpiar trámites de prueba
DELETE FROM tramites WHERE titulo LIKE '%[PRUEBA]%' OR titulo LIKE '%TEST%';

-- Limpiar workflows (ver scripts en backend/sql/)
```

### Opción 2: Recrear base de datos completa

```bash
# CUIDADO: Esto elimina TODOS los datos
docker-compose down -v
docker-compose up -d
# Esperar a que terminen las migraciones
./seed-data.ps1 -All  # Windows
# o
make seed-all         # Linux/Mac
```

## 📂 Archivos Relacionados

- **Scripts SQL:** `backend/sql/seed_*_test_data.sql`
- **Script Python:** `backend/scripts/seed_test_data.py`
- **Script PowerShell:** `seed-data.ps1`
- **Makefile:** `Makefile`
- **Documentación detallada:** `backend/sql/README_TEST_DATA.md`

## 🎓 Ejemplos de Uso Completo

### Escenario 1: Setup Inicial

```bash
# 1. Clonar repo y levantar servicios
git clone <repo>
cd tramites-mvp-panama
docker-compose up -d

# 2. Esperar a que esté listo
sleep 60

# 3. Cargar datos
./seed-data.ps1 -All

# 4. Abrir Postman y probar
```

### Escenario 2: Solo Testing de Workflow

```bash
# Cargar solo datos de workflow
./seed-data.ps1 -Workflow

# Importar en Postman: Workflow_API_Tests.postman_collection.json
# Ejecutar la colección
```

### Escenario 3: Desarrollo Continuo

```bash
# Durante desarrollo, recargar datos periódicamente
docker-compose down -v
docker-compose up -d
sleep 60
./seed-data.ps1 -All
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Consulta la documentación completa: `backend/sql/README_TEST_DATA.md`
3. Verifica el estado: `docker-compose ps`

---

**Fecha:** 2025-10-24  
**Autor:** Sistema de Trámites MVP Panamá
