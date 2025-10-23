# 📊 Datos de Prueba PPSH - Guía de Uso

## 🎯 Resumen

Se han generado **5 solicitudes completas** con datos realistas para probar todos los endpoints del módulo PPSH.

## 📋 Solicitudes Disponibles

| ID | Expediente | Tipo | Estado | Prioridad | Descripción |
|----|------------|------|--------|-----------|-------------|
| 6 | PPSH-2025-0001 | GRUPAL | EN_EVALUACION | ALTA | Familia venezolana (4 personas) |
| 7 | PPSH-2025-0002 | INDIVIDUAL | EN_REVISION | ALTA | Caso médico oncológico |
| 8 | PPSH-2025-0003 | GRUPAL | RECIBIDO | NORMAL | Reunificación familiar (3 personas) |
| 9 | PPSH-2025-0004 | INDIVIDUAL | RESUELTO | ALTA | Caso aprobado sirio con pago |
| 10 | PPSH-2025-0005 | INDIVIDUAL | RECHAZADO | BAJA | Caso rechazado |

## 🔗 Endpoints para Probar

### 1. Listar Solicitudes
```bash
GET http://localhost:8000/api/v1/ppsh/solicitudes
GET http://localhost:8000/api/v1/ppsh/solicitudes?estado=EN_EVALUACION
GET http://localhost:8000/api/v1/ppsh/solicitudes?prioridad=ALTA
```

### 2. Obtener Solicitud Específica
```bash
# Familia venezolana (con 4 solicitantes, 2 comentarios)
GET http://localhost:8000/api/v1/ppsh/solicitudes/6

# Caso médico
GET http://localhost:8000/api/v1/ppsh/solicitudes/7

# Caso aprobado (con pago y entrevista)
GET http://localhost:8000/api/v1/ppsh/solicitudes/9
```

### 3. Solicitantes
```bash
# Ver todos los solicitantes de la familia venezolana
GET http://localhost:8000/api/v1/ppsh/solicitudes/6/solicitantes

# Ver solicitantes de reunificación familiar
GET http://localhost:8000/api/v1/ppsh/solicitudes/8/solicitantes
```

### 4. Pagos
```bash
# Ver pago del caso aprobado
GET http://localhost:8000/api/v1/ppsh/solicitudes/9/pagos
```

### 5. Entrevistas
```bash
# Ver entrevista del caso aprobado
GET http://localhost:8000/api/v1/ppsh/solicitudes/9/entrevistas
```

### 6. Comentarios
```bash
# Ver comentarios de la familia venezolana
GET http://localhost:8000/api/v1/ppsh/solicitudes/6/comentarios
```

### 7. Catálogos
```bash
GET http://localhost:8000/api/v1/ppsh/catalogos/causas-humanitarias
GET http://localhost:8000/api/v1/ppsh/catalogos/tipos-documento
GET http://localhost:8000/api/v1/ppsh/catalogos/estados
GET http://localhost:8000/api/v1/ppsh/catalogos/conceptos-pago
```

## 📮 Uso con Postman

### Colección: PPSH_Complete_API.postman_collection.json

1. **Importar la colección**:
   - Abrir Postman
   - Import → `backend/postman/PPSH_Complete_API.postman_collection.json`

2. **Configurar variables**:
   - Importar environment: `backend/postman/env-dev.json`
   - O crear manualmente:
     ```json
     {
       "base_url": "http://localhost:8000",
       "api_prefix": "/api/v1/ppsh"
     }
     ```

3. **Ejecutar pruebas**:
   ```bash
   newman run backend/postman/PPSH_Complete_API.postman_collection.json \
     --environment backend/postman/env-dev.json
   ```

### Variables automáticas que se generan:

Cuando ejecutas los endpoints en orden, Postman guarda automáticamente:
- `solicitud_id` - ID de la solicitud creada o consultada
- `solicitante_id` - ID del solicitante registrado
- `num_expediente` - Número de expediente (ej: PPSH-2025-0001)
- `documento_id` - ID de documento cargado

## 🔄 Regenerar Datos

Si necesitas limpiar y regenerar los datos:

```bash
# 1. Limpiar datos existentes
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -Q "USE SIM_PANAMA; 
      DELETE FROM PPSH_COMENTARIO WHERE id_solicitud IN (SELECT id_solicitud FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%');
      DELETE FROM PPSH_ENTREVISTA WHERE id_solicitud IN (SELECT id_solicitud FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%');
      DELETE FROM PPSH_PAGO WHERE id_solicitud IN (SELECT id_solicitud FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%');
      DELETE FROM PPSH_SOLICITANTE WHERE id_solicitud IN (SELECT id_solicitud FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%');
      DELETE FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%';" \
  -C

# 2. Regenerar datos
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -i /docker-entrypoint-initdb.d/ppsh_test_data.sql \
  -C
```

## 📊 Datos Incluidos

### Conceptos de Pago (3)
- **PPSH_TRAM**: Trámite PPSH - $50.00
- **PPSH_RENOV**: Renovación PPSH - $30.00
- **PPSH_DUPLIC**: Duplicado Carnet - $15.00

### Solicitantes (10)
- 3 titulares (Carlos González, Ana Martínez, Rosa Hernández)
- 7 dependientes (cónyuges e hijos)

### Países Representados
- Venezuela (VEN)
- Colombia (COL)
- Costa Rica (CRI)
- Siria (SYR)
- México (MEX)

### Causas Humanitarias
- Conflicto Armado
- Persecución Política
- Reunificación Familiar
- Razones Médicas
- Otro

## 🧪 Casos de Prueba Sugeridos

### Flujo Completo - Caso Familia Venezolana (ID: 6)

1. **Consultar solicitud**:
   ```
   GET /api/v1/ppsh/solicitudes/6
   ```

2. **Ver solicitantes** (debe mostrar 4):
   ```
   GET /api/v1/ppsh/solicitudes/6/solicitantes
   ```

3. **Ver comentarios internos** (debe mostrar 2):
   ```
   GET /api/v1/ppsh/solicitudes/6/comentarios
   ```

4. **Agregar nuevo comentario**:
   ```json
   POST /api/v1/ppsh/solicitudes/6/comentarios
   {
     "user_id": "admin",
     "comentario": "Verificación de documentos completada",
     "es_interno": true
   }
   ```

### Flujo de Pago - Caso Aprobado (ID: 9)

1. **Ver datos de la solicitud**:
   ```
   GET /api/v1/ppsh/solicitudes/9
   ```

2. **Ver pago registrado**:
   ```
   GET /api/v1/ppsh/solicitudes/9/pagos
   ```

3. **Ver entrevista realizada**:
   ```
   GET /api/v1/ppsh/solicitudes/9/entrevistas
   ```

## ✅ Verificación

Para verificar que los datos se cargaron correctamente:

```sql
-- Ejecutar en SQL Server
USE SIM_PANAMA;

-- Ver resumen
SELECT 
    'Solicitudes' AS Tabla, COUNT(*) AS Total 
FROM PPSH_SOLICITUD WHERE num_expediente LIKE 'PPSH-2025-%'
UNION ALL
SELECT 'Solicitantes', COUNT(*) 
FROM PPSH_SOLICITANTE s
INNER JOIN PPSH_SOLICITUD sol ON s.id_solicitud = sol.id_solicitud
WHERE sol.num_expediente LIKE 'PPSH-2025-%'
UNION ALL
SELECT 'Pagos', COUNT(*) 
FROM PPSH_PAGO
UNION ALL
SELECT 'Conceptos Pago', COUNT(*) 
FROM PPSH_CONCEPTO_PAGO;

-- Ver solicitudes por estado
SELECT 
    estado_actual, 
    COUNT(*) as cantidad,
    prioridad
FROM PPSH_SOLICITUD 
WHERE num_expediente LIKE 'PPSH-2025-%'
GROUP BY estado_actual, prioridad
ORDER BY prioridad, cantidad DESC;
```

## 🚀 Siguiente Paso

Ahora puedes ejecutar la colección completa de Postman:

```bash
newman run backend/postman/PPSH_Complete_API.postman_collection.json \
  --environment backend/postman/env-dev.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export reports/ppsh-test-$(date +%Y%m%d-%H%M%S).html
```

---

**Última actualización:** 23 de Octubre de 2025
