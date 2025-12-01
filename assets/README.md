# Assets del Proyecto

Esta carpeta contiene las imágenes y recursos utilizados en la documentación.

## Imágenes Requeridas

| Archivo | Descripción | URL para Captura | Estado |
|---------|-------------|------------------|--------|
| `clio-logo.png` | Logo de Clio Consulting | N/A | Pendiente |
| `frontend-architecture.jpg` | Diagrama de arquitectura frontend | N/A | Pendiente |
| `frontend-mainlayout-dashboard.png` | Screenshot del MainLayout con Dashboard | `http://localhost:3000` | **CAPTURAR** |
| `frontend-workflow-editor-vistas-dinamicas.png` | Editor Visual de Workflows con vistas dinámicas | `http://localhost:3000/flujos/5005/editar-figma` → Tab "Flujo" | **CAPTURAR** |
| `ppsh-inicio-tramite.png` | Landing page de inicio de trámite PPSH | `http://localhost:3000/inicio` | **CAPTURAR** |
| `ppsh-acceso-publico.png` | Portal de acceso público para ciudadanos | `http://localhost:3000/acceso-publico` | **CAPTURAR** |
| `ppsh-lista-solicitudes.png` | Lista administrativa de solicitudes | `http://localhost:3000/solicitudes` | **CAPTURAR** |
| `ppsh-etapas-solicitud.png` | Vista de etapas de una solicitud | `http://localhost:3000/solicitudes/6049/etapas` | **CAPTURAR** |
| `ppsh-carga-requisitos.png` | Formulario de carga de documentos | `http://localhost:3000/solicitudes/6049/carga-poder` | **CAPTURAR** |

## Instrucciones de Captura

### 1. MainLayout Dashboard
- **URL:** `http://localhost:3000`
- **Contenido:** Dashboard principal con métricas KPI, actividad reciente
- **Elementos visibles:** Header con logo, navegación azul, tarjetas de estadísticas

### 2. Editor Visual de Workflows
- **URL:** `http://localhost:3000/flujos/5005/editar-figma`
- **Acción:** Hacer clic en la pestaña **"Flujo"**
- **Contenido:** Editor drag-and-drop con nodos de etapas del workflow PPSH
- **Elementos visibles:**
  - Canvas ReactFlow con nodos conectados
  - Panel de configuración de etapa (derecha)
  - JSON Debug del workflow (inferior)
  - Toolbar con zoom, guardar, organizar

### 3. Módulo PPSH - 5 Vistas

| Vista | URL | Descripción |
|-------|-----|-------------|
| Inicio Trámite | `/inicio` | Landing con cards "Iniciar Proceso" y "Continuar Proceso" |
| Acceso Público | `/acceso-publico` | Formulario con tabs código/link, inputs código y pasaporte |
| Lista Solicitudes | `/solicitudes` | Tabla con columnas: Solicitud, Solicitante, RUEX, Fecha, Estado, Acciones |
| Etapas Solicitud | `/solicitudes/6049/etapas` | Dos secciones: Etapas activas (En proceso) e Historial (Completado) |
| Carga Requisitos | `/solicitudes/6049/carga-poder` | Header azul + área de upload de documentos |

## Cómo Iniciar el Frontend

```bash
cd /home/junci/Source/tramites-mvp-panama/frontend
npm run dev
```

El servidor estará disponible en `http://localhost:3000`
