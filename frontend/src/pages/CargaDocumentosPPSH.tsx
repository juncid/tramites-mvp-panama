import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { DocumentUploadField } from '../components/PPSH/DocumentUploadField';
import { OCRLoadingModal } from '../components/PPSH/OCRLoadingModal';
import { OCRResultModal } from '../components/PPSH/OCRResultModal';
import { PageHero } from '../components/common/PageHero';

// Definición de requisitos PPSH según Decreto N° 6 del 11 de Marzo del 2025
const REQUISITOS_PPSH = [
  {
    id: 1,
    titulo: 'Poder y solicitud mediante apoderado legal',
    indicaciones: 'Documento notariado que autoriza al apoderado legal a realizar el trámite',
    opcional: false,
  },
  {
    id: 2,
    titulo: 'Dos fotos tamaño carnet, fondo blanco o a color',
    indicaciones: 'Fotografías recientes tipo carnet',
    opcional: false,
  },
  {
    id: 3,
    titulo: 'Copia completa del pasaporte debidamente notariado',
    indicaciones: 'Todas las páginas del pasaporte vigente',
    opcional: false,
  },
  {
    id: 4,
    titulo: 'Comprobante de domicilio del solicitante',
    indicaciones: 'Contrato de arrendamiento notariado (copia de cédula del arrendador) O Recibo de servicios públicos (Luz, agua, Cable e Internet - Copia Notariada)',
    opcional: false,
  },
  {
    id: 5,
    titulo: 'Certificado de antecedentes penales de su país de origen debidamente autenticado o apostillado',
    indicaciones: 'Del país de origen, según sea el caso',
    opcional: false,
  },
  {
    id: 6,
    titulo: 'Declaración jurada de antecedentes personales',
    indicaciones: 'Documento legal que declara los antecedentes del solicitante',
    opcional: false,
  },
  {
    id: 7,
    titulo: 'Certificado de salud expedido por un profesional idóneo',
    indicaciones: 'Certificado médico emitido por profesional autorizado',
    opcional: false,
  },
  {
    id: 8,
    titulo: 'Copia del registro de mano de obra migrante solicitado ante el Ministerio de Trabajo y Desarrollo Laboral',
    indicaciones: 'Registro oficial del Ministerio de Trabajo',
    opcional: false,
  },
  {
    id: 9,
    titulo: 'Documentación para menores de edad (opcional)',
    indicaciones: 'Poder notariado otorgado por ambos padres o tutor legal, documento que compruebe el parentesco y carta de responsabilidad debidamente autenticada o apostillada. Este documento solo aplica si el solicitante es menor de edad.',
    opcional: true,
  },
  {
    id: 10,
    titulo: 'Cheque Certificado o de Gerencia del Banco Nacional por B/.800.00',
    indicaciones: 'A favor del Servicio Nacional de Migración en concepto de repatriación',
    opcional: false,
  },
  {
    id: 11,
    titulo: 'Cheque Certificado o de Gerencia del Banco Nacional por B/.250.00',
    indicaciones: 'A favor del Servicio Nacional de Migración en concepto de servicio migratorio',
    opcional: false,
  },
  {
    id: 12,
    titulo: 'Pago de B/.100.00 en concepto de carnet y visa múltiple',
    indicaciones: 'Comprobante de pago por el permiso solicitado',
    opcional: false,
  },
  {
    id: 13,
    titulo: 'Cheque Certificado o de Gerencia del Banco Nacional por B/.100.00',
    indicaciones: 'A favor del Tesoro Nacional de Panamá en concepto de Permiso de Trabajo',
    opcional: false,
  },
];

interface DocumentoState {
  file: File | null;
  uploaded: boolean;
  ocrSuccess: boolean | null;
}

/**
 * Página de carga de documentos PPSH
 * Basada en wireframes Figma: Wireframe 100-105
 */
export const CargaDocumentosPPSH = () => {
  const navigate = useNavigate();
  // const { solicitudId } = useParams<{ solicitudId: string }>(); // TODO: usar para API

  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(0); // 0 = pantalla inicial, 1-10 = documentos
  const [documentos, setDocumentos] = useState<Record<number, DocumentoState>>({});

  // Estados de modales
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<'success' | 'error'>('success');

  const isInitialScreen = currentStep === 0;
  const currentRequisito = REQUISITOS_PPSH[currentStep - 1];
  const currentDocumento = documentos[currentStep];

  const handleDownloadRequisitos = () => {
    // TODO: Implementar descarga de PDF con requisitos
    console.log('Descargar requisitos PPSH');
  };

  const handleFileSelect = (file: File | null) => {
    setDocumentos(prev => ({
      ...prev,
      [currentStep]: {
        file,
        uploaded: false,
        ocrSuccess: null,
      },
    }));
  };

  const handleNext = async () => {
    if (isInitialScreen) {
      // De pantalla inicial a primer documento
      setCurrentStep(1);
      return;
    }

    // Si el documento es opcional y no tiene archivo, permitir avanzar directamente
    if (isCurrentDocOptional && !currentDocumento?.file) {
      if (currentStep < REQUISITOS_PPSH.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
      return;
    }

    // Si hay un archivo seleccionado y no ha sido subido, procesar OCR
    if (currentDocumento?.file && !currentDocumento.uploaded) {
      await processOCR();
      return;
    }

    // Si el documento ya fue subido exitosamente, avanzar al siguiente
    if (currentDocumento?.uploaded && currentDocumento.ocrSuccess) {
      if (currentStep < REQUISITOS_PPSH.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Todos los documentos completados
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    navigate('/procesos');
  };

  const processOCR = async () => {
    setIsLoadingOCR(true);

    // Simular procesamiento OCR (2-3 segundos)
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsLoadingOCR(false);

    // Simular resultado aleatorio (80% éxito, 20% error)
    const success = Math.random() > 0.2;
    setOcrResult(success ? 'success' : 'error');
    setShowResult(true);

    // Actualizar estado del documento
    setDocumentos(prev => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        uploaded: success,
        ocrSuccess: success,
      },
    }));
  };

  const handleCloseResult = () => {
    setShowResult(false);

    // Si fue exitoso, avanzar automáticamente al siguiente documento
    if (ocrResult === 'success') {
      // Usar forma funcional de setState para obtener el valor más reciente
      setCurrentStep(prevStep => {
        if (prevStep < REQUISITOS_PPSH.length) {
          return prevStep + 1;
        } else {
          // Todos los documentos completados
          handleComplete();
          return prevStep;
        }
      });
    }
  };

  const handleComplete = () => {
    // TODO: Navegar a página de confirmación o dashboard
    console.log('Todos los documentos cargados');
    navigate('/solicitudes');
  };

  // Verificar si el documento actual es opcional
  const isCurrentDocOptional = currentRequisito?.opcional || false;

  // Puede proceder si: es pantalla inicial, tiene archivo cargado, o el documento es opcional
  const canProceed = isInitialScreen || (currentDocumento?.file !== null && currentDocumento?.file !== undefined) || isCurrentDocOptional;

  return (
    <Box>
      {/* Hero azul con breadcrumb - Usando componente reutilizable */}
      <PageHero
        title="Permiso de Protección de Seguridad Humanitaria"
        breadcrumbs={[
          { label: 'Inicio', path: '/' },
          { label: 'Procesos', path: '/procesos' },
        ]}
        fullWidth={true}
      />

      {/* Contenido principal */}
      <Box sx={{ 
        pt: { xs: '24px', sm: '40px', md: '40px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', sm: 'flex-start' },
        mx: { xs: 'auto', sm: 0 },
      }}>
        {/* Título - 48px bold, lineHeight: 1.5 */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#333',
            fontSize: { xs: '20px', sm: '48px', md: '48px' },
            mb: { xs: '16px', sm: '25px', md: '25px' },
            lineHeight: 1.5,
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%', md: '100%' },
            textAlign: { xs: 'left', sm: 'left' },
          }}
        >
          {isInitialScreen ? 'Requisitos del trámite PPSH' : 'Carga de requisitos del trámite PPSH'}
        </Typography>

        {/* Descripción - 16px, lineHeight: 1.5 */}
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            fontSize: { xs: '16px', sm: '16px', md: '16px' },
            lineHeight: 1.5,
            mb: { xs: '24px', sm: '32px', md: '32px' },
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%', md: 1167 },
            textAlign: { xs: 'left', sm: 'left' },
          }}
        >
          Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam. Dolor ornare at ac sit sagittis. Etiam elit risus volutpat sed. Orci id in mauris turpis neque. Amet diam morbi vitae nisi ultrices volutpat. Turpis vestibulum condimentum viverra mauris volutpat. Adipiscing ultrices curabitur vehicula ultrices adipiscing dictum nunc facilisi mi. Etiam congue nisl at consequat lobortis vitae nunc.
        </Typography>

        {/* Pantalla inicial (Wireframe 100) */}
        {isInitialScreen && (
          <Box sx={{ 
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%' },
          }}>
            {/* Subtítulo - 16px medium, lineHeight: 1.5 */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                mb: { xs: '16px', sm: '16px' },
                color: '#333',
                fontSize: { xs: '16px', sm: '16px', md: '16px' },
                lineHeight: 1.5,
                textAlign: { xs: 'left', sm: 'left' },
              }}
            >
              A continuación se presentan los requisitos para el trámite PPSH
            </Typography>

            {/* Botón "Requisitos PPSH" - height: 40px */}
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon sx={{ fontSize: { xs: 20, sm: 20 } }} />}
              onClick={handleDownloadRequisitos}
              sx={{
                backgroundColor: '#0e5fa6',
                color: 'white',
                textTransform: 'none',
                height: { xs: 40, sm: 40, md: 40 },
                px: { xs: 2, sm: 2 },
                fontSize: { xs: '16px', sm: '16px', md: '16px' },
                width: { xs: '100%', sm: 'auto' },
                gap: { xs: '6px', sm: '6px' },
                mb: { xs: '64px', sm: '150px' },
                '&:hover': {
                  backgroundColor: '#0d5494',
                },
              }}
            >
              Requisitos PPSH
            </Button>
          </Box>
        )}

        {/* Carga de documento actual (Wireframes 101, 104, 105) */}
        {!isInitialScreen && currentRequisito && (
          <Box sx={{ 
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%' },
          }}>
            {currentRequisito.opcional && (
              <Typography
                sx={{
                  color: '#666',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  mb: 2,
                }}
              >
                Este documento es opcional. Puede omitirlo si no aplica a su caso.
              </Typography>
            )}
            <DocumentUploadField
              titulo={currentRequisito.titulo}
              indicaciones={currentRequisito.indicaciones}
              archivo={currentDocumento?.file || null}
              onFileSelect={handleFileSelect}
              disabled={isLoadingOCR}
            />
          </Box>
        )}

        {/* Botones de navegación - width: 1194px según Figma */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: { xs: '24px', sm: 0 },
            mt: { xs: 4, sm: '150px', md: '150px' },
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%', md: 1194 },
          }}
        >
          {/* Botón Cancelar - border: 1px, outline, height: 40px */}
          <Button
            variant="outlined"
            onClick={isInitialScreen ? handleCancel : handleBack}
            sx={{
              borderColor: '#0e5fa6',
              color: '#0e5fa6',
              textTransform: 'none',
              width: { xs: '100%', sm: 124 },
              height: { xs: 40, sm: 40 },
              fontSize: { xs: '16px', sm: '1rem' },
              lineHeight: '24px',
              px: { xs: 2, sm: 2 },
              py: { xs: 1, sm: 1 },
              order: { xs: 2, sm: 1 },
              '&:hover': {
                borderColor: '#0d5494',
                backgroundColor: 'rgba(14, 95, 166, 0.04)',
              },
            }}
          >
            {isInitialScreen ? 'Cancelar' : 'Volver'}
          </Button>

          {/* Botón Siguiente - filled, height: 40px */}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed}
            sx={{
              backgroundColor: '#0e5fa6',
              color: 'white',
              textTransform: 'none',
              width: { xs: '100%', sm: 124 },
              height: { xs: 40, sm: 40 },
              fontSize: { xs: '16px', sm: '1rem' },
              lineHeight: '24px',
              px: { xs: 2, sm: 2 },
              py: { xs: 1, sm: 1 },
              order: { xs: 1, sm: 2 },
              '&:hover': {
                backgroundColor: '#0d5494',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
              },
            }}
          >
            Siguiente
          </Button>
        </Box>
      </Box>

      {/* Modales */}
      <OCRLoadingModal open={isLoadingOCR} />

      <OCRResultModal
        open={showResult}
        tipo={ocrResult}
        onClose={handleCloseResult}
      />
    </Box>
  );
};
