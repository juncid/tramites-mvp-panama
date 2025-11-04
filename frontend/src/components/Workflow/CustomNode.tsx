import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Chip } from '@mui/material';
import type { WorkflowEtapa } from '../../types/workflow';

export const CustomNode: React.FC<NodeProps<WorkflowEtapa>> = ({ data }) => {
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

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper
        elevation={2}
        sx={{
          padding: 2,
          minWidth: 180,
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
          {data.es_inicial && (
            <Chip
              label="Inicio"
              size="small"
              color="primary"
              sx={{ mb: 1, fontSize: '0.7rem', height: 20 }}
            />
          )}
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
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default CustomNode;
