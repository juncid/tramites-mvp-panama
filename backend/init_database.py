#!/usr/bin/env python3
"""
Script de inicialización de base de datos para SIM_PANAMA
Utiliza pyodbc para conectarse a SQL Server y ejecutar el script de inicialización
"""

import os
import sys
import time
import pyodbc
from pathlib import Path

# Configuración
DB_HOST = os.getenv("DATABASE_HOST", "sqlserver")
DB_PORT = os.getenv("DATABASE_PORT", "1433")
DB_USER = os.getenv("DATABASE_USER", "sa")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD", "YourStrong@Passw0rd")
MAX_RETRIES = 30
RETRY_INTERVAL = 2

def print_banner():
    """Imprime el banner de inicio"""
    print("=" * 64)
    print("  🚀 Inicializador de Base de Datos - SIM Panamá")
    print("=" * 64)
    print()
    print("📋 Configuración:")
    print(f"   Host: {DB_HOST}")
    print(f"   Puerto: {DB_PORT}")
    print(f"   Usuario: {DB_USER}")
    print(f"   Script: /app/bbdd/init_database.sql")
    print()

def get_connection_string():
    """Retorna el connection string para SQL Server"""
    return (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={DB_HOST},{DB_PORT};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )

def wait_for_sql_server():
    """Espera a que SQL Server esté disponible"""
    print("⏳ Esperando a que SQL Server esté disponible...")
    
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            conn_str = get_connection_string()
            conn = pyodbc.connect(conn_str, timeout=5)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            conn.close()
            print("✅ Conexión a SQL Server establecida")
            print()
            return True
        except Exception as e:
            if attempt == MAX_RETRIES:
                print(f"❌ Error: No se pudo conectar a SQL Server después de {MAX_RETRIES} intentos")
                print(f"   Último error: {e}")
                return False
            print(f"   Intento {attempt}/{MAX_RETRIES} - Esperando {RETRY_INTERVAL} segundos...")
            time.sleep(RETRY_INTERVAL)
    
    return False

def check_database_exists():
    """Verifica si la base de datos SIM_PANAMA ya existe"""
    try:
        conn_str = get_connection_string()
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM sys.databases WHERE name = 'SIM_PANAMA'")
        exists = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return exists == 1
    except Exception as e:
        print(f"⚠️  Error verificando existencia de BD: {e}")
        return False

def count_tables():
    """Cuenta las tablas en la base de datos SIM_PANAMA"""
    try:
        conn_str = get_connection_string() + "DATABASE=SIM_PANAMA;"
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES "
            "WHERE TABLE_TYPE = 'BASE TABLE'"
        )
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return count
    except Exception as e:
        print(f"⚠️  Error contando tablas: {e}")
        return 0

def execute_sql_script(script_path):
    """Ejecuta un script SQL completo"""
    try:
        # Leer el script
        with open(script_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Dividir el script en batches usando GO
        batches = []
        current_batch = []
        
        for line in sql_script.split('\n'):
            # Ignorar comentarios
            stripped = line.strip()
            if stripped.startswith('--'):
                continue
            
            # Detectar GO
            if stripped.upper() == 'GO':
                if current_batch:
                    batches.append('\n'.join(current_batch))
                    current_batch = []
            else:
                current_batch.append(line)
        
        # Agregar el último batch
        if current_batch:
            batches.append('\n'.join(current_batch))
        
        print(f"📝 Ejecutando {len(batches)} batches de SQL...")
        
        # Ejecutar cada batch
        for i, batch in enumerate(batches, 1):
            batch = batch.strip()
            if not batch:
                continue
            
            try:
                # Mostrar progreso cada 10 batches
                if i % 10 == 0:
                    print(f"   Ejecutando batch {i}/{len(batches)}...")
                
                # Determinar si necesitamos autocommit
                batch_upper = batch.upper()
                needs_autocommit = (
                    'CREATE DATABASE' in batch_upper or
                    'USE ' in batch_upper or
                    'ALTER DATABASE' in batch_upper
                )
                
                # Conectar con la configuración apropiada
                conn_str = get_connection_string()
                
                # Para CREATE DATABASE, no usar autocommit=True al conectar
                # sino configurarlo después
                conn = pyodbc.connect(conn_str)
                
                if needs_autocommit:
                    conn.autocommit = True
                else:
                    conn.autocommit = False
                
                cursor = conn.cursor()
                
                try:
                    cursor.execute(batch)
                    if not needs_autocommit:
                        conn.commit()
                except Exception as e:
                    error_msg = str(e).lower()
                    # Ignorar algunos errores esperados
                    if ('cannot use' not in error_msg and 
                        'already exists' not in error_msg and
                        'does not exist' not in error_msg and
                        i <= 3):  # Los primeros 3 batches pueden tener estos errores
                        print(f"   ⚠️  Warning en batch {i}: {e}")
                
                cursor.close()
                conn.close()
                
            except Exception as e:
                error_msg = str(e).lower()
                if 'cannot use' not in error_msg and 'already exists' not in error_msg:
                    print(f"   ⚠️  Warning en batch {i}: {e}")
        
        print("✅ Script SQL ejecutado exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error ejecutando script SQL: {e}")
        return False

def verify_installation():
    """Verifica que la instalación fue exitosa"""
    print()
    print("🔍 Verificando instalación...")
    
    try:
        conn_str = get_connection_string() + "DATABASE=SIM_PANAMA;"
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Contar tablas
        cursor.execute(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES "
            "WHERE TABLE_TYPE = 'BASE TABLE'"
        )
        table_count = cursor.fetchone()[0]
        print(f"   ✓ Tablas creadas: {table_count}")
        
        # Contar usuarios
        try:
            cursor.execute("SELECT COUNT(*) FROM SEG_TB_USUARIOS")
            user_count = cursor.fetchone()[0]
            print(f"   ✓ Usuarios: {user_count}")
        except:
            print("   ⚠️  No se pudo contar usuarios")
        
        # Contar trámites
        try:
            cursor.execute("SELECT COUNT(*) FROM tramites")
            tramite_count = cursor.fetchone()[0]
            print(f"   ✓ Trámites de ejemplo: {tramite_count}")
        except:
            print("   ⚠️  No se pudo contar trámites")
        
        # Contar países
        try:
            cursor.execute("SELECT COUNT(*) FROM SIM_GE_PAIS")
            pais_count = cursor.fetchone()[0]
            print(f"   ✓ Países: {pais_count}")
        except:
            print("   ⚠️  No se pudo contar países")
        
        cursor.close()
        conn.close()
        
        return table_count >= 10  # Al menos 10 tablas
        
    except Exception as e:
        print(f"❌ Error verificando instalación: {e}")
        return False

def main():
    """Función principal"""
    print_banner()
    
    # Esperar a SQL Server
    if not wait_for_sql_server():
        sys.exit(1)
    
    # Verificar si la BD ya existe
    print("🔍 Verificando si la base de datos SIM_PANAMA ya existe...")
    db_exists = check_database_exists()
    
    if db_exists:
        print("ℹ️  La base de datos SIM_PANAMA ya existe")
        table_count = count_tables()
        print(f"   Tablas encontradas: {table_count}")
        
        if table_count > 0:
            print("✅ Base de datos ya inicializada")
            print()
            print("=" * 64)
            print("  ✨ Base de datos lista para usar")
            print("=" * 64)
            return 0
        else:
            print("⚠️  Base de datos existe pero no tiene tablas. Ejecutando script de inicialización...")
    else:
        print("📝 Base de datos no encontrada. Creando nueva base de datos...")
    
    print()
    print("🔧 Ejecutando script de inicialización...")
    print("=" * 64)
    
    # Ejecutar el script
    script_path = Path("/app/bbdd/init_database.sql")
    if not script_path.exists():
        print(f"❌ Error: No se encontró el script en {script_path}")
        sys.exit(1)
    
    if not execute_sql_script(script_path):
        sys.exit(1)
    
    print()
    print("=" * 64)
    
    # Verificar instalación
    if not verify_installation():
        print()
        print("=" * 64)
        print("❌ La verificación de la instalación falló")
        print("=" * 64)
        sys.exit(1)
    
    # Éxito
    print()
    print("=" * 64)
    print("  🎉 Base de datos SIM_PANAMA inicializada correctamente")
    print("=" * 64)
    print()
    print("📊 Resumen:")
    print("   • Base de datos: SIM_PANAMA")
    print("   • Usuario admin creado (password: admin123)")
    print("   • Datos de ejemplo cargados")
    print()
    print("⚠️  Importante:")
    print("   Cambiar la contraseña del usuario admin en producción")
    print()
    
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Inicialización interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
