"""
Servicio para gestión de solicitudes públicas (sin autenticación)
Permite a ciudadanos iniciar solicitudes PPSH sin tener cuenta en el sistema

Author: Sistema de Trámites MVP Panamá
Date: 2025-11-23
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from typing import Dict, Optional
import jwt
import os
import random

from app.models.models_workflow import WorkflowInstancia, Workflow, EstadoInstancia
from app.schemas.schemas_ppsh import SolicitudCreate, SolicitanteCreate, TipoDocumentoEnum, TipoSolicitudEnum, PrioridadEnum
from app.services.services_ppsh import SolicitudService


class PublicSolicitudService:
    """Servicio para solicitudes públicas sin autenticación"""

    # Clave secreta para tokens JWT (en producción debe estar en variables de entorno)
    JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ALGORITHM = 'HS256'
    TOKEN_EXPIRATION_DAYS = 30  # El token es válido por 30 días

    # Caracteres para código de acceso (sin caracteres confusos: 0/O, 1/I/L)
    CODIGO_CARACTERES = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

    @staticmethod
    def generar_codigo_acceso(db: Session, prefijo: str = "PPSH") -> str:
        """
        Genera un código de acceso corto único para la instancia
        Formato: PPSH-XXXX (ej: PPSH-A7X9)
        
        Args:
            db: Sesión de base de datos
            prefijo: Prefijo del código (default: PPSH)
            
        Returns:
            Código único de 9 caracteres
        """
        max_intentos = 100

        for _ in range(max_intentos):
            # Generar 4 caracteres aleatorios
            codigo_random = ''.join(random.choices(PublicSolicitudService.CODIGO_CARACTERES, k=4))
            codigo = f"{prefijo}-{codigo_random}"

            # Verificar unicidad
            existe = db.query(WorkflowInstancia).filter_by(codigo_acceso=codigo).first()
            if not existe:
                return codigo

        # Fallback: agregar timestamp si todos los intentos fallan
        import time
        timestamp = str(int(time.time()))[-4:]
        return f"{prefijo}-{timestamp}"

    @staticmethod
    def generar_token_acceso(instancia_id: int, pasaporte: str) -> str:
        """
        Genera un token JWT temporal para acceso a la instancia
        
        Args:
            instancia_id: ID de la instancia de workflow
            pasaporte: Número de pasaporte del solicitante
            
        Returns:
            Token JWT como string
        """
        payload = {
            'instancia_id': instancia_id,
            'pasaporte': pasaporte,
            'exp': datetime.utcnow() + timedelta(days=PublicSolicitudService.TOKEN_EXPIRATION_DAYS),
            'iat': datetime.utcnow(),
            'type': 'public_access'
        }

        token = jwt.encode(
            payload,
            PublicSolicitudService.JWT_SECRET,
            algorithm=PublicSolicitudService.JWT_ALGORITHM
        )

        return token

    @staticmethod
    def validar_token(token: str) -> Optional[Dict]:
        """
        Valida un token JWT y retorna el payload
        
        Args:
            token: Token JWT a validar
            
        Returns:
            Dict con datos del token si es válido, None si no es válido
        """
        try:
            payload = jwt.decode(
                token,
                PublicSolicitudService.JWT_SECRET,
                algorithms=[PublicSolicitudService.JWT_ALGORITHM]
            )

            # Verificar que es un token de acceso público
            if payload.get('type') != 'public_access':
                return None

            return payload

        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def iniciar_solicitud_ppsh(
        db: Session,
        pasaporte: str,
        nombres: str,
        apellidos: str,
        email: Optional[str] = None,
        nacionalidad: Optional[str] = None,
        sexo: Optional[str] = None,
        fecha_nacimiento: Optional[str] = None
    ) -> Dict:
        """
        Inicia una nueva solicitud PPSH para un ciudadano usando el servicio existente
        
        Args:
            db: Sesión de base de datos
            pasaporte: Número de pasaporte
            nombres: Nombres del solicitante
            apellidos: Apellidos del solicitante
            email: Email del solicitante
            nacionalidad: Nacionalidad (código de 3 letras, ej: PAN, VEN, COL)
            sexo: Sexo (M/F)
            fecha_nacimiento: Fecha de nacimiento en formato YYYY-MM-DD
            
        Returns:
            Dict con: instancia_id, token, num_expediente, link_seguimiento
        """
        # 1. Preparar datos para SolicitanteCreate (schema existente)
        # Separar nombres y apellidos para los campos requeridos
        nombres_split = nombres.strip().split(maxsplit=1)
        primer_nombre = nombres_split[0] if len(nombres_split) > 0 else nombres
        segundo_nombre = nombres_split[1] if len(nombres_split) > 1 else None

        apellidos_split = apellidos.strip().split(maxsplit=1)
        primer_apellido = apellidos_split[0] if len(apellidos_split) > 0 else apellidos
        segundo_apellido = apellidos_split[1] if len(apellidos_split) > 1 else None

        # Parsear fecha de nacimiento si se proporcionó
        fecha_nac = date(1990, 1, 1)  # Fecha por defecto
        if fecha_nacimiento:
            try:
                fecha_nac = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
            except ValueError:
                pass  # Usar fecha por defecto si el formato es inválido

        solicitante_data = SolicitanteCreate(
            es_titular=True,
            tipo_documento=TipoDocumentoEnum.PASAPORTE,
            num_documento=pasaporte,
            pais_emisor=nacionalidad or 'PAN',
            primer_nombre=primer_nombre,
            segundo_nombre=segundo_nombre,
            primer_apellido=primer_apellido,
            segundo_apellido=segundo_apellido,
            fecha_nacimiento=fecha_nac,
            cod_sexo=sexo or 'M',
            cod_nacionalidad=nacionalidad or 'PAN',
            email=email
        )

        # 2. Crear SolicitudCreate usando el schema existente
        solicitud_create = SolicitudCreate(
            tipo_solicitud=TipoSolicitudEnum.INDIVIDUAL,
            cod_causa_humanitaria=1,  # Causa humanitaria por defecto (debe existir en BD)
            descripcion_caso=f"Solicitud PPSH iniciada por ciudadano - Pasaporte: {pasaporte}",
            prioridad=PrioridadEnum.NORMAL,
            solicitantes=[solicitante_data]
        )

        # 3. Usar SolicitudService.crear_solicitud() existente (REUTILIZACIÓN)
        solicitud = SolicitudService.crear_solicitud(
            db=db,
            solicitud_data=solicitud_create,
            user_id="PUBLIC"  # Identificador genérico para acceso público
        )

        # 4. Buscar el workflow PPSH_COMPLETO
        workflow = db.query(Workflow).filter_by(
            codigo='WORKFLOW_PPSH_COMPLETO',
            activo=True
        ).first()

        if not workflow:
            raise ValueError("Workflow PPSH_COMPLETO no encontrado. Ejecute el script seed_ppsh_workflow_completo.py")

        # 5. Obtener la primera etapa del workflow
        from sqlalchemy import text
        primera_etapa = db.execute(text("""
            SELECT id FROM WORKFLOW_ETAPA 
            WHERE workflow_id = :workflow_id AND es_etapa_inicial = 1 AND activo = 1
        """), {"workflow_id": workflow.id}).scalar()

        if not primera_etapa:
            # Si no hay etapa marcada como inicial, usar la primera por orden
            primera_etapa = db.execute(text("""
                SELECT TOP 1 id FROM WORKFLOW_ETAPA 
                WHERE workflow_id = :workflow_id AND activo = 1
                ORDER BY orden
            """), {"workflow_id": workflow.id}).scalar()

        # 6. Crear instancia de workflow
        # Generar código de acceso corto
        codigo_acceso = PublicSolicitudService.generar_codigo_acceso(db)

        instancia = WorkflowInstancia(
            workflow_id=workflow.id,
            num_expediente=solicitud.num_expediente,
            nombre_instancia=f"PPSH - {nombres} {apellidos} - {solicitud.num_expediente}",
            codigo_acceso=codigo_acceso,
            estado=EstadoInstancia.INICIADO,
            etapa_actual_id=primera_etapa,
            creado_por_user_id="PUBLIC",  # Identificador genérico para acceso público
            metadata_adicional={
                "id_solicitud": solicitud.id_solicitud,
                "pasaporte": pasaporte,
                "tipo_acceso": "publico",
                "email": email,
                "nombres_completos": f"{nombres} {apellidos}"
            },
            activo=True
        )

        db.add(instancia)
        db.commit()
        db.refresh(instancia)

        # 7. Generar token de acceso
        token = PublicSolicitudService.generar_token_acceso(
            instancia.id,
            pasaporte
        )

        # 8. Construir link de seguimiento
        base_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        link_seguimiento = f"{base_url}/solicitudes/{token}/workflow"

        return {
            "instancia_id": instancia.id,
            "solicitud_id": solicitud.id_solicitud,
            "token": token,
            "codigo_acceso": codigo_acceso,  # Código corto para acceso fácil
            "num_expediente": solicitud.num_expediente,
            "link_seguimiento": link_seguimiento,
            "mensaje": f"Solicitud creada exitosamente. Su código de acceso es: {codigo_acceso}. Guarde este código para continuar su trámite."
        }

    @staticmethod
    def obtener_instancia_por_token(db: Session, token: str) -> Optional[WorkflowInstancia]:
        """
        Obtiene una instancia de workflow usando un token de acceso público
        
        Args:
            db: Sesión de base de datos
            token: Token JWT de acceso
            
        Returns:
            WorkflowInstancia si el token es válido, None si no
        """
        payload = PublicSolicitudService.validar_token(token)

        if not payload:
            return None

        instancia_id = payload.get('instancia_id')

        if not instancia_id:
            return None

        instancia = db.query(WorkflowInstancia).filter_by(
            id=instancia_id,
            activo=True
        ).first()

        return instancia

    @staticmethod
    def obtener_instancia_por_codigo(db: Session, codigo_acceso: str) -> Optional[WorkflowInstancia]:
        """
        Obtiene una instancia de workflow usando el código de acceso corto
        
        Args:
            db: Sesión de base de datos
            codigo_acceso: Código de acceso corto (ej: PPSH-A7X9)
            
        Returns:
            WorkflowInstancia si el código es válido, None si no
        """
        # Normalizar código (mayúsculas, sin espacios)
        codigo_normalizado = codigo_acceso.strip().upper()

        instancia = db.query(WorkflowInstancia).filter_by(
            codigo_acceso=codigo_normalizado,
            activo=True
        ).first()

        return instancia

    @staticmethod
    def validar_acceso_por_codigo(db: Session, codigo_acceso: str, pasaporte: str) -> Optional[Dict]:
        """
        Valida acceso por código y pasaporte, y genera token JWT si es válido
        
        Args:
            db: Sesión de base de datos
            codigo_acceso: Código de acceso corto
            pasaporte: Número de pasaporte del solicitante
            
        Returns:
            Dict con token y datos de la instancia si es válido, None si no
        """
        instancia = PublicSolicitudService.obtener_instancia_por_codigo(db, codigo_acceso)

        if not instancia:
            return None

        # Verificar que el pasaporte coincide con el de la metadata
        metadata = instancia.metadata_adicional or {}
        pasaporte_registrado = metadata.get('pasaporte', '').strip().upper()
        pasaporte_ingresado = pasaporte.strip().upper()

        if pasaporte_registrado != pasaporte_ingresado:
            return None

        # Generar nuevo token de acceso
        token = PublicSolicitudService.generar_token_acceso(
            instancia.id,
            pasaporte_ingresado
        )

        base_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        link_seguimiento = f"{base_url}/solicitudes/{token}/workflow"

        return {
            "instancia_id": instancia.id,
            "token": token,
            "num_expediente": instancia.num_expediente,
            "codigo_acceso": instancia.codigo_acceso,
            "estado": instancia.estado.value if instancia.estado else None,
            "link_seguimiento": link_seguimiento,
            "mensaje": "Acceso validado exitosamente"
        }
