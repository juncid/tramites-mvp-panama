# 📊 Base de Datos de Testing - Información y Contenido

## Fecha: 21 de Octubre, 2025

---

## ✅ Respuesta a tu Pregunta: ¿La base de datos de API test tiene información?

**SÍ**, la base de datos de test `SIM_PANAMA` tiene información inicial cargada automáticamente.

---

## 📦 Contenido de la Base de Datos de Test

### 🗄️ Base de Datos
- **Nombre**: `SIM_PANAMA`
- **Motor**: SQL Server 2019
- **Inicialización**: Automática al arrancar los contenedores
- **Script**: `/app/bbdd/init_database.sql`

---

## 📋 Tablas Creadas (35 tablas)

### 🔹 Módulo PPSH (Permiso Por razones de Seguridad Humanitaria)
```
✅ PPSH_CAUSA_HUMANITARIA      - Catálogo de causas humanitarias
✅ PPSH_COMENTARIO             - Comentarios en solicitudes
✅ PPSH_CONCEPTO_PAGO          - Conceptos de pago
✅ PPSH_DOCUMENTO              - Documentos adjuntos
✅ PPSH_ENTREVISTA             - Entrevistas programadas
✅ PPSH_ESTADO                 - Estados del proceso
✅ PPSH_ESTADO_HISTORIAL       - Historial de cambios de estado
✅ PPSH_PAGO                   - Pagos realizados
✅ PPSH_SOLICITANTE            - Datos de solicitantes
✅ PPSH_SOLICITUD              - Solicitudes PPSH
✅ PPSH_TIPO_DOCUMENTO         - Tipos de documentos
```

### 🔹 Módulo Workflow Dinámico
```
✅ workflow                     - Definiciones de workflows
✅ workflow_comentario          - Comentarios en instancias
✅ workflow_conexion            - Conexiones entre etapas
✅ workflow_etapa               - Etapas de workflows
✅ workflow_instancia           - Instancias de workflow
✅ workflow_instancia_historial - Historial de instancias
✅ workflow_pregunta            - Preguntas por etapa
✅ workflow_respuesta           - Respuestas de usuarios
✅ workflow_respuesta_etapa     - Respuestas por etapa
```

### 🔹 Módulo de Trámites Base
```
✅ tramites                     - Trámites disponibles
```

### 🔹 Módulo de Seguridad
```
✅ SEG_TB_ERROR_LOG            - Log de errores
✅ SEG_TB_ROLES                - Roles del sistema
✅ SEG_TB_USUA_ROLE            - Relación usuarios-roles
✅ SEG_TB_USUARIOS             - Usuarios del sistema
```

### 🔹 Catálogos Generales
```
✅ SIM_GE_AGENCIA              - Agencias/Oficinas
✅ SIM_GE_CONTINENTE           - Continentes
✅ SIM_GE_EST_CIVIL            - Estados civiles
✅ SIM_GE_PAIS                 - Países (7 registros)
✅ SIM_GE_REGION               - Regiones
✅ SIM_GE_SECCION              - Secciones
✅ SIM_GE_SEXO                 - Sexos
✅ SIM_GE_TIPO_MOV             - Tipos de movimiento
✅ SIM_GE_VIA_TRANSP           - Vías de transporte
✅ sc_log                      - Log del sistema
```

---

## 📈 Datos Iniciales Cargados

### ✅ Trámites Base (5 registros activos)

| ID | Título | Estado |
|----|--------|--------|
| 1 | Solicitud de Visa de Turismo | en_proceso |
| 2 | Renovación de Carnet de Residente | completado |
| 3 | Prórroga de Estadía Turística | pendiente |
| 4 | Solicitud de Naturalización | en_revision |
| 6 | Solicitud de Visa de Turista | ACTIVO |

**Nota**: El ID 6 es un registro creado durante los tests de Newman.

### ✅ Usuarios (1 registro)
- Usuario `admin` creado con contraseña `admin123`
- ⚠️ **Importante**: Cambiar en producción

### ✅ Países (7 registros)
- Datos de países precargados para catálogos

### ❌ Catálogos PPSH (0 registros)
Los catálogos de PPSH están **VACÍOS**:
- `PPSH_CAUSA_HUMANITARIA`: 0 registros
- `PPSH_TIPO_DOCUMENTO`: 0 registros
- `PPSH_ESTADO`: 0 registros

### ❌ Solicitudes PPSH (0 registros)
- No hay solicitudes PPSH precargadas

---

## 🔄 Comportamiento Durante los Tests

### Durante la Ejecución de Newman:
1. **Trámites Base**: ✅ Tests pasan correctamente
   - Se crean nuevos trámites (IDs 5 y 6)
   - Se actualizan y eliminan (soft delete)
   - **30 assertions** ejecutadas exitosamente

2. **PPSH**: ⚠️ Mayormente fallan
   - **Causa**: Catálogos vacíos (sin causas, tipos de documento, estados)
   - Los tests intentan listar catálogos pero obtienen arrays vacíos
   - No se pueden crear solicitudes sin datos de catálogo

3. **Workflow**: ⚠️ Algunos tests fallan
   - Fallan los tests que intentan crear workflows/instancias
   - No hay workflows precreados en la BD

---

## 🚀 Cómo Poblar la Base de Datos con Datos de Prueba

### Opción 1: Script Manual SQL
Crear un script `load_test_data.sql` con:

```sql
-- Insertar Causas Humanitarias
INSERT INTO PPSH_CAUSA_HUMANITARIA (cod_causa, descripcion, activo) VALUES
('CONF_ARM', 'Conflicto Armado', 1),
('PERS_POL', 'Persecución Política', 1),
('VIOL_GEN', 'Violencia de Género', 1),
('DESAST_NAT', 'Desastre Natural', 1);

-- Insertar Tipos de Documento
INSERT INTO PPSH_TIPO_DOCUMENTO (cod_tipo, nombre, es_obligatorio, activo) VALUES
('PASAPORTE', 'Pasaporte', 1, 1),
('CERT_NAC', 'Certificado de Nacimiento', 1, 1),
('ANTEC_PEN', 'Antecedentes Penales', 1, 1),
('CERT_MED', 'Certificado Médico', 0, 1);

-- Insertar Estados
INSERT INTO PPSH_ESTADO (cod_estado, nombre, descripcion, activo) VALUES
('PENDIENTE', 'Pendiente', 'Solicitud recién creada', 1),
('EN_REVISION', 'En Revisión', 'Bajo revisión de funcionario', 1),
('APROBADA', 'Aprobada', 'Solicitud aprobada', 1),
('RECHAZADA', 'Rechazada', 'Solicitud rechazada', 1);
```

### Opción 2: Archivo Python
Crear `backend/load_ppsh_test_data.py`:

```python
from app.database import get_db
from sqlalchemy import text

def load_ppsh_catalogs():
    db = next(get_db())
    
    # Causas Humanitarias
    causas = [
        ("CONF_ARM", "Conflicto Armado"),
        ("PERS_POL", "Persecución Política"),
        ("VIOL_GEN", "Violencia de Género"),
        ("DESAST_NAT", "Desastre Natural")
    ]
    
    for cod, desc in causas:
        db.execute(text(
            "INSERT INTO PPSH_CAUSA_HUMANITARIA (cod_causa, descripcion, activo) "
            "VALUES (:cod, :desc, 1)"
        ), {"cod": cod, "desc": desc})
    
    # ... más inserts ...
    
    db.commit()
    print("✅ Catálogos PPSH cargados")

if __name__ == "__main__":
    load_ppsh_catalogs()
```

### Opción 3: Modificar `init_database.sql`
Editar `backend/bbdd/init_database.sql` y agregar los INSERT al final.

---

## 📝 Recomendaciones

### Para Testing Completo:

1. **Agregar Datos de Catálogos PPSH**
   ```bash
   # Crear script de carga
   docker exec tramites-backend-test python /app/load_ppsh_test_data.py
   ```

2. **Crear Workflows de Ejemplo**
   - Agregar al menos 1 workflow con etapas y conexiones
   - Permitirá probar el módulo de workflow completamente

3. **Crear Solicitudes PPSH de Ejemplo**
   - Con todos los estados posibles
   - Con documentos adjuntos
   - Con entrevistas programadas

4. **Automatizar Carga de Datos**
   - Modificar `docker-compose.api-tests.yml`
   - Agregar comando `load_test_data.py` después de `init_database.py`

---

## 🔍 Cómo Consultar la Base de Datos

### Conectarse al contenedor:
```powershell
docker exec -it tramites-db-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -d SIM_PANAMA -C
```

### Queries útiles:
```sql
-- Ver todas las tablas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';

-- Contar registros en cada tabla
SELECT 'tramites' AS tabla, COUNT(*) AS total FROM tramites
UNION ALL
SELECT 'PPSH_SOLICITUD', COUNT(*) FROM PPSH_SOLICITUD
UNION ALL
SELECT 'workflow', COUNT(*) FROM workflow;

-- Ver estructura de una tabla
EXEC sp_help 'PPSH_SOLICITUD';

-- Ver índices de una tabla
EXEC sp_helpindex 'PPSH_SOLICITUD';
```

---

## 📊 Resultado de los Tests con la BD Actual

### ✅ Trámites Base API
- **Requests**: 13/13 ejecutados
- **Assertions**: 30/30 pasadas ✅
- **Duración**: ~3 segundos
- **Estado**: **100% EXITOSO**

### ⚠️ PPSH API
- **Requests**: 28/28 ejecutados
- **Assertions**: 46 ejecutadas, 46 fallaron ❌
- **Duración**: ~0.4 segundos
- **Estado**: **FALLA por falta de datos**
- **Causa**: Catálogos vacíos

### ⚠️ Workflow API
- **Requests**: 29/29 ejecutados  
- **Assertions**: 10 ejecutadas, 5 fallaron ❌
- **Duración**: ~9.3 segundos
- **Estado**: **FALLA PARCIAL**
- **Causa**: No hay workflows ni instancias precreadas

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ **Crear script de población de datos**
   - `load_test_data.sql` o `load_test_data.py`
   
2. ✅ **Integrar en docker-compose.api-tests.yml**
   ```yaml
   command:
     - sh -c "
         python init_database.py &&
         python load_test_data.py &&  # NUEVO
         uvicorn app.main:app --host 0.0.0.0 --port 8000
       "
   ```

3. ✅ **Re-ejecutar tests**
   - Verificar que todos los módulos pasen al 100%

4. ✅ **Documentar datos de prueba**
   - Qué registros se crean
   - IDs esperados
   - Estados válidos

---

## 📞 Credenciales de Acceso

### Base de Datos de Test
- **Host**: `localhost` (desde dentro del contenedor) / `db-test` (desde otros contenedores)
- **Puerto**: `1434` (host) / `1433` (interno)
- **Usuario**: `sa`
- **Password**: `TestP@ssw0rd2025!`
- **Base de Datos**: `SIM_PANAMA`

### Usuario del Sistema
- **Usuario**: `admin`
- **Password**: `admin123`
- **Rol**: Administrador
- ⚠️ **Cambiar en producción**

---

**Resumen Ejecutivo**: La base de datos de test **SÍ tiene información**, pero es **mínima**. Tiene:
- ✅ Estructura completa (35 tablas)
- ✅ 5 trámites base
- ✅ 1 usuario admin
- ✅ 7 países
- ❌ **Catálogos PPSH vacíos**
- ❌ **Sin workflows precreados**
- ❌ **Sin solicitudes PPSH**

Para testing completo, se recomienda **agregar un script de carga de datos de prueba**.

---

**Creado por**: GitHub Copilot  
**Fecha**: 21 de Octubre, 2025  
**Versión**: 1.0
