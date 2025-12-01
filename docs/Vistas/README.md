# 👁️ Vistas Dinámicas - Documentación

> Sistema de renderizado de formularios según perfil de usuario y etapa

---

## 📋 Índice

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [GUIA_IMPLEMENTACION_VISTAS.md](GUIA_IMPLEMENTACION_VISTAS.md) | 📖 Guía | Cómo crear nuevas vistas |
| [SISTEMA_VISTAS_DINAMICAS_IMPLEMENTADO.md](SISTEMA_VISTAS_DINAMICAS_IMPLEMENTADO.md) | 📋 Referencia | Sistema completo |
| [IMPLEMENTACION_VISTAS_DINAMICAS.md](IMPLEMENTACION_VISTAS_DINAMICAS.md) | ✅ Implementación | Detalles técnicos |
| [PLAN_VISTAS_POR_PERFIL.md](PLAN_VISTAS_POR_PERFIL.md) | 📐 Plan | Por perfil de usuario |
| [PLAN_INTEGRACION_VISTAS_DINAMICAS.md](PLAN_INTEGRACION_VISTAS_DINAMICAS.md) | 📐 Plan | Integración con workflows |
| [PLAN_VERIFICACION_VISTAS_RESPUESTAS.md](PLAN_VERIFICACION_VISTAS_RESPUESTAS.md) | ✅ Verificación | Plan de QA |

---

## 🎯 Concepto

Las vistas dinámicas permiten que diferentes usuarios vean diferentes formularios según:

1. **Perfil del usuario**: CIUDADANO, FUNCIONARIO, ADMIN, etc.
2. **Etapa actual**: Cada etapa del workflow tiene su propia vista
3. **Permisos**: Lectura, escritura, o solo visualización

---

## 🚀 Inicio Rápido

### Crear una vista para una etapa

```bash
curl -X POST "http://localhost:8000/api/v1/workflow/vistas" \
  -H "Content-Type: application/json" \
  -d '{
    "etapa_id": 1,
    "perfil": "CIUDADANO",
    "configuracion": {
      "campos": [
        {"tipo": "TEXTO", "nombre": "nombre_completo", "requerido": true},
        {"tipo": "EMAIL", "nombre": "correo", "requerido": true}
      ]
    }
  }'
```

### Obtener vista según perfil

```bash
curl "http://localhost:8000/api/v1/workflow/instancias/1/vista-actual?perfil=CIUDADANO"
```

---

## 📊 Perfiles Soportados

| Perfil | Descripción | Acceso típico |
|--------|-------------|---------------|
| `CIUDADANO` | Usuario público | Solo sus datos |
| `ABOGADO` | Representante legal | Datos del caso |
| `FUNCIONARIO` | Empleado SNM | Revisión |
| `ANALISTA` | Analista de casos | Análisis |
| `JEFE` | Jefatura | Aprobación |
| `ADMIN` | Administrador | Todo |

---

## 🔧 Tipos de Campos

| Tipo | Componente | Uso |
|------|------------|-----|
| `TEXTO` | Input text | Nombre, dirección |
| `EMAIL` | Input email | Correo electrónico |
| `FECHA` | DatePicker | Fecha de nacimiento |
| `LISTA` | Select | País, nacionalidad |
| `CARGA_ARCHIVO` | FileUpload | Documentos |
| `SELECCION_SIMPLE` | Radio | Sí/No |
| `REVISION_OCR` | OCRReview | Validar OCR |

---

## ⚠️ Consideraciones

1. **Cada perfil debe tener su vista** - Si un perfil no tiene vista configurada, verá un error 403
2. **Las respuestas se validan** - Los campos requeridos deben completarse
3. **El avance de etapa requiere completar** - No se puede avanzar sin llenar todos los campos requeridos
