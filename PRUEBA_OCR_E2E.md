# Prueba End-to-End del Servicio OCR

Esta guía te llevará paso a paso para probar el servicio OCR completo desde el frontend hasta el backend.

## 🚀 Pasos para la Prueba E2E

### 1. Iniciar Servicios

```bash
# Desde la raíz del proyecto
cd /home/junci/Source/tramites-mvp-panama

# Iniciar todos los servicios Docker
docker-compose up -d

# Verificar que todos los servicios estén corriendo
docker-compose ps
```

**Servicios esperados:**
- ✅ `tramites-backend` (puerto 8000)
- ✅ `tramites-frontend` (puerto 3000)
- ✅ `tramites-celery-worker` (procesamiento OCR)
- ✅ `tramites-celery-beat` (tareas programadas)
- ✅ `tramites-celery-flower` (monitor, puerto 5555)
- ✅ `tramites-redis` (broker)
- ✅ `tramites-sqlserver` (base de datos)

### 2. Aplicar Migraciones

```bash
# Entrar al contenedor backend
docker-compose exec backend bash

# Aplicar migración OCR
alembic upgrade head

# Salir
exit
```

### 3. Crear Documentos de Prueba

```bash
# Ejecutar script de seed
docker-compose exec backend python scripts/seed_ocr_test_documents.py
```

**Esto creará:**
- 📄 Documento ID 1: Imagen de pasaporte (PA1234567)
- 📄 Documento ID 2: Imagen de cédula (8-123-4567)

### 4. Acceder al Frontend

```bash
# Abrir en el navegador
open http://localhost:3000/ocr
```

O manualmente: **http://localhost:3000/ocr**

### 5. Realizar Prueba OCR

#### A. Configuración Básica

1. **ID Documento**: Ingresar `1` (para pasaporte) o `2` (para cédula)
2. **Usuario**: Dejar `admin`
3. **Idioma**: Seleccionar `Español + Inglés`
4. **Prioridad**: Seleccionar `Normal`
5. **Preprocesamiento**: Dejar todas las opciones activadas

#### B. Procesar Documento

1. Click en **"Procesar Documento"**
2. Observar la barra de progreso en tiempo real
3. Ver los pasos del procesamiento:
   - ⏳ Cargando documento...
   - 🔄 Preprocesando imagen...
   - 📝 Extrayendo texto con OCR...
   - 💾 Guardando resultados...

#### C. Ver Resultados

Una vez completado (10-30 segundos):

- **Confianza**: Porcentaje de precisión del OCR
- **Caracteres**: Total de caracteres extraídos
- **Palabras**: Total de palabras
- **Tiempo**: Tiempo de procesamiento

Click en **"Datos Estructurados"** para ver:
```json
{
  "numero_pasaporte": "PA1234567",
  "fechas_encontradas": ["15/01/1985", "10/01/2020", "10/01/2030"],
  "posible_fecha_nacimiento": "15/01/1985",
  "posible_fecha_emision": "10/01/2020",
  "posible_fecha_vencimiento": "10/01/2030",
  "nacionalidad": "PAN"
}
```

Click en **"Texto Extraído"** para ver todo el texto detectado.

### 6. Pruebas Adicionales

#### A. Ver Estadísticas del Sistema

1. Click en **"Ver Estadísticas"**
2. Observar:
   - Total procesados
   - Completados / Errores
   - Confianza promedio
   - Tiempo promedio

#### B. Cambiar Prioridad

1. Cambiar **Prioridad** a `Alta`
2. Procesar nuevo documento
3. Observar procesamiento más rápido

#### C. Configuración Personalizada

Desactivar algunas opciones de preprocesamiento:
- ❌ Denoise (reducir ruido)
- ❌ Mejorar contraste

Comparar resultados con configuración completa.

#### D. Solo Inglés

1. Cambiar **Idioma** a `Inglés`
2. Procesar documento
3. Ver diferencia en extracción

### 7. Monitoreo con Flower

```bash
# Abrir Flower en el navegador
open http://localhost:5555
```

En Flower podrás ver:
- 📊 **Tasks**: Todas las tareas procesadas
- 👷 **Workers**: Estado de los workers
- 📈 **Monitor**: Gráficas en tiempo real
- 🔧 **Broker**: Estado de Redis

### 8. Logs en Tiempo Real

```bash
# Ver logs del worker
docker-compose logs -f celery-worker

# Ver logs del backend
docker-compose logs -f backend

# Ver todos
docker-compose logs -f
```

### 9. Pruebas Avanzadas

#### A. Cancelar Tarea

1. Iniciar procesamiento de un documento
2. Inmediatamente click en **"Cancelar"**
3. Observar estado cambia a `CANCELADO`

#### B. Reprocesar Documento

1. Después de procesar, cambiar configuración
2. Click en **"Procesar Documento"** nuevamente
3. El sistema guardará el resultado anterior en historial

#### C. Procesar Múltiples Documentos

Abrir múltiples pestañas del navegador:
- Pestaña 1: Procesar documento ID 1
- Pestaña 2: Procesar documento ID 2

Observar en Flower cómo se procesan en paralelo.

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Flujo Básico ✅

```
1. ID Documento: 1
2. Configuración: Default (todo activado)
3. Prioridad: Normal
4. ✅ Resultado esperado: Confianza > 80%
```

### Test 2: Alta Prioridad ⚡

```
1. ID Documento: 2
2. Prioridad: Alta
3. ✅ Resultado esperado: Procesamiento más rápido
```

### Test 3: Sin Preprocesamiento 🔧

```
1. ID Documento: 1
2. Desactivar: Binarizar, Denoise, Contraste
3. ✅ Comparar: Menor confianza que con preprocesamiento
```

### Test 4: Solo Español 🇪🇸

```
1. ID Documento: 1
2. Idioma: Español
3. ✅ Verificar: Extracción correcta de texto
```

### Test 5: Cancelación ❌

```
1. Iniciar procesamiento
2. Cancelar inmediatamente
3. ✅ Estado: CANCELADO
```

### Test 6: Estadísticas 📊

```
1. Procesar varios documentos
2. Ver estadísticas
3. ✅ Totales actualizados correctamente
```

---

## 🔍 Verificación de Resultados

### Pasaporte (ID 1)

**Texto esperado en OCR:**
```
REPÚBLICA DE PANAMÁ
PASAPORTE
Número de Pasaporte: PA1234567
Apellidos: PÉREZ GONZÁLEZ
Nombres: JUAN CARLOS
Nacionalidad: PAN
Fecha de Nacimiento: 15/01/1985
...
```

**Datos estructurados esperados:**
```json
{
  "numero_pasaporte": "PA1234567",
  "nacionalidad": "PAN",
  "fechas_encontradas": ["15/01/1985", "10/01/2020", "10/01/2030"]
}
```

### Cédula (ID 2)

**Texto esperado:**
```
REPÚBLICA DE PANAMÁ
CÉDULA DE IDENTIDAD PERSONAL
Número de Cédula: 8-123-4567
Nombres: MARÍA JOSÉ
Apellidos: RODRÍGUEZ LÓPEZ
...
```

**Datos estructurados esperados:**
```json
{
  "numero_cedula": "8-123-4567",
  "fecha_nacimiento": "20/05/1990"
}
```

---

## 🐛 Troubleshooting

### Problema: "Documento no encontrado"

**Solución:**
```bash
# Verificar documentos
docker-compose exec backend python -c "
from app.infrastructure.database import SessionLocal
from app.models.models_ppsh import PPSHDocumento
db = SessionLocal()
docs = db.query(PPSHDocumento).all()
for d in docs:
    print(f'ID: {d.id_documento}, Archivo: {d.nombre_archivo}')
"
```

### Problema: Worker no procesa

**Solución:**
```bash
# Reiniciar worker
docker-compose restart celery-worker

# Ver logs
docker-compose logs celery-worker
```

### Problema: Frontend no conecta al backend

**Solución:**
```bash
# Verificar variable de entorno
docker-compose exec frontend cat /app/.env.development

# Debería tener:
# VITE_API_URL=http://localhost:8000/api/v1
```

### Problema: Tesseract not found

**Solución:**
```bash
# Verificar instalación
docker-compose exec celery-worker which tesseract
docker-compose exec celery-worker tesseract --version

# Si falta, reinstalar
docker-compose exec celery-worker apt-get update
docker-compose exec celery-worker apt-get install -y tesseract-ocr tesseract-ocr-spa
```

---

## 📸 Screenshots Esperados

### 1. Pantalla Principal
- Formulario de configuración a la izquierda
- Panel de estado a la derecha
- Botones de acción

### 2. Durante Procesamiento
- Barra de progreso animada
- Porcentaje actualizado en tiempo real
- Mensaje del paso actual

### 3. Resultado Completado
- Métricas (confianza, caracteres, palabras, tiempo)
- Acordeón con datos estructurados
- Acordeón con texto extraído
- Botón de descarga

### 4. Flower Dashboard
- Lista de tareas procesadas
- Estado de workers
- Gráficas de rendimiento

---

## ✅ Checklist de Prueba

- [ ] Servicios Docker iniciados
- [ ] Migración aplicada
- [ ] Documentos de prueba creados
- [ ] Frontend accesible en http://localhost:3000/ocr
- [ ] Procesamiento de pasaporte exitoso
- [ ] Procesamiento de cédula exitoso
- [ ] Datos estructurados extraídos correctamente
- [ ] Estadísticas funcionando
- [ ] Flower accesible en http://localhost:5555
- [ ] Cancelación de tarea funciona
- [ ] Diferentes prioridades probadas
- [ ] Diferentes configuraciones de preprocesamiento probadas

---

## 🎉 Prueba Exitosa

Si todos los pasos anteriores funcionan correctamente, **¡has completado exitosamente la prueba end-to-end del servicio OCR!**

El sistema está listo para:
- Procesar documentos reales
- Escalar horizontalmente
- Monitorear en producción
- Integrar con otros módulos

---

## 📚 Recursos Adicionales

- **API Docs**: http://localhost:8000/api/docs
- **Flower**: http://localhost:5555
- **Documentación Técnica**: `backend/docs/ARQUITECTURA_OCR.md`
- **Código de Ejemplo**: `backend/docs/ejemplo_uso_ocr.py`

---

**¡Feliz testing! 🚀**
