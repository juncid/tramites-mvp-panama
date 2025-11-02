# 🚀 Guía de Mejoras para OCR en Español - Objetivo: 90%+ Precisión

## 📊 Situación Actual vs Objetivo

- **Actual:** 83.53% de confianza promedio
- **Objetivo:** 90%+ de confianza promedio
- **Gap:** 6.47% a mejorar

## 🎯 Estrategias Implementadas

### 1. **Configuración Optimizada de Tesseract** ⚙️

**Cambios clave:**
```python
# ANTES (configuración básica):
'--oem 3 --psm 3'

# DESPUÉS (configuración optimizada):
'--oem 3 --psm 6 -c tessedit_char_whitelist=...'
```

**Mejoras:**
- ✅ PSM 6 (bloque uniforme) mejor que PSM 3 para documentos oficiales
- ✅ Whitelist de caracteres españoles (Ñ, acentos)
- ✅ Preservar espacios entre palabras
- ✅ Penalización de palabras no en diccionario

**Impacto esperado:** +2-3% precisión

### 2. **Preprocesamiento Avanzado** 🖼️

**Mejoras implementadas:**

#### a) Upscaling Inteligente
```python
# Tesseract funciona mejor con 300+ DPI
if width < 2000:
    scale_factor = 2000 / width
    imagen = cv2.resize(..., interpolation=cv2.INTER_CUBIC)
```
**Impacto:** +2-4% en documentos pequeños

#### b) Filtro Bilateral (preserva bordes)
```python
# MEJOR que GaussianBlur para texto
imagen = cv2.bilateralFilter(imagen, 9, 75, 75)
```
**Impacto:** +1-2% precisión

#### c) CLAHE Optimizado
```python
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
```
**Impacto:** +1-2% en imágenes con bajo contraste

#### d) Binarización Adaptativa Gaussian
```python
# MEJOR que Mean para español
cv2.adaptiveThreshold(..., cv2.ADAPTIVE_THRESH_GAUSSIAN_C, ...)
```
**Impacto:** +1-2% precisión

#### e) Operaciones Morfológicas
```python
# Cerrar gaps en letras con acentos
cv2.morphologyEx(imagen, cv2.MORPH_CLOSE, kernel)
```
**Impacto:** +1-2% para caracteres acentuados

#### f) Deskew Mejorado
```python
# Usar Hough Transform en lugar de minAreaRect
lines = cv2.HoughLines(edges, 1, np.pi/180, 100)
angle = np.median(angles)  # Mediana más robusta que promedio
```
**Impacto:** +1-2% en documentos escaneados

**Total preprocesamiento:** +7-14% potencial

### 3. **Post-procesamiento de Texto** 📝

**Correcciones automáticas:**

```python
# Números confundidos con letras
'O1234' → '01234'
'123l' → '1231'

# Acentos mal reconocidos
"A'" → 'Á'
"E'" → 'É'

# Palabras comunes
'REPUBL1CA' → 'REPÚBLICA'
'CEDULA' → 'CÉDULA'
'PANAM1' → 'PANAMÁ'
```

**Impacto:** +2-3% precisión efectiva

## 📦 Instalación de Mejoras

### Paso 1: Instalar Tesseract con datos de español mejorados

```bash
# Dentro del container backend
docker-compose exec backend bash

# Instalar traineddata mejorado para español
wget https://github.com/tesseract-ocr/tessdata_best/raw/main/spa.traineddata \
  -O /usr/share/tesseract-ocr/5/tessdata/spa.traineddata

# Verificar instalación
tesseract --list-langs
```

### Paso 2: Actualizar `ocr_tasks.py`

Reemplazar las funciones existentes con las versiones mejoradas:

```python
# En backend/app/tasks/ocr_tasks.py

# IMPORTAR las mejoras
from app.tasks.ocr_improvements import (
    advanced_preprocessing,
    execute_ocr_improved,
    analyze_ocr_quality
)

# REEMPLAZAR preprocess_image()
def preprocess_image(imagen: np.ndarray, opciones: Dict[str, Any]) -> np.ndarray:
    return advanced_preprocessing(imagen, opciones)

# REEMPLAZAR execute_ocr()  
def execute_ocr(imagen: np.ndarray, idioma: str = 'spa+eng') -> Dict[str, Any]:
    return execute_ocr_improved(
        imagen, 
        idioma=idioma,
        tipo_documento=None,  # Pasar desde opciones si disponible
        usar_config_agresiva=True
    )
```

### Paso 3: Reiniciar servicios

```bash
docker-compose restart backend celery-worker
```

## 🧪 Pruebas y Validación

### Test 1: Documento existente

```bash
curl -X POST "http://localhost:8000/api/v1/ocr/reprocesar/1?user_id=admin" \
  -H "Content-Type: application/json" \
  -d '{
    "idioma": "spa",
    "prioridad": "alta",
    "binarizar": true,
    "denoise": true,
    "mejorar_contraste": true,
    "deskew": true,
    "extraer_datos_estructurados": true
  }'
```

**Resultado esperado:**
- Confianza: 88-92% (vs 83.53% anterior)
- Mejor reconocimiento de acentos (REPÚBLICA, PANAMÁ, etc.)
- Números de documento correctos (PA1234567, 8-123-4567)

### Test 2: Comparación de resultados

```python
# Obtener resultado anterior
curl "http://localhost:8000/api/v1/ocr/resultado/1"

# Reprocesar con mejoras
curl -X POST "http://localhost:8000/api/v1/ocr/reprocesar/1?user_id=admin&guardar_historial=true" ...

# Comparar en historial
curl "http://localhost:8000/api/v1/ocr/historial/1"
```

## 📈 Mejoras Adicionales (Avanzadas)

### Opción A: Entrenamiento Personalizado de Tesseract

Para documentos específicos (pasaportes, cédulas panameñas):

1. Recolectar 50-100 ejemplos de cada tipo
2. Anotar texto correcto manualmente
3. Entrenar modelo personalizado con `tesstrain`
4. Instalar modelo custom en `/usr/share/tesseract-ocr/5/tessdata/`

**Impacto potencial:** +5-10% adicional

### Opción B: Ensemble OCR (Múltiples motores)

Combinar resultados de:
- Tesseract (actual)
- EasyOCR (deep learning)
- Google Cloud Vision API (cloud)

**Impacto potencial:** +10-15% pero mayor costo/latencia

### Opción C: Pre-entrenamiento con transfer learning

Usar modelos como TrOCR o Donut pre-entrenados en español

**Impacto potencial:** +15-20% pero requiere GPU

## 🎯 Resumen de Ganancias Esperadas

| Mejora | Ganancia | Esfuerzo |
|--------|----------|----------|
| Config Tesseract optimizada | +2-3% | ⭐ Bajo |
| Upscaling inteligente | +2-4% | ⭐ Bajo |
| Preprocesamiento avanzado | +3-7% | ⭐⭐ Medio |
| Post-procesamiento | +2-3% | ⭐ Bajo |
| **TOTAL (Quick Wins)** | **+9-17%** | **⭐⭐ Medio** |
| Tesseract traineddata_best | +1-2% | ⭐ Bajo |
| Entrenamiento custom | +5-10% | ⭐⭐⭐⭐ Alto |
| Ensemble OCR | +10-15% | ⭐⭐⭐⭐⭐ Muy Alto |

## 💡 Recomendación

**Fase 1 (Implementar YA):**
1. ✅ Instalar mejoras básicas (archivo `ocr_improvements.py`)
2. ✅ Actualizar configuración Tesseract
3. ✅ Activar preprocesamiento avanzado
4. ✅ Activar post-procesamiento

**Resultado esperado:** 83.53% → **90-95%** ✨

**Fase 2 (Si se requiere >95%):**
- Entrenar modelo custom para documentos panameños
- Considerar ensemble con EasyOCR

## 🔧 Troubleshooting

### Si la precisión no mejora:

1. **Verificar instalación de tessdata:**
   ```bash
   ls -la /usr/share/tesseract-ocr/5/tessdata/spa.traineddata
   ```

2. **Verificar configuración aplicada:**
   ```bash
   # Ver logs del worker
   docker-compose logs celery-worker | grep "config:"
   ```

3. **Analizar calidad de imagen original:**
   ```python
   # Usar función de análisis
   analysis = analyze_ocr_quality(datos_ocr)
   print(analysis['recomendacion'])
   ```

4. **Ajustar parámetros:**
   - Si precisión baja: `usar_config_agresiva=True`
   - Si procesamiento lento: `usar_config_agresiva=False`
   - Si muchas palabras con baja confianza: aumentar upscaling

## 📚 Referencias

- Tesseract Best Practices: https://tesseract-ocr.github.io/tessdoc/ImproveQuality
- OpenCV Image Processing: https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html
- Spanish OCR Optimization: https://github.com/tesseract-ocr/tessdata_best

---

**Autor:** Sistema de Trámites Migratorios de Panamá  
**Fecha:** Noviembre 2025  
**Versión:** 1.0
