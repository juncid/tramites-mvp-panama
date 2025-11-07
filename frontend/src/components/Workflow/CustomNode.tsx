import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { WorkflowEtapa } from '../../types/workflow';

export const CustomNode: React.FC<NodeProps<WorkflowEtapa>> = ({ data }) => {
  const isInicio = data.es_inicial || data.es_etapa_inicial;
  const isPlaceholder = (data as any).is_placeholder || !data.nombre;
  
  const getNodeColor = () => {
    switch (data.tipo_etapa) {
      case 'ETAPA':
        return '#e3f2fd';
      case 'COMPUERTA':
        return '#fff3e0';
      case 'SUBPROCESO':
        return '#f3e5f5';
      default:
        return '#f5f5f5';
    }
  };

  const getNodeBorderColor = () => {
    switch (data.tipo_etapa) {
      case 'ETAPA':
        return '#1976d2';
      case 'COMPUERTA':
        return '#f57c00';
      case 'SUBPROCESO':
        return '#7b1fa2';
      default:
        return '#757575';
    }
  };

  // Nodo circular para inicio
  if (isInicio) {
    return (
      <>
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#22C55E',
            border: '3px solid #16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          <Typography variant="caption" fontWeight="bold" color="white" align="center">
            Inicio
          </Typography>
        </Box>
        <Handle type="source" position={Position.Right} />
      </>
    );
  }

  // Nodo placeholder con borde punteado
  if (isPlaceholder) {
    return (
      <>
        <Handle type="target" position={Position.Left} />
        <Paper
          elevation={0}
          sx={{
            padding: 2,
            minWidth: 180,
            maxWidth: 250,
            backgroundColor: '#f1f3f4',
            border: '2px dashed #03689a',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 110,
            '&:hover': {
              borderColor: '#03689a',
              backgroundColor: '#e8f4f8',
            },
          }}
        >
          <Box sx={{ textAlign: 'center', color: '#03689a' }}>
            <AddIcon sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="caption" display="block" color="#03689a">
              Haz clic para configurar
            </Typography>
          </Box>
        </Paper>
        <Handle type="source" position={Position.Right} />
      </>
    );
  }

  // Nodo rectangular para etapas normales
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Paper
        elevation={2}
        sx={{
          padding: 2,
          minWidth: 180,
          maxWidth: 250,
          backgroundColor: getNodeColor(),
          border: `2px solid ${getNodeBorderColor()}`,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {data.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.codigo}
          </Typography>
          {data.perfiles_permitidos && data.perfiles_permitidos.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {data.perfiles_permitidos.map((perfil) => (
                <Chip
                  key={perfil}
                  label={perfil}
                  size="small"
                  sx={{ fontSize: '0.65rem', height: 18, mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default CustomNode;
