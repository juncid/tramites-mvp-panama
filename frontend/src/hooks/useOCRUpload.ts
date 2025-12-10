import { useState, useCallback } from 'react';
import { workflowService } from '../services/workflow.service';

interface OCRResult {
  success: boolean;
  message: string;
}

interface UseOCRUploadOptions {
  /** Extensiones permitidas (sin punto). Default: ['pdf', 'doc', 'docx'] */
  allowedExtensions?: string[];
  /** Tamaño máximo en bytes. Default: 10MB */
  maxSizeBytes?: number;
  /** Simular OCR (para desarrollo). Default: true */
  simulateOCR?: boolean;
  /** Probabilidad de éxito del OCR simulado (0-1). Default: 0.8 */
  simulatedSuccessRate?: number;
  /** Tiempo de simulación OCR en ms. Default: 2500 */
  simulatedDelayMs?: number;
}

interface UseOCRUploadReturn {
  /** Estado de carga del OCR */
  isLoadingOCR: boolean;
  /** Estado de subida del archivo */
  isUploading: boolean;
  /** Mostrar modal de resultado */
  showResult: boolean;
  /** Resultado del OCR */
  ocrResult: OCRResult;
  /** Archivo subido */
  uploadedFile: File | null;
  /** ID del documento subido */
  documentoId: number | null;
  /** Error de validación */
  validationError: string | null;
  /** Procesar archivo con OCR */
  processFile: (
    file: File, 
    solicitudId: number, 
    tipoDocumento: string,
    observaciones?: string
  ) => Promise<boolean>;
  /** Abrir selector de archivos y procesar */
  openFileSelector: (
    solicitudId: number, 
    tipoDocumento: string,
    observaciones?: string
  ) => void;
  /** Cerrar modal de resultado */
  closeResult: () => void;
  /** Resetear estado */
  reset: () => void;
}

/**
 * Hook para manejar la carga de archivos con procesamiento OCR
 * 
 * @example
 * ```tsx
 * const {
 *   isLoadingOCR,
 *   showResult,
 *   ocrResult,
 *   uploadedFile,
 *   openFileSelector,
 *   closeResult
 * } = useOCRUpload();
 * 
 * // Abrir selector y procesar
 * openFileSelector(solicitudId, 'Poder General', 'Documento de etapa 2');
 * ```
 */
export function useOCRUpload(options: UseOCRUploadOptions = {}): UseOCRUploadReturn {
  const {
    allowedExtensions = ['pdf', 'doc', 'docx'],
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    simulateOCR = true,
    simulatedSuccessRate = 0.8,
    simulatedDelayMs = 2500,
  } = options;

  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult>({ success: true, message: '' });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentoId, setDocumentoId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSizeBytes) {
      const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
      return `El archivo no debe superar los ${maxMB} MB`;
    }

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return `Solo se permiten archivos: ${allowedExtensions.join(', ').toUpperCase()}`;
    }

    return null;
  }, [allowedExtensions, maxSizeBytes]);

  const processFile = useCallback(async (
    file: File,
    solicitudId: number,
    tipoDocumento: string,
    observaciones?: string
  ): Promise<boolean> => {
    // Validar archivo
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setOcrResult({ success: false, message: error });
      setShowResult(true);
      return false;
    }

    setValidationError(null);
    setIsLoadingOCR(true);

    try {
      // Simular o ejecutar OCR real
      if (simulateOCR) {
        await new Promise(resolve => setTimeout(resolve, simulatedDelayMs));
        const success = Math.random() < simulatedSuccessRate;
        
        if (!success) {
          setIsLoadingOCR(false);
          setOcrResult({
            success: false,
            message: 'No se pudo procesar el documento. Por favor, verifique que el archivo sea legible y esté en el formato correcto.'
          });
          setShowResult(true);
          return false;
        }
      }

      setIsLoadingOCR(false);
      setIsUploading(true);

      // Subir documento
      const resultado = await workflowService.subirDocumentoEtapa(
        solicitudId,
        file,
        {
          tipo_documento_texto: tipoDocumento,
          observaciones: observaciones || `Documento: ${tipoDocumento}`
        }
      );

      setUploadedFile(file);
      setDocumentoId(resultado.id_documento);
      setOcrResult({
        success: true,
        message: 'Documento procesado y cargado exitosamente'
      });
      setShowResult(true);
      return true;

    } catch (err: any) {
      console.error('Error procesando/subiendo documento:', err);
      setOcrResult({
        success: false,
        message: err.message || 'Error al procesar el documento'
      });
      setShowResult(true);
      return false;
    } finally {
      setIsLoadingOCR(false);
      setIsUploading(false);
    }
  }, [validateFile, simulateOCR, simulatedSuccessRate, simulatedDelayMs]);

  const openFileSelector = useCallback((
    solicitudId: number,
    tipoDocumento: string,
    observaciones?: string
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = allowedExtensions.map(ext => `.${ext}`).join(',');
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        await processFile(file, solicitudId, tipoDocumento, observaciones);
      }
    };
    
    input.click();
  }, [allowedExtensions, processFile]);

  const closeResult = useCallback(() => {
    setShowResult(false);
  }, []);

  const reset = useCallback(() => {
    setIsLoadingOCR(false);
    setIsUploading(false);
    setShowResult(false);
    setOcrResult({ success: true, message: '' });
    setUploadedFile(null);
    setDocumentoId(null);
    setValidationError(null);
  }, []);

  return {
    isLoadingOCR,
    isUploading,
    showResult,
    ocrResult,
    uploadedFile,
    documentoId,
    validationError,
    processFile,
    openFileSelector,
    closeResult,
    reset,
  };
}

export default useOCRUpload;
