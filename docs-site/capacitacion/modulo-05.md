# Módulo 5: Administración y Soporte

Gestión del sistema, usuarios y resolución de problemas.

---

## 📊 Información del Módulo

| Parámetro | Detalle |
|-----------|---------|
| **Duración** | 2 horas |
| **Nivel** | Avanzado |
| **Prerequisitos** | Módulos 1-4 completados |
| **Certificación** | Requerido para administradores |

---

## 🎯 Objetivos de Aprendizaje

Al finalizar este módulo, los participantes serán capaces de:

- ✅ Gestionar usuarios y asignar roles
- ✅ Configurar parámetros del sistema
- ✅ Diagnosticar y resolver problemas comunes
- ✅ Consultar logs y auditoría
- ✅ Realizar respaldos de datos
- ✅ Brindar soporte a usuarios finales

---

## 5.1 Gestión de Usuarios

**Duración**: 30 minutos

### Acceso al Panel de Administración

```
Dashboard → Perfil (👤) → "Administración" → "Gestión de Usuarios"
```

### Lista de Usuarios

```
┌──────────────────────────────────────────────────────┐
│  👥 GESTIÓN DE USUARIOS                  🔍 [Buscar]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  Filtros: [Todos los roles ▼] [Activos ▼]          │
│                                                      │
│  USUARIOS ACTIVOS (45)           [➕ Nuevo Usuario] │
│  ────────────────────                               │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 👤 Juan Pérez                                  │ │
│  │ ✉️ juan.perez@migracion.gob.pa                │ │
│  │ 🎭 Rol: Revisor | Estado: ✅ Activo           │ │
│  │ Último acceso: Hoy 10:30 AM                   │ │
│  │ [✏️ Editar] [🔒 Bloquear] [📊 Actividad]     │ │
│  ├────────────────────────────────────────────────┤ │
│  │ 👤 María González                              │ │
│  │ ✉️ maria.gonzalez@migracion.gob.pa            │ │
│  │ 🎭 Rol: Aprobador | Estado: ✅ Activo         │ │
│  │ Último acceso: Ayer 17:45                     │ │
│  │ [✏️ Editar] [🔒 Bloquear] [📊 Actividad]     │ │
│  ├────────────────────────────────────────────────┤ │
│  │ 👤 Carlos Ruiz                                 │ │
│  │ ✉️ carlos.ruiz@migracion.gob.pa               │ │
│  │ 🎭 Rol: Administrador | Estado: ✅ Activo     │ │
│  │ Último acceso: Hoy 09:15 AM                   │ │
│  │ [✏️ Editar] [🔒 Bloquear] [📊 Actividad]     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Mostrando 3 de 45 usuarios   [1] [2] [3] ... [9]  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Crear Nuevo Usuario

```
┌──────────────────────────────────────────────┐
│  ➕ CREAR NUEVO USUARIO                     │
├──────────────────────────────────────────────┤
│                                              │
│  INFORMACIÓN PERSONAL                       │
│  ───────────────────                        │
│                                              │
│  Nombre Completo: *                         │
│  [_________________________]                │
│                                              │
│  Email Institucional: *                     │
│  [_________]@migracion.gob.pa              │
│                                              │
│  Cédula/Documento: *                        │
│  [_________________________]                │
│                                              │
│  Departamento: *                            │
│  [Seleccionar ▼]                            │
│  • Migración                                │
│  • PPSH                                     │
│  • Recursos Humanos                         │
│  • Tecnología                               │
│  • Administración                           │
│                                              │
│  Cargo:                                     │
│  [_________________________]                │
│                                              │
│  Teléfono:                                  │
│  +507 [____-____]                           │
│                                              │
│  ══════════════════════════════════════════  │
│                                              │
│  CONFIGURACIÓN DE ACCESO                    │
│  ──────────────────────                     │
│                                              │
│  Rol del Usuario: *                         │
│  (Seleccionar uno)                          │
│                                              │
│  ( ) Solicitante                            │
│      Puede crear trámites y consultar       │
│      su estado                              │
│                                              │
│  ( ) Revisor                                │
│      Puede revisar documentos y solicitar   │
│      aclaraciones                           │
│                                              │
│  (•) Aprobador                              │
│      Puede aprobar/rechazar trámites        │
│                                              │
│  ( ) Médico                                 │
│      Puede realizar evaluaciones médicas    │
│      PPSH                                   │
│                                              │
│  ( ) Administrador                          │
│      Acceso completo al sistema             │
│                                              │
│  Contraseña Temporal: *                     │
│  [_________________________]                │
│  [🔄 Generar Aleatoria]                     │
│                                              │
│  ☑ Forzar cambio de contraseña en           │
│    primer acceso                            │
│                                              │
│  ☑ Enviar credenciales por email            │
│                                              │
│  ══════════════════════════════════════════  │
│                                              │
│  PERMISOS ADICIONALES                       │
│  ────────────────────                       │
│  ☑ Acceso a módulo Trámites                 │
│  ☑ Acceso a módulo PPSH                     │
│  ☐ Acceso a módulo Workflows                │
│  ☐ Acceso a Reportes Avanzados              │
│  ☐ Acceso a Configuración                   │
│                                              │
│  [  Cancelar  ]       [  ✅ Crear  ]       │
│                                              │
└──────────────────────────────────────────────┘
```

### Roles y Permisos

| Rol | Permisos | Casos de Uso |
|-----|----------|--------------|
| **Solicitante** | Crear trámites, consultar estado, adjuntar documentos | Ciudadanos, personal de ventanilla |
| **Revisor** | Revisar documentos, solicitar aclaraciones, comentar | Oficiales de migración |
| **Aprobador** | Aprobar/rechazar trámites, acceso completo a expedientes | Supervisores, jefes |
| **Médico** | Evaluaciones médicas PPSH, acceso a historial médico | Personal médico certificado |
| **Administrador** | Acceso completo, gestión de usuarios, configuración | Personal de TI, dirección |

---

## 5.2 Configuración del Sistema

**Duración**: 30 minutos

### Panel de Configuración

```
Administración → "Configuración del Sistema"
```

```
┌──────────────────────────────────────────────┐
│  ⚙️ CONFIGURACIÓN DEL SISTEMA               │
├──────────────────────────────────────────────┤
│                                              │
│  CATEGORÍAS                                 │
│  ──────────                                 │
│  • General                                  │
│  • Seguridad                                │
│  • Notificaciones                           │
│  • Tiempos y Plazos                         │
│  • Documentos                               │
│  • Integración                              │
│                                              │
└──────────────────────────────────────────────┘
```

#### Configuración General

```
┌──────────────────────────────────────────────┐
│  ⚙️ CONFIGURACIÓN GENERAL                   │
├──────────────────────────────────────────────┤
│                                              │
│  Nombre de la Institución:                  │
│  [Servicio Nacional de Migración]           │
│                                              │
│  País:                                      │
│  [Panamá ▼]                                 │
│                                              │
│  Idioma Predeterminado:                     │
│  [Español ▼]                                │
│                                              │
│  Zona Horaria:                              │
│  [America/Panama (UTC-5) ▼]                 │
│                                              │
│  Formato de Fecha:                          │
│  (•) DD/MM/AAAA  ( ) MM/DD/AAAA             │
│                                              │
│  Moneda:                                    │
│  [USD - Dólar Americano ▼]                  │
│                                              │
│  [  Guardar Cambios  ]                      │
│                                              │
└──────────────────────────────────────────────┘
```

#### Configuración de Seguridad

```
┌──────────────────────────────────────────────┐
│  🔒 CONFIGURACIÓN DE SEGURIDAD              │
├──────────────────────────────────────────────┤
│                                              │
│  CONTRASEÑAS                                │
│  ────────────                               │
│  Longitud mínima: [8] caracteres            │
│                                              │
│  Requisitos:                                │
│  ☑ Mayúsculas                               │
│  ☑ Minúsculas                               │
│  ☑ Números                                  │
│  ☑ Símbolos especiales                      │
│                                              │
│  Expiración: [90] días                      │
│  Historial: No repetir últimas [5] contraseñas│
│                                              │
│  SESIONES                                   │
│  ─────────                                  │
│  Duración máxima: [8] horas                 │
│  Inactividad máxima: [30] minutos           │
│                                              │
│  ☑ Cerrar sesión automáticamente            │
│  ☑ Notificar inicio de sesión por email     │
│                                              │
│  INTENTOS DE ACCESO                         │
│  ──────────────────                         │
│  Máximo intentos fallidos: [3]              │
│  Bloqueo temporal: [15] minutos             │
│                                              │
│  ☑ Notificar intentos fallidos              │
│  ☑ Registrar en log de auditoría            │
│                                              │
│  [  Guardar Cambios  ]                      │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 5.3 Diagnóstico y Resolución de Problemas

**Duración**: 30 minutos

### Problemas Comunes y Soluciones

#### 1. No puedo iniciar sesión

**Síntomas**:
- Mensaje "Credenciales inválidas"
- Cuenta bloqueada

**Diagnóstico**:
```
Administración → Usuarios → Buscar usuario → Ver estado
```

**Soluciones**:

✅ **Si está bloqueado**:
- Click en "Desbloquear cuenta"
- Resetear contraseña
- Enviar nueva contraseña al usuario

✅ **Si olvidó contraseña**:
- Click en "Resetear contraseña"
- Sistema envía email con link temporal
- Usuario crea nueva contraseña

#### 2. No puedo cargar documentos

**Síntomas**:
- Error al subir archivos
- Mensaje "Archivo muy grande"

**Diagnóstico**:
```
Verificar:
- Tamaño del archivo (máx 5 MB)
- Formato (solo PDF, JPG, PNG)
- Conexión a internet estable
```

**Soluciones**:

✅ **Archivo muy grande**:
- Comprimir PDF usando herramienta online
- Reducir calidad de imagen
- Dividir documento en varios archivos

✅ **Formato no válido**:
- Convertir a PDF, JPG o PNG
- NO usar ZIP, RAR, DOC

#### 3. No recibo notificaciones

**Síntomas**:
- No llegan emails del sistema
- No veo alertas en dashboard

**Diagnóstico**:
```
Perfil → Configuración → Notificaciones
```

**Soluciones**:

✅ **Verificar configuración**:
- Activar notificaciones por email
- Revisar carpeta de spam
- Confirmar email correcto en perfil

✅ **Revisar preferencias**:
- Habilitar notificaciones del navegador
- Permitir notificaciones del dominio

#### 4. Trámite/PPSH no avanza

**Síntomas**:
- Estado "En revisión" por días
- Sin actualizaciones

**Diagnóstico**:
```
Ver trámite → Pestaña "Historial" → Verificar última actividad
```

**Soluciones**:

✅ **Identificar cuello de botella**:
- Ver a quién está asignado
- Contactar al responsable
- Si necesario, reasignar

✅ **Verificar documentación**:
- Revisar si faltan documentos
- Ver comentarios del revisor
- Completar requisitos pendientes

### Logs del Sistema

```
Administración → "Logs y Auditoría"
```

```
┌──────────────────────────────────────────────┐
│  📋 LOGS DEL SISTEMA                        │
├──────────────────────────────────────────────┤
│                                              │
│  Filtros:                                   │
│  Tipo: [Todos ▼]  Fecha: [Hoy ▼]           │
│  Usuario: [Todos ▼]                         │
│                                              │
│  REGISTROS RECIENTES                        │
│  ──────────────────                         │
│                                              │
│  🟢 25/05 10:45 - INFO                      │
│     Usuario: juan.perez@migracion.gob.pa    │
│     Acción: Login exitoso                   │
│     IP: 192.168.1.25                        │
│                                              │
│  🟡 25/05 10:30 - WARN                      │
│     Usuario: maria.gonzalez@migracion.gob.pa│
│     Acción: Intento de acceso denegado      │
│     Motivo: Permisos insuficientes          │
│                                              │
│  🔴 25/05 09:15 - ERROR                     │
│     Sistema: Base de Datos                  │
│     Error: Timeout en consulta              │
│     Query: SELECT * FROM tramites WHERE...  │
│                                              │
│  [  Exportar Logs  ]  [  Limpiar Filtros  ]│
│                                              │
└──────────────────────────────────────────────┘
```

---

## 5.4 Respaldos y Recuperación

**Duración**: 20 minutos

### Respaldo de Datos

```
Administración → "Respaldos"
```

```
┌──────────────────────────────────────────────┐
│  💾 GESTIÓN DE RESPALDOS                    │
├──────────────────────────────────────────────┤
│                                              │
│  RESPALDOS AUTOMÁTICOS                      │
│  ────────────────────                       │
│  Estado: ✅ Activo                          │
│  Frecuencia: Diario a las 02:00 AM          │
│  Retención: 30 días                         │
│  Último respaldo: 25/05/2025 02:00          │
│  Estado: ✅ Exitoso (2.3 GB)                │
│                                              │
│  RESPALDOS DISPONIBLES                      │
│  ────────────────────                       │
│  📦 25/05/2025 - 02:00 (2.3 GB)             │
│  📦 24/05/2025 - 02:00 (2.2 GB)             │
│  📦 23/05/2025 - 02:00 (2.1 GB)             │
│  ... (Ver todos)                            │
│                                              │
│  ACCIONES                                   │
│  ─────────                                  │
│  [  🔄 Crear Respaldo Manual  ]             │
│  [  ⚙️ Configurar Automáticos  ]            │
│  [  📥 Descargar Respaldo  ]                │
│  [  ♻️ Restaurar desde Respaldo  ]          │
│                                              │
└──────────────────────────────────────────────┘
```

**Mejores Prácticas**:

✅ **Respaldos automáticos diarios**  
✅ **Retención mínima de 30 días**  
✅ **Verificar logs de respaldo semanalmente**  
✅ **Probar restauración mensualmente**  
✅ **Almacenar copias fuera del servidor**  

---

## 5.5 Soporte a Usuarios

**Duración**: 10 minutos

### Canales de Soporte

| Canal | Uso | Tiempo de Respuesta |
|-------|-----|---------------------|
| **Chat en vivo** | Consultas rápidas | Inmediato |
| **Email** | soporte@tramites.gob.pa | 24 horas |
| **Teléfono** | +507-500-0000 ext. 1234 | Horario laboral |
| **Tickets** | Sistema integrado | 48 horas |

### Guía Rápida para Soporte

**1. Recopilar Información**:
- ¿Qué estaba haciendo el usuario?
- ¿Qué mensaje de error vio?
- ¿Cuándo ocurrió el problema?
- ¿Usuario, navegador, sistema operativo?

**2. Reproducir el Problema**:
- Intentar replicar el error
- Verificar en ambiente de prueba

**3. Consultar Documentación**:
- Manual Técnico
- Base de conocimiento
- Logs del sistema

**4. Resolver o Escalar**:
- Si es solucionable: Aplicar fix
- Si es complejo: Escalar a TI

---

## 5.6 Evaluación del Módulo 5

**Quiz del Módulo** (10 preguntas):

1. **¿Cuál es el rol con acceso completo al sistema?**
   - [x] a) Administrador
   - [ ] b) Aprobador
   - [ ] c) Revisor
   - [ ] d) Médico

2. **La duración máxima de sesión recomendada es:**
   - [x] a) 8 horas
   - [ ] b) 24 horas
   - [ ] c) 1 hora
   - [ ] d) Ilimitada

3. **¿Dónde se consultan los logs del sistema?**
   - [x] a) Administración → Logs y Auditoría
   - [ ] b) Dashboard
   - [ ] c) Perfil de usuario
   - [ ] d) No se pueden consultar

4. **Si un usuario olvida su contraseña, el admin debe:**
   - [x] a) Resetear contraseña y enviar link temporal
   - [ ] b) Crear nueva cuenta
   - [ ] c) Eliminar usuario
   - [ ] d) Darle su propia contraseña

5. **Los respaldos automáticos deben ejecutarse:**
   - [x] a) Diariamente
   - [ ] b) Semanalmente
   - [ ] c) Mensualmente
   - [ ] d) No son necesarios

6-10. [Continúa con más preguntas...]

**Puntuación**: ____ / 10 (80% mínimo para administrador)

---

## 📚 Resumen del Módulo

✅ Gestión de usuarios con roles y permisos granulares  
✅ Configuración de parámetros de seguridad y sistema  
✅ Diagnóstico de problemas comunes con soluciones  
✅ Consulta de logs para auditoría  
✅ Respaldos automáticos diarios con retención 30 días  
✅ Soporte multicanal a usuarios finales  

---

[← Módulo 4](modulo-04.md) | [Índice](index.md) | [Ejercicios →](ejercicios.md)
