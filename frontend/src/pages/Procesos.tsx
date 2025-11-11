import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import type { Workflow, EstadoWorkflow } from '../types/workflow';

export const Procesos: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoWorkflow | 'TODOS'>('TODOS');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error al cargar workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoProceso = () => {
    navigate('/flujos/nuevo');
  };

  const handleEdit = (id: number) => {
    navigate(`/flujos/${id}/editar`);
  };

  const handleView = (id: number) => {
    navigate(`/flujos/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este proceso?')) {
      try {
        await workflowService.deleteWorkflow(id);
        loadWorkflows();
      } catch (error) {
        console.error('Error al eliminar workflow:', error);
      }
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === 'TODOS' || workflow.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          color: '#333333',
          fontSize: '48px',
          lineHeight: 1.5,
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
            maxWidth: 360,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f1f3f4',
              border: '1px solid #eef3f5',
              borderRadius: '4px',
              height: 40,
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiInputBase-input': { 
              padding: '8px 16px',
              fontSize: 16,
              color: '#4d4d4d',
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 20 }} />}
          onClick={handleNuevoProceso}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0e5fa6',
            color: '#fff',
            whiteSpace: 'nowrap',
            px: 2,
            height: 40,
            fontSize: 16,
            '&:hover': {
              backgroundColor: '#0d5494',
            }
          }}
        >
          Nuevo Proceso
        </Button>
      </Box>

      {/* Filtro de estado - mantener funcionalidad */}
      {estadoFilter !== 'TODOS' && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                label="Estado"
                onChange={(e) => setEstadoFilter(e.target.value as EstadoWorkflow | 'TODOS')}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="INACTIVO">Inactivo</MenuItem>
                <MenuItem value="ARCHIVADO">Archivado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f3f3f3', height: 40 }}>
              <TableCell sx={{ fontWeight: 500, color: '#333333', fontSize: 16, py: 1 }}>Id</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333333', fontSize: 16, py: 1 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333333', fontSize: 16, py: 1 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333333', fontSize: 16, py: 1, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredWorkflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron procesos
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkflows.map((workflow) => (
                <Fragment key={workflow.id}>
                  <TableRow 
                    sx={{ 
                      '&:hover': { backgroundColor: '#F9FAFB' },
                      borderBottom: '1px solid #e7e7e7',
                      height: 40,
                    }}
                  >
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(workflow.id!)}
                        sx={{ p: 0.5 }}
                      >
                        {expandedRows.includes(workflow.id!) ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>{workflow.id}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 400, color: '#333333', fontSize: 16, py: 1 }}>
                      {workflow.nombre}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {workflow.estado === 'ACTIVO' ? (
                        <Chip
                          label="Activo"
                          size="small"
                          icon={<CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#40775f !important' }} />}
                          sx={{
                            backgroundColor: '#e1fcef',
                            color: '#40775f',
                            height: 32,
                            borderRadius: '16px',
                            fontWeight: 400,
                            fontSize: 16,
                            '& .MuiChip-icon': {
                              color: '#40775f',
                            }
                          }}
                        />
                      ) : (
                        <Chip
                          label="Inactivo"
                          size="small"
                          icon={<HighlightOffIcon sx={{ fontSize: 16, color: '#6a6e7c !important' }} />}
                          sx={{
                            backgroundColor: '#eaeef6',
                            color: '#6a6e7c',
                            height: 32,
                            borderRadius: '16px',
                            fontWeight: 400,
                            fontSize: 16,
                            '& .MuiChip-icon': {
                              color: '#6a6e7c',
                            }
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleView(workflow.id!)}
                          sx={{ 
                            textTransform: 'none',
                            color: '#333333',
                            fontSize: 14,
                            minWidth: 'auto',
                            px: 1,
                            '&:hover': { backgroundColor: 'transparent', color: '#0e5fa6' }
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleEdit(workflow.id!)}
                          sx={{ 
                            textTransform: 'none',
                            color: '#333333',
                            fontSize: 14,
                            minWidth: 'auto',
                            px: 1,
                            '&:hover': { backgroundColor: 'transparent', color: '#0e5fa6' }
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleDelete(workflow.id!)}
                          disabled={workflow.estado === 'ACTIVO'}
                          sx={{ 
                            textTransform: 'none',
                            color: '#333333',
                            fontSize: 14,
                            minWidth: 'auto',
                            px: 1,
                            '&:hover': { backgroundColor: 'transparent', color: '#cc3333' },
                            '&.Mui-disabled': { color: '#ccc' }
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
                      <Collapse in={expandedRows.includes(workflow.id!)} timeout="auto" unmountOnExit>
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
                            {workflow.descripcion || 'Permiso dirigido a personas extranjeras que han permanecido en el país de forma irregular durante al menos un año.'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 6, ml: 18 }}>
                            <Typography variant="body2" sx={{ color: '#333333', fontSize: 14 }}>
                              <Box component="span" sx={{ fontWeight: 500 }}>Última modificación</Box>: {new Date(workflow.updated_at || workflow.created_at).toLocaleDateString('es-PA')} por Usuario Admin
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#333333', fontSize: 14 }}>
                              <Box component="span" sx={{ fontWeight: 500 }}>Fecha de creación</Box>: {new Date(workflow.created_at).toLocaleDateString('es-PA')} por Usuario Admin
                            </Typography>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
