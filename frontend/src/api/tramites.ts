import axios from 'axios'
import { Tramite, TramiteCreate, TramiteUpdate } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
