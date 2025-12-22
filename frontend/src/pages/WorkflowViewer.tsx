import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  AccountTree as AutoLayoutIcon,
  CloudUpload as UploadIcon,
  TextFields as TextIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckBoxIcon,
  FitScreen as FitScreenIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import type { Workflow, WorkflowEtapa } from '../types/workflow';
import CustomNode from '../components/Workflow/CustomNode';
import { getLayoutedElements } from '../utils/autoLayout';
import { logger } from '../utils/logger';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const WorkflowViewerContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { zoomIn, zoomOut, getViewport, fitView } = useReactFlow();
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(100);
  const [nodesLoaded, setNodesLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id));
    }
  }, [id]);

  // Ajustar la vista cuando los nodos estén cargados y la instancia de ReactFlow esté lista
  useEffect(() => {
    console.log('[FitView Debug] nodesLoaded:', nodesLoaded, 'nodes.length:', nodes.length, 'instance:', !!reactFlowInstance.current);
    if (nodesLoaded && nodes.length > 0) {
      // Esperar a que los nodos se rendericen completamente y que la instancia esté disponible
      const timer = setTimeout(() => {
        if (reactFlowInstance.current) {
          console.log('[FitView Debug] Calling fitView...');
          reactFlowInstance.current.fitView({ 
            padding: 0.1, 
            duration: 300, 
            minZoom: 0.05,
            includeHiddenNodes: true 
          });
          // Actualizar el indicador de zoom después de la animación
          setTimeout(() => {
            const viewport = reactFlowInstance.current?.getViewport();
            console.log('[FitView Debug] Viewport after fitView:', viewport);
            if (viewport) {
              setCurrentZoom(Math.round(viewport.zoom * 100));
            }
          }, 350);
        } else {
          console.log('[FitView Debug] Instance not ready yet');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [nodesLoaded, nodes.length]);

  // Callback cuando ReactFlow está inicializado
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    logger.component('WorkflowViewer', 'ReactFlow initialized');
  }, []);

  // Actualizar zoom cuando el viewport cambie
  const handleMove = useCallback(() => {
    const viewport = getViewport();
    setCurrentZoom(Math.round(viewport.zoom * 100));
  }, [getViewport]);

  const loadWorkflow = async (workflowId: number) => {
    try {
      logger.workflow('Loading workflow', { workflowId });
      
      const data = await workflowService.getWorkflow(workflowId);
      
      logger.workflow('Workflow loaded successfully', {
        workflowId: data.id,
        nombre: data.nombre,
        etapasCount: data.etapas?.length || 0,
        conexionesCount: data.conexiones?.length || 0,
      });
      
      if (data.etapas && data.etapas.length > 0) {
        data.etapas.forEach((etapa, idx) => {
          logger.debug(`Etapa ${idx}: ${etapa.nombre}`, {
            id: etapa.id,
            codigo: etapa.codigo,
            preguntasCount: etapa.preguntas?.length || 0,
          }, 'WORKFLOW');
        });
      }
      
      setWorkflow(data);
      
      if (data.etapas && data.etapas.length > 0) {
        const flowNodes = convertEtapasToNodes(data.etapas);
        const flowEdges = convertConexionesToEdges(data.conexiones || []);
        
        logger.debug('Converting to React Flow format', {
          nodesCount: flowNodes.length,
          edgesCount: flowEdges.length,
        }, 'WORKFLOW');
        
        // Aplicar auto-layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges
        );
        
        logger.debug('Auto-layout applied', {
          layoutedNodesCount: layoutedNodes.length,
        }, 'WORKFLOW');
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
        // Marcar que los nodos están cargados para trigger el fitView
        console.log('[WORKFLOW] Setting nodesLoaded to true, nodes count:', layoutedNodes.length);
        setNodesLoaded(true);
      }
    } catch (error) {
      logger.error('Error loading workflow', error, 'WORKFLOW');
      console.error('Error al cargar workflow:', error);
    }
  };

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    logger.component('WorkflowViewer', 'Node clicked', {
      nodeId: node.id,
      nodeType: node.type,
      nodeLabel: node.data?.label,
    });
    setSelectedNode(node);
  }, []);

  const handleZoomIn = useCallback(() => {
    logger.component('WorkflowViewer', 'Zoom in');
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    logger.component('WorkflowViewer', 'Zoom out');
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleAutoLayout = useCallback(() => {
    logger.component('WorkflowViewer', 'Auto-layout triggered', {
      nodesCount: nodes.length,
      edgesCount: edges.length,
    });
    
    const startTime = performance.now();
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    const duration = performance.now() - startTime;
    
    logger.performance('Auto-layout', duration, {
      nodesCount: layoutedNodes.length,
    });
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // Ajustar vista después del auto-layout
    setTimeout(() => {
      fitView({ padding: 0.05, duration: 300, minZoom: 0.05, includeHiddenNodes: true });
    }, 100);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleFitView = useCallback(() => {
    console.log('[FitView] handleFitView called, nodes:', nodes.length);
    logger.component('WorkflowViewer', 'Fit view triggered');
    const result = fitView({ padding: 0.05, duration: 300, minZoom: 0.05, includeHiddenNodes: true });
    console.log('[FitView] fitView result:', result);
    // Actualizar indicador de zoom después
    setTimeout(() => {
      const vp = getViewport();
      console.log('[FitView] Viewport after:', vp);
      setCurrentZoom(Math.round(vp.zoom * 100));
    }, 350);
  }, [fitView, nodes.length, getViewport]);

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
    return conexiones.map((conexion) => {
      // Convertir condicion a string si es un objeto
      let labelText = '';
      if (conexion.condicion) {
        if (typeof conexion.condicion === 'object') {
          // Si es objeto con estructura {pregunta, valor}, formatearlo
          if (conexion.condicion.pregunta && conexion.condicion.valor) {
            labelText = `${conexion.condicion.pregunta}: ${conexion.condicion.valor}`;
          } else {
            labelText = JSON.stringify(conexion.condicion);
          }
        } else {
          labelText = conexion.condicion;
        }
      } else if (conexion.nombre) {
        labelText = conexion.nombre;
      }

      return {
        id: `e${conexion.etapa_origen_id}-${conexion.etapa_destino_id}`,
        source: conexion.etapa_origen_id.toString(),
        target: conexion.etapa_destino_id.toString(),
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#4d4d4d',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4d4d4d',
          width: 20,
          height: 20,
        },
        label: labelText,
        labelStyle: { fill: '#4d4d4d', fontSize: 14 },
        labelBgStyle: { fill: 'white' },
      };
    });
  };

  // Obtener etapa seleccionada
  const selectedEtapa = selectedNode
    ? workflow?.etapas?.find((e) => e.id === parseInt(selectedNode.id))
    : null;

  if (selectedNode && selectedEtapa) {
    logger.debug('Etapa selected', {
      etapaId: selectedEtapa.id,
      nombre: selectedEtapa.nombre,
      codigo: selectedEtapa.codigo,
      preguntasCount: selectedEtapa.preguntas?.length || 0,
      preguntas: selectedEtapa.preguntas?.map(p => ({
        id: p.id,
        texto: p.texto_pregunta || p.pregunta,
        tipo: p.tipo_pregunta || p.tipo,
      })),
    }, 'WORKFLOW');
  }

  return (
    <Box sx={{ height: 'calc(100vh - 130px)', display: 'flex' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Canvas izquierdo - 6 columnas */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              border: '1px solid #333333',
              borderRadius: '4px',
              position: 'relative',
              bgcolor: 'white',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              onNodeClick={handleNodeClick}
              onMove={handleMove}
              onInit={onInit}
              snapToGrid={true}
              snapGrid={[20, 20]}
              panOnScroll={true}
              zoomOnScroll={true}
              panOnDrag={true}
              fitView
              fitViewOptions={{ padding: 0.1, minZoom: 0.05, includeHiddenNodes: true }}
              minZoom={0.05}
              maxZoom={2}
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { stroke: '#4d4d4d', strokeWidth: 2 },
              }}
            >
              <Background color="#f5f5f5" gap={16} variant={BackgroundVariant.Dots} />

              {/* Controles de zoom - top center */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  zIndex: 5,
                }}
              >
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
                  <IconButton size="small" onClick={handleZoomOut} sx={{ p: 0, color: '#788093' }}>
                    <ZoomOutIcon sx={{ fontSize: 20 }} />
                  </IconButton>

                  <IconButton size="small" onClick={handleZoomIn} sx={{ p: 0, color: '#788093' }}>
                    <ZoomInIcon sx={{ fontSize: 20 }} />
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <Typography sx={{ fontSize: '14px', color: '#788093' }}>
                      {currentZoom}%
                    </Typography>
                    <ArrowDownIcon sx={{ fontSize: 8, color: '#788093' }} />
                  </Box>
                </Box>

                {/* Botón de ajustar a la vista */}
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
                    onClick={handleFitView}
                    sx={{ p: 0, color: '#788093' }}
                    title="Ajustar a la vista"
                  >
                    <FitScreenIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Botón de auto-layout */}
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
                    onClick={handleAutoLayout}
                    sx={{ p: 0, color: '#788093' }}
                    title="Auto Layout"
                  >
                    <AutoLayoutIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </ReactFlow>
          </Box>
        </Grid>

        {/* Panel derecho - 6 columnas */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: '#f8f9fa',
              borderRadius: '4px',
              overflow: 'auto',
              p: 3,
            }}
          >
        {selectedEtapa ? (
          <>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#333' }}>
              {selectedEtapa.nombre}
            </Typography>

            {/* Información básica */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                Código
              </Typography>
              <Typography sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                {selectedEtapa.codigo || '-'}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                Tipo de Etapa
              </Typography>
              <Typography sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                {selectedEtapa.tipo_etapa || '-'}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                Perfiles Permitidos
              </Typography>
              <Box sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                {selectedEtapa.perfiles_permitidos && selectedEtapa.perfiles_permitidos.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedEtapa.perfiles_permitidos.map((perfil, idx) => (
                      <Chip
                        key={idx}
                        label={perfil}
                        size="small"
                        sx={{
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                    No especificado
                  </Typography>
                )}
              </Box>

              {/* Información del formulario */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                Información del Formulario
              </Typography>

              {selectedEtapa.titulo_formulario && (
                <>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                    Título del Formulario
                  </Typography>
                  <Typography sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                    {selectedEtapa.titulo_formulario}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                Bajada del Formulario
              </Typography>
              <Typography sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                {selectedEtapa.bajada_formulario || '-'}
              </Typography>

              {selectedEtapa.descripcion_formulario && (
                <>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                    Descripción del Formulario
                  </Typography>
                  <Typography sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                    {selectedEtapa.descripcion_formulario}
                  </Typography>
                </>
              )}

              {/* Configuraciones adicionales */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                Configuraciones
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedEtapa.es_etapa_inicial && (
                  <Chip label="Etapa Inicial" color="primary" size="small" />
                )}
                {selectedEtapa.es_etapa_final && (
                  <Chip label="Etapa Final" color="secondary" size="small" />
                )}
                {selectedEtapa.requiere_validacion && (
                  <Chip label="Requiere Validación" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100' }} />
                )}
                {selectedEtapa.permite_edicion_posterior && (
                  <Chip label="Permite Edición Posterior" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                )}
              </Box>

              {selectedEtapa.tiempo_estimado_minutos && (
                <>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5, fontWeight: 600 }}>
                    Tiempo Estimado
                  </Typography>
                  <Typography sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: '4px' }}>
                    {selectedEtapa.tiempo_estimado_minutos} minutos
                  </Typography>
                </>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Preguntas/Vistas */}
            {selectedEtapa.preguntas && selectedEtapa.preguntas.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                  Preguntas Configuradas ({selectedEtapa.preguntas.length})
                </Typography>
                {selectedEtapa.preguntas.map((pregunta, idx) => {
                  const tipoPregunta = pregunta.tipo_pregunta || pregunta.tipo;
                  const esObligatoria = pregunta.es_obligatoria || pregunta.requerido;
                  const textoPregunta = pregunta.texto_pregunta || pregunta.pregunta || pregunta.texto;
                  
                  return (
                    <Box
                      key={pregunta.id || idx}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'white',
                        borderRadius: '4px',
                        border: '2px solid #333333',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {/* Tipo de pregunta */}
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#333', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            mb: 0.5 
                          }}
                        >
                          Tipo de pregunta
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              border: '1px solid #333333',
                              borderRadius: '4px',
                              p: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                            }}
                          >
                            {tipoPregunta === 'CARGA_ARCHIVO' && (
                              <UploadIcon sx={{ fontSize: 16, color: '#333' }} />
                            )}
                            {tipoPregunta === 'RESPUESTA_TEXTO' && (
                              <TextIcon sx={{ fontSize: 16, color: '#333' }} />
                            )}
                            {tipoPregunta === 'OPCIONES' && (
                              <RadioIcon sx={{ fontSize: 16, color: '#333' }} />
                            )}
                            {tipoPregunta === 'LISTA' && (
                              <CheckBoxIcon sx={{ fontSize: 16, color: '#333' }} />
                            )}
                            {!['CARGA_ARCHIVO', 'RESPUESTA_TEXTO', 'OPCIONES', 'LISTA'].includes(tipoPregunta) && (
                              <TextIcon sx={{ fontSize: 16, color: '#333' }} />
                            )}
                          </Box>
                          <Typography sx={{ color: '#333', fontSize: '16px' }}>
                            {tipoPregunta === 'CARGA_ARCHIVO' && 'Carga de archivos'}
                            {tipoPregunta === 'RESPUESTA_TEXTO' && 'Respuesta de texto'}
                            {tipoPregunta === 'OPCIONES' && 'Opciones'}
                            {tipoPregunta === 'LISTA' && 'Lista'}
                            {!['CARGA_ARCHIVO', 'RESPUESTA_TEXTO', 'OPCIONES', 'LISTA'].includes(tipoPregunta) && tipoPregunta}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Pregunta */}
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#333', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            mb: 0.5 
                          }}
                        >
                          Pregunta
                        </Typography>
                        <Typography sx={{ color: '#4d4d4d', fontSize: '16px' }}>
                          {textoPregunta}
                        </Typography>
                      </Box>

                      {/* Estado Obligatoria */}
                      <Box>
                        <Typography sx={{ color: '#4d4d4d', fontSize: '16px' }}>
                          {esObligatoria ? 'Obligatoria' : 'No obligatoria'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                No hay preguntas configuradas para esta etapa
              </Typography>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography sx={{ color: '#999', fontSize: '18px' }}>
              Selecciona una etapa para ver sus detalles
            </Typography>
          </Box>
        )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export const WorkflowViewer: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowViewerContent />
    </ReactFlowProvider>
  );
};

export default WorkflowViewer;
