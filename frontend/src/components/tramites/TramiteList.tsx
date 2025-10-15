import { Grid, Typography, Box } from '@mui/material'
import { Tramite, EstadoTramite } from '../../types'
import { TramiteCard } from './TramiteCard'

interface TramiteListProps {
  tramites: Tramite[]
  onEstadoChange: (id: number, nuevoEstado: EstadoTramite) => void
  onDelete: (id: number) => void
}

export const TramiteList = ({ tramites, onEstadoChange, onDelete }: TramiteListProps) => {
  if (tramites.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No hay trámites registrados.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={2}>
      {tramites.map(tramite => (
        <Grid item xs={12} sm={6} md={4} key={tramite.id}>
          <TramiteCard
            tramite={tramite}
            onEstadoChange={onEstadoChange}
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default TramiteList