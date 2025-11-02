"""
Router de FastAPI para servicios OCR
Sistema de Trámites Migratorios de Panamá

Endpoints:
- POST /ocr/procesar/{id_documento} - Procesar documento con OCR
- GET /ocr/status/{task_id} - Obtener estado de tarea
- GET /ocr/resultado/{id_documento} - Obtener resultado OCR
- POST /ocr/reprocesar/{id_documento} - Reprocesar documento
- GET /ocr/estadisticas - Estadísticas del sistema
- DELETE /ocr/cancelar/{task_id} - Cancelar tarea en ejecución
"""

from typing import Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from celery.result import AsyncResult

from app.infrastructure.database import get_db
from app.models.models_ppsh import PPSHDocumento
from app.models.models_ocr import PPSHDocumentoOCR, PPSHDocumentoOCRHistorial
from app.schemas.schemas_ocr import (
    OCRRequest,
    OCRResponse,
    OCRStatus,
    OCRResultado,
    OCREstadisticas,
    EstadoOCREnum
)
from app.tasks.ocr_tasks import (
    process_document_ocr,
    process_urgent_document,
    generate_ocr_statistics
)
from celery_app import celery_app

router = APIRouter(
    prefix="/ocr",
    tags=["OCR"],
    responses={404: {"description": "Not found"}}
)


@router.post("/procesar/{id_documento}", response_model=OCRResponse, status_code=status.HTTP_202_ACCEPTED)
def procesar_documento(
    id_documento: int,
    request: OCRRequest,
    db: Session = Depends(get_db),
    user_id: str = Query(..., description="ID del usuario que solicita el procesamiento")
):
    """
    Inicia el procesamiento OCR de un documento
    
    El procesamiento es asíncrono, retorna inmediatamente con un task_id
    para consultar el estado posteriormente.
    
    - **id_documento**: ID del documento a procesar
    - **request**: Configuración del procesamiento OCR
    - **user_id**: Usuario que solicita el procesamiento
    
    Returns:
        OCRResponse con task_id para seguimiento
    """
    # Validar que el documento existe
    documento = db.query(PPSHDocumento).filter(
        PPSHDocumento.id_documento == id_documento
    ).first()
    
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Documento con ID {id_documento} no encontrado"
        )
    
    # Validar que el documento tiene contenido
    if not documento.contenido_binario and not documento.ruta_archivo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El documento no tiene contenido disponible para OCR"
        )
    
    # Verificar si ya existe un procesamiento en curso
    ocr_existente = db.query(PPSHDocumentoOCR).filter(
        PPSHDocumentoOCR.id_documento == id_documento,
        PPSHDocumentoOCR.estado_ocr == 'PROCESANDO'
    ).first()
    
    if ocr_existente:
        # Retornar la tarea existente
        return OCRResponse(
            success=True,
            message="Ya existe un procesamiento en curso para este documento",
            task_id=ocr_existente.celery_task_id,
            estado=EstadoOCREnum.PROCESANDO,
            id_documento=id_documento
        )
    
    # Preparar opciones para la tarea
    opciones = {
        'idioma': request.idioma,
        'preprocessing': {
            'binarizar': request.binarizar,
            'denoise': request.denoise,
            'mejorar_contraste': request.mejorar_contraste,
            'deskew': request.deskew,
            'resize_factor': request.resize_factor
        },
        'extraer_datos_estructurados': request.extraer_datos_estructurados
    }
    
    # Encolar tarea según prioridad
    if request.prioridad == 'alta':
        task = process_urgent_document.apply_async(
            args=[id_documento, user_id, opciones],
            queue='ocr_high_priority',
            priority=9
        )
    elif request.prioridad == 'baja':
        task = process_document_ocr.apply_async(
            args=[id_documento, user_id, opciones],
            queue='ocr_low_priority',
            priority=1
        )
    else:  # normal
        task = process_document_ocr.apply_async(
            args=[id_documento, user_id, opciones],
            queue='ocr_default',
            priority=5
        )
    
    return OCRResponse(
        success=True,
        message="Documento encolado para procesamiento OCR",
        task_id=task.id,
        estado=EstadoOCREnum.PENDIENTE,
        id_documento=id_documento,
        tiempo_estimado_segundos=30
    )


@router.get("/status/{task_id}", response_model=OCRStatus)
def obtener_estado(task_id: str):
    """
    Obtiene el estado actual de una tarea OCR
    
    - **task_id**: ID de la tarea retornado por /procesar
    
    Returns:
        OCRStatus con el estado actual y progreso
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == 'PENDING':
        return OCRStatus(
            task_id=task_id,
            estado='PENDIENTE',
            porcentaje_completado=0,
            mensaje="Tarea en cola esperando procesamiento"
        )
        
    elif task_result.state == 'PROGRESS':
        meta = task_result.info or {}
        return OCRStatus(
            task_id=task_id,
            estado='PROCESANDO',
            porcentaje_completado=meta.get('porcentaje', 0),
            mensaje=meta.get('status', 'Procesando...'),
            paso_actual=meta.get('current'),
            total_pasos=meta.get('total')
        )
        
    elif task_result.state == 'SUCCESS':
        result = task_result.result
        return OCRStatus(
            task_id=task_id,
            estado='COMPLETADO',
            porcentaje_completado=100,
            mensaje="Procesamiento completado exitosamente",
            id_documento=result.get('id_documento'),
            id_ocr=result.get('id_ocr'),
            confianza_promedio=result.get('confianza'),
            tiempo_procesamiento_ms=result.get('tiempo_ms')
        )
        
    elif task_result.state == 'FAILURE':
        return OCRStatus(
            task_id=task_id,
            estado='ERROR',
            porcentaje_completado=0,
            mensaje=f"Error en procesamiento: {str(task_result.info)}",
            codigo_error=type(task_result.info).__name__ if task_result.info else 'UnknownError'
        )
        
    elif task_result.state == 'RETRY':
        return OCRStatus(
            task_id=task_id,
            estado='PROCESANDO',
            porcentaje_completado=0,
            mensaje="Reintentando procesamiento después de un error temporal"
        )
        
    else:
        return OCRStatus(
            task_id=task_id,
            estado=task_result.state,
            porcentaje_completado=0,
            mensaje=f"Estado: {task_result.state}"
        )


@router.get("/resultado/{id_documento}", response_model=OCRResultado)
def obtener_resultado(
    id_documento: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene el resultado OCR completo de un documento
    
    - **id_documento**: ID del documento
    
    Returns:
        OCRResultado con el texto extraído y metadatos
    """
    # Buscar el resultado más reciente
    ocr_resultado = db.query(PPSHDocumentoOCR).filter(
        PPSHDocumentoOCR.id_documento == id_documento
    ).order_by(
        PPSHDocumentoOCR.created_at.desc()
    ).first()
    
    if not ocr_resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró resultado OCR para documento {id_documento}"
        )
    
    # Verificar estado
    if ocr_resultado.estado_ocr not in ['COMPLETADO', 'ERROR']:
        raise HTTPException(
            status_code=status.HTTP_425_TOO_EARLY,
            detail=f"El procesamiento aún no ha finalizado. Estado actual: {ocr_resultado.estado_ocr}"
        )
    
    # Construir respuesta
    resultado = OCRResultado(
        id_ocr=ocr_resultado.id_ocr,
        id_documento=ocr_resultado.id_documento,
        estado_ocr=ocr_resultado.estado_ocr,
        texto_extraido=ocr_resultado.texto_extraido,
        texto_confianza=ocr_resultado.texto_confianza,
        idioma_detectado=ocr_resultado.idioma_detectado,
        num_caracteres=ocr_resultado.num_caracteres,
        num_palabras=ocr_resultado.num_palabras,
        num_paginas=ocr_resultado.num_paginas,
        tiempo_procesamiento_ms=ocr_resultado.tiempo_procesamiento_ms,
        celery_task_id=ocr_resultado.celery_task_id,
        intentos_procesamiento=ocr_resultado.intentos_procesamiento or 0,
        fecha_inicio_proceso=ocr_resultado.fecha_inicio_proceso,
        fecha_fin_proceso=ocr_resultado.fecha_fin_proceso,
        codigo_error=ocr_resultado.codigo_error,
        mensaje_error=ocr_resultado.mensaje_error,
        created_by=ocr_resultado.created_by or 'system',
        created_at=ocr_resultado.created_at,
        updated_at=ocr_resultado.updated_at
    )
    
    # Agregar datos estructurados si existen
    if ocr_resultado.datos_estructurados:
        resultado.datos_estructurados = ocr_resultado.datos_estructurados
    
    # Agregar información de error si aplica
    if ocr_resultado.estado_ocr == 'ERROR':
        resultado.codigo_error = ocr_resultado.codigo_error
        resultado.mensaje_error = ocr_resultado.mensaje_error
    
    return resultado


@router.post("/reprocesar/{id_documento}", response_model=OCRResponse, status_code=status.HTTP_202_ACCEPTED)
def reprocesar_documento(
    id_documento: int,
    request: OCRRequest,
    db: Session = Depends(get_db),
    user_id: str = Query(..., description="ID del usuario que solicita el reprocesamiento"),
    guardar_historial: bool = Query(True, description="Guardar resultado anterior en historial")
):
    """
    Reprocesa un documento que ya tiene resultado OCR
    
    Útil para:
    - Mejorar extracción con diferentes configuraciones
    - Corregir errores en procesamiento anterior
    - Actualizar con nueva versión del documento
    
    - **id_documento**: ID del documento a reprocesar
    - **request**: Nueva configuración de procesamiento
    - **user_id**: Usuario que solicita el reprocesamiento
    - **guardar_historial**: Si True, guarda el resultado anterior en la tabla de historial
    
    Returns:
        OCRResponse con nuevo task_id
    """
    # Buscar resultado anterior
    ocr_anterior = db.query(PPSHDocumentoOCR).filter(
        PPSHDocumentoOCR.id_documento == id_documento
    ).order_by(
        PPSHDocumentoOCR.created_at.desc()
    ).first()
    
    if not ocr_anterior:
        # Si no hay resultado anterior, procesaremos como nuevo
        return procesar_documento(id_documento, request, db, user_id)
    
    # Guardar en historial si se solicita
    if guardar_historial and ocr_anterior.estado_ocr == 'COMPLETADO':
        # Obtener último número de versión
        ultima_version = db.query(func.max(PPSHDocumentoOCRHistorial.version))\
            .filter(PPSHDocumentoOCRHistorial.id_ocr == ocr_anterior.id_ocr)\
            .scalar() or 0
        
        historial = PPSHDocumentoOCRHistorial(
            id_ocr=ocr_anterior.id_ocr,
            version=ultima_version + 1,
            texto_extraido=ocr_anterior.texto_extraido,
            texto_confianza=ocr_anterior.texto_confianza,
            procesado_en=ocr_anterior.created_at,
            procesado_por=ocr_anterior.created_by,
            motivo_reproceso=request.motivo_reprocesamiento or "Reprocesamiento solicitado",
            opciones_utilizadas=json.dumps({
                'idioma': ocr_anterior.idioma_detectado,
                'num_caracteres': ocr_anterior.num_caracteres,
                'num_palabras': ocr_anterior.num_palabras,
                'datos_estructurados': ocr_anterior.datos_estructurados
            })
        )
        db.add(historial)
        db.commit()
    
    # Marcar el resultado anterior como obsoleto o eliminarlo
    db.delete(ocr_anterior)
    db.commit()
    
    # Procesar como nuevo documento
    return procesar_documento(id_documento, request, db, user_id)


@router.get("/estadisticas", response_model=OCREstadisticas)
def obtener_estadisticas(
    db: Session = Depends(get_db),
    desde_cache: bool = Query(True, description="Usar estadísticas en caché (más rápido)")
):
    """
    Obtiene estadísticas generales del sistema OCR
    
    - **desde_cache**: Si True, usa estadísticas pre-calculadas (más rápido)
    
    Returns:
        OCREstadisticas con métricas del sistema
    """
    if desde_cache:
        # Ejecutar tarea de estadísticas de forma síncrona
        stats = generate_ocr_statistics.apply().get()
        
        return OCREstadisticas(
            total_procesados=stats.get('total', 0),
            total_completados=stats['por_estado'].get('COMPLETADO', 0),
            total_errores=stats['por_estado'].get('ERROR', 0),
            total_procesando=stats['por_estado'].get('PROCESANDO', 0),
            total_pendientes=stats['por_estado'].get('PENDIENTE', 0),
            confianza_promedio=stats.get('confianza_promedio'),
            tiempo_promedio_ms=stats.get('tiempo_promedio_ms'),
            ultima_actualizacion=stats.get('timestamp')
        )
    else:
        # Calcular estadísticas en tiempo real (más lento pero más preciso)
        from sqlalchemy import func
        
        total = db.query(PPSHDocumentoOCR).count()
        
        # Contar por estado
        estados = db.query(
            PPSHDocumentoOCR.estado_ocr,
            func.count(PPSHDocumentoOCR.id_ocr)
        ).group_by(PPSHDocumentoOCR.estado_ocr).all()
        
        estados_dict = {estado: count for estado, count in estados}
        
        # Confianza promedio
        confianza_avg = db.query(
            func.avg(PPSHDocumentoOCR.texto_confianza)
        ).filter(PPSHDocumentoOCR.estado_ocr == 'COMPLETADO').scalar()
        
        # Tiempo promedio
        tiempo_avg = db.query(
            func.avg(PPSHDocumentoOCR.tiempo_procesamiento_ms)
        ).filter(PPSHDocumentoOCR.estado_ocr == 'COMPLETADO').scalar()
        
        from datetime import datetime
        
        return OCREstadisticas(
            total_procesados=total,
            total_completados=estados_dict.get('COMPLETADO', 0),
            total_errores=estados_dict.get('ERROR', 0),
            total_procesando=estados_dict.get('PROCESANDO', 0),
            total_pendientes=estados_dict.get('PENDIENTE', 0),
            confianza_promedio=float(confianza_avg) if confianza_avg else None,
            tiempo_promedio_ms=int(tiempo_avg) if tiempo_avg else None,
            ultima_actualizacion=datetime.now().isoformat()
        )


@router.delete("/cancelar/{task_id}", status_code=status.HTTP_200_OK)
def cancelar_tarea(
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    Cancela una tarea OCR en ejecución o pendiente
    
    - **task_id**: ID de la tarea a cancelar
    
    Returns:
        Confirmación de cancelación
    """
    # Revocar la tarea en Celery
    celery_app.control.revoke(task_id, terminate=True, signal='SIGKILL')
    
    # Actualizar estado en BD
    ocr_record = db.query(PPSHDocumentoOCR).filter(
        PPSHDocumentoOCR.celery_task_id == task_id
    ).first()
    
    if ocr_record:
        ocr_record.estado_ocr = 'CANCELADO'
        ocr_record.mensaje_error = 'Procesamiento cancelado por el usuario'
        db.commit()
    
    return {
        "mensaje": f"Tarea {task_id} cancelada exitosamente",
        "task_id": task_id,
        "estado": "CANCELADO"
    }


@router.get("/historial/{id_documento}")
def obtener_historial(
    id_documento: int,
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100, description="Número máximo de registros")
):
    """
    Obtiene el historial de reprocesamiento de un documento
    
    - **id_documento**: ID del documento
    - **limit**: Número máximo de registros a retornar
    
    Returns:
        Lista de resultados históricos
    """
    historial = db.query(PPSHDocumentoOCRHistorial).filter(
        PPSHDocumentoOCRHistorial.id_documento == id_documento
    ).order_by(
        PPSHDocumentoOCRHistorial.created_at.desc()
    ).limit(limit).all()
    
    if not historial:
        return {"mensaje": "No hay historial de reprocesamiento", "resultados": []}
    
    return {
        "id_documento": id_documento,
        "total_reprocesos": len(historial),
        "historial": [
            {
                "id_historial": h.id_historial,
                "fecha_proceso": h.fecha_proceso_original.isoformat() if h.fecha_proceso_original else None,
                "texto_extraido": h.texto_extraido[:200] + "..." if h.texto_extraido and len(h.texto_extraido) > 200 else h.texto_extraido,
                "confianza": h.texto_confianza,
                "motivo_reprocesamiento": h.motivo_reprocesamiento,
                "fecha_guardado_historial": h.created_at.isoformat() if h.created_at else None
            }
            for h in historial
        ]
    }
