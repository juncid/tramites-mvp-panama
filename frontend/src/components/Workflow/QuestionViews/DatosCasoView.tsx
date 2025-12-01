import React, { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';

interface MetadataInstancia {
  id_solicitud?: number;
  pasaporte?: string;
  tipo_acceso?: string;
  email?: string;
  nombres_completos?: string;
  nacionalidad?: string;
  tramite?: string;
  [key: string]: any;
}

interface DatosCasoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (datos: any) => void;
  instanciaId?: number;
  compact?: boolean;
  value?: Record<string, string>;
  metadataInstancia?: MetadataInstancia;
}

export const DatosCasoView: React.FC<DatosCasoViewProps> = ({
  pregunta,
  onAnswerChange,
  value,
  metadataInstancia,
}) => {
  // Ref para evitar notificaciones duplicadas
  const hasNotified = useRef(false);
  const lastNotifiedValue = useRef<string>('');

  // Mapeo de campos de metadata a nombres legibles
  const mapeoLabels: Record<string, string> = {
    'nombres_completos': 'Nombre',
    'nombre': 'Nombre',
    'nacionalidad': 'Nacionalidad',
    'tramite': 'Trámite',
    'pasaporte': 'Pasaporte',
    'email': 'Email',
    'id_solicitud': 'N° Solicitud',
    'sexo': 'Sexo',
    'fecha_nacimiento': 'Fecha de Nacimiento',
    'telefono': 'Teléfono',
    'direccion': 'Dirección',
  };

  // Construir datos del caso desde metadata_instancia
  const datosCaso: Record<string, string> = useMemo(() => {
    if (value && Object.keys(value).length > 0) {
      return value;
    }

    // Obtener campos configurados - SIEMPRE usar los de la configuración, sin predeterminados
    const camposConfig = pregunta.campos_caso || (pregunta as any).opciones_datos_caso || [];
    
    // Si no hay campos configurados, retornar vacío (no mostrar nada)
    if (!camposConfig || camposConfig.length === 0) {
      return {};
    }

    const datos: Record<string, string> = {};
    camposConfig.forEach((campoKey: string) => {
      const keyLower = campoKey.toLowerCase();
      const label = mapeoLabels[keyLower] || campoKey;
      // Obtener valor de metadataInstancia si existe, sino mostrar '-'
      const valor = metadataInstancia 
        ? (metadataInstancia[keyLower] || metadataInstancia[campoKey] || '-')
        : '-';
      datos[label] = String(valor);
    });

    return datos;
  }, [metadataInstancia, pregunta.campos_caso, value]);

  // Notificar el valor solo una vez cuando los datos del caso estén listos
  useEffect(() => {
    // Solo notificar si:
    // 1. Hay datos y onAnswerChange está disponible
    // 2. No hemos notificado aún O el valor ha cambiado
    const currentValueStr = JSON.stringify(datosCaso);
    
    if (onAnswerChange && Object.keys(datosCaso).length > 0) {
      if (!hasNotified.current || lastNotifiedValue.current !== currentValueStr) {
        console.log('[DatosCasoView] Notificando valor:', datosCaso);
        onAnswerChange(datosCaso);
        hasNotified.current = true;
        lastNotifiedValue.current = currentValueStr;
      }
    }
  }, [datosCaso, onAnswerChange]);

  // Usar los campos del datosCaso construido
  const camposMostrar = Object.keys(datosCaso);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Título "Data del caso" */}
      <Typography 
        sx={{ 
          fontWeight: 500,
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#333333',
          mb: 2,
        }}
      >
        {pregunta.pregunta}
      </Typography>

      {/* Campos en formato: Label bold: Valor */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {camposMostrar.map((campo) => (
          <Typography 
            key={campo}
            sx={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              lineHeight: 1.5,
              color: '#4d4d4d',
            }}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              {campo}:
            </Box>
            {' '}{datosCaso[campo] || '-'}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
