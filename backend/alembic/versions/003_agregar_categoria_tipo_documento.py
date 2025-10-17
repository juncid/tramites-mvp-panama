"""agregar campo categoria a tipos documento

Revision ID: 003_agregar_categoria_tipo_documento
Revises: 002_actualizar_tipos_documento_ppsh
Create Date: 2025-10-17 16:15:00.000000

Agrega campo 'categoria' a la tabla PPSH_TIPO_DOCUMENTO para mejor organización
de los tipos de documentos según el decreto oficial.

Categorías:
- LEGAL: Documentos legales y poderes
- IDENTIFICACION: Pasaportes, fotos, etc.
- DOMICILIO: Comprobantes de residencia
- ANTECEDENTES: Certificados penales y declaraciones
- MEDICO: Certificados de salud
- LABORAL: Registros de trabajo
- MENORES: Documentos específicos para menores
- PAGO: Comprobantes de pago

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '003_agregar_categoria_tipo_documento'
down_revision = '002_actualizar_tipos_documento_ppsh'
branch_labels = None
depends_on = None


def upgrade():
    """
    Agrega el campo 'categoria' a PPSH_TIPO_DOCUMENTO
    """
    
    print("🔄 Agregando campo 'categoria' a PPSH_TIPO_DOCUMENTO...")
    
    # Agregar columna categoria
    op.add_column('PPSH_TIPO_DOCUMENTO', 
                  sa.Column('categoria', sa.String(20), nullable=True))
    
    # Agregar campos de auditoría si no existen
    try:
        op.add_column('PPSH_TIPO_DOCUMENTO', 
                      sa.Column('updated_at', sa.DateTime, nullable=True))
        op.add_column('PPSH_TIPO_DOCUMENTO', 
                      sa.Column('updated_by', sa.String(17), nullable=True))
        print("   - Agregados campos de auditoría")
    except:
        print("   - Campos de auditoría ya existen")
    
    # Actualizar categorías para los registros existentes activos
    categorias_mapping = [
        ("Poder y Solicitud Apoderado Legal", "LEGAL"),
        ("Fotografías Carnet", "IDENTIFICACION"),
        ("Pasaporte Notariado", "IDENTIFICACION"),
        ("Contrato Arrendamiento", "DOMICILIO"),
        ("Recibo Servicios Públicos", "DOMICILIO"),
        ("Certificado Antecedentes Penales", "ANTECEDENTES"),
        ("Declaración Jurada Antecedentes", "ANTECEDENTES"),
        ("Certificado de Salud", "MEDICO"),
        ("Registro Mano Obra Migrante", "LABORAL"),
        ("Poder Notariado Menores", "MENORES"),
        ("Comprobante Pago Reparación", "PAGO"),
        ("Comprobante Pago Servicio Migratorio", "PAGO"),
        ("Comprobante Pago Carnet Visa", "PAGO"),
        ("Comprobante Pago Permiso Trabajo", "PAGO")
    ]
    
    # Aplicar categorías
    for nombre_tipo, categoria in categorias_mapping:
        op.execute(f"""
            UPDATE PPSH_TIPO_DOCUMENTO 
            SET categoria = '{categoria}',
                updated_at = GETDATE(),
                updated_by = 'MIGRATION_003'
            WHERE nombre_tipo = '{nombre_tipo}' AND activo = 1
        """)
    
    # Crear índice para categoría
    op.create_index('IX_PPSH_TIPO_DOC_CATEGORIA', 'PPSH_TIPO_DOCUMENTO', ['categoria'])
    
    print("✅ Campo 'categoria' agregado exitosamente")
    print("   - Categorías asignadas a 14 tipos de documento")
    print("   - Índice creado para optimizar consultas por categoría")


def downgrade():
    """
    Elimina el campo 'categoria' de PPSH_TIPO_DOCUMENTO
    """
    
    print("🔄 Eliminando campo 'categoria' de PPSH_TIPO_DOCUMENTO...")
    
    # Eliminar índice
    try:
        op.drop_index('IX_PPSH_TIPO_DOC_CATEGORIA', 'PPSH_TIPO_DOCUMENTO')
        print("   - Índice eliminado")
    except:
        print("   - Índice no existe")
    
    # Eliminar columna
    op.drop_column('PPSH_TIPO_DOCUMENTO', 'categoria')
    
    print("✅ Campo 'categoria' eliminado exitosamente")