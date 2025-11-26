import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import { useAuth } from '../context/AuthContext';
import type { TipoPregunta, WorkflowPregunta } from '../types/workflow';

// Importar componentes de preguntas
import { RespuestaTextoView } from '../components/Workflow/QuestionViews/RespuestaTextoView';
import { ListaView } from '../components/Workflow/QuestionViews/ListaView';
import { OpcionesView } from '../components/Workflow/QuestionViews/OpcionesView';
import { CargaArchivoView } from '../components/Workflow/QuestionViews/CargaArchivoView';
import { RevisionManualDocumentosView } from '../components/Workflow/QuestionViews/RevisionManualDocumentosView';
import { RevisionOCRView } from '../components/Workflow/QuestionViews/RevisionOCRView';
import { DatosCasoView } from '../components/Workflow/QuestionViews/DatosCasoView';
import { SeleccionFechaView } from '../components/Workflow/QuestionViews/SeleccionFechaView';
import { DescargaArchivoView } from '../components/Workflow/QuestionViews/DescargaArchivoView';
import { ImpresionView } from '../components/Workflow/QuestionViews/ImpresionView';

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
  opciones?: string[] | string;  // Puede ser array o string JSON
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
 * Página genérica para renderizar cualquier etapa de workflow
 * 
 * Esta página:
 * 1. Carga la configuración del nodo desde la API
 * 2. Renderiza los componentes según el tipo de pregunta
 * 3. Usa el diseño Figma (header azul, breadcrumbs, etc.)
 * 4. Gestiona permisos y modo readonly
 * 
 * Uso: /workflows/:instanciaId/etapa (sin necesidad de rutas específicas por etapa)
 */
export const GenericEtapaPage: React.FC = () => {
  const { instanciaId, id: solicitudId } = useParams<{ instanciaId?: string; id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  
  const readonly = searchParams.get('readonly') === 'true';
  const etapaIdParam = searchParams.get('etapaId');
  const userPerfil = usuario?.perfil || 'CIUDADANO';

  // Estados
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaActual | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);

  useEffect(() => {
    loadVistaActual();
  }, [instanciaId, solicitudId, userPerfil, etapaIdParam]);

  const loadVistaActual = async () => {
    setLoading(true);
    setError(null);

    try {
      let numericId: number;

      if (instanciaId) {
        numericId = parseInt(instanciaId);
      } else if (solicitudId) {
        // Obtener workflow_instancia_id desde la solicitud
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

      // Cargar instancia completa
      const instanciaData = await workflowService.getInstancia(numericId);
      setInstancia(instanciaData);

      // Cargar vista: si hay etapaId específico, usar getVistaEtapa, sino getVistaActual
      let vista;
      if (etapaIdParam) {
        const etapaId = parseInt(etapaIdParam);
        vista = await workflowService.getVistaEtapa(numericId, etapaId, userPerfil);
      } else {
        vista = await workflowService.getVistaActual(numericId, userPerfil);
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
      console.error('Error cargando vista:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar la etapa');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (codigo: string, valor: any) => {
    setRespuestas(prev => ({
      ...prev,
      [codigo]: valor
    }));
  };

  const getBasePath = () => {
    return solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${instanciaId}`;
  };

  const handleCancelar = () => {
    navigate(`${getBasePath()}/etapas`);
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !vistaActual?.etapa_actual.id) return;

    // Validar campos obligatorios
    const camposObligatorios = vistaActual.campos.filter(c => c.es_obligatoria);
    const faltantes = camposObligatorios.filter(campo => {
      const valor = respuestas[campo.codigo];
      return !valor || (Array.isArray(valor) && valor.length === 0);
    });

    if (faltantes.length > 0) {
      setError(`Faltan campos obligatorios: ${faltantes.map(c => c.pregunta).join(', ')}`);
      return;
    }

    setCompleting(true);
    setError(null);

    try {
      await workflowService.completarEtapa(
        workflowInstanciaId,
        vistaActual.etapa_actual.id,
        respuestas,
        userPerfil
      );
      navigate(`${getBasePath()}/etapas`);
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      setError(err.response?.data?.detail || err.message || 'Error al completar la etapa');
    } finally {
      setCompleting(false);
    }
  };

  const renderCampo = (campo: CampoVista) => {
    const isReadonly = readonly || !campo.puede_editar_campo || !vistaActual?.puede_editar;

    // Manejar opciones que pueden venir como array o como string JSON
    let opcionesArray: string[] | undefined;
    let opcionesString: string | undefined;
    
    if (campo.opciones) {
      if (Array.isArray(campo.opciones)) {
        opcionesArray = campo.opciones;
        opcionesString = campo.opciones.join(',');
      } else if (typeof campo.opciones === 'string') {
        // Es un string (puede ser JSON o simplemente un string)
        opcionesString = campo.opciones;
        try {
          const parsed = JSON.parse(campo.opciones);
          if (Array.isArray(parsed)) {
            opcionesArray = parsed;
          }
        } catch {
          // No es JSON válido, mantener como string
        }
      }
    }

    // Convertir campo a formato WorkflowPregunta para compatibilidad con los componentes
    const pregunta: WorkflowPregunta = {
      id: campo.id,
      codigo: campo.codigo,
      pregunta: campo.pregunta,
      texto: campo.pregunta,
      tipo_pregunta: campo.tipo_pregunta as TipoPregunta,
      tipo: campo.tipo_pregunta as TipoPregunta,
      orden: campo.orden,
      es_obligatoria: campo.es_obligatoria,
      texto_ayuda: campo.texto_ayuda,
      ayuda: campo.texto_ayuda,
      valor_por_defecto: campo.valor_predeterminado,
      activo: true,
      es_visible: true,
      opciones: opcionesString,
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
          return <RevisionManualDocumentosView key={campo.id} {...commonProps} instanciaId={workflowInstanciaId ?? undefined} />;
        
        case 'REVISION_OCR':
          return <RevisionOCRView key={campo.id} {...commonProps} instanciaId={workflowInstanciaId ?? undefined} />;
        
        case 'DATOS_CASO':
          return <DatosCasoView key={campo.id} {...commonProps} instanciaId={workflowInstanciaId ?? undefined} />;
        
        case 'SELECCION_FECHA':
          return <SeleccionFechaView key={campo.id} {...commonProps} />;
        
        case 'DESCARGA_ARCHIVO':
          return <DescargaArchivoView key={campo.id} {...commonProps} />;
        
        case 'IMPRESION':
          return <ImpresionView key={campo.id} {...commonProps} />;
        
        default:
          return (
            <Box key={campo.id} sx={{ p: 2, backgroundColor: '#FEF3C7', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tipo de pregunta no soportado: {campo.tipo_pregunta}
              </Typography>
            </Box>
          );
      }
    } catch (error) {
      console.error('Error renderizando campo:', campo, error);
      return (
        <Box key={campo.id} sx={{ p: 2, backgroundColor: '#FEE2E2', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="error">
            Error renderizando: {campo.pregunta}
          </Typography>
        </Box>
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !vistaActual) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  if (!vistaActual) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No hay etapa actual para mostrar</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  // Información de la etapa desde la configuración del nodo
  const etapaActual = vistaActual.etapa_actual;
  // Limpiar nombre del workflow quitando sufijos como "- Completo"
  const workflowNombreBase = instancia?.workflow?.nombre?.replace(/\s*-\s*Completo$/i, '') || 'Proceso';
  const numExpediente = vistaActual.instancia.num_expediente || instancia?.num_expediente;

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh',
      // Márgenes negativos para contrarrestar el padding del MainLayout (px: { xs: 2, sm: 3, md: '7.69rem' }, py: { xs: 0, sm: 3 })
      mx: { xs: -2, sm: -3, md: '-7.69rem' },
      mt: { xs: 0, sm: -3 },
    }}>
      {/* Header azul - Diseño Figma - Full width */}
      <Box
        sx={{
          backgroundColor: '#0e5fa6',
          pt: '40px',
          pb: '40px',
          px: { xs: 2, md: '123px' }, // 123px según Figma
          position: 'relative',
          width: '100%',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: '#ffffff',
            fontSize: { xs: '32px', md: '64px' },
            fontWeight: 700,
            lineHeight: 1.1,
            mb: 2,
            maxWidth: '896px',
            fontFamily: '"Roboto Flex", sans-serif',
          }}
        >
          {workflowNombreBase}
        </Typography>

        {/* Número de expediente */}
        {numExpediente && (
          <Typography
            sx={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 400,
              mb: 4,
              opacity: 0.9,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Expediente: <strong>{numExpediente}</strong>
          </Typography>
        )}

        {/* Breadcrumbs - con "/" como separador según Figma */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => navigate('/')}
          >
            <HomeIcon sx={{ width: 20, height: 20, color: 'white' }} />
            <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
              Inicio
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            /
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            Procesos
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            /
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            {workflowNombreBase}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            /
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
            {etapaActual.nombre}
          </Typography>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ px: { xs: 2, md: '123px' }, py: '40px', backgroundColor: 'white' }}>
        {/* Título del formulario desde configuración del nodo */}
        <Typography
          variant="h2"
          sx={{
            color: '#333333',
            fontSize: { xs: '32px', md: '48px' },
            fontWeight: 700,
            lineHeight: 1.5,
            mb: 3,
            fontFamily: '"Roboto Flex", sans-serif',
          }}
        >
          {etapaActual.titulo_formulario || etapaActual.nombre}
        </Typography>

        {/* Bajada del formulario desde configuración del nodo */}
        {etapaActual.bajada_formulario && (
          <Typography
            sx={{
              color: '#333333',
              fontSize: '16px',
              lineHeight: 1.5,
              mb: 4,
              maxWidth: '1167px',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {etapaActual.bajada_formulario}
          </Typography>
        )}

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: '1194px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Renderizar campos dinámicamente desde configuración del nodo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4, maxWidth: '1194px' }}>
          {vistaActual.campos
            .sort((a, b) => a.orden - b.orden)
            .map(campo => renderCampo(campo))}
        </Box>

        {/* Botones de navegación */}
        {readonly ? (
          <Box sx={{ maxWidth: '1194px' }}>
            <Button
              variant="outlined"
              onClick={handleCancelar}
              sx={{
                borderColor: '#0e5fa6',
                color: '#0e5fa6',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '16px',
                borderRadius: '4px',
                minWidth: '124px',
                fontFamily: 'Roboto, sans-serif',
                '&:hover': {
                  borderColor: '#0d5494',
                  backgroundColor: 'rgba(14, 95, 166, 0.04)',
                },
              }}
            >
              Volver
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1194px',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancelar}
              disabled={completing}
              sx={{
                borderColor: '#0e5fa6',
                color: '#0e5fa6',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '16px',
                borderRadius: '4px',
                minWidth: '124px',
                fontFamily: 'Roboto, sans-serif',
                '&:hover': {
                  borderColor: '#0d5494',
                  backgroundColor: 'rgba(14, 95, 166, 0.04)',
                },
              }}
            >
              Volver
            </Button>

            <Button
              variant="contained"
              onClick={handleSiguiente}
              disabled={completing}
              sx={{
                backgroundColor: '#0e5fa6',
                color: '#ffffff',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '16px',
                borderRadius: '4px',
                minWidth: '124px',
                fontFamily: 'Roboto, sans-serif',
                '&:hover': {
                  backgroundColor: '#0d5494',
                },
              }}
            >
              {completing ? <CircularProgress size={24} color="inherit" /> : 
                (etapaActual.es_etapa_final ? 'Finalizar' : 'Siguiente')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GenericEtapaPage;
