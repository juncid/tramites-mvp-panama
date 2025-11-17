import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PanTool as PanToolIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import type { Workflow, WorkflowEtapa } from '../types/workflow';
import CustomNodeViewer from '../components/Workflow/CustomNodeViewer';
import { getLayoutedElements } from '../utils/autoLayout';

const nodeTypes: NodeTypes = {
  custom: CustomNodeViewer,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ height: value === index ? 'calc(100vh - 330px)' : '0' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
};

export const WorkflowViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [tabIndex, setTabIndex] = useState(1); // 1 = Flujo
  const [zoomLevel, setZoomLevel] = useState(100);
  const [profileFilter, setProfileFilter] = useState('Todos');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id));
    }
  }, [id]);

  const loadWorkflow = async (workflowId: number) => {
    try {
      const data = await workflowService.getWorkflow(workflowId);
      setWorkflow(data);
      
      if (data.etapas && data.etapas.length > 0) {
        const flowNodes = convertEtapasToNodes(data.etapas);
        const flowEdges = convertConexionesToEdges(data.conexiones || []);
        
        // Aplicar auto-layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges
        );
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    } catch (error) {
      console.error('Error al cargar workflow:', error);
    }
  };

  const convertEtapasToNodes = (etapas: WorkflowEtapa[]): Node[] => {
    return etapas.map((etapa) => ({
      id: etapa.id?.toString() || `etapa-${etapa.codigo}`,
      type: 'custom',
      position: { x: etapa.posicion_x || 0, y: etapa.posicion_y || 0 },
      data: {
        ...etapa,
        label: etapa.nombre,
        isReadOnly: true,
      },
    }));
  };

  const convertConexionesToEdges = (conexiones: any[]): Edge[] => {
    return conexiones.map((conexion, index) => ({
      id: conexion.id?.toString() || `edge-${index}`,
      source: conexion.etapa_origen_id?.toString() || '',
      target: conexion.etapa_destino_id?.toString() || '',
      type: 'straight',
      animated: false,
      style: { 
        stroke: '#4d4d4d', 
        strokeWidth: 2,
        strokeDasharray: '0', // Línea sólida
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#4d4d4d',
        width: 20,
        height: 20,
      },
      label: conexion.condicion || conexion.nombre || '',
      labelStyle: { fill: '#4d4d4d', fontSize: 14 },
      labelBgStyle: { fill: 'white' },
    }));
  };

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      const currentZoom = reactFlowInstance.getZoom();
      reactFlowInstance.zoomTo(currentZoom * 1.2);
      setZoomLevel(Math.round(currentZoom * 1.2 * 100));
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      const currentZoom = reactFlowInstance.getZoom();
      reactFlowInstance.zoomTo(currentZoom * 0.8);
      setZoomLevel(Math.round(currentZoom * 0.8 * 100));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
      {/* Estilos globales para ReactFlow */}
      <style>
        {`
          .react-flow__edge-path {
            stroke-dasharray: 0 !important;
          }
        `}
      </style>
      
      {/* Título */}
      <Typography
        variant="h3"
        sx={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#333333',
          mb: 3,
          px: 2,
        }}
      >
        {workflow?.nombre || 'Permiso de Protección de Seguridad Humanitaria'}
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 0, bgcolor: '#f1f3f4', px: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '16px',
              color: '#4d4d4d',
              minWidth: 120,
              px: 2,
              py: 1,
            },
            '& .Mui-selected': {
              color: '#0e5fa6',
              fontWeight: 400,
            },
            '& .MuiTabs-indicator': {
              height: 4,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              backgroundColor: '#0e5fa6',
            },
          }}
        >
          <Tab label="General" />
          <Tab label="Flujo" />
          <Tab label="Estado" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      {/* Contenido de los tabs */}
      <TabPanel value={tabIndex} index={0}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Información General</Typography>
          <Typography>Nombre: {workflow?.nombre}</Typography>
          <Typography>Descripción: {workflow?.descripcion}</Typography>
          <Typography>Estado: {workflow?.estado}</Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <Box
          sx={{
            height: '100%',
            border: '1px solid #333333',
            borderRadius: '4px',
            position: 'relative',
            bgcolor: 'white',
            mx: 2,
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnScroll={true}
            zoomOnScroll={true}
            panOnDrag={true}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              style: { stroke: '#4d4d4d', strokeWidth: 2 },
            }}
          >
            <Background color="#f5f5f5" gap={16} />
            
            {/* Toolbar personalizado */}
            <Panel position="top-left">
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  p: 2,
                }}
              >
                {/* Filtro de perfiles */}
                <FormControl size="small">
                  <Select
                    value={profileFilter}
                    onChange={(e) => setProfileFilter(e.target.value)}
                    sx={{
                      border: '1px solid #788093',
                      borderRadius: '4px',
                      bgcolor: 'white',
                      height: 24,
                      fontSize: '14px',
                      color: '#788093',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '& .MuiSelect-select': {
                        py: 0.25,
                        px: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      },
                    }}
                    startAdornment={
                      <PersonIcon sx={{ fontSize: 20, color: '#788093', mr: 0.5 }} />
                    }
                    IconComponent={ArrowDownIcon}
                  >
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Ciudadano">Ciudadano</MenuItem>
                    <MenuItem value="Abogado">Abogado</MenuItem>
                    <MenuItem value="Funcionario">Funcionario</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Panel>

            {/* Controles de zoom y acciones */}
            <Panel position="top-center">
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                {/* Controles de zoom */}
                <Box
                  sx={{
                    border: '1px solid #788093',
                    borderRadius: '4px',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    height: 24,
                    px: 0.5,
                    gap: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handleZoomOut}
                    sx={{ p: 0, color: '#788093' }}
                  >
                    <ZoomOutIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={handleZoomIn}
                    sx={{ p: 0, color: '#788093' }}
                  >
                    <ZoomInIcon sx={{ fontSize: 20 }} />
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <Typography sx={{ fontSize: '14px', color: '#788093' }}>
                      {zoomLevel}%
                    </Typography>
                    <ArrowDownIcon sx={{ fontSize: 8, color: '#788093' }} />
                  </Box>
                </Box>

                {/* Botón de mano (pan) */}
                <Box
                  sx={{
                    border: '1px solid #788093',
                    borderRadius: '4px',
                    bgcolor: 'white',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ p: 0, color: '#788093' }}
                  >
                    <PanToolIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Panel>

            {/* Botón de imprimir */}
            <Panel position="top-right">
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    border: '1px solid #788093',
                    borderRadius: '4px',
                    bgcolor: 'white',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handlePrint}
                    sx={{ p: 0, color: '#788093' }}
                  >
                    <PrintIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Panel>
          </ReactFlow>
        </Box>
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Estado del Workflow</Typography>
          <Typography>Funcionalidad en desarrollo</Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabIndex} index={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Historial</Typography>
          <Typography>Funcionalidad en desarrollo</Typography>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default WorkflowViewer;
