import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

/**
 * Vista 6: Recepción de Recibos de Pagos en Tesorería
 * 
 * Permite seleccionar si se han recibido los recibos de pagos en tesorería
 */
export const RecepcionRecibosPagos = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);

  const [recepcionRecibos, setRecepcionRecibos] = useState<'No' | 'Si' | ''>('');

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

    // Validar campos obligatorios
    if (!recepcionRecibos) {
      alert('Por favor seleccione una opción');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      const respuestas = {
        DATOS_CASO: recepcionRecibos
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
        { label: 'Ingreso de Datos' },
      ]}
      contentTitle="Recepción recibos pagos en tesorería"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam. Dolor ornare at ac sit sagittis. Etiam elit risus volutpat sed. Orci id in mauris turpis neque. Amet diam morbi vitae nisi ultrices volutpat. Turpis vestibulum condimentum viverra mauris volutpat. Adipiscing ultrices curabitur vehicula ultrices adipiscing dictum nunc facilisi mi. Etiam congue nisl at consequat lobortis vitae nunc."
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
            <FormControl component="fieldset" disabled={readonly} fullWidth>
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: 500,
                  fontSize: '16px',
                  color: '#333',
                  mb: 2,
                  '&.Mui-focused': {
                    color: '#0e5fa6',
                  }
                }}
              >
                Recepción recibos pagos en tesorería
              </FormLabel>
              <RadioGroup
                value={recepcionRecibos}
                onChange={(e) => setRecepcionRecibos(e.target.value as 'No' | 'Si')}
              >
                <FormControlLabel
                  value="No"
                  control={<Radio />}
                  label="No"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '16px',
                    }
                  }}
                />
                <FormControlLabel
                  value="Si"
                  control={<Radio />}
                  label="Si"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '16px',
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>
      }
    />
  );
};
