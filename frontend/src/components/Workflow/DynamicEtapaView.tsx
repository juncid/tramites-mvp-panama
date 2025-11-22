import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import type { WorkflowEtapa, WorkflowPregunta } from '../../types/workflow';
import { RespuestaTextoView } from './QuestionViews/RespuestaTextoView';
import { ListaView } from './QuestionViews/ListaView';
import { OpcionesView } from './QuestionViews/OpcionesView';
import { CargaArchivoView } from './QuestionViews/CargaArchivoView';
import { RevisionManualDocumentosView } from './QuestionViews/RevisionManualDocumentosView';
import { RevisionOCRView } from './QuestionViews/RevisionOCRView';
import { DatosCasoView } from './QuestionViews/DatosCasoView';
import { SeleccionFechaView } from './QuestionViews/SeleccionFechaView';
import { DescargaArchivoView } from './QuestionViews/DescargaArchivoView';
import { ImpresionView } from './QuestionViews/ImpresionView';

interface DynamicEtapaViewProps {
  etapa: WorkflowEtapa;
  instanciaId?: number; // Para cargar respuestas si existe
  readonly?: boolean; // Vista de solo lectura
  onAnswerChange?: (preguntaId: number, valor: any) => void;
}

/**
 * Componente que renderiza dinámicamente una etapa del workflow
 * con todas sus configuraciones (título, bajada, preguntas)
 * de forma dinámica según el tipo_pregunta
 */
export const DynamicEtapaView: React.FC<DynamicEtapaViewProps> = ({
  etapa,
  instanciaId,
  readonly = false,
  onAnswerChange,
}) => {
  // Ordenar preguntas por orden
  const preguntasOrdenadas = [...(etapa.preguntas || [])].sort((a, b) => a.orden - b.orden);

  const renderPregunta = (pregunta: WorkflowPregunta) => {
    const commonProps = {
      pregunta,
      readonly,
      onAnswerChange: (valor: any) => onAnswerChange?.(pregunta.id!, valor),
    };

    try {
      switch (pregunta.tipo_pregunta) {
        case 'RESPUESTA_TEXTO':
        case 'RESPUESTA_LARGA':
          return <RespuestaTextoView key={pregunta.id} {...commonProps} />;
        
        case 'LISTA':
          return <ListaView key={pregunta.id} {...commonProps} />;
        
        case 'OPCIONES':
          return <OpcionesView key={pregunta.id} {...commonProps} />;
        
        case 'CARGA_ARCHIVO':
          return <CargaArchivoView key={pregunta.id} {...commonProps} />;
        
        case 'REVISION_MANUAL_DOCUMENTOS':
          return <RevisionManualDocumentosView key={pregunta.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'REVISION_OCR':
          return <RevisionOCRView key={pregunta.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'DATOS_CASO':
          return <DatosCasoView key={pregunta.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'SELECCION_FECHA':
          return <SeleccionFechaView key={pregunta.id} {...commonProps} />;
        
        case 'DESCARGA_ARCHIVO':
          return <DescargaArchivoView key={pregunta.id} {...commonProps} />;
        
        case 'IMPRESION':
          return <ImpresionView key={pregunta.id} {...commonProps} />;
        
        default:
          return (
            <Box key={pregunta.id} sx={{ p: 2, backgroundColor: '#FEF3C7', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tipo de pregunta no soportado: {pregunta.tipo_pregunta}
              </Typography>
            </Box>
          );
      }
    } catch (error) {
      console.error('Error renderizando pregunta:', pregunta, error);
      return (
        <Box key={pregunta.id} sx={{ p: 2, backgroundColor: '#FEE2E2', borderRadius: 1 }}>
          <Typography variant="body2" color="error">
            Error renderizando pregunta: {pregunta.pregunta}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box>
      {/* Renderizar todas las preguntas */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {preguntasOrdenadas.map(pregunta => renderPregunta(pregunta))}
      </Box>
    </Box>
  );
};
