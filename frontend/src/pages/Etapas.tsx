import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ppshService } from '../services/ppsh.service';

interface Etapa {
  id_etapa_solicitud: number;
  codigo_etapa: string;
  nombre_etapa: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO';
  fecha_completado: string | null;
}

export const Etapas = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEtapas();
    }
  }, [id]);

  const loadEtapas = async () => {
    try {
      setLoading(true);
      const data = await ppshService.getEtapasSolicitud(parseInt(id!));
      setEtapas(data);
    } catch (err) {
      console.error('Error cargando etapas:', err);
      setError('Error cargando las etapas de la solicitud');
    } finally {
      setLoading(false);
    }
  };
  
  const getEstadoColor = (estado: string) => {
    if (estado === 'COMPLETADO') return 'success';
    if (estado === 'EN_PROCESO') return 'info';
    return 'default';
  };

  const getEstadoLabel = (estado: string) => {
    if (estado === 'COMPLETADO') return 'Completado';
    if (estado === 'EN_PROCESO') return 'En proceso';
    return 'Pendiente';
  };

  // Separar etapas completadas y actuales
  const etapasCompletadas = etapas.filter(e => e.estado === 'COMPLETADO');
  const etapasActuales = etapas.filter(e => e.estado !== 'COMPLETADO');

  const EtapasTable = ({ etapas, title }: { etapas: Etapa[]; title: string }) => (
    <Box sx={{ mb: 5 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700, 
          color: '#1F2937',
          mb: 3,
        }}
      >
        {title}
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 100 }}>Etapa</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Nombre etapa</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 150 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 200, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {etapas.map((etapa) => (
              <TableRow 
                key={etapa.id_etapa_solicitud}
                sx={{ 
                  '&:hover': { backgroundColor: '#F9FAFB' },
                }}
              >
                <TableCell sx={{ fontWeight: 500, color: '#1F2937' }}>
                  {etapa.codigo_etapa}
                </TableCell>
                <TableCell sx={{ color: '#6B7280' }}>
                  {etapa.nombre_etapa}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getEstadoLabel(etapa.estado)} 
                    color={getEstadoColor(etapa.estado) as any}
                    size="small"
                    icon={etapa.estado === 'EN_PROCESO' ? <Box component="span" sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#22C55E',
                      display: 'inline-block',
                      ml: 1,
                    }} /> : undefined}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        if (etapa.codigo_etapa === '1.7') {
                          navigate(`/solicitudes/${id}/revision`);
                        }
                      }}
                      sx={{ 
                        textTransform: 'none',
                        color: '#6B7280',
                        '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                      }}
                    >
                      Ver
                    </Button>
                    {etapa.estado === 'EN_PROCESO' && (
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          if (etapa.codigo_etapa === '1.7') {
                            navigate(`/solicitudes/${id}/revision`);
                          }
                        }}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6B7280',
                          '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                        }}
                      >
                        editar
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Inicio
        </Link>
        <Link
          underline="hover"
          sx={{ color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate('/solicitudes')}
        >
          Solicitudes
        </Link>
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
          Etapas
        </Typography>
      </Breadcrumbs>

      {/* Título */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          color: '#1F2937',
          mb: 4,
        }}
      >
        Etapas
      </Typography>

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="N"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Tabla de etapas actuales (pendientes o en proceso) */}
          {etapasActuales.length > 0 && (
            <EtapasTable etapas={etapasActuales} title="Etapas" />
          )}

          {/* Tabla de historial (completadas) */}
          {etapasCompletadas.length > 0 && (
            <EtapasTable etapas={etapasCompletadas} title="Historial" />
          )}

          {etapas.length === 0 && (
            <Alert severity="info">
              No hay etapas registradas para esta solicitud.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};
