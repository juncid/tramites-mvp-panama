# 🚀 Plan de Implementación - Mini CMS de Vistas Dinámicas

## 📅 Timeline General

**Duración Estimada:** 5-6 semanas  
**Inicio:** Noviembre 13, 2025  
**Metodología:** Desarrollo iterativo con entregables funcionales cada semana

---

## 🎯 Objetivos del Proyecto

1. ✅ Permitir configurar vistas dinámicas sin escribir código
2. ✅ Reutilizar layout común entre todos los flujos
3. ✅ Asociar componentes a preguntas del workflow
4. ✅ Renderizar interfaces personalizadas por etapa/actividad
5. ✅ Soportar 20+ tipos de componentes configurables

---

## 📋 FASE 1: Foundation & Backend (Semana 1)

### DÍA 1 (Nov 13) - Setup de Base de Datos

#### Tarea 1.1: Diseñar Esquema de Base de Datos
**Duración:** 2 horas  
**Responsable:** Backend Developer

**Archivos a crear:**
```
backend/alembic/versions/XXX_crear_tablas_vistas_dinamicas.py
```

**Tablas a crear:**

1. **`workflow_vistas_config`**
   ```sql
   CREATE TABLE workflow_vistas_config (
       id SERIAL PRIMARY KEY,
       etapa_id INTEGER REFERENCES workflow_etapas(id) ON DELETE CASCADE,
       layout_tipo VARCHAR(50) DEFAULT 'SIMPLE',
       titulo_vista VARCHAR(255),
       descripcion_vista TEXT,
       mostrar_breadcrumbs BOOLEAN DEFAULT true,
       mostrar_timeline BOOLEAN DEFAULT false,
       config_json JSONB,
       activo BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       created_by VARCHAR(100),
       updated_by VARCHAR(100)
   );
   
   CREATE INDEX idx_vistas_etapa ON workflow_vistas_config(etapa_id);
   ```

2. **`workflow_vistas_secciones`**
   ```sql
   CREATE TABLE workflow_vistas_secciones (
       id SERIAL PRIMARY KEY,
       vista_config_id INTEGER REFERENCES workflow_vistas_config(id) ON DELETE CASCADE,
       codigo VARCHAR(100) NOT NULL,
       titulo VARCHAR(255) NOT NULL,
       descripcion TEXT,
       orden INTEGER NOT NULL,
       columna INTEGER DEFAULT 1,
       ancho INTEGER DEFAULT 12,
       icono VARCHAR(50),
       color_fondo VARCHAR(20),
       mostrar_borde BOOLEAN DEFAULT true,
       colapsable BOOLEAN DEFAULT false,
       visible_para_perfiles JSONB,
       visible_en_estados JSONB,
       activo BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX idx_secciones_vista ON workflow_vistas_secciones(vista_config_id);
   CREATE INDEX idx_secciones_orden ON workflow_vistas_secciones(vista_config_id, orden);
   ```

3. **`workflow_vistas_componentes`**
   ```sql
   CREATE TABLE workflow_vistas_componentes (
       id SERIAL PRIMARY KEY,
       seccion_id INTEGER REFERENCES workflow_vistas_secciones(id) ON DELETE CASCADE,
       codigo VARCHAR(100) NOT NULL,
       tipo VARCHAR(50) NOT NULL,
       orden INTEGER NOT NULL,
       fuente_datos VARCHAR(50) DEFAULT 'PREGUNTA',
       pregunta_id INTEGER REFERENCES workflow_preguntas(id),
       campo_proceso VARCHAR(100),
       config_json JSONB NOT NULL DEFAULT '{}',
       es_obligatorio BOOLEAN DEFAULT false,
       es_editable BOOLEAN DEFAULT true,
       es_visible BOOLEAN DEFAULT true,
       dependencias_json JSONB,
       validaciones_json JSONB,
       activo BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX idx_componentes_seccion ON workflow_vistas_componentes(seccion_id);
   CREATE INDEX idx_componentes_pregunta ON workflow_vistas_componentes(pregunta_id);
   CREATE INDEX idx_componentes_orden ON workflow_vistas_componentes(seccion_id, orden);
   ```

**Comandos:**
```bash
cd backend
alembic revision --autogenerate -m "crear_tablas_vistas_dinamicas"
alembic upgrade head
```

**Validación:**
```bash
# Verificar que las tablas existen
psql -U postgres -d tramites_panama -c "\dt workflow_vistas*"
```

---

#### Tarea 1.2: Crear Modelos SQLAlchemy
**Duración:** 2 horas

**Archivos a crear:**
```
backend/app/models/vista_dinamica.py
```

**Contenido:** Ver archivo completo con VistaConfig, VistaSeccion, VistaComponente

**Actualizar:**
```
backend/app/models/__init__.py
```

**Validación:**
```bash
cd backend
python -c "from app.models.vista_dinamica import VistaConfig; print('OK')"
```

---

#### Tarea 1.3: Crear Schemas Pydantic
**Duración:** 1.5 horas

**Archivos a crear:**
```
backend/app/schemas/vista_dinamica.py
```

**Contenido:**
```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Enums
class LayoutTipo(str):
    SIMPLE = "SIMPLE"
    DOS_COLUMNAS = "DOS_COLUMNAS"
    TRES_COLUMNAS = "TRES_COLUMNAS"
    TABS = "TABS"

class FuenteDatos(str):
    PREGUNTA = "PREGUNTA"
    PROCESO = "PROCESO"
    SOLICITUD = "SOLICITUD"
    ESTATICO = "ESTATICO"
    API = "API"

# Componente
class ComponenteBase(BaseModel):
    codigo: str
    tipo: str
    orden: int
    fuente_datos: FuenteDatos = FuenteDatos.PREGUNTA
    pregunta_id: Optional[int] = None
    campo_proceso: Optional[str] = None
    config_json: Dict[str, Any] = {}
    es_obligatorio: bool = False
    es_editable: bool = True
    es_visible: bool = True
    dependencias_json: Optional[Dict[str, Any]] = None
    validaciones_json: Optional[Dict[str, Any]] = None

class ComponenteCreate(ComponenteBase):
    seccion_id: Optional[int] = None

class ComponenteUpdate(BaseModel):
    codigo: Optional[str] = None
    tipo: Optional[str] = None
    orden: Optional[int] = None
    fuente_datos: Optional[FuenteDatos] = None
    pregunta_id: Optional[int] = None
    config_json: Optional[Dict[str, Any]] = None
    es_obligatorio: Optional[bool] = None
    es_editable: Optional[bool] = None

class Componente(ComponenteBase):
    id: int
    seccion_id: int
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Seccion
class SeccionBase(BaseModel):
    codigo: str
    titulo: str
    descripcion: Optional[str] = None
    orden: int
    columna: int = 1
    ancho: int = 12
    icono: Optional[str] = None
    color_fondo: Optional[str] = None
    mostrar_borde: bool = True
    colapsable: bool = False
    visible_para_perfiles: Optional[List[str]] = None
    visible_en_estados: Optional[List[str]] = None

class SeccionCreate(SeccionBase):
    vista_config_id: Optional[int] = None
    componentes: List[ComponenteCreate] = []

class SeccionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    orden: Optional[int] = None
    columna: Optional[int] = None
    ancho: Optional[int] = None
    colapsable: Optional[bool] = None

class Seccion(SeccionBase):
    id: int
    vista_config_id: int
    activo: bool
    componentes: List[Componente] = []
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Vista Config
class VistaConfigBase(BaseModel):
    layout_tipo: str = "SIMPLE"
    titulo_vista: Optional[str] = None
    descripcion_vista: Optional[str] = None
    mostrar_breadcrumbs: bool = True
    mostrar_timeline: bool = False
    config_json: Optional[Dict[str, Any]] = None

class VistaConfigCreate(VistaConfigBase):
    etapa_id: int
    secciones: List[SeccionCreate] = []

class VistaConfigUpdate(BaseModel):
    layout_tipo: Optional[str] = None
    titulo_vista: Optional[str] = None
    descripcion_vista: Optional[str] = None
    mostrar_breadcrumbs: Optional[bool] = None
    mostrar_timeline: Optional[bool] = None
    config_json: Optional[Dict[str, Any]] = None

class VistaConfig(VistaConfigBase):
    id: int
    etapa_id: int
    activo: bool
    secciones: List[Seccion] = []
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    updated_by: Optional[str]
    
    class Config:
        from_attributes = True
```

**Actualizar:**
```
backend/app/schemas/__init__.py
```

**Validación:**
```bash
python -c "from app.schemas.vista_dinamica import VistaConfig; print('OK')"
```

---

### DÍA 2 (Nov 14) - API Backend

#### Tarea 2.1: Crear CRUD Service
**Duración:** 3 horas

**Archivos a crear:**
```
backend/app/services/vista_config.service.py
```

**Funciones principales:**
```python
class VistaConfigService:
    def get_by_etapa_id(etapa_id: int) -> VistaConfig
    def create_vista_config(data: VistaConfigCreate) -> VistaConfig
    def update_vista_config(id: int, data: VistaConfigUpdate) -> VistaConfig
    def delete_vista_config(id: int) -> bool
    
    def create_seccion(data: SeccionCreate) -> Seccion
    def update_seccion(id: int, data: SeccionUpdate) -> Seccion
    def delete_seccion(id: int) -> bool
    def reorder_secciones(vista_id: int, orden_ids: List[int]) -> bool
    
    def create_componente(data: ComponenteCreate) -> Componente
    def update_componente(id: int, data: ComponenteUpdate) -> Componente
    def delete_componente(id: int) -> bool
    def reorder_componentes(seccion_id: int, orden_ids: List[int]) -> bool
```

---

#### Tarea 2.2: Crear Endpoints REST
**Duración:** 3 horas

**Archivos a crear:**
```
backend/app/routes/vista_config.py
```

**Endpoints:**
```python
# Vistas Config
GET    /api/v1/workflow/etapas/{etapa_id}/vista-config
POST   /api/v1/workflow/vistas-config
PUT    /api/v1/workflow/vistas-config/{id}
DELETE /api/v1/workflow/vistas-config/{id}

# Secciones
POST   /api/v1/workflow/vistas-config/{vista_id}/secciones
PUT    /api/v1/workflow/secciones/{id}
DELETE /api/v1/workflow/secciones/{id}
POST   /api/v1/workflow/vistas-config/{vista_id}/secciones/reorder

# Componentes
POST   /api/v1/workflow/secciones/{seccion_id}/componentes
PUT    /api/v1/workflow/componentes/{id}
DELETE /api/v1/workflow/componentes/{id}
POST   /api/v1/workflow/secciones/{seccion_id}/componentes/reorder
```

**Actualizar:**
```
backend/app/main.py
```
```python
from app.routes import vista_config
app.include_router(vista_config.router, prefix="/api/v1/workflow", tags=["vistas-dinamicas"])
```

**Validación:**
```bash
# Iniciar servidor
uvicorn app.main:app --reload

# Test endpoint
curl http://localhost:8000/api/v1/workflow/etapas/1/vista-config
```

---

### DÍA 3 (Nov 15) - Frontend Types & Service

#### Tarea 3.1: Definir Tipos TypeScript
**Duración:** 2 horas

**Archivos a crear:**
```
frontend/src/types/dynamic-views.ts
```

**Contenido:**
```typescript
export type LayoutTipo = 'SIMPLE' | 'DOS_COLUMNAS' | 'TRES_COLUMNAS' | 'TABS';
export type FuenteDatos = 'PREGUNTA' | 'PROCESO' | 'SOLICITUD' | 'ESTATICO' | 'API';

export type TipoComponenteVista = 
  // Input
  | 'TEXTO_INPUT'
  | 'NUMERO_INPUT'
  | 'FECHA_PICKER'
  | 'SELECT_SIMPLE'
  | 'SELECT_MULTIPLE'
  | 'CHECKBOX'
  | 'RADIO_BUTTONS'
  | 'TEXTAREA'
  // Files
  | 'CARGA_ARCHIVOS'
  | 'DESCARGA_ARCHIVOS'
  | 'GALERIA_DOCUMENTOS'
  | 'VISOR_PDF'
  // Display
  | 'TEXTO_ESTATICO'
  | 'TITULO'
  | 'ALERTA'
  | 'CARD_INFO'
  | 'TABLA'
  | 'LISTA'
  | 'TIMELINE'
  // Actions
  | 'BOTON'
  | 'BOTON_DESCARGA'
  | 'BOTON_FIRMA'
  | 'BOTON_PAGO'
  | 'BOTON_IMPRIMIR'
  // Review
  | 'REVISION_DOCUMENTOS'
  | 'REVISION_OCR';

export interface ConfigComponente {
  label?: string;
  placeholder?: string;
  ayuda?: string;
  opciones?: OpcionComponente[];
  min?: number;
  max?: number;
  patron?: string;
  mensaje_error?: string;
  tipos_archivos_permitidos?: string[];
  tamaño_maximo_mb?: number;
  cantidad_maxima?: number;
  color?: string;
  icono?: string;
  variant?: string;
  [key: string]: any;
}

export interface OpcionComponente {
  valor: string | number;
  etiqueta: string;
  descripcion?: string;
  icono?: string;
  deshabilitada?: boolean;
}

export interface DependenciaComponente {
  componente_id: string;
  condicion: 'IGUAL' | 'DIFERENTE' | 'MAYOR' | 'MENOR' | 'CONTIENE' | 'NO_VACIO';
  valor: any;
}

export interface ComponenteVista {
  id?: number;
  codigo: string;
  tipo: TipoComponenteVista;
  orden: number;
  fuente_datos: FuenteDatos;
  pregunta_id?: number;
  campo_proceso?: string;
  config_json: ConfigComponente;
  es_obligatorio: boolean;
  es_editable: boolean;
  es_visible: boolean;
  dependencias_json?: DependenciaComponente[];
  validaciones_json?: any;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SeccionVista {
  id?: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  columna: number;
  ancho: number;
  icono?: string;
  color_fondo?: string;
  mostrar_borde: boolean;
  colapsable: boolean;
  visible_para_perfiles?: string[];
  visible_en_estados?: string[];
  componentes: ComponenteVista[];
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VistaConfig {
  id?: number;
  etapa_id: number;
  layout_tipo: LayoutTipo;
  titulo_vista?: string;
  descripcion_vista?: string;
  mostrar_breadcrumbs: boolean;
  mostrar_timeline: boolean;
  config_json?: any;
  secciones: SeccionVista[];
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// DTOs
export interface VistaConfigCreate extends Omit<VistaConfig, 'id' | 'created_at' | 'updated_at'> {}
export interface VistaConfigUpdate extends Partial<Omit<VistaConfig, 'id' | 'etapa_id'>> {}
export interface SeccionCreate extends Omit<SeccionVista, 'id' | 'created_at' | 'updated_at'> {}
export interface SeccionUpdate extends Partial<Omit<SeccionVista, 'id'>> {}
export interface ComponenteCreate extends Omit<ComponenteVista, 'id' | 'created_at' | 'updated_at'> {}
export interface ComponenteUpdate extends Partial<Omit<ComponenteVista, 'id'>> {}
```

---

#### Tarea 3.2: Crear Service API
**Duración:** 2 horas

**Archivos a crear:**
```
frontend/src/services/vista-config.service.ts
```

**Contenido:**
```typescript
import axios from 'axios';
import type { 
  VistaConfig, 
  VistaConfigCreate, 
  VistaConfigUpdate,
  SeccionVista,
  SeccionCreate,
  SeccionUpdate,
  ComponenteVista,
  ComponenteCreate,
  ComponenteUpdate
} from '../types/dynamic-views';

const API_BASE = '/api/v1/workflow';

export const vistaConfigService = {
  // Vista Config
  async getByEtapaId(etapaId: number): Promise<VistaConfig | null> {
    try {
      const response = await axios.get(`${API_BASE}/etapas/${etapaId}/vista-config`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  async create(data: VistaConfigCreate): Promise<VistaConfig> {
    const response = await axios.post(`${API_BASE}/vistas-config`, data);
    return response.data;
  },

  async update(id: number, data: VistaConfigUpdate): Promise<VistaConfig> {
    const response = await axios.put(`${API_BASE}/vistas-config/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/vistas-config/${id}`);
  },

  // Secciones
  async createSeccion(vistaId: number, data: SeccionCreate): Promise<SeccionVista> {
    const response = await axios.post(`${API_BASE}/vistas-config/${vistaId}/secciones`, data);
    return response.data;
  },

  async updateSeccion(id: number, data: SeccionUpdate): Promise<SeccionVista> {
    const response = await axios.put(`${API_BASE}/secciones/${id}`, data);
    return response.data;
  },

  async deleteSeccion(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/secciones/${id}`);
  },

  async reorderSecciones(vistaId: number, ordenIds: number[]): Promise<void> {
    await axios.post(`${API_BASE}/vistas-config/${vistaId}/secciones/reorder`, { orden_ids: ordenIds });
  },

  // Componentes
  async createComponente(seccionId: number, data: ComponenteCreate): Promise<ComponenteVista> {
    const response = await axios.post(`${API_BASE}/secciones/${seccionId}/componentes`, data);
    return response.data;
  },

  async updateComponente(id: number, data: ComponenteUpdate): Promise<ComponenteVista> {
    const response = await axios.put(`${API_BASE}/componentes/${id}`, data);
    return response.data;
  },

  async deleteComponente(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/componentes/${id}`);
  },

  async reorderComponentes(seccionId: number, ordenIds: number[]): Promise<void> {
    await axios.post(`${API_BASE}/secciones/${seccionId}/componentes/reorder`, { orden_ids: ordenIds });
  },
};
```

**Validación:**
```typescript
// Test en consola de navegador
import { vistaConfigService } from './services/vista-config.service';
const vista = await vistaConfigService.getByEtapaId(1);
console.log(vista);
```

---

### DÍA 4-5 (Nov 16-17) - Componentes Base del Renderer

#### Tarea 4.1: Crear Componente DynamicViewRenderer
**Duración:** 4 horas

**Archivos a crear:**
```
frontend/src/components/DynamicView/DynamicViewRenderer.tsx
```

**Estructura básica:**
```tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Grid, CircularProgress } from '@mui/material';
import { WorkflowEtapa } from '../../types/workflow';
import { VistaConfig } from '../../types/dynamic-views';
import { vistaConfigService } from '../../services/vista-config.service';
import { SeccionRenderer } from './SeccionRenderer';
import { DefaultView } from './DefaultView';

interface DynamicViewRendererProps {
  etapa: WorkflowEtapa;
  proceso?: any;
  onSubmit?: (data: any) => void;
  readonly?: boolean;
}

export const DynamicViewRenderer: React.FC<DynamicViewRendererProps> = ({
  etapa,
  proceso,
  onSubmit,
  readonly = false,
}) => {
  const [vistaConfig, setVistaConfig] = useState<VistaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadVistaConfig();
  }, [etapa.id]);

  const loadVistaConfig = async () => {
    if (!etapa.id) return;
    
    try {
      setLoading(true);
      const config = await vistaConfigService.getByEtapaId(etapa.id);
      setVistaConfig(config);
    } catch (error) {
      console.error('Error cargando vista config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (componenteId: string, value: any) => {
    setFormData(prev => ({ ...prev, [componenteId]: value }));
    // Limpiar error si existe
    if (errors[componenteId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[componenteId];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validar
    const newErrors: Record<string, string> = {};
    // TODO: Implementar validaciones
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit?.(formData);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay configuración, usar vista por defecto
  if (!vistaConfig) {
    return <DefaultView etapa={etapa} proceso={proceso} onSubmit={onSubmit} />;
  }

  const renderLayout = () => {
    switch (vistaConfig.layout_tipo) {
      case 'SIMPLE':
        return (
          <Stack spacing={3}>
            {vistaConfig.secciones
              .sort((a, b) => a.orden - b.orden)
              .map(seccion => (
                <SeccionRenderer
                  key={seccion.id || seccion.codigo}
                  seccion={seccion}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  readonly={readonly}
                />
              ))}
          </Stack>
        );

      case 'DOS_COLUMNAS':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {vistaConfig.secciones
                .filter(s => s.columna === 1)
                .sort((a, b) => a.orden - b.orden)
                .map(seccion => (
                  <SeccionRenderer
                    key={seccion.id || seccion.codigo}
                    seccion={seccion}
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    readonly={readonly}
                  />
                ))}
            </Grid>
            <Grid item xs={12} md={6}>
              {vistaConfig.secciones
                .filter(s => s.columna === 2)
                .sort((a, b) => a.orden - b.orden)
                .map(seccion => (
                  <SeccionRenderer
                    key={seccion.id || seccion.codigo}
                    seccion={seccion}
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    readonly={readonly}
                  />
                ))}
            </Grid>
          </Grid>
        );

      default:
        return <Typography>Layout no soportado: {vistaConfig.layout_tipo}</Typography>;
    }
  };

  return (
    <Box>
      {/* Título */}
      <Typography variant="h4" sx={{ mb: 2 }}>
        {vistaConfig.titulo_vista || etapa.nombre}
      </Typography>

      {/* Descripción */}
      {vistaConfig.descripcion_vista && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {vistaConfig.descripcion_vista}
        </Typography>
      )}

      {/* Layout dinámico */}
      {renderLayout()}
    </Box>
  );
};
```

---

#### Tarea 4.2: Crear SeccionRenderer y ComponenteRenderer
**Duración:** 3 horas

**Archivos a crear:**
```
frontend/src/components/DynamicView/SeccionRenderer.tsx
frontend/src/components/DynamicView/ComponenteRenderer.tsx
```

**SeccionRenderer.tsx:**
```tsx
import React from 'react';
import { Card, CardHeader, CardContent, Grid, Collapse, IconButton } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { SeccionVista } from '../../types/dynamic-views';
import { ComponenteRenderer } from './ComponenteRenderer';

interface SeccionRendererProps {
  seccion: SeccionVista;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onChange: (componenteId: string, value: any) => void;
  readonly?: boolean;
}

export const SeccionRenderer: React.FC<SeccionRendererProps> = ({
  seccion,
  formData,
  errors,
  onChange,
  readonly = false,
}) => {
  const [expanded, setExpanded] = React.useState(!seccion.colapsable);

  const renderComponentes = () => {
    return seccion.componentes
      .filter(c => c.es_visible)
      .sort((a, b) => a.orden - b.orden)
      .map(componente => (
        <Grid 
          item 
          xs={12} 
          sm={componente.config_json.ancho || 12}
          key={componente.id || componente.codigo}
        >
          <ComponenteRenderer
            componente={componente}
            value={formData[componente.codigo]}
            onChange={(value) => onChange(componente.codigo, value)}
            error={errors[componente.codigo]}
            readonly={readonly || !componente.es_editable}
          />
        </Grid>
      ));
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        border: seccion.mostrar_borde ? 1 : 0,
        borderColor: 'divider',
        bgcolor: seccion.color_fondo || 'background.paper',
      }}
    >
      <CardHeader
        title={seccion.titulo}
        subheader={seccion.descripcion}
        action={
          seccion.colapsable ? (
            <IconButton onClick={() => setExpanded(!expanded)}>
              <ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </IconButton>
          ) : null
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Grid container spacing={2}>
            {renderComponentes()}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};
```

**ComponenteRenderer.tsx:**
```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { ComponenteVista } from '../../types/dynamic-views';
import { COMPONENTE_MAP } from './components/ComponenteMap';

interface ComponenteRendererProps {
  componente: ComponenteVista;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readonly?: boolean;
}

export const ComponenteRenderer: React.FC<ComponenteRendererProps> = ({
  componente,
  value,
  onChange,
  error,
  readonly = false,
}) => {
  const Component = COMPONENTE_MAP[componente.tipo];

  if (!Component) {
    return (
      <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
        <Typography color="error">
          Componente no encontrado: {componente.tipo}
        </Typography>
      </Box>
    );
  }

  return (
    <Component
      config={componente.config_json}
      value={value}
      onChange={onChange}
      readonly={readonly}
      error={error}
      required={componente.es_obligatorio}
    />
  );
};
```

---

#### Tarea 4.3: Crear 5 Componentes Básicos
**Duración:** 5 horas (1 hora cada uno)

**Archivos a crear:**
```
frontend/src/components/DynamicView/components/
├── ComponenteMap.tsx
├── Input/
│   ├── TextInput.tsx
│   ├── NumberInput.tsx
│   └── DatePicker.tsx
├── Select/
│   ├── SelectSimple.tsx
│   └── SelectMultiple.tsx
└── File/
    └── FileUpload.tsx
```

**ComponenteMap.tsx:**
```tsx
import React from 'react';
import { TipoComponenteVista } from '../../../types/dynamic-views';
import { TextInput } from './Input/TextInput';
import { NumberInput } from './Input/NumberInput';
import { DatePicker } from './Input/DatePicker';
import { SelectSimple } from './Select/SelectSimple';
import { FileUpload } from './File/FileUpload';

export interface ComponenteProps {
  config: any;
  value: any;
  onChange: (value: any) => void;
  readonly?: boolean;
  error?: string;
  required?: boolean;
}

export const COMPONENTE_MAP: Record<TipoComponenteVista, React.FC<ComponenteProps>> = {
  TEXTO_INPUT: TextInput,
  NUMERO_INPUT: NumberInput,
  FECHA_PICKER: DatePicker,
  SELECT_SIMPLE: SelectSimple,
  CARGA_ARCHIVOS: FileUpload,
  
  // Placeholders para otros tipos (implementar en Fase 3)
  SELECT_MULTIPLE: TextInput, // Temporal
  CHECKBOX: TextInput,
  RADIO_BUTTONS: TextInput,
  TEXTAREA: TextInput,
  DESCARGA_ARCHIVOS: TextInput,
  GALERIA_DOCUMENTOS: TextInput,
  VISOR_PDF: TextInput,
  TEXTO_ESTATICO: TextInput,
  TITULO: TextInput,
  ALERTA: TextInput,
  CARD_INFO: TextInput,
  TABLA: TextInput,
  LISTA: TextInput,
  TIMELINE: TextInput,
  BOTON: TextInput,
  BOTON_DESCARGA: TextInput,
  BOTON_FIRMA: TextInput,
  BOTON_PAGO: TextInput,
  BOTON_IMPRIMIR: TextInput,
  REVISION_DOCUMENTOS: TextInput,
  REVISION_OCR: TextInput,
} as any;
```

**TextInput.tsx:**
```tsx
import React from 'react';
import { TextField } from '@mui/material';
import { ComponenteProps } from '../ComponenteMap';

export const TextInput: React.FC<ComponenteProps> = ({
  config,
  value,
  onChange,
  readonly = false,
  error,
  required = false,
}) => {
  return (
    <TextField
      fullWidth
      label={config.label}
      placeholder={config.placeholder}
      helperText={error || config.ayuda}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={readonly}
      required={required}
      error={!!error}
      variant="outlined"
    />
  );
};
```

**NumberInput.tsx:**
```tsx
import React from 'react';
import { TextField } from '@mui/material';
import { ComponenteProps } from '../ComponenteMap';

export const NumberInput: React.FC<ComponenteProps> = ({
  config,
  value,
  onChange,
  readonly = false,
  error,
  required = false,
}) => {
  return (
    <TextField
      fullWidth
      type="number"
      label={config.label}
      placeholder={config.placeholder}
      helperText={error || config.ayuda}
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
      disabled={readonly}
      required={required}
      error={!!error}
      InputProps={{
        inputProps: {
          min: config.min,
          max: config.max,
        }
      }}
    />
  );
};
```

**DatePicker.tsx:**
```tsx
import React from 'react';
import { TextField } from '@mui/material';
import { ComponenteProps } from '../ComponenteMap';

export const DatePicker: React.FC<ComponenteProps> = ({
  config,
  value,
  onChange,
  readonly = false,
  error,
  required = false,
}) => {
  return (
    <TextField
      fullWidth
      type="date"
      label={config.label}
      helperText={error || config.ayuda}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={readonly}
      required={required}
      error={!!error}
      InputLabelProps={{ shrink: true }}
    />
  );
};
```

**SelectSimple.tsx:**
```tsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { ComponenteProps } from '../ComponenteMap';

export const SelectSimple: React.FC<ComponenteProps> = ({
  config,
  value,
  onChange,
  readonly = false,
  error,
  required = false,
}) => {
  return (
    <FormControl fullWidth error={!!error} required={required}>
      <InputLabel>{config.label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={readonly}
        label={config.label}
      >
        {config.opciones?.map((opcion: any) => (
          <MenuItem key={opcion.valor} value={opcion.valor} disabled={opcion.deshabilitada}>
            {opcion.etiqueta}
          </MenuItem>
        ))}
      </Select>
      {(error || config.ayuda) && <FormHelperText>{error || config.ayuda}</FormHelperText>}
    </FormControl>
  );
};
```

**FileUpload.tsx:**
```tsx
import React from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { ComponenteProps } from '../ComponenteMap';

export const FileUpload: React.FC<ComponenteProps> = ({
  config,
  value,
  onChange,
  readonly = false,
  error,
  required = false,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onChange(files);
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {config.label} {required && '*'}
      </Typography>
      
      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUpload />}
        disabled={readonly}
        fullWidth
      >
        Seleccionar archivos
        <input
          type="file"
          hidden
          multiple={config.cantidad_maxima > 1}
          accept={config.tipos_archivos_permitidos?.join(',')}
          onChange={handleFileChange}
        />
      </Button>

      {config.ayuda && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {config.ayuda}
        </Typography>
      )}

      {value && value.length > 0 && (
        <List dense>
          {value.map((file: File, index: number) => (
            <ListItem key={index}>
              <ListItemText 
                primary={file.name}
                secondary={`${(file.size / 1024).toFixed(2)} KB`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
```

---

### ENTREGABLE SEMANA 1 ✅

**Backend:**
- ✅ 3 tablas en base de datos
- ✅ 3 modelos SQLAlchemy
- ✅ 3 schemas Pydantic
- ✅ CRUD service completo
- ✅ 12 endpoints REST

**Frontend:**
- ✅ Tipos TypeScript completos
- ✅ Service API con 12 métodos
- ✅ DynamicViewRenderer base
- ✅ SeccionRenderer
- ✅ ComponenteRenderer
- ✅ 5 componentes funcionales

**Demo:**
```bash
# Crear vista config para etapa 1
curl -X POST http://localhost:8000/api/v1/workflow/vistas-config \
  -H "Content-Type: application/json" \
  -d '{
    "etapa_id": 1,
    "layout_tipo": "SIMPLE",
    "secciones": [...]
  }'

# Ver renderizado en frontend
http://localhost:5173/workflow/etapas/1
```

---

## 📋 FASE 2: Editor de Vistas (Semana 2)

### DÍA 6 (Nov 18) - Integración con WorkflowEditor

#### Tarea 6.1: Añadir Tab "Vista Dinámica" a EtapaConfigPanel
**Duración:** 3 horas

**Archivo a modificar:**
```
frontend/src/components/Workflow/EtapaConfigPanel.tsx
```

**Cambios:**
```tsx
// Importar componente editor
import { VistaEditor } from '../DynamicView/Editor/VistaEditor';

// Añadir estado para tabs
const [tabValue, setTabValue] = useState(0);

// Añadir tabs
<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
  <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
    <Tab label="General" />
    <Tab label="Preguntas" />
    <Tab label="Vista Dinámica" /> {/* NUEVO */}
  </Tabs>
</Box>

// Tab Panel para Vista Dinámica
<TabPanel value={tabValue} index={2}>
  <VistaEditor
    etapa={formData}
    onSave={handleSaveVista}
  />
</TabPanel>
```

---

#### Tarea 6.2: Crear VistaEditor Component
**Duración:** 5 horas

**Archivos a crear:**
```
frontend/src/components/DynamicView/Editor/VistaEditor.tsx
```

**Estructura:**
```tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { WorkflowEtapa } from '../../../types/workflow';
import { VistaConfig, SeccionVista } from '../../../types/dynamic-views';
import { vistaConfigService } from '../../../services/vista-config.service';
import { SeccionCard } from './SeccionCard';
import { SeccionDialog } from './SeccionDialog';

interface VistaEditorProps {
  etapa: Partial<WorkflowEtapa>;
  onSave: (vistaConfig: VistaConfig) => void;
}

export const VistaEditor: React.FC<VistaEditorProps> = ({ etapa, onSave }) => {
  const [vistaConfig, setVistaConfig] = useState<Partial<VistaConfig>>({
    layout_tipo: 'SIMPLE',
    mostrar_breadcrumbs: true,
    mostrar_timeline: false,
    secciones: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seccionDialogOpen, setSeccionDialogOpen] = useState(false);
  const [editingSeccion, setEditingSeccion] = useState<SeccionVista | null>(null);

  useEffect(() => {
    loadVistaConfig();
  }, [etapa.id]);

  const loadVistaConfig = async () => {
    if (!etapa.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = await vistaConfigService.getByEtapaId(etapa.id);
      if (config) {
        setVistaConfig(config);
      }
    } catch (error) {
      console.error('Error cargando vista config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLayoutChange = (layoutTipo: string) => {
    setVistaConfig(prev => ({ ...prev, layout_tipo: layoutTipo as any }));
  };

  const handleAddSeccion = () => {
    setEditingSeccion(null);
    setSeccionDialogOpen(true);
  };

  const handleEditSeccion = (seccion: SeccionVista) => {
    setEditingSeccion(seccion);
    setSeccionDialogOpen(true);
  };

  const handleSaveSeccion = (seccion: SeccionVista) => {
    setVistaConfig(prev => {
      const secciones = [...(prev.secciones || [])];
      
      if (editingSeccion) {
        // Editar existente
        const index = secciones.findIndex(s => s.id === editingSeccion.id || s.codigo === editingSeccion.codigo);
        if (index !== -1) {
          secciones[index] = seccion;
        }
      } else {
        // Añadir nueva
        secciones.push(seccion);
      }

      return { ...prev, secciones };
    });
    
    setSeccionDialogOpen(false);
    setEditingSeccion(null);
  };

  const handleDeleteSeccion = (seccion: SeccionVista) => {
    if (!confirm('¿Eliminar esta sección?')) return;

    setVistaConfig(prev => ({
      ...prev,
      secciones: prev.secciones?.filter(s => 
        s.id !== seccion.id && s.codigo !== seccion.codigo
      ) || [],
    }));
  };

  const handleSave = async () => {
    if (!etapa.id) {
      alert('Debe guardar la etapa primero');
      return;
    }

    try {
      setSaving(true);
      
      const dataToSave = {
        ...vistaConfig,
        etapa_id: etapa.id,
      } as VistaConfig;

      let saved: VistaConfig;
      
      if (vistaConfig.id) {
        saved = await vistaConfigService.update(vistaConfig.id, dataToSave);
      } else {
        saved = await vistaConfigService.create(dataToSave);
      }

      setVistaConfig(saved);
      onSave(saved);
      
      alert('Vista guardada correctamente');
    } catch (error) {
      console.error('Error guardando vista:', error);
      alert('Error al guardar la vista');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Configuración de Vista Dinámica
      </Typography>

      {!etapa.id && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Debe guardar la etapa antes de configurar la vista dinámica
        </Alert>
      )}

      {/* Layout */}
      <Box sx={{ mb: 4, p: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          📐 Layout
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de layout</InputLabel>
          <Select
            value={vistaConfig.layout_tipo || 'SIMPLE'}
            label="Tipo de layout"
            onChange={(e) => handleLayoutChange(e.target.value)}
          >
            <MenuItem value="SIMPLE">Simple (1 columna)</MenuItem>
            <MenuItem value="DOS_COLUMNAS">Dos columnas</MenuItem>
            <MenuItem value="TRES_COLUMNAS">Tres columnas</MenuItem>
            <MenuItem value="TABS">Tabs</MenuItem>
          </Select>
        </FormControl>

        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={vistaConfig.mostrar_breadcrumbs}
                onChange={(e) => setVistaConfig(prev => ({ 
                  ...prev, 
                  mostrar_breadcrumbs: e.target.checked 
                }))}
              />
            }
            label="Mostrar breadcrumbs"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={vistaConfig.mostrar_timeline}
                onChange={(e) => setVistaConfig(prev => ({ 
                  ...prev, 
                  mostrar_timeline: e.target.checked 
                }))}
              />
            }
            label="Mostrar timeline del proceso"
          />
        </Stack>
      </Box>

      {/* Secciones */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            📦 Secciones ({vistaConfig.secciones?.length || 0})
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSeccion}
            disabled={!etapa.id}
          >
            Añadir Sección
          </Button>
        </Stack>

        <Stack spacing={2}>
          {vistaConfig.secciones && vistaConfig.secciones.length > 0 ? (
            vistaConfig.secciones
              .sort((a, b) => a.orden - b.orden)
              .map((seccion, index) => (
                <SeccionCard
                  key={seccion.id || seccion.codigo}
                  seccion={seccion}
                  index={index}
                  onEdit={handleEditSeccion}
                  onDelete={handleDeleteSeccion}
                />
              ))
          ) : (
            <Alert severity="info">
              No hay secciones configuradas. Añade una sección para comenzar.
            </Alert>
          )}
        </Stack>
      </Box>

      {/* Botón guardar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!etapa.id || saving}
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </Box>

      {/* Dialog para editar sección */}
      <SeccionDialog
        open={seccionDialogOpen}
        seccion={editingSeccion}
        etapa={etapa}
        onClose={() => {
          setSeccionDialogOpen(false);
          setEditingSeccion(null);
        }}
        onSave={handleSaveSeccion}
      />
    </Box>
  );
};
```

---

### DÍA 7 (Nov 19) - Editor de Secciones

#### Tarea 7.1: Crear SeccionCard
**Duración:** 2 horas

**Archivo:**
```
frontend/src/components/DynamicView/Editor/SeccionCard.tsx
```

**Contenido:** Tarjeta que muestra resumen de la sección con botones editar/eliminar

---

#### Tarea 7.2: Crear SeccionDialog
**Duración:** 4 horas

**Archivo:**
```
frontend/src/components/DynamicView/Editor/SeccionDialog.tsx
```

**Características:**
- Form para título, descripción, orden
- Selector de columna (para layouts multi-columna)
- Selector de ancho (1-12)
- Lista de componentes de la sección
- Botón "Añadir Componente"

---

### DÍA 8 (Nov 20) - Editor de Componentes

#### Tarea 8.1: Crear ComponenteDialog
**Duración:** 6 horas

**Archivo:**
```
frontend/src/components/DynamicView/Editor/ComponenteDialog.tsx
```

**Características:**
- Selector de tipo de componente
- Radio buttons para fuente de datos
- Select de preguntas disponibles (si fuente = PREGUNTA)
- Form dinámico según tipo de componente
- Checkbox obligatorio/editable
- Editor de validaciones básicas

---

### DÍA 9-10 (Nov 21-22) - Testing & Refinamiento

#### Tarea 9.1: Tests del Editor
**Duración:** 4 horas

**Archivos:**
```
frontend/src/test/components/DynamicView/VistaEditor.test.tsx
frontend/src/test/components/DynamicView/SeccionDialog.test.tsx
```

---

#### Tarea 9.2: Integración End-to-End
**Duración:** 4 horas

**Flujo a probar:**
1. Crear workflow
2. Añadir etapa
3. Configurar preguntas
4. Configurar vista dinámica
5. Guardar todo
6. Ver renderizado en proceso real

---

### ENTREGABLE SEMANA 2 ✅

**Editor Completo:**
- ✅ Tab "Vista Dinámica" integrado en EtapaConfigPanel
- ✅ VistaEditor con config de layout
- ✅ SeccionDialog para crear/editar secciones
- ✅ ComponenteDialog para crear/editar componentes
- ✅ Drag & drop para reordenar (opcional)

**Demo:**
- Crear una vista con 2 secciones y 5 componentes
- Guardar y verificar en base de datos
- Renderizar vista en DynamicViewRenderer

---

## 📋 FASE 3: Componentes Avanzados (Semana 3-4)

### DÍA 11-12 (Nov 23-24) - Componentes de Input Avanzados

#### Tarea 11.1: Textarea y Checkbox
**Duración:** 3 horas

**Archivos:**
```
frontend/src/components/DynamicView/components/Input/Textarea.tsx
frontend/src/components/DynamicView/components/Input/Checkbox.tsx
frontend/src/components/DynamicView/components/Input/RadioButtons.tsx
```

**Actualizar ComponenteMap:**
```tsx
TEXTAREA: Textarea,
CHECKBOX: Checkbox,
RADIO_BUTTONS: RadioButtons,
```

---

#### Tarea 11.2: SelectMultiple
**Duración:** 2 horas

**Archivo:**
```
frontend/src/components/DynamicView/components/Select/SelectMultiple.tsx
```

**Características:**
- Multi-select con chips
- Opciones configurables
- Búsqueda (opcional)

---

### DÍA 13-14 (Nov 25-26) - Componentes de Display

#### Tarea 13.1: Componentes de Texto
**Duración:** 4 horas

**Archivos:**
```
frontend/src/components/DynamicView/components/Display/TextoEstatico.tsx
frontend/src/components/DynamicView/components/Display/Titulo.tsx
frontend/src/components/DynamicView/components/Display/Alerta.tsx
frontend/src/components/DynamicView/components/Display/InfoCard.tsx
```

**TextoEstatico:**
- Muestra texto con formato Markdown
- Soporte para variables del proceso

**Titulo:**
- Typography configurable (h1-h6)
- Estilos personalizables

**Alerta:**
- Tipos: info, success, warning, error
- Configurable si es dismissible

**InfoCard:**
- Card con icono, título, valor
- Útil para mostrar métricas

---

#### Tarea 13.2: Tabla y Lista
**Duración:** 4 horas

**Archivos:**
```
frontend/src/components/DynamicView/components/Display/Tabla.tsx
frontend/src/components/DynamicView/components/Display/Lista.tsx
frontend/src/components/DynamicView/components/Display/Timeline.tsx
```

**Tabla:**
- Columnas configurables
- Datos desde API o estático
- Paginación opcional

**Lista:**
- Items con icono y texto
- Ordenada o desordenada

**Timeline:**
- Muestra historial de proceso
- Integración con backend

---

### DÍA 15-17 (Nov 27-29) - Componentes de Archivo

#### Tarea 15.1: Mejorar FileUpload
**Duración:** 4 horas

**Mejoras:**
- Preview de imágenes
- Progress bar
- Validación de tipo y tamaño
- Integración con OCR (si aplicable)

---

#### Tarea 15.2: Componentes de Descarga
**Duración:** 4 horas

**Archivos:**
```
frontend/src/components/DynamicView/components/File/FileDownload.tsx
frontend/src/components/DynamicView/components/File/FileGallery.tsx
frontend/src/components/DynamicView/components/File/PDFViewer.tsx
```

**FileDownload:**
- Lista de archivos para descargar
- Botón de descarga individual o masiva

**FileGallery:**
- Galería de imágenes/documentos
- Modal para ver en grande

**PDFViewer:**
- Visor embebido de PDF
- Zoom, rotación, navegación de páginas

---

### DÍA 18-19 (Nov 30 - Dic 1) - Componentes de Acción

#### Tarea 18.1: Botones de Acción
**Duración:** 6 horas

**Archivos:**
```
frontend/src/components/DynamicView/components/Action/Boton.tsx
frontend/src/components/DynamicView/components/Action/BotonDescarga.tsx
frontend/src/components/DynamicView/components/Action/BotonImprimir.tsx
```

**Boton:**
- Configurable (label, icono, color)
- Acciones: API call, navegación, modal

**BotonDescarga:**
- Descarga archivo generado
- Integración con backend

**BotonImprimir:**
- Imprimir sección o documento
- Preview antes de imprimir

---

### DÍA 20 (Dic 2) - Componentes de Revisión

#### Tarea 20.1: Revisión de Documentos
**Duración:** 6 horas

**Archivos:**
```
frontend/src/components/DynamicView/components/Review/DocumentReview.tsx
frontend/src/components/DynamicView/components/Review/OCRReview.tsx
```

**DocumentReview:**
- Lista de documentos con estados
- Aprobar/Rechazar individual
- Comentarios por documento

**OCRReview:**
- Mostrar resultado OCR
- Comparar con datos ingresados
- Validar campos extraídos

---

### ENTREGABLE SEMANA 3-4 ✅

**15 Componentes Adicionales:**
- ✅ 4 Input avanzados (Textarea, Checkbox, Radio, SelectMultiple)
- ✅ 4 Display (TextoEstatico, Titulo, Alerta, InfoCard)
- ✅ 3 Display avanzados (Tabla, Lista, Timeline)
- ✅ 3 File (FileDownload, FileGallery, PDFViewer)
- ✅ 3 Action (Boton, BotonDescarga, BotonImprimir)
- ✅ 2 Review (DocumentReview, OCRReview)

**Total: 20 componentes funcionales**

---

## 📋 FASE 4: Features Avanzados (Semana 5)

### DÍA 21-22 (Dic 3-4) - Sistema de Dependencias

#### Tarea 21.1: Motor de Dependencias
**Duración:** 6 horas

**Archivo:**
```
frontend/src/components/DynamicView/utils/dependencies.ts
```

**Funciones:**
```typescript
export const evaluarDependencia = (
  dependencia: DependenciaComponente,
  formData: Record<string, any>
): boolean => {
  const valor = formData[dependencia.componente_id];
  
  switch (dependencia.condicion) {
    case 'IGUAL':
      return valor === dependencia.valor;
    case 'DIFERENTE':
      return valor !== dependencia.valor;
    case 'MAYOR':
      return valor > dependencia.valor;
    case 'MENOR':
      return valor < dependencia.valor;
    case 'CONTIENE':
      return String(valor).includes(String(dependencia.valor));
    case 'NO_VACIO':
      return valor != null && valor !== '';
    default:
      return true;
  }
};

export const esComponenteVisible = (
  componente: ComponenteVista,
  formData: Record<string, any>
): boolean => {
  if (!componente.dependencias_json || componente.dependencias_json.length === 0) {
    return true;
  }
  
  // Todas las dependencias deben cumplirse (AND)
  return componente.dependencias_json.every(dep => 
    evaluarDependencia(dep, formData)
  );
};
```

**Integrar en ComponenteRenderer:**
```tsx
// Solo renderizar si es visible
if (!esComponenteVisible(componente, formData)) {
  return null;
}
```

---

#### Tarea 21.2: Editor de Dependencias
**Duración:** 4 horas

**Archivo:**
```
frontend/src/components/DynamicView/Editor/DependenciasEditor.tsx
```

**UI:**
- Lista de dependencias del componente
- Añadir nueva dependencia
- Selector de componente fuente
- Selector de condición
- Input para valor de comparación

---

### DÍA 23-24 (Dic 5-6) - Sistema de Validaciones

#### Tarea 23.1: Motor de Validaciones
**Duración:** 6 horas

**Archivo:**
```
frontend/src/components/DynamicView/utils/validation.ts
```

**Validaciones soportadas:**
- Obligatorio
- Longitud mínima/máxima
- Valor mínimo/máximo
- Patrón regex
- Email, teléfono, URL
- Fecha mínima/máxima
- Tamaño de archivo
- Tipo de archivo

**Función principal:**
```typescript
export const validarComponente = (
  componente: ComponenteVista,
  valor: any
): string | null => {
  // Validar si es obligatorio
  if (componente.es_obligatorio && !valor) {
    return 'Este campo es obligatorio';
  }
  
  // Validaciones custom del config
  const validaciones = componente.validaciones_json;
  
  if (!validaciones) return null;
  
  // Aplicar cada validación
  for (const [tipo, params] of Object.entries(validaciones)) {
    const error = aplicarValidacion(tipo, valor, params);
    if (error) return error;
  }
  
  return null;
};
```

---

#### Tarea 23.2: Integrar Validaciones en Renderer
**Duración:** 2 horas

**Modificar DynamicViewRenderer:**
```tsx
const handleSubmit = () => {
  const newErrors: Record<string, string> = {};
  
  vistaConfig.secciones.forEach(seccion => {
    seccion.componentes.forEach(componente => {
      const valor = formData[componente.codigo];
      const error = validarComponente(componente, valor);
      
      if (error) {
        newErrors[componente.codigo] = error;
      }
    });
  });
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  onSubmit(formData);
};
```

---

### DÍA 25 (Dic 7) - Data Binding

#### Tarea 25.1: Integración con Preguntas del Workflow
**Duración:** 4 horas

**Archivo:**
```
frontend/src/components/DynamicView/utils/dataBinding.ts
```

**Funciones:**
```typescript
export const cargarDatosIniciales = async (
  vistaConfig: VistaConfig,
  procesoId: number
): Promise<Record<string, any>> => {
  const formData: Record<string, any> = {};
  
  // Cargar respuestas existentes del proceso
  const respuestas = await obtenerRespuestas(procesoId);
  
  vistaConfig.secciones.forEach(seccion => {
    seccion.componentes.forEach(componente => {
      if (componente.fuente_datos === 'PREGUNTA' && componente.pregunta_id) {
        // Buscar respuesta existente
        const respuesta = respuestas.find(r => r.pregunta_id === componente.pregunta_id);
        if (respuesta) {
          formData[componente.codigo] = respuesta.valor;
        }
      }
    });
  });
  
  return formData;
};

export const guardarRespuestas = async (
  vistaConfig: VistaConfig,
  procesoId: number,
  formData: Record<string, any>
): Promise<void> => {
  const respuestas: any[] = [];
  
  vistaConfig.secciones.forEach(seccion => {
    seccion.componentes.forEach(componente => {
      if (componente.fuente_datos === 'PREGUNTA' && componente.pregunta_id) {
        respuestas.push({
          pregunta_id: componente.pregunta_id,
          valor: formData[componente.codigo],
        });
      }
    });
  });
  
  await guardarRespuestasProceso(procesoId, respuestas);
};
```

---

### ENTREGABLE SEMANA 5 ✅

**Features Avanzados:**
- ✅ Sistema de dependencias entre componentes
- ✅ Motor de validaciones completo
- ✅ Data binding con preguntas del workflow
- ✅ Carga y guardado de respuestas
- ✅ Visibilidad condicional

**Demo:**
- Vista con 3 secciones
- 10 componentes con dependencias
- Validaciones en tiempo real
- Guardado automático

---

## 📋 FASE 5: Testing, Documentación y Migración (Semana 6)

### DÍA 26-27 (Dic 8-9) - Testing Completo

#### Tarea 26.1: Tests Unitarios de Componentes
**Duración:** 6 horas

**Archivos a crear:**
```
frontend/src/test/components/DynamicView/components/
├── TextInput.test.tsx
├── NumberInput.test.tsx
├── DatePicker.test.tsx
├── SelectSimple.test.tsx
├── FileUpload.test.tsx
├── Tabla.test.tsx
└── ... (resto de componentes)
```

**Cobertura objetivo:** 80% en todos los componentes

---

#### Tarea 26.2: Tests de Integración
**Duración:** 4 horas

**Archivos:**
```
frontend/src/test/components/DynamicView/DynamicViewRenderer.test.tsx
frontend/src/test/components/DynamicView/Editor/VistaEditor.test.tsx
```

**Escenarios:**
- Renderizar vista simple con 5 componentes
- Editar vista existente
- Crear sección con componentes
- Validaciones en formulario
- Dependencias entre componentes

---

#### Tarea 26.3: Tests E2E
**Duración:** 4 horas

**Archivo:**
```
frontend/cypress/e2e/dynamic-views.cy.ts
```

**Flujo completo:**
```typescript
describe('Dynamic Views E2E', () => {
  it('Crear workflow con vista dinámica completa', () => {
    // 1. Login
    cy.login('admin@test.com', 'password');
    
    // 2. Ir a Workflows
    cy.visit('/workflows');
    
    // 3. Crear nuevo workflow
    cy.get('[data-testid="nuevo-workflow"]').click();
    cy.get('[name="nombre"]').type('Solicitud de Ejemplo');
    cy.get('[data-testid="guardar-workflow"]').click();
    
    // 4. Añadir etapa
    cy.get('[data-testid="añadir-etapa"]').click();
    
    // 5. Configurar preguntas
    cy.get('[data-testid="tab-preguntas"]').click();
    cy.get('[data-testid="añadir-pregunta"]').click();
    cy.get('[name="texto"]').type('Nombre completo');
    cy.get('[name="tipo"]').select('TEXTO');
    cy.get('[data-testid="guardar-pregunta"]').click();
    
    // 6. Configurar vista dinámica
    cy.get('[data-testid="tab-vista-dinamica"]').click();
    cy.get('[data-testid="añadir-seccion"]').click();
    cy.get('[name="titulo"]').type('Datos Personales');
    cy.get('[data-testid="añadir-componente"]').click();
    cy.get('[name="tipo"]').select('TEXTO_INPUT');
    cy.get('[name="fuente_datos"]').check('PREGUNTA');
    cy.get('[name="pregunta_id"]').select('1');
    cy.get('[data-testid="guardar-componente"]').click();
    cy.get('[data-testid="guardar-seccion"]').click();
    cy.get('[data-testid="guardar-vista"]').click();
    
    // 7. Verificar renderizado
    cy.get('[data-testid="vista-preview"]').should('exist');
    cy.get('[data-testid="seccion-datos-personales"]').should('be.visible');
    cy.get('input[label="Nombre completo"]').should('exist');
  });
});
```

---

### DÍA 28 (Dic 10) - Documentación

#### Tarea 28.1: Documentación Técnica
**Duración:** 4 horas

**Archivos a crear:**
```
frontend/docs/
├── DYNAMIC_VIEWS_API.md          # API Reference
├── DYNAMIC_VIEWS_COMPONENTS.md   # Catálogo de componentes
├── DYNAMIC_VIEWS_GUIDE.md        # Guía de uso
└── DYNAMIC_VIEWS_EXAMPLES.md     # Ejemplos
```

**Contenido DYNAMIC_VIEWS_API.md:**
- Lista de tipos TypeScript
- Endpoints REST disponibles
- Servicios frontend
- Hooks personalizados

**Contenido DYNAMIC_VIEWS_COMPONENTS.md:**
- Cada componente con:
  - Screenshot
  - Props disponibles
  - Ejemplo de configuración JSON
  - Casos de uso

**Contenido DYNAMIC_VIEWS_GUIDE.md:**
- Guía paso a paso para crear vista
- Best practices
- Troubleshooting común

---

#### Tarea 28.2: Video Tutorial
**Duración:** 2 horas

**Grabar video demostrando:**
1. Crear workflow desde cero
2. Configurar 3 etapas con diferentes tipos de vistas
3. Añadir preguntas y componentes
4. Configurar dependencias y validaciones
5. Ver renderizado final
6. Llenar formulario como usuario

**Publicar en:** Wiki del proyecto o YouTube privado

---

### DÍA 29 (Dic 11) - Migración de Vistas Existentes

#### Tarea 29.1: Migrar GeneralView a Vista Dinámica
**Duración:** 3 horas

**Crear configuración JSON para reemplazar:**
```
frontend/src/components/PPSH/views/GeneralView.tsx
```

**Nueva estructura:**
```json
{
  "layout_tipo": "SIMPLE",
  "secciones": [
    {
      "titulo": "Información General",
      "componentes": [
        {
          "tipo": "TEXTO_INPUT",
          "config_json": {
            "label": "Nombre del proceso"
          }
        },
        {
          "tipo": "TEXTAREA",
          "config_json": {
            "label": "Detalles del proceso",
            "rows": 6
          }
        }
      ]
    }
  ]
}
```

---

#### Tarea 29.2: Crear Templates Predefinidos
**Duración:** 3 horas

**Archivo:**
```
frontend/src/components/DynamicView/templates/index.ts
```

**Templates:**
```typescript
export const TEMPLATES = {
  SOLICITUD_BASICA: {
    nombre: 'Solicitud Básica',
    descripcion: 'Formulario simple con datos personales y documentos',
    config: { /* ... */ },
  },
  
  REVISION_DOCUMENTOS: {
    nombre: 'Revisión de Documentos',
    descripcion: 'Vista para revisar y aprobar documentos',
    config: { /* ... */ },
  },
  
  APROBACION_MULTIPLE: {
    nombre: 'Aprobación con Múltiples Niveles',
    descripcion: 'Vista con tabla de items a aprobar',
    config: { /* ... */ },
  },
  
  FORMULARIO_COMPLEJO: {
    nombre: 'Formulario Complejo',
    descripcion: 'Vista con secciones, tabs y dependencias',
    config: { /* ... */ },
  },
};
```

**Integrar en VistaEditor:**
```tsx
<Button onClick={() => aplicarTemplate('SOLICITUD_BASICA')}>
  Usar Template: Solicitud Básica
</Button>
```

---

### DÍA 30 (Dic 12) - Optimización y Deploy

#### Tarea 30.1: Optimización de Performance
**Duración:** 4 horas

**Mejoras:**
```typescript
// 1. Memoizar componentes pesados
export const ComponenteRenderer = React.memo(ComponenteRendererBase);

// 2. Lazy loading de componentes
const FileUpload = React.lazy(() => import('./File/FileUpload'));

// 3. Virtual scrolling para listas largas
import { FixedSizeList } from 'react-window';

// 4. Debounce en validaciones
const debouncedValidate = useDebouncedCallback(validate, 300);
```

---

#### Tarea 30.2: Preparar para Producción
**Duración:** 2 horas

**Checklist:**
- [ ] Remover console.logs
- [ ] Minificar bundle
- [ ] Optimizar imágenes
- [ ] Configurar cache de API
- [ ] Actualizar CHANGELOG.md
- [ ] Tag release v2.0.0

**Comandos:**
```bash
# Build optimizado
npm run build

# Analizar bundle
npm run analyze

# Deploy a staging
npm run deploy:staging

# Test en staging
npm run test:e2e:staging

# Deploy a production
npm run deploy:production
```

---

### ENTREGABLE SEMANA 6 ✅

**Testing:**
- ✅ 80%+ cobertura en componentes
- ✅ Tests de integración completos
- ✅ Suite E2E funcionando

**Documentación:**
- ✅ 4 documentos técnicos
- ✅ Video tutorial
- ✅ Ejemplos prácticos

**Migración:**
- ✅ Vistas legacy migradas
- ✅ 4 templates predefinidos
- ✅ Sistema optimizado

**Producción:**
- ✅ Build optimizado
- ✅ Deploy en staging
- ✅ Deploy en production

---

## 📊 RESUMEN FINAL

### Estadísticas del Proyecto

| Métrica | Cantidad |
|---------|----------|
| **Backend** |
| Tablas creadas | 3 |
| Modelos SQLAlchemy | 3 |
| Schemas Pydantic | 9 |
| Endpoints REST | 12 |
| **Frontend** |
| Tipos TypeScript | 15+ |
| Componentes creados | 25+ |
| Archivos de código | 50+ |
| Tests escritos | 30+ |
| Líneas de código | ~5000 |
| **Documentación** |
| Documentos técnicos | 4 |
| Ejemplos | 10+ |
| Videos | 1 |

---

### Timeline Consolidado

```
Semana 1 (Nov 13-17): Foundation & Backend
├─ Día 1-2: Base de datos y modelos
├─ Día 3: Frontend types y service
└─ Día 4-5: Componentes base renderer

Semana 2 (Nov 18-22): Editor de Vistas
├─ Día 6: Integración con WorkflowEditor
├─ Día 7: Editor de secciones
├─ Día 8: Editor de componentes
└─ Día 9-10: Testing y refinamiento

Semana 3-4 (Nov 23 - Dic 2): Componentes Avanzados
├─ Día 11-12: Input avanzados
├─ Día 13-14: Display components
├─ Día 15-17: File components
├─ Día 18-19: Action buttons
└─ Día 20: Review components

Semana 5 (Dic 3-7): Features Avanzados
├─ Día 21-22: Sistema de dependencias
├─ Día 23-24: Sistema de validaciones
└─ Día 25: Data binding

Semana 6 (Dic 8-12): Testing & Deploy
├─ Día 26-27: Testing completo
├─ Día 28: Documentación
├─ Día 29: Migración
└─ Día 30: Optimización y deploy
```

---

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad de dependencias | Media | Alto | Crear motor simple primero, iterar |
| Performance con muchos componentes | Alta | Medio | Lazy loading, memoización, virtual scroll |
| Curva de aprendizaje | Media | Medio | Documentación extensiva, templates |
| Bugs en validaciones | Alta | Alto | Testing exhaustivo, validación dual (FE/BE) |
| Cambios en requisitos | Media | Alto | Arquitectura flexible, componentes desacoplados |

---

### Próximos Pasos Post-Implementación

#### Corto Plazo (1 mes)
- [ ] Recopilar feedback de usuarios
- [ ] Crear más templates
- [ ] Añadir componentes especializados (firma digital, pago)
- [ ] Mejorar UX del editor

#### Mediano Plazo (3 meses)
- [ ] Drag & drop visual para diseñar vistas
- [ ] Sistema de permisos granular por componente
- [ ] Versionado de configuraciones
- [ ] Analytics de uso de componentes

#### Largo Plazo (6+ meses)
- [ ] AI para sugerir configuraciones
- [ ] Marketplace de templates
- [ ] Multi-idioma en componentes
- [ ] Exportar/importar configuraciones entre ambientes

---

## 🎓 Lecciones Aprendidas (Para futuras implementaciones)

### ✅ Best Practices

1. **Empezar simple:** Los 5 componentes básicos primero, luego expandir
2. **Testing desde el inicio:** No dejar para el final
3. **Documentación continua:** Documentar mientras se desarrolla
4. **Feedback temprano:** Mostrar prototipos desde semana 2
5. **Arquitectura flexible:** Fácil añadir nuevos componentes sin cambiar core

### ❌ Qué evitar

1. **No hacer todo generic desde día 1:** Enfocarse en casos de uso reales
2. **No hardcodear:** Todo debe ser configurable
3. **No ignorar performance:** Pensar en escala desde el inicio
4. **No omitir validaciones backend:** Frontend es solo UX, backend es seguridad
5. **No sobre-ingenierizar:** KISS (Keep It Simple, Stupid)

---

## 📞 Soporte y Mantenimiento

### Responsabilidades

**Backend Developer:**
- Mantener API endpoints
- Optimizar queries de base de datos
- Revisar y aprobar cambios en modelos

**Frontend Developer:**
- Crear nuevos componentes según demanda
- Mantener ComponenteMap actualizado
- Optimizar performance del renderer

**QA:**
- Testing de regresión cada sprint
- Validar nuevos componentes antes de merge
- Mantener suite E2E actualizada

### Proceso de Cambios

1. **Nueva Feature Request**
   - Crear issue en GitHub
   - Discutir en daily standup
   - Estimar esfuerzo

2. **Desarrollo**
   - Branch desde `main`
   - Desarrollo + tests
   - Code review

3. **Testing**
   - QA en staging
   - Usuarios beta prueban
   - Ajustes finales

4. **Deploy**
   - Merge a `main`
   - Deploy a production
   - Monitorear métricas

---

## ✅ Checklist de Inicio Mañana

### Preparación Pre-Inicio

- [ ] Revisar este documento completo
- [ ] Preparar ambiente de desarrollo
- [ ] Tener acceso a:
  - [ ] Base de datos de desarrollo
  - [ ] Repositorio GitHub
  - [ ] Herramientas de testing
  - [ ] Documentación de API existente

### Día 1 - Checklist Operativo

- [ ] 08:00 - Daily standup, confirmar prioridades
- [ ] 08:30 - Crear branch `feature/dynamic-views-cms`
- [ ] 09:00 - Comenzar Tarea 1.1: Diseñar esquema BD
- [ ] 11:00 - Review esquema con equipo
- [ ] 11:30 - Crear migration Alembic
- [ ] 14:00 - Ejecutar migration en DB dev
- [ ] 14:30 - Comenzar Tarea 1.2: Modelos SQLAlchemy
- [ ] 16:00 - Testing de modelos
- [ ] 17:00 - Commit del día
- [ ] 17:30 - Update de progreso en daily log

### Recordatorios

- ⏰ Commits frecuentes (cada 1-2 horas)
- 📝 Documentar decisiones importantes
- 🧪 Escribir tests mientras desarrollas
- 💬 Pedir ayuda si te bloqueas >30 min
- ☕ Tomar breaks cada 2 horas

---

**Documento creado:** Noviembre 12, 2025  
**Versión:** 1.0  
**Autor:** Sistema de Desarrollo  
**Estado:** ✅ Listo para ejecutar  
**Próxima actualización:** Diaria durante implementación

---

**¡Éxito en la implementación! 🚀**

