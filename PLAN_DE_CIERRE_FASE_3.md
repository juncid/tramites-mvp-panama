# PLAN DE CIERRE FASE 3: Entrega del Prototipo Funcional Integrado

**Fecha:** 13 de Diciembre de 2025
**Rol:** Auditor Técnico y Arquitecto de Software
**Objetivo:** Alinear el estado actual del repositorio con los requisitos contractuales del SNM y la solicitud de entrega inmediata del cliente.

---

## 1. Estado de los Entregables Solicitados por el Cliente

| Entregable | Estado | Ubicación / Evidencia | Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Manuales Técnicos** | ✅ **EXISTENTE** | `docs/Manuales/` (Instalación, Operaciones, Usuario) | Revisión final para asegurar que coincidan con la versión AWS. |
| **Código en GIT** | ✅ **EXISTENTE** | Repositorio actual (`backend/`, `frontend/`, `docs/`) | Ninguna. Estructura correcta. |
| **Instalación AWS** | ⚠️ **EN PROCESO** | `deploy/lightsail/` contiene scripts de despliegue. | Ejecutar prueba de despliegue "Clean Install" para validar scripts. |

---

## 2. Brechas Técnicas Críticas (Bloqueantes para "100% Operativo")

Aunque la infraestructura base existe, el sistema funcional tiene vacíos que impiden el uso real de los 4 trámites contratados.

### A. Trámites Faltantes (Auditoría de Flujos)
*   **Hallazgo:** Solo "Permiso de Protección Temporal (PPSH)" está implementado. Faltan:
    1.  Visa País Amigo
    2.  Regularización Migratoria
    3.  Visa Trabajadores Domésticos
*   **Impacto:** Incumplimiento del alcance funcional de 4 trámites.
*   **Solución:** Se ha generado la plantilla `backend/app/seed_data/workflows_faltantes.json`. El equipo funcional debe llenarla con los pasos y requisitos.

### B. Seguridad (Hardening)
*   **Hallazgo:** La autenticación actual es "Mock" (Simulada). `routers_ppsh.py` usa `get_current_user` con usuario hardcoded.
*   **Impacto:** Riesgo crítico de seguridad. No apto para producción ni AWS público.
*   **Solución:** Implementar Middleware JWT real conectado a tabla `SEG_TB_USUARIOS`.

### C. Infraestructura de Producción
*   **Hallazgo:** `nginx.conf` actual es de desarrollo (HTTP puerto 80).
*   **Impacto:** Inseguro para datos sensibles de migración.
*   **Solución:** Se ha creado `frontend/nginx.prod.conf` con soporte SSL y headers de seguridad.

---

## 3. Plan de Acción Inmediato (Siguientes 48 Horas)

### Paso 1: Configuración de Trámites (Analista Funcional)
1.  Abrir `backend/app/seed_data/workflows_faltantes.json`.
2.  Completar los arrays `flujo_pasos` y `requisitos` para los 3 trámites pendientes.
3.  Ejecutar script de carga (a crear): `python backend/scripts/load_workflows.py`.

### Paso 2: Hardening de Seguridad (Desarrollador Backend)
1.  Crear modelo `Usuario` en `backend/app/models/auth.py`.
2.  Reemplazar `get_current_user` mock por validación JWT real.
3.  Generar hash de contraseñas para usuarios iniciales.

### Paso 3: Despliegue AWS (DevOps)
1.  Hacer commit y push de los cambios (`nginx.prod.conf`, `Dockerfile.prod`, etc.) al repositorio remoto.
2.  Ejecutar el script de despliegue vía Git:
    ```bash
    ./deploy/lightsail/deploy_via_git.sh <IP_LIGHTSAIL>
    ```
3.  El script se conectará al servidor, descargará los cambios (`git pull`) y reconstruirá los contenedores.

---

## 4. Checklist de Entrega Final

- [ ] JSON de 3 trámites adicionales cargado en BD.
- [ ] Login validando contra base de datos real.
- [ ] HTTPS habilitado en entorno AWS.
- [ ] Manuales actualizados con capturas del sistema final.
