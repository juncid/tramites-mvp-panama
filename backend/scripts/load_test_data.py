"""
Script para cargar datos de prueba en la base de datos de test.
Incluye catálogos PPSH, workflows, y datos de ejemplo para testing completo.
"""
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuración de la base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mssql+pyodbc://sa:TestP@ssw0rd2025!@db-test:1433/SIM_PANAMA?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
)

def create_db_engine():
    """Crea el engine de SQLAlchemy"""
    try:
        engine = create_engine(DATABASE_URL, echo=True)
        return engine
    except Exception as e:
        print(f"❌ Error creando engine: {e}")
        sys.exit(1)

def load_ppsh_catalogs(session):
    """Carga catálogos del módulo PPSH"""
    print("\n📦 Cargando catálogos PPSH...")
    
    # 1. Causas Humanitarias
    causas = [
        ("CONF_ARM", "Conflicto Armado", "Personas que huyen de conflictos armados en su país de origen"),
        ("PERS_POL", "Persecución Política", "Persecución por opiniones o actividades políticas"),
        ("VIOL_GEN", "Violencia de Género", "Víctimas de violencia basada en género"),
        ("DESAST_NAT", "Desastre Natural", "Afectados por desastres naturales graves"),
        ("VIOL_DOM", "Violencia Doméstica", "Víctimas de violencia intrafamiliar grave"),
        ("PERS_RELIG", "Persecución Religiosa", "Persecución por creencias religiosas"),
        ("TRAT_PERS", "Trata de Personas", "Víctimas de tráfico y trata de personas"),
    ]
    
    for cod, nombre, desc in causas:
        session.execute(text("""
            IF NOT EXISTS (SELECT 1 FROM PPSH_CAUSA_HUMANITARIA WHERE cod_causa = :cod)
            INSERT INTO PPSH_CAUSA_HUMANITARIA (cod_causa, nombre, descripcion, activo, fecha_creacion)
            VALUES (:cod, :nombre, :desc, 1, GETDATE())
        """), {"cod": cod, "nombre": nombre, "desc": desc})
    
    print("  ✅ Causas Humanitarias cargadas (7 registros)")
    
    # 2. Tipos de Documento
    tipos_doc = [
        ("PASAPORTE", "Pasaporte", "Documento de identidad internacional", 1),
        ("CERT_NAC", "Certificado de Nacimiento", "Certificado oficial de nacimiento", 1),
        ("ANTEC_PEN", "Antecedentes Penales", "Certificado de antecedentes penales", 1),
        ("CERT_MED", "Certificado Médico", "Certificado de salud física y mental", 1),
        ("FOTO", "Fotografía", "Fotografía tipo pasaporte reciente", 1),
        ("CARTA_MOT", "Carta de Motivación", "Carta explicando las razones de la solicitud", 0),
        ("PRUEBAS", "Pruebas Documentales", "Documentos que respaldan la causa humanitaria", 0),
        ("CERT_ECON", "Certificado Económico", "Documento que acredita solvencia económica", 0),
    ]
    
    for cod, nombre, desc, obligatorio in tipos_doc:
        session.execute(text("""
            IF NOT EXISTS (SELECT 1 FROM PPSH_TIPO_DOCUMENTO WHERE cod_tipo = :cod)
            INSERT INTO PPSH_TIPO_DOCUMENTO (cod_tipo, nombre, descripcion, es_obligatorio, activo, fecha_creacion)
            VALUES (:cod, :nombre, :desc, :obligatorio, 1, GETDATE())
        """), {"cod": cod, "nombre": nombre, "desc": desc, "obligatorio": obligatorio})
    
    print("  ✅ Tipos de Documento cargados (8 registros)")
    
    # 3. Estados
    estados = [
        ("BORRADOR", "Borrador", "Solicitud en proceso de llenado", 1, 1),
        ("PENDIENTE", "Pendiente", "Solicitud presentada, pendiente de revisión", 2, 1),
        ("EN_REVISION", "En Revisión", "Bajo revisión de funcionario", 3, 1),
        ("DOC_INCOMPLETO", "Documentación Incompleta", "Falta documentación requerida", 4, 1),
        ("ENTREVISTA_PROG", "Entrevista Programada", "Entrevista agendada", 5, 1),
        ("EN_EVALUACION", "En Evaluación", "Evaluación final de la solicitud", 6, 1),
        ("APROBADA", "Aprobada", "Solicitud aprobada", 7, 1),
        ("RECHAZADA", "Rechazada", "Solicitud rechazada", 8, 0),
        ("CANCELADA", "Cancelada", "Solicitud cancelada por el solicitante", 9, 0),
    ]
    
    for cod, nombre, desc, orden, es_activo in estados:
        session.execute(text("""
            IF NOT EXISTS (SELECT 1 FROM PPSH_ESTADO WHERE cod_estado = :cod)
            INSERT INTO PPSH_ESTADO (cod_estado, nombre, descripcion, orden, es_activo, color, icono, fecha_creacion)
            VALUES (:cod, :nombre, :desc, :orden, :es_activo, 
                    CASE 
                        WHEN :cod = 'APROBADA' THEN '#10B981'
                        WHEN :cod = 'RECHAZADA' THEN '#EF4444'
                        WHEN :cod IN ('EN_REVISION', 'EN_EVALUACION') THEN '#F59E0B'
                        WHEN :cod = 'PENDIENTE' THEN '#3B82F6'
                        ELSE '#6B7280'
                    END,
                    CASE 
                        WHEN :cod = 'APROBADA' THEN 'check-circle'
                        WHEN :cod = 'RECHAZADA' THEN 'x-circle'
                        WHEN :cod IN ('EN_REVISION', 'EN_EVALUACION') THEN 'eye'
                        WHEN :cod = 'PENDIENTE' THEN 'clock'
                        ELSE 'file'
                    END,
                    GETDATE())
        """), {"cod": cod, "nombre": nombre, "desc": desc, "orden": orden, "es_activo": es_activo})
    
    print("  ✅ Estados cargados (9 registros)")
    
    # 4. Conceptos de Pago
    conceptos = [
        ("SOLICITUD", "Solicitud de PPSH", 50.00, 1),
        ("RENOVACION", "Renovación de PPSH", 75.00, 1),
        ("DUPLICADO", "Duplicado de Documento", 25.00, 1),
    ]
    
    for cod, desc, monto, activo in conceptos:
        session.execute(text("""
            IF NOT EXISTS (SELECT 1 FROM PPSH_CONCEPTO_PAGO WHERE cod_concepto = :cod)
            INSERT INTO PPSH_CONCEPTO_PAGO (cod_concepto, descripcion, monto, activo, fecha_creacion)
            VALUES (:cod, :desc, :monto, :activo, GETDATE())
        """), {"cod": cod, "desc": desc, "monto": monto, "activo": activo})
    
    print("  ✅ Conceptos de Pago cargados (3 registros)")
    
    session.commit()

def load_ppsh_sample_data(session):
    """Carga datos de ejemplo de solicitudes PPSH"""
    print("\n📝 Cargando solicitudes PPSH de ejemplo...")
    
    # 1. Crear solicitantes de ejemplo
    solicitantes = [
        ("Juan", "Pérez", "García", "8-123-456", "juan.perez@email.com", "+507 6000-1111", "CONF_ARM"),
        ("María", "López", "Martínez", "9-234-567", "maria.lopez@email.com", "+507 6000-2222", "VIOL_GEN"),
        ("Carlos", "Rodríguez", "Sánchez", "10-345-678", "carlos.rodriguez@email.com", "+507 6000-3333", "PERS_POL"),
    ]
    
    for idx, (nombre, ap_paterno, ap_materno, doc_id, email, tel, causa) in enumerate(solicitantes, 1):
        # Verificar si existe
        result = session.execute(text("""
            SELECT id_solicitante FROM PPSH_SOLICITANTE WHERE numero_documento = :doc_id
        """), {"doc_id": doc_id})
        
        if result.fetchone() is None:
            session.execute(text("""
                INSERT INTO PPSH_SOLICITANTE (
                    nombres, apellido_paterno, apellido_materno, numero_documento,
                    cod_pais_nacionalidad, fecha_nacimiento, cod_sexo, cod_estado_civil,
                    email, telefono, direccion_actual, activo, fecha_creacion
                )
                VALUES (
                    :nombre, :ap_pat, :ap_mat, :doc_id,
                    'PAN', DATEADD(YEAR, -30, GETDATE()), 'M', 'SOLTERO',
                    :email, :tel, 'Dirección de Prueba ' + CAST(:idx AS VARCHAR), 1, GETDATE()
                )
            """), {
                "nombre": nombre, "ap_pat": ap_paterno, "ap_mat": ap_materno,
                "doc_id": doc_id, "email": email, "tel": tel, "idx": idx
            })
    
    print("  ✅ Solicitantes cargados (3 registros)")
    
    # 2. Crear solicitudes
    # Obtener IDs de solicitantes
    result = session.execute(text("SELECT id_solicitante, numero_documento FROM PPSH_SOLICITANTE ORDER BY id_solicitante"))
    solicitantes_ids = result.fetchall()
    
    estados_solicitud = ["PENDIENTE", "EN_REVISION", "APROBADA"]
    
    for idx, (id_sol, num_doc) in enumerate(solicitantes_ids[:3], 1):
        # Verificar si existe
        result = session.execute(text("""
            SELECT id_solicitud FROM PPSH_SOLICITUD WHERE id_solicitante = :id_sol
        """), {"id_sol": id_sol})
        
        if result.fetchone() is None:
            causa = solicitantes[idx-1][6]  # CONF_ARM, VIOL_GEN, PERS_POL
            estado = estados_solicitud[idx-1]
            
            session.execute(text("""
                INSERT INTO PPSH_SOLICITUD (
                    numero_solicitud, id_solicitante, cod_causa_humanitaria,
                    cod_estado, fecha_solicitud, fecha_ultima_actualizacion,
                    observaciones, activo
                )
                VALUES (
                    'PPSH-2025-' + RIGHT('0000' + CAST(:idx AS VARCHAR), 4),
                    :id_sol, :causa, :estado, GETDATE(), GETDATE(),
                    'Solicitud de prueba para testing automatizado', 1
                )
            """), {"idx": idx, "id_sol": id_sol, "causa": causa, "estado": estado})
    
    print("  ✅ Solicitudes cargadas (3 registros)")
    
    session.commit()

def load_workflow_sample_data(session):
    """Carga workflows de ejemplo"""
    print("\n🔄 Cargando workflows de ejemplo...")
    
    # 1. Workflow para PPSH
    result = session.execute(text("""
        SELECT id_workflow FROM workflow WHERE codigo = 'WF_PPSH_001'
    """))
    
    if result.fetchone() is None:
        # Crear workflow
        session.execute(text("""
            INSERT INTO workflow (
                codigo, nombre, descripcion, tipo_tramite,
                activo, fecha_creacion, creado_por
            )
            VALUES (
                'WF_PPSH_001',
                'Proceso de Solicitud PPSH',
                'Flujo completo para solicitud de Permiso Por razones de Seguridad Humanitaria',
                'PPSH',
                1, GETDATE(), 1
            )
        """))
        
        # Obtener ID del workflow creado
        result = session.execute(text("""
            SELECT id_workflow FROM workflow WHERE codigo = 'WF_PPSH_001'
        """))
        workflow_id = result.fetchone()[0]
        
        # Crear etapas
        etapas = [
            ("ETAPA_001", "Registro Inicial", "Captura de datos básicos del solicitante", 1, 0, 0),
            ("ETAPA_002", "Carga de Documentos", "Subida de documentación requerida", 2, 0, 0),
            ("ETAPA_003", "Revisión Preliminar", "Revisión inicial de funcionario", 3, 1, 0),
            ("ETAPA_004", "Entrevista", "Entrevista con el solicitante", 4, 1, 0),
            ("ETAPA_005", "Evaluación Final", "Decisión sobre la solicitud", 5, 1, 1),
        ]
        
        etapa_ids = []
        for cod, nombre, desc, orden, req_aprob, es_final in etapas:
            session.execute(text("""
                INSERT INTO workflow_etapa (
                    id_workflow, codigo, nombre, descripcion, orden,
                    requiere_aprobacion, es_final, activo, fecha_creacion
                )
                VALUES (
                    :wf_id, :cod, :nombre, :desc, :orden,
                    :req_aprob, :es_final, 1, GETDATE()
                )
            """), {
                "wf_id": workflow_id, "cod": cod, "nombre": nombre,
                "desc": desc, "orden": orden, "req_aprob": req_aprob,
                "es_final": es_final
            })
            
            result = session.execute(text("""
                SELECT id_etapa FROM workflow_etapa 
                WHERE id_workflow = :wf_id AND codigo = :cod
            """), {"wf_id": workflow_id, "cod": cod})
            etapa_ids.append(result.fetchone()[0])
        
        # Crear conexiones entre etapas
        for i in range(len(etapa_ids) - 1):
            session.execute(text("""
                INSERT INTO workflow_conexion (
                    id_workflow, id_etapa_origen, id_etapa_destino,
                    condicion, activo, fecha_creacion
                )
                VALUES (
                    :wf_id, :origen, :destino, NULL, 1, GETDATE()
                )
            """), {
                "wf_id": workflow_id,
                "origen": etapa_ids[i],
                "destino": etapa_ids[i + 1]
            })
        
        # Crear preguntas para las etapas
        preguntas_etapa1 = [
            ("PREG_001", "¿Ha estado previamente en Panamá?", "select", "Si|No", 1),
            ("PREG_002", "¿Tiene familiares en Panamá?", "select", "Si|No", 0),
        ]
        
        for cod, texto, tipo, opciones, obligatorio in preguntas_etapa1:
            session.execute(text("""
                INSERT INTO workflow_pregunta (
                    id_etapa, codigo, texto_pregunta, tipo_respuesta,
                    opciones, es_obligatoria, orden, activo, fecha_creacion
                )
                VALUES (
                    :etapa_id, :cod, :texto, :tipo,
                    :opciones, :obligatorio, 1, 1, GETDATE()
                )
            """), {
                "etapa_id": etapa_ids[0], "cod": cod, "texto": texto,
                "tipo": tipo, "opciones": opciones, "obligatorio": obligatorio
            })
        
        print("  ✅ Workflow PPSH creado con 5 etapas y conexiones")
    else:
        print("  ℹ️  Workflow PPSH ya existe, omitiendo...")
    
    # 2. Workflow Simple para Trámites Generales
    result = session.execute(text("""
        SELECT id_workflow FROM workflow WHERE codigo = 'WF_TRAMITE_001'
    """))
    
    if result.fetchone() is None:
        session.execute(text("""
            INSERT INTO workflow (
                codigo, nombre, descripcion, tipo_tramite,
                activo, fecha_creacion, creado_por
            )
            VALUES (
                'WF_TRAMITE_001',
                'Proceso de Trámite General',
                'Flujo básico para trámites generales',
                'GENERAL',
                1, GETDATE(), 1
            )
        """))
        
        result = session.execute(text("""
            SELECT id_workflow FROM workflow WHERE codigo = 'WF_TRAMITE_001'
        """))
        workflow_id = result.fetchone()[0]
        
        # Etapas simples
        etapas_simple = [
            ("ETAPA_101", "Solicitud", "Presentación de solicitud", 1, 0, 0),
            ("ETAPA_102", "Revisión", "Revisión de funcionario", 2, 1, 0),
            ("ETAPA_103", "Resolución", "Decisión final", 3, 1, 1),
        ]
        
        etapa_ids = []
        for cod, nombre, desc, orden, req_aprob, es_final in etapas_simple:
            session.execute(text("""
                INSERT INTO workflow_etapa (
                    id_workflow, codigo, nombre, descripcion, orden,
                    requiere_aprobacion, es_final, activo, fecha_creacion
                )
                VALUES (
                    :wf_id, :cod, :nombre, :desc, :orden,
                    :req_aprob, :es_final, 1, GETDATE()
                )
            """), {
                "wf_id": workflow_id, "cod": cod, "nombre": nombre,
                "desc": desc, "orden": orden, "req_aprob": req_aprob,
                "es_final": es_final
            })
            
            result = session.execute(text("""
                SELECT id_etapa FROM workflow_etapa 
                WHERE id_workflow = :wf_id AND codigo = :cod
            """), {"wf_id": workflow_id, "cod": cod})
            etapa_ids.append(result.fetchone()[0])
        
        # Conexiones
        for i in range(len(etapa_ids) - 1):
            session.execute(text("""
                INSERT INTO workflow_conexion (
                    id_workflow, id_etapa_origen, id_etapa_destino,
                    condicion, activo, fecha_creacion
                )
                VALUES (
                    :wf_id, :origen, :destino, NULL, 1, GETDATE()
                )
            """), {
                "wf_id": workflow_id,
                "origen": etapa_ids[i],
                "destino": etapa_ids[i + 1]
            })
        
        print("  ✅ Workflow General creado con 3 etapas")
    else:
        print("  ℹ️  Workflow General ya existe, omitiendo...")
    
    session.commit()

def verify_data(session):
    """Verifica que los datos se hayan cargado correctamente"""
    print("\n🔍 Verificando datos cargados...")
    
    checks = [
        ("PPSH_CAUSA_HUMANITARIA", "Causas Humanitarias"),
        ("PPSH_TIPO_DOCUMENTO", "Tipos de Documento"),
        ("PPSH_ESTADO", "Estados"),
        ("PPSH_CONCEPTO_PAGO", "Conceptos de Pago"),
        ("PPSH_SOLICITANTE", "Solicitantes"),
        ("PPSH_SOLICITUD", "Solicitudes"),
        ("workflow", "Workflows"),
        ("workflow_etapa", "Etapas de Workflow"),
        ("workflow_conexion", "Conexiones de Workflow"),
    ]
    
    all_ok = True
    for tabla, nombre in checks:
        result = session.execute(text(f"SELECT COUNT(*) FROM {tabla}"))
        count = result.fetchone()[0]
        
        if count > 0:
            print(f"  ✅ {nombre}: {count} registros")
        else:
            print(f"  ❌ {nombre}: 0 registros")
            all_ok = False
    
    if all_ok:
        print("\n✅ Todos los datos se cargaron correctamente")
    else:
        print("\n⚠️  Algunas tablas no tienen datos")
    
    return all_ok

def main():
    """Función principal"""
    print("=" * 60)
    print("🚀 CARGA DE DATOS DE PRUEBA - Base de Datos Test")
    print("=" * 60)
    
    try:
        # Crear engine y sesión
        engine = create_db_engine()
        Session = sessionmaker(bind=engine)
        session = Session()
        
        print(f"\n✅ Conectado a: {DATABASE_URL.split('@')[1].split('?')[0]}")
        
        # Cargar datos
        load_ppsh_catalogs(session)
        load_ppsh_sample_data(session)
        load_workflow_sample_data(session)
        
        # Verificar
        verify_data(session)
        
        session.close()
        engine.dispose()
        
        print("\n" + "=" * 60)
        print("✅ PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error durante la carga de datos: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
