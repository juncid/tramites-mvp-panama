import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  DocumentScanner as ScannerIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentChecklistTable } from '../components/Solicitudes/DocumentChecklistTable';
import { SolicitudSummaryCard } from '../components/Solicitudes/SolicitudSummaryCard';
import { OCRLoadingModal, OCRResultModal } from '../components/PPSH';
import { ppshService } from '../services/ppsh.service';
import type { Solicitud, TipoDocumento, Documento } from '../types/ppsh';

export const RevisionRequisitos = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [ocrResultsPositive, setOcrResultsPositive] = useState<string>('no');
  const [showSummaryCard, setShowSummaryCard] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [ocrOverrides, setOcrOverrides] = useState<Record<string, boolean>>({}); // Cambios manuales de OCR por documento
  
  // Estados para los modales de OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showOCRResult, setShowOCRResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ success: boolean; message: string }>({ 
    success: true, 
    message: '' 
  });
  const [ocrCompletadoLocal, setOcrCompletadoLocal] = useState(false); // Estado local para controlar si se ejecutó OCR
  
  // Estado para datos de la API
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [documentosAPI, setDocumentosAPI] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID de solicitud no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Cargar solicitud, tipos de documento y documentos en paralelo
        const [solicitudData, tiposDoc, docs] = await Promise.all([
          ppshService.getSolicitud(parseInt(id)),
          ppshService.getTiposDocumento(),
          ppshService.getDocumentos(parseInt(id)),
        ]);

        setSolicitud(solicitudData);
        setTiposDocumento(tiposDoc);
        setDocumentosAPI(docs);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Preparar datos para los componentes
  const titular = solicitud?.solicitantes.find(s => s.es_titular) || solicitud?.solicitantes[0];
  
  const solicitudData = titular ? {
    solicitud: solicitud?.tipo_solicitud || '',
    ruex: solicitud?.num_expediente || 'N/A',
    solicitante: titular.nombre_completo,
    nacionalidad: titular.nacionalidad || 'No especificado',
    pasaporte: titular.numero_documento || 'N/A',
    sexo: titular.sexo || 'No especificado',
    expediente: solicitud?.num_expediente || 'N/A',
    fechaNacimiento: titular.fecha_nacimiento || 'No especificado',
    photoUrl: titular.foto_url || 'https://via.placeholder.com/120',
  } : null;

    // Mapear documentos con información de OCR del backend
    const documentos = tiposDocumento.map((tipo) => {
      const doc = documentosAPI.find(d => d.cod_tipo_documento === tipo.cod_tipo_doc);
      const docId = tipo.cod_tipo_doc.toString();
      
      // hasOcr: Indica si el documento fue procesado por OCR con éxito
      // Si hay un override manual, usar ese valor, sino usar el del backend
      const hasOcrBackend = doc?.ocr_exitoso || false;
      const hasOcr = ocrOverrides.hasOwnProperty(docId) ? ocrOverrides[docId] : hasOcrBackend;
      
      // isValid: Resultado de la verificación manual del documento
      // - true: VERIFICADO - Documento aprobado por revisor
      // - false: RECHAZADO - Documento rechazado por revisor
      // - null: PENDIENTE - Aún no revisado
      const isValid = doc?.estado_verificacion === 'VERIFICADO' 
        ? true 
        : doc?.estado_verificacion === 'RECHAZADO' 
        ? false 
        : null;
      
      return {
        id: docId,
        name: tipo.nombre_tipo,
        hasOcr,
        isValid,
        esObligatorio: tipo.es_obligatorio,
        documento: doc
      };
    });

  // Determinar si ya se ejecutó OCR (al menos un documento tiene OCR procesado)
  // Si algún documento tiene doc?.ocr_exitoso !== undefined, significa que ya pasó por OCR
  // También considerar si se completó el OCR localmente mediante simulación
  const ocrYaEjecutado = ocrCompletadoLocal || documentosAPI.some(doc => doc.ocr_exitoso !== undefined && doc.ocr_exitoso !== null);
  
  // Estado de la pregunta OCR:
  // - Pre-OCR: Mostrar botón "Iniciar revisión OCR"
  // - Post-OCR: Mostrar pregunta de radio buttons + secciones de revisión manual

  // Seleccionar automáticamente el primer documento con ocr_exitoso = false
  useEffect(() => {
    if (documentos.length > 0 && !selectedDocument) {
      // Buscar primer documento con OCR fallido (!hasOcr)
      const primerDocumentoFallido = documentos.find(doc => !doc.hasOcr);
      // Si no hay ninguno fallido, seleccionar el primero
      const documentoASeleccionar = primerDocumentoFallido || documentos[0];
      setSelectedDocument(documentoASeleccionar.id);
    }
  }, [documentos, selectedDocument]);

  // Función para guardar cambios de OCR
  const handleGuardar = async () => {
    if (!id) return;

    try {
      // Obtener los documentos que tuvieron cambios manuales
      const documentosConCambios = Object.entries(ocrOverrides).map(([docId, hasOcr]) => {
        const doc = documentosAPI.find(d => d.cod_tipo_documento.toString() === docId);
        return {
          id_documento: doc?.id_documento,
          ocr_exitoso: hasOcr
        };
      }).filter(d => d.id_documento) as Array<{ id_documento: number; ocr_exitoso: boolean }>;

      if (documentosConCambios.length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      // Llamar al endpoint para actualizar
      const result = await ppshService.actualizarOCRDocumentos(
        parseInt(id),
        documentosConCambios
      );
      
      // Mostrar feedback al usuario con información de la etapa 1.7
      let mensaje = `✅ ${result.message}`;
      
      if (result.revision_ocr_completada) {
        mensaje += '\n\n🎉 ¡Etapa 1.7 (Revisión OCR) completada exitosamente!';
      }
      
      alert(mensaje);
      
      // Limpiar los overrides después de guardar
      setOcrOverrides({});
      
      // Navegar de vuelta a solicitudes
      navigate('/solicitudes');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar los cambios');
    }
  };

  // Función para iniciar revisión OCR con simulación aleatoria
  const handleIniciarRevisionOCR = async () => {
    // Mostrar modal de loading
    setIsLoadingOCR(true);

    try {
      // Simular proceso de OCR (2.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Evento aleatorio: 70% éxito, 30% error
      const exito = Math.random() > 0.3;

      // Cerrar modal de loading
      setIsLoadingOCR(false);

      if (exito) {
        // Mostrar modal de éxito
        setOcrResult({
          success: true,
          message: 'Revisión OCR completada exitosamente. Los documentos han sido procesados correctamente.'
        });
        setShowOCRResult(true);
        setOcrCompletadoLocal(true); // Marcar OCR como completado localmente

        // Aquí podrías hacer el llamado real al backend para procesar OCR
        // const result = await ppshService.procesarOCR(parseInt(id!));
        
        // Actualizar el estado para mostrar el "nodo 2" (post-OCR)
        // Por ahora simplemente recargamos los datos
        if (id) {
          const docs = await ppshService.getDocumentos(parseInt(id));
          setDocumentosAPI(docs);
        }
      } else {
        // Mostrar modal de error
        setOcrResult({
          success: false,
          message: 'Error al procesar los documentos. Por favor, verifique que los archivos sean legibles y estén en el formato correcto.'
        });
        setShowOCRResult(true);
      }
    } catch (err) {
      setIsLoadingOCR(false);
      setOcrResult({
        success: false,
        message: 'Error inesperado al procesar la revisión OCR'
      });
      setShowOCRResult(true);
    }
  };

  const handleCloseOCRResult = () => {
    setShowOCRResult(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error cargando la solicitud: {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/solicitudes')}
          sx={{ mt: 2 }}
        >
          Volver a Solicitudes
        </Button>
      </Box>
    );
  }

  if (!solicitud || !solicitudData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se encontró la solicitud
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/solicitudes')}
          sx={{ mt: 2 }}
        >
          Volver a Solicitudes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Inicio
        </Link>
        <Link
          underline="hover"
          sx={{ color: '#6B7280', cursor: 'pointer' }}
          onClick={() => navigate('/solicitudes')}
        >
          Solicitudes
        </Link>
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>
          Revisión requisitos
        </Typography>
      </Breadcrumbs>

      {/* Título con botón toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#1F2937',
          }}
        >
          Revisión requisitos
        </Typography>
        {showSummaryCard ? (
          <CloseIcon 
            sx={{ 
              color: '#3B82F6', 
              cursor: 'pointer',
              '&:hover': { color: '#2563EB' }
            }}
            onClick={() => setShowSummaryCard(false)}
          />
        ) : (
          <VisibilityIcon 
            sx={{ 
              color: '#3B82F6', 
              cursor: 'pointer',
              '&:hover': { color: '#2563EB' }
            }}
            onClick={() => setShowSummaryCard(true)}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Columna izquierda - Formulario */}
        <Grid item xs={12} md={showSummaryCard ? 8 : 12}>
          <Paper sx={{ p: 3 }}>
            {/* Descripción */}
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.
            </Typography>

            {/* ESTADO PRE-OCR: Mostrar botón para iniciar OCR */}
            {!ocrYaEjecutado && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 2, color: '#333' }}>
                  Revisión OCR de documentos
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ScannerIcon />}
                  onClick={handleIniciarRevisionOCR}
                  disabled={isLoadingOCR}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#0e5fa6',
                    color: 'white',
                    height: 52,
                    px: 2,
                    '&:hover': { backgroundColor: '#0d5391' },
                  }}
                >
                  {isLoadingOCR ? 'Procesando...' : 'Iniciar revisión OCR'}
                </Button>
              </Box>
            )}

            {/* ESTADO POST-OCR: Mostrar pregunta con radio buttons */}
            {ocrYaEjecutado && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: '#333' }}>
                    Obtuvieron los archivos resultados positivos en la revisión OCR
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={ocrResultsPositive}
                      onChange={(e) => setOcrResultsPositive(e.target.value)}
                    >
                      <FormControlLabel 
                        value="no" 
                        control={<Radio size="small" />} 
                        label="No" 
                      />
                      <FormControlLabel 
                        value="si" 
                        control={<Radio size="small" />} 
                        label="Sí" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Línea divisoria gris */}
                <Box sx={{ width: '100%', height: 4, backgroundColor: '#f3f3f3', mb: 3 }} />
              </>
            )}

            {/* Sección: Revisión manual de documentos */}
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 2, color: '#333' }}>
              Revisión manual de documentos
            </Typography>

            {/* Tabla de documentos */}
            <DocumentChecklistTable 
              documents={documentos}
              selectedDocumentId={selectedDocument}
              onDocumentSelect={setSelectedDocument}
            />

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/solicitudes')}
                sx={{
                  textTransform: 'none',
                  borderColor: '#0e5fa6',
                  color: '#0e5fa6',
                  '&:hover': { borderColor: '#0d5391', backgroundColor: 'rgba(14, 95, 166, 0.04)' },
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleGuardar}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#0e5fa6',
                  '&:hover': { backgroundColor: '#0d5391' },
                }}
              >
                Guardar
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Columna derecha - Card de resumen */}
        {showSummaryCard && (
          <Grid item xs={12} md={4}>
            <SolicitudSummaryCard data={solicitudData} />
          </Grid>
        )}
      </Grid>

      {/* Modales de OCR */}
      <OCRLoadingModal open={isLoadingOCR} />
      
      <OCRResultModal
        open={showOCRResult}
        tipo={ocrResult.success ? 'success' : 'error'}
        mensaje={ocrResult.message}
        onClose={handleCloseOCRResult}
      />
    </Box>
  );
};
