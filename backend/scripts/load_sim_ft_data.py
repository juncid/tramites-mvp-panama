"""
Script para cargar datos iniciales en las tablas de catálogo SIM_FT_*

Este script inicializa las tablas de catálogo del Sistema Integrado de Migración
con valores predeterminados según las especificaciones del sistema.

Tablas a inicializar:
- SIM_FT_ESTATUS: Estados de trámites
- SIM_FT_CONCLUSION: Tipos de conclusión
- SIM_FT_PRIORIDAD: Niveles de prioridad

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-22
"""

import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models_sim_ft import (
    SimFtEstatus, SimFtConclusion, SimFtPrioridad,
    SimFtTramites, SimFtPasos, SimFtPasoXTram
)
from app.infrastructure import get_database_url
from datetime import datetime


def init_estatus(session):
    """Inicializar catálogo de estados"""
    estados = [
        {"COD_ESTATUS": "01", "NOM_ESTATUS": "Iniciado", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "02", "NOM_ESTATUS": "En Proceso", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "03", "NOM_ESTATUS": "En Revisión", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "04", "NOM_ESTATUS": "Aprobado", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "05", "NOM_ESTATUS": "Rechazado", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "06", "NOM_ESTATUS": "Pendiente de Información", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "07", "NOM_ESTATUS": "Completado", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "08", "NOM_ESTATUS": "Cancelado", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "09", "NOM_ESTATUS": "Suspendido", "IND_ACTIVO": "S"},
        {"COD_ESTATUS": "10", "NOM_ESTATUS": "Archivado", "IND_ACTIVO": "S"},
    ]
    
    for estado_data in estados:
        existing = session.query(SimFtEstatus).filter_by(
            COD_ESTATUS=estado_data["COD_ESTATUS"]
        ).first()
        
        if not existing:
            estado = SimFtEstatus(
                **estado_data,
                ID_USUARIO_CREA="SYSTEM",
                FEC_CREA_REG=datetime.now()
            )
            session.add(estado)
            print(f"✓ Estado creado: {estado_data['COD_ESTATUS']} - {estado_data['NOM_ESTATUS']}")
        else:
            print(f"- Estado ya existe: {estado_data['COD_ESTATUS']}")


def init_conclusion(session):
    """Inicializar catálogo de conclusiones"""
    conclusiones = [
        {"COD_CONCLUSION": "01", "NOM_CONCLUSION": "Aprobado", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "02", "NOM_CONCLUSION": "Rechazado", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "03", "NOM_CONCLUSION": "Desistido", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "04", "NOM_CONCLUSION": "Cancelado por Usuario", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "05", "NOM_CONCLUSION": "Cancelado por Sistema", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "06", "NOM_CONCLUSION": "Aprobado con Condiciones", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "07", "NOM_CONCLUSION": "Rechazado - Documentación Incompleta", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "08", "NOM_CONCLUSION": "Rechazado - No Cumple Requisitos", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "09", "NOM_CONCLUSION": "En Espera de Resolución", "IND_ACTIVO": "S"},
        {"COD_CONCLUSION": "10", "NOM_CONCLUSION": "Archivado", "IND_ACTIVO": "S"},
    ]
    
    for conclusion_data in conclusiones:
        existing = session.query(SimFtConclusion).filter_by(
            COD_CONCLUSION=conclusion_data["COD_CONCLUSION"]
        ).first()
        
        if not existing:
            conclusion = SimFtConclusion(
                **conclusion_data,
                ID_USUARIO_CREA="SYSTEM",
                FEC_CREA_REG=datetime.now()
            )
            session.add(conclusion)
            print(f"✓ Conclusión creada: {conclusion_data['COD_CONCLUSION']} - {conclusion_data['NOM_CONCLUSION']}")
        else:
            print(f"- Conclusión ya existe: {conclusion_data['COD_CONCLUSION']}")


def init_prioridad(session):
    """Inicializar catálogo de prioridades"""
    prioridades = [
        {"COD_PRIORIDAD": "U", "NOM_PRIORIDAD": "Urgente", "IND_ACTIVO": "S"},
        {"COD_PRIORIDAD": "A", "NOM_PRIORIDAD": "Alta", "IND_ACTIVO": "S"},
        {"COD_PRIORIDAD": "N", "NOM_PRIORIDAD": "Normal", "IND_ACTIVO": "S"},
        {"COD_PRIORIDAD": "B", "NOM_PRIORIDAD": "Baja", "IND_ACTIVO": "S"},
    ]
    
    for prioridad_data in prioridades:
        existing = session.query(SimFtPrioridad).filter_by(
            COD_PRIORIDAD=prioridad_data["COD_PRIORIDAD"]
        ).first()
        
        if not existing:
            prioridad = SimFtPrioridad(
                **prioridad_data,
                ID_USUARIO_CREA="SYSTEM",
                FEC_CREA_REG=datetime.now()
            )
            session.add(prioridad)
            print(f"✓ Prioridad creada: {prioridad_data['COD_PRIORIDAD']} - {prioridad_data['NOM_PRIORIDAD']}")
        else:
            print(f"- Prioridad ya existe: {prioridad_data['COD_PRIORIDAD']}")


def init_tramites_ejemplo(session):
    """Inicializar tipos de trámites de ejemplo"""
    tramites = [
        {
            "COD_TRAMITE": "PPSH",
            "DESC_TRAMITE": "Permiso de Protección de Seguridad Humanitaria",
            "PAG_TRAMITE": "https://www.migracion.gob.pa/ppsh",
            "IND_ACTIVO": "S"
        },
        {
            "COD_TRAMITE": "VISA_TEMP",
            "DESC_TRAMITE": "Visa Temporal",
            "PAG_TRAMITE": "https://www.migracion.gob.pa/visa-temporal",
            "IND_ACTIVO": "S"
        },
        {
            "COD_TRAMITE": "RESID_PERM",
            "DESC_TRAMITE": "Residencia Permanente",
            "PAG_TRAMITE": "https://www.migracion.gob.pa/residencia-permanente",
            "IND_ACTIVO": "S"
        },
        {
            "COD_TRAMITE": "RENOVACION",
            "DESC_TRAMITE": "Renovación de Permisos",
            "PAG_TRAMITE": "https://www.migracion.gob.pa/renovacion",
            "IND_ACTIVO": "S"
        },
    ]
    
    for tramite_data in tramites:
        existing = session.query(SimFtTramites).filter_by(
            COD_TRAMITE=tramite_data["COD_TRAMITE"]
        ).first()
        
        if not existing:
            tramite = SimFtTramites(
                **tramite_data,
                ID_USUARIO_CREA="SYSTEM",
                FEC_CREA_REG=datetime.now()
            )
            session.add(tramite)
            print(f"✓ Trámite creado: {tramite_data['COD_TRAMITE']} - {tramite_data['DESC_TRAMITE']}")
        else:
            print(f"- Trámite ya existe: {tramite_data['COD_TRAMITE']}")


def init_pasos_ppsh(session):
    """Inicializar pasos del trámite PPSH"""
    pasos = [
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 1, "NOM_DESCRIPCION": "Registro Inicial", "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 2, "NOM_DESCRIPCION": "Carga de Documentos", "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 3, "NOM_DESCRIPCION": "Revisión Documental", "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 4, "NOM_DESCRIPCION": "Entrevista Personal", "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 5, "NOM_DESCRIPCION": "Resolución Final", "IND_ACTIVO": "S"},
    ]
    
    for paso_data in pasos:
        existing = session.query(SimFtPasos).filter_by(
            COD_TRAMITE=paso_data["COD_TRAMITE"],
            NUM_PASO=paso_data["NUM_PASO"]
        ).first()
        
        if not existing:
            paso = SimFtPasos(
                **paso_data,
                ID_USUARIO_CREA="SYSTEM",
                FEC_CREA_REG=datetime.now()
            )
            session.add(paso)
            print(f"✓ Paso creado: {paso_data['COD_TRAMITE']} - Paso {paso_data['NUM_PASO']}")
        else:
            print(f"- Paso ya existe: {paso_data['COD_TRAMITE']} - Paso {paso_data['NUM_PASO']}")


def init_configuracion_pasos_ppsh(session):
    """Inicializar configuración de pasos PPSH"""
    configuraciones = [
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 1, "COD_SECCION": "0001", "ID_PASO_SGTE": 2, "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 2, "COD_SECCION": "0001", "ID_PASO_SGTE": 3, "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 3, "COD_SECCION": "0002", "ID_PASO_SGTE": 4, "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 4, "COD_SECCION": "0003", "ID_PASO_SGTE": 5, "IND_ACTIVO": "S"},
        {"COD_TRAMITE": "PPSH", "NUM_PASO": 5, "COD_SECCION": "0004", "ID_PASO_SGTE": None, "IND_ACTIVO": "S"},
    ]
    
    for config_data in configuraciones:
        existing = session.query(SimFtPasoXTram).filter_by(
            COD_TRAMITE=config_data["COD_TRAMITE"],
            NUM_PASO=config_data["NUM_PASO"]
        ).first()
        
        if not existing:
            config = SimFtPasoXTram(
                **config_data,
                ID_USUARIO_CREA="SYSTEM",
                FEC_CREA_REG=datetime.now()
            )
            session.add(config)
            print(f"✓ Configuración creada: {config_data['COD_TRAMITE']} - Paso {config_data['NUM_PASO']}")
        else:
            print(f"- Configuración ya existe: {config_data['COD_TRAMITE']} - Paso {config_data['NUM_PASO']}")


def main():
    """Función principal"""
    print("=" * 80)
    print("INICIALIZACIÓN DE DATOS DE CATÁLOGO SIM_FT_*")
    print("=" * 80)
    print()
    
    # Crear engine y sesión
    database_url = get_database_url()
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Inicializar catálogos
        print("\n1. Inicializando Estados...")
        print("-" * 80)
        init_estatus(session)
        
        print("\n2. Inicializando Conclusiones...")
        print("-" * 80)
        init_conclusion(session)
        
        print("\n3. Inicializando Prioridades...")
        print("-" * 80)
        init_prioridad(session)
        
        print("\n4. Inicializando Tipos de Trámites...")
        print("-" * 80)
        init_tramites_ejemplo(session)
        
        print("\n5. Inicializando Pasos PPSH...")
        print("-" * 80)
        init_pasos_ppsh(session)
        
        print("\n6. Inicializando Configuración de Pasos PPSH...")
        print("-" * 80)
        init_configuracion_pasos_ppsh(session)
        
        # Commit de todos los cambios
        session.commit()
        
        print("\n" + "=" * 80)
        print("✓ INICIALIZACIÓN COMPLETADA EXITOSAMENTE")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n✗ ERROR durante la inicialización: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
