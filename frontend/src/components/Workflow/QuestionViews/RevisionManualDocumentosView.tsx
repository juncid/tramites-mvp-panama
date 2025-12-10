import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Button,
  Collapse,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import type { WorkflowPregunta } from '../../../types/workflow';
import { apiClient } from '../../../services/api';
import { getApiRootUrl } from '../../../utils/apiUrl';

interface RevisionManualDocumentosViewProps {
  pregunta: WorkflowPregunta;
  readonly?: boolean;
  onAnswerChange?: (valor: any) => void;
  instanciaId?: number;
  value?: string;
  onOcrErrorCountChange?: (count: number) => void;
}

interface Documento {
  id: string;
  name: string;
  url?: string;
  requiere_ocr: boolean;
  ocr_exitoso: boolean | null;
  estado_verificacion?: string;
  ocr_texto_extraido?: string;
  ocr_datos_estructurados?: Record<string, any>;
  ocr_confianza?: number;
}

interface DatosSolicitante {
  nombre_completo?: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  tipo_documento?: string;
  num_documento?: string;
  fecha_nacimiento?: string;
  fecha_emision_doc?: string;
  fecha_vencimiento_doc?: string;
  pais_emisor?: string;
  cod_nacionalidad?: string;
  cod_sexo?: string;
}

interface DocumentosResponse {
  instancia_id: number;
  etapa_id: number;
  etapa_nombre: string;
  documentos: Array<{
    id: string;
    pregunta_id: number;
    pregunta_codigo: string;
    pregunta_texto: string;
    nombre: string;
    url: string;
    tipo: string;
    es_obligatoria: boolean;
    requiere_ocr: boolean;
    ocr_exitoso?: boolean;
    ocr_texto_extraido?: string;
    ocr_datos_estructurados?: Record<string, any>;
    ocr_confianza?: number;
    ocr_estado?: string;
    ocr_mensaje_error?: string;
    estado_verificacion?: string;
  }>;
  total: number;
  datos_solicitante?: DatosSolicitante;
}

// Mapeo de campos OCR a nombres legibles
const CAMPOS_OCR_LABELS: Record<string, string> = {
  nombre_completo: 'Nombre Completo',
  primer_nombre: 'Primer Nombre',
  segundo_nombre: 'Segundo Nombre',
  primer_apellido: 'Primer Apellido',
  segundo_apellido: 'Segundo Apellido',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  num_documento: 'Número de Documento',
  numero_pasaporte: 'Número de Pasaporte',
  numero_documento: 'Número de Documento',
  fecha_nacimiento: 'Fecha de Nacimiento',
  fecha_emision: 'Fecha de Emisión',
  fecha_emision_doc: 'Fecha de Emisión',
  fecha_vencimiento: 'Fecha de Vencimiento',
  fecha_vencimiento_doc: 'Fecha de Vencimiento',
  pais_emisor: 'País Emisor',
  nacionalidad: 'Nacionalidad',
  cod_nacionalidad: 'Nacionalidad',
  sexo: 'Sexo',
  cod_sexo: 'Sexo',
  tipo_documento: 'Tipo de Documento',
};

export const RevisionManualDocumentosView: React.FC<RevisionManualDocumentosViewProps> = ({
  pregunta,
  readonly = false,
  onAnswerChange,
  instanciaId,
  onOcrErrorCountChange,
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [datosSolicitante, setDatosSolicitante] = useState<DatosSolicitante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [verificaciones, setVerificaciones] = useState<Record<string, string>>({});
  const [savingDocId, setSavingDocId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Usar refs para callbacks para evitar re-renders infinitos
  const onOcrErrorCountChangeRef = useRef(onOcrErrorCountChange);
  const onAnswerChangeRef = useRef(onAnswerChange);
  
  // Mantener refs actualizadas
  useEffect(() => {
    onOcrErrorCountChangeRef.current = onOcrErrorCountChange;
    onAnswerChangeRef.current = onAnswerChange;
  }, [onOcrErrorCountChange, onAnswerChange]);

  // Obtener etapa_origen_id memoizado
  const etapaOrigenId = useMemo(() => {
    if (pregunta.opciones && typeof pregunta.opciones === 'object') {
      return (pregunta.opciones as any).etapa_origen_id as number | undefined;
    }
    if (pregunta.etapa_origen_id) {
      return parseInt(pregunta.etapa_origen_id as string, 10);
    }
    return undefined;
  }, [pregunta.opciones, pregunta.etapa_origen_id]);

  useEffect(() => {
    // Evitar cargar múltiples veces
    if (dataLoaded) return;
    
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      if (!instanciaId || !etapaOrigenId) {
        console.warn('RevisionManualDocumentosView: falta instanciaId o etapa_origen_id', {
          instanciaId,
          etapaOrigenId,
          preguntaOpciones: pregunta.opciones
        });
        setLoading(false);
        return;
      }
      
      try {
        // Cargar documentos
        const response = await apiClient.get<DocumentosResponse>(
          `/workflow/instancias/${instanciaId}/etapas/${etapaOrigenId}/documentos`
        );
        
        const baseUrl = getApiRootUrl();
        
        const documentosMapeados: Documento[] = response.documentos.map((doc) => ({
          id: doc.id,
          name: doc.pregunta_texto || doc.nombre,
          url: doc.url ? `${baseUrl}${doc.url}` : undefined,
          requiere_ocr: doc.requiere_ocr || false,
          ocr_exitoso: doc.ocr_exitoso ?? null,
          estado_verificacion: doc.estado_verificacion,
          ocr_texto_extraido: doc.ocr_texto_extraido,
          ocr_datos_estructurados: doc.ocr_datos_estructurados,
          ocr_confianza: doc.ocr_confianza,
        }));
        
        setDocumentos(documentosMapeados);
        setDatosSolicitante(response.datos_solicitante || null);
        
        // Inicializar verificaciones con los estados actuales
        const verificacionesIniciales: Record<string, string> = {};
        documentosMapeados.forEach((doc) => {
          if (doc.estado_verificacion && doc.estado_verificacion !== 'PENDIENTE') {
            verificacionesIniciales[doc.id] = doc.estado_verificacion;
          }
        });
        setVerificaciones(verificacionesIniciales);
        
        // Calcular cantidad de errores OCR y notificar al padre (usando ref)
        const erroresOcr = documentosMapeados.filter(
          (doc) => doc.requiere_ocr && doc.ocr_exitoso === false
        ).length;
        
        if (onOcrErrorCountChangeRef.current) {
          onOcrErrorCountChangeRef.current(erroresOcr);
        }
        
        // Marcar como cargado
        setDataLoaded(true);
      } catch (err) {
        console.error('Error cargando documentos:', err);
        setError('Error al cargar los documentos de la etapa');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [instanciaId, etapaOrigenId, dataLoaded, pregunta.opciones]);

  const handleToggleExpand = useCallback((docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  }, []);

  const handleDescargarDocumento = useCallback((doc: Documento, event: React.MouseEvent) => {
    event.stopPropagation();
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  }, []);

  // Manejar cambio de verificación
  const handleVerificacionChange = useCallback(async (docId: string, estado: string) => {
    if (readonly) return;
    
    // Actualizar estado local inmediatamente
    setVerificaciones((prevVerificaciones) => {
      const nuevasVerificaciones = {
        ...prevVerificaciones,
        [docId]: estado
      };
      
      // Notificar al padre usando ref
      if (onAnswerChangeRef.current) {
        onAnswerChangeRef.current(nuevasVerificaciones);
      }
      
      return nuevasVerificaciones;
    });
    
    // Guardar en backend
    setSavingDocId(docId);
    try {
      await apiClient.patch(`/ppsh/documentos/${docId}/verificar?estado=${estado}`);
      
      // Actualizar documento local
      setDocumentos((prevDocs) => 
        prevDocs.map((doc) => 
          doc.id === docId 
            ? { ...doc, estado_verificacion: estado }
            : doc
        )
      );
    } catch (err) {
      console.error('Error guardando verificación:', err);
      // Revertir en caso de error
      setVerificaciones((prev) => {
        const nuevo = { ...prev };
        delete nuevo[docId];
        return nuevo;
      });
    } finally {
      setSavingDocId(null);
    }
  }, [readonly]);

  // Obtener el valor esperado del solicitante para un campo OCR
  const getValorEsperado = useCallback((campo: string): string => {
    if (!datosSolicitante) return '-';
    
    // Mapeo de campos OCR a campos del solicitante
    const mapeo: Record<string, string> = {
      nombres: 'primer_nombre',
      apellidos: 'primer_apellido',
      numero_pasaporte: 'num_documento',
      numero_documento: 'num_documento',
      nacionalidad: 'cod_nacionalidad',
      fecha_emision: 'fecha_emision_doc',
      fecha_vencimiento: 'fecha_vencimiento_doc',
      sexo: 'cod_sexo',
    };
    
    const campoSolicitante = mapeo[campo] || campo;
    const valor = (datosSolicitante as any)[campoSolicitante];
    
    if (valor === undefined || valor === null) return '-';
    return String(valor);
  }, [datosSolicitante]);

  // Verificar si un campo fue encontrado en el OCR usando las validaciones
  const fueEncontradoEnOCR = useCallback((ocr_datos: Record<string, any> | undefined, campo: string): boolean => {
    if (!ocr_datos?.validaciones) return true; // Si no hay validaciones, asumir que fue encontrado
    
    // Mapeo de campos de datos_solicitante a campos de validaciones
    const mapeoValidaciones: Record<string, string> = {
      nombre_completo: 'primer_nombre', // nombre_completo se considera encontrado si se encontró el nombre
      num_documento: 'num_documento',
      tipo_documento: 'tipo_documento',
      pais_emisor: 'pais_emisor',
      fecha_nacimiento: 'fecha_nacimiento',
    };
    
    const campoValidacion = mapeoValidaciones[campo] || campo;
    const validacion = ocr_datos.validaciones[campoValidacion];
    
    // Si no hay validación para este campo, verificar si el nombre fue encontrado para nombre_completo
    if (!validacion && campo === 'nombre_completo') {
      const primerNombre = ocr_datos.validaciones['primer_nombre'];
      const primerApellido = ocr_datos.validaciones['primer_apellido'];
      return (primerNombre?.encontrado || false) || (primerApellido?.encontrado || false);
    }
    
    return validacion?.encontrado ?? true;
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (documentos.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No hay documentos cargados en la etapa de origen seleccionada.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 6 }}>
      {/* Título de la sección */}
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 500, 
          mb: 1, 
          color: '#333',
        }}
      >
        {pregunta.pregunta}
      </Typography>

      {/* Encabezado de columnas - OCR y Documento */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#333',
            fontWeight: 400,
            width: '60px',
            textAlign: 'center',
          }}
        >
          OCR
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#333',
            fontWeight: 400,
          }}
        >
          Documento
        </Typography>
      </Box>

      {/* Línea separadora */}
      <Divider sx={{ mb: 1, backgroundColor: '#f3f3f3', height: 4 }} />

      {/* Lista de documentos */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {documentos.map((doc) => {
          // Determinar el estado del OCR para el color de fondo
          const ocrFailed = doc.requiere_ocr && doc.ocr_exitoso === false;
          const ocrSuccess = doc.requiere_ocr && doc.ocr_exitoso === true;
          const ocrPending = doc.requiere_ocr && doc.ocr_exitoso === null;
          const isExpanded = expandedDocId === doc.id;
          // Permitir expandir si requiere OCR (para mostrar comparación o botón de descarga)
          const canExpand = doc.requiere_ocr;
          const verificacionActual = verificaciones[doc.id] || doc.estado_verificacion || '';
          const isSaving = savingDocId === doc.id;
          
          return (
            <Box key={doc.id}>
              {/* Fila principal del documento */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1,
                  px: 1,
                  cursor: canExpand ? 'pointer' : 'default',
                  backgroundColor: ocrFailed ? '#fbe7e7' : 'transparent',
                  '&:hover': canExpand ? {
                    backgroundColor: ocrFailed ? '#f5d5d5' : 'rgba(14, 95, 166, 0.04)',
                  } : {},
                  borderRadius: 0,
                }}
                onClick={() => canExpand && handleToggleExpand(doc.id)}
              >
                {/* Columna OCR */}
                <Box sx={{ 
                  width: '60px', 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {doc.requiere_ocr ? (
                    ocrSuccess ? (
                      <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    ) : ocrFailed ? (
                      <CloseIcon sx={{ color: '#e90000', fontSize: 20 }} />
                    ) : ocrPending ? (
                      <Typography variant="caption" sx={{ color: '#999' }}>-</Typography>
                    ) : null
                  ) : (
                    <Typography variant="caption" sx={{ color: '#999' }}>-</Typography>
                  )}
                </Box>

                {/* Columna Documento */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <FileDownloadIcon 
                    sx={{ 
                      color: '#333', 
                      fontSize: 20,
                      opacity: doc.url ? 1 : 0.5,
                    }} 
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#333',
                      fontSize: '16px',
                      lineHeight: 1.5,
                      opacity: doc.url ? 1 : 0.5,
                      flex: 1,
                    }}
                  >
                    {doc.name}
                  </Typography>
                  
                  {/* Indicador de estado de verificación */}
                  {verificacionActual && verificacionActual !== 'PENDIENTE' && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        backgroundColor: verificacionActual === 'VERIFICADO' ? '#e8f5e9' : '#ffebee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {verificacionActual === 'VERIFICADO' ? (
                        <CheckIcon sx={{ color: '#4caf50', fontSize: 14 }} />
                      ) : (
                        <CloseIcon sx={{ color: '#e90000', fontSize: 14 }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: verificacionActual === 'VERIFICADO' ? '#2e7d32' : '#c62828',
                          fontWeight: 500,
                        }}
                      >
                        {verificacionActual === 'VERIFICADO' ? 'Correcto' : 'Incorrecto'}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Indicador de expandible */}
                  {canExpand && (
                    <IconButton size="small" sx={{ p: 0.5 }}>
                      {isExpanded ? (
                        <ExpandLessIcon sx={{ color: '#666' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ color: '#666' }} />
                      )}
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Contenido expandible con datos OCR */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: ocrFailed ? '#fef6f6' : '#f9f9f9',
                    borderLeft: `3px solid ${ocrFailed ? '#e90000' : '#4caf50'}`,
                    ml: 2,
                    mr: 1,
                    mb: 1,
                  }}
                >
                  {/* Primera fila: 3 columnas - Datos encontrados, Datos esperados, Descargar */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr auto',
                    gap: 2,
                    mb: 2,
                  }}>
                    {/* Card: Datos OCR Encontrados */}
                    <Card sx={{ backgroundColor: '#fff' }}>
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
                        
                        {doc.ocr_datos_estructurados?.datos_solicitante && Object.keys(doc.ocr_datos_estructurados.datos_solicitante).length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {Object.entries(doc.ocr_datos_estructurados.datos_solicitante).map(([key, value]) => {
                              const encontrado = fueEncontradoEnOCR(doc.ocr_datos_estructurados, key);
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
                                    {CAMPOS_OCR_LABELS[key] || key}:
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
                                    {encontrado ? String(value || '-') : 'No encontrado'}
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
                        
                        {doc.ocr_confianza !== undefined && doc.ocr_confianza !== null && (
                          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed #eee' }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              Confianza: {doc.ocr_confianza.toFixed(1)}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    {/* Card: Datos Esperados (del solicitante) */}
                    <Card sx={{ backgroundColor: '#fff' }}>
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
                        
                        {doc.ocr_datos_estructurados?.datos_solicitante && Object.keys(doc.ocr_datos_estructurados.datos_solicitante).length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {Object.keys(doc.ocr_datos_estructurados.datos_solicitante).map((key) => (
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
                                  {CAMPOS_OCR_LABELS[key] || key}:
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
                        ) : (
                          <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                            Sin datos para comparar
                          </Typography>
                        )}
                      </CardContent>
                    </Card>

                    {/* Botón de descarga */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={(e) => handleDescargarDocumento(doc, e)}
                        disabled={!doc.url}
                        sx={{
                          backgroundColor: '#0e5fa6',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#0d4d85',
                          },
                          '&:disabled': {
                            backgroundColor: '#ccc',
                          },
                        }}
                      >
                        Descargar
                      </Button>
                    </Box>
                  </Box>

                  {/* Segunda fila: Texto OCR extraído */}
                  {doc.ocr_texto_extraido && (
                    <Card sx={{ backgroundColor: '#fff', mb: 2 }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#1e3a5f',
                            mb: 1,
                          }}
                        >
                          Texto Extraído (OCR)
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#333',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            backgroundColor: '#f5f5f5',
                            p: 1.5,
                            borderRadius: 1,
                            maxHeight: '200px',
                            overflow: 'auto',
                          }}
                        >
                          {doc.ocr_texto_extraido}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tercera fila: Radio buttons de verificación manual */}
                  <Card sx={{ backgroundColor: '#fff' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <FormControl component="fieldset" disabled={readonly || isSaving}>
                        <FormLabel 
                          component="legend"
                          sx={{ 
                            fontWeight: 600, 
                            color: '#1e3a5f',
                            mb: 1,
                            '&.Mui-focused': { color: '#1e3a5f' },
                          }}
                        >
                          Verificación Manual
                          {isSaving && (
                            <CircularProgress size={14} sx={{ ml: 1 }} />
                          )}
                        </FormLabel>
                        <RadioGroup
                          row
                          value={verificacionActual}
                          onChange={(e) => handleVerificacionChange(doc.id, e.target.value)}
                        >
                          <FormControlLabel 
                            value="VERIFICADO" 
                            control={
                              <Radio 
                                sx={{ 
                                  color: '#4caf50',
                                  '&.Mui-checked': { color: '#4caf50' },
                                }} 
                              />
                            } 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                                <Typography variant="body2">Datos correctos</Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel 
                            value="RECHAZADO" 
                            control={
                              <Radio 
                                sx={{ 
                                  color: '#e90000',
                                  '&.Mui-checked': { color: '#e90000' },
                                }} 
                              />
                            } 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CloseIcon sx={{ color: '#e90000', fontSize: 18 }} />
                                <Typography variant="body2">Datos incorrectos</Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>
                        {readonly && verificacionActual && (
                          <Typography variant="caption" sx={{ color: '#666', mt: 0.5 }}>
                            (Solo lectura)
                          </Typography>
                        )}
                      </FormControl>
                    </CardContent>
                  </Card>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
