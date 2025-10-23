# 📋 Cadena de Migraciones Alembic

**Actualizado:** 22 de Octubre de 2025

Este documento describe la secuencia ordenada de migraciones de la base de datos del sistema de Trámites MVP Panamá.

---

## 🔗 Cadena de Migraciones

```
002_actualizar_tipos_documento_ppsh
    ↓
003_agregar_categoria_tipo_documento
    ↓
004_workflow_dinamico
    ↓
005_nomenclatura
    ↓
006_sistema_sim_ft_completo
```

---

## 📝 Detalle de Migraciones

### Migración 002: Actualizar Tipos de Documento PPSH
**Archivo:** `002_actualizar_tipos_documento_ppsh.py`
**Revision ID:** `002_actualizar_tipos_documento_ppsh`
**Depende de:** `None` (migración inicial)
**Fecha:** 2025-10-17 16:00:00

**Descripción:**
Actualiza el catálogo de tipos de documentos PPSH según el Decreto N° 6 del 11 de Marzo del 2025. Define la lista oficial de requisitos para Permiso de Protección de Seguridad Humanitaria.

**Cambios:**
- Actualiza tabla `PPSH_TIPO_DOCUMENTO`
- Define tipos de documentos oficiales según decreto
- Establece requisitos obligatorios

---

### Migración 003: Agregar Categoría a Tipos de Documento
**Archivo:** `003_agregar_categoria_tipo_documento.py`
**Revision ID:** `003_agregar_categoria_tipo_documento`
**Depende de:** `002_actualizar_tipos_documento_ppsh`
**Fecha:** 2025-10-17 16:15:00

**Descripción:**
Agrega campo 'categoria' a la tabla PPSH_TIPO_DOCUMENTO para mejor organización de los tipos de documentos.

**Cambios:**
- Agrega columna `categoria` (String 20)
- Categorías: LEGAL, IDENTIFICACION, DOMICILIO, ANTECEDENTES, MEDICO, LABORAL, MENORES, PAGO
- Actualiza registros existentes con categorías apropiadas

---

### Migración 004: Sistema de Workflow Dinámico
**Archivo:** `004_workflow_dinamico.py`
**Revision ID:** `004_workflow_dinamico`
**Depende de:** `003_agregar_categoria_tipo_documento`
**Fecha:** 2025-10-20 15:00:00

**Descripción:**
Implementa el sistema completo de workflow dinámico para gestión de procesos y flujos de trabajo configurables.

**Cambios - Tablas Creadas:**
1. `workflow` - Definición de workflows
2. `workflow_etapa` - Etapas del workflow
3. `workflow_conexion` - Conexiones entre etapas
4. `workflow_pregunta` - Preguntas en etapas
5. `workflow_instancia` - Instancias ejecutadas
6. `workflow_respuesta_etapa` - Respuestas por etapa
7. `workflow_respuesta` - Respuestas a preguntas
8. `workflow_instancia_historial` - Historial de cambios
9. `workflow_comentario` - Comentarios en instancias

**Características:**
- Workflows versionados
- Etapas con tipos (INICIO, PROCESO, DECISION, FIN)
- Sistema de preguntas dinámicas
- Historial de auditoría completo
- Comentarios con threading

---

### Migración 005: Convenciones de Nomenclatura
**Archivo:** `005_nomenclatura.py`
**Revision ID:** `005_nomenclatura`
**Depende de:** `004_workflow_dinamico`
**Fecha:** 2025-10-22 12:00:00

**Descripción:**
Aplica convenciones de nomenclatura de base de datos, renombrando tablas workflow a mayúsculas según estándares corporativos.

**Cambios:**
- `workflow` → `WORKFLOW`
- `workflow_etapa` → `WORKFLOW_ETAPA`
- `workflow_conexion` → `WORKFLOW_CONEXION`
- `workflow_pregunta` → `WORKFLOW_PREGUNTA`
- `workflow_instancia` → `WORKFLOW_INSTANCIA`
- `workflow_respuesta_etapa` → `WORKFLOW_RESPUESTA_ETAPA`
- `workflow_respuesta` → `WORKFLOW_RESPUESTA`
- `workflow_instancia_historial` → `WORKFLOW_INSTANCIA_HISTORIAL`
- `workflow_comentario` → `WORKFLOW_COMENTARIO`

---

### Migración 006: Sistema SIM_FT Completo
**Archivo:** `006_sistema_sim_ft_completo.py`
**Revision ID:** `006_sistema_sim_ft_completo`
**Depende de:** `005_nomenclatura`
**Fecha:** 2025-10-22 23:57:44

**Descripción:**
Implementa la estructura completa del Sistema Integrado de Migración (SIM_FT_*) para gestión de flujo de trámites migratorios.

**Cambios - Tablas Creadas:**

#### 1. Tabla de Tipos de Trámites
- `SIM_FT_TRAMITES` (renombrada de `tramites`)

#### 2. Tablas Transaccionales Principales
- `SIM_FT_TRAMITE_E` - Encabezado de trámites
- `SIM_FT_TRAMITE_D` - Detalle de pasos del flujo

#### 3. Tablas de Configuración
- `SIM_FT_PASOS` - Definición de pasos por tipo de trámite
- `SIM_FT_PASOXTRAM` - Configuración de flujo de pasos
- `SIM_FT_USUA_SEC` - Asignación usuarios-secciones-agencias

#### 4. Catálogos Simples
- `SIM_FT_ESTATUS` - Estados de trámites (10 registros iniciales)
- `SIM_FT_CONCLUSION` - Tipos de conclusión (10 registros iniciales)
- `SIM_FT_PRIORIDAD` - Niveles de prioridad (4 registros iniciales)

#### 5. Tablas de Cierre
- `SIM_FT_TRAMITE_CIERRE` - Cierre de trámites
- `SIM_FT_DEPENDTE_CIERRE` - Dependientes incluidos en cierre

**Índices Creados:** 15 índices para optimización

**Datos Iniciales:**
- 10 estados (Iniciado, En Proceso, Aprobado, etc.)
- 10 conclusiones (Aprobado, Rechazado, etc.)
- 4 prioridades (Alta, Media, Baja, Urgente)

---

## 🔍 Verificación de Migraciones

### Ver estado actual
```bash
docker exec tramites-backend-temp alembic current
```

### Ver historial completo
```bash
docker exec tramites-backend-temp alembic history --verbose
```

### Aplicar todas las migraciones
```bash
docker exec tramites-backend-temp alembic upgrade head
```

### Revertir última migración
```bash
docker exec tramites-backend-temp alembic downgrade -1
```

### Revertir a versión específica
```bash
docker exec tramites-backend-temp alembic downgrade 005_nomenclatura
```

---

## 📊 Resumen de Base de Datos

### Total de Tablas Creadas
- **PPSH:** ~8 tablas (sistema de solicitudes humanitarias)
- **Workflow:** 9 tablas (sistema de workflows dinámicos)
- **SIM_FT:** 11 tablas (sistema de flujo de trámites)
- **Total:** ~28 tablas principales

### Registros de Catálogo Iniciales
- Tipos de documento PPSH: ~20 registros
- Estados workflow: Según configuración
- Estados SIM_FT: 10 registros
- Conclusiones SIM_FT: 10 registros
- Prioridades SIM_FT: 4 registros

---

## 🎯 Convenciones de Nomenclatura

### Archivos de Migración
**Formato:** `NNN_descripcion_clara.py`

Donde:
- `NNN` = Número secuencial (002, 003, 004, etc.)
- `descripcion_clara` = Nombre descriptivo en minúsculas con guiones bajos

**Ejemplos:**
- ✅ `002_actualizar_tipos_documento_ppsh.py`
- ✅ `003_agregar_categoria_tipo_documento.py`
- ✅ `006_sistema_sim_ft_completo.py`
- ❌ `88ea061b1ac5_implementar_estructura.py` (hash aleatorio)

### Revision IDs
**Formato:** Debe coincidir con el nombre del archivo (sin `.py`)

```python
revision = '006_sistema_sim_ft_completo'
```

### Tablas
**Formato:** 
- Tablas principales: `MAYUSCULAS_CON_GUIONES`
- Catálogos SIM_FT: `SIM_FT_NOMBRE`
- Tablas workflow: `WORKFLOW_NOMBRE`
- Tablas PPSH: `PPSH_NOMBRE` o `PPSH_NombreCamelCase`

---

## 🚀 Flujo de Trabajo

### Crear Nueva Migración

```bash
# 1. Generar archivo de migración
docker exec tramites-backend-temp alembic revision -m "descripcion de cambio"

# 2. Renombrar archivo generado
# De: abc123def456_descripcion_de_cambio.py
# A:  007_descripcion_de_cambio.py

# 3. Actualizar revision ID en el archivo
revision = '007_descripcion_de_cambio'

# 4. Implementar upgrade() y downgrade()

# 5. Probar migración
docker exec tramites-backend-temp alembic upgrade head
```

---

## 📚 Referencias

- **Alembic Documentation:** https://alembic.sqlalchemy.org/
- **SQLAlchemy Documentation:** https://docs.sqlalchemy.org/
- **Convenciones de BD:** Consultar documento de arquitectura del proyecto

---

## ⚠️ Notas Importantes

1. **Nunca editar migraciones aplicadas** - Crear nueva migración para cambios
2. **Siempre probar downgrade()** - Asegurar reversibilidad
3. **Documentar cambios** - Agregar comentarios descriptivos
4. **Mantener orden secuencial** - Números consecutivos sin saltos
5. **Usar nombres claros** - Evitar hashes autogenerados

---

**Última Actualización:** 22 de Octubre de 2025
**Versión Actual:** 006_sistema_sim_ft_completo
