// =============================================================================
// COMPONENTES COMUNES
// =============================================================================
export * from './common'
export * from './tramites'
export * from './PPSH'

// =============================================================================
// COMPONENTES DE WORKFLOW
// =============================================================================
// NOTA: Existen dos carpetas de workflow por convención de case:
// - workflow/ (minúscula) - Componentes base: EtapaInformativa, fields/
// - Workflow/ (mayúscula) - Componentes avanzados: Editor, Viewer, QuestionViews/
// 
// TODO: En el futuro, considerar unificar en una sola carpeta
// =============================================================================

// Componentes base de workflow (workflow/)
export { EtapaInformativa } from './workflow/EtapaInformativa'
export * from './workflow/fields'

// Componentes avanzados de workflow (Workflow/)
export { DynamicEtapaView } from './Workflow/DynamicEtapaView'
export { EtapaConfigPanel } from './Workflow/EtapaConfigPanel'
export { EtapaExecutionForm } from './Workflow/EtapaExecutionForm'
export { WorkflowProgressIndicator } from './Workflow/WorkflowProgressIndicator'
export { WorkflowHistoryView } from './Workflow/WorkflowHistoryView'