# Migración de Endpoints Legacy /tramites a /sim-ft/tramites

## 📋 Resumen

Se ha completado la migración de los endpoints de trámites del sistema legacy (`TRAMITE` table) al sistema oficial SIM_FT (`SIM_FT_TRAMITE_E` table), aprovechando Redis caching para mejorar el rendimiento.

## ✅ Cambios Implementados

### 1. Sistema SIM_FT - Caching Añadido

Se añadió Redis caching a los siguientes endpoints en `backend/app/routers/routers_sim_ft.py`:

#### GET /sim-ft/tramites (Lista)
- **Cache Key Pattern**: `sim_ft:tramites:{num_annio}:{cod_tramite}:{ind_estatus}:{ind_prioridad}:{skip}:{limit}:{fecha_desde}:{fecha_hasta}`
- **TTL**: 300 segundos (5 minutos)
- **Campos Cacheados**: 13 campos incluyendo timestamps convertidos con `.isoformat()`
- **Invalidación**: Al crear (POST) o actualizar (PUT) trámites

#### GET /sim-ft/tramites/{num_annio}/{num_tramite}/{num_registro} (Detalle)
- **Cache Key Pattern**: `sim_ft:tramite:{num_annio}:{num_tramite}:{num_registro}`
- **TTL**: 300 segundos (5 minutos)
- **Campos Cacheados**: Mismos 13 campos que lista
- **Invalidación**: Al crear (POST) o actualizar (PUT) cualquier trámite

#### POST /sim-ft/tramites
- **Invalidación de Cache**: Elimina todas las claves `sim_ft:tramites:*` y `sim_ft:tramite:*`
- **Pattern**: `redis.keys("sim_ft:tramites:*")` + `redis.delete(*keys)`

#### PUT /sim-ft/tramites/{num_annio}/{num_tramite}/{num_registro}
- **Invalidación de Cache**: Misma estrategia que POST

### 2. Sistema Legacy - Marcado como Deprecado

Todos los endpoints en `backend/app/routers/routers.py` se marcaron como deprecados:

- ✅ `GET /tramites` - deprecated=True
- ✅ `GET /tramites/{tramite_id}` - deprecated=True
- ✅ `POST /tramites` - deprecated=True
- ✅ `PUT /tramites/{tramite_id}` - deprecated=True
- ✅ `DELETE /tramites/{tramite_id}` - deprecated=True

**Cada endpoint incluye**:
- Parámetro `deprecated=True` en el decorador
- Docstring con advertencia: `⚠️ DEPRECADO: Usar [endpoint equivalente en SIM_FT]`
- Comentario explicativo en código

## 🔄 Diferencias Clave Entre Sistemas

### Legacy System (`/tramites`)
```python
# Tabla: TRAMITE
# Primary Key: id (simple, auto-increment)
# Filtros: IND_ACTIVO only
# Operación: Soft delete (IND_ACTIVO = False)
```

**Endpoints**:
- `GET /tramites?skip=0&limit=10`
- `GET /tramites/{tramite_id}`
- `POST /tramites`
- `PUT /tramites/{tramite_id}`
- `DELETE /tramites/{tramite_id}`

### Official System (`/sim-ft/tramites`)
```python
# Tabla: SIM_FT_TRAMITE_E
# Primary Key: (NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO) - composite
# Filtros: 6 parámetros opcionales + paginación
# Operación: No hay DELETE - usar endpoint de cierre
```

**Endpoints**:
- `GET /sim-ft/tramites?num_annio=2024&cod_tramite=T001&ind_estatus=A&...`
- `GET /sim-ft/tramites/{num_annio}/{num_tramite}/{num_registro}`
- `POST /sim-ft/tramites`
- `PUT /sim-ft/tramites/{num_annio}/{num_tramite}/{num_registro}`
- `POST /sim-ft/tramites/{num_annio}/{num_tramite}/{num_registro}/cierre` (en lugar de DELETE)

## 📊 Mapeo de Campos

| Legacy TRAMITE | SIM_FT_TRAMITE_E | Notas |
|---------------|------------------|-------|
| `id` | `NUM_ANNIO + NUM_TRAMITE + NUM_REGISTRO` | Cambio de PK simple a compuesta |
| `NOM_TITULO` | `COD_TRAMITE` (FK) | Referencia a SIM_FT_TRAMITES |
| `DESCRIPCION` | `OBS_OBSERVA` | Campo de observaciones |
| `COD_ESTADO` | `IND_ESTATUS` | Referencia a SIM_FT_ESTATUS |
| `IND_ACTIVO` | N/A | No existe - usar cierre |
| `FEC_CREA_REG` | `FEC_INI_TRAMITE` | Fecha inicio |
| `FEC_MODIF_REG` | `FEC_ACTUALIZA` | Última actualización |
| N/A | `FEC_FIN_TRAMITE` | Nueva - fecha finalización |
| N/A | `IND_PRIORIDAD` | Nueva - prioridad del trámite |
| N/A | `HITS_TRAMITE` | Nueva - contador de accesos |
| N/A | `IND_CONCLUSION` | Nueva - tipo conclusión |
| N/A | `ID_USUARIO_CREA` | Nueva - auditoría usuario |

## 🧪 Pruebas Requeridas

### Test 1: Verificar Cache en GET Lista
```bash
# Primera consulta (debe consultar DB y cachear)
curl -X GET "http://localhost:8000/api/v1/sim-ft/tramites?skip=0&limit=10"

# Verificar clave en Redis
docker exec tramites-redis redis-cli KEYS "sim_ft:tramites:*"

# Segunda consulta (debe venir de cache)
curl -X GET "http://localhost:8000/api/v1/sim-ft/tramites?skip=0&limit=10"
```

### Test 2: Verificar Invalidación de Cache en POST
```bash
# Crear nuevo trámite
curl -X POST "http://localhost:8000/api/v1/sim-ft/tramites" \
  -H "Content-Type: application/json" \
  -d '{
    "NUM_ANNIO": 2024,
    "NUM_TRAMITE": 999,
    "COD_TRAMITE": "T001",
    "NUM_REGISTRO": 1,
    "IND_ESTATUS": "A"
  }'

# Verificar que cache fue invalidado
docker exec tramites-redis redis-cli KEYS "sim_ft:tramites:*"
# Debe estar vacío o con solo la nueva consulta
```

### Test 3: Verificar Cache en GET Detalle
```bash
# Consultar trámite específico
curl -X GET "http://localhost:8000/api/v1/sim-ft/tramites/2024/1/1"

# Verificar clave en Redis
docker exec tramites-redis redis-cli GET "sim_ft:tramite:2024:1:1"
```

### Test 4: Verificar Endpoints Legacy Deprecados
```bash
# Consultar endpoint legacy
curl -X GET "http://localhost:8000/api/v1/tramites"

# Verificar que funciona pero muestra advertencia en docs
# Visitar: http://localhost:8000/docs
# Los endpoints legacy deben aparecer con etiqueta "deprecated"
```

## 📝 Postman Collection

### Actualizar Variables de Entorno
```json
{
  "sim_ft_base_url": "http://localhost:8000/api/v1/sim-ft",
  "num_annio": "2024",
  "num_tramite": "1",
  "num_registro": "1"
}
```

### Requests Actualizados

#### GET Lista de Trámites
```
GET {{sim_ft_base_url}}/tramites?num_annio={{num_annio}}&skip=0&limit=10
```

#### GET Trámite Específico
```
GET {{sim_ft_base_url}}/tramites/{{num_annio}}/{{num_tramite}}/{{num_registro}}
```

#### POST Nuevo Trámite
```
POST {{sim_ft_base_url}}/tramites
Content-Type: application/json

{
  "NUM_ANNIO": {{num_annio}},
  "NUM_TRAMITE": 999,
  "COD_TRAMITE": "T001",
  "NUM_REGISTRO": 1,
  "IND_ESTATUS": "A",
  "IND_PRIORIDAD": "M"
}
```

#### PUT Actualizar Trámite
```
PUT {{sim_ft_base_url}}/tramites/{{num_annio}}/{{num_tramite}}/{{num_registro}}
Content-Type: application/json

{
  "IND_ESTATUS": "C",
  "OBS_OBSERVA": "Trámite completado"
}
```

#### POST Cerrar Trámite (en lugar de DELETE)
```
POST {{sim_ft_base_url}}/tramites/{{num_annio}}/{{num_tramite}}/{{num_registro}}/cierre
Content-Type: application/json

{
  "IND_CONCLUSION": "A",
  "FEC_FIN_TRAMITE": "2024-10-24T17:00:00"
}
```

## 🎯 Timeline de Migración

### Fase 1: ✅ COMPLETADA (Actual)
- [x] Añadir caching a SIM_FT endpoints
- [x] Marcar legacy endpoints como deprecados
- [x] Reiniciar backend con cambios
- [x] Documentar migración

### Fase 2: 📋 PENDIENTE (Testing)
- [ ] Actualizar Postman collection
- [ ] Probar todos los endpoints SIM_FT con cache
- [ ] Verificar invalidación de cache
- [ ] Validar performance improvements
- [ ] Documentar resultados de pruebas

### Fase 3: 🔮 FUTURO (Cleanup)
- [ ] Migrar clientes/consumidores a endpoints SIM_FT
- [ ] Monitorear uso de endpoints legacy (logs)
- [ ] Después de período de gracia (ej: 30 días):
  - [ ] Remover endpoints legacy de routers.py
  - [ ] Remover modelo Tramite de models.py
  - [ ] Actualizar documentación final

## 🔍 Monitoreo

### Verificar Uso de Cache
```bash
# Ver todas las claves de cache
docker exec tramites-redis redis-cli KEYS "*"

# Ver estadísticas de Redis
docker exec tramites-redis redis-cli INFO stats

# Monitorear operaciones en tiempo real
docker exec tramites-redis redis-cli MONITOR
```

### Logs de Backend
```bash
# Ver logs en tiempo real
docker logs -f tramites-backend

# Buscar accesos a endpoints legacy
docker logs tramites-backend 2>&1 | grep "GET /api/v1/tramites"

# Buscar accesos a endpoints SIM_FT
docker logs tramites-backend 2>&1 | grep "GET /api/v1/sim-ft/tramites"
```

## ⚠️ Consideraciones Importantes

1. **No hay DELETE en SIM_FT**: El sistema oficial usa un mecanismo de "cierre" (`/cierre`) en lugar de eliminar registros. Los trámites se marcan como finalizados con un tipo de conclusión.

2. **Composite Keys**: El sistema SIM_FT usa claves compuestas `(NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO)` en lugar de un ID simple. Asegurar que todas las llamadas incluyan los tres valores.

3. **Cache Invalidation**: Cualquier POST o PUT invalida TODO el cache de trámites. Esto es intencionalmente conservador para evitar datos obsoletos.

4. **TTL de 5 minutos**: El cache expira automáticamente después de 5 minutos. Para datos más dinámicos, considerar reducir el TTL.

5. **Datetime Serialization**: Todos los campos datetime se convierten a ISO format usando `.isoformat()` antes de cachear.

## 📚 Referencias

- **Código Cache**: `backend/app/routers/routers_sim_ft.py` líneas 521-742
- **Código Legacy**: `backend/app/routers/routers.py` líneas 11-165
- **Modelos SIM_FT**: `backend/app/models/models_sim_ft.py`
- **Schemas SIM_FT**: `backend/app/schemas/schemas_sim_ft.py`
- **Redis Client**: `backend/app/redis_client.py`

## 🤝 Soporte

Para preguntas o problemas con la migración:
1. Revisar este documento
2. Consultar logs de backend: `docker logs tramites-backend`
3. Verificar estado de Redis: `docker exec tramites-redis redis-cli INFO`
4. Revisar Postman tests en colección actualizada

---

**Última actualización**: 2024-10-24 17:03:00  
**Estado**: Fase 1 completada - Testing requerido  
**Responsable**: Equipo de Desarrollo
