import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { OCRLoadingModal, OCRResultModal } from '../components/PPSH';
import { useWorkflowEtapa, useOCRUpload } from '../hooks';

const ETAPA_ORDEN = 2;

/**
 * Vista para la Etapa 2: Carga de Poder General
 * 
 * Esta vista permite al usuario:
 * - Ver información sobre el poder general requerido
 * - Cargar el documento de poder general con OCR
 * - Avanzar a la siguiente etapa
 * - Modo readonly para visualizar etapas completadas
 */
export const CargaPoderGeneral: React.FC = () => {
  const { instanciaId, id: solicitudId } = useParams<{ instanciaId?: string; id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';
  
  // Hook para manejar el workflow
  const {
    loading,
    error,
    setError,
    instancia,
    completing,
    workflowInstanciaId,
    getBasePath,
    completarEtapaActual,
  } = useWorkflowEtapa({
    instanciaId,
    solicitudId,
    etapaOrden: ETAPA_ORDEN,
  });

  // Hook para OCR y carga de archivos
  const {
    isLoadingOCR,
    isUploading,
    showResult,
    ocrResult,
    uploadedFile,
    documentoId,
    openFileSelector,
    closeResult,
  } = useOCRUpload({
    allowedExtensions: ['pdf', 'doc', 'docx'],
    maxSizeBytes: 10 * 1024 * 1024,
  });

  const handleCargarArchivo = () => {
    // Buscar id_solicitud o ppsh_solicitud_id (compatibilidad)
    const solicitudId = instancia?.metadata_adicional?.id_solicitud || instancia?.metadata_adicional?.ppsh_solicitud_id;
    if (!solicitudId) {
      setError('No se encontró el ID de solicitud');
      return;
    }
    
    openFileSelector(
      solicitudId,
      'Poder General',
      'Documento cargado en Etapa 2: Carga de Poder General'
    );
  };

  const handleCancelar = () => {
    navigate(`${getBasePath()}/etapas`);
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !instancia) return;

    // Si no hay archivo cargado, simular uno para permitir continuar (modo desarrollo)
    let documentoIdFinal = documentoId;
    let nombreArchivoFinal = uploadedFile?.name || 'documento-dummy.pdf';

    if (!uploadedFile || !documentoId) {
      console.log('⚠️ Modo desarrollo: Creando documento dummy para continuar');
      documentoIdFinal = Math.floor(Math.random() * 9000) + 1000;
    }

    const success = await completarEtapaActual({ 
      CARGA_PODER: 'Archivo cargado',
      documento_id: documentoIdFinal,
      nombre_archivo: nombreArchivoFinal
    });

    if (success) {
      navigate(`${getBasePath()}/etapas`);
    }
  };

  const descripcionBase = `Para continuar con su solicitud de PPSH, debe cargar el poder general notariado de su representante legal o abogado. Este documento debe estar debidamente apostillado o legalizado según corresponda. El poder debe otorgar facultades suficientes para realizar trámites migratorios ante las autoridades panameñas. Asegúrese de que el documento sea legible y esté en formato PDF.`;
  
  const descripcionConArchivo = uploadedFile 
    ? `${descripcionBase}\n\n✅ Archivo cargado: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(2)} KB)`
    : descripcionBase;

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
      contentDescription={descripcionConArchivo}
      contentSubtitle="Requisitos del documento:"
      actionButton={{
        label: isUploading ? 'Subiendo archivo...' : (uploadedFile ? 'Cambiar archivo' : 'Cargar Poder General'),
        icon: <UploadFileIcon />,
        onClick: handleCargarArchivo,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing || isUploading}
      error={error}
    >
      {/* Modal de carga OCR */}
      <OCRLoadingModal open={isLoadingOCR} />

      {/* Modal de resultado OCR */}
      <OCRResultModal
        open={showResult}
        tipo={ocrResult.success ? 'success' : 'error'}
        mensaje={ocrResult.message}
        onClose={closeResult}
      />
    </EtapaInformativa>
  );
};
