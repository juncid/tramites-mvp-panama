# 🧪 Documentación de Testing

Esta carpeta contiene toda la documentación relacionada con pruebas, testing y validación del sistema.

## 📋 Contenido

### API Testing
- **[API_TESTING_README.md](./API_TESTING_README.md)** - Guía principal de testing de API
  - Configuración de entorno de pruebas
  - Colecciones Postman disponibles
  - Comandos para ejecutar tests
  
- **[API_TESTING_FIXES.md](./API_TESTING_FIXES.md)** - Correcciones y soluciones de testing
  - Problemas encontrados y resueltos
  - Fixes aplicados a los tests
  - Mejores prácticas implementadas

- **[IMPLEMENTACION_TESTING_SUMMARY.md](./IMPLEMENTACION_TESTING_SUMMARY.md)** - Resumen de implementación
  - Tests implementados por módulo
  - Cobertura de pruebas
  - Estado actual del testing

### Data Testing
- **[LOAD_TEST_DATA_GUIDE.md](./LOAD_TEST_DATA_GUIDE.md)** - Guía para cargar datos de prueba
  - Scripts disponibles (`backend/scripts/`)
  - Datos de ejemplo
  - Verificación de datos cargados

- **[DATABASE_TEST_INFO.md](./DATABASE_TEST_INFO.md)** - Información de base de datos de test
  - Estructura de datos de prueba
  - Configuración de BD de test
  - Datos iniciales y fixtures

## 🚀 Inicio Rápido

### 1. Ejecutar Tests de API
```bash
# Con Newman (Postman CLI)
cd tramites-mvp-panama
./run-api-tests.sh

# O en Windows
.\run-api-tests.ps1
```

### 2. Cargar Datos de Prueba
```bash
cd backend
python scripts/load_test_data.py
python scripts/verify_test_data.py
```

### 3. Verificar Estado de Tests
Ver detalles en `API_TESTING_README.md` para:
- Ejecutar colecciones específicas
- Generar reportes
- Integración con CI/CD

## 📊 Cobertura de Testing

Los documentos en esta carpeta cubren:
- ✅ **API REST**: Testing de todos los endpoints
- ✅ **Base de Datos**: Validación de estructura y datos
- ✅ **Workflows**: Pruebas de flujos completos
- ✅ **PPSH**: Tests específicos del módulo PPSH
- ✅ **SIM_FT**: Tests del sistema SIM_FT

## 🔗 Enlaces Relacionados

- [Backend Testing](../../backend/tests/) - Tests unitarios e integración
- [Postman Collections](../../backend/postman/) - Colecciones para testing API
- [Scripts de Testing](../../backend/scripts/) - Scripts de carga y verificación

## 📝 Notas

- Todos los scripts de Python están en `backend/scripts/`
- Las colecciones Postman están en `backend/postman/`
- Los tests unitarios están en `backend/tests/`

---

**Última actualización**: Octubre 22, 2025
