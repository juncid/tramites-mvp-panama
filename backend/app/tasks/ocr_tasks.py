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
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from pathlib import Path

from celery import Task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
from sqlalchemy import func

import pytesseract
from PIL import Image
import cv2
import numpy as np
import re

from celery_app import celery_app
from app.infrastructure.database import SessionLocal
from app.models.models_ppsh import PPSHDocumento
from app.models.models_ocr import PPSHDocumentoOCR, PPSHDocumentoOCRHistorial

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
        
        # 6. Extraer datos estructurados (si aplica)
        task_instance.update_state(
            state='PROGRESS',
            meta={'current': 5, 'total': 6, 'status': 'Extrayendo datos estructurados...', 'porcentaje': 83}
        )
        
        datos_estructurados = None
        if opciones and opciones.get('extraer_datos_estructurados', True):
            datos_estructurados = extract_structured_data(
                resultado_ocr['texto'],
                documento.cod_tipo_documento
            )
            if datos_estructurados:
                logger.info(f"Datos estructurados extraídos: {len(json.loads(datos_estructurados))} campos")
        
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
    Carga imagen desde contenido binario o archivo
    
    Args:
        documento: Instancia de PPSHDocumento
    
    Returns:
        Array numpy con la imagen o None si falla
    """
    try:
        if documento.contenido_binario:
            # Cargar desde contenido binario
            logger.debug("Cargando imagen desde contenido binario")
            nparr = np.frombuffer(documento.contenido_binario, np.uint8)
            imagen = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
        elif documento.ruta_archivo and os.path.exists(documento.ruta_archivo):
            # Cargar desde archivo
            logger.debug(f"Cargando imagen desde archivo: {documento.ruta_archivo}")
            imagen = cv2.imread(documento.ruta_archivo)
            
        else:
            logger.error("Documento sin contenido de imagen válido")
            return None
        
        if imagen is None:
            logger.error("cv2 no pudo decodificar la imagen")
            return None
        
        return imagen
        
    except Exception as e:
        logger.error(f"Error cargando imagen: {str(e)}", exc_info=True)
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
            imagen = deskew_image_improved(imagen)
        
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
        
        logger.info(f"✨ Config OCR mejorada: LSTM Engine + PSM 6 + Diccionario Panamá")
        
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


def extract_structured_data(
    texto: str, 
    tipo_documento: Optional[int]
) -> Optional[str]:
    """
    Extrae datos estructurados según el tipo de documento
    
    Args:
        texto: Texto extraído por OCR
        tipo_documento: Código del tipo de documento
    
    Returns:
        JSON string con campos extraídos o None
    """
    try:
        import re
        
        datos = {}
        
        # Pasaporte (tipo_documento == 1 o similar)
        if tipo_documento in [1, 'PASAPORTE']:
            logger.debug("Extrayendo datos de pasaporte")
            
            # Número de pasaporte (formato común: 2 letras + 7-9 dígitos)
            match_pasaporte = re.search(r'\b[A-Z]{1,2}\d{7,9}\b', texto)
            if match_pasaporte:
                datos['numero_pasaporte'] = match_pasaporte.group()
            
            # Fechas (DD/MM/YYYY o DD-MM-YYYY)
            fechas = re.findall(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b', texto)
            if fechas:
                datos['fechas_encontradas'] = fechas
                if len(fechas) >= 1:
                    datos['posible_fecha_nacimiento'] = fechas[0]
                if len(fechas) >= 2:
                    datos['posible_fecha_emision'] = fechas[1]
                if len(fechas) >= 3:
                    datos['posible_fecha_vencimiento'] = fechas[2]
            
            # Nacionalidad (códigos de 3 letras comunes)
            nacionalidades_comunes = ['PAN', 'USA', 'COL', 'VEN', 'NIC', 'CRI', 'MEX']
            for nac in nacionalidades_comunes:
                if nac in texto:
                    datos['nacionalidad'] = nac
                    break
        
        # Cédula (tipo_documento == 2 o similar)
        elif tipo_documento in [2, 'CEDULA']:
            logger.debug("Extrayendo datos de cédula")
            
            # Número de cédula panameña (formato: X-XXX-XXXX)
            match_cedula = re.search(r'\b\d{1,2}-\d{1,4}-\d{1,5}\b', texto)
            if match_cedula:
                datos['numero_cedula'] = match_cedula.group()
            
            # Fecha de nacimiento
            match_fecha = re.search(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b', texto)
            if match_fecha:
                datos['fecha_nacimiento'] = match_fecha.group()
        
        # Si se encontraron datos, retornar como JSON
        if datos:
            logger.info(f"Datos estructurados extraídos: {list(datos.keys())}")
            return json.dumps(datos, ensure_ascii=False)
        
        return None
        
    except Exception as e:
        logger.error(f"Error extrayendo datos estructurados: {str(e)}", exc_info=True)
        return None


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
