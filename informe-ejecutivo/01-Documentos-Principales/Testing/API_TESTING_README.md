# 🧪 Testing Automatizado de API

Sistema completo de testing automatizado para la API del Sistema de Trámites Migratorios de Panamá usando Docker Compose y Newman (Postman CLI).

---

## 📋 Contenido

- [Descripción](#descripción)
- [Prerequisitos](#prerequisitos)
- [Inicio Rápido](#inicio-rápido)
- [Archivos Incluidos](#archivos-incluidos)
- [Uso Detallado](#uso-detallado)
- [Reportes](#reportes)
- [Configuración Avanzada](#configuración-avanzada)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción

Este sistema automatizado:

✅ Levanta un ambiente completo de testing (Backend + SQL Server + Redis)  
✅ Ejecuta todas las colecciones de Postman automáticamente  
✅ Genera reportes HTML detallados con estadísticas  
✅ Valida 100% de los endpoints de la API (51 endpoints)  
✅ Ejecuta ~228 tests automáticos  
✅ Se limpia automáticamente al finalizar  

**Tiempo estimado de ejecución:** 5-10 minutos

---

## 📦 Prerequisitos

### Requerido:
- **Docker** >= 20.10
- **Docker Compose** >= 1.29

### Opcional (para scripts helper):
- **Bash** (Linux/Mac) o **PowerShell** (Windows)
- **Make** (para usar Makefile)
- **jq** (para parsear resultados JSON en scripts)

---

## 🚀 Inicio Rápido

### Opción 1: Docker Compose Directo

```bash
# Ejecutar todos los tests
docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit

# Limpiar después
docker-compose -f docker-compose.api-tests.yml down -v
```

### Opción 2: Script Bash (Linux/Mac)

```bash
# Dar permisos de ejecución
chmod +x run-api-tests.sh

# Ejecutar
./run-api-tests.sh
```

### Opción 3: Script PowerShell (Windows)

```powershell
# Ejecutar
.\run-api-tests.ps1
```

### Opción 4: Makefile

```bash
# Ver comandos disponibles
make -f Makefile.api-tests help

# Ejecutar tests
make -f Makefile.api-tests test-api

# Ver reportes
make -f Makefile.api-tests test-api-reports
```

---

## 📁 Archivos Incluidos

### Archivo Principal:
```
docker-compose.api-tests.yml    # Definición de servicios de testing
```

### Scripts de Ayuda:
```
run-api-tests.sh               # Script Bash para Linux/Mac
run-api-tests.ps1              # Script PowerShell para Windows
Makefile.api-tests             # Makefile con comandos útiles
```

### Reportes (generados automáticamente):
```
test-reports/
├── ppsh-report.html           # Reporte PPSH API
├── ppsh-results.json          # Resultados JSON PPSH
├── workflow-report.html       # Reporte Workflow API
├── workflow-results.json      # Resultados JSON Workflow
├── tramites-report.html       # Reporte Trámites Base
└── tramites-results.json      # Resultados JSON Trámites
```

---

## 🎮 Uso Detallado

### Servicios Incluidos

El docker-compose levanta 5 servicios:

#### 1. **db-test** - SQL Server 2019
- Base de datos para testing
- Puerto: 1434 (host) → 1433 (container)
- Usuario: `sa`
- Password: `TestP@ssw0rd2025!`

#### 2. **redis-test** - Redis 7
- Cache y sesiones
- Puerto: 6380 (host) → 6379 (container)

#### 3. **backend-test** - FastAPI Application
- API bajo testing
- Puerto: 8001 (host) → 8000 (container)
- Health check: http://localhost:8001/health

#### 4. **newman-api-tests** - Newman Test Runner
- Ejecuta las colecciones de Postman
- Genera reportes automáticamente
- Se detiene al finalizar

#### 5. **report-viewer** - Nginx
- Servidor HTTP para ver reportes
- Puerto: 8080
- URL: http://localhost:8080

---

### Flujo de Ejecución

```
1. Inicio
   ↓
2. Limpiar ambiente anterior
   ↓
3. Levantar SQL Server (esperar health check)
   ↓
4. Levantar Redis (esperar health check)
   ↓
5. Inicializar base de datos
   ↓
6. Cargar datos de prueba
   ↓
7. Levantar Backend FastAPI (esperar health check)
   ↓
8. Ejecutar health check inicial
   ↓
9. Ejecutar colección PPSH (34 requests)
   ↓
10. Ejecutar colección Workflow (29 requests)
   ↓
11. Ejecutar colección Trámites Base (13 requests)
   ↓
12. Generar reportes HTML y JSON
   ↓
13. Mostrar resumen de resultados
   ↓
14. Detener servicios automáticamente
   ↓
15. Fin
```

---

## 📊 Reportes

### Reportes HTML

Los reportes HTML incluyen:

- ✅ Resumen ejecutivo con métricas
- ✅ Lista de todos los requests ejecutados
- ✅ Tests pasados y fallidos
- ✅ Tiempos de respuesta
- ✅ Request/Response details
- ✅ Variables utilizadas
- ✅ Gráficos de estadísticas

**Ubicación:** `./test-reports/*.html`

### Reportes JSON

Los reportes JSON incluyen:

- Estadísticas detalladas
- Información de cada iteración
- Datos de assertions
- Tiempos de ejecución
- Variables y environments

**Ubicación:** `./test-reports/*.json`

### Ver Reportes

#### Opción 1: Abrir archivos directamente
```bash
# Linux/Mac
open test-reports/ppsh-report.html
open test-reports/workflow-report.html
open test-reports/tramites-report.html

# Windows
start test-reports\ppsh-report.html
start test-reports\workflow-report.html
start test-reports\tramites-report.html
```

#### Opción 2: Usar servidor HTTP
```
http://localhost:8080/ppsh-report.html
http://localhost:8080/workflow-report.html
http://localhost:8080/tramites-report.html
```

#### Opción 3: Con Makefile
```bash
make -f Makefile.api-tests test-api-reports
```

---

## ⚙️ Configuración Avanzada

### Variables de Ambiente

Puedes personalizar las variables en `docker-compose.api-tests.yml`:

```yaml
environment:
  # Database
  - DATABASE_HOST=db-test
  - DATABASE_NAME=TramitesTestDB
  - DATABASE_USER=sa
  - DATABASE_PASSWORD=TestP@ssw0rd2025!
  
  # Redis
  - REDIS_HOST=redis-test
  - REDIS_PORT=6379
  
  # Testing
  - TESTING_MODE=true
  - CREATE_TEST_DATA=true
```

### Personalizar Delays

En el servicio `newman-api-tests`, ajusta el delay entre requests:

```yaml
--delay-request 200   # milliseconds
```

### Personalizar Timeouts

```yaml
--timeout-request 30000   # milliseconds (30 segundos)
```

### Ejecutar Solo Una Colección

```bash
# Solo PPSH
docker run --rm --network tramites-test-network \
  -v $(pwd)/backend:/etc/newman \
  postman/newman:6-alpine \
  run /etc/newman/PPSH_Complete_API.postman_collection.json \
  --global-var "base_url=http://backend-test:8000"

# Solo Workflow
docker run --rm --network tramites-test-network \
  -v $(pwd)/backend:/etc/newman \
  postman/newman:6-alpine \
  run /etc/newman/Workflow_API_Tests.postman_collection.json \
  --global-var "base_url=http://backend-test:8000"

# Solo Trámites
docker run --rm --network tramites-test-network \
  -v $(pwd)/backend:/etc/newman \
  postman/newman:6-alpine \
  run /etc/newman/Tramites_Base_API.postman_collection.json \
  --global-var "base_url=http://backend-test:8000"
```

### Ejecutar Carpeta Específica

```bash
docker run --rm --network tramites-test-network \
  -v $(pwd)/backend:/etc/newman \
  postman/newman:6-alpine \
  run /etc/newman/PPSH_Complete_API.postman_collection.json \
  --folder "Catálogos" \
  --global-var "base_url=http://backend-test:8000"
```

---

## 🤖 CI/CD

### GitHub Actions

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run API Tests
        run: |
          docker-compose -f docker-compose.api-tests.yml up \
            --abort-on-container-exit \
            --exit-code-from newman-api-tests
      
      - name: Upload test reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-reports
          path: test-reports/
      
      - name: Cleanup
        if: always()
        run: docker-compose -f docker-compose.api-tests.yml down -v
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('API Tests') {
            steps {
                sh '''
                    docker-compose -f docker-compose.api-tests.yml up \
                        --abort-on-container-exit \
                        --exit-code-from newman-api-tests
                '''
            }
        }
        
        stage('Publish Reports') {
            steps {
                publishHTML([
                    reportDir: 'test-reports',
                    reportFiles: '*.html',
                    reportName: 'API Test Reports'
                ])
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose -f docker-compose.api-tests.yml down -v'
        }
    }
}
```

### GitLab CI

```yaml
test:api:
  stage: test
  image: docker/compose:latest
  services:
    - docker:dind
  script:
    - docker-compose -f docker-compose.api-tests.yml up --abort-on-container-exit --exit-code-from newman-api-tests
  after_script:
    - docker-compose -f docker-compose.api-tests.yml down -v
  artifacts:
    when: always
    paths:
      - test-reports/
    reports:
      junit: test-reports/*.json
```

---

## 🐛 Troubleshooting

### Problema: "Port already in use"

**Solución:** Cambiar puertos en `docker-compose.api-tests.yml`

```yaml
ports:
  - "1435:1433"  # En lugar de 1434
  - "6381:6379"  # En lugar de 6380
  - "8002:8000"  # En lugar de 8001
```

### Problema: "Container exited with code 1"

**Solución:** Ver logs detallados

```bash
docker-compose -f docker-compose.api-tests.yml logs newman-api-tests
```

### Problema: "Database connection failed"

**Solución:** Aumentar tiempo de espera

En `docker-compose.api-tests.yml`, aumentar `start_period` del healthcheck:

```yaml
healthcheck:
  start_period: 60s  # En lugar de 30s
```

### Problema: "Tests fallan aleatoriamente"

**Solución:** Aumentar delays

```yaml
--delay-request 500   # En lugar de 200
```

### Problema: "No se generan reportes"

**Verificar:**

1. Permisos del directorio `test-reports/`
2. Volúmenes montados correctamente
3. Newman reporter instalado

```bash
# Verificar volúmenes
docker-compose -f docker-compose.api-tests.yml config
```

### Problema: "Out of memory"

**Solución:** Asignar más memoria a Docker

```bash
# En Docker Desktop, ir a Settings → Resources → Memory
# Aumentar a al menos 4GB
```

---

## 📈 Métricas de Testing

### Cobertura Actual:

| Módulo | Endpoints | Requests | Tests |
|--------|-----------|----------|-------|
| PPSH | 19 | 34 | ~102 |
| Workflow | 27 | 29 | ~87 |
| Trámites Base | 5 | 13 | ~39 |
| **TOTAL** | **51** | **76** | **~228** |

### Tiempos Estimados:

- Inicialización de servicios: 2-3 minutos
- Ejecución de tests: 2-3 minutos
- Generación de reportes: 30 segundos
- **Total:** 5-7 minutos

---

## 🔧 Comandos Útiles

### Ver logs en tiempo real:

```bash
docker-compose -f docker-compose.api-tests.yml logs -f newman-api-tests
```

### Conectar a la base de datos:

```bash
docker-compose -f docker-compose.api-tests.yml exec db-test \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'TestP@ssw0rd2025!'
```

### Conectar a Redis:

```bash
docker-compose -f docker-compose.api-tests.yml exec redis-test redis-cli
```

### Entrar al contenedor del backend:

```bash
docker-compose -f docker-compose.api-tests.yml exec backend-test sh
```

### Ver estado de servicios:

```bash
docker-compose -f docker-compose.api-tests.yml ps
```

### Limpiar todo:

```bash
docker-compose -f docker-compose.api-tests.yml down -v
docker volume prune -f
rm -rf test-reports/*
```

---

## 📚 Referencias

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Postman Collection Format](https://schema.postman.com/)

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs: `docker-compose -f docker-compose.api-tests.yml logs`
2. Verificar health checks: `docker-compose -f docker-compose.api-tests.yml ps`
3. Revisar esta documentación
4. Contactar al equipo de desarrollo

---

**Última actualización:** 2025-10-21  
**Versión:** 1.0.0  
**Mantenido por:** Sistema de Trámites MVP Panamá
