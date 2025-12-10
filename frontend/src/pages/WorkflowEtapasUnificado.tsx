import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  CheckCircleOutline as CheckCircleIcon,
  EditNote as EditNoteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { publicService } from '../services/public.service';
import { workflowService } from '../services/workflow.service';
import { resolveWorkflowId } from '../config/workflowAliases';
import { getEtapaNavigationPath } from '../config/workflowViews';
import { getApiBaseUrl } from '../utils/apiUrl';
import { MainLayout } from '../components/Layout/MainLayout';

// ============================================================================
// TIPOS
// ============================================================================

interface EtapaInfo {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO';
  puede_ver: boolean;
  puede_editar: boolean;
  fecha_completado?: string;
  perfiles_permitidos: string[];
}

type PerfilUsuario = 'CIUDADANO' | 'FUNCIONARIO';

interface WorkflowEtapasProps {
  /** Perfil del usuario. Si no se proporciona, se detecta automáticamente */
  perfil?: PerfilUsuario;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const WorkflowEtapasUnificado: React.FC<WorkflowEtapasProps> = ({ perfil: perfilProp }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Params de la URL - pueden venir de diferentes rutas
  const { 
    token,           // Para acceso público (ciudadano) - puede ser JWT o ID
    instanciaId,     // Para acceso directo por instancia (funcionario)
    id: solicitudId  // Para acceso por solicitud (funcionario)
  } = useParams<{ token?: string; instanciaId?: string; id?: string }>();
  
  // Detectar si el token es un JWT o un ID numérico
  const esTokenJWT = token && token.includes('.') && token.length > 20;
  const esIdNumerico = token && /^\d+$/.test(token);
  
  // Si el "token" es realmente un ID numérico, tratarlo como solicitudId para funcionarios
  const realSolicitudId = esIdNumerico ? token : solicitudId;
  const realToken = esTokenJWT ? token : undefined;
  
  // Detectar perfil automáticamente basado en el tipo de parámetro
  // La detección de ID numérico SIEMPRE tiene prioridad (indica funcionario)
  // Esto resuelve el conflicto de rutas donde :token y :id tienen el mismo patrón
  const perfilDetectado: PerfilUsuario = esIdNumerico ? 'FUNCIONARIO' : (realToken ? 'CIUDADANO' : 'FUNCIONARIO');
  
  // ID numérico SIEMPRE indica funcionario, sin importar el prop
  const perfil: PerfilUsuario = esIdNumerico ? 'FUNCIONARIO' : (perfilProp || perfilDetectado);
  const esCiudadano = perfil === 'CIUDADANO';
  
  // Estado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etapas, setEtapas] = useState<EtapaInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ciudadanoPuedeEditarActual, setCiudadanoPuedeEditarActual] = useState(false);

  // ============================================================================
  // RELOJ EN TIEMPO REAL
  // ============================================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  useEffect(() => {
    if (esCiudadano && realToken) {
      loadDataPublico();
    } else if (instanciaId || realSolicitudId) {
      loadWorkflowInstance();
    } else {
      setError('No se proporcionó un identificador válido');
      setLoading(false);
    }
  }, [realToken, instanciaId, realSolicitudId, esCiudadano]);

  // Cargar datos para funcionarios cuando tenemos el workflowInstanciaId
  useEffect(() => {
    if (!esCiudadano && workflowInstanciaId) {
      loadDataFuncionario();
    }
  }, [workflowInstanciaId, esCiudadano]);

  /**
   * Carga datos para acceso público (ciudadano) usando token JWT
   */
  const loadDataPublico = async () => {
    if (!realToken) return;

    setLoading(true);
    setError(null);

    try {
      // Validar token
      const validacion = await publicService.validarToken(realToken);
      
      if (!validacion.valid) {
        setError('El enlace de seguimiento ha expirado o no es válido.');
        setLoading(false);
        return;
      }

      // Obtener instancia
      const instanciaData = await publicService.getInstanciaPorToken(realToken);
      setWorkflowInstanciaId(instanciaData.id);

      // Verificar si el ciudadano puede editar la etapa actual
      const etapaActual = instanciaData.etapa_actual;
      const perfilesPermitidos = etapaActual?.perfiles_permitidos || [];
      const puedeEditar = perfilesPermitidos.includes('CIUDADANO') || perfilesPermitidos.includes('ABOGADO');
      setCiudadanoPuedeEditarActual(puedeEditar);

      // Obtener historial
      const historial = await workflowService.getHistorial(instanciaData.id);
      
      // Construir lista de etapas
      const workflow = instanciaData.workflow;
      const etapaActualId = instanciaData.etapa_actual_id;
      
      if (!workflow || !workflow.etapas) {
        setError('No se encontraron etapas en el workflow');
        return;
      }

      const etapasConEstado = buildEtapasConEstado(workflow.etapas, historial, etapaActualId, puedeEditar);
      setEtapas(etapasConEstado);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.detail || 'Error al cargar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resuelve el ID de la instancia de workflow para funcionarios
   */
  const loadWorkflowInstance = async () => {
    try {
      if (instanciaId) {
        const numericId = resolveWorkflowId(instanciaId);
        setWorkflowInstanciaId(numericId);
      } else if (realSolicitudId) {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/ppsh/solicitudes/${realSolicitudId}`);
        if (!response.ok) throw new Error('Solicitud no encontrada');
        const data = await response.json();
        if (data.workflow_instancia_id) {
          setWorkflowInstanciaId(data.workflow_instancia_id);
        } else {
          throw new Error('La solicitud no tiene una instancia de workflow asociada');
        }
      }
    } catch (err: any) {
      console.error('Error cargando instancia de workflow:', err);
      setError(err.message || 'Error al cargar la instancia de workflow');
      setLoading(false);
    }
  };

  /**
   * Carga datos para funcionarios usando workflowService
   */
  const loadDataFuncionario = async () => {
    try {
      setLoading(true);
      
      if (!workflowInstanciaId) {
        setError('ID de workflow no disponible');
        return;
      }
      
      // Obtener datos de la instancia
      const instanciaData = await workflowService.getInstancia(workflowInstanciaId);

      // Obtener historial de etapas completadas
      const historial = await workflowService.getHistorial(workflowInstanciaId);
      
      const workflow = instanciaData.workflow;
      const etapaActualId = instanciaData.etapa_actual_id;
      
      if (!workflow || !workflow.etapas) {
        setError('No se encontraron etapas en el workflow');
        return;
      }
      
      const etapasConEstado = buildEtapasConEstado(workflow.etapas, historial, etapaActualId ?? null);
      setEtapas(etapasConEstado);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando las etapas del workflow');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Construye la lista de etapas con estado (compartido entre ciudadano y funcionario)
   * @param puedeEditarActual - Si el usuario puede editar la etapa actual (para ciudadanos, depende de perfiles_permitidos)
   */
  const buildEtapasConEstado = (
    etapasWorkflow: any[],
    historial: any[],
    etapaActualId: number | null,
    puedeEditarActual: boolean = true
  ): EtapaInfo[] => {
    const etapasConEstado: EtapaInfo[] = etapasWorkflow.map((etapa: any) => {
      const completada = historial.some((h: any) => 
        h.tipo_cambio === 'TRANSICION' && h.etapa_origen_id === etapa.id
      );
      const esActual = etapa.id === etapaActualId;
      const perfilesPermitidos = etapa.perfiles_permitidos || [];
      
      // Verificar si el ciudadano tiene permiso para esta etapa
      const ciudadanoTienePermiso = perfilesPermitidos.includes('CIUDADANO') || perfilesPermitidos.includes('ABOGADO');
      
      return {
        id: etapa.id,
        codigo: etapa.codigo,
        nombre: etapa.nombre,
        orden: etapa.orden || 0,
        estado: completada ? 'COMPLETADO' : esActual ? 'EN_PROCESO' : 'PENDIENTE',
        // Para ciudadanos, solo puede ver si tiene permiso
        puede_ver: esCiudadano ? ciudadanoTienePermiso : true,
        // Solo puede editar si es la etapa actual Y tiene permisos
        puede_editar: esActual && puedeEditarActual,
        fecha_completado: completada 
          ? historial.find((h: any) => h.tipo_cambio === 'TRANSICION' && h.etapa_origen_id === etapa.id)?.created_at 
          : undefined,
        perfiles_permitidos: perfilesPermitidos,
      };
    });

    // Ordenar por orden descendente (más nuevo primero)
    etapasConEstado.sort((a, b) => b.orden - a.orden);
    
    return etapasConEstado;
  };

  // ============================================================================
  // NAVEGACIÓN
  // ============================================================================

  const handleVerEtapa = (etapaId: number, etapaOrden: number, estado: string): void => {
    if (esCiudadano) {
      // Usar el token original de la URL para ciudadanos
      navigate(`/solicitudes/${token}/etapa/${etapaOrden}?readonly=true`);
    } else {
      const baseParam = solicitudId || instanciaId || workflowInstanciaId;
      const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
      const isReadonly = estado === 'COMPLETADO';
      const path = getEtapaNavigationPath(basePath, etapaOrden, etapaId, isReadonly);
      navigate(path);
    }
  };

  const handleEditarEtapa = (etapaId: number, etapaOrden: number): void => {
    if (esCiudadano) {
      // Usar el token original de la URL para ciudadanos
      navigate(`/solicitudes/${token}/etapa/${etapaOrden}`);
    } else {
      const baseParam = solicitudId || instanciaId || workflowInstanciaId;
      const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
      const path = getEtapaNavigationPath(basePath, etapaOrden, etapaId, false);
      navigate(path);
    }
  };

  const handleVolverError = () => {
    if (esCiudadano) {
      navigate('/acceso-publico');
    } else {
      navigate('/solicitudes');
    }
  };

  // ============================================================================
  // HELPERS DE ESTILO
  // ============================================================================

  const getEstadoColor = (estado: string) => {
    if (estado === 'COMPLETADO') return '#eaeef6';
    if (estado === 'EN_PROCESO') return '#e1fcef';
    return '#f9fafb';
  };

  const getEstadoTextColor = (estado: string) => {
    if (estado === 'COMPLETADO') return '#6a6e7c';
    if (estado === 'EN_PROCESO') return '#328056';
    return '#9ca3af';
  };

  const getEstadoLabel = (estado: string) => {
    if (estado === 'COMPLETADO') return 'Completado';
    if (estado === 'EN_PROCESO') return 'En proceso';
    return 'Pendiente';
  };

  const getEstadoIcon = (estado: string) => {
    if (estado === 'COMPLETADO') return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    if (estado === 'EN_PROCESO') return <EditNoteIcon sx={{ fontSize: 16 }} />;
    return undefined;
  };

  // ============================================================================
  // FILTRADO
  // ============================================================================

  const filteredEtapas = etapas.filter(e => 
    e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.orden.toString().includes(searchTerm)
  );

  const etapasActuales = filteredEtapas.filter(e => e.estado === 'EN_PROCESO');
  const etapasCompletadas = filteredEtapas.filter(e => e.estado === 'COMPLETADO');

  // ============================================================================
  // COMPONENTES INTERNOS
  // ============================================================================

  const EtapaRow = ({ etapa }: { etapa: EtapaInfo }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        minHeight: 40,
        bgcolor: 'white',
        '&:hover': { backgroundColor: '#fafafa' },
      }}
    >
      {/* Código Etapa - Formato 1.{orden} como en Figma */}
      <Box sx={{ width: 100, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 400, fontFamily: 'Roboto' }}>
          1.{etapa.orden}
        </Typography>
      </Box>

      {/* Nombre Etapa */}
      <Box sx={{ flex: 1, px: 2 }}>
        <Typography sx={{ fontSize: 16, color: etapa.estado === 'EN_PROCESO' ? '#4d4d4d' : '#333333', fontWeight: 400, fontFamily: 'Roboto' }}>
          {etapa.nombre}
        </Typography>
      </Box>

      {/* Estado */}
      <Box sx={{ width: 180, flexShrink: 0, display: 'flex', justifyContent: 'flex-start' }}>
        <Chip
          icon={getEstadoIcon(etapa.estado)}
          label={getEstadoLabel(etapa.estado)}
          sx={{
            backgroundColor: getEstadoColor(etapa.estado),
            color: getEstadoTextColor(etapa.estado),
            fontSize: 16,
            fontWeight: 400,
            height: 32,
            borderRadius: '16px',
            fontFamily: 'Roboto',
            '& .MuiChip-icon': {
              color: getEstadoTextColor(etapa.estado),
            },
          }}
        />
      </Box>

      {/* Acciones */}
      <Box sx={{ width: 174, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {etapa.puede_editar && etapa.estado === 'EN_PROCESO' ? (
          <Button
            size="small"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleEditarEtapa(etapa.id, etapa.orden)}
            sx={{
              textTransform: 'none',
              color: '#333333',
              fontSize: 14,
              fontWeight: 400,
              fontFamily: 'Roboto',
              '&:hover': { backgroundColor: 'transparent', color: '#0e5fa6' },
            }}
          >
            Ver y editar
          </Button>
        ) : (etapa.puede_ver && etapa.estado === 'COMPLETADO') || (!esCiudadano && etapa.estado === 'EN_PROCESO') ? (
          <Button
            size="small"
            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleVerEtapa(etapa.id, etapa.orden, etapa.estado)}
            sx={{
              textTransform: 'none',
              color: '#333333',
              fontSize: 14,
              fontWeight: 400,
              fontFamily: 'Roboto',
              '&:hover': { backgroundColor: 'transparent', color: '#0e5fa6' },
            }}
          >
            Ver
          </Button>
        ) : null}
      </Box>
    </Box>
  );

  // Componente Card para vista mobile
  const EtapaCard = ({ etapa }: { etapa: EtapaInfo }) => (
    <Card
      sx={{
        mb: 2,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Etapa número */}
        <Typography
          sx={{
            fontSize: 12,
            color: '#757575',
            fontWeight: 500,
            fontFamily: 'Roboto',
            textTransform: 'uppercase',
            mb: 0.5,
          }}
        >
          Etapa 1.{etapa.orden}
        </Typography>

        {/* Nombre de la etapa */}
        <Typography
          sx={{
            fontSize: 16,
            color: '#333333',
            fontWeight: 500,
            fontFamily: 'Roboto',
            mb: 1.5,
          }}
        >
          {etapa.nombre}
        </Typography>

        {/* Estado */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={getEstadoIcon(etapa.estado)}
            label={getEstadoLabel(etapa.estado)}
            size="small"
            sx={{
              backgroundColor: getEstadoColor(etapa.estado),
              color: getEstadoTextColor(etapa.estado),
              fontSize: 14,
              fontWeight: 400,
              height: 28,
              borderRadius: '14px',
              fontFamily: 'Roboto',
              '& .MuiChip-icon': {
                color: getEstadoTextColor(etapa.estado),
              },
            }}
          />
        </Box>

        {/* Botón de acción */}
        {etapa.puede_editar && etapa.estado === 'EN_PROCESO' ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => handleEditarEtapa(etapa.id, etapa.orden)}
            sx={{
              textTransform: 'none',
              backgroundColor: '#0e5fa6',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Roboto',
              py: 1,
              '&:hover': { backgroundColor: '#0d5494' },
            }}
          >
            Ver y editar
          </Button>
        ) : (etapa.puede_ver && etapa.estado === 'COMPLETADO') || (!esCiudadano && etapa.estado === 'EN_PROCESO') ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => handleVerEtapa(etapa.id, etapa.orden, etapa.estado)}
            sx={{
              textTransform: 'none',
              borderColor: '#0e5fa6',
              color: '#0e5fa6',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Roboto',
              py: 1,
              '&:hover': { borderColor: '#0d5494', backgroundColor: 'rgba(14, 95, 166, 0.04)' },
            }}
          >
            Ver
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );

  const SectionHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        borderBottom: '4px solid #f3f3f3',
        mb: 2,
      }}
    >
      <Box sx={{ width: 100, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500, fontFamily: 'Roboto' }}>
          Etapa
        </Typography>
      </Box>
      <Box sx={{ flex: 1, px: 2 }}>
        <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500, fontFamily: 'Roboto' }}>
          Nombre etapa
        </Typography>
      </Box>
      <Box sx={{ width: 180, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500, fontFamily: 'Roboto' }}>
          Estado
        </Typography>
      </Box>
      <Box sx={{ width: 174, flexShrink: 0, textAlign: 'right' }}>
        <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500, fontFamily: 'Roboto' }}>
          Acciones
        </Typography>
      </Box>
    </Box>
  );

  const SearchBar = () => (
    <Box sx={{ mb: 4, maxWidth: 360 }}>
      <TextField
        fullWidth
        placeholder="Buscar etapa..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ color: '#4d4d4d' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            height: 40,
            fontFamily: 'Roboto',
            '& fieldset': {
              borderColor: '#eef3f5',
            },
            '&:hover fieldset': {
              borderColor: '#d0d0d0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0e5fa6',
            },
          },
          '& .MuiInputBase-input': {
            fontSize: 16,
            color: '#4d4d4d',
          },
        }}
      />
    </Box>
  );

  const EtapasContent = () => (
    <>
      {/* Etapas Actuales */}
      {etapasActuales.length > 0 && (
        <Box sx={{ mb: 6, maxWidth: 1194 }}>
          {/* En desktop muestra tabla, en mobile muestra cards */}
          {!isMobile && <SectionHeader />}
          {etapasActuales.map((etapa) => (
            isMobile ? (
              <EtapaCard key={etapa.id} etapa={etapa} />
            ) : (
              <EtapaRow key={etapa.id} etapa={etapa} />
            )
          ))}
        </Box>
      )}

      {/* Historial */}
      {etapasCompletadas.length > 0 && (
        <Box sx={{ maxWidth: 1194 }}>
          <Typography 
            sx={{ 
              fontWeight: 500, 
              color: '#333333',
              mb: 3,
              fontSize: { xs: 24, md: 36 },
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Historial
          </Typography>
          {!isMobile && <SectionHeader />}
          {etapasCompletadas.map((etapa) => (
            isMobile ? (
              <EtapaCard key={etapa.id} etapa={etapa} />
            ) : (
              <EtapaRow key={etapa.id} etapa={etapa} />
            )
          ))}
        </Box>
      )}

      {filteredEtapas.length === 0 && (
        <Alert severity="info" sx={{ maxWidth: 1194 }}>
          No hay etapas que coincidan con la búsqueda.
        </Alert>
      )}
    </>
  );

  // ============================================================================
  // HEADER PARA CIUDADANO
  // ============================================================================

  const HeaderCiudadano = () => {
    const timeStr = currentTime.toLocaleTimeString('es-PA', { hour12: false });
    const dateStr = currentTime.toISOString().split('T')[0];

    return (
    <>
      {/* Header negro */}
      <Box 
        sx={{ 
          bgcolor: '#131414', 
          height: 38, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: { xs: 2, md: 15 },
          overflow: 'hidden',
        }}
      >
        <Typography sx={{ color: 'white', fontSize: 12, fontFamily: 'Roboto', fontWeight: 500 }}>
          SERVICIO NACIONAL DE MIGRACIÓN
        </Typography>
        <Typography sx={{ color: 'white', fontSize: 16, fontFamily: 'Roboto' }}>
          Ciudadano
        </Typography>
      </Box>
      
      {/* Nav azul */}
      <Box 
        sx={{ 
          bgcolor: '#0e5fa6', 
          height: 40, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: { xs: 2, md: 15 },
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Typography 
            sx={{ 
              color: '#f1f3f4', 
              fontSize: 16, 
              fontFamily: 'Roboto',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => navigate('/inicio')}
          >
            Inicio
          </Typography>
          <Typography 
            sx={{ 
              color: '#f1f3f4', 
              fontSize: 16, 
              fontFamily: 'Roboto',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -13,
                left: 0,
                right: 0,
                height: 5,
                bgcolor: 'white',
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            Solicitudes
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: 'white', fontSize: 14, fontFamily: 'Roboto', lineHeight: 1.2 }}>
            {timeStr}
          </Typography>
          <Typography sx={{ color: 'white', fontSize: 14, fontFamily: 'Roboto', lineHeight: 1.2 }}>
            {dateStr}
          </Typography>
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', height: 40, display: 'flex', alignItems: 'center', px: { xs: 2, md: 16 } }}>
        <Breadcrumbs separator={<Typography sx={{ color: '#757575', mx: 0.5 }}>/</Typography>}>
          <MuiLink 
            href="/inicio"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#757575', 
              textDecoration: 'none',
              fontSize: 14,
              fontFamily: 'Roboto',
              gap: 0.5,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <HomeIcon sx={{ fontSize: 20, color: '#757575' }} />
            Inicio
          </MuiLink>
          <Typography sx={{ color: '#757575', fontSize: 14, fontFamily: 'Roboto' }}>
            Solicitudes
          </Typography>
        </Breadcrumbs>
      </Box>
    </>
    );
  };

  // ============================================================================
  // HEADER PARA FUNCIONARIO (según Figma)
  // ============================================================================

  const HeaderFuncionario = () => {
    const timeStr = currentTime.toLocaleTimeString('es-PA', { hour12: false });
    const dateStr = currentTime.toISOString().split('T')[0];

    return (
      <>
        {/* Header negro */}
        <Box 
          sx={{ 
            bgcolor: '#131414', 
            height: 38, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: { xs: 2, md: 15 },
            overflow: 'hidden',
          }}
        >
          <Typography sx={{ color: 'white', fontSize: 12, fontFamily: 'Roboto', fontWeight: 500 }}>
            SERVICIO NACIONAL DE MIGRACIÓN
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: 'white', fontSize: 16, fontFamily: 'Roboto', fontWeight: 700 }}>
              Nombre Apellido (napellido)
            </Typography>
            <Typography sx={{ color: 'white', fontSize: 16, fontFamily: 'Roboto', fontWeight: 300 }}>
              |
            </Typography>
            <Typography 
              sx={{ 
                color: 'white', 
                fontSize: 16, 
                fontFamily: 'Roboto',
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => navigate('/login')}
            >
              Cerrar sesión
            </Typography>
          </Box>
        </Box>
        
        {/* Nav azul */}
        <Box 
          sx={{ 
            bgcolor: '#0e5fa6', 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: { xs: 2, md: 15 },
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography 
              sx={{ 
                color: '#f1f3f4', 
                fontSize: 16, 
                fontFamily: 'Roboto',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => navigate('/')}
            >
              Inicio
            </Typography>
            <Typography 
              sx={{ 
                color: '#f1f3f4', 
                fontSize: 16, 
                fontFamily: 'Roboto',
                position: 'relative',
                cursor: 'pointer',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -13,
                  left: 0,
                  right: 0,
                  height: 5,
                  bgcolor: 'white',
                  borderRadius: '4px 4px 0 0',
                },
              }}
              onClick={() => navigate('/solicitudes')}
            >
              Solicitudes
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ color: 'white', fontSize: 14, fontFamily: 'Roboto', lineHeight: 1.2 }}>
              {timeStr}
            </Typography>
            <Typography sx={{ color: 'white', fontSize: 14, fontFamily: 'Roboto', lineHeight: 1.2 }}>
              {dateStr}
            </Typography>
          </Box>
        </Box>

        {/* Breadcrumbs */}
        <Box sx={{ bgcolor: 'white', height: 40, display: 'flex', alignItems: 'center', px: { xs: 2, md: 16 } }}>
          <Breadcrumbs separator={<Typography sx={{ color: '#757575', mx: 0.5 }}>/</Typography>}>
            <MuiLink 
              component="button"
              onClick={() => navigate('/')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#757575', 
                textDecoration: 'none',
                fontSize: 14,
                fontFamily: 'Roboto',
                gap: 0.5,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <HomeIcon sx={{ fontSize: 20, color: '#757575' }} />
              Inicio
            </MuiLink>
            <MuiLink
              component="button"
              onClick={() => navigate('/solicitudes')}
              sx={{ 
                color: '#757575', 
                textDecoration: 'none',
                fontSize: 14,
                fontFamily: 'Roboto',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Solicitudes
            </MuiLink>
          </Breadcrumbs>
        </Box>
      </>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: esCiudadano ? '100vh' : 200, py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    if (esCiudadano) {
      return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
          <HeaderCiudadano />
          <Box sx={{ px: { xs: 2, md: 15 }, mt: 4 }}>
            <Alert severity="error">{error}</Alert>
            <Button 
              variant="contained" 
              onClick={handleVolverError}
              sx={{ mt: 2, bgcolor: '#0e5fa6' }}
            >
              Volver a Ingresar
            </Button>
          </Box>
        </Box>
      );
    }
    
    return (
      <Box sx={{ maxWidth: 1194, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Vista para CIUDADANO (con header propio)
  if (esCiudadano) {
    return (
      <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
        <HeaderCiudadano />

        {/* Contenido principal */}
        <Box sx={{ px: { xs: 2, md: 15 }, py: 4 }}>
          <Typography 
            sx={{ 
              fontWeight: 700, 
              color: '#333333',
              mb: 4,
              fontSize: { xs: 32, md: 48 },
              fontFamily: 'Roboto Flex, Roboto, sans-serif',
            }}
          >
            Etapas
          </Typography>

          <SearchBar />
          <EtapasContent />
        </Box>
      </Box>
    );
  }

  // Breadcrumbs para funcionario (según Figma)
  const BreadcrumbsFuncionario = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
      <MuiLink
        component="button"
        onClick={() => navigate('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: '#757575',
          textDecoration: 'none',
          fontSize: 14,
          fontFamily: 'Roboto',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        <HomeIcon sx={{ fontSize: 20 }} />
        Inicio
      </MuiLink>
      <Typography sx={{ color: '#757575', fontSize: 14 }}>/</Typography>
      <MuiLink
        component="button"
        onClick={() => navigate('/solicitudes')}
        sx={{
          color: '#757575',
          textDecoration: 'none',
          fontSize: 14,
          fontFamily: 'Roboto',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        Solicitudes
      </MuiLink>
    </Box>
  );

  // Vista para FUNCIONARIO (envuelto en MainLayout)
  const funcionarioContent = (
    <Box sx={{ py: 2 }}>
      <BreadcrumbsFuncionario />
      <Typography 
        sx={{ 
          fontWeight: 700, 
          color: '#333333',
          mb: 4,
          fontSize: { xs: 32, md: 48 },
          fontFamily: 'Roboto Flex, Roboto, sans-serif',
        }}
      >
        Etapas
      </Typography>

      <SearchBar />
      <EtapasContent />
    </Box>
  );

  // Si viene de la ruta /solicitudes/:token/etapas con ID numérico, necesitamos MainLayout
  // porque esa ruta no tiene MainLayout en AppRouter
  if (esIdNumerico) {
    return <MainLayout>{funcionarioContent}</MainLayout>;
  }

  // Si viene de una ruta que ya tiene MainLayout (como /workflows/:id/etapas)
  return funcionarioContent;
};

// Exports para compatibilidad con rutas existentes
export const WorkflowEtapas = () => <WorkflowEtapasUnificado perfil="FUNCIONARIO" />;
export const WorkflowEtapasPublico = () => <WorkflowEtapasUnificado perfil="CIUDADANO" />;

export default WorkflowEtapasUnificado;
