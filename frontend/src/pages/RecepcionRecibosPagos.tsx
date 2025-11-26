import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { WorkflowRadioGroup } from '../components/workflow/fields';
import { useWorkflowEtapa } from '../hooks/useWorkflowEtapa';
import { getEtapaBreadcrumbs, getViewConfig } from '../config/workflowViews';

const ETAPA_ORDEN = 6;
const config = getViewConfig(ETAPA_ORDEN)!;

/**
 * Vista 6: Recepción de Recibos de Pagos en Tesorería
 * 
 * Permite seleccionar si se han recibido los recibos de pagos en tesorería
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const RecepcionRecibosPagos = () => {
  const [recepcionRecibos, setRecepcionRecibos] = useState<string>('');

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar,
    setError 
  } = useWorkflowEtapa({
    validationFn: (respuestas) => {
      if (!respuestas.DATOS_CASO) {
        return 'Por favor seleccione una opción';
      }
      return null;
    }
  });

  const onGuardar = () => {
    handleGuardar({
      DATOS_CASO: recepcionRecibos
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
      cancelButtonText="Volver"
      nextButtonText="Guardar"
      loading={loading}
      completing={saving}
      error={error}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <WorkflowRadioGroup
            label="Recepción recibos pagos en tesorería"
            value={recepcionRecibos}
            onChange={setRecepcionRecibos}
            options={[
              { value: 'No', label: 'No' },
              { value: 'Si', label: 'Si' },
            ]}
            disabled={readonly}
          />
        </Box>
      }
    />
  );
};
