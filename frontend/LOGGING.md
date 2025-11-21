# Sistema de Logging - Frontend

Sistema de logging estructurado para el frontend con soporte para monitoreo en desarrollo y producción.

## 📋 Características

- ✅ Logging estructurado con niveles (debug, info, warn, error)
- ✅ Contexto específico por tipo de operación (API, COMPONENT, WORKFLOW, ROUTER, PERFORMANCE)
- ✅ Interceptores automáticos en todas las llamadas API
- ✅ Medición de performance automática
- ✅ Formato JSON para integración con Docker/Dozzle
- ✅ Filtrado automático según entorno (desarrollo/producción)

## 🚀 Uso

### Logging básico

```typescript
import { logger } from '@/utils/logger';

// Debug (solo en desarrollo)
logger.debug('Información de debugging', { data: 'value' });

// Info
logger.info('Operación exitosa', { userId: 123 });

// Warning
logger.warn('Advertencia importante', { reason: 'timeout' });

// Error
logger.error('Error crítico', error);
```

### Logging con contexto específico

```typescript
// API (automático con interceptores)
logger.api('GET', '/workflow/workflows/123', { params: {} });
logger.apiResponse('GET', '/workflow/workflows/123', 200, { dataSize: '2KB' });
logger.apiError('POST', '/workflow/etapas', error);

// Componentes
logger.component('WorkflowEditor', 'Node clicked', { nodeId: 5 });

// Workflow
logger.workflow('Workflow saved', { workflowId: 123, etapasCount: 5 });

// Navegación
logger.navigation('/flujos', '/flujos/123/ver');

// Performance
logger.performance('Auto-layout', 1250, { nodesCount: 15 });
```

## 🔧 Configuración

### Variables de entorno

```env
# frontend/.env
VITE_LOG_JSON=true  # Habilita formato JSON para Docker/Dozzle
```

### Comportamiento según entorno

**Desarrollo (`MODE=development`)**:
- Muestra todos los niveles en consola
- Formato legible con colores
- Debug habilitado

**Producción (`MODE=production`)**:
- Solo muestra warn y error en consola
- Formato JSON estructurado
- Debug deshabilitado

## 📊 Visualización en Dozzle

Los logs del frontend se capturan automáticamente por Docker y pueden verse en Dozzle:

1. Accede a Dozzle: `http://localhost:8888`
2. Selecciona el contenedor `frontend`
3. Filtra por niveles:
   - `[ERROR]` - Errores críticos
   - `[WARN]` - Advertencias
   - `[INFO]` - Información general
   - `[DEBUG]` - Debugging (solo desarrollo)
4. Filtra por contexto:
   - `[API]` - Llamadas HTTP
   - `[WORKFLOW]` - Operaciones de workflows
   - `[COMPONENT]` - Eventos de componentes
   - `[PERFORMANCE]` - Métricas de rendimiento

## 🎯 Interceptores API

Los interceptores están configurados automáticamente en `services/api.ts`:

### Request Interceptor
- Registra cada llamada con método, endpoint y parámetros
- Marca tiempo de inicio

### Response Interceptor
- Registra respuesta exitosa con status y duración
- Detecta respuestas lentas (>1s) y las marca como performance issue
- Registra errores con detalles completos

### Ejemplo de log API

```json
{
  "service": "frontend-tramites",
  "timestamp": "2025-11-21T10:30:45.123Z",
  "level": "info",
  "message": "API GET /workflow/workflows/123 - 200",
  "data": {
    "status": 200,
    "dataSize": 2048,
    "duration": "245.50ms"
  },
  "context": "API"
}
```

## 📈 Métricas de Performance

El logger captura automáticamente:

- **Duración de llamadas API**: Todas las requests
- **Operaciones lentas**: >1000ms son marcadas
- **Auto-layout**: Tiempo de cálculo de posiciones
- **Carga de workflows**: Tiempo total de carga y procesamiento

## 🔍 Ejemplos de uso en componentes

### WorkflowViewer

```typescript
// Al cargar workflow
logger.workflow('Loading workflow', { workflowId });

// Al completar carga
logger.workflow('Workflow loaded successfully', {
  workflowId: data.id,
  nombre: data.nombre,
  etapasCount: data.etapas?.length || 0,
});

// Al seleccionar nodo
logger.component('WorkflowViewer', 'Node clicked', {
  nodeId: node.id,
  nodeLabel: node.data?.label,
});

// Auto-layout con performance
const startTime = performance.now();
// ... operación ...
const duration = performance.now() - startTime;
logger.performance('Auto-layout', duration, { nodesCount: 15 });
```

## 🛠️ Personalización

Para agregar logging a nuevos componentes:

1. Importa el logger:
```typescript
import { logger } from '@/utils/logger';
```

2. Agrega logs en puntos clave:
```typescript
// Al cargar datos
logger.info('Loading data', { userId });

// En operaciones críticas
try {
  const result = await criticalOperation();
  logger.info('Operation successful', result);
} catch (error) {
  logger.error('Operation failed', error, 'CRITICAL');
}
```

3. Para performance:
```typescript
const start = performance.now();
await expensiveOperation();
logger.performance('Expensive operation', performance.now() - start);
```

## 📝 Best Practices

1. **Usa el contexto apropiado**: API, COMPONENT, WORKFLOW, etc.
2. **Incluye datos relevantes**: IDs, contadores, estados
3. **Errores completos**: Pasa el objeto error completo
4. **Performance crítica**: Mide operaciones >500ms
5. **Evita logs en loops**: Usa contadores o resúmenes
6. **Datos sensibles**: NO incluyas passwords, tokens, etc.

## 🔐 Seguridad

El logger NO debe registrar:
- ❌ Contraseñas o tokens de autenticación
- ❌ Información personal identificable (PII)
- ❌ Números de tarjetas de crédito
- ❌ API keys o secretos

## 📦 Estructura del Log

```typescript
interface LogEntry {
  service: string;       // "frontend-tramites"
  timestamp: string;     // ISO 8601
  level: LogLevel;       // "debug" | "info" | "warn" | "error"
  message: string;       // Descripción del evento
  data?: any;           // Datos adicionales
  context?: string;     // "API" | "WORKFLOW" | "COMPONENT" | etc.
}
```

## 🎨 Formato de salida

### Desarrollo (Consola)
```
[2025-11-21T10:30:45.123Z] [frontend-tramites] [INFO] [API] API GET /workflow/workflows/123 { params: {}, body: undefined }
```

### Producción (JSON)
```json
{"service":"frontend-tramites","timestamp":"2025-11-21T10:30:45.123Z","level":"info","message":"API GET /workflow/workflows/123","data":{"params":{},"body":undefined},"context":"API"}
```

## 🚨 Troubleshooting

**Los logs no aparecen en Dozzle:**
1. Verifica que `VITE_LOG_JSON=true` en `.env`
2. Reinicia el contenedor frontend
3. Verifica que Dozzle esté corriendo en `:8888`

**Demasiados logs en desarrollo:**
1. Cambia `VITE_LOG_JSON=false` para formato más limpio
2. Filtra por contexto específico en la consola del navegador

**Logs de API duplicados:**
- Es normal: request + response = 2 logs por llamada
- Los errores generan 1 log adicional
