# 🚀 GUÍA DE IMPLEMENTACIÓN PASO A PASO - SIM_FT_*

**Sistema**: Trámites MVP Panamá  
**Fecha**: 2025-10-22  
**Tiempo estimado**: 15-30 minutos

---

## 📋 PRE-REQUISITOS

- [x] Backend funcionando correctamente
- [x] Base de datos accesible
- [x] Alembic configurado
- [x] Python environment activo

---

## 🎯 PASOS DE IMPLEMENTACIÓN

### ✅ PASO 1: Verificar Archivos Creados

Confirmar que todos los archivos fueron creados correctamente:

```powershell
# Verificar modelos
ls backend/app/models/models_sim_ft.py

# Verificar schemas
ls backend/app/schemas/schemas_sim_ft.py

# Verificar scripts
ls backend/load_sim_ft_data.py
ls backend/verify_sim_ft.py

# Verificar documentación
ls backend/SIM_FT_*.md
```

**Resultado esperado**: Todos los archivos existen ✅

---

### ✅ PASO 2: Verificar Migración Alembic

```powershell
cd backend

# Ver migraciones disponibles
alembic history

# Verificar estado actual
alembic current
```

**Resultado esperado**: Debe aparecer la migración `006_sistema_sim_ft_completo`

---

### ✅ PASO 3: Aplicar Migración a Base de Datos

```powershell
# IMPORTANTE: Hacer backup de la base de datos antes
# Aplicar migración
alembic upgrade head
```

**Resultado esperado**:
```
INFO  [alembic.runtime.migration] Running upgrade ... -> 006_sistema_sim_ft_completo, Implementar estructura completa SIM_FT_*
```

**⚠️ NOTA**: Si hay errores, revisar:
- Conexión a base de datos
- Permisos de usuario de BD
- Migraciones previas aplicadas

---

### ✅ PASO 4: Verificar Tablas Creadas

```powershell
# Ejecutar script de verificación
python scripts/verify_sim_ft.py
```

**Resultado esperado**:
```
================================================================================
VERIFICACIÓN DE TABLAS SIM_FT_*
================================================================================

✓ SIM_FT_TRAMITES
  - Columnas: 8
  - PK: COD_TRAMITE
  - Índices: 0
  - Registros: 0

✓ SIM_FT_PASOS
  - Columnas: 7
  - PK: COD_TRAMITE, NUM_PASO
  ...

RESUMEN:
  Tablas esperadas: 11
  Tablas existentes: 11
  Completitud: 100.0%
================================================================================
✓ TODAS LAS TABLAS SIM_FT_* ESTÁN CREADAS CORRECTAMENTE
```

---

### ✅ PASO 5: Cargar Datos Iniciales

```powershell
# Cargar catálogos iniciales
python scripts/load_sim_ft_data.py
```

**Resultado esperado**:
```
================================================================================
INICIALIZACIÓN DE DATOS DE CATÁLOGO SIM_FT_*
================================================================================

1. Inicializando Estados...
--------------------------------------------------------------------------------
✓ Estado creado: 01 - Iniciado
✓ Estado creado: 02 - En Proceso
...

2. Inicializando Conclusiones...
--------------------------------------------------------------------------------
✓ Conclusión creada: 01 - Aprobado
...

3. Inicializando Prioridades...
--------------------------------------------------------------------------------
✓ Prioridad creada: U - Urgente
...

4. Inicializando Tipos de Trámites...
--------------------------------------------------------------------------------
✓ Trámite creado: PPSH - Permiso de Protección de Seguridad Humanitaria
...

================================================================================
✓ INICIALIZACIÓN COMPLETADA EXITOSAMENTE
================================================================================
```

---

### ✅ PASO 6: Verificar Datos Cargados

```powershell
# Verificar nuevamente (ahora con datos)
python scripts/verify_sim_ft.py
```

**Resultado esperado**: Todas las tablas deben mostrar registros:
```
✓ SIM_FT_ESTATUS
  - Registros: 10

✓ SIM_FT_CONCLUSION
  - Registros: 10

✓ SIM_FT_PRIORIDAD
  - Registros: 4

✓ SIM_FT_TRAMITES
  - Registros: 4

✓ SIM_FT_PASOS
  - Registros: 5
...
```

---

### ✅ PASO 7: Probar Importación de Modelos

Crear archivo de prueba `test_sim_ft_import.py`:

```python
"""Test de importación de modelos SIM_FT_*"""

print("Probando importación de modelos SIM_FT_*...")

try:
    from app.models.models_sim_ft import (
        SimFtTramites,
        SimFtTramiteE,
        SimFtTramiteD,
        SimFtPasos,
        SimFtPasoXTram,
        SimFtEstatus,
        SimFtConclusion,
        SimFtPrioridad,
        SimFtUsuaSec,
        SimFtTramiteCierre,
        SimFtDependteCierre,
    )
    print("✓ Modelos importados correctamente")
    
    from app.schemas.schemas_sim_ft import (
        SimFtTramitesResponse,
        SimFtTramiteECreate,
        SimFtTramiteDCreate,
    )
    print("✓ Schemas importados correctamente")
    
    print("\n✓ IMPORTACIONES EXITOSAS - SISTEMA LISTO")
    
except ImportError as e:
    print(f"✗ ERROR en importación: {e}")
    exit(1)
```

Ejecutar:
```powershell
python test_sim_ft_import.py
```

**Resultado esperado**:
```
Probando importación de modelos SIM_FT_*...
✓ Modelos importados correctamente
✓ Schemas importados correctamente

✓ IMPORTACIONES EXITOSAS - SISTEMA LISTO
```

---

### ✅ PASO 8: Probar Creación de Trámite

Crear archivo de prueba `test_sim_ft_crear_tramite.py`:

```python
"""Test de creación de trámite SIM_FT_*"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.infrastructure import get_database_url
from app.models.models_sim_ft import SimFtTramiteE

print("Probando creación de trámite...")

database_url = get_database_url()
engine = create_engine(database_url)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # Crear trámite de prueba
    tramite = SimFtTramiteE(
        NUM_ANNIO=2025,
        NUM_TRAMITE=9999,  # Número de prueba
        NUM_REGISTRO=99999,  # Registro de prueba
        COD_TRAMITE="PPSH",
        FEC_INI_TRAMITE=datetime.now(),
        IND_ESTATUS="01",  # Iniciado
        IND_PRIORIDAD="N",  # Normal
        OBS_OBSERVA="Trámite de prueba del sistema SIM_FT_*",
        ID_USUARIO_CREA="SYSTEM_TEST"
    )
    
    session.add(tramite)
    session.commit()
    
    print("✓ Trámite creado exitosamente")
    print(f"  Año: {tramite.NUM_ANNIO}")
    print(f"  Número: {tramite.NUM_TRAMITE}")
    print(f"  Registro: {tramite.NUM_REGISTRO}")
    print(f"  Tipo: {tramite.COD_TRAMITE}")
    
    # Consultar trámite creado
    tramite_consultado = session.query(SimFtTramiteE).filter_by(
        NUM_ANNIO=2025,
        NUM_TRAMITE=9999,
        NUM_REGISTRO=99999
    ).first()
    
    if tramite_consultado:
        print("✓ Trámite consultado exitosamente")
    
    # Eliminar trámite de prueba
    session.delete(tramite_consultado)
    session.commit()
    print("✓ Trámite de prueba eliminado")
    
    print("\n✓ PRUEBA COMPLETADA - SISTEMA FUNCIONAL")
    
except Exception as e:
    print(f"✗ ERROR: {e}")
    session.rollback()
    exit(1)
finally:
    session.close()
```

Ejecutar:
```powershell
python test_sim_ft_crear_tramite.py
```

**Resultado esperado**:
```
Probando creación de trámite...
✓ Trámite creado exitosamente
  Año: 2025
  Número: 9999
  Registro: 99999
  Tipo: PPSH
✓ Trámite consultado exitosamente
✓ Trámite de prueba eliminado

✓ PRUEBA COMPLETADA - SISTEMA FUNCIONAL
```

---

## ✅ CHECKLIST FINAL

Marcar cada paso completado:

- [ ] **Paso 1**: Archivos verificados
- [ ] **Paso 2**: Migración verificada
- [ ] **Paso 3**: Migración aplicada
- [ ] **Paso 4**: Tablas verificadas (11/11)
- [ ] **Paso 5**: Datos cargados
- [ ] **Paso 6**: Datos verificados
- [ ] **Paso 7**: Importaciones probadas
- [ ] **Paso 8**: CRUD probado

---

## 🎯 RESULTADO ESPERADO

Al completar todos los pasos:

✅ 11 tablas SIM_FT_* creadas  
✅ 15+ índices optimizados  
✅ 15+ relaciones (FK) definidas  
✅ Datos de catálogo cargados:
  - 10 Estados
  - 10 Conclusiones
  - 4 Prioridades
  - 4 Tipos de trámites
  - 5 Pasos PPSH
  - Configuración de flujo

✅ **Sistema SIM_FT_* 100% funcional**

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No module named 'app.models.models_sim_ft'"

**Solución**:
```powershell
# Verificar que el archivo existe
ls backend/app/models/models_sim_ft.py

# Verificar que __init__.py exporta el módulo
cat backend/app/models/__init__.py
# Debe contener: from .models_sim_ft import *
```

### Error: "Table 'SIM_FT_TRAMITES' doesn't exist"

**Solución**:
```powershell
# Verificar migración
alembic current

# Si no está aplicada
alembic upgrade head
```

### Error: "IntegrityError: foreign key constraint fails"

**Solución**:
```powershell
# Cargar datos de catálogo primero
python scripts/load_sim_ft_data.py

# Luego intentar crear trámites
```

### Error en conexión a base de datos

**Solución**:
```powershell
# Verificar configuración en .env
cat .env | grep DATABASE

# Verificar que la BD está corriendo
docker-compose ps
# o verificar servicio de BD según tu configuración
```

---

## 📊 VALIDACIÓN FINAL

### Consulta SQL Manual

```sql
-- Verificar tablas creadas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE 'SIM_FT_%'
ORDER BY TABLE_NAME;

-- Resultado esperado: 11 tablas

-- Verificar datos de catálogo
SELECT COUNT(*) as total_estados FROM SIM_FT_ESTATUS;
-- Resultado esperado: 10

SELECT COUNT(*) as total_tramites FROM SIM_FT_TRAMITES;
-- Resultado esperado: 4

SELECT COUNT(*) as total_pasos FROM SIM_FT_PASOS;
-- Resultado esperado: 5
```

---

## 🎓 PRÓXIMOS PASOS

Una vez completada la implementación:

1. **Crear endpoints API** (routes_sim_ft.py)
2. **Implementar servicios** (service_sim_ft.py)
3. **Desarrollar tests** (test_sim_ft.py)
4. **Migrar datos legacy** (si aplica)
5. **Documentar API** (OpenAPI/Swagger)

Ver `SIM_FT_IMPLEMENTATION.md` para más detalles.

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisar logs de Alembic
2. Verificar permisos de BD
3. Consultar `SIM_FT_IMPLEMENTATION.md`
4. Revisar `SIM_FT_COMPARACION_ANTES_DESPUES.md`

---

## ✅ CONFIRMACIÓN DE ÉXITO

Si todos los pasos se completaron exitosamente, deberías poder:

- ✅ Importar todos los modelos SIM_FT_*
- ✅ Consultar tablas de catálogo
- ✅ Crear trámites
- ✅ Registrar pasos
- ✅ Ver relaciones funcionando

**¡Sistema SIM_FT_* listo para desarrollo!** 🎉

---

**Preparado por**: Sistema de Trámites MVP Panamá  
**Fecha**: 2025-10-22  
**Versión**: 1.0

