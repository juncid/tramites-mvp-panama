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
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
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
  ArrowBack as ArrowBackIcon,
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
    console.log('Nodos actuales:', nodes);
    console.log('Conexiones actuales:', edges);
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
      console.log('Conectando nodos:', params);
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
    console.log('Agregando nodo placeholder:', newNode);
    setNodes((nds) => [...nds, newNode]);
    
    // Abrir automáticamente el panel de configuración
    setTimeout(() => {
      setSelectedNode(newNode);
      setDrawerOpen(true);
    }, 100);
  };

  const handleSaveNode = (updatedEtapa: Partial<WorkflowEtapa>) => {
    if (!selectedNode) return;

    console.log('🔄 Guardando configuración de etapa:', {
      nodoId: selectedNode.id,
      datosAnteriores: selectedNode.data,
      datosNuevos: updatedEtapa,
      preguntasNuevas: updatedEtapa.preguntas,
      cantidadPreguntas: updatedEtapa.preguntas?.length || 0,
      datosCombinados: { ...selectedNode.data, ...updatedEtapa }
    });

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          console.log('✅ Actualizando nodo:', node.id);
          // Remover el flag de placeholder al guardar
          const { is_placeholder, ...restData } = node.data as any;
          return { ...node, data: { ...restData, ...updatedEtapa } };
        }
        return node;
      })
    );
    
    console.log('✅ Nodo actualizado en estado local');
    setDrawerOpen(false);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    // No permitir eliminar el nodo inicial
    if (selectedNode.data.es_inicial || selectedNode.data.es_etapa_inicial) {
      alert('No se puede eliminar el nodo inicial');
      return;
    }

    console.log('🗑️ Eliminando nodo:', selectedNode.id);

    // Eliminar el nodo
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    
    // Eliminar todas las conexiones relacionadas con este nodo
    setEdges((eds) => 
      eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );

    console.log('✅ Nodo eliminado');
    setDrawerOpen(false);
    setSelectedNode(null);
  };

  const handleCloseDrawer = () => {
    // Si es un nodo placeholder sin nombre, eliminarlo
    if (selectedNode && (selectedNode.data as any).is_placeholder && !selectedNode.data.nombre) {
      console.log('🗑️ Eliminando nodo placeholder no guardado');
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    }
    setDrawerOpen(false);
    setSelectedNode(null);
  };

  const handleSaveWorkflow = async () => {
    try {
      setLoading(true);

      console.group('🔵 GUARDANDO WORKFLOW COMPLETO');
      console.log('📊 Estado actual de nodos:', nodes);
      console.log('🔗 Estado actual de conexiones:', edges);

      // Preparar datos del workflow
      const workflowData: any = {
        codigo: workflow?.codigo || 'WF_' + Date.now(),
        nombre: workflow?.nombre || 'Nuevo Workflow',
        descripcion: workflow?.descripcion,
        estado: workflow?.estado || 'BORRADOR',
        version: workflow?.version || '1.0',
        categoria: workflow?.categoria,
      };

      console.log('📝 Datos del workflow a guardar:', workflowData);

      let savedWorkflow: Workflow;

      if (isEditMode && workflow?.id) {
        // Actualizar workflow existente
        console.log('♻️ Actualizando workflow existente con ID:', workflow.id);
        savedWorkflow = await workflowService.updateWorkflow(workflow.id, workflowData);
      } else {
        // Crear nuevo workflow
        console.log('✨ Creando nuevo workflow');
        savedWorkflow = await workflowService.createWorkflow(workflowData);
      }

      console.log('✅ Workflow guardado con ID:', savedWorkflow.id);

      // Guardar etapas con posiciones
      console.log('📦 Guardando', nodes.length, 'etapas...');
      for (const node of nodes) {
        const etapaData: Partial<WorkflowEtapa> = {
          ...node.data,
          workflow_id: savedWorkflow.id,
          posicion_x: node.position.x,
          posicion_y: node.position.y,
        };

        console.log('  ⚙️ Etapa:', {
          id: node.id,
          codigo: etapaData.codigo,
          nombre: etapaData.nombre,
          tipo: etapaData.tipo_etapa,
          perfiles: etapaData.perfiles_permitidos,
          preguntas: etapaData.preguntas?.length || 0,
          posicion: { x: node.position.x, y: node.position.y },
          todosLosDatos: etapaData
        });

        if (node.data.id) {
          await workflowService.updateEtapa(node.data.id, etapaData);
          console.log('    ✅ Etapa actualizada');
        } else {
          await workflowService.createEtapa(etapaData);
          console.log('    ✅ Etapa creada');
        }
      }

      // Guardar conexiones
      console.log('🔗 Guardando', edges.length, 'conexiones...');
      for (const edge of edges) {
        const conexionData: Partial<WorkflowConexion> = {
          workflow_id: savedWorkflow.id,
          etapa_origen_id: parseInt(edge.source),
          etapa_destino_id: parseInt(edge.target),
          condicion: edge.label as string,
        };

        console.log('  🔗 Conexión:', {
          desde: edge.source,
          hacia: edge.target,
          condicion: edge.label,
          todosLosDatos: conexionData
        });

        if (edge.data?.id) {
          await workflowService.updateConexion(edge.data.id, conexionData);
          console.log('    ✅ Conexión actualizada');
        } else {
          await workflowService.createConexion(conexionData);
          console.log('    ✅ Conexión creada');
        }
      }

      console.log('🎉 WORKFLOW GUARDADO EXITOSAMENTE');
      console.groupEnd();

      navigate('/flujos');
    } catch (error) {
      console.error('❌ Error al guardar workflow:', error);
      console.groupEnd();
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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/flujos')}>
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
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setJsonDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Vista Previa JSON
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
        <Box sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
          <GeneralView procesoId={id} solicitudId={undefined} />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ width: '100%', height: 'calc(100vh - 200px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
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
        <Box sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
          <StatusView procesoId={id} solicitudId={undefined} />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
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
