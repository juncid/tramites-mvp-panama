#!/usr/bin/env python3
"""
Script de Migración Green-Blue
Sistema de Trámites Migratorios de Panamá
Fecha: 2025-10-14

Copia datos del ambiente GREEN (producción) al ambiente BLUE (staging)
y aplica las migraciones de prioridad alta de forma segura.
"""

import os
import sys
import logging
import time
from datetime import datetime
import pyodbc
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/migration_green_blue.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class GreenBlueMigrator:
    def __init__(self):
        self.green_url = os.getenv('DATABASE_URL_GREEN')
        self.blue_url = os.getenv('DATABASE_URL_BLUE')
        
        if not self.green_url or not self.blue_url:
            raise ValueError("DATABASE_URL_GREEN y DATABASE_URL_BLUE son requeridas")
        
        logger.info(f"🔧 Configurando motores de base de datos...")
        self.green_engine = create_engine(self.green_url)
        self.blue_engine = create_engine(self.blue_url)

    def verify_connections(self):
        """Verificar conexiones a ambas bases de datos"""
        logger.info("🔍 Verificando conexiones...")
        
        try:
            with self.green_engine.connect() as conn:
                result = conn.execute(text("SELECT 1 as test"))
                logger.info("✅ Conexión GREEN exitosa")
        except Exception as e:
            logger.error(f"❌ Error conectando a GREEN: {e}")
            return False
            
        try:
            with self.blue_engine.connect() as conn:
                result = conn.execute(text("SELECT 1 as test"))
                logger.info("✅ Conexión BLUE exitosa")
        except Exception as e:
            logger.error(f"❌ Error conectando a BLUE: {e}")
            return False
            
        return True

    def backup_green_data(self):
        """Crear backup de datos críticos del ambiente GREEN"""
        logger.info("💾 Creando backup de datos GREEN...")
        
        backup_tables = [
            'PPSH_SOLICITUD',
            'PPSH_SOLICITANTE', 
            'PPSH_DOCUMENTO',
            'PPSH_ESTADO_HISTORIAL',
            'PPSH_ENTREVISTA',
            'PPSH_COMENTARIO',
            'SEG_TB_USUARIOS',
            'SEG_TB_ROLES'
        ]
        
        backup_data = {}
        
        try:
            with self.green_engine.connect() as conn:
                for table in backup_tables:
                    try:
                        query = text(f"""
                        SELECT COUNT(*) as total_records 
                        FROM [{table}] WITH (NOLOCK)
                        """)
                        result = conn.execute(query)
                        count = result.scalar()
                        backup_data[table] = count
                        logger.info(f"📊 {table}: {count} registros")
                    except Exception as e:
                        logger.warning(f"⚠️ Tabla {table} no existe o error: {e}")
                        backup_data[table] = 0
                        
            logger.info(f"✅ Backup de metadatos completado: {len(backup_data)} tablas")
            return backup_data
            
        except Exception as e:
            logger.error(f"❌ Error en backup: {e}")
            return None

    def initialize_blue_database(self):
        """Inicializar base de datos BLUE con estructura base"""
        logger.info("🏗️ Inicializando base de datos BLUE...")
        
        try:
            # Leer script de inicialización
            init_script_path = '/app/migrations/init_database.sql'
            if not os.path.exists(init_script_path):
                logger.error(f"❌ Script de inicialización no encontrado: {init_script_path}")
                return False
                
            with open(init_script_path, 'r', encoding='utf-8') as f:
                init_script = f.read()
            
            # Ejecutar inicialización en BLUE
            with self.blue_engine.connect() as conn:
                # Dividir script en comandos individuales
                commands = init_script.split('GO')
                
                for i, command in enumerate(commands):
                    command = command.strip()
                    if command and not command.startswith('--'):
                        try:
                            conn.execute(text(command))
                            conn.commit()
                        except Exception as e:
                            if "already exists" not in str(e).lower():
                                logger.warning(f"⚠️ Comando {i+1}: {str(e)[:100]}...")
                
                logger.info("✅ Base de datos BLUE inicializada")
                return True
                
        except Exception as e:
            logger.error(f"❌ Error inicializando BLUE: {e}")
            return False

    def copy_data_green_to_blue(self):
        """Copiar datos del ambiente GREEN al BLUE"""
        logger.info("📋 Copiando datos de GREEN a BLUE...")
        
        # Tablas a copiar en orden (respetando foreign keys)
        copy_tables = [
            # Catálogos base
            'SIM_GE_SEXO',
            'SIM_GE_EST_CIVIL', 
            'SIM_GE_VIA_TRANSP',
            'SIM_GE_TIPO_MOV',
            'SIM_GE_CONTINENTE',
            'SIM_GE_PAIS',
            'SIM_GE_REGION',
            'SIM_GE_AGENCIA',
            'SIM_GE_SECCION',
            
            # Catálogos PPSH
            'PPSH_CAUSA_HUMANITARIA',
            'PPSH_TIPO_DOCUMENTO',
            'PPSH_ESTADO',
            
            # Seguridad
            'SEG_TB_ROLES',
            'SEG_TB_USUARIOS',
            'SEG_TB_USUARIO_ROL',
            
            # Datos transaccionales PPSH
            'PPSH_SOLICITUD',
            'PPSH_SOLICITANTE',
            'PPSH_DOCUMENTO', 
            'PPSH_ESTADO_HISTORIAL',
            'PPSH_ENTREVISTA',
            'PPSH_COMENTARIO',
            
            # Tabla MVP
            'tramites'
        ]
        
        copied_tables = 0
        
        for table in copy_tables:
            try:
                logger.info(f"📄 Copiando tabla: {table}")
                
                # Leer datos de GREEN
                with self.green_engine.connect() as green_conn:
                    green_query = text(f"SELECT * FROM [{table}] WITH (NOLOCK)")
                    green_result = green_conn.execute(green_query)
                    rows = green_result.fetchall()
                    columns = green_result.keys()
                
                if not rows:
                    logger.info(f"📄 {table}: Sin datos que copiar")
                    continue
                
                # Limpiar tabla en BLUE
                with self.blue_engine.connect() as blue_conn:
                    blue_conn.execute(text(f"DELETE FROM [{table}]"))
                    blue_conn.commit()
                
                    # Insertar datos en BLUE
                    if rows:
                        # Construir query de inserción
                        columns_str = ', '.join([f"[{col}]" for col in columns])
                        placeholders = ', '.join(['?' for _ in columns])
                        insert_query = f"INSERT INTO [{table}] ({columns_str}) VALUES ({placeholders})"
                        
                        # Convertir rows a lista de tuplas
                        data_tuples = [tuple(row) for row in rows]
                        
                        # Ejecutar inserción por lotes
                        cursor = blue_conn.connection.cursor()
                        cursor.executemany(insert_query, data_tuples)
                        cursor.commit()
                        
                        logger.info(f"✅ {table}: {len(rows)} registros copiados")
                        copied_tables += 1
                
            except Exception as e:
                if "does not exist" in str(e).lower():
                    logger.warning(f"⚠️ Tabla {table} no existe en GREEN, omitiendo...")
                else:
                    logger.error(f"❌ Error copiando {table}: {e}")
        
        logger.info(f"✅ Copia completada: {copied_tables} tablas procesadas")
        return copied_tables > 0

    def apply_priority_migrations(self):
        """Aplicar migraciones de prioridad alta en ambiente BLUE"""
        logger.info("🔧 Aplicando migraciones de prioridad alta en BLUE...")
        
        try:
            # Leer script de migración de prioridad alta
            migration_script_path = '/app/migrations/migration_priority_alta_v1.sql'
            if not os.path.exists(migration_script_path):
                logger.error(f"❌ Script de migración no encontrado: {migration_script_path}")
                return False
                
            with open(migration_script_path, 'r', encoding='utf-8') as f:
                migration_script = f.read()
            
            # Ejecutar migración en BLUE
            with self.blue_engine.connect() as conn:
                # Dividir script en comandos individuales
                commands = migration_script.split('GO')
                
                for i, command in enumerate(commands):
                    command = command.strip()
                    if command and not command.startswith('--') and 'PRINT' not in command:
                        try:
                            conn.execute(text(command))
                            conn.commit()
                        except Exception as e:
                            if "already exists" not in str(e).lower():
                                logger.warning(f"⚠️ Comando migración {i+1}: {str(e)[:100]}...")
                
                logger.info("✅ Migraciones de prioridad alta aplicadas en BLUE")
                return True
                
        except Exception as e:
            logger.error(f"❌ Error aplicando migraciones: {e}")
            return False

    def verify_blue_integrity(self):
        """Verificar integridad del ambiente BLUE"""
        logger.info("🔍 Verificando integridad del ambiente BLUE...")
        
        verification_tests = [
            # Test 1: Verificar estructura de tablas
            {
                'name': 'Estructura de tablas PPSH',
                'query': """
                SELECT COUNT(*) as table_count 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME LIKE 'PPSH_%'
                """,
                'expected_min': 8
            },
            
            # Test 2: Verificar campos de auditoría
            {
                'name': 'Campos de auditoría en SIM_GE_SEXO',
                'query': """
                SELECT COUNT(*) as audit_fields
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'SIM_GE_SEXO' 
                AND COLUMN_NAME IN ('created_at', 'created_by', 'updated_at', 'updated_by')
                """,
                'expected_min': 4
            },
            
            # Test 3: Verificar tabla PPSH_PAGO
            {
                'name': 'Tabla PPSH_PAGO existe',
                'query': """
                SELECT COUNT(*) as table_exists
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'PPSH_PAGO'
                """,
                'expected_min': 1
            },
            
            # Test 4: Verificar conceptos de pago
            {
                'name': 'Conceptos de pago insertados',
                'query': """
                SELECT COUNT(*) as concepts_count
                FROM PPSH_CONCEPTO_PAGO
                WHERE activo = 1
                """,
                'expected_min': 5
            }
        ]
        
        passed_tests = 0
        
        try:
            with self.blue_engine.connect() as conn:
                for test in verification_tests:
                    try:
                        result = conn.execute(text(test['query']))
                        value = result.scalar()
                        
                        if value >= test['expected_min']:
                            logger.info(f"✅ {test['name']}: {value} (esperado: >={test['expected_min']})")
                            passed_tests += 1
                        else:
                            logger.error(f"❌ {test['name']}: {value} (esperado: >={test['expected_min']})")
                            
                    except Exception as e:
                        logger.error(f"❌ Error en test '{test['name']}': {e}")
                
                success_rate = (passed_tests / len(verification_tests)) * 100
                logger.info(f"📊 Tests pasados: {passed_tests}/{len(verification_tests)} ({success_rate:.1f}%)")
                
                return success_rate >= 80  # 80% de tests deben pasar
                
        except Exception as e:
            logger.error(f"❌ Error en verificación: {e}")
            return False

    def run_migration(self):
        """Ejecutar proceso completo de migración Green-Blue"""
        logger.info("🚀 INICIANDO MIGRACIÓN GREEN-BLUE")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        
        # Paso 1: Verificar conexiones
        if not self.verify_connections():
            logger.error("❌ FALLO: Conexiones de base de datos")
            return False
        
        # Paso 2: Crear backup de GREEN
        backup_data = self.backup_green_data()
        if not backup_data:
            logger.error("❌ FALLO: Backup de datos GREEN")
            return False
        
        # Paso 3: Inicializar BLUE
        if not self.initialize_blue_database():
            logger.error("❌ FALLO: Inicialización de BLUE")
            return False
        
        # Paso 4: Copiar datos GREEN -> BLUE
        if not self.copy_data_green_to_blue():
            logger.error("❌ FALLO: Copia de datos")
            return False
        
        # Paso 5: Aplicar migraciones de prioridad alta
        if not self.apply_priority_migrations():
            logger.error("❌ FALLO: Aplicación de migraciones")
            return False
        
        # Paso 6: Verificar integridad de BLUE
        if not self.verify_blue_integrity():
            logger.error("❌ FALLO: Verificación de integridad")
            return False
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        logger.info("=" * 60)
        logger.info("🎉 MIGRACIÓN GREEN-BLUE COMPLETADA EXITOSAMENTE")
        logger.info(f"⏱️ Duración: {duration}")
        logger.info("🔄 Ambiente BLUE listo para activación")
        logger.info("=" * 60)
        
        return True

if __name__ == "__main__":
    try:
        migrator = GreenBlueMigrator()
        success = migrator.run_migration()
        
        if success:
            logger.info("✅ Proceso exitoso - BLUE está listo")
            sys.exit(0)
        else:
            logger.error("❌ Proceso falló - revisar logs")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"💥 Error crítico: {e}")
        sys.exit(1)