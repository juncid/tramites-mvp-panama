# 🧪 **Guía Completa de Testing - Endpoint Upload Documentos PPSH**

## 📋 **Endpoint a Probar**
```
POST /ppsh/solicitudes/{id_solicitud}/documentos
```

## 🔧 **Configuración Previa**

### 1. **Verificar que el Backend esté Ejecutándose**
```bash
cd backend
# Activar entorno virtual si es necesario
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. **Verificar Base de Datos**
```bash
# Aplicar migraciones si es necesario
alembic upgrade head
```

## 🧪 **Testing con Pytest (Automatizado)**

### **Ejecutar Tests Automatizados:**
```bash
cd backend
pytest tests/test_upload_documento_endpoint.py -v
```

### **Test con Coverage:**
```bash
pytest tests/test_upload_documento_endpoint.py --cov=app.routes_ppsh --cov-report=html
```

### **Test Específicos:**
```bash
# Test solo casos exitosos
pytest tests/test_upload_documento_endpoint.py::TestUploadDocumentEndpoint::test_upload_documento_exitoso -v

# Test solo casos de error
pytest tests/test_upload_documento_endpoint.py::TestUploadDocumentEndpoint::test_upload_sin_archivo -v

# Test con output detallado
pytest tests/test_upload_documento_endpoint.py -v -s
```

## 🚀 **Testing Manual con Postman**

### **Configuración Inicial en Postman:**

#### **1. Crear Variables de Entorno:**
- `base_url`: `http://localhost:8000`
- `solicitud_id`: `123` (ID de solicitud de prueba)

#### **2. Headers Globales (si se implementa autenticación):**
```
Authorization: Bearer {{token}}
Content-Type: multipart/form-data (se configura automáticamente)
```

---

## 📝 **Tests de Postman por Escenario**

### **🟢 Test 1: Subida Exitosa - Pasaporte PDF**

**Configuración:**
- **Método:** `POST`
- **URL:** `{{base_url}}/ppsh/solicitudes/{{solicitud_id}}/documentos`

**Body (form-data):**
```
archivo: [SELECCIONAR ARCHIVO PDF]
cod_tipo_documento: 3
observaciones: Pasaporte vigente del solicitante principal
```

**Scripts de Validación (Tests tab):**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has document ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id_documento');
    pm.expect(jsonData.id_documento).to.be.a('number');
});

pm.test("Document metadata is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.nombre_archivo).to.include('.pdf');
    pm.expect(jsonData.extension).to.eql('pdf');
    pm.expect(jsonData.estado_verificacion).to.eql('PENDIENTE');
    pm.expect(jsonData.tamano_bytes).to.be.above(0);
});

pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

---

### **🟡 Test 2: Subida con Tipo Documento Texto Libre**

**Body (form-data):**
```
archivo: [SELECCIONAR ARCHIVO JPG/PNG]
tipo_documento_texto: Certificado Médico Especializado
observaciones: Certificado emitido por cardiólogo especialista
```

**Scripts de Validación:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Custom document type is saved", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.tipo_documento_texto).to.eql('Certificado Médico Especializado');
    pm.expect(jsonData.cod_tipo_documento).to.be.null;
});
```

---

### **🔴 Test 3: Error - Sin Archivo**

**Body (form-data):**
```
cod_tipo_documento: 1
observaciones: Test sin archivo
```
*(No incluir campo 'archivo')*

**Scripts de Validación:**
```javascript
pm.test("Status code is 422", function () {
    pm.response.to.have.status(422);
});

pm.test("Error mentions missing file", function () {
    var jsonData = pm.response.json();
    pm.expect(JSON.stringify(jsonData)).to.include('archivo');
});
```

---

### **🔴 Test 4: Error - Solicitud Inexistente**

**Configuración:**
- **URL:** `{{base_url}}/ppsh/solicitudes/99999/documentos`

**Body (form-data):**
```
archivo: [CUALQUIER ARCHIVO]
cod_tipo_documento: 1
```

**Scripts de Validación:**
```javascript
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});

pm.test("Error indicates not found", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.detail).to.include('no encontrada');
});
```

---

### **🟢 Test 5: Diferentes Tipos de Archivo**

**Configurar múltiples requests para diferentes extensiones:**

#### **PDF:**
```
archivo: documento.pdf
cod_tipo_documento: 3
```

#### **JPG:**
```
archivo: foto.jpg  
cod_tipo_documento: 2
```

#### **PNG:**
```
archivo: imagen.png
cod_tipo_documento: 2
```

**Script de Validación Universal:**
```javascript
pm.test("File extension is extracted correctly", function () {
    var jsonData = pm.response.json();
    var filename = jsonData.nombre_archivo;
    var expectedExt = filename.split('.').pop().toLowerCase();
    pm.expect(jsonData.extension).to.eql(expectedExt);
});
```

---

## 📊 **Importar Colección en Postman**

### **Pasos para Importar:**

1. **Abrir Postman**
2. **Import → Upload Files**
3. **Seleccionar:** `PPSH_Upload_Tests.postman_collection.json`
4. **Configurar Variables de Entorno:**
   - Crear nuevo Environment: "PPSH Testing"
   - Agregar variables:
     ```
     base_url = http://localhost:8000
     solicitud_id = 123
     ```

### **Ejecutar Collection Runner:**

1. **Seleccionar la colección** "PPSH - Upload Documents Tests"
2. **Click en "Run collection"**
3. **Configurar:**
   - Environment: "PPSH Testing"
   - Iterations: 1
   - Delay: 1000ms entre requests
4. **Run PPSH - Upload Documents Tests**

---

## 🔍 **Validación y Verificación**

### **Checks Post-Testing:**

#### **1. Verificar Documentos en BD:**
```sql
SELECT 
    id_documento,
    nombre_archivo,
    extension,
    tamano_bytes,
    estado_verificacion,
    fecha_carga
FROM documentos_ppsh 
WHERE id_solicitud = 123
ORDER BY fecha_carga DESC;
```

#### **2. Verificar Archivos en Sistema:**
```bash
ls -la uploads/ppsh/solicitud_123/
```

#### **3. Log Analysis:**
```bash
# Ver logs del backend
tail -f logs/app.log | grep "upload"
```

---

## 🚨 **Troubleshooting**

### **Errores Comunes:**

#### **1. Connection Refused:**
```
✅ Solución: Verificar que uvicorn esté ejecutándose
uvicorn app.main:app --reload --port 8000
```

#### **2. 404 Not Found:**
```
✅ Solución: Verificar que la solicitud existe en BD
INSERT INTO solicitudes_ppsh (id_solicitud, ...) VALUES (123, ...);
```

#### **3. 500 Internal Server Error:**
```
✅ Solución: Revisar logs del backend
tail -f logs/app.log
```

#### **4. Validation Error:**
```
✅ Solución: Verificar formato de form-data en Postman
- Content-Type debe ser multipart/form-data
- Campo 'archivo' debe ser tipo File
```

---

## 📈 **Métricas de Testing**

### **Criterios de Aceptación:**

- ✅ **Response Time:** < 5 segundos
- ✅ **Success Rate:** 100% para casos válidos  
- ✅ **Error Handling:** Respuestas apropiadas para casos inválidos
- ✅ **File Validation:** Extensiones y tamaños correctos
- ✅ **Database Integrity:** Datos guardados correctamente

### **Coverage Esperado:**
```
- Casos exitosos: 80%
- Casos de error: 20%
- Diferentes tipos de archivo: 100%
- Validaciones de entrada: 100%
```

---

## 📚 **Recursos Adicionales**

### **Documentación API:**
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### **Scripts Útiles:**
```bash
# Limpiar uploads de prueba
rm -rf uploads/ppsh/solicitud_123/*

# Reset database de testing
alembic downgrade base && alembic upgrade head

# Generar datos de prueba
python scripts/load_ppsh_data.py
```

### **Archivos de Prueba Recomendados:**
- **PDF pequeño:** < 1MB
- **Imagen JPG:** < 500KB  
- **Imagen PNG:** < 500KB
- **Documento grande:** > 5MB (para testing de límites)

---

**✅ Con esta guía tienes todo lo necesario para testing completo del endpoint de upload de documentos PPSH tanto automatizado como manual.**
