# 🔄 MAPEO DE CAMPOS: Request Actual → Request Correcto

## ❌ TU REQUEST ACTUAL (INCORRECTO)

```json
{
  "tipo_solicitud": "FAMILIAR",  // ❌ Debe ser "GRUPAL" (no existe FAMILIAR)
  "descripcion_situacion": "...",  // ❌ Campo incorrecto
  "agencia_referente": "...",  // ❌ Campo incorrecto
  "solicitantes": [
    {
      "nombre_completo": "...",  // ❌ NO EXISTE
      "nacionalidad": "Nicaragüense",  // ❌ Campo incorrecto
      "num_documento_identidad": "...",  // ❌ Campo incorrecto
      "genero": "MASCULINO",  // ❌ Campo incorrecto
      "estado_civil": "CASADO",  // ❌ Campo incorrecto
      "direccion_actual": "...",  // ❌ Campo incorrecto
      "tiene_representante_legal": true,  // ❌ NO EXISTE
      "nombre_representante": "...",  // ❌ NO EXISTE
      "telefono_representante": "..."  // ❌ NO EXISTE
    }
  ]
}
```

---

## ✅ REQUEST CORRECTO (USA ESTE)

```json
{
  "tipo_solicitud": "GRUPAL",  // ✅ Valores: "INDIVIDUAL" o "GRUPAL"
  "descripcion_caso": "...",  // ✅ Campo correcto
  "cod_agencia": "01",  // ✅ Campo opcional (código de agencia)
  "observaciones_generales": "...",  // ✅ Aquí va agencia_referente
  "solicitantes": [
    {
      "primer_nombre": "Carlos",  // ✅ Campo separado
      "segundo_nombre": "Alberto",  // ✅ Opcional
      "primer_apellido": "Rodríguez",  // ✅ Campo separado
      "segundo_apellido": "Méndez",  // ✅ Opcional
      "num_documento": "001-200680-0001P",  // ✅ Nombre correcto
      "pais_emisor": "NIC",  // ✅ Código ISO 3 letras
      "cod_sexo": "M",  // ✅ "M" o "F" (1 carácter)
      "cod_nacionalidad": "NIC",  // ✅ Código ISO 3 letras
      "cod_estado_civil": "C",  // ✅ "S", "C", "D", "V", "U" (1 carácter)
      "direccion_panama": "...",  // ✅ Nombre correcto
      "observaciones": "Representante: Lic. Andrea Morales"  // ✅ Aquí va info adicional
    }
  ]
}
```

---

## 📋 TABLA DE CONVERSIÓN COMPLETA

### Nivel Solicitud

| ❌ Tu Campo (Incorrecto) | ✅ Campo Correcto | Tipo | Observaciones |
|-------------------------|-------------------|------|---------------|
| `tipo_solicitud: "FAMILIAR"` | `tipo_solicitud: "GRUPAL"` | string | Solo acepta: "INDIVIDUAL" o "GRUPAL" |
| `descripcion_situacion` | `descripcion_caso` | string | Nombre del campo cambió |
| `agencia_referente` | `observaciones_generales` | string | Mover a observaciones |
| ❌ NO ENVIAR | `cod_agencia` | string | Opcional, código de 2 caracteres |
| ❌ NO ENVIAR | `cod_seccion` | string | Opcional, código de 2 caracteres |

### Nivel Solicitante

| ❌ Tu Campo (Incorrecto) | ✅ Campo Correcto | Tipo | Observaciones |
|-------------------------|-------------------|------|---------------|
| `nombre_completo: "Carlos Alberto Rodríguez Méndez"` | ❌ **NO EXISTE** | - | Debe dividirse en 4 campos |
| ❌ NO ENVIAR | `primer_nombre: "Carlos"` | string | **REQUERIDO** |
| ❌ NO ENVIAR | `segundo_nombre: "Alberto"` | string | Opcional |
| ❌ NO ENVIAR | `primer_apellido: "Rodríguez"` | string | **REQUERIDO** |
| ❌ NO ENVIAR | `segundo_apellido: "Méndez"` | string | Opcional |
| `nacionalidad: "Nicaragüense"` | `cod_nacionalidad: "NIC"` | string(3) | Código ISO 3166-1 Alpha-3 |
| `num_documento_identidad` | `num_documento` | string | Nombre del campo cambió |
| `genero: "MASCULINO"` | `cod_sexo: "M"` | string(1) | Solo "M" o "F" |
| `estado_civil: "CASADO"` | `cod_estado_civil: "C"` | string(1) | S/C/D/V/U |
| `direccion_actual` | `direccion_panama` | string | Nombre del campo cambió |
| `tiene_representante_legal` | ❌ **NO EXISTE** | - | Mover a `observaciones` |
| `nombre_representante` | ❌ **NO EXISTE** | - | Mover a `observaciones` |
| `telefono_representante` | ❌ **NO EXISTE** | - | Mover a `observaciones` |
| ❌ NO ENVIAR | `pais_emisor: "NIC"` | string(3) | **REQUERIDO** - Código ISO |

---

## 🔑 CÓDIGOS VÁLIDOS

### tipo_solicitud
- `"INDIVIDUAL"` - Una sola persona
- `"GRUPAL"` - Familia o grupo

### tipo_documento (parentesco_titular para dependientes)
- `"PASAPORTE"`
- `"CEDULA"`
- `"OTRO"`

### parentesco_titular (solo para dependientes)
- `"CONYUGE"`
- `"HIJO"` o `"HIJA"` (ambos usan "HIJO")
- `"PADRE"`
- `"MADRE"`
- `"HERMANO"`

### cod_sexo
- `"M"` - Masculino
- `"F"` - Femenino

### cod_estado_civil
- `"S"` - Soltero/a
- `"C"` - Casado/a
- `"D"` - Divorciado/a
- `"V"` - Viudo/a
- `"U"` - Unión Libre

### Códigos de País (ISO 3166-1 Alpha-3)
- `"VEN"` - Venezuela
- `"NIC"` - Nicaragua
- `"COL"` - Colombia
- `"CRI"` - Costa Rica
- `"SYR"` - Siria
- `"MEX"` - México
- `"CUB"` - Cuba
- `"PAN"` - Panamá

---

## 🎯 REQUEST LISTO PARA COPIAR Y PEGAR

Copia este JSON directamente en el Body de tu request POST en Postman:

```json
{
  "tipo_solicitud": "GRUPAL",
  "cod_causa_humanitaria": 2,
  "descripcion_caso": "Familia completa desplazada por conflicto armado. Padres e hijos menores requieren protección.",
  "prioridad": "ALTA",
  "cod_agencia": "01",
  "observaciones_generales": "Cruz Roja Internacional como agencia referente. Caso urgente.",
  "solicitantes": [
    {
      "es_titular": true,
      "tipo_documento": "CEDULA",
      "num_documento": "001-200680-0001P",
      "pais_emisor": "NIC",
      "primer_nombre": "Carlos",
      "segundo_nombre": "Alberto",
      "primer_apellido": "Rodríguez",
      "segundo_apellido": "Méndez",
      "fecha_nacimiento": "1980-06-20",
      "cod_sexo": "M",
      "cod_nacionalidad": "NIC",
      "cod_estado_civil": "C",
      "email": "carlos.rodriguez@example.com",
      "telefono": "+507 6234-5678",
      "direccion_panama": "Vía Brasil, Edificio Los Robles, Apto 12A",
      "observaciones": "Tiene representante legal: Lic. Andrea Morales (+507 6345-6789)"
    },
    {
      "es_titular": false,
      "parentesco_titular": "CONYUGE",
      "tipo_documento": "CEDULA",
      "num_documento": "001-150982-0002M",
      "pais_emisor": "NIC",
      "primer_nombre": "Ana",
      "segundo_nombre": "Lucía",
      "primer_apellido": "Méndez",
      "segundo_apellido": "Torres",
      "fecha_nacimiento": "1982-09-15",
      "cod_sexo": "F",
      "cod_nacionalidad": "NIC",
      "cod_estado_civil": "C",
      "email": "ana.mendez@example.com",
      "telefono": "+507 6234-5678",
      "direccion_panama": "Vía Brasil, Edificio Los Robles, Apto 12A"
    },
    {
      "es_titular": false,
      "parentesco_titular": "HIJO",
      "tipo_documento": "CEDULA",
      "num_documento": "001-100410-0003P",
      "pais_emisor": "NIC",
      "primer_nombre": "Carlos",
      "segundo_nombre": "Andrés",
      "primer_apellido": "Rodríguez",
      "segundo_apellido": "Méndez",
      "fecha_nacimiento": "2010-04-10",
      "cod_sexo": "M",
      "cod_nacionalidad": "NIC",
      "cod_estado_civil": "S",
      "direccion_panama": "Vía Brasil, Edificio Los Robles, Apto 12A"
    },
    {
      "es_titular": false,
      "parentesco_titular": "HIJO",
      "tipo_documento": "CEDULA",
      "num_documento": "001-251115-0004M",
      "pais_emisor": "NIC",
      "primer_nombre": "Sofía",
      "segundo_nombre": "Valentina",
      "primer_apellido": "Rodríguez",
      "segundo_apellido": "Méndez",
      "fecha_nacimiento": "2015-11-25",
      "cod_sexo": "F",
      "cod_nacionalidad": "NIC",
      "cod_estado_civil": "S",
      "direccion_panama": "Vía Brasil, Edificio Los Robles, Apto 12A"
    }
  ]
}
```

---

## ✅ RESULTADO ESPERADO

Después de enviar este request, deberías recibir:

**Status:** `201 Created`

**Response:**
```json
{
  "id_solicitud": 11,
  "num_expediente": "PPSH-2025-0006",
  "tipo_solicitud": "GRUPAL",
  "cod_causa_humanitaria": 2,
  "descripcion_caso": "Familia completa desplazada...",
  "fecha_solicitud": "2025-10-23",
  "estado_actual": "RECIBIDO",
  "prioridad": "ALTA",
  "activo": true,
  "created_at": "2025-10-23T19:35:00.123Z",
  "causa_humanitaria": {
    "cod_causa": 2,
    "nombre_causa": "Persecución Política",
    "activo": true
  },
  "estado": {
    "cod_estado": "RECIBIDO",
    "nombre_estado": "Recibido",
    "orden": 1
  },
  "solicitantes": [
    {
      "id_solicitante": 21,
      "id_solicitud": 11,
      "nombre_completo": "Carlos Alberto Rodríguez Méndez",
      "activo": true,
      "created_at": "2025-10-23T19:35:00.456Z"
    },
    {
      "id_solicitante": 22,
      "nombre_completo": "Ana Lucía Méndez Torres",
      ...
    }
  ]
}
```

**Variables de Postman a guardar:**
```javascript
pm.environment.set("solicitud_id", jsonData.id_solicitud);
pm.environment.set("num_expediente", jsonData.num_expediente);
```

---

**Última actualización:** 23 de Octubre de 2025
