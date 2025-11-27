import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { 
  Add as AddIcon, 
  AutoAwesome as AutoAwesomeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckBox as CheckBoxIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import type { WorkflowEtapa } from '../../types/workflow';
import { vistaConfigService } from '../../services/vista-config.service';

// Estilos comunes para los handles
const handleStyle = { 
  background: '#4d4d4d', 
  border: 'none',
  width: 8,
  height: 8,
};

// Tamaño del círculo para nodos de inicio/fin
const CIRCLE_SIZE = 32;

export const CustomNode: React.FC<NodeProps<WorkflowEtapa>> = ({ data, selected }) => {
  // Nodo de Inicio: solo cuando es explícitamente el nodo inicial (código INICIO o flag es_inicial)
  const isInicio = data.codigo === 'INICIO' || data.es_inicial || data.es_etapa_inicial;
  
  // Verificar si debe mostrar la flecha (seleccionado O es último nodo sin selección)
  const showArrow = selected || (data as any).showArrowAsDefault;
  
  // Nodo de Fin/Término: solo cuando es un nodo de terminación visual (tipo TERMINO/FIN), 
  // NO cuando es simplemente la última etapa del flujo (es_etapa_final)
  const isFin = data.tipo_etapa === 'TERMINO' || data.tipo_etapa === 'FIN' || data.codigo === 'FIN' || data.codigo === 'TERMINO';
  
  const isPlaceholder = (data as any).is_placeholder || !data.nombre;
  const [tieneVistaDinamica, setTieneVistaDinamica] = useState(false);
  
  // Verificar si existe configuración de vista dinámica
  useEffect(() => {
    const checkVistaConfig = async () => {
      if (data.id && !isInicio && !isFin && !isPlaceholder) {
        try {
          const resultado = await vistaConfigService.checkExists(data.id);
          setTieneVistaDinamica(resultado.existe);
        } catch {
          setTieneVistaDinamica(false);
        }
      }
    };

    checkVistaConfig();
  }, [data.id, isInicio, isFin, isPlaceholder]);
  
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

  // Nodo circular para inicio - según diseño Figma
  // El círculo debe estar alineado verticalmente con el centro de los nodos rectangulares
  if (isInicio) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Flecha indicadora de nodo seleccionado - posición absoluta */}
        {showArrow && (
          <ArrowDropDownIcon 
            sx={{ 
              fontSize: 64, 
              color: '#03689a',
              position: 'absolute',
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
            }} 
          />
        )}
        
        {/* Contenedor principal con handles */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            height: 80,
            paddingRight: '13px', // Espacio entre círculo y línea (8px + 5px extra)
            marginTop: '10px', // Bajar el círculo para centrarlo mejor
          }}
        >
          {/* Handle izquierdo (invisible) */}
          <Handle 
            type="target" 
            position={Position.Left} 
            style={{ 
              ...handleStyle, 
              opacity: 0,
              left: 0,
            }} 
          />
          
          {/* Círculo verde lima - según Figma */}
          <Box
            sx={{
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #d4ed6e 0%, #aed547 100%)',
              border: showArrow ? '2px solid #03689a' : '2px solid #7cb342',
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          />
          
          {/* Handle derecho (para conexiones salientes) */}
          <Handle 
            type="source" 
            position={Position.Right} 
            style={{
              ...handleStyle,
              right: 0,
            }}
          />
        </Box>
        
        {/* Texto debajo - según Figma */}
        <Typography 
          sx={{ 
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#4d4d4d',
          }}
        >
          Inicio
        </Typography>
      </Box>
    );
  }

  // Nodo circular para fin - simplificado sin contenedor invisible
  if (isFin) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Flecha indicadora de nodo seleccionado - posición absoluta */}
        {showArrow && (
          <ArrowDropDownIcon 
            sx={{ 
              fontSize: 64, 
              color: '#03689a',
              position: 'absolute',
              top: -48,
              left: '50%',
              transform: 'translateX(-50%)',
            }} 
          />
        )}
        
        {/* Círculo rojo con handles */}
        <Box
          sx={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: '50%',
            backgroundColor: '#f44336',
            border: showArrow ? '2px solid #03689a' : 'none',
            position: 'relative',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          {/* Handle izquierdo (para conexiones entrantes) */}
          <Handle 
            type="target" 
            position={Position.Left} 
            style={handleStyle}
          />
          
          {/* Handle derecho (invisible, no debería tener conexiones salientes) */}
          <Handle 
            type="source" 
            position={Position.Right} 
            style={{ 
              ...handleStyle, 
              opacity: 0,
            }} 
          />
        </Box>
        
        {/* Texto debajo del círculo */}
        <Typography 
          sx={{ 
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#4d4d4d',
            mt: 0.5,
          }}
        >
          Fin
        </Typography>
      </Box>
    );
  }

  // Nodo placeholder con borde punteado - estilo Figma
  if (isPlaceholder) {
    return (
      <>
        <Handle type="target" position={Position.Left} style={handleStyle} />
        <Paper
          elevation={0}
          sx={{
            padding: 2,
            minWidth: 80,
            height: 80,
            backgroundColor: '#f1f3f4',
            border: '2px dashed #788093',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              borderColor: '#5f6368',
              backgroundColor: '#e8eaed',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 32, color: '#788093' }} />
        </Paper>
        <Handle type="source" position={Position.Right} style={handleStyle} />
      </>
    );
  }

  // Determinar tamaño según tipo de etapa
  const isSubproceso = data.tipo_etapa === 'SUBPROCESO';
  const isPresencial = data.tipo_etapa === 'PRESENCIAL';
  
  // Nodo rectangular para etapas normales
  // Determinar si tiene preguntas o formulario
  const tienePreguntas = data.preguntas && data.preguntas.length > 0;
  const isCompuerta = data.tipo_etapa === 'COMPUERTA';
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Flecha indicadora de nodo seleccionado o último nodo por defecto - posición absoluta */}
      {showArrow && (
        <ArrowDropDownIcon 
          sx={{ 
            fontSize: 64, 
            color: '#03689a',
            position: 'absolute',
            top: -48,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }} 
        />
      )}
      
      <Box sx={{ position: 'relative' }}>
        <Handle type="target" position={Position.Left} style={handleStyle} />
        <Paper
          elevation={0}
          sx={{
            padding: 1,
            paddingRight: 3, // Espacio extra para los íconos
            backgroundColor: getNodeColor(),
            border: `2px ${getNodeBorderStyle()} ${showArrow ? '#03689a' : getNodeBorderColor()}`,
            borderRadius: 1,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            whiteSpace: 'nowrap', // Evitar wrap del texto
          '&:hover': {
            opacity: 0.95,
          },
        }}
      >
        {/* Íconos superiores estilo Figma */}
        <Box sx={{ 
          position: 'absolute', 
          top: 6, 
          right: 6, 
          display: 'flex', 
          gap: 0.5,
        }}>
          {/* Ícono de persona si tiene perfiles */}
          {data.perfiles_permitidos && data.perfiles_permitidos.length > 0 && (
            <PersonIcon sx={{ fontSize: 14, color: '#666' }} />
          )}
          {/* Ícono de documento/formulario si tiene preguntas o para compuertas */}
          {(tienePreguntas || isCompuerta) && (
            <DescriptionIcon sx={{ fontSize: 14, color: '#666' }} />
          )}
        </Box>

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
      <Handle type="source" position={Position.Right} style={{ background: '#4d4d4d', border: 'none' }} />
      </Box>
    </Box>
  );
};

export default CustomNode;
