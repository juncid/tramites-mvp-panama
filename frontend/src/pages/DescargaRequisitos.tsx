import React from 'react';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { getEtapaBreadcrumbs, getViewConfig } from '../config/workflowViews';
import { useWorkflowEtapa } from '../hooks';

const ETAPA_ORDEN = 1;
const config = getViewConfig(ETAPA_ORDEN)!;

/**
 * Vista para la Etapa 1: Descarga de Requisitos
 * 
 * Esta vista permite al usuario:
 * - Ver información sobre los requisitos del trámite PPSH
 * - Descargar documento con requisitos
 * - Avanzar automáticamente a etapas 2 y 3 al hacer clic en "Siguiente"
 * - Modo readonly para visualizar etapas completadas
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa pero mantiene lógica especial de auto-completar 3 etapas.
 */
export const DescargaRequisitos: React.FC = () => {
  const {
    loading,
    error,
    completing,
    readonly,
    instancia,
    workflowInstanciaId,
    basePath,
    handleCancelar,
    setCompleting,
    setError,
    navigate,
  } = useWorkflowEtapa(ETAPA_ORDEN);

  const handleDescargar = () => {
    // URL del archivo de requisitos en el backend
    const API_URL = 'http://localhost:8000';
    const archivoUrl = '/static/documentos/requisitos_ppsh.txt';
    
    // Abrir en nueva pestaña para descargar
    window.open(`${API_URL}${archivoUrl}`, '_blank');
    console.log('Descargando requisitos PPSH...');
  };

  const handleSiguiente = async () => {
    if (!workflowInstanciaId || !instancia) return;

    setCompleting(true);
    setError(null);

    try {
      // Simular proceso con 70% de éxito
      await new Promise(resolve => setTimeout(resolve, 1500));
      const exito = Math.random() > 0.3;

      if (!exito) {
        throw new Error('Error simulado: No se pudo completar la operación. Por favor, intente nuevamente.');
      }

      // Etapa 1: Descarga de Requisitos
      console.log('Completando Etapa 1: Descarga de Requisitos');
      await workflowService.completarEtapa(
        workflowInstanciaId,
        instancia.etapa_actual_id,
        { DESC_ARCHIVO: 'Descargado' },
        'CIUDADANO'
      );

      // Recargar instancia para obtener nueva etapa actual (etapa 2)
      let instanciaActualizada = await workflowService.getInstancia(workflowInstanciaId);
      console.log('Etapa actual después de completar etapa 1:', instanciaActualizada.etapa_actual_id);

      // Etapa 2: Carga de Poder General - marcar como completada
      if (instanciaActualizada.etapa_actual_id) {
        console.log('Auto-completando Etapa 2: Carga de Poder General');
        await workflowService.completarEtapa(
          workflowInstanciaId,
          instanciaActualizada.etapa_actual_id,
          { CARGA_PODER: 'Completado automáticamente' },
          'CIUDADANO'
        );

        // Recargar nuevamente para obtener etapa 3
        instanciaActualizada = await workflowService.getInstancia(workflowInstanciaId);
        console.log('Etapa actual después de completar etapa 2:', instanciaActualizada.etapa_actual_id);

        // Etapa 3: Carga de Solicitud Firmada - marcar como completada
        if (instanciaActualizada.etapa_actual_id) {
          console.log('Auto-completando Etapa 3: Carga de Solicitud Firmada');
          await workflowService.completarEtapa(
            workflowInstanciaId,
            instanciaActualizada.etapa_actual_id,
            { CARGA_SOLICITUD: 'Completado automáticamente' },
            'CIUDADANO'
          );
        }
      }

      // Al finalizar las 3 etapas, volver a la vista de etapas
      console.log('Etapas 1-3 completadas, volviendo a vista de etapas');
      navigate(`${basePath}/etapas`);
      
    } catch (err: any) {
      console.error('Error completando etapas:', err);
      setError(err.message || err.response?.data?.detail || 'Error al completar las etapas');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={getEtapaBreadcrumbs(ETAPA_ORDEN)}
      contentTitle={config.contentTitle}
      contentDescription={config.contentDescription}
      contentSubtitle="A continuación se presentan los requisitos para el trámite PPSH"
      actionButton={{
        label: 'Requisitos PPSH',
        icon: <FileDownloadIcon />,
        onClick: handleDescargar,
      }}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing}
      error={error}
    />
  );
};
