# 📘 Guía de Implementación de Vistas de Workflow

> **Documento de Contexto para Generación de Nuevas Vistas**  
> Fecha de creación: 24 de noviembre de 2025  
> Sistema: Trámites MVP Panamá - Módulo de Workflows Dinámicos

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Vistas](#arquitectura-de-vistas)
3. [Componente Base: EtapaInformativa](#componente-base-etapainformativa)
4. [Patrones de Implementación](#patrones-de-implementación)
5. [Vistas Implementadas (Referencia)](#vistas-implementadas-referencia)
6. [Checklist de Implementación](#checklist-de-implementación)
7. [Código de Ejemplo](#código-de-ejemplo)

---

## 🎯 Visión General

Este documento proporciona el contexto completo para implementar nuevas vistas de workflow siguiendo los patrones establecidos en el sistema. Todas las vistas siguen una arquitectura consistente basada en el componente `EtapaInformativa`.

### Vistas de Referencia Implementadas

| # | Etapa | Ruta | Tipo de Vista |
|---|-------|------|---------------|
| 1 | Descarga de Requisitos | `/solicitudes/:id/descarga-requisitos` | Informativa con descarga |
| 2 | Carga de Poder | `/solicitudes/:id/carga-poder` | Carga de archivo + OCR |
| 3 | Carga de Documentos | `/solicitudes/:id/carga-documentos` | Carga de archivo + OCR |
| 4 | Revisión | `/solicitudes/:id/revision` | Compleja (sin EtapaInformativa) |
| 5 | Cotización | `/solicitudes/:id/cotizacion` | Formulario con campos personalizados |

---

## 🏗️ Arquitectura de Vistas

### Estructura de Carpetas

```
frontend/src/
├── pages/
│   ├── DescargaRequisitos.tsx       # Etapa 1
│   ├── CargaPoderGeneral.tsx        # Etapa 2
│   ├── CargaSolicitudFirmada.tsx    # Etapa 3
│   ├── RevisionRequisitos.tsx       # Etapa 4
│   └── Cotizacion.tsx                # Etapa 5
├── components/
│   └── workflow/
│       └── EtapaInformativa.tsx     # Componente base reutilizable
├── services/
│   ├── workflow.service.ts
│   └── ppsh.service.ts
└── routes/
    └── AppRouter.tsx
```

### Flujo de Datos

```
URL con parámetros (solicitudId/instanciaId + readonly)
    ↓
Componente de Vista (ej: Cotizacion.tsx)
    ↓
useParams + useSearchParams (extrae parámetros)
    ↓
Carga de datos (workflowService.getInstancia)
    ↓
EtapaInformativa (renderiza UI consistente)
    ↓
Handlers (onCancel, onNext, actionButton)
    ↓
workflowService.completarEtapa (guarda y avanza)
```

---

## 🧩 Componente Base: EtapaInformativa

### Props Interface

```typescript
interface EtapaInformativaProps {
  // Header azul
  headerTitle: string;                    // Título grande en header
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];         // Navegación jerárquica
  
  // Contenido principal
  contentTitle: string;                   // Título del contenido
  contentDescription: string;             // Descripción/instrucciones
  contentSubtitle?: string;               // Subtítulo opcional
  
  // Información adicional
  additionalInfo?: AdditionalInfo;       // Lista de items adicionales
  
  // Contenido personalizado
  customContent?: React.ReactNode;        // JSX personalizado
  
  // Botón de acción
  actionButton?: ActionButton;           // Botón principal (ej: Descargar)
  
  // Modo de operación
  readonly?: boolean;                     // Si es true, solo lectura
  
  // Callbacks
  onCancel: () => void;                   // Volver a etapas
  onNext?: () => void;                    // Completar y continuar
  
  // Personalización de botones
  cancelButtonText?: string;              // Texto del botón cancelar (default: "Volver")
  nextButtonText?: string;                // Texto del botón siguiente (default: "Siguiente")
  nextButtonDisabled?: boolean;           // Deshabilitar botón siguiente
  
  // Estados
  loading?: boolean;                      // Cargando datos iniciales
  completing?: boolean;                   // Procesando completar
  error?: string | null;                  // Mensaje de error
  
  // Modales/Componentes adicionales
  children?: React.ReactNode;             // Modales OCR, etc.
}
```

### Tipos Auxiliares

```typescript
interface BreadcrumbItem {
  label: string;
  path?: string;  // Si no tiene path, es el último elemento
}

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined';
  color?: string;
  backgroundColor?: string;
}

interface AdditionalInfo {
  label: string;
  items: string[];
}
```

### Características del Componente

1. **Header Azul Consistente**
   - Color: `#0e5fa6`
   - Título grande (64px)
   - Breadcrumbs con navegación

2. **Área de Contenido**
   - Título del contenido (48px)
   - Descripción (texto largo)
   - Subtítulo opcional
   - Contenido personalizado (`customContent`)

3. **Botón de Acción**
   - Ubicado después del contenido
   - Configurable (icono, texto, callback)

4. **Botones de Navegación**
   - **Modo readonly**: Solo botón "Volver"
   - **Modo edición**: Botones "Volver" y "Siguiente"/"Guardar"
   - Estados de loading (CircularProgress)

5. **Manejo de Estados**
   - Loading: Muestra CircularProgress centrado
   - Error: Muestra Alert en rojo
   - Completing: Deshabilita botones y muestra loading

---

## 🎨 Patrones de Implementación

### Patrón 1: Vista Informativa Simple

**Caso de uso**: Mostrar información y permitir descarga (Etapa 1)

```typescript
export const MiVistaInformativa = () => {
  const { id: solicitudId, instanciaId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadWorkflowInstance();
  }, [instanciaId, solicitudId]);

  const loadWorkflowInstance = async () => {
    setLoading(true);
    try {
      // Obtener workflowInstanciaId desde instanciaId o solicitudId
      let numericId: number;
      
      if (instanciaId) {
        numericId = parseInt(instanciaId);
      } else if (solicitudId) {
        const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
        numericId = solicitud.workflow_instancia_id;
      } else {
        throw new Error('No se proporcionó ID');
      }

      setWorkflowInstanciaId(numericId);
      const data = await workflowService.getInstancia(numericId);
      setInstancia(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !instancia) return;
    
    setCompleting(true);
    try {
      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        { campo1: 'valor1' },  // Respuestas
        'CIUDADANO'            // Perfil
      );
      
      // Redirigir a etapas
      const baseParam = solicitudId || instanciaId || workflowInstanciaId;
      const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
      navigate(`${basePath}/etapas`);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleAccion = () => {
    // Lógica del botón de acción
    console.log('Ejecutando acción...');
  };

  return (
    <EtapaInformativa
      headerTitle="Título del Trámite"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
      ]}
      contentTitle="Título de la Etapa"
      contentDescription="Descripción detallada de lo que debe hacer el usuario..."
      actionButton={{
        label: 'Descargar Documento',
        icon: <FileDownloadIcon />,
        onClick: handleAccion,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing}
    />
  );
};
```

### Patrón 2: Vista con Carga de Archivos + OCR

**Caso de uso**: Subir documentos con procesamiento OCR (Etapas 2 y 3)

```typescript
export const MiVistaCargaArchivo = () => {
  // ... estados base del Patrón 1 ...
  
  const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
  const [documentoId, setDocumentoId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Estados para modales OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState({ success: true, message: '' });

  const handleCargarArchivo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validaciones
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10 MB');
        return;
      }

      await processOCR(file);
    };
    input.click();
  };

  const processOCR = async (file: File) => {
    setIsLoadingOCR(true);
    
    try {
      // Simular OCR (2.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simular 80% de éxito
      const exito = Math.random() > 0.2;
      setIsLoadingOCR(false);

      if (exito) {
        // Subir archivo
        setUploading(true);
        const resultado = await workflowService.subirDocumentoEtapa(
          solicitudId,
          file,
          { tipo_documento_texto: 'Mi Documento' }
        );
        
        setArchivoSubido(file);
        setDocumentoId(resultado.id_documento);
        setOcrResult({ success: true, message: 'Documento procesado exitosamente' });
        setShowResult(true);
        setUploading(false);
      } else {
        setOcrResult({ 
          success: false, 
          message: 'No se pudo procesar el documento' 
        });
        setShowResult(true);
      }
    } catch (err) {
      setIsLoadingOCR(false);
      setOcrResult({ success: false, message: 'Error al procesar' });
      setShowResult(true);
    }
  };

  return (
    <EtapaInformativa
      headerTitle="..."
      breadcrumbs={[...]}
      contentTitle="Carga de Documento"
      contentDescription={`Instrucciones...${
        archivoSubido ? `\n\n✅ Archivo: ${archivoSubido.name}` : ''
      }`}
      actionButton={{
        label: uploading ? 'Subiendo...' : (archivoSubido ? 'Cambiar' : 'Cargar'),
        icon: <UploadFileIcon />,
        onClick: handleCargarArchivo,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing || uploading}
    >
      <OCRLoadingModal open={isLoadingOCR} />
      <OCRResultModal
        open={showResult}
        tipo={ocrResult.success ? 'success' : 'error'}
        mensaje={ocrResult.message}
        onClose={() => setShowResult(false)}
      />
    </EtapaInformativa>
  );
};
```

### Patrón 3: Vista con Formulario Personalizado

**Caso de uso**: Capturar datos estructurados (Etapa 5 - Cotización)

```typescript
export const MiVistaFormulario = () => {
  // ... estados base del Patrón 1 ...
  const { usuario } = useAuth();
  const [etapaId, setEtapaId] = useState<number | null>(null);
  
  // Estados específicos del formulario
  const [campo1, setCampo1] = useState('');
  const [campo2, setCampo2] = useState('');
  const [items, setItems] = useState<MiItem[]>([...]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar workflowInstanciaId
        let wInstanciaId: number | null = null;
        
        if (instanciaId) {
          wInstanciaId = parseInt(instanciaId);
        } else if (solicitudId) {
          const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
          wInstanciaId = solicitud.workflow_instancia_id;
        }
        
        setWorkflowInstanciaId(wInstanciaId);
        
        if (wInstanciaId) {
          const instancia = await workflowService.getInstancia(wInstanciaId);
          setEtapaId(instancia.etapa_actual_id);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    loadData();
  }, [instanciaId, solicitudId]);

  const handleGuardar = async () => {
    if (!workflowInstanciaId || !etapaId) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';
      
      // Preparar respuestas
      const respuestas = {
        campo1,
        campo2,
        items_seleccionados: items.filter(i => i.checked)
      };

      await workflowService.completarEtapa(
        workflowInstanciaId,
        etapaId,
        respuestas,
        userPerfil
      );

      alert('Guardado exitosamente');
      
      // Redirigir
      const baseRoute = instanciaId ? `/workflows/${instanciaId}` : `/solicitudes/${solicitudId}`;
      navigate(`${baseRoute}/etapas`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EtapaInformativa
      headerTitle="..."
      breadcrumbs={[...]}
      contentTitle="Mi Formulario"
      contentDescription="Complete los campos..."
      readonly={isReadOnly}
      onCancel={handleCancelar}
      onNext={isReadOnly ? undefined : handleGuardar}
      cancelButtonText="Volver"
      nextButtonText="Guardar"
      nextButtonDisabled={loading}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Campo 1 */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 500 }}>
              Campo 1
            </Typography>
            <TextField
              fullWidth
              value={campo1}
              onChange={(e) => setCampo1(e.target.value)}
              disabled={isReadOnly}
              placeholder="Ingrese valor"
            />
          </Box>

          {/* Campo 2 */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 500 }}>
              Campo 2
            </Typography>
            <TextField
              fullWidth
              value={campo2}
              onChange={(e) => setCampo2(e.target.value)}
              disabled={isReadOnly}
            />
          </Box>

          {/* Lista de items */}
          <Box>
            <Typography sx={{ mb: 2, fontWeight: 500 }}>
              Seleccione items
            </Typography>
            {items.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={item.checked}
                    onChange={() => handleToggleItem(item.id)}
                    disabled={isReadOnly}
                  />
                }
                label={item.label}
              />
            ))}
          </Box>
        </Box>
      }
    />
  );
};
```

---

## 📚 Vistas Implementadas (Referencia)

### Vista 1: Descarga de Requisitos

**Ruta**: `/solicitudes/:id/descarga-requisitos`  
**Tipo**: Informativa con descarga  
**Características**:
- Botón de descarga de PDF
- Auto-completa etapas 1, 2 y 3 al hacer clic en "Siguiente"
- Modo readonly con query param `?readonly=true`

**Props EtapaInformativa**:
```typescript
{
  headerTitle: "Permiso de Protección de Seguridad Humanitaria",
  contentTitle: "Requisitos del trámite PPSH",
  actionButton: {
    label: 'Requisitos PPSH',
    icon: <FileDownloadIcon />,
    onClick: handleDescargar
  }
}
```

### Vista 2: Carga de Poder General

**Ruta**: `/solicitudes/:id/carga-poder`  
**Tipo**: Carga de archivo + OCR  
**Características**:
- Upload de documento (PDF, DOC, DOCX)
- Validación de tamaño (10MB máx)
- Procesamiento OCR simulado (2.5s, 80% éxito)
- Modales OCR (loading y resultado)
- Muestra nombre del archivo subido

**Estados adicionales**:
```typescript
const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
const [documentoId, setDocumentoId] = useState<number | null>(null);
const [uploading, setUploading] = useState(false);
const [isLoadingOCR, setIsLoadingOCR] = useState(false);
const [showResult, setShowResult] = useState(false);
```

### Vista 3: Carga de Solicitud Firmada

**Ruta**: `/solicitudes/:id/carga-documentos`  
**Tipo**: Carga de archivo + OCR  
**Características**:
- Similar a Vista 2 (carga de poder)
- Acepta imágenes y PDFs
- Mismo flujo de OCR
- Permite continuar sin archivo (modo desarrollo)

**Diferencias con Vista 2**:
- `accept: 'image/*,.pdf'` (permite imágenes)
- Tipo de documento: "Fotos Carnet"

### Vista 4: Revisión de Requisitos

**Ruta**: `/solicitudes/:id/revision`  
**Tipo**: Vista compleja (NO usa EtapaInformativa)  
**Características**:
- UI totalmente personalizada
- Tabla de checklist de documentos
- Tarjeta de resumen del solicitante
- Radio buttons para resultados OCR
- Integración con API de documentos
- Estados complejos de validación

**Componentes únicos**:
- `DocumentChecklistTable`
- `SolicitudSummaryCard`
- Gestión manual de breadcrumbs y layout

### Vista 5: Cotización

**Ruta**: `/solicitudes/:id/cotizacion`  
**Tipo**: Formulario personalizado  
**Características**:
- Checkboxes para items de cotización
- Campo de fecha (DatePicker)
- Campo de texto (Responsable)
- Botón de impresión
- Cálculo automático de total
- Modo readonly respetado en todos los campos

**Props EtapaInformativa**:
```typescript
{
  headerTitle: "Permiso de Protección de Seguridad Humanitaria",
  contentTitle: "Cotización",
  cancelButtonText: "Volver",
  nextButtonText: "Guardar",
  customContent: <Box>...</Box>  // Formulario completo
}
```

**Estados del formulario**:
```typescript
interface CotizacionItem {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  checked: boolean;
}

const [items, setItems] = useState<CotizacionItem[]>([...]);
const [fecha, setFecha] = useState('');
const [responsable, setResponsable] = useState('');
```

---

## ✅ Checklist de Implementación

### Antes de empezar

- [ ] Definir número de etapa y código (ej: `VISTA_6_MI_ETAPA`)
- [ ] Identificar tipo de vista (informativa / formulario / carga archivo)
- [ ] Revisar diseño de Figma (si aplica)
- [ ] Verificar configuración en base de datos (workflow_etapa, workflow_pregunta)

### Código básico

- [ ] Crear archivo `MiVista.tsx` en `/pages/`
- [ ] Importar dependencias necesarias:
  - `useParams`, `useNavigate`, `useSearchParams` de react-router-dom
  - `EtapaInformativa` de components/workflow
  - `workflowService`, `ppshService`
  - Material-UI components según necesidad
- [ ] Definir interfaces TypeScript si hay estructuras de datos complejas
- [ ] Implementar estados base:
  - `loading`, `error`, `completing`
  - `workflowInstanciaId`, `instancia`
  - `readonly` desde searchParams

### Lógica de carga

- [ ] Implementar `useEffect` para cargar datos iniciales
- [ ] Manejar ambos casos: `instanciaId` directo o `solicitudId`
- [ ] Obtener `workflow_instancia_id` desde PPSH si es necesario
- [ ] Cargar datos de la instancia con `workflowService.getInstancia()`
- [ ] Manejar errores de carga

### Handlers

- [ ] Implementar `handleCancelar()`:
  - Determinar ruta base (solicitudes vs workflows)
  - Navegar a `/etapas`
- [ ] Implementar `handleSiguiente()` o `handleGuardar()`:
  - Validar que existan IDs necesarios
  - Preparar objeto de respuestas según preguntas configuradas
  - Llamar `workflowService.completarEtapa()`
  - Manejar éxito (navegación) y errores
- [ ] Implementar handlers específicos (carga archivo, toggle items, etc.)

### UI con EtapaInformativa

- [ ] Configurar props obligatorias:
  - `headerTitle`
  - `breadcrumbs`
  - `contentTitle`
  - `contentDescription`
  - `onCancel`
- [ ] Configurar props opcionales según necesidad:
  - `contentSubtitle`
  - `actionButton`
  - `customContent`
  - `cancelButtonText` / `nextButtonText`
  - `onNext` (undefined si readonly)
- [ ] Pasar estados:
  - `loading`
  - `completing`
  - `error`
  - `readonly`

### Routing

- [ ] Agregar rutas en `AppRouter.tsx`:
  ```typescript
  <Route path="/solicitudes/:id/mi-vista" element={<MiVista />} />
  <Route path="/workflows/:instanciaId/mi-vista" element={<MiVista />} />
  ```
- [ ] Actualizar `WorkflowEtapas.tsx` si corresponde:
  ```typescript
  else if (etapaOrden === N) {
    navigate(`${baseRoute}/mi-vista${readonlyParam}`);
  }
  ```

### Testing

- [ ] Probar modo normal: `/solicitudes/:id/mi-vista`
- [ ] Probar modo readonly: `/solicitudes/:id/mi-vista?readonly=true`
- [ ] Verificar carga de datos correcta
- [ ] Probar completar etapa y avanzar
- [ ] Verificar navegación de vuelta
- [ ] Comprobar estados de error
- [ ] Validar en diferentes perfiles de usuario

### Refinamiento

- [ ] Ajustar estilos según diseño de Figma
- [ ] Agregar validaciones de campos
- [ ] Optimizar UX (mensajes, loading states)
- [ ] Documentar código con comentarios JSDoc
- [ ] Revisar accesibilidad

---

## 💻 Código de Ejemplo Completo

### Vista Mínima Funcional

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';

/**
 * Vista para Etapa N: [Nombre de la Etapa]
 * 
 * Descripción de lo que hace esta vista...
 */
export const MiNuevaVista = () => {
  // Parámetros de ruta
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';
  
  // Estados base
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [instancia, setInstancia] = useState<any>(null);

  // Cargar datos al montar
  useEffect(() => {
    loadWorkflowInstance();
  }, [instanciaId, solicitudId]);

  const loadWorkflowInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      let numericId: number;

      if (instanciaId) {
        numericId = parseInt(instanciaId);
      } else if (solicitudId) {
        const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
        if (!solicitud.workflow_instancia_id) {
          throw new Error('La solicitud no tiene workflow asociado');
        }
        numericId = solicitud.workflow_instancia_id;
      } else {
        throw new Error('No se proporcionó instanciaId ni solicitudId');
      }

      setWorkflowInstanciaId(numericId);
      const instanciaData = await workflowService.getInstancia(numericId);
      setInstancia(instanciaData);
    } catch (err: any) {
      console.error('Error cargando instancia:', err);
      setError(err.message || 'Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !instancia) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    setCompleting(true);
    setError(null);

    try {
      // Preparar respuestas según las preguntas configuradas en la base de datos
      const respuestas = {
        MI_CAMPO: 'valor',
        // ... más campos según configuración
      };

      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        respuestas,
        'CIUDADANO'  // o 'FUNCIONARIO' / 'ADMIN' según contexto
      );

      console.log('Etapa completada exitosamente');
      
      // Redirigir a vista de etapas
      const baseParam = solicitudId || instanciaId || workflowInstanciaId;
      const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
      navigate(`${basePath}/etapas`);
      
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      setError(err.response?.data?.detail || 'Error al completar la etapa');
    } finally {
      setCompleting(false);
    }
  };

  const handleAccionPrincipal = () => {
    console.log('Ejecutando acción principal...');
    // Implementar lógica específica (descarga, modal, etc.)
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Mi Etapa' },
      ]}
      contentTitle="Título de Mi Etapa"
      contentDescription="Descripción detallada de lo que debe hacer el usuario en esta etapa. Incluir instrucciones claras y concisas."
      contentSubtitle="Información adicional o requisitos"
      actionButton={{
        label: 'Acción Principal',
        icon: <FileDownloadIcon />,
        onClick: handleAccionPrincipal,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing}
      error={error}
    />
  );
};
```

---

## 🔧 Servicios y Utilidades

### workflowService

```typescript
// Obtener instancia de workflow
const instancia = await workflowService.getInstancia(instanciaId);

// Completar etapa
await workflowService.completarEtapa(
  instanciaId: number,
  etapaId: number,
  respuestas: Record<string, any>,
  userPerfil: string,
  archivos?: Record<string, any>
);

// Subir documento
const resultado = await workflowService.subirDocumentoEtapa(
  solicitudId: number,
  file: File,
  data?: {
    cod_tipo_documento?: number;
    tipo_documento_texto?: string;
    observaciones?: string;
  }
);
```

### ppshService

```typescript
// Obtener solicitud (incluye workflow_instancia_id)
const solicitud = await ppshService.getSolicitud(solicitudId);

// Obtener documentos de una solicitud
const docs = await ppshService.getDocumentos(solicitudId);

// Obtener tipos de documento
const tipos = await ppshService.getTiposDocumento();
```

---

## 🎨 Guía de Estilos

### Colores

```typescript
const theme = {
  primary: '#0e5fa6',      // Azul principal (header, botones)
  secondary: '#333333',    // Gris oscuro (texto)
  border: '#d0d0d0',       // Gris claro (bordes)
  borderHover: '#333333',  // Gris oscuro (bordes hover)
  borderFocus: '#0e5fa6',  // Azul (bordes focus)
  background: '#ffffff',   // Blanco (fondo)
  error: '#d32f2f',        // Rojo (errores)
  success: '#2e7d32',      // Verde (éxito)
};
```

### Tipografía

```typescript
const typography = {
  headerTitle: '64px',     // Título del header
  contentTitle: '48px',    // Título del contenido
  subtitle: '24px',        // Subtítulos
  body: '16px',            // Texto normal
  fontFamily: 'Roboto',    // Font principal
};
```

### Espaciados

```typescript
const spacing = {
  fieldHeight: 56,         // Altura de inputs
  buttonHeight: 40,        // Altura de botones
  borderRadius: '4px',     // Radio de bordes estándar
  gap: 3,                  // Gap entre elementos (24px)
  padding: 2,              // Padding interno (16px)
};
```

### Campos de Texto (TextField)

```typescript
<TextField
  fullWidth
  value={valor}
  onChange={(e) => setValor(e.target.value)}
  disabled={isReadOnly}
  placeholder="Texto de ayuda"
  sx={{
    '& .MuiOutlinedInput-root': {
      height: 56,
      borderRadius: '4px',
      fontFamily: 'Roboto',
      fontSize: 16,
      backgroundColor: '#ffffff',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderWidth: '1px',
        borderRadius: '4px',
      },
      '&:hover fieldset': {
        borderColor: '#333333',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#0e5fa6',
        borderWidth: '2px',
      },
    },
  }}
/>
```

---

## 📝 Convenciones de Código

### Nomenclatura

```typescript
// Componentes: PascalCase
export const MiVista = () => {};

// Estados: camelCase descriptivo
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState(null);

// Handlers: prefijo 'handle'
const handleSubmit = () => {};
const handleFileUpload = () => {};

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc'];
```

### Comentarios

```typescript
/**
 * Descripción del componente
 * 
 * Explicación detallada de su propósito y funcionamiento.
 * 
 * @example
 * <MiComponente param1="valor" />
 */

// Comentario de línea para explicaciones breves
```

### Manejo de Errores

```typescript
try {
  await operacion();
} catch (err: any) {
  console.error('Contexto del error:', err);
  setError(err.response?.data?.detail || err.message || 'Error desconocido');
}
```

---

## 🔍 Debugging y Troubleshooting

### Problemas Comunes

**1. "No se pudo identificar la instancia"**
- Verificar que `solicitud.workflow_instancia_id` existe
- Revisar que la solicitud tenga workflow asociado en BD

**2. Error 400 al completar etapa**
- Revisar que las respuestas coincidan con las preguntas configuradas
- Verificar códigos de preguntas en tabla `workflow_pregunta`

**3. Modal no se muestra**
- Verificar que el componente hijo esté dentro de `<EtapaInformativa>`
- Comprobar estados `open` de los modales

**4. Readonly no funciona**
- Verificar `useSearchParams()` está importado
- Confirmar que `readonly` se pasa a `EtapaInformativa`
- Revisar que campos tengan prop `disabled={isReadOnly}`

### Logs Útiles

```typescript
// Al cargar datos
console.log('Instancia cargada:', instancia);
console.log('Etapa actual ID:', instancia.etapa_actual_id);

// Al completar etapa
console.log('Completando etapa:', etapaId);
console.log('Respuestas:', respuestas);

// Verificar parámetros
console.log('SolicitudId:', solicitudId);
console.log('InstanciaId:', instanciaId);
console.log('Readonly:', readonly);
```

---

## 📚 Referencias Adicionales

### Documentación del Sistema

- `SISTEMA_WORKFLOWS_IMPLEMENTADO.md` - Arquitectura general
- `SISTEMA_VISTAS_DINAMICAS_IMPLEMENTADO.md` - Vistas dinámicas
- `docs/Workflow/WORKFLOW_DINAMICO_DESIGN.md` - Diseño técnico

### Componentes Relacionados

- `EtapaInformativa.tsx` - Componente base
- `WorkflowEtapas.tsx` - Lista de etapas
- `OCRLoadingModal.tsx` - Modal de carga OCR
- `OCRResultModal.tsx` - Modal de resultado OCR

### APIs

- `GET /api/v1/workflow/instancias/{id}` - Obtener instancia
- `POST /api/v1/workflow/instancias/{id}/etapas/{etapaId}/ejecutar` - Completar etapa
- `GET /api/v1/ppsh/solicitudes/{id}` - Obtener solicitud
- `POST /api/v1/ppsh/solicitudes/{id}/documentos` - Subir documento

---

## ✨ Buenas Prácticas

1. **Siempre manejar ambos casos**: `solicitudId` e `instanciaId`
2. **Validar antes de ejecutar acciones**: Verificar que existan IDs necesarios
3. **Feedback al usuario**: Loading states, mensajes de éxito/error
4. **Modo readonly**: Respetar en todos los campos interactivos
5. **Console logs**: Incluir logs informativos para debugging
6. **Manejo de errores**: Try-catch con mensajes descriptivos
7. **Navegación consistente**: Siempre volver a `/etapas` después de completar
8. **Validaciones de archivo**: Tamaño y extensiones permitidas
9. **Estados iniciales**: Setear valores por defecto apropiados
10. **TypeScript**: Usar interfaces para estructuras de datos complejas

---

## 📅 Historial de Cambios

- **2025-11-24**: Documento inicial creado
  - Documentadas 5 vistas implementadas
  - Patrones de implementación definidos
  - Ejemplos de código completos

---

**Última actualización**: 24 de noviembre de 2025  
**Versión**: 1.0.0  
**Autor**: Sistema de Documentación Automática
