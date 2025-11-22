import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  useReactFlow,
  ReactFlowProvider,
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
  Alert,
  Snackbar,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
/*
// Imports comentados - ya no se usan directamente (EtapaConfigPanel los maneja)
import {
  CargaArchivoFields,
  CargaArchivoConPreguntaFields,
  OpcionesFields,
  RespuestaTextoFields,
} from '../components/Workflow/PreguntaFields';
*/
import EtapaConfigPanel from '../components/Workflow/EtapaConfigPanel';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PanTool as PanToolIcon,
  DocumentScanner as ScannerIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  RadioButtonChecked as RadioIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  List as ListIcon,
  TextFields as TextIcon,
  CheckBox as CheckBoxIcon,
  TableChart as DataTableIcon,
  FindInPage as DocumentSearchIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Print as PrintIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as AutoLayoutIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import CustomNode from '../components/Workflow/CustomNode';
import type { WorkflowEtapa, WorkflowPregunta, TipoEtapa, TipoPregunta, Workflow, EstadoWorkflow } from '../types/workflow';
import { getLayoutedElements } from '../utils/autoLayout';

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
  { value: 'TERMINO', label: 'Término' },
];

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string; icon?: React.ReactNode }[] = [
  { value: 'RESPUESTA_TEXTO', label: 'Respuesta de texto', icon: <TextIcon /> },
  { value: 'LISTA', label: 'Lista', icon: <CheckBoxIcon /> },
  { value: 'OPCIONES', label: 'Opciones', icon: <RadioIcon /> },
  { value: 'CARGA_ARCHIVO', label: 'Carga de archivos', icon: <UploadIcon /> },
  { value: 'DESCARGA_ARCHIVO', label: 'Descarga de archivos', icon: <DownloadIcon /> },
  { value: 'DATOS_CASO', label: 'Data del caso', icon: <DataTableIcon /> },
  { value: 'REVISION_MANUAL_DOCUMENTOS', label: 'Revisión manual de documentos', icon: <DocumentSearchIcon /> },
  { value: 'REVISION_OCR', label: 'Revisión OCR por parte del sistema', icon: <ScannerIcon /> },
  { value: 'SELECCION_FECHA', label: 'Selección de fecha', icon: <CalendarIcon /> },
  { value: 'IMPRESION', label: 'Impresión', icon: <PrintIcon /> },
];

const WorkflowEditorFigmaContent: React.FC = () => {
  console.log('💡 WorkflowEditorFigma: Componente renderizándose');
  
  const { id } = useParams();
  console.log('💡 WorkflowEditorFigma: id desde useParams =', id);
  
  const navigate = useNavigate();
  const isEditMode = !!id;
  console.log('💡 WorkflowEditorFigma: isEditMode =', isEditMode);
  
  const { zoomIn, zoomOut, setViewport, getViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(100);
  const [currentTab, setCurrentTab] = useState<number>(1); // 0: General, 1: Flujo, 2: Estado, 3: Historial

  // Estado del workflow completo
  const [workflowData, setWorkflowData] = useState<Partial<Workflow>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: 'BORRADOR' as EstadoWorkflow,
    version: 1,
    perfiles_creadores: [],
    activo: true,
  });

  /*
  ============================================================
  ESTADOS DEL PANEL DERECHO - COMENTADOS (ahora usa EtapaConfigPanel)
  ============================================================
  
  // Form state para el panel derecho (etapa individual)
  const [formData, setFormData] = useState<Partial<WorkflowEtapa>>({});
  const [preguntas, setPreguntas] = useState<WorkflowPregunta[]>([]);
  
  ============================================================
  FIN DE ESTADOS DEL PANEL DERECHO COMENTADOS
  ============================================================
  */

  // Estados de guardado
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 useEffect ejecutado - isEditMode:', isEditMode, 'id:', id);
    if (isEditMode) {
      loadWorkflow();
    } else {
      // Crear nodo inicial (alineado a grid de 20px)
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
    }
  }, [id, setNodes]);

  /*
  // Este useEffect ya no es necesario porque EtapaConfigPanel maneja su propio estado
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
      setPreguntas(selectedNode.data.preguntas || []);
    }
  }, [selectedNode]);
  */

  const loadWorkflow = async () => {
    console.log('🚀 loadWorkflow llamado con id:', id);
    if (!id) return;
    
    try {
      console.log('🌐 Llamando a workflowService.getWorkflow con id:', parseInt(id));
      const data = await workflowService.getWorkflow(parseInt(id));

      console.log('📋 Workflow cargado desde BD:', {
        id: data.id,
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: data.estado,
        version: data.version,
        perfiles_creadores: data.perfiles_creadores,
        activo: data.activo,
        total_etapas: data.etapas?.length || 0,
        total_conexiones: data.conexiones?.length || 0,
        etapas: data.etapas,
        conexiones: data.conexiones,
      });

      // Cargar información del workflow
      setWorkflowData({
        id: data.id,
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: data.estado,
        version: data.version,
        perfiles_creadores: data.perfiles_creadores,
        activo: data.activo,
      });

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
          label: typeof conexion.condicion === 'object' && conexion.condicion !== null
            ? JSON.stringify(conexion.condicion)
            : conexion.condicion || '',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }));
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Error al cargar workflow:', error);
      setSaveError('Error al cargar el workflow');
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        style: { 
          stroke: '#4d4d4d', 
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4d4d4d',
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  /*
  ============================================================
  FUNCIONES DEL PANEL DERECHO - COMENTADAS (ahora usa EtapaConfigPanel)
  ============================================================
  
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
  };

  const handleCancel = () => {
    if (selectedNode) {
      setFormData(selectedNode.data);
      setPreguntas(selectedNode.data.preguntas || []);
    }
  };
  
  ============================================================
  FIN DE FUNCIONES DEL PANEL DERECHO COMENTADAS
  ============================================================
  */

  const handleZoomIn = () => {
    zoomIn();
    setTimeout(() => {
      const viewport = getViewport();
      setCurrentZoom(Math.round(viewport.zoom * 100));
    }, 50);
  };

  const handleZoomOut = () => {
    zoomOut();
    setTimeout(() => {
      const viewport = getViewport();
      setCurrentZoom(Math.round(viewport.zoom * 100));
    }, 50);
  };

  const performAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  // Función para agregar un nuevo nodo
  const handleAddNode = () => {
    // Encontrar todos los nodos de destino en las conexiones actuales
    const targetNodeIds = new Set(edges.map(e => e.target));
    
    // Encontrar el último nodo: un nodo que no es inicial Y que no es destino de ninguna conexión
    // (es decir, está al final del flujo)
    const lastNode = nodes.find(n => 
      !n.data.es_etapa_inicial && 
      !n.data.es_inicial &&
      !targetNodeIds.has(n.id)
    ) || nodes[nodes.length - 1]; // Si no hay nodo final, usar el último nodo

    const newNodeId = `${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position: { 
        x: lastNode ? lastNode.position.x + 250 : 250, 
        y: lastNode ? lastNode.position.y : 200 
      },
      data: {
        codigo: `ETAPA_${newNodeId}`,
        nombre: `Nueva Etapa ${nodes.length + 1}`,
        tipo_etapa: 'ETAPA' as const,
        perfiles_permitidos: [],
        es_etapa_inicial: false,
        es_etapa_final: false,
        preguntas: [],
        conexiones: [],
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Crear conexión automática desde el último nodo
    if (lastNode) {
      const newEdge: Edge = {
        id: `e${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#4d4d4d', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4d4d4d',
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }
    
    // Seleccionar automáticamente el nuevo nodo para configurarlo
    setSelectedNode(newNode);
  };

  // Guardar todo el workflow en la base de datos
  const handleSaveWorkflow = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      // Preparar datos de las etapas
      const etapas = nodes.map((node, index) => ({
        ...node.data,
        orden: index,
        posicion_x: node.position.x,
        posicion_y: node.position.y,
      }));

      // Preparar datos de las conexiones
      const conexiones = edges.map((edge) => ({
        etapa_origen_id: parseInt(edge.source),
        etapa_destino_id: parseInt(edge.target),
        condicion: typeof edge.label === 'string' ? edge.label : (edge.label ? JSON.stringify(edge.label) : null),
        es_predeterminada: true,
        activo: true,
      }));

      const workflowPayload = {
        ...workflowData,
        etapas,
        conexiones,
      };

      if (isEditMode && id) {
        // Actualizar workflow existente
        await workflowService.updateWorkflow(parseInt(id), workflowPayload);
      } else {
        // Crear nuevo workflow
        await workflowService.createWorkflow(workflowPayload);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/flujos');
      }, 1500);
    } catch (error: any) {
      console.error('Error al guardar workflow:', error);
      setSaveError(error.response?.data?.detail || 'Error al guardar el workflow');
    } finally {
      setSaving(false);
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
    <>
      {/* Header del Workflow */}
      <Box sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', px: 3, py: 2 }}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              label="Código"
              value={workflowData.codigo}
              onChange={(e) => setWorkflowData({ ...workflowData, codigo: e.target.value })}
              size="small"
              sx={{ width: 150 }}
            />
            <TextField
              label="Nombre del Workflow"
              value={workflowData.nombre}
              onChange={(e) => setWorkflowData({ ...workflowData, nombre: e.target.value })}
              size="small"
              sx={{ flex: 1, minWidth: 300 }}
            />
            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={workflowData.estado}
                onChange={(e) => setWorkflowData({ ...workflowData, estado: e.target.value as EstadoWorkflow })}
                label="Estado"
              >
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="INACTIVO">Inactivo</MenuItem>
                <MenuItem value="ARCHIVADO">Archivado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/flujos')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveWorkflow}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Workflow'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs de navegación: General, Flujo, Estado, Historial */}
      <Box sx={{ bgcolor: '#f1f3f4', borderBottom: '1px solid #e0e0e0', px: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontSize: 16,
              fontWeight: 400,
              color: '#4d4d4d',
              minWidth: 120,
              px: 2,
              '&.Mui-selected': {
                color: '#0e5fa6',
                fontWeight: 400,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#0e5fa6',
              height: 4,
              borderRadius: '4px 4px 0 0',
            },
          }}
        >
          <Tab label="General" />
          <Tab label="Flujo" />
          <Tab label="Estado" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      {/* Snackbars para notificaciones */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">Workflow guardado exitosamente</Alert>
      </Snackbar>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error">{saveError}</Alert>
      </Snackbar>

      {/* Contenido del tab "General" */}
      {currentTab === 0 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuración General
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contenido de la pestaña General (por implementar)
          </Typography>
        </Box>
      )}

      {/* Contenido del tab "Flujo" */}
      {currentTab === 1 && (
        <Grid container spacing={0} sx={{ height: 'calc(100vh - 200px)', bgcolor: '#fff' }}>
        {/* Panel Izquierdo - Canvas ReactFlow */}
        <Grid 
          item 
          xs={12} 
          md={selectedNode ? 6 : 12}
          sx={{
            height: '100%',
            transition: 'all 0.3s ease',
          }}
        >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          border: '1px solid #788093',
          borderRadius: selectedNode ? '4px 0 0 4px' : '4px',
          position: 'relative',
          overflow: 'hidden',
          '& .react-flow__attribution': {
            display: 'none',
          },
          '& .react-flow__edge-path': {
            strokeDasharray: '0 !important',
          },
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
            <IconButton size="small" sx={{ p: 0.5 }} onClick={handleZoomOut}>
              <ZoomOutIcon sx={{ fontSize: 20, color: '#788093' }} />
            </IconButton>
            <IconButton size="small" sx={{ p: 0.5 }} onClick={handleZoomIn}>
              <ZoomInIcon sx={{ fontSize: 20, color: '#788093' }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography sx={{ fontSize: 14, color: '#788093' }}>{currentZoom}%</Typography>
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

          {/* Botón de Organizar */}
          <IconButton
            size="small"
            onClick={performAutoLayout}
            sx={{
              border: '1px solid #788093',
              borderRadius: '4px',
              bgcolor: 'white',
              p: 0.5,
            }}
            title="Organizar nodos automáticamente"
          >
            <AutoLayoutIcon sx={{ fontSize: 16, color: '#788093' }} />
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
          snapToGrid={true}
          snapGrid={[20, 20]}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#4d4d4d', strokeWidth: 2 },
          }}
          connectionLineType="smoothstep"
          connectionLineStyle={{ stroke: '#4d4d4d', strokeWidth: 2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#e0e0e0" />
        </ReactFlow>

        {/* Botón Agregar Nodo - visible solo cuando no hay selección y el último nodo no es de tipo TERMINO o FIN */}
        {!selectedNode && !nodes.some(n => n.data.tipo_etapa === 'TERMINO' || n.data.tipo_etapa === 'FIN') && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
            }}
          >
            <Box
              onClick={handleAddNode}
              sx={{
                width: 220,
                height: 110,
                border: '2px dashed #788093',
                borderRadius: '4px',
                bgcolor: '#f1f3f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#e8eaed',
                  borderColor: '#5f6368',
                },
              }}
            >
              <AddIcon sx={{ fontSize: 40, color: '#788093' }} />
            </Box>
          </Box>
        )}
      </Box>
      </Grid>

      {/* Panel Derecho - Configuración de Etapa */}
      {selectedNode && (
        <Grid 
          item 
          xs={12} 
          md={6}
          sx={{
            height: '100%',
            transition: 'all 0.3s ease',
          }}
        >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            border: '1px solid #788093',
            borderLeft: 'none',
            borderRadius: '0 4px 4px 0',
            overflow: 'hidden',
          }}
        >
          <EtapaConfigPanel
            etapa={selectedNode.data}
            hideCloseButton={true}
            onSave={(updatedEtapa) => {
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === selectedNode.id) {
                    const { is_placeholder, ...restData } = node.data as any;
                    return { ...node, data: { ...restData, ...updatedEtapa } };
                  }
                  return node;
                })
              );
              setSelectedNode(null);
            }}
            onClose={() => {
              // Deseleccionar el nodo para cerrar el panel de configuración
              setSelectedNode(null);
            }}
            onDelete={() => {
              if (!selectedNode) return;

              // No permitir eliminar el nodo inicial
              if (selectedNode.data.es_inicial || selectedNode.data.es_etapa_inicial) {
                alert('No se puede eliminar el nodo inicial');
                return;
              }

              // Eliminar el nodo
              setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));

              // Eliminar todas las conexiones relacionadas con este nodo
              setEdges((eds) =>
                eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id)
              );

              setSelectedNode(null);
            }}
          />
        </Box>
        </Grid>
      )}

      {/* Fin del Panel Derecho - EtapaConfigPanel ahora está en uso */}
    </Grid>
      )}

      {/* Contenido del tab "Estado" */}
      {currentTab === 2 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Estado del Workflow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contenido de la pestaña Estado (por implementar)
          </Typography>
        </Box>
      )}

      {/* Contenido del tab "Historial" */}
      {currentTab === 3 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historial de Cambios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contenido de la pestaña Historial (por implementar)
          </Typography>
        </Box>
      )}

    {/* 
    ============================================================
    CÓDIGO ANTIGUO DEL PANEL DERECHO - COMENTADO PARA REFERENCIA
    ============================================================
    
    Todo el código antiguo del panel derecho ha sido comentado.
    El panel ahora usa el componente EtapaConfigPanel directamente.
    
    ============================================================
    FIN DEL CÓDIGO ANTIGUO DEL PANEL DERECHO
    ============================================================
    */}
    </>
  );
};

export const WorkflowEditorFigma: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorFigmaContent />
    </ReactFlowProvider>
  );
};

export default WorkflowEditorFigma;
