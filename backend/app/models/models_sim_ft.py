"""
Modelos SQLAlchemy para el Sistema Integrado de Migración (SIM)
Módulo de Flujo de Trámites (SIM_FT_*)

Este módulo define las tablas del sistema formal de trámites según
las convenciones del Sistema Integrado de Migración de Panamá.

Estructura:
- Tablas Principales Transaccionales: SIM_FT_TRAMITE_E, SIM_FT_TRAMITE_D
- Tablas de Catálogo: SIM_FT_TRAMITES, SIM_FT_PASOS, etc.
- Tablas de Cierre: SIM_FT_TRAMITE_CIERRE, SIM_FT_DEPENDTE_CIERRE

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-22
"""

from sqlalchemy import (
    Column, Integer, String, DateTime, Text, 
    ForeignKey, PrimaryKeyConstraint, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.infrastructure import Base


# ==========================================
# TABLAS DE CATÁLOGO Y REFERENCIA
# ==========================================

class SimFtTramites(Base):
    """
    SIM_FT_TRAMITES: Catálogo de tipos de trámites disponibles
    Define los diferentes tipos de trámites que pueden ser procesados
    """
    __tablename__ = "SIM_FT_TRAMITES"

    COD_TRAMITE = Column(String(10), primary_key=True, comment='Código que identifica el tipo de trámite')
    DESC_TRAMITE = Column(String(500), nullable=False, comment='Descripción del trámite')
    PAG_TRAMITE = Column(String(255), nullable=True, comment='Página web asociada al trámite')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True, comment='Usuario que creó el registro')
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now(), comment='Fecha de creación')
    ID_USUARIO_MODIF = Column(String(17), nullable=True, comment='Usuario que modificó el registro')
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now(), comment='Fecha de modificación')
    
    # Relaciones
    tramites_encabezado = relationship("SimFtTramiteE", back_populates="tipo_tramite")
    pasos = relationship("SimFtPasos", back_populates="tramite")
    pasos_configuracion = relationship("SimFtPasoXTram", back_populates="tramite")


class SimFtPasos(Base):
    """
    SIM_FT_PASOS: Define los pasos genéricos para cada tipo de trámite
    """
    __tablename__ = "SIM_FT_PASOS"
    __table_args__ = (
        PrimaryKeyConstraint('COD_TRAMITE', 'NUM_PASO'),
        Index('IX_SIM_FT_PASOS_IND_ACTIVO', 'IND_ACTIVO'),
    )

    COD_TRAMITE = Column(String(10), ForeignKey('SIM_FT_TRAMITES.COD_TRAMITE'), nullable=False, comment='Tipo de trámite')
    NUM_PASO = Column(Integer, nullable=False, comment='Número del paso')
    NOM_DESCRIPCION = Column(String(255), nullable=False, comment='Nombre/descripción del paso')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    ID_USUARIO_MODIF = Column(String(17), nullable=True)
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now())
    
    # Relaciones
    tramite = relationship("SimFtTramites", back_populates="pasos")
    # Nota: configuracion y detalles_tramite requieren joins complejos por claves compuestas
    # Se recomienda usar queries manuales para estas relaciones


class SimFtPasoXTram(Base):
    """
    SIM_FT_PASOXTRAM: Configura la secuencia lógica del flujo
    Define qué sección es responsable de cada paso y cuál es el siguiente paso
    """
    __tablename__ = "SIM_FT_PASOXTRAM"
    __table_args__ = (
        PrimaryKeyConstraint('COD_TRAMITE', 'NUM_PASO'),
        Index('IX_SIM_FT_PASOXTRAM_COD_SECCION', 'COD_SECCION'),
    )

    COD_TRAMITE = Column(String(10), ForeignKey('SIM_FT_TRAMITES.COD_TRAMITE'), nullable=False, comment='Tipo de trámite')
    NUM_PASO = Column(Integer, nullable=False, comment='Paso actual')
    COD_SECCION = Column(String(4), nullable=False, comment='Sección responsable')
    ID_PASO_SGTE = Column(Integer, nullable=True, comment='Paso siguiente')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    ID_USUARIO_MODIF = Column(String(17), nullable=True)
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now())
    
    # Relaciones
    tramite = relationship("SimFtTramites", back_populates="pasos_configuracion")
    # Nota: paso_definicion requiere join complejo por clave compuesta (COD_TRAMITE, NUM_PASO)


class SimFtEstatus(Base):
    """
    SIM_FT_ESTATUS: Catálogo de estados posibles de un trámite
    """
    __tablename__ = "SIM_FT_ESTATUS"

    COD_ESTATUS = Column(String(2), primary_key=True, comment='Código del estado')
    NOM_ESTATUS = Column(String(100), nullable=False, comment='Nombre del estado')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    ID_USUARIO_MODIF = Column(String(17), nullable=True)
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now())


class SimFtConclusion(Base):
    """
    SIM_FT_CONCLUSION: Tipos de conclusión de un trámite
    """
    __tablename__ = "SIM_FT_CONCLUSION"

    COD_CONCLUSION = Column(String(2), primary_key=True, comment='Código de conclusión')
    NOM_CONCLUSION = Column(String(100), nullable=False, comment='Nombre de la conclusión')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    ID_USUARIO_MODIF = Column(String(17), nullable=True)
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now())


class SimFtPrioridad(Base):
    """
    SIM_FT_PRIORIDAD: Niveles de prioridad aplicables a un trámite
    """
    __tablename__ = "SIM_FT_PRIORIDAD"

    COD_PRIORIDAD = Column(String(1), primary_key=True, comment='Código de prioridad')
    NOM_PRIORIDAD = Column(String(50), nullable=False, comment='Nombre de la prioridad')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    ID_USUARIO_MODIF = Column(String(17), nullable=True)
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now())


class SimFtUsuaSec(Base):
    """
    SIM_FT_USUA_SEC: Asigna usuarios a secciones y agencias
    Define qué usuarios son responsables de qué secciones y agencias
    """
    __tablename__ = "SIM_FT_USUA_SEC"
    __table_args__ = (
        PrimaryKeyConstraint('ID_USUARIO', 'COD_SECCION', 'COD_AGENCIA'),
        Index('IX_SIM_FT_USUA_SEC_COD_SECCION', 'COD_SECCION'),
        Index('IX_SIM_FT_USUA_SEC_COD_AGENCIA', 'COD_AGENCIA'),
    )

    ID_USUARIO = Column(String(17), nullable=False, comment='Identificador del usuario')
    COD_SECCION = Column(String(4), nullable=False, comment='Código de sección')
    COD_AGENCIA = Column(String(4), nullable=False, comment='Código de agencia')
    IND_ACTIVO = Column(String(1), nullable=False, server_default='S', comment='Indicador de activo (S/N)')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    ID_USUARIO_MODIF = Column(String(17), nullable=True)
    FEC_MODIF_REG = Column(DateTime, nullable=True, onupdate=func.now())


# ==========================================
# TABLAS PRINCIPALES TRANSACCIONALES
# ==========================================

class SimFtTramiteE(Base):
    """
    SIM_FT_TRAMITE_E: Encabezado del Trámite (Transaccional)
    Almacena la información general de cada solicitud de trámite
    
    Clave Primaria Compuesta: (NUM_ANNIO, NUM_TRAMITE, NUM_REGISTRO)
    Particionamiento recomendado: Por NUM_ANNIO
    """
    __tablename__ = "SIM_FT_TRAMITE_E"
    __table_args__ = (
        PrimaryKeyConstraint('NUM_ANNIO', 'NUM_TRAMITE', 'NUM_REGISTRO'),
        Index('IX_SIM_FT_TRAMITE_E_COD_TRAMITE', 'COD_TRAMITE'),
        Index('IX_SIM_FT_TRAMITE_E_IND_ESTATUS', 'IND_ESTATUS'),
        Index('IX_SIM_FT_TRAMITE_E_FEC_INI', 'FEC_INI_TRAMITE'),
    )

    # Clave primaria compuesta
    NUM_ANNIO = Column(Integer, nullable=False, comment='Año del registro')
    NUM_TRAMITE = Column(Integer, nullable=False, comment='Número consecutivo del trámite')
    NUM_REGISTRO = Column(Integer, nullable=False, comment='Número de registro de filiación o persona')
    
    # Información del trámite
    COD_TRAMITE = Column(String(10), ForeignKey('SIM_FT_TRAMITES.COD_TRAMITE'), nullable=False, comment='Código que identifica el tipo de trámite')
    
    # Fechas y estado
    FEC_INI_TRAMITE = Column(DateTime, nullable=True, comment='Fecha de inicio del trámite')
    FEC_FIN_TRAMITE = Column(DateTime, nullable=True, comment='Fecha de fin del trámite')
    IND_ESTATUS = Column(String(2), ForeignKey('SIM_FT_ESTATUS.COD_ESTATUS'), nullable=True, comment='Indicador del estado actual')
    IND_CONCLUSION = Column(String(2), ForeignKey('SIM_FT_CONCLUSION.COD_CONCLUSION'), nullable=True, comment='Indicador de conclusión')
    IND_PRIORIDAD = Column(String(1), ForeignKey('SIM_FT_PRIORIDAD.COD_PRIORIDAD'), nullable=True, comment='Indicador de prioridad')
    
    # Observaciones y métricas
    OBS_OBSERVA = Column(Text, nullable=True, comment='Observaciones generales')
    HITS_TRAMITE = Column(Integer, nullable=True, default=0, comment='Contador de actividad en el trámite')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True, comment='Usuario que creó el registro')
    FEC_ACTUALIZA = Column(DateTime, nullable=True, onupdate=func.now(), comment='Fecha de última actualización')
    
    # Relaciones
    tipo_tramite = relationship("SimFtTramites", back_populates="tramites_encabezado")
    estatus = relationship("SimFtEstatus", foreign_keys=[IND_ESTATUS])
    conclusion = relationship("SimFtConclusion", foreign_keys=[IND_CONCLUSION])
    prioridad = relationship("SimFtPrioridad", foreign_keys=[IND_PRIORIDAD])
    # Nota: detalles y cierre requieren joins complejos por claves compuestas
    # Se recomienda usar queries manuales para estas relaciones


class SimFtTramiteD(Base):
    """
    SIM_FT_TRAMITE_D: Detalle del Flujo de Pasos (Transaccional)
    Registra el historial y el estado de cada actividad dentro del flujo de un trámite
    
    Clave Primaria Compuesta: (NUM_ANNIO, NUM_TRAMITE, NUM_PASO, NUM_REGISTRO)
    Particionamiento recomendado: Por NUM_ANNIO
    """
    __tablename__ = "SIM_FT_TRAMITE_D"
    __table_args__ = (
        PrimaryKeyConstraint('NUM_ANNIO', 'NUM_TRAMITE', 'NUM_PASO', 'NUM_REGISTRO'),
        Index('IX_SIM_FT_TRAMITE_D_COD_TRAMITE', 'COD_TRAMITE'),
        Index('IX_SIM_FT_TRAMITE_D_IND_ESTATUS', 'IND_ESTATUS'),
        Index('IX_SIM_FT_TRAMITE_D_COD_SECCION', 'COD_SECCION'),
    )

    # Clave primaria compuesta
    NUM_ANNIO = Column(Integer, nullable=False, comment='Año del registro')
    NUM_TRAMITE = Column(Integer, nullable=False, comment='Número del trámite')
    NUM_PASO = Column(Integer, nullable=False, comment='El paso específico dentro del trámite')
    NUM_REGISTRO = Column(Integer, nullable=False, comment='Número de registro')
    
    # Información del paso
    COD_TRAMITE = Column(String(10), nullable=False, comment='Tipo de trámite')
    NUM_ACTIVIDAD = Column(Integer, nullable=True, comment='Número de actividad')
    
    # Responsables
    COD_SECCION = Column(String(4), nullable=True, comment='Sección responsable del paso')
    COD_AGENCIA = Column(String(4), nullable=True, comment='Agencia responsable')
    ID_USUAR_RESP = Column(String(17), nullable=True, comment='Usuario responsable del paso')
    
    # Observaciones y control
    OBS_OBSERVACION = Column(Text, nullable=True, comment='Observaciones por paso')
    NUM_PASO_SGTE = Column(Integer, nullable=True, comment='El siguiente paso en la secuencia')
    IND_ESTATUS = Column(String(2), nullable=True, comment='Estado del paso')
    IND_CONCLUSION = Column(String(2), nullable=True, comment='Conclusión del paso')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True, comment='Usuario que creó el registro')
    FEC_ACTUALIZA = Column(DateTime, nullable=True, onupdate=func.now(), comment='Fecha de última actualización')
    
    # Relaciones
    # Nota: tramite_encabezado y paso_definicion requieren joins complejos por claves compuestas
    # Se recomienda usar queries manuales para estas relaciones


# ==========================================
# TABLAS DE CIERRE
# ==========================================

class SimFtTramiteCierre(Base):
    """
    SIM_FT_TRAMITE_CIERRE: Información sobre la conclusión y cierre formal de un trámite
    Registra el usuario y la fecha de cierre del trámite
    """
    __tablename__ = "SIM_FT_TRAMITE_CIERRE"
    __table_args__ = (
        PrimaryKeyConstraint('NUM_ANNIO', 'NUM_TRAMITE', 'NUM_REGISTRO'),
    )

    NUM_ANNIO = Column(Integer, nullable=False, comment='Año del trámite')
    NUM_TRAMITE = Column(Integer, nullable=False, comment='Número del trámite')
    NUM_REGISTRO = Column(Integer, nullable=False, comment='Número de registro')
    FEC_CIERRE = Column(DateTime, nullable=False, comment='Fecha de cierre')
    ID_USUARIO_CIERRE = Column(String(17), nullable=False, comment='Usuario que realizó el cierre')
    OBS_CIERRE = Column(Text, nullable=True, comment='Observaciones del cierre')
    COD_CONCLUSION = Column(String(2), ForeignKey('SIM_FT_CONCLUSION.COD_CONCLUSION'), nullable=True, comment='Código de conclusión')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    
    # Relaciones
    conclusion = relationship("SimFtConclusion", foreign_keys=[COD_CONCLUSION])
    # Nota: tramite y dependientes requieren joins complejos por claves compuestas


class SimFtDependteCierre(Base):
    """
    SIM_FT_DEPENDTE_CIERRE: Registra los dependientes incluidos en el proceso de cierre
    """
    __tablename__ = "SIM_FT_DEPENDTE_CIERRE"
    __table_args__ = (
        PrimaryKeyConstraint('NUM_ANNIO', 'NUM_TRAMITE', 'NUM_REGISTRO', 'NUM_REGISTRO_DEP'),
    )

    NUM_ANNIO = Column(Integer, nullable=False, comment='Año del trámite')
    NUM_TRAMITE = Column(Integer, nullable=False, comment='Número del trámite')
    NUM_REGISTRO = Column(Integer, nullable=False, comment='Número de registro del titular')
    NUM_REGISTRO_DEP = Column(Integer, nullable=False, comment='Número de registro del dependiente')
    TIP_DEPENDENCIA = Column(String(2), nullable=True, comment='Tipo de dependencia')
    FEC_INCLUSION = Column(DateTime, nullable=True, comment='Fecha de inclusión en el cierre')
    
    # Campos de auditoría
    ID_USUARIO_CREA = Column(String(17), nullable=True)
    FEC_CREA_REG = Column(DateTime, nullable=True, server_default=func.now())
    
    # Relaciones
    # Nota: cierre_tramite requiere join complejo por clave compuesta
