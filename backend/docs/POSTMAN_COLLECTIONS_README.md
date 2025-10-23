# 📚 Colecciones de Postman - Sistema de Trámites Migratorios

## 📋 Resumen de Colecciones

Este directorio contiene las colecciones completas de Postman para testing de la API del Sistema de Trámites Migratorios de Panamá.

---

## 📦 Colecciones Disponibles

### 1. **PPSH_Complete_API.postman_collection.json** ✅ NUEVA
**Cobertura:** 100% del módulo PPSH (19 endpoints)

Colección completa del módulo PPSH (Permiso Por razones de Seguridad Humanitaria).

#### Funcionalidades incluidas:
- ✅ **Catálogos** (3 endpoints)
  - Causas Humanitarias
  - Tipos de Documento
  - Estados del Proceso

- ✅ **Solicitudes CRUD** (6 endpoints)
  - Crear solicitud individual
  - Crear solicitud familiar
  - Listar con filtros avanzados
  - Obtener por ID
  - Actualizar solicitud

- ✅ **Gestión de Estado** (3 endpoints)
  - Asignar a funcionario
  - Cambiar estado (En Revisión, Aprobado, Rechazado)
  - Historial de estados

- ✅ **Documentos** (4 endpoints)
  - Subir documento (tipo catálogo o personalizado)
  - Verificar documento (Aprobado/Rechazado)

- ✅ **Entrevistas** (4 endpoints)
  - Programar entrevista (presencial/virtual)
  - Registrar resultado
  - Resultados favorables y seguimiento

- ✅ **Comentarios** (4 endpoints)
  - Comentarios internos
  - Comentarios públicos
  - Listar todos o solo públicos

- ✅ **Estadísticas** (1 endpoint)
  - Estadísticas generales del sistema

- ✅ **Health Check** (1 endpoint)

**Total:** 34 requests organizados en 8 carpetas

---

### 2. **Workflow_API_Tests.postman_collection.json** ✅ EXISTENTE
**Cobertura:** 100% del módulo Workflow (27 endpoints)

Colección completa del Sistema de Workflow Dinámico.

#### Funcionalidades incluidas:
- ✅ **Workflows** (6 endpoints)
  - CRUD completo
  - Workflows simples y complejos
  
- ✅ **Etapas** (4 endpoints)
  - CRUD de etapas

- ✅ **Preguntas** (6 endpoints)
  - Preguntas de texto, opciones y archivo
  - CRUD completo

- ✅ **Conexiones** (5 endpoints)
  - Conexiones simples y con condiciones
  - CRUD completo

- ✅ **Instancias** (5 endpoints)
  - Ejecutar workflows
  - Transiciones entre etapas

- ✅ **Comentarios e Historial** (3 endpoints)

**Total:** 29 requests organizados en 6 carpetas

---

### 3. **Tramites_Base_API.postman_collection.json** ✅ NUEVA
**Cobertura:** 100% del módulo Trámites Base (5 endpoints)

Colección del módulo base de trámites con caché Redis.

#### Funcionalidades incluidas:
- ✅ **CRUD Completo**
  - Listar con paginación
  - Obtener por ID
  - Crear trámite
  - Actualizar (completo y parcial)
  - Eliminar (soft delete)

- ✅ **Casos de Error**
  - Not Found (404)
  - Validación (422)

- ✅ **Verificaciones**
  - Caché invalidation
  - Soft delete verification

**Total:** 13 requests con tests completos

---

### 4. **PPSH_Upload_Tests.postman_collection.json** ⚠️ PARCIAL (Mantener para referencia)
**Cobertura:** Solo upload de documentos (legacy)

Colección original enfocada solo en testing de upload. Mantenida para compatibilidad.

---

## 📊 Cobertura Global

| Módulo | Endpoints | Cobertura | Colección | Requests |
|--------|-----------|-----------|-----------|----------|
| **PPSH** | 19 | ✅ 100% | PPSH_Complete_API | 34 |
| **Workflow** | 27 | ✅ 100% | Workflow_API_Tests | 29 |
| **Trámites** | 5 | ✅ 100% | Tramites_Base_API | 13 |
| **TOTAL** | **51** | **✅ 100%** | **3 colecciones** | **76** |

---

## 🚀 Cómo Usar las Colecciones

### Paso 1: Importar en Postman

1. Abre Postman
2. Click en **Import**
3. Arrastra los archivos `.json` o selecciónalos
4. Las colecciones se importarán con todas sus carpetas y variables

### Paso 2: Configurar Variables de Entorno

Cada colección tiene variables preconfigurables:

#### Variables Globales Recomendadas:
```json
{
  "base_url": "http://localhost:8000",
  "api_prefix": "/api/v1"
}
```

#### Para Testing Local:
- `base_url`: `http://localhost:8000`

#### Para Testing en Desarrollo:
- `base_url`: `http://dev-server:8000`

#### Para Testing en Producción:
- `base_url`: `https://api.migracion.gob.pa`

### Paso 3: Ejecutar Requests

#### Ejecución Individual:
1. Navega a la carpeta deseada
2. Selecciona un request
3. Click en **Send**
4. Revisa los tests automáticos en la pestaña **Test Results**

#### Ejecución de Carpeta Completa:
1. Click derecho en una carpeta
2. Selecciona **Run folder**
3. Configura opciones de ejecución
4. Click en **Run [nombre carpeta]**

#### Ejecución de Colección Completa:
1. Click derecho en la colección
2. Selecciona **Run collection**
3. Configura delay entre requests (recomendado: 100-500ms)
4. Click en **Run [nombre colección]**

---

## 🧪 Tests Automáticos

Todas las colecciones incluyen tests automáticos que verifican:

### ✅ Tests de Status Code
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### ✅ Tests de Estructura
```javascript
pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('nombre');
});
```

### ✅ Tests de Validación
```javascript
pm.test("Data validation", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.estado).to.eql('ACTIVO');
});
```

### ✅ Tests de Variables
```javascript
pm.test("Save ID for next request", function () {
    var jsonData = pm.response.json();
    pm.collectionVariables.set('solicitud_id', jsonData.id_solicitud);
});
```

---

## 🔄 Flujos de Testing Recomendados

### Flujo PPSH Completo:

1. **Setup - Catálogos**
   - Listar Causas Humanitarias
   - Listar Tipos de Documento
   - Listar Estados

2. **Crear Solicitud**
   - Crear Solicitud Individual
   - Verificar creación exitosa

3. **Asignar y Cambiar Estado**
   - Asignar a Funcionario
   - Cambiar Estado a "En Revisión"

4. **Documentos**
   - Subir Pasaporte
   - Subir otros documentos
   - Verificar documentos

5. **Entrevista**
   - Programar Entrevista
   - Registrar Resultado

6. **Seguimiento**
   - Agregar Comentarios
   - Ver Historial de Estados

7. **Resolución**
   - Cambiar Estado a "Aprobado" o "Rechazado"

8. **Estadísticas**
   - Verificar estadísticas actualizadas

### Flujo Workflow Completo:

1. **Crear Workflow**
   - Crear workflow con etapas

2. **Configurar Workflow**
   - Agregar preguntas
   - Crear conexiones

3. **Ejecutar Workflow**
   - Crear instancia
   - Transicionar entre etapas
   - Guardar respuestas

4. **Seguimiento**
   - Agregar comentarios
   - Ver historial

### Flujo Trámites Base:

1. **Listar Trámites**
2. **Crear Nuevo Trámite**
3. **Actualizar Trámite**
4. **Verificar Caché**
5. **Eliminar Trámite**

---

## 📝 Archivos para Testing

Para testing de upload de documentos, necesitarás archivos de prueba:

### Crear archivos de prueba en `C:\temp\`:

#### PDF de prueba (pasaporte):
```bash
# Windows PowerShell
"Test Pasaporte PDF Content" | Out-File -FilePath "C:\temp\pasaporte_muestra.pdf"
```

#### Imagen JPG de prueba:
```bash
# Crear o copiar una imagen de prueba
Copy-Item "alguna_imagen.jpg" "C:\temp\foto_carnet.jpg"
```

#### Documento genérico:
```bash
"Test Document" | Out-File -FilePath "C:\temp\test_documento.pdf"
```

**Nota:** Para testing real, usa documentos PDF válidos.

---

## 🔧 Configuración Avanzada

### Uso de Environments

Crea diferentes environments para cada ambiente:

#### Environment "Local":
```json
{
  "base_url": "http://localhost:8000",
  "user_token": "local-test-token"
}
```

#### Environment "Development":
```json
{
  "base_url": "http://dev.tramites.pa:8000",
  "user_token": "dev-test-token"
}
```

#### Environment "Production":
```json
{
  "base_url": "https://api.migracion.gob.pa",
  "user_token": "{{production_token}}"
}
```

### Pre-request Scripts

Las colecciones pueden incluir scripts de preparación:

```javascript
// Generar timestamp
pm.collectionVariables.set("timestamp", new Date().toISOString());

// Generar ID único
pm.collectionVariables.set("unique_id", _.random(1000, 9999));
```

---

## 📈 Monitoreo y CI/CD

### Newman (Postman CLI)

Ejecutar colecciones desde línea de comandos:

```bash
# Instalar Newman
npm install -g newman

# Ejecutar colección
newman run PPSH_Complete_API.postman_collection.json

# Con environment
newman run PPSH_Complete_API.postman_collection.json -e production.postman_environment.json

# Con reporte HTML
newman run PPSH_Complete_API.postman_collection.json -r html
```

### Integración con GitHub Actions

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run PPSH Tests
        run: newman run backend/PPSH_Complete_API.postman_collection.json
      - name: Run Workflow Tests
        run: newman run backend/Workflow_API_Tests.postman_collection.json
      - name: Run Tramites Tests
        run: newman run backend/Tramites_Base_API.postman_collection.json
```

---

## 🐛 Troubleshooting

### Error: "Could not get response"
- Verifica que el servidor esté corriendo
- Verifica la URL en `base_url`
- Revisa firewall/antivirus

### Error: 404 Not Found
- Verifica el `api_prefix` correcto
- Verifica que el endpoint esté registrado en FastAPI
- Revisa los logs del servidor

### Error: 422 Validation Error
- Revisa el schema del request body
- Verifica campos obligatorios
- Revisa tipos de datos

### Variables no se guardan
- Usa `pm.collectionVariables.set()` en lugar de `pm.environment.set()`
- Verifica que el script esté en la pestaña "Tests" (post-response)

---

## 📚 Recursos Adicionales

- [Documentación de Postman](https://learning.postman.com/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [API Documentation](http://localhost:8000/api/docs) (cuando el servidor esté corriendo)

---

## ✅ Checklist de Testing

### Antes de Deploy:

- [ ] Todas las colecciones ejecutadas sin errores
- [ ] Tests de validación pasando
- [ ] Tests de error (404, 422) funcionando correctamente
- [ ] Variables de entorno configuradas para producción
- [ ] Documentos de prueba preparados
- [ ] Health checks pasando

### Testing Regular:

- [ ] Ejecutar colecciones semanalmente
- [ ] Revisar logs de errores
- [ ] Actualizar colecciones con nuevos endpoints
- [ ] Documentar cambios en la API

---

## 📞 Soporte

Para problemas o preguntas sobre las colecciones:

1. Revisa los logs del servidor backend
2. Verifica la documentación de la API en `/api/docs`
3. Consulta este README
4. Contacta al equipo de desarrollo

---

**Última actualización:** 2025-10-21  
**Versión:** 1.0.0  
**Mantenido por:** Sistema de Trámites MVP Panamá
