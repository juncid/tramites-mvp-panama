import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

/**
 * Vista 11: Entrega resolución
 * 
 * Permite confirmar si se hizo entrega de la resolución
 */
export const EntregaResolucion = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [entregaResolucion, setEntregaResolucion] = useState<'SI' | 'NO'>('SI');

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

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      const respuestas = {
        ENTREGA_RESOLUCION: entregaResolucion
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

  const customContent = (
    <Box>
      {/* Pregunta de entrega de resolución */}
      <FormControl component="fieldset" disabled={readonly}>
        <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 1, color: '#333' }}>
          ¿Se hizo entrega de la resolución?
        </Typography>
        <RadioGroup
          value={entregaResolucion}
          onChange={(e) => setEntregaResolucion(e.target.value as 'SI' | 'NO')}
        >
          <FormControlLabel
            value="NO"
            control={
              <Radio 
                sx={{
                  color: '#333',
                  '&.Mui-checked': {
                    color: '#0e5fa6',
                  },
                }}
              />
            }
            label="No"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '16px',
                fontWeight: 500,
                color: '#333',
              },
            }}
          />
          <FormControlLabel
            value="SI"
            control={
              <Radio 
                sx={{
                  color: '#333',
                  '&.Mui-checked': {
                    color: '#0e5fa6',
                  },
                }}
              />
            }
            label="Sí"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '16px',
                fontWeight: 500,
                color: '#333',
              },
            }}
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Entrega resolución' },
      ]}
      contentTitle="Entrega resolución"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam."
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleGuardar}
      cancelButtonText="Cancelar"
      nextButtonText="Guardar"
      loading={loading}
      error={error}
      customContent={customContent}
    />
  );
};
