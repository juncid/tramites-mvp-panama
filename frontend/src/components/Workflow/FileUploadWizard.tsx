/**
 * Componente FileUploadWizard
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Wizard para carga de múltiples documentos paso a paso.
 * Muestra UN SOLO documento a la vez, avanzando secuencialmente.
 * Integra validación OCR con modales de estado.
 * 
 * Diseño basado en Figma: https://www.figma.com/design/yX0REVjuXYg13XO0ZgD1GQ/
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-26
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Link,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { workflowService } from '../../services/workflow.service';

interface CampoArchivo {
  id: number;
  codigo: string;
  pregunta: string;
  tipo_pregunta: string;
  orden: number;
  es_obligatoria: boolean;
  texto_ayuda?: string;
  extensiones_permitidas?: string[];
  tamano_maximo_mb?: number;
  requiere_ocr?: boolean;
  puede_editar_campo: boolean;
  valor_actual?: any;
}

interface FileUploadWizardProps {
  campos: CampoArchivo[];
  respuestas: Record<string, any>;
  onAnswerChange: (codigo: string, valor: any) => void;
  solicitudId?: number;
  readonly?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
  buttonLabels?: { back?: string; next?: string };
  titulo?: string;
  descripcion?: string;
}

export const FileUploadWizard: React.FC<FileUploadWizardProps> = ({
  campos,
  respuestas,
  onAnswerChange,
  solicitudId,
  readonly = false,
  onComplete,
  onBack,
  buttonLabels = { back: 'Volver', next: 'Siguiente' },
  titulo,
  descripcion,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Estados para los modales de OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ success: boolean; message: string }>({ success: true, message: '' });

  // Ordenar campos por orden
  const camposOrdenados = [...campos].sort((a, b) => a.orden - b.orden);
  const totalSteps = camposOrdenados.length;
  const campoActual = camposOrdenados[currentStep];

  // Verificar si el paso actual tiene archivo cargado
  const isCurrentStepComplete = (): boolean => {
    if (!campoActual) return false;
    const valor = respuestas[campoActual.codigo];
    if (!valor) return false;
    if (Array.isArray(valor)) return valor.length > 0;
    if (typeof valor === 'string') return valor.trim() !== '';
    if (typeof valor === 'object') return Object.keys(valor).length > 0;
    return false;
  };

  const handleNext = () => {
    // Validar si es obligatorio y no está completo
    if (campoActual?.es_obligatoria && !isCurrentStepComplete()) {
      alert('Debe cargar el documento requerido para continuar');
      return;
    }

    if (currentStep < totalSteps - 1) {
      // Avanzar al siguiente paso del wizard
      setCurrentStep(prev => prev + 1);
    } else if (onComplete) {
      // Último paso - completar etapa y avanzar a la siguiente
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Volver al paso anterior del wizard
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      // Primer paso - volver a la etapa anterior
      onBack();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0 || !campoActual) {
      return;
    }

    const file = files[0];
    const maxSizeMb = campoActual.tamano_maximo_mb || 10;

    // Validar tamaño
    if (file.size > maxSizeMb * 1024 * 1024) {
      setOcrResult({ success: false, message: `El archivo es muy grande. Tamaño máximo: ${maxSizeMb} MB` });
      setShowResultModal(true);
      return;
    }

    // Validar extensión (solo si hay extensiones definidas)
    if (campoActual.extensiones_permitidas && campoActual.extensiones_permitidas.length > 0) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      // Normalizar extensiones (quitar punto si lo tiene) para comparación
      const extensionesNormalizadas = campoActual.extensiones_permitidas.map(
        (e: string) => e.toLowerCase().replace(/^\./, '')
      );
      
      if (ext && !extensionesNormalizadas.includes(ext)) {
        setOcrResult({ 
          success: false, 
          message: `Tipo de archivo no permitido. Formatos permitidos: ${extensionesNormalizadas.join(', ').toUpperCase()}` 
        });
        setShowResultModal(true);
        return;
      }
    }

    // Iniciar proceso de carga con OCR
    setIsLoadingOCR(true);

    try {
      // Siempre subir al servidor si hay solicitudId (campos CARGA_ARCHIVO requieren OCR por defecto)
      if (solicitudId) {
        const resultado = await workflowService.subirDocumentoEtapa(
          solicitudId,
          file,
          {
            tipo_documento_texto: campoActual.pregunta,
            observaciones: `Documento: ${campoActual.codigo}`
          }
        );

        // Guardar archivo con datos del servidor
        onAnswerChange(campoActual.codigo, [{
          nombre: file.name,
          size: file.size,
          file: file,
          uploaded_at: new Date().toISOString(),
          id_documento: resultado.id_documento,
          ocr_procesado: true
        }]);

        setOcrResult({ 
          success: true, 
          message: 'Documento procesado y verificado exitosamente' 
        });
      } else {
        // Sin solicitudId - guardar archivo localmente (modo preview/desarrollo)
        onAnswerChange(campoActual.codigo, [{
          nombre: file.name,
          size: file.size,
          file: file,
          uploaded_at: new Date().toISOString()
        }]);

        setOcrResult({ 
          success: true, 
          message: 'Documento cargado exitosamente' 
        });
      }

      setShowResultModal(true);
    } catch (err: any) {
      console.error('Error procesando documento:', err);
      setOcrResult({ 
        success: false, 
        message: err.message || 'Error al procesar el documento. Por favor, intente nuevamente.' 
      });
      setShowResultModal(true);
    } finally {
      setIsLoadingOCR(false);
    }
  };

  const handleRemoveFile = () => {
    if (!campoActual) return;
    onAnswerChange(campoActual.codigo, []);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileName = (valor: any): string | null => {
    if (!valor) return null;
    if (Array.isArray(valor) && valor.length > 0) {
      return valor[0].nombre || valor[0].name || valor[0];
    }
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'object' && valor.nombre) return valor.nombre;
    return null;
  };

  if (!campoActual) {
    return null;
  }

  const currentFileName = getFileName(respuestas[campoActual.codigo]);
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Obtener extensiones permitidas para el accept del input
  // Permitir cualquier archivo si no hay restricciones definidas
  const acceptTypes = campoActual.extensiones_permitidas?.length 
    ? campoActual.extensiones_permitidas.map(ext => `.${ext.toLowerCase().replace('.', '')}`).join(',')
    : '*/*';

  return (
    <Box>
      {/* Descripción de la etapa (bajada_formulario) - Solo en el primer paso */}
      {descripcion && currentStep === 0 && (
        <Typography 
          sx={{ 
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#333333',
            mb: 4,
            maxWidth: '1167px',
          }}
        >
          {descripcion}
        </Typography>
      )}

      {/* Solo mostrar el documento actual */}
      <Box sx={{ mb: 4 }}>
        {/* Label del documento */}
        <Typography 
          sx={{ 
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#333333',
            mb: 1,
          }}
        >
          {campoActual.pregunta}
          {campoActual.es_obligatoria && <span style={{ color: '#d32f2f' }}> *</span>}
        </Typography>

        {/* Campo con archivo cargado o vacío */}
        <Box
          sx={{
            border: '1px solid #333333',
            borderRadius: '4px',
            height: '56px',
            width: '520px',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            mb: 1,
          }}
        >
          {currentFileName ? (
            <>
              <Link
                href="#"
                underline="always"
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '16px',
                  color: '#0e5fa6',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {currentFileName}
              </Link>
              <IconButton 
                onClick={handleRemoveFile}
                disabled={readonly}
                size="small"
                sx={{ color: '#333333' }}
              >
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </>
          ) : (
            <Typography 
              sx={{ 
                color: '#9e9e9e',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
              }}
            >
              Sin archivo seleccionado
            </Typography>
          )}
        </Box>

        {/* Botón Cargar archivo */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={acceptTypes}
          onChange={handleFileSelect}
          disabled={readonly}
        />
        <Button
          variant="text"
          startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
          onClick={triggerFileInput}
          disabled={readonly}
          sx={{
            backgroundColor: '#f1f3f4',
            borderRadius: '2px',
            height: '32px',
            px: 1,
            ml: 2,
            textTransform: 'none',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            color: '#788093',
            '&:hover': {
              backgroundColor: '#e4e6e8',
            },
          }}
        >
          Cargar archivo
        </Button>

        {/* Indicaciones extra */}
        {campoActual.texto_ayuda && (
          <Typography
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 300,
              fontSize: '14px',
              lineHeight: 1.5,
              color: '#333333',
              mt: 1,
              ml: 2,
            }}
          >
            {campoActual.texto_ayuda}
          </Typography>
        )}

        {/* Información de formatos y tamaño */}
        {(campoActual.extensiones_permitidas?.length || campoActual.tamano_maximo_mb) && (
          <Typography
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 300,
              fontSize: '14px',
              lineHeight: 1.5,
              color: '#666666',
              mt: 0.5,
              ml: 2,
            }}
          >
            {campoActual.extensiones_permitidas?.length && 
              `Formatos: ${campoActual.extensiones_permitidas.join(', ').toUpperCase()}`}
            {campoActual.extensiones_permitidas?.length && campoActual.tamano_maximo_mb && ' • '}
            {campoActual.tamano_maximo_mb && `Máximo: ${campoActual.tamano_maximo_mb} MB`}
          </Typography>
        )}
      </Box>

      {/* Botones de acción - Estilo Figma */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ 
          mt: 6,
          width: '1194px',
          maxWidth: '100%',
        }}
      >
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{
            width: '124px',
            height: '40px',
            borderRadius: '4px',
            borderColor: '#0e5fa6',
            color: '#0e5fa6',
            textTransform: 'none',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            '&:hover': {
              borderColor: '#0d5391',
              backgroundColor: 'rgba(14, 95, 166, 0.04)',
            },
          }}
        >
          {buttonLabels.back}
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            width: '124px',
            height: '40px',
            borderRadius: '4px',
            backgroundColor: '#0e5fa6',
            textTransform: 'none',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#0d5391',
            },
          }}
        >
          {buttonLabels.next}
        </Button>
      </Stack>

      {/* Modal de Loading - Procesando OCR */}
      <Dialog
        open={isLoadingOCR}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            padding: '24px',
            minWidth: '320px',
            textAlign: 'center',
          }
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} sx={{ color: '#0e5fa6' }} />
          <Typography 
            sx={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              color: '#333333',
            }}
          >
            Procesando documento...
          </Typography>
          <Typography 
            sx={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
              color: '#666666',
            }}
          >
            Por favor espere mientras verificamos el documento
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Modal de Resultado - Éxito o Error */}
      <Dialog
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            padding: '24px',
            minWidth: '360px',
            textAlign: 'center',
          }
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pb: 1 }}>
          {ocrResult.success ? (
            <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50' }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 64, color: '#f44336' }} />
          )}
          <Typography 
            sx={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              color: ocrResult.success ? '#4caf50' : '#f44336',
            }}
          >
            {ocrResult.success ? '¡Éxito!' : 'Error'}
          </Typography>
          <Typography 
            sx={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
              color: '#333333',
              lineHeight: 1.5,
            }}
          >
            {ocrResult.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pt: 0 }}>
          <Button
            variant="contained"
            onClick={() => setShowResultModal(false)}
            sx={{
              backgroundColor: ocrResult.success ? '#0e5fa6' : '#f44336',
              textTransform: 'none',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              px: 4,
              '&:hover': {
                backgroundColor: ocrResult.success ? '#0d5391' : '#d32f2f',
              },
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploadWizard;
