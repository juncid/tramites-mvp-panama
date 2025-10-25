"""
Script para actualizar schemas_workflow.py de Pydantic v1 a v2
Cambia class Config a model_config = ConfigDict
"""

import re

# Leer el archivo
with open('app/schemas/schemas_workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar import de ConfigDict si no existe
if 'ConfigDict' not in content:
    content = content.replace(
        'from pydantic import BaseModel, Field, validator',
        'from pydantic import BaseModel, Field, validator, ConfigDict'
    )

# Reemplazar todos los bloques "class Config:" por "model_config = ConfigDict"
# Patrón para encontrar:
#     class Config:
#         from_attributes = True
pattern = r'(\s+)class Config:\s+from_attributes = True'
replacement = r'\1model_config = ConfigDict(from_attributes=True)'

content = re.sub(pattern, replacement, content)

# Guardar el archivo actualizado
with open('app/schemas/schemas_workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Archivo schemas_workflow.py actualizado a Pydantic v2")
print("   - Agregado import de ConfigDict")
print("   - Reemplazado 'class Config' por 'model_config = ConfigDict'")
