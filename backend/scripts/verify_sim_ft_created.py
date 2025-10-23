"""
Script para verificar tablas SIM_FT_* creadas
"""

import sys
import os

# Añadir el directorio app al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import urllib

def main():
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
            # Buscar tablas SIM_FT_*
            result = conn.execute(text(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES "
                "WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'SIM_FT_%' "
                "ORDER BY TABLE_NAME"
            ))
            sim_ft_tables = [row[0] for row in result]

            print("=== VERIFICACIÓN DE TABLAS SIM_FT_* ===\n")

            # Tablas esperadas
            expected_tables = [
                'SIM_FT_CONCLUSION',
                'SIM_FT_DEPENDTE_CIERRE',
                'SIM_FT_ESTATUS',
                'SIM_FT_PASOS',
                'SIM_FT_PASOXTRAM',
                'SIM_FT_PRIORIDAD',
                'SIM_FT_TRAMITE_CIERRE',
                'SIM_FT_TRAMITE_D',
                'SIM_FT_TRAMITE_E',
                'SIM_FT_TRAMITES',
                'SIM_FT_USUA_SEC'
            ]

            print("📋 TABLAS ESPERADAS vs ENCONTRADAS:")
            found_count = 0

            for table in expected_tables:
                if table in sim_ft_tables:
                    print(f"  ✅ {table}")
                    found_count += 1
                else:
                    print(f"  ❌ {table} (FALTANTE)")

            print(f"\n📊 RESULTADO: {found_count}/{len(expected_tables)} tablas SIM_FT_* encontradas")

            # Verificar que la tabla tramites ya no existe
            result = conn.execute(text(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES "
                "WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'tramites'"
            ))
            tramites_count = result.scalar()

            if tramites_count == 0:
                print("✅ Tabla 'tramites' correctamente renombrada a 'SIM_FT_TRAMITES'")
            else:
                print("❌ Tabla 'tramites' aún existe")

            # Mostrar todas las tablas SIM_FT_* encontradas
            if sim_ft_tables:
                print(f"\n📋 LISTADO COMPLETO DE TABLAS SIM_FT_*:")
                for table in sim_ft_tables:
                    print(f"  • {table}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()