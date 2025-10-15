import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Tramite, ESTADOS_TRAMITE, EstadoTramite } from '../../types'

const getEstadoColor = (estado: EstadoTramite) => {
  switch (estado) {
    case 'pendiente':
      return 'warning'
    case 'en_proceso':
      return 'primary'
    case 'completado':
      return 'success'
    default:
      return 'default'
  }
}

interface TramiteCardProps {
  tramite: Tramite
  onEstadoChange: (id: number, nuevoEstado: EstadoTramite) => void
  onDelete: (id: number) => void
}

export const TramiteCard = ({ tramite, onEstadoChange, onDelete }: TramiteCardProps) => {
  const handleEstadoChange = (event: SelectChangeEvent<string>) => {
    onEstadoChange(tramite.id, event.target.value as EstadoTramite)
  }

  const handleDelete = () => {
    if (window.confirm('¿Está seguro de eliminar este trámite?')) {
      onDelete(tramite.id)
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2, borderRadius: 2, transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 4 } }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" sx={{ flex: 1, mr: 1, color: 'text.primary', fontWeight: 600 }}>
            {tramite.titulo}
          </Typography>
          <IconButton
            onClick={handleDelete}
            color="error"
            size="small"
            aria-label="Eliminar trámite"
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        {tramite.descripcion && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {tramite.descripcion}
          </Typography>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Chip
            label={ESTADOS_TRAMITE[tramite.estado]}
            color={getEstadoColor(tramite.estado)}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(tramite.created_at).toLocaleDateString()}
          </Typography>
        </Box>

        <Box mt={2}>
          <FormControl size="small" fullWidth>
            <Select
              value={tramite.estado}
              onChange={handleEstadoChange}
              displayEmpty
              aria-label="Cambiar estado del trámite"
            >
              {Object.entries(ESTADOS_TRAMITE).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TramiteCard