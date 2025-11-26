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
  TextField,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  CloudDownload as DownloadIcon,
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
  value?: any;  // Valor actual (para modo readonly): puede ser string, array, o objeto con info del archivo
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/v1';
const API_URL = 'http://localhost:8000';

export const CargaArchivoView: React.FC<CargaArchivoViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  solicitudId,
  value,
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

  const maxArchivos = pregunta.max_archivos || 1;  // Default: 1 archivo (más conservador)
  const maxSizeMb = pregunta.max_size_mb || 10;  // Default: 10MB (más razonable para documentos individuales)
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
            console.log('🎉 ========================================');
            console.log('🎉 OCR COMPLETADO');
            console.log('🎉 ========================================');
            console.log('🎉 Data completa:', data);
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
            console.error('❌ ========================================');
            console.error('❌ OCR ERROR');
            console.error('❌ ========================================');
            console.error('❌ Data:', data);
            console.error('❌ Error mensaje:', data.error);
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

    const endpoint = `/ppsh/solicitudes/${solicitudId}/documentos`;
    const params = {
      tipo_documento_texto: pregunta.pregunta,
      ejecutar_ocr: requiereOCR ? 'true' : 'false',
    };

    console.log('🚀 ========================================');
    console.log('🚀 SUBIENDO ARCHIVO AL BACKEND');
    console.log('🚀 ========================================');
    console.log('📤 Endpoint:', endpoint);
    console.log('📤 Archivo:', file.name, '| Tamaño:', (file.size / 1024).toFixed(2), 'KB');
    console.log('📤 Parámetros:', params);
    console.log('📤 solicitudId:', solicitudId);
    console.log('📤 pregunta.id:', pregunta.id);
    console.log('📤 requiereOCR:', requiereOCR);

    try {
      const response = await apiClient.uploadFile<any>(
        endpoint,
        file,
        params,
        'archivo'  // El backend espera el campo 'archivo', no 'file'
      );

      console.log('✅ ========================================');
      console.log('✅ RESPUESTA DEL BACKEND');
      console.log('✅ ========================================');
      console.log('📄 Documento subido:', response);
      console.log('📄 id_documento:', response.id_documento);
      console.log('📄 ruta_archivo:', response.ruta_archivo);
      console.log('📄 ocr_task_id:', response.ocr_task_id);

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
        console.log('🔄 Iniciando WebSocket OCR para task:', response.ocr_task_id);
        connectOCRWebSocket(response.ocr_task_id);
      } else {
        // Sin OCR, terminar loading
        console.log('✅ Subida completada (sin OCR)');
        setIsLoadingOCR(false);
        setOcrResult('success');
        setShowResult(true);
      }

    } catch (error: any) {
      console.error('❌ ========================================');
      console.error('❌ ERROR SUBIENDO ARCHIVO');
      console.error('❌ ========================================');
      console.error('❌ Error:', error);
      console.error('❌ Mensaje:', error?.message);
      console.error('❌ Response:', error?.response);
      console.error('❌ Data:', error?.response?.data);
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

  // Helper para parsear el value y obtener info del archivo subido
  const getArchivoSubido = (): { url?: string; nombre?: string } | null => {
    if (!value) return null;
    
    // value puede ser: string (URL), array de strings/objetos, u objeto con info
    if (typeof value === 'string') {
      // Es una URL o nombre de archivo
      const nombre = value.split('/').pop() || value;
      return { url: value, nombre };
    }
    
    if (Array.isArray(value) && value.length > 0) {
      const primerArchivo = value[0];
      if (typeof primerArchivo === 'string') {
        const nombre = primerArchivo.split('/').pop() || primerArchivo;
        return { url: primerArchivo, nombre };
      }
      if (primerArchivo && typeof primerArchivo === 'object') {
        return {
          url: primerArchivo.url || primerArchivo.ruta_archivo || primerArchivo.archivo_url,
          nombre: primerArchivo.nombre || primerArchivo.nombre_archivo || 'Documento'
        };
      }
    }
    
    if (typeof value === 'object' && value !== null) {
      return {
        url: value.url || value.ruta_archivo || value.archivo_url,
        nombre: value.nombre || value.nombre_archivo || 'Documento'
      };
    }
    
    return null;
  };

  const archivoSubido = getArchivoSubido();

  const handleDescargar = () => {
    if (archivoSubido?.url) {
      const urlCompleta = archivoSubido.url.startsWith('http') 
        ? archivoSubido.url 
        : `${API_URL}${archivoSubido.url}`;
      window.open(urlCompleta, '_blank');
    }
  };

  // Si está en modo readonly y hay un archivo subido, mostrar como botón de descarga
  if (readonly && archivoSubido) {
    return (
      <Box sx={{ mb: 3 }}>
        {/* Label */}
        <Typography 
          sx={{ 
            fontWeight: 500, 
            fontSize: '16px',
            mb: 1, 
            color: '#333333',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {pregunta.pregunta}
          {pregunta.es_obligatoria && (
            <Typography component="span" sx={{ color: '#DC2626', ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>

        {/* Botón de descarga estilo DescargaArchivoView */}
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
          {archivoSubido.nombre}
        </Button>
      </Box>
    );
  }

  // Si está en modo readonly pero sin archivo disponible, mostrar mensaje
  if (readonly && !archivoSubido) {
    return (
      <Box sx={{ mb: 3 }}>
        {/* Label */}
        <Typography 
          sx={{ 
            fontWeight: 500, 
            fontSize: '16px',
            mb: 1, 
            color: '#333333',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {pregunta.pregunta}
          {pregunta.es_obligatoria && (
            <Typography component="span" sx={{ color: '#DC2626', ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>

        {/* Mensaje indicando que no hay archivo */}
        <Alert severity="info" sx={{ maxWidth: '520px' }}>
          El archivo fue procesado en esta etapa. No hay vista previa disponible.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Label - Según Figma: font-medium, 16px, color #333333 */}
      <Typography 
        sx={{ 
          fontWeight: 500, 
          fontSize: '16px',
          mb: 1, 
          color: '#333333',
          fontFamily: 'Roboto, sans-serif',
        }}
      >
        {pregunta.pregunta}
        {pregunta.es_obligatoria && (
          <Typography component="span" sx={{ color: '#DC2626', ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError('')}>
          {uploadError}
        </Alert>
      )}

      {/* Input de texto con nombre de archivo - Según Figma: borde #333333, altura 56px, width 520px, border-radius 4px */}
      <TextField
        fullWidth
        value={archivos.length > 0 ? archivos.map(a => a.file.name).join(', ') : ''}
        placeholder=""
        disabled
        sx={{
          maxWidth: '520px',
          mb: 0.5,
          '& .MuiOutlinedInput-root': {
            height: '56px',
            borderRadius: '4px',
            '& fieldset': {
              borderColor: '#333333',
              borderWidth: '1px',
            },
            '&.Mui-disabled fieldset': {
              borderColor: '#333333',
            },
            '& input': {
              color: '#4d4d4d',
              fontSize: '16px',
              fontFamily: 'Roboto, sans-serif',
              '-webkit-text-fill-color': '#4d4d4d',
            },
          },
        }}
      />

      {/* Botón Cargar archivo - Según Figma: fondo #0e5fa6, altura 32px, border-radius 2px, ícono attach-file */}
      {!readonly && archivos.length < maxArchivos && (
        <Box
          component="label"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            bgcolor: '#0e5fa6',
            color: 'white',
            height: '32px',
            px: 1.5,
            borderRadius: '2px',
            cursor: isLoadingOCR ? 'not-allowed' : 'pointer',
            opacity: isLoadingOCR ? 0.7 : 1,
            '&:hover': {
              bgcolor: isLoadingOCR ? '#0e5fa6' : '#0d5494',
            },
          }}
        >
          <AttachFileIcon sx={{ fontSize: 16 }} />
          <Typography 
            sx={{ 
              fontSize: '16px', 
              lineHeight: '24px',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              letterSpacing: '0.5px',
            }}
          >
            Cargar archivo
          </Typography>
          <input
            type="file"
            hidden
            multiple={maxArchivos > 1}
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
            disabled={isLoadingOCR}
          />
        </Box>
      )}

      {/* Texto de ayuda / Indicaciones - Según Figma: font-light, 14px, color #333333 */}
      {pregunta.texto_ayuda && (
        <Typography 
          sx={{ 
            fontWeight: 300, 
            fontSize: '14px',
            color: '#333333',
            mt: 1,
            ml: 2,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {pregunta.texto_ayuda}
        </Typography>
      )}

      {/* Progress bar durante upload/OCR */}
      {isLoadingOCR && ocrProgress && (
        <Box sx={{ mt: 2, maxWidth: '520px' }}>
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

      {/* Lista de archivos subidos */}
      {archivos.length > 0 && (
        <List sx={{ maxWidth: '520px', mt: 1 }}>
          {archivos.map((archivo, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
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
                primaryTypographyProps={{ 
                  sx: { fontSize: '14px', color: '#333333' } 
                }}
                secondaryTypographyProps={{ 
                  sx: { fontSize: '12px' } 
                }}
              />
              {!readonly && (
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemove(index)}
                    disabled={isLoadingOCR}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Info de límites (solo si permite múltiples archivos o requiere OCR) */}
      {(maxArchivos > 1 || requiereOCR) && (
        <Typography 
          sx={{ 
            fontSize: '12px', 
            color: '#6B7280', 
            mt: 1,
            fontStyle: 'italic',
          }}
        >
          {maxArchivos > 1 
            ? `Máximo ${maxArchivos} archivos de ${maxSizeMb}MB cada uno`
            : `Máximo ${maxSizeMb}MB`
          }
          {requiereOCR && ' · Con validación OCR'}
        </Typography>
      )}

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
