# 🔐 Usuarios de Prueba - Sistema de Trámites

Este documento contiene las credenciales de los usuarios de prueba para desarrollo y testing del sistema.

## ⚠️ IMPORTANTE

- **Estos usuarios son SOLO para desarrollo/testing**
- **NO ejecutar en producción**
- **Cambiar todas las contraseñas antes de desplegar en producción**

## 📋 Usuarios Disponibles

### 1. 👨‍💼 ADMINISTRADOR

**Perfil:** Administrador del sistema con acceso total

```
Usuario:   admin
Password:  admin123
Email:     admin@migracion.gob.pa
Rol:       ADMINISTRADOR
Permisos:  Acceso total al sistema
```

**Características:**
- ✅ Gestión de usuarios
- ✅ Configuración del sistema
- ✅ Gestión de workflows
- ✅ Todos los módulos
- ✅ Reportes y estadísticas

---

### 2. 👮 INSPECTOR

**Perfil:** Inspector de migración en puestos fronterizos

```
Usuario:   inspector01
Password:  admin123
Email:     inspector@migracion.gob.pa
Rol:       INSPECTOR
Permisos:  Inspección y control migratorio
```

**Características:**
- ✅ Revisión de documentos
- ✅ Control de entrada/salida
- ✅ Registro de movimientos migratorios
- ✅ Consulta de alertas
- ❌ No puede modificar configuración

---

### 3. 📊 ANALISTA

**Perfil:** Analista de trámites y expedientes

```
Usuario:   analista01
Password:  admin123
Email:     analista@migracion.gob.pa
Rol:       ANALISTA
Permisos:  Gestión de trámites y casos
```

**Características:**
- ✅ Gestión de solicitudes
- ✅ Revisión de expedientes
- ✅ Aprobación/rechazo de trámites
- ✅ Generación de reportes básicos
- ❌ No puede modificar workflows

---

### 4. 👁️ CONSULTA

**Perfil:** Usuario de solo lectura

```
Usuario:   consulta01
Password:  admin123
Email:     consulta@migracion.gob.pa
Rol:       CONSULTA
Permisos:  Solo lectura
```

**Características:**
- ✅ Consulta de trámites
- ✅ Visualización de documentos
- ✅ Reportes básicos
- ❌ No puede crear/modificar/eliminar
- ❌ Solo lectura

---

### 5. 👨‍💼 ANALISTA SENIOR

**Perfil:** Analista con múltiples roles

```
Usuario:   analista02
Password:  admin123
Email:     analista.senior@migracion.gob.pa
Roles:     ANALISTA + INSPECTOR
Permisos:  Combinación de analista e inspector
```

**Características:**
- ✅ Todos los permisos de ANALISTA
- ✅ Todos los permisos de INSPECTOR
- ✅ Ideal para testing de múltiples roles

---

## 🚀 Cómo Usar

### Opción 1: Script SQL Directo

```bash
# Conectarse a SQL Server
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -i /scripts/seed_test_users.sql
```

### Opción 2: Desde Azure Data Studio / SSMS

1. Abrir el archivo `backend/sql/seed_test_users.sql`
2. Conectarse a la base de datos `SIM_PANAMA`
3. Ejecutar el script

### Opción 3: Makefile (Recomendado)

```bash
cd backend
make seed-users
```

## 📊 Tabla Resumen

| Usuario      | Nombre Completo          | Email                            | Roles              | Activo |
|--------------|--------------------------|----------------------------------|--------------------|--------|
| admin        | Juan Carlos Pérez        | admin@migracion.gob.pa           | ADMINISTRADOR      | Sí     |
| inspector01  | María González Rodríguez | inspector@migracion.gob.pa       | INSPECTOR          | Sí     |
| analista01   | Pedro Martínez López     | analista@migracion.gob.pa        | ANALISTA           | Sí     |
| consulta01   | Ana Sofía Castillo       | consulta@migracion.gob.pa        | CONSULTA           | Sí     |
| analista02   | Roberto Silva Méndez     | analista.senior@migracion.gob.pa | ANALISTA, INSPECTOR| Sí     |

## 🔑 Información Técnica

### Hash de Contraseña

Todos los usuarios usan el mismo hash bcrypt:

```
Password: admin123
Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS
```

### Roles en Base de Datos

```sql
-- Ver roles disponibles
SELECT * FROM SEG_TB_ROLES;

-- Resultado:
-- COD_ROLE | NOM_ROLE      | DESCRIPCION
-- 1        | ADMINISTRADOR | Administrador del sistema con acceso total
-- 2        | INSPECTOR     | Inspector de migración en puestos fronterizos
-- 3        | ANALISTA      | Analista de trámites y expedientes
-- 4        | CONSULTA      | Usuario solo consulta
```

### Relación Usuario-Roles

```sql
-- Ver asignación de roles
SELECT 
    u.USER_ID,
    u.NOM_USUARIO,
    r.NOM_ROLE
FROM SEG_TB_USUARIOS u
JOIN SEG_TB_USUA_ROLE ur ON u.USER_ID = ur.USER_ID
JOIN SEG_TB_ROLES r ON ur.COD_ROLE = r.COD_ROLE
ORDER BY u.USER_ID;
```

## 🧪 Testing de Perfiles

### Test de Página de Perfil

```bash
# Iniciar sesión con cada usuario y navegar a:
http://localhost:3000/perfil

# Verificar:
✅ Avatar con iniciales correctas
✅ Nombre completo correcto
✅ Email correcto
✅ Chips de roles visibles
✅ Información del sistema (ID, fecha creación, último acceso)
```

### Test de Configuración

```bash
# Navegar a:
http://localhost:3000/configuracion

# Verificar:
✅ Cambio de contraseña funcional
✅ Configuración de notificaciones
✅ Preferencias del sistema
✅ Guardado de cambios
```

## 🔒 Seguridad en Producción

### Antes de Desplegar

1. **Eliminar usuarios de prueba:**
   ```sql
   DELETE FROM SEG_TB_USUA_ROLE WHERE USER_ID IN ('inspector01', 'analista01', 'consulta01', 'analista02');
   DELETE FROM SEG_TB_USUARIOS WHERE USER_ID IN ('inspector01', 'analista01', 'consulta01', 'analista02');
   ```

2. **Cambiar contraseña del admin:**
   ```sql
   UPDATE SEG_TB_USUARIOS 
   SET PASSWORD = '$2b$12$NewSecureHashHere',
       FECHULTCAMBIOPASS = GETDATE()
   WHERE USER_ID = 'admin';
   ```

3. **Crear usuarios reales:**
   - Usar el módulo de gestión de usuarios del sistema
   - Aplicar políticas de contraseñas fuertes
   - Implementar autenticación de dos factores (2FA)

## 📝 Notas Adicionales

- Los usuarios se crean automáticamente al ejecutar `seed_test_users.sql`
- Si un usuario ya existe, el script lo omite y muestra una advertencia
- El script incluye verificación de roles antes de crear usuarios
- Todos los usuarios están activos por defecto (`ACTIVO = 1`)
- El campo `INTENTOFALLIDO` está en 0 para todos los usuarios
- `LOGIN` y `RESETPASS` están en 0 (sin sesión activa, no requiere reset)

## 🆘 Soporte

Si necesitas ayuda con los usuarios de prueba:

1. Verificar que la base de datos esté creada: `SIM_PANAMA`
2. Verificar que la tabla `SEG_TB_USUARIOS` exista
3. Verificar que los roles estén creados en `SEG_TB_ROLES`
4. Revisar logs del script para errores
5. Contactar al equipo de desarrollo

---

**Última actualización:** 2025-11-12  
**Versión:** 1.0  
**Proyecto:** Sistema de Trámites Migratorios - Panamá
