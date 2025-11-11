import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

interface StepNodeData {
  label: string;
  hasPerson?: boolean;
  hasForm?: boolean;
  type?: string;
}

// Componente para nodo personalizado de inicio
const StartNode = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.25,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: '#9ACD32', // Verde lima
          border: '2px solid #7CB342',
        }}
      />
      <Typography
        sx={{
          fontSize: 16,
          color: '#4d4d4d',
          textAlign: 'center',
        }}
      >
        Inicio
      </Typography>
    </Box>
  );
};

// Componente para nodo de etapa personalizado
const StepNode = ({ data }: NodeProps<StepNodeData>) => {
  const isDecision = data.type === 'decision';
  
  return (
    <Box
      sx={{
        width: 220,
        minHeight: 110,
        backgroundColor: isDecision ? '#ffffcc' : '#fff',
        border: `2px solid ${isDecision ? '#a7a71f' : '#4d4d4d'}`,
        borderRadius: '4px',
        padding: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Badges */}
      <Box sx={{ display: 'flex', gap: 1.25, width: '100%' }}>
        {data.hasPerson && (
          <Box
            sx={{
              backgroundColor: '#e1fcef',
              borderRadius: '16px',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 14, color: '#40775f' }} />
          </Box>
        )}
        {data.hasForm && (
          <Box
            sx={{
              backgroundColor: '#e1fcef',
              borderRadius: '16px',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 14, color: '#40775f' }} />
          </Box>
        )}
      </Box>
      
      {/* Texto del nodo */}
      <Typography
        sx={{
          fontSize: 16,
          color: '#4d4d4d',
          textAlign: 'center',
          lineHeight: 1.5,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {data.label}
      </Typography>
    </Box>
  );
};

const nodeTypes = {
  startNode: StartNode,
  stepNode: StepNode,
};

const initialNodes: Node<StepNodeData>[] = [
  {
    id: '1',
    type: 'startNode',
    position: { x: 40, y: 314 },
    data: { label: 'Inicio' },
  },
  {
    id: '2',
    type: 'stepNode',
    position: { x: 147, y: 275 },
    data: {
      label: 'Asesorar al ciudadano sobre el trámite ppsh',
      hasPerson: true,
      hasForm: false,
    },
  },
  {
    id: '3',
    type: 'stepNode',
    position: { x: 421, y: 275 },
    data: {
      label: 'Recolectar requisitos del trámite PPSH y crear RUEX (en caso que no lo tenga)',
      hasPerson: true,
      hasForm: true,
    },
  },
  {
    id: '4',
    type: 'stepNode',
    position: { x: 689, y: 275 },
    data: {
      label: 'Solicitar cita por medio de la página web de Migración',
      hasPerson: true,
      hasForm: false,
    },
  },
  {
    id: '5',
    type: 'stepNode',
    position: { x: 967, y: 275 },
    data: {
      label: '¿ Mayor de 18 años?',
      hasPerson: true,
      hasForm: true,
      type: 'decision',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'default',
    animated: false,
    style: { stroke: '#4d4d4d', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#4d4d4d',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'default',
    animated: false,
    style: { stroke: '#4d4d4d', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#4d4d4d',
    },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'default',
    animated: false,
    style: { stroke: '#4d4d4d', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#4d4d4d',
    },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    type: 'default',
    animated: false,
    style: { stroke: '#4d4d4d', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#4d4d4d',
    },
  },
];

export const TestVisa: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Título */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#333333',
            fontSize: '48px',
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          Permiso de Protección de Seguridad Humanitaria
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 1, backgroundColor: '#f1f3f4', mb: 3 }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              minWidth: 120,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography sx={{ fontSize: 16, color: '#4d4d4d' }}>General</Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              minWidth: 120,
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Typography sx={{ fontSize: 16, color: '#0e5fa6', fontWeight: 500 }}>
              Flujo
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 4,
                backgroundColor: '#0e5fa6',
                borderRadius: '4px 4px 0 0',
              }}
            />
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              minWidth: 120,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography sx={{ fontSize: 16, color: '#4d4d4d' }}>Estado</Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              minWidth: 120,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography sx={{ fontSize: 16, color: '#4d4d4d' }}>Historial</Typography>
          </Box>
        </Box>
      </Box>

      {/* Canvas de ReactFlow */}
      <Box
        sx={{
          flexGrow: 1,
          border: '1px solid #333333',
          borderRadius: '4px',
          mx: 3,
          mb: 3,
          position: 'relative',
          backgroundColor: '#fff',
        }}
      >
        {/* Barra de herramientas superior */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Filtro izquierdo */}
          <Box
            sx={{
              pointerEvents: 'auto',
              backgroundColor: '#fff',
              border: '1px solid #788093',
              borderRadius: '4px',
              px: 1,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 206,
              height: 24,
            }}
          >
            <PersonIcon sx={{ fontSize: 20, color: '#788093' }} />
            <Typography sx={{ fontSize: 14, color: '#788093' }}>Todos</Typography>
          </Box>

          {/* Espacio central */}
          <Box />

          {/* Botón de imprimir derecho */}
          <IconButton
            size="small"
            sx={{
              pointerEvents: 'auto',
              border: '1px solid #788093',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: '#fff',
            }}
          >
            <PrintIcon sx={{ fontSize: 16, color: '#788093' }} />
          </IconButton>
        </Box>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ backgroundColor: '#fafafa' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#e5e5e5" />
        </ReactFlow>
      </Box>
    </Box>
  );
};
