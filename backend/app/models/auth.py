from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "SEG_TB_USUARIOS"

    USER_ID = Column(String(17), primary_key=True)
    CED_USUARIO = Column(String(17), nullable=True)
    NOM_USUARIO = Column(String(50), nullable=True)
    EMAIL_USUARIO = Column(String(50), nullable=True)
    PASSWORD = Column(String(255), nullable=True)  # Increased size for hash
    ACTIVO = Column(Boolean, default=True, nullable=False)
    LOGIN = Column(Boolean, default=False, nullable=False)
    RESETPASS = Column(Boolean, default=False, nullable=False)
    CONTROL_MJE = Column(Boolean, default=False, nullable=False)
    REGISTRADO_BLS = Column(Boolean, default=False, nullable=False)
    CAMBIOPASS = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    roles_asociados = relationship("UsuarioRol", back_populates="usuario")

class Rol(Base):
    __tablename__ = "SEG_TB_ROLES"

    COD_ROLE = Column(String(10), primary_key=True) # Assuming size based on usage
    NOM_ROLE = Column(String(50), nullable=True)
    
    usuarios_asociados = relationship("UsuarioRol", back_populates="rol")

class UsuarioRol(Base):
    __tablename__ = "SEG_TB_USUA_ROLE"

    COD_ROLE = Column(String(10), ForeignKey("SEG_TB_ROLES.COD_ROLE"), primary_key=True)
    USER_ID = Column(String(17), ForeignKey("SEG_TB_USUARIOS.USER_ID"), primary_key=True)
    FEC_ACTUALIZACION = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="roles_asociados")
    rol = relationship("Rol", back_populates="usuarios_asociados")
