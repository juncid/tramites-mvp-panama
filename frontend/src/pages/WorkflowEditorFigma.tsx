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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PanTool as PanToolIcon,
  DocumentScanner as ScannerIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CloudUpload as UploadIcon,
  RadioButtonChecked as RadioIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  List as ListIcon,
  TextFields as TextIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Print as PrintIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
  { value: 'SUBPROCESO', label: 'Subproceso' },
  { value: 'PRESENCIAL', label: 'Presencial' },
];

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string; icon?: React.ReactNode }[] = [
  { value: 'REVISION_OCR', label: 'Revisión OCR por parte del sistema', icon: <ScannerIcon /> },
  { value: 'DATOS_CASO', label: 'Data del caso', icon: <FolderIcon /> },
  { value: 'OPCIONES', label: 'Opciones', icon: <RadioIcon /> },
  { value: 'SELECCION_FECHA', label: 'Selección de fecha', icon: <CalendarIcon /> },
  { value: 'CARGA_ARCHIVO', label: 'Carga de archivos', icon: <UploadIcon /> },
  { value: 'REVISION_MANUAL_DOCUMENTOS', label: 'Revisión manual de documentos', icon: <DescriptionIcon /> },
  { value: 'LISTA', label: 'Lista', icon: <ListIcon /> },
  { value: 'TEXTO', label: 'Respuesta de texto', icon: <TextIcon /> },
  { value: 'IMPRESION', label: 'Impresión', icon: <PrintIcon /> },
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

  const handleDuplicatePregunta = (index: number) => {
    const preguntaToDuplicate = preguntas[index];
    const newPregunta: WorkflowPregunta = {
      ...preguntaToDuplicate,
      codigo: `PREGUNTA_${preguntas.length + 1}`,
      orden: preguntas.length,
    };
    setPreguntas([...preguntas, newPregunta]);
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
            <Typography sx={{ fontSize: 14, color: '#788093', mt: 0.5, fontWeight: 300 }}>
              Seleccione el tipo de etapa que mejor describa esta actividad en el flujo
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
            <Typography sx={{ fontSize: 14, color: '#788093', mt: 0.5, fontWeight: 300 }}>
              Nombre descriptivo que se mostrará en el diagrama de flujo del proceso
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
            <Typography sx={{ fontSize: 14, color: '#788093', mt: 0.5, fontWeight: 300 }}>
              Seleccione uno o más perfiles que pueden ejecutar esta etapa (Sistema, Funcionario, Usuario)
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
            <Stack spacing={3}>
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
                  onChange={(e) => {
                    const newTipo = e.target.value as TipoPregunta;
                    if (preguntas.length === 0) {
                      handleAddPregunta();
                    }
                    handlePreguntaChange(0, 'tipo', newTipo);
                  }}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {tipo.icon && React.cloneElement(tipo.icon as React.ReactElement, {
                          sx: { fontSize: 18 },
                        })}
                        <span>{tipo.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Campo Pregunta/Descripción */}
              <TextField
                fullWidth
                label="Pregunta"
                placeholder={
                  preguntas[0]?.tipo === 'OPCIONES'
                    ? 'Obtuvieron los archivos resultados positivos en la revisión OCR'
                    : preguntas[0]?.tipo === 'TEXTO'
                    ? 'Observaciones'
                    : preguntas[0]?.tipo === 'SELECCION_FECHA'
                    ? 'Lorem ipsum'
                    : preguntas[0]?.tipo === 'CARGA_ARCHIVO'
                    ? 'Documento'
                    : 'Lorem ipsum'
                }
                value={preguntas[0]?.texto || ''}
                onChange={(e) => handlePreguntaChange(0, 'texto', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputLabel-root': {
                    bgcolor: 'white',
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#333333',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#333333',
                    },
                    '& input': {
                      color: '#333333',
                      fontSize: 16,
                    },
                  },
                }}
              />

              {/* Checkbox Obligatoria */}
              {(preguntas[0]?.tipo === 'OPCIONES' ||
                preguntas[0]?.tipo === 'REVISION_MANUAL_DOCUMENTOS' ||
                preguntas[0]?.tipo === 'LISTA' ||
                preguntas[0]?.tipo === 'SELECCION_FECHA' ||
                preguntas[0]?.tipo === 'TEXTO') && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preguntas[0]?.es_obligatoria || false}
                      onChange={(e) =>
                        handlePreguntaChange(0, 'es_obligatoria', e.target.checked)
                      }
                      sx={{ color: '#333333' }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 16, color: '#333333' }}>
                      Obligatoria
                    </Typography>
                  }
                />
              )}

              {/* Campo Indicaciones (solo para tipo OPCIONES y TEXTO) */}
              {(preguntas[0]?.tipo === 'OPCIONES' || preguntas[0]?.tipo === 'TEXTO') && (
                <TextField
                  fullWidth
                  label="Indicaciones"
                  placeholder="(Opcional), indicaciones para la persona que responda la pregunta"
                  multiline
                  rows={2}
                  value={preguntas[0]?.ayuda || ''}
                  onChange={(e) => handlePreguntaChange(0, 'ayuda', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      bgcolor: 'white',
                      px: 0.5,
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#333333',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#333333',
                      },
                      '& textarea': {
                        color: '#4d4d4d',
                        fontSize: 14,
                      },
                    },
                  }}
                />
              )}

              {/* Opciones 1 y 2 (solo para tipo OPCIONES) */}
              {preguntas[0]?.tipo === 'OPCIONES' && (
                <>
                  <TextField
                    fullWidth
                    label="Opción 1"
                    placeholder="Sí"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        bgcolor: 'white',
                        px: 0.5,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333333',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#333333',
                        },
                        '& input': {
                          color: '#333333',
                          fontSize: 16,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Opción 2"
                    placeholder="No"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        bgcolor: 'white',
                        px: 0.5,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333333',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#333333',
                        },
                        '& input': {
                          color: '#333333',
                          fontSize: 16,
                        },
                      },
                    }}
                  />
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    sx={{
                      color: '#0e5fa6',
                      textTransform: 'none',
                      fontSize: 14,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Añadir opción
                  </Button>
                </>
              )}

              {/* Data del caso (DATOS_CASO) - Con checkboxes de campos */}
              {preguntas[0]?.tipo === 'DATOS_CASO' && (
                <Stack spacing={1.5}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        REDEX
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        Nombre
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        Nacionalidad
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        Tramite
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        Pasaporte
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        Sexo
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        N° de Expediente
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{ color: '#333333' }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 16, color: '#333333' }}>
                        Fecha de nacimiento
                      </Typography>
                    }
                  />
                </Stack>
              )}

              {/* Etapa origen de documentos (para REVISION_OCR y REVISION_MANUAL_DOCUMENTOS) */}
              {(preguntas[0]?.tipo === 'REVISION_OCR' ||
                preguntas[0]?.tipo === 'REVISION_MANUAL_DOCUMENTOS') && (
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
                      {preguntas[0]?.tipo === 'REVISION_OCR'
                        ? 'Recolectar requisitos del trámite PPSH y los anexo en el sistema'
                        : 'Resultado revisión OCR'}
                    </MenuItem>
                    {getEtapasAnteriores().map((etapa) => (
                      <MenuItem key={etapa.id} value={etapa.id}>
                        {etapa.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Origen selección de fechas (solo para SELECCION_FECHA) */}
              {preguntas[0]?.tipo === 'SELECCION_FECHA' && (
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
                    Origen selección de fechas
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
                    <MenuItem value="">Agenda PPSH</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Descripción y Documento (para CARGA_ARCHIVO cuando no hay preguntas tipo formulario) */}
              {preguntas[0]?.tipo === 'CARGA_ARCHIVO' && !preguntas[0]?.pregunta && (
                <>
                  <TextField
                    fullWidth
                    label="Descripción"
                    placeholder="Lorem"
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        bgcolor: 'white',
                        px: 0.5,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333333',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#333333',
                        },
                        '& textarea': {
                          color: '#4d4d4d',
                          fontSize: 14,
                        },
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 300 }}>
                    Información adicional opcional
                  </Typography>
                  <TextField
                    fullWidth
                    label="Documento"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        bgcolor: 'white',
                        px: 0.5,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333333',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#333333',
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    sx={{
                      bgcolor: '#0e5fa6',
                      color: 'white',
                      textTransform: 'none',
                      fontSize: 14,
                      alignSelf: 'flex-start',
                      '&:hover': {
                        bgcolor: '#0d5494',
                      },
                    }}
                  >
                    Cargar archivo
                  </Button>
                  <Typography sx={{ fontSize: 12, color: '#788093', fontWeight: 300 }}>
                    (Opcional), indicaciones para la persona que responda la pregunta
                  </Typography>
                </>
              )}

              {/* Campos adicionales para CARGA_ARCHIVO cuando hay pregunta */}
              {preguntas[0]?.tipo === 'CARGA_ARCHIVO' && preguntas[0]?.pregunta && (
                <>
                  <TextField
                    fullWidth
                    label="Indicaciones"
                    placeholder="Lorem"
                    multiline
                    rows={2}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        bgcolor: 'white',
                        px: 0.5,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333333',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#333333',
                        },
                        '& textarea': {
                          color: '#4d4d4d',
                          fontSize: 14,
                        },
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: '#788093', fontWeight: 300 }}>
                    (Opcional), indicaciones para la persona que responda la pregunta
                  </Typography>
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
                      Número máximo de archivos
                    </InputLabel>
                    <Select
                      displayEmpty
                      IconComponent={ArrowDownIcon}
                      defaultValue="1"
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
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                      <MenuItem value="5">5</MenuItem>
                      <MenuItem value="10">10</MenuItem>
                    </Select>
                  </FormControl>
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
                      Tamaño máximo
                    </InputLabel>
                    <Select
                      displayEmpty
                      IconComponent={ArrowDownIcon}
                      defaultValue="100MB"
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
                      <MenuItem value="100MB">100MB</MenuItem>
                      <MenuItem value="50MB">50MB</MenuItem>
                      <MenuItem value="20MB">20MB</MenuItem>
                      <MenuItem value="10MB">10MB</MenuItem>
                      <MenuItem value="5MB">5MB</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Documento"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        bgcolor: 'white',
                        px: 0.5,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333333',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#333333',
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    sx={{
                      bgcolor: '#0e5fa6',
                      color: 'white',
                      textTransform: 'none',
                      fontSize: 14,
                      alignSelf: 'flex-start',
                      '&:hover': {
                        bgcolor: '#0d5494',
                      },
                    }}
                  >
                    Cargar archivo
                  </Button>
                  <Typography sx={{ fontSize: 12, color: '#788093', fontWeight: 300 }}>
                    (Opcional), indicaciones para la persona que responda la pregunta
                  </Typography>
                </>
              )}

              {/* Botones Cancelar y Añadir */}
              {!(preguntas[0]?.tipo === 'CARGA_ARCHIVO' && !preguntas[0]?.pregunta) && (
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
              )}
            </Stack>
          </Box>

          {/* Preguntas agregadas */}
          {preguntas.length > 1 && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              {preguntas.slice(1).map((pregunta, index) => {
                const tipoInfo = TIPOS_PREGUNTA.find((t) => t.value === pregunta.tipo);
                return (
                  <Box
                    key={pregunta.codigo}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Header con tipo y botones de acción */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {tipoInfo?.icon && (
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
                              {React.cloneElement(tipoInfo.icon as React.ReactElement, {
                                sx: { fontSize: 16, color: '#333333' },
                              })}
                            </Box>
                          )}
                          <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333333' }}>
                            {tipoInfo?.label}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicatePregunta(index + 1)}
                            sx={{ color: '#333333' }}
                          >
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              // TODO: Implementar edición
                            }}
                            sx={{ color: '#333333' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePregunta(index + 1)}
                            sx={{ color: '#333333' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {/* Contenido según tipo de pregunta */}
                      {pregunta.tipo === 'DATOS_CASO' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                            {pregunta.pregunta || 'Data del caso'}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>REDEX</Typography>
                              }
                            />
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>Nombre</Typography>
                              }
                            />
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>
                                  Nacionalidad
                                </Typography>
                              }
                            />
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>Tramite</Typography>
                              }
                            />
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>
                                  Pasaporte
                                </Typography>
                              }
                            />
                          </Stack>
                        </Stack>
                      )}

                      {pregunta.tipo === 'LISTA' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                            {pregunta.pregunta || 'Lista'}
                          </Typography>
                          <Stack spacing={0.5}>
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>
                                  832/Carnet de Tramite B/.50.00
                                </Typography>
                              }
                            />
                            <FormControlLabel
                              control={<Checkbox defaultChecked size="small" disabled />}
                              label={
                                <Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>
                                  770/Cheque de 250
                                </Typography>
                              }
                            />
                          </Stack>
                        </Stack>
                      )}

                      {pregunta.tipo === 'TEXTO' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                            {pregunta.pregunta || 'Respuesta texto'}
                          </Typography>
                          <TextField
                            size="small"
                            disabled
                            placeholder="Escribe tu respuesta aquí..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                color: '#4d4d4d',
                              },
                            }}
                          />
                        </Stack>
                      )}

                      {pregunta.tipo === 'OPCIONES' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                            {pregunta.pregunta || 'Opciones'}
                          </Typography>
                          <Stack spacing={0.5}>
                            <FormControlLabel
                              control={<Checkbox size="small" disabled />}
                              label={<Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>Sí</Typography>}
                            />
                            <FormControlLabel
                              control={<Checkbox size="small" disabled />}
                              label={<Typography sx={{ fontSize: 14, color: '#4d4d4d' }}>No</Typography>}
                            />
                          </Stack>
                        </Stack>
                      )}

                      {pregunta.tipo === 'IMPRESION' && (
                        <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                          {pregunta.pregunta || 'Impresión'}
                        </Typography>
                      )}

                      {pregunta.tipo === 'SELECCION_FECHA' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                            {pregunta.pregunta || 'Selección de fecha'}
                          </Typography>
                          <TextField
                            size="small"
                            type="date"
                            disabled
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                color: '#4d4d4d',
                              },
                            }}
                          />
                        </Stack>
                      )}

                      {pregunta.tipo === 'CARGA_ARCHIVO' && (
                        <Stack spacing={1}>
                          <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                            {pregunta.pregunta || 'Carga de archivo'}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            startIcon={<UploadIcon />}
                            sx={{
                              textTransform: 'none',
                              fontSize: 14,
                              alignSelf: 'flex-start',
                            }}
                          >
                            Cargar archivo
                          </Button>
                        </Stack>
                      )}

                      {pregunta.tipo === 'REVISION_OCR' && (
                        <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                          {pregunta.pregunta || 'Revisión OCR'}
                        </Typography>
                      )}

                      {pregunta.tipo === 'REVISION_MANUAL_DOCUMENTOS' && (
                        <Typography sx={{ fontSize: 14, color: '#4d4d4d', fontWeight: 600 }}>
                          {pregunta.pregunta || 'Revisión manual de documentos'}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}

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
