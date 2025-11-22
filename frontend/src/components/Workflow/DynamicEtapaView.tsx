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

interface DynamicEtapaViewProps {
  etapa?: WorkflowEtapa; // Opcional si usamos instanciaId
  instanciaId?: number; // Para cargar vista dinámica desde API
  userPerfil?: string; // Perfil del usuario actual (ADMIN, FUNCIONARIO, etc.)
  readonly?: boolean; // Vista de solo lectura (fuerza modo vista)
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
  opciones?: string[];
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
  instanciaId,
  userPerfil = 'FUNCIONARIO',
  readonly: readonlyProp = false,
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
  }, [instanciaId, userPerfil]);

  const loadVistaActual = async () => {
    if (!instanciaId) return;

    setLoading(true);
    setError(null);

    try {
      const vista = await workflowService.getVistaActual(instanciaId, userPerfil);
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
            valoresIniciales[campo.id.toString()] = valor;
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

  const handleAnswerChange = (preguntaId: number, valor: any) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId.toString()]: valor
    }));

    // Llamar callback externo si existe
    if (onAnswerChange) {
      onAnswerChange(preguntaId, valor);
    }
  };

  const handleSave = async () => {
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

  const handleComplete = async () => {
    if (!onComplete || !instanciaId) return;

    // Validar campos obligatorios
    const camposObligatorios = vistaActual?.campos.filter(c => c.es_obligatoria) || [];
    const faltantes = camposObligatorios.filter(campo => {
      const valor = respuestas[campo.id.toString()];
      return !valor || (Array.isArray(valor) && valor.length === 0);
    });

    if (faltantes.length > 0) {
      setError(`Faltan campos obligatorios: ${faltantes.map(c => c.pregunta).join(', ')}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onComplete(respuestas);
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
      opciones: campo.opciones?.join(','),
      lista_elementos: campo.opciones,
      permite_multiple: campo.permite_multiple,
      max_size_mb: campo.tamano_maximo_mb,
    };

    const commonProps = {
      pregunta,
      readonly: isReadonly,
      onAnswerChange: (valor: any) => handleAnswerChange(campo.id, valor),
      value: respuestas[campo.id.toString()],
    };

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
          return <CargaArchivoView key={campo.id} {...commonProps} />;
        
        case 'REVISION_MANUAL_DOCUMENTOS':
          return <RevisionManualDocumentosView key={campo.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'REVISION_OCR':
          return <RevisionOCRView key={campo.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'DATOS_CASO':
          return <DatosCasoView key={campo.id} {...commonProps} instanciaId={instanciaId} />;
        
        case 'SELECCION_FECHA':
          return <SeleccionFechaView key={campo.id} {...commonProps} />;
        
        case 'DESCARGA_ARCHIVO':
          return <DescargaArchivoView key={campo.id} {...commonProps} />;
        
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
        {/* Header de etapa */}
        {vistaActual.etapa_actual.titulo_formulario && (
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

        {/* Renderizar campos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {vistaActual.campos
            .sort((a, b) => a.orden - b.orden)
            .map(campo => renderCampo(campo))}
        </Box>

        {/* Botones de acción */}
        {vistaActual.puede_editar && (onSave || onComplete) && (
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            {onSave && (
              <Button
                variant="outlined"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
            )}
            {onComplete && (
              <Button
                variant="contained"
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? 'Procesando...' : 
                  vistaActual.etapa_actual.es_etapa_final ? 'Finalizar' : 'Completar Etapa'}
              </Button>
            )}
          </Stack>
        )}

        {/* Metadata de instancia (debug - solo en desarrollo) */}
        {import.meta.env.DEV && vistaActual.metadata_instancia && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Debug - Metadata: {JSON.stringify(vistaActual.metadata_instancia, null, 2)}
            </Typography>
          </Box>
        )}
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
