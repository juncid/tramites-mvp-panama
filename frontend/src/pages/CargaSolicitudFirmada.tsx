import React from 'react';
import { Box, TextField, Button as MuiButton, Typography } from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { getEtapaBreadcrumbs, getViewConfig } from '../config/workflowViews';
import { OCRLoadingModal, OCRResultModal } from '../components/PPSH';
import { useWorkflowEtapa, useOCRUpload } from '../hooks';

const ETAPA_ORDEN = 3;
const config = getViewConfig(ETAPA_ORDEN)!;

/**
 * Vista para la Etapa 3: Carga de Solicitud Firmada
 * 
 * Esta vista permite al usuario:
 * - Ver información sobre la carga de documentos requeridos
 * - Cargar dos fotos tamaño carnet
 * - Avanzar a la siguiente etapa
 * - Modo readonly para visualizar etapas completadas
 * 
 * REFACTORIZADO: Ahora usa useWorkflowEtapa y useOCRUpload para reducir código duplicado.
 */
export const CargaSolicitudFirmada: React.FC = () => {
  // Hook para manejo de workflow
  const {
    loading,
    error,
    completing,
    readonly,
    instancia,
    workflowInstanciaId,
    handleCancelar,
    handleGuardar,
    setError,
  } = useWorkflowEtapa();

  // Hook para carga de documentos con OCR
  const {
    uploadedFile,
    documentoId,
    isUploading,
    isLoadingOCR,
    showResult,
    ocrResult,
    openFileSelector,
    closeResult,
  } = useOCRUpload({
    allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
  });

  const handleCargarArchivo = () => {
    // Buscar id_solicitud o ppsh_solicitud_id (compatibilidad)
    const solicitudIdFromInstance = instancia?.metadata_adicional?.id_solicitud || instancia?.metadata_adicional?.ppsh_solicitud_id;
    if (!solicitudIdFromInstance) {
      setError('No se encontró el ID de solicitud');
      return;
    }
    openFileSelector(
      solicitudIdFromInstance,
      'Solicitud Firmada',
      'Documento cargado en Etapa 3: Carga de Solicitud Firmada'
    );
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !instancia) return;

    // Si no hay archivo cargado, simular uno para permitir continuar (modo desarrollo)
    let documentoIdFinal = documentoId;
    let nombreArchivoFinal = uploadedFile?.name || 'fotos-carnet-dummy.pdf';

    if (!uploadedFile || !documentoId) {
      documentoIdFinal = Math.floor(Math.random() * 9000) + 1000;
    }

    await handleGuardar({ 
      CARGA_SOLICITUD: 'Archivo cargado',
      documento_id: documentoIdFinal,
      nombre_archivo: nombreArchivoFinal
    });
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={getEtapaBreadcrumbs(ETAPA_ORDEN)}
      contentTitle={config.contentTitle}
      contentDescription={config.contentDescription}
      contentSubtitle="Dos fotos tamaño carnet, fondo blanco o color"
      customContent={
        <Box sx={{ mb: 4, maxWidth: '520px' }}>
          {/* TextField con borde negro según Figma */}
          <TextField
            fullWidth
            value={uploadedFile?.name || ''}
            placeholder=""
            disabled
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                height: '56px',
                '& fieldset': { borderColor: '#333333', borderWidth: '1px' },
                '&:hover fieldset': { borderColor: '#333333' },
                '&.Mui-disabled fieldset': { borderColor: '#333333' },
              },
              '& .MuiOutlinedInput-input': { padding: '16px 14px', color: '#333333', fontSize: '16px' },
            }}
          />
          
          {/* Botón Cargar archivo */}
          <MuiButton
            variant="contained"
            startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
            onClick={handleCargarArchivo}
            disabled={isUploading || readonly}
            sx={{
              backgroundColor: '#0e5fa6',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 400,
              px: 2,
              py: 1,
              height: '32px',
              borderRadius: '2px',
              minWidth: 'auto',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#0d5494', boxShadow: 'none' },
              '&.Mui-disabled': { backgroundColor: '#e5e7eb', color: '#9ca3af' },
            }}
          >
            {isUploading ? 'Subiendo...' : 'Cargar archivo'}
          </MuiButton>
          
          {/* Indicaciones extra */}
          <Typography sx={{ mt: 1.5, fontSize: '14px', fontWeight: 300, lineHeight: 1.5, color: '#333333', fontFamily: 'Roboto' }}>
            Indicaciones extra
          </Typography>
        </Box>
      }
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing || isUploading}
      error={error}
    >
      <OCRLoadingModal open={isLoadingOCR} />
      <OCRResultModal
        open={showResult}
        tipo={ocrResult.success ? 'success' : 'error'}
        mensaje={ocrResult.message}
        onClose={closeResult}
      />
    </EtapaInformativa>
  );
};
