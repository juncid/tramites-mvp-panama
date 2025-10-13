# Guía de Instalación y Configuración de Base de Datos

## Requisitos Previos

- SQL Server 2019 o superior (recomendado)
- SQL Server Management Studio (SSMS) o Azure Data Studio
- Permisos de administrador en SQL Server
- Acceso desde el backend (puerto 1433 abierto)

## Pasos de Instalación

### 1. Ejecutar Script de Inicialización

```bash
# Opción A: Desde SSMS
# 1. Abrir SQL Server Management Studio
# 2. Conectarse al servidor
# 3. Abrir el archivo: backend/bbdd/init_database.sql
# 4. Ejecutar (F5)

# Opción B: Desde línea de comandos
sqlcmd -S localhost -U sa -P YourPassword -i backend/bbdd/init_database.sql
```

### 2. Configurar Variables de Entorno

Crear/actualizar el archivo `.env` en el directorio `backend/`:

```env
# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_NAME=SIM_PANAMA
DATABASE_USER=sa
DATABASE_PASSWORD=YourSecurePassword123!

# Aplicación
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
```

### 3. Verificar Instalación

```sql
-- Conectarse a la base de datos
USE SIM_PANAMA;

-- Verificar tablas creadas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Verificar usuario admin
SELECT USER_ID, NOM_USUARIO, EMAIL_USUARIO, ACTIVO 
FROM SEG_TB_USUARIOS;

-- Verificar datos de ejemplo en tramites
SELECT * FROM tramites;
```

## Estructura de Base de Datos Creada

### Tablas Principales (MVP)

| Tabla | Descripción | Registros Iniciales |
|-------|-------------|---------------------|
| `tramites` | Trámites simplificados para MVP | 4 ejemplos |
| `SEG_TB_USUARIOS` | Usuarios del sistema | 1 (admin) |
| `SEG_TB_ROLES` | Roles de seguridad | 4 roles |
| `SEG_TB_USUA_ROLE` | Asignación usuario-rol | 1 |

### Tablas de Catálogos

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `SIM_GE_SEXO` | Sexos | 2 |
| `SIM_GE_EST_CIVIL` | Estados civiles | 5 |
| `SIM_GE_VIA_TRANSP` | Vías de transporte | 3 |
| `SIM_GE_TIPO_MOV` | Tipos de movimiento | 3 |
| `SIM_GE_CONTINENTE` | Continentes | 5 |
| `SIM_GE_PAIS` | Países | 7 principales |
| `SIM_GE_REGION` | Regiones de Panamá | 4 |
| `SIM_GE_AGENCIA` | Agencias migratorias | 4 |
| `SIM_GE_SECCION` | Secciones | 5 |

### Tablas de Auditoría

| Tabla | Descripción |
|-------|-------------|
| `SEG_TB_ERROR_LOG` | Log de errores de autenticación |
| `sc_log` | Log general de aplicación |

## Migraciones Futuras

El sistema está preparado para expandirse con las siguientes tablas (ver `modelo_datos_propuesto_clean.sql`):

### Módulo de Filiación
- `SIM_FI_GENERALES` - Datos completos de personas
- `SIM_FI_PASAPORTE` - Registro de pasaportes
- `SIM_FI_CARTA_NAT` - Solicitudes de naturalización
- `SIM_FI_CITACION` - Citaciones
- Y más...

### Módulo de Movimiento Migratorio
- `SIM_MM_BOLETA` - Boletas de entrada/salida
- `SIM_BMM_VUELO` - Registro de vuelos
- `SIM_MM_IMAGEN_PASAPORTE` - Imágenes de documentos
- Y más...

### Módulo de Impedimentos
- `SIM_IM_IMPEDIDO` - Personas con impedimento
- `SIM_IM_IMPEDIMEN` - Impedimentos activos
- `SIM_IM_LEVANTAMI` - Levantamientos
- Y más...

### Módulo de Trámites Completo
- `SIM_FT_TRAMITE_E` - Encabezados de trámites
- `SIM_FT_TRAMITE_D` - Detalles de trámites
- `SIM_FT_TRAMITES` - Tipos de trámites
- Y más...

## Seguridad

### Usuario Admin Predeterminado

```
Usuario: admin
Password: admin123
```

⚠️ **IMPORTANTE**: Cambiar la contraseña inmediatamente después de la instalación.

```sql
UPDATE SEG_TB_USUARIOS 
SET PASSWORD = '$2b$12$NewHashedPasswordHere',
    FECHULTCAMBIOPASS = GETDATE()
WHERE USER_ID = 'admin';
```

### Roles Disponibles

1. **ADMINISTRADOR** - Acceso total al sistema
2. **INSPECTOR** - Inspectores en puestos fronterizos
3. **ANALISTA** - Analistas de trámites
4. **CONSULTA** - Solo lectura

## Conexión desde Backend

### FastAPI (Python)

El backend ya está configurado. Verificar el archivo `backend/app/database.py`:

```python
from app.database import engine, SessionLocal, Base
from app.models import Tramite

# Crear todas las tablas (si usas SQLAlchemy models)
Base.metadata.create_all(bind=engine)

# Usar sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Probar Conexión

```python
# backend/test_db.py
from app.database import engine
from sqlalchemy import text

def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT @@VERSION"))
            print("Conexión exitosa!")
            print(result.fetchone())
    except Exception as e:
        print(f"Error de conexión: {e}")

if __name__ == "__main__":
    test_connection()
```

```bash
# Ejecutar test
cd backend
python test_db.py
```

## Mantenimiento

### Backup

```sql
-- Backup completo
BACKUP DATABASE SIM_PANAMA
TO DISK = 'C:\Backups\SIM_PANAMA_Full.bak'
WITH FORMAT, COMPRESSION;

-- Backup incremental
BACKUP LOG SIM_PANAMA
TO DISK = 'C:\Backups\SIM_PANAMA_Log.bak';
```

### Monitoreo de Tamaño

```sql
-- Ver tamaño de base de datos
SELECT 
    DB_NAME() AS DatabaseName,
    (SUM(size) * 8 / 1024) AS SizeMB
FROM sys.database_files;

-- Ver tamaño por tabla
SELECT 
    t.NAME AS TableName,
    p.rows AS RowCounts,
    (SUM(a.total_pages) * 8) / 1024 AS TotalSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceMB DESC;
```

### Optimización

```sql
-- Reindexar todas las tablas
EXEC sp_MSforeachtable 'ALTER INDEX ALL ON ? REBUILD';

-- Actualizar estadísticas
EXEC sp_MSforeachtable 'UPDATE STATISTICS ? WITH FULLSCAN';
```

## Solución de Problemas

### Error: No se puede conectar al servidor

```bash
# Verificar que SQL Server está corriendo
# Windows:
services.msc  # Buscar "SQL Server (MSSQLSERVER)"

# Verificar puerto
netstat -an | findstr 1433
```

### Error: Login failed for user

```sql
-- Verificar permisos del usuario
USE SIM_PANAMA;
EXEC sp_helpuser 'your_user';

-- Otorgar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON DATABASE::SIM_PANAMA TO your_user;
```

### Error: Tabla no existe

```sql
-- Verificar que el script se ejecutó correctamente
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_CATALOG = 'SIM_PANAMA';

-- Si es 0, re-ejecutar init_database.sql
```

## Scripts Útiles

### Limpiar datos de prueba

```sql
-- CUIDADO: Esto elimina todos los trámites de ejemplo
DELETE FROM tramites;
DBCC CHECKIDENT ('tramites', RESEED, 0);
```

### Agregar usuario nuevo

```sql
EXEC SP_ADD_USER 
    @user_id = 'jperez',
    @cedula = '8-123-4567',
    @nombre = 'Juan Pérez',
    @email = 'jperez@sim.gob.pa',
    @password = 'hashed_password_here',
    @rol_id = 3;  -- Analista
```

## Próximos Pasos

1. ✅ Instalar y verificar base de datos inicial
2. ✅ Configurar variables de entorno
3. ✅ Probar conexión desde backend
4. 📝 Implementar modelos SQLAlchemy completos
5. 📝 Crear endpoints API para cada módulo
6. 📝 Migrar tablas adicionales según necesidad
7. 📝 Implementar autenticación JWT
8. 📝 Configurar backups automáticos

## Documentación Adicional

- Ver `DATABASE_DOCUMENTATION.md` para documentación completa de la base de datos
- Ver `modelo_datos_propuesto_clean.sql` para el esquema completo
- Ver `ARCHITECTURE.md` para arquitectura general del sistema

## Contacto y Soporte

Para dudas sobre la base de datos, consultar:
- Documentación: `DATABASE_DOCUMENTATION.md`
- Arquitectura: `ARCHITECTURE.md`
- Código fuente: `backend/app/`

---

*Última actualización: 13 de Octubre de 2025*
