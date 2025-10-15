export interface Tramite {
  id: number
  titulo: string
  descripcion: string | null
  estado: EstadoTramite
  activo: boolean
  created_at: string
  updated_at: string | null
}

export interface TramiteCreate {
  titulo: string
  descripcion?: string
  estado: EstadoTramite
}

export interface TramiteUpdate {
  titulo?: string
  descripcion?: string
  estado?: EstadoTramite
  activo?: boolean
}

export type EstadoTramite = 'pendiente' | 'en_proceso' | 'completado'

export const ESTADOS_TRAMITE: { [key in EstadoTramite]: string } = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
}

export const ESTADOS_TRAMITE_VALUES: EstadoTramite[] = ['pendiente', 'en_proceso', 'completado']

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}