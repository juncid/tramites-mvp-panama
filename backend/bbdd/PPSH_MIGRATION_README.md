# 📋 Scripts de Migración PPSH

Este directorio contiene los scripts SQL para implementar el sistema de Permisos Por razones Humanitarias (PPSH).

## 📁 Archivos

### 1. `migration_ppsh_v1.sql`
**Script principal de migración** que crea todas las tablas, índices, vistas y procedimientos necesarios para el sistema PPSH.

**Contiene:**
- ✅ 9 tablas principales
- ✅ 3 tablas de catálogos
- ✅ Índices de performance
- ✅ Foreign keys y constraints
- ✅ 2 vistas útiles
- ✅ 3 procedimientos almacenados
- ✅ 1 trigger automático
- ✅ Datos iniciales de catálogos
- ✅ 1 caso de prueba básico

### 2. `ppsh_sample_data.sql`
**Datos de ejemplo** para testing y demostración del sistema.

**Contiene:**
- ✅ 5 casos de ejemplo completos
- ✅ Diferentes tipos de solicitudes
- ✅ Estados variados (en proceso, aprobado, rechazado)
- ✅ Historial de cambios de estado
- ✅ Documentos asociados
- ✅ Comentarios y entrevistas

## 🚀 Cómo Ejecutar

### Opción 1: Ejecución Manual (SQL Server Management Studio)

1. **Conectar a SQL Server:**
   ```
   Host: localhost:1433
   Usuario: sa
   Password: YourStrong@Passw0rd
   Base de datos: SIM_PANAMA
   ```

2. **Ejecutar migración:**
   - Abrir `migration_ppsh_v1.sql`
   - Ejecutar todo el script (F5)
   - Verificar mensajes de éxito

3. **Cargar datos de ejemplo (opcional):**
   - Abrir `ppsh_sample_data.sql`
   - Ejecutar todo el script (F5)

### Opción 2: Desde Docker (Línea de Comandos)

```bash
# Migración principal
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' -C \
  -i /backend/bbdd/migration_ppsh_v1.sql

# Datos de ejemplo
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' -C \
  -i /backend/bbdd/ppsh_sample_data.sql
```

### Opción 3: Script Python (Recomendado)

Crear archivo `migrate_ppsh.py` en `/backend`:

```python
import pyodbc
import time

def ejecutar_migracion():
    # Configuración
    server = 'localhost,1433'
    database = 'SIM_PANAMA'
    username = 'sa'
    password = 'YourStrong@Passw0rd'
    
    # Conectar
    conn_str = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;'
    
    try:
        print("🔄 Conectando a SQL Server...")
        conn = pyodbc.connect(conn_str, timeout=30)
        cursor = conn.cursor()
        
        # Leer y ejecutar migración
        print("📄 Ejecutando migration_ppsh_v1.sql...")
        with open('/backend/bbdd/migration_ppsh_v1.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
            
        # Ejecutar por lotes (separados por GO)
        batches = sql_script.split('GO')
        for i, batch in enumerate(batches, 1):
            if batch.strip():
                print(f"   Ejecutando lote {i}/{len(batches)}...")
                cursor.execute(batch)
                conn.commit()
        
        print("✅ Migración completada exitosamente")
        
        # Preguntar por datos de ejemplo
        cargar_ejemplos = input("\n¿Desea cargar datos de ejemplo? (s/n): ")
        if cargar_ejemplos.lower() == 's':
            print("📄 Ejecutando ppsh_sample_data.sql...")
            with open('/backend/bbdd/ppsh_sample_data.sql', 'r', encoding='utf-8') as f:
                sql_script = f.read()
                
            batches = sql_script.split('GO')
            for i, batch in enumerate(batches, 1):
                if batch.strip():
                    print(f"   Ejecutando lote {i}/{len(batches)}...")
                    cursor.execute(batch)
                    conn.commit()
            
            print("✅ Datos de ejemplo cargados")
        
        cursor.close()
        conn.close()
        print("\n🎉 Proceso completado")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == '__main__':
    ejecutar_migracion()
```

Ejecutar:
```bash
cd backend
python migrate_ppsh.py
```

## 📊 Tablas Creadas

### Catálogos

| Tabla | Descripción | Registros Iniciales |
|-------|-------------|---------------------|
| `PPSH_CAUSA_HUMANITARIA` | Causas humanitarias válidas | 10 |
| `PPSH_TIPO_DOCUMENTO` | Tipos de documentos requeridos | 12 |
| `PPSH_ESTADO` | Estados del proceso PPSH | 16 |

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `PPSH_SOLICITUD` | Solicitud principal (encabezado) |
| `PPSH_SOLICITANTE` | Personas (titular + dependientes) |
| `PPSH_DOCUMENTO` | Archivos adjuntos |
| `PPSH_ESTADO_HISTORIAL` | Trazabilidad de cambios |
| `PPSH_ENTREVISTA` | Entrevistas programadas/realizadas |
| `PPSH_COMENTARIO` | Comentarios internos |

## 🔍 Vistas Creadas

### `VW_PPSH_SOLICITUDES_COMPLETAS`
Vista consolidada con toda la información de solicitudes:
- Datos de la solicitud
- Estado actual con color
- Causa humanitaria
- Funcionario asignado
- Nombre del titular
- Contadores (personas, documentos, comentarios)
- Días transcurridos

**Uso:**
```sql
SELECT * FROM VW_PPSH_SOLICITUDES_COMPLETAS
WHERE estado_actual = 'EN_REVISION'
ORDER BY fecha_solicitud DESC
```

### `VW_PPSH_ESTADISTICAS_ESTADOS`
Estadísticas agrupadas por estado:
- Cantidad de solicitudes por estado
- Promedio de días en cada estado

**Uso:**
```sql
SELECT * FROM VW_PPSH_ESTADISTICAS_ESTADOS
ORDER BY total_solicitudes DESC
```

## ⚙️ Procedimientos Almacenados

### 1. `SP_PPSH_GENERAR_NUM_EXPEDIENTE`
Genera número de expediente único automáticamente.

**Formato:** `PPSH-YYYYMM-NNNN`

**Uso:**
```sql
DECLARE @num_expediente VARCHAR(20)
EXEC SP_PPSH_GENERAR_NUM_EXPEDIENTE @num_expediente OUTPUT
PRINT @num_expediente
-- Output: PPSH-202510-0001
```

### 2. `SP_PPSH_CAMBIAR_ESTADO`
Cambia el estado de una solicitud y registra en historial.

**Parámetros:**
- `@id_solicitud` - ID de la solicitud
- `@estado_nuevo` - Código del nuevo estado
- `@user_id` - Usuario que realiza el cambio
- `@observaciones` - Comentarios (opcional)
- `@es_dictamen` - Si es un dictamen (0/1)
- `@tipo_dictamen` - 'FAVORABLE' o 'DESFAVORABLE' (opcional)
- `@dictamen_detalle` - Texto del dictamen (opcional)

**Uso:**
```sql
EXEC SP_PPSH_CAMBIAR_ESTADO 
    @id_solicitud = 1,
    @estado_nuevo = 'EN_EVALUACION',
    @user_id = 'admin',
    @observaciones = 'Documentación verificada satisfactoriamente'
```

### 3. `SP_PPSH_MIS_SOLICITUDES`
Obtiene solicitudes asignadas a un usuario.

**Parámetros:**
- `@user_id` - Usuario
- `@estado` - Filtrar por estado (opcional)

**Uso:**
```sql
-- Todas mis solicitudes
EXEC SP_PPSH_MIS_SOLICITUDES @user_id = 'admin'

-- Solo las que están en revisión
EXEC SP_PPSH_MIS_SOLICITUDES 
    @user_id = 'admin',
    @estado = 'EN_REVISION'
```

## 🔔 Trigger Creado

### `TRG_PPSH_SOLICITUD_ESTADO`
Se ejecuta automáticamente al crear una nueva solicitud.

**Función:** Registra el estado inicial en el historial.

## ✅ Verificación Post-Migración

### 1. Verificar tablas creadas:
```sql
SELECT name AS 'Tabla PPSH'
FROM sys.tables
WHERE name LIKE 'PPSH_%'
ORDER BY name
```

**Resultado esperado:** 9 tablas

### 2. Verificar datos iniciales:
```sql
-- Causas humanitarias
SELECT COUNT(*) AS 'Causas' FROM PPSH_CAUSA_HUMANITARIA
-- Esperado: 10

-- Tipos de documento
SELECT COUNT(*) AS 'Tipos Doc' FROM PPSH_TIPO_DOCUMENTO
-- Esperado: 12

-- Estados
SELECT COUNT(*) AS 'Estados' FROM PPSH_ESTADO
-- Esperado: 16
```

### 3. Verificar procedimientos:
```sql
SELECT name AS 'Procedimiento'
FROM sys.procedures
WHERE name LIKE 'SP_PPSH_%'
ORDER BY name
```

**Resultado esperado:** 3 procedimientos

### 4. Verificar vistas:
```sql
SELECT name AS 'Vista'
FROM sys.views
WHERE name LIKE 'VW_PPSH_%'
ORDER BY name
```

**Resultado esperado:** 2 vistas

## 📈 Datos de Ejemplo Incluidos

Si ejecutas `ppsh_sample_data.sql`, obtendrás:

### Caso 1: Familia Venezolana ✅
- **Estado:** EN_EVALUACION
- **Tipo:** GRUPAL (4 personas)
- **Causa:** Persecución Política
- **Prioridad:** ALTA
- **Documentos:** 5 archivos
- **Historial:** 3 cambios de estado

### Caso 2: Tratamiento Médico ✅
- **Estado:** EN_REVISION
- **Tipo:** INDIVIDUAL
- **Causa:** Razones Médicas
- **Prioridad:** ALTA
- **Documentos:** 5 archivos
- **Historial:** 1 cambio

### Caso 3: Reunificación Familiar ✅
- **Estado:** EN_VERIFICACION
- **Tipo:** GRUPAL (3 personas)
- **Causa:** Reunificación Familiar
- **Prioridad:** NORMAL
- **Documentos:** 5 archivos
- **Historial:** 2 cambios

### Caso 4: Refugiado Aprobado ✅
- **Estado:** RESUELTO
- **Tipo:** INDIVIDUAL
- **Causa:** Conflicto Armado
- **Prioridad:** ALTA
- **Documentos:** Completos
- **Historial:** 9 cambios (proceso completo)
- **Entrevista:** Realizada con resultado favorable
- **Resolución:** RES-PPSH-2025-001

### Caso 5: Solicitud Rechazada ❌
- **Estado:** RECHAZADO
- **Tipo:** INDIVIDUAL
- **Causa:** Otro
- **Prioridad:** BAJA
- **Historial:** 4 cambios
- **Motivo:** Falta de documentación probatoria

## 🔧 Consultas Útiles

### Listar todas las solicitudes activas:
```sql
SELECT * FROM VW_PPSH_SOLICITUDES_COMPLETAS
ORDER BY fecha_solicitud DESC
```

### Solicitudes por estado:
```sql
SELECT 
    e.nombre_estado,
    COUNT(s.id_solicitud) AS cantidad
FROM PPSH_ESTADO e
LEFT JOIN PPSH_SOLICITUD s ON e.cod_estado = s.estado_actual AND s.activo = 1
GROUP BY e.nombre_estado, e.orden
ORDER BY e.orden
```

### Solicitudes con más días de antigüedad:
```sql
SELECT TOP 10
    num_expediente,
    nombre_titular,
    estado_actual,
    dias_transcurridos
FROM VW_PPSH_SOLICITUDES_COMPLETAS
ORDER BY dias_transcurridos DESC
```

### Casos por causa humanitaria:
```sql
SELECT 
    c.nombre_causa,
    COUNT(s.id_solicitud) AS total_solicitudes,
    SUM(CASE WHEN s.estado_actual IN ('APROBADO', 'RESUELTO') THEN 1 ELSE 0 END) AS aprobadas,
    SUM(CASE WHEN s.estado_actual = 'RECHAZADO' THEN 1 ELSE 0 END) AS rechazadas
FROM PPSH_CAUSA_HUMANITARIA c
LEFT JOIN PPSH_SOLICITUD s ON c.cod_causa = s.cod_causa_humanitaria AND s.activo = 1
GROUP BY c.nombre_causa
ORDER BY total_solicitudes DESC
```

### Mis solicitudes pendientes:
```sql
EXEC SP_PPSH_MIS_SOLICITUDES 
    @user_id = 'admin',
    @estado = 'EN_REVISION'
```

## 🗑️ Rollback (Deshacer Migración)

Si necesitas eliminar todo lo relacionado con PPSH:

```sql
-- ADVERTENCIA: Esto eliminará TODAS las tablas y datos PPSH

USE [SIM_PANAMA]
GO

-- Eliminar vistas
DROP VIEW IF EXISTS [dbo].[VW_PPSH_ESTADISTICAS_ESTADOS]
DROP VIEW IF EXISTS [dbo].[VW_PPSH_SOLICITUDES_COMPLETAS]

-- Eliminar procedimientos
DROP PROCEDURE IF EXISTS [dbo].[SP_PPSH_MIS_SOLICITUDES]
DROP PROCEDURE IF EXISTS [dbo].[SP_PPSH_CAMBIAR_ESTADO]
DROP PROCEDURE IF EXISTS [dbo].[SP_PPSH_GENERAR_NUM_EXPEDIENTE]

-- Eliminar trigger
DROP TRIGGER IF EXISTS [dbo].[TRG_PPSH_SOLICITUD_ESTADO]

-- Eliminar tablas (en orden por dependencias)
DROP TABLE IF EXISTS [dbo].[PPSH_COMENTARIO]
DROP TABLE IF EXISTS [dbo].[PPSH_ENTREVISTA]
DROP TABLE IF EXISTS [dbo].[PPSH_ESTADO_HISTORIAL]
DROP TABLE IF EXISTS [dbo].[PPSH_DOCUMENTO]
DROP TABLE IF EXISTS [dbo].[PPSH_SOLICITANTE]
DROP TABLE IF EXISTS [dbo].[PPSH_SOLICITUD]
DROP TABLE IF EXISTS [dbo].[PPSH_TIPO_DOCUMENTO]
DROP TABLE IF EXISTS [dbo].[PPSH_ESTADO]
DROP TABLE IF EXISTS [dbo].[PPSH_CAUSA_HUMANITARIA]

PRINT '✅ Rollback completado'
```

## 📚 Documentación Relacionada

- **Análisis de Viabilidad:** `/docs/ANALISIS_PPSH_MVP.md`
- **Documentación de BD:** `/DATABASE_DOCUMENTATION.md`
- **Guía de Deployment:** `/DEPLOYMENT_GUIDE.md`

## 🐛 Solución de Problemas

### Error: "Cannot insert duplicate key"
**Causa:** Intentas cargar los datos de ejemplo dos veces.
**Solución:** Los scripts detectan duplicados. Si quieres recargar, ejecuta primero el rollback.

### Error: "Foreign key constraint"
**Causa:** Orden incorrecto de eliminación de tablas.
**Solución:** Usa el script de rollback proporcionado.

### Error: "Invalid object name 'SIM_GE_PAIS'"
**Causa:** No se ejecutó el script de inicialización base primero.
**Solución:** Ejecuta `/backend/bbdd/init_database.sql` antes de la migración PPSH.

### Error: "Login failed for user 'sa'"
**Causa:** Contraseña incorrecta o SQL Server no iniciado.
**Solución:** Verifica que Docker Compose esté corriendo y la contraseña sea correcta.

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs de SQL Server: `docker-compose logs sqlserver`
2. Verificar conexión: `docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C`
3. Consultar documentación en `/docs`

---

**Última actualización:** 13 de Octubre de 2025  
**Versión:** 1.0.0  
**Autor:** Sistema de Trámites Migratorios - SNM Panamá
