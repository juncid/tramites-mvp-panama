import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PanTool as PanToolIcon,
  DocumentScanner as ScannerIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import CustomNode from '../components/Workflow/CustomNode';
import type { WorkflowEtapa, WorkflowPregunta, TipoEtapa, TipoPregunta } from '../types/workflow';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const PERFILES_DISPONIBLES = [
  'Sistema',
  'Ciudadano',
  'Abogado',
  'Funcionario',
  'Supervisor',
  'Administrador',
];

const TIPOS_ETAPA = [
  { value: 'ETAPA', label: 'Etapa' },
  { value: 'COMPUERTA', label: 'Compuerta' },
  { value: 'PRESENCIAL', label: 'Presencial' },
];

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string; icon?: React.ReactNode }[] = [
  { value: 'REVISION_OCR', label: 'Revisión OCR por parte del sistema', icon: <ScannerIcon /> },
  { value: 'CARGA_ARCHIVO', label: 'Carga de archivos' },
  { value: 'TEXTO', label: 'Respuesta de texto' },
  { value: 'LISTA', label: 'Lista' },
  { value: 'SELECCION_SIMPLE', label: 'Opciones (selección simple)' },
];

export const WorkflowEditorFigma: React.FC = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Form state para el panel derecho
  const [formData, setFormData] = useState<Partial<WorkflowEtapa>>({});
  const [preguntas, setPreguntas] = useState<WorkflowPregunta[]>([]);

  useEffect(() => {
    if (isEditMode) {
      loadWorkflow();
    } else {
      // Crear nodo inicial
      const initialNode: Node = {
        id: 'inicio',
        type: 'custom',
        position: { x: 80, y: 300 },
        data: {
          codigo: 'INICIO',
          nombre: 'Recolectar requisitos del trámite PPSH y los anexo en el sistema',
          tipo_etapa: 'ETAPA' as const,
          orden: 0,
          perfiles_permitidos: ['Sistema'],
          es_etapa_inicial: true,
          es_etapa_final: false,
          requiere_validacion: false,
          permite_edicion_posterior: false,
          activo: true,
        },
      };
      setNodes([initialNode]);
      setSelectedNode(initialNode);
      setFormData(initialNode.data);
    }
  }, [id, setNodes]);

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
      setPreguntas(selectedNode.data.preguntas || []);
    }
  }, [selectedNode]);

  const loadWorkflow = async () => {
    if (!id) return;
    
    try {
      const data = await workflowService.getWorkflow(parseInt(id));

      if (data.etapas && data.etapas.length > 0) {
        const flowNodes: Node[] = data.etapas.map((etapa) => ({
          id: etapa.id?.toString() || etapa.codigo,
          type: 'custom',
          position: etapa.posicion_x && etapa.posicion_y 
            ? { x: etapa.posicion_x, y: etapa.posicion_y }
            : { x: 0, y: 0 },
          data: etapa,
        }));
        setNodes(flowNodes);
        
        if (flowNodes.length > 0) {
          setSelectedNode(flowNodes[0]);
        }
      }

      if (data.conexiones && data.conexiones.length > 0) {
        const flowEdges: Edge[] = data.conexiones.map((conexion) => ({
          id: conexion.id?.toString() || `${conexion.etapa_origen_id}-${conexion.etapa_destino_id}`,
          source: conexion.etapa_origen_id.toString(),
          target: conexion.etapa_destino_id.toString(),
          label: conexion.condicion,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }));
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Error al cargar workflow:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleChange = (field: keyof WorkflowEtapa, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerfilesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('perfiles_permitidos', typeof value === 'string' ? value.split(',') : value);
  };

  const handleAddPregunta = () => {
    const newPregunta: WorkflowPregunta = {
      codigo: `PREGUNTA_${preguntas.length + 1}`,
      texto: '',
      pregunta: '',
      tipo: 'REVISION_OCR',
      tipo_pregunta: 'REVISION_OCR',
      orden: preguntas.length,
      es_obligatoria: false,
      es_visible: true,
      activo: true,
    };
    setPreguntas([...preguntas, newPregunta]);
  };

  const handleDeletePregunta = (index: number) => {
    setPreguntas(preguntas.filter((_, i) => i !== index));
  };

  const handlePreguntaChange = (index: number, field: keyof WorkflowPregunta, value: any) => {
    const updated = [...preguntas];
    updated[index] = { ...updated[index], [field]: value };
    setPreguntas(updated);
  };

  const handleSave = () => {
    if (!selectedNode) return;

    const updatedData = { ...formData, preguntas };
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, ...updatedData } };
        }
        return node;
      })
    );

    console.log('Etapa guardada:', updatedData);
  };

  const handleCancel = () => {
    if (selectedNode) {
      setFormData(selectedNode.data);
      setPreguntas(selectedNode.data.preguntas || []);
    }
  };

  // Obtener lista de etapas anteriores para el select de "Etapa origen"
  const getEtapasAnteriores = () => {
    if (!selectedNode) return [];
    
    return nodes
      .filter(node => node.data.orden < (selectedNode.data.orden || 0))
      .map(node => ({
        id: node.id,
        nombre: node.data.nombre || node.data.codigo,
      }));
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', bgcolor: '#fff' }}>
      {/* Panel Izquierdo - Canvas ReactFlow */}
      <Box
        sx={{
          width: '584px',
          height: '100%',
          border: '1px solid #788093',
          borderRadius: '4px 0 0 4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Barra de herramientas superior */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: 2,
          }}
        >
          {/* Control de zoom */}
          <Box
            sx={{
              border: '1px solid #788093',
              borderRadius: '4px',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              px: 0.5,
              py: 0.25,
              gap: 0.5,
            }}
          >
            <IconButton size="small" sx={{ p: 0.5 }}>
              <ZoomOutIcon sx={{ fontSize: 20, color: '#788093' }} />
            </IconButton>
            <IconButton size="small" sx={{ p: 0.5 }}>
              <ZoomInIcon sx={{ fontSize: 20, color: '#788093' }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography sx={{ fontSize: 14, color: '#788093' }}>100%</Typography>
              <ArrowDownIcon sx={{ fontSize: 8, color: '#788093' }} />
            </Box>
          </Box>

          {/* Control de mano */}
          <IconButton
            size="small"
            sx={{
              border: '1px solid #788093',
              borderRadius: '4px',
              bgcolor: 'white',
              p: 0.5,
            }}
          >
            <PanToolIcon sx={{ fontSize: 16, color: '#788093' }} />
          </IconButton>
        </Box>

        {/* ReactFlow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#e0e0e0" />
        </ReactFlow>
      </Box>

      {/* Panel Derecho - Configuración de Etapa */}
      <Box
        sx={{
          width: '611px',
          height: '100%',
          border: '1px solid #788093',
          borderLeft: 'none',
          borderRadius: '0 4px 4px 0',
          overflow: 'auto',
          p: 3.5,
        }}
      >
        <Stack spacing={3}>
          {/* Tipo de etapa */}
          <FormControl fullWidth>
            <InputLabel
              shrink
              sx={{
                bgcolor: 'white',
                px: 0.5,
                fontSize: 14,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Tipo de etapa
            </InputLabel>
            <Select
              value={formData.tipo_etapa || 'ETAPA'}
              onChange={(e) => handleChange('tipo_etapa', e.target.value as TipoEtapa)}
              displayEmpty
              IconComponent={ArrowDownIcon}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333333',
                },
                '& .MuiSelect-select': {
                  color: '#4d4d4d',
                  fontSize: 16,
                },
              }}
            >
              {TIPOS_ETAPA.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </Select>
            <Typography sx={{ fontSize: 14, color: '#333333', mt: 0.5, fontWeight: 300 }}>
              Indicaciones extra
            </Typography>
          </FormControl>

          {/* Nombre de la etapa/actividad */}
          <FormControl fullWidth>
            <InputLabel
              shrink
              sx={{
                bgcolor: 'white',
                px: 0.5,
                fontSize: 14,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Nombre de la etapa/actividad
            </InputLabel>
            <TextField
              value={formData.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Revisión de archivos OCR"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#333333',
                  },
                  '& input': {
                    color: '#4d4d4d',
                    fontSize: 16,
                  },
                },
              }}
            />
            <Typography sx={{ fontSize: 14, color: '#333333', mt: 0.5, fontWeight: 300 }}>
              Nombre con el que se identificara la etapa en el diagrama de flujo
            </Typography>
          </FormControl>

          {/* Perfil(es) */}
          <FormControl fullWidth>
            <InputLabel
              shrink
              sx={{
                bgcolor: 'white',
                px: 0.5,
                fontSize: 14,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Perfil(es)
            </InputLabel>
            <Select
              multiple
              value={formData.perfiles_permitidos || []}
              onChange={handlePerfilesChange}
              input={<OutlinedInput />}
              displayEmpty
              IconComponent={ArrowDownIcon}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <Typography sx={{ color: '#333333' }}>Sistema</Typography>;
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                );
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333333',
                },
                '& .MuiSelect-select': {
                  color: '#333333',
                  fontSize: 16,
                },
              }}
            >
              {PERFILES_DISPONIBLES.map((perfil) => (
                <MenuItem key={perfil} value={perfil}>
                  {perfil}
                </MenuItem>
              ))}
            </Select>
            <Typography sx={{ fontSize: 14, color: '#333333', mt: 0.5, fontWeight: 300 }}>
              Indicaciones extra
            </Typography>
          </FormControl>

          <Divider sx={{ borderColor: '#4d4d4d' }} />

          {/* Título formulario */}
          <FormControl fullWidth>
            <InputLabel
              shrink
              sx={{
                bgcolor: 'white',
                px: 0.5,
                fontSize: 14,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Título formulario
            </InputLabel>
            <TextField
              value={formData.titulo_formulario || ''}
              onChange={(e) => handleChange('titulo_formulario', e.target.value)}
              placeholder="Revisión de archivos OCR"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#333333',
                  },
                  '& input': {
                    color: '#4d4d4d',
                    fontSize: 16,
                  },
                },
              }}
            />
          </FormControl>

          {/* Bajada formulario */}
          <FormControl fullWidth>
            <InputLabel
              shrink
              sx={{
                bgcolor: 'white',
                px: 0.5,
                fontSize: 14,
                fontWeight: 500,
                color: '#333333',
              }}
            >
              Bajada formulario
            </InputLabel>
            <TextField
              multiline
              rows={4}
              value={formData.bajada_formulario || ''}
              onChange={(e) => handleChange('bajada_formulario', e.target.value)}
              placeholder="Revisión de archivos OCR"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#333333',
                  },
                  '& textarea': {
                    color: '#4d4d4d',
                    fontSize: 16,
                  },
                },
              }}
            />
          </FormControl>

          {/* Sección de preguntas con borde punteado */}
          <Box
            sx={{
              border: '2px dashed #333333',
              borderRadius: '4px',
              p: 2,
            }}
          >
            <Stack spacing={5}>
              {/* Tipo de pregunta */}
              <FormControl fullWidth>
                <InputLabel
                  shrink
                  sx={{
                    bgcolor: 'white',
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333333',
                  }}
                >
                  Tipo de pregunta
                </InputLabel>
                <Select
                  value={preguntas[0]?.tipo || 'REVISION_OCR'}
                  onChange={(e) => handlePreguntaChange(0, 'tipo', e.target.value)}
                  displayEmpty
                  IconComponent={ArrowDownIcon}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333333',
                    },
                  }}
                  renderValue={(value) => {
                    const tipo = TIPOS_PREGUNTA.find((t) => t.value === value);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {tipo?.icon && (
                          <Box
                            sx={{
                              border: '1px solid #333333',
                              borderRadius: '4px',
                              p: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {React.cloneElement(tipo.icon as React.ReactElement, {
                              sx: { fontSize: 16, color: '#333333' },
                            })}
                          </Box>
                        )}
                        <Typography sx={{ fontSize: 16, color: '#333333' }}>
                          {tipo?.label}
                        </Typography>
                      </Box>
                    );
                  }}
                >
                  {TIPOS_PREGUNTA.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Etapa origen de documentos */}
              <FormControl fullWidth>
                <InputLabel
                  shrink
                  sx={{
                    bgcolor: 'white',
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333333',
                  }}
                >
                  Etapa origen de documentos
                </InputLabel>
                <Select
                  displayEmpty
                  IconComponent={ArrowDownIcon}
                  defaultValue=""
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333333',
                    },
                    '& .MuiSelect-select': {
                      color: '#333333',
                      fontSize: 16,
                    },
                  }}
                >
                  <MenuItem value="">
                    Recolectar requisitos del trámite PPSH y los anexo en el sistema
                  </MenuItem>
                  {getEtapasAnteriores().map((etapa) => (
                    <MenuItem key={etapa.id} value={etapa.id}>
                      {etapa.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Botones Cancelar y Añadir */}
              <Stack direction="row" spacing={3}>
                <Button
                  variant="outlined"
                  sx={{
                    width: 124,
                    borderColor: '#0e5fa6',
                    color: '#0e5fa6',
                    textTransform: 'none',
                    fontSize: 16,
                    '&:hover': {
                      borderColor: '#0d5494',
                      bgcolor: 'transparent',
                    },
                  }}
                  onClick={() => handleDeletePregunta(0)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    width: 124,
                    bgcolor: '#0e5fa6',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: 16,
                    '&:hover': {
                      bgcolor: '#0d5494',
                    },
                  }}
                  onClick={handleAddPregunta}
                >
                  Añadir
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Botones finales Cancelar y Guardar */}
          <Stack direction="row" spacing={3} sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#0e5fa6',
                color: '#0e5fa6',
                textTransform: 'none',
                fontSize: 16,
                py: 1,
                '&:hover': {
                  borderColor: '#0d5494',
                  bgcolor: 'transparent',
                },
              }}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#0e5fa6',
                color: 'white',
                textTransform: 'none',
                fontSize: 16,
                py: 1,
                '&:hover': {
                  bgcolor: '#0d5494',
                },
              }}
              onClick={handleSave}
            >
              Guardar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default WorkflowEditorFigma;
