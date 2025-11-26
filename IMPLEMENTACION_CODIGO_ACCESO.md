# Implementación: Código de Acceso Corto para Solicitudes PPSH

## Fecha: 22 de Enero 2025 (Actualizado: 25 Nov 2025)

## Resumen

Se implementó un sistema de **código de acceso corto** (ej: `PPSH-A7X9`) que permite a los ciudadanos continuar su trámite de manera más fácil, sin necesidad de guardar el link largo con JWT token.

Además, se creó una **vista pública de etapas** específica para ciudadanos/abogados que:
- No muestra opciones de login
- No muestra pestañas de funcionario
- Separa claramente las etapas que puede completar el ciudadano vs las que requieren funcionario

## Problema Anterior

Los ciudadanos recibían un link de seguimiento muy largo:
```
http://localhost:3000/solicitudes/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.../workflow
```

Este link era:
- Difícil de recordar
- Propenso a errores al copiarlo
- Fácil de perder

## Solución Implementada

### Nuevo Sistema de Código de Acceso

**Formato**: `PPSH-XXXX` donde XXXX son 4 caracteres alfanuméricos
- Caracteres usados: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
- Se excluyen caracteres confusos: `0/O, 1/I/L`
- Ejemplo: `PPSH-A7X9`

### Flujo de Usuario

1. **Al crear solicitud**: Se genera y muestra prominentemente el código de acceso
2. **Para continuar**: El ciudadano ingresa su código + número de pasaporte
3. **Validación**: El sistema valida los datos y genera un JWT token nuevo
4. **Acceso**: Se redirige al workflow del trámite

## Cambios Realizados

### Backend

#### 1. Modelo de Base de Datos
```sql
-- Nueva columna en WORKFLOW_INSTANCIA
ALTER TABLE WORKFLOW_INSTANCIA 
ADD codigo_acceso NVARCHAR(12) NULL;

-- Índice único para búsqueda rápida
CREATE UNIQUE INDEX UQ_WORKFLOW_INSTANCIA_codigo_acceso 
ON WORKFLOW_INSTANCIA(codigo_acceso) 
WHERE codigo_acceso IS NOT NULL;
```

#### 2. Modelo SQLAlchemy (`models_workflow.py`)
```python
class WorkflowInstancia(Base):
    # ...
    codigo_acceso = Column(String(12), unique=True, index=True)
```

#### 3. Servicio (`public_solicitud_service.py`)

**Nuevas funciones:**
- `generar_codigo_acceso(db, prefijo="PPSH")` - Genera código único
- `obtener_instancia_por_codigo(db, codigo_acceso)` - Busca por código
- `validar_acceso_por_codigo(db, codigo_acceso, pasaporte)` - Valida y genera JWT

**Función modificada:**
- `iniciar_solicitud_ppsh()` - Ahora genera y retorna codigo_acceso

#### 4. Router (`routes_public.py`)

**Nuevos endpoints:**
```
POST /api/v1/public/solicitudes/validar-codigo
  - Body: { codigo_acceso: "PPSH-A7X9", pasaporte: "N123456" }
  - Response: { success: true, token: "...", link_seguimiento: "..." }

GET /api/v1/public/solicitudes/codigo/{codigo_acceso}/existe
  - Response: { existe: true/false }
```

**Schema modificado:**
- `IniciarSolicitudResponse` ahora incluye `codigo_acceso`

### Frontend

#### 1. Nueva Pantalla: PublicAccess.tsx (Mejorada)

**Dos modos de acceso:**
1. **Tab "Código de Acceso"**: 
   - Campo: Código de acceso (PPSH-XXXX)
   - Campo: Número de pasaporte
   
2. **Tab "Link Completo"**:
   - Campo: Link o token completo

**Características:**
- Auto-formato del código (mayúsculas, guión automático)
- Validación visual de formato
- Mensajes de éxito/error claros

#### 2. Pantalla Modificada: NuevaSolicitud.tsx

**Diálogo de éxito mejorado:**
- Muestra prominentemente el código de acceso (grande, con fondo azul)
- Botón para copiar código
- Instrucciones claras de cómo usar el código
- Link de seguimiento como alternativa secundaria

## Migración de Alembic

Archivo: `019_agregar_codigo_acceso_workflow.py`
- Agrega columna `codigo_acceso`
- Crea índice único
- Genera códigos para instancias públicas existentes

## Uso del Sistema

### Para el Ciudadano

**Al iniciar solicitud:**
1. Completa formulario
2. Recibe código prominente: `PPSH-A7X9`
3. Guarda código + pasaporte

**Para continuar:**
1. Va a "Continuar Proceso"
2. Ingresa código: `PPSH-A7X9`
3. Ingresa pasaporte: `N123456`
4. Accede a su trámite

### Para el Sistema

El código de acceso:
- Se genera al crear la instancia de workflow
- Es único en toda la base de datos
- Requiere pasaporte para validar (doble autenticación)
- Genera JWT token nuevo cada vez (seguridad)

## Seguridad

1. **Doble factor**: Código + Pasaporte
2. **Código no secuencial**: Generado aleatoriamente
3. **Índice único**: Evita duplicados
4. **JWT temporal**: Token generado válido 30 días
5. **Sin caracteres confusos**: Evita errores de transcripción

## Testing

### Probar creación de solicitud:
```bash
curl -X POST "http://localhost:8000/api/v1/public/solicitudes/iniciar" \
  -H "Content-Type: application/json" \
  -d '{
    "pasaporte": "N123456",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez García",
    "email": "juan@test.com"
  }'
```

### Probar validación por código:
```bash
curl -X POST "http://localhost:8000/api/v1/public/solicitudes/validar-codigo" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_acceso": "PPSH-A7X9",
    "pasaporte": "N123456"
  }'
```

## Notas Adicionales

- Los códigos existentes en la BD seguirán funcionando con el link largo
- Nuevas solicitudes tendrán ambos métodos de acceso
- El código es case-insensitive (se normaliza a mayúsculas)

---

## Vista Pública de Etapas (WorkflowEtapasPublico)

### Archivo: `/frontend/src/pages/WorkflowEtapasPublico.tsx`

### Características:
- **Sin header de login**: El ciudadano no ve opciones de autenticación
- **Sin pestañas de funcionario**: Solo ve las etapas de su solicitud
- **Breadcrumbs simplificados**: Inicio / Mi Solicitud / Etapas
- **Separación clara de etapas**:
  - Etapas 1-3: "Mis Etapas" - Las que completa el ciudadano
  - Etapas 4+: "Etapas de Revisión" - Bloqueadas, solo informativas

### Flujo:
1. Ciudadano valida con código PPSH-XXXX + pasaporte
2. Sistema genera JWT y redirige a `/solicitudes/:token/etapas`
3. Se muestra vista pública sin opciones administrativas

### Ruta en AppRouter.tsx:
```jsx
<Route path="/solicitudes/:token/etapas" element={<WorkflowEtapasPublico />} />
```

### Datos de Prueba (Solicitud 2064):
| Campo | Valor |
|-------|-------|
| Código de Acceso | `PPSH-J7C4` |
| Pasaporte | `CL17663758-7` |
| Expediente | `PPSH-2025-007784` |
| Instancia ID | 3010 |
| Estado | EN_PROGRESO |

