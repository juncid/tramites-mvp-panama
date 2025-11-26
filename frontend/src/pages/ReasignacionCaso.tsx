import { useState } from 'react';
import { Box } from '@mui/material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { RevisionDocumentos } from '../components/workflow/RevisionDocumentos';
import { WorkflowCheckboxList, WorkflowTextArea, type CheckboxItem } from '../components/workflow/fields';
import { useWorkflowEtapa } from '../hooks/useWorkflowEtapa';
import { getEtapaBreadcrumbs, getViewConfig } from '../config/workflowViews';

const ETAPA_ORDEN = 8;
const config = getViewConfig(ETAPA_ORDEN)!;

// Requisitos/Casos para generar impresión
const REQUISITOS: CheckboxItem[] = [
  { id: 1, texto: 'Poder y solicitud mediante apoderado legal.' },
  { id: 2, texto: 'Dos fotos tamaño carnet, fondo blanco o a color.' },
  { id: 3, texto: 'Copia completa del pasaporte debidamente notariado.' },
  { id: 4, texto: 'Comprobante de domicilio del solicitante.', tieneMasInfo: true },
  { id: 5, texto: 'Certificado de antecedentes de su país de origen debidamente autenticado, apostillado, según sea el caso.' },
  { id: 6, texto: 'Copia del registro de mano de obra migrante solicitado ante el Ministerio de Trabajo y Desarrollo Laboral.' },
  { id: 7, texto: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.800.00 en concepto de repatriación.' },
  { id: 8, texto: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.250.00 en concepto de servicio migratorio.' },
  { id: 9, texto: 'Cheque certificado o de Gerencia del Banco Nacional de Panamá, a favor del Tesoro Nacional por un monto de cien balboas (B/.100.00), en concepto de Permiso de Trabajo.' },
];

// Documentos para revisión manual
const DOCUMENTOS = [
  { id: 1, nombre: 'Poder y solicitud mediante apoderado legal.' },
  { id: 2, nombre: 'Dos fotos tamaño carnet, fondo blanco o a color.' },
  { id: 3, nombre: 'Copia completa del pasaporte debidamente notariado.' },
  { id: 4, nombre: 'Comprobante de domicilio del solicitante.' },
  { id: 5, nombre: 'Certificado de antecedentes de su país de origen debidamente autenticado, apostillado, según sea el caso.' },
  { id: 6, nombre: 'Declaración jurada de antecedentes personales.' },
  { id: 7, nombre: 'Certificado de salud expedido por un profesional idóneo.' },
  { id: 8, nombre: 'Copia del registro de mano de obra migrante solicitado ante el Ministerio de Trabajo y Desarrollo Laboral.' },
  { id: 9, nombre: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.800.00 en concepto de repatriación.' },
  { id: 10, nombre: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.250.00 en concepto de servicio migratorio.' },
  { id: 11, nombre: 'Pago por la suma de B/.100.00 en concepto de carnet y visa múltiple por el permiso solicitado.' },
  { id: 12, nombre: 'Cheque certificado o de Gerencia del Banco Nacional de Panamá, a favor del Tesoro Nacional por un monto de cien balboas (B/.100.00), en concepto de Permiso de Trabajo.' },
];

/**
 * Vista 8: Revisión Detallada de Requisitos
 * 
 * Permite revisar casos para generar impresión y documentos requeridos
 * 
 * REFACTORIZADO: Usa useWorkflowEtapa hook y componentes reutilizables
 */
export const ReasignacionCaso = () => {
  // Estado inicial con algunos requisitos preseleccionados
  const [requisitosSeleccionados, setRequisitosSeleccionados] = useState<Set<number>>(
    new Set([1, 2, 3, 4])
  );
  const [observaciones, setObservaciones] = useState('');

  const { 
    loading, 
    saving, 
    error, 
    readonly, 
    handleCancelar, 
    handleGuardar 
  } = useWorkflowEtapa();

  const handleToggleRequisito = (id: number) => {
    const newSet = new Set(requisitosSeleccionados);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRequisitosSeleccionados(newSet);
  };

  const handleDescargarDocumento = (doc: { id: number; nombre: string }) => {
    console.log('Descargar documento:', doc.nombre);
    // TODO: Implementar descarga real de documentos
  };

  const onGuardar = () => {
    handleGuardar({
      SELECCION_CASO: Array.from(requisitosSeleccionados),
      OBSERVACIONES_REVISION: observaciones
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
          {/* Casos para generar impresión */}
          <Box sx={{ mb: 6 }}>
            <WorkflowCheckboxList
              label="Casos para generar impresión"
              items={REQUISITOS}
              selectedIds={requisitosSeleccionados}
              onToggle={handleToggleRequisito}
              disabled={readonly}
              onInfoClick={(item) => {
                console.log('Info clicked:', item);
                // TODO: Mostrar modal con más información
              }}
            />
          </Box>

          {/* Revisión manual de documentos */}
          <Box sx={{ mb: 4 }}>
            <RevisionDocumentos 
              documentos={DOCUMENTOS} 
              onDescargar={handleDescargarDocumento} 
            />
          </Box>

          {/* Observaciones */}
          <WorkflowTextArea
            label="Observaciones"
            optional
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={readonly}
            rows={6}
          />
        </Box>
      }
    />
  );
};
