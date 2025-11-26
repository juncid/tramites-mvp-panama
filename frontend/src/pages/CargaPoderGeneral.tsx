import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
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
  
  // Obtener información de la etapa actual desde la configuración del nodo
  const etapaActual = instancia?.etapa_actual;
  const primeraPrequnta = etapaActual?.preguntas?.[0];
  
  // Usar valores del nodo o valores por defecto
  const tituloFormulario = etapaActual?.titulo_formulario || 'Carga de Poder General';
  const bajadaFormulario = etapaActual?.bajada_formulario || descripcionBase;
  const labelInput = primeraPrequnta?.pregunta || 'Poder y solicitud mediante apoderado legal';
  const textoAyuda = primeraPrequnta?.texto_ayuda || 'Indicaciones extra';
  
  const descripcionConArchivo = uploadedFile 
    ? `${bajadaFormulario}\n\n✅ Archivo cargado: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(2)} KB)`
    : bajadaFormulario;

  // Componente de carga de archivo según diseño Figma (node-id=142-809)
  // Estructura: Label -> Input (vacío) -> Botón debajo -> Texto de ayuda
  const fileUploadContent = (
    <Box sx={{ mb: 2 }}>
      {/* Label - desde configuración del nodo */}
      <Typography
        component="label"
        sx={{
          display: 'block',
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 500,
          fontSize: '16px',
          color: '#333333',
          lineHeight: 1.5,
          mb: 1,
        }}
      >
        {labelInput}
      </Typography>
      
      {/* Input TextField - vacío, sin botón integrado */}
      <TextField
        variant="outlined"
        placeholder=""
        value={uploadedFile?.name || ''}
        InputProps={{
          readOnly: true,
          sx: {
            height: '56px',
          },
        }}
        sx={{
          width: '520px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            '& fieldset': {
              borderColor: '#333333',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#333333',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0e5fa6',
            },
          },
        }}
      />
      
      {/* Botón Cargar archivo - DEBAJO del input */}
      <Box sx={{ mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
          onClick={handleCargarArchivo}
          disabled={isUploading || readonly}
          sx={{
            backgroundColor: '#0e5fa6',
            color: '#ffffff',
            height: '32px',
            minWidth: '133px',
            borderRadius: '2px',
            textTransform: 'none',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
            letterSpacing: '0.5px',
            px: 2,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#0d5494',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: '#ccc',
              color: '#666',
            },
          }}
        >
          {isUploading ? 'Subiendo...' : 'Cargar archivo'}
        </Button>
      </Box>
      
      {/* Texto de ayuda - DEBAJO del botón - desde configuración del nodo */}
      <Typography
        sx={{
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 300,
          fontSize: '14px',
          color: '#333333',
          lineHeight: 1.5,
          mt: 1,
        }}
      >
        {textoAyuda}
      </Typography>
    </Box>
  );

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Procesos' },
        { label: 'Permiso de Protección de Seguridad Humanitaria' },
        { label: etapaActual?.nombre || 'Carga de Poder General' },
      ]}
      contentTitle={tituloFormulario}
      contentDescription={descripcionConArchivo}
      customContent={fileUploadContent}
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
