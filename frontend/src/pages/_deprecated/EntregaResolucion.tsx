import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../../components/workflow/EtapaInformativa';
import { WorkflowRadioGroup } from '../../components/workflow/fields';
import { useWorkflowEtapa } from '../../hooks/useWorkflowEtapa';
import { getEtapaBreadcrumbs, getViewConfig } from '../../config/workflowViews';

const ETAPA_ORDEN = 11;
const config = getViewConfig(ETAPA_ORDEN)!;

/**
 * Vista 11: Entrega resolución
 * 
 * Permite confirmar si se hizo entrega de la resolución
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const EntregaResolucion = () => {
  const [entregaResolucion, setEntregaResolucion] = useState<string>('SI');

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar 
  } = useWorkflowEtapa({
    validationFn: () => null, // Sin validación adicional
  });

  const onGuardar = () => {
    handleGuardar({
      ENTREGA_RESOLUCION: entregaResolucion
    });
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={getEtapaBreadcrumbs(ETAPA_ORDEN)}
      contentTitle={config.contentTitle}
      contentDescription={config.contentDescription}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : onGuardar}
      cancelButtonText="Cancelar"
      nextButtonText="Guardar"
      loading={loading}
      completing={saving}
      error={error}
      customContent={
        <Box>
          <WorkflowRadioGroup
            label="¿Se hizo entrega de la resolución?"
            value={entregaResolucion}
            onChange={setEntregaResolucion}
            options={[
              { value: 'NO', label: 'No' },
              { value: 'SI', label: 'Sí' },
            ]}
            disabled={readonly}
          />
        </Box>
      }
    />
  );
};
