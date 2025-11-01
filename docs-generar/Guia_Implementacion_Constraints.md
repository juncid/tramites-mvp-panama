# Guía de Implementación de Constraints SQL

## Documento Técnico - Sistema de Trámites Migratorios de Panamá

**Fecha:** 27 de Octubre de 2025  
**Autor:** Clio Consulting  
**Versión:** 1.0  
**Relacionado con:** Informe N°4 - Diseño y Documentación de Base de Datos

---

## 1. INTRODUCCIÓN

Este documento proporciona la guía completa de implementación de los 155 constraints SQL documentados en el Informe N°4. Incluye scripts de migración, validación y rollback.

---

## 2. ARCHIVOS GENERADOS

### 2.1 Script de Migración Alembic

**Archivo:** `backend/alembic/versions/011_agregar_constraints_validacion.py`

**Contenido:**
- 19 Check Constraints
- 5 Unique Constraints  
- 22 Foreign Keys
- 13 Default Constraints
- 10 Índices de optimización

**Total:** 69 constraints implementados (enfoque incremental en módulos PPSH y Workflows)

### 2.2 Resumen de Constraints por Módulo

| Módulo | Check | Unique | FK | Default | Índices | Total |
|--------|-------|--------|----|---------|---------| ------|
| **PPSH** | 12 | 2 | 13 | 9 | 5 | 41 |
| **Workflows** | 2 | 1 | 9 | 2 | 3 | 17 |
| **Seguridad** | 1 | 2 | 0 | 2 | 0 | 5 |
| **SIM_FT** | 4 | 0 | 0 | 0 | 2 | 6 |
| **Total** | **19** | **5** | **22** | **13** | **10** | **69** |

---

## 3. EJECUCIÓN DE LA MIGRACIÓN

### 3.1 Pre-requisitos

Antes de ejecutar la migración, verificar:

```bash
# 1. Verificar estado de migraciones
cd backend
alembic current

# 2. Verificar que estamos en la migración 010
# Debería mostrar: 010_sincronizar_modelos_bd

# 3. Backup de la base de datos
sqlcmd -S localhost -U sa -P YourPassword -Q "BACKUP DATABASE SIM_PANAMA TO DISK='C:\Backups\SIM_PANAMA_pre_constraints.bak'"
```

### 3.2 Ejecución de la Migración

```bash
# Ejecutar migración
alembic upgrade head

# Verificar que se aplicó correctamente
alembic current
# Debería mostrar: 011_agregar_constraints_validacion
```

### 3.3 Validación Post-Migración

```sql
-- Verificar Check Constraints agregados
SELECT 
    OBJECT_NAME(parent_object_id) AS tabla,
    name AS constraint_name,
    type_desc
FROM sys.check_constraints
WHERE name LIKE 'CK_PPSH%' OR name LIKE 'CK_WF%'
ORDER BY tabla;

-- Verificar Foreign Keys agregadas
SELECT 
    OBJECT_NAME(parent_object_id) AS tabla,
    name AS fk_name
FROM sys.foreign_keys
WHERE name LIKE 'FK_PPSH%' OR name LIKE 'FK_WF%'
ORDER BY tabla;

-- Verificar Unique Constraints
SELECT 
    t.name AS tabla,
    i.name AS constraint_name
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE i.is_unique = 1 
  AND i.name LIKE 'UK_%'
ORDER BY t.name;
```

**Resultado Esperado:**
- 19 Check Constraints
- 22 Foreign Keys
- 5 Unique Constraints

---

## 4. CONSTRAINTS IMPLEMENTADOS

### 4.1 Check Constraints - Módulo PPSH

#### CK_PPSH_duracion_viaje
```sql
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT CK_PPSH_duracion_viaje
CHECK (duracion_viaje BETWEEN 1 AND 180);
```
**Propósito:** Validar que la duración del viaje esté entre 1 y 180 días  
**Mensaje de Error:** `The INSERT statement conflicted with the CHECK constraint "CK_PPSH_duracion_viaje"`

#### CK_PPSH_fechas_logicas
```sql
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT CK_PPSH_fechas_logicas
CHECK (fecha_salida >= CAST(fecha_solicitud AS DATE));
```
**Propósito:** Garantizar que la fecha de salida sea posterior a la fecha de solicitud  
**Impacto:** Previene inconsistencias temporales

#### CK_PPSH_estados_exclusivos
```sql
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT CK_PPSH_estados_exclusivos
CHECK (
    (fecha_aprobacion IS NOT NULL AND fecha_rechazo IS NULL) OR
    (fecha_aprobacion IS NULL AND fecha_rechazo IS NOT NULL) OR
    (fecha_aprobacion IS NULL AND fecha_rechazo IS NULL)
);
```
**Propósito:** Una solicitud no puede estar aprobada y rechazada simultáneamente  
**Casos Permitidos:**
- ✅ Aprobada (fecha_aprobacion NOT NULL, fecha_rechazo NULL)
- ✅ Rechazada (fecha_aprobacion NULL, fecha_rechazo NOT NULL)
- ✅ En proceso (ambas NULL)
- ❌ Aprobada Y rechazada (ambas NOT NULL)

#### CK_PPSH_edad_valida
```sql
ALTER TABLE PPSH_SOLICITANTE
ADD CONSTRAINT CK_PPSH_edad_valida
CHECK (DATEDIFF(YEAR, fecha_nacimiento, GETDATE()) BETWEEN 0 AND 120);
```
**Propósito:** Validar que la edad del solicitante sea razonable (0-120 años)  
**Nota:** Se combina con CK_PPSH_fecha_nacimiento para validación completa

#### CK_PPSH_email_formato
```sql
ALTER TABLE PPSH_SOLICITANTE
ADD CONSTRAINT CK_PPSH_email_formato
CHECK (email LIKE '%@%.%' OR email IS NULL);
```
**Propósito:** Validación básica de formato de email  
**Permite:** NULL (email opcional)

### 4.2 Foreign Keys - Módulo PPSH

#### FK_PPSH_SOL_SOLICITANTE
```sql
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT FK_PPSH_SOL_SOLICITANTE
FOREIGN KEY (id_solicitante_titular)
REFERENCES PPSH_SOLICITANTE(id_solicitante)
ON DELETE NO ACTION
ON UPDATE CASCADE;
```
**Estrategia:** NO ACTION en DELETE (proteger solicitudes existentes)  
**Razón:** No permitir borrar un solicitante titular si tiene solicitudes activas

#### FK_PPSH_DOC_SOLICITUD
```sql
ALTER TABLE PPSH_DOCUMENTO
ADD CONSTRAINT FK_PPSH_DOC_SOLICITUD
FOREIGN KEY (id_solicitud)
REFERENCES PPSH_SOLICITUD(id_solicitud)
ON DELETE CASCADE
ON UPDATE CASCADE;
```
**Estrategia:** CASCADE en DELETE (borrar documentos huérfanos)  
**Razón:** Los documentos no tienen sentido sin la solicitud padre

### 4.3 Unique Constraints

#### UK_PPSH_num_expediente
```sql
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT UK_PPSH_num_expediente
UNIQUE NONCLUSTERED (num_expediente);
```
**Propósito:** Garantizar unicidad de número de expediente  
**Tipo:** Índice no agrupado (clustered index ya existe en id_solicitud)

#### UK_PPSH_SOLICITANTE_email
```sql
CREATE UNIQUE NONCLUSTERED INDEX UK_PPSH_SOLICITANTE_email
ON PPSH_SOLICITANTE(email)
WHERE email IS NOT NULL;
```
**Propósito:** Email único por solicitante  
**Filtro:** WHERE email IS NOT NULL (permite múltiples NULLs)  
**Beneficio:** Previene duplicados, permite solicitantes sin email

### 4.4 Default Constraints

#### DF_PPSH_SOL_estado
```sql
ALTER TABLE PPSH_SOLICITUD
ADD CONSTRAINT DF_PPSH_SOL_estado
DEFAULT 'BORRADOR' FOR estado_actual;
```
**Propósito:** Toda solicitud nueva inicia en estado BORRADOR  
**Beneficio:** No requiere especificar estado en INSERT

---

## 5. PRUEBAS DE VALIDACIÓN

### 5.1 Test de Check Constraints

```sql
-- Test 1: Duración de viaje inválida (debe fallar)
BEGIN TRY
    INSERT INTO PPSH_SOLICITUD (num_expediente, duracion_viaje)
    VALUES ('TEST-001', 200);  -- > 180 días
    PRINT '❌ ERROR: No se validó duración máxima';
END TRY
BEGIN CATCH
    PRINT '✅ CORRECTO: Check constraint funcionando';
END CATCH

-- Test 2: Fechas lógicas inválidas (debe fallar)
BEGIN TRY
    INSERT INTO PPSH_SOLICITUD (num_expediente, fecha_solicitud, fecha_salida)
    VALUES ('TEST-002', '2025-10-27', '2025-10-20');  -- Salida antes de solicitud
    PRINT '❌ ERROR: No se validó lógica de fechas';
END TRY
BEGIN CATCH
    PRINT '✅ CORRECTO: Check constraint funcionando';
END CATCH

-- Test 3: Email inválido (debe fallar)
BEGIN TRY
    INSERT INTO PPSH_SOLICITANTE (nombres, apellidos, email)
    VALUES ('Juan', 'Pérez', 'correo-invalido');  -- Sin @
    PRINT '❌ ERROR: No se validó formato de email';
END TRY
BEGIN CATCH
    PRINT '✅ CORRECTO: Check constraint funcionando';
END CATCH
```

### 5.2 Test de Foreign Keys

```sql
-- Test 4: FK inválida (debe fallar)
BEGIN TRY
    INSERT INTO PPSH_DOCUMENTO (id_solicitud, nombre_archivo)
    VALUES (99999, 'test.pdf');  -- id_solicitud no existe
    PRINT '❌ ERROR: No se validó FK';
END TRY
BEGIN CATCH
    PRINT '✅ CORRECTO: Foreign key funcionando';
END CATCH

-- Test 5: Cascade DELETE (debe funcionar)
BEGIN TRANSACTION;
    -- Crear solicitud con documento
    INSERT INTO PPSH_SOLICITUD (id_solicitud, num_expediente) 
    VALUES (9999, 'TEST-CASCADE');
    
    INSERT INTO PPSH_DOCUMENTO (id_solicitud, nombre_archivo) 
    VALUES (9999, 'doc.pdf');
    
    -- Borrar solicitud
    DELETE FROM PPSH_SOLICITUD WHERE id_solicitud = 9999;
    
    -- Verificar que documento se borró en cascada
    IF NOT EXISTS (SELECT 1 FROM PPSH_DOCUMENTO WHERE id_solicitud = 9999)
        PRINT '✅ CORRECTO: CASCADE DELETE funcionando';
    ELSE
        PRINT '❌ ERROR: Documento no se borró en cascada';
ROLLBACK TRANSACTION;
```

### 5.3 Test de Unique Constraints

```sql
-- Test 6: Número de expediente duplicado (debe fallar)
BEGIN TRY
    INSERT INTO PPSH_SOLICITUD (num_expediente) VALUES ('TEST-001');
    INSERT INTO PPSH_SOLICITUD (num_expediente) VALUES ('TEST-001');  -- Duplicado
    PRINT '❌ ERROR: Permitió número de expediente duplicado';
END TRY
BEGIN CATCH
    PRINT '✅ CORRECTO: Unique constraint funcionando';
END CATCH
```

### 5.4 Test de Default Constraints

```sql
-- Test 7: Valores por defecto
INSERT INTO PPSH_SOLICITUD (num_expediente) VALUES ('TEST-DEFAULT');

SELECT 
    estado_actual,
    tipo_solicitud,
    fecha_solicitud
FROM PPSH_SOLICITUD 
WHERE num_expediente = 'TEST-DEFAULT';

-- Resultado esperado:
-- estado_actual: 'BORRADOR'
-- tipo_solicitud: 'INDIVIDUAL'
-- fecha_solicitud: [fecha actual]
```

---

## 6. ROLLBACK DE LA MIGRACIÓN

Si es necesario revertir los constraints:

```bash
# Rollback a migración anterior
alembic downgrade -1

# Verificar estado
alembic current
# Debería mostrar: 010_sincronizar_modelos_bd
```

El script de downgrade automáticamente:
- ✅ Elimina todos los Check Constraints
- ✅ Elimina todos los Foreign Keys
- ✅ Elimina todos los Unique Constraints
- ✅ Elimina todos los Default Constraints
- ✅ Elimina todos los índices

---

## 7. MONITOREO Y MANTENIMIENTO

### 7.1 Verificar Constraints Activos

```sql
-- Ver todos los constraints de una tabla
EXEC sp_helpconstraint 'PPSH_SOLICITUD';

-- Ver solo Check Constraints
SELECT 
    t.name AS tabla,
    c.name AS constraint_name,
    c.definition
FROM sys.check_constraints c
INNER JOIN sys.tables t ON c.parent_object_id = t.object_id
WHERE t.name = 'PPSH_SOLICITUD';
```

### 7.2 Verificar Performance de Constraints

```sql
-- Ver estadísticas de índices de unique constraints
SELECT 
    OBJECT_NAME(i.object_id) AS tabla,
    i.name AS indice,
    i.is_unique,
    s.user_seeks,
    s.user_scans,
    s.user_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s 
    ON i.object_id = s.object_id 
    AND i.index_id = s.index_id
WHERE i.is_unique = 1
ORDER BY s.user_updates DESC;
```

### 7.3 Deshabilitar Temporalmente un Constraint

```sql
-- Deshabilitar Check Constraint (para carga masiva)
ALTER TABLE PPSH_SOLICITUD NOCHECK CONSTRAINT CK_PPSH_duracion_viaje;

-- Realizar operación masiva
-- ...

-- Re-habilitar constraint
ALTER TABLE PPSH_SOLICITUD CHECK CONSTRAINT CK_PPSH_duracion_viaje;

-- Verificar que datos existentes cumplen constraint
ALTER TABLE PPSH_SOLICITUD 
WITH CHECK CHECK CONSTRAINT CK_PPSH_duracion_viaje;
```

---

## 8. CONSTRAINTS PENDIENTES (PRÓXIMA FASE)

Los siguientes constraints están documentados en Informe N°4 pero requieren implementación en fase posterior:

### 8.1 Módulo SIM_FT (6 constraints pendientes)
- Check constraints para validación de estados de trámite
- Foreign keys hacia catálogos generales
- Unique constraints para números de resolución

### 8.2 Módulo Seguridad (14 constraints pendientes)
- Check constraints para roles válidos
- Foreign keys en tabla de auditoría
- Unique constraints para códigos de roles

### 8.3 Módulo Catálogos (30 constraints pendientes)
- Check constraints para códigos ISO
- Unique constraints para códigos de catálogo
- Foreign keys entre catálogos relacionados

**Total Pendiente:** 50 constraints adicionales

---

## 9. TROUBLESHOOTING

### 9.1 Error: Constraint viola datos existentes

**Problema:**
```
The ALTER TABLE statement conflicted with the CHECK constraint "CK_PPSH_duracion_viaje"
```

**Solución:**
```sql
-- 1. Identificar registros problemáticos
SELECT * FROM PPSH_SOLICITUD 
WHERE duracion_viaje NOT BETWEEN 1 AND 180;

-- 2. Corregir datos
UPDATE PPSH_SOLICITUD 
SET duracion_viaje = 30 
WHERE duracion_viaje IS NULL OR duracion_viaje < 1 OR duracion_viaje > 180;

-- 3. Reintentar migración
```

### 9.2 Error: Foreign Key viola integridad

**Problema:**
```
The ALTER TABLE statement conflicted with the FOREIGN KEY constraint "FK_PPSH_DOC_SOLICITUD"
```

**Solución:**
```sql
-- 1. Identificar documentos huérfanos
SELECT d.* 
FROM PPSH_DOCUMENTO d
LEFT JOIN PPSH_SOLICITUD s ON d.id_solicitud = s.id_solicitud
WHERE s.id_solicitud IS NULL;

-- 2. Eliminar o corregir
DELETE FROM PPSH_DOCUMENTO 
WHERE id_solicitud NOT IN (SELECT id_solicitud FROM PPSH_SOLICITUD);

-- 3. Reintentar migración
```

### 9.3 Error: Unique Constraint viola unicidad

**Problema:**
```
Cannot create unique index on view or table 'PPSH_SOLICITUD'. 
Duplicate key error.
```

**Solución:**
```sql
-- 1. Identificar duplicados
SELECT num_expediente, COUNT(*) 
FROM PPSH_SOLICITUD 
GROUP BY num_expediente 
HAVING COUNT(*) > 1;

-- 2. Renumerar duplicados
WITH Duplicados AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY num_expediente ORDER BY id_solicitud) AS rn
    FROM PPSH_SOLICITUD
)
UPDATE Duplicados 
SET num_expediente = num_expediente + '-' + CAST(rn AS VARCHAR)
WHERE rn > 1;

-- 3. Reintentar migración
```

---

## 10. CONCLUSIONES

### 10.1 Beneficios Implementados

✅ **Integridad de Datos Garantizada**
- 19 validaciones de reglas de negocio activas
- 22 relaciones de integridad referencial protegidas
- 5 restricciones de unicidad implementadas

✅ **Performance Optimizado**
- 10 índices estratégicos agregados
- Queries de FK optimizadas con índices en columnas de join

✅ **Mantenibilidad Mejorada**
- Constraints auto-documentan reglas de negocio
- Validaciones en BD independientes de código aplicación
- Rollback automático disponible

### 10.2 Próximos Pasos

1. **Fase 2:** Implementar 50 constraints pendientes (SIM_FT, Seguridad, Catálogos)
2. **Fase 3:** Agregar triggers para validaciones complejas
3. **Fase 4:** Implementar políticas de seguridad a nivel de fila (Row-Level Security)

---

**Documento generado:** 27 de Octubre de 2025  
**Autor:** Clio Consulting - Equipo Técnico  
**Revisión:** v1.0  
**Estado:** Aprobado para implementación
