#!/usr/bin/env python3
"""
Script para migrar documentación existente a estructura MkDocs
"""

import os
import shutil
from pathlib import Path

# Configuración
DOCS_SOURCE = Path("docs")
DOCS_TARGET = Path("docs-site")

# Mapeo de archivos a su nueva ubicación
FILE_MAPPING = {
    # Reportes
    "ANALISIS_CUMPLIMIENTO_PRODUCTO_1_FINAL.md": "reportes/cumplimiento.md",
    "PROGRESO_MANUALES.md": "reportes/progreso.md",
    "RESUMEN_EJECUTIVO_FINAL.md": "reportes/resumen.md",
}

def create_simple_index(title, description, original_file):
    """Crea una página índice simple que redirige al contenido completo"""
    return f"""# {title}

{description}

---

## Contenido Completo

El contenido completo de este documento se encuentra a continuación.

!!! note "Documento Original"
    Este documento ha sido migrado desde `docs/{original_file}`

---

"""

def copy_file_with_header(source, target, title, description):
    """Copia un archivo agregando un encabezado si es necesario"""
    # Crear directorio de destino si no existe
    target.parent.mkdir(parents=True, exist_ok=True)
    
    # Leer contenido original
    with open(source, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Escribir con nuevo encabezado
    with open(target, 'w', encoding='utf-8') as f:
        # Si el archivo no empieza con #, agregar header
        if not content.strip().startswith('#'):
            f.write(f"# {title}\n\n{description}\n\n---\n\n")
        f.write(content)
    
    print(f"✅ Copiado: {source.name} → {target.relative_to(DOCS_TARGET)}")

def main():
    print("=" * 60)
    print("  Migración de Documentación a MkDocs")
    print("=" * 60)
    print()
    
    # Verificar que los directorios existen
    if not DOCS_SOURCE.exists():
        print(f"❌ Error: Directorio fuente no existe: {DOCS_SOURCE}")
        return
    
    # Crear directorio de destino
    DOCS_TARGET.mkdir(exist_ok=True)
    
    # Migrar archivos mapeados
    print("📂 Migrando archivos...")
    print()
    
    for source_name, target_path in FILE_MAPPING.items():
        source = DOCS_SOURCE / source_name
        target = DOCS_TARGET / target_path
        
        if source.exists():
            # Determinar título del archivo
            title = source_name.replace('.md', '').replace('_', ' ').title()
            description = f"Documento migrado desde la carpeta docs/"
            
            copy_file_with_header(source, target, title, description)
        else:
            print(f"⚠️  Archivo no encontrado: {source_name}")
    
    print()
    print("=" * 60)
    print("  Migración Completada")
    print("=" * 60)
    print()
    print("📊 Archivos migrados exitosamente")
    print()
    print("Próximos pasos:")
    print("1. Revisa los archivos en docs-site/")
    print("2. Ejecuta: mkdocs serve")
    print("3. Visita: http://127.0.0.1:8000")
    print()

if __name__ == "__main__":
    main()
