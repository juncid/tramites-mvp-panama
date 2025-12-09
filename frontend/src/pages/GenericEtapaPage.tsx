import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
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
import { ImpresionListaCasosView } from '../components/Workflow/QuestionViews/ImpresionListaCasosView';
import { SolicitudSummaryCard } from '../components/Solicitudes/SolicitudSummaryCard';
import { FileUploadWizard } from '../components/Workflow/FileUploadWizard';

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
  datos_solicitante?: {
    pasaporte?: string;
    nacionalidad?: string;
    nombres?: string;
    apellidos?: string;
    fecha_nacimiento?: string;
    id_solicitud?: number;
    tipo_solicitud?: string;
    num_expediente?: string;
    sexo?: string;
    foto_url?: string;
  };
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
  const [ppshSolicitudId, setPpshSolicitudId] = useState<number | null>(null);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [ocrErrorCount, setOcrErrorCount] = useState<number | null>(null);
  const [ocrAutoSelectedCode, setOcrAutoSelectedCode] = useState<string | null>(null);

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

      // Extraer ppshSolicitudId de la metadata o del parámetro URL
      const metadata = (instanciaData as any)?.metadata_adicional || {};
      const metadataSolicitudId = metadata.id_solicitud || metadata.ppsh_solicitud_id;
      const finalSolicitudId = solicitudId ? parseInt(solicitudId) : metadataSolicitudId;
      if (finalSolicitudId) {
        setPpshSolicitudId(finalSolicitudId);
      }

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

  // Callback para recibir el conteo de errores OCR (solo actualiza el estado)
  const handleOcrErrorCountChange = React.useCallback((count: number) => {
    setOcrErrorCount(count);
  }, []);

  // Efecto para auto-seleccionar la respuesta de OCR cuando tenemos los datos
  React.useEffect(() => {
    // Solo ejecutar si tenemos vistaActual, ocrErrorCount y NO se ha auto-seleccionado aún
    if (!vistaActual || ocrErrorCount === null || ocrAutoSelectedCode) return;
    
    const preguntaOcrOpciones = vistaActual.campos.find(
      campo => campo.tipo_pregunta === 'OPCIONES' && 
               campo.pregunta.toLowerCase().includes('ocr')
    );
    
    // Solo auto-seleccionar si existe la pregunta y no hay respuesta previa
    if (!preguntaOcrOpciones || respuestas[preguntaOcrOpciones.codigo]) return;
    
    // Buscar las opciones disponibles
    let opciones: string[] = [];
    if (preguntaOcrOpciones.opciones) {
      if (Array.isArray(preguntaOcrOpciones.opciones)) {
        opciones = preguntaOcrOpciones.opciones;
      } else if (typeof preguntaOcrOpciones.opciones === 'string') {
        try {
          opciones = JSON.parse(preguntaOcrOpciones.opciones);
        } catch {
          opciones = preguntaOcrOpciones.opciones.split(',').map((s: string) => s.trim());
        }
      }
    }
    
    // Si hay 0 o 1 documentos con errores OCR, auto-seleccionar "Sí"
    if (ocrErrorCount <= 1) {
      const opcionSi = opciones.find(opt => 
        opt.toLowerCase() === 'sí' || 
        opt.toLowerCase() === 'si' || 
        opt.toLowerCase() === 'yes'
      );
      
      if (opcionSi) {
        setRespuestas(prev => ({
          ...prev,
          [preguntaOcrOpciones.codigo]: opcionSi
        }));
        // Marcar como auto-seleccionado para hacer readonly
        setOcrAutoSelectedCode(preguntaOcrOpciones.codigo);
      }
    } else {
      // Si hay 2 o más documentos con errores OCR, auto-seleccionar "No"
      const opcionNo = opciones.find(opt => 
        opt.toLowerCase() === 'no'
      );
      
      if (opcionNo) {
        setRespuestas(prev => ({
          ...prev,
          [preguntaOcrOpciones.codigo]: opcionNo
        }));
        // Marcar como auto-seleccionado para hacer readonly
        setOcrAutoSelectedCode(preguntaOcrOpciones.codigo);
      }
    }
  }, [vistaActual, ocrErrorCount, ocrAutoSelectedCode, respuestas]);

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
      // Para REVISION_MANUAL_DOCUMENTOS, REVISION_OCR e IMPRESION, mantener opciones como objeto
      opciones: (campo.tipo_pregunta === 'REVISION_MANUAL_DOCUMENTOS' || campo.tipo_pregunta === 'REVISION_OCR' || campo.tipo_pregunta === 'IMPRESION') 
        ? campo.opciones as any
        : opcionesString,
      lista_elementos: opcionesArray,
      permite_multiple: campo.permite_multiple,
      max_size_mb: campo.tamano_maximo_mb,
      campos_caso: campo.opciones_datos_caso,
    };

    // Determinar si este campo debe estar en readonly
    // - Si la página está en readonly mode
    // - Si es la pregunta de OCR que fue auto-seleccionada
    const isFieldReadonly = isReadonly || (campo.codigo === ocrAutoSelectedCode);

    const commonProps = {
      pregunta,
      readonly: isFieldReadonly,
      onAnswerChange: (valor: any) => handleAnswerChange(campo.codigo, valor),
      value: respuestas[campo.codigo],
    };

    try {
      switch (campo.tipo_pregunta) {
        case 'RESPUESTA_TEXTO':
        case 'RESPUESTA_LARGA':
          return <RespuestaTextoView key={campo.id} {...commonProps} />;
        
        case 'LISTA':
          // Permitir selección en readonly si es etapa de cotización
          const esEtapaCotizacion = vistaActual?.etapa_actual?.nombre?.toLowerCase().includes('cotización') ||
                                    vistaActual?.etapa_actual?.codigo?.toLowerCase().includes('cotizacion');
          return <ListaView key={campo.id} {...commonProps} allowSelectionInReadonly={esEtapaCotizacion} />;
        
        case 'OPCIONES':
          return <OpcionesView key={campo.id} {...commonProps} />;
        
        case 'CARGA_ARCHIVO':
          return <CargaArchivoView key={campo.id} {...commonProps} solicitudId={ppshSolicitudId ?? undefined} />;
        
        case 'REVISION_MANUAL_DOCUMENTOS':
          return (
            <RevisionManualDocumentosView 
              key={campo.id} 
              {...commonProps} 
              instanciaId={workflowInstanciaId ?? undefined}
              onOcrErrorCountChange={handleOcrErrorCountChange}
            />
          );
        
        case 'REVISION_OCR':
          return <RevisionOCRView key={campo.id} {...commonProps} instanciaId={workflowInstanciaId ?? undefined} />;
        
        case 'DATOS_CASO':
          return <DatosCasoView key={campo.id} {...commonProps} instanciaId={workflowInstanciaId ?? undefined} metadataInstancia={vistaActual?.metadata_instancia} />;
        
        case 'SELECCION_FECHA':
          return <SeleccionFechaView key={campo.id} {...commonProps} />;
        
        case 'DESCARGA_ARCHIVO':
          return <DescargaArchivoView key={campo.id} {...commonProps} />;
        
        case 'IMPRESION':
          // Detectar si es una etapa de cotización para pasar datos especiales
          const esCotizacion = vistaActual?.etapa_actual?.nombre?.toLowerCase().includes('cotización') ||
                              vistaActual?.etapa_actual?.codigo?.toLowerCase().includes('cotizacion');
          
          if (esCotizacion && vistaActual) {
            // Extraer datos de cotización de los campos
            const camposData = vistaActual.campos;
            const datosSolicitante = vistaActual.datos_solicitante;
            
            // Buscar los campos de cotización, fecha y responsable
            const campoCotizacion = camposData.find(c => c.tipo_pregunta === 'LISTA');
            const campoFecha = camposData.find(c => c.codigo === 'PREGUNTA_3' || c.pregunta?.toLowerCase().includes('fecha'));
            const campoResponsable = camposData.find(c => c.codigo === 'PREGUNTA_4' || c.pregunta?.toLowerCase().includes('responsable'));
            
            // Obtener items de cotización desde las respuestas actuales (prioridad) o el valor guardado
            // En modo cotización readonly, el usuario puede cambiar la selección antes de imprimir
            const codigoCotizacion = campoCotizacion?.codigo || '';
            const itemsSeleccionados = respuestas[codigoCotizacion] !== undefined 
                                       ? respuestas[codigoCotizacion]
                                       : (campoCotizacion?.valor_actual?.valores_multiples || []);
            
            // Parsear las opciones de cotización para obtener código, descripción y precio
            const allOptions = campoCotizacion?.opciones || [];
            const parsedItems = (Array.isArray(allOptions) ? allOptions : []).map((opcion: string, idx: number) => {
              // Formato esperado: "(832)Carné de Tramite: B/50.00"
              const match = opcion.match(/^\((\d+)\)(.+?):\s*B\/(\d+\.?\d*)$/);
              if (match) {
                return {
                  id: `item-${idx}`,
                  codigo: match[1],
                  descripcion: match[2].trim(),
                  precio: parseFloat(match[3]),
                  checked: itemsSeleccionados.includes(opcion),
                };
              }
              // Formato alternativo sin código: "Visa Múltiple 6M: B/50.00"
              const matchAlt = opcion.match(/^(.+?):\s*B\/(\d+\.?\d*)$/);
              if (matchAlt) {
                return {
                  id: `item-${idx}`,
                  codigo: '',
                  descripcion: matchAlt[1].trim(),
                  precio: parseFloat(matchAlt[2]),
                  checked: itemsSeleccionados.includes(opcion),
                };
              }
              return {
                id: `item-${idx}`,
                codigo: '',
                descripcion: opcion,
                precio: 0,
                checked: itemsSeleccionados.includes(opcion),
              };
            });
            
            const cotizacionData = {
              nombre: datosSolicitante?.nombres && datosSolicitante?.apellidos 
                ? `${datosSolicitante.nombres} ${datosSolicitante.apellidos}`
                : datosSolicitante?.nombres || 'N/A',
              nacionalidad: datosSolicitante?.nacionalidad || 'N/A',
              cotizacionNum: vistaActual.instancia?.num_expediente || 'N/A',
              tramite: 'PPSH',
              fecha: campoFecha?.valor_actual?.valor_texto || respuestas[campoFecha?.codigo || ''] || new Date().toLocaleDateString('es-PA'),
              responsable: campoResponsable?.valor_actual?.valor_texto || respuestas[campoResponsable?.codigo || ''] || 'N/A',
              items: parsedItems,
            };
            
            return (
              <ImpresionView 
                key={campo.id} 
                {...commonProps} 
                esCotizacion={true}
                cotizacionData={cotizacionData}
              />
            );
          }
          
          return <ImpresionView key={campo.id} {...commonProps} />;
        
        case 'IMPRESION_LISTA_CASOS':
          return <ImpresionListaCasosView key={campo.id} {...commonProps} instanciaId={workflowInstanciaId ?? undefined} />;
        
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
            fontSize: { xs: '40px', md: '64px' },
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
              display: 'none', // Oculto temporalmente
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

        {/* Breadcrumbs - En mobile solo muestra los primeros 2 elementos */}
        {/* Versión Mobile - solo Inicio y Procesos */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
        </Box>

        {/* Versión Desktop - todos los elementos */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
        {/* Layout con Grid para panel lateral - desde el inicio */}
        <Grid container spacing={3}>
          {/* Contenido principal - Usar ancho completo cuando hay wizard de archivos o en Cotización */}
          <Grid item xs={12} md={(() => {
            const camposArchivo = vistaActual.campos.filter(c => c.tipo_pregunta === 'CARGA_ARCHIVO');
            const usarWizard = camposArchivo.length > 1 && !readonly;
            // Si usa wizard o no hay datos del solicitante, usar ancho completo
            if (usarWizard || !vistaActual.datos_solicitante) return 12;
            // Si es etapa de Cotización, usar ancho completo
            const esCotizacion = vistaActual.etapa_actual?.codigo?.includes('COTIZACION') || 
                                 vistaActual.etapa_actual?.nombre?.toLowerCase().includes('cotización') ||
                                 vistaActual.etapa_actual?.nombre?.toLowerCase().includes('cotizacion');
            if (esCotizacion) return 12;
            return 8;
          })()}>
            {/* Título y botón para mostrar/ocultar panel */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography
                variant="h2"
                sx={{
                  color: '#333333',
                  fontSize: { xs: '24px', md: '48px' },
                  fontWeight: 700,
                  lineHeight: 1.5,
                  fontFamily: '"Roboto Flex", sans-serif',
                  flex: 1,
                }}
              >
                {etapaActual.titulo_formulario || etapaActual.nombre}
              </Typography>
            </Box>

            {/* Bajada del formulario desde configuración del nodo */}
            {etapaActual.bajada_formulario && (
              <Typography
                sx={{
                  color: '#333333',
                  fontSize: '16px',
                  lineHeight: 1.5,
                  mb: 4,
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {etapaActual.bajada_formulario}
              </Typography>
            )}

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Renderizar campos dinámicamente - layout simple según Figma */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 4 }}>
              {(() => {
                const camposOrdenados = [...vistaActual.campos].sort((a, b) => {
                  // Las preguntas de OPCIONES sobre OCR deben ir antes de REVISION_MANUAL_DOCUMENTOS
                  const aEsOpcionesOcr = a.tipo_pregunta === 'OPCIONES' && 
                    a.pregunta.toLowerCase().includes('ocr');
                  const bEsOpcionesOcr = b.tipo_pregunta === 'OPCIONES' && 
                    b.pregunta.toLowerCase().includes('ocr');
                  const aEsRevision = a.tipo_pregunta === 'REVISION_MANUAL_DOCUMENTOS';
                  const bEsRevision = b.tipo_pregunta === 'REVISION_MANUAL_DOCUMENTOS';
                  
                  // Si a es OPCIONES OCR y b es REVISION, a va primero
                  if (aEsOpcionesOcr && bEsRevision) return -1;
                  // Si b es OPCIONES OCR y a es REVISION, b va primero
                  if (bEsOpcionesOcr && aEsRevision) return 1;
                  
                  // De lo contrario, ordenar por orden normal
                  return a.orden - b.orden;
                });
                
                const camposArchivo = camposOrdenados.filter(c => c.tipo_pregunta === 'CARGA_ARCHIVO');
                const camposOtros = camposOrdenados.filter(c => c.tipo_pregunta !== 'CARGA_ARCHIVO');
                
                // Si hay múltiples campos de archivo y NO es readonly, usar el wizard
                const usarWizard = camposArchivo.length > 1 && !readonly;
                
                return (
                  <>
                    {/* Renderizar campos que no son de archivo */}
                    {camposOtros.map(campo => renderCampo(campo))}
                    
                    {/* Si hay múltiples archivos y no es readonly, usar wizard */}
                    {usarWizard ? (
                      <FileUploadWizard
                        campos={camposArchivo}
                        respuestas={respuestas}
                        onAnswerChange={handleAnswerChange}
                        solicitudId={ppshSolicitudId || undefined}
                        readonly={readonly}
                        onComplete={handleSiguiente}
                        onBack={handleCancelar}
                        buttonLabels={{ next: 'Siguiente', back: 'Cancelar', complete: 'Guardar' }}
                        datosSolicitante={vistaActual.datos_solicitante}
                      />
                    ) : (
                      // Si solo hay uno o ningún archivo, o es readonly, renderizar normal
                      camposArchivo.map(campo => renderCampo(campo))
                    )}
                  </>
                );
              })()}
            </Box>

            {/* Botones de navegación - Solo mostrar si NO usamos el wizard (el wizard tiene sus propios botones) */}
            {(() => {
              const camposArchivo = vistaActual.campos.filter(c => c.tipo_pregunta === 'CARGA_ARCHIVO');
              const usarWizard = camposArchivo.length > 1 && !readonly;
              
              // Si usamos wizard, no mostrar botones aquí
              if (usarWizard) return null;
              
              return readonly ? (
                <Box sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelar}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      borderColor: '#0e5fa6',
                      color: '#0e5fa6',
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '16px',
                      borderRadius: '4px',
                      minWidth: { xs: 'auto', sm: '124px' },
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
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: { xs: 2, sm: 0 },
                    width: '100%',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancelar}
                    disabled={completing}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      order: { xs: 1, sm: 0 },
                      borderColor: '#0e5fa6',
                      color: '#0e5fa6',
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '16px',
                      borderRadius: '4px',
                      minWidth: { xs: 'auto', sm: '124px' },
                      fontFamily: 'Roboto, sans-serif',
                      '&:hover': {
                        borderColor: '#0d5494',
                        backgroundColor: 'rgba(14, 95, 166, 0.04)',
                      },
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSiguiente}
                    disabled={completing}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      order: { xs: 0, sm: 1 },
                      backgroundColor: '#0e5fa6',
                      color: '#ffffff',
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '16px',
                      borderRadius: '4px',
                      minWidth: { xs: 'auto', sm: '124px' },
                      fontFamily: 'Roboto, sans-serif',
                      '&:hover': {
                        backgroundColor: '#0d5494',
                      },
                    }}
                  >
                    {completing ? <CircularProgress size={24} color="inherit" /> : 'Siguiente'}
                  </Button>
                </Box>
              );
            })()}
          </Grid>

          {/* Panel lateral con datos del solicitante - Ocultar cuando se usa el wizard de archivos o en etapa de Cotización */}
          {vistaActual.datos_solicitante && (() => {
            const camposArchivo = vistaActual.campos.filter(c => c.tipo_pregunta === 'CARGA_ARCHIVO');
            const usarWizard = camposArchivo.length > 1 && !readonly;
            // No mostrar panel lateral cuando se usa el wizard
            if (usarWizard) return null;
            
            // No mostrar panel lateral en etapa de Cotización
            const esCotizacion = vistaActual.etapa_actual?.codigo?.includes('COTIZACION') || 
                                 vistaActual.etapa_actual?.nombre?.toLowerCase().includes('cotización') ||
                                 vistaActual.etapa_actual?.nombre?.toLowerCase().includes('cotizacion');
            if (esCotizacion) return null;
            
            return (
            <Grid item xs={12} md={4}>
              {/* Botón para mostrar/ocultar panel del solicitante */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Box
                  onClick={() => setShowSummaryCard(!showSummaryCard)}
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: '4px',
                    border: '1px solid #f0f0f0',
                    boxShadow: '-4px 4px 8px 0px rgba(216,216,216,0.25), 4px 4px 8px 0px rgba(216,216,216,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  {showSummaryCard ? (
                    <CloseIcon sx={{ color: '#0e5fa6', fontSize: 16 }} />
                  ) : (
                    <VisibilityIcon sx={{ color: '#0e5fa6', fontSize: 16 }} />
                  )}
                </Box>
              </Box>
              
              {/* Card con datos del solicitante */}
              {showSummaryCard && (
                <SolicitudSummaryCard 
                  data={{
                    solicitud: vistaActual.datos_solicitante.tipo_solicitud || 'PPSH',
                    ruex: vistaActual.datos_solicitante.num_expediente || 'N/A',
                    solicitante: `${vistaActual.datos_solicitante.nombres || ''} ${vistaActual.datos_solicitante.apellidos || ''}`.trim() || 'N/A',
                    nacionalidad: vistaActual.datos_solicitante.nacionalidad || 'N/A',
                    pasaporte: vistaActual.datos_solicitante.pasaporte || 'N/A',
                    sexo: vistaActual.datos_solicitante.sexo || 'N/A',
                    expediente: vistaActual.datos_solicitante.num_expediente || 'N/A',
                    fechaNacimiento: vistaActual.datos_solicitante.fecha_nacimiento || 'N/A',
                    photoUrl: vistaActual.datos_solicitante.foto_url 
                      ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${vistaActual.datos_solicitante.foto_url}`
                      : undefined,
                  }}
                />
              )}
            </Grid>
            );
          })()}
        </Grid>
      </Box>
    </Box>
  );
};

export default GenericEtapaPage;
