import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

// Constantes de tamaño - deben coincidir con CustomNode.tsx
const NODE_CONTAINER_SIZE = 80; // Contenedor invisible para nodos circulares
const RECT_NODE_WIDTH = 200;    // Ancho estimado de nodos rectangulares
const RECT_NODE_HEIGHT = 80;    // Alto de nodos rectangulares
const PLACEHOLDER_WIDTH = 84;   // Ancho del placeholder

// Función para determinar si es un nodo circular (inicio/fin)
const isCircleNode = (node: Node): boolean => {
  const data = node.data;
  return data?.codigo === 'INICIO' || data?.es_inicial || data?.es_etapa_inicial ||
         data?.tipo_etapa === 'TERMINO' || data?.tipo_etapa === 'FIN' ||
         data?.codigo === 'FIN' || data?.codigo === 'TERMINO';
};

// Función para estimar las dimensiones de un nodo
const getNodeDimensions = (node: Node): { width: number; height: number } => {
  const data = node.data;
  
  // Nodo inicio/fin - usar el tamaño del contenedor invisible
  if (isCircleNode(node)) {
    return { width: NODE_CONTAINER_SIZE, height: NODE_CONTAINER_SIZE };
  }
  
  // Nodo placeholder
  if (data?.is_placeholder || !data?.nombre) {
    return { width: PLACEHOLDER_WIDTH, height: RECT_NODE_HEIGHT };
  }
  
  // Nodo rectangular - estimar ancho basado en el texto
  const nombre = data?.nombre || '';
  const nombreWidth = nombre.length * 7;
  const width = Math.max(RECT_NODE_WIDTH, nombreWidth + 56);
  
  return { width, height: RECT_NODE_HEIGHT };
};

/**
 * Aplica auto-layout usando dagre para posicionar los nodos
 * @param nodes - Lista de nodos de ReactFlow
 * @param edges - Lista de edges de ReactFlow
 * @param direction - Dirección del layout: 'LR' (izquierda-derecha) o 'TB' (arriba-abajo)
 * @returns Nodos y edges con posiciones actualizadas
 */
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
) => {
  // Crear un nuevo grafo dirigido
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configurar el grafo
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,     // Separación vertical entre nodos (en LR) o horizontal (en TB)
    ranksep: 80,     // Separación horizontal entre niveles (en LR) o vertical (en TB)
    edgesep: 20,     // Separación entre edges
    marginx: 50,     // Margen horizontal
    marginy: 50,     // Margen vertical
    acyclicer: 'greedy',
    ranker: 'network-simplex',
  });

  // Agregar nodos al grafo de dagre
  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  // Agregar edges al grafo de dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Ejecutar el algoritmo de layout
  dagre.layout(dagreGraph);

  // Actualizar las posiciones de los nodos
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);
    
    // Dagre devuelve el centro del nodo, ReactFlow necesita la esquina superior izquierda
    const x = nodeWithPosition.x - width / 2;
    const y = nodeWithPosition.y - height / 2;

    return {
      ...node,
      position: { x, y },
      // Configurar los handles según la dirección
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
};