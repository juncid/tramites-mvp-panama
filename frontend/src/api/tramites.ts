import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Tramite {
  id: number
  titulo: string
  descripcion: string | null
  estado: string
  activo: boolean
  created_at: string
  updated_at: string | null
}

export interface TramiteCreate {
  titulo: string
  descripcion?: string
  estado: string
}

export interface TramiteUpdate {
  titulo?: string
  descripcion?: string
  estado?: string
  activo?: boolean
}

export const getTramites = async (skip = 0, limit = 100): Promise<Tramite[]> => {
  const response = await api.get(`/tramites?skip=${skip}&limit=${limit}`)
  return response.data
}

export const getTramite = async (id: number): Promise<Tramite> => {
  const response = await api.get(`/tramites/${id}`)
  return response.data
}

export const createTramite = async (tramite: TramiteCreate): Promise<Tramite> => {
  const response = await api.post('/tramites', tramite)
  return response.data
}

export const updateTramite = async (id: number, tramite: TramiteUpdate): Promise<Tramite> => {
  const response = await api.put(`/tramites/${id}`, tramite)
  return response.data
}

export const deleteTramite = async (id: number): Promise<void> => {
  await api.delete(`/tramites/${id}`)
}
