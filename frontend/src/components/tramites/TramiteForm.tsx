import { useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { TramiteCreate, ESTADOS_TRAMITE, ESTADOS_TRAMITE_VALUES } from '../../types'

const schema = yup.object({
  titulo: yup.string().required('El título es requerido').min(3, 'Mínimo 3 caracteres'),
  descripcion: yup.string().optional(),
  estado: yup.string().oneOf(ESTADOS_TRAMITE_VALUES, 'Estado inválido').required('El estado es requerido'),
})

interface TramiteFormProps {
  onSubmit: (tramite: TramiteCreate) => Promise<void>
  initialValues?: Partial<TramiteCreate>
  submitLabel?: string
}

export const TramiteForm = ({
  onSubmit,
  initialValues,
  submitLabel = 'Crear Trámite',
}: TramiteFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TramiteCreate>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      titulo: initialValues?.titulo || '',
      descripcion: initialValues?.descripcion || '',
      estado: initialValues?.estado || 'pendiente',
    },
  })

  const onFormSubmit = async (data: TramiteCreate) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          {submitLabel}
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <TextField
            {...register('titulo')}
            label="Título"
            fullWidth
            error={!!errors.titulo}
            helperText={errors.titulo?.message}
            margin="normal"
            required
          />
          <TextField
            {...register('descripcion')}
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            error={!!errors.descripcion}
            helperText={errors.descripcion?.message}
            margin="normal"
          />
          <TextField
            {...register('estado')}
            select
            label="Estado"
            fullWidth
            error={!!errors.estado}
            helperText={errors.estado?.message}
            margin="normal"
            required
          >
            {Object.entries(ESTADOS_TRAMITE).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 140, py: 1.5 }}
            >
              {isSubmitting ? 'Procesando...' : submitLabel}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TramiteForm