"""
Modelos para el sistema de OCR (Optical Character Recognition)
Sistema de Trámites Migratorios de Panamá

Tablas:
- PPSH_DOCUMENTO_OCR: Resultados de procesamiento OCR
- PPSH_DOCUMENTO_OCR_HISTORIAL: Historial de re-procesamientos
"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, BigInteger,
    ForeignKey, Text, DECIMAL, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.infrastructure.database import Base


class PPSHDocumentoOCR(Base):
    """Resultados de procesamiento OCR de documentos"""
    __tablename__ = "PPSH_DOCUMENTO_OCR"

    id_ocr = Column(BigInteger, primary_key=True, index=True)
    id_documento = Column(
        Integer, 
        ForeignKey('PPSH_DOCUMENTO.id_documento'), 
        nullable=False, 
        index=True
    )
    
    # Estado del procesamiento
    estado_ocr = Column(
        String(20), 
        nullable=False, 
        default='PENDIENTE',
        index=True
    )
    # Valores: PENDIENTE, PROCESANDO, COMPLETADO, ERROR, CANCELADO
    
    # Contenido extraído
    texto_extraido = Column(Text)
    texto_confianza = Column(DECIMAL(5, 2))  # 0-100%
    
    # Metadata del OCR
    idioma_detectado = Column(String(10))
    num_paginas = Column(Integer)
    num_caracteres = Column(Integer)
    num_palabras = Column(Integer)
    
    # Datos estructurados extraídos (JSON)
    datos_estructurados = Column(Text)  # JSON con campos específicos por tipo doc
    
    # Control de procesamiento Celery
    celery_task_id = Column(String(255), index=True)
    intentos_procesamiento = Column(Integer, default=0)
    fecha_inicio_proceso = Column(DateTime)
    fecha_fin_proceso = Column(DateTime)
    tiempo_procesamiento_ms = Column(Integer)
    
    # Errores
    codigo_error = Column(String(50))
    mensaje_error = Column(String(1000))
    
    # Auditoría
    created_by = Column(String(17), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now(), index=True)
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relaciones
    documento = relationship("PPSHDocumento", back_populates="ocr_results")
    historial = relationship(
        "PPSHDocumentoOCRHistorial", 
        back_populates="ocr_actual",
        cascade="all, delete-orphan"
    )
    
    # Índices compuestos
    __table_args__ = (
        Index('IX_OCR_Estado_Fecha', 'estado_ocr', 'created_at'),
        Index('IX_OCR_Documento_Estado', 'id_documento', 'estado_ocr'),
    )
    
    def __repr__(self):
        return f"<OCR(id={self.id_ocr}, doc={self.id_documento}, estado={self.estado_ocr})>"


class PPSHDocumentoOCRHistorial(Base):
    """Historial de re-procesamientos OCR"""
    __tablename__ = "PPSH_DOCUMENTO_OCR_HISTORIAL"

    id_historial = Column(BigInteger, primary_key=True, index=True)
    id_ocr = Column(
        BigInteger, 
        ForeignKey('PPSH_DOCUMENTO_OCR.id_ocr'), 
        nullable=False,
        index=True
    )
    version = Column(Integer, nullable=False)
    
    # Copia del texto extraído en esta versión
    texto_extraido = Column(Text)
    texto_confianza = Column(DECIMAL(5, 2))
    
    # Metadata
    procesado_en = Column(DateTime, nullable=False, default=func.now(), index=True)
    procesado_por = Column(String(17))
    motivo_reproceso = Column(String(500))
    opciones_utilizadas = Column(Text)  # JSON con opciones del procesamiento
    
    # Relación
    ocr_actual = relationship("PPSHDocumentoOCR", back_populates="historial")
    
    def __repr__(self):
        return f"<OCRHistorial(id={self.id_historial}, version={self.version})>"
