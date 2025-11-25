import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Typography } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

/**
 * Vista 9: Programación de Entrevista
 * 
 * Permite seleccionar fecha y hora para la entrevista
 */
export const ProgramacionEntrevista = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [fechaEntrevista, setFechaEntrevista] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let wInstanciaId: number | null = null;

        if (instanciaId) {
          wInstanciaId = parseInt(instanciaId);
        } else if (solicitudId) {
          const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
          if (!solicitud.workflow_instancia_id) {
            throw new Error('La solicitud no tiene workflow asociado');
          }
          wInstanciaId = solicitud.workflow_instancia_id;
        }

        setWorkflowInstanciaId(wInstanciaId);

        if (wInstanciaId) {
          const instancia = await workflowService.getInstancia(wInstanciaId);
          if (instancia.etapa_actual_id) {
            setEtapaId(instancia.etapa_actual_id);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [instanciaId, solicitudId]);

  const handleCancelar = () => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
  };

  const handleGuardar = async () => {
    if (!workflowInstanciaId || !etapaId) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    if (!fechaEntrevista) {
      alert('Por favor seleccione una fecha y hora para la entrevista');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      const respuestas = {
        FECHA_ENTREVISTA: fechaEntrevista
      };

      await workflowService.completarEtapa(
        workflowInstanciaId,
        etapaId,
        respuestas,
        userPerfil
      );

      const baseRoute = instanciaId ? `/workflows/${instanciaId}` : `/solicitudes/${solicitudId}`;
      navigate(`${baseRoute}/etapas`);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert(error.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Entrevista' },
      ]}
      contentTitle="Entrevista"
      contentDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleGuardar}
      cancelButtonText="Volver"
      nextButtonText="Guardar"
      loading={loading}
      error={error}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 500, fontSize: '16px' }}>
              Seleccione fecha de entrevista
            </Typography>
            <TextField
              fullWidth
              type="datetime-local"
              value={fechaEntrevista}
              onChange={(e) => setFechaEntrevista(e.target.value)}
              disabled={readonly}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 56,
                  borderRadius: '4px',
                  fontFamily: 'Roboto',
                  fontSize: 16,
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#d0d0d0',
                    borderWidth: '1px',
                    borderRadius: '4px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#333333',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0e5fa6',
                    borderWidth: '2px',
                  },
                },
              }}
            />
          </Box>

          {fechaEntrevista && (
            <Box
              sx={{
                p: 2,
                bgcolor: '#e3f2fd',
                borderRadius: '4px',
                border: '1px solid #1976d2',
              }}
            >
              <Typography sx={{ fontSize: '14px', color: '#1976d2', fontWeight: 500 }}>
                Fecha seleccionada
              </Typography>
              <Typography sx={{ fontSize: '16px', color: '#1976d2', mt: 0.5 }}>
                {new Date(fechaEntrevista).toLocaleString('es-PA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          )}
        </Box>
      }
    />
  );
};
