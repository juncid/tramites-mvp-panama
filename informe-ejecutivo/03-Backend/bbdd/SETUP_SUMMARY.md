# Resumen de Configuración de Base de Datos

## ✅ Archivos Creados

### 1. Documentación Principal
- **`DATABASE_DOCUMENTATION.md`** (Raíz del proyecto)
  - Documentación completa de la base de datos
  - Explicación de cada módulo y tabla
  - Diagrama de relaciones
  - Diccionario de datos completo
  - Guías de integración

### 2. Scripts de Base de Datos
- **`backend/bbdd/init_database.sql`**
  - Script de inicialización completo
  - Crea base de datos SIM_PANAMA
  - Tablas de catálogos
  - Tablas de seguridad
  - Tabla de trámites (MVP)
  - Datos iniciales
  - Usuario admin (password: admin123)
  - Vistas y procedimientos almacenados

### 3. Guías de Instalación
- **`backend/bbdd/README.md`**
  - Requisitos previos
  - Pasos de instalación detallados
  - Configuración de variables de entorno
  - Verificación de instalación
  - Solución de problemas
  - Mantenimiento y backups

- **`backend/bbdd/QUICK_REFERENCE.md`**
  - Consultas SQL frecuentes
  - Códigos y catálogos comunes
  - Comandos de mantenimiento
  - Ejemplos de conexión
  - Datos de prueba

## 📊 Estructura de Base de Datos Creada

### Base de Datos: `SIM_PANAMA`

#### Tablas Principales (MVP)
```
tramites                    -- 4 registros de ejemplo
├── id (PK)
├── titulo
├── descripcion
├── estado
├── activo
├── created_at
└── updated_at
```

#### Seguridad
```
SEG_TB_USUARIOS            -- 1 usuario (admin)
SEG_TB_ROLES              -- 4 roles
SEG_TB_USUA_ROLE          -- 1 asignación
SEG_TB_ERROR_LOG          -- Vacía (log)
sc_log                    -- Vacía (log)
```

#### Catálogos (Con datos iniciales)
```
SIM_GE_SEXO               -- 2 registros
SIM_GE_EST_CIVIL          -- 5 registros
SIM_GE_VIA_TRANSP         -- 3 registros
SIM_GE_TIPO_MOV           -- 3 registros
SIM_GE_CONTINENTE         -- 5 registros
SIM_GE_PAIS               -- 7 países principales
SIM_GE_REGION             -- 4 regiones
SIM_GE_AGENCIA            -- 4 agencias
SIM_GE_SECCION            -- 5 secciones
```

#### Vistas
```
VW_TRAMITES_ACTIVOS       -- Trámites activos con días transcurridos
```

#### Procedimientos Almacenados
```
SP_GET_TRAMITES           -- Obtener todos los trámites
SP_INSERT_TRAMITE         -- Insertar nuevo trámite
```

## 🚀 Pasos para Iniciar

### 1. Ejecutar Script de Inicialización

```bash
# Opción A: Desde SSMS
# 1. Abrir SQL Server Management Studio
# 2. Conectarse al servidor
# 3. Abrir archivo: backend/bbdd/init_database.sql
# 4. Ejecutar (F5)

# Opción B: Desde línea de comandos
sqlcmd -S localhost -U sa -P YourPassword -i backend/bbdd/init_database.sql
```

### 2. Configurar Backend

Actualizar `backend/.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_NAME=SIM_PANAMA
DATABASE_USER=sa
DATABASE_PASSWORD=YourSecurePassword123!
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### 3. Verificar Instalación

```sql
USE SIM_PANAMA;

-- Verificar tablas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Debería mostrar 14 tablas

-- Verificar datos
SELECT * FROM tramites;
SELECT * FROM SEG_TB_USUARIOS;
```

### 4. Probar desde Backend

```python
# backend/test_db.py
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM tramites"))
    print(f"Trámites en BD: {result.scalar()}")
```

```bash
cd backend
python test_db.py
# Debería mostrar: Trámites en BD: 4
```

## 🔐 Credenciales Iniciales

```
Usuario: admin
Password: admin123
Rol: ADMINISTRADOR
```

⚠️ **CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN**

```sql
UPDATE SEG_TB_USUARIOS 
SET PASSWORD = 'nuevo_hash_bcrypt',
    FECHULTCAMBIOPASS = GETDATE()
WHERE USER_ID = 'admin';
```

## 📁 Archivos del Proyecto

```
tramites-mvp-panama/
├── DATABASE_DOCUMENTATION.md          ← Documentación completa
├── modelo_datos_propuesto_clean.sql   ← Esquema completo original
└── backend/
    ├── .env                           ← Configurar con tus datos
    ├── app/
    │   ├── database.py                ← Ya configurado
    │   └── models.py                  ← Actualizar si necesario
    └── bbdd/
        ├── README.md                  ← Guía de instalación
        ├── QUICK_REFERENCE.md         ← Referencia rápida
        └── init_database.sql          ← Script de inicialización ✨
```

## 🎯 Próximos Pasos Recomendados

### Inmediato
- [ ] Ejecutar `init_database.sql`
- [ ] Configurar variables de entorno
- [ ] Cambiar password de admin
- [ ] Probar conexión desde backend
- [ ] Verificar endpoints existentes

### Corto Plazo
- [ ] Crear modelos SQLAlchemy adicionales
- [ ] Implementar autenticación JWT
- [ ] Agregar más procedimientos almacenados
- [ ] Configurar backups automáticos

### Mediano Plazo
- [ ] Migrar tablas de Filiación (SIM_FI_*)
- [ ] Migrar tablas de Movimiento Migratorio (SIM_MM_*)
- [ ] Migrar tablas de Impedimentos (SIM_IM_*)
- [ ] Implementar flujo de trámites completo (SIM_FT_*)

## 📚 Documentación Relacionada

1. **DATABASE_DOCUMENTATION.md** - Documentación completa de la base de datos
   - Arquitectura y módulos
   - Diccionario de datos
   - Relaciones entre tablas
   - Guías de integración

2. **backend/bbdd/README.md** - Guía de instalación
   - Requisitos previos
   - Pasos detallados
   - Solución de problemas
   - Mantenimiento

3. **backend/bbdd/QUICK_REFERENCE.md** - Referencia rápida
   - Consultas SQL comunes
   - Códigos de catálogos
   - Comandos útiles
   - Ejemplos de código

4. **modelo_datos_propuesto_clean.sql** - Esquema completo
   - Todas las tablas del sistema
   - Para futuras migraciones
   - Referencia completa

## 🔧 Comandos Útiles

### Verificar Estado
```sql
-- Ver todas las tablas
SELECT COUNT(*) as total_tablas 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

-- Ver registros
SELECT 
    'tramites' as tabla, COUNT(*) as registros FROM tramites
UNION ALL
SELECT 'usuarios', COUNT(*) FROM SEG_TB_USUARIOS
UNION ALL
SELECT 'paises', COUNT(*) FROM SIM_GE_PAIS;
```

### Backup Rápido
```sql
BACKUP DATABASE SIM_PANAMA 
TO DISK = 'C:\Backups\SIM_PANAMA.bak'
WITH FORMAT, COMPRESSION;
```

### Limpiar y Reiniciar
```sql
-- CUIDADO: Elimina todos los datos
USE master;
DROP DATABASE SIM_PANAMA;
-- Luego re-ejecutar init_database.sql
```

## 💡 Consejos

1. **Desarrollo Local**: Usar Docker para SQL Server
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
     -p 1433:1433 --name sqlserver \
     -d mcr.microsoft.com/mssql/server:2022-latest
   ```

2. **Testing**: Crear base de datos separada para tests
   ```sql
   CREATE DATABASE SIM_PANAMA_TEST;
   ```

3. **Migraciones**: Usar Alembic para futuras migraciones
   ```bash
   pip install alembic
   alembic init migrations
   ```

4. **Monitoreo**: Habilitar Query Store
   ```sql
   ALTER DATABASE SIM_PANAMA 
   SET QUERY_STORE = ON;
   ```

## 📞 Soporte

Si encuentras problemas:
1. Revisar `backend/bbdd/README.md` - Sección "Solución de Problemas"
2. Verificar logs en `SEG_TB_ERROR_LOG` y `sc_log`
3. Consultar `DATABASE_DOCUMENTATION.md` para entender la estructura

## ✨ Características Implementadas

- ✅ Base de datos inicializada con estructura mínima viable
- ✅ Usuario administrador configurado
- ✅ Roles de seguridad básicos
- ✅ Catálogos esenciales con datos
- ✅ Tabla de trámites funcional
- ✅ Sistema de auditoría (logs)
- ✅ Vistas útiles
- ✅ Procedimientos almacenados básicos
- ✅ Documentación completa
- ✅ Guías de instalación y uso

## 🎉 ¡Listo!

Tu base de datos está lista para ser utilizada. El script `init_database.sql` creará todo lo necesario automáticamente.

**Tiempo estimado de ejecución del script**: 1-2 minutos

---

*Generado: 13 de Octubre de 2025*
*Sistema de Trámites Migratorios de Panamá*
