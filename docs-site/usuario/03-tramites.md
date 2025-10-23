# 3. Módulo de Trámites Base

El Módulo de Trámites Base te permite crear, consultar y gestionar todos tus trámites migratorios desde un solo lugar.

---

## 3.1 Panel de Control

Al iniciar sesión, accederás a tu **Panel de Control Personal**, el centro de comando para todos tus trámites.

### Vista del Panel

```
┌─────────────────────────────────────────────────────────┐
│  🏠 Panel de Control                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Resumen de Trámites                                 │
│  ├─ En Proceso: 2                                       │
│  ├─ Pendientes: 1                                       │
│  ├─ Completados: 5                                      │
│  └─ Total: 8                                            │
│                                                         │
│  🔔 Notificaciones Recientes (3)                        │
│  ├─ Tu solicitud de visa fue aprobada                   │
│  ├─ Documento adicional requerido para PPSH            │
│  └─ Recordatorio: Entrevista programada                 │
│                                                         │
│  ⚡ Acciones Rápidas                                    │
│  ├─ [+ Nuevo Trámite]                                   │
│  ├─ [📋 Mis Trámites]                                   │
│  └─ [🏥 Solicitar PPSH]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Componentes del Panel

=== "📊 Resumen de Trámites"
    Muestra estadísticas rápidas de todos tus trámites:
    
    - **En Proceso**: Trámites activamente revisados por funcionarios
    - **Pendientes**: Requieren acción de tu parte (documentos, información)
    - **Completados**: Trámites finalizados exitosamente
    - **Total**: Número total de trámites creados

=== "🔔 Notificaciones"
    Alertas importantes sobre tus trámites:
    
    - Cambios de estado
    - Solicitudes de documentos adicionales
    - Citas programadas
    - Aprobaciones o rechazos
    - Mensajes de funcionarios

=== "⚡ Acciones Rápidas"
    Accesos directos a funciones principales:
    
    - Crear nuevo trámite
    - Ver todos tus trámites
    - Solicitar PPSH específicamente
    - Consultar estado
    - Descargar documentos

---

## 3.2 Crear un Nuevo Trámite

Proceso completo para iniciar cualquier tipo de trámite migratorio.

### Paso 1: Iniciar Nuevo Trámite

!!! example "Iniciar Solicitud"
    1. En el Panel de Control, haz clic en **"+ Nuevo Trámite"**
    2. Selecciona el tipo de trámite que necesitas:

#### Tipos de Trámites Disponibles

| Icono | Tipo de Trámite | Descripción | Tiempo Est. |
|-------|----------------|-------------|-------------|
| 📋 | **Visa de Turismo** | Para visitantes temporales | 5-7 días |
| 🏢 | **Visa de Trabajo** | Para trabajar en Panamá | 10-15 días |
| 🏠 | **Renovación de Carnet** | Renovar residencia | 7-10 días |
| 📅 | **Prórroga de Estadía** | Extender estadía turística | 3-5 días |
| 🇵🇦 | **Naturalización** | Ciudadanía panameña | 30-60 días |
| 🏥 | **PPSH** | Permiso humanitario especial | 15-30 días |

### Paso 2: Completar Formulario

Una vez seleccionado el tipo de trámite, completa el formulario con tu información.

#### Información Personal

!!! info "Datos Personales Requeridos"
    **Información Básica** (campos obligatorios marcados con *)
    
    - **Nombre completo*** 
      - Nombres
      - Apellido paterno
      - Apellido materno
    
    - **Identificación***
      - Número de documento
      - Tipo de documento (Pasaporte, Cédula, etc.)
      - País emisor
    
    - **Datos Personales***
      - Nacionalidad
      - Fecha de nacimiento
      - Estado civil
      - Género
      - Lugar de nacimiento

#### Información de Contacto

!!! info "Datos de Contacto"
    **Información de Contacto** (obligatorio)
    
    - **Dirección actual*** 
      - Calle y número
      - Ciudad/Distrito
      - Provincia
      - País de residencia actual
    
    - **Contacto***
      - Correo electrónico principal
      - Teléfono móvil
      - Teléfono alternativo (opcional)
      - Correo alternativo (opcional)

#### Detalles del Trámite

!!! info "Especificaciones del Trámite"
    **Información Específica del Trámite**
    
    - **Tipo de solicitud***
      - Categoría específica
      - Subcategoría (si aplica)
    
    - **Fechas Relevantes**
      - Fecha de ingreso a Panamá (si aplica)
      - Fecha deseada de trámite
    
    - **Motivo de la solicitud***
      - Descripción detallada (mínimo 50 caracteres)
    
    - **Información adicional**
      - Comentarios o contexto relevante

### Paso 3: Adjuntar Documentos

Los documentos requeridos varían según el tipo de trámite.

#### Documentos Generalmente Requeridos

!!! warning "Documentos Obligatorios"
    ```
    📎 Documentos Requeridos:
    ✅ Pasaporte (páginas principales)
    ✅ Fotografía tipo pasaporte
    ✅ Certificado de antecedentes penales
    ✅ Comprobante de pago
    ⚪ Carta de motivación (opcional)
    ⚪ Documentos de soporte adicionales
    ```

#### Requisitos Técnicos de Documentos

| Aspecto | Requisito | Detalle |
|---------|-----------|---------|
| **Formatos aceptados** | PDF, JPG, PNG | Preferiblemente PDF para documentos oficiales |
| **Tamaño máximo** | 5 MB por archivo | Para archivos más grandes, comprime o divide |
| **Calidad** | 300 DPI mínimo | Escaneo legible y claro |
| **Color** | Color o escala de grises | Evita escaneos en blanco y negro |
| **Orientación** | Vertical (portrait) | Según el documento original |
| **Idioma** | Español o inglés | Otros idiomas requieren traducción oficial |

#### Proceso de Carga

!!! example "Cómo Adjuntar Documentos"
    **Paso a paso**:
    
    1. **Seleccionar tipo de documento**
       - Elige de la lista desplegable qué tipo de documento vas a subir
    
    2. **Seleccionar archivo**
       - Haz clic en **"Seleccionar archivo"** o **"Browse"**
       - Navega a la ubicación del archivo en tu computadora
       - Selecciona el archivo
    
    3. **Verificar carga**
       - Espera la barra de progreso ⬜⬜⬜⬜⬜ → ⬛⬛⬛⬛⬛
       - Confirma el checkmark verde ✅
       - Ve la miniatura o nombre del archivo
    
    4. **Repetir para cada documento**
       - Carga todos los documentos requeridos
       - Verifica que cada uno tenga el ✅

!!! tip "Consejos para Adjuntar Documentos"
    - 📱 **Desde móvil**: Puedes usar la cámara para capturar documentos directamente
    - 🗂️ **Organiza primero**: Prepara todos los documentos antes de iniciar la solicitud
    - 💾 **Guarda copias**: Mantén copias de respaldo de todos los documentos
    - 🔍 **Verifica calidad**: Asegúrate de que el texto sea legible
    - 📏 **Tamaño correcto**: Comprime archivos grandes con herramientas online

### Paso 4: Revisar y Enviar

Antes de enviar, verifica cuidadosamente toda la información.

#### Lista de Verificación

!!! success "Checklist Final"
    Antes de hacer clic en "Enviar", verifica:
    
    - [ ] ✅ Todos los campos obligatorios están completos
    - [ ] ✅ La información personal es correcta (sin errores tipográficos)
    - [ ] ✅ El correo electrónico es válido y lo revisas frecuentemente
    - [ ] ✅ El teléfono móvil es correcto (incluye código de país)
    - [ ] ✅ Todos los documentos requeridos están adjuntos
    - [ ] ✅ Los documentos son legibles y están completos
    - [ ] ✅ Has leído la declaración jurada
    - [ ] ✅ Aceptas los términos y condiciones

#### Envío de Solicitud

!!! example "Finalizar y Enviar"
    1. **Revisar información**
       - Lee cuidadosamente cada sección
       - Usa el botón "Editar" si necesitas cambiar algo
    
    2. **Aceptar términos**
       - ☑️ Lee la declaración jurada
       - ☑️ Marca "He leído y acepto los términos y condiciones"
       - ☑️ Marca "Confirmo que toda la información es verídica"
    
    3. **Enviar**
       - Haz clic en **"Enviar Solicitud"**
       - Espera la confirmación (no cierres la ventana)
       - Guarda o captura tu número de referencia

#### Confirmación de Envío

Una vez enviada, recibirás una confirmación inmediata:

```
┌─────────────────────────────────────────┐
│  ✅ Solicitud Enviada Exitosamente      │
├─────────────────────────────────────────┤
│                                         │
│  Número de Referencia:                  │
│  TRAM-2025-0001234                      │
│                                         │
│  Estado: EN REVISIÓN                    │
│  Fecha de Solicitud: 22/10/2025         │
│  Tiempo estimado: 5-7 días hábiles      │
│                                         │
│  📧 Recibirás notificaciones por        │
│     correo sobre el progreso.           │
│                                         │
│  📱 Puedes consultar el estado en       │
│     cualquier momento en "Mis Trámites" │
│                                         │
│  [Descargar Comprobante]                │
│  [Ver Detalles]  [Volver al Panel]     │
└─────────────────────────────────────────┘
```

!!! success "Número de Referencia"
    **IMPORTANTE**: Guarda tu número de referencia (ej: TRAM-2025-0001234). Lo necesitarás para:
    
    - 🔍 Consultar el estado de tu trámite
    - 📞 Comunicarte con soporte
    - 📧 Verificar correspondencia oficial
    - 🏢 Presentarte en oficinas de migración (si requerido)

---

## 3.3 Consultar Mis Trámites

Revisa el estado y progreso de todos tus trámites en un solo lugar.

### Acceder a Mis Trámites

!!! info "Cómo Acceder"
    1. En el menú principal, haz clic en **"📋 Mis Trámites"**
    2. O desde el Panel de Control, en **"Ver todos los trámites"**

### Vista de Lista de Trámites

```
┌────────────────────────────────────────────────────────────────────┐
│  📋 Mis Trámites                                  [+ Nuevo Trámite] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  🔍 Buscar: [_____________]  Filtrar: [Todos ▼]  Ordenar: [Fecha ▼]│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ TRAM-2025-0001234                            🟡 EN REVISIÓN   │ │
│  │ Solicitud de Visa de Trabajo                                 │ │
│  │ Creado: 22/10/2025  |  Actualizado: 22/10/2025               │ │
│  │ [Ver Detalles] [Descargar] [Comentarios]                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ TRAM-2025-0001100                            ✅ COMPLETADO    │ │
│  │ Renovación de Carnet de Residente                            │ │
│  │ Creado: 15/10/2025  |  Completado: 20/10/2025                │ │
│  │ [Ver Detalles] [Descargar Certificado]                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ TRAM-2025-0000987                            🔴 REQUIERE ACCIÓN│ │
│  │ Prórroga de Estadía Turística                                │ │
│  │ Creado: 10/10/2025  |  ⚠️ Documento adicional requerido      │ │
│  │ [Ver Detalles] [Completar Información]                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Mostrando 3 de 8 trámites           [1] 2 3 ›                   │
└────────────────────────────────────────────────────────────────────┘
```

### Estados de Trámites

Cada trámite puede tener diferentes estados durante su ciclo de vida:

| Estado | Icono | Descripción | Acción Requerida |
|--------|-------|-------------|------------------|
| **Borrador** | 📝 | No enviado aún | Completar y enviar |
| **En Revisión** | 🟡 | Revisión inicial | Ninguna - esperar |
| **Documentación Pendiente** | 🔴 | Falta documentos | Subir documentos |
| **En Proceso** | 🔵 | Evaluación activa | Ninguna - esperar |
| **Entrevista Programada** | 📅 | Cita agendada | Asistir a la cita |
| **Aprobado** | ✅ | Trámite exitoso | Recoger documentos |
| **Rechazado** | ❌ | No aprobado | Ver motivos |
| **Cancelado** | ⚫ | Cancelado por usuario | Ninguna |

### Herramientas de Filtrado y Búsqueda

=== "🔍 Búsqueda"
    Busca trámites por:
    
    - Número de referencia (ej: TRAM-2025-0001234)
    - Tipo de trámite (ej: "Visa de Trabajo")
    - Palabras clave

=== "🎯 Filtros"
    Filtra por:
    
    - **Estado**: Todos, En Proceso, Completados, Pendientes
    - **Tipo**: Visas, Renovaciones, Permisos, PPSH
    - **Fecha**: Última semana, Último mes, Último año
    - **Prioridad**: Urgentes, Normales

=== "📊 Ordenamiento"
    Ordena por:
    
    - Fecha de creación (más reciente primero)
    - Fecha de actualización
    - Estado alfabético
    - Tipo de trámite

---

## 3.4 Ver Detalles de un Trámite

Accede a información completa y detallada de cualquier trámite.

### Pantalla de Detalles

Al hacer clic en **"Ver Detalles"** de cualquier trámite:

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Detalles del Trámite                        [⬅ Volver]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Trámite: TRAM-2025-0001234                                     │
│  Tipo: Solicitud de Visa de Trabajo                            │
│  Estado: 🟡 EN REVISIÓN                                         │
│  Funcionario Asignado: María González (SNM-045)                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📊 Progreso del Trámite                                   │ │
│  │                                                           │ │
│  │  ✅ Solicitud Recibida      (22/10/2025 10:30)           │ │
│  │  ✅ Documentos Validados    (22/10/2025 14:15)           │ │
│  │  🔄 Revisión Técnica        (En progreso...)             │ │
│  │  ⏸️  Entrevista             (Pendiente)                   │ │
│  │  ⏸️  Decisión Final         (Pendiente)                   │ │
│  │                                                           │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 40%               │ │
│  │                                                           │ │
│  │  Tiempo estimado restante: 3-5 días hábiles              │ │
│  │  Tiempo transcurrido: 2 días                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📎 Documentos Adjuntos                                    │ │
│  │                                                           │ │
│  │  ✓ Pasaporte.pdf              2.1 MB  [Ver] [Descargar]  │ │
│  │  ✓ Foto_Pasaporte.jpg         156 KB  [Ver] [Descargar]  │ │
│  │  ✓ Antecedentes_Penales.pdf   1.8 MB  [Ver] [Descargar]  │ │
│  │  ✓ Comprobante_Pago.pdf       245 KB  [Ver] [Descargar]  │ │
│  │                                                           │ │
│  │  [+ Adjuntar Documento Adicional]                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 💬 Historial de Comunicación (3)                          │ │
│  │                                                           │ │
│  │  📌 María González (Funcionario) - 22/10/2025 14:20      │ │
│  │     "Documentos validados correctamente. Su solicitud    │ │
│  │      pasa a revisión técnica. Recibirá notificación de   │ │
│  │      la fecha de entrevista en 2-3 días hábiles."        │ │
│  │                                                           │ │
│  │  📌 Sistema - 22/10/2025 10:35                           │ │
│  │     "Su solicitud ha sido recibida y asignada al         │ │
│  │      funcionario María González."                        │ │
│  │                                                           │ │
│  │  📌 Usted - 22/10/2025 10:30                             │ │
│  │     "Solicitud de Visa de Trabajo enviada."              │ │
│  │                                                           │ │
│  │  [💬 Enviar Mensaje al Funcionario]                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [📥 Descargar Comprobante] [🚫 Cancelar Solicitud] [📞 Ayuda] │
└─────────────────────────────────────────────────────────────────┘
```

### Secciones de Detalles

=== "📊 Progreso"
    **Timeline visual del trámite**
    
    - Muestra cada fase del proceso
    - Indica estado actual con icono 🔄
    - Fases completadas marcadas con ✅
    - Fases pendientes marcadas con ⏸️
    - Barra de progreso porcentual
    - Tiempo estimado restante

=== "📎 Documentos"
    **Gestión de documentos**
    
    - Lista todos los documentos adjuntos
    - Ver documentos en el navegador
    - Descargar documentos individualmente
    - Agregar documentos adicionales si es necesario
    - Ver tamaño y tipo de cada archivo

=== "💬 Comunicación"
    **Historial completo**
    
    - Mensajes del sistema
    - Comentarios de funcionarios
    - Tus mensajes enviados
    - Fecha y hora de cada interacción
    - Opción de enviar nuevos mensajes

---

## 3.5 Actualizar Información de un Trámite

En algunos casos, necesitarás agregar información o documentos adicionales.

### Cuándo Puedes Actualizar

!!! info "Trámites Actualizables"
    Puedes actualizar un trámite cuando:
    
    - ✅ El estado es **"Documentación Pendiente"**
    - ✅ El funcionario solicitó información adicional
    - ✅ El estado es **"En Revisión"** (antes de aprobación)
    - ❌ **NO** puedes actualizar si está "Aprobado", "Rechazado" o "Completado"

### Proceso de Actualización

!!! example "Cómo Actualizar un Trámite"
    **Agregar Documentos Adicionales**:
    
    1. Ve a **"Ver Detalles"** del trámite
    2. En la sección **"Documentos Adjuntos"**
    3. Haz clic en **"+ Adjuntar Documento Adicional"**
    4. Selecciona el **tipo de documento** de la lista
    5. Haz clic en **"Seleccionar archivo"**
    6. Carga el archivo (máx. 5 MB)
    7. Haz clic en **"Guardar"**
    8. Recibirás confirmación: **"Documento agregado exitosamente"**
    
    **Enviar Mensaje al Funcionario**:
    
    1. En la sección **"Historial de Comunicación"**
    2. Haz clic en **"💬 Enviar Mensaje al Funcionario"**
    3. Escribe tu mensaje (máx. 500 caracteres)
    4. Haz clic en **"Enviar"**
    5. El funcionario recibirá una notificación

!!! warning "Importante"
    - Solo puedes adjuntar documentos cuando el trámite está en ciertos estados
    - Los documentos adicionales deben cumplir los mismos requisitos técnicos
    - Cada actualización genera una notificación al funcionario asignado
    - Guarda la confirmación de cada documento agregado

---

## Navegación

[← Acceso al Sistema](02-acceso.md) | [Inicio](index.md) | [Módulo PPSH →](04-ppsh.md)
