"""
Script para verificar la implementación de las tablas SIM_FT_*

Verifica que todas las tablas del sistema SIM_FT_* estén creadas
y muestra información sobre su estructura.

Author: Sistema de Trámites MVP Panamá
Date: 2025-10-22
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, inspect, text
from app.infrastructure import get_database_url


def verificar_tablas_sim_ft():
    """Verifica la existencia de todas las tablas SIM_FT_*"""
    
    tablas_esperadas = [
        # Catálogo
        "SIM_FT_TRAMITES",
        "SIM_FT_PASOS",
        "SIM_FT_PASOXTRAM",
        "SIM_FT_ESTATUS",
        "SIM_FT_CONCLUSION",
        "SIM_FT_PRIORIDAD",
        "SIM_FT_USUA_SEC",
        # Transaccionales
        "SIM_FT_TRAMITE_E",
        "SIM_FT_TRAMITE_D",
        # Cierre
        "SIM_FT_TRAMITE_CIERRE",
        "SIM_FT_DEPENDTE_CIERRE",
    ]
    
    print("=" * 80)
    print("VERIFICACIÓN DE TABLAS SIM_FT_*")
    print("=" * 80)
    print()
    
    database_url = get_database_url()
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    tablas_existentes = inspector.get_table_names()
    
    print(f"Total de tablas en la base de datos: {len(tablas_existentes)}")
    print()
    
    resultados = []
    
    for tabla in tablas_esperadas:
        existe = tabla in tablas_existentes
        status = "✓" if existe else "✗"
        resultados.append((tabla, existe, status))
        
        if existe:
            # Obtener información adicional
            columnas = inspector.get_columns(tabla)
            pk = inspector.get_pk_constraint(tabla)
            indices = inspector.get_indexes(tabla)
            
            print(f"{status} {tabla}")
            print(f"  - Columnas: {len(columnas)}")
            print(f"  - PK: {', '.join(pk['constrained_columns']) if pk else 'N/A'}")
            print(f"  - Índices: {len(indices)}")
            
            # Contar registros
            try:
                with engine.connect() as conn:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {tabla}"))
                    count = result.scalar()
                    print(f"  - Registros: {count}")
            except Exception as e:
                print(f"  - Registros: Error al contar ({str(e)[:50]}...)")
        else:
            print(f"{status} {tabla} - NO EXISTE")
        
        print()
    
    # Resumen
    print("=" * 80)
    total = len(tablas_esperadas)
    existentes = sum(1 for _, existe, _ in resultados if existe)
    porcentaje = (existentes / total) * 100
    
    print(f"RESUMEN:")
    print(f"  Tablas esperadas: {total}")
    print(f"  Tablas existentes: {existentes}")
    print(f"  Completitud: {porcentaje:.1f}%")
    print("=" * 80)
    
    if existentes == total:
        print("✓ TODAS LAS TABLAS SIM_FT_* ESTÁN CREADAS CORRECTAMENTE")
    else:
        print("✗ FALTAN TABLAS POR CREAR")
        print("\nTablas faltantes:")
        for tabla, existe, _ in resultados:
            if not existe:
                print(f"  - {tabla}")
    
    return existentes == total


def verificar_relaciones():
    """Verifica las relaciones entre tablas"""
    print("\n" + "=" * 80)
    print("VERIFICACIÓN DE RELACIONES (FOREIGN KEYS)")
    print("=" * 80)
    print()
    
    database_url = get_database_url()
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    tablas_con_fk = [
        "SIM_FT_TRAMITE_E",
        "SIM_FT_TRAMITE_D",
        "SIM_FT_TRAMITE_CIERRE",
        "SIM_FT_PASOS",
        "SIM_FT_PASOXTRAM",
    ]
    
    for tabla in tablas_con_fk:
        if tabla in inspector.get_table_names():
            fks = inspector.get_foreign_keys(tabla)
            print(f"📋 {tabla}")
            if fks:
                for fk in fks:
                    print(f"  ➜ {fk['constrained_columns']} → {fk['referred_table']}.{fk['referred_columns']}")
            else:
                print(f"  (Sin foreign keys definidas)")
            print()


def main():
    """Función principal"""
    try:
        tablas_ok = verificar_tablas_sim_ft()
        verificar_relaciones()
        
        if tablas_ok:
            print("\n✓ Sistema SIM_FT_* verificado correctamente")
            return 0
        else:
            print("\n✗ Verificación incompleta - revisar tablas faltantes")
            return 1
            
    except Exception as e:
        print(f"\n✗ ERROR durante la verificación: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
