import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography } from '@mui/material';
import {
  Person as PersonIcon,
  Description as FormIcon,
} from '@mui/icons-material';
import type { WorkflowEtapa } from '../../types/workflow';

const CustomNodeViewer: React.FC<NodeProps> = ({ data }) => {
  // Convertir data al tipo correcto
  const etapa = data as WorkflowEtapa & { isReadOnly?: boolean; tipo?: string; es_decision?: boolean; es_final?: boolean };

  // Detectar nodo de inicio y fin
  const esInicio = etapa.tipo === 'INICIO' || etapa.codigo === 'INICIO';
  const esFin = etapa.tipo === 'FIN' || etapa.codigo === 'FIN' || etapa.es_final;
  
  // Determinar si es nodo de decisión (pregunta)
  const esDecision = etapa.tipo === 'DECISION' || etapa.es_decision || (etapa.preguntas && etapa.preguntas.length > 0);
  
  // Determinar color de fondo y borde según tipo
  const getBgColor = () => {
    if (esInicio) return '#4caf50'; // Verde para inicio
    if (esDecision) return '#ffffcc'; // Amarillo claro para decisión
    return 'white';
  };
  
  const getBorderColor = () => {
    if (esInicio) return '#4caf50';
    if (esDecision) return '#a7a71f'; // Amarillo-verde para decisión
    return '#4d4d4d';
  };

  // Obtener perfiles permitidos (chips)
  const perfiles = etapa.perfiles_permitidos || [];
  
  // Mapeo de iconos según perfil
  const getPerfilIcon = () => {
    // Todos los perfiles usan el icono de persona
    return <PersonIcon sx={{ fontSize: 14, color: '#4caf50' }} />;
  };

  // Para nodo de inicio (círculo verde)
  if (esInicio) {
    return (
      <>
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#4d4d4d', border: 'none' }}
        />
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
              bgcolor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <Typography
            sx={{
              fontSize: '16px',
              color: '#4d4d4d',
              fontFamily: 'Roboto',
              fontWeight: 400,
              lineHeight: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            Inicio
          </Typography>
        </Box>
      </>
    );
  }

  // Para nodo de fin (círculo rojo simple igual que inicio)
  if (esFin) {
    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#4d4d4d', border: 'none' }}
        />
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
              bgcolor: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <Typography
            sx={{
              fontSize: '16px',
              color: '#4d4d4d',
              fontFamily: 'Roboto',
              fontWeight: 400,
              lineHeight: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            Fin
          </Typography>
        </Box>
      </>
    );
  }

  // Para nodos normales y de decisión
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#4d4d4d', border: 'none' }}
      />
      <Box
        sx={{
          width: 220,
          minHeight: 110,
          bgcolor: getBgColor(),
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '4px',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Iconos de perfiles en la parte superior */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            alignItems: 'center',
            alignSelf: 'flex-start',
            width: '100%',
          }}
        >
          {perfiles.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                bgcolor: '#e1fcef',
                borderRadius: '16px',
                px: 0.5,
                py: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {getPerfilIcon()}
              {/* Si tiene preguntas, mostrar icono de formulario */}
              {etapa.preguntas && etapa.preguntas.length > 0 && (
                <FormIcon sx={{ fontSize: 14, color: '#4caf50' }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Texto de la etapa */}
        <Typography
          sx={{
            fontSize: '16px',
            color: '#4d4d4d',
            fontFamily: 'Roboto',
            fontWeight: 400,
            lineHeight: 1.5,
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            whiteSpace: 'pre-wrap',
          }}
        >
          {etapa.nombre}
        </Typography>
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#4d4d4d', border: 'none' }}
      />
    </>
  );
};

export default CustomNodeViewer;
