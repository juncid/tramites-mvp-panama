# Guía de Integración - Sistema de Workflow Dinámico

Esta guía te ayudará a integrar el Sistema de Workflow Dinámico en el proyecto existente.

## 📋 Pre-requisitos

- ✅ Python 3.8+
- ✅ PostgreSQL 12+
- ✅ FastAPI
- ✅ SQLAlchemy
- ✅ Alembic

## 🚀 Pasos de Integración

### 1. Actualizar Archivos Principales

#### 1.1 Actualizar `backend/app/database.py`

Agregar importación de los modelos de workflow:

```python
# Añadir al final del archivo, después de las importaciones existentes
from app.models_workflow import (
    Workflow,
    WorkflowEtapa,
    WorkflowPregunta,
    WorkflowConexion,
    WorkflowInstancia,
    WorkflowRespuestaEtapa,
    WorkflowRespuesta,
    WorkflowInstanciaHistorial,
    WorkflowComentario
)
```

#### 1.2 Actualizar `backend/app/main.py`

Registrar el router de workflow:

```python
from app.routes_workflow import router as workflow_router

# Después de los routers existentes, agregar:
app.include_router(workflow_router)
```

Ejemplo completo:

```python
from fastapi import FastAPI
from app.routes import router
from app.routes_ppsh import router as ppsh_router
from app.routes_workflow import router as workflow_router

app = FastAPI(
    title="Sistema de Trámites Migratorios",
    description="API para gestión de trámites",
    version="1.0.0"
)

app.include_router(router)
app.include_router(ppsh_router)
app.include_router(workflow_router)  # ← NUEVO
```

### 2. Preparar Migración de Base de Datos

#### 2.1 Verificar Última Migración

```bash
cd backend
alembic history
```

Identifica el ID de la última migración (ej: `abc123def456`)

#### 2.2 Actualizar Migración de Workflow

Edita `backend/alembic/versions/workflow_dinamico_001.py`:

```python
# Actualizar la línea:
down_revision = 'abc123def456'  # ← Reemplaza con el ID de tu última migración
```

#### 2.3 Ejecutar Migración

```bash
# Verificar que la migración está lista
alembic current

# Ver la migración pendiente
alembic show workflow_001

# Aplicar migración
alembic upgrade head
```

#### 2.4 Verificar Tablas Creadas

```bash
# Conectarse a PostgreSQL
psql -U postgres -d tramites_db

# Listar tablas del workflow
\dt workflow*

# Deberías ver:
# workflow
# workflow_etapa
# workflow_pregunta
# workflow_conexion
# workflow_instancia
# workflow_respuesta_etapa
# workflow_respuesta
# workflow_instancia_historial
# workflow_comentario
```

### 3. Verificar la Instalación

#### 3.1 Iniciar Servidor

```bash
cd backend
uvicorn app.main:app --reload
```

#### 3.2 Verificar Documentación API

Abre en tu navegador:
```
http://localhost:8000/docs
```

Deberías ver una nueva sección: **"Workflow Dinámico"** con todos los endpoints.

#### 3.3 Probar Endpoint de Listado

```bash
curl http://localhost:8000/api/v1/workflow/workflows
```

Debería devolver una lista vacía `[]` (normal, aún no hay workflows).

### 4. Crear Primer Workflow de Prueba

#### 4.1 Usando cURL

```bash
curl -X POST "http://localhost:8000/api/v1/workflow/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PRUEBA_001",
    "nombre": "Workflow de Prueba",
    "descripcion": "Mi primer workflow dinámico",
    "estado": "BORRADOR",
    "categoria": "Pruebas",
    "perfiles_creadores": ["ADMIN"]
  }'
```

#### 4.2 Usando Python

```python
import requests

workflow = {
    "codigo": "PRUEBA_001",
    "nombre": "Workflow de Prueba",
    "descripcion": "Mi primer workflow dinámico",
    "estado": "BORRADOR",
    "categoria": "Pruebas",
    "perfiles_creadores": ["ADMIN"],
    "etapas": [
        {
            "codigo": "INICIO",
            "nombre": "Etapa Inicial",
            "tipo_etapa": "ETAPA",
            "orden": 1,
            "es_etapa_inicial": True,
            "perfiles_permitidos": ["CIUDADANO"],
            "titulo_formulario": "Formulario de Inicio",
            "preguntas": [
                {
                    "codigo": "NOMBRE",
                    "pregunta": "¿Cuál es su nombre completo?",
                    "tipo_pregunta": "RESPUESTA_TEXTO",
                    "orden": 1,
                    "es_obligatoria": True
                }
            ]
        }
    ]
}

response = requests.post(
    "http://localhost:8000/api/v1/workflow/workflows",
    json=workflow
)

print(response.json())
```

### 5. Tests Básicos

#### 5.1 Crear archivo de tests

`backend/tests/test_workflow.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_listar_workflows():
    response = client.get("/api/v1/workflow/workflows")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_crear_workflow():
    workflow_data = {
        "codigo": "TEST_WF",
        "nombre": "Test Workflow",
        "estado": "BORRADOR",
        "perfiles_creadores": ["ADMIN"]
    }
    response = client.post("/api/v1/workflow/workflows", json=workflow_data)
    assert response.status_code == 201
    assert response.json()["codigo"] == "TEST_WF"

def test_crear_workflow_duplicado():
    workflow_data = {
        "codigo": "TEST_WF",
        "nombre": "Test Workflow Duplicado",
        "estado": "BORRADOR",
        "perfiles_creadores": ["ADMIN"]
    }
    # Primera vez debería funcionar
    response1 = client.post("/api/v1/workflow/workflows", json=workflow_data)
    
    # Segunda vez debería fallar (código duplicado)
    response2 = client.post("/api/v1/workflow/workflows", json=workflow_data)
    assert response2.status_code == 400
```

#### 5.2 Ejecutar Tests

```bash
cd backend
pytest tests/test_workflow.py -v
```

### 6. Datos de Ejemplo (Opcional)

#### 6.1 Script para Crear Workflow PPSH

`backend/scripts/crear_workflow_ppsh.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/v1/workflow"

# Workflow PPSH completo
workflow_ppsh = {
    "codigo": "PPSH",
    "nombre": "Permiso de Protección de Seguridad Humanitaria",
    "descripcion": "Proceso completo para solicitud de PPSH",
    "estado": "ACTIVO",
    "categoria": "Migración",
    "color_hex": "#0066CC",
    "perfiles_creadores": ["ADMIN", "RECEPCIONISTA"],
    "etapas": [
        {
            "codigo": "INFORMAR_DOCS",
            "nombre": "Se informan los documentos necesarios para el trámite",
            "tipo_etapa": "ETAPA",
            "orden": 1,
            "es_etapa_inicial": True,
            "perfiles_permitidos": ["CIUDADANO", "ABOGADO"],
            "titulo_formulario": "Documentos Requeridos",
            "bajada_formulario": "A continuación se detallan los documentos necesarios",
            "preguntas": [
                {
                    "codigo": "TIPO_PREGUNTA_ARCHIVOS",
                    "pregunta": "Documentos antecedentes",
                    "tipo_pregunta": "CARGA_ARCHIVO",
                    "orden": 1,
                    "es_obligatoria": True,
                    "extensiones_permitidas": [".pdf", ".jpg", ".png"],
                    "tamano_maximo_mb": 10,
                    "texto_ayuda": "Suba los documentos en formato PDF o imagen"
                }
            ]
        },
        {
            "codigo": "VALIDAR_EDAD",
            "nombre": "Mayor de 18 años",
            "tipo_etapa": "COMPUERTA",
            "orden": 2,
            "perfiles_permitidos": ["SISTEMA"],
            "titulo_formulario": "Validación de Edad"
        },
        {
            "codigo": "REVISION_DOCS",
            "nombre": "Revisión de documentos OCR",
            "tipo_etapa": "ETAPA",
            "orden": 3,
            "perfiles_permitidos": ["RECEPCIONISTA", "SISTEMA"],
            "titulo_formulario": "Revisión OCR",
            "requiere_validacion": True,
            "preguntas": [
                {
                    "codigo": "RESULTADO_OCR",
                    "pregunta": "Resultado de validación OCR",
                    "tipo_pregunta": "REVISION_OCR",
                    "orden": 1,
                    "es_obligatoria": True
                }
            ]
        },
        {
            "codigo": "COMPLETADO",
            "nombre": "Requisitos completos",
            "tipo_etapa": "ETAPA",
            "orden": 4,
            "es_etapa_final": True,
            "perfiles_permitidos": ["RECEPCIONISTA", "SISTEMA"],
            "titulo_formulario": "Solicitud Completada"
        }
    ],
    "conexiones": [
        {
            "workflow_id": 1,  # Se actualizará automáticamente
            "etapa_origen_id": 1,
            "etapa_destino_id": 2,
            "nombre": "Siguiente",
            "es_predeterminada": True
        },
        {
            "workflow_id": 1,
            "etapa_origen_id": 2,
            "etapa_destino_id": 3,
            "nombre": "Mayor de 18",
            "es_predeterminada": True
        },
        {
            "workflow_id": 1,
            "etapa_origen_id": 3,
            "etapa_destino_id": 4,
            "nombre": "Documentos Aprobados",
            "es_predeterminada": True
        }
    ]
}

# Crear workflow
print("Creando workflow PPSH...")
response = requests.post(f"{BASE_URL}/workflows", json=workflow_ppsh)

if response.status_code == 201:
    workflow = response.json()
    print(f"✅ Workflow creado con ID: {workflow['id']}")
    print(f"   Código: {workflow['codigo']}")
    print(f"   Etapas: {len(workflow.get('etapas', []))}")
    print(f"   Conexiones: {len(workflow.get('conexiones', []))}")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.json())
```

#### 6.2 Ejecutar Script

```bash
cd backend
python scripts/crear_workflow_ppsh.py
```

### 7. Monitoreo y Logs

#### 7.1 Ver Logs de Migraciones

```bash
cd backend
alembic history -v
```

#### 7.2 Verificar Estado de Base de Datos

```python
# backend/scripts/verificar_workflow_db.py
from app.database import SessionLocal
from app.models_workflow import Workflow, WorkflowEtapa

def verificar_workflow():
    db = SessionLocal()
    try:
        workflows = db.query(Workflow).count()
        etapas = db.query(WorkflowEtapa).count()
        
        print(f"📊 Estado del Sistema de Workflow")
        print(f"   Workflows: {workflows}")
        print(f"   Etapas: {etapas}")
        
        if workflows > 0:
            print("\n📋 Workflows existentes:")
            for wf in db.query(Workflow).all():
                print(f"   - {wf.codigo}: {wf.nombre} ({wf.estado})")
    finally:
        db.close()

if __name__ == "__main__":
    verificar_workflow()
```

```bash
python scripts/verificar_workflow_db.py
```

## 🐛 Solución de Problemas

### Error: "Table 'workflow' doesn't exist"

**Solución:** Ejecutar la migración
```bash
cd backend
alembic upgrade head
```

### Error: "Module 'app.models_workflow' not found"

**Solución:** Verificar que el archivo existe
```bash
ls backend/app/models_workflow.py
```

### Error: "Router not registered"

**Solución:** Verificar que agregaste el router en `main.py`
```python
from app.routes_workflow import router as workflow_router
app.include_router(workflow_router)
```

### Error: "down_revision is None"

**Solución:** Actualizar el `down_revision` en la migración con el ID de la última migración:
```bash
alembic history
# Copiar el ID de la última migración
# Editar workflow_dinamico_001.py y actualizar down_revision
```

## ✅ Checklist de Integración

- [ ] Archivos copiados a sus ubicaciones
- [ ] `database.py` actualizado con imports
- [ ] `main.py` actualizado con router
- [ ] Migración actualizada con `down_revision` correcto
- [ ] Migración ejecutada exitosamente
- [ ] Servidor inicia sin errores
- [ ] Documentación API visible en `/docs`
- [ ] Endpoint de listado funciona
- [ ] Workflow de prueba creado exitosamente
- [ ] Tests básicos ejecutados

## 📚 Recursos Adicionales

- **Documentación Completa:** `docs/WORKFLOW_DINAMICO_DESIGN.md`
- **Resumen Ejecutivo:** `docs/WORKFLOW_RESUMEN_IMPLEMENTACION.md`
- **Modelos:** `backend/app/models_workflow.py`
- **Schemas:** `backend/app/schemas_workflow.py`
- **API Routes:** `backend/app/routes_workflow.py`

## 🎯 Próximos Pasos

1. ✅ Completar integración backend (esta guía)
2. 🔄 Desarrollar interfaz de administración (frontend)
3. 🔄 Implementar componentes de ejecución de workflows
4. 🔄 Agregar validaciones de negocio específicas
5. 🔄 Crear documentación para usuarios finales

---

**¿Necesitas ayuda?** Consulta la documentación completa o revisa los ejemplos de uso en los archivos de documentación.
