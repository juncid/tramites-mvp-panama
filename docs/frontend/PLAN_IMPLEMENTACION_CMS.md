# 🚀 Plan de Implementación - Mini CMS Vistas Dinámicas (MVP)

## 🎯 Plan Ejecutivo - 2 Semanas

**Versión:** MVP 1.0  
**Duración:** 10 días hábiles (13-26 Noviembre 2025)  
**Enfoque:** Mínimo producto viable - Pragmático y ejecutable

---

## 📊 Análisis de Situación

### ✅ Contexto Actual
- **Producto Nº1**: 100% completado (Backend, APIs, BBDD, Documentación)
- **Estado**: Sistema funcional con workflows dinámicos
- **Problema**: Cada flujo requiere vistas hardcodeadas (no escalable)

### ⚠️ Problema con el Plan Original (6 semanas)
- **Demasiado ambicioso** para MVP
- **Riesgo alto** de retrasar entregables
- **Over-engineering** para necesidades inmediatas
- **No alineado con filosofía MVP**: Mínimo producto viable

---

## 🚀 PROPUESTA: Plan MVP Pragmático (2 semanas)

### Filosofía
> **"Lo suficientemente dinámico para evitar hardcodear, lo suficientemente simple para entregar rápido"**

**Objetivo Real:** 
- ✅ Configurar vistas desde JSON sin cambiar código
- ✅ Reutilizar componentes entre flujos
- ✅ Base sólida para iterar después del MVP

**NO incluir en MVP:**
- ❌ Editor visual sofisticado
- ❌ 20+ tipos de componentes
- ❌ Sistema complejo de dependencias
- ❌ Features avanzados

---

## 📋 SEMANA 1: Foundation (Backend + Renderer)

### 🗓️ DÍA 1 (Miércoles 13 Nov) - Backend: Base de Datos Simple

**Objetivo:** Crear tabla única con JSON para máxima flexibilidad

#### ✅ Checklist del Día

**Tarea 1.1: Crear migración Alembic** (1 hora)

```bash
cd backend
alembic revision -m "crear_tabla_vista_config_json"
```

**Archivo:** `backend/alembic/versions/XXX_crear_tabla_vista_config_json.py`

```python
"""crear tabla vista config json

Revision ID: xxx
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

def upgrade():
    op.create_table(
        'workflow_vista_config',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('etapa_id', sa.Integer, sa.ForeignKey('workflow_etapas.id', ondelete='CASCADE'), nullable=False),
        sa.Column('config_json', mssql.NVARCHAR(length='MAX'), nullable=False),
        sa.Column('activo', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.getdate()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.getdate(), onupdate=sa.func.getdate()),
        sa.Column('created_by', sa.String(100)),
        sa.Column('updated_by', sa.String(100))
    )
    
    op.create_index('idx_vista_config_etapa', 'workflow_vista_config', ['etapa_id'])
    op.create_index('idx_vista_config_activo', 'workflow_vista_config', ['activo'])

def downgrade():
    op.drop_index('idx_vista_config_activo', 'workflow_vista_config')
    op.drop_index('idx_vista_config_etapa', 'workflow_vista_config')
    op.drop_table('workflow_vista_config')
```

**Ejecutar:**
```bash
alembic upgrade head
```

**Validar:**
```bash
# Verificar tabla existe
python -c "from app.database import engine; print(engine.table_names())"
```

---

**Tarea 1.2: Crear modelo SQLAlchemy** (30 min)

**Archivo:** `backend/app/models/vista_config.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import json

class VistaConfig(Base):
    __tablename__ = 'workflow_vista_config'
    
    id = Column(Integer, primary_key=True, index=True)
    etapa_id = Column(Integer, ForeignKey('workflow_etapas.id', ondelete='CASCADE'), nullable=False)
    config_json = Column(Text, nullable=False)  # Almacena JSON como string
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.getdate())
    updated_at = Column(DateTime, server_default=func.getdate(), onupdate=func.getdate())
    created_by = Column(String(100))
    updated_by = Column(String(100))
    
    # Relación con etapa
    etapa = relationship("WorkflowEtapa", back_populates="vista_config")
    
    @property
    def config(self):
        """Parse JSON string to dict"""
        return json.loads(self.config_json) if self.config_json else {}
    
    @config.setter
    def config(self, value):
        """Convert dict to JSON string"""
        self.config_json = json.dumps(value, ensure_ascii=False)
```

**Actualizar:** `backend/app/models/__init__.py`
```python
from .vista_config import VistaConfig
```

**Actualizar:** `backend/app/models/models_workflow.py`
```python
# En clase WorkflowEtapa, añadir:
vista_config = relationship("VistaConfig", back_populates="etapa", uselist=False, cascade="all, delete-orphan")
```

---

**Tarea 1.3: Crear Pydantic Schema** (30 min)

**Archivo:** `backend/app/schemas/vista_config.py`

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

class VistaConfigBase(BaseModel):
    config_json: Dict[str, Any] = Field(..., description="Configuración de la vista en JSON")
    
    @validator('config_json')
    def validate_json_structure(cls, v):
        """Validar estructura mínima del JSON"""
        if not isinstance(v, dict):
            raise ValueError('config_json debe ser un diccionario')
        
        # Validar campos mínimos
        if 'secciones' not in v:
            raise ValueError('config_json debe tener campo "secciones"')
            
        if not isinstance(v['secciones'], list):
            raise ValueError('"secciones" debe ser una lista')
        
        return v

class VistaConfigCreate(VistaConfigBase):
    etapa_id: int

class VistaConfigUpdate(BaseModel):
    config_json: Optional[Dict[str, Any]] = None

class VistaConfig(VistaConfigBase):
    id: int
    etapa_id: int
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    updated_by: Optional[str]
    
    class Config:
        from_attributes = True
```

**Actualizar:** `backend/app/schemas/__init__.py`
```python
from .vista_config import VistaConfig, VistaConfigCreate, VistaConfigUpdate
```

---

**✅ Entregables Día 1:**
- [x] 1 tabla en base de datos
- [x] 1 modelo SQLAlchemy
- [x] 1 schema Pydantic
- [x] Validaciones básicas
- [x] Tests de conexión

**⏰ Tiempo estimado:** 4 horas

---

### 🗓️ DÍA 2 (Jueves 14 Nov) - Backend: API REST Básica

**Objetivo:** 3 endpoints CRUD funcionales

#### ✅ Checklist del Día

**Tarea 2.1: Crear service CRUD** (1.5 horas)

**Archivo:** `backend/app/services/vista_config_service.py`

```python
from sqlalchemy.orm import Session
from app.models.vista_config import VistaConfig
from app.schemas.vista_config import VistaConfigCreate, VistaConfigUpdate
from typing import Optional
import json

class VistaConfigService:
    
    @staticmethod
    def get_by_etapa_id(db: Session, etapa_id: int) -> Optional[VistaConfig]:
        """Obtener configuración de vista por ID de etapa"""
        return db.query(VistaConfig).filter(
            VistaConfig.etapa_id == etapa_id,
            VistaConfig.activo == True
        ).first()
    
    @staticmethod
    def create(db: Session, data: VistaConfigCreate, user_id: str = None) -> VistaConfig:
        """Crear nueva configuración de vista"""
        # Verificar si ya existe config para esta etapa
        existing = db.query(VistaConfig).filter(
            VistaConfig.etapa_id == data.etapa_id,
            VistaConfig.activo == True
        ).first()
        
        if existing:
            raise ValueError(f"Ya existe una configuración activa para la etapa {data.etapa_id}")
        
        # Crear nueva config
        db_obj = VistaConfig(
            etapa_id=data.etapa_id,
            config_json=json.dumps(data.config_json, ensure_ascii=False),
            created_by=user_id
        )
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        return db_obj
    
    @staticmethod
    def update(db: Session, config_id: int, data: VistaConfigUpdate, user_id: str = None) -> VistaConfig:
        """Actualizar configuración existente"""
        db_obj = db.query(VistaConfig).filter(VistaConfig.id == config_id).first()
        
        if not db_obj:
            raise ValueError(f"Configuración {config_id} no encontrada")
        
        if data.config_json is not None:
            db_obj.config_json = json.dumps(data.config_json, ensure_ascii=False)
        
        db_obj.updated_by = user_id
        
        db.commit()
        db.refresh(db_obj)
        
        return db_obj
    
    @staticmethod
    def delete(db: Session, config_id: int) -> bool:
        """Soft delete de configuración"""
        db_obj = db.query(VistaConfig).filter(VistaConfig.id == config_id).first()
        
        if not db_obj:
            return False
        
        db_obj.activo = False
        db.commit()
        
        return True

vista_config_service = VistaConfigService()
```

---

**Tarea 2.2: Crear endpoints REST** (2 horas)

**Archivo:** `backend/app/routes/vista_config.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import json

from app.database import get_db
from app.schemas.vista_config import VistaConfig, VistaConfigCreate, VistaConfigUpdate
from app.services.vista_config_service import vista_config_service

router = APIRouter()

@router.get("/etapas/{etapa_id}/vista-config", response_model=Optional[VistaConfig])
def get_vista_config_by_etapa(
    etapa_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener configuración de vista para una etapa específica.
    
    Si no existe configuración, retorna null (el frontend usará vista por defecto).
    """
    config = vista_config_service.get_by_etapa_id(db, etapa_id)
    
    if not config:
        return None
    
    # Parse JSON para retornar como objeto
    config_dict = {
        "id": config.id,
        "etapa_id": config.etapa_id,
        "config_json": json.loads(config.config_json),
        "activo": config.activo,
        "created_at": config.created_at,
        "updated_at": config.updated_at,
        "created_by": config.created_by,
        "updated_by": config.updated_by
    }
    
    return config_dict

@router.post("/vistas-config", response_model=VistaConfig, status_code=status.HTTP_201_CREATED)
def create_vista_config(
    data: VistaConfigCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nueva configuración de vista para una etapa.
    
    Lanza error si ya existe una configuración activa para esa etapa.
    """
    try:
        config = vista_config_service.create(db, data)
        
        return {
            "id": config.id,
            "etapa_id": config.etapa_id,
            "config_json": json.loads(config.config_json),
            "activo": config.activo,
            "created_at": config.created_at,
            "updated_at": config.updated_at,
            "created_by": config.created_by,
            "updated_by": config.updated_by
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/vistas-config/{config_id}", response_model=VistaConfig)
def update_vista_config(
    config_id: int,
    data: VistaConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar configuración de vista existente.
    """
    try:
        config = vista_config_service.update(db, config_id, data)
        
        return {
            "id": config.id,
            "etapa_id": config.etapa_id,
            "config_json": json.loads(config.config_json),
            "activo": config.activo,
            "created_at": config.created_at,
            "updated_at": config.updated_at,
            "created_by": config.created_by,
            "updated_by": config.updated_by
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/vistas-config/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vista_config(
    config_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar (soft delete) configuración de vista.
    """
    success = vista_config_service.delete(db, config_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    
    return None
```

**Registrar router en:** `backend/app/main.py`

```python
from app.routes import vista_config

# ... después de otros routers
app.include_router(
    vista_config.router,
    prefix="/api/v1/workflow",
    tags=["vistas-dinamicas"]
)
```

---

**Tarea 2.3: Crear tests básicos** (1 hora)

**Archivo:** `backend/tests/test_vista_config.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_vista_config():
    """Test crear configuración de vista"""
    payload = {
        "etapa_id": 1,
        "config_json": {
            "titulo": "Test Vista",
            "secciones": [
                {
                    "titulo": "Sección 1",
                    "componentes": []
                }
            ]
        }
    }
    
    response = client.post("/api/v1/workflow/vistas-config", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["etapa_id"] == 1
    assert "id" in data

def test_get_vista_config_by_etapa():
    """Test obtener configuración por etapa"""
    response = client.get("/api/v1/workflow/etapas/1/vista-config")
    
    assert response.status_code == 200
    # Puede ser null si no existe

def test_update_vista_config():
    """Test actualizar configuración"""
    # Primero crear
    create_response = client.post("/api/v1/workflow/vistas-config", json={
        "etapa_id": 2,
        "config_json": {"titulo": "Original", "secciones": []}
    })
    
    config_id = create_response.json()["id"]
    
    # Luego actualizar
    update_response = client.put(
        f"/api/v1/workflow/vistas-config/{config_id}",
        json={"config_json": {"titulo": "Actualizado", "secciones": []}}
    )
    
    assert update_response.status_code == 200
    assert update_response.json()["config_json"]["titulo"] == "Actualizado"
```

**Ejecutar tests:**
```bash
pytest backend/tests/test_vista_config.py -v
```

---

**✅ Entregables Día 2:**
- [x] Service CRUD completo
- [x] 3 endpoints REST (GET, POST, PUT)
- [x] Tests básicos pasando
- [x] Documentación automática en Swagger

**⏰ Tiempo estimado:** 4.5 horas

---

### 🗓️ DÍA 3 (Viernes 15 Nov) - Frontend: Types + Service

**Objetivo:** Tipos TypeScript y servicio API frontend

#### ✅ Checklist del Día

**Tarea 3.1: Definir tipos TypeScript** (1.5 horas)

**Archivo:** `frontend/src/types/dynamic-view.ts`

```typescript
/**
 * Tipos para sistema de vistas dinámicas (MVP)
 */

// Tipos de componentes soportados en MVP
export type TipoComponente = 
  | 'TEXTO'
  | 'NUMERO'
  | 'FECHA'
  | 'SELECT'
  | 'ARCHIVO';

// Configuración de un componente individual
export interface Componente {
  tipo: TipoComponente;
  label: string;
  pregunta_id?: number;
  obligatorio?: boolean;
  config?: ConfigComponente;
}

// Configuración específica por tipo de componente
export interface ConfigComponente {
  // Para TEXTO
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  
  // Para NUMERO
  min?: number;
  max?: number;
  step?: number;
  
  // Para SELECT
  opciones?: { valor: string | number; etiqueta: string }[];
  
  // Para ARCHIVO
  tipos_permitidos?: string[];
  max_size_mb?: number;
  max_archivos?: number;
}

// Sección que agrupa componentes
export interface Seccion {
  titulo: string;
  descripcion?: string;
  componentes: Componente[];
}

// Configuración completa de la vista
export interface ConfigJson {
  titulo?: string;
  descripcion?: string;
  secciones: Seccion[];
}

// Modelo completo de VistaConfig (coincide con backend)
export interface VistaConfig {
  id: number;
  etapa_id: number;
  config_json: ConfigJson;
  activo: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// DTOs para crear/actualizar
export interface VistaConfigCreate {
  etapa_id: number;
  config_json: ConfigJson;
}

export interface VistaConfigUpdate {
  config_json: ConfigJson;
}

// Estado del formulario renderizado
export interface FormData {
  [preguntaId: number]: any;
}

// Errores de validación
export interface FormErrors {
  [preguntaId: number]: string;
}
```

---

**Tarea 3.2: Crear servicio API** (1.5 horas)

**Archivo:** `frontend/src/services/vista-config.service.ts`

```typescript
import axios from 'axios';
import type { VistaConfig, VistaConfigCreate, VistaConfigUpdate } from '../types/dynamic-view';

const API_BASE = '/api/v1/workflow';

class VistaConfigService {
  
  /**
   * Obtener configuración de vista por ID de etapa
   * Retorna null si no existe configuración (usar vista por defecto)
   */
  async getByEtapaId(etapaId: number): Promise<VistaConfig | null> {
    try {
      const response = await axios.get<VistaConfig>(`${API_BASE}/etapas/${etapaId}/vista-config`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Crear nueva configuración de vista
   */
  async create(data: VistaConfigCreate): Promise<VistaConfig> {
    const response = await axios.post<VistaConfig>(`${API_BASE}/vistas-config`, data);
    return response.data;
  }

  /**
   * Actualizar configuración existente
   */
  async update(id: number, data: VistaConfigUpdate): Promise<VistaConfig> {
    const response = await axios.put<VistaConfig>(`${API_BASE}/vistas-config/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar configuración
   */
  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/vistas-config/${id}`);
  }

  /**
   * Crear o actualizar configuración para una etapa
   * Helper que decide automáticamente si crear o actualizar
   */
  async createOrUpdate(etapaId: number, configJson: any): Promise<VistaConfig> {
    // Primero intentar obtener config existente
    const existing = await this.getByEtapaId(etapaId);
    
    if (existing) {
      // Ya existe, actualizar
      return this.update(existing.id, { config_json: configJson });
    } else {
      // No existe, crear nueva
      return this.create({ etapa_id: etapaId, config_json: configJson });
    }
  }
}

export const vistaConfigService = new VistaConfigService();
export default vistaConfigService;
```

---

**Tarea 3.3: Crear templates de ejemplo** (1 hora)

**Archivo:** `frontend/src/templates/vista-templates.ts`

```typescript
import type { ConfigJson } from '../types/dynamic-view';

/**
 * Templates predefinidos para crear vistas rápidamente
 */

export const TEMPLATE_SOLICITUD_BASICA: ConfigJson = {
  titulo: 'Solicitud Básica',
  descripcion: 'Formulario simple con datos personales',
  secciones: [
    {
      titulo: 'Información Personal',
      descripcion: 'Datos básicos del solicitante',
      componentes: [
        {
          tipo: 'TEXTO',
          label: 'Nombre Completo',
          pregunta_id: 1,
          obligatorio: true,
          config: {
            placeholder: 'Ingrese su nombre completo'
          }
        },
        {
          tipo: 'NUMERO',
          label: 'Cédula de Identidad',
          pregunta_id: 2,
          obligatorio: true,
          config: {
            placeholder: '0-000-0000'
          }
        },
        {
          tipo: 'FECHA',
          label: 'Fecha de Nacimiento',
          pregunta_id: 3,
          obligatorio: true
        }
      ]
    },
    {
      titulo: 'Documentos',
      descripcion: 'Adjuntar documentos requeridos',
      componentes: [
        {
          tipo: 'ARCHIVO',
          label: 'Cédula (Foto o escaneada)',
          pregunta_id: 4,
          obligatorio: true,
          config: {
            tipos_permitidos: ['pdf', 'jpg', 'png'],
            max_size_mb: 10,
            max_archivos: 2
          }
        }
      ]
    }
  ]
};

export const TEMPLATE_REVISION_DOCUMENTOS: ConfigJson = {
  titulo: 'Revisión de Documentos',
  descripcion: 'Verificar documentos adjuntos por el solicitante',
  secciones: [
    {
      titulo: 'Documentos a Revisar',
      componentes: [
        {
          tipo: 'SELECT',
          label: 'Estado de la Cédula',
          pregunta_id: 1,
          obligatorio: true,
          config: {
            opciones: [
              { valor: 'APROBADO', etiqueta: 'Aprobado' },
              { valor: 'RECHAZADO', etiqueta: 'Rechazado - Volver a subir' },
              { valor: 'PENDIENTE', etiqueta: 'Pendiente de revisión' }
            ]
          }
        },
        {
          tipo: 'TEXTO',
          label: 'Comentarios',
          pregunta_id: 2,
          obligatorio: false,
          config: {
            multiline: true,
            placeholder: 'Observaciones sobre los documentos...'
          }
        }
      ]
    }
  ]
};

export const TEMPLATE_APROBACION: ConfigJson = {
  titulo: 'Aprobación de Solicitud',
  descripcion: 'Decisión final sobre la solicitud',
  secciones: [
    {
      titulo: 'Decisión',
      componentes: [
        {
          tipo: 'SELECT',
          label: 'Estado Final',
          pregunta_id: 1,
          obligatorio: true,
          config: {
            opciones: [
              { valor: 'APROBADO', etiqueta: '✅ Aprobar Solicitud' },
              { valor: 'RECHAZADO', etiqueta: '❌ Rechazar Solicitud' },
              { valor: 'REVISION', etiqueta: '⚠️ Solicitar Más Información' }
            ]
          }
        },
        {
          tipo: 'TEXTO',
          label: 'Justificación',
          pregunta_id: 2,
          obligatorio: true,
          config: {
            multiline: true,
            placeholder: 'Explique brevemente la decisión...'
          }
        }
      ]
    }
  ]
};

// Exportar todos los templates
export const TEMPLATES = {
  SOLICITUD_BASICA: TEMPLATE_SOLICITUD_BASICA,
  REVISION_DOCUMENTOS: TEMPLATE_REVISION_DOCUMENTOS,
  APROBACION: TEMPLATE_APROBACION,
};

// Helper para obtener template por nombre
export function getTemplate(nombre: string): ConfigJson | null {
  return TEMPLATES[nombre as keyof typeof TEMPLATES] || null;
}
```

---

**✅ Entregables Día 3:**
- [x] Tipos TypeScript completos
- [x] Servicio API funcional
- [x] 3 templates predefinidos
- [x] Helper createOrUpdate

**⏰ Tiempo estimado:** 4 horas

---

### 🗓️ DÍA 4 (Lunes 18 Nov) - Frontend: Componentes Base (Parte 1)

**Objetivo:** Crear 3 de 5 componentes renderizables

#### ✅ Checklist del Día

**Tarea 4.1: Componente TextInput** (45 min)

**Archivo:** `frontend/src/components/DynamicView/TextInput.tsx`

```typescript
import React from 'react';
import type { Componente, FormData, FormErrors } from '../../types/dynamic-view';

interface TextInputProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const multiline = config?.multiline || false;
  const placeholder = config?.placeholder || '';
  const maxLength = config?.maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (pregunta_id) {
      onChange(pregunta_id, e.target.value);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 border rounded-md
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
    focus:outline-none focus:ring-2
  `;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className={inputClasses}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {maxLength && (
        <p className="text-gray-500 text-xs mt-1">
          {(value || '').length}/{maxLength} caracteres
        </p>
      )}
    </div>
  );
};
```

---

**Tarea 4.2: Componente NumberInput** (45 min)

**Archivo:** `frontend/src/components/DynamicView/NumberInput.tsx`

```typescript
import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface NumberInputProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const min = config?.min;
  const max = config?.max;
  const step = config?.step || 1;
  const placeholder = config?.placeholder || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pregunta_id) {
      const numValue = e.target.value === '' ? null : parseFloat(e.target.value);
      onChange(pregunta_id, numValue);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2
        `}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {(min !== undefined || max !== undefined) && (
        <p className="text-gray-500 text-xs mt-1">
          {min !== undefined && max !== undefined && `Rango: ${min} - ${max}`}
          {min !== undefined && max === undefined && `Mínimo: ${min}`}
          {min === undefined && max !== undefined && `Máximo: ${max}`}
        </p>
      )}
    </div>
  );
};
```

---

**Tarea 4.3: Componente DatePicker** (45 min)

**Archivo:** `frontend/src/components/DynamicView/DatePicker.tsx`

```typescript
import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface DatePickerProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const min = config?.min; // Fecha mínima (formato: YYYY-MM-DD)
  const max = config?.max; // Fecha máxima

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pregunta_id) {
      onChange(pregunta_id, e.target.value);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="date"
        value={value || ''}
        onChange={handleChange}
        min={min}
        max={max}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2
        `}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
```

---

**Tarea 4.4: Componente SelectSimple** (1 hora)

**Archivo:** `frontend/src/components/DynamicView/SelectSimple.tsx`

```typescript
import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface SelectSimpleProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const SelectSimple: React.FC<SelectSimpleProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const opciones = config?.opciones || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (pregunta_id) {
      // Convertir a número si la opción es numérica
      const selectedValue = e.target.value;
      const opcion = opciones.find(o => String(o.valor) === selectedValue);
      onChange(pregunta_id, opcion?.valor ?? selectedValue);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        value={value ?? ''}
        onChange={handleChange}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2
          bg-white
        `}
      >
        <option value="">-- Seleccione una opción --</option>
        {opciones.map((opcion, index) => (
          <option key={index} value={String(opcion.valor)}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
```

---

**Tarea 4.5: Componente FileUpload** (1.5 horas)

**Archivo:** `frontend/src/components/DynamicView/FileUpload.tsx`

```typescript
import React, { useRef, useState } from 'react';
import type { Componente } from '../../types/dynamic-view';

interface FileUploadProps {
  componente: Componente;
  value: any; // Array de archivos o IDs
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const tiposPermitidos = config?.tipos_permitidos || [];
  const maxSizeMB = config?.max_size_mb || 10;
  const maxArchivos = config?.max_archivos || 1;
  
  const archivos = Array.isArray(value) ? value : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (archivos.length + files.length > maxArchivos) {
      alert(`Máximo ${maxArchivos} archivo(s) permitido(s)`);
      return;
    }

    // Validar tipo y tamaño
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (tiposPermitidos.length > 0 && ext && !tiposPermitidos.includes(ext)) {
        alert(`Tipo de archivo no permitido: ${ext}. Permitidos: ${tiposPermitidos.join(', ')}`);
        return;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Archivo muy grande: ${file.name}. Máximo: ${maxSizeMB} MB`);
        return;
      }
    }

    // Aquí iría la lógica de subida al backend
    // Por ahora solo guardamos los nombres (MVP)
    setUploading(true);
    try {
      // TODO: Implementar upload real
      const nuevosArchivos = files.map(f => ({
        nombre: f.name,
        size: f.size,
        uploaded_at: new Date().toISOString()
      }));
      
      if (pregunta_id) {
        onChange(pregunta_id, [...archivos, ...nuevosArchivos]);
      }
    } catch (err) {
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    if (pregunta_id) {
      const nuevos = archivos.filter((_, i) => i !== index);
      onChange(pregunta_id, nuevos);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-2">
        {/* Lista de archivos */}
        {archivos.length > 0 && (
          <div className="space-y-1">
            {archivos.map((archivo: any, index: number) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  📄 {archivo.nombre || archivo}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input de archivo */}
        {archivos.length < maxArchivos && (
          <>
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept={tiposPermitidos.map(t => `.${t}`).join(',')}
              multiple={maxArchivos > 1}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={`
                w-full px-4 py-2 border-2 border-dashed rounded-md
                ${uploading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}
                ${error ? 'border-red-300' : 'border-gray-300'}
                text-sm text-gray-600
              `}
            >
              {uploading ? '⏳ Subiendo...' : '📎 Seleccionar archivo(s)'}
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* Ayuda */}
      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
        {tiposPermitidos.length > 0 && (
          <p>Tipos permitidos: {tiposPermitidos.join(', ')}</p>
        )}
        <p>Tamaño máximo: {maxSizeMB} MB por archivo</p>
        {maxArchivos > 1 && <p>Máximo {maxArchivos} archivos</p>}
      </div>
    </div>
  );
};
```

---

**Tarea 4.6: Índice de exportación** (15 min)

**Archivo:** `frontend/src/components/DynamicView/index.ts`

```typescript
export { TextInput } from './TextInput';
export { NumberInput } from './NumberInput';
export { DatePicker } from './DatePicker';
export { SelectSimple } from './SelectSimple';
export { FileUpload } from './FileUpload';
```

---

**✅ Entregables Día 4:**
- [x] 5 componentes base completos
- [x] Estilos Tailwind aplicados
- [x] Validación de entrada
- [x] Manejo de errores

**⏰ Tiempo estimado:** 4.5 horas

---

### 🗓️ DÍA 5 (Martes 19 Nov) - Frontend: DynamicRenderer + Validación

**Objetivo:** Componente orquestador que renderiza vistas dinámicamente

#### ✅ Checklist del Día

**Tarea 5.1: DynamicRenderer core** (2 horas)

**Archivo:** `frontend/src/components/DynamicView/DynamicRenderer.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import type { ConfigJson, FormData, FormErrors } from '../../types/dynamic-view';
import { TextInput, NumberInput, DatePicker, SelectSimple, FileUpload } from './index';

interface DynamicRendererProps {
  config: ConfigJson;
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  config,
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Actualizar cuando cambian los datos iniciales
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Handler genérico para cambios
  const handleChange = (preguntaId: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [preguntaId]: value
    }));
    
    // Limpiar error si existía
    if (errors[preguntaId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[preguntaId];
        return newErrors;
      });
    }
  };

  // Validación
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    config.secciones.forEach(seccion => {
      seccion.componentes.forEach(componente => {
        if (componente.obligatorio && componente.pregunta_id) {
          const value = formData[componente.pregunta_id];
          
          // Validar campo obligatorio
          if (value === null || value === undefined || value === '') {
            newErrors[componente.pregunta_id] = 'Campo obligatorio';
          }
          
          // Validación específica por tipo
          if (componente.tipo === 'NUMERO' && value !== null && value !== undefined) {
            const num = Number(value);
            if (isNaN(num)) {
              newErrors[componente.pregunta_id] = 'Debe ser un número válido';
            } else {
              if (componente.config?.min !== undefined && num < componente.config.min) {
                newErrors[componente.pregunta_id] = `Mínimo: ${componente.config.min}`;
              }
              if (componente.config?.max !== undefined && num > componente.config.max) {
                newErrors[componente.pregunta_id] = `Máximo: ${componente.config.max}`;
              }
            }
          }
          
          // Validación de archivos
          if (componente.tipo === 'ARCHIVO' && Array.isArray(value) && value.length === 0) {
            newErrors[componente.pregunta_id] = 'Debe subir al menos un archivo';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar componente según tipo
  const renderComponente = (componente: any) => {
    const commonProps = {
      componente,
      value: componente.pregunta_id ? formData[componente.pregunta_id] : undefined,
      error: componente.pregunta_id ? errors[componente.pregunta_id] : undefined,
      onChange: handleChange
    };

    switch (componente.tipo) {
      case 'TEXTO':
        return <TextInput key={componente.pregunta_id} {...commonProps} />;
      case 'NUMERO':
        return <NumberInput key={componente.pregunta_id} {...commonProps} />;
      case 'FECHA':
        return <DatePicker key={componente.pregunta_id} {...commonProps} />;
      case 'SELECT':
        return <SelectSimple key={componente.pregunta_id} {...commonProps} />;
      case 'ARCHIVO':
        return <FileUpload key={componente.pregunta_id} {...commonProps} />;
      default:
        return (
          <div key={componente.pregunta_id} className="text-red-500 p-2 border border-red-300 rounded">
            ⚠️ Tipo de componente no soportado: {componente.tipo}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      {/* Título y descripción */}
      {config.titulo && (
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{config.titulo}</h2>
      )}
      {config.descripcion && (
        <p className="text-gray-600 mb-6">{config.descripcion}</p>
      )}

      {/* Secciones */}
      {config.secciones.map((seccion, index) => (
        <div key={index} className="mb-8 last:mb-0">
          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{seccion.titulo}</h3>
            {seccion.descripcion && (
              <p className="text-sm text-gray-600 mt-1">{seccion.descripcion}</p>
            )}
          </div>
          
          <div className="space-y-3 pl-4">
            {seccion.componentes.map(componente => renderComponente(componente))}
          </div>
        </div>
      ))}

      {/* Acciones */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
```

---

**Tarea 5.2: Hook personalizado para manejo de estado** (1 hora)

**Archivo:** `frontend/src/hooks/useDynamicView.ts`

```typescript
import { useState, useEffect } from 'react';
import { vistaConfigService } from '../services/vista-config.service';
import type { VistaConfig, ConfigJson, FormData } from '../types/dynamic-view';

interface UseDynamicViewReturn {
  config: ConfigJson | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar configuración de vista por etapa
 */
export function useDynamicView(etapaId: number | null): UseDynamicViewReturn {
  const [config, setConfig] = useState<ConfigJson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!etapaId) {
      setConfig(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vistaConfig = await vistaConfigService.getByEtapaId(etapaId);
      
      if (vistaConfig) {
        setConfig(vistaConfig.config_json);
      } else {
        // No hay configuración, usar vista por defecto
        setConfig(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [etapaId]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig
  };
}

/**
 * Helper para validar estructura de ConfigJson
 */
export function validateConfigJson(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Configuración debe ser un objeto');
    return { valid: false, errors };
  }

  if (!Array.isArray(config.secciones)) {
    errors.push('Debe tener array "secciones"');
    return { valid: false, errors };
  }

  config.secciones.forEach((seccion: any, i: number) => {
    if (!seccion.titulo) {
      errors.push(`Sección ${i + 1}: falta título`);
    }
    if (!Array.isArray(seccion.componentes)) {
      errors.push(`Sección ${i + 1}: falta array "componentes"`);
    } else {
      seccion.componentes.forEach((comp: any, j: number) => {
        if (!comp.tipo) {
          errors.push(`Sección ${i + 1}, Componente ${j + 1}: falta tipo`);
        }
        if (!comp.label) {
          errors.push(`Sección ${i + 1}, Componente ${j + 1}: falta label`);
        }
      });
    }
  });

  return { valid: errors.length === 0, errors };
}
```

---

**✅ Entregables Día 5:**
- [x] DynamicRenderer funcional
- [x] Validación completa
- [x] Hook useDynamicView
- [x] Helper de validación JSON

**⏰ Tiempo estimado:** 3 horas

---

### 🗓️ DÍA 6 (Miércoles 20 Nov) - Editor JSON Simple

**Objetivo:** Editor para crear/modificar configuraciones JSON

#### ✅ Checklist del Día

**Tarea 6.1: Componente JsonEditor** (2.5 horas)

**Archivo:** `frontend/src/components/DynamicView/JsonEditor.tsx`

```typescript
import React, { useState } from 'react';
import { validateConfigJson } from '../../hooks/useDynamicView';
import { TEMPLATES } from '../../templates/vista-templates';
import type { ConfigJson } from '../../types/dynamic-view';

interface JsonEditorProps {
  initialValue?: ConfigJson;
  onSave: (config: ConfigJson) => void;
  onCancel: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  initialValue,
  onSave,
  onCancel
}) => {
  const [jsonText, setJsonText] = useState(
    initialValue ? JSON.stringify(initialValue, null, 2) : ''
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Cargar template
  const loadTemplate = (templateName: string) => {
    const template = TEMPLATES[templateName as keyof typeof TEMPLATES];
    if (template) {
      setJsonText(JSON.stringify(template, null, 2));
      setErrors([]);
    }
  };

  // Validar y guardar
  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateConfigJson(parsed);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setSaving(true);
      onSave(parsed);
    } catch (err: any) {
      setErrors([`JSON inválido: ${err.message}`]);
    } finally {
      setSaving(false);
    }
  };

  // Formatear JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrors([]);
    } catch (err: any) {
      setErrors([`No se puede formatear: ${err.message}`]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Editor de Vista JSON</h3>
        <p className="text-sm text-gray-600 mt-1">
          Edita la configuración JSON de la vista dinámica
        </p>
      </div>

      {/* Templates */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cargar Template:
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => loadTemplate('SOLICITUD_BASICA')}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            📝 Solicitud Básica
          </button>
          <button
            onClick={() => loadTemplate('REVISION_DOCUMENTOS')}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            🔍 Revisión
          </button>
          <button
            onClick={() => loadTemplate('APROBACION')}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            ✅ Aprobación
          </button>
          <button
            onClick={formatJson}
            className="px-3 py-1 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100 text-sm ml-auto"
          >
            ✨ Formatear
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-auto">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-full font-mono text-sm border border-gray-300 rounded p-3 resize-none"
          placeholder={`{
  "titulo": "Mi Vista",
  "descripcion": "Descripción...",
  "secciones": [
    {
      "titulo": "Sección 1",
      "componentes": [
        {
          "tipo": "TEXTO",
          "label": "Nombre",
          "pregunta_id": 1,
          "obligatorio": true
        }
      ]
    }
  ]
}`}
        />
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <h4 className="text-sm font-semibold text-red-800 mb-2">❌ Errores de Validación:</h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, i) => (
              <li key={i} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !jsonText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};
```

---

**Tarea 6.2: Integrar editor en WorkflowEditor** (1.5 horas)

**Archivo:** `frontend/src/pages/WorkflowEditor.tsx` (modificar)

Agregar nuevo tab "Vista Dinámica" después del tab "JSON":

```typescript
// Importar
import { JsonEditor } from '../components/DynamicView/JsonEditor';
import { vistaConfigService } from '../services/vista-config.service';

// En el componente, agregar state
const [vistaConfigTab, setVistaConfigTab] = useState(false);
const [editingVistaConfig, setEditingVistaConfig] = useState<any>(null);

// Función para guardar vista config
const handleSaveVistaConfig = async (config: any) => {
  if (!selectedEtapa) return;
  
  try {
    await vistaConfigService.createOrUpdate(selectedEtapa.id, config);
    alert('✅ Vista dinámica guardada');
    setVistaConfigTab(false);
  } catch (error) {
    alert('❌ Error al guardar vista');
  }
};

// En el JSX, agregar tab
<button
  onClick={() => setVistaConfigTab(true)}
  className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 rounded"
>
  🎨 Vista Dinámica
</button>

// Modal para editor
{vistaConfigTab && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-11/12 h-5/6">
      <JsonEditor
        initialValue={editingVistaConfig}
        onSave={handleSaveVistaConfig}
        onCancel={() => setVistaConfigTab(false)}
      />
    </div>
  </div>
)}
```

---

**✅ Entregables Día 6:**
- [x] Editor JSON funcional
- [x] Carga de templates
- [x] Validación en tiempo real
- [x] Integrado en WorkflowEditor

**⏰ Tiempo estimado:** 4 horas

---

### 🗓️ DÍA 7-8 (Jueves-Viernes 21-22 Nov) - Integración y Testing

**Objetivo:** Conectar todo y probar flujo completo

#### ✅ Checklist Días 7-8

**Tarea 7.1: Usar DynamicRenderer en Workflow.tsx** (2 horas)

**Archivo:** `frontend/src/pages/Workflow.tsx` (reemplazar contenido)

```typescript
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DynamicRenderer } from '../components/DynamicView/DynamicRenderer';
import { useDynamicView } from '../hooks/useDynamicView';
import type { FormData } from '../types/dynamic-view';

export default function Workflow() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const { config, loading, error } = useDynamicView(etapaId ? parseInt(etapaId) : null);
  const [savedData, setSavedData] = useState<FormData>({});

  const handleSubmit = async (data: FormData) => {
    // TODO: Enviar al backend para guardar respuestas
    console.log('Datos del formulario:', data);
    setSavedData(data);
    alert('✅ Formulario guardado exitosamente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vista...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Sin Configuración</h3>
          <p className="text-yellow-700">
            Esta etapa no tiene una vista dinámica configurada.
            <br />
            Por favor, configura una vista desde el editor de workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <DynamicRenderer
        config={config}
        initialData={savedData}
        onSubmit={handleSubmit}
        onCancel={() => window.history.back()}
      />
    </div>
  );
}
```

---

**Tarea 7.2: Testing manual completo** (3 horas)

**Checklist de pruebas:**

```bash
# 1. Iniciar backend
cd backend
python -m uvicorn app.main:app --reload

# 2. Iniciar frontend
cd frontend
npm run dev

# 3. Probar flujo completo
```

**Casos de prueba:**

1. **Crear workflow con vista dinámica**
   - [ ] Abrir WorkflowEditor
   - [ ] Crear una etapa nueva
   - [ ] Click en "Vista Dinámica"
   - [ ] Cargar template "Solicitud Básica"
   - [ ] Guardar configuración
   - [ ] Verificar en BD: tabla `workflow_vista_config`

2. **Renderizar vista**
   - [ ] Navegar a `/workflow/{etapa_id}`
   - [ ] Verificar que se renderiza el formulario
   - [ ] Llenar todos los campos
   - [ ] Verificar validaciones (campos obligatorios)
   - [ ] Subir archivo
   - [ ] Guardar formulario

3. **Editar configuración**
   - [ ] Modificar JSON (agregar campo nuevo)
   - [ ] Guardar
   - [ ] Recargar vista
   - [ ] Verificar que aparece nuevo campo

4. **Validaciones**
   - [ ] Dejar campo obligatorio vacío → debe mostrar error
   - [ ] Ingresar número fuera de rango → debe mostrar error
   - [ ] Intentar subir archivo muy grande → debe rechazar
   - [ ] JSON inválido en editor → debe mostrar errores

5. **Templates**
   - [ ] Probar los 3 templates predefinidos
   - [ ] Verificar que se cargan correctamente
   - [ ] Modificar y guardar

---

**Tarea 7.3: Tests unitarios básicos** (2 horas)

**Archivo:** `frontend/src/components/DynamicView/__tests__/DynamicRenderer.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicRenderer } from '../DynamicRenderer';
import type { ConfigJson } from '../../../types/dynamic-view';

describe('DynamicRenderer', () => {
  const mockConfig: ConfigJson = {
    titulo: 'Test Form',
    secciones: [
      {
        titulo: 'Sección 1',
        componentes: [
          {
            tipo: 'TEXTO',
            label: 'Nombre',
            pregunta_id: 1,
            obligatorio: true
          }
        ]
      }
    ]
  };

  const mockOnSubmit = vi.fn();

  it('renderiza el título', () => {
    render(<DynamicRenderer config={mockConfig} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  it('muestra error en campo obligatorio vacío', async () => {
    render(<DynamicRenderer config={mockConfig} onSubmit={mockOnSubmit} />);
    
    const submitBtn = screen.getByText('Guardar');
    fireEvent.click(submitBtn);
    
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('permite enviar formulario válido', async () => {
    render(<DynamicRenderer config={mockConfig} onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText(/nombre/i);
    fireEvent.change(input, { target: { value: 'Juan Pérez' } });
    
    const submitBtn = screen.getByText('Guardar');
    fireEvent.click(submitBtn);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({ 1: 'Juan Pérez' });
  });
});
```

---

**Tarea 7.4: Documentación de uso** (1 hora)

**Archivo:** `frontend/DYNAMIC_VIEWS_MANUAL.md`

```markdown
# Manual de Uso - Vistas Dinámicas

## 📖 Introducción

El sistema de vistas dinámicas permite crear formularios personalizados para cada etapa del workflow sin necesidad de programar.

## 🚀 Inicio Rápido

### 1. Crear Vista desde Template

1. Abrir **WorkflowEditor**
2. Seleccionar una etapa
3. Click en **"🎨 Vista Dinámica"**
4. Elegir un template:
   - **Solicitud Básica**: Formulario con datos personales
   - **Revisión**: Para revisar documentos
   - **Aprobación**: Para aprobar/rechazar

5. Click **"Guardar Configuración"**

### 2. Personalizar Vista

Editar el JSON para agregar/modificar campos:

\`\`\`json
{
  "titulo": "Mi Formulario",
  "secciones": [
    {
      "titulo": "Datos Personales",
      "componentes": [
        {
          "tipo": "TEXTO",
          "label": "Nombre Completo",
          "pregunta_id": 1,
          "obligatorio": true
        }
      ]
    }
  ]
}
\`\`\`

### 3. Tipos de Componentes

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `TEXTO` | Entrada de texto | Nombre, dirección |
| `NUMERO` | Números con validación | Edad, cantidad |
| `FECHA` | Selector de fecha | Fecha nacimiento |
| `SELECT` | Lista desplegable | Estado civil |
| `ARCHIVO` | Subir archivos | Cédula PDF |

## ⚙️ Configuración Avanzada

### Opciones de Componentes

**TEXTO:**
\`\`\`json
{
  "tipo": "TEXTO",
  "config": {
    "placeholder": "Ej: Juan Pérez",
    "multiline": true,
    "maxLength": 500
  }
}
\`\`\`

**NUMERO:**
\`\`\`json
{
  "tipo": "NUMERO",
  "config": {
    "min": 18,
    "max": 100,
    "step": 1
  }
}
\`\`\`

**SELECT:**
\`\`\`json
{
  "tipo": "SELECT",
  "config": {
    "opciones": [
      { "valor": "APROBADO", "etiqueta": "Aprobado" },
      { "valor": "RECHAZADO", "etiqueta": "Rechazado" }
    ]
  }
}
\`\`\`

**ARCHIVO:**
\`\`\`json
{
  "tipo": "ARCHIVO",
  "config": {
    "tipos_permitidos": ["pdf", "jpg", "png"],
    "max_size_mb": 10,
    "max_archivos": 3
  }
}
\`\`\`

## 🔍 Troubleshooting

**Error: "Debe tener array 'secciones'"**
→ Falta la estructura básica. Usa un template como base.

**Error: "Campo obligatorio"**
→ El usuario debe llenar el campo antes de enviar.

**Componente no se muestra**
→ Verifica que `pregunta_id` sea único y el tipo esté escrito correctamente.
```

---

**✅ Entregables Días 7-8:**
- [x] Integración completa
- [x] Testing manual exhaustivo
- [x] Tests unitarios básicos
- [x] Manual de usuario

**⏰ Tiempo estimado:** 6 horas (2 días)

---

### 🗓️ DÍA 9-10 (Lunes-Martes 25-26 Nov) - Pulido y Entrega

**Objetivo:** Refinamiento, documentación técnica y demo

#### ✅ Checklist Días 9-10

**Tarea 9.1: Crear ejemplos de producción** (1.5 horas)

**Script:** `backend/scripts/seed_vista_configs.py`

```python
"""
Seed de configuraciones de vista para workflows reales
"""
import json
from app.database import SessionLocal
from app.models.workflow import VistaConfig, WorkflowEtapa

CONFIGS = [
    {
        "etapa_nombre": "Solicitud PPSH - Datos Personales",
        "config": {
            "titulo": "Solicitud de Permiso de Permanencia para Solicitante de Habilidad (PPSH)",
            "descripcion": "Complete los datos personales del solicitante",
            "secciones": [
                {
                    "titulo": "Información Personal",
                    "componentes": [
                        {"tipo": "TEXTO", "label": "Nombre Completo", "pregunta_id": 1, "obligatorio": True},
                        {"tipo": "TEXTO", "label": "Pasaporte", "pregunta_id": 2, "obligatorio": True},
                        {"tipo": "FECHA", "label": "Fecha de Nacimiento", "pregunta_id": 3, "obligatorio": True},
                        {"tipo": "SELECT", "label": "Género", "pregunta_id": 4, "obligatorio": True,
                         "config": {
                             "opciones": [
                                 {"valor": "M", "etiqueta": "Masculino"},
                                 {"valor": "F", "etiqueta": "Femenino"}
                             ]
                         }},
                    ]
                },
                {
                    "titulo": "Documentos Requeridos",
                    "componentes": [
                        {"tipo": "ARCHIVO", "label": "Pasaporte (copia)", "pregunta_id": 5, "obligatorio": True,
                         "config": {"tipos_permitidos": ["pdf"], "max_size_mb": 5}},
                        {"tipo": "ARCHIVO", "label": "Foto tamaño carnet", "pregunta_id": 6, "obligatorio": True,
                         "config": {"tipos_permitidos": ["jpg", "png"], "max_size_mb": 2}},
                    ]
                }
            ]
        }
    }
]

def seed():
    db = SessionLocal()
    try:
        for config_data in CONFIGS:
            # Buscar etapa por nombre
            etapa = db.query(WorkflowEtapa).filter(
                WorkflowEtapa.nombre == config_data["etapa_nombre"]
            ).first()
            
            if not etapa:
                print(f"⚠️ Etapa no encontrada: {config_data['etapa_nombre']}")
                continue
            
            # Crear o actualizar VistaConfig
            vista = db.query(VistaConfig).filter(VistaConfig.etapa_id == etapa.id).first()
            
            if vista:
                vista.config_json = json.dumps(config_data["config"], ensure_ascii=False)
                print(f"✅ Actualizado: {config_data['etapa_nombre']}")
            else:
                vista = VistaConfig(
                    etapa_id=etapa.id,
                    config_json=json.dumps(config_data["config"], ensure_ascii=False),
                    activo=True
                )
                db.add(vista)
                print(f"✅ Creado: {config_data['etapa_nombre']}")
        
        db.commit()
        print(f"\n✅ Seed completado: {len(CONFIGS)} configuraciones")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
```

---

**Tarea 9.2: Optimizaciones de rendimiento** (1.5 horas)

1. **Memoización de componentes:**

```typescript
// DynamicRenderer.tsx
import React, { memo } from 'react';

export const DynamicRenderer = memo<DynamicRendererProps>(({
  config,
  // ...
}) => {
  // ...
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config);
});
```

2. **Lazy loading de componentes:**

```typescript
// index.ts
export const TextInput = React.lazy(() => import('./TextInput'));
export const NumberInput = React.lazy(() => import('./NumberInput'));
// ...
```

3. **Cache de configuraciones:**

```typescript
// vista-config.service.ts
const cache = new Map<number, VistaConfig>();

async getByEtapaId(etapaId: number): Promise<VistaConfig | null> {
  if (cache.has(etapaId)) {
    return cache.get(etapaId)!;
  }
  
  const config = await axios.get<VistaConfig>(`${API_BASE}/etapas/${etapaId}/vista-config`);
  cache.set(etapaId, config.data);
  return config.data;
}
```

---

**Tarea 9.3: Documentación técnica completa** (2 horas)

**Archivo:** `frontend/DYNAMIC_VIEWS_TECH.md`

```markdown
# Documentación Técnica - Sistema de Vistas Dinámicas

## 🏗️ Arquitectura

### Backend

**Base de Datos:**
- Tabla: `workflow_vista_config`
- Campos: `id`, `etapa_id`, `config_json`, `activo`, timestamps
- Relación: FK a `workflow_etapas`

**API Endpoints:**
- `GET /api/v1/workflow/etapas/{id}/vista-config` - Obtener config por etapa
- `POST /api/v1/workflow/vistas-config` - Crear nueva config
- `PUT /api/v1/workflow/vistas-config/{id}` - Actualizar config
- `DELETE /api/v1/workflow/vistas-config/{id}` - Eliminar config

### Frontend

**Componentes:**
```
DynamicView/
├── DynamicRenderer.tsx      (Orquestador principal)
├── TextInput.tsx            (Componente TEXTO)
├── NumberInput.tsx          (Componente NUMERO)
├── DatePicker.tsx           (Componente FECHA)
├── SelectSimple.tsx         (Componente SELECT)
├── FileUpload.tsx           (Componente ARCHIVO)
└── JsonEditor.tsx           (Editor de configuración)
```

**Tipos:**
```typescript
ConfigJson
├── titulo?: string
├── descripcion?: string
└── secciones: Seccion[]
    ├── titulo: string
    ├── descripcion?: string
    └── componentes: Componente[]
        ├── tipo: TipoComponente
        ├── label: string
        ├── pregunta_id?: number
        ├── obligatorio?: boolean
        └── config?: ConfigComponente
```

## 🔄 Flujo de Datos

1. **Configuración:**
   WorkflowEditor → JsonEditor → vistaConfigService.create() → Backend → BD

2. **Renderizado:**
   Workflow.tsx → useDynamicView(etapaId) → vistaConfigService.getByEtapaId() → DynamicRenderer → Componentes

3. **Envío de Datos:**
   DynamicRenderer.handleSubmit() → FormData → Backend (TODO: Implementar endpoint)

## 🧪 Testing

**Unitarios:**
- `DynamicRenderer.test.tsx` - Renderizado y validación
- `TextInput.test.tsx` - Componente individual
- Comando: `npm test`

**Integración:**
- Flujo completo crear → renderizar → guardar
- Validar templates

## 📊 Métricas de Rendimiento

- Tiempo de carga de config: < 200ms
- Renderizado inicial: < 500ms
- Validación formulario: < 100ms

## 🚀 Roadmap Futuro (v2.0)

- [ ] Editor visual drag & drop
- [ ] Más componentes (RadioGroup, Checkbox, DateRange)
- [ ] Lógica condicional (mostrar/ocultar campos)
- [ ] Validaciones personalizadas
- [ ] Cálculos automáticos
- [ ] Exportación a PDF
- [ ] Versionado de configuraciones
```

---

**Tarea 9.4: Video demo** (1 hora)

Grabar screencast mostrando:

1. Crear workflow nuevo
2. Configurar vista dinámica con template
3. Personalizar JSON (agregar campo)
4. Guardar configuración
5. Acceder a formulario como usuario
6. Llenar y enviar
7. Validaciones funcionando

---

**✅ Entregables Días 9-10:**
- [x] Script de seed con datos reales
- [x] Optimizaciones aplicadas
- [x] Documentación técnica completa
- [x] Manual de usuario
- [x] Video demo
- [x] Tests pasando

**⏰ Tiempo estimado:** 6 horas (2 días)

---

## 📋 Checklist Final

### Backend
- [x] Migración Alembic ejecutada
- [x] Modelo `VistaConfig` creado
- [x] 3 endpoints REST funcionales
- [x] Servicio CRUD implementado
- [x] Tests del servicio

### Frontend
- [x] 5 componentes renderizables
- [x] `DynamicRenderer` funcional
- [x] `JsonEditor` funcional
- [x] `useDynamicView` hook
- [x] 3 templates predefinidos
- [x] Integrado en `WorkflowEditor`
- [x] Integrado en `Workflow.tsx`
- [x] Tests unitarios

### Documentación
- [x] Manual de usuario
- [x] Documentación técnica
- [x] Scripts de seed
- [x] Video demo

### Testing
- [x] Pruebas manuales completas
- [x] Validaciones funcionando
- [x] Templates probados
- [x] Tests automatizados pasando

---

## 🎯 Resultado Final

**¿Qué se logró en 10 días?**

✅ Sistema funcional de vistas dinámicas sin hardcodear  
✅ 5 tipos de componentes configurables  
✅ Editor JSON simple y efectivo  
✅ 3 templates listos para usar  
✅ Integración completa con workflow existente  
✅ Documentación y ejemplos  

**¿Qué NO se hizo (para v2.0)?**

❌ Editor visual drag & drop  
❌ Componentes avanzados (30+ tipos)  
❌ Lógica condicional compleja  
❌ Base de datos normalizada (3 tablas)  

**¿Por qué este enfoque funciona?**

✔️ **Rápido**: 10 días vs 30 días  
✔️ **Simple**: 1 tabla JSON vs 3 tablas  
✔️ **Funcional**: Cubre 80% de casos de uso  
✔️ **Iterativo**: Fácil evolucionar a v2.0  

---

## 🚀 Evolución Futura

### v1.1 (Siguiente sprint, si se necesita)
- Más componentes (RadioGroup, Checkbox)
- Validaciones personalizadas
- Preview en tiempo real

### v2.0 (Si escala el proyecto)
- Editor visual
- Base de datos normalizada
- Lógica condicional
- Versiones de configuraciones

---

**📅 Cronograma Total: 10 días (13-26 Nov 2025)**

**💡 Filosofía MVP:** *"Funcional hoy, perfecto mañana"*
```sql
CREATE TABLE workflow_vista_config (
    id INT PRIMARY KEY IDENTITY,
    etapa_id INT REFERENCES workflow_etapas(id),
    config_json NVARCHAR(MAX),  -- Todo en JSON
    activo BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
```

**Tarea 2: Modelo y Schema mínimo**
```python
# backend/app/models/vista_config.py
class VistaConfig(Base):
    __tablename__ = 'workflow_vista_config'
    id = Column(Integer, primary_key=True)
    etapa_id = Column(Integer, ForeignKey('workflow_etapas.id'))
    config_json = Column(JSON)  # TODO EN JSON
    activo = Column(Boolean, default=True)

# backend/app/schemas/vista_config.py
class VistaConfigSchema(BaseModel):
    etapa_id: int
    config_json: dict
```

**Tarea 3: CRUD básico (3 endpoints)**
```python
GET  /api/v1/workflow/etapas/{etapa_id}/vista-config
POST /api/v1/workflow/vistas-config
PUT  /api/v1/workflow/vistas-config/{id}
```

**✅ Entregable Día 1-2:**
- 1 tabla en BD
- 2 modelos/schemas
- 3 endpoints REST
- **Tiempo:** 12 horas

---

#### DÍA 3-4 (Nov 15-16) - Frontend: Types + Renderer

**Tarea 1: Tipos TypeScript mínimos**
```typescript
// types/dynamic-view.ts
export interface VistaConfig {
  etapa_id: number;
  config_json: {
    titulo?: string;
    secciones: Seccion[];
  };
}

export interface Seccion {
  titulo: string;
  componentes: Componente[];
}

export interface Componente {
  tipo: 'TEXTO' | 'NUMERO' | 'FECHA' | 'ARCHIVO' | 'SELECT';
  label: string;
  pregunta_id?: number;
  config?: any;
}
```

**Tarea 2: DynamicRenderer súper simple**
```tsx
export const DynamicRenderer = ({ etapaId }) => {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    // Cargar config desde API
    fetch(`/api/v1/workflow/etapas/${etapaId}/vista-config`)
      .then(r => r.json())
      .then(setConfig);
  }, [etapaId]);
  
  if (!config) return <Loading />;
  
  return (
    <Box>
      <Typography variant="h4">{config.config_json.titulo}</Typography>
      {config.config_json.secciones.map(seccion => (
        <Card key={seccion.titulo}>
          <CardHeader title={seccion.titulo} />
          <CardContent>
            {seccion.componentes.map(comp => (
              <ComponenteRenderer key={comp.label} componente={comp} />
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
```

**Tarea 3: 5 componentes básicos SOLAMENTE**
- TextInput
- NumberInput  
- DatePicker
- SelectSimple
- FileUpload

**✅ Entregable Día 3-4:**
- Types TypeScript
- DynamicRenderer funcional
- 5 componentes reutilizables
- **Tiempo:** 12 horas

---

### SEMANA 2: Editor JSON + Integración

#### DÍA 5-6 (Nov 18-19) - Editor JSON Manual

**NO crear UI sofisticada, solo editor de texto JSON**

```tsx
export const VistaJsonEditor = ({ etapa }) => {
  const [json, setJson] = useState('');
  
  const templateExample = {
    titulo: 'Mi Vista',
    secciones: [
      {
        titulo: 'Datos Personales',
        componentes: [
          { tipo: 'TEXTO', label: 'Nombre', pregunta_id: 1 },
          { tipo: 'FECHA', label: 'Fecha Nacimiento', pregunta_id: 2 }
        ]
      }
    ]
  };
  
  return (
    <Box>
      <Typography variant="h6">Editor de Vista (JSON)</Typography>
      
      {/* Botón para cargar template */}
      <Button onClick={() => setJson(JSON.stringify(templateExample, null, 2))}>
        Cargar Template
      </Button>
      
      {/* Editor de texto simple */}
      <TextField
        multiline
        fullWidth
        rows={20}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder="Pegar JSON aquí..."
      />
      
      {/* Guardar */}
      <Button onClick={() => guardarConfig(etapa.id, JSON.parse(json))}>
        Guardar
      </Button>
    </Box>
  );
};
```

**✅ Entregable Día 5-6:**
- Editor JSON simple
- 3 templates predefinidos
- Validación básica de JSON
- **Tiempo:** 12 horas

---

#### DÍA 7-8 (Nov 20-21) - Integración + Testing

**Tarea 1: Integrar en WorkflowEditor**
```tsx
// Añadir tab simple en EtapaConfigPanel
<Tabs>
  <Tab label="General" />
  <Tab label="Preguntas" />
  <Tab label="Vista (JSON)" /> {/* NUEVO */}
</Tabs>

<TabPanel value={2}>
  <VistaJsonEditor etapa={etapa} />
</TabPanel>
```

**Tarea 2: Data binding básico**
```typescript
// Cargar respuestas existentes
const loadFormData = async (procesoId) => {
  const respuestas = await api.getRespuestas(procesoId);
  const formData = {};
  
  config.secciones.forEach(seccion => {
    seccion.componentes.forEach(comp => {
      if (comp.pregunta_id) {
        const resp = respuestas.find(r => r.pregunta_id === comp.pregunta_id);
        formData[comp.pregunta_id] = resp?.valor;
      }
    });
  });
  
  return formData;
};
```

**Tarea 3: Tests básicos**
- Renderizar vista con 1 sección
- Guardar respuestas
- Validaciones simples

**✅ Entregable Día 7-8:**
- Integración completa
- Data binding funcional
- Tests básicos
- **Tiempo:** 12 horas

---

#### DÍA 9-10 (Nov 22-23) - Documentación + Demo

**Tarea 1: Documentación**
```markdown
# VISTAS_DINAMICAS_MVP.md

## Cómo crear una vista dinámica

1. Ir a WorkflowEditor
2. Seleccionar etapa
3. Tab "Vista (JSON)"
4. Pegar JSON:

{
  "titulo": "Solicitud PPSH",
  "secciones": [...]
}

5. Guardar

## Tipos de componentes disponibles

- TEXTO: Input de texto
- NUMERO: Input numérico
- FECHA: Date picker
- SELECT: Dropdown
- ARCHIVO: Upload

## Ejemplo completo

[Ver ejemplos/solicitud_basica.json]
```

**Tarea 2: Crear 3 ejemplos reales**
- Solicitud PPSH básica
- Revisión de documentos
- Aprobación simple

**Tarea 3: Video demo 5 minutos**

**✅ Entregable Día 9-10:**
- Documentación completa
- 3 ejemplos JSON
- Video demo
- **Tiempo:** 12 horas

---

## 📊 Comparación: Plan Original vs MVP

| Aspecto | Plan Original (6 semanas) | Plan MVP (2 semanas) |
|---------|---------------------------|----------------------|
| **Complejidad** | Alta | Baja |
| **Tablas BD** | 3 tablas normalizadas | 1 tabla (JSON) |
| **Endpoints** | 12 REST completos | 3 básicos |
| **Componentes** | 20+ tipos | 5 esenciales |
| **Editor** | UI visual sofisticado | JSON editor simple |
| **Dependencias** | Sistema complejo | No incluido |
| **Validaciones** | Motor avanzado | Básicas |
| **Testing** | Suite completa | Tests mínimos |
| **Líneas código** | ~5000 | ~1500 |
| **Riesgo** | Alto | Bajo |
| **Time to Market** | 6 semanas | 10 días |

---

## ✅ Ventajas del Plan MVP

### Para el Negocio
- ✅ **Entrega rápida**: 10 días vs 6 semanas
- ✅ **Menor riesgo**: Código simple, menos bugs
- ✅ **Feedback temprano**: Usuarios prueban antes
- ✅ **Iterativo**: Mejoras basadas en uso real

### Para el Equipo
- ✅ **Menos presión**: Timeline realista
- ✅ **Aprendizaje gradual**: Complejidad incremental
- ✅ **Fácil de mantener**: Código simple
- ✅ **Refactoring seguro**: Base sólida para mejorar

### Técnicas
- ✅ **JSON flexible**: Fácil cambiar estructura
- ✅ **Sin migrations complejas**: 1 tabla JSON
- ✅ **Plug & play**: Añadir componentes después
- ✅ **Backward compatible**: No rompe nada

---

## 🔄 Plan de Evolución Post-MVP

### Versión 1.0 (MVP - 2 semanas)
- ✅ 1 tabla JSON
- ✅ 5 componentes básicos
- ✅ Editor JSON manual
- ✅ Integración básica

### Versión 1.1 (Sprint siguiente - 1 semana)
- ➕ 5 componentes adicionales
- ➕ Validaciones mejoradas
- ➕ Templates más completos

### Versión 1.2 (Mes 2 - 2 semanas)
- ➕ Editor UI básico (Form builder simple)
- ➕ Preview en tiempo real
- ➕ Dependencias simples

### Versión 2.0 (Mes 3 - 3 semanas)
- ➕ Normalizar BD (3 tablas)
- ➕ Sistema de dependencias completo
- ➕ 15+ componentes
- ➕ Editor visual drag & drop

**Criterio de evolución:** Solo mejorar cuando MVP esté en producción y usuarios lo usen

---

## 📝 Estructura Ejemplo JSON (MVP)

```json
{
  "titulo": "Solicitud de Permiso PPSH",
  "descripcion": "Complete los datos del solicitante",
  "secciones": [
    {
      "titulo": "Información Personal",
      "descripcion": "Datos básicos del solicitante",
      "componentes": [
        {
          "tipo": "TEXTO",
          "label": "Nombre Completo",
          "pregunta_id": 1,
          "obligatorio": true,
          "config": {
            "placeholder": "Ingrese su nombre"
          }
        },
        {
          "tipo": "NUMERO",
          "label": "Cédula",
          "pregunta_id": 2,
          "obligatorio": true,
          "config": {
            "min": 0,
            "pattern": "\\d{1,2}-\\d{3,4}-\\d{4,5}"
          }
        },
        {
          "tipo": "FECHA",
          "label": "Fecha de Nacimiento",
          "pregunta_id": 3,
          "obligatorio": true
        }
      ]
    },
    {
      "titulo": "Documentos",
      "componentes": [
        {
          "tipo": "ARCHIVO",
          "label": "Cédula (Foto)",
          "pregunta_id": 4,
          "obligatorio": true,
          "config": {
            "tipos": ["pdf", "jpg", "png"],
            "max_size_mb": 10,
            "max_files": 2
          }
        }
      ]
    }
  ]
}
```

---

## 🎯 Criterios de Éxito MVP

### Mínimo Aceptable (Must Have)
- [ ] Crear vista desde JSON en <5 minutos
- [ ] Renderizar vista con 5 tipos de componentes
- [ ] Guardar/cargar respuestas correctamente
- [ ] Funcionar en 3 flujos diferentes sin cambiar código
- [ ] Documentación clara de cómo usarlo

### Deseable (Nice to Have - Post MVP)
- [ ] Editor UI (puede ser Fase 2)
- [ ] 10+ tipos de componentes (agregar gradualmente)
- [ ] Validaciones avanzadas (iterar después)
- [ ] Dependencias (v2.0)

---

## 💡 Recomendación Final

### ✅ **APROBAR Plan MVP (2 semanas)**

**Razones:**
1. **Cumple el objetivo**: Evita hardcodear vistas
2. **Tiempo realista**: 10 días hábiles ejecutables
3. **Riesgo controlado**: Código simple, menos bugs
4. **Escalable**: JSON permite crecer sin refactor
5. **Feedback rápido**: Usuarios lo prueban antes

### ❌ **POSPONER Plan Original (6 semanas)**

**Razones:**
1. **Over-engineering** para MVP
2. **Timeline muy ambicioso** (riesgo de retraso)
3. **Features no críticos** (drag&drop, 20 componentes)
4. **Mejor iterar** después de validar con usuarios

---

## 📅 Propuesta de Ejecución

### Opción A: Solo MVP (RECOMENDADO)
```
Semana 1: Backend + Renderer (4 días)
Semana 2: Editor + Integración (4 días)
Buffer: 2 días para imprevistos
Total: 10 días hábiles
```

### Opción B: MVP + Mejoras Incrementales
```
Sprint 1 (2 semanas): MVP básico
Sprint 2 (1 semana): +5 componentes
Sprint 3 (1 semana): Editor UI básico
Sprint 4 (2 semanas): Features avanzados (según feedback)
Total: 6 semanas pero incremental
```

---

## 🚦 Decisión

**¿Cuál plan ejecutar?**

- **Plan MVP (2 semanas)**: ✅ Rápido, bajo riesgo, suficiente para MVP
- **Plan Original (6 semanas)**: ⚠️ Completo pero arriesgado para MVP
- **Plan Híbrido (4 semanas)**: ⚖️ MVP + algunas features del original

**Mi recomendación profesional:**

👉 **Ejecutar Plan MVP (2 semanas)**, validar con usuarios reales, y luego iterar basado en feedback. Es la forma más ágil y menos riesgosa.

---

**Creado:** Noviembre 12, 2025  
**Versión:** 1.0  
**Estado:** 🟢 Propuesta para aprobación  
**Siguiente paso:** Decisión stakeholders
