import { useState, Fragment } from 'react';
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
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  ultimaModificacion: string;
  modificadoPor: string;
  fechaCreacion: string;
  creadoPor: string;
}

const mockProcesos: Proceso[] = [
  {
    id: 1,
    nombre: 'Permiso de Protección de Seguridad Humanitaria',
    descripcion: 'Permiso dirigido a personas extranjeras que han permanecido en el país de forma irregular durante al menos un año.',
    estado: 'Activo',
    ultimaModificacion: '21.06.2025',
    modificadoPor: 'Ruben Blades',
    fechaCreacion: '20.06.2025',
    creadoPor: 'Ruben Blades',
  },
  {
    id: 2,
    nombre: 'Permiso de Protección de Seguridad Humanitaria',
    descripcion: 'Permiso dirigido a personas extranjeras que han permanecido en el país de forma irregular durante al menos un año.',
    estado: 'Activo',
    ultimaModificacion: '21.06.2025',
    modificadoPor: 'Ruben Blades',
    fechaCreacion: '20.06.2025',
    creadoPor: 'Ruben Blades',
  },
  {
    id: 3,
    nombre: 'Permiso de Protección de Seguridad Humanitaria',
    descripcion: 'Permiso dirigido a personas extranjeras que han permanecido en el país de forma irregular durante al menos un año.',
    estado: 'Inactivo',
    ultimaModificacion: '21.06.2025',
    modificadoPor: 'Ruben Blades',
    fechaCreacion: '20.06.2025',
    creadoPor: 'Ruben Blades',
  },
];

export const ProcesosList = () => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'Activo' ? 'success' : 'default';
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
          sx={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}
          href="/"
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Inicio
        </Link>
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
          Procesos
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
        Procesos
      </Typography>

      {/* Barra de búsqueda y botón */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Nombre o id del proceso"
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'none',
            backgroundColor: '#2563EB',
            whiteSpace: 'nowrap',
            px: 3,
            '&:hover': {
              backgroundColor: '#1D4ED8',
            }
          }}
        >
          Nuevo Proceso
        </Button>
      </Box>

      {/* Tabla de procesos */}
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 80 }}>Id</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 150 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 250, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockProcesos.map((proceso) => (
              <Fragment key={proceso.id}>
                <TableRow 
                  sx={{ 
                    '&:hover': { backgroundColor: '#F9FAFB' },
                  }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(proceso.id)}
                    >
                      {expandedRows.includes(proceso.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    {proceso.id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: '#1F2937' }}>
                    {proceso.nombre}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={proceso.estado} 
                      color={getEstadoColor(proceso.estado) as any}
                      size="small"
                      icon={proceso.estado === 'Activo' ? <Box component="span" sx={{ 
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
                        onClick={() => navigate(`/procesos/${proceso.id}`)}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6B7280',
                          '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6B7280',
                          '&:hover': { backgroundColor: 'transparent', color: '#DC2626' }
                        }}
                      >
                        Borrar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* Fila expandida con detalles */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={expandedRows.includes(proceso.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ 
                        py: 2, 
                        px: 3,
                        backgroundColor: '#F9FAFB',
                        borderTop: '1px solid #E5E7EB',
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Detalles
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                          {proceso.descripcion}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            <strong>Última modificación:</strong> {proceso.ultimaModificacion} por {proceso.modificadoPor}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            <strong>Fecha de creación:</strong> {proceso.fechaCreacion} por {proceso.creadoPor}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
