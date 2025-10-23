from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.infrastructure import Base

# NOTA: Esta tabla está DEPRECADA
# Use los modelos del Sistema SIM_FT_* en models_sim_ft.py
# - SimFtTramites: Catálogo de tipos de trámites
# - SimFtTramiteE: Encabezado del trámite (transaccional)
# - SimFtTramiteD: Detalle de pasos del trámite
# 
# Esta tabla se mantiene temporalmente para compatibilidad con código legacy
# Migración disponible: 88ea061b1ac5_implementar_estructura_completa_sim_ft__

class Tramite(Base):
    """
    DEPRECADO: Use SimFtTramiteE en models_sim_ft.py
    Esta clase se mantiene solo para compatibilidad con código existente
    """
    __tablename__ = "TRAMITE"
    
    id = Column(Integer, primary_key=True, index=True)
    NOM_TITULO = Column(String(255), nullable=False)
    DESCRIPCION = Column(String(1000))
    COD_ESTADO = Column(String(50), default="pendiente")
    IND_ACTIVO = Column(Boolean, default=True)
    FEC_CREA_REG = Column(DateTime(timezone=True), server_default=func.now())
    FEC_MODIF_REG = Column(DateTime(timezone=True), onupdate=func.now())
    ID_USUAR_CREA = Column(String(17))
    ID_USUAR_MODIF = Column(String(17))
