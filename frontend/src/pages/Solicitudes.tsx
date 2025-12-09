import {
  Box,
  Typography,
  Link,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  TablePagination,
  Card,
  CardContent,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ppshService } from '../services/ppsh.service';
import type { SolicitudListItem } from '../types/ppsh';

export const Solicitudes = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [solicitudes, setSolicitudes] = useState<SolicitudListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'fecha' | 'ruex' | null>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0); // 0-indexed para MUI
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce para búsqueda (evitar muchas llamadas al servidor)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Resetear a primera página al buscar
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Función para cargar solicitudes desde el servidor
  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ppshService.listarSolicitudes({
        page: page + 1, // Backend usa 1-indexed
        page_size: rowsPerPage,
        buscar: debouncedSearchTerm || undefined,
      });
      
      // Ordenar en cliente (el backend no tiene ordenamiento por fecha/ruex)
      let sortedItems = [...response.items];
      if (sortField) {
        sortedItems.sort((a, b) => {
          let comparison = 0;
          if (sortField === 'fecha') {
            const dateA = new Date(a.fecha_solicitud).getTime();
            const dateB = new Date(b.fecha_solicitud).getTime();
            comparison = dateA - dateB;
          } else if (sortField === 'ruex') {
            const ruexA = a.num_expediente || '';
            const ruexB = b.num_expediente || '';
            comparison = ruexA.localeCompare(ruexB);
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      
      setSolicitudes(sortedItems);
      setTotalItems(response.total);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, sortField, sortDirection]);

  // Cargar solicitudes cuando cambian los parámetros
  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  // Función para manejar el click en headers ordenables
  const handleSort = (field: 'fecha' | 'ruex') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    // No reseteamos página aquí porque el ordenamiento se hace en cliente sobre los datos ya cargados
  };

  // Handlers de paginación
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para obtener estilos de estado según Figma
  const getEstadoStyles = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'ACTIVO':
      case 'RECIBIDO':
      case 'EN_PROCESO':
        return {
          backgroundColor: '#e1fcef',
          color: '#328056',
          icon: 'check' as const,
        };
      case 'COMPLETADO':
      case 'RESUELTO':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          icon: 'check' as const,
        };
      case 'RECHAZADO':
        return {
          backgroundColor: '#ffebee',
          color: '#c62828',
          icon: 'cancel' as const,
          fontWeight: 600,
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#666666',
          icon: null as const,
        };
    }
  };

  // Función para determinar si el estado es solo lectura (no permite editar)
  const isEstadoSoloLectura = (estado: string): boolean => {
    const estadoUpper = estado.toUpperCase();
    return estadoUpper === 'RECHAZADO' || estadoUpper === 'RESUELTO';
  };

  // Función helper para obtener el icono según el tipo
  const getEstadoIcon = (iconType: 'check' | 'cancel' | null) => {
    if (iconType === 'check') return <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />;
    if (iconType === 'cancel') return <CancelIcon sx={{ fontSize: 14 }} />;
    return undefined;
  };

  // Función para obtener el label del estado (RECHAZADO siempre en mayúsculas)
  const getEstadoLabel = (estado: string): string => {
    if (estado === 'RECIBIDO') return 'Activo';
    if (estado.toUpperCase() === 'RECHAZADO') return 'RECHAZADO';
    return estado.toLowerCase();
  };

  return (
    <Box>
      {/* Breadcrumbs - estilo Figma */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Link
          underline="none"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#757575', 
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            '&:hover': { color: '#333' }
          }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
          Inicio
        </Link>
        <Typography sx={{ color: '#757575', fontSize: '14px' }}>/</Typography>
        <Typography sx={{ color: '#757575', fontSize: '14px', fontFamily: 'Roboto, sans-serif' }}>
          Solicitudes
        </Typography>
      </Box>

      {/* Título - estilo Figma */}
      <Typography 
        sx={{ 
          fontWeight: 700, 
          color: '#333333',
          fontSize: isMobile ? '32px' : '48px',
          fontFamily: 'Roboto Flex, Roboto, sans-serif',
          mb: isMobile ? 3 : 4,
          lineHeight: 1.5,
        }}
      >
        Solicitudes
      </Typography>

      {/* Barra de búsqueda - estilo Figma (360px, gris claro, ícono derecha) */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: '#4d4d4d', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: isMobile ? '100%' : '360px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f1f3f4',
              borderRadius: '4px',
              height: '40px',
              '& fieldset': {
                borderColor: '#eef3f5',
              },
              '&:hover fieldset': {
                borderColor: '#ccc',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0e5fa6',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '16px',
              color: '#4d4d4d',
              fontFamily: 'Roboto, sans-serif',
              padding: '8px 16px',
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#4d4d4d',
              opacity: 1,
            },
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

      {/* Tabla de solicitudes - estilo Figma (sin bordes, minimalista) */}
      {!loading && !error && (
        <Box sx={{ width: '100%', maxWidth: '1194px' }}>
          {/* Filas de datos - Mobile: Cards, Desktop: Table */}
          {solicitudes.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: '#6B7280' }}>
              No se encontraron solicitudes
            </Box>
          ) : isMobile ? (
            // Vista Mobile: Cards
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {solicitudes.map((solicitud) => {
                const estadoStyles = getEstadoStyles(solicitud.estado_actual);
                const soloLectura = isEstadoSoloLectura(solicitud.estado_actual);
                return (
                  <Card 
                    key={solicitud.id_solicitud}
                    sx={{ 
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Header: Tipo y Estado */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography 
                          sx={{ 
                            color: '#0e5fa6', 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            fontFamily: 'Roboto, sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          PPSH
                        </Typography>
                        <Chip
                          icon={getEstadoIcon(estadoStyles.icon)}
                          label={getEstadoLabel(solicitud.estado_actual)}
                          size="small"
                          sx={{
                            backgroundColor: estadoStyles.backgroundColor,
                            color: estadoStyles.color,
                            fontFamily: 'Roboto, sans-serif',
                            textTransform: solicitud.estado_actual.toUpperCase() === 'RECHAZADO' ? 'uppercase' : 'capitalize',
                            fontWeight: solicitud.estado_actual.toUpperCase() === 'RECHAZADO' ? 600 : 400,
                            '& .MuiChip-icon': {
                              color: estadoStyles.color,
                            },
                          }}
                        />
                      </Box>
                      
                      {/* Nombre del solicitante */}
                      <Typography 
                        sx={{ 
                          color: '#333333', 
                          fontSize: '18px', 
                          fontWeight: 500,
                          fontFamily: 'Roboto, sans-serif',
                          mb: 1,
                        }}
                      >
                        {solicitud.nombre_titular || 'N/A'}
                      </Typography>
                      
                      {/* RUEX y Fecha */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                        <Typography 
                          sx={{ 
                            color: '#666666', 
                            fontSize: '14px', 
                            fontFamily: 'Roboto, sans-serif',
                          }}
                        >
                          <strong>RUEX:</strong> {solicitud.num_expediente || 'N/A'}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: '#666666', 
                            fontSize: '14px', 
                            fontFamily: 'Roboto, sans-serif',
                          }}
                        >
                          <strong>Fecha:</strong> {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-PA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).replace(/\//g, '.')}
                        </Typography>
                      </Box>
                      
                      {/* Botón de acción */}
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={soloLectura ? <VisibilityIcon /> : <EditIcon />}
                        onClick={() => navigate(`/solicitudes/${solicitud.id_solicitud}/etapas`)}
                        sx={{
                          borderColor: '#0e5fa6',
                          color: '#0e5fa6',
                          fontFamily: 'Roboto, sans-serif',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#0e5fa6',
                            backgroundColor: 'rgba(14, 95, 166, 0.04)',
                          },
                        }}
                      >
                        {soloLectura ? 'Ver' : 'Ver y editar'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            // Vista Desktop: Tabla
            <>
              {/* Headers */}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: '80px 200px 180px 180px 180px 200px',
                  gap: 2,
                  pb: 1,
                }}
              >
                <Typography sx={{ fontWeight: 500, color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                  Solicitud
                </Typography>
                <Typography sx={{ fontWeight: 500, color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                  Solicitante
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { opacity: 0.7 }
                  }}
                  onClick={() => handleSort('ruex')}
                >
                  <Typography sx={{ fontWeight: 500, color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                    RUEX
                  </Typography>
                  {sortField === 'ruex' && (
                    sortDirection === 'asc' 
                      ? <ArrowUpwardIcon sx={{ fontSize: 16, color: '#0e5fa6' }} />
                      : <ArrowDownwardIcon sx={{ fontSize: 16, color: '#0e5fa6' }} />
                  )}
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { opacity: 0.7 }
                  }}
                  onClick={() => handleSort('fecha')}
                >
                  <Typography sx={{ fontWeight: 500, color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                    Fecha solicitud
                  </Typography>
                  {sortField === 'fecha' && (
                    sortDirection === 'asc' 
                      ? <ArrowUpwardIcon sx={{ fontSize: 16, color: '#0e5fa6' }} />
                      : <ArrowDownwardIcon sx={{ fontSize: 16, color: '#0e5fa6' }} />
                  )}
                </Box>
                <Typography sx={{ fontWeight: 500, color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                  Estado
                </Typography>
                <Typography sx={{ fontWeight: 500, color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                  Acciones
                </Typography>
              </Box>

              {/* Línea separadora - estilo Figma */}
              <Box sx={{ height: '4px', backgroundColor: '#f3f3f3', mb: 2 }} />

              {/* Filas de datos */}
              {solicitudes.map((solicitud) => {
                const estadoStyles = getEstadoStyles(solicitud.estado_actual);
                return (
                  <Box 
                    key={solicitud.id_solicitud}
                    sx={{ 
                      display: 'grid',
                      gridTemplateColumns: '80px 200px 180px 180px 180px 200px',
                      gap: 2,
                      py: 1,
                      alignItems: 'center',
                      '&:hover': { backgroundColor: '#fafafa' },
                    }}
                  >
                    {/* Solicitud (tipo) */}
                    <Typography sx={{ color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                      PPSH
                    </Typography>

                    {/* Solicitante */}
                    <Typography sx={{ color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                      {solicitud.nombre_titular || 'N/A'}
                    </Typography>

                    {/* RUEX */}
                    <Typography sx={{ color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                      {solicitud.num_expediente || 'N/A'}
                    </Typography>

                    {/* Fecha solicitud */}
                    <Typography sx={{ color: '#333333', fontSize: '16px', fontFamily: 'Roboto, sans-serif' }}>
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-PA', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '.')}
                    </Typography>

                    {/* Estado - estilo Figma (chip verde con check) */}
                    <Box 
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: estadoStyles.backgroundColor,
                        borderRadius: '16px',
                        px: 1,
                        py: 0.5,
                        width: 'fit-content',
                      }}
                    >
                      {estadoStyles.icon === 'check' && (
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: estadoStyles.color }} />
                      )}
                      {estadoStyles.icon === 'cancel' && (
                        <CancelIcon sx={{ fontSize: 16, color: estadoStyles.color }} />
                      )}
                      <Typography sx={{ 
                        color: estadoStyles.color, 
                        fontSize: '16px', 
                        fontFamily: 'Roboto, sans-serif',
                        textTransform: solicitud.estado_actual.toUpperCase() === 'RECHAZADO' ? 'uppercase' : 'capitalize',
                        fontWeight: solicitud.estado_actual.toUpperCase() === 'RECHAZADO' ? 600 : 400,
                      }}>
                        {getEstadoLabel(solicitud.estado_actual)}
                      </Typography>
                    </Box>

                    {/* Acciones - estilo Figma (Ver y editar o solo Ver según estado) */}
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={() => navigate(`/solicitudes/${solicitud.id_solicitud}/etapas`)}
                    >
                      {isEstadoSoloLectura(solicitud.estado_actual) ? (
                        <>
                          <VisibilityIcon sx={{ fontSize: 16, color: '#333333' }} />
                          <Typography sx={{ 
                            color: '#333333', 
                            fontSize: '14px', 
                            fontFamily: 'Roboto, sans-serif',
                          }}>
                            Ver
                          </Typography>
                        </>
                      ) : (
                        <>
                          <EditIcon sx={{ fontSize: 16, color: '#333333' }} />
                          <Typography sx={{ 
                            color: '#333333', 
                            fontSize: '14px', 
                            fontFamily: 'Roboto, sans-serif',
                          }}>
                            Ver y editar
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </>
          )}

          {/* Paginación del servidor */}
          {totalItems > 0 && (
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
              sx={{
                mt: 2,
                '.MuiTablePagination-toolbar': {
                  fontFamily: 'Roboto, sans-serif',
                },
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px',
                  color: '#333333',
                },
                '.MuiTablePagination-select': {
                  fontFamily: 'Roboto, sans-serif',
                },
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
