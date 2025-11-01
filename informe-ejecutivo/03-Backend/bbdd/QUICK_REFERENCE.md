# Guía Rápida de Referencia - Base de Datos SIM

## Conexión Rápida

```bash
# SQL Server local
sqlcmd -S localhost -U sa -P YourPassword -d SIM_PANAMA

# Desde Python
DATABASE_URL="mssql+pyodbc://sa:YourPassword@localhost:1433/SIM_PANAMA?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
```

## Consultas Frecuentes

### Trámites

```sql
-- Listar todos los trámites activos
SELECT * FROM tramites WHERE activo = 1;

-- Trámites por estado
SELECT estado, COUNT(*) as total 
FROM tramites 
GROUP BY estado;

-- Trámites recientes (últimos 7 días)
SELECT * FROM tramites 
WHERE created_at >= DATEADD(day, -7, GETDATE())
ORDER BY created_at DESC;
```

### Usuarios y Seguridad

```sql
-- Listar usuarios activos
SELECT USER_ID, NOM_USUARIO, EMAIL_USUARIO 
FROM SEG_TB_USUARIOS 
WHERE ACTIVO = 1;

-- Usuarios por rol
SELECT u.USER_ID, u.NOM_USUARIO, r.NOM_ROLE
FROM SEG_TB_USUARIOS u
INNER JOIN SEG_TB_USUA_ROLE ur ON u.USER_ID = ur.USER_ID
INNER JOIN SEG_TB_ROLES r ON ur.COD_ROLE = r.COD_ROLE;

-- Intentos de login fallidos
SELECT USER_ID, COUNT(*) as intentos
FROM SEG_TB_ERROR_LOG
WHERE FEC_ACTUALIZACION >= DATEADD(hour, -24, GETDATE())
GROUP BY USER_ID;
```

### Catálogos

```sql
-- Listar países
SELECT COD_PAIS, NOM_PAIS, NOM_NACIONALIDAD 
FROM SIM_GE_PAIS 
ORDER BY NOM_PAIS;

-- Agencias por región
SELECT r.NOM_REGION, a.NOM_AGENCIA, vt.NOM_VIA_TRANSP
FROM SIM_GE_AGENCIA a
LEFT JOIN SIM_GE_REGION r ON a.COD_REGION = r.COD_REGION
LEFT JOIN SIM_GE_VIA_TRANSP vt ON a.COD_VIA_TRANSP = vt.COD_VIA_TRANSP;
```

## Códigos Comunes

### Estados de Trámite

| Código | Descripción |
|--------|-------------|
| `pendiente` | Trámite recién creado |
| `en_proceso` | En proceso de revisión |
| `en_revision` | Requiere aprobación |
| `completado` | Finalizado exitosamente |
| `rechazado` | Rechazado |
| `cancelado` | Cancelado por el usuario |

### Tipos de Movimiento

| Código | Descripción |
|--------|-------------|
| `E` | Entrada al país |
| `S` | Salida del país |
| `T` | Tránsito |

### Vías de Transporte

| Código | Descripción |
|--------|-------------|
| `A` | Aérea |
| `M` | Marítima |
| `T` | Terrestre |

### Estado Civil

| Código | Descripción |
|--------|-------------|
| `S` | Soltero |
| `C` | Casado |
| `D` | Divorciado |
| `V` | Viudo |
| `U` | Unión Libre |

## Procedimientos Almacenados

```sql
-- Obtener trámites
EXEC SP_GET_TRAMITES;

-- Insertar trámite
EXEC SP_INSERT_TRAMITE 
    @titulo = 'Nuevo Trámite',
    @descripcion = 'Descripción del trámite',
    @estado = 'pendiente';
```

## Vistas Útiles

```sql
-- Trámites activos con días transcurridos
SELECT * FROM VW_TRAMITES_ACTIVOS;
```

## Comandos de Mantenimiento

```sql
-- Backup rápido
BACKUP DATABASE SIM_PANAMA TO DISK = 'C:\Backups\SIM_PANAMA.bak';

-- Verificar integridad
DBCC CHECKDB(SIM_PANAMA);

-- Espacio usado
EXEC sp_spaceused;

-- Índices fragmentados
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    ips.index_id,
    ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
WHERE ips.avg_fragmentation_in_percent > 30;
```

## Solución Rápida de Problemas

### Resetear contraseña de admin

```sql
UPDATE SEG_TB_USUARIOS 
SET PASSWORD = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS',
    INTENTOFALLIDO = 0,
    FECHULTCAMBIOPASS = GETDATE()
WHERE USER_ID = 'admin';
-- Contraseña reseteada a: admin123
```

### Desbloquear usuario

```sql
UPDATE SEG_TB_USUARIOS 
SET ACTIVO = 1, INTENTOFALLIDO = 0
WHERE USER_ID = 'usuario_bloqueado';
```

### Limpiar logs antiguos

```sql
-- Eliminar logs de más de 90 días
DELETE FROM SEG_TB_ERROR_LOG 
WHERE FEC_ACTUALIZACION < DATEADD(day, -90, GETDATE());

DELETE FROM sc_log 
WHERE inserted_date < DATEADD(day, -90, GETDATE());
```

## Crear Datos de Prueba

```sql
-- Insertar usuario de prueba
INSERT INTO SEG_TB_USUARIOS 
(USER_ID, CED_USUARIO, NOM_USUARIO, EMAIL_USUARIO, PASSWORD, ACTIVO, FEC_ACTUALIZACION)
VALUES 
('test', '8-888-8888', 'Usuario Test', 'test@sim.gob.pa', 
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', 
 1, GETDATE());

-- Asignar rol de consulta
INSERT INTO SEG_TB_USUA_ROLE (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
VALUES (4, 'test', GETDATE());

-- Insertar trámite de prueba
INSERT INTO tramites (titulo, descripcion, estado)
VALUES ('Trámite de Prueba', 'Descripción de prueba', 'pendiente');
```

## Verificación de Sistema

```sql
-- Estado general del sistema
SELECT 
    'Usuarios Activos' as Metrica, 
    COUNT(*) as Valor 
FROM SEG_TB_USUARIOS WHERE ACTIVO = 1
UNION ALL
SELECT 
    'Trámites Activos', 
    COUNT(*) 
FROM tramites WHERE activo = 1
UNION ALL
SELECT 
    'Países Configurados', 
    COUNT(*) 
FROM SIM_GE_PAIS
UNION ALL
SELECT 
    'Agencias', 
    COUNT(*) 
FROM SIM_GE_AGENCIA;
```

## Conexión desde Aplicaciones

### Python (SQLAlchemy)

```python
from sqlalchemy import create_engine
import urllib

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=localhost,1433;"
    "DATABASE=SIM_PANAMA;"
    "UID=sa;"
    "PWD=YourPassword;"
    "TrustServerCertificate=yes;"
)

engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
```

### Node.js (mssql)

```javascript
const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'YourPassword',
    server: 'localhost',
    database: 'SIM_PANAMA',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const pool = await sql.connect(config);
```

### C# (.NET)

```csharp
string connectionString = 
    "Server=localhost,1433;" +
    "Database=SIM_PANAMA;" +
    "User Id=sa;" +
    "Password=YourPassword;" +
    "TrustServerCertificate=true;";

using (SqlConnection conn = new SqlConnection(connectionString))
{
    conn.Open();
    // queries here
}
```

## Contactos de Emergencia

- **DBA de turno**: Consultar `DEPLOYMENT.md`
- **Soporte técnico**: Ver `README.md`
- **Documentación completa**: `DATABASE_DOCUMENTATION.md`

---

*Guía Rápida - SIM Panamá*
