import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { WorkflowTextField, WorkflowFileUpload } from '../components/workflow/fields';
import { useWorkflowEtapa } from '../hooks/useWorkflowEtapa';
import { getEtapaBreadcrumbs, getViewConfig } from '../config/workflowViews';

const ETAPA_ORDEN = 9;
const config = getViewConfig(ETAPA_ORDEN)!;

/**
 * Vista 9: Recepción REX
 * 
 * Permite cargar archivo REX con indicaciones adicionales
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const RecepcionRex = () => {
  const [rexValue, setRexValue] = useState('');
  const [archivoRex, setArchivoRex] = useState<File | null>(null);

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar 
  } = useWorkflowEtapa();

  const onGuardar = () => {
    handleGuardar({
      REX: rexValue,
      // TODO: Implementar subida de archivo si es necesario
      ...(archivoRex && { ARCHIVO_REX: archivoRex.name })
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
          <WorkflowTextField
            label="REX"
            value={rexValue}
            onChange={(e) => setRexValue(e.target.value)}
            disabled={readonly}
          />
          <Box sx={{ mt: 3 }}>
            <WorkflowFileUpload
              file={archivoRex}
              onFileChange={setArchivoRex}
              disabled={readonly}
              showTextField={false}
            />
          </Box>
        </Box>
      }
    />
  );
};
