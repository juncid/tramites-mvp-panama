# PLAN DE CIERRE FASE 3: Entrega del Prototipo Funcional Integrado

**Fecha:** 16 de Diciembre de 2025  
**Última Actualización:** Basado en Informe Nº9  
**Rol:** Auditor Técnico y Arquitecto de Software  
**Objetivo:** Alinear el estado actual del repositorio con los requisitos contractuales del SNM y la solicitud de entrega inmediata del cliente.

---

## 0. Estado de Testing y Calidad (Informe Nº9)

| Métrica | Estado Anterior | Estado Actual | Mejora |
| :--- | :--- | :--- | :--- |
| **Tests Backend** | 118 tests (60% passing) | 704 tests (100% passing) | +586 tests |
| **Cobertura Backend** | No medida | 85% | +85% |
| **Tests Frontend** | 191 tests | 191 tests | = |
| **Cobertura Frontend** | 89% | 89% | = |
| **Archivos de Test** | ~10 | 22 | +12 archivos |

---

## 1. Estado de los Entregables Solicitados por el Cliente

| Entregable | Estado | Ubicación / Evidencia | Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Manuales Técnicos** | ✅ **COMPLETADO** | `docs/Manuales/` (381+ páginas) | Ninguna. Documentación completa. |
| **Código en GIT** | ✅ **COMPLETADO** | Repositorio actual (`backend/`, `frontend/`, `docs/`) | Ninguna. Estructura correcta. |
| **Testing Backend** | ✅ **COMPLETADO** | 704 tests, 85% cobertura | Ninguna. Meta alcanzada. |
| **Testing Frontend** | ✅ **COMPLETADO** | 191 tests, 89% cobertura | Ninguna. Meta alcanzada. |
| **Instalación AWS** | ✅ **OPERATIVO** | IP 23.23.20.56 - 6 contenedores healthy | Configurar HTTPS para producción. |

---

## 2. Brechas Técnicas Pendientes (Próximos Sprints)

El sistema se encuentra **100% operativo** para el MVP. Las siguientes son mejoras recomendadas para producción completa.

### A. Trámites Adicionales (Fase 4 - Opcional)
*   **Estado:** PPSH completamente implementado y testeado.
*   **Pendiente (fuera del MVP):**
    1.  Visa País Amigo
    2.  Regularización Migratoria
    3.  Visa Trabajadores Domésticos
*   **Nota:** La arquitectura de workflows permite agregar estos trámites mediante configuración JSON sin cambios de código.

### B. Seguridad - Arquitectura (Prioridad Alta)

#### B.1 Estado de Autenticación
*   **Estado Actual:** Autenticación simulada para MVP/Pruebas (según especificación del cliente).
*   **Decisión:** NO se implementará JWT real para esta fase de pruebas.

#### B.2 Medidas de Seguridad Implementadas ✅
| Medida | Estado | Evidencia |
| :--- | :--- | :--- |
| Puerto 8000 (API) bloqueado externamente | ✅ | Firewall AWS Lightsail |
| Acceso solo vía proxy Nginx | ✅ | `nginx.conf` |
| Headers de seguridad HTTP | ✅ | X-Frame-Options, X-Content-Type-Options, etc. |
| Base de datos aislada en red Docker | ✅ | `docker-compose.yml` |
| Logs de auditoría en operaciones | ✅ | `WorkflowCambiosService` |

#### B.3 Auditoría de Soft Delete - CORREGIDO ✅

| Módulo | Endpoint DELETE | Implementación | Estado |
| :--- | :--- | :--- | :--- |
| **Workflows** | `/workflows/{id}` | ✅ Soft Delete (`activo=False`) | ✅ OK |
| **Etapas** | `/etapas/{id}` | ✅ Soft Delete (via servicio) | ✅ OK |
| **Preguntas** | `/preguntas/{id}` | ✅ Soft Delete (via servicio) | ✅ OK |
| **Conexiones** | `/conexiones/{id}` | ✅ Soft Delete (`activo=False`) | ✅ CORREGIDO |
| **SIM_FT Trámites** | `/tramites-tipos/{cod}` | ✅ Soft Delete (`IND_ACTIVO='N'`) | ✅ OK |
| **Vista Config** | `/vistas-config/{id}` | ✅ Soft Delete (via servicio) | ✅ OK |
| **OCR Reprocesar** | (interno) | ✅ Soft Delete (`estado_ocr='OBSOLETO'`) | ✅ CORREGIDO |
| **OCR Cleanup Task** | (tarea celery) | ✅ Soft Delete (`estado_ocr='ARCHIVADO'`) | ✅ CORREGIDO |
| **Preguntas (update etapa)** | (interno) | ✅ Soft Delete (`activo=False`) | ✅ CORREGIDO |

#### B.4 Auditoría de Acceso a BD desde Routers

| Router | Acceso Directo a BD | Estado |
| :--- | :--- | :--- |
| `routers_workflow.py` | ❌ Usa capa de servicios | ✅ OK |
| `routers_sim_ft.py` | ⚠️ `db.query()` directo en algunos endpoints | ⚠️ REVISAR |
| `routers_ppsh.py` | ⚠️ `db.query()` directo en algunos endpoints | ⚠️ REVISAR |
| `routers_ocr.py` | ⚠️ `db.query()` directo en la mayoría | ⚠️ REVISAR |
| `auth.py` | ⚠️ `db.query()` directo | ⚠️ REVISAR |

#### B.5 Verificaciones Pendientes (Checklist)

**Soft Delete:**
- [x] `workflows` - Usa `activo=False`
- [x] `etapas` - Usa `activo=False`
- [x] `preguntas` - Usa `activo=False`
- [ ] `conexiones` - **PENDIENTE**: Cambiar `db.delete()` por soft delete
- [x] `tramites-tipos` - Usa `IND_ACTIVO='N'`
- [ ] `ocr reprocesar` - **PENDIENTE**: Guardar historial en vez de eliminar

**Soft Delete:**
- [x] `conexiones` - Usa `activo=False` ✅ CORREGIDO
- [x] `ocr reprocesar` - Usa `estado_ocr='OBSOLETO'` ✅ CORREGIDO
- [x] `ocr cleanup task` - Usa `estado_ocr='ARCHIVADO'` ✅ CORREGIDO
- [x] `preguntas (update etapa)` - Usa `activo=False` ✅ CORREGIDO

**Arquitectura de Servicios:**
- [x] `routers_workflow.py` - Usa `WorkflowService`, `EtapaService`, etc.
- [ ] `routers_sim_ft.py` - **PENDIENTE**: Crear `SimFtService`
- [ ] `routers_ppsh.py` - **PENDIENTE**: Mover queries a `PPSHService`
- [ ] `routers_ocr.py` - **PENDIENTE**: Crear `OCRService`

### C. Infraestructura de Producción (Prioridad Media)
*   **Estado Actual:** HTTP en puerto 80, operativo.
*   **Headers de Seguridad:** ✅ Implementados (X-Frame-Options, X-Content-Type-Options, etc.)
*   **Recomendación:** Configurar HTTPS con Let's Encrypt.

---

## 3. Plan de Acción Post-Entrega (Enero 2026)

### ~~Paso 1: Corregir DELETE Físicos → Soft Delete~~ ✅ COMPLETADO
1.  ~~**`ConexionService.eliminar_conexion()`**: Cambiar `db.delete()` por `activo=False`.~~ ✅
2.  ~~**`routers_ocr.py` reprocesar**: Mantener historial OCR anterior.~~ ✅
3.  ~~**`ocr_tasks.py` cleanup**: Usar `ARCHIVADO` en vez de eliminar.~~ ✅
4.  ~~**Actualizar preguntas en etapa**: Usar soft delete.~~ ✅

### Paso 1: Refactorizar Acceso a BD (Backend Dev) - 8h
1.  **`routers_sim_ft.py`**: Crear `SimFtService` y mover queries.
2.  **`routers_ppsh.py`**: Mover queries dispersos a `PPSHService` existente.
3.  **`routers_ocr.py`**: Crear `OCRService` para centralizar lógica.
4.  Patrón objetivo: `Router → Service → DB` (no `Router → DB` directo).

### Paso 2: Configurar HTTPS (DevOps) - 2h
1.  Obtener certificado SSL con Let's Encrypt.
2.  Actualizar `nginx.conf` con configuración SSL.
3.  Verificar redirección HTTP → HTTPS.

### Paso 4: Aumentar Cobertura de Tests (Backend Dev) - 10h
1.  Aumentar cobertura `routers_workflow.py` de 48% a 80%.
2.  Aumentar cobertura `services_workflow.py` de 62% a 80%.
3.  Objetivo: Cobertura global ≥90%.

---

## 4. Checklist de Entrega MVP (Fase 3) - COMPLETADO ✅

- [x] Backend API 100% operativo (FastAPI + SQL Server 2022)
- [x] Frontend UI 100% operativo (React 18 + Material UI)
- [x] Testing Backend: 704 tests, 100% passing, 85% cobertura
- [x] Testing Frontend: 191 tests, 89% cobertura
- [x] Infraestructura AWS Lightsail operativa (6 contenedores)
- [x] Documentación técnica completa (381+ páginas)
- [x] Colecciones Postman para APIs
- [x] Módulo PPSH completamente funcional

---

## 5. Checklist Post-Entrega (Fase 4 - Enero 2026)

**Seguridad - Soft Delete:** ✅ COMPLETADO
- [x] `ConexionService.eliminar_conexion()` usa soft delete.
- [x] OCR reprocesar mantiene historial (estado `OBSOLETO`).
- [x] OCR cleanup task usa estado `ARCHIVADO`.
- [x] Update preguntas en etapa usa soft delete.

**Seguridad - Arquitectura de Servicios:**
- [ ] `routers_sim_ft.py` usa `SimFtService`.
- [ ] `routers_ppsh.py` usa `PPSHService` para todos los queries.
- [ ] `routers_ocr.py` usa `OCRService`.

**Infraestructura:**
- [ ] HTTPS habilitado en entorno AWS.
- [ ] Backups automáticos configurados.

**Calidad:**
- [ ] Cobertura de tests ≥90%.

**Funcionalidad (Opcional):**
- [ ] Trámites adicionales: Visa País Amigo, Regularización, Trabajadores Domésticos.

---

## 6. Referencias

| Documento | Ubicación |
| :--- | :--- |
| Informe Nº7 - Backend y APIs | `docs/context/Informe Nº7 - Septimo entregable SNM-.md` |
| Informe Nº8 - Frontend e Integraciones | `docs/context/Informe Nº8 - Octavo entregable SNM.md` |
| Informe Nº9 - Cierre Fase 3 | `docs/context/Informe_N9_Noveno_Entregable_SNM.md` |
| Manuales Técnicos | `docs/Manuales/` |
| Diccionario de Datos | `docs/BBDD/DICCIONARIO_DATOS_COMPLETO.md` |
