"""
Servicio para el sistema de acceso público
"""
import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models import (
    PPSHSolicitud,
    WorkflowEtapa,
    WorkflowDocumentoEtapa,
    TipoTramite
)
from app.schemas.public_access import (
    ValidarAccesoRequest,
    ValidarAccesoResponse,
    SolicitudPublicaResponse,
    AccesoPublicoCreate,
    EtapaPublica,
    DocumentoPublico,
    SolicitantePublico,
    WorkflowPublico
)


# Configuración
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRATION_MINUTES = 15
MAX_INTENTOS_FALLIDOS = 5
TIEMPO_BLOQUEO_MINUTOS = 30


class PublicAccessService:
    """Servicio para gestionar el acceso público"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def validar_acceso(
        self,
        data: ValidarAccesoRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> ValidarAccesoResponse:
        """
        Valida el acceso de un usuario público
        """
        # 1. Verificar si la IP está bloqueada
        if ip_address:
            self._verificar_bloqueo_ip(ip_address)
        
        # 2. Buscar la solicitud
        solicitud = self.db.query(PPSHSolicitud).filter(
            PPSHSolicitud.numero_solicitud == data.numero_solicitud
        ).first()
        
        if not solicitud:
            self._registrar_intento_fallido(ip_address, None, data.numero_documento)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solicitud no encontrada"
            )
        
        # 3. Validar documento del solicitante
        if (solicitud.solicitante_documento != data.numero_documento or
            solicitud.solicitante_tipo_documento != data.tipo_documento):
            self._registrar_intento_fallido(ip_address, solicitud.solicitud_id, data.numero_documento)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Los datos ingresados no coinciden con la solicitud"
            )
        
        # 4. Generar token temporal
        token = self._crear_token_temporal(
            solicitud.solicitud_id,
            data.numero_documento
        )
        
        # 5. Registrar acceso exitoso
        self._registrar_acceso_exitoso(
            solicitud_id=solicitud.solicitud_id,
            numero_documento=data.numero_documento,
            tipo_documento=data.tipo_documento,
            ip_address=ip_address,
            user_agent=user_agent,
            token=token
        )
        
        # 6. Retornar respuesta con token y datos filtrados
        solicitud_publica = self._filtrar_datos_publicos(solicitud)
        
        return ValidarAccesoResponse(
            access_token=token,
            expires_in=TOKEN_EXPIRATION_MINUTES * 60,
            solicitud=solicitud_publica.dict()
        )
    
    def obtener_solicitud_publica(
        self,
        numero_solicitud: str,
        token: str
    ) -> SolicitudPublicaResponse:
        """
        Obtiene los datos públicos de una solicitud validando el token
        """
        # 1. Validar token
        payload = self._validar_token(token)
        
        # 2. Buscar solicitud
        solicitud = self.db.query(PPSHSolicitud).filter(
            PPSHSolicitud.numero_solicitud == numero_solicitud
        ).first()
        
        if not solicitud:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solicitud no encontrada"
            )
        
        # 3. Verificar que el token corresponde a esta solicitud
        if solicitud.solicitud_id != payload.get("solicitud_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para acceder a esta solicitud"
            )
        
        # 4. Retornar datos filtrados
        return self._filtrar_datos_publicos(solicitud)
    
    def _crear_token_temporal(self, solicitud_id: int, numero_documento: str) -> str:
        """Crea un token JWT temporal"""
        expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
        
        payload = {
            "solicitud_id": solicitud_id,
            "numero_documento": numero_documento,
            "tipo": "public_access",
            "exp": expiration,
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    def _validar_token(self, token: str) -> dict:
        """Valida un token JWT"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            if payload.get("tipo") != "public_access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido"
                )
            
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="El token ha expirado. Por favor, vuelva a ingresar."
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    
    def _filtrar_datos_publicos(self, solicitud: PPSHSolicitud) -> SolicitudPublicaResponse:
        """
        Filtra los datos de la solicitud para retornar solo información pública
        """
        # Obtener tipo de trámite
        tipo_tramite = self.db.query(TipoTramite).filter(
            TipoTramite.tipo_tramite_id == solicitud.tipo_tramite_id
        ).first()
        
        # Obtener etapas visibles públicamente
        etapas_workflow = []
        if solicitud.workflow_id:
            etapas = self.db.query(WorkflowEtapa).filter(
                and_(
                    WorkflowEtapa.workflow_id == solicitud.workflow_id,
                    WorkflowEtapa.visible_publico == True
                )
            ).order_by(WorkflowEtapa.orden).all()
            
            for etapa in etapas:
                # Determinar estado de la etapa para esta solicitud
                # TODO: Implementar lógica real basada en WORKFLOW_TB_SOLICITUD_ETAPA
                estado = "PENDIENTE"
                fecha_inicio = None
                fecha_fin = None
                
                etapas_workflow.append(EtapaPublica(
                    nombre=etapa.nombre,
                    estado=estado,
                    fecha_inicio=fecha_inicio,
                    fecha_fin=fecha_fin,
                    orden=etapa.orden
                ))
        
        # Obtener documentos requeridos visibles
        documentos_requeridos = []
        if solicitud.workflow_id:
            docs = self.db.query(WorkflowDocumentoEtapa).filter(
                and_(
                    WorkflowDocumentoEtapa.workflow_id == solicitud.workflow_id,
                    WorkflowDocumentoEtapa.visible_publico == True
                )
            ).all()
            
            for doc in docs:
                # TODO: Verificar si el documento está cargado
                documentos_requeridos.append(DocumentoPublico(
                    nombre=doc.nombre_documento,
                    cargado=False,  # TODO: Implementar verificación real
                    fecha_carga=None,
                    requerido=doc.requerido
                ))
        
        return SolicitudPublicaResponse(
            numero_solicitud=solicitud.numero_solicitud,
            tipo_tramite=tipo_tramite.nombre if tipo_tramite else "Desconocido",
            fecha_solicitud=solicitud.fecha_solicitud or datetime.now(),
            estado_actual=solicitud.estado or "EN_PROCESO",
            solicitante=SolicitantePublico(
                nombre_completo=f"{solicitud.nombres or ''} {solicitud.apellidos or ''}".strip(),
                numero_documento=solicitud.solicitante_documento or ""
            ),
            workflow=WorkflowPublico(
                etapa_actual=None,  # TODO: Implementar lógica de etapa actual
                etapas=etapas_workflow
            ),
            documentos_requeridos=documentos_requeridos,
            observaciones=solicitud.observaciones_publicas,
            proximo_paso=solicitud.proximo_paso_publico
        )
    
    def _verificar_bloqueo_ip(self, ip_address: str):
        """Verifica si una IP está bloqueada"""
        # TODO: Implementar verificación en la tabla SEG_TB_ACCESO_PUBLICO
        # Por ahora, no se implementa el bloqueo
        pass
    
    def _registrar_intento_fallido(
        self,
        ip_address: Optional[str],
        solicitud_id: Optional[int],
        numero_documento: str
    ):
        """Registra un intento fallido de acceso"""
        # TODO: Implementar registro en SEG_TB_ACCESO_PUBLICO
        # y lógica de bloqueo después de MAX_INTENTOS_FALLIDOS
        pass
    
    def _registrar_acceso_exitoso(
        self,
        solicitud_id: int,
        numero_documento: str,
        tipo_documento: str,
        ip_address: Optional[str],
        user_agent: Optional[str],
        token: str
    ):
        """Registra un acceso exitoso"""
        # TODO: Implementar registro en SEG_TB_ACCESO_PUBLICO
        # con intentos_fallidos = 0
        pass
