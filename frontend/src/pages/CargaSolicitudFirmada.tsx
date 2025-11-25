import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { Box, TextField, Button as MuiButton, Typography } from '@mui/material';
import { workflowService } from '../services/workflow.service';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { resolveWorkflowId } from '../config/workflowAliases';
import { OCRLoadingModal, OCRResultModal } from '../components/PPSH';

/**
 * Vista para la Etapa 3: Carga de Solicitud Firmada
 * 
 * Esta vista permite al usuario:
 * - Ver información sobre la carga de documentos requeridos
 * - Cargar dos fotos tamaño carnet
 * - Avanzar a la siguiente etapa
 * - Modo readonly para visualizar etapas completadas
 */
export const CargaSolicitudFirmada: React.FC = () => {
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
    input.accept = 'image/*,.pdf';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10 MB');
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
        // OCR exitoso - simular documento cargado
        setUploading(true);

        try {
          console.log('📤 Subiendo documento:', file.name);
          // Simular ID de documento
          const documentoIdSimulado = Math.floor(Math.random() * 9000) + 1000;
          
          setArchivoSubido(file);
          setDocumentoId(documentoIdSimulado);

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
      let nombreArchivoFinal = archivoSubido?.name || 'fotos-carnet-dummy.pdf';

      if (!archivoSubido || !documentoId) {
        console.log('⚠️ Modo desarrollo: Creando documento dummy para continuar');
        // Simular documento subido exitosamente
        documentoIdFinal = Math.floor(Math.random() * 9000) + 1000;
      }

      // Completar Etapa 3: Carga de Solicitud Firmada
      console.log('Completando Etapa 3: Carga de Solicitud Firmada');
      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        { 
          CARGA_SOLICITUD: 'Archivo cargado',
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
        { label: 'Carga de requisitos del trámite PPSH' },
      ]}
      contentTitle="Carga de requisitos del trámite PPSH"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam. Dolor ornare at ac sit sagittis. Etiam elit risus volutpat sed. Orci id in mauris turpis neque. Amet diam morbi vitae nisi ultrices volutpat. Turpis vestibulum condimentum viverra mauris volutpat. Adipiscing ultrices curabitur vehicula ultrices adipiscing dictum nunc facilisi mi. Etiam congue nisl at consequat lobortis vitae nunc."
      contentSubtitle="Dos fotos tamaño carnet, fondo blanco o color"
      customContent={
        <Box sx={{ mb: 4, maxWidth: '520px' }}>
          {/* TextField con borde negro según Figma */}
          <TextField
            fullWidth
            value={archivoSubido?.name || ''}
            placeholder=""
            disabled
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                height: '56px',
                '& fieldset': {
                  borderColor: '#333333',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#333333',
                },
                '&.Mui-disabled fieldset': {
                  borderColor: '#333333',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '16px 14px',
                color: '#333333',
                fontSize: '16px',
              },
            }}
          />
          
          {/* Botón Cargar archivo - separado del TextField */}
          <MuiButton
            variant="contained"
            startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
            onClick={handleCargarArchivo}
            disabled={uploading || readonly}
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
              '&:hover': {
                backgroundColor: '#0d5494',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            {uploading ? 'Subiendo...' : 'Cargar archivo'}
          </MuiButton>
          
          {/* Indicaciones extra - Roboto Light 14px según Figma */}
          <Typography
            sx={{
              mt: 1.5,
              fontSize: '14px',
              fontWeight: 300,
              lineHeight: 1.5,
              color: '#333333',
              fontFamily: 'Roboto',
            }}
          >
            Indicaciones extra
          </Typography>
        </Box>
      }
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
