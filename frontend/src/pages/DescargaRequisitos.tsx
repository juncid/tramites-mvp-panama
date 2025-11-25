import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { resolveWorkflowId } from '../config/workflowAliases';

/**
 * Vista para la Etapa 1: Descarga de Requisitos
 * 
 * Esta vista permite al usuario:
 * - Ver información sobre los requisitos del trámite PPSH
 * - Descargar documento con requisitos
 * - Avanzar automáticamente a etapas 2 y 3 al hacer clic en "Siguiente"
 * - Modo readonly para visualizar etapas completadas
 */
export const DescargaRequisitos: React.FC = () => {
  const { instanciaId, id: solicitudId } = useParams<{ instanciaId?: string; id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);

  useEffect(() => {
    loadWorkflowInstance();
  }, [instanciaId, solicitudId]);

  const loadWorkflowInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      let numericId: number;

      if (instanciaId) {
        numericId = resolveWorkflowId(instanciaId);
      } else if (solicitudId) {
        const response = await fetch(`http://localhost:8000/api/v1/ppsh/solicitudes/${solicitudId}`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la información de la solicitud');
        }
        const data = await response.json();
        numericId = data.workflow_instancia_id;
      } else {
        throw new Error('No se proporcionó instanciaId ni solicitudId');
      }

      setWorkflowInstanciaId(numericId);
      const instanciaData = await workflowService.getInstancia(numericId);
      setInstancia(instanciaData);
    } catch (err: any) {
      console.error('Error cargando instancia:', err);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = () => {
    // TODO: Implementar descarga de documento de requisitos
    console.log('Descargando requisitos PPSH...');
    alert('Funcionalidad de descarga en desarrollo');
  };

  const handleCancelar = () => {
    // Volver a la vista de etapas
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
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
      const baseParam = solicitudId || instanciaId || workflowInstanciaId;
      const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
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
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Procesos' },
        { label: 'Permiso de Protección de Seguridad Humanitaria' },
        { label: 'Carga de requisitos del trámite PPSH' },
      ]}
      contentTitle="Requisitos del trámite PPSH"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam. Dolor ornare at ac sit sagittis. Etiam elit risus volutpat sed. Orci id in mauris turpis neque. Amet diam morbi vitae nisi ultrices volutpat. Turpis vestibulum condimentum viverra mauris volutpat. Adipiscing ultrices curabitur vehicula ultrices adipiscing dictum nunc facilisi mi. Etiam congue nisl at consequat lobortis vitae nunc."
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
