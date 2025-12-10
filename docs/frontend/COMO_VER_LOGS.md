# 🔍 Cómo Ver los Logs del Frontend

## TL;DR - Ver Logs AHORA

### 1. **Consola del Navegador** (Más fácil, recomendado)

1. Abre tu navegador
2. Ve a la aplicación: `http://localhost:3000`
3. Presiona **F12** (o clic derecho → Inspeccionar)
4. Click en la pestaña **"Console"**
5. ✅ Verás todos los logs del logger

**Ejemplo de log:**
```
[2025-11-21T10:30:45.123Z] [frontend-tramites] [INFO] [API] API GET /workflow/workflows/123 { params: {}, body: undefined }
```

### 2. **Filtrar logs en la consola del navegador**

En la barra de búsqueda de la consola, escribe:
- `[ERROR]` - Solo errores
- `[API]` - Solo llamadas API  
- `[WORKFLOW]` - Solo operaciones de workflows
- `[PERFORMANCE]` - Solo métricas de rendimiento

---

## ⚠️ Importante: Los logs del navegador NO aparecen en Dozzle

**Dozzle muestra los logs del servidor Vite** (proceso Node.js), **no los del navegador**.

Los logs del navegador se ejecutan en el cliente (tu máquina), no en el contenedor Docker.

---

## 📊 Qué logs verás

### Al cargar la aplicación:
```
[INFO] Frontend iniciado
```

### Al navegar a /flujos/:id/ver:
```
[INFO] [WORKFLOW] Loading workflow { workflowId: 123 }
[INFO] [API] API GET /workflow/workflows/123
[INFO] [API] API GET /workflow/workflows/123 - 200 { status: 200, dataSize: 2048, duration: "245.50ms" }
[INFO] [WORKFLOW] Workflow loaded successfully { workflowId: 123, nombre: "...", etapasCount: 5 }
```

### Al hacer click en un nodo:
```
[DEBUG] [COMPONENT] WorkflowViewer: Node clicked { nodeId: "5", nodeLabel: "ETAPA_1" }
[DEBUG] [WORKFLOW] Etapa selected { etapaId: 5, nombre: "...", preguntasCount: 1 }
```

### Al hacer auto-layout:
```
[DEBUG] [COMPONENT] WorkflowViewer: Auto-layout triggered { nodesCount: 5, edgesCount: 4 }
[INFO] [PERFORMANCE] Performance: Auto-layout took 1250ms { duration: 1250, nodesCount: 15 }
```

---

## 🐛 Debugging

### No veo ningún log:

1. **Verifica que estás en la pestaña Console** (no Elements, Network, etc.)
2. **Verifica que no haya filtros activos** - En la consola, busca un botón "Filter" y asegúrate que esté en "All levels"
3. **Recarga la página** (F5 o Ctrl+R)
4. **Verifica errores de compilación**:
   ```bash
   docker-compose logs frontend --tail 50
   ```

### Veo errores en rojo:

Los errores son normales durante el desarrollo. El logger los captura automáticamente.

### Demasiados logs:

Filtra por nivel o contexto escribiendo en la barra de búsqueda de la consola:
- Para ver solo errores: `[ERROR]`
- Para ver solo API: `[API]`
- Para ocultar debug: Click en "Default levels" → Deseleccionar "Verbose"

---

## 🎯 Prueba rápida

1. Abre `http://localhost:3000` con la consola abierta (F12)
2. Deberías ver inmediatamente: `[INFO] Frontend iniciado`
3. Navega a `/flujos/4014/ver`
4. Deberías ver logs de carga del workflow
5. Click en cualquier nodo
6. Deberías ver logs de selección de etapa

---

## 📝 Para enviar logs al backend (Opcional - Avanzado)

Si quieres que los logs del frontend aparezcan en Dozzle, necesitas:

1. Crear un endpoint en el backend: `POST /api/v1/logs/frontend`
2. Configurar en `.env`:
   ```
   VITE_SEND_LOGS_TO_BACKEND=true
   ```
3. El logger enviará automáticamente logs de error/warn al backend

**Nota**: Esto es opcional y solo para producción. En desarrollo usa la consola del navegador.
