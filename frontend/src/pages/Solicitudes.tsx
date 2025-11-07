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
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ppshService } from '../services/ppsh.service';
import type { SolicitudListItem } from '../types/ppsh';

export const Solicitudes = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ppshService.listarSolicitudes({
          page: 1,
          page_size: 20,
        });
        setSolicitudes(response.items);
      } catch (err) {
        console.error('Error cargando solicitudes:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const filteredSolicitudes = solicitudes.filter(sol =>
    sol.num_expediente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.nombre_titular?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Completado':
        return 'info';
      case 'En proceso':
        return 'warning';
      default:
        return 'default';
    }
  };

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
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
          Solicitudes
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
        Solicitudes
      </Typography>

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por expediente o nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Estado de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error cargando solicitudes: {error}
        </Alert>
      )}

      {/* Tabla de solicitudes */}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151', width: 80 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Solicitud</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Solicitante</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>RUEX</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Fecha solicitud</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSolicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#6B7280' }}>
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              ) : (
                filteredSolicitudes.map((solicitud) => (
                  <TableRow 
                    key={solicitud.id_solicitud}
                    sx={{ 
                      '&:hover': { backgroundColor: '#F9FAFB' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#2563EB' }}>
                      #{solicitud.id_solicitud}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#1F2937' }}>
                      {solicitud.tipo_solicitud}
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>
                      {solicitud.nombre_titular || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>
                      {solicitud.num_expediente || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-PA')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={solicitud.estado_actual} 
                        color={getEstadoColor(solicitud.estado_actual) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/solicitudes/${solicitud.id_solicitud}/etapas`)}
                          sx={{ 
                            textTransform: 'none',
                            color: '#6B7280',
                            '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/solicitudes/${solicitud.id_solicitud}/revision`)}
                          sx={{ 
                            textTransform: 'none',
                            color: '#6B7280',
                            '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                          }}
                        >
                          editar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
