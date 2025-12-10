import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import { Lock as LockIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import type { WorkflowEtapa, WorkflowPregunta } from '../../types/workflow';
import { workflowService } from '../../services/workflow.service';
import { RespuestaTextoView } from './QuestionViews/RespuestaTextoView';
import { ListaView } from './QuestionViews/ListaView';
import { OpcionesView } from './QuestionViews/OpcionesView';
import { CargaArchivoView } from './QuestionViews/CargaArchivoView';
import { RevisionManualDocumentosView } from './QuestionViews/RevisionManualDocumentosView';
import { RevisionOCRView } from './QuestionViews/RevisionOCRView';
import { DatosCasoView } from './QuestionViews/DatosCasoView';
import { SeleccionFechaView } from './QuestionViews/SeleccionFechaView';
import { DescargaArchivoView } from './QuestionViews/DescargaArchivoView';
import { ImpresionView } from './QuestionViews/ImpresionView';
import { FileUploadWizard } from './FileUploadWizard';

interface DynamicEtapaViewProps {
  etapa?: WorkflowEtapa; // Opcional si usamos instanciaId
  etapaId?: number; // ID de etapa específica para cargar (modo readonly/historial)
  instanciaId?: number; // Para cargar vista dinámica desde API
  userPerfil?: string; // Perfil del usuario actual (ADMIN, FUNCIONARIO, etc.)
  readonly?: boolean; // Vista de solo lectura (fuerza modo vista)
  accessToken?: string; // Token JWT para acceso público sin autenticación
  hideHeader?: boolean; // Ocultar título y descripción del header (útil cuando la página padre ya los muestra)
  buttonLabels?: { back?: string; next?: string }; // Labels personalizados para botones
  onBack?: () => void; // Handler para botón volver
  onAnswerChange?: (preguntaId: number, valor: any) => void;
  onSave?: (respuestas: Record<string, any>) => Promise<void>;
  onComplete?: (respuestas: Record<string, any>) => Promise<void>;
}

interface CampoVista {
  id: number;
  codigo: string;
  pregunta: string;
  tipo_pregunta: string;
  orden: number;
  es_obligatoria: boolean;
  texto_ayuda?: string;
  placeholder?: string;
  valor_predeterminado?: string;
  opciones?: string[] | string | Record<string, any>; // Puede venir como array, string JSON, u objeto
  opciones_datos_caso?: string[];
  permite_multiple?: boolean;
  validacion_regex?: string;
  mensaje_validacion?: string;
  extensiones_permitidas?: string[];
  tamano_maximo_mb?: number;
  requiere_ocr?: boolean;
  mostrar_si?: any;
  puede_editar_campo: boolean;
  valor_actual?: any;
}

interface VistaActual {
  instancia: {
    id: number;
    num_expediente: string;
    nombre_instancia: string;
    estado: string;
    fecha_inicio: string;
    asignado_a?: string;
    prioridad?: string;
  };
  etapa_actual: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    tipo_etapa: string;
    titulo_formulario?: string;
    bajada_formulario?: string;
    es_etapa_final: boolean;
    tiempo_estimado_minutos?: number;
  };
  puede_ver: boolean;
  puede_editar: boolean;
  campos: CampoVista[];
  metadata_instancia?: any;
  datos_solicitante?: {
    pasaporte: string;
    nacionalidad: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento?: string;
    id_solicitud?: number;
  };
}

/**
 * Componente mejorado que renderiza dinámicamente una etapa del workflow
 * con soporte completo para:
 * - Carga de vista filtrada por permisos desde API
 * - Validación de permisos por perfil de usuario
 * - Visibilidad condicional de campos
 * - Modo solo lectura basado en permisos
 * - Gestión de respuestas y valores actuales
 */
export const DynamicEtapaView: React.FC<DynamicEtapaViewProps> = ({
  etapa: etapaProp,
  etapaId,
  instanciaId,
  userPerfil = 'FUNCIONARIO',
  readonly: readonlyProp = false,
  accessToken,
  hideHeader = false,
  buttonLabels = { back: 'Volver', next: 'Siguiente' },
  onBack,
  onAnswerChange,
  onSave,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaActual | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Cargar vista dinámica desde API si se proporciona instanciaId
  useEffect(() => {
    if (instanciaId) {
      loadVistaActual();
    }
  }, [instanciaId, etapaId, userPerfil]);

  const loadVistaActual = async () => {
    if (!instanciaId) return;

    setLoading(true);
    setError(null);

    try {
      let vista;
      
      // Si hay etapaId, cargar vista de esa etapa específica (para readonly/historial)
      if (etapaId) {
        vista = await workflowService.getVistaEtapa(instanciaId, etapaId, userPerfil, accessToken);
      } else {
        // Cargar vista de la etapa actual
        vista = await workflowService.getVistaActual(instanciaId, userPerfil, accessToken);
      }
      
      setVistaActual(vista);

      // Cargar valores actuales en el estado de respuestas
      const valoresIniciales: Record<string, any> = {};
      vista.campos.forEach((campo: CampoVista) => {
        if (campo.valor_actual) {
          const valor = campo.valor_actual.valor_texto 
            || campo.valor_actual.valor_opcion 
            || campo.valor_actual.valores_multiples
            || campo.valor_actual.valor_archivo;
          if (valor !== undefined && valor !== null) {
            valoresIniciales[campo.codigo] = valor;
          }
        }
      });
      setRespuestas(valoresIniciales);
    } catch (err: any) {
      console.error('Error cargando vista actual:', err);
      setError(err.response?.data?.detail || 'Error al cargar la vista de la etapa');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (preguntaCodigo: string, valor: any) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaCodigo]: valor
    }));

    // Llamar callback externo si existe
    if (onAnswerChange) {
      // Mantener compatibilidad con callback antiguo si existe
      const campo = vistaActual?.campos.find(c => c.codigo === preguntaCodigo);
      if (campo) {
        onAnswerChange(campo.id, valor);
      }
    }
  };

  // handleSave preparado para uso futuro con botón guardar parcial
  const _handleSave = async () => {
    if (!onSave || !instanciaId) return;

    setSaving(true);
    try {
      await onSave(respuestas);
    } catch (err) {
      console.error('Error guardando respuestas:', err);
    } finally {
      setSaving(false);
    }
  };
  // Suprimir warning de variable no usada temporalmente
  void _handleSave;

  const handleComplete = async (respuestasArchivos?: Record<string, any>) => {
    if (!onComplete || !instanciaId) return;

    // Si vienen respuestas de archivos del wizard, combinarlas con las respuestas actuales
    const respuestasFinales = respuestasArchivos 
      ? { ...respuestas, ...respuestasArchivos }
      : respuestas;
    

    // Validar campos obligatorios
    const camposObligatorios = vistaActual?.campos.filter(c => c.es_obligatoria) || [];
    console.log('🔍 handleComplete - campos obligatorios:', camposObligatorios.map(c => c.codigo));
    
    const faltantes = camposObligatorios.filter(campo => {
      const valor = respuestasFinales[campo.codigo];
      return !valor || (Array.isArray(valor) && valor.length === 0);
    });

    console.log('🔍 handleComplete - faltantes:', faltantes.map(c => c.codigo));

    if (faltantes.length > 0) {
      setError(`Faltan campos obligatorios: ${faltantes.map(c => c.pregunta).join(', ')}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onComplete(respuestasFinales);
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      setError(err.response?.data?.detail || 'Error al completar la etapa');
    } finally {
      setSaving(false);
    }
  };

  const evaluarVisibilidadCondicional = (campo: CampoVista): boolean => {
    if (!campo.mostrar_si) return true;

    // Evaluar condición de visibilidad basada en respuestas
    // Formato esperado: { "campo_id": "valor_esperado" }
    try {
      const condiciones = campo.mostrar_si;
      for (const [campoId, valorEsperado] of Object.entries(condiciones)) {
        const valorActual = respuestas[campoId];
        if (valorActual !== valorEsperado) {
          return false;
        }
      }
      return true;
    } catch {
      return true; // Mostrar por defecto si hay error en evaluación
    }
  };

  const renderCampo = (campo: CampoVista) => {
    // Evaluar visibilidad condicional
    if (!evaluarVisibilidadCondicional(campo)) {
      return null;
    }

    // Determinar si el campo es readonly
    const isReadonly = readonlyProp || !campo.puede_editar_campo || !vistaActual?.puede_editar;

    // Convertir campo a formato WorkflowPregunta para compatibilidad
    // Asegurar que opciones sea un array para tipos que lo necesitan
    // Pero preservar el objeto original para tipos como DESCARGA_ARCHIVO
    let opcionesArray: string[] = [];
    let opcionesRaw: any = campo.opciones; // Preservar opciones originales
    
    if (campo.opciones) {
      if (Array.isArray(campo.opciones)) {
        opcionesArray = campo.opciones;
      } else if (typeof campo.opciones === 'string') {
        // Si es un string JSON, parsearlo
        try {
          const parsed = JSON.parse(campo.opciones);
          if (Array.isArray(parsed)) {
            opcionesArray = parsed;
          } else if (typeof parsed === 'object') {
            // Es un objeto JSON (como {archivo_url: ...}), preservarlo
            opcionesRaw = parsed;
          } else {
            opcionesArray = [campo.opciones];
          }
        } catch {
          // Si no es JSON, tratarlo como string separado por comas
          opcionesArray = campo.opciones.split(',').map(o => o.trim());
        }
      } else if (typeof campo.opciones === 'object') {
        // Ya es un objeto, preservarlo directamente
        opcionesRaw = campo.opciones;
      }
    }

    // Determinar el valor de opciones según el tipo de pregunta
    // Para DESCARGA_ARCHIVO y tipos similares, usar el objeto original
    let opcionesParaPregunta: string | undefined;
    if (['DESCARGA_ARCHIVO', 'CARGA_ARCHIVO'].includes(campo.tipo_pregunta)) {
      if (typeof opcionesRaw === 'object' && !Array.isArray(opcionesRaw)) {
        opcionesParaPregunta = JSON.stringify(opcionesRaw);
      } else if (typeof campo.opciones === 'string') {
        opcionesParaPregunta = campo.opciones;
      } else {
        opcionesParaPregunta = undefined;
      }
    } else {
      opcionesParaPregunta = opcionesArray.join(',');
    }

    const pregunta: WorkflowPregunta = {
      id: campo.id,
      codigo: campo.codigo,
      pregunta: campo.pregunta,
      texto: campo.pregunta,
      tipo_pregunta: campo.tipo_pregunta as any,
      tipo: campo.tipo_pregunta as any,
      orden: campo.orden,
      es_obligatoria: campo.es_obligatoria,
      texto_ayuda: campo.texto_ayuda,
      ayuda: campo.texto_ayuda,
      valor_por_defecto: campo.valor_predeterminado,
      activo: true,
      es_visible: true,
      opciones: opcionesParaPregunta,
      lista_elementos: opcionesArray,
      permite_multiple: campo.permite_multiple,
      max_size_mb: campo.tamano_maximo_mb,
    };

    const commonProps = {
      pregunta,
      readonly: isReadonly,
      onAnswerChange: (valor: any) => handleAnswerChange(campo.codigo, valor),
      value: respuestas[campo.codigo],
    };

    // Obtener solicitudId del metadata de la instancia
    const solicitudId = vistaActual?.metadata_instancia?.id_solicitud;

    try {
      switch (campo.tipo_pregunta) {
        case 'RESPUESTA_TEXTO':
        case 'RESPUESTA_LARGA':
          return <RespuestaTextoView key={campo.id} {...commonProps} />;
        
        case 'LISTA':
          return <ListaView key={campo.id} {...commonProps} />;
        
        case 'OPCIONES':
          return <OpcionesView key={campo.id} {...commonProps} />;
        
        case 'CARGA_ARCHIVO':
          return <CargaArchivoView key={campo.id} {...commonProps} solicitudId={solicitudId} />;
        
        case 'REVISION_MANUAL_DOCUMENTOS':
          return <RevisionManualDocumentosView key={campo.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'REVISION_OCR':
          return <RevisionOCRView key={campo.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'DATOS_CASO':
          return <DatosCasoView key={campo.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'SELECCION_FECHA':
          return <SeleccionFechaView key={campo.id} {...commonProps} />;
        
        case 'DESCARGA_ARCHIVO':
          return <DescargaArchivoView key={campo.id} {...commonProps} opcionesOriginales={campo.opciones} />;
        
        case 'IMPRESION':
          return <ImpresionView key={campo.id} {...commonProps} />;
        
        default:
          return (
            <Box key={campo.id} sx={{ p: 2, backgroundColor: '#FEF3C7', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tipo de pregunta no soportado: {campo.tipo_pregunta}
              </Typography>
            </Box>
          );
      }
    } catch (error) {
      console.error('Error renderizando campo:', campo, error);
      return (
        <Box key={campo.id} sx={{ p: 2, backgroundColor: '#FEE2E2', borderRadius: 1 }}>
          <Typography variant="body2" color="error">
            Error renderizando campo: {campo.pregunta}
          </Typography>
        </Box>
      );
    }
  };

  // Renderizado con vista dinámica desde API
  if (instanciaId) {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!vistaActual) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay datos de vista disponibles
        </Alert>
      );
    }

    // Verificar permisos
    if (!vistaActual.puede_ver) {
      return (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mt: 2 }}>
          No tienes permiso para ver esta etapa. 
          Perfil requerido: {vistaActual.etapa_actual.codigo}
        </Alert>
      );
    }

    return (
      <Box>
        {/* Header de etapa - Solo si no está oculto */}
        {!hideHeader && vistaActual.etapa_actual.titulo_formulario && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {vistaActual.etapa_actual.titulo_formulario}
            </Typography>
            {vistaActual.etapa_actual.bajada_formulario && (
              <Typography variant="body2" color="text.secondary">
                {vistaActual.etapa_actual.bajada_formulario}
              </Typography>
            )}
          </Box>
        )}

        {/* Indicador de modo solo lectura */}
        {!vistaActual.puede_editar && (
          <Alert severity="info" icon={<VisibilityIcon />} sx={{ mb: 3 }}>
            Estás viendo esta etapa en modo solo lectura. 
            {vistaActual.instancia.asignado_a && 
              ` Esta instancia está asignada a: ${vistaActual.instancia.asignado_a}`}
          </Alert>
        )}

        {/* Error de validación */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Renderizar campos - Usar FileUploadWizard si hay múltiples CARGA_ARCHIVO */}
        {(() => {
          const camposOrdenados = [...vistaActual.campos].sort((a, b) => a.orden - b.orden);
          const camposArchivo = camposOrdenados.filter(c => c.tipo_pregunta === 'CARGA_ARCHIVO');
          const camposOtros = camposOrdenados.filter(c => c.tipo_pregunta !== 'CARGA_ARCHIVO');
          
          // Si hay más de un campo de archivo, usar el wizard
          const usarWizard = camposArchivo.length > 1;
          
          // Obtener solicitudId del metadata
          const solicitudId = vistaActual.metadata_instancia?.id_solicitud;
          
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Renderizar campos que no son de archivo primero */}
              {camposOtros.map(campo => renderCampo(campo))}
              
              {/* Si hay múltiples archivos, usar wizard */}
              {usarWizard ? (
                <FileUploadWizard
                  campos={camposArchivo}
                  respuestas={respuestas}
                  onAnswerChange={handleAnswerChange}
                  solicitudId={solicitudId}
                  readonly={readonlyProp || !vistaActual.puede_editar}
                  onComplete={onComplete ? handleComplete : undefined}
                  onBack={onBack}
                  buttonLabels={buttonLabels}
                  titulo={vistaActual.etapa_actual.titulo_formulario}
                  descripcion={vistaActual.etapa_actual.bajada_formulario}
                  datosSolicitante={vistaActual.datos_solicitante}
                />
              ) : (
                // Si solo hay uno o ningún archivo, renderizar normal
                camposArchivo.map(campo => renderCampo(campo))
              )}
            </Box>
          );
        })()}

        {/* Botones de acción - Solo mostrar si NO usamos el wizard (el wizard tiene sus propios botones) */}
        {(() => {
          const camposArchivo = vistaActual.campos.filter(c => c.tipo_pregunta === 'CARGA_ARCHIVO');
          const usarWizard = camposArchivo.length > 1;
          
          // Si usamos wizard, no mostrar botones aquí
          if (usarWizard) return null;
          
          // Mostrar botones si hay onBack (siempre) o si puede editar y hay onComplete
          const mostrarBotones = onBack || (vistaActual.puede_editar && onComplete);
          
          return mostrarBotones && (
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            sx={{ 
              mt: 6, 
              maxWidth: '1194px',
            }}
          >
            {onBack ? (
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={saving}
                sx={{
                  minWidth: '124px',
                  height: '40px',
                  borderRadius: '4px',
                  borderColor: '#0e5fa6',
                  color: '#0e5fa6',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 400,
                  '&:hover': {
                    borderColor: '#0d5391',
                    backgroundColor: 'rgba(14, 95, 166, 0.04)',
                  },
                }}
              >
                {buttonLabels.back}
              </Button>
            ) : (
              <Box /> // Spacer para mantener el siguiente a la derecha
            )}
            {vistaActual.puede_editar && onComplete && (
              <Button
                variant="contained"
                onClick={handleComplete}
                disabled={saving}
                sx={{
                  minWidth: '124px',
                  height: '40px',
                  borderRadius: '4px',
                  backgroundColor: '#0e5fa6',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 400,
                  '&:hover': {
                    backgroundColor: '#0d5391',
                  },
                }}
              >
                {saving ? 'Procesando...' : buttonLabels.next}
              </Button>
            )}
          </Stack>
        );
        })()}
      </Box>
    );
  }

  // Renderizado legacy con etapa prop (sin API de permisos)
  if (!etapaProp) {
    return (
      <Alert severity="info">
        No se proporcionó etapa o instanciaId
      </Alert>
    );
  }

  const preguntasOrdenadas = [...(etapaProp.preguntas || [])].sort((a, b) => a.orden - b.orden);

  const renderPreguntaLegacy = (pregunta: WorkflowPregunta) => {
    const commonProps = {
      pregunta,
      readonly: readonlyProp,
      onAnswerChange: (valor: any) => onAnswerChange?.(pregunta.id!, valor),
    };

    try {
      switch (pregunta.tipo_pregunta) {
        case 'RESPUESTA_TEXTO':
        case 'RESPUESTA_LARGA':
          return <RespuestaTextoView key={pregunta.id} {...commonProps} />;
        
        case 'LISTA':
          return <ListaView key={pregunta.id} {...commonProps} />;
        
        case 'OPCIONES':
          return <OpcionesView key={pregunta.id} {...commonProps} />;
        
        case 'CARGA_ARCHIVO':
          return <CargaArchivoView key={pregunta.id} {...commonProps} />;
        
        case 'REVISION_MANUAL_DOCUMENTOS':
          return <RevisionManualDocumentosView key={pregunta.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'REVISION_OCR':
          return <RevisionOCRView key={pregunta.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'DATOS_CASO':
          return <DatosCasoView key={pregunta.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'SELECCION_FECHA':
          return <SeleccionFechaView key={pregunta.id} {...commonProps} />;
        
        case 'DESCARGA_ARCHIVO':
          return <DescargaArchivoView key={pregunta.id} {...commonProps} />;
        
        case 'IMPRESION':
          return <ImpresionView key={pregunta.id} {...commonProps} />;
        
        default:
          return (
            <Box key={pregunta.id} sx={{ p: 2, backgroundColor: '#FEF3C7', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tipo de pregunta no soportado: {pregunta.tipo_pregunta}
              </Typography>
            </Box>
          );
      }
    } catch (error) {
      console.error('Error renderizando pregunta:', pregunta, error);
      return (
        <Box key={pregunta.id} sx={{ p: 2, backgroundColor: '#FEE2E2', borderRadius: 1 }}>
          <Typography variant="body2" color="error">
            Error renderizando pregunta: {pregunta.pregunta}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box>
      {/* Renderizar todas las preguntas */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {preguntasOrdenadas.map(pregunta => renderPreguntaLegacy(pregunta))}
      </Box>
    </Box>
  );
};
