/**
 * Página "Mis Trámites"
 * Lista de casos/trámites del usuario con acceso a sus workflows
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

// TODO: Crear servicio para obtener instancias/casos del usuario
interface CasoTramite {
  id: number;
  num_expediente: string;
  workflow_nombre: string;
  estado: string;
  fecha_inicio: string;
  fecha_estimada_fin?: string;
  progreso_porcentaje: number;
  etapa_actual?: string;
}

/**
 * Página principal de Mis Trámites
 */
export const MisTramitesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado
  const [tramites, setTramites] = useState<CasoTramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  // TODO: Obtener perfil del usuario actual desde el contexto de autenticación
  const perfilUsuario = 'Ciudadano';

  // Cargar trámites del usuario
  useEffect(() => {
    const cargarTramites = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Implementar llamada al servicio
        // const data = await tramitesService.getMisTramites(perfilUsuario);
        // setTramites(data);

        // Datos de ejemplo por ahora
        const datosEjemplo: CasoTramite[] = [
          {
            id: 1,
            num_expediente: 'TRM-2025-001',
            workflow_nombre: 'Solicitud de Permiso de Trabajo',
            estado: 'EN_PROCESO',
            fecha_inicio: '2025-11-01T10:00:00Z',
            fecha_estimada_fin: '2025-11-30T10:00:00Z',
            progreso_porcentaje: 45,
            etapa_actual: 'Revisión de documentos',
          },
          {
            id: 2,
            num_expediente: 'TRM-2025-002',
            workflow_nombre: 'Renovación de Visa',
            estado: 'COMPLETADO',
            fecha_inicio: '2025-10-15T10:00:00Z',
            progreso_porcentaje: 100,
          },
          {
            id: 3,
            num_expediente: 'TRM-2025-003',
            workflow_nombre: 'Solicitud de Residencia',
            estado: 'EN_PROCESO',
            fecha_inicio: '2025-11-10T10:00:00Z',
            fecha_estimada_fin: '2025-12-15T10:00:00Z',
            progreso_porcentaje: 20,
            etapa_actual: 'Carga de documentos',
          },
        ];

        setTramites(datosEjemplo);
      } catch (err: any) {
        console.error('Error al cargar trámites:', err);
        setError(err.message || 'Error al cargar los trámites');
      } finally {
        setLoading(false);
      }
    };

    cargarTramites();
  }, [perfilUsuario]);

  // Filtrar trámites
  const tramitesFiltrados = tramites.filter((tramite) => {
    const cumpleBusqueda =
      busqueda === '' ||
      tramite.num_expediente.toLowerCase().includes(busqueda.toLowerCase()) ||
      tramite.workflow_nombre.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleEstado = filtroEstado === 'TODOS' || tramite.estado === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'success';
      case 'EN_PROCESO':
        return 'primary';
      case 'CANCELADO':
        return 'error';
      case 'SUSPENDIDO':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Obtener label del estado
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'Completado';
      case 'EN_PROCESO':
        return 'En proceso';
      case 'CANCELADO':
        return 'Cancelado';
      case 'SUSPENDIDO':
        return 'Suspendido';
      default:
        return estado;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Trámites
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona y da seguimiento a tus trámites en curso
        </Typography>
      </Box>

      {/* Filtros y búsqueda */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por número de expediente o tipo de trámite"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                label="Estado"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="EN_PROCESO">En proceso</MenuItem>
                <MenuItem value="COMPLETADO">Completados</MenuItem>
                <MenuItem value="CANCELADO">Cancelados</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lista de trámites */}
      {!loading && !error && (
        <>
          {tramitesFiltrados.length === 0 ? (
            <Alert severity="info">
              {busqueda || filtroEstado !== 'TODOS'
                ? 'No se encontraron trámites con los filtros aplicados'
                : 'No tienes trámites activos en este momento'}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {tramitesFiltrados.map((tramite) => (
                <Grid item xs={12} key={tramite.id}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        {/* Encabezado de la tarjeta */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" component="h2">
                              {tramite.workflow_nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expediente: {tramite.num_expediente}
                            </Typography>
                          </Box>
                          <Chip
                            label={getEstadoLabel(tramite.estado)}
                            color={getEstadoColor(tramite.estado) as any}
                            size="small"
                          />
                        </Box>

                        {/* Información del trámite */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Fecha de inicio
                            </Typography>
                            <Typography variant="body2">
                              {new Date(tramite.fecha_inicio).toLocaleDateString('es-PA')}
                            </Typography>
                          </Box>

                          {tramite.fecha_estimada_fin && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Fecha estimada
                              </Typography>
                              <Typography variant="body2">
                                {new Date(tramite.fecha_estimada_fin).toLocaleDateString('es-PA')}
                              </Typography>
                            </Box>
                          )}

                          {tramite.etapa_actual && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Etapa actual
                              </Typography>
                              <Typography variant="body2">{tramite.etapa_actual}</Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Barra de progreso */}
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progreso
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {tramite.progreso_porcentaje}%
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 8,
                              backgroundColor: (theme) => theme.palette.grey[200],
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${tramite.progreso_porcentaje}%`,
                                backgroundColor: (theme) =>
                                  tramite.estado === 'COMPLETADO'
                                    ? theme.palette.success.main
                                    : theme.palette.primary.main,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/casos/${tramite.id}/workflow`)}
                      >
                        Ver detalles
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default MisTramitesPage;
