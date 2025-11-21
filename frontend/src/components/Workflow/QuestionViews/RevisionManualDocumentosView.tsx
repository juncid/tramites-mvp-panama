import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { DocumentChecklistTable } from '../../Solicitudes/DocumentChecklistTable';

interface RevisionManualDocumentosViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (documentos: any[]) => void;
  instanciaId?: number;
}

interface Documento {
  id: string;
  name: string;
  hasOcr: boolean;
  isValid: boolean | null;
  esObligatorio: boolean;
}

export const RevisionManualDocumentosView: React.FC<RevisionManualDocumentosViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  instanciaId,
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Cargar documentos desde el backend basado en instanciaId
    // Por ahora, usar datos mock
    const mockDocumentos: Documento[] = [
      {
        id: '1',
        name: 'Poder y solicitud mediante apoderado legal',
        hasOcr: false,
        isValid: null,
        esObligatorio: true,
      },
      {
        id: '2',
        name: 'Dos fotos tamaño carnet, fondo blanco o a color',
        hasOcr: false,
        isValid: null,
        esObligatorio: true,
      },
      {
        id: '3',
        name: 'Copia completa del pasaporte debidamente notariado',
        hasOcr: true,
        isValid: true,
        esObligatorio: true,
      },
    ];
    
    setDocumentos(mockDocumentos);
    setLoading(false);

    // Seleccionar el primer documento
    if (mockDocumentos.length > 0) {
      setSelectedDocument(mockDocumentos[0].id);
    }
  }, [instanciaId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      <DocumentChecklistTable
        documents={documentos}
        selectedDocumentId={selectedDocument}
        onDocumentSelect={setSelectedDocument}
      />
    </Box>
  );
};
