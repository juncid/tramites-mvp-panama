#!/usr/bin/env python3
import json, re
from pathlib import Path

def update_workflow():
    p = Path('/app/postman/Workflow_API_Tests.postman_collection.json')
    with open(p, 'r', encoding='utf-8') as f:
        s = json.dumps(json.load(f), ensure_ascii=False)
    
    # Cambiar IDs a códigos en workflow completo
    s = re.sub(r'" etapa_origen_id\:\s*1,\s*\n\s*\etapa_destino_id\:\s*2',
