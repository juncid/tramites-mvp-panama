import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { Add as AddIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import type { WorkflowEtapa } from '../../types/workflow';
import { vistaConfigService } from '../../services/vista-config.service';

export const CustomNode: React.FC<NodeProps<WorkflowEtapa>> = ({ data }) => {
  const isInicio = data.codigo === 'INICIO' || data.es_inicial || data.es_etapa_inicial;
  const isPlaceholder = (data as any).is_placeholder || !data.nombre;
  const [tieneVistaDinamica, setTieneVistaDinamica] = useState(false);
  
  // Debug: Log cuando cambian los datos importantes del nodo
  useEffect(() => {
    console.log('🔄 CustomNode actualizado:', {
      codigo: data.codigo,
      nombre: data.nombre,
      tipo_etapa: data.tipo_etapa,
      perfiles: data.perfiles_permitidos
    });
  }, [data.codigo, data.nombre, data.tipo_etapa, data.perfiles_permitidos]);
  
  // Verificar si existe configuración de vista dinámica
  useEffect(() => {
    const checkVistaConfig = async () => {
      if (data.id && !isInicio && !isPlaceholder) {
        try {
          const resultado = await vistaConfigService.checkExists(data.id);
          setTieneVistaDinamica(resultado.existe);
        } catch {
          setTieneVistaDinamica(false);
        }
      }
    };

    checkVistaConfig();
  }, [data.id, isInicio, isPlaceholder]);
  
  const getNodeColor = () => {
    switch (data.tipo_etapa) {
      case 'ETAPA':
        return '#e3f2fd';
      case 'COMPUERTA':
        return '#FFFFCC';
      case 'SUBPROCESO':
        return '#f3e5f5';
      case 'PRESENCIAL':
        return '#f1f3f4';
      default:
        return '#f5f5f5';
    }
  };

  const getNodeBorderColor = () => {
    switch (data.tipo_etapa) {
      case 'ETAPA':
        return '#1976d2';
      case 'COMPUERTA':
        return '#A7A71F';
      case 'SUBPROCESO':
        return '#7b1fa2';
      case 'PRESENCIAL':
        return '#000000';
      default:
        return '#757575';
    }
  };
  
  const getNodeBorderStyle = () => {
    return data.tipo_etapa === 'PRESENCIAL' ? 'dashed' : 'solid';
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

  // Determinar tamaño según tipo de etapa
  const isSubproceso = data.tipo_etapa === 'SUBPROCESO';
  const isPresencial = data.tipo_etapa === 'PRESENCIAL';
  const nodeWidth = (isSubproceso || isPresencial) ? 220 : 250;
  
  // Nodo rectangular para etapas normales
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Paper
        elevation={2}
        sx={{
          padding: 2,
          minWidth: nodeWidth,
          maxWidth: nodeWidth,
          width: nodeWidth,
          backgroundColor: getNodeColor(),
          border: `2px ${getNodeBorderStyle()} ${getNodeBorderColor()}`,
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        <Box>
          {/* Badges superiores para SUBPROCESO y PRESENCIAL */}
          {(isSubproceso || isPresencial) && data.perfiles_permitidos && data.perfiles_permitidos.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
              {data.perfiles_permitidos.slice(0, 2).map((perfil) => (
                <Chip
                  key={perfil}
                  label={perfil.charAt(0)}
                  size="small"
                  sx={{ 
                    fontSize: '0.65rem', 
                    height: 18, 
                    minWidth: 18,
                    bgcolor: isPresencial ? '#fce1e1' : '#e1fcef',
                    color: isPresencial ? '#b71c1c' : '#1b5e20',
                    '& .MuiChip-label': {
                      px: 0.5
                    }
                  }}
                />
              ))}
            </Box>
          )}
          
          <Typography 
            variant={(isSubproceso || isPresencial) ? "caption" : "subtitle2"} 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              fontSize: (isSubproceso || isPresencial) ? '0.875rem' : undefined,
              lineHeight: (isSubproceso || isPresencial) ? 1.5 : undefined 
            }}
          >
            {data.nombre}
          </Typography>
          
          {!isSubproceso && !isPresencial && (
            <Typography variant="caption" color="text.secondary">
              {data.codigo}
            </Typography>
          )}
          
          {/* Badge de Vista Dinámica */}
          {tieneVistaDinamica && !isSubproceso && !isPresencial && (
            <Box sx={{ mt: 1 }}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: '0.9rem' }} />}
                label="Vista Dinámica"
                size="small"
                color="primary"
                sx={{ 
                  fontSize: '0.65rem', 
                  height: 20, 
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    marginLeft: '4px'
                  }
                }}
              />
            </Box>
          )}
          
          {/* Perfiles para etapas normales (no SUBPROCESO ni PRESENCIAL) */}
          {!isSubproceso && !isPresencial && data.perfiles_permitidos && data.perfiles_permitidos.length > 0 && (
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
