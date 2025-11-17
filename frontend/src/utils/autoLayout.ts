import { Node, Edge } from 'reactflow';

// Algoritmo simple de layout horizontal sin dependencias externas
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR' // LR = Left to Right, TB = Top to Bottom
) => {
  const horizontalSpacing = 350;
  const verticalSpacing = 50;
  const nodeHeight = 110;
  const startNodeHeight = 80; // Altura del nodo circular de inicio en el editor
  
  // Crear mapa de conexiones (source -> targets)
  const connectionMap = new Map<string, string[]>();
  edges.forEach(edge => {
    if (!connectionMap.has(edge.source)) {
      connectionMap.set(edge.source, []);
    }
    connectionMap.get(edge.source)?.push(edge.target);
  });
  
  // Encontrar nodo inicial (sin conexiones entrantes)
  const targetNodes = new Set(edges.map(e => e.target));
  const startNodes = nodes.filter(node => !targetNodes.has(node.id));
  
  // Organizar nodos por niveles (BFS)
  const levels: string[][] = [];
  const visited = new Set<string>();
  const queue: Array<{ id: string; level: number }> = [];
  
  // Iniciar con nodos de inicio
  startNodes.forEach(node => {
    queue.push({ id: node.id, level: 0 });
    visited.add(node.id);
  });
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    
    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(id);
    
    // Agregar nodos conectados al siguiente nivel
    const targets = connectionMap.get(id) || [];
    targets.forEach(targetId => {
      if (!visited.has(targetId)) {
        visited.add(targetId);
        queue.push({ id: targetId, level: level + 1 });
      }
    });
  }
  
  // Calcular altura total necesaria para el nivel más grande
  const maxNodesInLevel = Math.max(...levels.map(level => level.length));
  const totalHeight = (maxNodesInLevel - 1) * (nodeHeight + verticalSpacing);
  
  // Posicionar nodos
  const layoutedNodes = nodes.map(node => {
    // Encontrar el nivel del nodo
    let nodeLevel = 0;
    let indexInLevel = 0;
    
    for (let i = 0; i < levels.length; i++) {
      const index = levels[i].indexOf(node.id);
      if (index !== -1) {
        nodeLevel = i;
        indexInLevel = index;
        break;
      }
    }
    
    const nodesInLevel = levels[nodeLevel]?.length || 1;
    
    // Determinar si es nodo de inicio o fin (ambos circulares de 80x80)
    const isStartNode = node.data?.codigo === 'INICIO' || 
                       node.data?.es_inicial || 
                       node.data?.es_etapa_inicial ||
                       node.id === 'start' || 
                       startNodes.some(n => n.id === node.id);
    
    const isFinNode = node.data?.codigo === 'FIN' || 
                     node.data?.tipo_etapa === 'FIN' ||
                     node.data?.es_final;
    
    // Calcular posición según dirección
    let x: number;
    let y: number;
    
    if (direction === 'LR') {
      // Horizontal: izquierda a derecha
      x = nodeLevel * horizontalSpacing + 50; // +50 margen inicial
      
      // Centrar verticalmente los nodos del mismo nivel
      const levelHeight = (nodesInLevel - 1) * (nodeHeight + verticalSpacing);
      const startY = (totalHeight - levelHeight) / 2 + 100; // +100 margen superior
      const baseY = startY + indexInLevel * (nodeHeight + verticalSpacing);
      
      // Ajustar Y para nodo de inicio o fin (centrar el círculo con los rectángulos)
      if (isStartNode || isFinNode) {
        // Los nodos circulares (80x80) deben estar centrados con los rectangulares (220x110)
        // Centrar basándose en el centro vertical de ambos
        y = baseY + (nodeHeight - startNodeHeight) / 2;
      } else {
        y = baseY;
      }
    } else {
      // Vertical: arriba a abajo
      y = nodeLevel * verticalSpacing;
      const totalWidth = (nodesInLevel - 1) * horizontalSpacing;
      const startX = -totalWidth / 2;
      x = startX + indexInLevel * horizontalSpacing;
    }
    
    return {
      ...node,
      position: { x, y },
    };
  });
  
  return { nodes: layoutedNodes, edges };
};
