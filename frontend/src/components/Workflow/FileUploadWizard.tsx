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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CompareArrows as CompareArrowsIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import { workflowService } from '../../services/workflow.service';
import { OCRValidationErrorModal } from '../PPSH/OCRValidationErrorModal';
import { OCRSuccessModal } from '../PPSH/OCRSuccessModal';
import { OCRReadErrorModal } from '../PPSH/OCRReadErrorModal';

// Interface para datos de comparación OCR
interface OCRComparisonData {
  campos_validados: Record<string, string>;
  campos_no_encontrados: string[];
  campos_con_discrepancia: Array<{
    campo: string;
    valor_ingresado: string;
    valor_ocr: string;
  }>;
  datos_ingresados: Record<string, string>;
  datos_ocr_raw?: Record<string, any>; // Datos estructurados del JSON OCR
  texto_ocr_completo?: string; // Texto completo extraído por OCR sin filtros
}

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
  datosSolicitante?: {
    pasaporte?: string;
    nacionalidad?: string;
    nombres?: string;
    apellidos?: string;
    fecha_nacimiento?: string;
  };
}

// Estado para almacenar temporalmente el archivo pendiente de validación OCR
interface PendingUpload {
  file: File;
  resultado: any;
  campo: CampoArchivo;
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
  // titulo - desestructurado pero no usado actualmente
  descripcion,
  datosSolicitante,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  
  // DEBUG: Log de datosSolicitante recibidos
  console.log('🔍 FileUploadWizard - datosSolicitante:', datosSolicitante);
  console.log('🔍 FileUploadWizard - solicitudId:', solicitudId);
  
  // Estados para los modales de OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReadErrorModal, setShowReadErrorModal] = useState(false);
  
  // Estado para modal de validación OCR fallida
  const [showOCRValidationError, setShowOCRValidationError] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  
  // Estado para datos de comparación OCR
  const [ocrComparisonData, setOcrComparisonData] = useState<OCRComparisonData | null>(null);

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
      alert(`El archivo es muy grande. Tamaño máximo: ${maxSizeMb} MB`);
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
        alert(`Tipo de archivo no permitido. Formatos permitidos: ${extensionesNormalizadas.join(', ').toUpperCase()}`);
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

        // Esperar un momento para que el OCR procese el documento
        // Luego validar OCR contra datos del solicitante
        if (campoActual.requiere_ocr && resultado.id_documento) {
          // Polling: consultar cada 2 segundos hasta que el OCR termine (máximo 30 segundos)
          const MAX_INTENTOS = 15; // 15 intentos * 2 segundos = 30 segundos máximo
          const INTERVALO_MS = 2000; // 2 segundos entre cada intento
          
          let ocrCompletado = false;
          let validacionOCR = null;
          
          for (let intento = 1; intento <= MAX_INTENTOS && !ocrCompletado; intento++) {
            // Esperar antes de cada intento
            await new Promise(resolve => setTimeout(resolve, INTERVALO_MS));
            
            try {
              console.log(`🔄 Intento ${intento}/${MAX_INTENTOS} - Verificando OCR...`);
              validacionOCR = await workflowService.validarOCR(solicitudId, resultado.id_documento);
              
              // Si tenemos datos OCR o ya no hay campos "no encontrados" por procesar, el OCR terminó
              if (validacionOCR.datos_ocr_raw && Object.keys(validacionOCR.datos_ocr_raw).length > 0) {
                ocrCompletado = true;
                console.log(`✅ OCR completado en intento ${intento}`);
              } else if (validacionOCR.mensaje && !validacionOCR.mensaje.includes('aún no ha procesado')) {
                // El OCR respondió pero sin datos estructurados
                ocrCompletado = true;
                console.log(`⚠️ OCR respondió sin datos estructurados en intento ${intento}`);
              }
            } catch (err) {
              console.warn(`⚠️ Intento ${intento} falló:`, err);
              // Continuar intentando
            }
          }
          
          if (validacionOCR) {
            // DEBUG: Log de datos recibidos
            console.log('📊 validacionOCR completo:', JSON.stringify(validacionOCR, null, 2));
            console.log('📊 datos_ocr_raw:', validacionOCR.datos_ocr_raw);
            console.log('📊 texto_ocr_completo:', validacionOCR.texto_ocr_completo);
            
            // Guardar datos de comparación para mostrar en la tabla
            setOcrComparisonData({
              campos_validados: validacionOCR.campos_validados || {},
              campos_no_encontrados: validacionOCR.campos_no_encontrados || [],
              campos_con_discrepancia: validacionOCR.campos_con_discrepancia || [],
              datos_ingresados: {
                pasaporte: datosSolicitante?.pasaporte || '',
                nacionalidad: datosSolicitante?.nacionalidad || '',
                nombres: datosSolicitante?.nombres || '',
                apellidos: datosSolicitante?.apellidos || '',
                fecha_nacimiento: datosSolicitante?.fecha_nacimiento || '',
              },
              datos_ocr_raw: validacionOCR.datos_ocr_raw || {},
              texto_ocr_completo: validacionOCR.texto_ocr_completo || '',
            });
            
            // Obtener datos del resumen de validación interno (más preciso)
            const resumenValidacion = validacionOCR.datos_ocr_raw?.resumen_validacion;
            const validacionesDetalle = validacionOCR.datos_ocr_raw?.validaciones || {};
            
            // Contar campos encontrados desde el resumen interno o desde validaciones
            const camposEncontradosCount = resumenValidacion?.campos_encontrados 
              ?? Object.values(validacionesDetalle).filter((v: any) => v.encontrado).length;
            const camposTotales = resumenValidacion?.campos_totales 
              ?? Object.keys(validacionesDetalle).length;
            const validacionExitosaReal = resumenValidacion?.validacion_exitosa 
              ?? validacionOCR.validacion_exitosa;
            
            // Campos con discrepancia del nivel superior
            const camposConDiscrepanciaCount = validacionOCR.campos_con_discrepancia?.length || 0;
            
            console.log('📊 Resultado OCR:', {
              camposEncontrados: camposEncontradosCount,
              camposTotales: camposTotales,
              camposConDiscrepancia: camposConDiscrepanciaCount,
              validacionExitosaResumen: validacionExitosaReal,
              validacionExitosaSuperior: validacionOCR.validacion_exitosa,
              porcentaje: resumenValidacion?.porcentaje
            });
            
            // Caso 1: OCR no pudo leer nada del documento (0 campos encontrados)
            if (camposEncontradosCount === 0) {
              // Mostrar modal rojo "No pudimos leer la información"
              setShowReadErrorModal(true);
              setIsLoadingOCR(false);
              return;
            }
            
            // Caso 2: Hay discrepancias o pocos campos encontrados (1-3 de 6)
            // Mostrar modal amarillo "No pudimos validar el documento"
            if (camposConDiscrepanciaCount > 0 || camposEncontradosCount < 4) {
              setPendingUpload({
                file,
                resultado,
                campo: campoActual
              });
              setIsLoadingOCR(false);
              setShowOCRValidationError(true);
              return;
            }
            
            // Caso 3: Validación exitosa - continúa al flujo de éxito abajo
          } else {
            console.warn('❌ No se pudo obtener validación OCR después de todos los intentos');
          }
        }

        // Guardar archivo con datos del servidor
        onAnswerChange(campoActual.codigo, [{
          nombre: file.name,
          size: file.size,
          file: file,
          uploaded_at: new Date().toISOString(),
          id_documento: resultado.id_documento,
          ocr_procesado: true,
          ocr_validado: true
        }]);

        // Mostrar modal de éxito
        setShowSuccessModal(true);
      } else {
        // Sin solicitudId - guardar archivo localmente (modo preview/desarrollo)
        onAnswerChange(campoActual.codigo, [{
          nombre: file.name,
          size: file.size,
          file: file,
          uploaded_at: new Date().toISOString()
        }]);

        // Mostrar modal de éxito
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error('❌ Error procesando documento:', err);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Error response:', err?.response?.data);
      
      // Para errores generales, mostrar modal de error de lectura
      // Solo si no hay otro modal ya visible
      if (!showOCRValidationError && !showSuccessModal) {
        setShowReadErrorModal(true);
      }
    } finally {
      setIsLoadingOCR(false);
    }
  };

  // Manejar cuando el usuario quiere enviar de todos modos (OCR fallido)
  const handleEnviarDeTodosModos = () => {
    if (pendingUpload) {
      // Guardar el archivo con flag de OCR fallido
      onAnswerChange(pendingUpload.campo.codigo, [{
        nombre: pendingUpload.file.name,
        size: pendingUpload.file.size,
        file: pendingUpload.file,
        uploaded_at: new Date().toISOString(),
        id_documento: pendingUpload.resultado.id_documento,
        ocr_procesado: true,
        ocr_validado: false, // Marcado como no validado
        ocr_fallido: true,   // Flag para revisión manual
        requiere_revision_manual: true
      }]);

      // Mostrar modal de éxito (el documento será revisado manualmente)
      setShowSuccessModal(true);
    }
    
    setPendingUpload(null);
    setShowOCRValidationError(false);
  };

  // Manejar cuando el usuario cierra el modal de error OCR (para subir otro archivo)
  const handleCloseOCRValidationError = () => {
    setPendingUpload(null);
    setShowOCRValidationError(false);
    // Limpiar el input para permitir seleccionar otro archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    if (!campoActual) return;
    onAnswerChange(campoActual.codigo, []);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Limpiar datos de comparación OCR
    setOcrComparisonData(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
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

  // Obtener extensiones permitidas para el accept del input
  // Permitir cualquier archivo si no hay restricciones definidas
  // En móvil, agregar image/* para permitir captura de fotos
  const getAcceptTypes = () => {
    if (!campoActual.extensiones_permitidas?.length) return '*/*';
    const extensiones = campoActual.extensiones_permitidas
      .map(ext => `.${ext.toLowerCase().replace('.', '')}`)
      .join(',');
    // Agregar image/* para permitir captura de fotos en móvil
    return `${extensiones},image/*`;
  };
  const acceptTypes = getAcceptTypes();

  // Detectar si es dispositivo móvil para mostrar opción de cámara
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

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

        {/* Input oculto para seleccionar archivo */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={acceptTypes}
          onChange={handleFileSelect}
          disabled={readonly}
        />
        
        {/* Input oculto para cámara (solo móvil) */}
        {isMobile && (
          <input
            type="file"
            ref={cameraInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileSelect}
            disabled={readonly}
            capture="environment"
          />
        )}

        {/* Contenedor de botones */}
        <Box sx={{ display: 'flex', gap: 1, ml: 2, flexWrap: 'wrap' }}>
          {/* Botón Cargar archivo */}
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
              textTransform: 'none',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#788093',
              '&:hover': {
                backgroundColor: '#e4e6e8',
              },
            }}
          >
            {isMobile ? 'Archivo' : 'Cargar archivo'}
          </Button>

          {/* Botón Tomar foto (solo móvil) */}
          {isMobile && (
            <Button
              variant="text"
              startIcon={<CameraAltIcon sx={{ fontSize: 16 }} />}
              onClick={triggerCameraInput}
              disabled={readonly}
              sx={{
                backgroundColor: '#e3f2fd',
                borderRadius: '2px',
                height: '32px',
                px: 1,
                textTransform: 'none',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                color: '#0e5fa6',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                },
              }}
            >
              Tomar foto
            </Button>
          )}
        </Box>

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

      {/* Tabla de comparación OCR - Valores ingresados vs OCR */}
      {ocrComparisonData && isCurrentStepComplete() && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CompareArrowsIcon sx={{ color: '#0e5fa6', mr: 1 }} />
            <Typography
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                color: '#333333',
              }}
            >
              Comparación de datos - Valores ingresados vs OCR
            </Typography>
          </Box>
          
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              maxWidth: '800px',
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell 
                    sx={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333333',
                      borderBottom: '2px solid #e0e0e0',
                      width: '35%',
                    }}
                  >
                    Campo
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333333',
                      borderBottom: '2px solid #e0e0e0',
                      width: '45%',
                    }}
                  >
                    Valor OCR
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333333',
                      borderBottom: '2px solid #e0e0e0',
                      width: '20%',
                      textAlign: 'center',
                    }}
                  >
                    Estado
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Generar filas dinámicamente desde los datos de validación */}
                {(() => {
                  // Mapeo de campos del nuevo formato a nombres legibles
                  const camposMapping = [
                    { key: 'num_documento', label: 'Pasaporte' },
                    { key: 'pais_emisor', label: 'Nacionalidad' },
                    { key: 'primer_nombre', label: 'Primer Nombre' },
                    { key: 'segundo_nombre', label: 'Segundo Nombre' },
                    { key: 'primer_apellido', label: 'Primer Apellido' },
                    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento' },
                  ];
                  
                  // Obtener validaciones del nuevo formato (datos_ocr_raw.validaciones)
                  const validaciones = ocrComparisonData.datos_ocr_raw?.validaciones || {};
                  
                  return camposMapping.map((campo) => {
                    const validacion = validaciones[campo.key];
                    const encontrado = validacion?.encontrado || false;
                    const valorOCR = validacion?.valor_esperado || '-';
                    const tipoCoincidencia = validacion?.tipo_coincidencia;
                    
                    return (
                      <TableRow key={campo.key}>
                        <TableCell sx={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', color: '#666666' }}>
                          {campo.label}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', color: '#333333' }}>
                          {encontrado ? `${valorOCR} (${tipoCoincidencia})` : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {encontrado ? (
                            <Chip label="✓ Encontrado" size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '12px' }} />
                          ) : (
                            <Chip label="✗ No encontrado" size="small" sx={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '12px' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

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

        {/* Botón Siguiente - Solo mostrar si no es readonly */}
        {!readonly && (
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
        )}
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

      {/* Modal de Éxito OCR */}
      <OCRSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Modal de Error de Lectura OCR */}
      <OCRReadErrorModal
        open={showReadErrorModal}
        onClose={() => setShowReadErrorModal(false)}
      />

      {/* Modal de Error de Validación OCR */}
      <OCRValidationErrorModal
        open={showOCRValidationError}
        onClose={handleCloseOCRValidationError}
        onEnviarDeTodosModos={handleEnviarDeTodosModos}
      />
    </Box>
  );
};

export default FileUploadWizard;
