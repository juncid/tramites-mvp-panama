# 🛠️ Comandos Útiles - Newman & Postman CLI

Este documento contiene comandos útiles para ejecutar las colecciones de Postman desde la línea de comandos usando Newman.

---

## 📦 Instalación

### Newman (Node.js required)
```bash
npm install -g newman
```

### Newman HTML Reporter
```bash
npm install -g newman-reporter-html
```

### Newman HTML Extra Reporter (con capturas)
```bash
npm install -g newman-reporter-htmlextra
```

---

## 🚀 Comandos Básicos

### Ejecutar una colección
```bash
newman run PPSH_Complete_API.postman_collection.json
```

### Ejecutar con environment
```bash
newman run PPSH_Complete_API.postman_collection.json -e production.postman_environment.json
```

### Ejecutar con variables globales
```bash
newman run PPSH_Complete_API.postman_collection.json --global-var "base_url=http://localhost:8000"
```

---

## 📊 Reportes

### Reporte HTML simple
```bash
newman run PPSH_Complete_API.postman_collection.json -r html
```

### Reporte HTML con ruta personalizada
```bash
newman run PPSH_Complete_API.postman_collection.json -r html --reporter-html-export ./reports/ppsh-report.html
```

### Múltiples formatos de reporte
```bash
newman run PPSH_Complete_API.postman_collection.json -r cli,json,html
```

### Reporte HTML Extra (detallado)
```bash
newman run PPSH_Complete_API.postman_collection.json -r htmlextra --reporter-htmlextra-export ./reports/ppsh-detailed.html
```

---

## ⚙️ Configuración Avanzada

### Con delay entre requests (recomendado para tests)
```bash
newman run PPSH_Complete_API.postman_collection.json --delay-request 500
```

### Con timeout personalizado (30 segundos)
```bash
newman run PPSH_Complete_API.postman_collection.json --timeout-request 30000
```

### Sin seguir redirects
```bash
newman run PPSH_Complete_API.postman_collection.json --no-follow-redirect
```

### Con SSL verification deshabilitado (solo desarrollo)
```bash
newman run PPSH_Complete_API.postman_collection.json --insecure
```

---

## 🔄 Iteraciones y Datos

### Ejecutar múltiples iteraciones
```bash
newman run PPSH_Complete_API.postman_collection.json -n 5
```

### Con archivo de datos CSV
```bash
newman run PPSH_Complete_API.postman_collection.json -d test-data.csv
```

### Con archivo de datos JSON
```bash
newman run PPSH_Complete_API.postman_collection.json -d test-data.json
```

---

## 📁 Ejecutar Todas las Colecciones

### Script Bash (Linux/Mac)
```bash
#!/bin/bash
echo "🚀 Ejecutando todas las colecciones..."

echo "📋 1. PPSH Complete API..."
newman run PPSH_Complete_API.postman_collection.json -r html --reporter-html-export ./reports/ppsh.html

echo "📋 2. Workflow API..."
newman run Workflow_API_Tests.postman_collection.json -r html --reporter-html-export ./reports/workflow.html

echo "📋 3. Tramites Base API..."
newman run Tramites_Base_API.postman_collection.json -r html --reporter-html-export ./reports/tramites.html

echo "✅ Todas las colecciones ejecutadas. Ver reportes en ./reports/"
```

### Script PowerShell (Windows)
```powershell
Write-Host "🚀 Ejecutando todas las colecciones..." -ForegroundColor Green

Write-Host "📋 1. PPSH Complete API..." -ForegroundColor Cyan
newman run PPSH_Complete_API.postman_collection.json -r html --reporter-html-export ./reports/ppsh.html

Write-Host "📋 2. Workflow API..." -ForegroundColor Cyan
newman run Workflow_API_Tests.postman_collection.json -r html --reporter-html-export ./reports/workflow.html

Write-Host "📋 3. Tramites Base API..." -ForegroundColor Cyan
newman run Tramites_Base_API.postman_collection.json -r html --reporter-html-export ./reports/tramites.html

Write-Host "✅ Todas las colecciones ejecutadas. Ver reportes en ./reports/" -ForegroundColor Green
```

---

## 🐳 Docker

### Ejecutar Newman en Docker
```bash
docker run -t -v $(pwd):/etc/newman postman/newman:alpine \
    run PPSH_Complete_API.postman_collection.json
```

### Con reporte HTML
```bash
docker run -t -v $(pwd):/etc/newman postman/newman:alpine \
    run PPSH_Complete_API.postman_collection.json \
    -r html --reporter-html-export reports/report.html
```

---

## 🔧 GitHub Actions

### Workflow completo
```yaml
name: API Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Newman
        run: |
          npm install -g newman
          npm install -g newman-reporter-htmlextra
      
      - name: Create reports directory
        run: mkdir -p reports
      
      - name: Run PPSH Tests
        run: newman run backend/PPSH_Complete_API.postman_collection.json -r htmlextra --reporter-htmlextra-export reports/ppsh.html
      
      - name: Run Workflow Tests
        run: newman run backend/Workflow_API_Tests.postman_collection.json -r htmlextra --reporter-htmlextra-export reports/workflow.html
      
      - name: Run Tramites Tests
        run: newman run backend/Tramites_Base_API.postman_collection.json -r htmlextra --reporter-htmlextra-export reports/tramites.html
      
      - name: Upload test reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-reports
          path: reports/
```

---

## 📊 CI/CD Ejemplos

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    
    stages {
        stage('Install Newman') {
            steps {
                sh 'npm install -g newman'
            }
        }
        
        stage('Run API Tests') {
            parallel {
                stage('PPSH Tests') {
                    steps {
                        sh 'newman run backend/PPSH_Complete_API.postman_collection.json -r junit --reporter-junit-export results/ppsh-junit.xml'
                    }
                }
                
                stage('Workflow Tests') {
                    steps {
                        sh 'newman run backend/Workflow_API_Tests.postman_collection.json -r junit --reporter-junit-export results/workflow-junit.xml'
                    }
                }
                
                stage('Tramites Tests') {
                    steps {
                        sh 'newman run backend/Tramites_Base_API.postman_collection.json -r junit --reporter-junit-export results/tramites-junit.xml'
                    }
                }
            }
        }
        
        stage('Publish Results') {
            steps {
                junit 'results/*.xml'
            }
        }
    }
}
```

### GitLab CI
```yaml
stages:
  - test

api_tests:
  stage: test
  image: postman/newman:alpine
  script:
    - newman run PPSH_Complete_API.postman_collection.json -r junit --reporter-junit-export ppsh-results.xml
    - newman run Workflow_API_Tests.postman_collection.json -r junit --reporter-junit-export workflow-results.xml
    - newman run Tramites_Base_API.postman_collection.json -r junit --reporter-junit-export tramites-results.xml
  artifacts:
    when: always
    reports:
      junit:
        - ppsh-results.xml
        - workflow-results.xml
        - tramites-results.xml
```

---

## 🎯 Testing por Ambiente

### Local Development
```bash
newman run PPSH_Complete_API.postman_collection.json \
    --global-var "base_url=http://localhost:8000" \
    --delay-request 100
```

### Development Server
```bash
newman run PPSH_Complete_API.postman_collection.json \
    --global-var "base_url=http://dev.tramites.pa:8000" \
    --delay-request 200
```

### Staging
```bash
newman run PPSH_Complete_API.postman_collection.json \
    -e staging.postman_environment.json \
    --delay-request 500 \
    -r htmlextra
```

### Production (smoke tests)
```bash
newman run PPSH_Complete_API.postman_collection.json \
    -e production.postman_environment.json \
    --folder "Health Check" \
    --delay-request 1000
```

---

## 📈 Monitoreo Continuo

### Ejecutar cada hora (cron)
```bash
# Agregar a crontab
0 * * * * cd /path/to/collections && newman run PPSH_Complete_API.postman_collection.json -r htmlextra --reporter-htmlextra-export /var/www/reports/latest.html
```

### Script de monitoreo con alertas
```bash
#!/bin/bash
COLLECTION="PPSH_Complete_API.postman_collection.json"
REPORT_DIR="./reports/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

# Ejecutar tests
newman run "$COLLECTION" -r htmlextra,json \
    --reporter-htmlextra-export "$REPORT_DIR/report.html" \
    --reporter-json-export "$REPORT_DIR/results.json"

# Verificar resultado
if [ $? -eq 0 ]; then
    echo "✅ Tests passed successfully"
else
    echo "❌ Tests failed - sending alert..."
    # Enviar alerta (email, Slack, etc.)
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
        -H 'Content-Type: application/json' \
        -d '{"text":"⚠️ API Tests Failed! Check report at '"$REPORT_DIR"'/report.html"}'
fi
```

---

## 🔍 Debugging

### Modo verbose
```bash
newman run PPSH_Complete_API.postman_collection.json --verbose
```

### Ver detalles de requests/responses
```bash
newman run PPSH_Complete_API.postman_collection.json --reporter-cli-reporter-show-request-headers
```

### Exportar colección con valores de variables
```bash
newman run PPSH_Complete_API.postman_collection.json --export-globals globals.json --export-environment env.json
```

---

## 📦 Package.json Scripts

```json
{
  "name": "tramites-api-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "newman run PPSH_Complete_API.postman_collection.json",
    "test:all": "npm run test:ppsh && npm run test:workflow && npm run test:tramites",
    "test:ppsh": "newman run PPSH_Complete_API.postman_collection.json -r htmlextra --reporter-htmlextra-export reports/ppsh.html",
    "test:workflow": "newman run Workflow_API_Tests.postman_collection.json -r htmlextra --reporter-htmlextra-export reports/workflow.html",
    "test:tramites": "newman run Tramites_Base_API.postman_collection.json -r htmlextra --reporter-htmlextra-export reports/tramites.html",
    "test:dev": "newman run PPSH_Complete_API.postman_collection.json --global-var 'base_url=http://localhost:8000'",
    "test:prod": "newman run PPSH_Complete_API.postman_collection.json -e production.postman_environment.json",
    "test:smoke": "newman run PPSH_Complete_API.postman_collection.json --folder 'Health Check'",
    "report:open": "open reports/ppsh.html"
  },
  "devDependencies": {
    "newman": "^6.0.0",
    "newman-reporter-htmlextra": "^1.23.0"
  }
}
```

### Uso:
```bash
npm run test:all          # Ejecutar todas las colecciones
npm run test:ppsh         # Solo PPSH
npm run test:dev          # Con URL local
npm run test:smoke        # Solo health checks
```

---

## 🎨 Makefile

```makefile
.PHONY: test test-all test-ppsh test-workflow test-tramites clean reports

# Directorios
REPORTS_DIR := reports
COLLECTIONS_DIR := backend

# Colecciones
PPSH_COLLECTION := $(COLLECTIONS_DIR)/PPSH_Complete_API.postman_collection.json
WORKFLOW_COLLECTION := $(COLLECTIONS_DIR)/Workflow_API_Tests.postman_collection.json
TRAMITES_COLLECTION := $(COLLECTIONS_DIR)/Tramites_Base_API.postman_collection.json

# Comandos
test-all: test-ppsh test-workflow test-tramites
	@echo "✅ Todas las colecciones ejecutadas"

test-ppsh: $(REPORTS_DIR)
	@echo "📋 Ejecutando PPSH tests..."
	newman run $(PPSH_COLLECTION) -r htmlextra --reporter-htmlextra-export $(REPORTS_DIR)/ppsh.html

test-workflow: $(REPORTS_DIR)
	@echo "📋 Ejecutando Workflow tests..."
	newman run $(WORKFLOW_COLLECTION) -r htmlextra --reporter-htmlextra-export $(REPORTS_DIR)/workflow.html

test-tramites: $(REPORTS_DIR)
	@echo "📋 Ejecutando Tramites tests..."
	newman run $(TRAMITES_COLLECTION) -r htmlextra --reporter-htmlextra-export $(REPORTS_DIR)/tramites.html

$(REPORTS_DIR):
	mkdir -p $(REPORTS_DIR)

clean:
	rm -rf $(REPORTS_DIR)
	@echo "🗑️  Reports directory cleaned"

reports: test-all
	@echo "📊 Opening reports..."
	open $(REPORTS_DIR)/ppsh.html
	open $(REPORTS_DIR)/workflow.html
	open $(REPORTS_DIR)/tramites.html
```

### Uso:
```bash
make test-all      # Ejecutar todo
make test-ppsh     # Solo PPSH
make clean         # Limpiar reportes
make reports       # Ejecutar y abrir reportes
```

---

## 💡 Tips y Trucos

### Ejecutar solo requests específicos
```bash
# Por nombre de folder
newman run PPSH_Complete_API.postman_collection.json --folder "Catálogos"

# Múltiples folders
newman run PPSH_Complete_API.postman_collection.json --folder "Catálogos" --folder "Solicitudes"
```

### Exportar colección modificada
```bash
newman run PPSH_Complete_API.postman_collection.json --export-collection updated-collection.json
```

### Tiempo máximo de ejecución
```bash
newman run PPSH_Complete_API.postman_collection.json --timeout 60000  # 60 segundos
```

### Ignorar redirects
```bash
newman run PPSH_Complete_API.postman_collection.json --no-follow-redirect
```

### Usar proxy
```bash
newman run PPSH_Complete_API.postman_collection.json --proxy http://proxy.example.com:8080
```

---

## 📚 Referencias

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Newman Reporter HTMLExtra](https://www.npmjs.com/package/newman-reporter-htmlextra)
- [Postman Learning Center](https://learning.postman.com/)

---

**Última actualización:** 2025-10-21  
**Mantenido por:** Sistema de Trámites MVP Panamá
