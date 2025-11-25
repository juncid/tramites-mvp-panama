import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { resolveWorkflowId } from '../config/workflowAliases';
import { OCRLoadingModal, OCRResultModal } from '../components/PPSH';

/**
 * Vista para la Etapa 2: Carga de Poder General
 * 
 * Esta vista permite al usuario:
 * - Ver información sobre el poder general requerido
 * - Cargar el documento de poder general
 * - Avanzar a la siguiente etapa
 * - Modo readonly para visualizar etapas completadas
 */
export const CargaPoderGeneral: React.FC = () => {
  const { instanciaId, id: solicitudId } = useParams<{ instanciaId?: string; id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
  const [documentoId, setDocumentoId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);

  // Estados para los modales de OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ success: boolean; message: string }>({ 
    success: true, 
    message: '' 
  });

  useEffect(() => {
    loadWorkflowInstance();
  }, [instanciaId, solicitudId]);

  const loadWorkflowInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      let numericId: number;

      if (instanciaId) {
        numericId = resolveWorkflowId(instanciaId);
      } else if (solicitudId) {
        // Fetch workflow_instancia_id from solicitud
        const response = await fetch(`http://localhost:8000/api/v1/ppsh/solicitudes/${solicitudId}`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la información de la solicitud');
        }
        const data = await response.json();
        numericId = data.workflow_instancia_id;
      } else {
        throw new Error('No se proporcionó instanciaId ni solicitudId');
      }

      setWorkflowInstanciaId(numericId);
      const instanciaData = await workflowService.getInstancia(numericId);
      setInstancia(instanciaData);
    } catch (err: any) {
      console.error('Error cargando instancia:', err);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleCargarArchivo = () => {
    // Crear input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10 MB');
        return;
      }

      // Validar extensión
      const extensionesPermitidas = ['pdf', 'doc', 'docx'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !extensionesPermitidas.includes(extension)) {
        setError('Solo se permiten archivos PDF, DOC o DOCX');
        return;
      }

      // Iniciar proceso de OCR
      setError(null);
      await processOCR(file);
    };
    
    input.click();
  };

  const processOCR = async (file: File) => {
    // Mostrar modal de carga
    setIsLoadingOCR(true);

    try {
      // Simular proceso de OCR (2.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simular 80% de éxito
      const exito = Math.random() > 0.2;

      setIsLoadingOCR(false);

      if (exito) {
        // OCR exitoso - proceder a subir el archivo
        setUploading(true);

        try {
          // Obtener solicitudId desde metadata de la instancia
          if (!instancia?.metadata_adicional?.ppsh_solicitud_id) {
            throw new Error('No se encontró el ID de solicitud en la instancia');
          }

          const solicitudId = instancia.metadata_adicional.ppsh_solicitud_id;
          
          console.log('📤 Subiendo documento:', file.name);
          const resultado = await workflowService.subirDocumentoEtapa(
            solicitudId,
            file,
            {
              tipo_documento_texto: 'Poder General',
              observaciones: 'Documento cargado en Etapa 2: Carga de Poder General'
            }
          );

          console.log('✅ Documento subido:', resultado);
          setArchivoSubido(file);
          setDocumentoId(resultado.id_documento);

          // Mostrar resultado exitoso
          setOcrResult({
            success: true,
            message: 'Documento procesado y cargado exitosamente'
          });
          setShowResult(true);
          
        } catch (err: any) {
          console.error('Error subiendo documento:', err);
          setOcrResult({
            success: false,
            message: err.message || 'Error al subir el archivo'
          });
          setShowResult(true);
        } finally {
          setUploading(false);
        }
      } else {
        // OCR falló
        setOcrResult({
          success: false,
          message: 'No se pudo procesar el documento. Por favor, verifique que el archivo sea legible y esté en el formato correcto.'
        });
        setShowResult(true);
      }
    } catch (err) {
      setIsLoadingOCR(false);
      setOcrResult({
        success: false,
        message: 'Error al procesar el documento'
      });
      setShowResult(true);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  const handleCancelar = () => {
    // Volver a la vista de etapas
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !instancia) return;

    setCompleting(true);
    setError(null);

    try {
      // Si no hay archivo cargado, simular uno para permitir continuar
      let documentoIdFinal = documentoId;
      let nombreArchivoFinal = archivoSubido?.name || 'documento-dummy.pdf';

      if (!archivoSubido || !documentoId) {
        console.log('⚠️ Modo desarrollo: Creando documento dummy para continuar');
        // Simular documento subido exitosamente
        documentoIdFinal = Math.floor(Math.random() * 9000) + 1000; // ID aleatorio entre 1000-9999
      }

      // Completar Etapa 2: Carga de Poder General
      console.log('Completando Etapa 2: Carga de Poder General');
      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        { 
          CARGA_PODER: 'Archivo cargado',
          documento_id: documentoIdFinal,
          nombre_archivo: nombreArchivoFinal
        },
        'CIUDADANO'
      );

      // Volver a la vista de etapas
      console.log('Etapa completada, volviendo a vista de etapas');
      const baseParam = solicitudId || instanciaId || workflowInstanciaId;
      const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
      navigate(`${basePath}/etapas`);
      
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      setError(err.response?.data?.detail || 'Error al completar la etapa');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Procesos' },
        { label: 'Permiso de Protección de Seguridad Humanitaria' },
        { label: 'Carga de Poder General' },
      ]}
      contentTitle="Carga de Poder General"
      contentDescription={`Para continuar con su solicitud de PPSH, debe cargar el poder general notariado de su representante legal o abogado. Este documento debe estar debidamente apostillado o legalizado según corresponda. El poder debe otorgar facultades suficientes para realizar trámites migratorios ante las autoridades panameñas. Asegúrese de que el documento sea legible y esté en formato PDF.${archivoSubido ? `\n\n✅ Archivo cargado: ${archivoSubido.name} (${(archivoSubido.size / 1024).toFixed(2)} KB)` : ''}`}
      contentSubtitle="Requisitos del documento:"
      actionButton={{
        label: uploading ? 'Subiendo archivo...' : (archivoSubido ? 'Cambiar archivo' : 'Cargar Poder General'),
        icon: <UploadFileIcon />,
        onClick: handleCargarArchivo,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing || uploading}
      error={error}
    >
      {/* Modal de carga OCR */}
      <OCRLoadingModal open={isLoadingOCR} />

      {/* Modal de resultado OCR */}
      <OCRResultModal
        open={showResult}
        tipo={ocrResult.success ? 'success' : 'error'}
        mensaje={ocrResult.message}
        onClose={handleCloseResult}
      />
    </EtapaInformativa>
  );
};
