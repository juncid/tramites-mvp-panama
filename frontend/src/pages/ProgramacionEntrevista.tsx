import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { WorkflowDateTimePicker } from '../components/workflow/fields';
import { useWorkflowEtapa } from '../hooks/useWorkflowEtapa';

/**
 * Vista 9: Programación de Entrevista (flujo alternativo)
 * 
 * Permite seleccionar fecha y hora para la entrevista
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const ProgramacionEntrevista = () => {
  const [fechaEntrevista, setFechaEntrevista] = useState('');

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar 
  } = useWorkflowEtapa({
    validationFn: (respuestas) => {
      if (!respuestas.FECHA_ENTREVISTA) {
        return 'Por favor seleccione una fecha y hora para la entrevista';
      }
      return null;
    }
  });

  const onGuardar = () => {
    handleGuardar({
      FECHA_ENTREVISTA: fechaEntrevista
    });
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
      onNext={readonly ? undefined : onGuardar}
      cancelButtonText="Volver"
      nextButtonText="Guardar"
      loading={loading}
      completing={saving}
      error={error}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <WorkflowDateTimePicker
            label="Seleccione fecha de entrevista"
            value={fechaEntrevista}
            onChange={setFechaEntrevista}
            disabled={readonly}
          />
        </Box>
      }
    />
  );
};
