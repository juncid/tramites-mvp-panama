"""
Script para verificar que los datos de prueba se cargaron correctamente.
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuración de la base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mssql+pyodbc://sa:TestP@ssw0rd2025!@db-test:1433/SIM_PANAMA?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
)

def verify_test_data():
    """Verifica todos los datos de prueba"""
    print("=" * 70)
    print("🔍 VERIFICACIÓN DE DATOS DE PRUEBA")
    print("=" * 70)
    
    try:
        engine = create_engine(DATABASE_URL, echo=False)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        print(f"\n✅ Conectado a: {DATABASE_URL.split('@')[1].split('?')[0]}\n")
        
        # Definir verificaciones
        checks = [
            {
                "name": "📦 Catálogos PPSH",
                "queries": [
                    ("Causas Humanitarias", "SELECT COUNT(*) FROM PPSH_CAUSA_HUMANITARIA", 7),
                    ("Tipos de Documento", "SELECT COUNT(*) FROM PPSH_TIPO_DOCUMENTO", 8),
                    ("Estados", "SELECT COUNT(*) FROM PPSH_ESTADO", 9),
                    ("Conceptos de Pago", "SELECT COUNT(*) FROM PPSH_CONCEPTO_PAGO", 3),
                ]
            },
            {
                "name": "👥 Datos de Ejemplo PPSH",
                "queries": [
                    ("Solicitantes", "SELECT COUNT(*) FROM PPSH_SOLICITANTE", 3),
                    ("Solicitudes", "SELECT COUNT(*) FROM PPSH_SOLICITUD", 3),
                ]
            },
            {
                "name": "🔄 Workflows",
                "queries": [
                    ("Workflows", "SELECT COUNT(*) FROM workflow", 2),
                    ("Etapas", "SELECT COUNT(*) FROM workflow_etapa", 8),
                    ("Conexiones", "SELECT COUNT(*) FROM workflow_conexion", 6),
                ]
            },
            {
                "name": "📋 Datos Base (Iniciales)",
                "queries": [
                    ("Trámites", "SELECT COUNT(*) FROM tramites WHERE activo=1", ">=5"),
                    ("Usuarios", "SELECT COUNT(*) FROM SEG_TB_USUARIOS", ">=1"),
                    ("Países", "SELECT COUNT(*) FROM SIM_GE_PAIS", ">=7"),
                ]
            }
        ]
        
        total_checks = 0
        passed_checks = 0
        failed_checks = []
        
        for section in checks:
            print(f"{section['name']}")
            print("-" * 70)
            
            for name, query, expected in section['queries']:
                total_checks += 1
                try:
                    result = session.execute(text(query))
                    count = result.fetchone()[0]
                    
                    # Verificar el resultado
                    if isinstance(expected, str) and expected.startswith(">="):
                        min_expected = int(expected[2:])
                        status = "✅" if count >= min_expected else "❌"
                        passed = count >= min_expected
                        expected_str = f"≥{min_expected}"
                    else:
                        status = "✅" if count == expected else "❌"
                        passed = count == expected
                        expected_str = str(expected)
                    
                    if passed:
                        passed_checks += 1
                        print(f"  {status} {name:30s}: {count:3d} (esperado: {expected_str})")
                    else:
                        print(f"  {status} {name:30s}: {count:3d} (esperado: {expected_str}) ⚠️")
                        failed_checks.append({
                            'section': section['name'],
                            'name': name,
                            'count': count,
                            'expected': expected_str
                        })
                        
                except Exception as e:
                    print(f"  ❌ {name:30s}: ERROR - {e}")
                    failed_checks.append({
                        'section': section['name'],
                        'name': name,
                        'error': str(e)
                    })
            
            print()
        
        # Queries adicionales de detalle
        print("=" * 70)
        print("📊 DETALLES DE DATOS")
        print("=" * 70)
        
        # Listar causas humanitarias
        print("\n📌 Causas Humanitarias Cargadas:")
        result = session.execute(text("""
            SELECT cod_causa, nombre 
            FROM PPSH_CAUSA_HUMANITARIA 
            WHERE activo = 1
            ORDER BY cod_causa
        """))
        for row in result:
            print(f"   • {row[0]}: {row[1]}")
        
        # Listar estados
        print("\n📌 Estados PPSH Cargados:")
        result = session.execute(text("""
            SELECT cod_estado, nombre, orden 
            FROM PPSH_ESTADO 
            ORDER BY orden
        """))
        for row in result:
            print(f"   {row[2]}. {row[0]}: {row[1]}")
        
        # Listar solicitudes
        print("\n📌 Solicitudes PPSH de Ejemplo:")
        result = session.execute(text("""
            SELECT 
                s.numero_solicitud,
                sol.nombres + ' ' + sol.apellido_paterno AS solicitante,
                c.nombre AS causa,
                e.nombre AS estado
            FROM PPSH_SOLICITUD s
            JOIN PPSH_SOLICITANTE sol ON s.id_solicitante = sol.id_solicitante
            JOIN PPSH_CAUSA_HUMANITARIA c ON s.cod_causa_humanitaria = c.cod_causa
            JOIN PPSH_ESTADO e ON s.cod_estado = e.cod_estado
            ORDER BY s.numero_solicitud
        """))
        for row in result:
            print(f"   • {row[0]}: {row[1]} - {row[2]} [{row[3]}]")
        
        # Listar workflows
        print("\n📌 Workflows Configurados:")
        result = session.execute(text("""
            SELECT 
                w.codigo,
                w.nombre,
                COUNT(DISTINCT e.id_etapa) AS num_etapas,
                COUNT(DISTINCT c.id_conexion) AS num_conexiones
            FROM workflow w
            LEFT JOIN workflow_etapa e ON w.id_workflow = e.id_workflow
            LEFT JOIN workflow_conexion c ON w.id_workflow = c.id_workflow
            WHERE w.activo = 1
            GROUP BY w.codigo, w.nombre
            ORDER BY w.codigo
        """))
        for row in result:
            print(f"   • {row[0]}: {row[1]} ({row[2]} etapas, {row[3]} conexiones)")
        
        # Resumen final
        print("\n" + "=" * 70)
        print("📈 RESUMEN DE VERIFICACIÓN")
        print("=" * 70)
        print(f"✅ Verificaciones pasadas: {passed_checks}/{total_checks}")
        print(f"❌ Verificaciones fallidas: {len(failed_checks)}/{total_checks}")
        
        if failed_checks:
            print("\n⚠️  Verificaciones que fallaron:")
            for fail in failed_checks:
                if 'error' in fail:
                    print(f"   • {fail['section']} - {fail['name']}: {fail['error']}")
                else:
                    print(f"   • {fail['section']} - {fail['name']}: {fail['count']} (esperado: {fail['expected']})")
        
        print("\n" + "=" * 70)
        
        if passed_checks == total_checks:
            print("✅ TODOS LOS DATOS DE PRUEBA ESTÁN CORRECTOS")
            print("=" * 70)
            session.close()
            engine.dispose()
            return 0
        else:
            print("⚠️  ALGUNOS DATOS ESTÁN INCOMPLETOS O FALTANTES")
            print("=" * 70)
            print("\n💡 Solución: Ejecuta 'python scripts/load_test_data.py' para cargar datos")
            session.close()
            engine.dispose()
            return 1
            
    except Exception as e:
        print(f"\n❌ Error durante la verificación: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(verify_test_data())
