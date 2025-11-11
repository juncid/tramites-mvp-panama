"""actualizar_documentos_ppsh_decreto_6

Actualiza el catálogo de tipos de documento PPSH según
Decreto N° 6 del 11 de Marzo del 2025
Servicio Nacional de Migración de Panamá

Requisitos oficiales:
- 13 documentos en total
- 12 obligatorios
- 1 condicional (menores de edad)

Revision ID: 16c34c20acdb
Revises: 014_add_ppsh_etapa_solicitud
Create Date: 2025-11-10 21:19:36.479885

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import Integer, String, Boolean, DateTime
from datetime import datetime


# revision identifiers, used by Alembic.
revision: str = '16c34c20acdb'
down_revision: Union[str, None] = '014_add_ppsh_etapa_solicitud'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Actualiza los tipos de documento PPSH según Decreto N° 6
    """
    # Definir la tabla para operaciones de datos
    ppsh_tipo_documento = table(
        'PPSH_TIPO_DOCUMENTO',
        column('cod_tipo_doc', Integer),
        column('nombre_tipo', String),
        column('es_obligatorio', Boolean),
        column('descripcion', String),
        column('orden', Integer),
        column('activo', Boolean),
        column('created_at', DateTime)
    )
    
    # Limpiar datos anteriores
    op.execute('DELETE FROM PPSH_TIPO_DOCUMENTO')
    
    # Insertar los 13 requisitos oficiales según Decreto N° 6
    requisitos_oficiales = [
        {
            'nombre_tipo': 'Poder y solicitud mediante apoderado legal',
            'es_obligatorio': True,
            'descripcion': 'Documento notariado que autoriza al apoderado legal a realizar el trámite',
            'orden': 1,
            'activo': True
        },
        {
            'nombre_tipo': 'Dos fotos tamaño carnet, fondo blanco o a color',
            'es_obligatorio': True,
            'descripcion': 'Fotografías recientes tipo carnet',
            'orden': 2,
            'activo': True
        },
        {
            'nombre_tipo': 'Copia completa del pasaporte debidamente notariado',
            'es_obligatorio': True,
            'descripcion': 'Todas las páginas del pasaporte vigente',
            'orden': 3,
            'activo': True
        },
        {
            'nombre_tipo': 'Comprobante de domicilio del solicitante',
            'es_obligatorio': True,
            'descripcion': 'Contrato de arrendamiento notariado (copia de cédula del arrendador Notariado) O Recibo de servicios públicos (Luz, agua, Cable e Internet - Copia Notariada)',
            'orden': 4,
            'activo': True
        },
        {
            'nombre_tipo': 'Certificado de antecedentes penales',
            'es_obligatorio': True,
            'descripcion': 'Del país de origen debidamente autenticado o apostillado, según sea el caso',
            'orden': 5,
            'activo': True
        },
        {
            'nombre_tipo': 'Declaración jurada de antecedentes personales',
            'es_obligatorio': True,
            'descripcion': 'Documento legal que declara los antecedentes del solicitante',
            'orden': 6,
            'activo': True
        },
        {
            'nombre_tipo': 'Certificado de salud',
            'es_obligatorio': True,
            'descripcion': 'Expedido por un profesional idóneo',
            'orden': 7,
            'activo': True
        },
        {
            'nombre_tipo': 'Registro de mano de obra migrante',
            'es_obligatorio': True,
            'descripcion': 'Copia del registro solicitado ante el Ministerio de Trabajo y Desarrollo Laboral',
            'orden': 8,
            'activo': True
        },
        {
            'nombre_tipo': 'Documentación para menores de edad',
            'es_obligatorio': False,  # Condicional (solo si aplica)
            'descripcion': 'Poder notariado otorgado por ambos padres o tutor legal, documento que compruebe el parentesco y carta de responsabilidad debidamente autenticada o apostillada',
            'orden': 9,
            'activo': True
        },
        {
            'nombre_tipo': 'Cheque B/.800.00 - Repatriación',
            'es_obligatorio': True,
            'descripcion': 'Cheque Certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.800.00 en concepto de repatriación',
            'orden': 10,
            'activo': True
        },
        {
            'nombre_tipo': 'Cheque B/.250.00 - Servicio Migratorio',
            'es_obligatorio': True,
            'descripcion': 'Cheque Certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.250.00 en concepto de servicio migratorio',
            'orden': 11,
            'activo': True
        },
        {
            'nombre_tipo': 'Pago B/.100.00 - Carnet y Visa Múltiple',
            'es_obligatorio': True,
            'descripcion': 'Pago por la suma de B/.100.00 en concepto de carnet y visa múltiple por el permiso solicitado',
            'orden': 12,
            'activo': True
        },
        {
            'nombre_tipo': 'Cheque B/.100.00 - Permiso de Trabajo',
            'es_obligatorio': True,
            'descripcion': 'Cheque Certificado o de Gerencia del Banco Nacional de Panamá a favor del Tesoro Nacional por un monto de cien balboas (B/.100.00), en concepto de Permiso de Trabajo',
            'orden': 13,
            'activo': True
        }
    ]
    
    # Insertar cada requisito
    for requisito in requisitos_oficiales:
        op.execute(
            ppsh_tipo_documento.insert().values(
                nombre_tipo=requisito['nombre_tipo'],
                es_obligatorio=requisito['es_obligatorio'],
                descripcion=requisito['descripcion'],
                orden=requisito['orden'],
                activo=requisito['activo'],
                created_at=datetime.now()
            )
        )
    
    print(f"✓ {len(requisitos_oficiales)} tipos de documento PPSH insertados según Decreto N° 6")


def downgrade() -> None:
    """
    Revierte los cambios eliminando los documentos actualizados
    """
    # Limpiar la tabla
    op.execute('DELETE FROM PPSH_TIPO_DOCUMENTO')
    
    print("✓ Documentos PPSH eliminados (downgrade)")

