import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { OCRLoadingModal } from '../../PPSH/OCRLoadingModal';
import { OCRResultModal } from '../../PPSH/OCRResultModal';

interface CargaArchivoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (archivos: File[]) => void;
}

export const CargaArchivoView: React.FC<CargaArchivoViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
}) => {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<'success' | 'error'>('success');

  const maxArchivos = pregunta.max_archivos || 5;
  const maxSizeMb = pregunta.max_size_mb || 10;
  const requiereOCR = (pregunta as any).requiere_ocr || false;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar tamaño
    const archivosValidos = files.filter(file => {
      const sizeMb = file.size / (1024 * 1024);
      return sizeMb <= maxSizeMb;
    });

    if (archivosValidos.length !== files.length) {
      alert(`Algunos archivos exceden el tamaño máximo de ${maxSizeMb}MB`);
    }

    // Validar cantidad máxima
    const nuevosArchivos = [...archivos, ...archivosValidos].slice(0, maxArchivos);
    
    // Si requiere OCR, procesarlo
    if (requiereOCR && archivosValidos.length > 0) {
      await processOCR(nuevosArchivos);
    } else {
      setArchivos(nuevosArchivos);
      onAnswerChange?.(nuevosArchivos);
    }
  };

  const processOCR = async (files: File[]) => {
    setIsLoadingOCR(true);

    // Simular procesamiento OCR (2-3 segundos)
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsLoadingOCR(false);

    // Simular resultado aleatorio (80% éxito, 20% error)
    const success = Math.random() > 0.2;
    setOcrResult(success ? 'success' : 'error');
    setShowResult(true);

    if (success) {
      setArchivos(files);
      onAnswerChange?.(files);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  const handleRemove = (index: number) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    onAnswerChange?.(nuevosArchivos);
  };

  return (
    <Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 500, 
          mb: 1, 
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
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6B7280', 
            display: 'block',
            mb: 1,
          }}
        >
          {pregunta.texto_ayuda}
        </Typography>
      )}

      {!readonly && archivos.length < maxArchivos && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
        >
          Seleccionar archivo{archivos.length > 0 ? 's' : ''}
          <input
            type="file"
            hidden
            multiple={maxArchivos > 1}
            onChange={handleFileChange}
          />
        </Button>
      )}

      {archivos.length > 0 && (
        <List>
          {archivos.map((archivo, index) => (
            <ListItem key={index}>
              <FileIcon sx={{ mr: 2, color: '#6B7280' }} />
              <ListItemText
                primary={archivo.name}
                secondary={`${(archivo.size / 1024).toFixed(2)} KB`}
              />
              {!readonly && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemove(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        Máximo {maxArchivos} archivo{maxArchivos > 1 ? 's' : ''} de {maxSizeMb}MB cada uno
        {requiereOCR && ' · Con validación OCR'}
      </Alert>

      {/* Modales de OCR */}
      <OCRLoadingModal open={isLoadingOCR} />

      <OCRResultModal
        open={showResult}
        tipo={ocrResult}
        onClose={handleCloseResult}
      />
    </Box>
  );
};
