/**
 * Página que muestra el workflow de un caso específico
 * Incluye vista del progreso y formulario de ejecución de etapas
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Breadcrumbs,
  Link,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { UserWorkflowView } from '../components/Workflow/UserWorkflowView';
import { EtapaExecutionForm } from '../components/Workflow/EtapaExecutionForm';
import { useWorkflowState } from '../hooks/useWorkflowState';
import { workflowService } from '../services/workflow.service';
import type { WorkflowEtapa } from '../types/workflow';

/**
 * Página principal del workflow de un caso
 */
export const CasoWorkflowPage: React.FC = () => {
  const { instanciaId } = useParams<{ instanciaId: string }>();
  const navigate = useNavigate();
  
  // TODO: Obtener perfil del usuario actual desde el contexto de autenticación
  const perfilUsuario = 'Ciudadano'; // Hardcoded por ahora
  
  const [etapaActualId, setEtapaActualId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [etapaCompleta, setEtapaCompleta] = useState<WorkflowEtapa | null>(null);
  const [cargandoEtapa, setCargandoEtapa] = useState(false);

  const instanciaIdNum = instanciaId ? parseInt(instanciaId, 10) : null;
  const { workflowState, refetch } = useWorkflowState(instanciaIdNum, perfilUsuario);

  // Cargar etapa completa con preguntas cuando se selecciona
  useEffect(() => {
    const cargarEtapaCompleta = async () => {
      if (!etapaActualId) {
        setEtapaCompleta(null);
        return;
      }

      setCargandoEtapa(true);
      try {
        const etapa = await workflowService.getEtapa(etapaActualId);
        setEtapaCompleta(etapa);
      } catch (error) {
        console.error('Error al cargar etapa:', error);
        setEtapaCompleta(null);
      } finally {
        setCargandoEtapa(false);
      }
    };

    cargarEtapaCompleta();
  }, [etapaActualId]);

  // Manejar click en etapa para ejecutarla
  const handleEtapaClick = (etapaId: number) => {
    setEtapaActualId(etapaId);
    setMostrarFormulario(true);
  };

  // Manejar éxito de ejecución
  const handleEjecucionExitosa = async () => {
    setMostrarFormulario(false);
    setEtapaActualId(null);
    setEtapaCompleta(null);
    // Actualizar el estado del workflow
    await refetch();
  };

  // Manejar cancelación
  const handleCancelar = () => {
    setMostrarFormulario(false);
    setEtapaActualId(null);
    setEtapaCompleta(null);
  };

  // Validación de instanciaId
  if (!instanciaIdNum) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">ID de instancia inválido</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Inicio
          </Link>
          <Link
            color="inherit"
            href="/mis-tramites"
            onClick={(e) => {
              e.preventDefault();
              navigate('/mis-tramites');
            }}
          >
            Mis Trámites
          </Link>
          <Typography color="text.primary">
            {workflowState?.num_expediente || 'Cargando...'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Botón de regresar */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mis-tramites')}
          variant="outlined"
        >
          Volver a Mis Trámites
        </Button>
      </Box>

      {/* Vista principal del workflow */}
      <UserWorkflowView
        instanciaId={instanciaIdNum}
        perfil={perfilUsuario}
        onEtapaClick={handleEtapaClick}
      />

      {/* Dialog con formulario de ejecución de etapa */}
      <Dialog
        open={mostrarFormulario}
        onClose={handleCancelar}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Completar Etapa
            </Typography>
            <IconButton onClick={handleCancelar}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {cargandoEtapa ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : etapaActualId && etapaCompleta ? (
            <EtapaExecutionForm
              instanciaId={instanciaIdNum}
              etapa={etapaCompleta}
              perfil={perfilUsuario}
              onSuccess={handleEjecucionExitosa}
              onCancel={handleCancelar}
            />
          ) : (
            <Alert severity="info">No se pudo cargar el formulario de la etapa</Alert>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CasoWorkflowPage;
