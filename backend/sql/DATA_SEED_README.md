# 📊 Scripts de Datos de Prueba (Data Seeding)

Este directorio contiene scripts SQL para poblar la base de datos con datos de prueba necesarios para el desarrollo y testing del sistema.

## 📁 Estructura de Archivos

```
backend/sql/
├── DATA_SEED_README.md           # Este archivo
├── seed_test_users.sql            # Usuarios de prueba con diferentes roles
└── seed_sim_ft_test_data.sql     # Datos de prueba para módulo SIM-FT
```

---

## 🔐 Usuarios de Prueba

### Archivo: `seed_test_users.sql`

**Propósito:** Crear usuarios de prueba con diferentes roles y permisos para facilitar el testing de funcionalidades según perfil de usuario.

**Ejecutar:**
```bash
# Desde la raíz del proyecto
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' \
  -d SIM_PANAMA \
  -i /sql/seed_test_users.sql
```

**O desde SQL Server:**
```sql
USE SIM_PANAMA;
GO
:r /path/to/seed_test_users.sql
GO
```

### 👥 Usuarios Creados

| Usuario | Contraseña | Rol | Perfil | Descripción |
|---------|-----------|-----|--------|-------------|
| `admin` | `Admin123!` | ADMINISTRADOR | Sistema | Acceso total al sistema |
| `analista.ppsh` | `Analista123!` | PPSH_ANALISTA | Analista | Gestión de trámites PPSH |
| `funcionario.sim` | `Funcionario123!` | SIM_FUNCIONARIO | Funcionario | Operaciones generales |
| `recepcionista` | `Recepcion123!` | RECEPCIONISTA | Recepción | Atención y registro |
| `consulta` | `Consulta123!` | CONSULTA | Solo lectura | Acceso de consulta |

### 🔒 Características de Seguridad

- **Passwords hasheados:** Todas las contraseñas usan bcrypt con salt
- **Roles diferenciados:** Cada usuario tiene permisos específicos según su rol
- **Datos completos:** Incluye email, teléfono, cargo, departamento
- **Estado activo:** Todos los usuarios están activos por defecto
- **Fechas de auditoría:** created_at y updated_at configurados

### ⚠️ Importante

> **SOLO PARA DESARROLLO Y TESTING**
> 
> Estos usuarios NO deben existir en producción. Son credenciales de prueba con contraseñas débiles y conocidas públicamente.

---

## 🧪 Datos de Prueba SIM-FT

### Archivo: `seed_sim_ft_test_data.sql`

**Propósito:** Poblar el módulo SIM-FT con datos de ejemplo para testing de workflows de trámites.

**Contenido:**
- Catálogos de secciones y agencias
- Tipos de trámites (Permiso Temporal, Residencia, etc.)
- Pasos de procesos configurados
- Usuarios asignados a secciones
- Trámites de ejemplo con estados

**Ejecutar:**
```bash
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' \
  -d SIM_PANAMA \
  -i /sql/seed_sim_ft_test_data.sql
```

---

## 📋 Checklist de Ejecución

Orden recomendado para poblar una base de datos limpia:

1. ✅ **Ejecutar migraciones Alembic**
   ```bash
   cd backend
   alembic upgrade head
   ```

2. ✅ **Crear usuarios de prueba**
   ```bash
   docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P 'YourStrong@Passw0rd' \
     -d SIM_PANAMA \
     -i /sql/seed_test_users.sql
   ```

3. ✅ **Poblar datos de prueba SIM-FT (opcional)**
   ```bash
   docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P 'YourStrong@Passw0rd' \
     -d SIM_PANAMA \
     -i /sql/seed_sim_ft_test_data.sql
   ```

---

## 🔄 Diferencia: Migraciones vs Data Seeds

### Migraciones (Alembic)
- **Ubicación:** `backend/alembic/versions/`
- **Propósito:** Cambios en estructura de base de datos (tablas, columnas, índices)
- **Control de versiones:** Sí, mediante revision IDs
- **Reversibles:** Sí, con `alembic downgrade`
- **Producción:** Sí, se ejecutan en todos los ambientes

### Data Seeds (SQL Scripts)
- **Ubicación:** `backend/sql/`
- **Propósito:** Datos de prueba y catálogos iniciales
- **Control de versiones:** No automático
- **Reversibles:** Manualmente con DELETE
- **Producción:** NO para datos de prueba, SÍ para catálogos

---

## 🛡️ Buenas Prácticas

### ✅ DO (Hacer)

- ✅ Usar data seeds para usuarios de prueba
- ✅ Incluir contraseñas hasheadas (bcrypt)
- ✅ Documentar credenciales en README
- ✅ Marcar claramente como "SOLO DESARROLLO"
- ✅ Usar transacciones para rollback en caso de error
- ✅ Incluir validaciones (IF NOT EXISTS)

### ❌ DON'T (No hacer)

- ❌ Usar data seeds para cambios de estructura
- ❌ Incluir datos sensibles reales
- ❌ Ejecutar en producción sin revisión
- ❌ Hardcodear IDs autoincrementales
- ❌ Usar contraseñas en texto plano
- ❌ Crear usuarios sin validar existencia

---

## 📝 Plantilla para Nuevos Scripts

```sql
/*
 * Script de Datos de Prueba: [NOMBRE_MODULO]
 * Descripción: [Propósito del script]
 * Autor: [Tu nombre]
 * Fecha: [YYYY-MM-DD]
 * 
 * IMPORTANTE: SOLO PARA DESARROLLO Y TESTING
 */

USE SIM_PANAMA;
GO

SET NOCOUNT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;
    
    PRINT '🔄 INICIANDO CARGA DE DATOS: [NOMBRE]';
    PRINT '';
    
    -- Validar que no existan datos
    IF EXISTS (SELECT 1 FROM [TABLA] WHERE [CONDICION])
    BEGIN
        PRINT '⚠️  WARNING: Datos ya existen. Limpiando...';
        DELETE FROM [TABLA] WHERE [CONDICION];
    END
    
    -- Insertar datos
    INSERT INTO [TABLA] ([CAMPOS])
    VALUES
        ([VALORES]);
    
    PRINT '✅ DATOS INSERTADOS CORRECTAMENTE';
    PRINT '';
    
    -- Resumen
    SELECT COUNT(*) as 'Total Registros' FROM [TABLA];
    
    COMMIT TRANSACTION;
    PRINT '✅ TRANSACCIÓN COMPLETADA';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ ERROR: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
```

---

## 🧹 Limpiar Datos de Prueba

Para eliminar todos los usuarios de prueba:

```sql
USE SIM_PANAMA;
GO

-- Eliminar usuarios de prueba (conservar admin original)
DELETE FROM SEG_TB_USUARIOS 
WHERE USER_ID IN (
    'analista.ppsh',
    'funcionario.sim',
    'recepcionista',
    'consulta'
);
GO

PRINT '✅ Usuarios de prueba eliminados';
GO
```

---

## 📚 Referencias

- **Documento de Usuarios:** `USUARIOS_PRUEBA.md` (raíz del proyecto)
- **Migraciones Alembic:** `backend/alembic/versions/`
- **Configuración BD:** `backend/bbdd/README.md`
- **Guía de Deployment:** `docs/Deployment/DEPLOYMENT_GUIDE.md`

---

## 🔗 Enlaces Relacionados

- [Guía de Migraciones Alembic](../alembic/README.md)
- [Documentación de Base de Datos](../bbdd/README.md)
- [Credenciales de Prueba](../../USUARIOS_PRUEBA.md)

---

**Última actualización:** 2025-11-12  
**Mantenido por:** Equipo de Desarrollo
