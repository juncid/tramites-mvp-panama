import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

/**
 * Vista 11: Dictamen Final
 * 
 * Permite ingresar el dictamen final del caso con decisión de aprobación o rechazo
 */
export const DictamenFinal = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [dictamen, setDictamen] = useState('');
  const [decision, setDecision] = useState<'APROBADO' | 'RECHAZADO' | ''>('');

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

    if (!dictamen.trim()) {
      alert('Por favor ingrese el dictamen');
      return;
    }

    if (!decision) {
      alert('Por favor seleccione una decisión (Aprobado/Rechazado)');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      const respuestas = {
        DICTAMEN_FINAL: JSON.stringify({
          dictamen: dictamen,
          decision: decision,
          fecha: new Date().toISOString(),
          funcionario: usuario?.nombre || 'Sistema'
        })
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
        { label: 'Dictamen Final' },
      ]}
      contentTitle="Dictamen"
      contentDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleGuardar}
      cancelButtonText="Volver"
      nextButtonText="Guardar Dictamen"
      loading={loading}
      error={error}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Decisión */}
          <Box>
            <FormControl component="fieldset" disabled={readonly}>
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: 500,
                  fontSize: '16px',
                  color: '#333',
                  mb: 1,
                  '&.Mui-focused': {
                    color: '#0e5fa6',
                  }
                }}
              >
                Decisión
              </FormLabel>
              <RadioGroup
                value={decision}
                onChange={(e) => setDecision(e.target.value as 'APROBADO' | 'RECHAZADO')}
                row
              >
                <FormControlLabel
                  value="APROBADO"
                  control={<Radio />}
                  label="Aprobado"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '16px',
                    }
                  }}
                />
                <FormControlLabel
                  value="RECHAZADO"
                  control={<Radio />}
                  label="Rechazado"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '16px',
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Dictamen */}
          <Box>
            <Typography sx={{ mb: 1, fontWeight: 500, fontSize: '16px' }}>
              Dictamen final
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={dictamen}
              onChange={(e) => setDictamen(e.target.value)}
              disabled={readonly}
              placeholder="Ingrese el dictamen final del caso, incluyendo fundamentos legales, análisis de la situación y conclusión..."
              sx={{
                '& .MuiOutlinedInput-root': {
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
            <Typography
              sx={{
                mt: 1,
                fontSize: '14px',
                color: dictamen.length > 0 ? '#666' : '#999',
                textAlign: 'right'
              }}
            >
              {dictamen.length} caracteres
            </Typography>
          </Box>

          {/* Resumen de decisión */}
          {decision && dictamen.trim() && (
            <Box
              sx={{
                p: 2,
                bgcolor: decision === 'APROBADO' ? '#e8f5e9' : '#ffebee',
                borderRadius: '4px',
                border: `1px solid ${decision === 'APROBADO' ? '#4caf50' : '#f44336'}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  color: decision === 'APROBADO' ? '#2e7d32' : '#c62828',
                  fontWeight: 500
                }}
              >
                Decisión: {decision}
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: decision === 'APROBADO' ? '#2e7d32' : '#c62828',
                  mt: 0.5
                }}
              >
                {decision === 'APROBADO'
                  ? 'La solicitud será aprobada con este dictamen'
                  : 'La solicitud será rechazada con este dictamen'}
              </Typography>
            </Box>
          )}
        </Box>
      }
    />
  );
};
