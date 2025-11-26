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

// Etapas de solicitud
export { DescargaRequisitos } from './DescargaRequisitos'
export { CargaPoderGeneral } from './CargaPoderGeneral'
export { CargaSolicitudFirmada } from './CargaSolicitudFirmada'
export { Cotizacion } from './Cotizacion'
export { RecepcionRecibosPagos } from './RecepcionRecibosPagos'
export { ImpresionListaCasos } from './ImpresionListaCasos'
export { ReasignacionCaso } from './ReasignacionCaso'
export { ProgramacionEntrevista } from './ProgramacionEntrevista'
export { RecepcionRex } from './RecepcionRex'
export { RecepcionReciboTesoreria } from './RecepcionReciboTesoreria'
export { NotasEntrevista } from './NotasEntrevista'
export { DictamenFinal } from './DictamenFinal'
export { EntregaResolucion } from './EntregaResolucion'
export { RevisionRequisitos } from './RevisionRequisitos'

// Páginas públicas
export { InicioTramite } from './InicioTramite'
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
