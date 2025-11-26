import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { WorkflowTextField, WorkflowFileUpload } from '../components/workflow/fields';
import { useWorkflowEtapa } from '../hooks/useWorkflowEtapa';
import { getEtapaBreadcrumbs, getViewConfig } from '../config/workflowViews';

const ETAPA_ORDEN = 10;
const config = getViewConfig(ETAPA_ORDEN)!;

/**
 * Vista 10: Recepción recibo Tesorería
 * 
 * Permite cargar archivo de recibo de tesorería con indicaciones adicionales
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const RecepcionReciboTesoreria = () => {
  const [reciboTesoreria, setReciboTesoreria] = useState('');
  const [archivoRecibo, setArchivoRecibo] = useState<File | null>(null);

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
      RECIBO_TESORERIA: reciboTesoreria,
      // TODO: Implementar subida de archivo si es necesario
      ...(archivoRecibo && { ARCHIVO_RECIBO_TESORERIA: archivoRecibo.name })
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
            label="Recibo Tesorería"
            value={reciboTesoreria}
            onChange={(e) => setReciboTesoreria(e.target.value)}
            disabled={readonly}
          />
          <Box sx={{ mt: 3 }}>
            <WorkflowFileUpload
              file={archivoRecibo}
              onFileChange={setArchivoRecibo}
              disabled={readonly}
              showTextField={false}
            />
          </Box>
        </Box>
      }
    />
  );
};
