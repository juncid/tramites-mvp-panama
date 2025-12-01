import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../../components/workflow/EtapaInformativa';
import { WorkflowTextArea } from '../../components/workflow/fields';
import { useWorkflowEtapa } from '../../hooks/useWorkflowEtapa';
import { getEtapaBreadcrumbs } from '../../config/workflowViews';

/**
 * Vista 10: Notas de Entrevista (orden 10 en el flujo alternativo)
 * 
 * Permite ingresar notas detalladas de la entrevista realizada
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const NotasEntrevista = () => {
  const [notas, setNotas] = useState('');

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar 
  } = useWorkflowEtapa({
    validationFn: (respuestas) => {
      if (!respuestas.NOTAS_ENTREVISTA?.trim()) {
        return 'Por favor ingrese las notas de la entrevista';
      }
      return null;
    }
  });

  const onGuardar = () => {
    handleGuardar({
      NOTAS_ENTREVISTA: notas
    });
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Notas de Entrevista' },
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
          <WorkflowTextArea
            label="Notas de entrevista"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            disabled={readonly}
            rows={10}
            showCharCount
            placeholder="Ingrese las notas y observaciones de la entrevista..."
          />
        </Box>
      }
    />
  );
};
