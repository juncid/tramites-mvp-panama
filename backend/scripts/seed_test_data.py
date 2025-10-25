#!/usr/bin/env python3
"""
Script para cargar datos de prueba en la base de datos
Ejecuta los scripts SQL de seed para PPSH, Trámites Base y Workflow API

Uso:
    python seed_test_data.py [--ppsh] [--tramites] [--workflow] [--all]

Opciones:
    --ppsh, -p      : Cargar datos de PPSH y SIM_FT (catálogos base)
    --tramites, -t  : Cargar datos de Trámites Base
    --workflow, -w  : Cargar datos de Workflow API
    --all, -a       : Cargar todos los datos de prueba

Archivos SQL ejecutados:
    - seed_sim_ft_test_data.sql         : Catálogos PPSH y datos base
    - update_sim_ft_test_data.sql       : Actualizaciones SIM_FT
    - seed_tramites_base_test_data.sql  : Datos de Trámites Base
    - seed_workflow_test_data.sql       : Datos de Workflow API

Autor: Sistema de Trámites MVP Panamá
Fecha: 2025-10-25
"""

import os
import sys
import argparse
import pyodbc
from pathlib import Path
from typing import Optional


class DatabaseSeeder:
    """Clase para ejecutar scripts de seed en la base de datos"""
    
    def __init__(self):
        self.connection_string = self._build_connection_string()
        self.sql_dir = Path(__file__).parent.parent / 'sql'
        
    def _build_connection_string(self) -> str:
        """Construye la cadena de conexión desde variables de entorno"""
        host = os.getenv('DATABASE_HOST', 'localhost')
        port = os.getenv('DATABASE_PORT', '1433')
        database = os.getenv('DATABASE_NAME', 'TramitesMVP')
        user = os.getenv('DATABASE_USER', 'sa')
        password = os.getenv('DATABASE_PASSWORD', 'YourStrong@Passw0rd')
        
        return (
            f'DRIVER={{ODBC Driver 18 for SQL Server}};'
            f'SERVER={host},{port};'
            f'DATABASE={database};'
            f'UID={user};'
            f'PWD={password};'
            f'TrustServerCertificate=yes;'
            f'Encrypt=no;'
        )
    
    def test_connection(self) -> bool:
        """Prueba la conexión a la base de datos"""
        try:
            print("🔌 Probando conexión a la base de datos...")
            conn = pyodbc.connect(self.connection_string, timeout=10)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            conn.close()
            print("✅ Conexión exitosa")
            return True
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False
    
    def execute_sql_file(self, sql_file: Path) -> bool:
        """Ejecuta un archivo SQL completo"""
        if not sql_file.exists():
            print(f"❌ Archivo no encontrado: {sql_file}")
            return False
        
        print(f"\n{'='*60}")
        print(f"📄 Ejecutando: {sql_file.name}")
        print(f"{'='*60}")
        
        try:
            # Leer el contenido del archivo
            with open(sql_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            # Conectar a la base de datos
            conn = pyodbc.connect(self.connection_string, timeout=30, autocommit=True)
            cursor = conn.cursor()
            
            # Dividir por GO (SQL Server batch separator)
            batches = [batch.strip() for batch in sql_content.split('GO') if batch.strip()]
            
            total_batches = len(batches)
            print(f"📦 Total de batches a ejecutar: {total_batches}")
            
            # Ejecutar cada batch
            for idx, batch in enumerate(batches, 1):
                if not batch or batch.startswith('--'):
                    continue
                
                try:
                    # Capturar mensajes PRINT
                    cursor.execute("SET NOCOUNT OFF")
                    cursor.execute(batch)
                    
                    # Mostrar resultados si hay
                    if cursor.description:
                        rows = cursor.fetchall()
                        if rows:
                            # Imprimir encabezados
                            headers = [column[0] for column in cursor.description]
                            print(f"\n{' | '.join(headers)}")
                            print("-" * 60)
                            # Imprimir filas
                            for row in rows:
                                print(' | '.join(str(val) for val in row))
                    
                    # Capturar mensajes
                    while cursor.nextset():
                        if cursor.description:
                            rows = cursor.fetchall()
                            if rows:
                                for row in rows:
                                    print(' | '.join(str(val) for val in row))
                    
                    # Mostrar progreso
                    if idx % 10 == 0 or idx == total_batches:
                        print(f"⏳ Progreso: {idx}/{total_batches} batches ejecutados")
                
                except pyodbc.Error as e:
                    print(f"⚠️ Warning en batch {idx}: {e}")
                    # Continuar con el siguiente batch
                    continue
            
            cursor.close()
            conn.close()
            
            print(f"\n✅ Archivo ejecutado exitosamente: {sql_file.name}")
            return True
            
        except Exception as e:
            print(f"\n❌ Error ejecutando {sql_file.name}: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def seed_sim_ft(self) -> bool:
        """Carga datos de prueba para SIM_FT (PPSH y catálogos base)"""
        print("\n" + "="*60)
        print("📋 CARGANDO DATOS DE SIM_FT Y PPSH")
        print("="*60)
        sql_file = self.sql_dir / 'seed_sim_ft_test_data.sql'
        return self.execute_sql_file(sql_file)
    
    def update_sim_ft(self) -> bool:
        """Actualiza datos de prueba de SIM_FT"""
        print("\n" + "="*60)
        print("🔄 ACTUALIZANDO DATOS DE SIM_FT")
        print("="*60)
        sql_file = self.sql_dir / 'update_sim_ft_test_data.sql'
        return self.execute_sql_file(sql_file)
    
    def seed_tramites_base(self) -> bool:
        """Carga datos de prueba para Trámites Base API"""
        print("\n" + "="*60)
        print("🏛️  CARGANDO DATOS DE TRÁMITES BASE")
        print("="*60)
        sql_file = self.sql_dir / 'seed_tramites_base_test_data.sql'
        return self.execute_sql_file(sql_file)
    
    def seed_workflow(self) -> bool:
        """Carga datos de prueba para Workflow API"""
        print("\n" + "="*60)
        print("🔄 CARGANDO DATOS DE WORKFLOW API")
        print("="*60)
        sql_file = self.sql_dir / 'seed_workflow_test_data.sql'
        return self.execute_sql_file(sql_file)
    
    def seed_all(self) -> bool:
        """Carga todos los datos de prueba"""
        print("\n" + "🎯"*30)
        print("INICIANDO CARGA COMPLETA DE DATOS DE PRUEBA")
        print("🎯"*30)
        
        success = True
        
        # 1. SIM_FT y PPSH (catálogos y datos base)
        if not self.seed_sim_ft():
            success = False
            print("\n⚠️ Falló la carga de SIM_FT/PPSH, pero continuando...")
        
        # 2. Actualizar datos SIM_FT
        if not self.update_sim_ft():
            success = False
            print("\n⚠️ Falló la actualización de SIM_FT, pero continuando...")
        
        # 3. Trámites Base
        if not self.seed_tramites_base():
            success = False
            print("\n⚠️ Falló la carga de Trámites Base, pero continuando...")
        
        # 4. Workflow
        if not self.seed_workflow():
            success = False
            print("\n⚠️ Falló la carga de Workflow")
        
        return success


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description='Carga datos de prueba en la base de datos',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python seed_test_data.py --all          # Carga todos los datos
  python seed_test_data.py --ppsh         # Solo PPSH y SIM_FT
  python seed_test_data.py --tramites     # Solo trámites base
  python seed_test_data.py --workflow     # Solo workflow
  python seed_test_data.py -p -t -w       # Combinación (forma corta)
        """
    )
    
    parser.add_argument(
        '--ppsh', '-p',
        action='store_true',
        help='Cargar datos de PPSH y SIM_FT (catálogos base)'
    )
    parser.add_argument(
        '--tramites', '-t',
        action='store_true',
        help='Cargar datos de Trámites Base'
    )
    parser.add_argument(
        '--workflow', '-w',
        action='store_true',
        help='Cargar datos de Workflow API'
    )
    parser.add_argument(
        '--all', '-a',
        action='store_true',
        help='Cargar todos los datos de prueba (PPSH, Trámites, Workflow)'
    )
    
    args = parser.parse_args()
    
    # Si no se especifica ninguna opción, mostrar ayuda
    if not (args.ppsh or args.tramites or args.workflow or args.all):
        parser.print_help()
        print("\n⚠️ Debe especificar al menos una opción: --ppsh, --tramites, --workflow, o --all")
        sys.exit(1)
    
    # Crear instancia del seeder
    seeder = DatabaseSeeder()
    
    # Probar conexión
    if not seeder.test_connection():
        print("\n❌ No se pudo conectar a la base de datos. Verifique:")
        print("   - Que el servidor SQL Server esté en ejecución")
        print("   - Las variables de entorno de conexión")
        print("   - Los permisos del usuario")
        sys.exit(1)
    
    # Ejecutar según opciones
    success = True
    
    if args.all:
        success = seeder.seed_all()
    else:
        if args.ppsh:
            if not seeder.seed_sim_ft():
                success = False
            if not seeder.update_sim_ft():
                success = False
        
        if args.tramites:
            if not seeder.seed_tramites_base():
                success = False
        
        if args.workflow:
            if not seeder.seed_workflow():
                success = False
    
    # Resultado final
    print("\n" + "="*60)
    if success:
        print("✅ ¡DATOS DE PRUEBA CARGADOS EXITOSAMENTE!")
        print("="*60)
        print("\n📋 Próximos pasos:")
        print("   1. Importar colecciones Postman desde: backend/postman/")
        print("   2. Configurar environment variables en Postman")
        print("   3. Ejecutar las colecciones para validar los datos")
        print("\n📚 Datos cargados:")
        if args.all or args.ppsh:
            print("   ✅ PPSH - Catálogos y datos base (27 catálogos, 6 registros ejemplo)")
        if args.all or args.tramites:
            print("   ✅ Trámites Base - Tipos, estados, prioridades")
        if args.all or args.workflow:
            print("   ✅ Workflow - 2 workflows completos (PPSH + General)")
        print("\n📖 Consulte: backend/sql/README.md para más información")
        sys.exit(0)
    else:
        print("⚠️ COMPLETADO CON ADVERTENCIAS")
        print("="*60)
        print("\n⚠️ Algunos scripts no se ejecutaron correctamente.")
        print("   Revise los mensajes de error anteriores.")
        sys.exit(1)


if __name__ == "__main__":
    main()
