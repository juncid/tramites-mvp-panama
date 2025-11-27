/**
 * Componente FileUploadWizard
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Wizard para carga de múltiples documentos paso a paso.
 * Cuando una etapa tiene varios campos de tipo CARGA_ARCHIVO,
 * este componente los presenta como un wizard guiado.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-26
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Alert,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../types/workflow';
import { CargaArchivoView } from './QuestionViews/CargaArchivoView';

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
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Ordenar campos por orden
  const camposOrdenados = [...campos].sort((a, b) => a.orden - b.orden);
  const totalSteps = camposOrdenados.length;

  // Verificar si un paso está completo (tiene archivo cargado)
  const isStepComplete = (stepIndex: number): boolean => {
    const campo = camposOrdenados[stepIndex];
    if (!campo) return false;
    
    const valor = respuestas[campo.codigo];
    if (!valor) return false;
    
    // Si es un array, verificar que tenga elementos
    if (Array.isArray(valor)) return valor.length > 0;
    
    // Si es string (ruta de archivo), verificar que no esté vacío
    if (typeof valor === 'string') return valor.trim() !== '';
    
    // Si es objeto, verificar que tenga contenido
    if (typeof valor === 'object') return Object.keys(valor).length > 0;
    
    return false;
  };

  // Actualizar completedSteps cuando cambian las respuestas
  useEffect(() => {
    const newCompleted = new Set<number>();
    camposOrdenados.forEach((_, index) => {
      if (isStepComplete(index)) {
        newCompleted.add(index);
      }
    });
    setCompletedSteps(newCompleted);
  }, [respuestas, camposOrdenados]);

  // Convertir campo a formato WorkflowPregunta para CargaArchivoView
  const campoToPregunta = (campo: CampoArchivo): WorkflowPregunta => ({
    id: campo.id,
    codigo: campo.codigo,
    pregunta: campo.pregunta,
    texto: campo.pregunta,
    tipo_pregunta: 'CARGA_ARCHIVO' as any,
    tipo: 'CARGA_ARCHIVO' as any,
    orden: campo.orden,
    es_obligatoria: campo.es_obligatoria,
    texto_ayuda: campo.texto_ayuda,
    ayuda: campo.texto_ayuda,
    activo: true,
    es_visible: true,
    extensiones_permitidas: campo.extensiones_permitidas?.join(','),
    max_size_mb: campo.tamano_maximo_mb,
    requiere_ocr: campo.requiere_ocr,
  } as any);

  const handleNext = () => {
    // Verificar si el paso actual está completo (si es obligatorio)
    const campoActual = camposOrdenados[activeStep];
    if (campoActual.es_obligatoria && !isStepComplete(activeStep)) {
      // No permitir avanzar si es obligatorio y no está completo
      return;
    }
    
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    } else if (onComplete) {
      // Último paso - verificar todos los obligatorios
      const faltantes = camposOrdenados.filter((campo, index) => 
        campo.es_obligatoria && !isStepComplete(index)
      );
      
      if (faltantes.length === 0) {
        onComplete();
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Permitir ir a pasos anteriores o al siguiente si el actual está completo
    if (stepIndex < activeStep || (stepIndex === activeStep + 1 && isStepComplete(activeStep))) {
      setActiveStep(stepIndex);
    }
  };

  // Calcular progreso
  const progress = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  const campoActual = camposOrdenados[activeStep];
  const isCurrentStepComplete = isStepComplete(activeStep);
  const isLastStep = activeStep === totalSteps - 1;
  const canProceed = !campoActual?.es_obligatoria || isCurrentStepComplete;

  return (
    <Box>
      {/* Header del Wizard */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Carga de Documentos
          </Typography>
          <Chip 
            icon={<DocumentIcon />}
            label={`${completedSteps.size} de ${totalSteps} documentos`}
            color={completedSteps.size === totalSteps ? 'success' : 'default'}
            variant={completedSteps.size === totalSteps ? 'filled' : 'outlined'}
          />
        </Stack>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: completedSteps.size === totalSteps ? '#22c55e' : '#0e5fa6',
              borderRadius: 4,
            }
          }} 
        />
        
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#64748b' }}>
          Complete la carga de todos los documentos requeridos para continuar
        </Typography>
      </Paper>

      {/* Stepper Vertical */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
        {camposOrdenados.map((campo, index) => {
          const stepComplete = isStepComplete(index);
          
          return (
            <Step key={campo.id} completed={stepComplete}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{ 
                  cursor: index <= activeStep || stepComplete ? 'pointer' : 'default',
                  '& .MuiStepLabel-label': {
                    fontWeight: index === activeStep ? 600 : 400,
                    color: index === activeStep ? '#0e5fa6' : '#64748b',
                  }
                }}
                optional={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {campo.es_obligatoria && (
                      <Chip label="Requerido" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                    {campo.requiere_ocr && (
                      <Chip label="OCR" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                    {stepComplete && (
                      <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                    )}
                  </Stack>
                }
                StepIconProps={{
                  sx: {
                    '&.Mui-completed': { color: '#22c55e' },
                    '&.Mui-active': { color: '#0e5fa6' },
                  }
                }}
              >
                {campo.pregunta}
              </StepLabel>
              
              <StepContent>
                <Box sx={{ py: 2 }}>
                  {/* Texto de ayuda */}
                  {campo.texto_ayuda && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {campo.texto_ayuda}
                    </Alert>
                  )}

                  {/* Información de formatos permitidos */}
                  {campo.extensiones_permitidas && campo.extensiones_permitidas.length > 0 && (
                    <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#64748b' }}>
                      Formatos permitidos: {campo.extensiones_permitidas.join(', ').toUpperCase()}
                      {campo.tamano_maximo_mb && ` • Tamaño máximo: ${campo.tamano_maximo_mb} MB`}
                    </Typography>
                  )}

                  {/* Componente de carga de archivo */}
                  <CargaArchivoView
                    pregunta={campoToPregunta(campo)}
                    readonly={readonly || !campo.puede_editar_campo}
                    onAnswerChange={(archivos) => onAnswerChange(campo.codigo, archivos)}
                    solicitudId={solicitudId}
                    value={respuestas[campo.codigo]}
                  />

                  {/* Botones de navegación dentro del step */}
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      startIcon={<BackIcon />}
                      sx={{
                        borderColor: '#0e5fa6',
                        color: '#0e5fa6',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#0d5391',
                          backgroundColor: 'rgba(14, 95, 166, 0.04)',
                        },
                      }}
                    >
                      {activeStep === 0 ? buttonLabels.back : 'Anterior'}
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      disabled={!canProceed}
                      endIcon={isLastStep ? <CheckCircleIcon /> : <NextIcon />}
                      sx={{
                        backgroundColor: '#0e5fa6',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#0d5391',
                        },
                        '&:disabled': {
                          backgroundColor: '#94a3b8',
                        },
                      }}
                    >
                      {isLastStep ? buttonLabels.next : 'Siguiente documento'}
                    </Button>
                  </Stack>
                </Box>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      {/* Resumen cuando todos están completos */}
      {completedSteps.size === totalSteps && totalSteps > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: '#f0fdf4', 
            borderRadius: 2,
            border: '1px solid #86efac',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534' }}>
                ¡Todos los documentos han sido cargados!
              </Typography>
              <Typography variant="body2" sx={{ color: '#15803d' }}>
                Puede continuar con el siguiente paso del proceso.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default FileUploadWizard;
