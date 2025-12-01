# Plan de Implementación: Mejoras PPSH Grupal

**Fecha de creación:** 27 de noviembre de 2025  
**Rama de trabajo:** `correcciones-integracion` o crear `feature/ppsh-grupal-mejoras`  
**Estimación:** 1-2 días de desarrollo

---

## Resumen Ejecutivo

Implementar mejoras al sistema PPSH para gestión de solicitudes grupales:

| Mejora | Descripción |
|--------|-------------|
| ✅ Validación de edad flexible | Menores de edad permitidos como dependientes |
| ✅ Parentesco extendido | 8 nuevos tipos de parentesco |
| ✅ Límite de personas | Máximo 10 personas por solicitud |
| ✅ CRUD de dependientes | Agregar/editar/eliminar dependientes post-creación |
| ✅ Restricción de modificación | Solo antes de cargar documentación |

---

## Paso 1: Extender ParentescoEnum

**Archivo:** `backend/app/schemas/schemas_ppsh.py`  
**Ubicación:** Líneas 44-50 (enum `ParentescoEnum`)

### Código Actual:
```python
class ParentescoEnum(str, Enum):
    """Tipos de parentesco con titular"""
    CONYUGE = "CONYUGE"
    HIJO = "HIJO"
    PADRE = "PADRE"
    MADRE = "MADRE"
    HERMANO = "HERMANO"
```

### Código Nuevo:
```python
class ParentescoEnum(str, Enum):
    """Tipos de parentesco con titular"""
    CONYUGE = "CONYUGE"
    HIJO = "HIJO"
    PADRE = "PADRE"
    MADRE = "MADRE"
    HERMANO = "HERMANO"
    ABUELO = "ABUELO"
    NIETO = "NIETO"
    TIO = "TIO"
    SOBRINO = "SOBRINO"
    CUÑADO = "CUÑADO"
    SUEGRO = "SUEGRO"
    YERNO = "YERNO"
    NUERA = "NUERA"
```

---

## Paso 2: Flexibilizar Validación de Edad

**Archivo:** `backend/app/schemas/schemas_ppsh.py`  
**Ubicación:** Líneas 153-165 (método `validar_fecha_nacimiento`)

### Código Actual:
```python
@field_validator('fecha_nacimiento')
@classmethod
def validar_fecha_nacimiento(cls, v: date) -> date:
    """Valida que la fecha de nacimiento sea válida y que tenga al menos 18 años"""
    if v > date.today():
        raise ValueError('La fecha de nacimiento no puede ser futura')
    if v.year < 1900:
        raise ValueError('La fecha de nacimiento debe ser posterior a 1900')

    # Calcular edad
    today = date.today()
    edad = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
    if edad < 18:
        raise ValueError('El solicitante debe tener al menos 18 años')

    return v
```

### Código Nuevo:
```python
@field_validator('fecha_nacimiento')
@classmethod
def validar_fecha_nacimiento(cls, v: date) -> date:
    """Valida que la fecha de nacimiento sea válida"""
    if v > date.today():
        raise ValueError('La fecha de nacimiento no puede ser futura')
    if v.year < 1900:
        raise ValueError('La fecha de nacimiento debe ser posterior a 1900')
    return v

@model_validator(mode='after')
def validar_edad_titular(self):
    """Valida que el titular tenga al menos 18 años (dependientes pueden ser menores)"""
    if self.es_titular and self.fecha_nacimiento:
        today = date.today()
        edad = today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )
        if edad < 18:
            raise ValueError('El solicitante titular debe tener al menos 18 años')
    return self
```

**NOTA:** El `@model_validator` debe ir DESPUÉS del `validar_parentesco` existente, o combinarse con él.

### Opción alternativa - Combinar validadores:
```python
@model_validator(mode='after')
def validar_parentesco_y_edad(self):
    """Valida parentesco y edad según rol"""
    # Validar parentesco
    if not self.es_titular and not self.parentesco_titular:
        raise ValueError('Los dependientes deben especificar el parentesco con el titular')
    if self.es_titular and self.parentesco_titular:
        raise ValueError('El titular no debe tener parentesco')
    
    # Validar edad del titular (18+ años)
    if self.es_titular and self.fecha_nacimiento:
        today = date.today()
        edad = today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )
        if edad < 18:
            raise ValueError('El solicitante titular debe tener al menos 18 años')
    
    return self
```

---

## Paso 3: Agregar Límite de 10 Personas

**Archivo:** `backend/app/schemas/schemas_ppsh.py`  
**Ubicación:** Líneas 236-255 (método `validar_solicitantes` en `SolicitudCreate`)

### Código Actual:
```python
@model_validator(mode='after')
def validar_solicitantes(self):
    """Valida que haya al menos un titular"""
    titulares = sum(1 for s in self.solicitantes if s.es_titular)
    if titulares == 0:
        raise ValueError('Debe haber al menos un solicitante titular')
    if titulares > 1:
        raise ValueError('Solo puede haber un solicitante titular')

    # Validar tipo de solicitud
    if self.tipo_solicitud == TipoSolicitudEnum.INDIVIDUAL and len(self.solicitantes) > 1:
        raise ValueError('Una solicitud individual solo puede tener un solicitante')

    # Validar prioridad alta requiere justificación
    if self.prioridad == PrioridadEnum.ALTA:
        if not self.descripcion_caso or len(self.descripcion_caso.strip()) < 50:
            raise ValueError('Las solicitudes de prioridad ALTA requieren una justificación detallada (mínimo 50 caracteres)')

    return self
```

### Código Nuevo:
```python
# Constante al inicio del archivo (después de imports)
MAX_PERSONAS_POR_SOLICITUD = 10

@model_validator(mode='after')
def validar_solicitantes(self):
    """Valida que haya al menos un titular y máximo 10 personas"""
    # Validar máximo de personas
    if len(self.solicitantes) > MAX_PERSONAS_POR_SOLICITUD:
        raise ValueError(f'Una solicitud no puede tener más de {MAX_PERSONAS_POR_SOLICITUD} personas')
    
    titulares = sum(1 for s in self.solicitantes if s.es_titular)
    if titulares == 0:
        raise ValueError('Debe haber al menos un solicitante titular')
    if titulares > 1:
        raise ValueError('Solo puede haber un solicitante titular')

    # Validar tipo de solicitud
    if self.tipo_solicitud == TipoSolicitudEnum.INDIVIDUAL and len(self.solicitantes) > 1:
        raise ValueError('Una solicitud individual solo puede tener un solicitante')

    # Validar prioridad alta requiere justificación
    if self.prioridad == PrioridadEnum.ALTA:
        if not self.descripcion_caso or len(self.descripcion_caso.strip()) < 50:
            raise ValueError('Las solicitudes de prioridad ALTA requieren una justificación detallada (mínimo 50 caracteres)')

    return self
```

---

## Paso 4: Crear Schemas para Dependientes

**Archivo:** `backend/app/schemas/schemas_ppsh.py`  
**Ubicación:** Después de `SolicitanteResponse` (línea ~215)

### Código Nuevo a Agregar:
```python
# ==========================================
# SCHEMAS DE DEPENDIENTES (CRUD)
# ==========================================

class DependienteCreate(BaseModel):
    """Schema para agregar un dependiente a una solicitud existente"""
    tipo_documento: TipoDocumentoEnum = TipoDocumentoEnum.PASAPORTE
    num_documento: str = Field(..., min_length=1, max_length=50)
    pais_emisor: str = Field(..., min_length=3, max_length=3)
    fecha_emision_doc: Optional[date] = None
    fecha_vencimiento_doc: Optional[date] = None
    primer_nombre: str = Field(..., min_length=1, max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: str = Field(..., min_length=1, max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: date
    cod_sexo: str = Field(..., min_length=1, max_length=1)
    cod_nacionalidad: str = Field(..., min_length=3, max_length=3)
    cod_estado_civil: Optional[str] = Field(None, min_length=1, max_length=1)
    parentesco_titular: ParentescoEnum = Field(..., description="Parentesco con el titular (obligatorio)")
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    direccion_pais_origen: Optional[str] = Field(None, max_length=200)
    direccion_panama: Optional[str] = Field(None, max_length=200)
    ocupacion: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=500)

    @field_validator('fecha_nacimiento')
    @classmethod
    def validar_fecha_nacimiento(cls, v: date) -> date:
        """Valida fecha de nacimiento (sin restricción de edad para dependientes)"""
        if v > date.today():
            raise ValueError('La fecha de nacimiento no puede ser futura')
        if v.year < 1900:
            raise ValueError('La fecha de nacimiento debe ser posterior a 1900')
        return v


class DependienteUpdate(BaseModel):
    """Schema para actualizar un dependiente"""
    tipo_documento: Optional[TipoDocumentoEnum] = None
    num_documento: Optional[str] = Field(None, max_length=50)
    pais_emisor: Optional[str] = Field(None, min_length=3, max_length=3)
    fecha_emision_doc: Optional[date] = None
    fecha_vencimiento_doc: Optional[date] = None
    primer_nombre: Optional[str] = Field(None, max_length=50)
    segundo_nombre: Optional[str] = Field(None, max_length=50)
    primer_apellido: Optional[str] = Field(None, max_length=50)
    segundo_apellido: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: Optional[date] = None
    cod_sexo: Optional[str] = Field(None, min_length=1, max_length=1)
    cod_nacionalidad: Optional[str] = Field(None, min_length=3, max_length=3)
    cod_estado_civil: Optional[str] = Field(None, min_length=1, max_length=1)
    parentesco_titular: Optional[ParentescoEnum] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    direccion_pais_origen: Optional[str] = Field(None, max_length=200)
    direccion_panama: Optional[str] = Field(None, max_length=200)
    ocupacion: Optional[str] = Field(None, max_length=100)
    observaciones: Optional[str] = Field(None, max_length=500)


class DependienteResponse(BaseModel):
    """Response de dependiente"""
    id_solicitante: int
    id_solicitud: int
    es_titular: bool = False
    tipo_documento: str
    num_documento: str
    primer_nombre: str
    segundo_nombre: Optional[str]
    primer_apellido: str
    segundo_apellido: Optional[str]
    fecha_nacimiento: date
    cod_sexo: str
    cod_nacionalidad: str
    parentesco_titular: str
    nombre_completo: str
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

---

## Paso 5: Agregar Métodos en SolicitudService

**Archivo:** `backend/app/services/services_ppsh.py`  
**Ubicación:** Después del método `cambiar_estado` en `SolicitudService` (aproximadamente línea ~450)

### Código Nuevo a Agregar:
```python
    # ==========================================
    # MÉTODOS PARA GESTIÓN DE DEPENDIENTES
    # ==========================================

    @staticmethod
    def _puede_modificar_dependientes(db: Session, solicitud: models_ppsh.PPSHSolicitud) -> bool:
        """
        Verifica si se pueden modificar dependientes.
        Solo permitido en estado RECIBIDO y sin documentos cargados.
        """
        # Verificar estado
        if solicitud.estado_actual != "RECIBIDO":
            return False
        
        # Verificar si hay documentos cargados
        documentos = db.query(models_ppsh.PPSHDocumento).filter(
            models_ppsh.PPSHDocumento.id_solicitud == solicitud.id_solicitud
        ).count()
        
        return documentos == 0

    @staticmethod
    def agregar_dependiente(
        db: Session,
        id_solicitud: int,
        dependiente_data: 'DependienteCreate',
        user_id: str
    ) -> models_ppsh.PPSHSolicitante:
        """
        Agrega un dependiente a una solicitud existente.
        
        Validaciones:
        - Solicitud debe existir y estar activa
        - Estado debe ser RECIBIDO
        - No debe haber documentos cargados
        - Máximo 10 personas por solicitud
        - No duplicar número de documento
        """
        from app.schemas.schemas_ppsh import MAX_PERSONAS_POR_SOLICITUD
        
        logger.info(f"Agregando dependiente a solicitud {id_solicitud} por usuario {user_id}")
        
        # Obtener solicitud
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=True)
        
        # Verificar si se pueden modificar dependientes
        if not SolicitudService._puede_modificar_dependientes(db, solicitud):
            raise PPSHBusinessException(
                "No se pueden agregar dependientes. La solicitud debe estar en estado RECIBIDO "
                "y no debe tener documentos cargados."
            )
        
        # Verificar límite de personas
        total_personas = len(solicitud.solicitantes)
        if total_personas >= MAX_PERSONAS_POR_SOLICITUD:
            raise PPSHBusinessException(
                f"No se pueden agregar más dependientes. Máximo permitido: {MAX_PERSONAS_POR_SOLICITUD} personas"
            )
        
        # Verificar que no exista el número de documento
        documento_existente = db.query(models_ppsh.PPSHSolicitante).filter(
            models_ppsh.PPSHSolicitante.id_solicitud == id_solicitud,
            models_ppsh.PPSHSolicitante.num_documento == dependiente_data.num_documento,
            models_ppsh.PPSHSolicitante.activo == True
        ).first()
        
        if documento_existente:
            raise PPSHBusinessException(
                f"Ya existe un solicitante con el documento {dependiente_data.num_documento} en esta solicitud"
            )
        
        try:
            # Crear dependiente
            dependiente = models_ppsh.PPSHSolicitante(
                id_solicitud=id_solicitud,
                es_titular=False,  # Siempre es dependiente
                tipo_documento=dependiente_data.tipo_documento.value,
                num_documento=dependiente_data.num_documento,
                pais_emisor=dependiente_data.pais_emisor,
                fecha_emision_doc=dependiente_data.fecha_emision_doc,
                fecha_vencimiento_doc=dependiente_data.fecha_vencimiento_doc,
                primer_nombre=dependiente_data.primer_nombre,
                segundo_nombre=dependiente_data.segundo_nombre,
                primer_apellido=dependiente_data.primer_apellido,
                segundo_apellido=dependiente_data.segundo_apellido,
                fecha_nacimiento=dependiente_data.fecha_nacimiento,
                cod_sexo=dependiente_data.cod_sexo,
                cod_nacionalidad=dependiente_data.cod_nacionalidad,
                cod_estado_civil=dependiente_data.cod_estado_civil,
                parentesco_titular=dependiente_data.parentesco_titular.value,
                email=dependiente_data.email,
                telefono=dependiente_data.telefono,
                direccion_pais_origen=dependiente_data.direccion_pais_origen,
                direccion_panama=dependiente_data.direccion_panama,
                ocupacion=dependiente_data.ocupacion,
                observaciones=dependiente_data.observaciones,
                activo=True
            )
            db.add(dependiente)
            
            # Actualizar tipo de solicitud a GRUPAL si aplica
            if solicitud.tipo_solicitud == "INDIVIDUAL":
                solicitud.tipo_solicitud = "GRUPAL"
            
            db.commit()
            db.refresh(dependiente)
            
            logger.info(f"Dependiente {dependiente.id_solicitante} agregado exitosamente")
            return dependiente
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error agregando dependiente: {str(e)}")
            raise PPSHBusinessException(f"Error agregando dependiente: {str(e)}")

    @staticmethod
    def actualizar_dependiente(
        db: Session,
        id_solicitud: int,
        id_solicitante: int,
        dependiente_data: 'DependienteUpdate',
        user_id: str
    ) -> models_ppsh.PPSHSolicitante:
        """
        Actualiza un dependiente existente.
        
        Validaciones:
        - El solicitante no puede ser el titular
        - Solicitud debe estar en estado RECIBIDO sin documentos
        """
        logger.info(f"Actualizando dependiente {id_solicitante} por usuario {user_id}")
        
        # Obtener solicitud
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        # Verificar si se pueden modificar dependientes
        if not SolicitudService._puede_modificar_dependientes(db, solicitud):
            raise PPSHBusinessException(
                "No se pueden modificar dependientes. La solicitud debe estar en estado RECIBIDO "
                "y no debe tener documentos cargados."
            )
        
        # Obtener el solicitante
        solicitante = db.query(models_ppsh.PPSHSolicitante).filter(
            models_ppsh.PPSHSolicitante.id_solicitante == id_solicitante,
            models_ppsh.PPSHSolicitante.id_solicitud == id_solicitud,
            models_ppsh.PPSHSolicitante.activo == True
        ).first()
        
        if not solicitante:
            raise PPSHNotFoundException("Dependiente", str(id_solicitante))
        
        # Verificar que no sea el titular
        if solicitante.es_titular:
            raise PPSHBusinessException("No se puede modificar al titular como dependiente")
        
        try:
            # Actualizar campos proporcionados
            update_data = dependiente_data.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                if value is not None:
                    # Convertir enums a string
                    if hasattr(value, 'value'):
                        value = value.value
                    setattr(solicitante, field, value)
            
            db.commit()
            db.refresh(solicitante)
            
            logger.info(f"Dependiente {id_solicitante} actualizado exitosamente")
            return solicitante
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error actualizando dependiente: {str(e)}")
            raise PPSHBusinessException(f"Error actualizando dependiente: {str(e)}")

    @staticmethod
    def eliminar_dependiente(
        db: Session,
        id_solicitud: int,
        id_solicitante: int,
        user_id: str
    ) -> dict:
        """
        Elimina (desactiva) un dependiente de una solicitud.
        
        Validaciones:
        - No se puede eliminar al titular
        - Si queda solo 1 persona, cambia tipo a INDIVIDUAL
        """
        logger.info(f"Eliminando dependiente {id_solicitante} por usuario {user_id}")
        
        # Obtener solicitud
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=True)
        
        # Verificar si se pueden modificar dependientes
        if not SolicitudService._puede_modificar_dependientes(db, solicitud):
            raise PPSHBusinessException(
                "No se pueden eliminar dependientes. La solicitud debe estar en estado RECIBIDO "
                "y no debe tener documentos cargados."
            )
        
        # Obtener el solicitante
        solicitante = db.query(models_ppsh.PPSHSolicitante).filter(
            models_ppsh.PPSHSolicitante.id_solicitante == id_solicitante,
            models_ppsh.PPSHSolicitante.id_solicitud == id_solicitud,
            models_ppsh.PPSHSolicitante.activo == True
        ).first()
        
        if not solicitante:
            raise PPSHNotFoundException("Dependiente", str(id_solicitante))
        
        # Verificar que no sea el titular
        if solicitante.es_titular:
            raise PPSHBusinessException("No se puede eliminar al titular de la solicitud")
        
        try:
            # Soft delete
            solicitante.activo = False
            
            # Contar personas activas restantes
            personas_activas = len([s for s in solicitud.solicitantes if s.activo and s.id_solicitante != id_solicitante])
            
            # Si queda solo el titular, cambiar a INDIVIDUAL
            if personas_activas == 1:
                solicitud.tipo_solicitud = "INDIVIDUAL"
            
            db.commit()
            
            logger.info(f"Dependiente {id_solicitante} eliminado exitosamente")
            return {
                "mensaje": "Dependiente eliminado exitosamente",
                "tipo_solicitud_actual": solicitud.tipo_solicitud,
                "personas_restantes": personas_activas
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error eliminando dependiente: {str(e)}")
            raise PPSHBusinessException(f"Error eliminando dependiente: {str(e)}")

    @staticmethod
    def listar_dependientes(
        db: Session,
        id_solicitud: int
    ) -> List[models_ppsh.PPSHSolicitante]:
        """Lista todos los dependientes (no titulares) de una solicitud"""
        # Verificar que existe la solicitud
        SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        
        dependientes = db.query(models_ppsh.PPSHSolicitante).filter(
            models_ppsh.PPSHSolicitante.id_solicitud == id_solicitud,
            models_ppsh.PPSHSolicitante.es_titular == False,
            models_ppsh.PPSHSolicitante.activo == True
        ).all()
        
        return dependientes
```

---

## Paso 6: Crear Endpoints CRUD para Dependientes

**Archivo:** `backend/app/routers/routers_ppsh.py`  
**Ubicación:** Después de los endpoints de documentos (aproximadamente línea ~500)

### Código Nuevo a Agregar:
```python
# ==========================================
# ENDPOINTS DE DEPENDIENTES
# ==========================================

@router.get(
    "/solicitudes/{id_solicitud}/dependientes",
    response_model=List[DependienteResponse],
    summary="Listar dependientes",
    description="Obtiene todos los dependientes (no titulares) de una solicitud"
)
async def listar_dependientes(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lista todos los dependientes de una solicitud"""
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return SolicitudService.listar_dependientes(db, id_solicitud)
    except (PPSHNotFoundException, PPSHPermissionException) as e:
        raise e


@router.post(
    "/solicitudes/{id_solicitud}/dependientes",
    response_model=DependienteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar dependiente",
    description="Agrega un nuevo dependiente a una solicitud. Solo permitido en estado RECIBIDO y sin documentos cargados."
)
async def agregar_dependiente(
    id_solicitud: int,
    dependiente: DependienteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Agrega un dependiente a una solicitud existente.
    
    Restricciones:
    - La solicitud debe estar en estado RECIBIDO
    - No debe tener documentos cargados
    - Máximo 10 personas por solicitud
    - El número de documento no debe estar duplicado
    """
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return SolicitudService.agregar_dependiente(
            db=db,
            id_solicitud=id_solicitud,
            dependiente_data=dependiente,
            user_id=current_user["user_id"]
        )
    except (PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException) as e:
        raise e


@router.put(
    "/solicitudes/{id_solicitud}/dependientes/{id_solicitante}",
    response_model=DependienteResponse,
    summary="Actualizar dependiente",
    description="Actualiza los datos de un dependiente. Solo permitido en estado RECIBIDO y sin documentos cargados."
)
async def actualizar_dependiente(
    id_solicitud: int,
    id_solicitante: int,
    dependiente: DependienteUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Actualiza un dependiente existente.
    
    Restricciones:
    - No se puede modificar al titular
    - La solicitud debe estar en estado RECIBIDO
    - No debe tener documentos cargados
    """
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return SolicitudService.actualizar_dependiente(
            db=db,
            id_solicitud=id_solicitud,
            id_solicitante=id_solicitante,
            dependiente_data=dependiente,
            user_id=current_user["user_id"]
        )
    except (PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException) as e:
        raise e


@router.delete(
    "/solicitudes/{id_solicitud}/dependientes/{id_solicitante}",
    summary="Eliminar dependiente",
    description="Elimina un dependiente de una solicitud. Solo permitido en estado RECIBIDO y sin documentos cargados."
)
async def eliminar_dependiente(
    id_solicitud: int,
    id_solicitante: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Elimina un dependiente de una solicitud.
    
    Restricciones:
    - No se puede eliminar al titular
    - La solicitud debe estar en estado RECIBIDO
    - No debe tener documentos cargados
    - Si queda solo el titular, el tipo cambia a INDIVIDUAL
    """
    try:
        # Verificar permisos
        solicitud = SolicitudService.get_solicitud(db, id_solicitud, incluir_relaciones=False)
        if not current_user.get("es_admin") and solicitud.user_id_asignado != current_user["user_id"]:
            raise PPSHPermissionException()
        
        return SolicitudService.eliminar_dependiente(
            db=db,
            id_solicitud=id_solicitud,
            id_solicitante=id_solicitante,
            user_id=current_user["user_id"]
        )
    except (PPSHNotFoundException, PPSHBusinessException, PPSHPermissionException) as e:
        raise e
```

### Agregar Imports al inicio del archivo:
```python
from app.schemas import (
    # ... imports existentes ...
    # Agregar:
    DependienteCreate, DependienteUpdate, DependienteResponse,
)
```

---

## Paso 7: Actualizar __init__.py de Schemas

**Archivo:** `backend/app/schemas/__init__.py`

### Agregar exports:
```python
from .schemas_ppsh import (
    # ... exports existentes ...
    # Agregar:
    DependienteCreate,
    DependienteUpdate,
    DependienteResponse,
    MAX_PERSONAS_POR_SOLICITUD,
)
```

---

## Paso 8: Crear Tests

**Archivo:** `backend/tests/test_ppsh_dependientes.py` (nuevo)

```python
"""
Tests para funcionalidad de dependientes PPSH
"""
import pytest
from datetime import date, timedelta
from app.schemas.schemas_ppsh import (
    SolicitudCreate, SolicitanteCreate, DependienteCreate,
    TipoSolicitudEnum, ParentescoEnum, TipoDocumentoEnum,
    MAX_PERSONAS_POR_SOLICITUD
)


class TestParentescoExtendido:
    """Tests para el enum de parentesco extendido"""
    
    def test_parentesco_valores_originales(self):
        """Verifica que los valores originales existen"""
        assert ParentescoEnum.CONYUGE.value == "CONYUGE"
        assert ParentescoEnum.HIJO.value == "HIJO"
        assert ParentescoEnum.PADRE.value == "PADRE"
        assert ParentescoEnum.MADRE.value == "MADRE"
        assert ParentescoEnum.HERMANO.value == "HERMANO"
    
    def test_parentesco_valores_nuevos(self):
        """Verifica que los nuevos valores existen"""
        assert ParentescoEnum.ABUELO.value == "ABUELO"
        assert ParentescoEnum.NIETO.value == "NIETO"
        assert ParentescoEnum.TIO.value == "TIO"
        assert ParentescoEnum.SOBRINO.value == "SOBRINO"
        assert ParentescoEnum.CUÑADO.value == "CUÑADO"
        assert ParentescoEnum.SUEGRO.value == "SUEGRO"
        assert ParentescoEnum.YERNO.value == "YERNO"
        assert ParentescoEnum.NUERA.value == "NUERA"


class TestValidacionEdad:
    """Tests para validación de edad flexible"""
    
    def test_titular_mayor_18_valido(self):
        """Titular mayor de 18 años debe ser válido"""
        fecha_nacimiento = date.today() - timedelta(days=365*25)  # 25 años
        solicitante = SolicitanteCreate(
            es_titular=True,
            tipo_documento=TipoDocumentoEnum.PASAPORTE,
            num_documento="E12345678",
            pais_emisor="VEN",
            primer_nombre="Carlos",
            primer_apellido="González",
            fecha_nacimiento=fecha_nacimiento,
            cod_sexo="M",
            cod_nacionalidad="VEN"
        )
        assert solicitante.es_titular == True
    
    def test_titular_menor_18_invalido(self):
        """Titular menor de 18 años debe ser rechazado"""
        fecha_nacimiento = date.today() - timedelta(days=365*15)  # 15 años
        with pytest.raises(ValueError, match="18 años"):
            SolicitanteCreate(
                es_titular=True,
                tipo_documento=TipoDocumentoEnum.PASAPORTE,
                num_documento="E12345678",
                pais_emisor="VEN",
                primer_nombre="Carlos",
                primer_apellido="González",
                fecha_nacimiento=fecha_nacimiento,
                cod_sexo="M",
                cod_nacionalidad="VEN"
            )
    
    def test_dependiente_menor_18_valido(self):
        """Dependiente menor de 18 años debe ser válido"""
        fecha_nacimiento = date.today() - timedelta(days=365*10)  # 10 años
        solicitante = SolicitanteCreate(
            es_titular=False,
            parentesco_titular=ParentescoEnum.HIJO,
            tipo_documento=TipoDocumentoEnum.PASAPORTE,
            num_documento="E12345679",
            pais_emisor="VEN",
            primer_nombre="Sofía",
            primer_apellido="González",
            fecha_nacimiento=fecha_nacimiento,
            cod_sexo="F",
            cod_nacionalidad="VEN"
        )
        assert solicitante.es_titular == False


class TestLimitePersonas:
    """Tests para límite de 10 personas por solicitud"""
    
    def test_maximo_10_personas_valido(self):
        """Solicitud con exactamente 10 personas debe ser válida"""
        fecha_titular = date.today() - timedelta(days=365*35)
        fecha_hijo = date.today() - timedelta(days=365*10)
        
        solicitantes = [
            SolicitanteCreate(
                es_titular=True,
                tipo_documento=TipoDocumentoEnum.PASAPORTE,
                num_documento="E00000001",
                pais_emisor="VEN",
                primer_nombre="Carlos",
                primer_apellido="González",
                fecha_nacimiento=fecha_titular,
                cod_sexo="M",
                cod_nacionalidad="VEN"
            )
        ]
        
        # Agregar 9 dependientes
        for i in range(9):
            solicitantes.append(
                SolicitanteCreate(
                    es_titular=False,
                    parentesco_titular=ParentescoEnum.HIJO,
                    tipo_documento=TipoDocumentoEnum.PASAPORTE,
                    num_documento=f"E0000000{i+2}",
                    pais_emisor="VEN",
                    primer_nombre=f"Hijo{i+1}",
                    primer_apellido="González",
                    fecha_nacimiento=fecha_hijo,
                    cod_sexo="M",
                    cod_nacionalidad="VEN"
                )
            )
        
        solicitud = SolicitudCreate(
            tipo_solicitud=TipoSolicitudEnum.GRUPAL,
            cod_causa_humanitaria=1,
            solicitantes=solicitantes
        )
        assert len(solicitud.solicitantes) == 10
    
    def test_mas_de_10_personas_invalido(self):
        """Solicitud con más de 10 personas debe ser rechazada"""
        fecha_titular = date.today() - timedelta(days=365*35)
        fecha_hijo = date.today() - timedelta(days=365*10)
        
        solicitantes = [
            SolicitanteCreate(
                es_titular=True,
                tipo_documento=TipoDocumentoEnum.PASAPORTE,
                num_documento="E00000001",
                pais_emisor="VEN",
                primer_nombre="Carlos",
                primer_apellido="González",
                fecha_nacimiento=fecha_titular,
                cod_sexo="M",
                cod_nacionalidad="VEN"
            )
        ]
        
        # Agregar 10 dependientes (total 11)
        for i in range(10):
            solicitantes.append(
                SolicitanteCreate(
                    es_titular=False,
                    parentesco_titular=ParentescoEnum.HIJO,
                    tipo_documento=TipoDocumentoEnum.PASAPORTE,
                    num_documento=f"E0000000{i+2}",
                    pais_emisor="VEN",
                    primer_nombre=f"Hijo{i+1}",
                    primer_apellido="González",
                    fecha_nacimiento=fecha_hijo,
                    cod_sexo="M",
                    cod_nacionalidad="VEN"
                )
            )
        
        with pytest.raises(ValueError, match="10 personas"):
            SolicitudCreate(
                tipo_solicitud=TipoSolicitudEnum.GRUPAL,
                cod_causa_humanitaria=1,
                solicitantes=solicitantes
            )


class TestDependienteCreate:
    """Tests para schema DependienteCreate"""
    
    def test_dependiente_valido(self):
        """Crear dependiente válido"""
        fecha_nacimiento = date.today() - timedelta(days=365*8)  # 8 años
        dependiente = DependienteCreate(
            tipo_documento=TipoDocumentoEnum.PASAPORTE,
            num_documento="E12345679",
            pais_emisor="VEN",
            primer_nombre="Sofía",
            primer_apellido="González",
            fecha_nacimiento=fecha_nacimiento,
            cod_sexo="F",
            cod_nacionalidad="VEN",
            parentesco_titular=ParentescoEnum.HIJO
        )
        assert dependiente.parentesco_titular == ParentescoEnum.HIJO
    
    def test_dependiente_sin_parentesco_invalido(self):
        """Dependiente sin parentesco debe ser rechazado"""
        fecha_nacimiento = date.today() - timedelta(days=365*8)
        with pytest.raises(ValueError):
            DependienteCreate(
                tipo_documento=TipoDocumentoEnum.PASAPORTE,
                num_documento="E12345679",
                pais_emisor="VEN",
                primer_nombre="Sofía",
                primer_apellido="González",
                fecha_nacimiento=fecha_nacimiento,
                cod_sexo="F",
                cod_nacionalidad="VEN"
                # Sin parentesco_titular
            )
```

---

## Paso 9: Verificación y Testing

### Comandos para ejecutar:

```bash
# 1. Activar entorno virtual
cd /home/junci/Source/tramites-mvp-panama/backend
source ../venv-linux/bin/activate

# 2. Verificar sintaxis (ruff)
ruff check app/schemas/schemas_ppsh.py app/services/services_ppsh.py app/routers/routers_ppsh.py

# 3. Ejecutar tests específicos
pytest tests/test_ppsh_dependientes.py -v

# 4. Ejecutar todos los tests PPSH
pytest tests/ -k "ppsh" -v

# 5. Verificar que el servidor arranca
uvicorn app.main:app --reload --port 8000

# 6. Probar endpoints con curl o Postman
```

---

## Paso 10: Commit y Push

```bash
# Agregar cambios
git add -A

# Commit con mensaje descriptivo
git commit -m "feat(ppsh): agregar gestión de dependientes con validaciones

- Extender ParentescoEnum con 8 nuevos valores
- Flexibilizar validación de edad (menores como dependientes)
- Agregar límite de 10 personas por solicitud
- Implementar CRUD de dependientes (agregar/actualizar/eliminar)
- Validar que solo se pueden modificar en estado RECIBIDO sin docs
- Agregar tests unitarios"

# Push
git push
```

---

## Resumen de Cambios

| Archivo | Cambios |
|---------|---------|
| `schemas_ppsh.py` | +8 ParentescoEnum, validación edad flexible, límite 10, schemas Dependiente |
| `services_ppsh.py` | +4 métodos (agregar, actualizar, eliminar, listar dependientes) |
| `routers_ppsh.py` | +4 endpoints CRUD dependientes |
| `schemas/__init__.py` | +3 exports nuevos |
| `tests/test_ppsh_dependientes.py` | Nuevo archivo de tests |

---

## Notas Importantes

1. **La validación de estado RECIBIDO** es crítica - una vez que se cargan documentos, no se pueden modificar dependientes.

2. **El cambio automático de tipo** (INDIVIDUAL ↔ GRUPAL) mantiene consistencia de datos.

3. **Los tests cubren** los casos edge más importantes (límites, validaciones, permisos).

4. **No se requiere migración de BD** - los campos ya existen en el modelo.
