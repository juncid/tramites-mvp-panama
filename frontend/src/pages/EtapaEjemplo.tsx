import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Info as InfoIcon } from '@mui/icons-material';
import { workflowService } from '../services/workflow.service';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';

/**
 * EJEMPLO: Componente de etapa customizable
 * 
 * Muestra cómo usar el componente genérico EtapaInformativa
 * con contenido diferente y personalizado.
 * 
 * Para crear una nueva etapa:
 * 1. Copia este archivo
 * 2. Cambia los props de EtapaInformativa con tu contenido
 * 3. Modifica la lógica de handleSiguiente según tu necesidad
 * 4. Agrega la ruta en AppRouter.tsx
 */
export const EtapaEjemplo: React.FC = () => {
  const { instanciaId } = useParams<{ instanciaId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instancia, setInstancia] = useState<any>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadInstancia();
  }, [instanciaId]);

  const loadInstancia = async () => {
    if (!instanciaId) return;

    setLoading(true);
    setError(null);

    try {
      const instanciaData = await workflowService.getInstancia(parseInt(instanciaId));
      setInstancia(instanciaData);
    } catch (err: any) {
      console.error('Error cargando instancia:', err);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleAccionPrincipal = () => {
    // Acción personalizada (descargar, abrir modal, etc.)
    console.log('Acción principal ejecutada');
    alert('Esta es una acción personalizada');
  };

  const handleCancelar = () => {
    navigate(`/workflows/${instanciaId}/etapas`);
  };

  const handleSiguiente = async () => {
    if (!instanciaId || !instancia) return;

    setCompleting(true);
    setError(null);

    try {
      // Completa la etapa actual con las respuestas necesarias
      await workflowService.completarEtapa(
        parseInt(instanciaId),
        instancia.etapa_actual_id,
        { 
          // Aquí van las respuestas requeridas por tu etapa
          RESPUESTA_EJEMPLO: 'Valor de ejemplo'
        },
        'CIUDADANO'
      );

      // Volver a la vista de etapas
      navigate(`/workflows/${instanciaId}/etapas`);
      
    } catch (err: any) {
      console.error('Error completando etapa:', err);
      setError(err.response?.data?.detail || 'Error al completar la etapa');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <EtapaInformativa
      // Header personalizado
      headerTitle="Título del Proceso Personalizado"
      
      // Breadcrumbs personalizados
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Mis Procesos' },
        { label: 'Nombre del Proceso' },
        { label: 'Nombre de la Etapa Actual' },
      ]}
      
      // Contenido personalizado
      contentTitle="Título de la Etapa"
      contentDescription="Aquí va la descripción completa de lo que el usuario debe hacer en esta etapa. Puedes incluir múltiples párrafos y toda la información necesaria para guiar al usuario."
      contentSubtitle="Instrucciones adicionales o subtítulo (opcional)"
      
      // Botón de acción opcional
      actionButton={{
        label: 'Ver información',
        icon: <InfoIcon />,
        onClick: handleAccionPrincipal,
      }}
      
      // Estados y callbacks
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleSiguiente}
      loading={loading}
      completing={completing}
      error={error}
    />
  );
};
