# Documentación de Base de Datos - Sistema de Trámites Migratorios de Panamá

## Índice
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Módulos del Sistema](#módulos-del-sistema)
4. [Catálogos y Tablas de Referencia](#catálogos-y-tablas-de-referencia)
5. [Relaciones Principales](#relaciones-principales)
6. [Diccionario de Datos](#diccionario-de-datos)
7. [Índices y Optimizaciones](#índices-y-optimizaciones)

---

## Introducción

Este documento describe la estructura de la base de datos del Sistema Integrado de Migración (SIM) de Panamá. El sistema gestiona:

- **Filiaciones y expedientes de extranjeros**
- **Movimientos migratorios** (entradas y salidas)
- **Impedimentos y alertas**
- **Trámites y procesos administrativos**
- **Visas y permisos**
- **Control de vuelos y pasajeros**

### Convenciones de Nomenclatura

- **Prefijos de tablas:**
  - `SIM_FI_` - Filiación e identificación de personas
  - `SIM_MM_` - Movimiento Migratorio
  - `SIM_IM_` - Impedimentos y alertas
  - `SIM_FT_` - Flujo de Trámites
  - `SIM_GE_` - Datos Generales y catálogos
  - `SIM_VI_` - Visas
  - `SIM_AL_` - Asistencia Legal
  - `SEG_TB_` - Seguridad y usuarios
  - `BCK_` - Respaldos

- **Convenciones de campos:**
  - `COD_` - Código/identificador
  - `NOM_` - Nombre/descripción
  - `FEC_` - Fecha
  - `NUM_` - Número
  - `IND_` - Indicador (bit)
  - `OBS_` - Observaciones
  - `ID_` - Identificador único

---

## Arquitectura General

### Modelo Entidad-Relación

```
┌─────────────────────┐
│  SIM_FI_GENERALES   │◄──┐
│  (Datos Persona)    │   │
└─────────────────────┘   │
         │                │
         │ 1:N            │
         ▼                │
┌─────────────────────┐   │
│ SIM_FT_TRAMITE_E/D  │   │
│ (Trámites)          │   │
└─────────────────────┘   │
         │                │
         │ 1:N            │
         ▼                │
┌─────────────────────┐   │
│   SIM_FI_CARTA_NAT  │   │
│   SIM_FI_PRORR_TUR  │   │
│   SIM_FI_DEP_EXP    │───┘
│   (Resoluciones)    │
└─────────────────────┘

┌─────────────────────┐
│  SIM_MM_BOLETA      │
│  (Mov. Migratorio)  │
└─────────────────────┘
         │
         │ N:M
         ▼
┌─────────────────────┐
│  SIM_IM_IMPEDIDO    │
│  (Personas)         │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│ SIM_IM_IMPEDIMEN    │
│ (Alertas)           │
└─────────────────────┘
```

---

## Módulos del Sistema

### 1. Módulo de Filiación (SIM_FI_*)

Gestiona los datos personales y expedientes de extranjeros.

#### Tablas Principales:

**SIM_FI_GENERALES** - Datos generales de personas
- Información personal (nombres, apellidos, fecha nacimiento)
- Datos biométricos (estatura, color ojos, cabello, piel)
- Información familiar (padre, madre, cónyuge)
- Datos migratorios (país procedencia, punto entrada)
- Estado migratorio actual

**SIM_FI_PASAPORTE** - Registro de pasaportes
- Pasaporte actual y anterior
- Fecha expedición y vencimiento
- Lugar de expedición

**SIM_FI_CARTA_NAT** - Solicitudes de carta de naturalización
- Datos de solicitud y aprobación
- Referencias a trámites gubernamentales
- Historial de resoluciones

**SIM_FI_CITACION** - Citaciones a extranjeros
- Fecha de citación y vencimiento
- Causa de citación
- Número de carnet emitido

**SIM_FI_DEP_EXP** - Deportaciones y expulsiones
- Causa y fecha
- Datos del vuelo
- Estado de la resolución

**SIM_FI_PRORR_TUR** - Prórrogas turísticas
- Fecha emisión y vencimiento
- Días solicitados vs autorizados
- Motivo de prórroga

**SIM_FI_RESIDENCIA** - Cambios de residencia
- Dirección actual
- Historial de cambios

**SIM_FI_OBSERVA** - Observaciones de expedientes
- Notas importantes
- Historial de observaciones

**SIM_FI_MULTAS** - Multas aplicadas
- Monto y causa
- Estado de pago

### 2. Módulo de Movimiento Migratorio (SIM_MM_*)

Controla entradas y salidas del país.

#### Tablas Principales:

**SIM_MM_BOLETA** - Boletas de entrada/salida
- Datos del viajero
- Información del documento de viaje
- Datos del vuelo/transporte
- Inspector que procesó
- Fecha y hora del movimiento
- Observaciones

**SIM_BMM_VUELO** - Registro de vuelos
- Compañía aérea
- Número de vuelo
- Origen, escala, destino
- Estado del vuelo

**SIM_BMM_PASAJERO** - Pasajeros por vuelo
- Lista de pasajeros
- Relación con vuelo

**SIM_MM_ANOMALIA** - Anomalías detectadas
- Alertas generadas
- Acciones tomadas

**SIM_MM_DEVOL_PAIS** - Devoluciones al país de origen
- Motivo de devolución
- Datos del vuelo de retorno

**SIM_MM_IMAGEN_PASAPORTE** - Imágenes de documentos
- Foto del pasaporte
- Foto del viajero

**SIM_MM_IMAGEN_HUELLAS** - Huellas dactilares
- Huellas de ambas manos
- Información biométrica

### 3. Módulo de Impedimentos (SIM_IM_*)

Gestiona personas con impedimentos de salida/entrada.

#### Tablas Principales:

**SIM_IM_IMPEDIDO** - Personas con impedimento
- Datos personales
- Características físicas
- Foto
- Particularidades

**SIM_IM_IMPEDIMEN** - Impedimentos activos
- Tipo de impedimento
- Autoridad que lo emite
- Documento oficial
- Vigencia
- Acción a tomar

**SIM_IM_LEVANTAMI** - Levantamientos de impedimentos
- Temporal o definitivo
- Autoridad que autoriza
- Período permitido

**SIM_IM_ALIAS** - Alias conocidos
- Nombres alternativos

**SIM_IM_OTROS_NOM** - Otros nombres usados
- Variaciones de nombres

**SIM_IM_ACCION_EJE** - Acciones ejecutadas
- Cuando se detecta un impedido
- Funcionario que atendió
- Acción tomada

**SIM_IM_PASA_ROBA** - Pasaportes robados/extraviados
- Rango de pasaportes
- País emisor
- Nota de autoridad

**SIM_IM_ALERTA** - Tipos de alertas
- Catálogo de alertas disponibles

**SIM_IM_ACCION** - Tipos de acciones
- Catálogo de acciones posibles

### 4. Módulo de Trámites (SIM_FT_*)

Control de flujo de trámites administrativos.

#### Tablas Principales:

**SIM_FT_TRAMITE_E** - Encabezado de trámite
- Información general del trámite
- Fechas inicio y fin
- Estado y conclusión

**SIM_FT_TRAMITE_D** - Detalle de pasos
- Cada paso del proceso
- Sección responsable
- Usuario asignado
- Observaciones por paso

**SIM_FT_TRAMITES** - Catálogo de tipos de trámites
- Descripción del trámite
- Página web asociada

**SIM_FT_PASOS** - Pasos de cada trámite
- Secuencia de actividades

**SIM_FT_PASOXTRAM** - Configuración de flujo
- Sección responsable de cada paso
- Paso siguiente

**SIM_FT_USUA_SEC** - Usuarios por sección
- Asignación de responsables

**SIM_FT_TRAMITE_CIERRE** - Cierre de trámites
- Usuario que cierra
- Fecha de cierre

**SIM_FT_DEPENDTE_CIERRE** - Dependientes en cierre
- Dependientes incluidos en trámite

### 5. Módulo de Seguridad (SEG_TB_*, sec_*)

Control de usuarios y permisos.

#### Tablas Principales:

**SEG_TB_USUARIOS** - Usuarios del sistema
- Credenciales
- Estado de cuenta
- Control de intentos fallidos
- Registro de cambios de contraseña

**SEG_TB_ROLES** - Roles del sistema
- Definición de roles

**SEG_TB_USUA_ROLE** - Asignación de roles
- Usuario-Rol

**sec_users** / **sec_groups** / **sec_groups_apps** - Sistema de permisos
- Control granular de acceso
- Permisos por aplicación

**SEG_TB_ERROR_LOG** - Log de errores de autenticación
- Intentos fallidos
- Control de seguridad

---

## Catálogos y Tablas de Referencia

### Catálogos Generales (SIM_GE_*)

| Tabla | Descripción |
|-------|-------------|
| `SIM_GE_PAIS` | Países con códigos ISO |
| `SIM_GE_PACIU` | Ciudades por país |
| `SIM_GE_OCUPACION` | Ocupaciones/profesiones |
| `SIM_GE_SEXO` | Masculino/Femenino |
| `SIM_GE_EST_CIVIL` | Estados civiles |
| `SIM_GE_AGENCIA` | Agencias migratorias |
| `SIM_GE_SECCION` | Secciones por agencia |
| `SIM_GE_PUESTO` | Puestos de control |
| `SIM_GE_CIA_TRANSP` | Compañías de transporte |
| `SIM_GE_VIA_TRANSP` | Vías de transporte (aérea, marítima, terrestre) |
| `SIM_GE_REGION` | Regiones administrativas |
| `SIM_GE_CONTINENTE` | Continentes |
| `SIM_GE_AUTORIDAD` | Autoridades emisoras |
| `SIM_GE_CABELLO` | Colores de cabello |
| `SIM_GE_OJOS` | Colores de ojos |
| `SIM_GE_PIEL` | Colores de piel |
| `SIM_GE_COMPLEXION` | Tipos de complexión |

### Catálogos Específicos

**Movimiento Migratorio:**
- `SIM_MM_DOC_VIAJE` - Tipos de documentos de viaje
- `SIM_MM_MOT_VIAJE` - Motivos de viaje
- `SIM_MM_EST_VUELO` - Estados de vuelo
- `SIM_MM_ETNIA` - Etnias
- `SIM_GE_CAT_ENTRAD` - Categorías de entrada

**Filiación:**
- `SIM_FI_CALIDAD` - Calidades migratorias
- `SIM_FI_CAUSAS` - Causas de cancelación
- `SIM_FI_TIPO_REG` - Tipos de registro
- `SIM_FI_ACTI_INAC` - Activo/Inactivo
- `SIM_FI_CONDICION` - Condiciones

**Trámites:**
- `SIM_FT_ESTATUS` - Estados de trámite
- `SIM_FT_CONCLUSION` - Tipos de conclusión
- `SIM_FT_PRIORIDAD` - Niveles de prioridad

---

## Relaciones Principales

### 1. Persona → Expediente

```sql
SIM_FI_GENERALES (NUM_REG_FILIACION) 
    → SIM_FI_PASAPORTE (NUM_REG_FILIACION)
    → SIM_FI_CITACION (NUM_REG_FILIACION)
    → SIM_FI_OBSERVA (NUM_REG_FILIACION)
    → SIM_FI_MULTAS (NUM_REG_FILIACION)
```

### 2. Persona → Trámites

```sql
SIM_FI_GENERALES (NUM_REG_FILIACION)
    → SIM_FT_TRAMITE_E (NUM_REGISTRO)
        → SIM_FT_TRAMITE_D (NUM_REGISTRO, NUM_TRAMITE, NUM_ANNIO)
```

### 3. Movimiento Migratorio → Boleta

```sql
SIM_MM_BOLETA (COD_BOLETA)
    ↔ SIM_BMM_VUELO (COM_AEREA, NUM_VUELO, FEC_VUELO)
    → SIM_MM_ANOMALIA (COD_BOLETA)
    → SIM_IM_ACCION_EJE (COD_BOLETA)
```

### 4. Impedido → Impedimento

```sql
SIM_IM_IMPEDIDO (COD_IMPEDIDO)
    → SIM_IM_IMPEDIMEN (COD_IMPEDIDO)
        → SIM_IM_LEVANTAMI (COD_IMPEDIMENTO)
    → SIM_IM_ALIAS (COD_IMPEDIDO)
    → SIM_IM_OTROS_NOM (COD_IMPEDIDO)
```

---

## Diccionario de Datos

### Campos Comunes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID_USUARIO` | varchar(20) | Usuario que crea/modifica |
| `FEC_ACTUALIZA` | datetime | Fecha última actualización |
| `IND_ESTADO` / `IND_ESTATUS` | varchar(1) | Estado del registro (A=Activo, I=Inactivo) |
| `COD_STAT_ACTUAL` | varchar(3) | Estado migratorio actual |
| `COD_STAT_ANTER` | varchar(3) | Estado migratorio anterior |

### Estados Migratorios Comunes

- **Turista** - Visitante temporal
- **Residente Temporal** - Permiso temporal de residencia
- **Residente Permanente** - Residencia definitiva
- **Refugiado** - Estatus de refugio
- **En Trámite** - Proceso en curso

### Tipos de Movimiento (TIPO_MOV)

- **E** - Entrada
- **S** - Salida
- **T** - Tránsito

---

## Índices y Optimizaciones

### Índices Principales

**Por Performance:**
- Todos los códigos primarios (COD_IMPEDIDO, COD_BOLETA, etc.)
- Campos de búsqueda frecuente (NUM_PASAPORTE, APELLIDO, NOMBRE)
- Fechas de movimiento (FECHA_ENTRADA, FECHA_SALIDA)
- Estados y status

**Por Integridad:**
- Foreign Keys a tablas de catálogo
- Relaciones maestro-detalle

### Consideraciones de Performance

1. **Particionamiento recomendado:**
   - `SIM_MM_BOLETA` por año
   - `SIM_FT_TRAMITE_E/D` por año (NUM_ANNIO)
   - Tablas de log por mes

2. **Archivado:**
   - Movimientos mayores a 5 años → tabla histórica
   - Trámites cerrados → tabla de archivo

3. **Campos calculados:**
   - Edad (desde FECHA_NACIMIENTO)
   - Tiempo de estadía
   - Días de vigencia restantes

---

## Integraciones

### Sistemas Externos

1. **Interpol** - Base de datos de pasaportes robados
2. **SENAFRONT** - Control fronterizo
3. **TRIBUNAL ELECTORAL** - Verificación de cédulas
4. **Aerolíneas** - Manifiestos de pasajeros (API/PNR)
5. **Sistema de Visas** - Consulta de visas vigentes

### APIs y Servicios

- Validación biométrica
- Consulta de alertas internacionales
- Notificaciones automáticas
- Reportes estadísticos

---

## Notas Importantes

### Campos de Auditoría

Todas las tablas principales incluyen:
- `ID_USUAR_CREA` - Quien creó el registro
- `ID_USUAR_MODIF` - Último usuario que modificó
- `FEC_CREA_REG` - Fecha de creación
- `FEC_MODIF_REG` - Fecha de modificación

### Tablas de Log

El sistema mantiene logs en:
- `SIM_LOG_MODIFICAC` - Cambios en impedimentos
- `SIM_LOG_IMPEDIMEN` - Detección de impedidos
- `SIM_LOG_IDENTIFIC` - Identificaciones en puestos
- `SEG_TB_ERROR_LOG` - Errores de autenticación
- `sc_log` - Log general de aplicación

### Imágenes y Documentos

Las imágenes se almacenan en campos tipo `IMAGE`:
- Fotos de personas
- Huellas dactilares
- Documentos escaneados
- Pasaportes

> **Nota:** Considerar migrar a almacenamiento de archivos con referencias en BD para mejor performance.

---

## Migración y Mantenimiento

### Scripts de Mantenimiento Recomendados

1. Limpieza de registros temporales
2. Actualización de estados expirados
3. Consolidación de logs
4. Backup incremental de imágenes
5. Recálculo de índices

### Vistas Recomendadas

```sql
-- Vista de personas activas con su estado actual
CREATE VIEW VW_PERSONAS_ACTIVAS AS
SELECT 
    fg.NUM_REG_FILIACION,
    fg.NOM_PRIMER_NOMB + ' ' + fg.NOM_PRIMER_APELL AS NOMBRE_COMPLETO,
    fg.NUM_PASAPORTE,
    fg.COD_STAT_ACTUAL,
    fg.FEC_VENCE_STATUS
FROM SIM_FI_GENERALES fg
WHERE fg.COD_STAT_ACTUAL IS NOT NULL;

-- Vista de impedidos vigentes
CREATE VIEW VW_IMPEDIDOS_VIGENTES AS
SELECT 
    ii.COD_IMPEDIDO,
    ii.PRIMER_NOMBRE + ' ' + ii.PRIMER_APELLIDO AS NOMBRE_COMPLETO,
    im.COD_ALERTA,
    im.COD_ACCION,
    im.IND_LEVANTADO
FROM SIM_IM_IMPEDIDO ii
INNER JOIN SIM_IM_IMPEDIMEN im ON ii.COD_IMPEDIDO = im.COD_IMPEDIDO
WHERE im.IND_LEVANTADO = 0;
```

---

## Conclusión

Esta base de datos representa un sistema complejo de gestión migratoria que abarca:
- Identificación y registro de personas
- Control de movimientos transfronterizos
- Gestión de trámites administrativos
- Control de impedimentos y alertas
- Seguridad y auditoría

El diseño permite:
- Trazabilidad completa de operaciones
- Control granular de acceso
- Integración con sistemas externos
- Generación de reportes y estadísticas
- Cumplimiento normativo

---

*Documento generado el 13 de Octubre de 2025*
*Versión 1.0*
