# Datos de Prueba SIM_FT - Flujo Completo

## 📋 Descripción

Este directorio contiene scripts SQL para cargar datos de prueba completos que permiten evaluar todos los endpoints del módulo SIM_FT (Sistema Integrado de Migración - Funcionalidades Transversales).

## 🎯 Datos Incluidos

### Tipo de Trámite: **PERM_TEMP**
- **Código**: `PERM_TEMP`
- **Descripción**: Permiso Temporal de Residencia - Flujo completo de prueba
- **Pasos configurados**: 6
- **Trámites de ejemplo**: 3

### Pasos del Proceso (6 pasos)

1. **Recepción de Solicitud** → Sección 0101
2. **Verificación de Documentos** → Sección 0102
3. **Evaluación Legal** → Sección 0103
4. **Aprobación Directiva** → Sección 0104
5. **Verificación de Pago** → Sección 0105
6. **Emisión de Permiso** → Sección 0106

### Trámites de Ejemplo

| Trámite | Año-Num-Reg | Estado | Prioridad | Conclusión | Días | Descripción |
|---------|-------------|--------|-----------|------------|------|-------------|
| 1 | 2025-5001-1 | 02 (En Revisión) | Media (2) | - | 5 | Juan Rodríguez - En paso 2 |
| 2 | 2025-5002-1 | 04 (En Evaluación) | Alta (1) | AP | 10 | María González - En paso 4 |
| 3 | 2025-5003-1 | 10 (Finalizado) | Media (2) | AP | 19 | Pedro Martínez - APROBADO |
| 4 | 2025-5004-1 | 01 (Recién Ingresado) | Baja (3) | - | 2 | Ana Silva - Recién ingresado |
| 5 | 2025-5005-1 | 10 (Finalizado) | Alta (1) | AP | 25 | Carlos Méndez - APROBADO |
| 6 | 2025-5006-1 | 10 (Finalizado) | Media (2) | RE | 12 | Laura Torres - RECHAZADO |

**Distribución por Estado:**
- Estado 01 (Recién Ingresado): 1 trámite
- Estado 02 (En Revisión): 1 trámite
- Estado 04 (En Evaluación): 1 trámite
- Estado 10 (Finalizado): 3 trámites

**Estadísticas:**
- Total trámites: 6
- Finalizados: 3 (50%)
- Tiempo promedio finalización: ~18 días
- Aprobados: 3 | Rechazados: 1

## 🚀 Carga de Datos

### Script Principal (Primera Vez)

```powershell
# Copiar script al contenedor
docker cp backend/sql/seed_sim_ft_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/

# Ejecutar script
docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P 'YourStrong@Passw0rd' -C `
    -i /var/opt/mssql/backup/seed_sim_ft_test_data.sql
```

### Actualización de Datos (Estadísticas)

```powershell
# Copiar script de actualización
docker cp backend/sql/update_sim_ft_test_data.sql tramites-sqlserver:/var/opt/mssql/backup/

# Ejecutar actualización
docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P 'YourStrong@Passw0rd' -C `
    -i /var/opt/mssql/backup/update_sim_ft_test_data.sql
```

**Nota:** El script de actualización agrega 3 trámites adicionales (5004, 5005, 5006) y actualiza estados para mejorar las estadísticas.

## 🧪 Pruebas de Endpoints

### 1. Catálogos

```bash
# Listar pasos del trámite
curl "http://localhost:8000/api/v1/sim-ft/pasos?cod_tramite=PERM_TEMP"

# Ver flujo de pasos
curl "http://localhost:8000/api/v1/sim-ft/flujo-pasos?cod_tramite=PERM_TEMP"

# Listar tipos de trámites
curl "http://localhost:8000/api/v1/sim-ft/tramites-tipos"
```

### 2. Consulta de Trámites

```bash
# Todos los trámites
curl "http://localhost:8000/api/v1/sim-ft/tramites"

# Trámites PERM_TEMP
curl "http://localhost:8000/api/v1/sim-ft/tramites?cod_tramite=PERM_TEMP"

# Trámite específico (requiere año/num/registro)
curl "http://localhost:8000/api/v1/sim-ft/tramites/2025/5001/1"

# Historial de pasos de un trámite
curl "http://localhost:8000/api/v1/sim-ft/tramites/2025/5001/pasos"
```

### 3. Estadísticas

```bash
# Estadísticas por tipo de trámite
curl "http://localhost:8000/api/v1/sim-ft/estadisticas/tramites-por-tipo"

# Estadísticas por estado
curl "http://localhost:8000/api/v1/sim-ft/estadisticas/tramites-por-estado"

# Tiempo promedio de procesamiento (PERM_TEMP)
curl "http://localhost:8000/api/v1/sim-ft/estadisticas/tiempo-promedio?cod_tramite=PERM_TEMP"
```

### 4. Modificación de Trámites

```bash
# Avanzar paso de trámite 5001
curl -X POST "http://localhost:8000/api/v1/sim-ft/tramites/2025/5001/pasos" \
  -H "Content-Type: application/json" \
  -d '{
    "NUM_PASO": 3,
    "IND_ESTATUS": "02",
    "OBS_OBSERVA": "Evaluación legal iniciada"
  }'

# Cerrar trámite 5002
curl -X POST "http://localhost:8000/api/v1/sim-ft/tramites/2025/5002/1/cierre" \
  -H "Content-Type: application/json" \
  -d '{
    "IND_CONCLUSION": "AP",
    "OBS_CONCLUSION": "Permiso aprobado exitosamente"
  }'
```

## 📊 Estructura de Datos

### Componentes Creados

- ✅ **1 Tipo de trámite**: PERM_TEMP
- ✅ **6 Pasos del proceso** (workflow completo)
- ✅ **6 Configuraciones de flujo** (secuencia paso a paso)
- ✅ **7 Asignaciones** usuario-sección (ADMIN y TEST_USER)
- ✅ **6 Trámites de ejemplo** (diferentes estados y prioridades)
- ✅ **12+ Registros de detalles** (historial de pasos ejecutados)

### Tablas Populadas

```
SIM_FT_TRAMITES       → 1 registro  (tipo PERM_TEMP)
SIM_FT_PASOS          → 6 registros (pasos 1-6)
SIM_FT_PASOXTRAM      → 6 registros (flujo de proceso)
SIM_FT_USUA_SEC       → 7 registros (asignaciones)
SIM_FT_TRAMITE_E      → 6 registros (encabezados de trámites)
SIM_FT_TRAMITE_D      → 12+ registros (detalles/historial)
```

## 🎯 Casos de Uso Cubiertos

### Flujo Básico
1. ✅ Consultar catálogo de pasos
2. ✅ Consultar flujo configurado
3. ✅ Listar trámites por tipo
4. ✅ Ver detalle de un trámite específico
5. ✅ Consultar historial de pasos

### Flujo Avanzado
6. ✅ Avanzar un trámite al siguiente paso
7. ✅ Cerrar/finalizar un trámite
8. ✅ Generar estadísticas por estado
9. ✅ Filtrar trámites por prioridad
10. ✅ Validar flujo secuencial de pasos

## 🔧 Mantenimiento

### Limpiar Datos de Prueba

```sql
-- Eliminar trámites de prueba
DELETE FROM SIM_FT_TRAMITE_D WHERE NUM_TRAMITE IN (5001, 5002, 5003);
DELETE FROM SIM_FT_TRAMITE_E WHERE NUM_TRAMITE IN (5001, 5002, 5003);

-- Eliminar configuración del tipo PERM_TEMP
DELETE FROM SIM_FT_PASOXTRAM WHERE COD_TRAMITE = 'PERM_TEMP';
DELETE FROM SIM_FT_PASOS WHERE COD_TRAMITE = 'PERM_TEMP';
DELETE FROM SIM_FT_TRAMITES WHERE COD_TRAMITE = 'PERM_TEMP';

-- Limpiar asignaciones de prueba (opcional)
DELETE FROM SIM_FT_USUA_SEC WHERE ID_USUARIO = 'TEST_USER';
```

### Regenerar Datos

```powershell
# Ejecutar nuevamente el script de seed
docker exec -i tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P 'YourStrong@Passw0rd' -C `
    -i /var/opt/mssql/backup/seed_sim_ft_test_data.sql
```

## 📝 Notas

- Los datos son **idempotentes**: Ejecutar el script múltiples veces no crea duplicados
- Los trámites usan números **5001-5003** para evitar conflictos con datos reales
- Las fechas son **relativas** (DATEADD) para simular tramites recientes
- El usuario **TEST_USER** tiene acceso solo a la sección 0101
- El usuario **ADMIN** tiene acceso a todas las secciones (0101-0106)

## ✨ Próximos Pasos

1. Cargar datos de prueba: `docker exec ...`
2. Verificar con: `curl http://localhost:8000/api/v1/sim-ft/tramites`
3. Probar endpoints según casos de uso arriba
4. Usar Postman con colección **SIM_FT_Complete_API.postman_collection.json**

---

**Fecha de creación**: 2025-10-24  
**Autor**: Sistema de Trámites MVP Panamá  
**Versión**: 1.0.0
