# 🔮 Arquitectura Futura: Sincronización Workflow-Solicitudes

**Documento de Planificación Post-MVP**  
**Fecha:** 21 de Noviembre, 2025  
**Estado:** 📋 Planificación (No Implementado)

---

## 📌 Contexto

Este documento describe dos enfoques posibles para integrar **WORKFLOW_INSTANCIA** (sistema genérico) con **PPSH_SOLICITUD** (sistema específico) en fases posteriores al MVP.

### Situación Actual MVP

**Arquitectura Implementada:**
- WORKFLOW_INSTANCIA y PPSH_SOLICITUD son sistemas **independientes**
- No hay sincronización automática entre ellos
- Solo un workflow activo a la vez
- Endpoints específicos por tipo de trámite (`/api/v1/ppsh/solicitudes`)
- `WORKFLOW_INSTANCIA` es la fuente única de verdad del estado

**Principio Fundamental:**
```
WORKFLOW_INSTANCIA (Principal - Estado definitivo)
       │
       │ metadata_adicional: {"ppsh_solicitud_id": 123}
       │ (referencia opcional, no FK)
       │
       └──────> PPSH_SOLICITUD (Datos auxiliares específicos)
```

---

## 🎯 Dos Enfoques Posibles

### Opción A: Enfoque Liviano (Recomendado para MVP+)

**Concepto:** Referencia unidireccional simple sin sincronización de estados.

#### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│         ENFOQUE LIVIANO (Sin Sincronización)            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │     WORKFLOW_INSTANCIA (Principal)       │           │
│  │  - Estado definitivo del trámite         │           │
│  │  - Fuente única de verdad                │           │
│  │  - metadata_adicional: {                 │           │
│  │      "ppsh_solicitud_id": 123,           │           │
│  │      "ppsh_data": {...}                  │           │
│  │    }                                      │           │
│  └─────────────────┬────────────────────────┘           │
│                    │                                     │
│                    │ Referencia opcional                 │
│                    │ (no FK, solo JSON)                  │
│                    ▼                                     │
│  ┌──────────────────────────────────────────┐           │
│  │     PPSH_SOLICITUD (Datos Auxiliares)    │           │
│  │  - Solo datos específicos PPSH           │           │
│  │  - NO se sincroniza estado               │           │
│  │  - Creación opcional (solo si hay datos) │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Implementación

**Archivo:** `backend/app/services/services_workflow.py`

```python
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models_workflow import WorkflowInstancia, Workflow
from app.models.models_ppsh import PPSHSolicitud

class InstanciaService:
    
    @staticmethod
    def crear_instancia(
        db: Session,
        workflow_id: int,
        instancia_data: dict,
        user_id: str
    ) -> WorkflowInstancia:
        """
        Crea instancia de workflow con datos auxiliares opcionales.
        Usa UNA sola transacción, sin sincronización de estados.
        """
        try:
            # 1. Crear instancia (siempre)
            instancia = WorkflowInstancia(**instancia_data)
            instancia.creado_por_user_id = user_id
            db.add(instancia)
            db.flush()  # Obtener ID sin commit
            
            # 2. Hook simple para datos específicos (opcional)
            workflow = db.query(Workflow).get(workflow_id)
            if workflow.codigo == "PPSH":
                _crear_datos_ppsh_opcionales(instancia, db)
            
            db.commit()  # Commit único
            db.refresh(instancia)
            return instancia
            
        except Exception as e:
            db.rollback()  # Rollback automático de TODO
            logger.error(f"Error creando instancia: {e}")
            raise HTTPException(status_code=500, detail=str(e))


def _crear_datos_ppsh_opcionales(instancia: WorkflowInstancia, db: Session):
    """
    Crea registro PPSH SOLO si hay datos específicos en metadata.
    NO es obligatorio, NO sincroniza estados.
    """
    metadata = instancia.metadata_adicional or {}
    
    # Solo crear si hay datos PPSH específicos
    if "ppsh_data" not in metadata:
        return  # Sin datos PPSH, no crear registro auxiliar
    
    ppsh_data = metadata["ppsh_data"]
    
    # Crear registro auxiliar
    solicitud = PPSHSolicitud(
        num_expediente=instancia.num_expediente,
        tipo_solicitud=ppsh_data.get("tipo_solicitud", "INDIVIDUAL"),
        cod_causa_humanitaria=ppsh_data.get("causa_humanitaria", 1),
        descripcion_caso=ppsh_data.get("descripcion", ""),
        estado_actual="RECIBIDO",  # Estado fijo inicial, NO sincroniza
        created_by=instancia.creado_por_user_id
    )
    db.add(solicitud)
    db.flush()
    
    # Guardar referencia simple (no FK)
    metadata["ppsh_solicitud_id"] = solicitud.id_solicitud
    instancia.metadata_adicional = metadata
    
    logger.info(
        f"Datos PPSH auxiliares creados para instancia {instancia.num_expediente}",
        extra={"solicitud_id": solicitud.id_solicitud}
    )
```

#### Consultas

```python
@router.get("/tramites/{num_expediente}")
def obtener_tramite(num_expediente: str, db: Session = Depends(get_db)):
    """
    Obtiene trámite usando WORKFLOW_INSTANCIA como fuente de verdad.
    PPSH_SOLICITUD solo son datos auxiliares.
    """
    
    # 1. Buscar en WORKFLOW_INSTANCIA (principal)
    instancia = db.query(WorkflowInstancia).filter_by(
        num_expediente=num_expediente
    ).first()
    
    if not instancia:
        raise HTTPException(status_code=404, detail="Trámite no encontrado")
    
    # 2. Datos básicos vienen de instancia (fuente única de verdad)
    response = {
        "num_expediente": instancia.num_expediente,
        "estado": instancia.estado.value,  # ← Estado definitivo
        "etapa_actual": instancia.etapa_actual.nombre,
        "fecha_inicio": instancia.fecha_inicio,
        "creado_por": instancia.creado_por_user_id
    }
    
    # 3. Datos específicos PPSH (si existen)
    ppsh_id = (instancia.metadata_adicional or {}).get("ppsh_solicitud_id")
    if ppsh_id:
        solicitud = db.query(PPSHSolicitud).get(ppsh_id)
        if solicitud:
            response["datos_ppsh"] = {
                "tipo_solicitud": solicitud.tipo_solicitud,
                "causa_humanitaria": solicitud.causa_humanitaria.nombre,
                "descripcion_caso": solicitud.descripcion_caso
            }
    
    return response
```

#### Testing

```python
def test_crear_instancia_ppsh_sin_datos_especificos():
    """Instancia PPSH sin datos específicos → NO crea PPSH_SOLICITUD"""
    instancia = crear_instancia(
        db=db,
        workflow_id=workflow_ppsh.id,
        instancia_data={"nombre_instancia": "Test"},
        user_id="USER001"
    )
    
    assert instancia.id is not None
    assert "ppsh_solicitud_id" not in (instancia.metadata_adicional or {})
    
    # Verificar que NO se creó PPSH_SOLICITUD
    solicitud = db.query(PPSHSolicitud).filter_by(
        num_expediente=instancia.num_expediente
    ).first()
    assert solicitud is None


def test_crear_instancia_ppsh_con_datos_especificos():
    """Instancia PPSH con datos específicos → Crea PPSH_SOLICITUD opcional"""
    instancia = crear_instancia(
        db=db,
        workflow_id=workflow_ppsh.id,
        instancia_data={
            "nombre_instancia": "Test",
            "metadata_adicional": {
                "ppsh_data": {
                    "tipo_solicitud": "INDIVIDUAL",
                    "causa_humanitaria": 1,
                    "descripcion": "Caso de prueba"
                }
            }
        },
        user_id="USER001"
    )
    
    assert instancia.id is not None
    assert "ppsh_solicitud_id" in instancia.metadata_adicional
    
    # Verificar PPSH_SOLICITUD creada
    ppsh_id = instancia.metadata_adicional["ppsh_solicitud_id"]
    solicitud = db.query(PPSHSolicitud).get(ppsh_id)
    assert solicitud is not None
    assert solicitud.num_expediente == instancia.num_expediente
```

#### Ventajas

✅ **Simplicidad extrema**: Solo 1 función helper pequeña  
✅ **Sin transacciones distribuidas**: Todo en una transacción  
✅ **Sin mapeo de estados**: No hay sincronización compleja  
✅ **Testing mínimo**: 2-3 tests básicos  
✅ **Sin inconsistencias**: Una sola fuente de verdad  
✅ **Escalable**: Fácil agregar otros tipos de trámites (Visa, Residencia)  
✅ **Performance**: Sin overhead de sincronización  

#### Limitaciones Aceptables

⚠️ **PPSH_SOLICITUD no tiene estado actualizado**: Solo para datos específicos iniciales  
⚠️ **Consultas requieren JOIN manual**: Para reportes que necesiten ambas tablas  
⚠️ **Datos PPSH opcionales**: Puede no existir para todas las instancias PPSH  

#### Cuándo Usar

- ✅ MVP y MVP+ (primeros 6-12 meses)
- ✅ Cuando WORKFLOW_INSTANCIA es suficiente para operaciones
- ✅ Cuando no hay integraciones legacy con PPSH_SOLICITUD
- ✅ Cuando se priorizan simplicidad y velocidad de desarrollo

---

### Opción B: Enfoque con Sincronización Completa

**Concepto:** Sincronización bidireccional automática entre sistemas.

#### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│              SERVICIO DE SINCRONIZACIÓN                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐         ┌──────────────────────┐ │
│  │  WORKFLOW_INSTANCIA  │◄───────►│ WorkflowSyncService  │ │
│  │  (Tabla Genérica)    │  Sync   │                      │ │
│  └──────────────────────┘         └──────────┬───────────┘ │
│                                               │             │
│                                    ┌──────────▼───────────┐ │
│                                    │   Estrategia de      │ │
│                                    │   Sincronización     │ │
│                                    └──────────┬───────────┘ │
│                                               │             │
│           ┌───────────────────────────────────┼─────────┐   │
│           │                                   │         │   │
│  ┌────────▼────────┐   ┌───────────▼───────┐ │ ┌───────▼─┐ │
│  │ PPSH_SOLICITUD  │   │  VISA_SOLICITUD   │ │ │  ...    │ │
│  │ (Específico)    │   │  (Específico)     │ │ │         │ │
│  └─────────────────┘   └───────────────────┘ │ └─────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Componentes

1. **WorkflowSyncStrategy (Abstracta)**: Define interfaz de sincronización
2. **PPSHSyncStrategy**: Implementación específica para PPSH
3. **WorkflowSyncService**: Orquestador de estrategias
4. **Mapeo de Estados**: INICIADO→RECIBIDO, EN_PROGRESO→EN_REVISION, etc.

#### Modelo de Datos

```python
class WorkflowInstancia(Base):
    __tablename__ = "WORKFLOW_INSTANCIA"
    
    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey('WORKFLOW.id'))
    num_expediente = Column(String(50), unique=True)
    estado = Column(Enum(EstadoInstancia))
    
    # NUEVO: Referencia a tabla específica
    tipo_solicitud = Column(String(20))  # 'PPSH', 'VISA', 'RESIDENCIA'
    solicitud_id = Column(Integer)       # ID en tabla específica
    
    # Metadata para sincronización
    metadata_adicional = Column(JSON)


class PPSHSolicitud(Base):
    __tablename__ = "PPSH_SOLICITUD"
    
    id_solicitud = Column(Integer, primary_key=True)
    num_expediente = Column(String(20), unique=True)
    estado_actual = Column(String(30))
    
    # NUEVO: Referencia a workflow genérico
    workflow_instancia_id = Column(Integer)  # FK opcional
```

#### Implementación

```python
from abc import ABC, abstractmethod

class WorkflowSyncStrategy(ABC):
    """Estrategia abstracta para sincronización"""
    
    @abstractmethod
    def create_specific_record(
        self, 
        instancia: WorkflowInstancia, 
        db: Session
    ) -> Optional[int]:
        pass
    
    @abstractmethod
    def update_specific_record(
        self, 
        instancia: WorkflowInstancia, 
        db: Session
    ) -> bool:
        pass
    
    @abstractmethod
    def map_estado_to_specific(self, estado_workflow: str) -> str:
        pass


class PPSHSyncStrategy(WorkflowSyncStrategy):
    """Estrategia de sincronización para PPSH"""
    
    ESTADO_MAP = {
        "INICIADO": "RECIBIDO",
        "EN_PROGRESO": "EN_REVISION",
        "COMPLETADO": "APROBADO",
        "CANCELADO": "RECHAZADO",
        "SUSPENDIDO": "PENDIENTE"
    }
    
    def create_specific_record(
        self, 
        instancia: WorkflowInstancia, 
        db: Session
    ) -> Optional[int]:
        solicitud = PPSHSolicitud(
            num_expediente=instancia.num_expediente,
            estado_actual=self.map_estado_to_specific(instancia.estado.value),
            workflow_instancia_id=instancia.id,
            # ... más campos
        )
        db.add(solicitud)
        db.flush()
        return solicitud.id_solicitud
    
    def update_specific_record(
        self, 
        instancia: WorkflowInstancia, 
        db: Session
    ) -> bool:
        solicitud_id = instancia.metadata_adicional.get("ppsh_solicitud_id")
        solicitud = db.query(PPSHSolicitud).get(solicitud_id)
        
        if solicitud:
            # Sincronizar estado
            solicitud.estado_actual = self.map_estado_to_specific(
                instancia.estado.value
            )
            return True
        return False
    
    def map_estado_to_specific(self, estado_workflow: str) -> str:
        return self.ESTADO_MAP.get(estado_workflow, "RECIBIDO")


class WorkflowSyncService:
    """Servicio orquestador"""
    
    def __init__(self):
        self.strategies: Dict[str, WorkflowSyncStrategy] = {}
    
    def register_strategy(self, tipo: str, strategy: WorkflowSyncStrategy):
        self.strategies[tipo] = strategy
    
    def crear_instancia_con_sync(
        self,
        db: Session,
        workflow_id: int,
        instancia_data: Dict[str, Any],
        user_id: str
    ) -> WorkflowInstancia:
        """Crea instancia y sincroniza con tabla específica"""
        
        # 1. Crear WORKFLOW_INSTANCIA
        instancia = WorkflowInstancia(**instancia_data)
        db.add(instancia)
        db.flush()
        
        # 2. Detectar tipo de workflow
        workflow = db.query(Workflow).get(workflow_id)
        tipo_workflow = workflow.codigo
        
        # 3. Sincronizar si hay estrategia registrada
        if tipo_workflow in self.strategies:
            strategy = self.strategies[tipo_workflow]
            
            # Crear registro específico
            solicitud_id = strategy.create_specific_record(instancia, db)
            
            # Almacenar referencias cruzadas
            instancia.tipo_solicitud = tipo_workflow
            instancia.solicitud_id = solicitud_id
            instancia.metadata_adicional = {
                f"{tipo_workflow.lower()}_solicitud_id": solicitud_id,
                "sync_version": 1
            }
        
        db.commit()
        return instancia
```

#### Ventajas

✅ Unifica vista de todos los trámites  
✅ Reutiliza lógica de workflow dinámico  
✅ Escalable a múltiples tipos de trámites  
✅ Mantiene compatibilidad con sistemas existentes  
✅ Estados sincronizados automáticamente  

#### Desventajas

❌ Aumenta complejidad del sistema significativamente  
❌ Requiere transacciones más complejas  
❌ Necesita mapeo de estados exhaustivo  
❌ Testing mucho más extenso (20+ tests)  
❌ Posibles inconsistencias si falla sincronización  
❌ Performance más lenta por múltiples writes  
❌ Más difícil de debuggear y mantener  

#### Cuándo Usar

- ⏳ Post-MVP (después de 12 meses)
- ⏳ Cuando hay múltiples workflows activos simultáneamente
- ⏳ Cuando hay integraciones legacy que requieren PPSH_SOLICITUD actualizado
- ⏳ Cuando se necesitan reportes unificados complejos
- ⏳ Cuando hay requerimientos legales de doble registro

---

## 📊 Comparación de Enfoques

| Aspecto | Opción A (Liviano) | Opción B (Sincronización) |
|---------|-------------------|---------------------------|
| **Complejidad** | Muy baja (1 función) | Alta (múltiples clases) |
| **Transacciones** | 1 transacción simple | Múltiples transacciones |
| **Mapeo de estados** | No necesario | Complejo (5+ estados) |
| **Testing** | 2-3 tests | 20+ tests |
| **Inconsistencias** | Imposibles | Posibles |
| **Performance** | Excelente | Moderada |
| **Mantenimiento** | Fácil | Complejo |
| **Tiempo desarrollo** | 1-2 días | 4-6 semanas |
| **Escalabilidad** | Alta | Alta |
| **Debugging** | Fácil | Difícil |

---

## 🚀 Recomendación

### Para MVP y MVP+ (0-12 meses)

**Usar Opción A: Enfoque Liviano**

**Razones:**
1. Cumple todos los requisitos del MVP
2. Desarrollo 20x más rápido
3. Sin riesgo de inconsistencias
4. Fácil de entender y mantener
5. Performance óptimo

### Para Post-MVP (12+ meses)

**Considerar Opción B solo si:**
1. Hay múltiples workflows activos (5+)
2. Integraciones legacy requieren PPSH_SOLICITUD sincronizado
3. Hay equipo dedicado para mantener sincronización
4. Se han identificado casos de uso específicos que lo justifiquen

---

## 📋 Plan de Migración (Si se decide implementar Opción B)

### Fase 1: Preparación (2 semanas)

- [ ] Agregar columnas de referencia cruzada en tablas
- [ ] Crear WorkflowSyncService base
- [ ] Implementar WorkflowSyncStrategy abstracta
- [ ] Tests unitarios de estrategias

### Fase 2: Implementación PPSH (2 semanas)

- [ ] Crear PPSHSyncStrategy
- [ ] Integrar en endpoints existentes
- [ ] Script de migración de datos existentes
- [ ] Tests de integración

### Fase 3: Múltiples Workflows (1 semana)

- [ ] Crear VisaSyncStrategy
- [ ] Crear ResidenciaSyncStrategy
- [ ] Configurar múltiples workflows activos

### Fase 4: Optimización (1 semana)

- [ ] Índices en campos de referencia
- [ ] Cache de estrategias
- [ ] Logging de sincronización
- [ ] Monitoreo de errores

**Tiempo Total Estimado:** 6 semanas

---

## 🔧 Script de Migración de Datos (Para Opción B)

```python
"""
Migra datos existentes para soportar sincronización bidireccional
SOLO ejecutar si se decide implementar Opción B
"""

def migrate_to_sync_architecture(db: Session):
    """Migra datos existentes agregando referencias cruzadas"""
    
    # 1. Agregar columnas (ejecutar SQL directo)
    db.execute("""
        ALTER TABLE WORKFLOW_INSTANCIA
        ADD tipo_solicitud VARCHAR(20) NULL,
        ADD solicitud_id INT NULL;
        
        ALTER TABLE PPSH_SOLICITUD
        ADD workflow_instancia_id INT NULL;
    """)
    
    # 2. Correlacionar registros por num_expediente
    instancias = db.query(WorkflowInstancia).filter(
        WorkflowInstancia.workflow_id.in_(
            db.query(Workflow.id).filter_by(codigo="PPSH")
        )
    ).all()
    
    for instancia in instancias:
        solicitud = db.query(PPSHSolicitud).filter_by(
            num_expediente=instancia.num_expediente
        ).first()
        
        if solicitud:
            # Crear referencias bidireccionales
            instancia.tipo_solicitud = "PPSH"
            instancia.solicitud_id = solicitud.id_solicitud
            instancia.metadata_adicional = {
                "ppsh_solicitud_id": solicitud.id_solicitud,
                "sync_version": 1,
                "migrated": True
            }
            
            solicitud.workflow_instancia_id = instancia.id
            
            print(f"✓ Migrado: {instancia.num_expediente}")
    
    db.commit()
    print(f"✅ Migración completada: {len(instancias)} registros")
```

---

## 📚 Referencias

- **Patrón Strategy**: https://refactoring.guru/design-patterns/strategy
- **SQLAlchemy Transactions**: https://docs.sqlalchemy.org/en/14/orm/session_transaction.html
- **Event-Driven Architecture**: https://martinfowler.com/articles/201701-event-driven.html
- **CQRS Pattern**: https://martinfowler.com/bliki/CQRS.html

---

## ✅ Checklist de Decisión

Antes de implementar sincronización completa (Opción B), verificar:

- [ ] ¿El MVP actual no satisface las necesidades?
- [ ] ¿Hay múltiples workflows activos que lo requieren?
- [ ] ¿Existen integraciones legacy que dependen de PPSH_SOLICITUD?
- [ ] ¿El equipo tiene capacidad de mantener la complejidad adicional?
- [ ] ¿Se ha calculado el ROI de la sincronización vs el costo de desarrollo?
- [ ] ¿Se han identificado casos de uso específicos que lo justifiquen?

**Si respondiste NO a más de 3 preguntas, mantén Opción A (Liviano).**

---

**Fecha de Última Actualización:** 21 de Noviembre, 2025  
**Próxima Revisión:** Post-MVP (Q2 2026)  
**Responsable:** Equipo de Arquitectura
