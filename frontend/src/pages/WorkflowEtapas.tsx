import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircleOutline as CheckCircleIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { workflowService } from '../services/workflow.service';
import { resolveWorkflowId } from '../config/workflowAliases';

interface EtapaInfo {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO';
  puede_ver: boolean;
  puede_editar: boolean;
  fecha_completado?: string;
}

export const WorkflowEtapas = () => {
  const navigate = useNavigate();
  const { instanciaId, id: solicitudId } = useParams<{ instanciaId?: string; id?: string }>();
  const [etapas, setEtapas] = useState<EtapaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);

  useEffect(() => {
    loadWorkflowInstance();
  }, [instanciaId, solicitudId]);

  const loadWorkflowInstance = async () => {
    try {
      if (instanciaId) {
        // Si tenemos instanciaId directamente, usarlo
        const numericId = resolveWorkflowId(instanciaId);
        setWorkflowInstanciaId(numericId);
      } else if (solicitudId) {
        // Si tenemos solicitudId, buscar la instancia asociada
        const response = await fetch(`http://localhost:8000/api/v1/ppsh/solicitudes/${solicitudId}`);
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

  useEffect(() => {
    if (workflowInstanciaId) {
      loadData();
    }
  }, [workflowInstanciaId]);

  const loadData = async () => {
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
      
      // Construir lista de etapas con estado
      const workflow = instanciaData.workflow;
      const etapaActualId = instanciaData.etapa_actual_id;
      
      if (!workflow || !workflow.etapas) {
        setError('No se encontraron etapas en el workflow');
        return;
      }
      
      // Obtener permisos del usuario para cada etapa
      const etapasConEstado: EtapaInfo[] = await Promise.all(
        workflow.etapas.map(async (etapa: any) => {
          // Una etapa está completada si aparece en el historial como etapa_origen_id de una transición
          const completada = historial.some((h: any) => 
            h.tipo_cambio === 'TRANSICION' && h.etapa_origen_id === etapa.id
          );
          const esActual = etapa.id === etapaActualId;
          
          // Verificar permisos del usuario
          let puede_ver = true;
          let puede_editar = false;
          
          // Mostrar siempre botones para testing
          // En producción, esto debe basarse en la respuesta de permisos
          puede_ver = true;
          puede_editar = esActual;
          
          /* Código original de verificación de permisos - comentado temporalmente
          try {
            // Verificar permisos consultando al backend
            const permisos = await workflowService.verificarPermisos(
              parseInt(instanciaId!),
              etapa.id
              // TODO: Agregar perfil de usuario cuando sea necesario
            );
            puede_ver = permisos.puede_ver;
            puede_editar = permisos.puede_editar && esActual;
          } catch (error) {
            console.error(`Error verificando permisos para etapa ${etapa.id}:`, error);
            // Por defecto, si hay error, solo permitir ver etapas completadas
            puede_ver = completada;
            puede_editar = false;
          }
          */
          
          return {
            id: etapa.id,
            codigo: etapa.codigo,
            nombre: etapa.nombre,
            orden: etapa.orden || 0,
            estado: completada ? 'COMPLETADO' : esActual ? 'EN_PROCESO' : 'PENDIENTE',
            puede_ver,
            puede_editar,
            fecha_completado: completada ? historial.find((h: any) => h.tipo_cambio === 'TRANSICION' && h.etapa_origen_id === etapa.id)?.created_at : undefined,
          };
        })
      );

      // Ordenar por orden descendente (de más nueva a más antigua)
      etapasConEstado.sort((a, b) => b.orden - a.orden);
      
      setEtapas(etapasConEstado);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando las etapas del workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleVerEtapa = (etapaId: number, etapaOrden: number, estado: string): void => {
    // Usar solicitudId si está disponible, sino instanciaId o workflowInstanciaId
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    
    // Solo agregar readonly=true si la etapa está completada
    const readonlyParam = estado === 'COMPLETADO' ? '?readonly=true' : '';
    
    // Etapa 1 (Descarga de Requisitos) tiene vista especial
    if (etapaOrden === 1) {
      navigate(`${basePath}/descarga-requisitos${readonlyParam}`);
    } else if (etapaOrden === 2) {
      // Etapa 2 (Carga de Poder General) tiene vista especial
      navigate(`${basePath}/carga-poder${readonlyParam}`);
    } else if (etapaOrden === 3) {
      // Etapa 3 (Carga de Documentos PPSH) tiene vista especial
      navigate(`${basePath}/carga-documentos${readonlyParam}`);
    } else if (etapaOrden === 4) {
      // Etapa 4 (Revisión de requisitos) tiene vista especial
      navigate(`${basePath}/revision${readonlyParam}`);
    } else if (etapaOrden === 5) {
      // Etapa 5 (Cotización) tiene vista especial
      navigate(`${basePath}/cotizacion${readonlyParam}`);
    } else if (etapaOrden === 6) {
      // Etapa 6 (Ingreso de Datos del Caso)
      navigate(`${basePath}/ingreso-datos${readonlyParam}`);
    } else if (etapaOrden === 7) {
      // Etapa 7 (Impresión Lista de Casos)
      navigate(`${basePath}/impresion-lista${readonlyParam}`);
    } else if (etapaOrden === 8) {
      // Etapa 8 (Reasignación de Caso)
      navigate(`${basePath}/reasignacion${readonlyParam}`);
    } else if (etapaOrden === 9) {
      // Etapa 9 (Recepción REX)
      navigate(`${basePath}/recepcion-rex${readonlyParam}`);
    } else if (etapaOrden === 10) {
      // Etapa 10 (Recepción recibo Tesorería)
      navigate(`${basePath}/recepcion-recibo-tesoreria${readonlyParam}`);
    } else if (etapaOrden === 11) {
      // Etapa 11 (Entrega resolución)
      navigate(`${basePath}/entrega-resolucion${readonlyParam}`);
    } else {
      // Etapas 12 en adelante usan la vista dinámica
      navigate(`${basePath}/execution?etapa=${etapaId}${readonlyParam ? readonlyParam.replace('?', '&') : ''}`);
    }
  };

  const handleEditarEtapa = (etapaId: number, etapaOrden: number): void => {
    // Usar solicitudId si está disponible, sino instanciaId o workflowInstanciaId
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    
    // Etapa 1 (Descarga de Requisitos) tiene vista especial
    if (etapaOrden === 1) {
      navigate(`${basePath}/descarga-requisitos`);
    } else if (etapaOrden === 2) {
      // Etapa 2 (Carga de Poder General) tiene vista especial
      navigate(`${basePath}/carga-poder`);
    } else if (etapaOrden === 3) {
      // Etapa 3 (Carga de Documentos PPSH) tiene vista especial
      navigate(`${basePath}/carga-documentos`);
    } else if (etapaOrden === 4) {
      // Etapa 4 (Revisión de requisitos) tiene vista especial
      navigate(`${basePath}/revision`);
    } else if (etapaOrden === 5) {
      // Etapa 5 (Cotización) tiene vista especial
      navigate(`${basePath}/cotizacion`);
    } else if (etapaOrden === 6) {
      // Etapa 6 (Ingreso de Datos del Caso)
      navigate(`${basePath}/ingreso-datos`);
    } else if (etapaOrden === 7) {
      // Etapa 7 (Impresión Lista de Casos)
      navigate(`${basePath}/impresion-lista`);
    } else if (etapaOrden === 8) {
      // Etapa 8 (Reasignación de Caso)
      navigate(`${basePath}/reasignacion`);
    } else if (etapaOrden === 9) {
      // Etapa 9 (Recepción REX)
      navigate(`${basePath}/recepcion-rex`);
    } else if (etapaOrden === 10) {
      // Etapa 10 (Recepción recibo Tesorería)
      navigate(`${basePath}/recepcion-recibo-tesoreria`);
    } else if (etapaOrden === 11) {
      // Etapa 11 (Entrega resolución)
      navigate(`${basePath}/entrega-resolucion`);
    } else {
      // Etapas 12 en adelante usan la vista dinámica
      navigate(`${basePath}/execution?etapa=${etapaId}`);
    }
  };

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

  // Filtrar etapas
  const filteredEtapas = etapas.filter(e => 
    e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar etapas actuales (solo en proceso) y completadas
  const etapasActuales = filteredEtapas.filter(e => e.estado === 'EN_PROCESO');
  const etapasCompletadas = filteredEtapas.filter(e => e.estado === 'COMPLETADO');

  const EtapaRow = ({ etapa }: { etapa: EtapaInfo }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        minHeight: 40,
        '&:hover': { backgroundColor: '#fafafa' },
      }}
    >
      {/* Código Etapa */}
      <Box sx={{ width: 100, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 400 }}>
          {etapa.orden}
        </Typography>
      </Box>

      {/* Nombre Etapa */}
      <Box sx={{ flex: 1, px: 2 }}>
        <Typography sx={{ fontSize: 16, color: etapa.estado === 'COMPLETADO' ? '#333333' : '#4d4d4d', fontWeight: 400 }}>
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
              '&:hover': { backgroundColor: 'transparent', color: '#0e5fa6' },
            }}
          >
            Ver y editar
          </Button>
        ) : etapa.puede_ver && etapa.estado === 'COMPLETADO' ? (
          <Button
            size="small"
            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleVerEtapa(etapa.id, etapa.orden, etapa.estado)}
            sx={{
              textTransform: 'none',
              color: '#333333',
              fontSize: 14,
              fontWeight: 400,
              '&:hover': { backgroundColor: 'transparent', color: '#0e5fa6' },
            }}
          >
            Ver
          </Button>
        ) : null}
      </Box>
    </Box>
  );

  const SectionHeader = () => (
    <>
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
          <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500 }}>
            Etapa
          </Typography>
        </Box>
        <Box sx={{ flex: 1, px: 2 }}>
          <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500 }}>
            Nombre etapa
          </Typography>
        </Box>
        <Box sx={{ width: 180, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500 }}>
            Estado
          </Typography>
        </Box>
        <Box sx={{ width: 174, flexShrink: 0, textAlign: 'right' }}>
          <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 500 }}>
            Acciones
          </Typography>
        </Box>
      </Box>
    </>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1194, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
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
          Etapas
        </Typography>
      </Breadcrumbs>

      {/* Título */}
      <Typography 
        variant="h3"
        sx={{ 
          fontWeight: 700, 
          color: '#333333',
          mb: 4,
          fontSize: 48,
        }}
      >
        Etapas
      </Typography>

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3, maxWidth: 360 }}>
        <TextField
          fullWidth
          placeholder="N"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#4d4d4d' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f1f3f4',
              borderRadius: '4px',
              '& fieldset': {
                borderColor: '#eef3f5',
              },
            },
          }}
        />
      </Box>

      {/* Etapas Actuales */}
      {etapasActuales.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <SectionHeader />
          {etapasActuales.map((etapa) => (
            <EtapaRow key={etapa.id} etapa={etapa} />
          ))}
        </Box>
      )}

      {/* Historial */}
      {etapasCompletadas.length > 0 && (
        <Box>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 500, 
              color: '#333333',
              mb: 3,
              fontSize: 36,
            }}
          >
            Historial
          </Typography>
          <SectionHeader />
          {etapasCompletadas.map((etapa) => (
            <EtapaRow key={etapa.id} etapa={etapa} />
          ))}
        </Box>
      )}

      {filteredEtapas.length === 0 && (
        <Alert severity="info">
          No hay etapas que coincidan con la búsqueda.
        </Alert>
      )}
    </Box>
  );
};
