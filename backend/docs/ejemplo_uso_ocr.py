"""
Ejemplo de uso del Servicio OCR
Sistema de Trámites Migratorios de Panamá

Este script demuestra cómo utilizar el servicio OCR desde código Python.
"""

import requests
import time
import json
from typing import Dict, Any

# Configuración
API_BASE_URL = "http://localhost:8000/api/v1"
USER_ID = "admin"


def procesar_documento(id_documento: int, configuracion: Dict[str, Any] = None) -> str:
    """
    Inicia el procesamiento OCR de un documento
    
    Args:
        id_documento: ID del documento a procesar
        configuracion: Configuración opcional del OCR
        
    Returns:
        task_id para seguimiento
    """
    url = f"{API_BASE_URL}/ocr/procesar/{id_documento}"
    
    # Configuración por defecto
    if configuracion is None:
        configuracion = {
            "idioma": "spa+eng",
            "prioridad": "normal",
            "binarizar": True,
            "denoise": True,
            "mejorar_contraste": True,
            "deskew": True,
            "extraer_datos_estructurados": True
        }
    
    response = requests.post(
        url,
        params={"user_id": USER_ID},
        json=configuracion
    )
    
    if response.status_code == 202:
        data = response.json()
        print(f"✅ Documento {id_documento} encolado para procesamiento")
        print(f"   Task ID: {data['task_id']}")
        print(f"   Estado: {data['estado']}")
        print(f"   Tiempo estimado: {data.get('tiempo_estimado_segundos', 'N/A')}s")
        return data['task_id']
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   {response.json()}")
        return None


def consultar_estado(task_id: str) -> Dict[str, Any]:
    """
    Consulta el estado de una tarea OCR
    
    Args:
        task_id: ID de la tarea
        
    Returns:
        Estado completo de la tarea
    """
    url = f"{API_BASE_URL}/ocr/status/{task_id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error consultando estado: {response.status_code}")
        return None


def esperar_resultado(task_id: str, max_intentos: int = 60, intervalo: int = 2) -> Dict[str, Any]:
    """
    Espera a que la tarea termine y retorna el resultado
    
    Args:
        task_id: ID de la tarea
        max_intentos: Número máximo de intentos
        intervalo: Segundos entre intentos
        
    Returns:
        Estado final de la tarea
    """
    print(f"\n⏳ Esperando resultado de tarea {task_id}...")
    
    for intento in range(max_intentos):
        estado = consultar_estado(task_id)
        
        if estado is None:
            return None
        
        estado_actual = estado['estado']
        porcentaje = estado.get('porcentaje_completado', 0)
        mensaje = estado.get('mensaje', '')
        
        print(f"   [{intento+1}/{max_intentos}] {estado_actual} - {porcentaje}% - {mensaje}")
        
        if estado_actual == 'COMPLETADO':
            print(f"✅ Procesamiento completado!")
            return estado
        
        elif estado_actual == 'ERROR':
            print(f"❌ Error en procesamiento:")
            print(f"   Código: {estado.get('codigo_error', 'N/A')}")
            print(f"   Mensaje: {estado.get('mensaje', 'N/A')}")
            return estado
        
        elif estado_actual == 'CANCELADO':
            print(f"⚠️  Tarea cancelada")
            return estado
        
        time.sleep(intervalo)
    
    print(f"⏱️  Timeout esperando resultado")
    return None


def obtener_resultado(id_documento: int) -> Dict[str, Any]:
    """
    Obtiene el resultado completo del OCR
    
    Args:
        id_documento: ID del documento
        
    Returns:
        Resultado completo con texto extraído y datos estructurados
    """
    url = f"{API_BASE_URL}/ocr/resultado/{id_documento}"
    response = requests.get(url)
    
    if response.status_code == 200:
        resultado = response.json()
        
        print(f"\n📄 Resultado OCR para documento {id_documento}:")
        print(f"   ID OCR: {resultado['id_ocr']}")
        print(f"   Estado: {resultado['estado']}")
        print(f"   Confianza: {resultado['confianza_promedio']}%")
        print(f"   Idioma: {resultado['idioma_detectado']}")
        print(f"   Caracteres: {resultado['num_caracteres']}")
        print(f"   Palabras: {resultado['num_palabras']}")
        print(f"   Tiempo: {resultado['tiempo_procesamiento_ms']}ms")
        
        if resultado.get('datos_estructurados'):
            print(f"\n   📊 Datos estructurados:")
            for key, value in resultado['datos_estructurados'].items():
                print(f"      {key}: {value}")
        
        print(f"\n   📝 Texto extraído (primeros 200 caracteres):")
        texto = resultado['texto_extraido']
        print(f"      {texto[:200]}...")
        
        return resultado
    
    elif response.status_code == 404:
        print(f"❌ No se encontró resultado para documento {id_documento}")
        return None
    
    elif response.status_code == 425:
        print(f"⏳ El procesamiento aún no ha finalizado")
        return None
    
    else:
        print(f"❌ Error: {response.status_code}")
        return None


def obtener_estadisticas() -> Dict[str, Any]:
    """
    Obtiene estadísticas del sistema OCR
    
    Returns:
        Estadísticas generales
    """
    url = f"{API_BASE_URL}/ocr/estadisticas"
    response = requests.get(url, params={"desde_cache": True})
    
    if response.status_code == 200:
        stats = response.json()
        
        print(f"\n📊 Estadísticas del Sistema OCR:")
        print(f"   Total procesados: {stats['total_procesados']}")
        print(f"   Completados: {stats['total_completados']}")
        print(f"   Errores: {stats['total_errores']}")
        print(f"   Procesando: {stats['total_procesando']}")
        print(f"   Pendientes: {stats['total_pendientes']}")
        
        if stats.get('confianza_promedio'):
            print(f"   Confianza promedio: {stats['confianza_promedio']:.2f}%")
        
        if stats.get('tiempo_promedio_ms'):
            print(f"   Tiempo promedio: {stats['tiempo_promedio_ms']}ms")
        
        return stats
    else:
        print(f"❌ Error obteniendo estadísticas: {response.status_code}")
        return None


def cancelar_tarea(task_id: str) -> bool:
    """
    Cancela una tarea en ejecución
    
    Args:
        task_id: ID de la tarea a cancelar
        
    Returns:
        True si se canceló exitosamente
    """
    url = f"{API_BASE_URL}/ocr/cancelar/{task_id}"
    response = requests.delete(url)
    
    if response.status_code == 200:
        print(f"✅ Tarea {task_id} cancelada")
        return True
    else:
        print(f"❌ Error cancelando tarea: {response.status_code}")
        return False


def reprocesar_documento(id_documento: int, motivo: str = None) -> str:
    """
    Reprocesa un documento con nuevas configuraciones
    
    Args:
        id_documento: ID del documento
        motivo: Motivo del reprocesamiento
        
    Returns:
        task_id de la nueva tarea
    """
    url = f"{API_BASE_URL}/ocr/reprocesar/{id_documento}"
    
    configuracion = {
        "idioma": "spa+eng",
        "prioridad": "alta",  # Alta prioridad para reproceso
        "binarizar": True,
        "denoise": True,
        "mejorar_contraste": True,
        "deskew": True,
        "extraer_datos_estructurados": True,
        "motivo_reprocesamiento": motivo or "Reprocesamiento solicitado"
    }
    
    response = requests.post(
        url,
        params={"user_id": USER_ID, "guardar_historial": True},
        json=configuracion
    )
    
    if response.status_code == 202:
        data = response.json()
        print(f"✅ Documento {id_documento} encolado para reprocesamiento")
        print(f"   Task ID: {data['task_id']}")
        return data['task_id']
    else:
        print(f"❌ Error: {response.status_code}")
        return None


def obtener_historial(id_documento: int) -> list:
    """
    Obtiene el historial de reprocesamiento
    
    Args:
        id_documento: ID del documento
        
    Returns:
        Lista de resultados históricos
    """
    url = f"{API_BASE_URL}/ocr/historial/{id_documento}"
    response = requests.get(url, params={"limit": 10})
    
    if response.status_code == 200:
        data = response.json()
        historial = data.get('historial', [])
        
        if historial:
            print(f"\n📜 Historial de reprocesamiento (documento {id_documento}):")
            print(f"   Total reprocesos: {data['total_reprocesos']}")
            
            for i, h in enumerate(historial, 1):
                print(f"\n   [{i}] ID Historial: {h['id_historial']}")
                print(f"       Fecha proceso: {h['fecha_proceso']}")
                print(f"       Confianza: {h['confianza']}%")
                print(f"       Motivo: {h['motivo_reprocesamiento']}")
                print(f"       Guardado: {h['fecha_guardado_historial']}")
        else:
            print(f"   No hay historial de reprocesamiento")
        
        return historial
    else:
        print(f"❌ Error obteniendo historial: {response.status_code}")
        return []


# ==================== EJEMPLOS DE USO ====================

def ejemplo_basico():
    """Ejemplo básico: Procesar un documento y obtener resultado"""
    print("=" * 60)
    print("EJEMPLO 1: Procesamiento Básico")
    print("=" * 60)
    
    # 1. Procesar documento
    task_id = procesar_documento(id_documento=1)
    
    if task_id:
        # 2. Esperar resultado
        estado_final = esperar_resultado(task_id, max_intentos=30, intervalo=2)
        
        if estado_final and estado_final['estado'] == 'COMPLETADO':
            # 3. Obtener resultado completo
            resultado = obtener_resultado(id_documento=1)
            
            # 4. Mostrar estadísticas
            obtener_estadisticas()


def ejemplo_alta_prioridad():
    """Ejemplo: Procesamiento con alta prioridad"""
    print("\n" + "=" * 60)
    print("EJEMPLO 2: Procesamiento de Alta Prioridad")
    print("=" * 60)
    
    configuracion = {
        "idioma": "spa+eng",
        "prioridad": "alta",  # ⚡ Alta prioridad
        "binarizar": True,
        "denoise": True,
        "mejorar_contraste": True,
        "deskew": True
    }
    
    task_id = procesar_documento(id_documento=2, configuracion=configuracion)
    
    if task_id:
        esperar_resultado(task_id, max_intentos=20, intervalo=1)
        obtener_resultado(id_documento=2)


def ejemplo_solo_ingles():
    """Ejemplo: Procesamiento solo en inglés"""
    print("\n" + "=" * 60)
    print("EJEMPLO 3: OCR Solo en Inglés")
    print("=" * 60)
    
    configuracion = {
        "idioma": "eng",  # Solo inglés
        "prioridad": "normal",
        "binarizar": True,
        "denoise": False,  # Sin reducción de ruido
        "mejorar_contraste": False,
        "deskew": True
    }
    
    task_id = procesar_documento(id_documento=3, configuracion=configuracion)
    
    if task_id:
        esperar_resultado(task_id)
        obtener_resultado(id_documento=3)


def ejemplo_reprocesamiento():
    """Ejemplo: Reprocesar documento con mejor configuración"""
    print("\n" + "=" * 60)
    print("EJEMPLO 4: Reprocesamiento")
    print("=" * 60)
    
    # 1. Mostrar historial actual
    obtener_historial(id_documento=1)
    
    # 2. Reprocesar con nuevo motivo
    task_id = reprocesar_documento(
        id_documento=1,
        motivo="Mejorar extracción de datos estructurados"
    )
    
    if task_id:
        esperar_resultado(task_id)
        obtener_resultado(id_documento=1)
        
        # 3. Mostrar nuevo historial
        obtener_historial(id_documento=1)


def ejemplo_cancelacion():
    """Ejemplo: Cancelar una tarea"""
    print("\n" + "=" * 60)
    print("EJEMPLO 5: Cancelación de Tarea")
    print("=" * 60)
    
    # 1. Iniciar procesamiento
    task_id = procesar_documento(id_documento=4)
    
    if task_id:
        # 2. Esperar un poco
        time.sleep(2)
        
        # 3. Cancelar
        cancelar_tarea(task_id)
        
        # 4. Verificar estado
        estado = consultar_estado(task_id)
        if estado:
            print(f"   Estado final: {estado['estado']}")


def ejemplo_batch():
    """Ejemplo: Procesar múltiples documentos"""
    print("\n" + "=" * 60)
    print("EJEMPLO 6: Procesamiento en Lote")
    print("=" * 60)
    
    documentos = [5, 6, 7, 8, 9]
    task_ids = []
    
    # 1. Encolar todos los documentos
    for doc_id in documentos:
        task_id = procesar_documento(
            id_documento=doc_id,
            configuracion={"prioridad": "baja"}  # Baja prioridad para batch
        )
        if task_id:
            task_ids.append((doc_id, task_id))
    
    # 2. Esperar todos los resultados
    for doc_id, task_id in task_ids:
        print(f"\n--- Documento {doc_id} ---")
        esperar_resultado(task_id, max_intentos=10, intervalo=3)
        obtener_resultado(doc_id)
    
    # 3. Estadísticas finales
    obtener_estadisticas()


if __name__ == "__main__":
    """
    Ejecutar ejemplos
    
    Uso:
        python ejemplo_uso_ocr.py
    
    Nota: Asegúrate de que:
    1. El backend esté corriendo (docker-compose up -d)
    2. Los workers de Celery estén activos
    3. Existan documentos con los IDs usados en los ejemplos
    """
    
    # Descomentar el ejemplo que quieras ejecutar
    
    # ejemplo_basico()
    # ejemplo_alta_prioridad()
    # ejemplo_solo_ingles()
    # ejemplo_reprocesamiento()
    # ejemplo_cancelacion()
    # ejemplo_batch()
    
    # O ejecutar todos (cuidado con la cantidad de documentos)
    # ejemplo_basico()
    # ejemplo_alta_prioridad()
    # ejemplo_reprocesamiento()
    
    print("\n" + "=" * 60)
    print("✅ Ejemplos completados")
    print("=" * 60)
    print("\nPara más información:")
    print("  - API Docs: http://localhost:8000/api/docs")
    print("  - Flower Monitor: http://localhost:5555")
    print("  - Documentación: backend/docs/ARQUITECTURA_OCR.md")
