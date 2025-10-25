# 🔧 Correcciones al Sistema de Testing Automatizado

## Fecha: 21 de Octubre, 2025

### ✅ Problemas Corregidos

#### 1. **Health Check de Base de Datos (SQL Server 2019)**
- **Problema**: El comando `sqlcmd` no estaba en la ruta `/opt/mssql-tools/bin/`
- **Solución**: Actualizado a `/opt/mssql-tools18/bin/sqlcmd` con el flag `-C` para SSL

```yaml
healthcheck:
  test: /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -Q "SELECT 1" -C || exit 1
```

#### 2. **Nombre de Base de Datos Inconsistente**
- **Problema**: El script de inicialización creaba `SIM_PANAMA` pero la aplicación buscaba `TramitesTestDB`
- **Solución**: Actualizado `DATABASE_NAME=SIM_PANAMA` y `ODBC Driver 18` en docker-compose

#### 3. **Comandos Newman Multi-línea**
- **Problema**: Los backslashes `\` causaban que shell no interpretara correctamente los argumentos
- **Solución**: Comandos newman en una sola línea con todos los parámetros

#### 4. **Verificación de Health con curl**
- **Problema**: `curl` no está disponible en la imagen `postman/newman:6-alpine`
- **Solución**: Cambiado a `wget -q --spider` que sí está disponible

#### 5. **Ruta Incorrecta de Colecciones**
- **Problema**: Newman buscaba en `/etc/newman/backend/` pero el volumen monta en `/etc/newman/`
- **Solución**: Rutas corregidas a `/etc/newman/PPSH_Complete_API.postman_collection.json`

---

## 🚀 Cómo Ejecutar los Tests

### Opción 1: Docker Compose (Recomendado)
```powershell
docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit
```

### Opción 2: Script PowerShell
```powershell
.\run-api-tests.ps1
```

### Opción 3: Script Bash (Linux/Mac/WSL)
```bash
./run-api-tests.sh
```

### Opción 4: Makefile
```bash
make -f Makefile.api-tests test-api
```

---

## 📊 Qué Sucede Durante la Ejecución

1. **⏱️ Inicialización (60-90 segundos)**
   - SQL Server 2019 inicia y ejecuta health checks
   - Redis se inicializa
   - Backend de FastAPI se conecta y crea tablas

2. **🧪 Ejecución de Tests (2-5 minutos)**
   - **Test 1**: PPSH Complete API (34 requests, ~102 tests)
   - **Test 2**: Workflow API (29 requests, ~87 tests)
   - **Test 3**: Trámites Base API (13 requests, ~39 tests)

3. **📈 Generación de Reportes**
   - Reportes HTML interactivos en `./test-reports/`
   - Resultados JSON para CI/CD

---

## 📁 Estructura de Reportes

```
./test-reports/
├── ppsh-report.html          # ✅ Reporte visual PPSH
├── ppsh-results.json         # 📊 JSON para CI/CD
├── workflow-report.html      # ✅ Reporte visual Workflow
├── workflow-results.json     # 📊 JSON para CI/CD
├── tramites-report.html      # ✅ Reporte visual Trámites
└── tramites-results.json     # 📊 JSON para CI/CD
```

### Ver Reportes

1. **Mientras los tests corren**:
   ```
   http://localhost:8080
   ```

2. **Después de los tests**:
   - Abrir `./test-reports/ppsh-report.html` en navegador
   - Abrir `./test-reports/workflow-report.html` en navegador
   - Abrir `./test-reports/tramites-report.html` en navegador

---

## 🔍 Troubleshooting

### El backend no inicia
```powershell
# Ver logs específicos
docker logs tramites-backend-test

# Verificar conectividad a BD
docker exec -it tramites-db-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TestP@ssw0rd2025!" -C -Q "SELECT 1"
```

### Los tests fallan inmediatamente
```powershell
# Verificar que el backend responde
docker exec -it tramites-newman-tests wget -q -O- http://backend-test:8000/health
```

### Puerto 8001 o 6380 ya en uso
```powershell
# Cambiar puertos en docker-compose.api-tests.yml
ports:
  - "8002:8000"  # Backend en 8002 en lugar de 8001
  - "6381:6379"  # Redis en 6381 en lugar de 6380
```

---

## 📝 Variables de Entorno para Newman

Las colecciones usan estas variables que se pasan automáticamente:

```javascript
{{base_url}}      // http://backend-test:8000
{{api_prefix}}    // /api/v1/ppsh o /api/v1/workflow o /api/v1
```

**Ejemplo de URL completa**:
```
{{base_url}}{{api_prefix}}/solicitudes
↓
http://backend-test:8000/api/v1/ppsh/solicitudes
```

---

## 🎯 Próximos Pasos

1. **✅ Verificar que todos los tests pasen**
   ```powershell
   docker-compose -f docker-compose.api-tests.yml up
   ```

2. **📊 Revisar reportes HTML**
   - Identificar tests que fallan
   - Revisar tiempos de respuesta
   - Validar que las assertions son correctas

3. **🔄 Integración CI/CD**
   - Agregar al pipeline de GitHub Actions
   - Configurar notificaciones de fallos
   - Generar reportes automáticos

4. **📈 Métricas y Monitoreo**
   - Tracking de cobertura de tests
   - Tiempo de ejecución promedio
   - Tasa de éxito/fallo

---

## 🛠️ Comandos Útiles

```powershell
# Limpiar todo y empezar de cero
docker-compose -f docker-compose.api-tests.yml down -v
docker-compose -f docker-compose.api-tests.yml up --build

# Ver logs en tiempo real
docker-compose -f docker-compose.api-tests.yml logs -f

# Ver solo logs del backend
docker-compose -f docker-compose.api-tests.yml logs -f backend-test

# Ver solo logs de newman
docker-compose -f docker-compose.api-tests.yml logs -f newman-api-tests

# Parar servicios
docker-compose -f docker-compose.api-tests.yml down

# Parar y borrar volúmenes
docker-compose -f docker-compose.api-tests.yml down -v
```

---

## ✨ Resultado Esperado

Si todo funciona correctamente, verás:

```
✅ Backend está disponible

═══════════════════════════════════════════════════════════
📊 TEST 1/3: PPSH Complete API
═══════════════════════════════════════════════════════════
newman

PPSH - API Completa

❏ 1. Catálogos
↳ Listar Causas Humanitarias
  GET http://backend-test:8000/api/v1/ppsh/catalogos/causas-humanitarias [200 OK, 1.2KB, 250ms]
  ✓ Status code is 200
  ✓ Response is array
  ✓ Causas have required fields

...

┌─────────────────────────┬────────────┬────────────┐
│                         │  executed  │    failed  │
├─────────────────────────┼────────────┼────────────┤
│              iterations │          1 │          0 │
├─────────────────────────┼────────────┼────────────┤
│                requests │         34 │          0 │
├─────────────────────────┼────────────┼────────────┤
│            test-scripts │         34 │          0 │
├─────────────────────────┼────────────┼────────────┤
│              assertions │        102 │          0 │
└─────────────────────────┴────────────┴────────────┘

═══════════════════════════════════════════════════════════
✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE
═══════════════════════════════════════════════════════════
```

---

## 📚 Documentación Adicional

- **POSTMAN_COLLECTIONS_README.md** - Guía completa de las colecciones Postman
- **POSTMAN_NEWMAN_COMMANDS.md** - Comandos Newman y ejemplos CI/CD
- **API_TESTING_README.md** - Documentación del sistema de testing automático

---

## 💡 Tips

1. **Primera ejecución**: Puede tardar más (descarga de imágenes Docker)
2. **Logs verbosos**: Usa `LOG_LEVEL=DEBUG` en environment para más detalles
3. **Tests individuales**: Puedes ejecutar solo un módulo modificando el entrypoint
4. **Desarrollo local**: El puerto 8001 te permite probar endpoints manualmente mientras corren los tests

---

**Creado por**: GitHub Copilot  
**Fecha**: 21 de Octubre, 2025  
**Versión**: 1.0
