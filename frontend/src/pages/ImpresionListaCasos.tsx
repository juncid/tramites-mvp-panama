import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Print as PrintIcon } from '@mui/icons-material';
import { Box, Checkbox, FormControlLabel, Typography, Paper } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

interface CasoImpresion {
  instancia_id: number;
  num_expediente: string;
  nombre_instancia: string;
  ppsh_solicitud_id: number;
}

/**
 * Vista 7: Impresión Lista de Casos
 * 
 * Muestra casos PPSH donde etapa 6 está completada y etapa 7 en proceso.
 * Permite seleccionar múltiples casos y al guardar marca la etapa 7 como completada.
 */
export const ImpresionListaCasos = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [casos, setCasos] = useState<CasoImpresion[]>([]);
  const [casosSeleccionados, setCasosSeleccionados] = useState<Set<number>>(new Set());

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

        // Cargar casos PPSH en etapa 7 (etapa 6 completada, etapa 7 en proceso)
        const instancias = await workflowService.getInstancias({
          workflow_id: 5005, // PPSH
          estado: 'EN_PROGRESO'
        });

        // Filtrar instancias que estén en etapa 7 (orden 7)
        const casosEnEtapa7: CasoImpresion[] = [];
        for (const inst of instancias) {
          // Obtener detalles completos de la instancia para tener etapa_actual
          const detalles = await workflowService.getInstancia(inst.id);
          
          if (detalles.etapa_actual?.orden === 7) {
            // Extraer ppsh_solicitud_id del metadata_adicional
            const instAny = inst as any;
            let ppshSolicitudId = 0;
            let numExpedientePPSH = '';
            
            if (instAny.metadata_adicional?.ppsh_solicitud_id) {
              ppshSolicitudId = instAny.metadata_adicional.ppsh_solicitud_id;
            }
            
            if (instAny.metadata_adicional?.ppsh_num_expediente) {
              numExpedientePPSH = instAny.metadata_adicional.ppsh_num_expediente;
            }
            
            casosEnEtapa7.push({
              instancia_id: inst.id,
              num_expediente: numExpedientePPSH || instAny.nombre_instancia || `Solicitud ${ppshSolicitudId}`,
              nombre_instancia: instAny.nombre_instancia || `Caso ${inst.id}`,
              ppsh_solicitud_id: ppshSolicitudId
            });
          }
        }

        setCasos(casosEnEtapa7);

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

  const handleToggleCaso = (instanciaId: number) => {
    const newSeleccionados = new Set(casosSeleccionados);
    if (newSeleccionados.has(instanciaId)) {
      newSeleccionados.delete(instanciaId);
    } else {
      newSeleccionados.add(instanciaId);
    }
    setCasosSeleccionados(newSeleccionados);
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !etapaId) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    if (casosSeleccionados.size === 0) {
      alert('Por favor seleccione al menos un caso');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      // Guardar los casos seleccionados
      const respuestas = {
        CASOS_IMPRESOS: Array.from(casosSeleccionados)
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
      console.error('Error al completar:', error);
      alert(error.response?.data?.detail || 'Error al completar la etapa');
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    console.log('Imprimiendo lista de casos...');
    window.print();
  };

  const customContent = (
    <Box>
      {casos.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No hay casos disponibles para impresión en este momento.
        </Typography>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontSize: '18px', fontWeight: 500 }}>
            Seleccione los casos a imprimir:
          </Typography>
          {casos.map((caso) => (
            <Paper
              key={caso.instancia_id}
              sx={{
                p: 2,
                mb: 2,
                border: casosSeleccionados.has(caso.instancia_id) ? '2px solid #0e5fa6' : '1px solid #d0d0d0',
                borderRadius: '4px',
                backgroundColor: casosSeleccionados.has(caso.instancia_id) ? '#f0f7ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#0e5fa6',
                  backgroundColor: '#f8fafc'
                }
              }}
              onClick={() => !readonly && handleToggleCaso(caso.instancia_id)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={casosSeleccionados.has(caso.instancia_id)}
                    onChange={() => handleToggleCaso(caso.instancia_id)}
                    disabled={readonly}
                    sx={{
                      color: '#0e5fa6',
                      '&.Mui-checked': {
                        color: '#0e5fa6',
                      }
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                      {caso.nombre_instancia}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Expediente: {caso.num_expediente}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          ))}

          {casosSeleccionados.size > 0 && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: '#f0f7ff',
                borderRadius: '4px',
                border: '1px solid #0e5fa6'
              }}
            >
              <Typography variant="body1" sx={{ color: '#0e5fa6', fontWeight: 500 }}>
                {casosSeleccionados.size} caso(s) seleccionado(s)
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Impresión Lista' },
      ]}
      contentTitle="Impresión lista de casos"
      contentDescription="Seleccione los casos que han sido procesados y están listos para imprimir. La selección de casos marcará esta etapa como completada."
      customContent={customContent}
      actionButton={{
        label: 'Imprimir Lista',
        icon: <PrintIcon />,
        onClick: handleImprimir,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      cancelButtonText="Volver"
      nextButtonText="Guardar y Continuar"
      loading={loading}
      error={error}
    />
  );
};
