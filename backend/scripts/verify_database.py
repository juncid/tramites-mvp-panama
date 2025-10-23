"""
Script de verificación de base de datos
Verifica la conexión y estructura de la base de datos SIM_PANAMA
"""

import sys
import os
from datetime import datetime

# Añadir el directorio app al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
import urllib

def print_section(title):
    """Imprime un título de sección"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_connection():
    """Prueba la conexión a la base de datos"""
    print_section("TEST 1: Verificación de Conexión")
    
    try:
        from app.infrastructure.config import settings
        
        # Construir connection string
        params = urllib.parse.quote_plus(
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={settings.database_host},{settings.database_port};"
            f"DATABASE={settings.database_name};"
            f"UID={settings.database_user};"
            f"PWD={settings.database_password};"
            f"TrustServerCertificate=yes;"
        )
        
        database_url = f"mssql+pyodbc:///?odbc_connect={params}"
        engine = create_engine(database_url, echo=False)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT @@VERSION"))
            version = result.fetchone()[0]
            print(f"✅ Conexión exitosa!")
            print(f"📊 Servidor: {settings.database_host}")
            print(f"📊 Base de datos: {settings.database_name}")
            print(f"📊 Versión SQL Server:")
            print(f"   {version[:100]}...")
            
        return engine
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def verify_tables(engine):
    """Verifica que las tablas existen"""
    print_section("TEST 2: Verificación de Tablas")
    
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = [
            'tramites',
            'SEG_TB_USUARIOS',
            'SEG_TB_ROLES',
            'SEG_TB_USUA_ROLE',
            'SIM_GE_SEXO',
            'SIM_GE_EST_CIVIL',
            'SIM_GE_VIA_TRANSP',
            'SIM_GE_TIPO_MOV',
            'SIM_GE_CONTINENTE',
            'SIM_GE_PAIS',
            'SIM_GE_REGION',
            'SIM_GE_AGENCIA',
            'SIM_GE_SECCION'
        ]
        
        print(f"📊 Total de tablas en BD: {len(tables)}")
        print(f"📊 Tablas esperadas: {len(expected_tables)}")
        
        missing_tables = [t for t in expected_tables if t not in tables]
        extra_tables = [t for t in tables if t not in expected_tables]
        
        if not missing_tables:
            print(f"✅ Todas las tablas esperadas existen")
        else:
            print(f"⚠️  Tablas faltantes: {', '.join(missing_tables)}")
        
        if extra_tables:
            print(f"📝 Tablas adicionales: {len(extra_tables)}")
        
        print("\n📋 Lista de tablas:")
        for i, table in enumerate(sorted(tables), 1):
            status = "✓" if table in expected_tables else " "
            print(f"  [{status}] {i:2d}. {table}")
        
        return len(missing_tables) == 0
    except Exception as e:
        print(f"❌ Error verificando tablas: {e}")
        return False

def verify_data(engine):
    """Verifica que hay datos iniciales"""
    print_section("TEST 3: Verificación de Datos Iniciales")
    
    queries = [
        ("Trámites", "SELECT COUNT(*) FROM tramites"),
        ("Usuarios", "SELECT COUNT(*) FROM SEG_TB_USUARIOS"),
        ("Roles", "SELECT COUNT(*) FROM SEG_TB_ROLES"),
        ("Países", "SELECT COUNT(*) FROM SIM_GE_PAIS"),
        ("Agencias", "SELECT COUNT(*) FROM SIM_GE_AGENCIA"),
        ("Regiones", "SELECT COUNT(*) FROM SIM_GE_REGION"),
    ]
    
    try:
        with engine.connect() as conn:
            all_ok = True
            for name, query in queries:
                result = conn.execute(text(query))
                count = result.scalar()
                status = "✅" if count > 0 else "⚠️ "
                print(f"{status} {name}: {count} registros")
                if count == 0:
                    all_ok = False
            
            return all_ok
    except Exception as e:
        print(f"❌ Error verificando datos: {e}")
        return False

def verify_admin_user(engine):
    """Verifica que el usuario admin existe"""
    print_section("TEST 4: Verificación de Usuario Admin")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT USER_ID, NOM_USUARIO, EMAIL_USUARIO, ACTIVO "
                "FROM SEG_TB_USUARIOS WHERE USER_ID = 'admin'"
            ))
            user = result.fetchone()
            
            if user:
                print(f"✅ Usuario admin encontrado")
                print(f"   Usuario: {user[0]}")
                print(f"   Nombre: {user[1]}")
                print(f"   Email: {user[2]}")
                print(f"   Activo: {'Sí' if user[3] else 'No'}")
                print(f"\n⚠️  Recuerda cambiar la contraseña por defecto (admin123)")
                return True
            else:
                print(f"❌ Usuario admin no encontrado")
                return False
    except Exception as e:
        print(f"❌ Error verificando usuario admin: {e}")
        return False

def verify_views(engine):
    """Verifica que las vistas existen"""
    print_section("TEST 5: Verificación de Vistas")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS "
                "ORDER BY TABLE_NAME"
            ))
            views = [row[0] for row in result]
            
            print(f"📊 Total de vistas: {len(views)}")
            
            if views:
                for i, view in enumerate(views, 1):
                    print(f"  {i}. {view}")
                
                # Probar vista principal
                result = conn.execute(text("SELECT COUNT(*) FROM VW_TRAMITES_ACTIVOS"))
                count = result.scalar()
                print(f"\n✅ Vista VW_TRAMITES_ACTIVOS funcionando ({count} registros)")
                return True
            else:
                print("⚠️  No se encontraron vistas")
                return False
    except Exception as e:
        print(f"❌ Error verificando vistas: {e}")
        return False

def verify_procedures(engine):
    """Verifica que los procedimientos almacenados existen"""
    print_section("TEST 6: Verificación de Procedimientos Almacenados")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES "
                "WHERE ROUTINE_TYPE = 'PROCEDURE' "
                "ORDER BY ROUTINE_NAME"
            ))
            procedures = [row[0] for row in result]
            
            print(f"📊 Total de procedimientos: {len(procedures)}")
            
            expected_procs = ['SP_GET_TRAMITES', 'SP_INSERT_TRAMITE']
            
            if procedures:
                for i, proc in enumerate(procedures, 1):
                    status = "✓" if proc in expected_procs else " "
                    print(f"  [{status}] {i}. {proc}")
                
                # Probar procedimiento
                result = conn.execute(text("EXEC SP_GET_TRAMITES"))
                tramites = result.fetchall()
                print(f"\n✅ SP_GET_TRAMITES funcionando ({len(tramites)} trámites)")
                return True
            else:
                print("⚠️  No se encontraron procedimientos almacenados")
                return False
    except Exception as e:
        print(f"❌ Error verificando procedimientos: {e}")
        return False

def performance_test(engine):
    """Prueba de rendimiento básica"""
    print_section("TEST 7: Prueba de Rendimiento")
    
    try:
        with engine.connect() as conn:
            # Test 1: Query simple
            start = datetime.now()
            conn.execute(text("SELECT COUNT(*) FROM tramites"))
            duration1 = (datetime.now() - start).total_seconds() * 1000
            
            # Test 2: Query con JOIN
            start = datetime.now()
            conn.execute(text(
                "SELECT u.USER_ID, r.NOM_ROLE "
                "FROM SEG_TB_USUARIOS u "
                "INNER JOIN SEG_TB_USUA_ROLE ur ON u.USER_ID = ur.USER_ID "
                "INNER JOIN SEG_TB_ROLES r ON ur.COD_ROLE = r.COD_ROLE"
            ))
            duration2 = (datetime.now() - start).total_seconds() * 1000
            
            # Test 3: Query compleja
            start = datetime.now()
            conn.execute(text(
                "SELECT a.NOM_AGENCIA, r.NOM_REGION, vt.NOM_VIA_TRANSP "
                "FROM SIM_GE_AGENCIA a "
                "LEFT JOIN SIM_GE_REGION r ON a.COD_REGION = r.COD_REGION "
                "LEFT JOIN SIM_GE_VIA_TRANSP vt ON a.COD_VIA_TRANSP = vt.COD_VIA_TRANSP"
            ))
            duration3 = (datetime.now() - start).total_seconds() * 1000
            
            print(f"✅ Query simple: {duration1:.2f} ms")
            print(f"✅ Query con JOIN: {duration2:.2f} ms")
            print(f"✅ Query compleja: {duration3:.2f} ms")
            
            if duration1 < 100 and duration2 < 200 and duration3 < 300:
                print(f"\n✅ Rendimiento excelente!")
                return True
            elif duration1 < 500 and duration2 < 1000 and duration3 < 1500:
                print(f"\n⚠️  Rendimiento aceptable")
                return True
            else:
                print(f"\n❌ Rendimiento bajo - considerar optimizaciones")
                return False
    except Exception as e:
        print(f"❌ Error en prueba de rendimiento: {e}")
        return False

def generate_report(results):
    """Genera un reporte final"""
    print_section("RESUMEN FINAL")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r)
    failed_tests = total_tests - passed_tests
    
    print(f"\n📊 Tests ejecutados: {total_tests}")
    print(f"✅ Tests exitosos: {passed_tests}")
    print(f"❌ Tests fallidos: {failed_tests}")
    print(f"📈 Porcentaje de éxito: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\n📋 Detalle de tests:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    if failed_tests == 0:
        print("\n" + "🎉 " * 20)
        print("  ¡TODOS LOS TESTS PASARON EXITOSAMENTE!")
        print("  La base de datos está correctamente configurada.")
        print("🎉 " * 20)
        return True
    else:
        print("\n" + "⚠️ " * 20)
        print("  ALGUNOS TESTS FALLARON")
        print("  Revisa la documentación en backend/bbdd/README.md")
        print("⚠️ " * 20)
        return False

def main():
    """Función principal"""
    print("\n" + "🔍 " * 25)
    print("  SCRIPT DE VERIFICACIÓN DE BASE DE DATOS")
    print("  Sistema de Trámites Migratorios de Panamá")
    print("  Fecha: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("🔍 " * 25)
    
    results = {}
    
    # Test 1: Conexión
    engine = test_connection()
    results['Conexión'] = engine is not None
    
    if not engine:
        print("\n❌ No se pudo conectar a la base de datos")
        print("Verifica la configuración en backend/.env")
        return False
    
    # Tests restantes
    results['Tablas'] = verify_tables(engine)
    results['Datos'] = verify_data(engine)
    results['Usuario Admin'] = verify_admin_user(engine)
    results['Vistas'] = verify_views(engine)
    results['Procedimientos'] = verify_procedures(engine)
    results['Rendimiento'] = performance_test(engine)
    
    # Reporte final
    success = generate_report(results)
    
    print("\n" + "="*60)
    print("  Verificación completada")
    print("="*60 + "\n")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Verificación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
