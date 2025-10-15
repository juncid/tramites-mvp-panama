import {
  Container,
  Typography,
  Box,
  Divider,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material'
import { useState } from 'react'
import { useTramites } from '../hooks'
import { TramiteCreate, EstadoTramite } from '../types'
import { TramiteForm, TramiteList, LoadingSpinner, ErrorAlert } from '../components'

export const TramitesPage = () => {
  const { tramites, loading, error, createTramite, updateTramite, deleteTramite } = useTramites()
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleCreateTramite = async (tramite: TramiteCreate) => {
    try {
      await createTramite(tramite)
      showSnackbar('Trámite creado exitosamente', 'success')
    } catch (error) {
      showSnackbar('Error al crear el trámite', 'error')
      throw error
    }
  }

  const handleEstadoChange = async (id: number, nuevoEstado: EstadoTramite) => {
    try {
      await updateTramite(id, { estado: nuevoEstado })
      showSnackbar('Estado actualizado exitosamente', 'success')
    } catch (error) {
      showSnackbar('Error al actualizar el estado', 'error')
    }
  }

  const handleDeleteTramite = async (id: number) => {
    try {
      await deleteTramite(id)
      showSnackbar('Trámite eliminado exitosamente', 'success')
    } catch (error) {
      showSnackbar('Error al eliminar el trámite', 'error')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Cargando trámites..." />
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
            Trámites MVP Panamá - SNMP
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
            Sistema Nacional de Migración de Panamá
          </Typography>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'primary.main', borderWidth: 1 }} />

        {error && (
          <Box mb={3}>
            <ErrorAlert message={error} />
          </Box>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <TramiteForm onSubmit={handleCreateTramite} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box mb={3}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                Lista de Trámites
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona y administra todos los trámites del sistema
              </Typography>
            </Box>
            <TramiteList
              tramites={tramites}
              onEstadoChange={handleEstadoChange}
              onDelete={handleDeleteTramite}
            />
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default TramitesPage