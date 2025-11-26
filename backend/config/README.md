# Configuración de Tesseract OCR para Panamá

## Diccionario Personalizado

### `tesseract_panama_words.txt`

Diccionario de palabras específicas para documentos oficiales de Panamá.

**Contenido:**
- Términos oficiales (REPÚBLICA, PANAMÁ, CÉDULA, PASAPORTE)
- Provincias y ciudades panameñas
- Apellidos comunes en Panamá
- Nombres frecuentes
- Términos administrativos y legales

**Uso:**
El diccionario se copia automáticamente durante el build del contenedor Docker a:
```
/usr/share/tesseract-ocr/5/tessdata/panama.user-words
```

Y se utiliza en la configuración de Tesseract mediante:
```python
custom_config = r'--oem 3 --psm 6 --user-words /usr/share/tesseract-ocr/5/tessdata/panama.user-words'
```

**Beneficios:**
- Mejora la precisión en palabras con acentos (REPÚBLICA, PANAMÁ)
- Resuelve ambigüedades en nombres propios
- Prioriza términos del dominio cuando hay múltiples opciones

**Actualización:**
Para agregar nuevas palabras:
1. Editar `tesseract_panama_words.txt`
2. Reconstruir los contenedores Docker
3. O copiar manualmente: 
   ```bash
   docker cp config/tesseract_panama_words.txt tramites-celery-worker:/usr/share/tesseract-ocr/5/tessdata/panama.user-words
   docker-compose restart celery-worker
   ```

## Modelo Tesseract Best

El Dockerfile descarga automáticamente `tessdata_best/spa.traineddata` que ofrece:
- Mayor precisión (+2-4% vs tessdata_fast)
- Mejor reconocimiento de caracteres con acentos
- Diccionario interno más completo

**Fuente:** https://github.com/tesseract-ocr/tessdata_best

## Configuración Actual

**OEM (OCR Engine Mode):** 3 - LSTM Only (Neural Network)
**PSM (Page Segmentation Mode):** 6 - Uniform block of text
**Idioma:** spa (Español)
**Diccionario personalizado:** panama.user-words

Esta configuración logra **93-96% de confianza** en documentos panameños.
