"""
Tareas Celery para procesamiento OCR
Sistema de Trámites Migratorios de Panamá

Tareas:
- process_document_ocr: Procesar documento con OCR
- process_urgent_document: Procesar documento urgente (alta prioridad)
- cleanup_old_results: Limpieza de resultados antiguos
- generate_ocr_statistics: Generar estadísticas
"""

import os
import time
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from celery import Task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
from sqlalchemy import func, text

import pytesseract
import cv2
import numpy as np
import re
from io import BytesIO

try:
    from pdf2image import convert_from_path, convert_from_bytes
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    convert_from_path = None
    convert_from_bytes = None

from celery_app import celery_app
from app.infrastructure.database import SessionLocal
from app.models.models_ppsh import PPSHDocumento, PPSHSolicitante
from app.models.models_ocr import PPSHDocumentoOCR

# Logger de Celery
logger = get_task_logger(__name__)


class OCRTask(Task):
    """
    Clase base para tareas OCR con manejo automático de errores y retry
    """
    autoretry_for = (Exception,)
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True
    retry_backoff_max = 600  # 10 minutos
    retry_jitter = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Callback cuando falla la tarea"""
        logger.error(f'Task {task_id} failed: {exc}')
        super().on_failure(exc, task_id, args, kwargs, einfo)

    def on_success(self, retval, task_id, args, kwargs):
        """Callback cuando tiene éxito la tarea"""
        logger.info(f'Task {task_id} succeeded')
        super().on_success(retval, task_id, args, kwargs)


@celery_app.task(bind=True, base=OCRTask, name='ocr.process_document')
def process_document_ocr(
    self,
    id_documento: int,
    user_id: str,
    opciones: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Procesa un documento con OCR de forma asíncrona
    
    Args:
        id_documento: ID del documento a procesar
        user_id: Usuario que solicita el procesamiento
        opciones: Configuraciones adicionales (idioma, preprocesamiento, etc.)
    
    Returns:
        Dict con resultados del procesamiento
    """
    return _process_document_ocr_internal(self, id_documento, user_id, opciones)


@celery_app.task(bind=True, base=OCRTask, name='ocr.procesar_documento')
def procesar_documento_ocr(
    self,
    id_documento: int
) -> Dict[str, Any]:
    """
    Alias simplificado para procesar documento OCR desde upload automático.
    No requiere user_id ya que es procesamiento automático del sistema.
    
    Args:
        id_documento: ID del documento a procesar
    
    Returns:
        Dict con resultados del procesamiento
    """
    return _process_document_ocr_internal(self, id_documento, user_id="SYSTEM_OCR", opciones=None)


def _process_document_ocr_internal(
    task_instance,
    id_documento: int,
    user_id: str,
    opciones: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Implementación interna del procesamiento OCR
    Compartida por process_document_ocr y process_urgent_document
    """
    db: Session = SessionLocal()
    ocr_record = None
    inicio_total = time.time()

    try:
        logger.info(f"Iniciando procesamiento OCR para documento {id_documento}")

        # 1. Obtener documento
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 1, 'total': 6, 'status': 'Cargando documento...', 'porcentaje': 16}
        )

        documento = db.query(PPSHDocumento).filter(
            PPSHDocumento.id_documento == id_documento
        ).first()

        if not documento:
            raise ValueError(f"Documento {id_documento} no encontrado")

        logger.info(f"Documento cargado: {documento.nombre_archivo}")

        # 2. Crear o actualizar registro OCR
        ocr_record = db.query(PPSHDocumentoOCR).filter(
            PPSHDocumentoOCR.id_documento == id_documento,
            PPSHDocumentoOCR.estado_ocr.in_(['PENDIENTE', 'ERROR'])
        ).first()

        if not ocr_record:
            ocr_record = PPSHDocumentoOCR(
                id_documento=id_documento,
                created_by=user_id
            )
            db.add(ocr_record)

        ocr_record.estado_ocr = 'PROCESANDO'
        ocr_record.celery_task_id = task_instance.request.id
        ocr_record.fecha_inicio_proceso = datetime.now()
        ocr_record.intentos_procesamiento = (ocr_record.intentos_procesamiento or 0) + 1
        db.commit()

        logger.info(f"Registro OCR creado/actualizado: ID {ocr_record.id_ocr}")

        # 3. Cargar y validar imagen
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 2, 'total': 6, 'status': 'Cargando imagen...', 'porcentaje': 33}
        )

        imagen = load_image_from_document(documento)
        if imagen is None:
            raise ValueError("No se pudo cargar la imagen del documento")

        logger.info(f"Imagen cargada: {imagen.shape}")

        # 4. Preprocesamiento
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 3, 'total': 6, 'status': 'Preprocesando imagen...', 'porcentaje': 50}
        )

        preprocessing_opts = opciones.get('preprocessing', {}) if opciones else {}
        imagen_procesada = preprocess_image(imagen, preprocessing_opts)

        logger.info("Preprocesamiento completado")

        # 5. Ejecutar OCR
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 4, 'total': 6, 'status': 'Extrayendo texto con OCR...', 'porcentaje': 66}
        )

        idioma = opciones.get('idioma', 'spa+eng') if opciones else 'spa+eng'
        inicio_ocr = time.time()
        resultado_ocr = execute_ocr(imagen_procesada, idioma=idioma)
        tiempo_ocr = int((time.time() - inicio_ocr) * 1000)

        logger.info(f"OCR completado en {tiempo_ocr}ms. Confianza: {resultado_ocr['confianza']}%")

        # 6. Validar OCR contra datos de la solicitud y extraer datos estructurados
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 5, 'total': 6, 'status': 'Validando datos contra solicitud...', 'porcentaje': 83}
        )

        datos_estructurados = None
        
        # NUEVO ENFOQUE: Validar contra datos de la solicitud
        if documento.id_solicitud:
            datos_validacion = validate_ocr_against_solicitud(
                db=db,
                texto_ocr=resultado_ocr['texto'],
                id_solicitud=documento.id_solicitud
            )
            if datos_validacion:
                datos_estructurados = json.dumps(datos_validacion, ensure_ascii=False)
                logger.info(f"Validación contra solicitud: {datos_validacion.get('resumen_validacion', {})}")
        else:
            # Fallback: extracción genérica si no hay solicitud asociada
            extraer_datos = True
            if opciones:
                extraer_datos = opciones.get('extraer_datos_estructurados', True)
            
            if extraer_datos:
                datos_estructurados = extract_structured_data(
                    resultado_ocr['texto'],
                    documento.cod_tipo_documento
                )
                if datos_estructurados:
                    logger.info(f"Datos estructurados extraídos (genérico): {len(json.loads(datos_estructurados))} campos")

        # 7. Guardar resultados
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 6, 'total': 6, 'status': 'Guardando resultados...', 'porcentaje': 100}
        )

        ocr_record.estado_ocr = 'COMPLETADO'
        ocr_record.texto_extraido = resultado_ocr['texto']
        ocr_record.texto_confianza = resultado_ocr['confianza']
        ocr_record.idioma_detectado = resultado_ocr.get('idioma', idioma)
        ocr_record.num_caracteres = len(resultado_ocr['texto'])
        ocr_record.num_palabras = len(resultado_ocr['texto'].split())
        ocr_record.num_paginas = 1  # TODO: Detectar múltiples páginas en PDF
        ocr_record.datos_estructurados = datos_estructurados
        ocr_record.fecha_fin_proceso = datetime.now()
        ocr_record.tiempo_procesamiento_ms = int((time.time() - inicio_total) * 1000)
        ocr_record.updated_at = datetime.now()

        db.commit()

        logger.info(f"Procesamiento completado exitosamente para documento {id_documento}")

        return {
            'success': True,
            'id_ocr': ocr_record.id_ocr,
            'id_documento': id_documento,
            'estado': 'COMPLETADO',
            'confianza': float(resultado_ocr['confianza']),
            'num_caracteres': len(resultado_ocr['texto']),
            'num_palabras': len(resultado_ocr['texto'].split()),
            'tiempo_ms': ocr_record.tiempo_procesamiento_ms,
            'datos_estructurados': bool(datos_estructurados)
        }

    except Exception as e:
        logger.error(f"Error procesando documento {id_documento}: {str(e)}", exc_info=True)

        # Registrar error en la BD
        if ocr_record:
            ocr_record.estado_ocr = 'ERROR'
            ocr_record.codigo_error = type(e).__name__
            ocr_record.mensaje_error = str(e)[:1000]
            ocr_record.fecha_fin_proceso = datetime.now()
            try:
                db.commit()
            except:
                db.rollback()

        raise

    finally:
        db.close()


@celery_app.task(bind=True, base=OCRTask, name='ocr.process_urgent')
def process_urgent_document(
    self,
    id_documento: int,
    user_id: str,
    opciones: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Procesa un documento urgente con alta prioridad
    Usa la misma lógica que process_document_ocr pero en cola de alta prioridad
    """
    # Llamar a la implementación interna directamente (sin decorador Celery)
    return _process_document_ocr_internal(self, id_documento, user_id, opciones)


def load_image_from_document(documento: PPSHDocumento) -> Optional[np.ndarray]:
    """
    Carga imagen desde contenido binario o archivo.
    Soporta imágenes (jpg, png, etc.) y PDFs.
    
    Args:
        documento: Instancia de PPSHDocumento
    
    Returns:
        Array numpy con la imagen o None si falla
    """
    try:
        # Detectar extensión del archivo
        extension = (documento.extension or '').lower().strip('.')
        if not extension and documento.nombre_archivo:
            extension = documento.nombre_archivo.rsplit('.', 1)[-1].lower() if '.' in documento.nombre_archivo else ''
        
        is_pdf = extension == 'pdf'
        logger.debug(f"Cargando documento: {documento.nombre_archivo}, extension: {extension}, is_pdf: {is_pdf}")
        
        if documento.contenido_binario:
            # Cargar desde contenido binario
            if is_pdf:
                imagen = _load_pdf_from_bytes(documento.contenido_binario)
            else:
                logger.debug("Cargando imagen desde contenido binario")
                nparr = np.frombuffer(documento.contenido_binario, np.uint8)
                imagen = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        elif documento.ruta_archivo:
            # Construir ruta completa desde UPLOADS_DIR
            uploads_dir = os.getenv("UPLOADS_DIR", "/app/uploads")

            # Si la ruta ya es absoluta, usarla directamente
            if os.path.isabs(documento.ruta_archivo):
                full_path = documento.ruta_archivo
            else:
                full_path = os.path.join(uploads_dir, documento.ruta_archivo)

            if not os.path.exists(full_path):
                logger.error(f"Archivo no encontrado: {full_path}")
                return None
            
            if is_pdf:
                imagen = _load_pdf_from_file(full_path)
            else:
                logger.debug(f"Cargando imagen desde archivo: {full_path}")
                imagen = cv2.imread(full_path)

        else:
            logger.error("Documento sin contenido de imagen válido")
            return None

        if imagen is None:
            logger.error("No se pudo decodificar el documento (imagen o PDF)")
            return None

        return imagen

    except Exception as e:
        logger.error(f"Error cargando imagen: {str(e)}", exc_info=True)
        return None


def _load_pdf_from_file(pdf_path: str) -> Optional[np.ndarray]:
    """
    Convierte un archivo PDF a imagen numpy array.
    Combina todas las páginas en una sola imagen vertical.
    
    Args:
        pdf_path: Ruta al archivo PDF
    
    Returns:
        Array numpy con la imagen combinada o None si falla
    """
    if not PDF_SUPPORT:
        logger.error("pdf2image no está instalado. No se pueden procesar PDFs.")
        return None
    
    try:
        logger.info(f"📄 Convirtiendo PDF a imagen: {pdf_path}")
        
        # Convertir PDF a lista de imágenes PIL (300 DPI para buena calidad OCR)
        pages = convert_from_path(pdf_path, dpi=300, fmt='png')
        
        if not pages:
            logger.error("El PDF no tiene páginas")
            return None
        
        logger.info(f"📄 PDF tiene {len(pages)} página(s)")
        
        # Convertir páginas PIL a arrays numpy
        page_arrays = []
        for i, page in enumerate(pages):
            # Convertir PIL Image a numpy array (RGB)
            page_np = np.array(page)
            # Convertir RGB a BGR para OpenCV
            page_bgr = cv2.cvtColor(page_np, cv2.COLOR_RGB2BGR)
            page_arrays.append(page_bgr)
            logger.debug(f"  Página {i+1}: {page_bgr.shape}")
        
        # Si solo hay una página, devolverla directamente
        if len(page_arrays) == 1:
            return page_arrays[0]
        
        # Combinar todas las páginas verticalmente
        # Ajustar anchos para que coincidan
        max_width = max(p.shape[1] for p in page_arrays)
        padded_pages = []
        
        for page in page_arrays:
            if page.shape[1] < max_width:
                # Agregar padding blanco a la derecha
                padding = np.ones((page.shape[0], max_width - page.shape[1], 3), dtype=np.uint8) * 255
                page = np.hstack([page, padding])
            padded_pages.append(page)
        
        # Concatenar verticalmente con separador
        separator_height = 20
        separator = np.ones((separator_height, max_width, 3), dtype=np.uint8) * 200  # Gris claro
        
        combined = padded_pages[0]
        for page in padded_pages[1:]:
            combined = np.vstack([combined, separator, page])
        
        logger.info(f"📄 Imagen combinada: {combined.shape}")
        return combined
        
    except Exception as e:
        logger.error(f"Error convirtiendo PDF a imagen: {str(e)}", exc_info=True)
        return None


def _load_pdf_from_bytes(pdf_bytes: bytes) -> Optional[np.ndarray]:
    """
    Convierte bytes de un PDF a imagen numpy array.
    
    Args:
        pdf_bytes: Contenido binario del PDF
    
    Returns:
        Array numpy con la imagen combinada o None si falla
    """
    if not PDF_SUPPORT:
        logger.error("pdf2image no está instalado. No se pueden procesar PDFs.")
        return None
    
    try:
        logger.info(f"📄 Convirtiendo PDF desde bytes ({len(pdf_bytes)} bytes)")
        
        # Convertir PDF bytes a lista de imágenes PIL
        pages = convert_from_bytes(pdf_bytes, dpi=300, fmt='png')
        
        if not pages:
            logger.error("El PDF no tiene páginas")
            return None
        
        logger.info(f"📄 PDF tiene {len(pages)} página(s)")
        
        # Reutilizar lógica de combinación
        page_arrays = []
        for i, page in enumerate(pages):
            page_np = np.array(page)
            page_bgr = cv2.cvtColor(page_np, cv2.COLOR_RGB2BGR)
            page_arrays.append(page_bgr)
        
        if len(page_arrays) == 1:
            return page_arrays[0]
        
        # Combinar páginas
        max_width = max(p.shape[1] for p in page_arrays)
        padded_pages = []
        
        for page in page_arrays:
            if page.shape[1] < max_width:
                padding = np.ones((page.shape[0], max_width - page.shape[1], 3), dtype=np.uint8) * 255
                page = np.hstack([page, padding])
            padded_pages.append(page)
        
        separator_height = 20
        separator = np.ones((separator_height, max_width, 3), dtype=np.uint8) * 200
        
        combined = padded_pages[0]
        for page in padded_pages[1:]:
            combined = np.vstack([combined, separator, page])
        
        logger.info(f"📄 Imagen combinada: {combined.shape}")
        return combined
        
    except Exception as e:
        logger.error(f"Error convirtiendo PDF bytes a imagen: {str(e)}", exc_info=True)
        return None


def preprocess_image(
    imagen: np.ndarray,
    opciones: Dict[str, Any]
) -> np.ndarray:
    """
    Preprocesa imagen para mejorar resultados OCR
    VERSIÓN MEJORADA - Optimizada para español
    
    Args:
        imagen: Array numpy con la imagen
        opciones: Diccionario con opciones de preprocesamiento
    
    Returns:
        Imagen preprocesada
    """
    try:
        logger.debug(f"Preprocesando imagen (versión mejorada). Opciones: {opciones}")

        # Convertir a escala de grises
        if len(imagen.shape) == 3:
            imagen = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
            logger.debug("Convertido a escala de grises")

        # 1. UPSCALING - Tesseract funciona mejor con imágenes grandes (300+ DPI)
        height, width = imagen.shape[:2]
        if width < 2000:  # Si la imagen es pequeña, aumentar tamaño
            scale_factor = 2000 / width
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            imagen = cv2.resize(
                imagen,
                (new_width, new_height),
                interpolation=cv2.INTER_CUBIC  # CUBIC mejor que LINEAR
            )
            logger.info(f"✨ Imagen escalada de {width}x{height} a {new_width}x{new_height}")

        # 2. Redimensionar si se especifica factor adicional
        if 'resize_factor' in opciones and opciones['resize_factor']:
            factor = opciones['resize_factor']
            new_width = int(imagen.shape[1] * factor)
            new_height = int(imagen.shape[0] * factor)
            imagen = cv2.resize(imagen, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
            logger.debug(f"Redimensionado con factor {factor}")

        # 3. REDUCCIÓN DE RUIDO BILATERAL (preserva bordes - mejor para texto)
        if opciones.get('denoise', True):
            imagen = cv2.bilateralFilter(imagen, 9, 75, 75)
            logger.debug("✨ Filtro bilateral aplicado (preserva bordes)")

        # 4. CLAHE - Mejora contraste adaptativo
        if opciones.get('mejorar_contraste', True):
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            imagen = clahe.apply(imagen)
            logger.debug("✨ CLAHE aplicado (contraste adaptativo)")

        # 5. BINARIZACIÓN ADAPTATIVA MEJORADA (Gaussian mejor que Mean)
        if opciones.get('binarizar', True):
            imagen = cv2.adaptiveThreshold(
                imagen,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,  # Gaussian mejor para español
                cv2.THRESH_BINARY,
                11,  # Block size
                2    # Constant
            )
            logger.debug("✨ Binarización adaptativa Gaussian aplicada")

        # 6. OPERACIONES MORFOLÓGICAS - Limpiar y mejorar texto
        # Cerrar gaps en letras (especialmente acentos)
        kernel_close = np.ones((2, 2), np.uint8)
        imagen = cv2.morphologyEx(imagen, cv2.MORPH_CLOSE, kernel_close, iterations=1)

        # Abrir para eliminar ruido pequeño
        kernel_open = np.ones((1, 1), np.uint8)
        imagen = cv2.morphologyEx(imagen, cv2.MORPH_OPEN, kernel_open, iterations=1)
        logger.debug("✨ Operaciones morfológicas aplicadas (limpieza)")

        # 7. DESKEW mejorado
        if opciones.get('deskew', True):
            imagen = deskew_image(imagen)

        logger.info("✅ Preprocesamiento mejorado completado")
        return imagen

    except Exception as e:
        logger.error(f"Error en preprocesamiento: {str(e)}", exc_info=True)
        return imagen


def deskew_image(imagen: np.ndarray) -> np.ndarray:
    """
    Corrige la inclinación de la imagen
    VERSIÓN MEJORADA - Hough Line Transform
    """
    try:
        logger.debug("Corrigiendo inclinación (deskew mejorado)")

        # Detectar bordes
        edges = cv2.Canny(imagen, 50, 150, apertureSize=3)

        # Detectar líneas usando Hough Transform
        lines = cv2.HoughLinesP(
            edges,
            1,
            np.pi / 180,
            threshold=100,
            minLineLength=100,
            maxLineGap=10
        )

        if lines is None:
            logger.debug("No se detectaron líneas para deskew")
            return imagen

        # Calcular ángulos de las líneas
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
            angles.append(angle)

        # Filtrar ángulos extremos (solo considerar -45 a 45 grados)
        angles = [a for a in angles if abs(a) < 45]

        if not angles:
            logger.debug("No se encontraron líneas válidas para deskew")
            return imagen

        # Calcular ángulo mediano (más robusto que promedio)
        median_angle = np.median(angles)

        # Solo rotar si el ángulo es significativo (> 0.5 grados)
        if abs(median_angle) > 0.5:
            (h, w) = imagen.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            imagen = cv2.warpAffine(
                imagen, M, (w, h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE
            )
            logger.info(f"✨ Imagen rotada {median_angle:.2f} grados (deskew mejorado)")
        else:
            logger.debug(f"Ángulo insignificante ({median_angle:.2f}°), no se rota")

        return imagen

    except Exception as e:
        logger.warning(f"No se pudo corregir inclinación: {str(e)}")
        return imagen


def execute_ocr(
    imagen: np.ndarray,
    idioma: str = 'spa+eng'
) -> Dict[str, Any]:
    """
    Ejecuta OCR con Tesseract
    VERSIÓN MEJORADA - Optimizada para español
    
    Args:
        imagen: Array numpy con la imagen preprocesada
        idioma: Códigos de idioma para Tesseract (ej: 'spa', 'eng', 'spa+eng')
    
    Returns:
        Dict con texto extraído y confianza
    """
    try:
        logger.debug(f"Ejecutando OCR con idioma: {idioma}")

        # CONFIGURACIÓN OPTIMIZADA PARA ESPAÑOL + DICCIONARIO PANAMÁ
        # --oem 3: LSTM OCR Engine (mejor para español)
        # --psm 6: Assume a single uniform block of text (mejor para documentos)
        # --user-words: Diccionario personalizado con términos panameños
        custom_config = (
            r'--oem 3 --psm 6 '
            r'--user-words /usr/share/tesseract-ocr/5/tessdata/panama.user-words'
        )

        logger.info("✨ Config OCR mejorada: LSTM Engine + PSM 6 + Diccionario Panamá")

        # Extraer texto
        texto = pytesseract.image_to_string(
            imagen,
            lang=idioma,
            config=custom_config
        )

        # Obtener datos detallados (incluye confianza por palabra)
        datos = pytesseract.image_to_data(
            imagen,
            lang=idioma,
            config=custom_config,
            output_type=pytesseract.Output.DICT
        )

        # Calcular confianza promedio (excluyendo valores -1)
        confianzas = [c for c in datos['conf'] if c != -1]
        confianza_promedio = sum(confianzas) / len(confianzas) if confianzas else 0

        # POST-PROCESAMIENTO: Corregir errores comunes en español
        texto_limpio = post_process_spanish_text(texto)

        logger.info(f"✅ OCR completado. Texto: {len(texto_limpio)} chars, Confianza: {confianza_promedio:.2f}%")

        return {
            'texto': texto_limpio.strip(),
            'confianza': round(confianza_promedio, 2),
            'idioma': idioma,
            'total_palabras': len([c for c in datos['conf'] if c != -1])
        }

    except Exception as e:
        logger.error(f"Error ejecutando OCR: {str(e)}", exc_info=True)
        raise


def post_process_spanish_text(texto: str) -> str:
    """
    Correcciones post-OCR para errores comunes en español
    
    Args:
        texto: Texto extraído por OCR
    
    Returns:
        Texto corregido
    """
    try:
        # 1. Corregir confusión O (letra) vs 0 (cero) en contexto
        # Si está rodeada de letras, probablemente es O
        texto = re.sub(r'([A-Za-z])0([A-Za-z])', r'\1O\2', texto)

        # 2. Corregir l (ele minúscula) vs 1 (uno) en números
        # Si está entre dígitos, probablemente es 1
        texto = re.sub(r'(\d)l(\d)', r'\11\2', texto)

        # 3. Palabras comunes mal reconocidas
        correcciones = {
            'REPUBL1CA': 'REPÚBLICA',
            'REPUBIICA': 'REPÚBLICA',
            'REPÜBLICA': 'REPÚBLICA',
            'PANAMA': 'PANAMÁ',
            'PANAMÀ': 'PANAMÁ',
            'CEDULA': 'CÉDULA',
            'CÊDULA': 'CÉDULA',
            'NACION': 'NACIÓN',
            'NACIÖN': 'NACIÓN',
            'NACIONALIDAD': 'NACIONALIDAD',
            'EXPIRAC1ON': 'EXPIRACIÓN',
            'EXPIRAC!ON': 'EXPIRACIÓN',
            'NAC1MIENTO': 'NACIMIENTO',
            'NAC!MIENTO': 'NACIMIENTO',
        }

        for error, correccion in correcciones.items():
            texto = texto.replace(error, correccion)

        # 4. Limpiar caracteres extraños comunes
        texto = texto.replace('|', 'I')  # Barra vertical -> I
        texto = texto.replace('º', '°')  # Grado masculino -> grado

        # 5. Normalizar espacios múltiples
        texto = re.sub(r'\s+', ' ', texto)

        return texto

    except Exception as e:
        logger.warning(f"Error en post-procesamiento: {str(e)}")
        return texto


def validate_ocr_against_solicitud(
    db: Session,
    texto_ocr: str,
    id_solicitud: int
) -> Optional[Dict[str, Any]]:
    """
    Valida el texto OCR contra los datos de la solicitud asociada.
    
    En lugar de usar regex genéricos para detectar pasaportes/nombres,
    busca los VALORES EXACTOS de la solicitud en el texto OCR.
    
    Args:
        db: Sesión de base de datos
        texto_ocr: Texto extraído por OCR
        id_solicitud: ID de la solicitud asociada al documento
    
    Returns:
        Dict con resultados de validación o None si no hay datos
    """
    try:
        # Obtener el solicitante titular de la solicitud
        solicitante = db.query(PPSHSolicitante).filter(
            PPSHSolicitante.id_solicitud == id_solicitud,
            PPSHSolicitante.es_titular == True
        ).first()
        
        if not solicitante:
            # Si no hay titular, buscar cualquier solicitante
            solicitante = db.query(PPSHSolicitante).filter(
                PPSHSolicitante.id_solicitud == id_solicitud
            ).first()
        
        if not solicitante:
            logger.warning(f"No se encontró solicitante para solicitud {id_solicitud}")
            return None
        
        # Preparar texto OCR para búsqueda (normalizar)
        texto_normalizado = texto_ocr.upper().strip()
        # Eliminar caracteres especiales que pueden interferir
        texto_busqueda = re.sub(r'[^\w\s]', ' ', texto_normalizado)
        texto_busqueda = re.sub(r'\s+', ' ', texto_busqueda)
        
        # Datos a buscar de la solicitud
        datos_solicitud = {
            'num_documento': solicitante.num_documento,
            'primer_nombre': solicitante.primer_nombre,
            'segundo_nombre': solicitante.segundo_nombre,
            'primer_apellido': solicitante.primer_apellido,
            'segundo_apellido': solicitante.segundo_apellido,
            'fecha_nacimiento': solicitante.fecha_nacimiento.strftime('%d/%m/%Y') if solicitante.fecha_nacimiento else None,
            'pais_emisor': solicitante.pais_emisor,
        }
        
        # Validar cada campo
        validaciones = {}
        campos_encontrados = 0
        campos_totales = 0
        
        for campo, valor in datos_solicitud.items():
            if valor:
                campos_totales += 1
                valor_str = str(valor).upper().strip()
                
                # Búsqueda flexible: valor exacto o sin espacios/guiones
                valor_limpio = re.sub(r'[^\w]', '', valor_str)
                
                encontrado = False
                coincidencia_tipo = None
                
                # 1. Búsqueda exacta
                if valor_str in texto_normalizado:
                    encontrado = True
                    coincidencia_tipo = 'exacta'
                
                # 2. Búsqueda sin caracteres especiales
                elif valor_limpio and valor_limpio in texto_busqueda.replace(' ', ''):
                    encontrado = True
                    coincidencia_tipo = 'parcial'
                
                # 3. Para nombres, buscar cada parte por separado
                elif campo in ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']:
                    partes = valor_str.split()
                    partes_encontradas = sum(1 for p in partes if p in texto_normalizado)
                    if partes_encontradas > 0:
                        encontrado = True
                        coincidencia_tipo = f'parcial ({partes_encontradas}/{len(partes)} partes)'
                
                # 4. Para fechas, probar varios formatos
                elif campo == 'fecha_nacimiento' and solicitante.fecha_nacimiento:
                    fecha = solicitante.fecha_nacimiento
                    formatos_fecha = [
                        fecha.strftime('%d/%m/%Y'),      # 25/12/1990
                        fecha.strftime('%d-%m-%Y'),      # 25-12-1990
                        fecha.strftime('%Y-%m-%d'),      # 1990-12-25
                        fecha.strftime('%d %b %Y'),      # 25 Dec 1990
                        fecha.strftime('%d%m%Y'),        # 25121990 (sin separadores)
                        f"{fecha.day}/{fecha.month}/{fecha.year}",  # Sin ceros: 5/3/1990
                    ]
                    for fmt in formatos_fecha:
                        if fmt.upper() in texto_normalizado:
                            encontrado = True
                            coincidencia_tipo = f'formato: {fmt}'
                            break
                
                if encontrado:
                    campos_encontrados += 1
                
                validaciones[campo] = {
                    'valor_esperado': valor,
                    'encontrado': encontrado,
                    'tipo_coincidencia': coincidencia_tipo
                }
        
        # Calcular porcentaje de validación
        porcentaje_validacion = (campos_encontrados / campos_totales * 100) if campos_totales > 0 else 0
        
        resultado = {
            'id_solicitud': id_solicitud,
            'id_solicitante': solicitante.id_solicitante,
            'es_titular': solicitante.es_titular,
            'datos_solicitante': {
                'nombre_completo': f"{solicitante.primer_nombre or ''} {solicitante.segundo_nombre or ''} {solicitante.primer_apellido or ''} {solicitante.segundo_apellido or ''}".strip(),
                'num_documento': solicitante.num_documento,
                'tipo_documento': solicitante.tipo_documento,
                'pais_emisor': solicitante.pais_emisor,
                'fecha_nacimiento': solicitante.fecha_nacimiento.isoformat() if solicitante.fecha_nacimiento else None,
            },
            'validaciones': validaciones,
            'resumen_validacion': {
                'campos_encontrados': campos_encontrados,
                'campos_totales': campos_totales,
                'porcentaje': round(porcentaje_validacion, 2),
                'validacion_exitosa': porcentaje_validacion >= 50  # Al menos 50% de campos deben coincidir
            }
        }
        
        logger.info(f"✅ Validación OCR contra solicitud {id_solicitud}: {campos_encontrados}/{campos_totales} campos ({porcentaje_validacion:.1f}%)")
        
        return resultado
        
    except Exception as e:
        logger.error(f"Error validando OCR contra solicitud: {str(e)}", exc_info=True)
        return None


def extract_structured_data(
    texto: str,
    tipo_documento: Optional[int]
) -> Optional[str]:
    """
    Extrae datos estructurados del texto OCR.
    Primero intenta extracción específica por tipo de documento,
    luego aplica extracción genérica para detectar patrones comunes.
    
    NOTA: Esta función es un fallback cuando no hay solicitud asociada.
    El método preferido es validate_ocr_against_solicitud().
    
    Args:
        texto: Texto extraído por OCR
        tipo_documento: Código del tipo de documento (opcional)
    
    Returns:
        JSON string con campos extraídos o None
    """
    try:
        import re

        datos = {}
        texto_upper = texto.upper()

        # ============================================================
        # EXTRACCIÓN ESPECÍFICA POR TIPO DE DOCUMENTO
        # ============================================================
        
        # Pasaporte (tipo_documento == 1 o similar)
        if tipo_documento in [1, 'PASAPORTE']:
            logger.debug("Extrayendo datos de pasaporte")
            _extract_passport_data(texto, texto_upper, datos)

        # Cédula (tipo_documento == 2 o similar)
        elif tipo_documento in [2, 'CEDULA']:
            logger.debug("Extrayendo datos de cédula")
            _extract_cedula_data(texto, texto_upper, datos)

        # ============================================================
        # EXTRACCIÓN GENÉRICA (para cualquier documento)
        # ============================================================
        _extract_generic_data(texto, texto_upper, datos)

        # Si se encontraron datos, retornar como JSON
        if datos:
            logger.info(f"Datos estructurados extraídos: {list(datos.keys())}")
            return json.dumps(datos, ensure_ascii=False)

        return None

    except Exception as e:
        logger.error(f"Error extrayendo datos estructurados: {str(e)}", exc_info=True)
        return None


def _extract_passport_data(texto: str, texto_upper: str, datos: dict):
    """Extrae datos específicos de pasaportes"""
    import re
    
    # Buscar primero con etiqueta "Pasaporte:" (más confiable)
    match_etiqueta = re.search(r'PASAPORTE\s*[:/]?\s*([A-Z]{0,2}\d{6,12})', texto_upper)
    if match_etiqueta:
        datos['numero_pasaporte'] = match_etiqueta.group(1)
    
    # Número de pasaporte (formato común: 0-2 letras + 6-12 dígitos)
    if 'numero_pasaporte' not in datos:
        match_pasaporte = re.search(r'\b[A-Z]{0,2}\d{6,12}\b', texto_upper)
        if match_pasaporte:
            datos['numero_pasaporte'] = match_pasaporte.group()

    # También buscar patrones más flexibles para pasaportes
    if 'numero_pasaporte' not in datos:
        # Patrón alternativo: letra + números (ej: N1234567, P1234567890)
        match_alt = re.search(r'\b([A-Z]\d{6,10})\b', texto_upper)
        if match_alt:
            datos['numero_pasaporte'] = match_alt.group()

    # Fechas (DD/MM/YYYY o DD-MM-YYYY o YYYY-MM-DD)
    fechas = re.findall(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b', texto)
    fechas_iso = re.findall(r'\b\d{4}[/-]\d{2}[/-]\d{2}\b', texto)
    todas_fechas = fechas + fechas_iso
    
    if todas_fechas:
        datos['fechas_encontradas'] = todas_fechas
        if len(todas_fechas) >= 1:
            datos['posible_fecha_nacimiento'] = todas_fechas[0]
            datos['fecha_nacimiento'] = todas_fechas[0]  # Guardar también con este nombre
        if len(todas_fechas) >= 2:
            datos['posible_fecha_emision'] = todas_fechas[1]
        if len(todas_fechas) >= 3:
            datos['posible_fecha_vencimiento'] = todas_fechas[2]

    # Nacionalidad (códigos de 3 letras comunes)
    nacionalidades_comunes = [
        'PAN', 'USA', 'COL', 'VEN', 'NIC', 'CRI', 'MEX', 'GTM', 'HND', 'SLV', 
        'DOM', 'ECU', 'PER', 'ARG', 'BRA', 'CHL', 'CUB', 'HAI', 'URY', 'PRY',
        'BOL', 'ESP', 'FRA', 'ITA', 'DEU', 'GBR', 'CHN', 'JPN', 'KOR', 'IND',
        'RUS', 'UKR', 'CAN', 'AUS', 'NZL'
    ]
    for nac in nacionalidades_comunes:
        if nac in texto_upper:
            datos['nacionalidad'] = nac
            break
    
    # Intentar extraer nombres/apellidos de la línea MRZ si existe
    # La MRZ tiene formato: P<CODIGO<APELLIDO<<NOMBRES<<<...
    mrz_pattern = r'P<([A-Z]{3})<([A-Z]+)<<([A-Z]+)'
    mrz_match = re.search(mrz_pattern, texto_upper)
    if mrz_match:
        datos['nacionalidad_mrz'] = mrz_match.group(1)
        datos['apellidos_mrz'] = mrz_match.group(2).replace('<', ' ').strip()
        datos['nombres_mrz'] = mrz_match.group(3).replace('<', ' ').strip()
        # Si encontramos MRZ, usar esos datos como principales
        if not datos.get('nacionalidad'):
            datos['nacionalidad'] = mrz_match.group(1)
        datos['apellidos'] = datos['apellidos_mrz']
        datos['nombres'] = datos['nombres_mrz']
    
    # Si no hay MRZ, intentar extraer nombres de patrones comunes
    if 'nombres' not in datos:
        # Buscar después de etiquetas comunes en pasaportes
        patterns_nombres = [
            r'(?:GIVEN\s*NAME[S]?|NOMBRES?|PRENOM[S]?|NAME)\s*[:/]?\s*([A-Z][A-Z\s]{2,30})',
            r'(?:FIRST\s*NAME|PRIMER\s*NOMBRE)\s*[:/]?\s*([A-Z][A-Z\s]{2,30})',
        ]
        for pattern in patterns_nombres:
            match = re.search(pattern, texto_upper)
            if match:
                nombres_raw = match.group(1).strip()
                # Limpiar y validar que parece un nombre
                if len(nombres_raw) >= 2 and not nombres_raw.isdigit():
                    datos['nombres'] = nombres_raw
                    break
    
    if 'apellidos' not in datos:
        # Buscar después de etiquetas comunes en pasaportes
        patterns_apellidos = [
            r'(?:SURNAME|APELLIDOS?|NOM|FAMILY\s*NAME)\s*[:/]?\s*([A-Z][A-Z\s]{2,30})',
            r'(?:LAST\s*NAME|PRIMER\s*APELLIDO)\s*[:/]?\s*([A-Z][A-Z\s]{2,30})',
        ]
        for pattern in patterns_apellidos:
            match = re.search(pattern, texto_upper)
            if match:
                apellidos_raw = match.group(1).strip()
                # Limpiar y validar que parece un apellido
                if len(apellidos_raw) >= 2 and not apellidos_raw.isdigit():
                    datos['apellidos'] = apellidos_raw
                    break
    
    # Buscar fecha de nacimiento específica
    if 'fecha_nacimiento' not in datos:
        patterns_fecha_nac = [
            r'(?:DATE\s*OF\s*BIRTH|FECHA\s*(?:DE\s*)?NAC(?:IMIENTO)?|DOB|BORN)\s*[:/]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(?:BIRTH\s*DATE|NACIMIENTO)\s*[:/]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        for pattern in patterns_fecha_nac:
            match = re.search(pattern, texto_upper)
            if match:
                datos['fecha_nacimiento'] = match.group(1)
                break


def _extract_cedula_data(texto: str, texto_upper: str, datos: dict):
    """Extrae datos específicos de cédulas panameñas"""
    import re
    
    # Número de cédula panameña (formato: X-XXX-XXXX o variantes)
    match_cedula = re.search(r'\b\d{1,2}-\d{1,4}-\d{1,6}\b', texto)
    if match_cedula:
        datos['numero_cedula'] = match_cedula.group()

    # Fecha de nacimiento
    match_fecha = re.search(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b', texto)
    if match_fecha:
        datos['fecha_nacimiento'] = match_fecha.group()


def _extract_generic_data(texto: str, texto_upper: str, datos: dict):
    """
    Extrae datos genéricos de cualquier documento.
    Detecta patrones comunes independientemente del tipo de documento.
    """
    import re
    
    # ============================================================
    # 1. NÚMEROS DE IDENTIFICACIÓN
    # ============================================================
    
    # Cédula panameña (X-XXX-XXXX) - si no se detectó antes
    if 'numero_cedula' not in datos:
        match_cedula = re.search(r'\b(\d{1,2})-(\d{1,4})-(\d{1,6})\b', texto)
        if match_cedula:
            datos['cedula_detectada'] = match_cedula.group()
    
    # Pasaporte (0-2 letras + 6-12 dígitos) - si no se detectó antes
    if 'numero_pasaporte' not in datos and 'pasaporte_detectado' not in datos:
        # Primero buscar con etiqueta
        match_etiqueta = re.search(r'PASAPORTE\s*[:/]?\s*([A-Z]{0,2}\d{6,12})', texto_upper)
        if match_etiqueta:
            datos['pasaporte_detectado'] = match_etiqueta.group(1)
        else:
            # Buscar patrón libre
            match_pasaporte = re.search(r'\b([A-Z]{0,2}\d{7,12})\b', texto_upper)
            if match_pasaporte:
                datos['pasaporte_detectado'] = match_pasaporte.group()
    
    # RUC (Registro Único de Contribuyente) panameño
    match_ruc = re.search(r'\b(\d{1,2}-\d{1,4}-\d{1,6}-\d{2})\b', texto)
    if match_ruc:
        datos['ruc_detectado'] = match_ruc.group()
    
    # ============================================================
    # 2. FECHAS
    # ============================================================
    
    if 'fechas_encontradas' not in datos:
        # Formato DD/MM/YYYY o DD-MM-YYYY
        fechas_dmy = re.findall(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b', texto)
        # Formato YYYY-MM-DD (ISO)
        fechas_iso = re.findall(r'\b(\d{4}-\d{2}-\d{2})\b', texto)
        # Formato con mes en texto: "15 de enero de 2025"
        fechas_texto = re.findall(
            r'\b(\d{1,2}\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+\d{4})\b',
            texto.lower()
        )
        
        todas_fechas = fechas_dmy + fechas_iso + [f.title() for f in fechas_texto]
        if todas_fechas:
            datos['fechas_encontradas'] = list(set(todas_fechas))[:5]  # Máximo 5 fechas únicas
    
    # ============================================================
    # 3. DATOS DE CONTACTO
    # ============================================================
    
    # Emails
    emails = re.findall(r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b', texto)
    if emails:
        datos['emails_detectados'] = list(set(emails))[:3]
    
    # Teléfonos panameños (6XXX-XXXX o +507 6XXX-XXXX)
    telefonos = re.findall(r'(?:\+507\s?)?([6-9]\d{3}[-\s]?\d{4})\b', texto)
    if telefonos:
        datos['telefonos_detectados'] = list(set(telefonos))[:3]
    
    # ============================================================
    # 4. DIRECCIONES Y UBICACIONES
    # ============================================================
    
    # Provincias de Panamá
    provincias = ['BOCAS DEL TORO', 'COCLÉ', 'COLÓN', 'CHIRIQUÍ', 'DARIÉN', 
                  'HERRERA', 'LOS SANTOS', 'PANAMÁ', 'PANAMÁ OESTE', 'VERAGUAS',
                  'GUNA YALA', 'EMBERÁ', 'NGÄBE-BUGLÉ']
    provincias_encontradas = [p for p in provincias if p in texto_upper]
    if provincias_encontradas:
        datos['provincias_detectadas'] = provincias_encontradas
    
    # Distritos comunes
    distritos = ['DAVID', 'SANTIAGO', 'CHITRÉ', 'AGUADULCE', 'PENONOMÉ', 
                 'LA CHORRERA', 'ARRAIJÁN', 'SAN MIGUELITO', 'COLÓN']
    distritos_encontrados = [d for d in distritos if d in texto_upper]
    if distritos_encontrados:
        datos['distritos_detectados'] = distritos_encontrados
    
    # ============================================================
    # 5. MONTOS Y VALORES MONETARIOS
    # ============================================================
    
    # Montos en dólares (B/. XXX.XX o $ XXX.XX o USD XXX.XX)
    montos = re.findall(r'(?:B/\.|USD|\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', texto)
    if montos:
        datos['montos_detectados'] = montos[:5]
    
    # ============================================================
    # 6. DATOS DE NOTARÍA (común en poderes y escrituras)
    # ============================================================
    
    # Número de escritura
    match_escritura = re.search(r'(?:ESCRITURA|ESCRIT\.?)\s*(?:N[°ºO]?\.?\s*)?(\d+)', texto_upper)
    if match_escritura:
        datos['numero_escritura'] = match_escritura.group(1)
    
    # Notario
    match_notario = re.search(r'(?:NOTARIO|NOTARIA|LIC\.?|LICENCIADO)\s*:?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})', texto)
    if match_notario:
        datos['notario_detectado'] = match_notario.group(1).strip()
    
    # ============================================================
    # 7. NOMBRES Y PERSONAS
    # ============================================================
    
    # Poderdante / Apoderado (común en poderes legales)
    # Manejar saltos de línea y múltiples dos puntos (::)
    match_poderdante = re.search(r'PODERDANTE\s*:+\s*[\n\r]*([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+){0,4})', texto, re.IGNORECASE | re.MULTILINE)
    if match_poderdante:
        nombre = match_poderdante.group(1).strip()
        datos['poderdante'] = nombre
        # También guardar como nombre si no existe
        if 'nombres' not in datos:
            partes = nombre.split()
            if len(partes) >= 2:
                datos['nombres'] = ' '.join(partes[:-1])  # Todo menos el último
                datos['apellidos'] = partes[-1]  # Último como apellido
            else:
                datos['nombres'] = nombre
    
    match_apoderado = re.search(r'APODERADO\s*:+\s*[\n\r]*([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+){0,4})', texto, re.IGNORECASE | re.MULTILINE)
    if match_apoderado:
        datos['apoderado'] = match_apoderado.group(1).strip()
    
    # Solicitante
    match_solicitante = re.search(r'SOLICITANTE\s*:+\s*[\n\r]*([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ]+){0,4})', texto, re.IGNORECASE | re.MULTILINE)
    if match_solicitante:
        datos['solicitante'] = match_solicitante.group(1).strip()
    
    # ============================================================
    # 7.1. EXTRACCIÓN GENÉRICA DE NOMBRES Y APELLIDOS (si no se detectaron antes)
    # ============================================================
    
    if 'nombres' not in datos:
        # Buscar patrones comunes de nombres en documentos
        patterns_nombres_generic = [
            r'(?:NOMBRE[S]?|NAME[S]?|GIVEN\s*NAME|PRENOM)\s*[:/]?\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,30})',
            r'(?:PRIMER\s*NOMBRE|FIRST\s*NAME)\s*[:/]?\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,30})',
        ]
        for pattern in patterns_nombres_generic:
            match = re.search(pattern, texto_upper)
            if match:
                nombres_raw = match.group(1).strip()
                # Validar que parece un nombre (no solo números o caracteres especiales)
                if len(nombres_raw) >= 2 and re.search(r'[A-ZÁÉÍÓÚÑ]', nombres_raw):
                    datos['nombres'] = nombres_raw
                    break
    
    if 'apellidos' not in datos:
        # Buscar patrones comunes de apellidos en documentos
        patterns_apellidos_generic = [
            r'(?:APELLIDO[S]?|SURNAME|NOM|FAMILY\s*NAME|LAST\s*NAME)\s*[:/]?\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,30})',
            r'(?:PRIMER\s*APELLIDO|PATERNO)\s*[:/]?\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,30})',
        ]
        for pattern in patterns_apellidos_generic:
            match = re.search(pattern, texto_upper)
            if match:
                apellidos_raw = match.group(1).strip()
                # Validar que parece un apellido
                if len(apellidos_raw) >= 2 and re.search(r'[A-ZÁÉÍÓÚÑ]', apellidos_raw):
                    datos['apellidos'] = apellidos_raw
                    break
    
    # Buscar fecha de nacimiento si no se detectó
    if 'fecha_nacimiento' not in datos:
        patterns_fecha_nac_generic = [
            r'(?:FECHA\s*(?:DE\s*)?NAC(?:IMIENTO)?|DATE\s*OF\s*BIRTH|DOB|NACIMIENTO|BORN)\s*[:/]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(?:F\.\s*NAC\.?|FEC\.\s*NAC\.?)\s*[:/]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        for pattern in patterns_fecha_nac_generic:
            match = re.search(pattern, texto_upper)
            if match:
                datos['fecha_nacimiento'] = match.group(1)
                break
    
    # ============================================================
    # 8. NACIONALIDADES
    # ============================================================
    
    nacionalidades_texto = {
        'PANAMEÑO': 'PAN', 'PANAMEÑA': 'PAN', 'PANAMÁ': 'PAN',
        'COLOMBIANO': 'COL', 'COLOMBIANA': 'COL', 'COLOMBIA': 'COL',
        'VENEZOLANO': 'VEN', 'VENEZOLANA': 'VEN', 'VENEZUELA': 'VEN',
        'NICARAGÜENSE': 'NIC', 'NICARAGUA': 'NIC',
        'COSTARRICENSE': 'CRI', 'COSTA RICA': 'CRI',
        'MEXICANO': 'MEX', 'MEXICANA': 'MEX', 'MÉXICO': 'MEX',
        'SALVADOREÑO': 'SLV', 'SALVADOREÑA': 'SLV', 'EL SALVADOR': 'SLV',
        'GUATEMALTECO': 'GTM', 'GUATEMALTECA': 'GTM', 'GUATEMALA': 'GTM',
        'HONDUREÑO': 'HND', 'HONDUREÑA': 'HND', 'HONDURAS': 'HND',
        'DOMINICANO': 'DOM', 'DOMINICANA': 'DOM',
        'ECUATORIANO': 'ECU', 'ECUATORIANA': 'ECU', 'ECUADOR': 'ECU',
        'PERUANO': 'PER', 'PERUANA': 'PER', 'PERÚ': 'PER',
        'ESTADOUNIDENSE': 'USA', 'ESTADOS UNIDOS': 'USA', 'AMERICANO': 'USA',
        'CHINO': 'CHN', 'CHINA': 'CHN',
        'ESPAÑOL': 'ESP', 'ESPAÑOLA': 'ESP', 'ESPAÑA': 'ESP',
    }
    
    if 'nacionalidad' not in datos:
        for texto_nac, codigo in nacionalidades_texto.items():
            if texto_nac in texto_upper:
                datos['nacionalidad_detectada'] = codigo
                break
    
    # ============================================================
    # 9. TIPO DE DOCUMENTO DETECTADO
    # ============================================================
    
    tipos_documento = {
        'PODER ESPECIAL': 'PODER_ESPECIAL',
        'PODER GENERAL': 'PODER_GENERAL',
        'ESCRITURA': 'ESCRITURA',
        'CONTRATO': 'CONTRATO',
        'CERTIFICADO': 'CERTIFICADO',
        'CONSTANCIA': 'CONSTANCIA',
        'FACTURA': 'FACTURA',
        'RECIBO': 'RECIBO',
        'PASAPORTE': 'PASAPORTE',
        'CÉDULA': 'CEDULA',
        'LICENCIA': 'LICENCIA',
        'COMPROBANTE': 'COMPROBANTE',
        'DECLARACIÓN': 'DECLARACION',
    }
    
    for texto_tipo, codigo in tipos_documento.items():
        if texto_tipo in texto_upper:
            datos['tipo_documento_detectado'] = codigo
            break


@celery_app.task(name='ocr.cleanup_old_results')
def cleanup_old_results(dias_antiguedad: int = 30):
    """
    Limpia resultados OCR antiguos (tarea programada)
    
    Args:
        dias_antiguedad: Días de antigüedad para considerar un resultado como antiguo
    """
    db: Session = SessionLocal()

    try:
        fecha_limite = datetime.now() - timedelta(days=dias_antiguedad)

        # Mover a historial antes de eliminar
        resultados_antiguos = db.query(PPSHDocumentoOCR).filter(
            PPSHDocumentoOCR.created_at < fecha_limite,
            PPSHDocumentoOCR.estado_ocr.in_(['COMPLETADO', 'ERROR', 'CANCELADO'])
        ).all()

        eliminados = 0
        for resultado in resultados_antiguos:
            # Aquí podrías mover a una tabla de archivo o simplemente eliminar
            db.delete(resultado)
            eliminados += 1

        db.commit()
        logger.info(f"Limpieza completada: {eliminados} resultados eliminados")

        return {'eliminados': eliminados, 'fecha_limite': fecha_limite.isoformat()}

    except Exception as e:
        logger.error(f"Error en limpieza: {str(e)}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


@celery_app.task(name='ocr.generate_statistics')
def generate_ocr_statistics():
    """Genera estadísticas del sistema OCR (tarea programada)"""
    db: Session = SessionLocal()

    try:
        stats = {
            'timestamp': datetime.now().isoformat(),
            'total': db.query(PPSHDocumentoOCR).count(),
            'por_estado': {},
            'confianza_promedio': None,
            'tiempo_promedio_ms': None
        }

        # Contar por estado
        estados = db.query(
            PPSHDocumentoOCR.estado_ocr,
            func.count(PPSHDocumentoOCR.id_ocr)
        ).group_by(PPSHDocumentoOCR.estado_ocr).all()

        for estado, count in estados:
            stats['por_estado'][estado] = count

        # Confianza promedio (solo completados)
        confianza_avg = db.query(
            func.avg(PPSHDocumentoOCR.texto_confianza)
        ).filter(PPSHDocumentoOCR.estado_ocr == 'COMPLETADO').scalar()

        if confianza_avg:
            stats['confianza_promedio'] = float(confianza_avg)

        # Tiempo promedio
        tiempo_avg = db.query(
            func.avg(PPSHDocumentoOCR.tiempo_procesamiento_ms)
        ).filter(PPSHDocumentoOCR.estado_ocr == 'COMPLETADO').scalar()

        if tiempo_avg:
            stats['tiempo_promedio_ms'] = int(tiempo_avg)

        logger.info(f"Estadísticas generadas: {stats}")
        return stats

    except Exception as e:
        logger.error(f"Error generando estadísticas: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()


@celery_app.task(name='ocr.process_pending_documents', bind=True)
def process_pending_documents(self, limit: int = 50):
    """
    Procesa documentos que requieren OCR pero no han sido procesados.
    
    Esta tarea busca documentos de preguntas CARGA_ARCHIVO con requiere_ocr=True
    que no tienen un registro en PPSH_DOCUMENTO_OCR o tienen estado PENDIENTE/ERROR.
    
    Args:
        limit: Número máximo de documentos a procesar en esta ejecución
    
    Returns:
        Dict con estadísticas del procesamiento
    """
    db: Session = SessionLocal()
    
    try:
        logger.info(f"Iniciando procesamiento de documentos pendientes (límite: {limit})")
        
        # Buscar documentos que necesitan OCR
        # 1. Documentos sin registro OCR de solicitudes que tienen preguntas con requiere_ocr=True
        documentos_sin_ocr = db.execute(text("""
            SELECT DISTINCT d.id_documento, d.id_solicitud, d.nombre_archivo
            FROM PPSH_DOCUMENTO d
            LEFT JOIN PPSH_DOCUMENTO_OCR o ON o.id_documento = d.id_documento
            WHERE o.id_documento IS NULL
            AND d.id_solicitud IS NOT NULL
            ORDER BY d.id_documento
            OFFSET 0 ROWS FETCH NEXT :limit ROWS ONLY
        """), {'limit': limit}).fetchall()
        
        # 2. Documentos con OCR en estado ERROR (reintentar)
        documentos_error = db.query(PPSHDocumentoOCR).filter(
            PPSHDocumentoOCR.estado_ocr == 'ERROR',
            PPSHDocumentoOCR.intentos_procesamiento < 3  # Máximo 3 intentos
        ).limit(limit).all()
        
        procesados = 0
        errores = 0
        omitidos = 0
        
        # Procesar documentos sin OCR
        for doc in documentos_sin_ocr:
            try:
                logger.info(f"Encolando documento {doc.id_documento} para OCR")
                process_document_ocr.delay(
                    id_documento=doc.id_documento,
                    user_id='SYSTEM_CRON'
                )
                procesados += 1
            except Exception as e:
                logger.error(f"Error encolando documento {doc.id_documento}: {e}")
                errores += 1
        
        # Reprocesar documentos con error
        for ocr_record in documentos_error:
            try:
                logger.info(f"Re-encolando documento {ocr_record.id_documento} para OCR (intento {ocr_record.intentos_procesamiento + 1})")
                process_document_ocr.delay(
                    id_documento=ocr_record.id_documento,
                    user_id='SYSTEM_CRON'
                )
                procesados += 1
            except Exception as e:
                logger.error(f"Error re-encolando documento {ocr_record.id_documento}: {e}")
                errores += 1
        
        resultado = {
            'timestamp': datetime.now().isoformat(),
            'documentos_sin_ocr': len(documentos_sin_ocr),
            'documentos_error': len(documentos_error),
            'encolados': procesados,
            'errores': errores,
            'omitidos': omitidos
        }
        
        logger.info(f"Procesamiento de pendientes completado: {resultado}")
        return resultado
        
    except Exception as e:
        logger.error(f"Error en process_pending_documents: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()

