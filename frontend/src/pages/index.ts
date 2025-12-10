// =============================================================================
// PÁGINAS PRINCIPALES (usadas en AppRouter)
// =============================================================================

// Dashboard y navegación
export { Dashboard } from './Dashboard'
export { Solicitudes } from './Solicitudes'
export { Procesos } from './Procesos'

// Workflow
export { WorkflowEtapas } from './WorkflowEtapas'
export { default as WorkflowEtapasPublico } from './WorkflowEtapasPublico'
export { WorkflowExecution } from './WorkflowExecution'
export { WorkflowEditor } from './WorkflowEditor'
export { WorkflowViewer } from './WorkflowViewer'
export { WorkflowEditorFigma } from './WorkflowEditorFigma'
export { GenericEtapaPage } from './GenericEtapaPage'

// =============================================================================
// ETAPAS CON LÓGICA ESPECIAL (mantener - no se pueden reemplazar con GenericEtapaPage)
// =============================================================================
export { DescargaRequisitos } from './DescargaRequisitos'       // Auto-completa 3 etapas
export { CargaPoderGeneral } from './CargaPoderGeneral'         // OCR upload especial
export { CargaSolicitudFirmada } from './CargaSolicitudFirmada' // OCR upload especial
export { Cotizacion } from './Cotizacion'                       // Items dinámicos de cotización
export { RevisionRequisitos } from './RevisionRequisitos'       // OCR masivo especial

// =============================================================================
// ETAPAS SIMPLES - DEPRECADAS (usar GenericEtapaPage en su lugar)
// Mantener exports para compatibilidad, pero no usar en nuevas rutas
// Archivos movidos a _deprecated/
// =============================================================================
/** @deprecated Usar GenericEtapaPage con ?etapaCode=RECEPCION_RECIBOS */
export { RecepcionRecibosPagos } from './_deprecated/RecepcionRecibosPagos'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=IMPRESION_LISTA */
export { ImpresionListaCasos } from './_deprecated/ImpresionListaCasos'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=REASIGNACION */
export { ReasignacionCaso } from './_deprecated/ReasignacionCaso'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=PROGRAMACION_ENTREVISTA */
export { ProgramacionEntrevista } from './_deprecated/ProgramacionEntrevista'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=RECEPCION_REX */
export { RecepcionRex } from './_deprecated/RecepcionRex'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=RECEPCION_TESORERIA */
export { RecepcionReciboTesoreria } from './_deprecated/RecepcionReciboTesoreria'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=NOTAS_ENTREVISTA */
export { NotasEntrevista } from './_deprecated/NotasEntrevista'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=DICTAMEN_FINAL */
export { DictamenFinal } from './_deprecated/DictamenFinal'
/** @deprecated Usar GenericEtapaPage con ?etapaCode=ENTREGA_RESOLUCION */
export { EntregaResolucion } from './_deprecated/EntregaResolucion'

// Páginas públicas
export { InicioTramite } from './InicioTramite'
export { InicioCiudadano } from './InicioCiudadano'
export { default as PublicAccess } from './PublicAccess'
export { default as PublicSolicitudView } from './PublicSolicitudView'
export { default as NuevaSolicitud } from './NuevaSolicitud'
export { default as SolicitudPublicaWorkflow } from './SolicitudPublicaWorkflow'

// Otras páginas
export { Tramites } from './Tramites'
export { MisTramitesPage } from './MisTramites'
export { CasoWorkflowPage } from './CasoWorkflow'
export { ComponentComparison } from './ComponentComparison'
export { CargaDocumentosPPSH } from './CargaDocumentosPPSH'
export { DetalleProcesoPPSH } from './DetalleProcesoPPSH'
export { ProcesoEjecucion } from './ProcesoEjecucion'
export { EtapaExecution } from './EtapaExecution'
export { TestVisa } from './TestVisa'
export { default as Profile } from './Profile'
export { default as Settings } from './Settings'

// =============================================================================
// PÁGINAS LEGADO (mantener para compatibilidad, evaluar eliminar)
// =============================================================================
export { TramitesPage } from './TramitesPage'
export { default as TramitesPageUser } from './TramitesPageUser'
export { default as BpmnPage } from './BpmnPage'
export { default as OCRTestPage } from './OCRTestPage'
export { Documentos } from './Documentos'
export { Etapas } from './Etapas'
export { ProcesosList } from './ProcesosList'
export { Reportes } from './Reportes'
export { Workflow } from './Workflow'
