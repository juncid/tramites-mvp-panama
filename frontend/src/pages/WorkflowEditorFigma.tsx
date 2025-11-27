import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
  ConnectionLineType,
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
  Switch,
  Link,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
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
  FitScreen as FitScreenIcon,
  Save as SaveIcon,
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
  
  const { zoomIn, zoomOut, setViewport, getViewport, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(100);
  const [currentTab, setCurrentTab] = useState<number>(0); // 0: General, 1: Flujo, 2: Estado, 3: Historial
  const [filterPerfil, setFilterPerfil] = useState<string>('todos'); // Filtro por perfil
  const [lastNodeId, setLastNodeId] = useState<string | null>(null); // ID del último nodo del flujo

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

  // Filtrar nodos por perfil seleccionado
  const filteredNodes = useMemo(() => {
    if (filterPerfil === 'todos') {
      return nodes;
    }
    
    // Mapeo de valores del select a códigos de perfiles
    const perfilMap: Record<string, string[]> = {
      'ciudadano': ['CIUDADANO', 'ABOGADO'],
      'funcionario': ['FUNCIONARIO'],
      'supervisor': ['SUPERVISOR'],
      'administrador': ['ADMIN', 'ADMINISTRADOR'],
    };
    
    const perfilesABuscar = perfilMap[filterPerfil] || [filterPerfil.toUpperCase()];
    
    // Obtener IDs de nodos que pasan el filtro
    const nodosQuePasan = nodes.filter(node => {
      // Siempre mostrar nodos especiales (inicio, fin, placeholder)
      if (node.id === 'inicio' || node.id === 'fin' || node.data.is_placeholder) {
        return true;
      }
      
      const perfilesPermitidos = node.data.perfiles_permitidos || [];
      // Verificar si alguno de los perfiles permitidos coincide
      return perfilesPermitidos.some((perfil: string) => 
        perfilesABuscar.includes(perfil.toUpperCase())
      );
    });
    
    return nodosQuePasan;
  }, [nodes, filterPerfil]);
  
  // Filtrar edges para mostrar solo conexiones entre nodos visibles
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  // Llamar a fitView cuando se cambie a la pestaña de Flujo
  useEffect(() => {
    if (currentTab === 1) {
      // Delay para asegurar que el DOM y ReactFlow estén listos
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 300 });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentTab, fitView]);

  // Ajustar vista cuando cambia el filtro de perfil
  useEffect(() => {
    if (currentTab === 1 && filteredNodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 300 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filterPerfil, fitView, currentTab, filteredNodes.length]);

  // Calcular el último nodo del flujo (el más a la derecha que no es placeholder)
  useEffect(() => {
    if (nodes.length > 0) {
      // Filtrar nodos válidos (no placeholder)
      const nodosValidos = nodes.filter(n => !n.data.is_placeholder);
      
      if (nodosValidos.length > 0) {
        // Encontrar el nodo más a la derecha (mayor posición X)
        const ultimoNodo = nodosValidos.reduce((prev, current) => 
          (current.position.x > prev.position.x) ? current : prev
        );
        setLastNodeId(ultimoNodo.id);
      }
    }
  }, [nodes]);

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
      setLastNodeId(initialNode.id); // Establecer como último nodo por defecto
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

      // Filtrar solo etapas activas (activo = true o activo no definido)
      const etapasActivas = data.etapas?.filter((etapa: any) => etapa.activo !== false) || [];

      if (etapasActivas.length > 0) {
        // Verificar si ya existe un nodo de inicio (código INICIO o es_inicial)
        const hasInicioNode = etapasActivas.some((e: any) => e.codigo === 'INICIO' || e.es_inicial);
        
        const flowNodes: Node[] = [];
        
        // Agregar nodo de inicio visual si no existe
        if (!hasInicioNode) {
          const primeraEtapa = etapasActivas[0];
          flowNodes.push({
            id: 'inicio',
            type: 'custom',
            position: { 
              x: (primeraEtapa.posicion_x || 80) - 150, 
              y: primeraEtapa.posicion_y || 300 
            },
            data: {
              codigo: 'INICIO',
              nombre: 'Inicio',
              tipo_etapa: 'ETAPA' as const,
              orden: 0,
              perfiles_permitidos: ['Sistema'],
              es_inicial: true,
              es_etapa_inicial: false, // false para que las etapas reales no se confundan
              es_etapa_final: false,
              requiere_validacion: false,
              permite_edicion_posterior: false,
              activo: true,
            },
          });
        }
        
        // Mapear etapas activas desde la BD (quitando el flag es_etapa_inicial para que se muestren como nodos normales)
        etapasActivas.forEach((etapa: any) => {
          flowNodes.push({
            id: etapa.id?.toString() || etapa.codigo,
            type: 'custom',
            position: etapa.posicion_x && etapa.posicion_y 
              ? { x: etapa.posicion_x, y: etapa.posicion_y }
              : { x: 0, y: 0 },
            data: {
              ...etapa,
              // Preservar es_etapa_inicial en los datos pero no usarlo para renderizar como círculo
              es_etapa_inicial_original: etapa.es_etapa_inicial,
              es_etapa_inicial: false, // Evitar que se renderice como círculo verde
            },
          });
        });
        
        // Encontrar el último nodo (el que no tiene conexiones salientes)
        const lastNode = flowNodes[flowNodes.length - 1];
        const hasFinalNode = flowNodes.some(n => n.data.tipo_etapa === 'TERMINO' || n.data.tipo_etapa === 'FIN');
        
        // Si no hay nodo final, agregar un nodo placeholder al final
        if (!hasFinalNode && lastNode) {
          const placeholderId = 'placeholder-add-node';
          const placeholderNode: Node = {
            id: placeholderId,
            type: 'custom',
            position: { 
              x: lastNode.position.x + 270, 
              y: lastNode.position.y 
            },
            data: {
              is_placeholder: true,
              codigo: '',
              nombre: '',
              tipo_etapa: 'ETAPA' as const,
              perfiles_permitidos: [],
              es_etapa_inicial: false,
              es_etapa_final: false,
              preguntas: [],
              conexiones: [],
            },
          };
          flowNodes.push(placeholderNode);
        }
        
        // Seleccionar el último nodo (el más a la derecha) por defecto
        const nodosValidos = flowNodes.filter(n => !n.data.is_placeholder);
        if (nodosValidos.length > 0) {
          const ultimoNodo = nodosValidos.reduce((prev, current) => 
            (current.position.x > prev.position.x) ? current : prev
          );
          setSelectedNode(ultimoNodo);
          setLastNodeId(ultimoNodo.id);
        }

        // Cargar conexiones
        let flowEdges: Edge[] = [];
        
        // Crear un set de IDs de etapas activas para filtrar conexiones
        const idsEtapasActivas = new Set(etapasActivas.map((e: any) => e.id));
        
        // Agregar conexión desde nodo de inicio a la primera etapa si fue creado
        if (!hasInicioNode && etapasActivas.length > 0) {
          const primeraEtapa = etapasActivas[0];
          const primeraEtapaId = primeraEtapa.id?.toString() || primeraEtapa.codigo;
          flowEdges.push({
            id: 'e-inicio-primera',
            source: 'inicio',
            target: primeraEtapaId,
            type: 'straight',
            style: { stroke: '#4d4d4d', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#4d4d4d',
            },
          });
        }
        
        if (data.conexiones && data.conexiones.length > 0) {
          // Filtrar solo conexiones entre etapas activas
          const conexionesActivas = data.conexiones.filter((conexion: any) => 
            idsEtapasActivas.has(conexion.etapa_origen_id) && 
            idsEtapasActivas.has(conexion.etapa_destino_id) &&
            conexion.activo !== false
          );
          
          const conexionesFromDB = conexionesActivas.map((conexion: any) => ({
            id: conexion.id?.toString() || `${conexion.etapa_origen_id}-${conexion.etapa_destino_id}`,
            source: conexion.etapa_origen_id.toString(),
            target: conexion.etapa_destino_id.toString(),
            type: 'straight',
            style: { stroke: '#4d4d4d', strokeWidth: 2 },
            label: typeof conexion.condicion === 'object' && conexion.condicion !== null
              ? JSON.stringify(conexion.condicion)
              : conexion.condicion || '',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#4d4d4d',
            },
          }));
          flowEdges = [...flowEdges, ...conexionesFromDB];
          
          // Agregar conexión al placeholder si existe
          if (!hasFinalNode && etapasActivas.length > 0) {
            const lastEtapa = etapasActivas[etapasActivas.length - 1];
            const lastNodeId = lastEtapa.id?.toString() || lastEtapa.codigo;
            flowEdges.push({
              id: `e${lastNodeId}-placeholder`,
              source: lastNodeId,
              target: 'placeholder-add-node',
              type: 'straight',
              style: { stroke: '#4d4d4d', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#4d4d4d',
              },
            });
          }
        }
        
        // Aplicar auto-layout automáticamente al cargar
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges,
          'LR'
        );
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
        // Ajustar la vista después de que React renderice los nodos
        setTimeout(() => {
          fitView({ padding: 0.1 });
        }, 100);
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
        type: 'straight',
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
    // Si es el placeholder, convertirlo en un nodo real
    if (node.data.is_placeholder) {
      handleConvertPlaceholderToNode(node);
      return;
    }
    setSelectedNode(node);
  };

  // Función para convertir el placeholder en un nodo real y crear un nuevo placeholder
  const handleConvertPlaceholderToNode = (placeholderNode: Node) => {
    const newNodeId = `${Date.now()}`;
    
    // Convertir el placeholder en un nodo real
    const convertedNode: Node = {
      ...placeholderNode,
      id: newNodeId,
      data: {
        codigo: `ETAPA_${newNodeId}`,
        nombre: `Nueva Etapa`,
        tipo_etapa: 'ETAPA' as const,
        perfiles_permitidos: [],
        es_etapa_inicial: false,
        es_etapa_final: false,
        preguntas: [],
        conexiones: [],
        is_placeholder: false,
      },
    };
    
    // Crear un nuevo placeholder después del nodo convertido
    const newPlaceholderId = 'placeholder-add-node';
    const newPlaceholder: Node = {
      id: newPlaceholderId,
      type: 'custom',
      position: { 
        x: convertedNode.position.x + 270, 
        y: convertedNode.position.y 
      },
      data: {
        is_placeholder: true,
        codigo: '',
        nombre: '',
        tipo_etapa: 'ETAPA' as const,
        perfiles_permitidos: [],
        es_etapa_inicial: false,
        es_etapa_final: false,
        preguntas: [],
        conexiones: [],
      },
    };
    
    // Actualizar nodos: reemplazar el placeholder viejo con el nodo convertido y agregar nuevo placeholder
    setNodes((nds) => {
      const filteredNodes = nds.filter(n => n.id !== placeholderNode.id);
      return [...filteredNodes, convertedNode, newPlaceholder];
    });
    
    // Actualizar edges: actualizar la conexión existente y agregar nueva conexión al placeholder
    setEdges((eds) => {
      // Actualizar el edge que apuntaba al placeholder viejo
      const updatedEdges = eds.map(e => {
        if (e.target === placeholderNode.id) {
          return { ...e, target: newNodeId, id: e.id.replace('placeholder', newNodeId) };
        }
        return e;
      });
      
      // Agregar nuevo edge al placeholder
      const newEdge: Edge = {
        id: `e${newNodeId}-placeholder`,
        source: newNodeId,
        target: newPlaceholderId,
        type: 'straight',
        style: { stroke: '#4d4d4d', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4d4d4d',
        },
      };
      
      return [...updatedEdges, newEdge];
    });
    
    // Seleccionar el nuevo nodo para configurarlo
    setSelectedNode(convertedNode);
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
    // Aplicar fitView después de un breve delay para que se rendericen los nodos
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
  }, [nodes, edges, setNodes, setEdges, fitView]);

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
        type: 'straight',
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

    // Función para determinar si un ID es de la base de datos (no temporal)
    // IDs temporales son timestamps (> 1600000000000, año 2020+)
    const isDbId = (nodeId: string): boolean => {
      const id = parseInt(nodeId);
      return !isNaN(id) && id > 0 && id < 1000000000; // IDs de BD son menores a 1 billón
    };

    try {
      if (isEditMode && id) {
        // 1. Actualizar datos básicos del workflow
        const workflowPayload = {
          nombre: workflowData.nombre,
          descripcion: workflowData.descripcion,
          version: workflowData.version,
          estado: workflowData.estado,
          activo: workflowData.activo,
        };
        await workflowService.updateWorkflow(parseInt(id), workflowPayload);

        // 2. Separar etapas existentes de nuevas
        // Filtrar nodos que NO son visuales (inicio, fin, placeholder)
        const etapasEditables = nodes.filter(node => {
          const nodeId = node.id;
          // Excluir nodos visuales
          if (nodeId === 'inicio' || nodeId === 'fin' || node.data.is_placeholder) {
            return false;
          }
          return true;
        });

        // Separar en existentes y nuevas
        const etapasExistentes = etapasEditables.filter(node => isDbId(node.id));
        const etapasNuevas = etapasEditables.filter(node => !isDbId(node.id));

        // Calcular el orden basado en posición X (de izquierda a derecha)
        const todasOrdenadas = [...etapasEditables].sort((a, b) => a.position.x - b.position.x);
        
        // 2.5. Desactivar etapas que ya no están en el editor (soft delete)
        // Obtener IDs de etapas en el editor
        const idsEtapasEnEditor = etapasExistentes.map(node => parseInt(node.id));
        
        // Obtener etapas actuales de la BD (solo las activas)
        const workflowActualParaEtapas = await workflowService.getWorkflow(parseInt(id));
        const etapasActivasEnBD = (workflowActualParaEtapas.etapas || []).filter((e: any) => e.activo !== false);
        
        // Encontrar etapas a desactivar (están activas en BD pero no en editor)
        const etapasADesactivar = etapasActivasEnBD.filter((etapa: any) => !idsEtapasEnEditor.includes(etapa.id));
        
        for (const etapa of etapasADesactivar) {
          if (!etapa.id) continue;
          console.log(`Desactivando etapa ${etapa.id} (${etapa.codigo}) del workflow (soft delete)`);
          // Marcar como inactiva en lugar de eliminar
          await workflowService.updateEtapa(etapa.id, { activo: false });
        }
        
        if (etapasADesactivar.length > 0) {
          console.log(`Desactivadas ${etapasADesactivar.length} etapas`);
        }

        // 3. Actualizar etapas existentes con sus datos completos (incluyendo preguntas)
        const updatePromises = etapasExistentes.map(async (node) => {
          const etapaId = parseInt(node.id);
          const orden = todasOrdenadas.findIndex(n => n.id === node.id) + 1;
          
          console.log(`Procesando etapa ${etapaId} (${node.data.nombre}) con ${node.data.preguntas?.length || 0} preguntas`);
          
          // Actualizar datos básicos de la etapa
          await workflowService.updateEtapa(etapaId, {
            codigo: node.data.codigo,
            nombre: node.data.nombre,
            descripcion: node.data.descripcion,
            tipo_etapa: node.data.tipo_etapa,
            orden,
            posicion_x: Math.round(node.position.x),
            posicion_y: Math.round(node.position.y),
            perfiles_permitidos: node.data.perfiles_permitidos,
            titulo_formulario: node.data.titulo_formulario,
            bajada_formulario: node.data.bajada_formulario,
            es_etapa_inicial: node.data.es_etapa_inicial,
            es_etapa_final: node.data.es_etapa_final,
          });
          
          // Obtener preguntas actuales de la BD para esta etapa
          const etapaActual = await workflowService.getEtapa(etapaId);
          const preguntasEnBD = etapaActual.preguntas || [];
          const preguntasEnEditor = node.data.preguntas || [];
          
          // IDs de preguntas que están en el editor (solo las existentes, no las nuevas)
          const idsEnEditor = preguntasEnEditor
            .filter((p: any) => p.id && typeof p.id === 'number' && p.id < 1000000000)
            .map((p: any) => p.id);
          
          // Eliminar preguntas que ya no están en el editor
          const preguntasAEliminar = preguntasEnBD.filter((p: any) => !idsEnEditor.includes(p.id));
          for (const pregunta of preguntasAEliminar) {
            if (!pregunta.id) continue;
            console.log(`Eliminando pregunta ${pregunta.id} (${pregunta.codigo}) de etapa ${etapaId}`);
            await workflowService.deletePregunta(pregunta.id);
          }
          
          // Actualizar/crear preguntas de la etapa
          if (preguntasEnEditor && Array.isArray(preguntasEnEditor)) {
            for (let i = 0; i < preguntasEnEditor.length; i++) {
              const pregunta = preguntasEnEditor[i];
              // Verificar si es una pregunta existente (ID numérico de BD, no temporal)
              const isExistingPregunta = pregunta.id && typeof pregunta.id === 'number' && pregunta.id < 1000000000;
              
              if (isExistingPregunta) {
                // Pregunta existente - actualizar
                await workflowService.updatePregunta(pregunta.id, {
                  codigo: pregunta.codigo,
                  pregunta: pregunta.pregunta || pregunta.texto,
                  tipo_pregunta: pregunta.tipo_pregunta || pregunta.tipo,
                  orden: pregunta.orden ?? i + 1,
                  es_obligatoria: pregunta.es_obligatoria,
                  opciones: pregunta.opciones,
                  texto_ayuda: pregunta.texto_ayuda || pregunta.ayuda,
                  placeholder: pregunta.placeholder,
                  extensiones_permitidas: pregunta.extensiones_permitidas,
                  tamano_maximo_mb: pregunta.tamano_maximo_mb || pregunta.max_size_mb,
                  permite_multiple: pregunta.permite_multiple,
                });
              } else {
                // Pregunta nueva - crear
                console.log(`Creando nueva pregunta para etapa ${etapaId}:`, pregunta);
                await workflowService.createPregunta({
                  etapa_id: etapaId,
                  codigo: pregunta.codigo || `PREGUNTA_${Date.now()}_${i}`,
                  pregunta: pregunta.pregunta || pregunta.texto || '',
                  tipo_pregunta: pregunta.tipo_pregunta || pregunta.tipo || 'TEXTO',
                  orden: pregunta.orden ?? i + 1,
                  es_obligatoria: pregunta.es_obligatoria ?? false,
                  opciones: pregunta.opciones,
                  texto_ayuda: pregunta.texto_ayuda || pregunta.ayuda,
                  placeholder: pregunta.placeholder,
                  extensiones_permitidas: pregunta.extensiones_permitidas,
                  tamano_maximo_mb: pregunta.tamano_maximo_mb || pregunta.max_size_mb,
                  permite_multiple: pregunta.permite_multiple,
                });
              }
            }
          }
        });

        await Promise.all(updatePromises);
        console.log(`Actualizadas ${etapasExistentes.length} etapas existentes con sus preguntas`);

        // 4. Crear etapas nuevas
        if (etapasNuevas.length > 0) {
          const createPromises = etapasNuevas.map((node) => {
            const orden = todasOrdenadas.findIndex(n => n.id === node.id) + 1;
            return workflowService.createEtapa({
              workflow_id: parseInt(id),
              codigo: node.data.codigo || `ETAPA_${Date.now()}`,
              nombre: node.data.nombre || 'Nueva Etapa',
              tipo_etapa: node.data.tipo_etapa || 'ETAPA',
              orden,
              posicion_x: Math.round(node.position.x),
              posicion_y: Math.round(node.position.y),
              perfiles_permitidos: node.data.perfiles_permitidos || [],
              es_etapa_inicial: node.data.es_etapa_inicial || false,
              es_etapa_final: node.data.es_etapa_final || false,
              preguntas: node.data.preguntas || [],
            });
          });

          await Promise.all(createPromises);
          console.log(`Creadas ${etapasNuevas.length} etapas nuevas`);
        }

        // 5. Sincronizar conexiones (edges)
        // Obtener conexiones actuales activas de la BD
        const workflowActual = await workflowService.getWorkflow(parseInt(id));
        const conexionesEnBD = (workflowActual.conexiones || []).filter((c: any) => c.activo !== false);
        
        // Filtrar edges válidos (solo los que conectan nodos de BD, no placeholder ni inicio/fin)
        const edgesValidos = edges.filter(edge => {
          // Excluir conexiones con nodos especiales
          if (edge.source === 'inicio' || edge.target === 'fin' || 
              edge.source === 'placeholder-add-node' || edge.target === 'placeholder-add-node') {
            return false;
          }
          // Verificar que source y target son IDs válidos de BD
          const sourceId = parseInt(edge.source);
          const targetId = parseInt(edge.target);
          return !isNaN(sourceId) && !isNaN(targetId) && sourceId < 1000000000 && targetId < 1000000000;
        });
        
        console.log(`Conexiones activas en BD: ${conexionesEnBD.length}, Conexiones en editor: ${edgesValidos.length}`);
        
        // Crear un mapa de conexiones en el editor para búsqueda rápida
        const edgesMap = new Map(edgesValidos.map(e => [`${e.source}-${e.target}`, e]));
        
        // Desactivar conexiones que ya no existen en el editor (soft delete)
        const conexionesADesactivar = conexionesEnBD.filter(conexion => {
          const key = `${conexion.etapa_origen_id}-${conexion.etapa_destino_id}`;
          return !edgesMap.has(key);
        });
        
        for (const conexion of conexionesADesactivar) {
          if (!conexion.id) continue;
          console.log(`Desactivando conexión ${conexion.id}: ${conexion.etapa_origen_id} -> ${conexion.etapa_destino_id}`);
          await workflowService.updateConexion(conexion.id, { activo: false });
        }
        
        // Crear un mapa de conexiones activas en BD para búsqueda rápida
        const conexionesBDMap = new Map(conexionesEnBD.map(c => [`${c.etapa_origen_id}-${c.etapa_destino_id}`, c]));
        
        // Crear conexiones nuevas (las que están en el editor pero no en BD activas)
        const conexionesNuevas = edgesValidos.filter(edge => {
          const key = `${edge.source}-${edge.target}`;
          return !conexionesBDMap.has(key);
        });
        
        for (const edge of conexionesNuevas) {
          console.log(`Creando conexión: ${edge.source} -> ${edge.target}`);
          await workflowService.createConexion({
            workflow_id: parseInt(id),
            etapa_origen_id: parseInt(edge.source),
            etapa_destino_id: parseInt(edge.target),
            condicion: typeof edge.label === 'string' ? edge.label : null,
            es_predeterminada: true,
            activo: true,
          });
        }
        
        console.log(`Conexiones desactivadas: ${conexionesADesactivar.length}, Conexiones creadas: ${conexionesNuevas.length}`);

        // 6. Recargar el workflow para obtener los IDs reales de la BD
        console.log('Recargando workflow para sincronizar IDs...');
        const workflowActualizado = await workflowService.getWorkflow(parseInt(id));
        
        // Actualizar los nodos con los datos frescos de la BD (incluyendo IDs reales de preguntas)
        const nodosActualizados = nodes.map(node => {
          if (node.id === 'inicio' || node.id === 'fin' || node.data.is_placeholder) {
            return node;
          }
          
          // Buscar la etapa correspondiente en los datos actualizados
          const etapaActualizada = workflowActualizado.etapas?.find(
            (e: any) => e.id.toString() === node.id
          );
          
          if (etapaActualizada) {
            return {
              ...node,
              data: {
                ...node.data,
                preguntas: etapaActualizada.preguntas || [],
              }
            };
          }
          
          return node;
        });
        
        setNodes(nodosActualizados);
        console.log('Workflow sincronizado con IDs de BD');

        setSaveSuccess(true);
        // No navegar automáticamente, permitir seguir editando
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        // Crear nuevo workflow - mantener lógica original
        const etapas = nodes
          .filter(node => {
            const nodeId = parseInt(node.id);
            return !isNaN(nodeId) || node.data.nombre; // Incluir nodos con nombre
          })
          .map((node, index) => ({
            ...node.data,
            orden: index,
            posicion_x: Math.round(node.position.x),
            posicion_y: Math.round(node.position.y),
          }));

        const conexiones = edges
          .filter(edge => {
            const sourceId = parseInt(edge.source);
            const targetId = parseInt(edge.target);
            return !isNaN(sourceId) && !isNaN(targetId);
          })
          .map((edge) => ({
            etapa_origen_id: parseInt(edge.source),
            etapa_destino_id: parseInt(edge.target),
            condicion: typeof edge.label === 'string' ? edge.label : null,
            es_predeterminada: true,
            activo: true,
          }));

        const workflowPayload = {
          ...workflowData,
          codigo: workflowData.codigo || `WORKFLOW_${Date.now()}`,
          nombre: workflowData.nombre || 'Nuevo Workflow',
          perfiles_creadores: workflowData.perfiles_creadores || [],
          etapas,
          conexiones,
        };

        await workflowService.createWorkflow(workflowPayload as any);
        setSaveSuccess(true);
        setTimeout(() => {
          navigate('/procesos');
        }, 1500);
      }
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
      {/* Breadcrumbs - estilo Figma */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
        <Link
          underline="none"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#757575', 
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            '&:hover': { color: '#333' }
          }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
          Inicio
        </Link>
        <Typography sx={{ color: '#757575', fontSize: '14px' }}>/</Typography>
        <Link
          underline="none"
          sx={{ 
            color: '#757575', 
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            '&:hover': { color: '#333' }
          }}
          onClick={() => navigate('/procesos')}
        >
          Procesos
        </Link>
        <Typography sx={{ color: '#757575', fontSize: '14px' }}>/</Typography>
        <Typography sx={{ color: '#757575', fontSize: '14px', fontFamily: 'Roboto, sans-serif' }}>
          {workflowData.nombre || 'Permiso de Protección de Seguridad Humanitaria'}
        </Typography>
      </Box>

      {/* Título del Workflow - estilo Figma */}
      <Typography 
        sx={{ 
          fontWeight: 700, 
          color: '#333333',
          fontSize: '48px',
          fontFamily: 'Roboto Flex, Roboto, sans-serif',
          mb: 4,
          lineHeight: 1.5,
        }}
      >
        {workflowData.nombre || 'Permiso de Protección de Seguridad Humanitaria'}
      </Typography>

      {/* Tabs de navegación - estilo Figma */}
      <Box sx={{ bgcolor: '#f1f3f4', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(_event, newValue) => setCurrentTab(newValue)}
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
              py: 1,
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

      {/* Contenido del tab "General" - estilo Figma */}
      {currentTab === 0 && (
        <Box sx={{ maxWidth: 700 }}>
          {/* Campo: Nombre del proceso */}
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Nombre del proceso"
              value={workflowData.nombre}
              onChange={(e) => setWorkflowData({ ...workflowData, nombre: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  '& fieldset': {
                    borderColor: '#333333',
                  },
                  '&:hover fieldset': {
                    borderColor: '#333333',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#333333',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333',
                  backgroundColor: 'white',
                  px: 0.5,
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '16px',
                  color: '#333333',
                  py: 2,
                  px: 2,
                },
              }}
            />
            <Typography sx={{ 
              fontFamily: 'Roboto, sans-serif', 
              fontWeight: 300, 
              fontSize: '14px', 
              color: '#333333',
              mt: 0.5,
              px: 2,
            }}>
              Indicaciones extra
            </Typography>
          </Box>

          {/* Campo: Detalles del proceso */}
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Detalles del proceso"
              value={workflowData.descripcion}
              onChange={(e) => setWorkflowData({ ...workflowData, descripcion: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  '& fieldset': {
                    borderColor: '#333333',
                  },
                  '&:hover fieldset': {
                    borderColor: '#333333',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#333333',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333',
                  backgroundColor: 'white',
                  px: 0.5,
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '16px',
                  color: '#333333',
                  py: 2,
                  px: 2,
                },
              }}
            />
            <Typography sx={{ 
              fontFamily: 'Roboto, sans-serif', 
              fontWeight: 300, 
              fontSize: '14px', 
              color: '#333333',
              mt: 0.5,
              px: 2,
            }}>
              Indicaciones extra
            </Typography>
          </Box>

          {/* Campo: Estado del proceso (Switch) */}
          <Box sx={{ mb: 6 }}>
            <Typography sx={{ 
              fontFamily: 'Roboto, sans-serif', 
              fontWeight: 500, 
              fontSize: '14px', 
              color: '#333333',
              mb: 1,
              backgroundColor: 'white',
              display: 'inline-block',
              px: 0.5,
            }}>
              Estado del proceso
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={workflowData.activo ?? true}
                onChange={(e) => setWorkflowData({ ...workflowData, activo: e.target.checked })}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#0e5fa6',
                    '&:hover': {
                      backgroundColor: 'rgba(14, 95, 166, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#0e5fa6',
                  },
                }}
              />
              <Typography sx={{ 
                fontFamily: 'Roboto, sans-serif', 
                fontSize: '16px', 
                color: '#333333',
              }}>
                {workflowData.activo ? 'Activado' : 'Desactivado'}
              </Typography>
            </Box>
            <Typography sx={{ 
              fontFamily: 'Roboto, sans-serif', 
              fontWeight: 300, 
              fontSize: '14px', 
              color: '#333333',
              mt: 0.5,
              px: 2,
            }}>
              Indicaciones extra
            </Typography>
          </Box>

          {/* Botones - estilo Figma */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/procesos')}
              disabled={saving}
              sx={{
                textTransform: 'none',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                color: '#0e5fa6',
                borderColor: '#0e5fa6',
                borderRadius: '4px',
                px: 2,
                py: 1,
                '&:hover': {
                  borderColor: '#0e5fa6',
                  backgroundColor: 'rgba(14, 95, 166, 0.04)',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveWorkflow}
              disabled={saving}
              sx={{
                textTransform: 'none',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                backgroundColor: '#0e5fa6',
                borderRadius: '4px',
                px: 2,
                py: 1,
                '&:hover': {
                  backgroundColor: '#0a4a82',
                },
              }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Contenido del tab "Flujo" */}
      {currentTab === 1 && (
        <>
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
        {/* Filtro por perfil - esquina superior izquierda */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filterPerfil}
              onChange={(e) => setFilterPerfil(e.target.value)}
              displayEmpty
              sx={{
                bgcolor: 'white',
                border: '1px solid #788093',
                borderRadius: '4px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.75,
                  px: 1.5,
                  fontSize: 14,
                  color: '#333',
                },
              }}
              startAdornment={<PersonIcon sx={{ fontSize: 18, color: '#788093', mr: 1 }} />}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ciudadano">Ciudadano</MenuItem>
              <MenuItem value="funcionario">Funcionario</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="administrador">Administrador</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Barra de herramientas superior - centro */}
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

          {/* Botón de Ajustar Vista */}
          <IconButton
            size="small"
            onClick={() => fitView({ padding: 0.3, minZoom: 0.1, duration: 300 })}
            sx={{
              border: '1px solid #788093',
              borderRadius: '4px',
              bgcolor: 'white',
              p: 0.5,
            }}
            title="Ajustar vista a todos los nodos"
          >
            <FitScreenIcon sx={{ fontSize: 16, color: '#788093' }} />
          </IconButton>
        </Box>

        {/* Botones superiores derechos - Guardar e Imprimir */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveWorkflow}
            disabled={saving}
            startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              backgroundColor: '#0e5fa6',
              borderRadius: '4px',
              px: 2,
              py: 0.75,
              '&:hover': {
                backgroundColor: '#0a4a82',
              },
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <IconButton
            size="small"
            onClick={() => window.print()}
            sx={{
              border: '1px solid #788093',
              borderRadius: '4px',
              bgcolor: 'white',
              p: 0.75,
            }}
            title="Imprimir flujo"
          >
            <PrintIcon sx={{ fontSize: 18, color: '#788093' }} />
          </IconButton>
        </Box>

        {/* ReactFlow Canvas */}
        <ReactFlow
          nodes={filteredNodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              isLastNode: node.id === lastNodeId,
              showArrowAsDefault: !selectedNode && node.id === lastNodeId,
            }
          }))}
          edges={filteredEdges}
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
            type: 'straight',
            animated: false,
            style: { stroke: '#4d4d4d', strokeWidth: 2 },
          }}
          connectionLineType={ConnectionLineType.Straight}
          connectionLineStyle={{ stroke: '#4d4d4d', strokeWidth: 2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#e0e0e0" />
        </ReactFlow>
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

      {/* JSON Debug - Workflow Completo */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: '#1e1e1e',
          borderRadius: 1,
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#4ec9b0', 
            fontWeight: 'bold',
            display: 'block',
            mb: 1,
          }}
        >
          📋 JSON Debug - Workflow Completo:
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 0,
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '11px',
            lineHeight: 1.4,
            color: '#d4d4d4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {JSON.stringify({
            ...workflowData,
            etapas: nodes
              .filter(n => n.id !== 'placeholder-add-node')
              .map(n => ({
                id: n.id,
                ...n.data,
              }))
          }, null, 2)}
        </Box>
      </Box>
      </>
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
