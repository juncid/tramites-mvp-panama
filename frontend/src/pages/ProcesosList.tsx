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
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
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
    ultimaModificacion: '21.08.2025',
    modificadoPor: 'Rubén Blades',
    fechaCreacion: '20.08.2025',
    creadoPor: 'Rubén Blades',
  },
  {
    id: 2,
    nombre: 'Permiso de Protección de Seguridad Humanitaria',
    descripcion: 'Permiso dirigido a personas extranjeras que han permanecido en el país de forma irregular durante al menos un año.',
    estado: 'Activo',
    ultimaModificacion: '21.08.2025',
    modificadoPor: 'Rubén Blades',
    fechaCreacion: '20.08.2025',
    creadoPor: 'Rubén Blades',
  },
  {
    id: 3,
    nombre: 'Permiso de Protección de Seguridad Humanitaria',
    descripcion: 'Permiso dirigido a personas extranjeras que han permanecido en el país de forma irregular durante al menos un año.',
    estado: 'Inactivo',
    ultimaModificacion: '21.08.2025',
    modificadoPor: 'Rubén Blades',
    fechaCreacion: '20.08.2025',
    creadoPor: 'Rubén Blades',
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
          color: '#333333',
          fontSize: '48px',
          lineHeight: 1,
          mb: 4,
        }}
      >
        Procesos
      </Typography>

      {/* Barra de búsqueda y botón */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Nombre o id del proceso"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: '#6B7280', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f1f3f4',
              border: '1px solid #eef3f5',
              borderRadius: 1,
              height: 40,
              paddingRight: 0,
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiInputBase-input': { padding: '10px 12px' },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={() => navigate('/')}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0e5fa6',
            color: '#fff',
            whiteSpace: 'nowrap',
            px: 3,
            height: 40,
            '&:hover': {
              backgroundColor: '#0d5494',
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
              <TableCell sx={{ fontWeight: 700, color: '#333333', width: 80, fontSize: 16 }}>Id</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333333', fontSize: 16 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333333', width: 150, fontSize: 16 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333333', width: 250, textAlign: 'center', fontSize: 16 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockProcesos.map((proceso) => (
              <Fragment key={proceso.id}>
                <TableRow 
                  sx={{ 
                    '&:hover': { backgroundColor: '#F9FAFB' },
                    borderBottom: '1px solid #e7e7e7',
                  }}
                >
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(proceso.id)}
                      sx={{ p: 0.5 }}
                    >
                      {expandedRows.includes(proceso.id) ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                    <Typography sx={{ fontSize: 16, color: '#333333' }}>{proceso.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: '#1F2937', fontSize: 16 }}>
                    {proceso.nombre}
                  </TableCell>
                  <TableCell>
                    {proceso.estado === 'Activo' ? (
                      <Chip
                        label={proceso.estado}
                        size="small"
                        icon={<CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#40775f' }} />}
                        sx={{
                          backgroundColor: '#e1fcef',
                          color: '#40775f',
                          height: 32,
                          borderRadius: '16px',
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      <Chip
                        label={proceso.estado}
                        size="small"
                        icon={<HighlightOffIcon sx={{ fontSize: 16, color: '#6a6e7c' }} />}
                        sx={{
                          backgroundColor: '#eaeef6',
                          color: '#6a6e7c',
                          height: 32,
                          borderRadius: '16px',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6B7280',
                          fontSize: 14,
                          minWidth: 48,
                          px: 0,
                          '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                        }}
                      >
                        Ver
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                        onClick={() => navigate(`/procesos/${proceso.id}`)}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6B7280',
                          fontSize: 14,
                          minWidth: 48,
                          px: 0,
                          '&:hover': { backgroundColor: 'transparent', color: '#2563EB' }
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6B7280',
                          fontSize: 14,
                          minWidth: 48,
                          px: 0,
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
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderBottom: 'none' }} colSpan={4}>
                    <Collapse in={expandedRows.includes(proceso.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ 
                        py: 4,
                        px: 2.5,
                        backgroundColor: '#f8fafb',
                        minHeight: 108,
                      }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1.5,
                            fontSize: 14,
                            color: '#333333',
                            ml: 18,
                          }}
                        >
                          Detalles
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#333333', 
                            mb: 2.5,
                            fontSize: 14,
                            lineHeight: 1.5,
                            textAlign: 'justify',
                            ml: 18,
                            maxWidth: 542,
                          }}
                        >
                          {proceso.descripcion}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 6, ml: 18 }}>
                          <Typography variant="body2" sx={{ color: '#333333', fontSize: 14 }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>Última modificación</Box>: {proceso.ultimaModificacion} por {proceso.modificadoPor}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#333333', fontSize: 14 }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>Fecha de creación</Box>: {proceso.fechaCreacion} por {proceso.creadoPor}
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
