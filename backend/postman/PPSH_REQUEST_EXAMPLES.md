# 📮 Ejemplos de Request PPSH para Postman

## 🎯 Formato Correcto de Solicitud

### ⚠️ Campos Requeridos

#### Para Solicitud:
- `tipo_solicitud`: "INDIVIDUAL" o "GRUPAL"  
- `cod_causa_humanitaria`: ID numérico (1-5)
- `prioridad`: "ALTA", "NORMAL" o "BAJA"
- `solicitantes`: Array con al menos 1 solicitante titular

#### Para Solicitante:
| Campo | Tipo | Requerido | Ejemplo |
|-------|------|-----------|---------|
| `es_titular` | boolean | ✅ | `true` |
| `tipo_documento` | string | ✅ | `"PASAPORTE"`, `"CEDULA"`, `"OTRO"` |
| `num_documento` | string | ✅ | `"V-12345678"` |
| `pais_emisor` | string (3 chars) | ✅ | `"VEN"`, `"COL"`, `"CRI"` |
| `primer_nombre` | string | ✅ | `"Carlos"` |
| `primer_apellido` | string | ✅ | `"Rodríguez"` |
| `fecha_nacimiento` | date (YYYY-MM-DD) | ✅ | `"1980-06-20"` |
| `cod_sexo` | string (1 char) | ✅ | `"M"` o `"F"` |
| `cod_nacionalidad` | string (3 chars) | ✅ | `"VEN"`, `"NIC"`, `"COL"` |

---

## 📝 Ejemplo 1: Solicitud Individual Básica

```json
{
  "tipo_solicitud": "INDIVIDUAL",
  "cod_causa_humanitaria": 1,
  "descripcion_caso": "Persona desplazada por conflicto armado, requiere protección humanitaria",
  "prioridad": "ALTA",
  "solicitantes": [
    {
      "es_titular": true,
      "tipo_documento": "PASAPORTE",
      "num_documento": "V-25000123",
      "pais_emisor": "VEN",
      "primer_nombre": "María",
      "segundo_nombre": "Isabel",
      "primer_apellido": "González",
      "segundo_apellido": "Pérez",
      "fecha_nacimiento": "1985-03-15",
      "cod_sexo": "F",
      "cod_nacionalidad": "VEN",
      "cod_estado_civil": "S",
      "email": "maria.gonzalez@example.com",
      "telefono": "+507 6123-4567",
      "direccion_panama": "Vía España, Edificio Don Bosco, Apto 5B"
    }
  ]
}
```

**Resultado esperado:** 201 Created con `num_expediente` generado (ej: `PPSH-2025-0011`)

---

## 📝 Ejemplo 2: Solicitud Familiar (Grupal)

```json
{
  "tipo_solicitud": "GRUPAL",
  "cod_causa_humanitaria": 2,
  "descripcion_caso": "Familia nicaragüense completa solicitando protección. El titular tiene condición médica grave que requiere tratamiento especializado no disponible en país de origen.",
  "prioridad": "ALTA",
  "cod_agencia": "01",
  "observaciones_generales": "Caso urgente - documentación médica adjunta",
  "solicitantes": [
    {
      "es_titular": true,
      "tipo_documento": "CEDULA",
      "num_documento": "001-200680-0001P",
      "pais_emisor": "NIC",
      "fecha_emision_doc": "2020-01-15",
      "fecha_vencimiento_doc": "2030-01-15",
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
      "direccion_pais_origen": "Managua, Barrio Monseñor Lezcano, Casa 45",
      "direccion_panama": "Vía Brasil, Edificio Los Robles, Apto 12A",
      "ocupacion": "Ingeniero Civil"
    },
    {
      "es_titular": false,
      "parentesco_titular": "CONYUGE",
      "tipo_documento": "CEDULA",
      "num_documento": "001-150982-0002M",
      "pais_emisor": "NIC",
      "fecha_emision_doc": "2020-02-10",
      "fecha_vencimiento_doc": "2030-02-10",
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
      "direccion_pais_origen": "Managua, Barrio Monseñor Lezcano, Casa 45",
      "direccion_panama": "Vía Brasil, Edificio Los Robles, Apto 12A",
      "ocupacion": "Profesora"
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
    }
  ]
}
```

**Resultado esperado:** 201 Created con 3 solicitantes registrados

---

## 📝 Ejemplo 3: Solicitud con Datos Mínimos

```json
{
  "tipo_solicitud": "INDIVIDUAL",
  "cod_causa_humanitaria": 3,
  "prioridad": "NORMAL",
  "solicitantes": [
    {
      "es_titular": true,
      "tipo_documento": "PASAPORTE",
      "num_documento": "COL12345678",
      "pais_emisor": "COL",
      "primer_nombre": "Juan",
      "primer_apellido": "Pérez",
      "fecha_nacimiento": "1990-05-15",
      "cod_sexo": "M",
      "cod_nacionalidad": "COL"
    }
  ]
}
```

**Resultado esperado:** 201 Created (todos los campos opcionales quedan NULL)

---

## 🔧 Códigos de Catálogo

### Causas Humanitarias (cod_causa_humanitaria)

```sql
SELECT cod_causa, nombre_causa FROM PPSH_CAUSA_HUMANITARIA WHERE activo = 1;
```

| ID | Nombre |
|----|--------|
| 1 | Conflicto Armado |
| 2 | Persecución Política |
| 3 | Razones Médicas |
| 4 | Reunificación Familiar |
| 5 | Otro |

### Países (ISO 3166-1 Alpha-3)

| Código | País |
|--------|------|
| VEN | Venezuela |
| NIC | Nicaragua |
| COL | Colombia |
| CRI | Costa Rica |
| SYR | Siria |
| MEX | México |
| CUB | Cuba |
| PAN | Panamá |

### Sexo (cod_sexo)

| Código | Descripción |
|--------|-------------|
| M | Masculino |
| F | Femenino |

### Estado Civil (cod_estado_civil)

| Código | Descripción |
|--------|-------------|
| S | Soltero/a |
| C | Casado/a |
| D | Divorciado/a |
| V | Viudo/a |
| U | Unión Libre |

### Tipos de Documento

| Valor | Descripción |
|-------|-------------|
| PASAPORTE | Pasaporte |
| CEDULA | Cédula de identidad |
| OTRO | Otro documento |

---

## ❌ Errores Comunes

### 1. Error 422: Field required

**Causa:** Falta un campo obligatorio

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "solicitantes", 0, "primer_nombre"],
      "msg": "Field required"
    }
  ]
}
```

**Solución:** Agregar el campo faltante

### 2. Error 422: Validation error

**Causa:** Campos con formato incorrecto

```json
{
  "detail": [
    {
      "type": "value_error",
      "msg": "Los dependientes deben especificar el parentesco con el titular"
    }
  ]
}
```

**Solución:** Si `es_titular = false`, debe incluir `parentesco_titular`

### 3. Error 422: String should have at least 3 characters

**Causa:** Código de país debe ser exactamente 3 caracteres

```json
// ❌ Incorrecto
"pais_emisor": "VE"

// ✅ Correcto
"pais_emisor": "VEN"
```

### 4. Error 422: Una solicitud individual solo puede tener un solicitante

**Causa:** `tipo_solicitud = "INDIVIDUAL"` con más de 1 solicitante

**Solución:** Cambiar a `"GRUPAL"` o eliminar solicitantes adicionales

---

## 🧪 Probar con cURL

### Windows PowerShell

```powershell
$body = @'
{
  "tipo_solicitud": "INDIVIDUAL",
  "cod_causa_humanitaria": 1,
  "descripcion_caso": "Caso de prueba",
  "prioridad": "NORMAL",
  "solicitantes": [
    {
      "es_titular": true,
      "tipo_documento": "PASAPORTE",
      "num_documento": "TEST123",
      "pais_emisor": "VEN",
      "primer_nombre": "Test",
      "primer_apellido": "Usuario",
      "fecha_nacimiento": "1990-01-01",
      "cod_sexo": "M",
      "cod_nacionalidad": "VEN"
    }
  ]
}
'@

$response = Invoke-RestMethod `
  -Uri "http://localhost:8000/api/v1/ppsh/solicitudes" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json -Depth 10
```

### Linux / Mac / Git Bash

```bash
curl -X POST "http://localhost:8000/api/v1/ppsh/solicitudes" \
  -H "Content-Type: application/json" \
  -d '{
  "tipo_solicitud": "INDIVIDUAL",
  "cod_causa_humanitaria": 1,
  "descripcion_caso": "Caso de prueba",
  "prioridad": "NORMAL",
  "solicitantes": [
    {
      "es_titular": true,
      "tipo_documento": "PASAPORTE",
      "num_documento": "TEST123",
      "pais_emisor": "VEN",
      "primer_nombre": "Test",
      "primer_apellido": "Usuario",
      "fecha_nacimiento": "1990-01-01",
      "cod_sexo": "M",
      "cod_nacionalidad": "VEN"
    }
  ]
}'
```

---

## 📊 Variables de Postman

Después de crear una solicitud exitosa, Postman debería guardar automáticamente:

```javascript
// En Tests tab del request:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

var jsonData = pm.response.json();
pm.environment.set("solicitud_id", jsonData.id_solicitud);
pm.environment.set("num_expediente", jsonData.num_expediente);
```

---

## 🔗 Siguiente Paso

Una vez creada la solicitud, puedes:

1. **Ver detalles:**  
   `GET /api/v1/ppsh/solicitudes/{{solicitud_id}}`

2. **Agregar solicitantes adicionales:**  
   `POST /api/v1/ppsh/solicitudes/{{solicitud_id}}/solicitantes`

3. **Cargar documentos:**  
   `POST /api/v1/ppsh/solicitudes/{{solicitud_id}}/documentos`

4. **Agregar comentarios:**  
   `POST /api/v1/ppsh/solicitudes/{{solicitud_id}}/comentarios`

5. **Registrar pago:**  
   `POST /api/v1/ppsh/solicitudes/{{solicitud_id}}/pagos`

---

**Última actualización:** 23 de Octubre de 2025
