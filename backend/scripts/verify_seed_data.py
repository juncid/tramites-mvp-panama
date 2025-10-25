#!/usr/bin/env python3
"""
Script para verificar que los datos de prueba se cargaron correctamente
"""

import os
import pyodbc


def main():
    # Conexión a la base de datos
    conn_str = (
        f'DRIVER={{ODBC Driver 18 for SQL Server}};'
        f'SERVER={os.getenv("DATABASE_HOST", "sqlserver")},{os.getenv("DATABASE_PORT", "1433")};'
        f'DATABASE={os.getenv("DATABASE_NAME", "SIM_PANAMA")};'
        f'UID={os.getenv("DATABASE_USER", "sa")};'
        f'PWD={os.getenv("DATABASE_PASSWORD", "YourStrong@Passw0rd")};'
        f'TrustServerCertificate=yes;'
        f'Encrypt=no;'
    )
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        print('='*60)
        print('📋 LISTADO DE TABLAS EN LA BASE DE DATOS')
        print('='*60)
        
        cursor.execute("""
            SELECT TABLE_SCHEMA, TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_SCHEMA, TABLE_NAME
        """)
        
        tables = cursor.fetchall()
        for schema, table in tables:
            print(f'  {schema}.{table}')
        
        print(f'\n📊 Total de tablas: {len(tables)}')
        
        # Verificar datos específicos si las tablas existen
        table_names = [table for schema, table in tables]
        
        print('\n' + '='*60)
        print('📊 CONTEO DE REGISTROS EN TABLAS CLAVE')
        print('='*60)
        
        # Tablas a verificar
        tables_to_check = [
            # PPSH
            ('PPSH_CAUSA_HUMANITARIA', 'Causas Humanitarias PPSH'),
            ('PPSH_ESTADO', 'Estados PPSH'),
            ('PPSH_TIPO_DOCUMENTO', 'Tipos de Documento PPSH'),
            ('PPSH_CONCEPTO_PAGO', 'Conceptos de Pago PPSH'),
            ('PPSH_SOLICITANTE', 'Solicitantes PPSH'),
            ('PPSH_SOLICITUD', 'Solicitudes PPSH'),
            # SIM_FT / Trámites
            ('SIM_FT_TRAMITES', 'Trámites SIM_FT'),
            ('SIM_FT_ESTATUS', 'Estados de Trámites'),
            ('SIM_FT_PRIORIDAD', 'Prioridades'),
            ('SIM_FT_CONCLUSION', 'Conclusiones'),
            # Workflow
            ('workflow', 'Workflows'),
            ('workflow_etapa', 'Etapas de Workflow'),
            ('workflow_conexion', 'Conexiones de Workflow'),
            ('workflow_instancia', 'Instancias de Workflow'),
        ]
        
        for table_name, description in tables_to_check:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
                count = cursor.fetchone()[0]
                print(f'  ✅ {description:30} {count:5} registros')
            except Exception as e:
                print(f'  ⚠️  {description:30} Tabla no existe o error')
        
        print('\n' + '='*60)
        print('🎉 VERIFICACIÓN COMPLETADA')
        print('='*60)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
