import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { apiClient } from '../../../services/api';

interface RevisionManualDocumentosViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: any) => void;
  instanciaId?: number;
  value?: string;
}

interface Documento {
  id: string;
  name: string;
  url?: string;
}

interface DocumentosResponse {
  instancia_id: number;
  etapa_id: number;
  etapa_nombre: string;
  documentos: Array<{
    id: string;
    pregunta_id: number;
    pregunta_codigo: string;
    pregunta_texto: string;
    nombre: string;
    url: string;
    tipo: string;
    es_obligatoria: boolean;
    requiere_ocr: boolean;
    ocr_exitoso?: boolean;
  }>;
  total: number;
}

export const RevisionManualDocumentosView: React.FC<RevisionManualDocumentosViewProps> = ({
  pregunta,
  instanciaId,
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      // Obtener etapa_origen_id de las opciones de la pregunta
      let etapaOrigenId: number | null = null;
      
      if (pregunta.opciones && typeof pregunta.opciones === 'object') {
        etapaOrigenId = (pregunta.opciones as any).etapa_origen_id;
      }
      if (!etapaOrigenId && pregunta.etapa_origen_id) {
        etapaOrigenId = parseInt(pregunta.etapa_origen_id as string, 10);
      }
      
      if (!instanciaId || !etapaOrigenId) {
        console.warn('RevisionManualDocumentosView: falta instanciaId o etapa_origen_id', {
          instanciaId,
          etapaOrigenId,
          preguntaOpciones: pregunta.opciones
        });
        setLoading(false);
        return;
      }
      
      try {
        // Cargar documentos
        const response = await apiClient.get<DocumentosResponse>(
          `/workflow/instancias/${instanciaId}/etapas/${etapaOrigenId}/documentos`
        );
        
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const baseUrl = apiBaseUrl.replace('/api/v1', '');
        
        const documentosMapeados: Documento[] = response.documentos.map((doc) => ({
          id: doc.id,
          name: doc.pregunta_texto || doc.nombre,
          url: doc.url ? `${baseUrl}${doc.url}` : undefined,
        }));
        
        setDocumentos(documentosMapeados);
      } catch (err) {
        console.error('Error cargando documentos:', err);
        setError('Error al cargar los documentos de la etapa');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [instanciaId, pregunta.opciones, pregunta.etapa_origen_id]);

  const handleDescargarDocumento = (doc: Documento) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (documentos.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No hay documentos cargados en la etapa de origen seleccionada.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 6 }}>
      {/* Título de la sección */}
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 500, 
          mb: 1, 
          color: '#333',
        }}
      >
        {pregunta.pregunta}
      </Typography>

      {/* Encabezado de columna */}
      <Typography
        variant="body2"
        sx={{
          color: '#333',
          fontWeight: 400,
          mb: 1,
          pl: 4,
        }}
      >
        Documento
      </Typography>

      {/* Línea separadora */}
      <Divider sx={{ mb: 1, backgroundColor: '#f3f3f3', height: 4 }} />

      {/* Lista de documentos */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {documentos.map((doc) => (
          <Box
            key={doc.id}
            onClick={() => handleDescargarDocumento(doc)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
              px: 0,
              cursor: doc.url ? 'pointer' : 'default',
              '&:hover': doc.url ? {
                backgroundColor: 'rgba(14, 95, 166, 0.04)',
              } : {},
              borderRadius: 1,
            }}
          >
            <FileDownloadIcon 
              sx={{ 
                color: '#333', 
                fontSize: 20,
              }} 
            />
            <Typography
              variant="body1"
              sx={{
                color: '#333',
                fontSize: '16px',
                lineHeight: 1.5,
              }}
            >
              {doc.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
