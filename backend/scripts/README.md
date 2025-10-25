# 🐍 Scripts de Utilidades

Este directorio contiene scripts Python para mantenimiento, migración y verificación del sistema.

## 📦 Categorías de Scripts

### Inicialización y Carga de Datos

#### `init_database.py`
Inicializa la base de datos creando todas las tablas necesarias.
```bash
python scripts/init_database.py
```

#### `load_initial_data.py`
Carga datos iniciales básicos en el sistema.
```bash
python scripts/load_initial_data.py
```

#### `load_sim_ft_data.py`
Carga datos iniciales específicos del sistema SIM_FT (estados, conclusiones, prioridades).
```bash
python scripts/load_sim_ft_data.py
```

#### `load_ppsh_data.py`
Carga datos iniciales del sistema PPSH (causas humanitarias, tipos de documentos).
```bash
python scripts/load_ppsh_data.py
```

#### `load_test_data.py`
Carga datos de prueba para testing.
```bash
python scripts/load_test_data.py
```

---

### Migración de Datos

#### `migrate_ppsh.py`
Migra datos del sistema PPSH desde estructura antigua.
```bash
python scripts/migrate_ppsh.py
```

#### `migrate_ppsh_documentos.py`
Migra específicamente documentos PPSH.
```bash
python scripts/migrate_ppsh_documentos.py
```

#### `migrate_green_to_blue.py`
Script de migración entre ambientes green-blue deployment.
```bash
python scripts/migrate_green_to_blue.py
```

---

### Verificación y Diagnóstico

#### `verify_database.py`
Verifica el estado y estructura de la base de datos.
```bash
python scripts/verify_database.py
```

#### `verify_sim_ft.py`
Verifica la integridad del sistema SIM_FT.
```bash
python scripts/verify_sim_ft.py
```

#### `verify_sim_ft_created.py`
Verifica que todas las tablas SIM_FT fueron creadas correctamente.
```bash
python scripts/verify_sim_ft_created.py
```

#### `verify_test_data.py`
Verifica que los datos de prueba se cargaron correctamente.
```bash
python scripts/verify_test_data.py
```

---

### Monitoreo y Corrección

#### `monitor_logs.py`
Monitorea logs del sistema en tiempo real.
```bash
python scripts/monitor_logs.py
```

#### `fix_ppsh_tests.py`
Corrige problemas en las pruebas PPSH (Fase 1).
```bash
python scripts/fix_ppsh_tests.py
```

#### `fix_ppsh_tests_phase2.py`
Corrige problemas en las pruebas PPSH (Fase 2).
```bash
python scripts/fix_ppsh_tests_phase2.py
```

---

## 🚀 Flujo de Trabajo Típico

### 1. Inicialización Completa
```bash
# 1. Inicializar base de datos
python scripts/init_database.py

# 2. Cargar datos iniciales
python scripts/load_initial_data.py
python scripts/load_sim_ft_data.py
python scripts/load_ppsh_data.py

# 3. Verificar
python scripts/verify_database.py
python scripts/verify_sim_ft_created.py
```

### 2. Desarrollo con Datos de Prueba
```bash
# Cargar datos de prueba
python scripts/load_test_data.py

# Verificar datos
python scripts/verify_test_data.py
```

### 3. Diagnóstico de Problemas
```bash
# Verificar sistema
python scripts/verify_database.py
python scripts/verify_sim_ft.py

# Monitorear logs
python scripts/monitor_logs.py
```

---

## 📋 Convenciones

- **Todos los scripts deben ejecutarse desde el directorio raíz del backend**
- Los scripts usan variables de entorno del archivo `.env`
- Logs se guardan en `logs/`
- Los scripts son idempotentes (pueden ejecutarse múltiples veces)

---

## ⚠️ Notas Importantes

1. **Datos de Producción**: Los scripts de `load_*_data.py` NO deben ejecutarse en producción sin revisar
2. **Migraciones**: Usar Alembic para cambios de esquema, no scripts manuales
3. **Backups**: Hacer backup antes de ejecutar scripts de migración
4. **Logs**: Revisar logs después de ejecutar scripts críticos

---

**Última actualización:** 22 de Octubre de 2025
