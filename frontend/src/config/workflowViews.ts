/**
 * Configuración centralizada de vistas del workflow PPSH
 * 
 * Define las rutas, componentes y metadatos de cada etapa
 * para eliminar la lógica if-else hardcodeada
 */

/**
 * Configuración de una vista de workflow
 */
export interface WorkflowViewConfig {
  /**
   * Ruta relativa de la vista (se anexa al basePath)
   */
  path: string;
  
  /**
   * Etiqueta para breadcrumbs
   */
  breadcrumbLabel: string;
  
  /**
   * Título del contenido
   */
  contentTitle: string;
  
  /**
   * Descripción del contenido
   */
  contentDescription: string;
  
  /**
   * Código de respuesta para el backend
   */
  responseCode?: string;
}

/**
 * Registro de todas las vistas del workflow PPSH
 * La clave es el número de orden de la etapa (1-11)
 */
export const WORKFLOW_VIEWS: Record<number, WorkflowViewConfig> = {
  1: {
    path: 'descarga-requisitos',
    breadcrumbLabel: 'Carga de requisitos del trámite PPSH',
    contentTitle: 'Requisitos del trámite PPSH',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'DESC_ARCHIVO',
  },
  2: {
    path: 'carga-poder',
    breadcrumbLabel: 'Carga de Poder General',
    contentTitle: 'Carga de Poder General',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in.',
    responseCode: 'CARGA_PODER',
  },
  3: {
    path: 'carga-documentos',
    breadcrumbLabel: 'Carga de requisitos del trámite PPSH',
    contentTitle: 'Carga de requisitos del trámite PPSH',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'CARGA_SOLICITUD',
  },
  4: {
    path: 'revision',
    breadcrumbLabel: 'Revisión',
    contentTitle: 'Revisión de Requisitos',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in.',
    responseCode: 'REVISION',
  },
  5: {
    path: 'cotizacion',
    breadcrumbLabel: 'Cotización',
    contentTitle: 'Cotización del Trámite',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in.',
    responseCode: 'COTIZACION',
  },
  6: {
    path: 'ingreso-datos',
    breadcrumbLabel: 'Ingreso de Datos',
    contentTitle: 'Recepción recibos pagos en tesorería',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'DATOS_CASO',
  },
  7: {
    path: 'impresion-lista',
    breadcrumbLabel: 'Impresión Lista',
    contentTitle: 'Impresión lista de casos',
    contentDescription: 'Seleccione los casos que han sido procesados y están listos para imprimir. La selección de casos marcará esta etapa como completada.',
    responseCode: 'CASOS_IMPRESOS',
  },
  8: {
    path: 'reasignacion',
    breadcrumbLabel: 'Revisión',
    contentTitle: 'Revisa detalladamente los requisitos',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'SELECCION_CASO',
  },
  9: {
    path: 'recepcion-rex',
    breadcrumbLabel: 'Recepción REX',
    contentTitle: 'Recepción REX',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'REX',
  },
  10: {
    path: 'recepcion-recibo-tesoreria',
    breadcrumbLabel: 'Recepción recibo Tesorería',
    contentTitle: 'Recepción recibo Tesorería',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'RECIBO_TESORERIA',
  },
  11: {
    path: 'entrega-resolucion',
    breadcrumbLabel: 'Entrega resolución',
    contentTitle: 'Entrega resolución',
    contentDescription: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
    responseCode: 'ENTREGA_RESOLUCION',
  },
};

/**
 * Obtiene la configuración de una vista por número de orden
 * @param orden - Número de orden de la etapa (1-11)
 * @returns Configuración de la vista o undefined si no existe
 */
export function getViewConfig(orden: number): WorkflowViewConfig | undefined {
  return WORKFLOW_VIEWS[orden];
}

/**
 * Obtiene la ruta de una vista por número de orden
 * @param orden - Número de orden de la etapa
 * @returns Ruta de la vista o null si no existe
 */
export function getViewPath(orden: number): string | null {
  const config = WORKFLOW_VIEWS[orden];
  return config?.path ?? null;
}

/**
 * Verifica si una etapa tiene vista personalizada
 * @param orden - Número de orden de la etapa
 * @returns true si tiene vista personalizada
 */
export function hasCustomView(orden: number): boolean {
  return orden in WORKFLOW_VIEWS;
}

/**
 * Obtiene la ruta completa de navegación para una etapa
 * @param basePath - Ruta base (/solicitudes/:id o /workflows/:id)
 * @param orden - Número de orden de la etapa
 * @param etapaId - ID de la etapa (para vista dinámica)
 * @param readonly - Si es modo solo lectura
 * @returns Ruta completa de navegación
 */
export function getEtapaNavigationPath(
  basePath: string,
  orden: number,
  etapaId: number,
  readonly: boolean = false
): string {
  const queryParam = readonly ? '?readonly=true' : '';
  
  const config = WORKFLOW_VIEWS[orden];
  if (config) {
    return `${basePath}/${config.path}${queryParam}`;
  }
  
  // Etapas sin vista personalizada usan la vista dinámica
  const readonlyForExecution = readonly ? '&readonly=true' : '';
  return `${basePath}/execution?etapa=${etapaId}${readonlyForExecution}`;
}

/**
 * Breadcrumbs base para todas las vistas PPSH
 */
export const BASE_BREADCRUMBS = [
  { label: 'Inicio', path: '/' },
  { label: 'Procesos' },
  { label: 'Permiso de Protección de Seguridad Humanitaria' },
];

/**
 * Obtiene los breadcrumbs completos para una etapa
 * @param orden - Número de orden de la etapa
 * @returns Array de breadcrumbs
 */
export function getEtapaBreadcrumbs(orden: number): Array<{ label: string; path?: string }> {
  const config = WORKFLOW_VIEWS[orden];
  if (!config) {
    return [...BASE_BREADCRUMBS, { label: 'Etapa' }];
  }
  return [...BASE_BREADCRUMBS, { label: config.breadcrumbLabel }];
}

export default WORKFLOW_VIEWS;
