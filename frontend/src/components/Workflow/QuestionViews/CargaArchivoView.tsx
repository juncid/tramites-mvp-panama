import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { OCRLoadingModal } from '../../PPSH/OCRLoadingModal';
import { OCRResultModal } from '../../PPSH/OCRResultModal';
import { apiClient } from '../../../services/api';

interface OCRProgress {
  current: number;
  total: number;
  status: string;
  porcentaje: number;
}

interface OCRWebSocketMessage {
  type: 'connected' | 'pending' | 'progress' | 'complete' | 'error' | 'timeout';
  task_id: string;
  message?: string;
  current?: number;
  total?: number;
  status?: string;
  porcentaje?: number;
  result?: any;
  error?: string;
}

interface UploadedFile {
  file: File;
  id_documento?: number;
  ocr_task_id?: string;
  ocr_status?: 'pending' | 'processing' | 'complete' | 'error';
  ruta_archivo?: string;
}

interface CargaArchivoViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (archivos: File[]) => void;
  solicitudId?: number;  // ID de solicitud para upload
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/v1';

export const CargaArchivoView: React.FC<CargaArchivoViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  solicitudId,
}) => {
  const [archivos, setArchivos] = useState<UploadedFile[]>([]);
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<'success' | 'error'>('success');
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [ocrErrorMessage, setOcrErrorMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const currentTaskRef = useRef<string | null>(null);

  const maxArchivos = pregunta.max_archivos || 5;
  const maxSizeMb = pregunta.max_size_mb || 100;  // Actualizado a 100MB
  const requiereOCR = (pregunta as any).requiere_ocr || false;

  // Cerrar WebSocket al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Conectar WebSocket para monitorear OCR
  const connectOCRWebSocket = useCallback((taskId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${WS_BASE_URL}/ws/ocr/${taskId}`;
    console.log(`🔌 Conectando WebSocket OCR: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    currentTaskRef.current = taskId;

    ws.onopen = () => {
      console.log('✅ WebSocket OCR conectado');
    };

    ws.onmessage = (event) => {
      try {
        const data: OCRWebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket mensaje:', data);

        switch (data.type) {
          case 'connected':
            console.log('Conexión confirmada');
            break;
            
          case 'pending':
            setOcrProgress({ current: 0, total: 6, status: 'En cola...', porcentaje: 0 });
            break;
            
          case 'progress':
            setOcrProgress({
              current: data.current || 0,
              total: data.total || 6,
              status: data.status || 'Procesando...',
              porcentaje: data.porcentaje || 0,
            });
            break;
            
          case 'complete':
            setIsLoadingOCR(false);
            setOcrResult('success');
            setShowResult(true);
            
            // Actualizar archivo con resultado
            if (currentTaskRef.current) {
              setArchivos(prev => prev.map(a => 
                a.ocr_task_id === currentTaskRef.current 
                  ? { ...a, ocr_status: 'complete' }
                  : a
              ));
            }
            
            ws.close();
            break;
            
          case 'error':
            setIsLoadingOCR(false);
            setOcrResult('error');
            setOcrErrorMessage(data.error || 'Error procesando documento');
            setShowResult(true);
            
            // Marcar archivo con error
            if (currentTaskRef.current) {
              setArchivos(prev => prev.map(a => 
                a.ocr_task_id === currentTaskRef.current 
                  ? { ...a, ocr_status: 'error' }
                  : a
              ));
            }
            
            ws.close();
            break;
            
          case 'timeout':
            setIsLoadingOCR(false);
            setOcrResult('error');
            setOcrErrorMessage('Tiempo de espera agotado. Intente nuevamente.');
            setShowResult(true);
            ws.close();
            break;
        }
      } catch (e) {
        console.error('Error parseando mensaje WebSocket:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket cerrado');
      wsRef.current = null;
      currentTaskRef.current = null;
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError('');
    
    // Validar tamaño
    const archivosValidos = files.filter(file => {
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > maxSizeMb) {
        setUploadError(`Archivo ${file.name} excede el tamaño máximo de ${maxSizeMb}MB`);
        return false;
      }
      return true;
    });

    if (archivosValidos.length === 0) return;

    // Validar cantidad máxima
    if (archivos.length + archivosValidos.length > maxArchivos) {
      setUploadError(`Máximo ${maxArchivos} archivos permitidos`);
      return;
    }

    // Si hay solicitudId, subir al backend
    if (solicitudId) {
      for (const file of archivosValidos) {
        await uploadFileToBackend(file);
      }
    } else {
      // Sin solicitudId, solo agregar localmente (modo formulario nuevo)
      const nuevosArchivos: UploadedFile[] = archivosValidos.map(file => ({ file }));
      const todosArchivos = [...archivos, ...nuevosArchivos].slice(0, maxArchivos);
      setArchivos(todosArchivos);
      onAnswerChange?.(todosArchivos.map(a => a.file));
    }
  };

  const uploadFileToBackend = async (file: File) => {
    setIsLoadingOCR(true);
    setOcrProgress({ current: 0, total: 6, status: 'Subiendo archivo...', porcentaje: 0 });

    try {
      const response = await apiClient.uploadFile<any>(
        `/ppsh/solicitudes/${solicitudId}/documentos`,
        file,
        {
          tipo_documento_texto: pregunta.pregunta,
          ejecutar_ocr: requiereOCR ? 'true' : 'false',
        }
      );

      console.log('📄 Documento subido:', response);

      const nuevoArchivo: UploadedFile = {
        file,
        id_documento: response.id_documento,
        ocr_task_id: response.ocr_task_id,
        ocr_status: response.ocr_task_id ? 'processing' : 'complete',
        ruta_archivo: response.ruta_archivo,
      };

      setArchivos(prev => [...prev, nuevoArchivo]);
      onAnswerChange?.([...archivos.map(a => a.file), file]);

      // Si hay tarea OCR, conectar WebSocket
      if (response.ocr_task_id && requiereOCR) {
        connectOCRWebSocket(response.ocr_task_id);
      } else {
        // Sin OCR, terminar loading
        setIsLoadingOCR(false);
        setOcrResult('success');
        setShowResult(true);
      }

    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setIsLoadingOCR(false);
      setOcrResult('error');
      setOcrErrorMessage(error instanceof Error ? error.message : 'Error subiendo archivo');
      setShowResult(true);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setOcrProgress(null);
    setOcrErrorMessage('');
  };

  const handleRemove = async (index: number) => {
    const archivo = archivos[index];
    
    // Si tiene id_documento, se podría eliminar del backend (TODO)
    // Por ahora solo eliminar localmente
    
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    onAnswerChange?.(nuevosArchivos.map(a => a.file));
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

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError('')}>
          {uploadError}
        </Alert>
      )}

      {!readonly && archivos.length < maxArchivos && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
          disabled={isLoadingOCR}
        >
          Seleccionar archivo{archivos.length > 0 ? 's' : ''}
          <input
            type="file"
            hidden
            multiple={maxArchivos > 1}
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
          />
        </Button>
      )}

      {/* Progress bar durante upload/OCR */}
      {isLoadingOCR && ocrProgress && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {ocrProgress.status}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={ocrProgress.porcentaje} 
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      {archivos.length > 0 && (
        <List>
          {archivos.map((archivo, index) => (
            <ListItem key={index}>
              <FileIcon sx={{ mr: 2, color: '#6B7280' }} />
              <ListItemText
                primary={archivo.file.name}
                secondary={
                  <>
                    {`${(archivo.file.size / 1024).toFixed(2)} KB`}
                    {archivo.ocr_status === 'complete' && ' · ✅ OCR completado'}
                    {archivo.ocr_status === 'error' && ' · ❌ Error OCR'}
                    {archivo.ocr_status === 'processing' && ' · 🔄 Procesando OCR...'}
                  </>
                }
              />
              {!readonly && (
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemove(index)}
                    disabled={isLoadingOCR}
                  >
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
        mensaje={ocrErrorMessage || undefined}
        onClose={handleCloseResult}
      />
    </Box>
  );
};
