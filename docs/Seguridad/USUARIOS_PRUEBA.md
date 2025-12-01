# 🔐 Credenciales de Usuarios de Prueba

## Resumen Rápido

| #  | Usuario     | Password | Rol(es)             | Email                            |
|----|-------------|----------|---------------------|----------------------------------|
| 1️⃣  | admin       | admin123 | ADMINISTRADOR       | admin@migracion.gob.pa           |
| 2️⃣  | inspector01 | admin123 | INSPECTOR           | inspector@migracion.gob.pa       |
| 3️⃣  | analista01  | admin123 | ANALISTA            | analista@migracion.gob.pa        |
| 4️⃣  | consulta01  | admin123 | CONSULTA            | consulta@migracion.gob.pa        |
| 5️⃣  | analista02  | admin123 | ANALISTA + INSPECTOR| analista.senior@migracion.gob.pa |

## Instalación

```bash
# Ejecutar script de usuarios
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -d SIM_PANAMA \
  -i /scripts/seed_test_users.sql
```

## Testing

```bash
# 1. Abrir aplicación
open http://localhost:3000

# 2. Login con cada usuario
# 3. Navegar a Perfil
# 4. Verificar datos correctos

# URLs de Testing:
# - Perfil:        http://localhost:3000/perfil
# - Configuración: http://localhost:3000/configuracion
```

⚠️ **IMPORTANTE:** Estos usuarios son SOLO para desarrollo. Ver `backend/sql/TEST_USERS_README.md` para más detalles.
