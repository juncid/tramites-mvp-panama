"""actualizar_documentos_ppsh_decreto_6

Actualiza el catalogo de tipos de documento PPSH segun
Decreto No. 6 del 11 de Marzo del 2025

Revision ID: 015_ppsh_decreto6
Revises: 014_add_ppsh_etapa_solicitud
Create Date: 2025-11-10 21:19:36.479885

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision: str = '015_ppsh_decreto6'
down_revision: Union[str, None] = '014_add_ppsh_etapa_solicitud'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Actualiza los tipos de documento PPSH segun Decreto No. 6"""
    
    # Primero, poner en NULL las referencias en PPSH_DOCUMENTO
    op.execute('UPDATE PPSH_DOCUMENTO SET cod_tipo_documento = NULL')
    
    # Limpiar datos anteriores de tipos de documento
    op.execute('DELETE FROM PPSH_TIPO_DOCUMENTO')
    
    # Insertar los 13 requisitos oficiales
    requisitos = [
        (1, 'Poder y solicitud mediante apoderado legal', True, 'Documento notariado que autoriza al apoderado legal'),
        (2, 'Dos fotos tamaño carnet, fondo blanco o a color', True, 'Fotografias recientes tipo carnet'),
        (3, 'Copia completa del pasaporte debidamente notariado', True, 'Todas las paginas del pasaporte vigente'),
        (4, 'Comprobante de domicilio del solicitante', True, 'Contrato de arrendamiento O Recibo de servicios'),
        (5, 'Certificado de antecedentes penales', True, 'Del pais de origen autenticado o apostillado'),
        (6, 'Declaracion jurada de antecedentes personales', True, 'Documento legal de antecedentes'),
        (7, 'Certificado de salud', True, 'Expedido por profesional idoneo'),
        (8, 'Registro de mano de obra migrante', True, 'Registro del Ministerio de Trabajo y Desarrollo Laboral'),
        (9, 'Documentacion para menores de edad', False, 'Poder notariado padres y carta responsabilidad'),
        (10, 'Cheque B/.800.00 - Repatriacion', True, 'Cheque Banco Nacional a favor SNM'),
        (11, 'Cheque B/.250.00 - Servicio Migratorio', True, 'Cheque Banco Nacional a favor SNM'),
        (12, 'Pago B/.100.00 - Carnet y Visa Multiple', True, 'Pago carnet y visa multiple'),
        (13, 'Cheque B/.100.00 - Permiso de Trabajo', True, 'Cheque Banco Nacional a favor Tesoro Nacional'),
    ]
    
    for orden, nombre, obligatorio, descripcion in requisitos:
        op.execute(f"""
            INSERT INTO PPSH_TIPO_DOCUMENTO (nombre_tipo, es_obligatorio, descripcion, orden, activo, created_at)
            VALUES ('{nombre}', {1 if obligatorio else 0}, '{descripcion}', {orden}, 1, GETDATE())
        """)


def downgrade() -> None:
    """Revierte los cambios"""
    # Poner referencias en NULL primero
    op.execute('UPDATE PPSH_DOCUMENTO SET cod_tipo_documento = NULL')
    # Luego eliminar tipos de documento
    op.execute('DELETE FROM PPSH_TIPO_DOCUMENTO')
