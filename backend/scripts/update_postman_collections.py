"""
Script para actualizar colecciones de Postman con nuevos nombres de campos
Actualiza Tramites_Base_API y Workflow_API_Tests para usar nombres correctos de BD
"""

import json
import re
from pathlib import Path

def update_tramites_collection():
    """Actualizar colección de Trámites Base API"""
    file_path = Path('postman/Tramites_Base_API.postman_collection.json')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        collection = json.load(f)
    
    # Convertir a string para hacer reemplazos
    content = json.dumps(collection, indent=2, ensure_ascii=False)
    
    # Reemplazos de nombres de campos en tests y descripciones
    replacements = {
        # En tests JavaScript
        r"\.have\.property\('titulo'\)": ".have.property('NOM_TITULO')",
        r"\.have\.property\('descripcion'\)": ".have.property('DESCRIPCION')",
        r"\.have\.property\('estado'\)": ".have.property('COD_ESTADO')",
        r"\.have\.property\('activo'\)": ".have.property('IND_ACTIVO')",
        r"\.have\.property\('created_at'\)": ".have.property('FEC_CREA_REG')",
        r"\.have\.property\('updated_at'\)": ".have.property('FEC_MODIF_REG')",
        
        # En comentarios y descripciones
        r'"titulo"': '"NOM_TITULO"',
        r'"descripcion"': '"DESCRIPCION"',
        r'"estado"': '"COD_ESTADO"',
        r'"activo"': '"IND_ACTIVO"',
        
        # En body de requests
        r'"titulo": "': '"NOM_TITULO": "',
        r'"descripcion": "': '"DESCRIPCION": "',
        r'"estado": "': '"COD_ESTADO": "',
        r'"activo": ': '"IND_ACTIVO": ',
    }
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
    
    # Volver a parsear
    collection = json.loads(content)
    
    # Actualizar descripción de la colección
    if 'info' in collection and 'description' in collection['info']:
        old_desc = collection['info']['description']
        collection['info']['description'] = old_desc + "\n\n**Actualización:** Colección actualizada para usar nombres de columnas de BD (NOM_TITULO, DESCRIPCION, COD_ESTADO, IND_ACTIVO, FEC_CREA_REG, FEC_MODIF_REG)\n**Fecha actualización:** 2025-10-24"
    
    # Guardar
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {file_path} actualizado")
    return True


def update_workflow_collection():
    """Actualizar colección de Workflow API Tests"""
    file_path = Path('postman/Workflow_API_Tests.postman_collection.json')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        collection = json.load(f)
    
    # Los workflows ya usan created_at, created_by, updated_at, updated_by
    # Solo necesitamos asegurarnos de que no usen FEC_CREA_REG
    
    content = json.dumps(collection, indent=2, ensure_ascii=False)
    
    # Asegurar que usa nombres correctos
    replacements = {
        # Si había referencias incorrectas, corregirlas
        r"\.have\.property\('FEC_CREA_REG'\)": ".have.property('created_at')",
        r"\.have\.property\('ID_USUAR_CREA'\)": ".have.property('created_by')",
        r"\.have\.property\('FEC_MODIF_REG'\)": ".have.property('updated_at')",
        r"\.have\.property\('ID_USUAR_MODIF'\)": ".have.property('updated_by')",
    }
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
    
    collection = json.loads(content)
    
    # Actualizar descripción
    if 'info' in collection and 'description' in collection['info']:
        old_desc = collection['info']['description']
        if 'Actualización:' not in old_desc:
            collection['info']['description'] = old_desc + "\n\n**Actualización:** Colección verificada para usar nombres de columnas de BD (created_at, created_by, updated_at, updated_by)\n**Fecha actualización:** 2025-10-24"
    
    # Guardar
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {file_path} actualizado")
    return True


if __name__ == '__main__':
    print("🔄 Actualizando colecciones de Postman...\n")
    
    try:
        update_tramites_collection()
        update_workflow_collection()
        print("\n✅ ¡Colecciones actualizadas exitosamente!")
        print("\n📝 Cambios realizados:")
        print("   • Tramites_Base_API.postman_collection.json:")
        print("     - titulo → NOM_TITULO")
        print("     - descripcion → DESCRIPCION")
        print("     - estado → COD_ESTADO")
        print("     - activo → IND_ACTIVO")
        print("     - created_at → FEC_CREA_REG")
        print("     - updated_at → FEC_MODIF_REG")
        print("   • Workflow_API_Tests.postman_collection.json:")
        print("     - Verificado uso de created_at, created_by, updated_at, updated_by")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise
