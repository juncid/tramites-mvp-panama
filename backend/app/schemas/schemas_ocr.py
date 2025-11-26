"""
Schemas Pydantic para el servicio de OCR
Sistema de Trámites Migratorios de Panamá
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from decimal import Decimal
from pydantic import BaseModel, Field, validator
from enum import Enum


class EstadoOCREnum(str, Enum):
    """Estados posibles del procesamiento OCR"""
    PENDIENTE = "PENDIENTE"
    PROCESANDO = "PROCESANDO"
    COMPLETADO = "COMPLETADO"
    ERROR = "ERROR"
    CANCELADO = "CANCELADO"


class PrioridadEnum(str, Enum):
    """Prioridades de procesamiento"""
    ALTA = "alta"
    NORMAL = "normal"
    BAJA = "baja"


class OpcionesPreprocesamientoOCR(BaseModel):
    """Opciones de preprocesamiento de imagen"""
    binarizar: bool = Field(default=True, description="Aplicar binarización Otsu")
    denoise: bool = Field(default=True, description="Reducir ruido")
    mejorar_contraste: bool = Field(default=True, description="Mejorar contraste con CLAHE")
    deskew: bool = Field(default=False, description="Corregir inclinación")
    resize_factor: Optional[float] = Field(
        default=None, 
        ge=0.5, 
        le=3.0,
        description="Factor de escala (0.5-3.0)"
    )


class OCRRequest(BaseModel):
    """Request para iniciar procesamiento OCR"""
    idioma: str = Field(
        default="spa+eng",
        description="Idiomas para OCR (formato Tesseract: 'spa', 'eng', 'spa+eng')"
    )
    prioridad: PrioridadEnum = Field(
        default=PrioridadEnum.NORMAL,
        description="Prioridad de procesamiento (alta, normal, baja)"
    )
    # Opciones de preprocesamiento directas (compatibilidad con frontend)
    binarizar: bool = Field(default=True, description="Aplicar binarización Otsu")
    denoise: bool = Field(default=True, description="Reducir ruido")
    mejorar_contraste: bool = Field(default=True, description="Mejorar contraste con CLAHE")
    deskew: bool = Field(default=False, description="Corregir inclinación")
    resize_factor: Optional[float] = Field(
        default=None, 
        ge=0.5, 
        le=3.0,
        description="Factor de escala (0.5-3.0)"
    )
    extraer_datos_estructurados: bool = Field(
        default=True,
        description="Intentar extraer datos estructurados según tipo de documento"
    )
    motivo_reprocesamiento: Optional[str] = Field(
        default=None,
        description="Motivo del reprocesamiento (solo para endpoint /reprocesar)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "idioma": "spa+eng",
                "prioridad": "normal",
                "binarizar": True,
                "denoise": True,
                "mejorar_contraste": True,
                "deskew": False,
                "extraer_datos_estructurados": True
            }
        }


class OCRResponse(BaseModel):
    """Respuesta al iniciar procesamiento OCR"""
    success: bool
    message: str
    task_id: str = Field(description="ID de tarea Celery para seguimiento")
    id_documento: int
    id_ocr: Optional[int] = Field(default=None, description="ID del registro OCR creado")
    estado: EstadoOCREnum
    tiempo_estimado_segundos: Optional[int] = Field(
        default=30,
        description="Tiempo estimado de procesamiento"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Procesamiento OCR iniciado exitosamente",
                "task_id": "a7f8d9e0-1234-5678-90ab-cdef12345678",
                "id_documento": 123,
                "id_ocr": 456,
                "estado": "PENDIENTE",
                "tiempo_estimado_segundos": 30
            }
        }


class OCRProgressInfo(BaseModel):
    """Información de progreso del procesamiento"""
    current: int = Field(description="Paso actual")
    total: int = Field(description="Total de pasos")
    status: str = Field(description="Descripción del paso actual")
    porcentaje: Optional[int] = Field(default=None, description="Porcentaje completado (0-100)")


class OCRStatus(BaseModel):
    """Estado actual de una tarea OCR"""
    task_id: str
    estado: str = Field(description="Estado: PENDIENTE, PROCESANDO, COMPLETADO, ERROR, CANCELADO")
    porcentaje_completado: int = Field(ge=0, le=100, description="Porcentaje de progreso (0-100)")
    mensaje: str = Field(description="Mensaje descriptivo del estado actual")
    paso_actual: Optional[int] = Field(default=None, description="Paso actual del procesamiento")
    total_pasos: Optional[int] = Field(default=None, description="Total de pasos")
    id_documento: Optional[int] = Field(default=None, description="ID del documento procesado")
    id_ocr: Optional[int] = Field(default=None, description="ID del registro OCR")
    confianza_promedio: Optional[float] = Field(default=None, description="Confianza promedio del OCR")
    tiempo_procesamiento_ms: Optional[int] = Field(default=None, description="Tiempo de procesamiento en ms")
    codigo_error: Optional[str] = Field(default=None, description="Código de error si falló")
    
    class Config:
        json_schema_extra = {
            "example": {
                "task_id": "a7f8d9e0-1234-5678-90ab-cdef12345678",
                "estado": "PROCESANDO",
                "porcentaje_completado": 75,
                "mensaje": "Extrayendo texto con OCR...",
                "paso_actual": 3,
                "total_pasos": 4,
                "id_documento": 123,
                "id_ocr": None,
                "confianza_promedio": None,
                "tiempo_procesamiento_ms": None,
                "codigo_error": None
            }
        }


class DatosEstructurados(BaseModel):
    """Datos estructurados extraídos del documento"""
    campos: Dict[str, Any] = Field(
        default_factory=dict,
        description="Campos extraídos según tipo de documento"
    )
    confianza_campos: Optional[Dict[str, float]] = Field(
        default=None,
        description="Confianza de cada campo extraído (0-100)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "campos": {
                    "numero_pasaporte": "AB1234567",
                    "nombres": "JUAN CARLOS",
                    "apellidos": "PEREZ GOMEZ",
                    "fecha_nacimiento": "15/03/1985",
                    "nacionalidad": "PAN"
                },
                "confianza_campos": {
                    "numero_pasaporte": 95.5,
                    "nombres": 88.2,
                    "apellidos": 92.1
                }
            }
        }


class OCRResultado(BaseModel):
    """Resultado completo del procesamiento OCR"""
    id_ocr: int
    id_documento: int
    estado_ocr: EstadoOCREnum
    
    # Contenido extraído
    texto_extraido: Optional[str] = None
    texto_confianza: Optional[Decimal] = Field(default=None, description="Confianza del OCR (0-100)")
    
    # Metadata
    idioma_detectado: Optional[str] = None
    num_paginas: Optional[int] = None
    num_caracteres: Optional[int] = None
    num_palabras: Optional[int] = None
    
    # Datos estructurados
    datos_estructurados: Optional[DatosEstructurados] = None
    
    # Procesamiento
    celery_task_id: Optional[str] = None
    intentos_procesamiento: int = 0
    fecha_inicio_proceso: Optional[datetime] = None
    fecha_fin_proceso: Optional[datetime] = None
    tiempo_procesamiento_ms: Optional[int] = None
    
    # Errores
    codigo_error: Optional[str] = None
    mensaje_error: Optional[str] = None
    
    # Auditoría
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @validator('datos_estructurados', pre=True)
    def parse_datos_estructurados(cls, v):
        """Parsear JSON string a objeto"""
        if isinstance(v, str):
            import json
            try:
                datos = json.loads(v)
                return DatosEstructurados(campos=datos)
            except:
                return None
        return v
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id_ocr": 456,
                "id_documento": 123,
                "estado_ocr": "COMPLETADO",
                "texto_extraido": "REPÚBLICA DE PANAMÁ\nPASAPORTE...",
                "texto_confianza": 92.5,
                "idioma_detectado": "spa",
                "num_caracteres": 1250,
                "num_palabras": 185,
                "datos_estructurados": {
                    "campos": {
                        "numero_pasaporte": "AB1234567",
                        "nombres": "JUAN CARLOS"
                    }
                },
                "tiempo_procesamiento_ms": 2500,
                "created_by": "SYSTEM",
                "created_at": "2025-11-01T10:30:00"
            }
        }


class OCRResultadoLista(BaseModel):
    """Lista de resultados OCR"""
    total: int
    resultados: List[OCRResultado]


class OCRHistorialItem(BaseModel):
    """Item del historial de reprocesamiento"""
    id_historial: int
    id_ocr: int
    version: int
    texto_confianza: Optional[Decimal] = None
    procesado_en: datetime
    procesado_por: Optional[str] = None
    motivo_reproceso: Optional[str] = None
    
    class Config:
        from_attributes = True


class OCRReprocesarRequest(BaseModel):
    """Request para reprocesar un documento"""
    motivo: str = Field(description="Motivo del reprocesamiento")
    opciones: Optional[OCRRequest] = Field(default=None, description="Nuevas opciones de procesamiento")
    
    class Config:
        json_schema_extra = {
            "example": {
                "motivo": "Mejorar calidad del texto extraído",
                "opciones": {
                    "idioma": "spa",
                    "preprocessing": {
                        "binarizar": True,
                        "denoise": True,
                        "mejorar_contraste": True,
                        "deskew": True
                    }
                }
            }
        }


class OCREstadisticas(BaseModel):
    """Estadísticas del sistema OCR"""
    total_procesados: int
    total_exitosos: int
    total_errores: int
    total_pendientes: int
    confianza_promedio: Optional[Decimal] = None
    tiempo_promedio_ms: Optional[int] = None
    documentos_por_estado: Dict[str, int]
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_procesados": 1500,
                "total_exitosos": 1420,
                "total_errores": 50,
                "total_pendientes": 30,
                "confianza_promedio": 89.5,
                "tiempo_promedio_ms": 2300,
                "documentos_por_estado": {
                    "COMPLETADO": 1420,
                    "ERROR": 50,
                    "PENDIENTE": 30
                }
            }
        }
