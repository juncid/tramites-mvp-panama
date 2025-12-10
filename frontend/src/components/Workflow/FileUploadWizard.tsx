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
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CompareArrows as CompareArrowsIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { workflowService } from '../../services/workflow.service';
import { ppshService } from '../../services/ppsh.service';
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
  onComplete?: (respuestasArchivos?: Record<string, any>) => void;
  onBack?: () => void;
  buttonLabels?: { back?: string; next?: string; complete?: string };
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
  // Clave única para sessionStorage basada en solicitudId
  const storageKey = solicitudId ? `fileUploadWizard_${solicitudId}` : null;
  
  // Función para obtener estado guardado de sessionStorage
  const getStoredState = () => {
    if (!storageKey) return null;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error leyendo sessionStorage:', e);
    }
    return null;
  };
  
  // Función para guardar estado en sessionStorage
  const saveState = (state: { 
    currentStep: number; 
    uploadedFiles: Record<string, any>;
    ocrResults: Record<string, any>;
    lastUpdate: string;
  }) => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn('Error guardando en sessionStorage:', e);
    }
  };
  
  // Inicializar estado desde sessionStorage si existe
  const storedState = getStoredState();
  const [currentStep, setCurrentStep] = useState(storedState?.currentStep || 0);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, any>>(storedState?.uploadedFiles || {});
  const [ocrResults, setOcrResults] = useState<Record<string, any>>(storedState?.ocrResults || {});
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Ref para controlar si ya mostramos el modal tras restaurar estado
  const hasShownRestoredModal = useRef(false);
  // Ref para controlar si ya hicimos scroll al archivo
  const hasScrolledToFile = useRef(false);
  
  // DEBUG: Log de estado restaurado
  if (storedState) {
  }
  
  // Estados para los modales de OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReadErrorModal, setShowReadErrorModal] = useState(false);
  
  // Estado para modal de validación OCR fallida
  const [showOCRValidationError, setShowOCRValidationError] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  
  // Estado para datos de comparación OCR - se inicializa como null y se restaura en useEffect
  const [ocrComparisonData, setOcrComparisonData] = useState<OCRComparisonData | null>(null);
  
  // Estado para controlar si ya cargamos documentos del servidor
  const documentosServerCargados = useRef(false);
  
  // 🔄 Efecto para cargar documentos existentes del servidor al iniciar
  React.useEffect(() => {
    const cargarDocumentosExistentes = async () => {
      if (!solicitudId || documentosServerCargados.current) return;
      
      // Solo cargar si no hay archivos en sessionStorage
      const storedState = getStoredState();
      if (storedState?.uploadedFiles && Object.keys(storedState.uploadedFiles).length > 0) {
        return;
      }
      
      documentosServerCargados.current = true;
      
      try {
        const documentos = await ppshService.getDocumentos(solicitudId);
        
        if (documentos && documentos.length > 0) {
          const archivosExistentes: Record<string, any> = {};
          const ocrResultsExistentes: Record<string, any> = {};
          
          // Mapear documentos a los campos del wizard
          for (const doc of documentos) {
            // El campo se guarda en observaciones como "Documento: CODIGO"
            const codigoMatch = doc.observaciones?.match(/Documento: (\w+)/);
            const codigoCampo = codigoMatch ? codigoMatch[1] : null;
            
            if (codigoCampo) {
              // Solo guardar el más reciente para cada campo
              if (!archivosExistentes[codigoCampo] || 
                  new Date(doc.uploaded_at) > new Date(archivosExistentes[codigoCampo].uploaded_at)) {
                
                archivosExistentes[codigoCampo] = {
                  nombre: doc.nombre_archivo,
                  size: doc.tamano_bytes,
                  uploaded_at: doc.uploaded_at,
                  id_documento: doc.id_documento,
                  ocr_procesado: doc.ocr_resultado?.estado_ocr === 'COMPLETADO',
                  ocr_pendiente: false,
                  desde_servidor: true, // Flag para saber que viene del servidor
                };
                
                // Si hay resultado OCR, guardarlo también
                if (doc.ocr_resultado?.datos_estructurados) {
                  const datos = doc.ocr_resultado.datos_estructurados;
                  ocrResultsExistentes[codigoCampo] = {
                    campos_validados: {},
                    campos_no_encontrados: [],
                    campos_con_discrepancia: [],
                    datos_ingresados: {
                      pasaporte: datosSolicitante?.pasaporte || '',
                      nacionalidad: datosSolicitante?.nacionalidad || '',
                      nombres: datosSolicitante?.nombres || '',
                      apellidos: datosSolicitante?.apellidos || '',
                      fecha_nacimiento: datosSolicitante?.fecha_nacimiento || '',
                    },
                    datos_ocr_raw: datos,
                    texto_ocr_completo: '',
                  };
                }
              }
            }
          }
          
          
          // Verificar si tenemos todos los campos obligatorios
          const camposCompletos = camposOrdenados.every(campo => 
            !campo.es_obligatoria || archivosExistentes[campo.codigo]
          );
          
          if (Object.keys(archivosExistentes).length > 0) {
            setUploadedFiles(archivosExistentes);
            setOcrResults(ocrResultsExistentes);
            
            // Si todos los campos están completos, ir al último paso
            if (camposCompletos) {
              setCurrentStep(camposOrdenados.length - 1);
            }
          }
        }
      } catch (err) {
        console.warn('Error cargando documentos del servidor:', err);
      }
    };
    
    cargarDocumentosExistentes();
  }, [solicitudId]);
  
  // Guardar estado cuando cambia
  React.useEffect(() => {
    if (storageKey) {
      saveState({
        currentStep,
        uploadedFiles,
        ocrResults,
        lastUpdate: new Date().toISOString(),
      });
    }
  }, [currentStep, uploadedFiles, ocrResults, storageKey]);

  // Ordenar campos por orden
  const camposOrdenados = [...campos].sort((a, b) => a.orden - b.orden);
  const totalSteps = camposOrdenados.length;
  const campoActual = camposOrdenados[currentStep];
  
  // Ref para evitar múltiples llamadas al OCR
  const ocrCheckInProgress = useRef(false);

  // 🔄 Efecto para recuperar estado de archivos con OCR pendiente
  React.useEffect(() => {
    const checkPendingOCR = async () => {
      if (!campoActual || !solicitudId) return;
      if (ocrCheckInProgress.current) return; // Evitar llamadas duplicadas
      
      const storedFile = uploadedFiles[campoActual.codigo];
      
      // Si hay un archivo con OCR pendiente, consultar el resultado con polling
      if (storedFile?.ocr_pendiente && storedFile?.id_documento) {
        ocrCheckInProgress.current = true;
        setIsLoadingOCR(true);
        
        // Polling: consultar cada 2 segundos hasta que el OCR termine (máximo 30 segundos)
        const MAX_INTENTOS = 15;
        const INTERVALO_MS = 2000;
        
        let ocrCompletado = false;
        let validacionOCR = null;
        
        try {
          for (let intento = 1; intento <= MAX_INTENTOS && !ocrCompletado; intento++) {
            
            try {
              validacionOCR = await workflowService.validarOCR(solicitudId, storedFile.id_documento);
              
              // Si tenemos datos OCR, el procesamiento terminó
              if (validacionOCR.datos_ocr_raw && Object.keys(validacionOCR.datos_ocr_raw).length > 0) {
                ocrCompletado = true;
              } else if (validacionOCR.mensaje && !validacionOCR.mensaje.includes('aún no ha procesado')) {
                // El OCR respondió pero sin datos estructurados
                ocrCompletado = true;
              } else {
                // Esperar antes del siguiente intento
                if (intento < MAX_INTENTOS) {
                  await new Promise(resolve => setTimeout(resolve, INTERVALO_MS));
                }
              }
            } catch (err) {
              console.warn(`⚠️ Error en intento ${intento}:`, err);
              if (intento < MAX_INTENTOS) {
                await new Promise(resolve => setTimeout(resolve, INTERVALO_MS));
              }
            }
          }
          
          if (validacionOCR && validacionOCR.datos_ocr_raw && Object.keys(validacionOCR.datos_ocr_raw).length > 0) {
            
            // Crear datos de comparación
            const comparisonData: OCRComparisonData = {
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
            };
            
            setOcrComparisonData(comparisonData);
            
            // Actualizar archivo como procesado
            const archivoActualizado = {
              ...storedFile,
              ocr_pendiente: false,
              ocr_procesado: true,
            };
            setUploadedFiles(prev => ({
              ...prev,
              [campoActual.codigo]: archivoActualizado
            }));
            
            // Guardar resultado OCR
            setOcrResults(prev => ({
              ...prev,
              [campoActual.codigo]: comparisonData
            }));
            
            // Evaluar qué modal mostrar basado en campos encontrados
            const resumenValidacion = validacionOCR.datos_ocr_raw?.resumen_validacion;
            const validacionesDetalle = validacionOCR.datos_ocr_raw?.validaciones || {};
            const camposEncontradosCount = resumenValidacion?.campos_encontrados 
              ?? Object.values(validacionesDetalle).filter((v: any) => v.encontrado).length;
            const camposConDiscrepanciaCount = validacionOCR.campos_con_discrepancia?.length || 0;
            
            console.log('📊 Evaluación modal (checkPendingOCR):', {
              camposEncontrados: camposEncontradosCount,
              camposConDiscrepancia: camposConDiscrepanciaCount
            });
            
            // Caso 1: 0 campos = error rojo
            if (camposEncontradosCount === 0) {
              setShowReadErrorModal(true);
            }
            // Caso 2: <4 campos o discrepancias = warning amarillo
            else if (camposConDiscrepanciaCount > 0 || camposEncontradosCount < 4) {
              setPendingUpload({
                file: new File([], storedFile.nombre), // Archivo dummy para el handler
                resultado: { id_documento: storedFile.id_documento },
                campo: campoActual
              });
              setShowOCRValidationError(true);
            }
            // Caso 3: >= 4 campos = éxito verde
            else {
              setShowSuccessModal(true);
            }
          }
        } catch (err) {
          console.warn('Error recuperando OCR:', err);
        } finally {
          setIsLoadingOCR(false);
          ocrCheckInProgress.current = false;
        }
      }
      // Si hay resultado OCR guardado pero no está en el estado actual, restaurarlo
      else if (ocrResults[campoActual.codigo] && !ocrComparisonData) {
        setOcrComparisonData(ocrResults[campoActual.codigo]);
        // No mostrar modal automáticamente al restaurar - solo mostrar la tabla
      }
      // Si hay archivo subido pero no tenemos datos OCR, intentar obtenerlos
      else if (storedFile?.id_documento && !storedFile?.ocr_pendiente && !ocrResults[campoActual.codigo]) {
        setIsLoadingOCR(true);
        
        try {
          const validacionOCR = await workflowService.validarOCR(solicitudId, storedFile.id_documento);
          
          if (validacionOCR.datos_ocr_raw && Object.keys(validacionOCR.datos_ocr_raw).length > 0) {
            
            const comparisonData: OCRComparisonData = {
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
            };
            
            setOcrComparisonData(comparisonData);
            setOcrResults(prev => ({
              ...prev,
              [campoActual.codigo]: comparisonData
            }));
            
            // Evaluar qué modal mostrar (mismo logic que checkPendingOCR)
            const resumenValidacion = validacionOCR.datos_ocr_raw?.resumen_validacion;
            const validacionesDetalle = validacionOCR.datos_ocr_raw?.validaciones || {};
            const camposEncontradosCount = resumenValidacion?.campos_encontrados 
              ?? Object.values(validacionesDetalle).filter((v: any) => v.encontrado).length;
            const camposConDiscrepanciaCount = validacionOCR.campos_con_discrepancia?.length || 0;
            
            console.log('📊 Evaluación modal (archivo existente):', {
              camposEncontrados: camposEncontradosCount,
              camposConDiscrepancia: camposConDiscrepanciaCount
            });
            
            if (camposEncontradosCount === 0) {
              setShowReadErrorModal(true);
            } else if (camposConDiscrepanciaCount > 0 || camposEncontradosCount < 4) {
              setPendingUpload({
                file: new File([], storedFile.nombre),
                resultado: { id_documento: storedFile.id_documento },
                campo: campoActual
              });
              setShowOCRValidationError(true);
            } else {
              setShowSuccessModal(true);
            }
          }
        } catch (err) {
          console.warn('Error obteniendo OCR:', err);
        } finally {
          setIsLoadingOCR(false);
        }
      }
    };
    
    checkPendingOCR();
  }, [campoActual?.codigo, solicitudId]);

  // Resetear refs de scroll cuando cambia el paso actual
  React.useEffect(() => {
    hasScrolledToFile.current = false;
    // Limpiar ocrComparisonData al cambiar de paso para cargar el del nuevo paso
    setOcrComparisonData(null);
  }, [currentStep]);

  // Verificar si el paso actual tiene archivo cargado (considerando también uploadedFiles de sessionStorage)
  const isCurrentStepComplete = (): boolean => {
    if (!campoActual) return false;
    // Primero verificar en uploadedFiles (sessionStorage)
    if (uploadedFiles[campoActual.codigo]) return true;
    // Luego verificar en respuestas (props)
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
      const nextStep = currentStep + 1;
      
      // Guardar estado ANTES de cambiar el paso (por si hay un reload)
      if (storageKey) {
        const stateToSave = {
          currentStep: nextStep,
          uploadedFiles,
          ocrResults,
          lastUpdate: new Date().toISOString(),
        };
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } catch (e) {
          console.warn('Error guardando estado al avanzar:', e);
        }
      }
      
      setCurrentStep(nextStep);
    } else if (onComplete) {
      // Último paso - construir respuestas de archivos y completar etapa
      
      // Construir objeto de respuestas con todos los archivos subidos
      const respuestasArchivos: Record<string, any> = {};
      for (const [codigo, archivoInfo] of Object.entries(uploadedFiles)) {
        if (archivoInfo) {
          respuestasArchivos[codigo] = [archivoInfo];
          // También sincronizar al padre por si acaso
          onAnswerChange(codigo, [archivoInfo]);
        }
      }
      
      
      // Limpiar sessionStorage ya que se completó exitosamente
      if (storageKey) {
        sessionStorage.removeItem(storageKey);
      }
      
      // Llamar onComplete con las respuestas de archivos
      console.log('✅ Llamando onComplete() con respuestas');
      onComplete(respuestasArchivos);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Volver al paso anterior del wizard
      const prevStep = currentStep - 1;
      
      // Guardar estado ANTES de cambiar el paso
      if (storageKey) {
        const stateToSave = {
          currentStep: prevStep,
          uploadedFiles,
          ocrResults,
          lastUpdate: new Date().toISOString(),
        };
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } catch (e) {
          console.warn('Error guardando estado al retroceder:', e);
        }
      }
      
      setCurrentStep(prevStep);
    } else if (onBack) {
      // Primer paso - volver a la etapa anterior
      onBack();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevenir cualquier comportamiento por defecto del navegador
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.target.files;
    
    // Limpiar el input inmediatamente para permitir re-seleccionar el mismo archivo
    // y evitar comportamientos extraños en móviles
    const inputElement = event.target;
    
    if (!files || files.length === 0 || !campoActual) {
      inputElement.value = '';
      return;
    }

    const file = files[0];
    
    // Limpiar el input después de capturar el archivo
    inputElement.value = '';
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

        // ⚡ GUARDAR INMEDIATAMENTE en sessionStorage después de subir
        // Esto asegura que si la página se recarga, tengamos el archivo
        const archivoInfoPendiente = {
          nombre: file.name,
          size: file.size,
          uploaded_at: new Date().toISOString(),
          id_documento: resultado.id_documento,
          ocr_pendiente: true, // Marcamos que el OCR aún no terminó
        };
        setUploadedFiles(prev => ({
          ...prev,
          [campoActual.codigo]: archivoInfoPendiente
        }));
        // Forzar guardado síncrono en sessionStorage
        if (storageKey) {
          const currentState = {
            currentStep,
            uploadedFiles: { ...uploadedFiles, [campoActual.codigo]: archivoInfoPendiente },
            ocrResults,
            lastUpdate: new Date().toISOString(),
          };
          sessionStorage.setItem(storageKey, JSON.stringify(currentState));
          console.log('💾 Estado guardado en sessionStorage (archivo subido, OCR pendiente)');
        }

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
              validacionOCR = await workflowService.validarOCR(solicitudId, resultado.id_documento);
              
              // Si tenemos datos OCR o ya no hay campos "no encontrados" por procesar, el OCR terminó
              if (validacionOCR.datos_ocr_raw && Object.keys(validacionOCR.datos_ocr_raw).length > 0) {
                ocrCompletado = true;
              } else if (validacionOCR.mensaje && !validacionOCR.mensaje.includes('aún no ha procesado')) {
                // El OCR respondió pero sin datos estructurados
                ocrCompletado = true;
              }
            } catch (err) {
              console.warn(`⚠️ Intento ${intento} falló:`, err);
              // Continuar intentando
            }
          }
          
          if (validacionOCR) {
            // DEBUG: Log de datos recibidos
            console.log('📊 validacionOCR completo:', JSON.stringify(validacionOCR, null, 2));
            
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
            console.log('✅ Caso 3: Validación OCR exitosa (4+ campos), mostrando modal de éxito...');
          } else {
            console.warn('❌ No se pudo obtener validación OCR después de todos los intentos');
          }
        }

        // Guardar archivo en sessionStorage
        const archivoInfo = {
          nombre: file.name,
          size: file.size,
          uploaded_at: new Date().toISOString(),
          id_documento: resultado.id_documento,
          ocr_procesado: true,
          ocr_validado: true
        };
        setUploadedFiles(prev => ({
          ...prev,
          [campoActual.codigo]: archivoInfo
        }));
        
        // Guardar resultado OCR en sessionStorage si existe
        if (ocrComparisonData) {
          setOcrResults(prev => ({
            ...prev,
            [campoActual.codigo]: ocrComparisonData
          }));
        }

        // Notificar al padre
        onAnswerChange(campoActual.codigo, [{
          ...archivoInfo,
          file: file,
        }]);

        // Mostrar modal de éxito
        console.log('🎉 Llamando setShowSuccessModal(true)');
        setShowSuccessModal(true);
      } else {
        // Sin solicitudId - guardar archivo localmente (modo preview/desarrollo)
        const archivoInfo = {
          nombre: file.name,
          size: file.size,
          uploaded_at: new Date().toISOString()
        };
        setUploadedFiles(prev => ({
          ...prev,
          [campoActual.codigo]: archivoInfo
        }));
        
        onAnswerChange(campoActual.codigo, [{
          ...archivoInfo,
          file: file,
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
      const archivoInfo = {
        nombre: pendingUpload.file.name,
        size: pendingUpload.file.size,
        uploaded_at: new Date().toISOString(),
        id_documento: pendingUpload.resultado.id_documento,
        ocr_procesado: true,
        ocr_validado: false, // Marcado como no validado
        ocr_fallido: true,   // Flag para revisión manual
        requiere_revision_manual: true
      };

      // Guardar el archivo con flag de OCR fallido
      onAnswerChange(pendingUpload.campo.codigo, [{
        ...archivoInfo,
        file: pendingUpload.file,
      }]);

      // Guardar en uploadedFiles para sessionStorage
      setUploadedFiles(prev => ({
        ...prev,
        [pendingUpload.campo.codigo]: archivoInfo
      }));

      // Guardar resultado OCR en ocrResults para sessionStorage
      if (ocrComparisonData) {
        setOcrResults(prev => ({
          ...prev,
          [pendingUpload.campo.codigo]: {
            ...ocrComparisonData,
            validacion_forzada: true, // Marcar que fue forzado por el usuario
          }
        }));
      }

      // Mostrar modal de éxito (el documento será revisado manualmente)
      setShowSuccessModal(true);
    }
    
    setPendingUpload(null);
    setShowOCRValidationError(false);
  };

  // Manejar cierre del modal de éxito (solo cierra el modal, no avanza al siguiente paso)
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
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
    // Limpiar datos de sessionStorage
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[campoActual.codigo];
      return updated;
    });
    setOcrResults(prev => {
      const updated = { ...prev };
      delete updated[campoActual.codigo];
      return updated;
    });
    // Limpiar datos de comparación OCR
    setOcrComparisonData(null);
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

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA READONLY - Muestra todos los documentos con comparación OCR
  // ═══════════════════════════════════════════════════════════════════════════
  if (readonly) {
    // Mapeo de campos OCR a nombres legibles
    const CAMPOS_OCR_LABELS: Record<string, string> = {
      num_documento: 'Número de Documento',
      primer_nombre: 'Primer Nombre',
      segundo_nombre: 'Segundo Nombre',
      primer_apellido: 'Primer Apellido',
      segundo_apellido: 'Segundo Apellido',
      fecha_nacimiento: 'Fecha de Nacimiento',
      pais_emisor: 'País Emisor',
    };

    // Función para obtener el valor esperado del solicitante
    const getValorEsperado = (key: string): string => {
      if (!datosSolicitante) return '-';
      switch (key) {
        case 'num_documento':
          return datosSolicitante.pasaporte || '-';
        case 'primer_nombre':
        case 'segundo_nombre':
          // Intentar separar nombres si está como string completo
          const nombres = datosSolicitante.nombres?.split(' ') || [];
          return key === 'primer_nombre' ? (nombres[0] || '-') : (nombres.slice(1).join(' ') || '-');
        case 'primer_apellido':
        case 'segundo_apellido':
          const apellidos = datosSolicitante.apellidos?.split(' ') || [];
          return key === 'primer_apellido' ? (apellidos[0] || '-') : (apellidos.slice(1).join(' ') || '-');
        case 'fecha_nacimiento':
          return datosSolicitante.fecha_nacimiento || '-';
        case 'pais_emisor':
          return datosSolicitante.nacionalidad || '-';
        default:
          return '-';
      }
    };

    return (
      <Box>
        {/* Descripción de la etapa */}
        {descripcion && (
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

        {/* Lista de todos los documentos con acordeones */}
        {camposOrdenados.map((campo, index) => {
          const archivo = uploadedFiles[campo.codigo];
          const ocrData = ocrResults[campo.codigo];
          const tieneArchivo = !!archivo;
          const validaciones = ocrData?.datos_ocr_raw?.validaciones || {};
          
          // Calcular si el OCR tiene errores (menos de 4 campos encontrados)
          const camposEncontrados = Object.values(validaciones).filter((v: any) => v?.encontrado).length;
          const ocrFailed = tieneArchivo && campo.requiere_ocr && camposEncontrados < 4;

          return (
            <Accordion 
              key={campo.codigo}
              defaultExpanded={false}
              sx={{ 
                mb: 2,
                borderLeft: `3px solid ${ocrFailed ? '#e90000' : (tieneArchivo ? '#4caf50' : '#9e9e9e')}`,
                borderRadius: '4px !important',
                '&:before': { display: 'none' },
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                backgroundColor: ocrFailed ? '#fef6f6' : '#fff',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: ocrFailed ? '#fef6f6' : '#f9f9f9',
                  borderRadius: '4px',
                  minHeight: '56px',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 500,
                      fontSize: '16px',
                      color: '#333333',
                    }}
                  >
                    {index + 1}. {campo.pregunta}
                    {campo.es_obligatoria && <span style={{ color: '#d32f2f' }}> *</span>}
                  </Typography>
                  {tieneArchivo && (
                    <Typography 
                      sx={{ 
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '13px',
                        color: '#0e5fa6',
                        mt: 0.5,
                      }}
                    >
                      📎 {archivo.nombre}
                    </Typography>
                  )}
                  {!tieneArchivo && (
                    <Typography 
                      sx={{ 
                        color: '#9e9e9e',
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '13px',
                        fontStyle: 'italic',
                        mt: 0.5,
                      }}
                    >
                      No se ha cargado ningún documento
                    </Typography>
                  )}
                </Box>
                {/* Indicador de estado */}
                {tieneArchivo && campo.requiere_ocr && (
                  <Chip 
                    label={ocrFailed ? 'Revisar' : 'OK'}
                    size="small"
                    sx={{ 
                      backgroundColor: ocrFailed ? '#ffebee' : '#e8f5e9',
                      color: ocrFailed ? '#c62828' : '#2e7d32',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  />
                )}
              </AccordionSummary>
              
              <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                {!tieneArchivo ? (
                  <Typography 
                    sx={{ 
                      color: '#9e9e9e',
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      fontStyle: 'italic',
                    }}
                  >
                    No hay información adicional disponible
                  </Typography>
                ) : (
                  <>
                    {/* Grid de comparación OCR */}
                    {campo.requiere_ocr && ocrData ? (
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2,
                      }}>
                        {/* Card: Datos OCR Encontrados */}
                        <Card sx={{ backgroundColor: '#f9f9f9' }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600, 
                                color: ocrFailed ? '#c62828' : '#1e3a5f',
                                mb: 1.5,
                                borderBottom: '1px solid #eee',
                                pb: 0.5,
                              }}
                            >
                              Datos Encontrados por Sistema
                            </Typography>
                            
                            {Object.keys(validaciones).length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {Object.keys(CAMPOS_OCR_LABELS).map((key) => {
                                  const validacion = validaciones[key];
                                  const encontrado = validacion?.encontrado || false;
                                  const valorOCR = validacion?.valor_esperado || '-';
                                  
                                  return (
                                    <Box 
                                      key={key} 
                                      sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        py: 0.25,
                                      }}
                                    >
                                      <Typography 
                                        variant="body2" 
                                        sx={{ color: '#666', fontSize: '13px' }}
                                      >
                                        {CAMPOS_OCR_LABELS[key]}:
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: encontrado ? '#333' : '#999', 
                                          fontWeight: 500,
                                          fontSize: '13px',
                                          ml: 1,
                                          fontStyle: encontrado ? 'normal' : 'italic',
                                        }}
                                      >
                                        {encontrado ? String(valorOCR) : 'No encontrado'}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                                No se encontraron datos estructurados
                              </Typography>
                            )}
                          </CardContent>
                        </Card>

                        {/* Card: Datos Esperados */}
                        <Card sx={{ backgroundColor: '#f9f9f9' }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#1e3a5f',
                                mb: 1.5,
                                borderBottom: '1px solid #eee',
                                pb: 0.5,
                              }}
                            >
                              Datos Esperados
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {Object.keys(CAMPOS_OCR_LABELS).map((key) => (
                                <Box 
                                  key={key} 
                                  sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    py: 0.25,
                                  }}
                                >
                                  <Typography 
                                    variant="body2" 
                                    sx={{ color: '#666', fontSize: '13px' }}
                                  >
                                    {CAMPOS_OCR_LABELS[key]}:
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#333', 
                                      fontWeight: 500,
                                      fontSize: '13px',
                                      ml: 1,
                                    }}
                                  >
                                    {getValorEsperado(key)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ) : (
                      <Typography 
                        sx={{ 
                          color: '#666',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Documento cargado correctamente. No requiere validación OCR.
                      </Typography>
                    )}
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Botón Volver */}
        <Stack 
          direction="row" 
          justifyContent="flex-start" 
          alignItems="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="outlined"
            onClick={onBack}
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
        </Stack>
      </Box>
    );
  }

  // Obtener nombre de archivo: primero de sessionStorage, luego de respuestas
  const storedFile = uploadedFiles[campoActual.codigo];
  const currentFileName = storedFile?.nombre || getFileName(respuestas[campoActual.codigo]);
  
  // Obtener datos OCR del paso actual desde sessionStorage
  const storedOcrResult = ocrResults[campoActual.codigo];
  
  // Si hay OCR guardado y no está en el estado actual, restaurarlo
  React.useEffect(() => {
    if (storedOcrResult && !ocrComparisonData) {
      setOcrComparisonData(storedOcrResult);
    }
  }, [storedOcrResult, ocrComparisonData]);
  
  // ✨ Efecto para hacer scroll cuando se restaura estado con archivo cargado
  // NO mostrar modal automáticamente - el usuario ya vio el resultado antes del reload
  React.useEffect(() => {
    if (storedState && currentFileName && !hasScrolledToFile.current) {
      hasScrolledToFile.current = true;
      
      // Scroll al contenedor del archivo con un pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        if (fileContainerRef.current) {
          fileContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Agregar un breve highlight visual
          fileContainerRef.current.style.boxShadow = '0 0 0 3px rgba(14, 95, 166, 0.3)';
          setTimeout(() => {
            if (fileContainerRef.current) {
              fileContainerRef.current.style.boxShadow = 'none';
            }
          }, 2000);
        }
      }, 300);
      
      // NO mostrar modal de éxito automáticamente al restaurar estado
      // El usuario ya lo vio antes del reload, y si el OCR falló no queremos confundirlo
      hasShownRestoredModal.current = true; // Marcar como mostrado para evitar futuros intentos
    }
  }, [storedState, currentFileName, storedOcrResult]);

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
          ref={fileContainerRef}
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
            transition: 'box-shadow 0.3s ease',
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
            Cargar archivo
          </Button>
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
        onClose={handleSuccessModalClose}
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
