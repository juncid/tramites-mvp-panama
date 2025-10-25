#!/usr/bin/env python3
"""
Script de prueba para los endpoints API REST del Sistema SIM_FT_*
Verifica que todos los endpoints estén funcionando correctamente
"""
import requests
import json
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8000/api/v1/sim-ft"
HEADERS = {"Content-Type": "application/json"}

def print_section(title):
    """Imprimir sección decorada"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_endpoint(method, endpoint, data=None, expected_status=200, description=""):
    """Probar un endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{method} {endpoint}")
    if description:
        print(f"  📝 {description}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=HEADERS)
        elif method == "POST":
            response = requests.post(url, headers=HEADERS, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=HEADERS, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=HEADERS)
        
        if response.status_code == expected_status:
            print(f"  ✅ Status: {response.status_code}")
            if response.status_code != 204:  # No content
                result = response.json()
                if isinstance(result, list):
                    print(f"  📊 Resultados: {len(result)} registros")
                    if len(result) > 0:
                        print(f"  📄 Primer registro: {json.dumps(result[0], indent=2)[:200]}...")
                else:
                    print(f"  📄 Respuesta: {json.dumps(result, indent=2)[:200]}...")
            return response
        else:
            print(f"  ❌ Status inesperado: {response.status_code} (esperado: {expected_status})")
            print(f"  📄 Respuesta: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def main():
    """Ejecutar pruebas de endpoints"""
    print("\n")
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║          PRUEBAS DE ENDPOINTS API REST - Sistema SIM_FT_*                  ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")
    
    # ========================================================================
    # CATÁLOGOS - Estados
    # ========================================================================
    print_section("CATÁLOGOS - Estados")
    
    test_endpoint(
        "GET", "/estatus",
        description="Obtener todos los estados"
    )
    
    test_endpoint(
        "GET", "/estatus?activo=true",
        description="Obtener estados activos"
    )
    
    test_endpoint(
        "GET", "/estatus/01",
        description="Obtener estado 01 (Iniciado)"
    )
    
    # ========================================================================
    # CATÁLOGOS - Conclusiones
    # ========================================================================
    print_section("CATÁLOGOS - Conclusiones")
    
    test_endpoint(
        "GET", "/conclusiones",
        description="Obtener todas las conclusiones"
    )
    
    test_endpoint(
        "GET", "/conclusiones?activo=true",
        description="Obtener conclusiones activas"
    )
    
    # ========================================================================
    # CATÁLOGOS - Prioridades
    # ========================================================================
    print_section("CATÁLOGOS - Prioridades")
    
    test_endpoint(
        "GET", "/prioridades",
        description="Obtener todas las prioridades"
    )
    
    # ========================================================================
    # CATÁLOGOS - Tipos de Trámites
    # ========================================================================
    print_section("CATÁLOGOS - Tipos de Trámites")
    
    test_endpoint(
        "GET", "/tramites-tipos",
        description="Obtener tipos de trámites"
    )
    
    test_endpoint(
        "GET", "/tramites-tipos/PPSH",
        description="Obtener tipo de trámite PPSH"
    )
    
    # ========================================================================
    # CONFIGURACIÓN - Pasos
    # ========================================================================
    print_section("CONFIGURACIÓN - Pasos")
    
    test_endpoint(
        "GET", "/pasos",
        description="Obtener todos los pasos definidos"
    )
    
    test_endpoint(
        "GET", "/pasos?cod_tramite=PPSH",
        description="Obtener pasos del trámite PPSH"
    )
    
    test_endpoint(
        "GET", "/pasos/PPSH/1",
        description="Obtener paso 1 del trámite PPSH"
    )
    
    # ========================================================================
    # CONFIGURACIÓN - Flujo de Pasos
    # ========================================================================
    print_section("CONFIGURACIÓN - Flujo de Pasos")
    
    test_endpoint(
        "GET", "/flujo-pasos",
        description="Obtener configuración de flujos"
    )
    
    test_endpoint(
        "GET", "/flujo-pasos?cod_tramite=PPSH",
        description="Obtener flujo del trámite PPSH"
    )
    
    # ========================================================================
    # TRÁMITES - Crear nuevo trámite
    # ========================================================================
    print_section("TRÁMITES - Crear nuevo trámite")
    
    nuevo_tramite = {
        "NUM_ANNIO": 2025,
        "NUM_REGISTRO": 1,
        "COD_TRAMITE": "PPSH",
        "FEC_INI_TRAMITE": datetime.now().isoformat(),
        "IND_ESTATUS": "01",
        "IND_PRIORIDAD": "N",
        "OBS_OBSERVA": "Trámite de prueba creado desde API",
        "ID_USUARIO_CREA": "ADMIN_TEST"
    }
    
    response = test_endpoint(
        "POST", "/tramites",
        data=nuevo_tramite,
        expected_status=201,
        description="Crear un nuevo trámite PPSH"
    )
    
    if response:
        tramite_creado = response.json()
        num_tramite = tramite_creado.get("NUM_TRAMITE")
        
        # ====================================================================
        # TRÁMITES - Consultar trámite creado
        # ====================================================================
        print_section("TRÁMITES - Consultar trámite creado")
        
        test_endpoint(
            "GET", f"/tramites/2025/{num_tramite}/1",
            description=f"Obtener trámite 2025-{num_tramite}-1"
        )
        
        # ====================================================================
        # TRÁMITES - Actualizar trámite
        # ====================================================================
        print_section("TRÁMITES - Actualizar trámite")
        
        actualizacion = {
            "IND_ESTATUS": "02",
            "OBS_OBSERVA": "Trámite actualizado - En Proceso"
        }
        
        test_endpoint(
            "PUT", f"/tramites/2025/{num_tramite}/1",
            data=actualizacion,
            description=f"Actualizar estado del trámite"
        )
        
        # ====================================================================
        # TRÁMITES - Registrar paso
        # ====================================================================
        print_section("TRÁMITES - Registrar paso")
        
        nuevo_paso = {
            "NUM_PASO": 1,
            "NUM_REGISTRO": 1,
            "COD_TRAMITE": "PPSH",
            "COD_SECCION": "ATEN",
            "COD_AGENCIA": "0001",
            "ID_USUAR_RESP": "ADMIN_TEST",
            "OBS_OBSERVACION": "Paso 1 iniciado",
            "NUM_PASO_SGTE": 2,
            "IND_ESTATUS": "02",
            "ID_USUARIO_CREA": "ADMIN_TEST"
        }
        
        test_endpoint(
            "POST", f"/tramites/2025/{num_tramite}/pasos",
            data=nuevo_paso,
            expected_status=201,
            description="Registrar paso 1 del trámite"
        )
        
        # ====================================================================
        # TRÁMITES - Consultar pasos
        # ====================================================================
        print_section("TRÁMITES - Consultar pasos")
        
        test_endpoint(
            "GET", f"/tramites/2025/{num_tramite}/pasos",
            description="Obtener todos los pasos del trámite"
        )
        
        test_endpoint(
            "GET", f"/tramites/2025/{num_tramite}/1/1",
            description="Obtener paso específico"
        )
    
    # ========================================================================
    # TRÁMITES - Listados con filtros
    # ========================================================================
    print_section("TRÁMITES - Listados con filtros")
    
    test_endpoint(
        "GET", "/tramites",
        description="Obtener todos los trámites"
    )
    
    test_endpoint(
        "GET", "/tramites?num_annio=2025",
        description="Obtener trámites del 2025"
    )
    
    test_endpoint(
        "GET", "/tramites?cod_tramite=PPSH",
        description="Obtener trámites tipo PPSH"
    )
    
    test_endpoint(
        "GET", "/tramites?ind_estatus=02",
        description="Obtener trámites en proceso"
    )
    
    # ========================================================================
    # ESTADÍSTICAS
    # ========================================================================
    print_section("ESTADÍSTICAS Y REPORTES")
    
    test_endpoint(
        "GET", "/estadisticas/tramites-por-estado",
        description="Estadísticas por estado"
    )
    
    test_endpoint(
        "GET", "/estadisticas/tramites-por-tipo",
        description="Estadísticas por tipo"
    )
    
    test_endpoint(
        "GET", "/estadisticas/tiempo-promedio",
        description="Tiempo promedio de procesamiento"
    )
    
    test_endpoint(
        "GET", "/estadisticas/tiempo-promedio?cod_tramite=PPSH",
        description="Tiempo promedio PPSH"
    )
    
    # ========================================================================
    # RESUMEN FINAL
    # ========================================================================
    print("\n")
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                    PRUEBAS COMPLETADAS                                      ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")
    print("\n")
    print("✅ Todos los endpoints del sistema SIM_FT_* han sido probados")
    print("📊 Revisa los resultados arriba para verificar funcionamiento")
    print("\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Pruebas interrumpidas por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error general: {e}")
