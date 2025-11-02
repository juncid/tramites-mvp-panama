"""
Script para crear documento de prueba para OCR
Sistema de Trámites Migratorios de Panamá

Este script crea un documento de prueba con contenido de imagen
para poder probar el servicio OCR end-to-end.
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.infrastructure.database import SessionLocal
from app.models.models_ppsh import PPSHSolicitud, PPSHDocumento
from PIL import Image, ImageDraw, ImageFont
import io


def crear_imagen_pasaporte() -> bytes:
    """
    Crea una imagen simple de pasaporte para pruebas
    """
    # Crear imagen blanca
    width, height = 800, 600
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Usar fuente por defecto
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()
    
    # Dibujar texto del pasaporte
    y_pos = 50
    
    # Título
    draw.text((width//2 - 200, y_pos), "REPÚBLICA DE PANAMÁ", fill='black', font=font_title)
    y_pos += 50
    
    draw.text((width//2 - 100, y_pos), "PASAPORTE", fill='black', font=font_title)
    y_pos += 80
    
    # Datos
    datos = [
        ("Número de Pasaporte:", "PA1234567"),
        ("Apellidos:", "PÉREZ GONZÁLEZ"),
        ("Nombres:", "JUAN CARLOS"),
        ("Nacionalidad:", "PAN"),
        ("Fecha de Nacimiento:", "15/01/1985"),
        ("Sexo:", "M"),
        ("Fecha de Emisión:", "10/01/2020"),
        ("Fecha de Vencimiento:", "10/01/2030"),
        ("Lugar de Nacimiento:", "PANAMÁ"),
    ]
    
    for label, value in datos:
        draw.text((50, y_pos), label, fill='black', font=font_text)
        draw.text((350, y_pos), value, fill='blue', font=font_text)
        y_pos += 40
    
    # Convertir a bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    return img_bytes


def crear_imagen_cedula() -> bytes:
    """
    Crea una imagen simple de cédula para pruebas
    """
    width, height = 800, 500
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()
    
    y_pos = 40
    
    draw.text((width//2 - 250, y_pos), "REPÚBLICA DE PANAMÁ", fill='black', font=font_title)
    y_pos += 40
    draw.text((width//2 - 200, y_pos), "CÉDULA DE IDENTIDAD PERSONAL", fill='black', font=font_title)
    y_pos += 60
    
    datos = [
        ("Número de Cédula:", "8-123-4567"),
        ("Nombres:", "MARÍA JOSÉ"),
        ("Apellidos:", "RODRÍGUEZ LÓPEZ"),
        ("Fecha de Nacimiento:", "20/05/1990"),
        ("Sexo:", "F"),
        ("Nacionalidad:", "PANAMEÑA"),
        ("Lugar de Nacimiento:", "CIUDAD DE PANAMÁ"),
    ]
    
    for label, value in datos:
        draw.text((50, y_pos), label, fill='black', font=font_text)
        draw.text((350, y_pos), value, fill='blue', font=font_text)
        y_pos += 35
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()


def seed_documentos_prueba(db: Session):
    """
    Crea documentos de prueba para OCR
    """
    print("🌱 Creando documentos de prueba para OCR...")
    
    try:
        # 1. Buscar o crear solicitud de prueba
        solicitud = db.query(PPSHSolicitud).filter(
            PPSHSolicitud.id_solicitud == 1
        ).first()
        
        if not solicitud:
            print("   Creando solicitud de prueba...")
            solicitud = PPSHSolicitud(
                id_solicitud=1,
                num_expediente="PPSH-TEST-001",
                tipo_solicitud="INDIVIDUAL",
                cod_causa_humanitaria=1,
                estado_actual="RECIBIDO",
                created_by="admin@test.com"
            )
            db.add(solicitud)
            db.commit()
            db.refresh(solicitud)
            print(f"   ✅ Solicitud creada: {solicitud.id_solicitud}")
        else:
            print(f"   ℹ️  Usando solicitud existente: {solicitud.id_solicitud}")
        
        # 2. Crear documento pasaporte de prueba
        doc_pasaporte = db.query(PPSHDocumento).filter(
            PPSHDocumento.id_documento == 1
        ).first()
        
        if not doc_pasaporte:
            print("   Generando imagen de pasaporte...")
            imagen_pasaporte = crear_imagen_pasaporte()
            
            doc_pasaporte = PPSHDocumento(
                id_documento=1,
                id_solicitud=solicitud.id_solicitud,
                nombre_archivo="pasaporte_prueba_ocr.png",
                extension="png",
                tamano_bytes=len(imagen_pasaporte),
                contenido_binario=imagen_pasaporte,
                ruta_archivo="/uploads/test/pasaporte_prueba_ocr.png",
                cod_tipo_documento=1,
                uploaded_by="admin@test.com"
            )
            db.add(doc_pasaporte)
            db.commit()
            db.refresh(doc_pasaporte)
            print(f"   ✅ Documento pasaporte creado: ID {doc_pasaporte.id_documento}")
        else:
            print(f"   ℹ️  Documento pasaporte ya existe: ID {doc_pasaporte.id_documento}")
        
        # 3. Crear documento cédula de prueba
        doc_cedula = db.query(PPSHDocumento).filter(
            PPSHDocumento.id_documento == 2
        ).first()
        
        if not doc_cedula:
            print("   Generando imagen de cédula...")
            imagen_cedula = crear_imagen_cedula()
            
            doc_cedula = PPSHDocumento(
                id_documento=2,
                id_solicitud=solicitud.id_solicitud,
                nombre_archivo="cedula_prueba_ocr.png",
                extension="png",
                tamano_bytes=len(imagen_cedula),
                contenido_binario=imagen_cedula,
                ruta_archivo="/uploads/test/cedula_prueba_ocr.png",
                cod_tipo_documento=2,
                uploaded_by="admin@test.com"
            )
            db.add(doc_cedula)
            db.commit()
            db.refresh(doc_cedula)
            print(f"   ✅ Documento cédula creado: ID {doc_cedula.id_documento}")
        else:
            print(f"   ℹ️  Documento cédula ya existe: ID {doc_cedula.id_documento}")
        
        print("\n✅ Documentos de prueba creados exitosamente!")
        print(f"\n📋 Documentos disponibles para prueba OCR:")
        print(f"   - ID 1: Pasaporte (PA1234567)")
        print(f"   - ID 2: Cédula (8-123-4567)")
        print(f"\n🧪 Para probar:")
        print(f"   1. Ir a: http://localhost:3000/ocr")
        print(f"   2. Ingresar ID: 1 o 2")
        print(f"   3. Clic en 'Procesar Documento'")
        
    except Exception as e:
        print(f"❌ Error creando documentos: {e}")
        db.rollback()
        raise


if __name__ == "__main__":
    print("=" * 60)
    print("  SEED DE DOCUMENTOS DE PRUEBA PARA OCR")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        seed_documentos_prueba(db)
    finally:
        db.close()
    
    print("\n" + "=" * 60)
