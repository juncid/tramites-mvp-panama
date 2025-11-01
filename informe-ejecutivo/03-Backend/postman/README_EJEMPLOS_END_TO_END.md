# Guía de Ejemplos End-to-End en Colecciones Postman

## 📋 Descripción General

Este documento explica cómo utilizar las secciones de **ejemplo de flujo completo** (end-to-end) incluidas en las colecciones de Postman de los módulos PPSH, Workflow y SIM_FT del Sistema de Trámites Migratorios de Panamá.

Estas secciones demuestran el uso completo de los endpoints desde el inicio hasta el final de un proceso, permitiendo:
- **Aprender** cómo funcionan los módulos de manera integrada
- **Validar** que todos los endpoints funcionan correctamente
- **Probar** flujos reales sin necesidad de datos de prueba externos
- **Documentar** casos de uso completos

---

## 🎯 Colecciones Disponibles

### 1. SIM_FT_Complete_API v2.1.0
**Archivo:** `SIM_FT_Complete_API.postman_collection.json`

**Sección de ejemplo:** `12. 🎯 EJEMPLOS: Flujo PERM_TEMP (Datos de Prueba)`

**Descripción:**
Flujo completo de un trámite de Permiso Temporal (PERM_TEMP) del sistema SIM_FT.

**Flujo incluido (14 requests):**
1. ✅ Obtener Catálogos (tipos de trámite, estados, prioridades)
2. ✅ Crear nuevo trámite (NUM_TRAMITE: 5001)
3. ✅ Consultar trámite creado
4. ✅ Asignar prioridad
5. ✅ Avanzar pasos del workflow (6 pasos diferentes)
6. ✅ Agregar conclusiones
7. ✅ Cerrar trámite
8. ✅ Consultar estadísticas (por tipo, por estado, tiempo promedio)

**Datos de prueba requeridos:**
- Archivo SQL: `backend/sql/seed_sim_ft_test_data.sql`
- Ejecutar antes de las pruebas para crear el workflow PERM_TEMP y datos iniciales

**Variables utilizadas:**
- `cod_tramite`: "PERM_TEMP"
- `num_tramite`: "5001"
- `num_registro`: Auto-generado
- `num_paso`: 1-6 (según etapa del workflow)

**Duración estimada:** ~5-10 minutos

---

### 2. PPSH_Complete_API v2.0.0
**Archivo:** `PPSH_Complete_API.postman_collection.json`

**Sección de ejemplo:** `9. 🎯 EJEMPLO: Flujo Completo PPSH`

**Descripción:**
Flujo completo de una solicitud de Permiso de Protección de Seguridad Humanitaria (PPSH) desde su creación hasta su aprobación.

**Flujo incluido (13 requests):**
1. ✅ **E1. Obtener Causas Humanitarias** - Catálogo de causas
2. ✅ **E2. Obtener Tipos de Documento** - Catálogo de documentos
3. ✅ **E3. Crear Solicitud Individual** - Crear solicitud (Juan Pérez, VEN)
4. ✅ **E4. Asignar a Funcionario** - Asignar a FUNC001
5. ✅ **E5. Subir Pasaporte** - Upload de documento
6. ✅ **E6. Verificar Documento** - Estado: VERIFICADO
7. ✅ **E7. Programar Entrevista** - Fecha: 2025-11-15 10:00
8. ✅ **E8. Registrar Resultado de Entrevista** - Resultado: FAVORABLE
9. ✅ **E9. Cambiar Estado a En Revisión** - Estado: REV
10. ✅ **E10. Cambiar Estado a Aprobado** - Estado: APR
11. ✅ **E11. Agregar Comentario Final** - Comentario interno
12. ✅ **E12. Obtener Historial Completo** - Ver todos los cambios
13. ✅ **E13. Obtener Estadísticas** - Verificar estadísticas del sistema

**Datos de prueba requeridos:**
- ⚠️ **No requiere SQL de datos de prueba** - Los datos se crean durante la ejecución
- El flujo crea todos los datos necesarios inline

**Variables utilizadas:**
- `solicitud_id`: Auto-generado en E3
- `num_expediente`: Auto-generado en E3
- `documento_id`: Auto-generado en E5
- `entrevista_id`: Auto-generado en E7
- `comentario_id`: Auto-generado en E11

**Estado final:** Solicitud APROBADA

**Duración estimada:** ~5-10 minutos

---

### 3. Workflow_API_Tests v2.0.0
**Archivo:** `Workflow_API_Tests.postman_collection.json`

**Sección de ejemplo:** `6. 🎯 EJEMPLO: Flujo Completo Workflow`

**Descripción:**
Flujo completo de diseño y ejecución de un workflow dinámico para solicitud de Visa Temporal.

**Flujo incluido (14 requests):**

**FASE 1: Diseño del Workflow (6 pasos)**
1. ✅ **E1. Crear Workflow Completo** - Workflow "EJEMPLO_VISA" con 3 etapas
2. ✅ **E2. Agregar Pregunta - Tipo de Visa** - Selección única (Turismo/Negocios/Estudios)
3. ✅ **E3. Agregar Pregunta - Subir Pasaporte** - Tipo archivo
4. ✅ **E4. Crear Conexión - Recepción a Revisión** - Conexión secuencial
5. ✅ **E5. Crear Conexión Condicional - Revisión a Emisión** - Solo si aprobado
6. ✅ **E6. Activar Workflow** - Estado: ACTIVO

**FASE 2: Ejecución del Workflow (8 pasos)**
7. ✅ **E7. Crear Instancia de Workflow** - Instancia para María González
8. ✅ **E8. Responder Preguntas - Etapa Inicial** - Seleccionar TURISMO
9. ✅ **E9. Avanzar a Revisión** - De RECEPCION a REVISION
10. ✅ **E10. Agregar Comentario en Revisión** - Comentario interno
11. ✅ **E11. Avanzar a Emisión (Aprobado)** - De REVISION a EMISION
12. ✅ **E12. Completar Workflow** - Estado: COMPLETADO
13. ✅ **E13. Obtener Historial Completo** - Ver todos los cambios
14. ✅ **E14. Listar Todas las Instancias** - Verificar instancia completada

**Datos de prueba requeridos:**
- 📄 **Opcional:** `backend/sql/seed_workflow_test_data.sql` (como referencia)
- El flujo crea todos los datos necesarios durante la ejecución

**Variables utilizadas:**
- `workflow_id`: Auto-generado en E1
- `etapa_inicial_id`, `etapa_intermedia_id`, `etapa_final_id`: Auto-generados en E1
- `pregunta_tipo_visa_id`: Auto-generado en E2
- `conexion_1_id`, `conexion_2_id`: Auto-generados en E4 y E5
- `instancia_id`: Auto-generado en E7

**Características demostradas:**
- Creación de workflows con múltiples etapas
- Preguntas de diferentes tipos (selección única, archivo)
- Conexiones secuenciales y condicionales
- Ejecución de instancias con respuestas
- Avance entre etapas
- Comentarios e historial
- Finalización exitosa

**Estado final:** Workflow ACTIVO con instancia COMPLETADA

**Duración estimada:** ~10-15 minutos

---

## 🚀 Cómo Usar las Colecciones

### Paso 1: Importar Colecciones en Postman

1. Abrir Postman
2. Clic en **Import** (esquina superior izquierda)
3. Seleccionar **File** o arrastrar los archivos JSON
4. Importar los 3 archivos:
   - `SIM_FT_Complete_API.postman_collection.json`
   - `PPSH_Complete_API.postman_collection.json`
   - `Workflow_API_Tests.postman_collection.json`

### Paso 2: Configurar Variables de Entorno

Verificar que las variables de colección estén correctamente configuradas:

**Para SIM_FT:**
```json
base_url: http://localhost:8000
api_prefix: /api/v1/sim-ft
cod_tramite: PERM_TEMP
num_tramite: 5001
```

**Para PPSH:**
```json
base_url: http://localhost:8000
api_prefix: /api/v1/ppsh
solicitud_id: (se genera automáticamente)
documento_id: (se genera automáticamente)
entrevista_id: (se genera automáticamente)
```

**Para Workflow:**
```json
base_url: http://localhost:8000
api_prefix: /api/v1/workflow
workflow_id: (se genera automáticamente)
instancia_id: (se genera automáticamente)
```

### Paso 3: Preparar Datos de Prueba (solo SIM_FT)

Para SIM_FT, ejecutar el script SQL de datos de prueba:

```bash
# Desde el directorio backend
docker exec -it tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P YourPassword123! -C \
  -i /sql/seed_sim_ft_test_data.sql
```

**PPSH y Workflow no requieren datos previos** - se crean durante la ejecución.

### Paso 4: Ejecutar el Flujo Completo

Hay dos formas de ejecutar los ejemplos:

#### Opción A: Ejecución Manual (Recomendado para aprender)

1. Navegar a la sección de ejemplo (ej: `9. 🎯 EJEMPLO: Flujo Completo PPSH`)
2. Ejecutar los requests **en orden** uno por uno (E1 → E2 → E3 → ... → E13)
3. **Importante:** Esperar que cada request termine antes de ejecutar el siguiente
4. Revisar las respuestas y las variables generadas automáticamente
5. Leer las descripciones de cada paso para entender el flujo

#### Opción B: Ejecución con Collection Runner (Para testing rápido)

1. Hacer clic derecho en la sección de ejemplo
2. Seleccionar **Run folder**
3. Verificar que los requests estén en orden
4. Configurar delay entre requests (500ms recomendado)
5. Clic en **Run [Folder Name]**
6. Revisar los resultados en el resumen

### Paso 5: Verificar Resultados

**Todos los tests deben pasar** ✅

Para cada colección:
- **SIM_FT:** Verificar que el trámite 5001 esté cerrado con estadísticas actualizadas
- **PPSH:** Verificar que la solicitud esté en estado APROBADO (APR) con historial completo
- **Workflow:** Verificar que la instancia esté COMPLETADA con historial de cambios

---

## 🔍 Estructura de los Requests de Ejemplo

Cada request de ejemplo sigue esta estructura:

```
[Número]. [Nombre del Paso]
├── Description: Explicación del paso y su propósito
├── Pre-request Script: (Opcional) Scripts de preparación
├── Request:
│   ├── Method: GET/POST/PUT/DELETE
│   ├── URL: Con variables de colección
│   └── Body: Datos específicos del paso
└── Tests: Scripts de validación
    ├── Verificar status code
    ├── Validar estructura de respuesta
    └── Guardar variables para siguientes pasos
```

### Ejemplo de Test Script:

```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has solicitud_id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    // Guardar en variable para usar en siguientes requests
    pm.collectionVariables.set('solicitud_id', jsonData.id);
});
```

---

## 📊 Variables Automáticas

Las colecciones utilizan **variables de colección** que se establecen automáticamente durante la ejecución:

| Colección | Variables Auto-generadas | Descripción |
|-----------|-------------------------|-------------|
| **SIM_FT** | `num_registro` | Número de registro de cada paso |
| **PPSH** | `solicitud_id`<br>`num_expediente`<br>`documento_id`<br>`entrevista_id`<br>`comentario_id` | IDs generados durante el flujo |
| **Workflow** | `workflow_id`<br>`etapa_inicial_id`<br>`etapa_intermedia_id`<br>`etapa_final_id`<br>`pregunta_tipo_visa_id`<br>`conexion_1_id`<br>`conexion_2_id`<br>`instancia_id` | IDs de todas las entidades creadas |

Estas variables se **reutilizan automáticamente** en los siguientes requests del flujo.

---

## ⚠️ Consideraciones Importantes

### 1. Orden de Ejecución
Los requests **DEBEN** ejecutarse en orden secuencial. Cada request depende de las variables generadas por los anteriores.

### 2. Estado de la Base de Datos
- **SIM_FT:** Requiere datos de prueba previos (seed script)
- **PPSH:** Crea datos nuevos en cada ejecución
- **Workflow:** Crea datos nuevos en cada ejecución

Si ejecutas el flujo múltiples veces:
- **SIM_FT:** Cambia `num_tramite` a uno nuevo (ej: 5007, 5008)
- **PPSH:** Las variables se regeneran automáticamente
- **Workflow:** Las variables se regeneran automáticamente

### 3. Tiempos de Espera
Algunos endpoints pueden tardar más:
- Subida de archivos (PPSH E5)
- Creación de workflows completos (Workflow E1)
- Estadísticas (todos los módulos)

Configurar timeout adecuado en Collection Runner (2-5 segundos).

### 4. Archivos para Upload
Para **PPSH E5 (Subir Pasaporte)**, debes:
1. Tener un archivo PDF o imagen disponible
2. Modificar el request para seleccionar tu archivo
3. O comentar ese paso si no tienes archivo

**Alternativa:** El flujo funciona sin este paso, solo omite la verificación de documento.

---

## 🐛 Troubleshooting

### Problema: "Variable no definida"
**Causa:** No se ejecutó un request previo que define esa variable

**Solución:** Volver al inicio de la sección y ejecutar desde el primer request

### Problema: "404 Not Found"
**Causa:** El servidor no está corriendo o la URL base es incorrecta

**Solución:**
```bash
# Verificar que los contenedores estén corriendo
docker ps

# Si no están corriendo, iniciarlos
docker-compose up -d
```

### Problema: "422 Validation Error" o "500 Internal Server Error"
**Causa:** Datos de prueba inconsistentes o faltantes

**Solución:**
- **SIM_FT:** Re-ejecutar `seed_sim_ft_test_data.sql`
- **PPSH/Workflow:** Limpiar variables de colección y reiniciar el flujo

### Problema: Tests fallan
**Causa:** Cambios en la API o en los datos esperados

**Solución:**
1. Revisar la respuesta del endpoint
2. Verificar que los datos esperados coincidan
3. Actualizar los tests si la API cambió intencionalmente

---

## 📚 Recursos Adicionales

### Documentación Relacionada
- **Manual Técnico:** `docs/MANUAL_TECNICO.md`
- **Diccionario de Datos:** `docs/DICCIONARIO_DATOS_COMPLETO.md`
- **README SIM_FT Test Data:** `backend/sql/README_SIM_FT_TEST_DATA.md`

### Scripts SQL
- **SIM_FT:** `backend/sql/seed_sim_ft_test_data.sql`
- **SIM_FT Update:** `backend/sql/update_sim_ft_test_data.sql`
- **Workflow:** `backend/sql/seed_workflow_test_data.sql`

### Archivos de Colecciones
- `backend/postman/SIM_FT_Complete_API.postman_collection.json`
- `backend/postman/PPSH_Complete_API.postman_collection.json`
- `backend/postman/Workflow_API_Tests.postman_collection.json`

---

## 🎓 Mejores Prácticas

### Para Aprender
1. Ejecutar manualmente paso por paso
2. Leer la descripción de cada request
3. Revisar las respuestas completas
4. Entender las variables que se generan
5. Modificar datos de entrada y ver cómo cambia el resultado

### Para Testing Automatizado
1. Usar Collection Runner con delay de 500ms
2. Verificar que todos los tests pasen
3. Revisar el summary de resultados
4. Exportar resultados si es necesario
5. Limpiar datos de prueba entre ejecuciones

### Para Documentación
1. Los ejemplos sirven como **casos de uso documentados**
2. Compartir las colecciones con el equipo
3. Usar como base para nuevos flujos
4. Mantener actualizados con cambios de API

---

## 📝 Changelog

### v2.0.0 (2025-10-25)
- ✨ **PPSH:** Agregada sección `9. 🎯 EJEMPLO: Flujo Completo PPSH` (13 requests)
- ✨ **Workflow:** Agregada sección `6. 🎯 EJEMPLO: Flujo Completo Workflow` (14 requests)
- 📚 Creado este documento README

### v2.1.0 (2025-10-24)
- ✨ **SIM_FT:** Agregada sección `12. 🎯 EJEMPLOS: Flujo PERM_TEMP` (14 requests)
- 🗃️ Creados scripts SQL de datos de prueba

---

## 👥 Autores

**Sistema de Trámites MVP Panamá**
- Fecha de creación: 2025-10-25
- Última actualización: 2025-10-25

---

## 📄 Licencia

Uso interno del proyecto Sistema de Trámites Migratorios de Panamá.

---

**¿Preguntas o sugerencias?**
Por favor, consultar la documentación técnica o contactar al equipo de desarrollo.
