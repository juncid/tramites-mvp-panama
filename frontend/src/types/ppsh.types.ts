/**
 * Tipos TypeScript para el sistema PPSH
 */

export interface ProcesoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  indicacionesExtra?: string;
  estado: EstadoProceso;
  fechaCreacion: string;
  fechaActualizacion: string;
  usuarioCreador: Usuario;
}

export interface EstadoProceso {
  id: number;
  activo: boolean;
  etapa: EtapaProceso;
  fechaCambio: string;
}

export type EtapaProceso = 
  | 'INICIADO'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'COMPLETADO'
  | 'CANCELADO';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface HistoryEvent {
  id: number;
  fecha: string;
  hora: string;
  accion: string;
  descripcion: string;
  usuario: Usuario;
  estadoResultante: string;
  tipo: TipoEvento;
}

export type TipoEvento =
  | 'CREACION'
  | 'MODIFICACION'
  | 'CAMBIO_ESTADO'
  | 'CARGA_DOCUMENTO'
  | 'REVISION_DOCUMENTO'
  | 'COMENTARIO'
  | 'APROBACION'
  | 'RECHAZO';

export interface FlowStep {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
  completado: boolean;
  actual: boolean;
  fechaCompletado?: string;
}

export interface TabNavigationProps {
  currentTab: number;
  onTabChange: (newTab: number) => void;
}
