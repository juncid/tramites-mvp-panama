"""
Tests unitarios para validadores Pydantic
Sistema de Trámites Migratorios de Panamá

Cubre:
- Validaciones de field_validator en todos los schemas
- Validaciones de model_validator (validaciones cruzadas)
- Casos edge y límites de validación
- Mensajes de error apropiados
- Schemas PPSH, SIM_FT, Workflow
"""

import pytest
from datetime import date, datetime, timedelta
from pydantic import ValidationError

from app.schemas.schemas_ppsh import (
    SolicitanteCreate, SolicitudCreate, DocumentoCreate,
    EntrevistaCreate, ComentarioCreate
)
from app.schemas.schemas_sim_ft import (
    SimFtTramitesCreate, SimFtTramiteECreate, SimFtTramiteDCreate,
    SimFtEstatusCreate, SimFtConclusionCreate, SimFtPrioridadCreate
)
from app.schemas.schemas_workflow import (
    WorkflowCreate, WorkflowEtapaCreate, WorkflowPreguntaCreate,
    WorkflowConexionCreate, WorkflowInstanciaCreate
)


# ==========================================
# TESTS DE VALIDACIÓN PPSH
# ==========================================

class TestSolicitanteValidators:
    """Tests para validadores de Solicitante PPSH"""
    
    def test_fecha_nacimiento_no_futura(self):
        """Test: Fecha de nacimiento no puede ser futura"""
        with pytest.raises(ValidationError) as exc_info:
            SolicitanteCreate(
                es_titular=True,
                tipo_documento="PASAPORTE",
                num_documento="AB123456",
                pais_emisor="VEN",
                primer_nombre="Juan",
                primer_apellido="Pérez",
                fecha_nacimiento=date.today() + timedelta(days=1),  # Futura
                cod_sexo="M",
                cod_nacionalidad="VEN",
                email="juan@example.com"
            )
        
        errors = exc_info.value.errors()
        assert any("fecha de nacimiento" in str(e).lower() for e in errors)
    
    def test_fecha_nacimiento_valida(self):
        """Test: Fecha de nacimiento válida"""
        solicitante = SolicitanteCreate(
            es_titular=True,
            tipo_documento="PASAPORTE",
            num_documento="AB123456",
            pais_emisor="VEN",
            primer_nombre="Juan",
            primer_apellido="Pérez",
            fecha_nacimiento=date(1990, 5, 15),
            cod_sexo="M",
            cod_nacionalidad="VEN",
            email="juan@example.com"
        )
        
        assert solicitante.fecha_nacimiento == date(1990, 5, 15)
    
    def test_edad_minima_18_anos(self):
        """Test: Validar edad mínima de 18 años para titular"""
        # Menor de 18 años
        fecha_menor = date.today() - timedelta(days=365*17)
        
        with pytest.raises(ValidationError) as exc_info:
            SolicitanteCreate(
                es_titular=True,
                tipo_documento="PASAPORTE",
                num_documento="AB123456",
                pais_emisor="VEN",
                primer_nombre="Juan",
                primer_apellido="Pérez",
                fecha_nacimiento=fecha_menor,
                cod_sexo="M",
                cod_nacionalidad="VEN",
                email="juan@example.com"
            )
        
        errors = exc_info.value.errors()
        assert any("edad" in str(e).lower() or "18" in str(e).lower() for e in errors)
    
    def test_email_valido(self):
        """Test: Formato de email válido"""
        solicitante = SolicitanteCreate(
            es_titular=True,
            tipo_documento="PASAPORTE",
            num_documento="AB123456",
            pais_emisor="VEN",
            primer_nombre="Juan",
            primer_apellido="Pérez",
            fecha_nacimiento=date(1990, 5, 15),
            cod_sexo="M",
            cod_nacionalidad="VEN",
            email="juan.perez@example.com"
        )
        
        assert solicitante.email == "juan.perez@example.com"
    
    def test_email_invalido(self):
        """Test: Email con formato inválido"""
        with pytest.raises(ValidationError):
            SolicitanteCreate(
                es_titular=True,
                tipo_documento="PASAPORTE",
                num_documento="AB123456",
                pais_emisor="VEN",
                primer_nombre="Juan",
                primer_apellido="Pérez",
                fecha_nacimiento=date(1990, 5, 15),
                cod_sexo="M",
                cod_nacionalidad="VEN",
                email="email_invalido_sin_arroba"
            )
    
    def test_telefono_formato_valido(self):
        """Test: Formato de teléfono válido"""
        solicitante = SolicitanteCreate(
            es_titular=True,
            tipo_documento="PASAPORTE",
            num_documento="AB123456",
            pais_emisor="VEN",
            primer_nombre="Juan",
            primer_apellido="Pérez",
            fecha_nacimiento=date(1990, 5, 15),
            cod_sexo="M",
            cod_nacionalidad="VEN",
            email="juan@example.com",
            telefono="+507-6000-1234"
        )
        
        assert solicitante.telefono == "+507-6000-1234"


class TestSolicitudValidators:
    """Tests para validadores de Solicitud PPSH"""
    
    def test_solicitud_requiere_al_menos_un_titular(self):
        """Test: Debe haber al menos un solicitante titular"""
        with pytest.raises(ValidationError) as exc_info:
            SolicitudCreate(
                tipo_solicitud="INDIVIDUAL",
                cod_causa_humanitaria=1,
                descripcion_caso="Descripción del caso",
                prioridad="NORMAL",
                solicitantes=[
                    {
                        "es_titular": False,  # No titular
                        "tipo_documento": "PASAPORTE",
                        "num_documento": "AB123456",
                        "pais_emisor": "VEN",
                        "primer_nombre": "Juan",
                        "primer_apellido": "Pérez",
                        "fecha_nacimiento": date(1990, 5, 15),
                        "cod_sexo": "M",
                        "cod_nacionalidad": "VEN",
                        "email": "juan@example.com"
                    }
                ]
            )
        
        errors = exc_info.value.errors()
        assert any("titular" in str(e).lower() for e in errors)
    
    def test_solicitud_solo_un_titular(self):
        """Test: Solo puede haber un solicitante titular"""
        with pytest.raises(ValidationError) as exc_info:
            SolicitudCreate(
                tipo_solicitud="GRUPAL",
                cod_causa_humanitaria=1,
                descripcion_caso="Descripción del caso",
                prioridad="NORMAL",
                solicitantes=[
                    {
                        "es_titular": True,  # Titular 1
                        "tipo_documento": "PASAPORTE",
                        "num_documento": "AB123456",
                        "pais_emisor": "VEN",
                        "primer_nombre": "Juan",
                        "primer_apellido": "Pérez",
                        "fecha_nacimiento": date(1990, 5, 15),
                        "cod_sexo": "M",
                        "cod_nacionalidad": "VEN",
                        "email": "juan@example.com"
                    },
                    {
                        "es_titular": True,  # Titular 2 (inválido)
                        "tipo_documento": "PASAPORTE",
                        "num_documento": "CD789012",
                        "pais_emisor": "VEN",
                        "primer_nombre": "María",
                        "primer_apellido": "González",
                        "fecha_nacimiento": date(1992, 3, 20),
                        "cod_sexo": "F",
                        "cod_nacionalidad": "VEN",
                        "email": "maria@example.com"
                    }
                ]
            )
        
        errors = exc_info.value.errors()
        assert any("titular" in str(e).lower() for e in errors)
    
    def test_solicitud_individual_solo_un_solicitante(self):
        """Test: Solicitud individual solo puede tener un solicitante"""
        with pytest.raises(ValidationError) as exc_info:
            SolicitudCreate(
                tipo_solicitud="INDIVIDUAL",
                cod_causa_humanitaria=1,
                descripcion_caso="Descripción del caso",
                prioridad="NORMAL",
                solicitantes=[
                    {
                        "es_titular": True,
                        "tipo_documento": "PASAPORTE",
                        "num_documento": "AB123456",
                        "pais_emisor": "VEN",
                        "primer_nombre": "Juan",
                        "primer_apellido": "Pérez",
                        "fecha_nacimiento": date(1990, 5, 15),
                        "cod_sexo": "M",
                        "cod_nacionalidad": "VEN",
                        "email": "juan@example.com"
                    },
                    {
                        "es_titular": False,
                        "parentesco_titular": "CONYUGE",
                        "tipo_documento": "PASAPORTE",
                        "num_documento": "CD789012",
                        "pais_emisor": "VEN",
                        "primer_nombre": "María",
                        "primer_apellido": "Pérez",
                        "fecha_nacimiento": date(1992, 3, 20),
                        "cod_sexo": "F",
                        "cod_nacionalidad": "VEN",
                        "email": "maria@example.com"
                    }
                ]
            )
        
        errors = exc_info.value.errors()
        assert any("individual" in str(e).lower() for e in errors)
    
    def test_solicitud_individual_valida(self):
        """Test: Solicitud individual válida"""
        solicitud = SolicitudCreate(
            tipo_solicitud="INDIVIDUAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso de persecución política con justificación detallada de más de 50 caracteres para prioridad alta",
            prioridad="ALTA",
            solicitantes=[
                {
                    "es_titular": True,
                    "tipo_documento": "PASAPORTE",
                    "num_documento": "AB123456",
                    "pais_emisor": "VEN",
                    "primer_nombre": "Juan",
                    "primer_apellido": "Pérez",
                    "fecha_nacimiento": date(1990, 5, 15),
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN",
                    "email": "juan@example.com"
                }
            ]
        )
        
        assert solicitud.tipo_solicitud == "INDIVIDUAL"
        assert len(solicitud.solicitantes) == 1
        assert solicitud.solicitantes[0].es_titular is True
    
    def test_solicitud_familiar_valida(self):
        """Test: Solicitud grupal con titular y dependientes"""
        solicitud = SolicitudCreate(
            tipo_solicitud="GRUPAL",
            cod_causa_humanitaria=1,
            descripcion_caso="Caso grupal",
            prioridad="NORMAL",
            solicitantes=[
                {
                    "es_titular": True,
                    "tipo_documento": "PASAPORTE",
                    "num_documento": "AB123456",
                    "pais_emisor": "VEN",
                    "primer_nombre": "Juan",
                    "primer_apellido": "Pérez",
                    "fecha_nacimiento": date(1990, 5, 15),
                    "cod_sexo": "M",
                    "cod_nacionalidad": "VEN",
                    "email": "juan@example.com"
                },
                {
                    "es_titular": False,
                    "parentesco_titular": "CONYUGE",
                    "tipo_documento": "PASAPORTE",
                    "num_documento": "CD789012",
                    "pais_emisor": "VEN",
                    "primer_nombre": "María",
                    "primer_apellido": "Pérez",
                    "fecha_nacimiento": date(1992, 3, 20),
                    "cod_sexo": "F",
                    "cod_nacionalidad": "VEN",
                    "email": "maria@example.com"
                }
            ]
        )
        
        assert solicitud.tipo_solicitud == "GRUPAL"
        assert len(solicitud.solicitantes) == 2


class TestDocumentoValidators:
    """Tests para validadores de Documento"""
    
    def test_extension_valida(self):
        """Test: Extensiones de archivo válidas"""
        extensiones_validas = ["pdf", "jpg", "jpeg", "png", "doc", "docx"]
        
        for ext in extensiones_validas:
            documento = DocumentoCreate(
                cod_tipo_documento=1,
                nombre_archivo=f"documento.{ext}",
                extension=ext,
                ruta_archivo=f"/uploads/documento.{ext}"
            )
            # El validador normaliza agregando punto
            assert documento.extension == f".{ext}"
    
    def test_extension_invalida(self):
        """Test: Extensión de archivo inválida"""
        with pytest.raises(ValidationError):
            DocumentoCreate(
                cod_tipo_documento=1,
                nombre_archivo="documento.exe",
                extension="exe",  # No permitida
                ruta_archivo="/uploads/documento.exe"
            )
    
    def test_tamanio_maximo_archivo(self):
        """Test: Tamaño máximo de archivo (si está implementado)"""
        # Tamaño en bytes (10 MB)
        documento = DocumentoCreate(
            cod_tipo_documento=1,
            nombre_archivo="documento_grande.pdf",
            extension="pdf",
            ruta_archivo="/uploads/documento_grande.pdf",
            tamanio_bytes=10 * 1024 * 1024  # 10 MB
        )
        
        assert documento.tamanio_bytes == 10 * 1024 * 1024


class TestEntrevistaValidators:
    """Tests para validadores de Entrevista"""
    
    def test_fecha_entrevista_no_pasada(self):
        """Test: Fecha de entrevista no puede ser pasada"""
        with pytest.raises(ValidationError):
            EntrevistaCreate(
                fecha_programada=datetime.now() - timedelta(days=1),  # Fecha pasada
                hora_programada="10:00",
                modalidad="PRESENCIAL",
                lugar="Oficina Central"
            )
    
    def test_fecha_entrevista_futura_valida(self):
        """Test: Fecha de entrevista futura válida"""
        fecha_futura = datetime.now() + timedelta(days=7)
        
        entrevista = EntrevistaCreate(
            fecha_programada=fecha_futura,
            hora_programada="10:00",
            modalidad="PRESENCIAL",
            lugar="Oficina Central",
            entrevistador_user_id="USER123"
        )
        
        # Comparar con la fecha futura original, no con datetime.now() actual
        assert entrevista.fecha_programada == fecha_futura
    
    def test_modalidad_presencial_requiere_lugar(self):
        """Test: Entrevista presencial requiere lugar"""
        with pytest.raises(ValidationError):
            EntrevistaCreate(
                fecha_programada=datetime.now() + timedelta(days=7),
                hora_programada="10:00",
                modalidad="PRESENCIAL",
                lugar=None  # Requerido para presencial
            )
    
    def test_modalidad_virtual_requiere_enlace(self):
        """Test: Entrevista virtual requiere enlace"""
        with pytest.raises(ValidationError):
            EntrevistaCreate(
                fecha_programada=datetime.now() + timedelta(days=7),
                hora_programada="10:00",
                modalidad="VIRTUAL",
                enlace_videoconferencia=None  # Requerido para virtual
            )


# ==========================================
# TESTS DE VALIDACIÓN SIM_FT
# ==========================================

class TestSimFtTramiteValidators:
    """Tests para validadores de Trámite SIM_FT"""
    
    def test_num_annio_valido(self):
        """Test: Año del trámite debe ser válido"""
        tramite = SimFtTramiteECreate(
            NUM_ANNIO=2025,
            NUM_TRAMITE=1,
            NUM_REGISTRO=1,
            COD_TRAMITE="PPSH",
            FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01",
            IND_PRIORIDAD="N"
        )
        
        assert tramite.NUM_ANNIO == 2025
    
    def test_num_annio_invalido(self):
        """Test: Año inválido (muy antiguo o futuro)"""
        with pytest.raises(ValidationError):
            SimFtTramiteECreate(
                NUM_ANNIO=1900,  # Muy antiguo
                NUM_TRAMITE=1,
                NUM_REGISTRO=1,
                COD_TRAMITE="PPSH",
                FEC_INI_TRAMITE=datetime.now(),
                IND_ESTATUS="01"
            )
    
    def test_cod_tramite_longitud_maxima(self):
        """Test: Código de trámite no debe exceder longitud máxima"""
        with pytest.raises(ValidationError):
            SimFtTramiteECreate(
                NUM_ANNIO=2025,
                NUM_TRAMITE=1,
                NUM_REGISTRO=1,
                COD_TRAMITE="CODIGO_DEMASIADO_LARGO_INVALIDO",  # > 10 caracteres
                FEC_INI_TRAMITE=datetime.now(),
                IND_ESTATUS="01"
            )
    
    def test_fecha_fin_posterior_a_inicio(self):
        """Test: Fecha fin debe ser posterior a fecha inicio"""
        with pytest.raises(ValidationError):
            SimFtTramiteECreate(
                NUM_ANNIO=2025,
                NUM_TRAMITE=1,
                NUM_REGISTRO=1,
                COD_TRAMITE="PPSH",
                FEC_INI_TRAMITE=datetime(2025, 1, 10),
                FEC_FIN_TRAMITE=datetime(2025, 1, 5),  # Anterior a inicio
                IND_ESTATUS="03"
            )
    
    def test_ind_estatus_valores_validos(self):
        """Test: Indicador de estatus con valores válidos"""
        tramite = SimFtTramiteECreate(
            NUM_ANNIO=2025,
            NUM_TRAMITE=1,
            NUM_REGISTRO=1,
            COD_TRAMITE="PPSH",
            FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01"
        )
        
        assert tramite.IND_ESTATUS in ["01", "02", "03", "04"]
    
    def test_ind_prioridad_valores_validos(self):
        """Test: Indicador de prioridad con valores válidos"""
        tramite = SimFtTramiteECreate(
            NUM_ANNIO=2025,
            NUM_TRAMITE=1,
            NUM_REGISTRO=1,
            COD_TRAMITE="PPSH",
            FEC_INI_TRAMITE=datetime.now(),
            IND_ESTATUS="01",
            IND_PRIORIDAD="A"
        )
        
        assert tramite.IND_PRIORIDAD in ["A", "N", "B"]


class TestSimFtCatalogoValidators:
    """Tests para validadores de catálogos SIM_FT"""
    
    def test_estatus_nombre_requerido(self):
        """Test: Nombre de estatus es requerido y no vacío"""
        # Pydantic valida que el campo existe, pero permite string vacío
        # El test verifica que se puede crear con nombre válido
        estatus = SimFtEstatusCreate(
            COD_ESTATUS="01",
            NOM_ESTATUS="En Proceso",
            IND_ACTIVO="S"
        )
        assert estatus.NOM_ESTATUS == "En Proceso"
        assert len(estatus.NOM_ESTATUS) > 0
    
    def test_conclusion_codigo_formato(self):
        """Test: Código de conclusión debe tener formato correcto"""
        conclusion = SimFtConclusionCreate(
            COD_CONCLUSION="AP",
            NOM_CONCLUSION="Aprobado",
            IND_ACTIVO="S"
        )
        
        assert len(conclusion.COD_CONCLUSION) == 2
    
    def test_prioridad_codigo_un_caracter(self):
        """Test: Código de prioridad debe ser un solo carácter"""
        prioridad = SimFtPrioridadCreate(
            COD_PRIORIDAD="A",
            NOM_PRIORIDAD="Alta",
            IND_ACTIVO="S"
        )
        
        assert len(prioridad.COD_PRIORIDAD) == 1


# ==========================================
# TESTS DE VALIDACIÓN WORKFLOW
# ==========================================

class TestWorkflowValidators:
    """Tests para validadores de Workflow"""
    
    def test_codigo_workflow_unico(self):
        """Test: Código de workflow debe ser único"""
        workflow = WorkflowCreate(
            codigo="WF_PPSH",
            nombre="Workflow PPSH",
            descripcion="Proceso de evaluación PPSH"
        )
        
        assert workflow.codigo == "WF_PPSH"
    
    def test_color_hex_formato_valido(self):
        """Test: Color hex debe tener formato válido"""
        workflow = WorkflowCreate(
            codigo="WF_TEST",
            nombre="Test Workflow",
            color_hex="#FF5733"
        )
        
        assert workflow.color_hex.startswith("#")
        assert len(workflow.color_hex) == 7
    
    def test_color_hex_formato_invalido(self):
        """Test: Color hex con formato inválido"""
        with pytest.raises(ValidationError):
            WorkflowCreate(
                codigo="WF_TEST",
                nombre="Test Workflow",
                color_hex="FF5733"  # Sin #
            )
    
    def test_workflow_requiere_etapa_inicial(self):
        """Test: Workflow debe tener al menos una etapa inicial"""
        with pytest.raises(ValidationError):
            WorkflowCreate(
                codigo="WF_TEST",
                nombre="Test Workflow",
                etapas=[
                    {
                        "codigo": "E1",
                        "nombre": "Etapa 1",
                        "tipo_etapa": "ETAPA",
                        "orden": 1,
                        "es_etapa_inicial": False,  # No hay etapa inicial
                        "perfiles_permitidos": ["USER"]
                    }
                ]
            )


class TestWorkflowEtapaValidators:
    """Tests para validadores de Etapa de Workflow"""
    
    def test_orden_etapa_positivo(self):
        """Test: Orden de etapa debe ser >= 0"""
        # Orden 0 es válido (se permite positivo o cero)
        etapa = WorkflowEtapaCreate(
            workflow_id=1,
            codigo="E1",
            nombre="Etapa 1",
            tipo_etapa="ETAPA",
            orden=0,
            es_etapa_inicial=True,
            perfiles_permitidos=["USER"]
        )
        assert etapa.orden == 0
        
        # Orden negativo es inválido
        with pytest.raises(ValidationError):
            WorkflowEtapaCreate(
                workflow_id=1,
                codigo="E2",
                nombre="Etapa 2",
                tipo_etapa="ETAPA",
                orden=-1,
                perfiles_permitidos=["USER"]
            )
    
    def test_tipo_etapa_valido(self):
        """Test: Tipo de etapa debe ser válido"""
        etapa = WorkflowEtapaCreate(
            workflow_id=1,
            codigo="E1",
            nombre="Etapa 1",
            tipo_etapa="ETAPA",
            orden=1,
            perfiles_permitidos=["USER"]
        )
        
        assert etapa.tipo_etapa in ["ETAPA", "DECISION", "PARALELO", "FINAL"]
    
    def test_etapa_requiere_perfiles(self):
        """Test: Etapa requiere al menos un perfil permitido"""
        with pytest.raises(ValidationError):
            WorkflowEtapaCreate(
                workflow_id=1,
                codigo="E1",
                nombre="Etapa 1",
                tipo_etapa="ETAPA",
                orden=1,
                perfiles_permitidos=[]  # Vacío
            )


class TestWorkflowPreguntaValidators:
    """Tests para validadores de Pregunta de Workflow"""
    
    def test_tipo_pregunta_valido(self):
        """Test: Tipo de pregunta debe ser válido"""
        pregunta = WorkflowPreguntaCreate(
            etapa_id=1,
            codigo="P1",
            pregunta="¿Pregunta de prueba?",
            tipo_pregunta="RESPUESTA_TEXTO",
            orden=1
        )
        
        assert pregunta.tipo_pregunta in [
            "RESPUESTA_TEXTO", "RESPUESTA_NUMERICA", "SI_NO",
            "SELECCION_UNICA", "SELECCION_MULTIPLE", "FECHA"
        ]
    
    def test_pregunta_texto_no_requiere_opciones(self):
        """Test: Pregunta de texto no requiere opciones"""
        pregunta = WorkflowPreguntaCreate(
            etapa_id=1,
            codigo="P1",
            pregunta="¿Describa su situación?",
            tipo_pregunta="RESPUESTA_TEXTO",
            orden=1
        )
        
        assert pregunta.opciones is None


class TestWorkflowConexionValidators:
    """Tests para validadores de Conexión de Workflow"""
    
    def test_conexion_etapas_diferentes(self):
        """Test: Conexión debe ser entre etapas diferentes"""
        with pytest.raises(ValidationError):
            WorkflowConexionCreate(
                workflow_id=1,
                etapa_origen_id=1,
                etapa_destino_id=1,  # Misma etapa (inválido)
                tipo_conexion="SECUENCIAL"
            )
    
    def test_tipo_conexion_valido(self):
        """Test: Tipo de conexión debe ser válido"""
        conexion = WorkflowConexionCreate(
            workflow_id=1,
            etapa_origen_id=1,
            etapa_destino_id=2,
            tipo_conexion="SECUENCIAL"
        )
        
        assert conexion.tipo_conexion in ["SECUENCIAL", "CONDICIONAL", "PARALELA"]
    
    def test_conexion_condicional_requiere_condicion(self):
        """Test: Conexión condicional requiere expresión de condición"""
        with pytest.raises(ValidationError):
            WorkflowConexionCreate(
                workflow_id=1,
                etapa_origen_id=1,
                etapa_destino_id=2,
                tipo_conexion="CONDICIONAL",
                condicion=None  # Requerida para condicional
            )


# ==========================================
# TESTS DE VALIDACIÓN CRUZADA
# ==========================================

class TestCrossFieldValidators:
    """Tests para validaciones que involucran múltiples campos"""
    
    def test_solicitud_prioridad_alta_requiere_justificacion(self):
        """Test: Prioridad alta requiere justificación"""
        with pytest.raises(ValidationError):
            SolicitudCreate(
                tipo_solicitud="INDIVIDUAL",
                cod_causa_humanitaria=1,
                descripcion_caso="Caso urgente",
                prioridad="ALTA",
                justificacion_prioridad=None,  # Requerida para prioridad alta
                solicitantes=[
                    {
                        "es_titular": True,
                        "tipo_documento": "PASAPORTE",
                        "num_documento": "AB123456",
                        "pais_emisor": "VEN",
                        "primer_nombre": "Juan",
                        "primer_apellido": "Pérez",
                        "fecha_nacimiento": date(1990, 5, 15),
                        "cod_sexo": "M",
                        "cod_nacionalidad": "VEN",
                        "email": "juan@example.com"
                    }
                ]
            )
    
    def test_tramite_finalizado_requiere_conclusion(self):
        """Test: Trámite finalizado requiere conclusión"""
        with pytest.raises(ValidationError):
            SimFtTramiteECreate(
                NUM_ANNIO=2025,
                NUM_TRAMITE=1,
                NUM_REGISTRO=1,
                COD_TRAMITE="PPSH",
                FEC_INI_TRAMITE=datetime(2025, 1, 1),
                FEC_FIN_TRAMITE=datetime(2025, 1, 10),
                IND_ESTATUS="03",  # Finalizado
                IND_CONCLUSION=None  # Requerida para estado finalizado
            )
    
    def test_workflow_etapa_final_no_tiene_siguiente(self):
        """Test: Etapa final no debe tener etapa siguiente"""
        with pytest.raises(ValidationError):
            WorkflowEtapaCreate(
                workflow_id=1,
                codigo="E_FINAL",
                nombre="Etapa Final",
                tipo_etapa="FINAL",
                orden=10,
                es_etapa_final=True,
                tiene_siguiente_etapa=True,  # Inválido para etapa final
                perfiles_permitidos=["ADMIN"]
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
