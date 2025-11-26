import { useState, useEffect, useCallback } from 'react';
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

/**
 * Vista: Revisión de Requisitos
 * 
 * Permite revisar documentos de una solicitud con OCR y verificación manual.
 * 
 * NOTA: Esta vista tiene lógica especial de OCR masivo para múltiples documentos,
 * diferente al hook useOCRUpload que es para un solo archivo.
 */
export const RevisionRequisitos = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Estados de UI
  const [ocrResultsPositive, setOcrResultsPositive] = useState<string>('no');
  const [showSummaryCard, setShowSummaryCard] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [ocrOverrides, setOcrOverrides] = useState<Record<string, boolean>>({});
  
  // Estados para OCR
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showOCRResult, setShowOCRResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ success: boolean; message: string }>({ success: true, message: '' });
  const [ocrCompletadoLocal, setOcrCompletadoLocal] = useState(false);
  
  // Estados para datos
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [documentosAPI, setDocumentosAPI] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
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

  // Preparar datos para componentes
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

  // Mapear documentos
  const documentos = tiposDocumento.map((tipo) => {
    const doc = documentosAPI.find(d => d.cod_tipo_documento === tipo.cod_tipo_doc);
    const docId = tipo.cod_tipo_doc.toString();
    const hasOcrBackend = doc?.ocr_exitoso || false;
    const hasOcr = ocrOverrides.hasOwnProperty(docId) ? ocrOverrides[docId] : hasOcrBackend;
    const isValid = doc?.estado_verificacion === 'VERIFICADO' ? true 
      : doc?.estado_verificacion === 'RECHAZADO' ? false : null;
    
    return { id: docId, name: tipo.nombre_tipo, hasOcr, isValid, esObligatorio: tipo.es_obligatorio, documento: doc };
  });

  const ocrYaEjecutado = ocrCompletadoLocal || documentosAPI.some(doc => doc.ocr_exitoso !== undefined && doc.ocr_exitoso !== null);

  // Auto-seleccionar documento
  useEffect(() => {
    if (documentos.length > 0 && !selectedDocument) {
      const primerDocumentoFallido = documentos.find(doc => !doc.hasOcr);
      setSelectedDocument((primerDocumentoFallido || documentos[0]).id);
    }
  }, [documentos, selectedDocument]);

  const handleGuardar = useCallback(async () => {
    if (!id) return;

    try {
      const documentosConCambios = Object.entries(ocrOverrides)
        .map(([docId, hasOcr]) => {
          const doc = documentosAPI.find(d => d.cod_tipo_documento.toString() === docId);
          return { id_documento: doc?.id_documento, ocr_exitoso: hasOcr };
        })
        .filter(d => d.id_documento) as Array<{ id_documento: number; ocr_exitoso: boolean }>;

      if (documentosConCambios.length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      const result = await ppshService.actualizarOCRDocumentos(parseInt(id), documentosConCambios);
      let mensaje = `✅ ${result.message}`;
      if (result.revision_ocr_completada) {
        mensaje += '\n\n🎉 ¡Etapa 1.7 (Revisión OCR) completada exitosamente!';
      }
      alert(mensaje);
      setOcrOverrides({});
      navigate('/solicitudes');
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('❌ Error al guardar los cambios');
    }
  }, [id, ocrOverrides, documentosAPI, navigate]);

  const handleIniciarRevisionOCR = useCallback(async () => {
    setIsLoadingOCR(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const exito = Math.random() > 0.3;

      setIsLoadingOCR(false);

      if (exito) {
        setOcrResult({ success: true, message: 'Revisión OCR completada exitosamente. Los documentos han sido procesados correctamente.' });
        setShowOCRResult(true);
        setOcrCompletadoLocal(true);

        if (id) {
          const docs = await ppshService.getDocumentos(parseInt(id));
          setDocumentosAPI(docs);
        }
      } else {
        setOcrResult({ success: false, message: 'Error al procesar los documentos. Por favor, verifique que los archivos sean legibles y estén en el formato correcto.' });
        setShowOCRResult(true);
      }
    } catch {
      setIsLoadingOCR(false);
      setOcrResult({ success: false, message: 'Error inesperado al procesar la revisión OCR' });
      setShowOCRResult(true);
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !solicitud || !solicitudData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity={error ? 'error' : 'warning'}>
          {error ? `Error cargando la solicitud: ${error}` : 'No se encontró la solicitud'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/solicitudes')} sx={{ mt: 2 }}>
          Volver a Solicitudes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', color: '#6B7280', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} /> Inicio
        </Link>
        <Link underline="hover" sx={{ color: '#6B7280', cursor: 'pointer' }} onClick={() => navigate('/solicitudes')}>
          Solicitudes
        </Link>
        <Typography sx={{ color: '#1F2937', fontWeight: 500 }}>Revisión requisitos</Typography>
      </Breadcrumbs>

      {/* Título */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937' }}>Revisión requisitos</Typography>
        {showSummaryCard ? (
          <CloseIcon sx={{ color: '#3B82F6', cursor: 'pointer', '&:hover': { color: '#2563EB' } }} onClick={() => setShowSummaryCard(false)} />
        ) : (
          <VisibilityIcon sx={{ color: '#3B82F6', cursor: 'pointer', '&:hover': { color: '#2563EB' } }} onClick={() => setShowSummaryCard(true)} />
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={showSummaryCard ? 8 : 12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in.
            </Typography>

            {/* PRE-OCR */}
            {!ocrYaEjecutado && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 2, color: '#333' }}>Revisión OCR de documentos</Typography>
                <Button
                  variant="contained"
                  startIcon={<ScannerIcon />}
                  onClick={handleIniciarRevisionOCR}
                  disabled={isLoadingOCR}
                  sx={{ textTransform: 'none', backgroundColor: '#0e5fa6', height: 52, px: 2, '&:hover': { backgroundColor: '#0d5391' } }}
                >
                  {isLoadingOCR ? 'Procesando...' : 'Iniciar revisión OCR'}
                </Button>
              </Box>
            )}

            {/* POST-OCR */}
            {ocrYaEjecutado && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: '#333' }}>
                    Obtuvieron los archivos resultados positivos en la revisión OCR
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={ocrResultsPositive} onChange={(e) => setOcrResultsPositive(e.target.value)}>
                      <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                      <FormControlLabel value="si" control={<Radio size="small" />} label="Sí" />
                    </RadioGroup>
                  </FormControl>
                </Box>
                <Box sx={{ width: '100%', height: 4, backgroundColor: '#f3f3f3', mb: 3 }} />
              </>
            )}

            {/* Revisión manual */}
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 2, color: '#333' }}>Revisión manual de documentos</Typography>
            <DocumentChecklistTable documents={documentos} selectedDocumentId={selectedDocument} onDocumentSelect={setSelectedDocument} />

            {/* Botones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button variant="outlined" onClick={() => navigate('/solicitudes')} sx={{ textTransform: 'none', borderColor: '#0e5fa6', color: '#0e5fa6' }}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleGuardar} sx={{ textTransform: 'none', backgroundColor: '#0e5fa6', '&:hover': { backgroundColor: '#0d5391' } }}>
                Guardar
              </Button>
            </Box>
          </Paper>
        </Grid>

        {showSummaryCard && (
          <Grid item xs={12} md={4}>
            <SolicitudSummaryCard data={solicitudData} />
          </Grid>
        )}
      </Grid>

      <OCRLoadingModal open={isLoadingOCR} />
      <OCRResultModal open={showOCRResult} tipo={ocrResult.success ? 'success' : 'error'} mensaje={ocrResult.message} onClose={() => setShowOCRResult(false)} />
    </Box>
  );
};
