#!/usr/bin/env python3
"""
Script para crear el workflow completo de PPSH con 11 vistas dinámicas
basado en especificaciones detalladas de Figma

Este script crea:
- 1 Workflow: WORKFLOW_PPSH_COMPLETO
- 11 Etapas secuenciales con configuraciones específicas
- 10 Conexiones entre etapas
- Permisos configurados por perfil (CIUDADANO/ABOGADO vs FUNCIONARIO/ADMIN)
- Usuario de prueba Juan Cid (ID: 7777)
- Solicitud PPSH de prueba (ID: 7777)
- Instancia de workflow vinculada a la solicitud

Uso:
    python seed_ppsh_workflow_completo.py

Autor: Sistema de Trámites MVP Panamá
Fecha: 2025-11-23
"""

import os
import sys
from pathlib import Path

# Agregar el directorio backend al path para imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import urllib.parse

# Importar modelos
from app.models.models_workflow import (
    Workflow, WorkflowEtapa, WorkflowPregunta, 
    WorkflowConexion, WorkflowInstancia,
    TipoEtapa, TipoPregunta, EstadoWorkflow, EstadoInstancia
)

# Configuración de la base de datos
def get_database_connection():
    """Crea la conexión a la base de datos desde variables de entorno"""
    host = os.getenv('DATABASE_HOST', 'localhost')
    port = os.getenv('DATABASE_PORT', '1433')
    database = os.getenv('DATABASE_NAME', 'SIM_PANAMA')
    user = os.getenv('DATABASE_USER', 'sa')
    password = os.getenv('DATABASE_PASSWORD', 'YourStrong@Passw0rd')
    
    params = urllib.parse.quote_plus(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={host},{port};"
        f"DATABASE={database};"
        f"UID={user};"
        f"PWD={password};"
        f"TrustServerCertificate=yes;"
    )
    
    connection_string = f"mssql+pyodbc:///?odbc_connect={params}"
    engine = create_engine(connection_string, echo=False)
    return engine


def create_test_user(db: Session, user_id: str = "USER7777"):
    """Crea usuario de prueba en la tabla SIM_USUARIOS si no existe"""
    print(f"  → Verificando usuario {user_id}...")
    
    try:
        # Verificar si el usuario ya existe
        check_query = text("SELECT COUNT(*) FROM SIM_USUARIOS WHERE ID_USUARIO = :user_id")
        result = db.execute(check_query, {"user_id": user_id}).scalar()
        
        if result > 0:
            print(f"    ✓ Usuario {user_id} ya existe")
            return True
        
        # Crear usuario
        insert_query = text("""
            INSERT INTO SIM_USUARIOS (
                ID_USUARIO, NOM_USUARIO, APE_USUARIO, 
                COD_PERFIL, IND_ACTIVO, FEC_CREA_REG
            ) VALUES (
                :user_id, 'Juan', 'Cid',
                'CIUDADANO', 'S', GETDATE()
            )
        """)
        db.execute(insert_query, {"user_id": user_id})
        db.commit()
        print(f"    ✓ Usuario {user_id} creado exitosamente")
        return True
        
    except Exception as e:
        print(f"    ⚠ Error creando usuario (puede no ser necesario): {e}")
        db.rollback()
        return False


def create_ppsh_solicitud(db: Session, solicitud_id: int = 7777, user_id: str = "USER7777"):
    """Crea solicitud PPSH de prueba si no existe"""
    print(f"  → Verificando solicitud PPSH con expediente PPSH-2025-{solicitud_id}...")
    
    try:
        num_expediente = f"PPSH-2025-{solicitud_id}"
        
        # Verificar si la solicitud ya existe por num_expediente
        check_query = text("SELECT id_solicitud, num_expediente FROM PPSH_SOLICITUD WHERE num_expediente = :num_expediente")
        result = db.execute(check_query, {"num_expediente": num_expediente}).fetchone()
        
        if result:
            print(f"    ✓ Solicitud ya existe (ID: {result[0]}, Expediente: {result[1]})")
            return {"id_solicitud": result[0], "num_expediente": result[1]}
        
        # Verificar que exista la causa humanitaria (código 1)
        causa_query = text("SELECT COUNT(*) FROM PPSH_CAUSA_HUMANITARIA WHERE cod_causa = 1")
        causa_exists = db.execute(causa_query).scalar()
        
        if not causa_exists:
            # Crear causa humanitaria básica
            causa_insert = text("""
                INSERT INTO PPSH_CAUSA_HUMANITARIA (
                    cod_causa, nombre_causa, descripcion, 
                    requiere_evidencia, activo, created_at
                ) VALUES (
                    1, 'Causa Humanitaria General', 'Causa humanitaria para pruebas',
                    1, 1, GETDATE()
                )
            """)
            db.execute(causa_insert)
            db.commit()
            print("    ✓ Causa humanitaria creada")
        
        # Verificar que exista el estado RECIBIDO
        estado_query = text("SELECT COUNT(*) FROM PPSH_ESTADO WHERE cod_estado = 'RECIBIDO'")
        estado_exists = db.execute(estado_query).scalar()
        
        if not estado_exists:
            # Crear estado RECIBIDO
            estado_insert = text("""
                INSERT INTO PPSH_ESTADO (
                    cod_estado, nombre_estado, descripcion, 
                    orden, es_final, activo
                ) VALUES (
                    'RECIBIDO', 'Recibido', 'Solicitud recibida',
                    1, 0, 1
                )
            """)
            db.execute(estado_insert)
            db.commit()
            print("    ✓ Estado RECIBIDO creado")
        
        # Crear solicitud SIN especificar id_solicitud (dejarlo como IDENTITY)
        insert_solicitud = text("""
            INSERT INTO PPSH_SOLICITUD (
                num_expediente, tipo_solicitud, 
                cod_causa_humanitaria, descripcion_caso, 
                fecha_solicitud, estado_actual, prioridad, 
                activo, created_by, created_at
            ) VALUES (
                :num_expediente, 'INDIVIDUAL',
                1, 'Solicitud de prueba para workflow completo',
                GETDATE(), 'RECIBIDO', 'NORMAL',
                1, :user_id, GETDATE()
            )
        """)
        db.execute(insert_solicitud, {
            "num_expediente": num_expediente,
            "user_id": user_id
        })
        db.commit()
        
        # Obtener el ID generado
        get_id_query = text("SELECT id_solicitud FROM PPSH_SOLICITUD WHERE num_expediente = :num_expediente")
        new_id = db.execute(get_id_query, {"num_expediente": num_expediente}).scalar()
        
        print(f"    ✓ Solicitud PPSH creada (ID: {new_id}, Expediente: {num_expediente})")
        return {"id_solicitud": new_id, "num_expediente": num_expediente}
        
    except Exception as e:
        db.rollback()
        print(f"    ✗ Error creando solicitud: {e}")
        raise


def seed_workflow_completo(db: Session):
    """Crea el workflow completo con las 11 vistas dinámicas"""
    
    print("\n" + "="*70)
    print("🌱 INICIANDO SEED DEL WORKFLOW PPSH COMPLETO")
    print("="*70)
    
    # Texto Lorem Ipsum para bajadas
    lorem_ipsum = ("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
                   "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
    
    workflow_code = "WORKFLOW_PPSH_COMPLETO"
    
    # 1. Verificar si el workflow ya existe
    print("\n📋 Paso 1: Verificando workflow existente...")
    existing_workflow = db.query(Workflow).filter_by(codigo=workflow_code).first()
    
    if existing_workflow:
        print(f"  ⚠ Workflow '{workflow_code}' ya existe (ID: {existing_workflow.id})")
        print("  → Eliminando workflow existente y sus dependencias...")
        db.delete(existing_workflow)
        db.commit()
        print("  ✓ Workflow anterior eliminado")
    
    # 2. Crear el workflow principal
    print("\n📋 Paso 2: Creando workflow principal...")
    workflow = Workflow(
        codigo=workflow_code,
        nombre="Permiso de Protección de Seguridad Humanitaria - Completo",
        descripcion="Workflow completo PPSH con 11 vistas dinámicas basadas en Figma",
        version="1.0",
        estado=EstadoWorkflow.ACTIVO,
        categoria="Migración",
        requiere_autenticacion=True,
        es_publico=False,
        perfiles_creadores=["CIUDADANO", "ABOGADO"],
        activo=True,
        created_by="SYSTEM"
    )
    db.add(workflow)
    db.flush()
    print(f"  ✓ Workflow creado (ID: {workflow.id})")
    
    # 3. Crear las 11 etapas
    print("\n📋 Paso 3: Creando 11 etapas secuenciales...")
    
    etapas_config = [
        # Vista 1: REQUISITOS_DESCARGA (Ciudadanos)
        {
            "codigo": "VISTA_1_REQUISITOS",
            "nombre": "Descarga de Requisitos",
            "tipo": TipoEtapa.ETAPA,
            "orden": 1,
            "perfiles": ["CIUDADANO", "ABOGADO"],
            "titulo": "Requisitos del trámite PPSH",
            "bajada": lorem_ipsum,
            "es_inicial": True,
            "preguntas": [
                {
                    "codigo": "DESC_ARCHIVO",
                    "pregunta": "Descargue los requisitos del trámite PPSH",
                    "tipo": TipoPregunta.DESCARGA_ARCHIVO,
                    "orden": 1,
                    "obligatoria": True
                }
            ]
        },
        # Vista 2: CARGA_PODER_SOLICITUD (Ciudadanos)
        {
            "codigo": "VISTA_2_CARGA_PODER",
            "nombre": "Carga de Poder General",
            "tipo": TipoEtapa.ETAPA,
            "orden": 2,
            "perfiles": ["CIUDADANO", "ABOGADO"],
            "titulo": "Carga de requisitos del trámite PPSH",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "CARGA_PODER",
                    "pregunta": "Cargue poder general de su abogado",
                    "tipo": TipoPregunta.CARGA_ARCHIVO,
                    "orden": 1,
                    "obligatoria": True,
                    "extensiones": [".pdf", ".jpg", ".png"],
                    "tamano_max": 10
                }
            ]
        },
        # Vista 3: CARGA_SOLICITUD (Ciudadanos)
        {
            "codigo": "VISTA_3_CARGA_SOLICITUD",
            "nombre": "Carga de Solicitud Firmada",
            "tipo": TipoEtapa.ETAPA,
            "orden": 3,
            "perfiles": ["CIUDADANO", "ABOGADO"],
            "titulo": "Carga de requisitos del trámite PPSH",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "CARGA_SOLICITUD",
                    "pregunta": "Cargue solicitud de trámite de PPSH firmada",
                    "tipo": TipoPregunta.CARGA_ARCHIVO,
                    "orden": 1,
                    "obligatoria": True,
                    "extensiones": [".pdf"],
                    "tamano_max": 10
                }
            ]
        },
        # Vista 4: REVISION_REQUISITOS (Funcionarios)
        {
            "codigo": "VISTA_4_REVISION",
            "nombre": "Revisión de Requisitos",
            "tipo": TipoEtapa.ETAPA,
            "orden": 4,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Revisión requisitos",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "REVISION_DOCS",
                    "pregunta": "Revisión de documentos cargados",
                    "tipo": TipoPregunta.REVISION_MANUAL_DOCUMENTOS,
                    "orden": 1,
                    "obligatoria": True
                }
            ]
        },
        # Vista 5: COTIZACION (Funcionarios)
        {
            "codigo": "VISTA_5_COTIZACION",
            "nombre": "Cotización",
            "tipo": TipoEtapa.ETAPA,
            "orden": 5,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Cotización",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "COTIZACION_CORRECTA",
                    "pregunta": "¿Cotización correcta?",
                    "tipo": TipoPregunta.OPCIONES,
                    "orden": 1,
                    "obligatoria": True,
                    "opciones": ["Si", "No"]
                }
            ]
        },
        # Vista 6: INGRESO_DATOS (Funcionarios)
        {
            "codigo": "VISTA_6_INGRESO_DATOS",
            "nombre": "Ingreso de Datos del Caso",
            "tipo": TipoEtapa.ETAPA,
            "orden": 6,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Ingreso de datos del caso",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "DATOS_CASO",
                    "pregunta": "Ingrese los datos del caso",
                    "tipo": TipoPregunta.DATOS_CASO,
                    "orden": 1,
                    "obligatoria": True,
                    "opciones_datos": ["BESEX", "Nombre", "Nacionalidad", "Num_Pasaporte"]
                }
            ]
        },
        # Vista 7: IMPRESION_CASOS (Funcionarios)
        {
            "codigo": "VISTA_7_IMPRESION",
            "nombre": "Impresión Lista de Casos",
            "tipo": TipoEtapa.ETAPA,
            "orden": 7,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Impresión lista de casos",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "IMPRESION_LISTA",
                    "pregunta": "Imprimir lista de casos",
                    "tipo": TipoPregunta.IMPRESION,
                    "orden": 1,
                    "obligatoria": False
                }
            ]
        },
        # Vista 8: REASIGNACION (Funcionarios)
        {
            "codigo": "VISTA_8_REASIGNACION",
            "nombre": "Reasignación de Caso",
            "tipo": TipoEtapa.ETAPA,
            "orden": 8,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Reasignación de caso",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "SELECCION_CASO",
                    "pregunta": "Casos",
                    "tipo": TipoPregunta.LISTA,
                    "orden": 1,
                    "obligatoria": True,
                    "opciones": ["Caso 1", "Caso 2", "Caso 3", "Caso 4", "Caso 5"]
                }
            ]
        },
        # Vista 9: ENTREVISTA_FECHA (Funcionarios)
        {
            "codigo": "VISTA_9_ENTREVISTA_FECHA",
            "nombre": "Programación de Entrevista",
            "tipo": TipoEtapa.ETAPA,
            "orden": 9,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Entrevista",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "FECHA_ENTREVISTA",
                    "pregunta": "Seleccione fecha de entrevista",
                    "tipo": TipoPregunta.SELECCION_FECHA,
                    "orden": 1,
                    "obligatoria": True
                }
            ]
        },
        # Vista 10: ENTREVISTA_NOTAS (Funcionarios)
        {
            "codigo": "VISTA_10_ENTREVISTA_NOTAS",
            "nombre": "Notas de Entrevista",
            "tipo": TipoEtapa.ETAPA,
            "orden": 10,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Entrevista",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "preguntas": [
                {
                    "codigo": "NOTAS_ENTREVISTA",
                    "pregunta": "Notas de entrevista",
                    "tipo": TipoPregunta.RESPUESTA_LARGA,
                    "orden": 1,
                    "obligatoria": True,
                    "placeholder": "Ingrese las notas de la entrevista..."
                }
            ]
        },
        # Vista 11: DICTAMEN (Funcionarios)
        {
            "codigo": "VISTA_11_DICTAMEN",
            "nombre": "Dictamen Final",
            "tipo": TipoEtapa.ETAPA,
            "orden": 11,
            "perfiles": ["FUNCIONARIO", "ADMIN"],
            "titulo": "Dictamen",
            "bajada": lorem_ipsum,
            "es_inicial": False,
            "es_final": True,
            "preguntas": [
                {
                    "codigo": "DICTAMEN_FINAL",
                    "pregunta": "Dictamen final",
                    "tipo": TipoPregunta.RESPUESTA_LARGA,
                    "orden": 1,
                    "obligatoria": True,
                    "placeholder": "Ingrese el dictamen final del caso..."
                }
            ]
        }
    ]
    
    etapas_creadas = []
    
    for config in etapas_config:
        etapa = WorkflowEtapa(
            workflow_id=workflow.id,
            codigo=config["codigo"],
            nombre=config["nombre"],
            tipo_etapa=config["tipo"],
            orden=config["orden"],
            perfiles_permitidos=config["perfiles"],
            titulo_formulario=config["titulo"],
            bajada_formulario=config["bajada"],
            es_etapa_inicial=config.get("es_inicial", False),
            es_etapa_final=config.get("es_final", False),
            activo=True,
            created_by="SYSTEM"
        )
        db.add(etapa)
        db.flush()
        
        # Crear preguntas para la etapa
        for pregunta_config in config["preguntas"]:
            pregunta = WorkflowPregunta(
                etapa_id=etapa.id,
                codigo=pregunta_config["codigo"],
                pregunta=pregunta_config["pregunta"],
                tipo_pregunta=pregunta_config["tipo"],
                orden=pregunta_config["orden"],
                es_obligatoria=pregunta_config["obligatoria"],
                opciones=pregunta_config.get("opciones"),
                opciones_datos_caso=pregunta_config.get("opciones_datos"),
                extensiones_permitidas=pregunta_config.get("extensiones"),
                tamano_maximo_mb=pregunta_config.get("tamano_max"),
                placeholder=pregunta_config.get("placeholder"),
                activo=True,
                created_by="SYSTEM"
            )
            db.add(pregunta)
        
        etapas_creadas.append(etapa)
        print(f"  ✓ Etapa {config['orden']}: {config['nombre']} (ID: {etapa.id})")
    
    db.flush()
    
    # 4. Crear conexiones secuenciales entre etapas
    print("\n📋 Paso 4: Creando 10 conexiones secuenciales...")
    
    for i in range(len(etapas_creadas) - 1):
        conexion = WorkflowConexion(
            workflow_id=workflow.id,
            etapa_origen_id=etapas_creadas[i].id,
            etapa_destino_id=etapas_creadas[i + 1].id,
            nombre=f"A {etapas_creadas[i + 1].nombre}",
            es_predeterminada=True,
            activo=True,
            created_by="SYSTEM"
        )
        db.add(conexion)
        print(f"  ✓ Conexión {i+1}: {etapas_creadas[i].nombre} → {etapas_creadas[i+1].nombre}")
    
    db.commit()
    
    # 5. Crear usuario de prueba
    print("\n📋 Paso 5: Creando usuario de prueba...")
    create_test_user(db, "USER7777")
    
    # 6. Crear solicitud PPSH
    print("\n📋 Paso 6: Creando solicitud PPSH de prueba...")
    solicitud = create_ppsh_solicitud(db, 7777, "USER7777")
    
    # 7. Crear instancia de workflow
    print("\n📋 Paso 7: Creando instancia de workflow...")
    
    # Verificar si ya existe una instancia para esta solicitud
    existing_instance = db.query(WorkflowInstancia).filter_by(
        num_expediente=solicitud["num_expediente"]
    ).first()
    
    if existing_instance:
        print(f"  ⚠ Instancia ya existe para expediente {solicitud['num_expediente']}")
        db.delete(existing_instance)
        db.commit()
        print("  ✓ Instancia anterior eliminada")
    
    instancia = WorkflowInstancia(
        workflow_id=workflow.id,
        num_expediente=solicitud["num_expediente"],
        nombre_instancia=f"PPSH - Juan Cid - {solicitud['num_expediente']}",
        estado=EstadoInstancia.INICIADO,
        etapa_actual_id=etapas_creadas[0].id,
        creado_por_user_id="USER7777",
        metadata_adicional={
            "solicitud_ppsh_id": solicitud["id_solicitud"],
            "tipo_solicitud": "INDIVIDUAL",
            "test_data": True
        },
        activo=True
    )
    db.add(instancia)
    db.commit()
    db.refresh(instancia)
    
    print(f"  ✓ Instancia creada (ID: {instancia.id})")
    print(f"  ✓ Expediente: {instancia.num_expediente}")
    print(f"  ✓ Etapa inicial: {etapas_creadas[0].nombre}")
    
    # 8. Resumen final
    print("\n" + "="*70)
    print("✅ SEED COMPLETADO EXITOSAMENTE")
    print("="*70)
    print(f"\n📊 RESUMEN:")
    print(f"  • Workflow ID: {workflow.id}")
    print(f"  • Código: {workflow.codigo}")
    print(f"  • Etapas creadas: {len(etapas_creadas)}")
    print(f"  • Conexiones creadas: {len(etapas_creadas) - 1}")
    print(f"  • Usuario prueba: USER7777")
    print(f"  • Solicitud PPSH ID: {solicitud['id_solicitud']}")
    print(f"  • Expediente: {solicitud['num_expediente']}")
    print(f"  • Instancia ID: {instancia.id}")
    print(f"\n🎯 El workflow está listo para ser utilizado en el MVP")
    print(f"🌐 URL de prueba: http://localhost:3001/workflows/{instancia.id}/execution")
    print("="*70 + "\n")


def main():
    """Función principal"""
    print("\n" + "🚀"*35)
    print("SEED WORKFLOW PPSH COMPLETO - 11 VISTAS DINÁMICAS")
    print("🚀"*35 + "\n")
    
    try:
        # Crear conexión a la base de datos
        print("📡 Conectando a la base de datos...")
        engine = get_database_connection()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Probar conexión
        db.execute(text("SELECT 1"))
        print("✅ Conexión exitosa\n")
        
        # Ejecutar seed
        seed_workflow_completo(db)
        
        db.close()
        print("✅ Proceso completado exitosamente\n")
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
