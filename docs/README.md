# 📚 Documentación del Sistema de Trámites MVP Panamá

> **Sistema de Gestión de Trámites Migratorios**  
> FastAPI (Backend) + React (Frontend) + SQL Server

---

## 🗂️ Estructura de Documentación

```
docs/
├── README.md              ← Estás aquí
│
├── 📚 MANUALES Y GUÍAS
│   ├── Manuales/          # Manuales de usuario y técnico
│   └── Development/       # Guías de desarrollo
│
├── 🏗️ ARQUITECTURA
│   ├── Architecture/      # Arquitectura del sistema
│   ├── BBDD/              # Base de datos y modelos
│   └── Migrations/        # Migraciones de BD
│
├── 🔧 MÓDULOS
│   ├── OCR/               # Reconocimiento óptico
│   ├── Workflow/          # Sistema de workflows
│   ├── Vistas/            # Vistas dinámicas
│   ├── PPSH/              # Módulo PPSH
│   └── Seguridad/         # Autenticación y permisos
│
├── 🧪 CALIDAD
│   ├── Testing/           # Pruebas y QA
│   └── Monitoring/        # Monitoreo
│
├── 📦 DESPLIEGUE
│   └── Deployment/        # Guías de despliegue
│
├── 📊 ENTREGABLES
│   ├── Entregables/       # Verificación de productos
│   ├── Reports/           # Reportes
│   └── General/           # Resúmenes generales
│
└── 📔 HISTÓRICO
    ├── bitacora/          # Notas de sesión
    └── frontend/          # Docs del frontend
```

---

## 🚀 Inicio Rápido

### Para Desarrolladores

| Documento | Descripción |
|-----------|-------------|
| [Development/DEVELOPMENT.md](Development/DEVELOPMENT.md) | Configuración del entorno de desarrollo |
| [Development/DEVELOPMENT_LOCAL.md](Development/DEVELOPMENT_LOCAL.md) | Ejecución local paso a paso |
| [Architecture/ARCHITECTURE.md](Architecture/ARCHITECTURE.md) | Visión general de la arquitectura |

### Para QA / Testing

| Documento | Descripción |
|-----------|-------------|
| [Testing/README.md](Testing/README.md) | Índice de pruebas |
| [Testing/API_TESTING_README.md](Testing/API_TESTING_README.md) | Pruebas de API |
| [Testing/LOAD_TEST_DATA_GUIDE.md](Testing/LOAD_TEST_DATA_GUIDE.md) | Datos de prueba |

### Para Usuarios Finales

| Documento | Descripción |
|-----------|-------------|
| [Manuales/MANUAL_DE_USUARIO.md](Manuales/MANUAL_DE_USUARIO.md) | Guía completa de uso |
| [Manuales/GUIA_CAPACITACION.md](Manuales/GUIA_CAPACITACION.md) | Material de capacitación |

### Para Administradores

| Documento | Descripción |
|-----------|-------------|
| [Deployment/DEPLOYMENT.md](Deployment/DEPLOYMENT.md) | Guías de despliegue |
| [Seguridad/USUARIOS_PRUEBA.md](Seguridad/USUARIOS_PRUEBA.md) | Credenciales de prueba |

---

## 📖 Módulos del Sistema

### 🔄 Sistema de Workflows

Sistema de flujos de trabajo dinámicos con editor visual drag & drop.

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [Workflow/SISTEMA_WORKFLOWS_IMPLEMENTADO.md](Workflow/SISTEMA_WORKFLOWS_IMPLEMENTADO.md) | 📋 Referencia | Implementación completa del sistema |
| [Workflow/WORKFLOW_DINAMICO_DESIGN.md](Workflow/WORKFLOW_DINAMICO_DESIGN.md) | 📐 Diseño | Especificaciones de diseño |
| [Workflow/WORKFLOW_INTEGRATION_GUIDE.md](Workflow/WORKFLOW_INTEGRATION_GUIDE.md) | 📖 Guía | Cómo integrar workflows |
| [Workflow/NODO_TERMINO_IMPLEMENTADO.md](Workflow/NODO_TERMINO_IMPLEMENTADO.md) | ✅ Implementación | Nodo de término de proceso |
| [Workflow/REVISION_FIGMA_WORKFLOW.md](Workflow/REVISION_FIGMA_WORKFLOW.md) | 🎨 UI | Comparativa con diseño Figma |
| [Workflow/TODO_INTEGRACION_WORKFLOW_SOLICITUDES.md](Workflow/TODO_INTEGRACION_WORKFLOW_SOLICITUDES.md) | 📌 Pendiente | Tareas pendientes |

### 👁️ Vistas Dinámicas por Permisos

Sistema de renderizado de formularios según perfil de usuario y etapa.

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [Vistas/GUIA_IMPLEMENTACION_VISTAS.md](Vistas/GUIA_IMPLEMENTACION_VISTAS.md) | 📖 Guía | Cómo crear nuevas vistas |
| [Vistas/SISTEMA_VISTAS_DINAMICAS_IMPLEMENTADO.md](Vistas/SISTEMA_VISTAS_DINAMICAS_IMPLEMENTADO.md) | 📋 Referencia | Sistema completo implementado |
| [Vistas/IMPLEMENTACION_VISTAS_DINAMICAS.md](Vistas/IMPLEMENTACION_VISTAS_DINAMICAS.md) | ✅ Implementación | Detalles técnicos |
| [Vistas/PLAN_VISTAS_POR_PERFIL.md](Vistas/PLAN_VISTAS_POR_PERFIL.md) | 📐 Plan | Planificación por perfil |
| [Vistas/PLAN_INTEGRACION_VISTAS_DINAMICAS.md](Vistas/PLAN_INTEGRACION_VISTAS_DINAMICAS.md) | 📐 Plan | Plan de integración |
| [Vistas/PLAN_VERIFICACION_VISTAS_RESPUESTAS.md](Vistas/PLAN_VERIFICACION_VISTAS_RESPUESTAS.md) | ✅ Verificación | Plan de verificación |

### 🔍 Sistema OCR

Reconocimiento óptico de caracteres para documentos de identidad.

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [OCR/SISTEMA_UPLOAD_OCR_IMPLEMENTADO.md](OCR/SISTEMA_UPLOAD_OCR_IMPLEMENTADO.md) | 📋 Referencia | Sistema completo de upload + OCR |
| [OCR/OCR_ENDPOINT_IMPLEMENTATION.md](OCR/OCR_ENDPOINT_IMPLEMENTATION.md) | ✅ Implementación | Endpoint de documentos con OCR |
| [OCR/PRUEBA_OCR_E2E.md](OCR/PRUEBA_OCR_E2E.md) | 🧪 Testing | Guía de prueba end-to-end |
| [OCR/SISTEMA_OCR_LISTO.md](OCR/SISTEMA_OCR_LISTO.md) | ✅ Estado | Estado actual del sistema |
| [OCR/OCR_SISTEMA_FUNCIONANDO.md](OCR/OCR_SISTEMA_FUNCIONANDO.md) | 🔧 Troubleshooting | Correcciones aplicadas |

### 🔐 Seguridad y Acceso

Autenticación, autorización y permisos.

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [Seguridad/USUARIOS_PRUEBA.md](Seguridad/USUARIOS_PRUEBA.md) | 🔑 Credenciales | Usuarios de prueba |
| [Seguridad/IMPLEMENTACION_ACCESO_PUBLICO.md](Seguridad/IMPLEMENTACION_ACCESO_PUBLICO.md) | ✅ Implementación | Acceso público sin contraseña |
| [Seguridad/IMPLEMENTACION_CODIGO_ACCESO.md](Seguridad/IMPLEMENTACION_CODIGO_ACCESO.md) | ✅ Implementación | Código de acceso corto |
| [Seguridad/IMPLEMENTACION_PERMISOS_ESTADO.md](Seguridad/IMPLEMENTACION_PERMISOS_ESTADO.md) | ✅ Implementación | Permisos por estado PPSH |
| [Seguridad/SOLUCION_PERMISOS_ETAPA_4.md](Seguridad/SOLUCION_PERMISOS_ETAPA_4.md) | 🔧 Solución | Fix de permisos etapa 4 |

### 🧪 Testing y QA

Pruebas automatizadas y manuales.

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [Testing/README.md](Testing/README.md) | 📖 Índice | Índice de testing |
| [Testing/API_TESTING_README.md](Testing/API_TESTING_README.md) | 📖 Guía | Testing de API |
| [Testing/E2E_TEST_VISTAS_DINAMICAS_SUCCESS.md](Testing/E2E_TEST_VISTAS_DINAMICAS_SUCCESS.md) | ✅ Resultado | Test E2E exitoso |
| [Testing/PRUEBAS_FASE_1_VISTAS_DINAMICAS.md](Testing/PRUEBAS_FASE_1_VISTAS_DINAMICAS.md) | 🧪 Plan | Plan de pruebas Fase 1 |
| [Testing/TESTING_CONTINUACION_PERMISOS.md](Testing/TESTING_CONTINUACION_PERMISOS.md) | ✅ Resultado | Permisos validados |
| [Testing/LOAD_TEST_DATA_GUIDE.md](Testing/LOAD_TEST_DATA_GUIDE.md) | 📖 Guía | Cargar datos de prueba |

---

## 📝 Manuales

| Manual | Audiencia | Descripción |
|--------|-----------|-------------|
| [Manuales/MANUAL_DE_USUARIO.md](Manuales/MANUAL_DE_USUARIO.md) | 👤 Usuario final | Guía de uso del sistema |
| [Manuales/MANUAL_TECNICO.md](Manuales/MANUAL_TECNICO.md) | 🔧 Técnico | Documentación técnica Parte 1 |
| [Manuales/MANUAL_TECNICO_PARTE2.md](Manuales/MANUAL_TECNICO_PARTE2.md) | 🔧 Técnico | Documentación técnica Parte 2 |
| [Manuales/GUIA_CAPACITACION.md](Manuales/GUIA_CAPACITACION.md) | 📚 Capacitación | Material de capacitación |

---

## 📊 Entregables y Reportes

| Documento | Descripción |
|-----------|-------------|
| [Entregables/RESUMEN_EJECUTIVO_FINAL.md](Entregables/RESUMEN_EJECUTIVO_FINAL.md) | Resumen ejecutivo del proyecto |
| [Entregables/VERIFICACION_PRODUCTO_1.md](Entregables/VERIFICACION_PRODUCTO_1.md) | Verificación de entregable 1 |
| [Entregables/ANALISIS_CUMPLIMIENTO_PRODUCTO_1_FINAL.md](Entregables/ANALISIS_CUMPLIMIENTO_PRODUCTO_1_FINAL.md) | Análisis de cumplimiento |
| [BBDD/DICCIONARIO_DATOS_COMPLETO.md](BBDD/DICCIONARIO_DATOS_COMPLETO.md) | Diccionario de datos |

---

## 📔 Bitácora de Desarrollo

Registro histórico de cambios y sesiones de desarrollo.

| Fecha | Documento | Resumen |
|-------|-----------|---------|
| 2025-11-21 | [bitacora/SESION_21_NOV_2024.md](bitacora/SESION_21_NOV_2024.md) | Corrección de bugs y mejoras UI |
| 2025-11-17 | [bitacora/ALEMBIC_REPARADO.md](bitacora/ALEMBIC_REPARADO.md) | Reparación sistema migraciones |
| 2025-10-20 | [bitacora/MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md](bitacora/MEJORAS_LOGGING_Y_WORKFLOWS_2025-10-20.md) | Mejoras de logging |
| 2025-10-15 | [bitacora/2025-10-15_avances-y-analisis.md](bitacora/2025-10-15_avances-y-analisis.md) | Avances y análisis |
| 2025-10-13 | [bitacora/2025-10-13_optimizacion-frontend-docker.md](bitacora/2025-10-13_optimizacion-frontend-docker.md) | Optimización frontend Docker |

---

## 🔧 Convenciones

### Iconos de Tipo de Documento

| Icono | Significado |
|-------|-------------|
| 📖 | Guía / Tutorial |
| 📋 | Referencia |
| 📐 | Diseño / Plan |
| ✅ | Implementación completada |
| 🧪 | Testing / Pruebas |
| 🔧 | Troubleshooting / Fix |
| 🎨 | UI / Diseño visual |
| 📌 | Pendiente / TODO |
| 🔑 | Credenciales / Seguridad |

### Estructura de Documentos

Cada documento debe seguir esta estructura:

```markdown
# Título del Documento

**Fecha**: DD de Mes YYYY  
**Estado**: ✅ Completado | ⏳ En progreso | 📌 Pendiente  
**Módulo**: Workflow | OCR | Vistas | etc.

---

## 📋 Resumen Ejecutivo

Breve descripción de 2-3 líneas.

---

## 🎯 Objetivo

Qué problema resuelve o qué funcionalidad implementa.

---

## 📖 Contenido Principal

...

---

## ✅ Resultado / Estado Actual

...
```

---

## 🆘 Soporte

- **Issues**: Reportar en el repositorio GitHub
- **Documentación adicional**: Ver carpeta `informe-ejecutivo/`
- **Colecciones Postman**: Ver `postman-collections/`

---

**Última actualización:** Noviembre 2025
