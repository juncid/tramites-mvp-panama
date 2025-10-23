"""
Script para cargar datos iniciales PPSH después de aplicar migraciones
Este script debe ejecutarse DESPUÉS de 'alembic upgrade head'
"""
import sys
from pathlib import Path

# Agregar directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from app.infrastructure.database import SessionLocal
from app.models import models_ppsh
from sqlalchemy import text, inspect

def check_if_tables_exist(db) -> bool:
    """Verifica si las tablas PPSH existen en la base de datos"""
    inspector = inspect(db.bind)
    existing_tables = inspector.get_table_names()
    
    required_tables = [
        'PPSH_CAUSA_HUMANITARIA',
        'PPSH_TIPO_DOCUMENTO',
        'PPSH_ESTADO'
    ]
    
    missing_tables = [table for table in required_tables if table not in existing_tables]
    
    if missing_tables:
        print(f"⚠️  Tablas PPSH faltantes: {', '.join(missing_tables)}")
        print("   Las tablas se crearán automáticamente cuando inicie el backend")
        return False
    
    return True

def check_if_data_exists(db):
    """Verifica si ya existen datos iniciales"""
    try:
        count = db.query(models_ppsh.PPSHCausaHumanitaria).count()
        return count > 0
    except Exception as e:
        print(f"⚠️  No se pudo verificar datos existentes: {e}")
        return False

def load_initial_data():
    """Carga datos iniciales de catálogos PPSH"""
    db = SessionLocal()
    
    try:
        # Verificar si las tablas PPSH existen
        if not check_if_tables_exist(db):
            print("⏭️  Omitiendo carga de datos - tablas PPSH aún no creadas")
            print("   Los datos se cargarán automáticamente cuando se ejecute el backend")
            return
        
        # Verificar si ya existen datos
        if check_if_data_exists(db):
            print("⚠️  Datos iniciales ya existen, omitiendo carga...")
            return
        
        print("📦 Cargando datos iniciales de PPSH...")
        
        # 1. Cargar Causas Humanitarias
        print("   → Causas humanitarias...")
        causas = [
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Conflicto Armado", descripcion="Persona proveniente de zona de conflicto armado", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Desastre Natural", descripcion="Víctima de desastre natural en país de origen", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Persecución Política", descripcion="Persecución por motivos políticos o ideológicos", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Reunificación Familiar", descripcion="Reunificación con familiar residente en Panamá", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Razones Médicas", descripcion="Tratamiento médico urgente no disponible en país de origen", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Violencia de Género", descripcion="Víctima de violencia de género o doméstica", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Trata de Personas", descripcion="Víctima de trata de personas o explotación", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Refugiado", descripcion="Persona con estatus de refugiado reconocido", requiere_evidencia=True, activo=True),
            models_ppsh.PPSHCausaHumanitaria(nombre_causa="Vulnerabilidad Extrema", descripcion="Situación de vulnerabilidad extrema documentada", requiere_evidencia=True, activo=True),
            PPSHCausaHumanitaria(nombre_causa="Otro", descripcion="Otra causa humanitaria justificada", requiere_evidencia=True, activo=True),
        ]
        db.add_all(causas)
        db.flush()
        print(f"      ✓ {len(causas)} causas cargadas")
        
        # 2. Cargar Tipos de Documentos
        print("   → Tipos de documentos...")
        tipos_doc = [
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Formulario Solicitud PPSH", es_obligatorio=True, descripcion="Formulario oficial de solicitud debidamente completado", orden=1, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Pasaporte", es_obligatorio=True, descripcion="Copia de pasaporte vigente (todas las páginas)", orden=2, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Fotografía", es_obligatorio=True, descripcion="Fotografías recientes tamaño carnet (fondo blanco)", orden=3, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Certificado Antecedentes Penales", es_obligatorio=True, descripcion="Del país de origen o último país de residencia", orden=4, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Evidencia Causa Humanitaria", es_obligatorio=True, descripcion="Documentos que acreditan la causa humanitaria alegada", orden=5, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Acta de Nacimiento", es_obligatorio=False, descripcion="Requerido para dependientes menores de edad", orden=6, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Certificado de Matrimonio", es_obligatorio=False, descripcion="Requerido si se incluye cónyuge", orden=7, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Solvencia Económica", es_obligatorio=False, descripcion="Carta bancaria, constancia de trabajo o similar", orden=8, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Carta de Invitación", es_obligatorio=False, descripcion="Si aplica para reunificación familiar", orden=9, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Informe Médico", es_obligatorio=False, descripcion="Requerido si la causa es por razones médicas", orden=10, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Cédula de Identidad", es_obligatorio=False, descripcion="Del país de origen", orden=11, activo=True),
            models_ppsh.PPSHTipoDocumento(nombre_tipo="Prueba de Parentesco", es_obligatorio=False, descripcion="Documentos que acrediten vínculo familiar", orden=12, activo=True),
        ]
        db.add_all(tipos_doc)
        db.flush()
        print(f"      ✓ {len(tipos_doc)} tipos de documentos cargados")
        
        # 3. Cargar Estados
        print("   → Estados del flujo...")
        estados = [
            models_ppsh.PPSHEstado(cod_estado="RECIBIDO", nombre_estado="Recibido", descripcion="Solicitud recibida y registrada en el sistema", orden=1, color_hex="#3498db", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="EN_REVISION", nombre_estado="En Revisión Documental", descripcion="Documentación siendo revisada por analista", orden=2, color_hex="#f39c12", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="INCOMPLETO", nombre_estado="Documentación Incompleta", descripcion="Faltan documentos o requiere subsanación", orden=3, color_hex="#e74c3c", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="SUBSANADO", nombre_estado="Documentación Subsanada", descripcion="Documentos faltantes han sido presentados", orden=4, color_hex="#9b59b6", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="EN_VERIFICACION", nombre_estado="En Verificación de Antecedentes", descripcion="Verificando antecedentes penales y migratorios", orden=5, color_hex="#16a085", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="EN_EVALUACION", nombre_estado="En Evaluación Técnica", descripcion="Evaluación de la causa humanitaria", orden=6, color_hex="#2980b9", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="EN_ENTREVISTA", nombre_estado="En Entrevista", descripcion="Programada o en proceso de entrevista personal", orden=7, color_hex="#8e44ad", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="CON_DICTAMEN_FAV", nombre_estado="Con Dictamen Favorable", descripcion="Analista recomienda aprobación", orden=8, color_hex="#27ae60", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="CON_DICTAMEN_DESFAV", nombre_estado="Con Dictamen Desfavorable", descripcion="Analista recomienda rechazo", orden=9, color_hex="#c0392b", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="EN_APROBACION", nombre_estado="En Aprobación", descripcion="Pendiente de aprobación por Director", orden=10, color_hex="#d35400", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="APROBADO", nombre_estado="Aprobado", descripcion="Solicitud aprobada - en emisión de resolución", orden=11, color_hex="#2ecc71", es_final=True, activo=True),
            models_ppsh.PPSHEstado(cod_estado="RECHAZADO", nombre_estado="Rechazado", descripcion="Solicitud rechazada", orden=12, color_hex="#e74c3c", es_final=True, activo=True),
            models_ppsh.PPSHEstado(cod_estado="EN_EMISION", nombre_estado="En Emisión de Resolución", descripcion="Emitiendo documento de resolución", orden=13, color_hex="#1abc9c", es_final=False, activo=True),
            models_ppsh.PPSHEstado(cod_estado="RESUELTO", nombre_estado="Resuelto - Permiso Emitido", descripcion="Permiso PPSH emitido y entregado", orden=14, color_hex="#27ae60", es_final=True, activo=True),
            models_ppsh.PPSHEstado(cod_estado="ARCHIVADO", nombre_estado="Archivado", descripcion="Expediente archivado", orden=15, color_hex="#95a5a6", es_final=True, activo=True),
            models_ppsh.PPSHEstado(cod_estado="CANCELADO", nombre_estado="Cancelado", descripcion="Solicitud cancelada por el solicitante", orden=16, color_hex="#7f8c8d", es_final=True, activo=True),
        ]
        db.add_all(estados)
        db.flush()
        print(f"      ✓ {len(estados)} estados cargados")
        
        # Commit de todos los cambios
        db.commit()
        
        # Mostrar resumen
        print("")
        print("✅ Datos iniciales cargados exitosamente:")
        print(f"   - {db.query(models_ppsh.PPSHCausaHumanitaria).count()} causas humanitarias")
        print(f"   - {db.query(models_ppsh.PPSHTipoDocumento).count()} tipos de documentos")
        print(f"   - {db.query(models_ppsh.PPSHEstado).count()} estados")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error cargando datos iniciales: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    load_initial_data()
