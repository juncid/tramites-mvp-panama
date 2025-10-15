import { useState, useEffect, useCallback } from 'react'
import { Tramite, TramiteCreate, TramiteUpdate } from '../types'
import * as tramitesApi from '../api/tramites'

export interface UseTramitesResult {
  tramites: Tramite[]
  loading: boolean
  error: string | null
  createTramite: (tramite: TramiteCreate) => Promise<void>
  updateTramite: (id: number, tramite: TramiteUpdate) => Promise<void>
  deleteTramite: (id: number) => Promise<void>
  refreshTramites: () => Promise<void>
}

export const useTramites = (): UseTramitesResult => {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTramites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tramitesApi.getTramites()
      setTramites(data)
    } catch (err) {
      setError('Error al cargar los trámites')
      console.error('Error fetching tramites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTramite = useCallback(async (tramite: TramiteCreate) => {
    try {
      setError(null)
      await tramitesApi.createTramite(tramite)
      await fetchTramites()
    } catch (err) {
      setError('Error al crear el trámite')
      console.error('Error creating tramite:', err)
      throw err
    }
  }, [fetchTramites])

  const updateTramite = useCallback(async (id: number, tramite: TramiteUpdate) => {
    try {
      setError(null)
      await tramitesApi.updateTramite(id, tramite)
      await fetchTramites()
    } catch (err) {
      setError('Error al actualizar el trámite')
      console.error('Error updating tramite:', err)
      throw err
    }
  }, [fetchTramites])

  const deleteTramite = useCallback(async (id: number) => {
    try {
      setError(null)
      await tramitesApi.deleteTramite(id)
      await fetchTramites()
    } catch (err) {
      setError('Error al eliminar el trámite')
      console.error('Error deleting tramite:', err)
      throw err
    }
  }, [fetchTramites])

  useEffect(() => {
    fetchTramites()
  }, [fetchTramites])

  return {
    tramites,
    loading,
    error,
    createTramite,
    updateTramite,
    deleteTramite,
    refreshTramites: fetchTramites,
  }
}