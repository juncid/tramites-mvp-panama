# 📚 Sitio de Documentación - MkDocs

Este directorio contiene la configuración y contenido para el sitio web de documentación generado con **MkDocs Material**.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
# Desde la raíz del proyecto
pip install -r requirements-docs.txt
```

### 2. Servir Localmente

```bash
# Modo desarrollo con auto-reload
mkdocs serve

# El sitio estará disponible en: http://127.0.0.1:8000
```

### 3. Construir para Producción

```bash
# Generar sitio estático en carpeta site/
mkdocs build

# Verificar sitio antes de deploy
mkdocs build --strict
```

## 📁 Estructura

```
tramites-mvp-panama/
├── mkdocs.yml              # Configuración principal de MkDocs
├── requirements-docs.txt   # Dependencias Python para MkDocs
├── docs-site/              # Contenido del sitio
│   ├── index.md           # Página principal
│   ├── stylesheets/       # CSS personalizado
│   │   └── extra.css
│   ├── javascripts/       # JS personalizado
│   │   └── mathjax.js
│   ├── introduccion/      # Sección de introducción
│   ├── usuario/           # Manual de usuario
│   ├── tecnico/           # Manual técnico
│   ├── database/          # Documentación de BD
│   ├── capacitacion/      # Guías de capacitación
│   ├── api/               # Documentación de APIs
│   ├── deployment/        # Guías de deployment
│   ├── reportes/          # Reportes del proyecto
│   └── recursos/          # Recursos adicionales
└── site/                  # Sitio generado (Git ignored)
```

## 🎨 Tema Material

El sitio usa **Material for MkDocs**, un tema moderno y potente que incluye:

- ✅ Diseño responsive
- ✅ Búsqueda instantánea
- ✅ Modo claro/oscuro
- ✅ Navegación con pestañas
- ✅ Diagramas Mermaid
- ✅ Bloques de código con highlight
- ✅ Admonitions (notas, advertencias)
- ✅ Tabla de contenidos flotante
- ✅ Versioning con mike
- ✅ Integración con Git

## 📝 Comandos Útiles

### Desarrollo

```bash
# Servir con auto-reload
mkdocs serve

# Servir en puerto específico
mkdocs serve -a localhost:8080

# Servir accesible desde red
mkdocs serve -a 0.0.0.0:8000
```

### Build

```bash
# Build normal
mkdocs build

# Build estricto (falla si hay warnings)
mkdocs build --strict

# Build limpio (elimina site/ primero)
mkdocs build --clean
```

### Deploy

```bash
# Deploy a GitHub Pages
mkdocs gh-deploy

# Deploy con mensaje custom
mkdocs gh-deploy -m "Actualización de documentación v1.2"

# Deploy forzado (sobrescribe sin preguntar)
mkdocs gh-deploy --force
```

## 🎯 Características Implementadas

### Navegación

- ✅ **Pestañas principales**: Usuario, Técnico, BD, Capacitación, APIs, Deployment
- ✅ **Navegación lateral**: Secciones colapsables
- ✅ **Breadcrumbs**: Ubicación actual
- ✅ **Botón "Volver arriba"**
- ✅ **Navegación footer**: Anterior/Siguiente

### Búsqueda

- ✅ Búsqueda instantánea en español
- ✅ Sugerencias mientras escribes
- ✅ Resaltado de resultados
- ✅ Compartir búsquedas

### Contenido

- ✅ **Markdown extendido**: Tablas, listas, footnotes
- ✅ **Bloques de código**: Syntax highlighting + botón copiar
- ✅ **Admonitions**: Note, tip, warning, danger
- ✅ **Tabs**: Contenido en pestañas
- ✅ **Task lists**: Checklists interactivas
- ✅ **Diagramas Mermaid**: Flowcharts, secuencias, etc.
- ✅ **Emojis**: :rocket: :tada: :fire:
- ✅ **Math**: Ecuaciones con MathJax

### Estilo

- ✅ **Colores**: Azul y rojo (bandera panameña)
- ✅ **Modo claro/oscuro**: Toggle automático
- ✅ **CSS personalizado**: Estilos adicionales
- ✅ **Iconos**: Material Design Icons
- ✅ **Fuentes**: Roboto + Roboto Mono

## 📖 Secciones del Sitio

| Sección | Contenido | Estado |
|---------|-----------|--------|
| **Inicio** | Landing page con resumen | ✅ |
| **Introducción** | Arquitectura, tecnologías, inicio rápido | 🔄 Pendiente |
| **Usuario** | Manual completo para usuarios finales | 🔄 Migrar desde docs/ |
| **Técnico** | Manual técnico (Parte 1 y 2) | 🔄 Migrar desde docs/ |
| **Base de Datos** | Diccionario de datos completo | 🔄 Migrar desde docs/ |
| **Capacitación** | Guía de capacitación y ejercicios | 🔄 Migrar desde docs/ |
| **APIs** | Documentación de endpoints REST | 🔄 Crear desde MANUAL_TECNICO |
| **Deployment** | Guías de despliegue | 🔄 Crear desde MANUAL_TECNICO_PARTE2 |
| **Reportes** | Análisis y reportes del proyecto | 🔄 Migrar desde docs/ |
| **Recursos** | Changelog, roadmap, contribuir | 🔄 Crear nuevos |

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# Site URL para links absolutos
export SITE_URL="https://tramites-mvp-panama.github.io"

# Habilitar analytics (Google)
export GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### Personalización del Tema

Edita `mkdocs.yml`:

```yaml
theme:
  palette:
    primary: blue    # Color primario
    accent: red      # Color de acento
  features:
    - navigation.tabs      # Pestañas superiores
    - navigation.instant   # Carga instantánea
    - search.suggest       # Sugerencias de búsqueda
```

### Agregar Plugins

En `mkdocs.yml`:

```yaml
plugins:
  - search
  - minify
  - git-revision-date-localized
  # Agregar más plugins aquí
```

## 📊 Métricas

### Contenido

- **Páginas totales**: ~60 páginas
- **Palabras**: ~90,000 palabras
- **Diagramas**: 15+ diagramas
- **Ejemplos de código**: 80+

### Performance

- **Tamaño del sitio**: ~5 MB (comprimido)
- **Tiempo de build**: ~10 segundos
- **Páginas por segundo**: ~6 páginas/s

## 🚀 Deploy a GitHub Pages

### Configuración Inicial

1. **Habilitar GitHub Pages**:
   - Ve a Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

2. **Deploy**:
   ```bash
   mkdocs gh-deploy
   ```

3. **Verificar**:
   - URL: https://juncid.github.io/tramites-mvp-panama/

### Deploy Automático con GitHub Actions

Crea `.github/workflows/docs.yml`:

```yaml
name: Deploy Docs
on:
  push:
    branches:
      - main
    paths:
      - 'docs-site/**'
      - 'mkdocs.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-python@v4
        with:
          python-version: 3.x
      
      - run: pip install -r requirements-docs.txt
      
      - run: mkdocs gh-deploy --force
```

## 🐛 Troubleshooting

### Error: "Config file 'mkdocs.yml' does not exist"

```bash
# Asegúrate de estar en la raíz del proyecto
cd /path/to/tramites-mvp-panama
mkdocs serve
```

### Error: "No module named 'mkdocs'"

```bash
# Instalar dependencias
pip install -r requirements-docs.txt
```

### Error: "Page not found" en GitHub Pages

```bash
# Verificar que gh-pages branch existe
git branch -a | grep gh-pages

# Re-deploy si es necesario
mkdocs gh-deploy --force
```

### Búsqueda no funciona

```bash
# Verificar plugin de búsqueda en mkdocs.yml
# Debe incluir:
plugins:
  - search:
      lang: es
```

## 📚 Recursos

- **MkDocs**: https://www.mkdocs.org/
- **Material for MkDocs**: https://squidfunk.github.io/mkdocs-material/
- **Markdown Guide**: https://www.markdownguide.org/
- **Mermaid Diagrams**: https://mermaid.js.org/

## 🤝 Contribuir

Para agregar o modificar documentación:

1. **Editar archivo Markdown** en `docs-site/`
2. **Verificar cambios** con `mkdocs serve`
3. **Commit y push** a rama main
4. **Deploy** con `mkdocs gh-deploy`

## 📞 Soporte

- **Issues**: https://github.com/juncid/tramites-mvp-panama/issues
- **Email**: soporte@migracion.gob.pa

---

**Última actualización**: 22 de Octubre, 2025  
**Versión**: 1.0
