# 🌐 Sistema de Acceso Público - Portal Ciudadano

## 📋 Descripción General

Sistema que permite a **ciudadanos y abogados** consultar el estado de sus trámites sin necesidad de crear una cuenta o iniciar sesión con contraseña. El acceso se valida mediante el **número de solicitud** y un **dato personal** (pasaporte o cédula).

---

## 🎯 Características Principales

### ✅ **Acceso Sin Contraseña**
- No requiere creación de cuenta
- No requiere autenticación tradicional
- Validación por datos de la solicitud

### 🔐 **Validación de Identidad**
- **Número de Solicitud** (ej: PPSH-2025-00001)
- **Tipo de Documento**: Pasaporte o Cédula
- **Número de Documento**: Debe coincidir con el solicitante

### 👁️ **Vistas Limitadas**
- Solo pueden ver información de SU solicitud
- No pueden acceder a otras solicitudes
- Información filtrada según el workflow y etapa actual

---

## 📐 Arquitectura de Seguridad

### 🔒 Modelo de Acceso

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCESO PÚBLICO (SIN LOGIN)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Ciudadano/Abogado ingresa:                                  │
│  ┌──────────────────────────────────────────────┐           │
│  │ Número de Solicitud: PPSH-2025-00001         │           │
│  │ Tipo de Documento:   PASAPORTE               │           │
│  │ Número de Documento: N123456789              │           │
│  └──────────────────────────────────────────────┘           │
│                          ↓                                    │
│                  VALIDACIÓN BACKEND                          │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────┐           │
│  │ 1. Verificar que la solicitud existe         │           │
│  │ 2. Comparar número de documento               │           │
│  │ 3. Generar token temporal (15 min)            │           │
│  │ 4. Retornar datos filtrados de la solicitud  │           │
│  └──────────────────────────────────────────────┘           │
│                          ↓                                    │
│              VISTA PÚBLICA DE SOLICITUD                      │
│  ┌──────────────────────────────────────────────┐           │
│  │ ✓ Estado del trámite                          │           │
│  │ ✓ Etapas del workflow (solo las visibles)    │           │
│  │ ✓ Documentos requeridos                       │           │
│  │ ✓ Observaciones públicas                      │           │
│  │ ✓ Próximo paso                                │           │
│  │ ✗ Datos sensibles internos                    │           │
│  │ ✗ Notas de analistas                          │           │
│  │ ✗ Información de otros solicitantes           │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Esquema de Base de Datos

### Tabla: `SEG_TB_ACCESO_PUBLICO`

```sql
CREATE TABLE SEG_TB_ACCESO_PUBLICO (
    acceso_publico_id INT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id INT NOT NULL,
    numero_documento NVARCHAR(50) NOT NULL,
    tipo_documento NVARCHAR(20) NOT NULL CHECK (tipo_documento IN ('PASAPORTE', 'CEDULA')),
    fecha_acceso DATETIME2 NOT NULL DEFAULT GETDATE(),
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(500),
    token_temporal NVARCHAR(500), -- JWT temporal de 15 minutos
    token_expiracion DATETIME2,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta DATETIME2 NULL,
    
    -- Auditoría
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_AccesoPublico_Solicitud 
        FOREIGN KEY (solicitud_id) REFERENCES PPSH_TB_SOLICITUD(solicitud_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IDX_AccesoPublico_Solicitud ON SEG_TB_ACCESO_PUBLICO(solicitud_id);
CREATE INDEX IDX_AccesoPublico_NumeroDocumento ON SEG_TB_ACCESO_PUBLICO(numero_documento);
CREATE INDEX IDX_AccesoPublico_FechaAcceso ON SEG_TB_ACCESO_PUBLICO(fecha_acceso);
CREATE INDEX IDX_AccesoPublico_IP ON SEG_TB_ACCESO_PUBLICO(ip_address);
```

### Campos para almacenar visibilidad en workflows

```sql
-- Agregar a WORKFLOW_TB_ETAPA
ALTER TABLE WORKFLOW_TB_ETAPA
ADD visible_publico BIT DEFAULT 0; -- Si es visible para acceso público

-- Agregar a WORKFLOW_TB_DOCUMENTO_ETAPA
ALTER TABLE WORKFLOW_TB_DOCUMENTO_ETAPA
ADD visible_publico BIT DEFAULT 1; -- Si el documento es visible públicamente
```

---

## 🔐 Medidas de Seguridad

### 1. **Limitación de Intentos**
```python
# Backend: app/services/public_access_service.py

MAX_INTENTOS_FALLIDOS = 5
TIEMPO_BLOQUEO_MINUTOS = 30

async def validar_acceso(
    numero_solicitud: str,
    numero_documento: str,
    tipo_documento: str,
    ip_address: str
):
    # Verificar si la IP está bloqueada
    intentos = await get_intentos_fallidos(ip_address)
    if intentos >= MAX_INTENTOS_FALLIDOS:
        bloqueado_hasta = await get_bloqueo_hasta(ip_address)
        if bloqueado_hasta and bloqueado_hasta > datetime.now():
            raise HTTPException(
                status_code=429,
                detail=f"Demasiados intentos fallidos. Intente nuevamente después de {TIEMPO_BLOQUEO_MINUTOS} minutos."
            )
    
    # Buscar solicitud
    solicitud = await db.query(Solicitud).filter(
        Solicitud.numero_solicitud == numero_solicitud
    ).first()
    
    if not solicitud:
        await registrar_intento_fallido(ip_address)
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Validar documento del solicitante
    if (solicitud.solicitante_documento != numero_documento or
        solicitud.solicitante_tipo_documento != tipo_documento):
        await registrar_intento_fallido(ip_address)
        raise HTTPException(status_code=403, detail="Los datos no coinciden")
    
    # Generar token temporal
    token = crear_token_temporal(solicitud.solicitud_id, numero_documento)
    
    # Registrar acceso exitoso
    await registrar_acceso_publico(
        solicitud_id=solicitud.solicitud_id,
        numero_documento=numero_documento,
        tipo_documento=tipo_documento,
        ip_address=ip_address,
        token=token
    )
    
    return {
        "access_token": token,
        "solicitud": filtrar_datos_publicos(solicitud)
    }
```

### 2. **Token Temporal**
```python
# Token JWT con expiración de 15 minutos
from datetime import datetime, timedelta
import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

def crear_token_temporal(solicitud_id: int, numero_documento: str) -> str:
    payload = {
        "solicitud_id": solicitud_id,
        "numero_documento": numero_documento,
        "tipo": "public_access",
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def validar_token_temporal(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El token ha expirado. Por favor, vuelva a ingresar.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
```

### 3. **Filtrado de Datos Sensibles**
```python
def filtrar_datos_publicos(solicitud: Solicitud) -> dict:
    """
    Retorna solo la información que el solicitante puede ver
    """
    return {
        "numero_solicitud": solicitud.numero_solicitud,
        "tipo_tramite": solicitud.tipo_tramite.nombre,
        "fecha_solicitud": solicitud.fecha_solicitud,
        "estado_actual": solicitud.estado_actual,
        "solicitante": {
            "nombre_completo": solicitud.solicitante_nombre_completo,
            "numero_documento": solicitud.solicitante_documento,
        },
        "workflow": {
            "etapa_actual": solicitud.etapa_actual.nombre if solicitud.etapa_actual else None,
            "etapas": [
                {
                    "nombre": etapa.nombre,
                    "estado": etapa.estado,
                    "fecha_inicio": etapa.fecha_inicio,
                    "fecha_fin": etapa.fecha_fin,
                }
                for etapa in solicitud.workflow_etapas
                if etapa.visible_publico  # Solo etapas marcadas como públicas
            ]
        },
        "documentos_requeridos": [
            {
                "nombre": doc.documento.nombre,
                "cargado": doc.cargado,
                "fecha_carga": doc.fecha_carga,
            }
            for doc in solicitud.documentos
            if doc.visible_publico  # Solo documentos públicos
        ],
        "observaciones": solicitud.observaciones_publicas,  # Campo separado
        "proximo_paso": solicitud.proximo_paso_publico,
    }
```

### 4. **Rate Limiting por IP**
```python
# Middleware para limitar requests por IP
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/public/validar-acceso")
@limiter.limit("5/minute")  # Máximo 5 intentos por minuto
async def validar_acceso_endpoint(
    request: Request,
    data: ValidarAccesoRequest
):
    # ... lógica de validación
    pass
```

---

## 📡 API Endpoints

### 1. **POST /api/v1/public/validar-acceso**

**Request:**
```json
{
  "numero_solicitud": "PPSH-2025-00001",
  "tipo_documento": "PASAPORTE",
  "numero_documento": "N123456789"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "solicitud": {
    "numero_solicitud": "PPSH-2025-00001",
    "tipo_tramite": "Permiso Provisional de Salida Humanitaria",
    "fecha_solicitud": "2025-01-15T10:30:00",
    "estado_actual": "EN_REVISION",
    "solicitante": {
      "nombre_completo": "Juan Carlos Pérez González",
      "numero_documento": "N123456789"
    },
    "workflow": {
      "etapa_actual": "Revisión de Documentos",
      "etapas": [...]
    },
    "documentos_requeridos": [...],
    "observaciones": "Se requiere completar la carga del comprobante de pago.",
    "proximo_paso": "Cargar el comprobante de pago de la tasa administrativa."
  }
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "Los datos ingresados no coinciden con ninguna solicitud activa."
}
```

**Response (429 Too Many Requests):**
```json
{
  "detail": "Demasiados intentos fallidos. Intente nuevamente después de 30 minutos."
}
```

### 2. **GET /api/v1/public/solicitudes/{numero_solicitud}**

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "numero_solicitud": "PPSH-2025-00001",
  "tipo_tramite": "Permiso Provisional de Salida Humanitaria",
  "estado_actual": "EN_REVISION",
  "workflow": {...},
  "documentos_requeridos": [...]
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "El token ha expirado. Por favor, vuelva a ingresar."
}
```

---

## 🎨 Flujo de Usuario

### 1. **Ingreso al Portal**
```
Usuario visita: https://tramites.migracion.gob.pa/acceso-publico

┌─────────────────────────────────────────┐
│     🏛️ CONSULTA DE SOLICITUD            │
├─────────────────────────────────────────┤
│                                          │
│  Número de Solicitud:                   │
│  ┌─────────────────────────────┐       │
│  │ PPSH-2025-00001              │       │
│  └─────────────────────────────┘       │
│                                          │
│  Tipo de Documento:                     │
│  ┌─────────────────────────────┐       │
│  │ ▼ Pasaporte                  │       │
│  └─────────────────────────────┘       │
│                                          │
│  Número de Pasaporte:                   │
│  ┌─────────────────────────────┐       │
│  │ N123456789                   │       │
│  └─────────────────────────────┘       │
│                                          │
│      [Consultar Solicitud]              │
│                                          │
└─────────────────────────────────────────┘
```

### 2. **Vista de Solicitud**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Nueva Consulta      PPSH-2025-00001    [EN_REVISION]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  👤 Información del Solicitante                              │
│  ┌─────────────────────────────────────┐                    │
│  │ Juan Carlos Pérez González          │                    │
│  │ Pasaporte: N123456789                │                    │
│  │ Fecha de Solicitud: 15/01/2025       │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
│  📊 Estado del Trámite                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ Recepción de Solicitud    (15/01/2025)            │   │
│  │ ⏱ Revisión de Documentos     (En proceso)            │   │
│  │ ○ Evaluación Técnica         (Pendiente)             │   │
│  │ ○ Aprobación Final           (Pendiente)             │   │
│  │ ○ Emisión de Permiso         (Pendiente)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ⚠️ Próximo Paso                                             │
│  Cargar el comprobante de pago de la tasa administrativa.   │
│                                                               │
│  📄 Documentos Requeridos                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ Pasaporte              [Cargado]                   │   │
│  │ ✓ Fotografía             [Cargado]                   │   │
│  │ ✓ Carta de Motivos       [Cargado]                   │   │
│  │ ⏱ Comprobante de Pago     [Pendiente]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Configuración del Workflow

### Marcar Etapas como Públicas

```python
# Al crear/editar un workflow, el administrador puede marcar etapas como visibles
# para el portal público

# Ejemplo: PPSH Workflow
workflow_ppsh = {
    "nombre": "Permiso Provisional de Salida Humanitaria",
    "etapas": [
        {
            "nombre": "Recepción de Solicitud",
            "visible_publico": True,  # ✓ Visible para el solicitante
            "orden": 1
        },
        {
            "nombre": "Revisión de Documentos",
            "visible_publico": True,  # ✓ Visible
            "orden": 2
        },
        {
            "nombre": "Revisión Interna de Antecedentes",
            "visible_publico": False,  # ✗ NO visible (proceso interno)
            "orden": 3
        },
        {
            "nombre": "Evaluación Técnica",
            "visible_publico": True,  # ✓ Visible
            "orden": 4
        },
        {
            "nombre": "Aprobación Directiva",
            "visible_publico": False,  # ✗ NO visible (decisión interna)
            "orden": 5
        },
        {
            "nombre": "Aprobación Final",
            "visible_publico": True,  # ✓ Visible
            "orden": 6
        },
        {
            "nombre": "Emisión de Permiso",
            "visible_publico": True,  # ✓ Visible
            "orden": 7
        }
    ]
}
```

---

## 📝 Campos Adicionales en Solicitud

```sql
-- Agregar campos para observaciones públicas
ALTER TABLE PPSH_TB_SOLICITUD
ADD observaciones_publicas NVARCHAR(1000) NULL; -- Texto visible para el solicitante

ALTER TABLE PPSH_TB_SOLICITUD
ADD proximo_paso_publico NVARCHAR(500) NULL; -- Próximo paso que debe realizar

ALTER TABLE PPSH_TB_SOLICITUD
ADD solicitante_documento NVARCHAR(50) NULL; -- Documento del solicitante

ALTER TABLE PPSH_TB_SOLICITUD
ADD solicitante_tipo_documento NVARCHAR(20) NULL; -- PASAPORTE o CEDULA
```

---

## 🔄 Casos de Uso

### **Caso 1: Ciudadano Consulta su PPSH**

1. Ciudadano ingresa a `/acceso-publico`
2. Ingresa número de solicitud y pasaporte
3. Sistema valida y retorna token temporal
4. Ciudadano ve estado del trámite
5. Ve que falta cargar comprobante de pago
6. Sistema muestra mensaje: "Próximo paso: Cargar comprobante de pago"

### **Caso 2: Abogado Consulta Múltiples Solicitudes**

1. Abogado ingresa con datos del primer cliente
2. Ve estado de la solicitud del cliente
3. Vuelve a `/acceso-publico` para consultar otro cliente
4. Ingresa datos del segundo cliente
5. Ve estado de esa segunda solicitud

### **Caso 3: Intento de Acceso No Autorizado**

1. Usuario intenta adivinar números de solicitud
2. Después de 5 intentos fallidos, su IP es bloqueada por 30 minutos
3. Sistema muestra mensaje de bloqueo temporal

---

## 📊 Analítica y Auditoría

### Dashboard para Administradores

```sql
-- Consultas útiles para monitoreo

-- 1. Accesos públicos en las últimas 24 horas
SELECT 
    COUNT(*) as total_accesos,
    COUNT(DISTINCT ip_address) as ips_unicas,
    COUNT(DISTINCT solicitud_id) as solicitudes_consultadas
FROM SEG_TB_ACCESO_PUBLICO
WHERE fecha_acceso >= DATEADD(hour, -24, GETDATE());

-- 2. IPs con más intentos fallidos
SELECT 
    ip_address,
    SUM(intentos_fallidos) as total_intentos_fallidos,
    MAX(bloqueado_hasta) as bloqueado_hasta
FROM SEG_TB_ACCESO_PUBLICO
GROUP BY ip_address
HAVING SUM(intentos_fallidos) > 3
ORDER BY total_intentos_fallidos DESC;

-- 3. Solicitudes más consultadas
SELECT 
    s.numero_solicitud,
    s.tipo_tramite_id,
    COUNT(a.acceso_publico_id) as total_consultas,
    MAX(a.fecha_acceso) as ultima_consulta
FROM SEG_TB_ACCESO_PUBLICO a
INNER JOIN PPSH_TB_SOLICITUD s ON a.solicitud_id = s.solicitud_id
GROUP BY s.numero_solicitud, s.tipo_tramite_id
ORDER BY total_consultas DESC;
```

---

## ✅ Ventajas del Sistema

1. ✅ **Sin fricción para el ciudadano**: No requiere crear cuenta
2. ✅ **Seguro**: Validación por documento de identidad
3. ✅ **Transparente**: El ciudadano ve el estado real de su trámite
4. ✅ **Escalable**: Soporta múltiples tipos de trámites
5. ✅ **Auditable**: Registro completo de todos los accesos
6. ✅ **Configurable**: Administradores controlan qué es visible

---

## 🚀 Próximos Pasos

1. Crear migración para tabla `SEG_TB_ACCESO_PUBLICO`
2. Implementar endpoints del backend
3. Agregar campos `visible_publico` a workflows
4. Actualizar modelo de `Solicitud` con campos públicos
5. Implementar rate limiting y bloqueo por IP
6. Probar flujo completo end-to-end
7. Agregar notificaciones por email cuando hay cambios en la solicitud

