# 📚 Documentación de Base de Datos - Índice

## 🎯 Inicio Rápido

**¿Primera vez configurando la base de datos?** Sigue este orden:

1. ✅ Lee esta guía (estás aquí)
2. 📖 Ejecuta el script: `backend/bbdd/init_database.sql`
3. ⚙️ Configura: `backend/.env`
4. ✔️ Verifica: `python backend/verify_database.py`
5. 🎉 ¡Listo para desarrollar!

---

## 📂 Estructura de Documentación

### Documentación Principal

#### 📘 [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md)
**Documentación Técnica Completa de la Base de Datos**

Contiene:
- 📊 Arquitectura y diagramas ER
- 📋 Descripción detallada de cada módulo
- 🗂️ Diccionario completo de datos
- 🔗 Relaciones entre tablas
- 💡 Guías de integración

**Úsalo cuando:** Necesites entender en detalle cómo funciona la base de datos.

---

### Scripts de Base de Datos

#### 🛠️ [backend/bbdd/init_database.sql](./backend/bbdd/init_database.sql)
**Script de Inicialización de Base de Datos**

Contiene:
- 🗄️ Creación de base de datos SIM_PANAMA
- 📊 Todas las tablas iniciales (14 tablas)
- 👤 Usuario admin (password: admin123)
- 📝 Datos iniciales en catálogos
- 🔍 Vistas y procedimientos almacenados

**Úsalo para:** Crear la base de datos inicial completa de una sola vez.

#### 📜 [modelo_datos_propuesto_clean.sql](./modelo_datos_propuesto_clean.sql)
**Esquema Completo Original (8833 líneas)**

Contiene:
- 🏗️ Todas las tablas del sistema completo
- 📦 Estructura completa para futuras migraciones
- 🗃️ Más de 100 tablas

**Úsalo cuando:** Necesites migrar módulos adicionales (Filiación, Impedimentos, etc.)

---

### Guías de Instalación y Uso

#### 📖 [backend/bbdd/README.md](./backend/bbdd/README.md)
**Guía Completa de Instalación y Configuración**

Contiene:
- ✅ Requisitos previos
- 📝 Pasos de instalación detallados
- ⚙️ Configuración de variables de entorno
- ✔️ Verificación de instalación
- 🔧 Solución de problemas
- 💾 Mantenimiento y backups
- 🚀 Próximos pasos

**Úsalo para:** Instalar y configurar la base de datos paso a paso.

#### ⚡ [backend/bbdd/QUICK_REFERENCE.md](./backend/bbdd/QUICK_REFERENCE.md)
**Referencia Rápida y Comandos Útiles**

Contiene:
- 🔍 Consultas SQL frecuentes
- 📊 Códigos de catálogos
- 🛠️ Comandos de mantenimiento
- 💻 Ejemplos de conexión
- 🧪 Scripts de datos de prueba

**Úsalo cuando:** Necesites consultas SQL o comandos rápidos.

#### 📋 [backend/bbdd/SETUP_SUMMARY.md](./backend/bbdd/SETUP_SUMMARY.md)
**Resumen Ejecutivo de la Configuración**

Contiene:
- ✨ Lista de archivos creados
- 📊 Estructura creada
- 🚀 Pasos para iniciar
- 🔐 Credenciales iniciales
- 🎯 Próximos pasos

**Úsalo para:** Vista general rápida de lo que se creó.

---

### Scripts de Verificación

#### 🧪 [backend/verify_database.py](./backend/verify_database.py)
**Script Automatizado de Verificación**

Verifica:
- ✅ Conexión a la base de datos
- 📊 Existencia de tablas
- 📝 Datos iniciales
- 👤 Usuario admin
- 🔍 Vistas y procedimientos
- ⚡ Rendimiento básico

**Úsalo para:** Verificar que todo está correctamente instalado.

```bash
# Ejecutar verificación
cd backend
python verify_database.py
```

---

## 🗺️ Flujo de Trabajo Recomendado

### Para Instalación Inicial

```
1. Leer: backend/bbdd/README.md
   ↓
2. Ejecutar: backend/bbdd/init_database.sql
   ↓
3. Configurar: backend/.env
   ↓
4. Verificar: python backend/verify_database.py
   ↓
5. Desarrollar: ¡Listo!
```

### Para Desarrollo Diario

```
1. Consulta rápida: backend/bbdd/QUICK_REFERENCE.md
   ↓
2. Duda técnica: DATABASE_DOCUMENTATION.md
   ↓
3. Nueva funcionalidad: modelo_datos_propuesto_clean.sql
```

### Para Troubleshooting

```
1. Verificar: python backend/verify_database.py
   ↓
2. Revisar: backend/bbdd/README.md (Solución de Problemas)
   ↓
3. Consultar: DATABASE_DOCUMENTATION.md
```

---

## 📚 Tabla de Contenidos Detallada

### DATABASE_DOCUMENTATION.md

1. Introducción
2. Arquitectura General
3. Módulos del Sistema
   - Módulo de Filiación (SIM_FI_*)
   - Módulo de Movimiento Migratorio (SIM_MM_*)
   - Módulo de Impedimentos (SIM_IM_*)
   - Módulo de Trámites (SIM_FT_*)
   - Módulo de Seguridad (SEG_TB_*, sec_*)
4. Catálogos y Tablas de Referencia
5. Relaciones Principales
6. Diccionario de Datos
7. Índices y Optimizaciones
8. Integraciones
9. Notas Importantes
10. Migración y Mantenimiento

### backend/bbdd/README.md

1. Requisitos Previos
2. Pasos de Instalación
3. Estructura de Base de Datos Creada
4. Migraciones Futuras
5. Seguridad
6. Conexión desde Backend
7. Mantenimiento
8. Solución de Problemas
9. Scripts Útiles
10. Próximos Pasos

### backend/bbdd/QUICK_REFERENCE.md

1. Conexión Rápida
2. Consultas Frecuentes
3. Códigos Comunes
4. Procedimientos Almacenados
5. Vistas Útiles
6. Comandos de Mantenimiento
7. Solución Rápida de Problemas
8. Crear Datos de Prueba
9. Verificación de Sistema
10. Conexión desde Aplicaciones

---

## 🎓 Casos de Uso

### "Soy nuevo y quiero instalar todo"
👉 Sigue: `backend/bbdd/README.md`

### "Necesito entender cómo funciona la BD"
👉 Lee: `DATABASE_DOCUMENTATION.md`

### "Quiero una consulta SQL rápida"
👉 Busca en: `backend/bbdd/QUICK_REFERENCE.md`

### "¿Qué se instaló exactamente?"
👉 Revisa: `backend/bbdd/SETUP_SUMMARY.md`

### "Tengo un problema"
👉 Ejecuta: `python backend/verify_database.py`
👉 Consulta: `backend/bbdd/README.md` (Solución de Problemas)

### "Quiero añadir nuevas tablas"
👉 Revisa: `modelo_datos_propuesto_clean.sql`
👉 Consulta: `DATABASE_DOCUMENTATION.md` (Módulos)

---

## 🔑 Información Clave

### Base de Datos
```
Nombre: SIM_PANAMA
Tablas: 14 (MVP inicial)
Datos: ~50 registros iniciales
```

### Credenciales Iniciales
```
Usuario: admin
Password: admin123
⚠️ CAMBIAR INMEDIATAMENTE
```

### Archivos Principales
```
📄 DATABASE_DOCUMENTATION.md        ← Documentación completa
📄 modelo_datos_propuesto_clean.sql ← Esquema completo
📁 backend/bbdd/
   ├── init_database.sql            ← Script de instalación
   ├── README.md                     ← Guía de instalación
   ├── QUICK_REFERENCE.md            ← Referencia rápida
   └── SETUP_SUMMARY.md              ← Resumen de setup
📄 backend/verify_database.py       ← Script de verificación
📄 backend/.env                      ← Configuración (crear/editar)
```

---

## 🚀 Comandos Rápidos

```bash
# Crear base de datos
sqlcmd -S localhost -U sa -P YourPassword -i backend/bbdd/init_database.sql

# Verificar instalación
cd backend
python verify_database.py

# Conectarse a BD
sqlcmd -S localhost -U sa -P YourPassword -d SIM_PANAMA

# Backup
sqlcmd -S localhost -U sa -P YourPassword -Q "BACKUP DATABASE SIM_PANAMA TO DISK='C:\Backups\SIM_PANAMA.bak'"
```

---

## 📞 ¿Necesitas Ayuda?

| Pregunta | Documento |
|----------|-----------|
| ¿Cómo instalo la BD? | `backend/bbdd/README.md` |
| ¿Cómo funciona la BD? | `DATABASE_DOCUMENTATION.md` |
| ¿Consulta SQL rápida? | `backend/bbdd/QUICK_REFERENCE.md` |
| ¿Qué se instaló? | `backend/bbdd/SETUP_SUMMARY.md` |
| ¿Hay errores? | `python backend/verify_database.py` |
| ¿Tablas adicionales? | `modelo_datos_propuesto_clean.sql` |

---

## ✨ Características

- ✅ Documentación completa y detallada
- ✅ Script de instalación automatizado
- ✅ Verificación automatizada
- ✅ Guías paso a paso
- ✅ Referencias rápidas
- ✅ Ejemplos de código
- ✅ Solución de problemas
- ✅ Datos de ejemplo

---

## 🎯 Próximos Pasos

Después de instalar la base de datos:

1. ✅ Cambiar contraseña de admin
2. ✅ Configurar backups automáticos
3. ✅ Crear usuarios adicionales
4. ✅ Probar endpoints del backend
5. 📝 Implementar autenticación JWT
6. 📝 Migrar módulos adicionales según necesidad

---

## 📊 Módulos Disponibles para Migración

Cuando el MVP esté estable, puedes migrar:

- 🔄 **Filiación completa** (SIM_FI_*) - 20+ tablas
- 🔄 **Movimiento Migratorio** (SIM_MM_*) - 15+ tablas
- 🔄 **Impedimentos** (SIM_IM_*) - 10+ tablas
- 🔄 **Trámites completos** (SIM_FT_*) - 10+ tablas
- 🔄 **Visas** (SIM_VI_*) - 8+ tablas

Ver `modelo_datos_propuesto_clean.sql` para el esquema completo.

---

*Sistema de Trámites Migratorios de Panamá*
*Documentación actualizada: 13 de Octubre de 2025*
