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
  Typography,
  Button,
  Tabs,
  Tab,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import EtapaConfigPanel from '../components/Workflow/EtapaConfigPanel';
import CustomNode from '../components/Workflow/CustomNode';
import type { Workflow, WorkflowEtapa, WorkflowConexion } from '../types/workflow';
import { GeneralView, StatusView, HistoryView } from '../components/PPSH/views';

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
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ height: value === index ? '100%' : '0' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(1); // Iniciar en tab "Flujo"
  const [loading, setLoading] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadWorkflow();
    } else {
      // Crear nodo inicial para nuevo workflow
      const initialNode: Node = {
        id: 'inicio',
        type: 'custom',
        position: { x: 50, y: 200 },
        data: {
          codigo: 'INICIO',
          nombre: 'Inicio',
          tipo_etapa: 'ETAPA' as const,
          orden: 0,
          perfiles_permitidos: [],
          es_etapa_inicial: true,
          es_etapa_final: false,
          es_inicial: true,
          requiere_validacion: false,
          permite_edicion_posterior: false,
          activo: true,
        },
      };
      setNodes([initialNode]);
    }
  }, [id, setNodes]);

  useEffect(() => {
          }, [nodes, edges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo si no está el drawer abierto y hay un nodo seleccionado
      if (!drawerOpen && selectedNode && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        handleDeleteNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, drawerOpen]);

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
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const handleAddNode = () => {
    // Calcular posición horizontal basada en el número de nodos
    const horizontalSpacing = 300;
    const verticalCenter = 200;
    const newX = 50 + (nodes.length * horizontalSpacing);
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: newX, y: verticalCenter },
      data: {
        codigo: `ETAPA_${nodes.length}`,
        nombre: '', // Vacío para mostrar placeholder
        tipo_etapa: 'ETAPA' as const,
        orden: nodes.length,
        perfiles_permitidos: [],
        es_etapa_inicial: false,
        es_etapa_final: false,
        requiere_validacion: false,
        permite_edicion_posterior: true,
        activo: true,
        is_placeholder: true, // Marcador para estilo placeholder
      },
    };
        setNodes((nds) => [...nds, newNode]);
    
    // Abrir automáticamente el panel de configuración
    setTimeout(() => {
      setSelectedNode(newNode);
      setDrawerOpen(true);
    }, 100);
  };

  const handleSaveNode = (updatedEtapa: Partial<WorkflowEtapa>) => {
    if (!selectedNode) return;

    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
                    // Remover el flag de placeholder al guardar
          const { is_placeholder, ...restData } = node.data as any;
          return { ...node, data: { ...restData, ...updatedEtapa } };
        }
        return node;
      })
    );
    
        setDrawerOpen(false);
  };

  const handleDeleteNode = () => {
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
      eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );

        setDrawerOpen(false);
    setSelectedNode(null);
  };

  const handleCloseDrawer = () => {
    // Si es un nodo placeholder sin nombre, eliminarlo
    if (selectedNode && (selectedNode.data as any).is_placeholder && !selectedNode.data.nombre) {
            setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    }
    setDrawerOpen(false);
    setSelectedNode(null);
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

            
      navigate('/flujos');
    } catch (error) {
      console.error('❌ Error al guardar workflow:', error);
          } finally {
      setLoading(false);
    }
  };

  const getWorkflowSummary = () => {
    return {
      workflow: {
        codigo: workflow?.codigo || 'WF_' + Date.now(),
        nombre: workflow?.nombre || 'Nuevo Workflow',
        descripcion: workflow?.descripcion,
        estado: workflow?.estado || 'BORRADOR',
        version: workflow?.version || '1.0',
        categoria: workflow?.categoria,
      },
      etapas: nodes.map((node, index) => ({
        orden: index + 1,
        id: node.id,
        codigo: node.data.codigo,
        nombre: node.data.nombre,
        tipo_etapa: node.data.tipo_etapa,
        perfiles_permitidos: node.data.perfiles_permitidos,
        titulo_formulario: node.data.titulo_formulario,
        descripcion_formulario: node.data.descripcion_formulario,
        cantidad_preguntas: node.data.preguntas?.length || 0,
        preguntas: node.data.preguntas?.map((p: any, i: number) => ({
          orden: i + 1,
          tipo: p.tipo || p.tipo_pregunta,
          texto: p.texto || p.pregunta,
          ayuda: p.ayuda || p.texto_ayuda,
          obligatoria: p.es_obligatoria,
        })) || [],
        posicion: {
          x: node.position.x,
          y: node.position.y,
        },
        es_inicial: node.data.es_inicial || node.data.es_etapa_inicial,
        es_final: node.data.es_etapa_final,
      })),
      conexiones: edges.map((edge, index) => ({
        orden: index + 1,
        desde: edge.source,
        hacia: edge.target,
        condicion: edge.label,
        tipo: edge.type,
      })),
      estadisticas: {
        total_etapas: nodes.length,
        total_conexiones: edges.length,
        total_preguntas: nodes.reduce((sum, node) => sum + (node.data.preguntas?.length || 0), 0),
        etapas_por_tipo: {
          ETAPA: nodes.filter(n => n.data.tipo_etapa === 'ETAPA').length,
          COMPUERTA: nodes.filter(n => n.data.tipo_etapa === 'COMPUERTA').length,
          SUBPROCESO: nodes.filter(n => n.data.tipo_etapa === 'SUBPROCESO').length,
        },
      },
    };
  };

  return (
    <Box>
      {/* Título de la página */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {workflow?.nombre || 'Nuevo Proceso'}
        </Typography>
        
        <Button
          variant="outlined"
          onClick={() => navigate('/procesos')}
          sx={{
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#0d5494',
              backgroundColor: 'rgba(14, 95, 166, 0.04)',
            },
          }}
        >
          Volver a Procesos
        </Button>
      </Box>

      {/* Barra de acciones */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mb: 2,
        pt: 2,
      }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddNode}
          sx={{
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#0d5494',
              backgroundColor: 'rgba(14, 95, 166, 0.04)',
            },
          }}
        >
          Añadir Etapa
        </Button>
        <Button
          variant="outlined"
          startIcon={<CodeIcon />}
          onClick={() => setJsonDialogOpen(true)}
          sx={{
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#0d5494',
              backgroundColor: 'rgba(14, 95, 166, 0.04)',
            },
          }}
        >
          Vista Previa JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveWorkflow}
          disabled={loading}
          sx={{
            backgroundColor: '#0e5fa6',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#0d5494',
            },
          }}
        >
          Guardar
        </Button>
      </Box>

      {/* Tabs de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="General" />
          <Tab label="Flujo" />
          <Tab label="Estado" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ py: 3, maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
          <GeneralView procesoId={id} solicitudId={undefined} />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ 
          width: '100%', 
          height: 'calc(100vh - 400px)',
          '& .react-flow__attribution': {
            display: 'none',
          },
        }}>
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
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#1976d2', strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: '#1976d2', strokeWidth: 2 }}
          >
            <Controls 
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <Background gap={12} size={1} color="#e0e0e0" />
          </ReactFlow>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ py: 3, maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
          <StatusView procesoId={id} solicitudId={undefined} />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ py: 3, maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
          <HistoryView procesoId={id} solicitudId={undefined} />
        </Box>
      </TabPanel>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: 450 } }}
      >
        {selectedNode && (
          <EtapaConfigPanel
            etapa={selectedNode.data}
            onSave={handleSaveNode}
            onClose={handleCloseDrawer}
            onDelete={handleDeleteNode}
          />
        )}
      </Drawer>

      <Dialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Vista Previa JSON del Workflow
          <Typography variant="caption" display="block" color="text.secondary">
            Resumen completo de la configuración actual
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              maxHeight: '60vh',
            }}
          >
            {JSON.stringify(getWorkflowSummary(), null, 2)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonDialogOpen(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(getWorkflowSummary(), null, 2));
            }}
          >
            Copiar al Portapapeles
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
