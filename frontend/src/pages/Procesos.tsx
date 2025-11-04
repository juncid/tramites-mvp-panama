import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import type { Workflow, EstadoWorkflow } from '../types/workflow';

const estadoColors: Record<EstadoWorkflow, 'default' | 'primary' | 'success' | 'error'> = {
  BORRADOR: 'default',
  ACTIVO: 'success',
  INACTIVO: 'error',
  ARCHIVADO: 'default',
};

export const Procesos: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoWorkflow | 'TODOS'>('TODOS');

  useEffect(() => {
    loadWorkflows();
  }, []);

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
    navigate('/procesos/nuevo');
  };

  const handleEdit = (id: number) => {
    navigate(`/procesos/${id}/editar`);
  };

  const handleView = (id: number) => {
    navigate(`/procesos/${id}`);
  };

  const handleDuplicate = async (workflow: Workflow) => {
    try {
      const newWorkflow = {
        ...workflow,
        codigo: `${workflow.codigo}_COPY`,
        nombre: `${workflow.nombre} (Copia)`,
        estado: 'BORRADOR' as EstadoWorkflow,
      };
      delete (newWorkflow as any).id;
      await workflowService.createWorkflow(newWorkflow);
      loadWorkflows();
    } catch (error) {
      console.error('Error al duplicar workflow:', error);
    }
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Procesos y Flujos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevoProceso}>
          Nuevo Proceso
        </Button>
      </Stack>

      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o código..."
          />
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Versión</TableCell>
              <TableCell align="right">Acciones</TableCell>
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
                <TableRow key={workflow.id} hover>
                  <TableCell>{workflow.codigo}</TableCell>
                  <TableCell>{workflow.nombre}</TableCell>
                  <TableCell>
                    <Chip
                      label={workflow.estado}
                      color={estadoColors[workflow.estado]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{workflow.categoria || '-'}</TableCell>
                  <TableCell>{workflow.version}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleView(workflow.id!)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(workflow.id!)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDuplicate(workflow)}>
                      <FileCopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(workflow.id!)}
                      disabled={workflow.estado === 'ACTIVO'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
