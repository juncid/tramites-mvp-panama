import { useState, useEffect } from 'react';
import { Print as PrintIcon } from '@mui/icons-material';
import { Box, Checkbox, FormControlLabel, Typography, Paper } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { useAuth } from '../context/AuthContext';
import { useWorkflowEtapa } from '../hooks';

interface CasoImpresion {
  instancia_id: number;
  num_expediente: string;
  nombre_instancia: string;
  ppsh_solicitud_id: number;
}

const ETAPA_ORDEN = 7;

/**
 * Vista 7: Impresión Lista de Casos
 * 
 * Muestra casos PPSH donde etapa 6 está completada y etapa 7 en proceso.
 * Permite seleccionar múltiples casos y al guardar marca la etapa 7 como completada.
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa para manejo de workflow.
 */
export const ImpresionListaCasos = () => {
  const { usuario } = useAuth();

  // Hook para manejo de workflow
  const {
    loading,
    error,
    completing,
    readonly,
    instancia,
    workflowInstanciaId,
    handleCancelar,
    setCompleting,
    setError,
    setLoading,
    navigate,
    basePath,
  } = useWorkflowEtapa(ETAPA_ORDEN);

  const [casos, setCasos] = useState<CasoImpresion[]>([]);
  const [casosSeleccionados, setCasosSeleccionados] = useState<Set<number>>(new Set());

  // Cargar casos disponibles para impresión
  useEffect(() => {
    const loadCasos = async () => {
      try {
        // Cargar casos PPSH en etapa 7 (etapa 6 completada, etapa 7 en proceso)
        const instancias = await workflowService.getInstancias({
          workflow_id: 5005, // PPSH
          estado: 'EN_PROGRESO'
        });

        // Filtrar instancias que estén en etapa 7 (orden 7)
        const casosEnEtapa7: CasoImpresion[] = [];
        for (const inst of instancias) {
          const detalles = await workflowService.getInstancia(inst.id);
          
          if (detalles.etapa_actual?.orden === 7) {
            const instAny = inst as any;
            let ppshSolicitudId = instAny.metadata_adicional?.ppsh_solicitud_id || 0;
            let numExpedientePPSH = instAny.metadata_adicional?.ppsh_num_expediente || '';
            
            casosEnEtapa7.push({
              instancia_id: inst.id,
              num_expediente: numExpedientePPSH || instAny.nombre_instancia || `Solicitud ${ppshSolicitudId}`,
              nombre_instancia: instAny.nombre_instancia || `Caso ${inst.id}`,
              ppsh_solicitud_id: ppshSolicitudId
            });
          }
        }

        setCasos(casosEnEtapa7);
      } catch (err) {
        console.error('Error cargando casos:', err);
        setError('Error al cargar casos para impresión');
      }
    };

    loadCasos();
  }, [setError]);

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
    if (!workflowInstanciaId || !instancia?.etapa_actual_id) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    if (casosSeleccionados.size === 0) {
      alert('Por favor seleccione al menos un caso');
      return;
    }

    setCompleting(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';
      const respuestas = { CASOS_IMPRESOS: Array.from(casosSeleccionados) };

      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        respuestas,
        userPerfil
      );

      navigate(`${basePath}/etapas`);
    } catch (err: any) {
      console.error('Error al completar:', err);
      alert(err.response?.data?.detail || 'Error al completar la etapa');
    } finally {
      setCompleting(false);
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
                p: 2, mb: 2, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
                border: casosSeleccionados.has(caso.instancia_id) ? '2px solid #0e5fa6' : '1px solid #d0d0d0',
                backgroundColor: casosSeleccionados.has(caso.instancia_id) ? '#f0f7ff' : 'white',
                '&:hover': { borderColor: '#0e5fa6', backgroundColor: '#f8fafc' }
              }}
              onClick={() => !readonly && handleToggleCaso(caso.instancia_id)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={casosSeleccionados.has(caso.instancia_id)}
                    onChange={() => handleToggleCaso(caso.instancia_id)}
                    disabled={readonly}
                    sx={{ color: '#0e5fa6', '&.Mui-checked': { color: '#0e5fa6' } }}
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
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: '4px', border: '1px solid #0e5fa6' }}>
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
      actionButton={{ label: 'Imprimir Lista', icon: <PrintIcon />, onClick: handleImprimir }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      cancelButtonText="Volver"
      nextButtonText="Guardar y Continuar"
      loading={loading}
      completing={completing}
      error={error}
    />
  );
};
