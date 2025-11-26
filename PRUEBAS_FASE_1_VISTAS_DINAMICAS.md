# Plan de Pruebas FASE 1 - Sistema de Vistas Dinámicas
**Sistema de Trámites Migratorios de Panamá**  
**Fecha:** 14 de Noviembre 2025  
**Branch:** implementar-vistas  
**Commits:** a2406e7, 3414c32, e40814b, 56f6ab1, cae1939

---

## 🎯 Objetivo
Validar la integración completa del sistema de vistas dinámicas en el editor de workflows, verificando:
- Sistema de tabs en panel de configuración
- Editor JSON con templates predefinidos
- Vista previa de formularios dinámicos
- Persistencia de configuraciones
- Indicadores visuales en nodos
- Endpoint optimizado de verificación

---

## ✅ Pre-requisitos

### Servicios levantados
```bash
cd /home/junci/Source/tramites-mvp-panama
docker-compose ps
```

**Verificar que estén corriendo:**
- ✅ tramites-frontend (puerto 3000)
- ✅ tramites-backend (puerto 8000)
- ✅ tramites-sqlserver (puerto 1433)
- ✅ tramites-redis (puerto 6379)

### URLs de acceso
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/api/docs
- **Dozzle (logs):** http://localhost:8080

---

## 📋 Casos de Prueba

### **PRUEBA 1: Acceso al Sistema**
**Objetivo:** Verificar que el usuario puede acceder al módulo de Workflows

**Pasos:**
1. Abrir navegador en http://localhost:3000
2. Iniciar sesión con credenciales:
   - **Usuario:** admin@test.com (o verificar en `USUARIOS_PRUEBA.md`)
   - **Password:** [contraseña del sistema]
3. Desde el menú principal, navegar a sección **"Workflows"** o **"Administración > Workflows"**

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Dashboard o lista de workflows visible
- ✅ Botón "Nuevo Workflow" o similar disponible

**Captura:** Pantalla de lista de workflows

---

### **PRUEBA 2: Crear Workflow de Prueba**
**Objetivo:** Crear un nuevo workflow para configurar vistas dinámicas

**Pasos:**
1. Hacer clic en botón **"Nuevo Workflow"** o **"Crear Workflow"**
2. Completar formulario:
   ```
   Nombre: Test Vistas Dinámicas
   Descripción: Prueba de integración de vistas dinámicas MVP
   Tipo de Trámite: PERMISO_TRABAJO (o cualquier tipo disponible)
   Estado: ACTIVO
   ```
3. Guardar el workflow
4. El sistema debe redirigir al **editor visual de workflow**

**Resultado esperado:**
- ✅ Workflow creado exitosamente
- ✅ Editor visual cargado con canvas de ReactFlow
- ✅ Nodo "INICIO" visible en el canvas
- ✅ Panel lateral derecho disponible (vacío o con info del workflow)

**Captura:** Editor visual con workflow nuevo

---

### **PRUEBA 3: Agregar Etapa al Workflow**
**Objetivo:** Crear una etapa donde configurar vista dinámica

**Pasos:**
1. En el editor visual, buscar botón **"+ Agregar Etapa"** o **"Nueva Etapa"**
2. Hacer clic para abrir formulario de creación de etapa
3. Completar datos:
   ```
   Tipo de Etapa: ETAPA
   Código: TEST_VISTA_01
   Nombre: Datos Personales
   Descripción: Etapa de prueba para vista dinámica
   ```
4. Guardar la etapa
5. La etapa debe aparecer como nuevo nodo en el canvas

**Resultado esperado:**
- ✅ Etapa creada exitosamente
- ✅ Nodo rectangular visible en canvas con texto "TEST_VISTA_01" o "Datos Personales"
- ✅ Nodo tiene color azul claro (tipo ETAPA)
- ✅ Al hacer clic en el nodo, se abre panel lateral derecho

**Captura:** Canvas con nodo INICIO y nueva etapa TEST_VISTA_01

---

### **PRUEBA 4: Verificar Sistema de Tabs**
**Objetivo:** Confirmar que el panel de configuración tiene 3 tabs

**Pasos:**
1. Hacer clic en el nodo de la etapa **"TEST_VISTA_01"**
2. Observar el panel lateral derecho que se abre
3. Verificar que hay **3 pestañas (Tabs)** en la parte superior:
   - **Tab 1:** "Configuración Básica"
   - **Tab 2:** "Preguntas Tradicionales"
   - **Tab 3:** "Vista Dinámica"
4. Hacer clic en cada tab para verificar navegación

**Resultado esperado:**
- ✅ Panel lateral se abre al hacer clic en el nodo
- ✅ 3 tabs visibles con Material-UI Tabs component
- ✅ **Tab 1 (Configuración Básica):** muestra campos tipo, código, nombre, perfiles
- ✅ **Tab 2 (Preguntas Tradicionales):** muestra lista de preguntas del sistema legacy
- ✅ **Tab 3 (Vista Dinámica):** muestra componente VistaConfiguratorPanel (nuevo)
- ✅ Navegación entre tabs funciona correctamente

**Captura:** Panel con 3 tabs visibles

---

### **PRUEBA 5: Configurar Vista Dinámica con Template**
**Objetivo:** Usar el editor JSON para crear una vista con template predefinido

**Pasos:**
1. Con el panel abierto en etapa TEST_VISTA_01, hacer clic en **Tab 3: "Vista Dinámica"**
2. Debe aparecer el componente `VistaConfiguratorPanel`
3. Si no hay configuración previa, debe mostrar mensaje: _"No hay configuración de vista para esta etapa"_ y botón **"Crear Configuración"** o similar
4. Hacer clic en dropdown o selector de **"Templates"**
5. Seleccionar template **"Formulario Completo"**
6. El editor JSON debe cargarse con una estructura completa que incluya:
   ```json
   {
     "titulo": "Formulario Completo",
     "descripcion": "...",
     "campos": [
       { "tipo": "TEXTO", ... },
       { "tipo": "NUMERO", ... },
       { "tipo": "FECHA", ... },
       { "tipo": "SELECT", ... },
       { "tipo": "ARCHIVO", ... }
     ]
   }
   ```
7. Modificar el campo `titulo` a: **"Mis Datos Personales"**
8. Hacer clic en botón **"Guardar"**

**Resultado esperado:**
- ✅ JsonEditor muestra JSON con sintaxis highlighting
- ✅ Templates disponibles: Formulario Básico, Completo, Carga Documentos, Solo Revisión
- ✅ Template "Formulario Completo" carga JSON con 5-7 campos de diferentes tipos
- ✅ Editor permite modificar el JSON
- ✅ Botón "Guardar" ejecuta llamada API: `POST /api/v1/workflow/vistas-config`
- ✅ Mensaje de éxito: "Configuración guardada exitosamente" (o similar)
- ✅ Modo cambia de "edición" a "vista"

**Captura:** JsonEditor con template cargado y modificado

---

### **PRUEBA 6: Vista Previa con DynamicRenderer**
**Objetivo:** Verificar que el modal de preview renderiza correctamente el formulario

**Pasos:**
1. Con la configuración guardada visible en Tab "Vista Dinámica"
2. Hacer clic en botón **"Vista Previa"** o **"Preview"**
3. Debe abrirse un modal (Dialog de MUI) de tamaño grande
4. El modal debe mostrar:
   - Título: "Mis Datos Personales" (el modificado)
   - Descripción del formulario
   - Todos los campos renderizados según su tipo:
     * Campo de texto con label e input
     * Campo numérico con input type number
     * DatePicker con calendario
     * Select con opciones desplegables
     * FileUpload con botón de carga
5. Interactuar con los campos:
   - Escribir en campo de texto
   - Seleccionar fecha
   - Elegir opción en select
6. Hacer clic en botón **"Cerrar"** o **X** del modal

**Resultado esperado:**
- ✅ Modal se abre al hacer clic en "Vista Previa"
- ✅ Título y descripción son visibles
- ✅ Todos los campos se renderizan correctamente según tipo
- ✅ Componentes están estilizados con Material-UI
- ✅ Campos son interactivos (se puede escribir, seleccionar, etc.)
- ✅ Layout es responsive y legible
- ✅ Modal se cierra correctamente
- ✅ No hay errores en consola del navegador (F12 > Console)

**Captura:** Modal de vista previa con formulario renderizado

---

### **PRUEBA 7: Persistencia de Configuración**
**Objetivo:** Verificar que la configuración se guarda y carga correctamente

**Pasos:**
1. Con el panel de etapa TEST_VISTA_01 abierto en Tab "Vista Dinámica"
2. Verificar que la configuración guardada está visible (modo "vista")
3. Hacer clic **fuera del panel** o en el canvas para cerrarlo
4. Hacer clic **nuevamente en el nodo** TEST_VISTA_01
5. El panel se abre de nuevo
6. Navegar a **Tab 3: "Vista Dinámica"**

**Resultado esperado:**
- ✅ Al reabrir el panel, el Tab "Vista Dinámica" carga automáticamente
- ✅ El hook `useDynamicView(etapaId)` ejecuta GET request a `/api/v1/workflow/etapas/{id}/vista-config`
- ✅ La configuración guardada se muestra en modo "vista" (no edición)
- ✅ El título "Mis Datos Personales" es visible
- ✅ Se puede hacer clic en "Editar" para volver al JsonEditor
- ✅ Datos en el editor coinciden con lo guardado previamente

**Verificación adicional en DevTools:**
- Abrir F12 > Network tab
- Recargar el panel (cerrar y abrir nodo)
- Buscar request: `GET /api/v1/workflow/etapas/{id}/vista-config`
- Response debe contener:
  ```json
  {
    "id": 1,
    "etapa_id": <id_etapa>,
    "config_json": { "titulo": "Mis Datos Personales", ... },
    "activo": true,
    ...
  }
  ```

**Captura:** Panel recargado con configuración persistida

---

### **PRUEBA 8: Verificar Badge "Vista Dinámica" en CustomNode**
**Objetivo:** Confirmar que el nodo muestra indicador visual cuando tiene vista configurada

**Pasos:**
1. Con el workflow abierto en editor visual
2. Cerrar el panel lateral (si está abierto) para ver bien el canvas
3. Observar el **nodo de la etapa TEST_VISTA_01**
4. El nodo debe mostrar:
   - Nombre de la etapa: "Datos Personales" o "TEST_VISTA_01"
   - **Badge azul** con:
     * Icono: ✨ (AutoAwesome de MUI)
     * Texto: "Vista Dinámica"
     * Color: primary (azul)
     * Tamaño: pequeño (height 20px, font 0.65rem)

**Resultado esperado:**
- ✅ Badge "Vista Dinámica" visible en el nodo
- ✅ Badge aparece solo en nodos con configuración (no en INICIO ni placeholders)
- ✅ Icono ✨ se renderiza correctamente
- ✅ Color y estilo coinciden con diseño MUI Chip component
- ✅ Badge se posiciona correctamente dentro del nodo (después de nombre, antes de perfiles)

**Verificación lógica:**
- El `useEffect` en `CustomNode.tsx` llama a `vistaConfigService.checkExists(data.id)`
- Si retorna `{existe: true}`, el estado `tieneVistaDinamica` se pone en `true`
- El render condicional `{tieneVistaDinamica && <Chip ... />}` muestra el badge

**Captura:** Nodo con badge "Vista Dinámica" visible

---

### **PRUEBA 9: Verificar Endpoint Optimizado**
**Objetivo:** Confirmar que el endpoint `/existe` funciona correctamente

**Pasos:**
1. Abrir **DevTools** del navegador (F12)
2. Ir a tab **Network**
3. Filtrar por **Fetch/XHR**
4. Recargar la página del workflow o cerrar/abrir el panel de la etapa
5. Buscar request a URL: `/api/v1/workflow/etapas/{id}/vista-config/existe`
6. Hacer clic en el request para ver detalles:
   - **Method:** GET
   - **Status:** 200 OK
   - **Response:**
     ```json
     {
       "existe": true,
       "config_id": 1
     }
     ```

**Prueba manual con curl:**
```bash
# Con ID de etapa que tiene configuración
curl http://localhost:8000/api/v1/workflow/etapas/<ID_ETAPA>/vista-config/existe

# Debería retornar: {"existe":true,"config_id":1}

# Con ID inexistente
curl http://localhost:8000/api/v1/workflow/etapas/999999/vista-config/existe

# Debería retornar: {"existe":false,"config_id":null}
```

**Resultado esperado:**
- ✅ Endpoint responde correctamente
- ✅ `existe: true` cuando hay configuración activa
- ✅ `existe: false` cuando no hay configuración
- ✅ `config_id` es número cuando existe, null cuando no existe
- ✅ Response es más ligera que obtener config completa (no incluye JSON)
- ✅ Tiempo de respuesta < 100ms

**Captura:** DevTools Network tab con request y response

---

### **PRUEBA 10: Crear Segunda Etapa SIN Vista Dinámica**
**Objetivo:** Verificar que el badge NO aparece en etapas sin configuración

**Pasos:**
1. En el mismo workflow, agregar una **segunda etapa**:
   ```
   Tipo: ETAPA
   Código: TEST_SIN_VISTA
   Nombre: Revisión Manual
   ```
2. Guardar la etapa
3. **NO configurar vista dinámica** en esta etapa (dejar Tab 3 vacío)
4. Observar ambos nodos en el canvas

**Resultado esperado:**
- ✅ Nodo TEST_VISTA_01: Muestra badge "Vista Dinámica" ✨
- ✅ Nodo TEST_SIN_VISTA: NO muestra badge
- ✅ La lógica de `checkExists()` retorna `{existe: false}` para la segunda etapa
- ✅ El badge solo aparece condicionalmente según `tieneVistaDinamica`

**Captura:** Canvas con 2 etapas, una con badge y otra sin badge

---

## 🔍 Verificaciones Adicionales

### **Base de Datos**
Verificar que la tabla `workflow_vista_config` contiene el registro:

```bash
# Conectar a SQL Server
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword123!" -C

# Query
SELECT * FROM workflow_vista_config WHERE etapa_id = <ID_ETAPA>;
GO
```

**Verificar columnas:**
- `id`: ID autoincremental
- `etapa_id`: ID de la etapa TEST_VISTA_01
- `config_json`: String JSON con la configuración
- `activo`: 1 (true)
- `created_at`: Timestamp de creación
- `created_by`: Usuario creador

---

### **Logs del Backend**
Ver logs para confirmar que no hay errores:

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Buscar errores
docker-compose logs backend | grep -i error
```

**Buscar líneas como:**
```
INFO: POST /api/v1/workflow/vistas-config - 201 Created
INFO: GET /api/v1/workflow/etapas/{id}/vista-config - 200 OK
INFO: GET /api/v1/workflow/etapas/{id}/vista-config/existe - 200 OK
```

---

### **Consola del Navegador**
Verificar que no hay errores JavaScript:

1. Abrir **DevTools** (F12)
2. Ir a tab **Console**
3. Buscar errores (texto rojo)

**No debe haber:**
- ❌ Errores de importación de módulos
- ❌ Errores de rendering de componentes
- ❌ Errores de llamadas API (4xx, 5xx)
- ❌ Warnings de props incorrectas en componentes

**Pueden aparecer warnings de:**
- ⚠️ Deprecations de Vite o bibliotecas (normal)
- ⚠️ Variables no usadas en archivos de test (normal)

---

## 📊 Checklist Final FASE 1

- [ ] Sistema de 3 tabs funciona correctamente
- [ ] VistaConfiguratorPanel se carga en Tab 3
- [ ] JsonEditor muestra templates predefinidos
- [ ] Template "Formulario Completo" carga correctamente
- [ ] Modificaciones en JSON se guardan
- [ ] Vista Previa abre modal con DynamicRenderer
- [ ] Formulario se renderiza con todos los tipos de campos
- [ ] Campos son interactivos (escribir, seleccionar)
- [ ] Configuración persiste al cerrar/abrir panel
- [ ] Badge "Vista Dinámica" ✨ aparece en nodo
- [ ] Badge NO aparece en etapas sin configuración
- [ ] Endpoint `/existe` retorna respuesta correcta
- [ ] Tabla `workflow_vista_config` tiene registros
- [ ] No hay errores en logs del backend
- [ ] No hay errores en consola del navegador

---

## 🎉 Resultado Esperado Final

Al completar todas las pruebas, el sistema debe:

1. ✅ Permitir crear workflows con etapas que tienen vistas dinámicas configuradas
2. ✅ Mostrar indicadores visuales (badges) en el editor para distinguir etapas con vistas
3. ✅ Proporcionar editor JSON con templates para facilitar configuración
4. ✅ Renderizar previsualizaciones de formularios dinámicos
5. ✅ Persistir configuraciones en base de datos
6. ✅ Optimizar consultas con endpoint de verificación ligero
7. ✅ Coexistir con sistema legacy de preguntas tradicionales (arquitectura híbrida)

**FASE 1 está completa cuando:**
- Administradores pueden diseñar vistas dinámicas desde el editor de workflows
- Sistema guarda y recupera configuraciones correctamente
- UI muestra indicadores claros de qué etapas tienen vistas configuradas

---

## 🚀 Próximos Pasos (FASE 2)

Una vez validada FASE 1, continuar con:

- **Tarea 2.1:** Componente `ProcesoEjecucion.tsx` (página usuarios finales)
- **Tarea 2.2:** Componente `FormularioTradicional.tsx` (fallback legacy)
- **Tarea 2.3:** Adaptador `respuesta-adapter.ts` (convertir datos)
- **Tarea 2.4:** Integración con API de ejecución de instancias
- **Tarea 2.5:** Página de ejecución con ruta `/instancias/:id/ejecutar`
- **Tarea 2.6:** Testing de flujo completo end-to-end

---

## 📝 Notas de Implementación

**Archivos creados/modificados en FASE 1:**

**Frontend:**
- `frontend/src/components/Workflow/EtapaConfigPanel.tsx` (modificado - tabs)
- `frontend/src/components/Workflow/VistaConfiguratorPanel.tsx` (nuevo)
- `frontend/src/components/Workflow/CustomNode.tsx` (modificado - badge)
- `frontend/src/components/DynamicView/*.tsx` (9 componentes nuevos)
- `frontend/src/hooks/useDynamicView.ts` (nuevo)
- `frontend/src/services/vista-config.service.ts` (nuevo)
- `frontend/src/types/dynamic-view.ts` (nuevo)
- `frontend/src/templates/vista-templates.ts` (nuevo)

**Backend:**
- `backend/app/models/models_workflow.py` (modificado - modelo WorkflowVistaConfig)
- `backend/app/schemas/vista_config.py` (nuevo)
- `backend/app/services/vista_config_service.py` (nuevo)
- `backend/app/routes/vista_config.py` (nuevo)
- `backend/app/routers/routers_workflow.py` (modificado - include router)

**Commits:**
- `a2406e7`: Sistema de tabs
- `3414c32`: Sistema completo vistas dinámicas (16 archivos)
- `e40814b`: Badge en CustomNode
- `56f6ab1`: Endpoint optimizado verificación
- `cae1939`: Modelo, schema y servicio backend

---

**Fecha de creación:** 14/11/2025  
**Última actualización:** 14/11/2025  
**Autor:** Sistema de Trámites MVP Panamá
