# 📋 Actualización Tipos de Documentos PPSH

## 📄 Descripción

Esta actualización modifica la tabla `PPSH_TIPO_DOCUMENTO` para alinearla con los requisitos oficiales del **Decreto N° 6 del 11 de Marzo del 2025** para el Permiso de Protección de Seguridad Humanitaria (PPSH).

## 🎯 Cambios Realizados

### 1. **Nuevos Tipos de Documentos (14 tipos)**

Según el decreto oficial, los documentos requeridos son:

#### 📄 **Documentos Legales**
1. **Poder y Solicitud Apoderado Legal** (Obligatorio)
   - Poder y solicitud mediante apoderado legal debidamente notariado

#### 🆔 **Identificación**
2. **Fotografías Carnet** (Obligatorio)
   - Dos fotos tamaño carnet, fondo blanco o a color
3. **Pasaporte Notariado** (Obligatorio) 
   - Copia completa del pasaporte debidamente notariado

#### 🏠 **Comprobante de Domicilio** (Uno de los dos)
4. **Contrato Arrendamiento** (Opcional)
   - Contrato de arrendamiento notariado + copia de cédula del arrendador notariado
5. **Recibo Servicios Públicos** (Opcional)
   - Recibo de servicios públicos (Luz, agua, Cable e Internet) copia notariada

#### 📋 **Antecedentes**
6. **Certificado Antecedentes Penales** (Obligatorio)
   - Del país de origen, debidamente autenticado o apostillado
7. **Declaración Jurada Antecedentes** (Obligatorio)
   - Declaración jurada de antecedentes personales

#### 🏥 **Médico**
8. **Certificado de Salud** (Obligatorio)
   - Expedido por un profesional idóneo

#### 💼 **Laboral**
9. **Registro Mano Obra Migrante** (Obligatorio)
   - Copia del registro ante el Ministerio de Trabajo y Desarrollo Laboral

#### 👶 **Menores de Edad**
10. **Poder Notariado Menores** (Opcional - si aplica)
    - Poder otorgado por ambos padres o tutor legal + documento de parentesco + carta de responsabilidad

#### 💰 **Comprobantes de Pago**
11. **Comprobante Pago Reparación** (Obligatorio)
    - Cheque Certificado Banco Nacional: **B/.800.00** - concepto reparación
12. **Comprobante Pago Servicio Migratorio** (Obligatorio)
    - Cheque Certificado Banco Nacional: **B/.250.00** - concepto servicio migratorio
13. **Comprobante Pago Carnet Visa** (Obligatorio)
    - Pago: **B/.100.00** - concepto carnet y visa múltiple
14. **Comprobante Pago Permiso Trabajo** (Obligatorio)
    - Cheque Certificado Banco Nacional: **B/.100.00** - concepto Permiso de Trabajo

### 2. **Campo de Categorización**

Se agregó el campo `categoria` para organizar mejor los documentos:

- **LEGAL**: Documentos legales y poderes
- **IDENTIFICACION**: Pasaportes, fotografías
- **DOMICILIO**: Comprobantes de residencia  
- **ANTECEDENTES**: Certificados penales y declaraciones
- **MEDICO**: Certificados de salud
- **LABORAL**: Registros de trabajo
- **MENORES**: Documentos específicos para menores
- **PAGO**: Comprobantes de pago

### 3. **Campos de Auditoría**

Se agregaron campos para tracking:
- `updated_at`: Timestamp de última actualización
- `updated_by`: Usuario que realizó la actualización
- `categoria`: Categoría del documento (con índice)

## 🗄️ Migraciones Creadas

### `002_actualizar_tipos_documento_ppsh.py`
- Desactiva tipos de documentos anteriores (mantiene historial)
- Inserta 14 nuevos tipos según decreto oficial
- Mantiene integridad referencial con documentos existentes

### `003_agregar_categoria_tipo_documento.py`
- Agrega campo `categoria` a la tabla
- Asigna categorías a todos los tipos nuevos
- Crea índice para optimizar consultas por categoría

## 🔧 Modelos Actualizados

### `models_ppsh.py`
```python
class PPSHTipoDocumento(Base):
    # ... campos existentes ...
    categoria = Column(String(20), nullable=True, index=True)
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())
    updated_by = Column(String(17))
```

### `schemas_ppsh.py`
```python
class TipoDocumentoResponse(BaseModel):
    # ... campos existentes ...
    categoria: Optional[str]
    updated_at: Optional[datetime]
```

## 🚀 Ejecución de Migraciones

### Opción 1: Usando Alembic (Recomendado)
```bash
cd backend
alembic upgrade head
```

### Opción 2: Script de Simulación
```bash
cd backend

# Ver estado actual
python scripts/migrate_ppsh_documentos.py status

# Simular upgrade
python scripts/migrate_ppsh_documentos.py upgrade

# Simular rollback
python scripts/migrate_ppsh_documentos.py downgrade
```

## 📊 Impacto en la Aplicación

### Frontend
- Actualizar componentes de carga de documentos para mostrar categorías
- Implementar filtrado por categoría en listas de documentos
- Mostrar documentos agrupados por tipo (obligatorios/opcionales)

### Backend
- El endpoint `/ppsh/catalogos/tipos-documento` retornará los nuevos tipos
- Los documentos existentes mantienen compatibilidad
- API de carga de documentos sigue funcionando sin cambios

### Base de Datos
- **Tipos anteriores**: Desactivados (activo=0) pero mantienen historial
- **Tipos nuevos**: Activos con categorización
- **Documentos existentes**: No afectados, mantienen referencia

## ⚠️ Consideraciones

1. **Compatibilidad**: Los documentos ya cargados mantienen sus referencias
2. **Rollback**: Posible revertir a tipos anteriores si es necesario
3. **Validación**: Verificar que la aplicación maneje correctamente los nuevos tipos
4. **Pruebas**: Ejecutar tests de integración después de la migración

## 🔍 Verificación Post-Migración

```sql
-- Verificar tipos activos
SELECT cod_tipo_doc, nombre_tipo, categoria, es_obligatorio 
FROM PPSH_TIPO_DOCUMENTO 
WHERE activo = 1 
ORDER BY categoria, orden;

-- Contar por categoría
SELECT categoria, COUNT(*) as total
FROM PPSH_TIPO_DOCUMENTO 
WHERE activo = 1 
GROUP BY categoria;
```

## 📝 Notas Adicionales

- **Montos de Pago**: Los montos están hardcodeados según decreto, considerar parametrizar en el futuro
- **Banco Nacional**: Especifica que debe ser Banco Nacional de Panamá
- **Notarización**: Muchos documentos requieren notarización - considerar validaciones
- **Apostilla**: Documentos extranjeros requieren apostilla o autenticación consular

---
**Fecha**: 2025-10-17  
**Decreto de Referencia**: N° 6 del 11 de Marzo del 2025  
**Responsable**: Sistema de Migración PPSH
