# Diagramas ER Compactos para Documento Word

## Instrucciones de Uso

Para agregar estos diagramas a Word:

1. **Opción 1 - Mermaid Live Editor:**
   - Visita: https://mermaid.live/
   - Copia el código del diagrama
   - Pégalo en el editor
   - Exporta como PNG/SVG
   - Inserta la imagen en Word

2. **Opción 2 - Extensión de Word:**
   - Instala "Mermaid Chart" para Word
   - Inserta el código directamente

3. **Opción 3 - Visual Studio Code:**
   - Instala extensión "Markdown Preview Mermaid Support"
   - Exporta como imagen
   - Inserta en Word

---

## 1. Módulo PPSH - Permiso Provisorio de Salida Humanitaria

```mermaid
erDiagram
    SOLICITANTE ||--o{ SOLICITUD : realiza
    SOLICITUD ||--o{ DOCUMENTO : adjunta
    SOLICITUD ||--o{ DEPENDIENTE : incluye
    SOLICITUD ||--o{ HISTORIAL : registra
    SOLICITUD ||--o| APROBACION : genera
    
    SOLICITANTE {
        int id_solicitante PK
        string num_documento UK
        string nombres
        string apellidos
        date fecha_nacimiento
        string email
    }
    
    SOLICITUD {
        int id_solicitud PK
        int id_solicitante FK
        string pais_destino
        date fecha_salida
        int duracion_dias
        string estado
    }
    
    DOCUMENTO {
        int id_documento PK
        int id_solicitud FK
        string tipo
        string archivo
    }
    
    DEPENDIENTE {
        int id_dependiente PK
        int id_solicitud FK
        string nombres
        string parentesco
    }
    
    APROBACION {
        int id_aprobacion PK
        int id_solicitud FK
        string num_resolucion UK
        date fecha_aprobacion
    }
```

**Copiar desde línea 42 hasta línea 87**

---

## 2. Módulo SIM_FT - Sistema de Flujo de Trámites

```mermaid
erDiagram
    TRAMITE ||--o{ DETALLE : contiene
    TRAMITE ||--o{ DOCUMENTO : requiere
    TRAMITE ||--o{ PAGO : registra
    TRAMITE ||--o| RESOLUCION : genera
    TRAMITE }o--|| TIPO_TRAMITE : clasifica
    TRAMITE }o--|| USUARIO : asignado
    
    TRAMITE {
        int id_tramite PK
        string num_expediente UK
        string tipo FK
        string estado
        date fecha_ingreso
        string prioridad
    }
    
    DETALLE {
        int id_detalle PK
        int id_tramite FK
        string campo
        string valor
    }
    
    DOCUMENTO {
        int id_documento PK
        int id_tramite FK
        string tipo
        string ruta
    }
    
    PAGO {
        int id_pago PK
        int id_tramite FK
        decimal monto
        date fecha_pago
    }
    
    RESOLUCION {
        int id_resolucion PK
        int id_tramite FK
        string numero UK
        date fecha
    }
```

**Copiar desde línea 93 hasta línea 140**

---

## 3. Módulo Workflows - Procesos Dinámicos

```mermaid
erDiagram
    DEFINICION ||--o{ PASO : define
    DEFINICION ||--o{ INSTANCIA : ejecuta
    PASO ||--o{ TRANSICION : origen
    INSTANCIA ||--o{ HISTORIAL : registra
    
    DEFINICION {
        int id_workflow PK
        string codigo UK
        string nombre
        bool activo
    }
    
    PASO {
        int id_paso PK
        int id_workflow FK
        string nombre
        int orden
        bool es_final
    }
    
    TRANSICION {
        int id_transicion PK
        int id_paso_origen FK
        int id_paso_destino FK
        string condicion
    }
    
    INSTANCIA {
        int id_instancia PK
        int id_workflow FK
        string estado
        date fecha_inicio
    }
    
    HISTORIAL {
        int id_historial PK
        int id_instancia FK
        int id_paso FK
        datetime fecha
    }
```

**Copiar desde línea 146 hasta línea 189**

---

## 4. Módulo Seguridad - Usuarios y Roles

```mermaid
erDiagram
    USUARIO ||--o{ USUARIO_ROL : tiene
    ROL ||--o{ USUARIO_ROL : asigna
    USUARIO ||--o{ AUDITORIA : genera
    
    USUARIO {
        int id_usuario PK
        string username UK
        string email UK
        string password_hash
        string nombre
        bool activo
    }
    
    ROL {
        int id_rol PK
        string codigo UK
        string nombre
        json permisos
    }
    
    USUARIO_ROL {
        int id PK
        int id_usuario FK
        int id_rol FK
        date fecha_asignacion
    }
    
    AUDITORIA {
        int id_auditoria PK
        int id_usuario FK
        string tabla
        string operacion
        datetime fecha
    }
```

**Copiar desde línea 195 hasta línea 232**

---

## 5. Módulo Catálogos - Datos Maestros

```mermaid
erDiagram
    PAIS {
        string cod_pais PK
        string nombre
        string iso3
        bool activo
    }
    
    TIPO_DOCUMENTO {
        string cod_tipo PK
        string nombre
        string descripcion
        bool activo
    }
    
    TIPO_TRAMITE {
        string cod_tipo PK
        string nombre
        int dias_plazo
        decimal monto_base
    }
    
    ESTADO_TRAMITE {
        string cod_estado PK
        string nombre
        string color
        int orden
    }
```

**Copiar desde línea 238 hasta línea 267**

---

## 6. Diagrama Completo - Arquitectura General (Vista Simplificada)

```mermaid
erDiagram
    PPSH_SOLICITUD }o--|| SOLICITANTE : realiza
    PPSH_SOLICITUD }o--|| PAIS : destino
    
    TRAMITE_FT }o--|| TIPO_TRAMITE : tipo
    TRAMITE_FT }o--|| ESTADO : estado
    TRAMITE_FT }o--|| WORKFLOW : sigue
    TRAMITE_FT }o--|| USUARIO : asignado
    
    WORKFLOW }o--|| DEFINICION : instancia
    
    USUARIO }o--|| ROL : tiene
    
    SOLICITANTE {
        int id PK
        string documento
        string nombre
    }
    
    PPSH_SOLICITUD {
        int id PK
        string estado
        date fecha
    }
    
    TRAMITE_FT {
        int id PK
        string expediente
        string estado
    }
    
    WORKFLOW {
        int id PK
        string estado
    }
    
    USUARIO {
        int id PK
        string username
    }
```

**Copiar desde línea 273 hasta línea 319**

---

## 7. Vista por Módulo - Relaciones Principales

```mermaid
graph TB
    subgraph PPSH[Módulo PPSH]
        P1[SOLICITANTE]
        P2[SOLICITUD]
        P3[DOCUMENTO]
    end
    
    subgraph SIMFT[Módulo SIM_FT]
        S1[TRAMITE]
        S2[DETALLE]
        S3[RESOLUCION]
    end
    
    subgraph WF[Workflows]
        W1[DEFINICION]
        W2[INSTANCIA]
    end
    
    subgraph SEC[Seguridad]
        U1[USUARIO]
        U2[ROL]
    end
    
    subgraph CAT[Catálogos]
        C1[PAIS]
        C2[TIPO_TRAMITE]
    end
    
    P1 --> P2
    P2 --> P3
    
    S1 --> S2
    S1 --> S3
    S1 --> W2
    S1 --> U1
    
    W1 --> W2
    
    U1 --> U2
    
    P2 --> C1
    S1 --> C2
    
    style PPSH fill:#fff3e0
    style SIMFT fill:#e8f5e9
    style WF fill:#f3e5f5
    style SEC fill:#ffebee
    style CAT fill:#e0f2f1
```

**Copiar desde línea 325 hasta línea 373**

---

## Resumen de Diagramas Generados

| Módulo | Entidades | Relaciones | Uso Recomendado |
|--------|-----------|------------|-----------------|
| **PPSH** | 5 tablas | 4 relaciones | Gestión de permisos humanitarios |
| **SIM_FT** | 5 tablas | 5 relaciones | Sistema central de trámites |
| **Workflows** | 5 tablas | 4 relaciones | Procesos configurables |
| **Seguridad** | 4 tablas | 3 relaciones | Control de acceso |
| **Catálogos** | 4 tablas | Independientes | Datos maestros |
| **Completo** | Vista integrada | Todas | Arquitectura general |

---

## Notas Técnicas

### Características de los Diagramas:

✅ **Compactos**: Solo campos esenciales para claridad visual  
✅ **Legibles**: Nombres descriptivos y abreviaciones estándar  
✅ **Exportables**: Compatible con Mermaid Live Editor  
✅ **Escalables**: Vectoriales (SVG) o rasterizados (PNG)  

### Recomendaciones para Word:

1. **Tamaño de exportación**: 1920x1080 px para buena calidad
2. **Formato**: SVG para documentos digitales, PNG para impresos
3. **Disposición**: Un diagrama por página para legibilidad
4. **Títulos**: Agregar como "Figura X: Diagrama ER del Módulo..."

### Colores Sugeridos para Módulos:

- **PPSH**: Naranja claro (#fff3e0)
- **SIM_FT**: Verde claro (#e8f5e9)
- **Workflows**: Morado claro (#f3e5f5)
- **Seguridad**: Rojo claro (#ffebee)
- **Catálogos**: Verde azulado (#e0f2f1)
