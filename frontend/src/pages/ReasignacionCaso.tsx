import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Checkbox, FormControlLabel, TextField, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { RevisionDocumentos } from '../components/workflow/RevisionDocumentos';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

interface Requisito {
  id: number;
  texto: string;
  tieneMasInfo?: boolean;
}

interface Documento {
  id: number;
  nombre: string;
}

/**
 * Vista 8: Revisión Detallada de Requisitos
 * 
 * Permite revisar casos para generar impresión y documentos requeridos
 */
export const ReasignacionCaso = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [requisitosSeleccionados, setRequisitosSeleccionados] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [observaciones, setObservaciones] = useState<string>('');

  // Requisitos/Casos para generar impresión
  const [requisitos] = useState<Requisito[]>([
    { id: 1, texto: 'Poder y solicitud mediante apoderado legal.' },
    { id: 2, texto: 'Dos fotos tamaño carnet, fondo blanco o a color.' },
    { id: 3, texto: 'Copia completa del pasaporte debidamente notariado.' },
    { id: 4, texto: 'Comprobante de domicilio del solicitante.', tieneMasInfo: true },
    { id: 5, texto: 'Certificado de antecedentes de su país de origen debidamente autenticado, apostillado, según sea el caso.' },
    { id: 6, texto: 'Copia del registro de mano de obra migrante solicitado ante el Ministerio de Trabajo y Desarrollo Laboral.' },
    { id: 7, texto: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.800.00 en concepto de repatriación.' },
    { id: 8, texto: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.250.00 en concepto de servicio migratorio.' },
    { id: 9, texto: 'Cheque certificado o de Gerencia del Banco Nacional de Panamá, a favor del Tesoro Nacional por un monto de cien balboas (B/.100.00), en concepto de Permiso de Trabajo.' },
  ]);

  // Documentos para revisión manual
  const [documentos] = useState<Documento[]>([
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
  ]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let wInstanciaId: number | null = null;

        if (instanciaId) {
          wInstanciaId = parseInt(instanciaId);
        } else if (solicitudId) {
          const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
          if (!solicitud.workflow_instancia_id) {
            throw new Error('La solicitud no tiene workflow asociado');
          }
          wInstanciaId = solicitud.workflow_instancia_id;
        }

        setWorkflowInstanciaId(wInstanciaId);

        if (wInstanciaId) {
          const instancia = await workflowService.getInstancia(wInstanciaId);
          if (instancia.etapa_actual_id) {
            setEtapaId(instancia.etapa_actual_id);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [instanciaId, solicitudId]);

  const handleToggleRequisito = (requisitoId: number) => {
    const newSeleccionados = new Set(requisitosSeleccionados);
    if (newSeleccionados.has(requisitoId)) {
      newSeleccionados.delete(requisitoId);
    } else {
      newSeleccionados.add(requisitoId);
    }
    setRequisitosSeleccionados(newSeleccionados);
  };

  const handleCancelar = () => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
  };

  const handleGuardar = async () => {
    if (!workflowInstanciaId || !etapaId) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      const respuestas = {
        SELECCION_CASO: Array.from(requisitosSeleccionados),
        OBSERVACIONES_REVISION: observaciones
      };

      await workflowService.completarEtapa(
        workflowInstanciaId,
        etapaId,
        respuestas,
        userPerfil
      );

      const baseRoute = instanciaId ? `/workflows/${instanciaId}` : `/solicitudes/${solicitudId}`;
      navigate(`${baseRoute}/etapas`);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert(error.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const customContent = (
    <Box>
      {/* Casos para generar impresión */}
      <Box sx={{ mb: 6 }}>
        <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 2, color: '#333' }}>
          Casos para generar impresión
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {requisitos.map((requisito) => (
            <Box key={requisito.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={requisitosSeleccionados.has(requisito.id)}
                    onChange={() => !readonly && handleToggleRequisito(requisito.id)}
                    disabled={readonly}
                    sx={{
                      color: '#0e5fa6',
                      '&.Mui-checked': {
                        color: '#0e5fa6',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '16px', color: '#4d4d4d', lineHeight: 1.5 }}>
                    {requisito.texto}
                  </Typography>
                }
                sx={{ m: 0, alignItems: 'flex-start' }}
              />
              {requisito.tieneMasInfo && (
                <IconButton size="small" sx={{ mt: -0.5, ml: 1 }}>
                  <InfoIcon sx={{ fontSize: '16px', color: '#757575' }} />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Revisión manual de documentos */}
      <Box sx={{ mb: 4 }}>
        <RevisionDocumentos 
          documentos={documentos} 
          onDescargar={(doc) => {
            console.log('Descargar documento:', doc.nombre);
            // TODO: Implementar descarga real de documentos
          }} 
        />
      </Box>

      {/* Observaciones */}
      <Box>
        <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 0.5, color: '#333' }}>
          Observaciones{' '}
          <Typography component="span" sx={{ fontSize: '14px', fontWeight: 300, color: '#333' }}>
            (Opcional)
          </Typography>
        </Typography>
        <TextField
          multiline
          rows={6}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={readonly}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              '& fieldset': {
                borderColor: '#333333',
              },
              '&:hover fieldset': {
                borderColor: '#333333',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0e5fa6',
              },
            },
          }}
        />
      </Box>
    </Box>
  );

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Revisión' },
      ]}
      contentTitle="Revisa detalladamente los requisitos"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam."
      customContent={customContent}
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleGuardar}
      cancelButtonText="Cancelar"
      nextButtonText="Guardar"
      loading={loading}
      error={error}
    />
  );
};
