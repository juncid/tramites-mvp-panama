"""
Agregar codigo_acceso a WORKFLOW_INSTANCIA

Permite código de acceso corto para solicitudes públicas (ej: PPSH-A7X9)
Facilita a ciudadanos continuar su trámite sin necesidad del link completo.

Revision ID: 019
Revises: 08be95d1d13e
Create Date: 2025-01-22
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '019_codigo_acceso'
down_revision = '08be95d1d13e'
branch_labels = None
depends_on = None


def upgrade():
    """
    Agregar columna codigo_acceso a WORKFLOW_INSTANCIA
    """
    # Agregar columna codigo_acceso
    op.execute("""
        IF NOT EXISTS (
            SELECT 1 FROM sys.columns 
            WHERE object_id = OBJECT_ID('WORKFLOW_INSTANCIA') 
            AND name = 'codigo_acceso'
        )
        BEGIN
            ALTER TABLE WORKFLOW_INSTANCIA
            ADD codigo_acceso NVARCHAR(12) NULL;
        END
    """)
    
    # Crear índice único para búsqueda rápida
    op.execute("""
        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes 
            WHERE name = 'UQ_WORKFLOW_INSTANCIA_codigo_acceso' 
            AND object_id = OBJECT_ID('WORKFLOW_INSTANCIA')
        )
        BEGIN
            CREATE UNIQUE INDEX UQ_WORKFLOW_INSTANCIA_codigo_acceso 
            ON WORKFLOW_INSTANCIA(codigo_acceso) 
            WHERE codigo_acceso IS NOT NULL;
        END
    """)
    
    # Generar códigos para instancias existentes que son de acceso público
    # Solo para instancias con metadata_adicional que contiene tipo_acceso='publico'
    op.execute("""
        -- Actualizar instancias públicas existentes con un código generado
        UPDATE WORKFLOW_INSTANCIA
        SET codigo_acceso = 'PPSH-' + 
            SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 4)
        WHERE codigo_acceso IS NULL
        AND metadata_adicional LIKE '%"tipo_acceso": "publico"%'
        AND activo = 1;
    """)
    
    print("✅ Columna codigo_acceso agregada a WORKFLOW_INSTANCIA")


def downgrade():
    """
    Remover columna codigo_acceso de WORKFLOW_INSTANCIA
    """
    # Remover índice único
    op.execute("""
        IF EXISTS (
            SELECT 1 FROM sys.indexes 
            WHERE name = 'UQ_WORKFLOW_INSTANCIA_codigo_acceso' 
            AND object_id = OBJECT_ID('WORKFLOW_INSTANCIA')
        )
        BEGIN
            DROP INDEX UQ_WORKFLOW_INSTANCIA_codigo_acceso 
            ON WORKFLOW_INSTANCIA;
        END
    """)
    
    # Remover columna
    op.execute("""
        IF EXISTS (
            SELECT 1 FROM sys.columns 
            WHERE object_id = OBJECT_ID('WORKFLOW_INSTANCIA') 
            AND name = 'codigo_acceso'
        )
        BEGIN
            ALTER TABLE WORKFLOW_INSTANCIA
            DROP COLUMN codigo_acceso;
        END
    """)
    
    print("✅ Columna codigo_acceso removida de WORKFLOW_INSTANCIA")
