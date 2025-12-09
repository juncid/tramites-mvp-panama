import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';

// URL base del API (sin /api/v1)
const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface ArchivoOpciones {
  archivo_url?: string;
  nombre_archivo?: string;
  tipo_archivo?: string;
}

interface DescargaArchivoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (descargado: boolean) => void;
}

export const DescargaArchivoView: React.FC<DescargaArchivoViewProps> = ({
  pregunta,
  onAnswerChange,
}) => {
  // Parsear opciones para obtener la URL del archivo
  const getArchivoOpciones = (): ArchivoOpciones => {
    if (!pregunta.opciones) return {};
    
    if (typeof pregunta.opciones === 'string') {
      try {
        return JSON.parse(pregunta.opciones);
      } catch {
        return {};
      }
    }
    
    return pregunta.opciones as ArchivoOpciones;
  };

  const opciones = getArchivoOpciones();
  const archivoUrl = opciones.archivo_url;
  const nombreArchivo = opciones.nombre_archivo || 'Documento';
  
  const handleDescargar = () => {
    if (archivoUrl) {
      // Construir URL completa
      const urlCompleta = archivoUrl.startsWith('http') ? archivoUrl : `${API_URL}${archivoUrl}`;
      
      // Abrir en nueva pestaña para descargar
      window.open(urlCompleta, '_blank');
      
      // Notificar que se descargó
      onAnswerChange?.(true);
    } else {
      console.warn('No hay URL de archivo configurada para esta pregunta');
    }
  };

  return (
    <Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 500, 
          mb: 2, 
          color: '#333',
        }}
      >
        {pregunta.pregunta}
        {pregunta.es_obligatoria && (
          <Typography component="span" sx={{ color: '#DC2626', ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>

      {pregunta.texto_ayuda && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {pregunta.texto_ayuda}
        </Alert>
      )}

      {!archivoUrl ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No hay archivo configurado para descargar. Contacte al administrador.
        </Alert>
      ) : (
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDescargar}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0e5fa6',
            '&:hover': { backgroundColor: '#0d5391' },
          }}
        >
          {nombreArchivo}
        </Button>
      )}
    </Box>
  );
};
