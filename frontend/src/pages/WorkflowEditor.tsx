import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Stack,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Drawer,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import { EtapaConfigPanel } from '../components/Workflow/EtapaConfigPanel';
import { CustomNode } from '../components/Workflow/CustomNode';
import type { Workflow, WorkflowNode, WorkflowEtapa, WorkflowConexion } from '../types/workflow';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const WorkflowEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadWorkflow();
    } else {
      // Crear nodo inicial para nuevo workflow
      const initialNode: Node = {
        id: 'inicio',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: {
          codigo: 'INICIO',
          nombre: 'Inicio',
          tipo_etapa: 'ETAPA',
          es_inicial: true,
        },
      };
      setNodes([initialNode]);
    }
  }, [id]);

  const loadWorkflow = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await workflowService.getWorkflow(parseInt(id));
      setWorkflow(data);

      // Convertir etapas a nodos de react-flow
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
      }

      // Convertir conexiones a edges de react-flow
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
    } finally {
      setLoading(false);
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
    setSelectedNode(node.data as WorkflowNode);
    setDrawerOpen(true);
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: 250, y: nodes.length * 100 + 150 },
      data: {
        codigo: `ETAPA_${nodes.length + 1}`,
        nombre: `Nueva Etapa ${nodes.length + 1}`,
        tipo_etapa: 'ETAPA',
        perfiles_permitidos: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveNode = (updatedEtapa: Partial<WorkflowEtapa>) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        // Comparar usando el id del data que puede ser string o number
        const nodeDataId = node.data.id?.toString() || node.id;
        const selectedNodeId = selectedNode.id?.toString() || '';
        return nodeDataId === selectedNodeId || node.id === selectedNodeId
          ? { ...node, data: { ...node.data, ...updatedEtapa } }
          : node;
      })
    );
    setDrawerOpen(false);
  };

  const handleSaveWorkflow = async () => {
    try {
      setLoading(true);

      // Preparar datos del workflow
      const workflowData: any = {
        codigo: workflow?.codigo || 'WF_' + Date.now(),
        nombre: workflow?.nombre || 'Nuevo Workflow',
        descripcion: workflow?.descripcion,
        estado: workflow?.estado || 'BORRADOR',
        version: workflow?.version || '1.0',
        categoria: workflow?.categoria,
      };

      let savedWorkflow: Workflow;

      if (isEditMode && workflow?.id) {
        // Actualizar workflow existente
        savedWorkflow = await workflowService.updateWorkflow(workflow.id, workflowData);
      } else {
        // Crear nuevo workflow
        savedWorkflow = await workflowService.createWorkflow(workflowData);
      }

      // Guardar etapas con posiciones
      for (const node of nodes) {
        const etapaData: Partial<WorkflowEtapa> = {
          ...node.data,
          workflow_id: savedWorkflow.id,
          posicion_x: node.position.x,
          posicion_y: node.position.y,
        };

        if (node.data.id) {
          await workflowService.updateEtapa(node.data.id, etapaData);
        } else {
          await workflowService.createEtapa(etapaData);
        }
      }

      // Guardar conexiones
      for (const edge of edges) {
        const conexionData: Partial<WorkflowConexion> = {
          workflow_id: savedWorkflow.id,
          etapa_origen_id: parseInt(edge.source),
          etapa_destino_id: parseInt(edge.target),
          condicion: edge.label as string,
        };

        if (edge.data?.id) {
          await workflowService.updateConexion(edge.data.id, conexionData);
        } else {
          await workflowService.createConexion(conexionData);
        }
      }

      navigate('/procesos');
    } catch (error) {
      console.error('Error al guardar workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/procesos')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            {isEditMode ? `Editar: ${workflow?.nombre || ''}` : 'Nuevo Proceso'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddNode}
            sx={{ mr: 2 }}
          >
            Añadir Etapa
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveWorkflow}
            disabled={loading}
          >
            Guardar
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="General" />
          <Tab label="Flujo" />
          <Tab label="Estado" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Stack spacing={2} sx={{ maxWidth: 600 }}>
          <Typography variant="body2" color="text.secondary">
            Configuración general del proceso
          </Typography>
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ flexGrow: 1, height: 'calc(100vh - 180px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography>Estado del workflow</Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography>Historial de cambios</Typography>
      </TabPanel>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 450 } }}
      >
        {selectedNode && (
          <EtapaConfigPanel
            etapa={selectedNode}
            onSave={handleSaveNode}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>
    </Box>
  );
};
