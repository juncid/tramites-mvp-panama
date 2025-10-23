# 🎯 Bienvenida

¡Bienvenido a la documentación oficial del **Sistema de Trámites Migratorios de Panamá**!

## 📖 Acerca de esta Documentación

Esta documentación proporciona información completa sobre el sistema de gestión de trámites migratorios, diseñado específicamente para el **Servicio Nacional de Migración de Panamá**.

### ¿Qué encontrarás aquí?

Esta documentación está organizada en varias secciones principales:

=== "Para Usuarios"

    Si eres un **usuario final** (ciudadano, solicitante):
    
    - 📋 Cómo crear y gestionar trámites
    - 🏥 Cómo solicitar un Permiso Provisorio de Salida Humanitaria (PPSH)
    - 🔄 Cómo utilizar el sistema de workflows
    - ❓ Preguntas frecuentes y soporte
    
    [:octicons-arrow-right-24: Ir al Manual de Usuario](../usuario/index.md)

=== "Para Desarrolladores"

    Si eres un **desarrollador**:
    
    - 🏗️ Arquitectura del sistema
    - 💻 Documentación de APIs REST
    - 🗄️ Estructura de base de datos
    - 🔧 Guías de desarrollo
    
    [:octicons-arrow-right-24: Ir al Manual Técnico](../tecnico/index.md)

=== "Para Administradores"

    Si eres **administrador de sistemas** o **DevOps**:
    
    - 🚀 Guías de deployment
    - 🔐 Configuración de seguridad
    - 📊 Monitoreo y logs
    - 🛠️ Troubleshooting
    
    [:octicons-arrow-right-24: Ver Infraestructura](../tecnico/05-infraestructura.md)

=== "Para Capacitadores"

    Si eres **instructor** o **formador**:
    
    - 🎓 Programa de capacitación completo
    - 📝 Ejercicios prácticos
    - 📊 Evaluaciones
    - 🏆 Certificación
    
    [:octicons-arrow-right-24: Ver Programa de Capacitación](../capacitacion/index.md)

## 🎯 Objetivos del Sistema

El Sistema de Trámites Migratorios tiene como objetivos principales:

1. **Digitalizar** el proceso de gestión de trámites migratorios
2. **Agilizar** los tiempos de respuesta y aprobación
3. **Centralizar** la información en una plataforma única
4. **Facilitar** el acceso a los servicios para los ciudadanos
5. **Mejorar** la trazabilidad y auditoría de procesos
6. **Optimizar** la asignación de recursos y personal

## 🌟 Características Principales

### 📋 Gestión de Trámites Base

Sistema completo para la administración de trámites migratorios generales:

- ✅ Crear, consultar, actualizar y eliminar trámites
- ✅ Estados del ciclo de vida configurables
- ✅ Búsqueda avanzada con múltiples filtros
- ✅ Estadísticas y reportes en tiempo real
- ✅ Auditoría completa de todas las operaciones

### 🏥 PPSH - Permiso Provisorio de Salida Humanitaria

Módulo especializado para casos humanitarios:

- ✅ Registro de solicitantes con datos biométricos
- ✅ Gestión de documentos adjuntos (pasaportes, certificados médicos)
- ✅ Revisión médica integrada
- ✅ Sistema de entrevistas programadas
- ✅ Workflow de aprobación/rechazo
- ✅ Causas humanitarias categorizadas

### 🔄 Workflows Dinámicos

Motor configurable de procesos de negocio:

- ✅ Definición visual de workflows personalizados
- ✅ Etapas y tareas configurables
- ✅ Asignación automática basada en roles
- ✅ Seguimiento en tiempo real del progreso
- ✅ Alertas y notificaciones
- ✅ SLA y métricas de rendimiento

### 🔐 Seguridad y Auditoría

Sistema robusto de seguridad:

- ✅ Autenticación de usuarios (preparado para JWT)
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Auditoría completa de operaciones
- ✅ Soft delete para preservar historia
- ✅ Encriptación de datos sensibles
- ✅ Backup automático

## 📊 Estadísticas del Proyecto

<div class="stats-container">
  <div class="stat-card">
    <h3>30</h3>
    <p>Tablas de Base de Datos</p>
  </div>
  <div class="stat-card">
    <h3>35+</h3>
    <p>Endpoints REST</p>
  </div>
  <div class="stat-card">
    <h3>347</h3>
    <p>Páginas de Documentación</p>
  </div>
  <div class="stat-card">
    <h3>14h</h3>
    <p>Material de Capacitación</p>
  </div>
</div>

## 🚀 Tecnologías Utilizadas

### Backend
- **Python 3.11** - Lenguaje de programación
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy 2.0** - ORM para base de datos
- **Pydantic** - Validación de datos
- **Redis** - Caché y sesiones

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Navegación

### Base de Datos
- **SQL Server 2019** - RDBMS principal
- **Alembic** - Migraciones de BD

### Infraestructura
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación
- **Nginx** - Reverse proxy
- **Let's Encrypt** - Certificados SSL

## 📚 Estructura de la Documentación

```
📂 Documentación
├── 🏠 Inicio
│   ├── Bienvenida (estás aquí)
│   ├── Arquitectura General
│   ├── Stack Tecnológico
│   └── Guía de Inicio Rápido
│
├── 📖 Manual de Usuario
│   ├── Introducción
│   ├── Acceso al Sistema
│   ├── Módulo de Trámites
│   ├── Módulo PPSH
│   ├── Módulo de Workflows
│   ├── FAQs
│   ├── Soporte
│   └── Glosario
│
├── 💻 Manual Técnico
│   ├── Parte 1: Core
│   │   ├── Arquitectura
│   │   ├── Base de Datos
│   │   ├── Backend API
│   │   └── Frontend
│   │
│   └── Parte 2: Operaciones
│       ├── Infraestructura
│       ├── Seguridad
│       ├── Monitoreo
│       ├── Troubleshooting
│       └── Mantenimiento
│
├── 🗄️ Base de Datos
│   ├── Diccionario Completo
│   ├── Módulos (Trámites, PPSH, Workflows)
│   ├── Seguridad y Catálogos
│   ├── Índices y Optimización
│   └── Scripts y Migraciones
│
├── 🎓 Capacitación
│   ├── Programa de Formación
│   ├── Módulo 1: Introducción (2h)
│   ├── Módulo 2: Trámites Básicos (3h)
│   ├── Módulo 3: PPSH Avanzado (4h)
│   ├── Módulo 4: Workflows (3h)
│   ├── Módulo 5: Administración (2h)
│   ├── Ejercicios Prácticos
│   ├── Evaluaciones
│   └── Certificación
│
├── 🔧 APIs REST
│   ├── Documentación de Endpoints
│   ├── Autenticación
│   ├── Códigos de Error
│   └── Ejemplos de Uso
│
├── 🚀 Deployment
│   ├── Docker Compose
│   ├── Variables de Entorno
│   ├── SSL/TLS
│   ├── CI/CD Pipeline
│   └── Escalabilidad
│
├── 📊 Reportes
│   ├── Análisis de Cumplimiento
│   ├── Progreso de Documentación
│   └── Resumen Ejecutivo
│
└── 📝 Recursos
    ├── Changelog
    ├── Roadmap
    ├── Contribuir
    └── Licencia
```

## 🎯 Próximos Pasos

### Si eres nuevo:

1. **Lee la [Arquitectura General](arquitectura.md)** para entender cómo funciona el sistema
2. **Revisa el [Stack Tecnológico](tecnologias.md)** para conocer las herramientas utilizadas
3. **Sigue la [Guía de Inicio Rápido](inicio-rapido.md)** para configurar tu entorno

### Si ya conoces el sistema:

- 🔍 Usa la **búsqueda** en la parte superior para encontrar información específica
- 📑 Consulta el **índice lateral** para navegar por secciones
- 📱 Usa las **pestañas superiores** para cambiar entre manuales

## 📞 ¿Necesitas Ayuda?

### Soporte Técnico

- **Email**: soporte@migracion.gob.pa
- **Teléfono**: +507 XXX-XXXX
- **Horario**: Lunes a Viernes, 8:00 AM - 5:00 PM

### Recursos Adicionales

- **Repositorio GitHub**: [github.com/juncid/tramites-mvp-panama](https://github.com/juncid/tramites-mvp-panama)
- **Issues y Bugs**: [GitHub Issues](https://github.com/juncid/tramites-mvp-panama/issues)
- **FAQs**: [Preguntas Frecuentes](../usuario/06-faqs.md)

## 🤝 Contribuir

¿Encontraste un error en la documentación? ¿Tienes sugerencias de mejora?

[:octicons-arrow-right-24: Ver Guía de Contribución](../recursos/contribuir.md)

---

## ✅ Estado del Proyecto

<div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #4caf50, #45a049); color: white; border-radius: 8px; margin: 2rem 0;">
    <h3 style="margin: 0; color: white;">✅ Producto Nº1 - COMPLETADO AL 100%</h3>
    <p style="margin: 1rem 0 0 0;">Desarrollo del Backend con documentación completa</p>
</div>

**Última actualización**: 22 de Octubre, 2025  
**Versión**: 1.0

---

<div style="text-align: center; padding: 2rem 0;">
    <p style="font-size: 1.1rem;">
        🎉 ¡Gracias por usar el Sistema de Trámites Migratorios de Panamá! 🎉
    </p>
</div>
