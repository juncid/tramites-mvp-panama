# 🎯 Guía Rápida - Datos de Prueba en Testing

## ✅ ¿Qué se creó?

### 1. Script de Carga de Datos: `backend/load_test_data.py`

Este script carga **automáticamente**:

#### 📦 Catálogos PPSH (27 registros)
- ✅ **7 Causas Humanitarias**
  - Conflicto Armado
  - Persecución Política
  - Violencia de Género
  - Desastre Natural
  - Violencia Doméstica
  - Persecución Religiosa
  - Trata de Personas

- ✅ **8 Tipos de Documento**
  - Pasaporte (obligatorio)
  - Certificado de Nacimiento (obligatorio)
  - Antecedentes Penales (obligatorio)
  - Certificado Médico (obligatorio)
  - Fotografía (obligatorio)
  - Carta de Motivación (opcional)
  - Pruebas Documentales (opcional)
  - Certificado Económico (opcional)

- ✅ **9 Estados de Solicitud**
  - Borrador
  - Pendiente
  - En Revisión
  - Documentación Incompleta
  - Entrevista Programada
  - En Evaluación
  - Aprobada
  - Rechazada
  - Cancelada

- ✅ **3 Conceptos de Pago**
  - Solicitud de PPSH: $50.00
  - Renovación de PPSH: $75.00
  - Duplicado de Documento: $25.00

#### 👥 Datos de Ejemplo PPSH (6 registros)
- ✅ **3 Solicitantes**
  - Juan Pérez (Conflicto Armado) - Solicitud PENDIENTE
  - María López (Violencia de Género) - Solicitud EN_REVISION
  - Carlos Rodríguez (Persecución Política) - Solicitud APROBADA

- ✅ **3 Solicitudes PPSH**
  - PPSH-2025-0001 (Pendiente)
  - PPSH-2025-0002 (En Revisión)
  - PPSH-2025-0003 (Aprobada)

#### 🔄 Workflows Completos (2 workflows)
- ✅ **Workflow PPSH** (WF_PPSH_001)
  - 5 etapas conectadas
  - Registro Inicial → Carga Documentos → Revisión → Entrevista → Evaluación
  - Con preguntas configuradas
  - Conexiones entre etapas definidas

- ✅ **Workflow General** (WF_TRAMITE_001)
  - 3 etapas conectadas
  - Solicitud → Revisión → Resolución

---

## 🚀 Cómo Usar

### Opción 1: Ejecución Automática (Recomendado)

El script **ya está integrado** en `docker-compose.api-tests.yml`:

```powershell
# Levantar todo el ambiente y ejecutar tests
docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit

# Limpiar después
docker-compose -f docker-compose.api-tests.yml down
```

✅ Los datos se cargan **automáticamente** al iniciar el backend de test.

### Opción 2: Ejecución Manual (Si necesitas recargar datos)

```powershell
# 1. Levantar solo base de datos y backend
docker-compose -f docker-compose.api-tests.yml up -d db-test redis-test backend-test

# 2. Esperar a que backend esté listo
Start-Sleep -Seconds 15

# 3. Ejecutar script de carga manual
docker exec tramites-backend-test python load_test_data.py

# 4. Verificar datos
docker exec -it tramites-db-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -d SIM_PANAMA -C -Q "SELECT COUNT(*) FROM PPSH_CAUSA_HUMANITARIA; SELECT COUNT(*) FROM PPSH_SOLICITUD; SELECT COUNT(*) FROM workflow;"
```

### Opción 3: Desarrollo - Solo Backend

Si estás desarrollando y quieres recargar datos sin reiniciar todo:

```powershell
# Conectarse al contenedor del backend
docker exec -it tramites-backend-test bash

# Dentro del contenedor, ejecutar:
python load_test_data.py

# Ver salida en tiempo real
```

---

## 📊 Verificación de Datos

### Queries SQL de Verificación

```sql
-- Conectarse a la BD
docker exec -it tramites-db-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -d SIM_PANAMA -C

-- Verificar catálogos PPSH
SELECT 'Causas' AS tipo, COUNT(*) AS total FROM PPSH_CAUSA_HUMANITARIA
UNION ALL SELECT 'Tipos Doc', COUNT(*) FROM PPSH_TIPO_DOCUMENTO
UNION ALL SELECT 'Estados', COUNT(*) FROM PPSH_ESTADO
UNION ALL SELECT 'Conceptos Pago', COUNT(*) FROM PPSH_CONCEPTO_PAGO;
GO

-- Ver solicitudes PPSH
SELECT 
    s.numero_solicitud,
    sol.nombres + ' ' + sol.apellido_paterno AS solicitante,
    c.nombre AS causa,
    e.nombre AS estado
FROM PPSH_SOLICITUD s
JOIN PPSH_SOLICITANTE sol ON s.id_solicitante = sol.id_solicitante
JOIN PPSH_CAUSA_HUMANITARIA c ON s.cod_causa_humanitaria = c.cod_causa
JOIN PPSH_ESTADO e ON s.cod_estado = e.cod_estado;
GO

-- Ver workflows
SELECT 
    w.codigo,
    w.nombre,
    COUNT(e.id_etapa) AS num_etapas,
    COUNT(c.id_conexion) AS num_conexiones
FROM workflow w
LEFT JOIN workflow_etapa e ON w.id_workflow = e.id_workflow
LEFT JOIN workflow_conexion c ON w.id_workflow = c.id_workflow
GROUP BY w.codigo, w.nombre;
GO
```

### Verificación desde la API

```powershell
# Health check
curl http://localhost:8001/health

# Listar causas humanitarias
curl http://localhost:8001/api/v1/ppsh/causas-humanitarias

# Listar tipos de documento
curl http://localhost:8001/api/v1/ppsh/tipos-documento

# Listar estados
curl http://localhost:8001/api/v1/ppsh/estados

# Listar workflows
curl http://localhost:8001/api/v1/workflow/workflows
```

---

## 🎯 Resultados Esperados

### Antes (Sin load_test_data.py)
```
❌ PPSH API: 28 requests, 46 assertions FALLARON
   Causa: Catálogos vacíos
   
⚠️  Workflow API: 29 requests, 5 assertions FALLARON
   Causa: Sin workflows precreados
   
✅ Trámites Base: 13 requests, 30 assertions PASARON
```

### Después (Con load_test_data.py)
```
✅ PPSH API: 28 requests, ~40+ assertions PASAN
   - Listar catálogos funciona
   - Crear solicitudes funciona
   - Consultar estados funciona
   
✅ Workflow API: 29 requests, ~25+ assertions PASAN
   - Listar workflows funciona
   - Crear instancias funciona
   - Transiciones entre etapas funciona
   
✅ Trámites Base: 13 requests, 30 assertions PASAN
   - Sin cambios (ya funcionaba)
```

---

## 🔧 Personalización

### Agregar Más Datos

Edita `backend/load_test_data.py`:

```python
# Agregar más causas humanitarias
causas = [
    ("NUEVA_CAUSA", "Nombre Causa", "Descripción", 1),
    # ... más causas
]

# Agregar más solicitantes
solicitantes = [
    ("Nombre", "Apellido", "Apellido2", "Doc", "email", "tel", "CAUSA"),
    # ... más solicitantes
]
```

### Crear Workflows Personalizados

En la función `load_workflow_sample_data()`:

```python
# Agregar nuevo workflow
session.execute(text("""
    INSERT INTO workflow (codigo, nombre, descripcion, tipo_tramite, activo)
    VALUES ('WF_CUSTOM_001', 'Mi Workflow', 'Descripción', 'TIPO', 1)
"""))

# Agregar etapas
# ... definir etapas y conexiones
```

---

## 🐛 Troubleshooting

### Problema: Script no se ejecuta

```powershell
# Ver logs del backend
docker logs tramites-backend-test

# Buscar línea:
# "🎲 Cargando datos de prueba completos..."
```

### Problema: Datos duplicados

El script usa `IF NOT EXISTS` para **evitar duplicados**. Es seguro ejecutarlo múltiples veces.

### Problema: Error de conexión a BD

```powershell
# Verificar que BD esté lista
docker exec tramites-db-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -Q "SELECT 1" -C

# Si falla, esperar más tiempo o reiniciar
docker-compose -f docker-compose.api-tests.yml restart db-test
```

### Problema: Quiero empezar de cero

```powershell
# Borrar volúmenes y empezar limpio
docker-compose -f docker-compose.api-tests.yml down -v

# Volver a levantar (datos se cargan automáticamente)
docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit
```

---

## 📈 Flujo Completo de Testing

```
┌─────────────────────────────────────────────────────────────┐
│ 1. docker-compose up                                        │
│    ↓                                                         │
│ 2. SQL Server inicia (30s aprox)                            │
│    ↓                                                         │
│ 3. Backend inicia                                           │
│    ↓                                                         │
│ 4. init_database.py - Crea tablas (35 tablas)              │
│    ↓                                                         │
│ 5. load_initial_data.py - Datos básicos (países, usuarios) │
│    ↓                                                         │
│ 6. load_test_data.py - Datos de prueba (NUEVO!) ✨         │
│    ├─ Catálogos PPSH (27 registros)                        │
│    ├─ Solicitudes de ejemplo (3 + 3 registros)             │
│    └─ Workflows completos (2 workflows con etapas)         │
│    ↓                                                         │
│ 7. FastAPI server ready (puerto 8001)                      │
│    ↓                                                         │
│ 8. Newman ejecuta tests                                     │
│    ├─ PPSH API ✅                                           │
│    ├─ Workflow API ✅                                       │
│    └─ Trámites Base API ✅                                  │
│    ↓                                                         │
│ 9. Reportes HTML generados en ./test-reports/              │
│    ↓                                                         │
│ 10. Report Viewer disponible en http://localhost:8080      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 Beneficios

1. ✅ **Tests Completos**: Todos los módulos ahora tienen datos para probar
2. ✅ **Automatizado**: Se ejecuta solo al levantar el ambiente
3. ✅ **Idempotente**: Puedes ejecutarlo múltiples veces sin problemas
4. ✅ **Realista**: Datos de ejemplo representan casos de uso reales
5. ✅ **Extensible**: Fácil agregar más datos personalizados
6. ✅ **Verificable**: Queries SQL incluidas para validación

---

## 📚 Archivos Relacionados

- `backend/load_test_data.py` - Script principal de carga
- `backend/init_database.py` - Inicialización de tablas
- `backend/load_initial_data.py` - Datos básicos (países, usuarios)
- `docker-compose.api-tests.yml` - Configuración de testing
- `DATABASE_TEST_INFO.md` - Documentación completa de la BD

---

## 🚀 Próximo Paso

```powershell
# ¡Ejecuta los tests con datos completos!
docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit

# Espera a que termine y revisa:
# - Logs de ejecución (salida de consola)
# - Reportes HTML en http://localhost:8080
```

**¡Ahora todos los tests deberían pasar al 100%! 🎯**

---

**Creado por**: GitHub Copilot  
**Fecha**: 21 de Octubre, 2025  
**Versión**: 1.0
