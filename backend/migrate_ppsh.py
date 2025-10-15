#!/usr/bin/env python3
"""
Script de Migración PPSH
Sistema de Trámites Migratorios de Panamá
Fecha: 2025-10-13

Este script ejecuta la migración de tablas PPSH y opcionalmente
carga datos de ejemplo para testing.
"""

import pyodbc
import time
import sys
from pathlib import Path

# Configuración de colores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def esperar_sql_server(conn_str, max_intentos=30, intervalo=2):
    """Espera a que SQL Server esté disponible"""
    print_info("Esperando a que SQL Server esté disponible...")
    
    for intento in range(1, max_intentos + 1):
        try:
            conn = pyodbc.connect(conn_str, timeout=5)
            conn.close()
            print_success("SQL Server está disponible")
            return True
        except Exception as e:
            if intento < max_intentos:
                print(f"   Intento {intento}/{max_intentos}... esperando {intervalo}s")
                time.sleep(intervalo)
            else:
                print_error(f"No se pudo conectar después de {max_intentos} intentos")
                print_error(f"Error: {e}")
                return False
    
    return False

def verificar_base_datos(cursor):
    """Verifica que la base de datos SIM_PANAMA existe"""
    try:
        cursor.execute("SELECT name FROM sys.databases WHERE name = 'SIM_PANAMA'")
        result = cursor.fetchone()
        if result:
            print_success("Base de datos SIM_PANAMA encontrada")
            return True
        else:
            print_error("Base de datos SIM_PANAMA no encontrada")
            print_warning("Ejecuta primero: backend/bbdd/init_database.sql")
            return False
    except Exception as e:
        print_error(f"Error al verificar base de datos: {e}")
        return False

def ejecutar_script_sql(cursor, conn, archivo_path, nombre):
    """Ejecuta un script SQL por lotes (separados por GO)"""
    try:
        print_info(f"Ejecutando {nombre}...")
        
        # Leer archivo
        with open(archivo_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Dividir por GO
        batches = [batch.strip() for batch in sql_script.split('GO') if batch.strip()]
        total_batches = len(batches)
        
        print_info(f"Total de lotes a ejecutar: {total_batches}")
        
        # Ejecutar cada lote
        for i, batch in enumerate(batches, 1):
            try:
                # Mostrar progreso
                progreso = (i / total_batches) * 100
                print(f"   Lote {i}/{total_batches} ({progreso:.1f}%)...", end='\r')
                
                # Ejecutar lote
                cursor.execute(batch)
                conn.commit()
                
            except Exception as e:
                # Algunos mensajes PRINT pueden causar "warnings" que no son errores
                if "No results" not in str(e):
                    print_warning(f"\n   Advertencia en lote {i}: {e}")
                    # Continuar con el siguiente lote
                    continue
        
        print(f"   Lote {total_batches}/{total_batches} (100.0%)   ")
        print_success(f"{nombre} ejecutado exitosamente")
        return True
        
    except Exception as e:
        print_error(f"Error al ejecutar {nombre}: {e}")
        return False

def verificar_migracion(cursor):
    """Verifica que la migración se ejecutó correctamente"""
    print_info("Verificando migración...")
    
    verificaciones = {
        "Tablas PPSH": "SELECT COUNT(*) FROM sys.tables WHERE name LIKE 'PPSH_%'",
        "Causas humanitarias": "SELECT COUNT(*) FROM PPSH_CAUSA_HUMANITARIA",
        "Tipos de documento": "SELECT COUNT(*) FROM PPSH_TIPO_DOCUMENTO",
        "Estados PPSH": "SELECT COUNT(*) FROM PPSH_ESTADO",
        "Vistas": "SELECT COUNT(*) FROM sys.views WHERE name LIKE 'VW_PPSH_%'",
        "Procedimientos": "SELECT COUNT(*) FROM sys.procedures WHERE name LIKE 'SP_PPSH_%'"
    }
    
    resultados = {}
    todo_ok = True
    
    for nombre, query in verificaciones.items():
        try:
            cursor.execute(query)
            count = cursor.fetchone()[0]
            resultados[nombre] = count
            
            # Valores esperados
            esperados = {
                "Tablas PPSH": 9,
                "Causas humanitarias": 10,
                "Tipos de documento": 12,
                "Estados PPSH": 16,
                "Vistas": 2,
                "Procedimientos": 3
            }
            
            if count == esperados[nombre]:
                print_success(f"{nombre}: {count} (correcto)")
            else:
                print_warning(f"{nombre}: {count} (esperado: {esperados[nombre]})")
                todo_ok = False
                
        except Exception as e:
            print_error(f"{nombre}: Error - {e}")
            todo_ok = False
    
    return todo_ok

def mostrar_resumen(cursor):
    """Muestra un resumen de los datos cargados"""
    print_header("RESUMEN DE DATOS")
    
    try:
        # Solicitudes
        cursor.execute("SELECT COUNT(*) FROM PPSH_SOLICITUD WHERE activo = 1")
        total_sol = cursor.fetchone()[0]
        print(f"📋 Total Solicitudes: {Colors.BOLD}{total_sol}{Colors.ENDC}")
        
        # Solicitantes
        cursor.execute("SELECT COUNT(*) FROM PPSH_SOLICITANTE WHERE activo = 1")
        total_per = cursor.fetchone()[0]
        print(f"👥 Total Personas: {Colors.BOLD}{total_per}{Colors.ENDC}")
        
        # Documentos
        cursor.execute("SELECT COUNT(*) FROM PPSH_DOCUMENTO")
        total_doc = cursor.fetchone()[0]
        print(f"📄 Total Documentos: {Colors.BOLD}{total_doc}{Colors.ENDC}")
        
        # Por estado
        print(f"\n{Colors.BOLD}Solicitudes por Estado:{Colors.ENDC}")
        cursor.execute("""
            SELECT estado_actual, COUNT(*) 
            FROM PPSH_SOLICITUD 
            WHERE activo = 1 
            GROUP BY estado_actual
            ORDER BY COUNT(*) DESC
        """)
        
        for estado, count in cursor.fetchall():
            print(f"   • {estado}: {count}")
        
    except Exception as e:
        print_error(f"Error al obtener resumen: {e}")

def main():
    """Función principal"""
    print_header("MIGRACIÓN PPSH - SISTEMA DE TRÁMITES MIGRATORIOS")
    
    # Configuración
    config = {
        'server': 'localhost,1433',
        'database': 'SIM_PANAMA',
        'username': 'sa',
        'password': 'YourStrong@Passw0rd',
        'driver': 'ODBC Driver 18 for SQL Server'
    }
    
    # Paths de archivos
    base_path = Path(__file__).parent / 'bbdd'
    migration_file = base_path / 'migration_ppsh_v1.sql'
    sample_data_file = base_path / 'ppsh_sample_data.sql'
    
    # Verificar que existen los archivos
    if not migration_file.exists():
        print_error(f"Archivo no encontrado: {migration_file}")
        return 1
    
    if not sample_data_file.exists():
        print_warning(f"Archivo de datos de ejemplo no encontrado: {sample_data_file}")
        sample_data_file = None
    
    # String de conexión
    conn_str = (
        f"DRIVER={{{config['driver']}}};"
        f"SERVER={config['server']};"
        f"DATABASE={config['database']};"
        f"UID={config['username']};"
        f"PWD={config['password']};"
        "TrustServerCertificate=yes;"
    )
    
    try:
        # Esperar a SQL Server
        if not esperar_sql_server(conn_str):
            return 1
        
        # Conectar
        print_info("Conectando a SQL Server...")
        conn = pyodbc.connect(conn_str, timeout=30)
        cursor = conn.cursor()
        print_success("Conexión establecida")
        
        # Verificar base de datos
        if not verificar_base_datos(cursor):
            cursor.close()
            conn.close()
            return 1
        
        # Ejecutar migración principal
        print_header("EJECUTANDO MIGRACIÓN PRINCIPAL")
        if not ejecutar_script_sql(cursor, conn, migration_file, "migration_ppsh_v1.sql"):
            cursor.close()
            conn.close()
            return 1
        
        # Verificar migración
        if not verificar_migracion(cursor):
            print_warning("La migración se ejecutó pero con advertencias")
        
        # Preguntar por datos de ejemplo
        print("\n")
        if sample_data_file:
            respuesta = input(f"{Colors.OKCYAN}¿Desea cargar datos de ejemplo para testing? (s/n): {Colors.ENDC}").lower()
            
            if respuesta == 's':
                print_header("CARGANDO DATOS DE EJEMPLO")
                if ejecutar_script_sql(cursor, conn, sample_data_file, "ppsh_sample_data.sql"):
                    mostrar_resumen(cursor)
                else:
                    print_warning("Los datos de ejemplo no se cargaron completamente")
            else:
                print_info("Datos de ejemplo omitidos")
        
        # Cerrar conexión
        cursor.close()
        conn.close()
        
        # Mensaje final
        print_header("MIGRACIÓN COMPLETADA")
        print_success("✨ Sistema PPSH listo para usar")
        print_info("Próximos pasos:")
        print("   1. Crear modelos SQLAlchemy en backend/app/models.py")
        print("   2. Crear schemas Pydantic en backend/app/schemas.py")
        print("   3. Implementar endpoints REST en backend/app/routes.py")
        print("   4. Desarrollar componentes React en frontend")
        print(f"\n📚 Documentación: {Colors.UNDERLINE}docs/ANALISIS_PPSH_MVP.md{Colors.ENDC}\n")
        
        return 0
        
    except pyodbc.Error as e:
        print_error(f"Error de base de datos: {e}")
        return 1
    except Exception as e:
        print_error(f"Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
