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

interface DatosSolicitante {
  pasaporte?: string;
  nacionalidad?: string;
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  id_solicitud?: number;
  tipo_solicitud?: string;
  num_expediente?: string;
  sexo?: string;
  foto_url?: string | null;
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
  datosSolicitante?: DatosSolicitante;
  nombreWorkflow?: string;
}

export const DatosCasoView: React.FC<DatosCasoViewProps> = ({
  pregunta,
  onAnswerChange,
  value,
  metadataInstancia,
  datosSolicitante,
  nombreWorkflow,
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

  // Construir datos del caso desde metadata_instancia y datos_solicitante
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
      
      // Obtener valor según el campo solicitado
      let valor = '-';
      
      // Campos especiales
      if (keyLower === 'tramite') {
        // Usar el nombre del workflow (proceso)
        valor = nombreWorkflow || '-';
      } else if (keyLower === 'sexo') {
        // Obtener de datosSolicitante (viene del formulario inicial)
        valor = datosSolicitante?.sexo || '-';
      } else if (keyLower === 'nombres_completos' || keyLower === 'nombre') {
        // Combinar nombres y apellidos de datosSolicitante o usar metadataInstancia
        if (datosSolicitante?.nombres && datosSolicitante?.apellidos) {
          valor = `${datosSolicitante.nombres} ${datosSolicitante.apellidos}`;
        } else if (metadataInstancia?.nombres_completos) {
          valor = metadataInstancia.nombres_completos;
        }
      } else if (keyLower === 'pasaporte') {
        valor = datosSolicitante?.pasaporte || metadataInstancia?.pasaporte || '-';
      } else if (keyLower === 'nacionalidad') {
        valor = datosSolicitante?.nacionalidad || metadataInstancia?.nacionalidad || '-';
      } else if (keyLower === 'fecha_nacimiento') {
        valor = datosSolicitante?.fecha_nacimiento || '-';
      } else {
        // Buscar en metadataInstancia o datosSolicitante
        valor = metadataInstancia?.[keyLower] || 
                metadataInstancia?.[campoKey] || 
                datosSolicitante?.[keyLower] ||
                datosSolicitante?.[campoKey] ||
                '-';
      }
      
      datos[label] = String(valor);
    });

    return datos;
  }, [metadataInstancia, datosSolicitante, nombreWorkflow, pregunta.campos_caso, value]);

  // Notificar el valor solo una vez cuando los datos del caso estén listos
  useEffect(() => {
    // Solo notificar si:
    // 1. Hay datos y onAnswerChange está disponible
    // 2. No hemos notificado aún O el valor ha cambiado
    const currentValueStr = JSON.stringify(datosCaso);
    
    if (onAnswerChange && Object.keys(datosCaso).length > 0) {
      if (!hasNotified.current || lastNotifiedValue.current !== currentValueStr) {
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
