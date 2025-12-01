import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { EtapaInformativa } from '../../components/workflow/EtapaInformativa';
import { WorkflowTextArea, WorkflowRadioGroup } from '../../components/workflow/fields';
import { useWorkflowEtapa } from '../../hooks/useWorkflowEtapa';
import { successBoxStyles, errorBoxStyles } from '../../theme/workflowTheme';

/**
 * Vista 11: Dictamen Final
 * 
 * Permite ingresar el dictamen final del caso con decisión de aprobación o rechazo
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const DictamenFinal = () => {
  const [dictamen, setDictamen] = useState('');
  const [decision, setDecision] = useState<string>('');

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar,
    usuario 
  } = useWorkflowEtapa({
    validationFn: (respuestas) => {
      const data = JSON.parse(respuestas.DICTAMEN_FINAL);
      if (!data.dictamen?.trim()) {
        return 'Por favor ingrese el dictamen';
      }
      if (!data.decision) {
        return 'Por favor seleccione una decisión (Aprobado/Rechazado)';
      }
      return null;
    }
  });

  const onGuardar = () => {
    handleGuardar({
      DICTAMEN_FINAL: JSON.stringify({
        dictamen: dictamen,
        decision: decision,
        fecha: new Date().toISOString(),
        funcionario: usuario?.nombre || 'Sistema'
      })
    });
  };

  const isAprobado = decision === 'APROBADO';
  const showResumen = decision && dictamen.trim();

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
      onNext={readonly ? undefined : onGuardar}
      cancelButtonText="Volver"
      nextButtonText="Guardar Dictamen"
      loading={loading}
      completing={saving}
      error={error}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Decisión */}
          <WorkflowRadioGroup
            label="Decisión"
            value={decision}
            onChange={setDecision}
            options={[
              { value: 'APROBADO', label: 'Aprobado' },
              { value: 'RECHAZADO', label: 'Rechazado' },
            ]}
            row
            disabled={readonly}
          />

          {/* Dictamen */}
          <WorkflowTextArea
            label="Dictamen final"
            value={dictamen}
            onChange={(e) => setDictamen(e.target.value)}
            disabled={readonly}
            rows={12}
            showCharCount
            placeholder="Ingrese el dictamen final del caso, incluyendo fundamentos legales, análisis de la situación y conclusión..."
          />

          {/* Resumen de decisión */}
          {showResumen && (
            <Box sx={isAprobado ? successBoxStyles : errorBoxStyles}>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: isAprobado ? '#2e7d32' : '#c62828',
                  fontWeight: 500
                }}
              >
                Decisión: {decision}
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: isAprobado ? '#2e7d32' : '#c62828',
                  mt: 0.5
                }}
              >
                {isAprobado
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
