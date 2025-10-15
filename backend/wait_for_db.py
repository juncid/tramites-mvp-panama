#!/usr/bin/env python3
"""
Script para esperar a que la base de datos esté completamente lista.
Verifica la conexión y que las tablas base estén creadas.
"""
import sys
import time
import pyodbc
from app.config import settings

def wait_for_database(max_attempts: int = 30, delay: int = 3) -> bool:
    """
    Espera hasta que la base de datos esté lista y accesible.
    
    Args:
        max_attempts: Número máximo de intentos
        delay: Segundos entre intentos
        
    Returns:
        True si la base de datos está lista, False si se agotaron los intentos
    """
    connection_string = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={settings.database_host},{settings.database_port};"
        f"DATABASE={settings.database_name};"
        f"UID={settings.database_user};"
        f"PWD={settings.database_password};"
        f"TrustServerCertificate=yes;"
        f"Connection Timeout=30;"
    )
    
    print(f"🔍 Verificando disponibilidad de la base de datos {settings.database_name}...")
    print(f"   Host: {settings.database_host}:{settings.database_port}")
    
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"   Intento {attempt}/{max_attempts}...", end=" ")
            
            # Intentar conectar
            conn = pyodbc.connect(connection_string, timeout=5)
            cursor = conn.cursor()
            
            # Verificar que podemos ejecutar queries
            cursor.execute("SELECT 1 as test")
            result = cursor.fetchone()
            
            if result[0] != 1:
                print("❌ Query de prueba falló")
                cursor.close()
                conn.close()
                time.sleep(delay)
                continue
            
            # Verificar que la base de datos SIM_PANAMA existe
            cursor.execute("SELECT DB_NAME()")
            db_name = cursor.fetchone()[0]
            
            if db_name != settings.database_name:
                print(f"❌ Base de datos incorrecta: {db_name}")
                cursor.close()
                conn.close()
                time.sleep(delay)
                continue
            
            # Verificar que existe al menos una tabla (señal de que db-init completó)
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE'
                AND TABLE_SCHEMA = 'dbo'
            """)
            table_count = cursor.fetchone()[0]
            
            if table_count == 0:
                print(f"⚠️  Base de datos existe pero sin tablas (db-init aún no completa)")
                cursor.close()
                conn.close()
                time.sleep(delay)
                continue
            
            # Todo está bien
            print(f"✅ Base de datos lista ({table_count} tablas encontradas)")
            cursor.close()
            conn.close()
            
            print(f"✅ Base de datos {settings.database_name} está completamente operativa")
            return True
            
        except pyodbc.Error as e:
            error_msg = str(e)
            if "Cannot open database" in error_msg:
                print(f"⚠️  Base de datos aún no existe")
            elif "Login failed" in error_msg:
                print(f"❌ Error de autenticación")
            elif "Unable to connect" in error_msg or "timeout" in error_msg.lower():
                print(f"⚠️  No se puede conectar al servidor")
            else:
                print(f"❌ Error: {error_msg[:100]}")
            
            if attempt < max_attempts:
                time.sleep(delay)
            
        except Exception as e:
            print(f"❌ Error inesperado: {type(e).__name__}: {str(e)[:100]}")
            if attempt < max_attempts:
                time.sleep(delay)
    
    print(f"\n❌ No se pudo verificar la base de datos después de {max_attempts} intentos")
    return False


def verify_base_tables() -> bool:
    """
    Verifica que las tablas base del sistema estén creadas.
    
    Returns:
        True si las tablas existen, False en caso contrario
    """
    connection_string = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={settings.database_host},{settings.database_port};"
        f"DATABASE={settings.database_name};"
        f"UID={settings.database_user};"
        f"PWD={settings.database_password};"
        f"TrustServerCertificate=yes;"
    )
    
    required_tables = [
        'SEG_TB_USUARIOS',
        'SIM_GE_PAIS',
        'SIM_GE_AGENCIA',
        'tramites',
        'SEG_TB_ROLES'
    ]
    
    print(f"\n🔍 Verificando tablas base del sistema...")
    
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        for table_name in required_tables:
            cursor.execute(f"""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = '{table_name}'
                AND TABLE_SCHEMA = 'dbo'
            """)
            exists = cursor.fetchone()[0] > 0
            
            status = "✅" if exists else "❌"
            print(f"   {status} {table_name}")
            
            if not exists:
                cursor.close()
                conn.close()
                print(f"\n❌ Tabla {table_name} no encontrada. db-init puede no haber completado correctamente.")
                return False
        
        cursor.close()
        conn.close()
        
        print(f"✅ Todas las tablas base verificadas correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error al verificar tablas: {e}")
        return False


if __name__ == "__main__":
    print("=" * 70)
    print("🏥 VERIFICACIÓN DE SALUD DE BASE DE DATOS")
    print("=" * 70)
    
    # Esperar a que la base de datos esté disponible
    if not wait_for_database(max_attempts=30, delay=3):
        print("\n❌ FALLO: La base de datos no está disponible")
        sys.exit(1)
    
    # Verificar que las tablas base existan
    if not verify_base_tables():
        print("\n❌ FALLO: Las tablas base no están completas")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("✅ VERIFICACIÓN COMPLETADA: Base de datos lista para migraciones")
    print("=" * 70)
    sys.exit(0)
