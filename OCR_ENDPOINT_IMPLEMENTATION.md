# Implementación del Endpoint de Documentos con OCR

## Resumen
Implementación completa del endpoint `GET /ppsh/solicitudes/{id}/documentos` con soporte para información de OCR, incluyendo confianza, datos estructurados y estado de procesamiento.

## Cambios Implementados

### Backend

#### 1. Schemas (`backend/app/schemas/schemas_ppsh.py`)
```python
class OCRResultadoResponse(BaseModel):
    """Schema para resultados de OCR procesado"""
    id_ocr: int
    estado_ocr: str  # PENDIENTE/PROCESANDO/COMPLETADO/ERROR/CANCELADO
    texto_confianza: Optional[float] = None  # 0-100%
    idioma_detectado: Optional[str] = None
    num_paginas: Optional[int] = None
    datos_estructurados: Optional[dict] = None  # Campos extraídos
    codigo_error: Optional[str] = None
    mensaje_error: Optional[str] = None
    fecha_procesamiento: Optional[datetime] = None

class DocumentoResponse(BaseModel):
    # ... campos existentes
    ocr_resultado: Optional[OCRResultadoResponse] = None
    ocr_exitoso: bool = False  # True si OCR completado con confianza >= 70%
```

#### 2. Service (`backend/app/services/services_ppsh.py`)
```python
def listar_documentos(db: Session, id_solicitud: int) -> List[PPSHDocumento]:
    """Lista documentos con eager loading de OCR results"""
    return db.query(PPSHDocumento).options(
        joinedload(PPSHDocumento.ocr_results)  # Evita N+1 queries
    ).filter(
        PPSHDocumento.id_solicitud == id_solicitud
    ).order_by(
        PPSHDocumento.uploaded_at.desc()
    ).all()
```

#### 3. Router (`backend/app/routers/routers_ppsh.py`)
**Lógica de construcción de respuesta:**
- Obtiene el resultado OCR más reciente del documento
- Calcula `ocr_exitoso = estado_ocr=='COMPLETADO' AND confianza >= 70%`
- Parsea `datos_estructurados` de JSON a dict
- Construye `OCRResultadoResponse` si existe OCR, sino `null`

#### 4. Migración (`d2df608884b7_add_ocr_integration_to_documento_.py`)
- Documenta cambios en API (no hay cambios de BD)
- Esquema PPSH_DOCUMENTO_OCR ya existe desde migración 012

### Frontend

#### 1. Types (`frontend/src/types/ppsh.ts`)
```typescript
interface OCRResultado {
  id_ocr: number;
  estado_ocr: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR' | 'CANCELADO';
  texto_confianza?: number;
  idioma_detectado?: string;
  num_paginas?: number;
  datos_estructurados?: Record<string, any>;
  codigo_error?: string;
  mensaje_error?: string;
  fecha_procesamiento?: string;
}

interface Documento {
  // ... campos existentes
  ocr_resultado?: OCRResultado | null;
  ocr_exitoso: boolean;
}
```

#### 2. RevisionRequisitos Page
```typescript
// Lógica actualizada para usar ocr_exitoso del backend
const hasOcr = doc?.ocr_exitoso || false;

// hasOcr ahora indica si:
// - OCR fue procesado (estado_ocr = 'COMPLETADO')
// - Y la confianza es >= 70%
```

## Criterios de OCR Exitoso

### Backend
```python
ocr_exitoso = (
    estado_ocr == 'COMPLETADO' and 
    texto_confianza >= 70.0
)
```

### Umbrales de Confianza
- **>= 90%**: Alta confianza - Puede auto-aprobarse
- **70-89%**: Media confianza - Requiere revisión manual
- **< 70%**: Baja confianza - Requiere re-upload o revisión exhaustiva

## Datos de Prueba

### Documentos Mock (Solicitud 7)
- **12 documentos** creados con estado `VERIFICADO`
- Tipos: 1-12 (formulario, pasaporte, antecedentes, etc.)

### Resultados OCR de Prueba
1. **pasaporte.pdf**
   - Estado: COMPLETADO
   - Confianza: 92.5% ✅
   - OCR exitoso: `true`
   - Datos: nombre, nacionalidad, número pasaporte, fecha nacimiento

2. **acta_nacimiento.pdf**
   - Estado: COMPLETADO
   - Confianza: 65.3% ⚠️
   - OCR exitoso: `false` (confianza < 70%)
   - Datos: nombre, fecha nacimiento

## Ejemplo de Response

### GET /api/v1/ppsh/solicitudes/7/documentos
```json
[
  {
    "id_documento": 123,
    "nombre_archivo": "pasaporte.pdf",
    "estado_verificacion": "VERIFICADO",
    "ocr_exitoso": true,
    "ocr_resultado": {
      "id_ocr": 1,
      "estado_ocr": "COMPLETADO",
      "texto_confianza": 92.5,
      "idioma_detectado": "es",
      "num_paginas": 1,
      "datos_estructurados": {
        "nombre": "Juan Pérez",
        "nacionalidad": "Venezuela",
        "numero_pasaporte": "VE123456",
        "fecha_nacimiento": "1990-01-15"
      },
      "codigo_error": null,
      "mensaje_error": null,
      "fecha_procesamiento": "2025-11-03T18:05:00"
    }
  },
  {
    "id_documento": 124,
    "nombre_archivo": "formulario_solicitud.pdf",
    "estado_verificacion": "VERIFICADO",
    "ocr_exitoso": false,
    "ocr_resultado": null
  }
]
```

## Testing

### 1. Verificar endpoint retorna OCR
```bash
curl http://localhost:8000/api/v1/ppsh/solicitudes/7/documentos \
  -H "Authorization: Bearer TOKEN" | jq '.[] | {nombre_archivo, ocr_exitoso}'
```

### 2. Frontend - Navegación
```
http://localhost:3000/solicitudes/7/revision
```

**Comportamiento esperado:**
- Documentos sin OCR: checkbox vacío
- pasaporte.pdf: checkbox verde ✅ (confianza 92.5%)
- acta_nacimiento.pdf: checkbox vacío (confianza 65.3% < 70%)

## Próximos Pasos

### 1. Implementar "Iniciar revisión OCR"
- Botón para trigger procesamiento OCR
- POST `/ppsh/documentos/{id}/procesar-ocr`
- Integración con Celery task asíncrono

### 2. Validación de Inconsistencias
- Comparar datos OCR vs datos ingresados manualmente
- Ejemplos:
  * Nombre en pasaporte ≠ nombre en formulario
  * Nacionalidad incorrecta
  * Fecha de nacimiento no coincide
- Mostrar alertas en UI

### 3. Mejoras UI
- Mostrar porcentaje de confianza en tooltip
- Indicador visual de calidad (alta/media/baja)
- Detalles de datos estructurados en modal
- Botón para re-procesar OCR si confianza baja

### 4. Guardar Funcional
- Implementar PATCH `/ppsh/documentos/{id}/verificacion`
- Actualizar `estado_verificacion` tras revisión
- Refresh automático de datos

## Archivos Modificados

### Backend
- ✅ `backend/app/schemas/schemas_ppsh.py`
- ✅ `backend/app/services/services_ppsh.py`
- ✅ `backend/app/routers/routers_ppsh.py`
- ✅ `backend/alembic/versions/d2df608884b7_add_ocr_integration_to_documento_.py`

### Frontend
- ✅ `frontend/src/types/ppsh.ts`
- ✅ `frontend/src/pages/RevisionRequisitos.tsx`

## Notas Técnicas

### Performance
- Uso de `joinedload()` para eager loading de `ocr_results`
- Evita N+1 queries al listar documentos
- Un solo query SQL con JOIN en lugar de queries por documento

### Arquitectura
- OCRResultadoResponse separado (mejor separación de concerns)
- Campo computado `ocr_exitoso` simplifica lógica frontend
- Retrocompatibilidad: `ocr_resultado` es opcional

### Validación
- Backend calcula `ocr_exitoso` basado en criterios consistentes
- Frontend solo consume, no calcula (single source of truth)
- Permite cambiar umbrales de confianza sin modificar frontend
