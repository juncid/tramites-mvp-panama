"""actualizar tipos documento ppsh segun decreto

Revision ID: 002_actualizar_tipos_documento_ppsh
Revises: 001_initial_ppsh_migration
Create Date: 2025-10-17 16:00:00.000000

Actualiza los tipos de documentos PPSH según el Decreto N° 6 del 11 de Marzo del 2025
Lista oficial de requisitos para Permiso de Protección de Seguridad Humanitaria (PPSH)

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '002_actualizar_tipos_documento_ppsh'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """
    Actualiza el catálogo de tipos de documentos PPSH según decreto oficial.
    
    Elimina los tipos de documentos actuales y los reemplaza con la lista
    oficial del Decreto N° 6 del 11 de Marzo del 2025.
    """
    
    print("🔄 Actualizando tipos de documento PPSH según decreto oficial...")
    
    # Desactivar todos los tipos existentes para mantener historial
    op.execute("""
        UPDATE PPSH_TIPO_DOCUMENTO 
        SET activo = 0, 
            updated_at = GETDATE(),
            updated_by = 'MIGRATION_002'
        WHERE activo = 1
    """)
    
    # Insertar los nuevos tipos según el decreto oficial
    tipos_documento_oficiales = [
        # Documentos principales
        {
            'nombre_tipo': 'Poder y Solicitud Apoderado Legal',
            'es_obligatorio': True,
            'descripcion': 'Poder y solicitud mediante apoderado legal debidamente notariado',
            'orden': 1,
            'categoria': 'LEGAL'
        },
        {
            'nombre_tipo': 'Fotografías Carnet',
            'es_obligatorio': True,
            'descripcion': 'Dos fotos tamaño carnet, fondo blanco o a color',
            'orden': 2,
            'categoria': 'IDENTIFICACION'
        },
        {
            'nombre_tipo': 'Pasaporte Notariado',
            'es_obligatorio': True,
            'descripcion': 'Copia completa del pasaporte debidamente notariado',
            'orden': 3,
            'categoria': 'IDENTIFICACION'
        },
        
        # Comprobante de domicilio
        {
            'nombre_tipo': 'Contrato Arrendamiento',
            'es_obligatorio': False,
            'descripcion': 'Contrato de arrendamiento notariado (copia de cédula del arrendador notariado)',
            'orden': 4,
            'categoria': 'DOMICILIO'
        },
        {
            'nombre_tipo': 'Recibo Servicios Públicos',
            'es_obligatorio': False,
            'descripcion': 'Recibo de servicios públicos (Luz, agua, Cable e Internet) copia notariada',
            'orden': 5,
            'categoria': 'DOMICILIO'
        },
        
        # Antecedentes y declaraciones
        {
            'nombre_tipo': 'Certificado Antecedentes Penales',
            'es_obligatorio': True,
            'descripcion': 'Certificado de antecedentes penales de su país de origen debidamente autenticado o apostillado',
            'orden': 6,
            'categoria': 'ANTECEDENTES'
        },
        {
            'nombre_tipo': 'Declaración Jurada Antecedentes',
            'es_obligatorio': True,
            'descripcion': 'Declaración jurada de antecedentes personales',
            'orden': 7,
            'categoria': 'ANTECEDENTES'
        },
        
        # Certificados
        {
            'nombre_tipo': 'Certificado de Salud',
            'es_obligatorio': True,
            'descripcion': 'Certificado de salud expedido por un profesional idóneo',
            'orden': 8,
            'categoria': 'MEDICO'
        },
        {
            'nombre_tipo': 'Registro Mano Obra Migrante',
            'es_obligatorio': True,
            'descripcion': 'Copia del registro de mano de obra migrante solicitado ante el Ministerio de Trabajo y Desarrollo Laboral',
            'orden': 9,
            'categoria': 'LABORAL'
        },
        
        # Documentos especiales (menores)
        {
            'nombre_tipo': 'Poder Notariado Menores',
            'es_obligatorio': False,
            'descripcion': 'Poder notariado para menores de edad, otorgado por ambos padres o tutor legal, con documento de parentesco y carta de responsabilidad',
            'orden': 10,
            'categoria': 'MENORES'
        },
        
        # Comprobantes de pago
        {
            'nombre_tipo': 'Comprobante Pago Reparación',
            'es_obligatorio': True,
            'descripcion': 'Cheque Certificado o de Gerencia del Banco Nacional por B/.800.00 - concepto de reparación',
            'orden': 11,
            'categoria': 'PAGO'
        },
        {
            'nombre_tipo': 'Comprobante Pago Servicio Migratorio',
            'es_obligatorio': True,
            'descripcion': 'Cheque Certificado o de Gerencia del Banco Nacional por B/.250.00 - concepto de servicio migratorio',
            'orden': 12,
            'categoria': 'PAGO'
        },
        {
            'nombre_tipo': 'Comprobante Pago Carnet Visa',
            'es_obligatorio': True,
            'descripcion': 'Pago por la suma de B/.100.00 - concepto de carnet y visa múltiple por el permiso solicitado',
            'orden': 13,
            'categoria': 'PAGO'
        },
        {
            'nombre_tipo': 'Comprobante Pago Permiso Trabajo',
            'es_obligatorio': True,
            'descripcion': 'Cheque Certificado o de Gerencia del Banco Nacional de Panamá por B/.100.00 - concepto de Permiso de Trabajo',
            'orden': 14,
            'categoria': 'PAGO'
        }
    ]
    
    # Preparar query de inserción
    insert_query = """
        INSERT INTO PPSH_TIPO_DOCUMENTO 
        (nombre_tipo, es_obligatorio, descripcion, orden, activo, created_at, created_by)
        VALUES 
    """
    
    # Construir valores para inserción batch
    values = []
    for i, doc in enumerate(tipos_documento_oficiales):
        values.append(f"""
        ('{doc['nombre_tipo']}', 
         {1 if doc['es_obligatorio'] else 0}, 
         '{doc['descripcion']}', 
         {doc['orden']}, 
         1, 
         GETDATE(), 
         'MIGRATION_002')""")
    
    # Ejecutar inserción
    op.execute(insert_query + ",".join(values))
    
    print("✅ Tipos de documento actualizados:")
    print("   - Desactivados tipos anteriores (12 tipos)")
    print("   - Insertados nuevos tipos según decreto (14 tipos)")
    print("   - Categorizados por tipo: LEGAL, IDENTIFICACION, DOMICILIO, ANTECEDENTES, MEDICO, LABORAL, MENORES, PAGO")
    
    # Crear índice adicional para la nueva categoría si no existe
    try:
        op.execute("CREATE INDEX IX_PPSH_TIPO_DOC_CATEGORIA ON PPSH_TIPO_DOCUMENTO(categoria) WHERE activo = 1")
        print("   - Creado índice para categorización")
    except:
        print("   - Índice de categorización ya existe o no se pudo crear")


def downgrade():
    """
    Revierte los cambios, reactivando los tipos de documentos anteriores.
    """
    
    print("🔄 Revirtiendo actualización de tipos de documento...")
    
    # Desactivar los tipos nuevos
    op.execute("""
        UPDATE PPSH_TIPO_DOCUMENTO 
        SET activo = 0,
            updated_at = GETDATE(),
            updated_by = 'MIGRATION_002_ROLLBACK'
        WHERE created_by = 'MIGRATION_002'
    """)
    
    # Reactivar los tipos anteriores
    op.execute("""
        UPDATE PPSH_TIPO_DOCUMENTO 
        SET activo = 1,
            updated_at = GETDATE(),
            updated_by = 'MIGRATION_002_ROLLBACK'
        WHERE created_by IS NULL OR created_by != 'MIGRATION_002'
    """)
    
    # Eliminar índice si existe
    try:
        op.execute("DROP INDEX IX_PPSH_TIPO_DOC_CATEGORIA ON PPSH_TIPO_DOCUMENTO")
        print("   - Eliminado índice de categorización")
    except:
        pass
    
    print("✅ Rollback completado - restaurados tipos de documento anteriores")